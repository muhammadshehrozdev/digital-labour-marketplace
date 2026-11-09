// Module 3 (Phase 5): Skill Evidence and Verification. Every "Phase 5 required test" of
// CLAUDE_CODE_PROMPT.md is here (with the Batch 2 decisions), plus upload privacy checks.
import { describe, test, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import sharp from 'sharp';

import { createApp } from '../../app.js';
import Evidence from '../../models/Evidence.js';
import EvidenceFile from '../../models/EvidenceFile.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import * as storage from '../../services/evidence/storage.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { verifyAuditChain } from '../../services/audit.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';
import { jpeg, png, jpegWithGps, exifHasGps, heicHeader, pdfBytes, rawPattern } from '../helpers/images.js';

let app;
let adminCookie;
let seed = 100;
const nextSeed = () => (seed += 1);

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  const email = uniqueEmail('admin');
  await createAdminAccount({ name: 'Evidence Admin', email, phone: '03009998888', password: GOOD_PASSWORD });
  adminCookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
});
afterAll(stopTestDb);
afterEach(() => vi.restoreAllMocks());

// A worker who finished onboarding with the given taxonomy skills.
async function newWorker(skillIds = ['elec_wiring', 'elec_solar'], name = 'Evidence Worker') {
  const w = await registerUser(app, { name });
  await api(app, w.cookie).put('/api/workers/me').send({
    city: 'Rawalpindi', occupation: 'Electrician', category: 'electrical_solar', experienceYears: 5, dailyRate: 3000,
  });
  await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds, addedVia: 'manual' });
  return w;
}

// A field set to null is left out of the form.
function upload(cookie, { file, filename = 'photo.jpg', skillId = 'elec_wiring', type = 'work_photo', consent = 'true', title } = {}) {
  const req = api(app, cookie).post('/api/evidence');
  if (skillId !== null) req.field('skillId', skillId);
  if (type !== null) req.field('type', type);
  if (title !== undefined) req.field('title', title);
  if (consent !== null) req.field('consent', consent);
  if (file) req.attach('image', file, { filename, contentType: 'image/jpeg' }); // browser type is ignored
  return req;
}

const decide = (id, body, cookie = adminCookie) => api(app, cookie).patch(`/api/admin/evidence/${id}`).send(body);
const skillOf = async (userId, skillId) => (await WorkerProfile.findOne({ user: userId }).lean()).skills.find((s) => s.skillId === skillId);

