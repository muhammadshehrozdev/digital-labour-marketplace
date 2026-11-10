// Batch 4 feature pack (server side): account suspension and user management, notifications,
// saved workers, compare, directory sort, potential skills, profile strength, session end time.
// Synthetic people only. In-memory MongoDB.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

import { createApp } from '../../app.js';
import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import Notification from '../../models/Notification.js';
import SavedWorker from '../../models/SavedWorker.js';
import AuditLog from '../../models/AuditLog.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { verifyAuditChain } from '../../services/audit.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';
import { jpeg } from '../helpers/images.js';

let app;
let admin; // { cookie, id, email }
let secondAdmin;
let seed = 4000;

const CNIC = '37405-1122334-5';

async function makeAdmin(name) {
  const email = uniqueEmail('admin');
  const made = await createAdminAccount({ name, email, phone: '03009998888', password: GOOD_PASSWORD });
  const cookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
  return { cookie, id: String(made.id), email };
}

// A worker listed in the directory, with skills.
async function makeWorker({ name = 'Listed Worker (synthetic)', skillIds = ['elec_wiring'], experienceYears = 5, category = 'electrical_solar', occupation = 'Electrician', cnic } = {}) {
  const w = await registerUser(app, { name });
  const body = { city: 'Rawalpindi', occupation, category, experienceYears, dailyRate: 3000 };
  if (cnic) body.cnicNumber = cnic;
  const saved = await api(app, w.cookie).put('/api/workers/me').send(body);
  if (skillIds.length) await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds, addedVia: 'manual' });
  return { ...w, profileId: saved.body.profile._id, workerIdCode: saved.body.profile.workerIdCode };
}

