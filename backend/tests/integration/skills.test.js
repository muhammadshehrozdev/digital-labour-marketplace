// Module 2 endpoints (Phase 4) and guided onboarding (D-011). Audit IDs M2-1 .. M2-11.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

import { createApp } from '../../app.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { migrateSkills } from '../../scripts/lib/migrations.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';

let app;
beforeAll(async () => {
  await startTestDb();
  app = createApp();
});
afterAll(stopTestDb);

const ABOUT = { city: 'Rawalpindi', address: 'Satellite Town', languages: ['Urdu'] };
const WORK = { occupation: 'Plumber', category: 'plumbing_sanitary', experienceYears: 5, hourlyRate: 600 };

// Everything stored for this worker, as raw documents, to compare before/after.
async function snapshot(userId) {
  const doc = await WorkerProfile.collection.findOne({ user: new mongoose.Types.ObjectId(userId) });
  return JSON.stringify(doc);
}

describe('POST /api/workers/me/skills/extract — suggestions only', () => {
  test('returns suggestions with matched words and never changes the database (M2-2)', async () => {
    const { cookie, user } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ ...ABOUT, ...WORK, occupation: 'Senior plumber' });
    const before = await snapshot(user._id);
    const auditBefore = await AuditLog.countDocuments();

    const res = await api(app, cookie)
      .post('/api/workers/me/skills/extract')
      .send({ text: 'Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon' });
    expect(res.status).toBe(200);
    expect(res.body.skills.map((s) => s.skillId).sort()).toEqual(['plumb_general', 'plumb_geyser', 'plumb_pipe']);
    expect(res.body.experience).toEqual({ years: 5, months: 0 });
    expect(res.body.method).toBe('rule-based word list');

    expect(await snapshot(user._id)).toBe(before); // occupation "Senior plumber" not overwritten
    expect(await AuditLog.countDocuments()).toBe(auditBefore);
  });

  test('"hello" -> no skills, and the saved profile is unchanged (M2-3)', async () => {
    const { cookie, user } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ ...ABOUT, ...WORK });
    await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_pipe'], addedVia: 'manual' });
    const before = await snapshot(user._id);
    const res = await api(app, cookie).post('/api/workers/me/skills/extract').send({ text: 'hello' });
    expect(res.status).toBe(200);
    expect(res.body.skills).toEqual([]);
    expect(res.body.noSkillReason).toBe('no_trade_words');
    expect(await snapshot(user._id)).toBe(before);
  });

  test('voice input works: inputMode "voice" is accepted and nothing breaks saving (M2-1)', async () => {
    const { cookie } = await registerUser(app);
    const res = await api(app, cookie).post('/api/workers/me/skills/extract').send({ text: 'do saal se wiring', inputMode: 'voice' });
    expect(res.status).toBe(200);
    const add = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring'], addedVia: 'extractor', sourceText: 'do saal se wiring' });
    expect(add.status).toBe(201);
  });

  test.each([
    ['non-string text', { text: 12345 }],
    ['array text', { text: ['wiring'] }],
    ['text over 2,000 characters', { text: 'a'.repeat(2001) }],
    ['empty text', { text: '   ' }],
    ['unknown inputMode', { text: 'wiring', inputMode: 'telepathy' }],
    ['extra field', { text: 'wiring', save: true }],
  ])('%s -> 400 (M2-11)', async (_label, body) => {
    const { cookie } = await registerUser(app);
    expect((await api(app, cookie).post('/api/workers/me/skills/extract').send(body)).status).toBe(400);
  });

  test('marks suggestions the worker already saved', async () => {
    const { cookie } = await registerUser(app);
    await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring'], addedVia: 'manual' });
    const res = await api(app, cookie).post('/api/workers/me/skills/extract').send({ text: 'wiring aur solar' });
    expect(Object.fromEntries(res.body.skills.map((s) => [s.skillId, s.alreadySaved]))).toEqual({ elec_wiring: true, elec_solar: false });
  });

  test('customer and admin cannot use the worker skill routes', async () => {
    const { cookie } = await registerUser(app, { role: 'customer' });
    expect((await api(app, cookie).post('/api/workers/me/skills/extract').send({ text: 'wiring' })).status).toBe(403);
    expect((await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring'], addedVia: 'manual' })).status).toBe(403);
  });
});

