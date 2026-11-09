// Phase 3: admin routes. Audit IDs: M1-9 (identity decision + audit log), role checks,
// CNIC reveal (D-007), hash-chained append-only audit log.
import { describe, test, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';

import { createApp } from '../../app.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { verifyAuditChain } from '../../services/audit.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';

let app;
let adminCookie;
let adminId;
let customer;
let worker;
let profileId;
let noCnicProfileId;

const CNIC_TEXT = '37405-7654321-9';
const CNIC_DIGITS = '3740576543219';

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  const email = uniqueEmail('admin');
  const made = await createAdminAccount({ name: 'Test Admin', email, phone: '03009998888', password: GOOD_PASSWORD });
  adminId = made.id;
  adminCookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
  customer = await registerUser(app, { role: 'customer' });
  worker = await registerUser(app);
  const saved = await api(app, worker.cookie).put('/api/workers/me').send({
    occupation: 'Mason', category: 'construction_masonry', experienceYears: 4, dailyRate: 2500, city: 'Rawalpindi', cnicNumber: CNIC_TEXT,
  });
  profileId = saved.body.profile._id;
  const noCnic = await registerUser(app);
  noCnicProfileId = (await api(app, noCnic.cookie).put('/api/workers/me').send({ occupation: 'Painter' })).body.profile._id;
});
afterAll(stopTestDb);
afterEach(() => vi.restoreAllMocks());

const ADMIN_ROUTES = () => [
  ['get', '/api/admin/workers'],
  ['patch', `/api/admin/workers/${profileId}/identity`],
  ['get', `/api/admin/workers/${profileId}/cnic`],
  ['get', '/api/admin/users'],
];

describe('role checks on every admin route', () => {
  test('worker and customer -> 403; not logged in -> 401', async () => {
    for (const [method, url] of ADMIN_ROUTES()) {
      for (const cookie of [worker.cookie, customer.cookie]) {
        const res = await api(app, cookie)[method](url).send({ status: 'Verified', note: 'trying to verify' });
        expect(res.status, `${method} ${url}`).toBe(403);
      }
      expect((await api(app)[method](url)).status, `${method} ${url} without login`).toBe(401);
    }
  });

  test('a worker cannot reveal a CNIC, and no reveal is audited', async () => {
    const before = await AuditLog.countDocuments({ action: 'cnic.reveal' });
    expect((await api(app, worker.cookie).get(`/api/admin/workers/${profileId}/cnic`)).status).toBe(403);
    expect(await AuditLog.countDocuments({ action: 'cnic.reveal' })).toBe(before);
  });
});

describe('GET /api/admin/workers and /api/admin/users', () => {
  test('admin sees contact details and "CNIC on file", but never CNIC data', async () => {
    const res = await api(app, adminCookie).get('/api/admin/workers');
    expect(res.status).toBe(200);
    const w = res.body.workers.find((x) => x._id === profileId);
    expect(w.cnicOnFile).toBe(true);
    expect(w.user.email).toBe(worker.user.email);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain(CNIC_DIGITS);
    expect(text).not.toContain('cnicEncrypted');
    expect(text).not.toContain('cnicHash');
  });

  test('users list has no password or token data', async () => {
    const res = await api(app, adminCookie).get('/api/admin/users');
    expect(res.status).toBe(200);
    for (const u of res.body) {
      expect(u.password).toBeUndefined();
      expect(u.tokenVersion).toBeUndefined();
      expect(u.failedLoginCount).toBeUndefined();
    }
  });

  test('status filter is validated', async () => {
    expect((await api(app, adminCookie).get('/api/admin/workers?status=Hacked')).status).toBe(400);
    const pending = await api(app, adminCookie).get('/api/admin/workers?status=Pending');
    expect(pending.body.workers.every((w) => w.verificationStatus === 'Pending')).toBe(true);
  });
});