async function uploadProof(cookie, skillId = 'elec_wiring') {
  seed += 1;
  const res = await api(app, cookie).post('/api/evidence').field('skillId', skillId).field('type', 'work_photo').field('consent', 'true')
    .attach('image', await jpeg(seed), { filename: 'photo.jpg', contentType: 'image/jpeg' });
  if (res.status !== 201) throw new Error(`upload failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.evidence._id;
}

const login = (email, password = GOOD_PASSWORD) => api(app).post('/api/auth/login').send({ email, password });
const setStatus = (id, body, cookie = admin.cookie) => api(app, cookie).patch(`/api/admin/users/${id}/status`).send(body);

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  admin = await makeAdmin('Batch Four Admin (synthetic)');
  secondAdmin = await makeAdmin('Second Admin (synthetic)');
});
afterAll(stopTestDb);

describe('session end time (feature 48)', () => {
  test('register, login, me and session all say when the login ends: about 8 hours from now', async () => {
    const before = Date.now();
    const made = await registerUser(app, { role: 'customer' });
    const eightHours = 8 * 60 * 60 * 1000;
    const near = (iso) => Math.abs(new Date(iso).getTime() - (before + eightHours)) < 60 * 1000;
    expect(near(made.user.sessionExpiresAt)).toBe(true);
    const again = await login(made.user.email);
    expect(near(again.body.sessionExpiresAt)).toBe(true);
    expect(near((await api(app, made.cookie).get('/api/auth/me')).body.sessionExpiresAt)).toBe(true);
    expect(near((await api(app, made.cookie).get('/api/auth/session')).body.user.sessionExpiresAt)).toBe(true);
  });
});

describe('admin user management (feature 26)', () => {
  let worker;
  let customer;

  beforeAll(async () => {
    worker = await makeWorker({ name: 'Suspend Me Worker (synthetic)' });
    customer = await registerUser(app, { role: 'customer', name: 'Calm Customer (synthetic)' });
  });

  test('only an admin can list, open or change users', async () => {
    for (const cookie of [worker.cookie, customer.cookie]) {
      expect((await api(app, cookie).get('/api/admin/users')).status).toBe(403);
      expect((await api(app, cookie).get(`/api/admin/users/${worker.user._id}`)).status).toBe(403);
      expect((await setStatus(worker.user._id, { status: 'suspended', reason: 'not allowed to do this' }, cookie)).status).toBe(403);
    }
    expect((await api(app).get('/api/admin/users')).status).toBe(401);
  });

  test('the list is paginated, searchable, and never contains a password or CNIC', async () => {
    const res = await api(app, admin.cookie).get('/api/admin/users?q=Suspend%20Me&role=worker');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, limit: 25, total: 1 });
    expect(Object.keys(res.body.users[0]).sort()).toEqual(['_id', 'createdAt', 'email', 'lockedNow', 'name', 'phone', 'role', 'status', 'suspendedAt', 'suspensionReason']);
    expect(res.body.users[0]).toMatchObject({ name: 'Suspend Me Worker (synthetic)', role: 'worker', status: 'active', lockedNow: false });
    expect(JSON.stringify(res.body)).not.toMatch(/password|\$2[aby]\$|tokenVersion/);
    const byEmail = await api(app, admin.cookie).get(`/api/admin/users?q=${encodeURIComponent(customer.user.email)}`);
    expect(byEmail.body.users.map((u) => u._id)).toEqual([customer.user._id]);
  });

  test('search text is matched literally (regex characters are escaped) and bad queries get 400', async () => {
    expect((await api(app, admin.cookie).get('/api/admin/users?q=.*')).body.total).toBe(0);
    expect((await api(app, admin.cookie).get('/api/admin/users?role=boss')).body.code).toBe('ROLE_FILTER_INVALID');
    expect((await api(app, admin.cookie).get('/api/admin/users?status=banned')).body.code).toBe('USER_STATUS_INVALID');
    expect((await api(app, admin.cookie).get('/api/admin/users?q[$ne]=x')).status).toBe(400);
    expect((await api(app, admin.cookie).get('/api/admin/users?extra=1')).body.code).toBe('UNKNOWN_FIELD');
  });

  test('one user: account, a worker summary with evidence counts, recent audit entries; no CNIC, no address', async () => {
    const withCnic = await makeWorker({ name: 'Detail Worker (synthetic)', cnic: CNIC });
    await uploadProof(withCnic.cookie);
    const res = await api(app, admin.cookie).get(`/api/admin/users/${withCnic.user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: 'Detail Worker (synthetic)', role: 'worker', status: 'active' });
    expect(res.body.worker).toMatchObject({ workerIdCode: withCnic.workerIdCode, occupation: 'Electrician', verificationStatus: 'Pending', cnicOnFile: true, skills: 1 });
    expect(res.body.worker.evidence).toEqual({ pending: 1, approved: 0, rejected: 0, suspected_fake: 0, revoked: 0 });
    expect(res.body.activity.map((a) => a.action)).toContain('cnic.updated');
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('3740511223345');
    expect(text).not.toContain(CNIC);
    expect(text).not.toMatch(/cnicEncrypted|cnicHash|address|password/);
    expect((await api(app, admin.cookie).get('/api/admin/users/000000000000000000000000')).body.code).toBe('USER_NOT_FOUND');
    expect((await api(app, admin.cookie).get('/api/admin/users/not-an-id')).body.code).toBe('ID_INVALID');
  });

  test('a customer detail shows how many workers they saved', async () => {
    const res = await api(app, admin.cookie).get(`/api/admin/users/${customer.user._id}`);
    expect(res.body.customer).toEqual({ savedWorkers: 0 });
    expect(res.body.worker).toBeNull();
  });

  test('suspending needs a reason of at least 5 characters, without a CNIC number in it', async () => {
    const cases = [
      [{ status: 'suspended' }, 'REASON_REQUIRED'],
      [{ status: 'suspended', reason: 'no' }, 'REASON_TOO_SHORT'],
      [{ status: 'suspended', reason: `CNIC ${CNIC} is fake` }, 'NOTE_HAS_CNIC'],
      [{ status: 'suspended', reason: 'cnic 3740511223345 is fake' }, 'NOTE_HAS_CNIC'],
      [{ status: 'banned', reason: 'a good long reason' }, 'USER_STATUS_INVALID'],
      [{ status: 'suspended', reason: 'a good long reason', role: 'admin' }, 'UNKNOWN_FIELD'],
    ];
    for (const [body, code] of cases) {
      const res = await setStatus(worker.user._id, body);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(res.body.errors.map((e) => e.code)).toContain(code);
    }
    expect((await User.findById(worker.user._id).lean()).status).toBe('active');
  });

  test('an admin cannot suspend themselves or another admin', async () => {
    expect((await setStatus(admin.id, { status: 'suspended', reason: 'testing myself' })).body.code).toBe('CANNOT_SUSPEND_SELF');
    const other = await setStatus(secondAdmin.id, { status: 'suspended', reason: 'testing another admin' });
    expect(other.status).toBe(403);
    expect(other.body.code).toBe('CANNOT_SUSPEND_ADMIN');
    expect((await api(app, secondAdmin.cookie).get('/api/auth/me')).status).toBe(200); // still logged in
  });

  test('suspend: sessions end at once, login is refused only after the right password, and it is audited', async () => {
    expect((await api(app, worker.cookie).get('/api/workers/me')).status).toBe(200);
    const res = await setStatus(worker.user._id, { status: 'suspended', reason: 'Copied proof was uploaded twice' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ status: 'suspended', suspensionReason: 'Copied proof was uploaded twice' });
    expect(res.body.user.suspendedAt).toBeTruthy();

    // the old cookie no longer works anywhere
    expect((await api(app, worker.cookie).get('/api/workers/me')).status).toBe(401);
    expect((await api(app, worker.cookie).get('/api/auth/session')).body).toEqual({ user: null });

    // right password -> a clear message, no cookie; wrong password -> the usual answer (no hint)
    const right = await login(worker.user.email);
    expect(right.status).toBe(403);
    expect(right.body.code).toBe('ACCOUNT_SUSPENDED');
    expect(sessionCookie(right)).toBeNull();
    const wrong = await login(worker.user.email, 'definitely the wrong password');
    expect(wrong.status).toBe(401);
    expect(wrong.body.code).toBe('LOGIN_FAILED');

    const entry = await AuditLog.findOne({ action: 'user.suspended', targetId: String(worker.user._id) }).lean();
    expect(entry).toMatchObject({ targetType: 'User', fromState: 'active', toState: 'suspended', reason: 'Copied proof was uploaded twice', actorRole: 'admin' });
    expect(String(entry.actor)).toBe(admin.id);
  });

  test('a suspended worker disappears from the directory, the public profile, compare and saved lists', async () => {
    const other = await makeWorker({ name: 'Still Here Worker (synthetic)' });
    const list = await api(app, customer.cookie).get('/api/workers?limit=50');
    const codes = list.body.workers.map((w) => w.workerIdCode);
    expect(codes).toContain(other.workerIdCode);
    expect(codes).not.toContain(worker.workerIdCode);
    expect((await api(app, customer.cookie).get(`/api/workers/${worker.workerIdCode}`)).body.code).toBe('WORKER_NOT_FOUND');
    const compare = await api(app, customer.cookie).get(`/api/workers/compare?ids=${worker.workerIdCode},${other.workerIdCode}`);
    expect(compare.body.workers.map((w) => w.workerIdCode)).toEqual([other.workerIdCode]);
    expect(compare.body.missing).toEqual([worker.workerIdCode]);
    expect((await api(app, customer.cookie).put(`/api/saved/${worker.workerIdCode}`)).body.code).toBe('WORKER_NOT_FOUND');
  });

  test('doing it twice gives 409; reactivating needs a reason, is audited, and the user can log in again', async () => {
    expect((await setStatus(worker.user._id, { status: 'suspended', reason: 'second time by mistake' })).body.code).toBe('USER_STATUS_CHANGED');
    const res = await setStatus(worker.user._id, { status: 'active', reason: 'Checked with the worker, resolved' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ status: 'active', suspendedAt: null, suspensionReason: '' });
    const back = await login(worker.user.email);
    expect(back.status).toBe(200);
    expect((await api(app, sessionCookie(back)).get('/api/workers/me')).status).toBe(200);
    expect(await AuditLog.countDocuments({ action: 'user.reactivated', targetId: String(worker.user._id) })).toBe(1);
    expect((await api(app, admin.cookie).get('/api/admin/users?status=suspended')).body.users.map((u) => u._id)).not.toContain(worker.user._id);
    expect((await verifyAuditChain()).ok).toBe(true);
  });

  test('the old plain list is gone: GET /api/admin/users always answers with pages', async () => {
    const res = await api(app, admin.cookie).get('/api/admin/users?limit=2&page=2');
    expect(res.body.users).toHaveLength(2);
    expect(res.body.page).toBe(2);
    expect(res.body.total).toBeGreaterThanOrEqual(5);
  });
});