describe('upload pipeline', () => {
  test('a real JPEG with GPS EXIF -> 201; the stored file is WebP with no EXIF and no GPS', async () => {
    const w = await newWorker();
    const original = await jpegWithGps(nextSeed());
    expect(exifHasGps((await sharp(original).metadata()).exif)).toBe(true); // the test file really has GPS

    const res = await upload(w.cookie, { file: original, title: 'Wiring job in G-10' });
    expect(res.status).toBe(201);
    expect(res.body.evidence).toMatchObject({ status: 'pending', skillId: 'elec_wiring', type: 'work_photo', title: 'Wiring job in G-10' });
    expect(res.body.skill.evidenceSummary).toMatchObject({ status: 'evidence_pending', pending: 1, approved: 0 });

    const stored = await Evidence.findById(res.body.evidence._id).lean();
    const file = await storage.read(stored.fileId);
    const meta = await sharp(file.data).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.exif).toBeUndefined();
    expect(exifHasGps(meta.exif)).toBe(false);
    expect(file.data.includes(Buffer.from('EXIF'))).toBe(false);
    expect(file.data.includes(Buffer.from('TestCamera'))).toBe(false);
    expect(stored).toMatchObject({ contentType: 'image/webp', width: 64, height: 48 });
    expect(stored.consentAt).toBeTruthy();
    expect(stored.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.dhash).toMatch(/^[a-f0-9]{16}$/);
  });

  test('PNG and WebP are accepted; a large photo is shrunk to at most 2000 px', async () => {
    const w = await newWorker();
    expect((await upload(w.cookie, { file: await png(nextSeed()), filename: 'a.png' })).status).toBe(201);
    const webp = await rawPattern(nextSeed()).webp().toBuffer();
    expect((await upload(w.cookie, { file: webp, filename: 'b.webp' })).status).toBe(201);
    const big = await rawPattern(nextSeed(), 3000, 1500).jpeg({ quality: 70 }).toBuffer();
    const res = await upload(w.cookie, { file: big, skillId: 'elec_solar' });
    expect(res.status).toBe(201);
    const stored = await Evidence.findById(res.body.evidence._id).lean();
    expect([stored.width, stored.height]).toEqual([2000, 1000]);
  });

  test('EXIF orientation is applied before the metadata is removed (auto-rotate)', async () => {
    const w = await newWorker();
    const sideways = await rawPattern(nextSeed(), 60, 30).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const res = await upload(w.cookie, { file: sideways });
    expect(res.status).toBe(201);
    expect([res.body.evidence.width, res.body.evidence.height]).toEqual([30, 60]);
  });

  test.each([
    ['a text file renamed to .jpg', () => Buffer.from('this is plain text, not a photo at all'), 'notes.jpg', /not a photo/],
    ['a PDF', pdfBytes, 'certificate.pdf', /PDF files are not accepted/],
    ['a HEIC photo (iPhone)', heicHeader, 'IMG_0001.HEIC', /^Please upload a JPG or PNG photo\.$/],
  ])('%s -> 400 with a clear message', async (_label, makeFile, filename, message) => {
    const w = await newWorker();
    const res = await upload(w.cookie, { file: makeFile(), filename });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
    expect(await Evidence.countDocuments({ worker: w.user._id })).toBe(0);
  });

  test('a 5 MB file -> 413 with a clear message (limit 4 MB)', async () => {
    const w = await newWorker();
    const res = await upload(w.cookie, { file: Buffer.alloc(5 * 1024 * 1024, 7) });
    expect(res.status).toBe(413);
    expect(res.body.message).toBe('The photo is too large. The limit is 4 MB.');
  });

  test('a corrupt JPEG (right header, broken data) -> 400', async () => {
    const w = await newWorker();
    const good = await jpeg(nextSeed());
    const res = await upload(w.cookie, { file: Buffer.concat([good.subarray(0, 40), Buffer.alloc(200, 1)]) });
    expect(res.status).toBe(400);
  });

  test.each([
    ['no consent', { consent: null }, /consent/i],
    ['consent "false"', { consent: 'false' }, /consent/i],
    ['no photo', { file: null }, /choose a photo/i],
    ['unknown type', { type: 'selfie' }, /certificate, work photo or reference letter/],
    ['a skill the worker does not have', { skillId: 'plumb_geyser' }, /only for a skill on your profile/],
    ['an invalid skill id', { skillId: '$where' }, /Choose one of your skills/],
  ])('%s -> 400', async (_label, change, message) => {
    const w = await newWorker();
    const file = change.file === null ? undefined : await jpeg(nextSeed());
    const res = await upload(w.cookie, { ...change, file });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
  });

  test('the same file twice for the same skill -> 409; for another skill of the same worker -> 201', async () => {
    const w = await newWorker();
    const file = await jpeg(nextSeed());
    expect((await upload(w.cookie, { file })).status).toBe(201);
    const again = await upload(w.cookie, { file });
    expect(again.status).toBe(409);
    expect(again.body.message).toMatch(/already uploaded this photo/);
    expect((await upload(w.cookie, { file, skillId: 'elec_solar' })).status).toBe(201);
  });

  test('the same file from another worker -> 201 with possibleDuplicateOf set (exact)', async () => {
    const a = await newWorker();
    const b = await newWorker();
    const file = await jpeg(nextSeed());
    const first = await upload(a.cookie, { file });
    const second = await upload(b.cookie, { file });
    expect(second.status).toBe(201);
    const stored = await Evidence.findById(second.body.evidence._id).lean();
    expect(String(stored.possibleDuplicateOf)).toBe(first.body.evidence._id);
    expect(stored.duplicateKind).toBe('exact');
    // The worker is not told about another worker's item.
    expect(JSON.stringify(second.body)).not.toContain(first.body.evidence._id);
  });

  test('a look-alike picture from another worker (same image, other format) is flagged "similar" by dHash', async () => {
    const a = await newWorker();
    const b = await newWorker();
    const s = nextSeed();
    const first = await upload(a.cookie, { file: await jpeg(s) });
    const second = await upload(b.cookie, { file: await png(s), filename: 'same.png' });
    expect(second.status).toBe(201);
    const stored = await Evidence.findById(second.body.evidence._id).lean();
    expect(stored.duplicateKind).toBe('similar');
    expect(String(stored.possibleDuplicateOf)).toBe(first.body.evidence._id);
    expect(stored.duplicateDistance).toBeLessThanOrEqual(10);
    // A clearly different picture is not flagged.
    const third = await upload(b.cookie, { file: await jpeg(nextSeed()), skillId: 'elec_solar' });
    expect((await Evidence.findById(third.body.evidence._id).lean()).possibleDuplicateOf).toBeNull();
  });

  test('limit: at most 5 proof items per skill', async () => {
    const w = await newWorker();
    for (let i = 0; i < 5; i += 1) expect((await upload(w.cookie, { file: await jpeg(nextSeed()) })).status).toBe(201);
    const sixth = await upload(w.cookie, { file: await jpeg(nextSeed()) });
    expect(sixth.status).toBe(400);
    expect(sixth.body.message).toMatch(/At most 5/);
  });

  test('only workers can upload; not logged in -> 401', async () => {
    const customer = await registerUser(app, { role: 'customer' });
    expect((await upload(customer.cookie, { file: await jpeg(nextSeed()) })).status).toBe(403);
    expect((await upload(null, { file: await jpeg(nextSeed()) })).status).toBe(401);
  });
});