describe('PATCH /api/admin/workers/:id/identity (M1-9)', () => {
  const url = () => `/api/admin/workers/${profileId}/identity`;

  test.each([
    ['no body', undefined, /body is required/i],
    ['no status (no silent default to Verified)', { note: 'Checked CNIC on video call' }, /Status must be Verified or Rejected/],
    ['no note', { status: 'Verified' }, /note/i],
    ['a too-short note', { status: 'Verified', note: 'ok' }, /at least 5/],
    ['an invalid status', { status: 'SuperVerified', note: 'Checked CNIC on video call' }, /Status must be/],
  ])('%s -> 400', async (_label, body, message) => {
    const req = api(app, adminCookie).patch(url());
    const res = body === undefined ? await req : await req.send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
  });

  test('bad id -> 400; unknown id -> 404', async () => {
    const body = { status: 'Verified', note: 'Checked CNIC on video call' };
    expect((await api(app, adminCookie).patch('/api/admin/workers/123/identity').send(body)).status).toBe(400);
    expect((await api(app, adminCookie).patch('/api/admin/workers/65f000000000000000000000/identity').send(body)).status).toBe(404);
  });

  test('Verified is refused when the worker has no CNIC on file', async () => {
    const res = await api(app, adminCookie)
      .patch(`/api/admin/workers/${noCnicProfileId}/identity`)
      .send({ status: 'Verified', note: 'Checked CNIC on video call' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not saved a CNIC/);
  });

  test('a decision saves status, note, reviewer and time, and writes an audit log entry', async () => {
    const note = 'Checked original CNIC card on a video call';
    const res = await api(app, adminCookie).patch(url()).send({ status: 'Verified', note });
    expect(res.status).toBe(200);
    expect(res.body.profile).toMatchObject({ verificationStatus: 'Verified', identityNote: note, identityReviewedBy: adminId });
    expect(res.body.profile.identityReviewedAt).toBeTruthy();

    const entry = await AuditLog.findOne({ action: 'identity.decision', targetId: profileId }).sort({ seq: -1 }).lean();
    expect(entry).toMatchObject({ fromState: 'Pending', toState: 'Verified', reason: note, actorRole: 'admin' });
    expect(String(entry.actor)).toBe(adminId);

    const dir = await api(app, customer.cookie).get('/api/workers?identity=verified');
    expect(dir.body.workers.map((w) => w._id)).toContain(profileId);
  });

  test('a decision based on an old status (another admin changed it) -> 409, nothing written', async () => {
    const realFindById = WorkerProfile.findById.bind(WorkerProfile);
    vi.spyOn(WorkerProfile, 'findById').mockImplementationOnce(() => ({
      select: () => ({ lean: async () => ({ verificationStatus: 'Unverified', cnicOnFile: true }) }),
    }));
    const before = await AuditLog.countDocuments();
    const res = await api(app, adminCookie).patch(url()).send({ status: 'Rejected', note: 'Old screen tried this' });
    expect(res.status).toBe(409);
    expect(await AuditLog.countDocuments()).toBe(before);
    expect((await realFindById(profileId).lean()).verificationStatus).toBe('Verified');
  });
});

describe('GET /api/admin/workers/:id/cnic (CNIC Option 2 reveal)', () => {
  test('admin gets the full CNIC, not cached; an audit entry without the number is written', async () => {
    const before = await AuditLog.countDocuments({ action: 'cnic.reveal' });
    const res = await api(app, adminCookie).get(`/api/admin/workers/${profileId}/cnic`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ cnic: CNIC_TEXT });
    expect(res.headers['cache-control']).toBe('no-store');

    const entries = await AuditLog.find({ action: 'cnic.reveal' }).lean();
    expect(entries.length).toBe(before + 1);
    const all = JSON.stringify(await AuditLog.find().lean());
    expect(all).not.toContain(CNIC_DIGITS);
    expect(all).not.toContain(CNIC_TEXT);
  });

  test('no CNIC on file -> 404', async () => {
    expect((await api(app, adminCookie).get(`/api/admin/workers/${noCnicProfileId}/cnic`)).status).toBe(404);
  });
});

describe('audit log: append-only and hash-chained', () => {
  test('the chain verifies after all the actions above', async () => {
    const result = await verifyAuditChain();
    expect(result.ok).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(4);
  });

  test('updating or deleting through the app is refused', async () => {
    await expect(AuditLog.updateOne({ seq: 1 }, { $set: { reason: 'changed' } })).rejects.toThrow(/append-only/);
    await expect(AuditLog.deleteOne({ seq: 1 })).rejects.toThrow(/append-only/);
  });

  test('editing an entry directly in the database is detected by verifyAuditChain (audit:verify)', async () => {
    const target = await AuditLog.findOne({ action: 'identity.decision' }).lean();
    await AuditLog.collection.updateOne({ _id: target._id }, { $set: { toState: 'Rejected' } });
    const result = await verifyAuditChain();
    expect(result.ok).toBe(false);
    expect(result.badSeq).toBe(target.seq);
    expect(result.problem).toMatch(/changed/);
    await AuditLog.collection.updateOne({ _id: target._id }, { $set: { toState: target.toState } }); // restore
    expect((await verifyAuditChain()).ok).toBe(true);
  });

  test('deleting an entry in the middle is detected', async () => {
    const all = await AuditLog.find().sort({ seq: 1 }).lean();
    const middle = all[1];
    await AuditLog.collection.deleteOne({ _id: middle._id });
    const result = await verifyAuditChain();
    expect(result.ok).toBe(false);
    expect(result.badSeq).toBe(middle.seq + 1);
    await AuditLog.collection.insertOne(middle); // restore
  });

  test('20 audit writes at the same moment still form one valid chain', async () => {
    const { writeAudit } = await import('../../services/audit.js');
    await Promise.all(Array.from({ length: 20 }, (_, i) => writeAudit({ action: 'test.concurrent', details: { i } })));
    expect((await verifyAuditChain()).ok).toBe(true);
  });
});