describe('notifications (feature 19)', () => {
  let worker;
  let other;
  let evidenceId;

  beforeAll(async () => {
    worker = await makeWorker({ name: 'Notify Worker (synthetic)', cnic: '37405-2233445-6', skillIds: ['elec_wiring', 'elec_solar'] });
    other = await makeWorker({ name: 'Other Worker (synthetic)' });
    evidenceId = await uploadProof(worker.cookie);
  });

  test('a new account has none; the bell count is 0', async () => {
    expect((await api(app, worker.cookie).get('/api/notifications')).body).toMatchObject({ notifications: [], unread: 0, total: 0 });
    expect((await api(app, worker.cookie).get('/api/notifications/unread-count')).body).toEqual({ unread: 0 });
    expect((await api(app).get('/api/notifications')).status).toBe(401);
  });

  test('an identity decision creates one for the worker (rejected carries the note the worker sees)', async () => {
    const rejected = await api(app, admin.cookie).patch(`/api/admin/workers/${worker.profileId}/identity`).send({ status: 'Rejected', note: 'Name on the card does not match' });
    expect(rejected.status).toBe(200);
    let list = (await api(app, worker.cookie).get('/api/notifications')).body;
    expect(list.unread).toBe(1);
    expect(list.notifications[0]).toMatchObject({ type: 'identity_rejected', params: { note: 'Name on the card does not match' }, read: false });

    await api(app, worker.cookie).put('/api/workers/me').send({ cnicNumber: '37405-2233445-7' }); // asks again
    await api(app, admin.cookie).patch(`/api/admin/workers/${worker.profileId}/identity`).send({ status: 'Verified', note: 'Original card seen in person' });
    list = (await api(app, worker.cookie).get('/api/notifications')).body;
    expect(list.notifications.map((n) => n.type)).toEqual(['identity_verified', 'identity_rejected']); // newest first
    expect(list.notifications[0].params).toEqual({}); // the admin's private note for "verified" is not sent
    expect(JSON.stringify(list)).not.toMatch(/37405|2233445/);
  });

  test.each([
    ['approve', {}, 'evidence_approved'],
    ['revoke', { note: 'Belongs to another person' }, 'evidence_revoked'],
  ])('evidence %s -> %s with the skill name', async (action, extra, type) => {
    const res = await api(app, admin.cookie).patch(`/api/admin/evidence/${evidenceId}`).send({ action, ...extra });
    expect(res.status).toBe(200);
    const latest = (await api(app, worker.cookie).get('/api/notifications?limit=1')).body.notifications[0];
    expect(latest).toMatchObject({ type, params: { skillId: 'elec_wiring', skillName: 'House wiring', evidenceId } });
  });

  test('reject and suspected fake notify too, with the reason', async () => {
    const second = await uploadProof(worker.cookie, 'elec_solar');
    await api(app, admin.cookie).patch(`/api/admin/evidence/${second}`).send({ action: 'reject', reasonCode: 'unclear' });
    let latest = (await api(app, worker.cookie).get('/api/notifications?limit=1')).body.notifications[0];
    expect(latest).toMatchObject({ type: 'evidence_rejected', params: { skillId: 'elec_solar', reasonCode: 'unclear', note: 'Photo is unclear' } });
    const third = await uploadProof(worker.cookie, 'elec_solar');
    await api(app, admin.cookie).patch(`/api/admin/evidence/${third}`).send({ action: 'suspected_fake', note: 'Edited certificate' });
    latest = (await api(app, worker.cookie).get('/api/notifications?limit=1')).body.notifications[0];
    expect(latest).toMatchObject({ type: 'evidence_suspected_fake', params: { note: 'Edited certificate' } });
  });

  test('a decision note with a CNIC number is refused before anything is saved', async () => {
    const fourth = await uploadProof(worker.cookie, 'elec_solar');
    const res = await api(app, admin.cookie).patch(`/api/admin/evidence/${fourth}`).send({ action: 'suspected_fake', note: 'Same as CNIC 37405-2233445-7' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('NOTE_HAS_CNIC');
    const identity = await api(app, admin.cookie).patch(`/api/admin/workers/${other.profileId}/identity`).send({ status: 'Rejected', note: 'cnic 3740522334457 belongs to someone else' });
    expect(identity.body.code).toBe('NOTE_HAS_CNIC');
    expect(await AuditLog.countDocuments({ reason: /37405/ })).toBe(0);
  });

  test('only my own notifications: another worker sees none of mine and cannot mark them', async () => {
    const mine = (await api(app, worker.cookie).get('/api/notifications')).body.notifications;
    expect(mine.length).toBeGreaterThanOrEqual(6);
    expect((await api(app, other.cookie).get('/api/notifications')).body.total).toBe(0);
    const res = await api(app, other.cookie).patch(`/api/notifications/${mine[0]._id}/read`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOTIFICATION_NOT_FOUND');
    expect((await Notification.findById(mine[0]._id).lean()).readAt).toBeNull();
  });

  test('mark one as read, then all; the count follows', async () => {
    const before = (await api(app, worker.cookie).get('/api/notifications')).body;
    const one = await api(app, worker.cookie).patch(`/api/notifications/${before.notifications[0]._id}/read`);
    expect(one.body.notification.read).toBe(true);
    expect(one.body.unread).toBe(before.unread - 1);
    const all = await api(app, worker.cookie).post('/api/notifications/read-all');
    expect(all.body).toEqual({ updated: before.unread - 1, unread: 0 });
    expect((await api(app, worker.cookie).get('/api/notifications/unread-count')).body).toEqual({ unread: 0 });
  });

  test('bad input: page text, unknown key, bad id', async () => {
    expect((await api(app, worker.cookie).get('/api/notifications?page=abc')).status).toBe(400);
    expect((await api(app, worker.cookie).get('/api/notifications?user=someone')).body.code).toBe('UNKNOWN_FIELD');
    expect((await api(app, worker.cookie).patch('/api/notifications/xyz/read')).body.code).toBe('ID_INVALID');
  });
});

describe('saved workers and compare (features 23, 24)', () => {
  let customer;
  let a;
  let b;
  let c;

  beforeAll(async () => {
    customer = await registerUser(app, { role: 'customer', name: 'Saving Customer (synthetic)' });
    a = await makeWorker({ name: 'Worker A (synthetic)', cnic: '37405-3344556-1' });
    b = await makeWorker({ name: 'Worker B (synthetic)', occupation: 'Plumber', category: 'plumbing_sanitary', skillIds: ['plumb_geyser'] });
    c = await makeWorker({ name: 'Worker C (synthetic)' });
  });

  test('only customers have a saved list', async () => {
    expect((await api(app, a.cookie).get('/api/saved')).status).toBe(403);
    expect((await api(app, admin.cookie).put(`/api/saved/${a.workerIdCode}`)).status).toBe(403);
    expect((await api(app).get('/api/saved')).status).toBe(401);
  });

  test('save is idempotent (201 then 200), the list shows public fields only, newest first', async () => {
    expect((await api(app, customer.cookie).put(`/api/saved/${a.workerIdCode}`)).status).toBe(201);
    expect((await api(app, customer.cookie).put(`/api/saved/${a.workerIdCode}`)).status).toBe(200);
    expect((await api(app, customer.cookie).put(`/api/saved/${b.workerIdCode}`)).status).toBe(201);
    expect(await SavedWorker.countDocuments({ customer: customer.user._id })).toBe(2);
    const list = await api(app, customer.cookie).get('/api/saved');
    expect(list.body.workers.map((w) => w.workerIdCode)).toEqual([b.workerIdCode, a.workerIdCode]);
    expect(list.body.total).toBe(2);
    const text = JSON.stringify(list.body);
    expect(text).not.toMatch(/phone|email|whatsapp|address|emergencyContact|cnic|03001234567/i);
    expect(list.body.workers[0].user).toEqual({ name: 'Worker B (synthetic)' });
    expect((await api(app, customer.cookie).get('/api/saved/ids')).body.ids.sort()).toEqual([a.workerIdCode, b.workerIdCode].sort());
  });

  test('another customer has their own, empty list', async () => {
    const second = await registerUser(app, { role: 'customer' });
    expect((await api(app, second.cookie).get('/api/saved')).body.workers).toEqual([]);
  });

  test('unknown or malformed worker ids', async () => {
    expect((await api(app, customer.cookie).put('/api/saved/DLM-2026-999999')).body.code).toBe('WORKER_NOT_FOUND');
    expect((await api(app, customer.cookie).put('/api/saved/whatever')).body.code).toBe('WORKER_ID_INVALID');
  });

  test('remove is idempotent', async () => {
    expect((await api(app, customer.cookie).delete(`/api/saved/${a.workerIdCode}`)).body).toEqual({ saved: false, workerIdCode: a.workerIdCode });
    expect((await api(app, customer.cookie).delete(`/api/saved/${a.workerIdCode}`)).status).toBe(200);
    expect((await api(app, customer.cookie).get('/api/saved/ids')).body.ids).toEqual([b.workerIdCode]);
  });

  test('compare: two or three workers in the order asked, public fields only', async () => {
    const res = await api(app, customer.cookie).get(`/api/workers/compare?ids=${c.workerIdCode},${a.workerIdCode},${b.workerIdCode}`);
    expect(res.status).toBe(200);
    expect(res.body.workers.map((w) => w.workerIdCode)).toEqual([c.workerIdCode, a.workerIdCode, b.workerIdCode]);
    expect(res.body.missing).toEqual([]);
    expect(res.body.workers[1]).toMatchObject({ occupation: 'Electrician', verificationStatus: 'Pending', user: { name: 'Worker A (synthetic)' } });
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/phone|email|whatsapp|address|emergencyContact|cnicEncrypted|cnicHash|3740533445561/i);
  });

  test('compare input rules', async () => {
    const cases = [
      [`ids=${a.workerIdCode}`, 'COMPARE_NEEDS_TWO'],
      [`ids=${a.workerIdCode},${b.workerIdCode},${c.workerIdCode},DLM-2026-000099`, 'COMPARE_MAX_THREE'],
      [`ids=${a.workerIdCode},${a.workerIdCode}`, 'COMPARE_SAME_WORKER'],
      [`ids=${a.workerIdCode},hello`, 'WORKER_ID_INVALID'],
      ['', 'ONE_VALUE'],
    ];
    for (const [query, code] of cases) {
      const res = await api(app, customer.cookie).get(`/api/workers/compare?${query}`);
      expect(res.status, query).toBe(400);
      expect(res.body.errors.map((e) => e.code)).toContain(code);
    }
    expect((await api(app, a.cookie).get(`/api/workers/compare?ids=${a.workerIdCode},${b.workerIdCode}`)).status).toBe(403); // workers may not browse workers
  });
});

describe('directory sort (feature 22)', () => {
  let customer;
  let junior;
  let senior;
  let proven;

  beforeAll(async () => {
    customer = await registerUser(app, { role: 'customer' });
    junior = await makeWorker({ name: 'Sort Junior (synthetic)', experienceYears: 1, occupation: 'Sorttest mason', category: 'construction_masonry', skillIds: [] });
    senior = await makeWorker({ name: 'Sort Senior (synthetic)', experienceYears: 30, occupation: 'Sorttest mason', category: 'construction_masonry', skillIds: [] });
    proven = await makeWorker({ name: 'Sort Proven (synthetic)', experienceYears: 10, occupation: 'Sorttest mason', category: 'construction_masonry', skillIds: ['elec_wiring'] });
    const id = await uploadProof(proven.cookie);
    await api(app, admin.cookie).patch(`/api/admin/evidence/${id}`).send({ action: 'approve' });
  });

  const order = async (sort) => (await api(app, customer.cookie).get(`/api/workers?search=Sorttest${sort ? `&sort=${sort}` : ''}`)).body;

  test('experience: most years first', async () => {
    const res = await order('experience');
    expect(res.sort).toBe('experience');
    expect(res.workers.map((w) => w.user.name)).toEqual(['Sort Senior (synthetic)', 'Sort Proven (synthetic)', 'Sort Junior (synthetic)']);
  });

  test('evidence: the worker with approved proof first; the stored sum follows the decisions', async () => {
    const res = await order('evidence');
    expect(res.workers[0].user.name).toBe('Sort Proven (synthetic)');
    expect((await WorkerProfile.findById(proven.profileId).lean()).approvedEvidenceCount).toBe(1);
    expect((await WorkerProfile.findById(junior.profileId).lean()).approvedEvidenceCount).toBe(0);
  });

  test('default is recently updated; an unknown sort is rejected', async () => {
    const res = await order();
    expect(res.sort).toBe('updated');
    expect(res.workers[0].user.name).toBe('Sort Proven (synthetic)'); // changed last (its proof was approved)
    const bad = await api(app, customer.cookie).get('/api/workers?sort=rating');
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('SORT_INVALID');
    expect(senior.workerIdCode).toMatch(/^DLM-/);
  });
});

describe('potential skills and profile strength (features 10, 11)', () => {
  let worker;

  beforeAll(async () => {
    worker = await makeWorker({ name: 'Strength Worker (synthetic)', skillIds: ['elec_wiring'] });
  });

  test('potential skills: same category as the main trade, never one already on the profile', async () => {
    const res = await api(app, worker.cookie).get('/api/workers/me/skills/potential');
    expect(res.status).toBe(200);
    expect(res.body.method).toBe('same trade category (rule-based)');
    expect(res.body.suggestions.length).toBeGreaterThan(0);
    expect(res.body.suggestions.length).toBeLessThanOrEqual(8);
    for (const s of res.body.suggestions) {
      expect(s.category).toBe('electrical_solar');
      expect(s.reason).toBe('main_trade');
      expect(s.id).not.toBe('elec_wiring');
      expect(s.i18n).toHaveProperty('ur');
    }
    expect(JSON.stringify(res.body)).not.toMatch(/score|confidence|probab/i);
  });

  test('one tap confirms a potential skill; it is recorded as "related" and no longer suggested', async () => {
    const first = (await api(app, worker.cookie).get('/api/workers/me/skills/potential')).body.suggestions[0];
    const add = await api(app, worker.cookie).post('/api/workers/me/skills').send({ skillIds: [first.id], addedVia: 'related' });
    expect(add.status).toBe(201);
    expect(add.body.skills.find((s) => s.skillId === first.id).addedVia).toBe('related');
    const after = (await api(app, worker.cookie).get('/api/workers/me/skills/potential')).body.suggestions;
    expect(after.map((s) => s.id)).not.toContain(first.id);
  });

  test('a new worker with no trade and no skills gets no suggestions; customers cannot ask', async () => {
    const fresh = await registerUser(app);
    expect((await api(app, fresh.cookie).get('/api/workers/me/skills/potential')).body.suggestions).toEqual([]);
    const customer = await registerUser(app, { role: 'customer' });
    expect((await api(app, customer.cookie).get('/api/workers/me/skills/potential')).status).toBe(403);
  });

  test('profile strength comes with "my full profile": the documented checklist and real next steps', async () => {
    const res = await api(app, worker.cookie).get('/api/workers/me/full');
    const { strength, profile } = res.body;
    expect(strength.percent).toBe(profile.profileCompletion);
    expect(strength.checks.reduce((sum, c) => sum + c.weight, 0)).toBe(100);
    expect(strength.level).toBe('good');
    expect(strength.proof).toEqual({ skills: 2, approved: 0, pending: 0, none: 2 });
    const codes = strength.tips.map((t) => t.code);
    expect(codes).toContain('add_cnic');
    expect(codes).toContain('add_proof');
    expect(strength.tips.find((t) => t.code === 'add_proof').params).toMatchObject({ skillId: 'elec_wiring', skillName: 'House wiring' });
    expect(strength.tips.length).toBeLessThanOrEqual(5);
  });
});