describe('who can see and delete evidence', () => {
  let a;
  let b;
  let itemA;
  beforeAll(async () => {
    a = await newWorker(['elec_wiring'], 'Worker A');
    b = await newWorker(['elec_wiring'], 'Worker B');
    itemA = (await upload(a.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
  });

  test('the owner and an admin can view the image, with safe headers', async () => {
    for (const cookie of [a.cookie, adminCookie]) {
      const res = await api(app, cookie).get(`/api/evidence/${itemA}/file`).buffer(true);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/webp');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['cache-control']).toBe('private, no-store');
      expect((await sharp(res.body).metadata()).format).toBe('webp');
    }
  });

  test('worker A cannot download or delete worker B\'s evidence (404), and nothing is deleted', async () => {
    expect((await api(app, b.cookie).get(`/api/evidence/${itemA}/file`)).status).toBe(404);
    expect((await api(app, b.cookie).delete(`/api/evidence/${itemA}`)).status).toBe(404);
    expect(await Evidence.exists({ _id: itemA })).not.toBeNull();
  });

  test('a customer cannot download any evidence (403); not logged in -> 401', async () => {
    const customer = await registerUser(app, { role: 'customer' });
    expect((await api(app, customer.cookie).get(`/api/evidence/${itemA}/file`)).status).toBe(403);
    expect((await api(app).get(`/api/evidence/${itemA}/file`)).status).toBe(401);
  });

  test('customers never get images, file ids or hashes in the directory or the public profile', async () => {
    await decide(itemA, { action: 'approve' });
    const customer = await registerUser(app, { role: 'customer' });
    const dir = await api(app, customer.cookie).get('/api/workers');
    const code = (await WorkerProfile.findOne({ user: a.user._id }).lean()).workerIdCode;
    const pub = await api(app, customer.cookie).get(`/api/workers/${code}`);
    const stored = await Evidence.findById(itemA).lean();
    for (const body of [dir.body, pub.body]) {
      const text = JSON.stringify(body);
      for (const secret of [itemA, String(stored.fileId), stored.sha256, stored.dhash, '/file', 'belief', 'expected']) expect(text).not.toContain(secret);
    }
    const skill = pub.body.skills.find((s) => s.skillId === 'elec_wiring');
    expect(skill.evidenceSummary).toEqual({ status: 'verified', approved: 1, strength: 'moderate' });
  });

  test('list endpoints never load file bytes', async () => {
    const findById = vi.spyOn(EvidenceFile, 'findById');
    const find = vi.spyOn(EvidenceFile, 'find');
    const findOne = vi.spyOn(EvidenceFile, 'findOne');
    const mine = await api(app, a.cookie).get('/api/evidence/mine');
    const queue = await api(app, adminCookie).get('/api/admin/evidence?status=all');
    const detail = await api(app, adminCookie).get(`/api/admin/evidence/${itemA}`);
    expect([mine.status, queue.status, detail.status]).toEqual([200, 200, 200]);
    expect(findById).not.toHaveBeenCalled();
    expect(find).not.toHaveBeenCalled();
    expect(findOne).not.toHaveBeenCalled();
    for (const res of [mine, queue, detail]) expect(JSON.stringify(res.body)).not.toMatch(/"data"|"fileId"|"sha256"/);
  });

  test('the worker\'s list shows status and reason, but no numbers and no duplicate information', async () => {
    const res = await api(app, a.cookie).get('/api/evidence/mine');
    expect(res.body.evidence[0]).toMatchObject({ _id: itemA, status: 'approved', skillName: 'House wiring' });
    expect(JSON.stringify(res.body)).not.toMatch(/possibleDuplicate|belief|expected|dhash/);
  });

  test('deleting evidence removes its EvidenceFile document', async () => {
    const id = (await upload(a.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    const { fileId } = await Evidence.findById(id).lean();
    expect(await EvidenceFile.exists({ _id: fileId })).not.toBeNull();
    const res = await api(app, a.cookie).delete(`/api/evidence/${id}`);
    expect(res.status).toBe(200);
    expect(await Evidence.exists({ _id: id })).toBeNull();
    expect(await EvidenceFile.exists({ _id: fileId })).toBeNull();
    expect(await AuditLog.exists({ action: 'evidence.deleted', targetId: id })).not.toBeNull();
  });
});

describe('admin review (state machine, audit log, skill status)', () => {
  test('approve writes the audit log and the skill becomes "Verified by evidence"', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()), type: 'certificate' })).body.evidence._id;
    const res = await decide(id, { action: 'approve' });
    expect(res.status).toBe(200);
    expect(res.body.evidence.status).toBe('approved');
    expect(res.body.skill.evidenceSummary).toMatchObject({ status: 'verified', approved: 1, strength: 'moderate' });
    expect(res.body.opinion).toMatchObject({ r: 2, s: 0, belief: 0.5, uncertainty: 0.5, expected: 0.75 });
    expect((await skillOf(w.user._id, 'elec_wiring')).evidenceSummary.status).toBe('verified');
    const entry = await AuditLog.findOne({ action: 'evidence.approved', targetId: id }).lean();
    expect(entry).toMatchObject({ fromState: 'pending', toState: 'approved', actorRole: 'admin' });
  });

  test('reject needs a reason (400 without); with a reason it is audited and the worker sees the reason', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    const none = await decide(id, { action: 'reject' });
    expect(none.status).toBe(400);
    expect(none.body.message).toMatch(/reason is required/);
    expect((await decide(id, { action: 'reject', reasonCode: 'other' })).status).toBe(400); // "other" needs words
    const res = await decide(id, { action: 'reject', reasonCode: 'unclear' });
    expect(res.status).toBe(200);
    expect(res.body.skill.evidenceSummary.status).toBe('self_declared');
    const mine = await api(app, w.cookie).get('/api/evidence/mine');
    expect(mine.body.evidence[0]).toMatchObject({ status: 'rejected', reasonCode: 'unclear', reviewNote: 'Photo is unclear' });
    expect(await AuditLog.exists({ action: 'evidence.rejected', targetId: id, toState: 'rejected' })).not.toBeNull();
  });

  test('suspected fake and revoke need a written reason', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    expect((await decide(id, { action: 'suspected_fake' })).status).toBe(400);
    expect((await decide(id, { action: 'suspected_fake', note: 'x' })).status).toBe(400);
    await decide(id, { action: 'approve' });
    expect((await decide(id, { action: 'revoke' })).status).toBe(400);
  });

  test('an invalid transition (rejected -> approved) -> 400, nothing changes', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    await decide(id, { action: 'reject', reasonCode: 'not_relevant' });
    const res = await decide(id, { action: 'approve' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot approve an item that is rejected/);
    expect((await Evidence.findById(id).lean()).status).toBe('rejected');
    expect((await decide(id, { action: 'revoke', note: 'Trying to revoke a rejection' })).status).toBe(400);
  });

  test('approved -> revoked works for the admin and updates the skill status', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    await decide(id, { action: 'approve' });
    expect((await skillOf(w.user._id, 'elec_wiring')).evidenceSummary.status).toBe('verified');
    const res = await decide(id, { action: 'revoke', note: 'Approved by mistake: photo shows a different job' });
    expect(res.status).toBe(200);
    expect(res.body.evidence.status).toBe('revoked');
    expect((await skillOf(w.user._id, 'elec_wiring')).evidenceSummary).toMatchObject({ status: 'self_declared', approved: 0 });
    expect(await AuditLog.exists({ action: 'evidence.revoked', targetId: id, fromState: 'approved' })).not.toBeNull();
  });

  test('a worker cannot delete a suspected fake, and the skill stays "Disputed"', async () => {
    const w = await newWorker();
    const good = (await upload(w.cookie, { file: await jpeg(nextSeed()), type: 'certificate' })).body.evidence._id;
    const fake = (await upload(w.cookie, { file: await jpeg(nextSeed()), type: 'certificate' })).body.evidence._id;
    await decide(good, { action: 'approve' });
    const res = await decide(fake, { action: 'suspected_fake', note: 'Certificate number does not exist at the issuer' });
    expect(res.body.skill.evidenceSummary.status).toBe('disputed'); // Disputed wins over Verified
    expect(res.body.opinion).toMatchObject({ r: 2, s: 1, expected: 0.6 });

    const del = await api(app, w.cookie).delete(`/api/evidence/${fake}`);
    expect(del.status).toBe(409);
    expect(del.body.message).toMatch(/suspected fake/);
    expect(await Evidence.exists({ _id: fake })).not.toBeNull();
    // ...and removing the skill is also blocked, so the finding cannot be hidden.
    expect((await api(app, w.cookie).delete('/api/workers/me/skills/elec_wiring')).status).toBe(409);
    expect((await skillOf(w.user._id, 'elec_wiring')).evidenceSummary.status).toBe('disputed');
  });

  test('approved items cannot be deleted by the worker either; pending ones can', async () => {
    const w = await newWorker();
    const approved = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    await decide(approved, { action: 'approve' });
    expect((await api(app, w.cookie).delete(`/api/evidence/${approved}`)).status).toBe(409);
    const pending = (await upload(w.cookie, { file: await jpeg(nextSeed()), skillId: 'elec_solar' })).body.evidence._id;
    expect((await api(app, w.cookie).delete(`/api/evidence/${pending}`)).status).toBe(200);
  });

  test('two simultaneous reviews of the same item -> one succeeds, the other gets 409', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    const results = await Promise.all([decide(id, { action: 'approve' }), decide(id, { action: 'reject', reasonCode: 'unclear' })]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const loser = results.find((r) => r.status === 409);
    expect(loser.body.message).toMatch(/Someone else reviewed this item/);
    expect(await AuditLog.countDocuments({ targetId: id, action: mongoose.trusted({ $in: ['evidence.approved', 'evidence.rejected'] }) })).toBe(1);
  });

  test('admin queue: pending items oldest first; filters by status, type, skill and possible duplicates', async () => {
    const w = await newWorker();
    await upload(w.cookie, { file: await jpeg(nextSeed()), type: 'reference_letter', skillId: 'elec_solar' });
    const queue = await api(app, adminCookie).get('/api/admin/evidence');
    expect(queue.status).toBe(200);
    const times = queue.body.evidence.map((e) => e.createdAt);
    expect([...times].sort()).toEqual(times);
    expect(queue.body.evidence.every((e) => e.status === 'pending')).toBe(true);
    const letters = await api(app, adminCookie).get('/api/admin/evidence?status=all&type=reference_letter&skillId=elec_solar');
    expect(letters.body.evidence.length).toBeGreaterThan(0);
    expect(letters.body.evidence.every((e) => e.type === 'reference_letter' && e.skillId === 'elec_solar')).toBe(true);
    const dups = await api(app, adminCookie).get('/api/admin/evidence?status=all&duplicates=true');
    expect(dups.body.evidence.every((e) => e.duplicateKind)).toBe(true);
    expect(queue.body.evidence[0].worker.name).toBeTruthy();
    expect(queue.body.evidence[0].workerIdCode).toMatch(/^DLM-/);
  });

  test('admin detail shows the possible duplicate side by side and the numbers with the method', async () => {
    const a = await newWorker();
    const b = await newWorker();
    const file = await jpeg(nextSeed());
    await upload(a.cookie, { file });
    const id = (await upload(b.cookie, { file })).body.evidence._id;
    const res = await api(app, adminCookie).get(`/api/admin/evidence/${id}`);
    expect(res.body.duplicate).toMatchObject({ skillId: 'elec_wiring' });
    expect(res.body.duplicate.worker.name).toBe('Evidence Worker');
    expect(res.body.opinion.method).toMatch(/subjective-logic/);
    expect(res.body.opinion).toMatchObject({ belief: 0, disbelief: 0, uncertainty: 1, expected: 0.5 });
    expect(res.body.evidence.allowedActions).toEqual(['approve', 'reject', 'suspected_fake']);
  });

  test.each([
    ['a worker', 'worker'],
    ['a customer', 'customer'],
  ])('%s gets 403 on every admin evidence route', async (_l, role) => {
    const u = await registerUser(app, { role });
    const id = new mongoose.Types.ObjectId();
    expect((await api(app, u.cookie).get('/api/admin/evidence')).status).toBe(403);
    expect((await api(app, u.cookie).get(`/api/admin/evidence/${id}`)).status).toBe(403);
    expect((await api(app, u.cookie).patch(`/api/admin/evidence/${id}`).send({ action: 'approve' })).status).toBe(403);
  });

  test('bad decision input -> 400 (unknown action, extra field, bad id)', async () => {
    const w = await newWorker();
    const id = (await upload(w.cookie, { file: await jpeg(nextSeed()) })).body.evidence._id;
    expect((await decide(id, { action: 'delete' })).status).toBe(400);
    expect((await decide(id, { action: 'approve', status: 'approved' })).status).toBe(400);
    expect((await decide(id, { action: 'approve', reasonCode: 'unclear' })).status).toBe(400);
    expect((await decide('not-an-id', { action: 'approve' })).status).toBe(400);
    expect((await decide(new mongoose.Types.ObjectId(), { action: 'approve' })).status).toBe(404);
  });
});