describe('confirmed skills: POST/GET/DELETE /api/workers/me/skills', () => {
  test('adds only the ticked skills; adding twice keeps one copy (M2-10); no score is stored (M2-9)', async () => {
    const { cookie, user } = await registerUser(app);
    const first = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring', 'elec_solar'], addedVia: 'extractor' });
    expect(first.status).toBe(201);
    const again = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring', 'elec_wiring'], addedVia: 'manual' });
    expect(again.status).toBe(200);
    expect(again.body.skills.map((s) => s.skillId)).toEqual(['elec_wiring', 'elec_solar']);
    expect(again.body.skills[0]).toMatchObject({ name: 'House wiring', category: 'electrical_solar', addedVia: 'extractor', custom: false });

    const raw = await WorkerProfile.collection.findOne({ user: new mongoose.Types.ObjectId(user._id) });
    const text = JSON.stringify(raw).toLowerCase();
    for (const word of ['confidence', 'strength', 'score', 'level', 'categorizedskills', 'recommendedskills']) {
      expect(text).not.toContain(word);
    }
  });

  test('an unknown skillId -> 400; custom skills only through the separate custom route', async () => {
    const { cookie } = await registerUser(app);
    const bad = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['rocket_science'], addedVia: 'manual' });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/Unknown skill/);
    const free = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: [], addedVia: 'manual', name: 'Anything' });
    expect(free.status).toBe(400);

    const custom = await api(app, cookie).post('/api/workers/me/skills/custom').send({ name: 'Glass fitting', category: 'home_maintenance' });
    expect(custom.status).toBe(201);
    expect(custom.body.skills).toEqual([
      expect.objectContaining({ skillId: 'custom-glass-fitting', name: 'Glass fitting', custom: true, addedVia: 'manual' }),
    ]);
    expect((await api(app, cookie).post('/api/workers/me/skills/custom').send({ name: 'Glass fitting', category: 'nope' })).status).toBe(400);
  });

  test('sourceText from the extractor is kept (owner only), and never sent to customers', async () => {
    const { cookie, user } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ ...ABOUT, ...WORK });
    await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_geyser'], addedVia: 'extractor', sourceText: 'geyser lagata hoon' });
    const stored = await WorkerProfile.findOne({ user: user._id }).select('+rawExperienceText').lean();
    expect(stored.rawExperienceText).toBe('geyser lagata hoon');
    expect(stored.lastExtractedAt).toBeTruthy();

    const customer = await registerUser(app, { role: 'customer' });
    const dir = await api(app, customer.cookie).get('/api/workers');
    expect(JSON.stringify(dir.body)).not.toContain('geyser lagata hoon');
  });

  test('DELETE removes one skill and nothing else; unknown skill -> 404; bad id -> 400', async () => {
    const { cookie } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ ...ABOUT, ...WORK });
    await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_pipe', 'plumb_leak'], addedVia: 'manual' });
    const res = await api(app, cookie).delete('/api/workers/me/skills/plumb_pipe');
    expect(res.status).toBe(200);
    expect(res.body.skills.map((s) => s.skillId)).toEqual(['plumb_leak']);
    const me = await api(app, cookie).get('/api/workers/me');
    expect(me.body).toMatchObject({ occupation: 'Plumber', category: 'plumbing_sanitary', experienceYears: 5 });
    expect((await api(app, cookie).delete('/api/workers/me/skills/plumb_pipe')).status).toBe(404);
    expect((await api(app, cookie).delete('/api/workers/me/skills/DROP%20TABLE')).status).toBe(400);
  });

  test('the old profiler routes are gone (no endpoint can wipe Module 1 data)', async () => {
    const { cookie } = await registerUser(app);
    expect((await api(app, cookie).post('/api/worker/ai-skill-profiler').send({ rawExperienceText: 'x' })).status).toBe(404);
    expect((await api(app, cookie).delete('/api/worker/ai-skill-profiler/reset')).status).toBe(404);
  });
});

describe('GET /api/workers/me/onboarding (derived progress, D-011)', () => {
  test('empty profile -> next step "about"; then work; then skills; then complete with a stored time', async () => {
    const { cookie } = await registerUser(app);
    const step = async () => (await api(app, cookie).get('/api/workers/me/onboarding')).body;

    expect(await step()).toMatchObject({ steps: { about: false, work: false, skills: false }, nextStep: 'about', complete: false });

    const afterAbout = await api(app, cookie).put('/api/workers/me').send(ABOUT);
    expect(afterAbout.body.onboarding.nextStep).toBe('work');

    const afterWork = await api(app, cookie).put('/api/workers/me').send(WORK);
    expect(afterWork.body.onboarding.nextStep).toBe('skills'); // the app opens step 3 from this

    const afterSkills = await api(app, cookie).post('/api/workers/me/skills').send({ skillIds: ['plumb_pipe'], addedVia: 'manual' });
    expect(afterSkills.body.onboarding).toMatchObject({ complete: true, nextStep: null });
    const done = await step();
    expect(done.complete).toBe(true);
    const firstTime = done.completedAt;
    expect(firstTime).toBeTruthy();

    // Removing the only skill makes the skills step incomplete again, but the first completion time stays.
    await api(app, cookie).delete('/api/workers/me/skills/plumb_pipe');
    const later = await step();
    expect(later).toMatchObject({ nextStep: 'skills', complete: false, completedAt: firstTime });
  });

  test('"work" needs occupation, category, experience and at least one rate', async () => {
    const { cookie } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ ...ABOUT, occupation: 'Plumber', category: 'plumbing_sanitary', experienceYears: 0 });
    expect((await api(app, cookie).get('/api/workers/me/onboarding')).body.steps.work).toBe(false);
    await api(app, cookie).put('/api/workers/me').send({ dailyRate: 2000 });
    expect((await api(app, cookie).get('/api/workers/me/onboarding')).body.steps.work).toBe(true); // 0 years is valid
  });

  test('only workers', async () => {
    const { cookie } = await registerUser(app, { role: 'customer' });
    expect((await api(app, cookie).get('/api/workers/me/onboarding')).status).toBe(403);
  });
});

describe('admin overview and audit viewer', () => {
  let adminCookie;
  beforeAll(async () => {
    const email = uniqueEmail('admin');
    await createAdminAccount({ name: 'Audit Admin', email, phone: '03009998888', password: GOOD_PASSWORD });
    adminCookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
  });

  test('GET /api/admin/stats gives real counts', async () => {
    const res = await api(app, adminCookie).get('/api/admin/stats');
    expect(res.status).toBe(200);
    const total = await WorkerProfile.countDocuments();
    expect(res.body.workers.total).toBe(total);
    expect(res.body.users.admin).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/admin/audit lists entries newest first, filters by action and date, no hashes', async () => {
    const all = await api(app, adminCookie).get('/api/admin/audit');
    expect(all.status).toBe(200);
    expect(all.body.actions).toContain('admin.created');
    const seqs = all.body.entries.map((e) => e.seq);
    expect([...seqs].sort((a, b) => b - a)).toEqual(seqs);
    expect(all.body.entries[0].hash).toBeUndefined();

    const created = await api(app, adminCookie).get('/api/admin/audit?action=admin.created');
    expect(created.body.entries.every((e) => e.action === 'admin.created')).toBe(true);
    const today = new Date().toISOString().slice(0, 10);
    expect((await api(app, adminCookie).get(`/api/admin/audit?from=${today}&to=${today}`)).body.total).toBe(all.body.total);
    expect((await api(app, adminCookie).get('/api/admin/audit?from=2000-01-01&to=2000-01-02')).body.total).toBe(0);
  });

  test.each([
    ['bad action', '?action=$where'],
    ['bad date', '?from=yesterday'],
    ['unknown key', '?actor=me'],
  ])('audit query with %s -> 400', async (_l, q) => {
    expect((await api(app, adminCookie).get(`/api/admin/audit${q}`)).status).toBe(400);
  });

  test('non-admins get 403 on stats and audit', async () => {
    const { cookie } = await registerUser(app, { role: 'customer' });
    expect((await api(app, cookie).get('/api/admin/stats')).status).toBe(403);
    expect((await api(app, cookie).get('/api/admin/audit')).status).toBe(403);
  });

  test('identity queue search by worker name', async () => {
    const w = await registerUser(app, { name: 'Zarghuna Unique' });
    await api(app, w.cookie).put('/api/workers/me').send({ ...ABOUT, ...WORK });
    const res = await api(app, adminCookie).get('/api/admin/workers?q=zarghuna');
    expect(res.body.workers.map((x) => x.user.name)).toEqual(['Zarghuna Unique']);
    expect((await api(app, adminCookie).get('/api/admin/workers?q=(')).status).toBe(200);
  });
});

describe('migrateSkills (old Module 2 data -> one skills array)', () => {
  test('maps old names, keeps unknown ones as custom, removes old fields, renames lastAiProfiledAt', async () => {
    const col = WorkerProfile.collection;
    const user = new mongoose.Types.ObjectId();
    const when = new Date('2026-10-01T00:00:00Z');
    await col.insertOne({
      user, workerIdCode: 'DLM-2026-7777', category: 'electrical_solar',
      skills: ['Residential & Commercial Wiring', 'Glass fitting'],
      categorizedSkills: [{ skillName: 'Solar Panel & Inverter Installation', category: 'Electrical & Solar', confidenceScore: 89, source: 'AI-Extracted' }],
      recommendedSkills: [{ skillName: 'x' }], skillStrengthScore: 40, aiSkillSummary: 'old', experienceTierBadge: 'old', toolsAndEquipment: [],
      lastAiProfiledAt: when,
    });
    expect(await migrateSkills({ apply: false })).toMatchObject({ checked: 1, mappedToTaxonomy: 2, keptAsCustom: 1 });
    await migrateSkills({ apply: true });
    const doc = await col.findOne({ user });
    expect(doc.skills.map((s) => [s.skillId, s.custom])).toEqual([
      ['elec_wiring', false], ['custom-glass-fitting', true], ['elec_solar', false],
    ]);
    for (const f of ['categorizedSkills', 'recommendedSkills', 'skillStrengthScore', 'aiSkillSummary', 'experienceTierBadge', 'toolsAndEquipment', 'lastAiProfiledAt']) {
      expect(doc[f]).toBeUndefined();
    }
    expect(doc.lastExtractedAt).toEqual(when);
    // The migrated document loads in Mongoose without errors.
    expect((await WorkerProfile.findOne({ user })).skills).toHaveLength(3);
    expect(await migrateSkills({ apply: false })).toMatchObject({ checked: 0 });
  });
});