describe('invariants and the audit chain', () => {
  test('self-claims alone never change the score: skills added by hand or from the extractor stay Self-declared, E 0.5', async () => {
    const w = await registerUser(app);
    await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_pipe'], addedVia: 'manual' });
    await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_geyser'], addedVia: 'extractor', sourceText: 'geyser' });
    const profile = await WorkerProfile.findOne({ user: w.user._id }).lean();
    for (const s of profile.skills) expect(s.evidenceSummary).toMatchObject({ status: 'self_declared', approved: 0, strength: 'none' });
  });

  test('no skill ever shows "Verified by evidence" without at least one approved evidence record (after many random actions)', async () => {
    const workers = [await newWorker(), await newWorker()];
    const ids = [];
    let state = 12345;
    const rand = () => {
      state = (state * 1103515245 + 12345) % 2147483648;
      return state / 2147483648;
    };
    for (let i = 0; i < 24; i += 1) {
      const w = workers[i % 2];
      const skillId = rand() < 0.5 ? 'elec_wiring' : 'elec_solar';
      const res = await upload(w.cookie, { file: await jpeg(nextSeed()), skillId, type: ['certificate', 'work_photo', 'reference_letter'][i % 3] });
      if (res.status === 201) ids.push(res.body.evidence._id);
      const target = ids[Math.floor(rand() * ids.length)];
      const action = ['approve', 'reject', 'suspected_fake', 'revoke'][Math.floor(rand() * 4)];
      await decide(target, action === 'reject' ? { action, reasonCode: 'unclear' } : { action, note: 'Random review step' });
      if (rand() < 0.2) await api(app, w.cookie).delete(`/api/evidence/${ids[Math.floor(rand() * ids.length)]}`);
    }
    for (const w of workers) {
      const profile = await WorkerProfile.findOne({ user: w.user._id }).lean();
      for (const s of profile.skills) {
        const approved = await Evidence.countDocuments({ worker: w.user._id, skillId: s.skillId, status: 'approved' });
        const fakes = await Evidence.countDocuments({ worker: w.user._id, skillId: s.skillId, status: 'suspected_fake' });
        if (s.evidenceSummary.status === 'verified') {
          expect(approved).toBeGreaterThan(0);
          expect(fakes).toBe(0);
        }
        if (fakes > 0) expect(s.evidenceSummary.status).toBe('disputed');
        expect(s.evidenceSummary.approved).toBe(approved);
      }
    }
  });

  test('audit:verify detects an edited evidence decision', async () => {
    expect((await verifyAuditChain()).ok).toBe(true);
    const entry = await AuditLog.findOne({ action: 'evidence.approved' }).lean();
    await AuditLog.collection.updateOne({ _id: entry._id }, { $set: { toState: 'rejected' } });
    const broken = await verifyAuditChain();
    expect(broken).toMatchObject({ ok: false, badSeq: entry.seq });
    await AuditLog.collection.updateOne({ _id: entry._id }, { $set: { toState: entry.toState } });
    expect((await verifyAuditChain()).ok).toBe(true);
  });

  test('admin stats include evidence counts', async () => {
    const res = await api(app, adminCookie).get('/api/admin/stats');
    expect(res.body.evidence.total).toBe(await Evidence.countDocuments());
    expect(res.body.evidence.pending).toBe(await Evidence.countDocuments({ status: 'pending' }));
  });
});
