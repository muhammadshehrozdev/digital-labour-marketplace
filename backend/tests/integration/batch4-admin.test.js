// Batch 4 admin tools (server side): overview charts, audit-chain check, CSV exports,
// reason templates. Synthetic people only. In-memory MongoDB.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

import { createApp } from '../../app.js';
import AuditLog from '../../models/AuditLog.js';
import ReasonTemplate from '../../models/ReasonTemplate.js';
import { STARTER_TEMPLATES } from '../../config/reasonTemplates.js';
import { TEMPLATE_KINDS } from '../../models/ReasonTemplate.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';
import { jpeg } from '../helpers/images.js';

let app;
let adminCookie;
let worker;
let customer;
let evidenceId;

const CNIC = '37405-9988776-5';
const CNIC_DIGITS = '3740599887765';

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  const email = uniqueEmail('admin');
  await createAdminAccount({ name: 'Tools Admin (synthetic)', email, phone: '03009998888', password: GOOD_PASSWORD });
  adminCookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
  customer = await registerUser(app, { role: 'customer', name: 'Export Customer (synthetic)' });
  worker = await registerUser(app, { name: '=HYPERLINK("http://evil.example","Click") Worker' }); // a name that tries CSV formula injection
  const saved = await api(app, worker.cookie).put('/api/workers/me').send({
    occupation: 'Electrician', category: 'electrical_solar', experienceYears: 7, dailyRate: 3500, city: 'Islamabad', address: 'Street 9, Secret Colony', cnicNumber: CNIC,
  });
  worker.profileId = saved.body.profile._id;
  worker.workerIdCode = saved.body.profile.workerIdCode;
  await api(app, worker.cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring', 'elec_solar'], addedVia: 'manual' });
  const up = await api(app, worker.cookie).post('/api/evidence').field('skillId', 'elec_wiring').field('type', 'certificate').field('consent', 'true')
    .attach('image', await jpeg(9001), { filename: 'c.jpg', contentType: 'image/jpeg' });
  evidenceId = up.body.evidence._id;
});
afterAll(stopTestDb);

const get = (url, cookie = adminCookie) => api(app, cookie).get(url);

describe('overview charts (feature 27, 28)', () => {
  test('admin only', async () => {
    expect((await get('/api/admin/charts', worker.cookie)).status).toBe(403);
    expect((await get('/api/admin/charts', customer.cookie)).status).toBe(403);
    expect((await api(app).get('/api/admin/charts')).status).toBe(401);
  });

  test('real counts: registrations per day (every day present), queues, decisions, skills by category', async () => {
    const res = await get('/api/admin/charts?days=14');
    expect(res.status).toBe(200);
    expect(res.body.days).toBe(14);
    expect(res.body.timezone).toBe('Asia/Karachi');
    expect(res.body.registrations).toHaveLength(14);
    const dates = res.body.registrations.map((d) => d.date);
    expect([...dates].sort()).toEqual(dates); // oldest to newest
    expect(new Set(dates).size).toBe(14);
    const today = res.body.registrations.at(-1);
    expect(today).toMatchObject({ worker: 1, customer: 1 }); // the admin is not a registration
    expect(res.body.registrations.slice(0, -1).every((d) => d.worker === 0 && d.customer === 0)).toBe(true);
    expect(res.body.identity.counts).toEqual({ Unverified: 0, Pending: 1, Verified: 0, Rejected: 0 });
    expect(res.body.identity.waiting).toMatchObject({ under1Day: 1, days1to3: 0, days4to7: 0, over7Days: 0 });
    expect(res.body.identity.waiting.oldest).toBeTruthy();
    expect(res.body.evidence.counts).toEqual({ pending: 1, approved: 0, rejected: 0, suspected_fake: 0, revoked: 0 });
    expect(res.body.evidence.waiting.under1Day).toBe(1);
    const electrical = res.body.skillsByCategory.find((c) => c.category === 'electrical_solar');
    expect(electrical.count).toBe(2);
    expect(res.body.skillsByCategory).toHaveLength(9);
    expect(res.body.skillsByCategory.filter((c) => c.category !== 'electrical_solar').every((c) => c.count === 0)).toBe(true);
  });

  test('days must be a whole number from 7 to 90', async () => {
    expect((await get('/api/admin/charts')).body.days).toBe(30);
    for (const bad of ['3', '500', 'abc', '-1']) expect((await get(`/api/admin/charts?days=${bad}`)).status, bad).toBe(400);
  });
});

describe('audit-chain status (feature 32)', () => {
  test('intact chain -> ok with the number of entries; admin only', async () => {
    const res = await get('/api/admin/audit/verify');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.count).toBe(await AuditLog.countDocuments());
    expect(res.body.checkedAt).toBeTruthy();
    expect((await get('/api/admin/audit/verify', worker.cookie)).status).toBe(403);
  });

  test('a changed entry is reported with its number (raw database edit, as an attacker would)', async () => {
    const victim = await AuditLog.findOne().sort({ seq: 1 }).lean();
    await mongoose.connection.db.collection('auditlogs').updateOne({ _id: victim._id }, { $set: { reason: 'changed by hand' } });
    const res = await get('/api/admin/audit/verify');
    expect(res.body).toMatchObject({ ok: false, badSeq: victim.seq, problemCode: 'content_changed' });
    await mongoose.connection.db.collection('auditlogs').updateOne({ _id: victim._id }, { $set: { reason: victim.reason } }); // put it back
    expect((await get('/api/admin/audit/verify')).body.ok).toBe(true);
  });
});

describe('CSV exports (feature 31)', () => {
  const KINDS = ['audit', 'identity', 'evidence', 'users'];

  test.each(KINDS)('%s: admin only', async (kind) => {
    expect((await get(`/api/admin/exports/${kind}`, worker.cookie)).status).toBe(403);
    expect((await get(`/api/admin/exports/${kind}`, customer.cookie)).status).toBe(403);
    expect((await api(app).get(`/api/admin/exports/${kind}`)).status).toBe(401);
  });

  test.each(KINDS)('%s: a CSV file download that never contains the CNIC, the address or a password', async (kind) => {
    const res = await get(`/api/admin/exports/${kind}?status=all`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.headers['content-disposition']).toMatch(new RegExp(`^attachment; filename="dlm-${kind}-\\d{4}-\\d{2}-\\d{2}\\.csv"$`));
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.text.charCodeAt(0)).toBe(0xfeff); // UTF-8 mark for Excel
    expect(res.text).not.toContain(CNIC);
    expect(res.text).not.toContain(CNIC_DIGITS);
    expect(res.text).not.toContain('Secret Colony');
    expect(res.text).not.toMatch(/\$2[aby]\$/);
    expect(Number(res.headers['x-export-rows'])).toBeGreaterThan(0);
  });

  test('every download is written to the audit log first, with the kind, row count and filters', async () => {
    const before = await AuditLog.countDocuments({ action: 'export.downloaded' });
    const res = await get('/api/admin/exports/identity?status=Pending');
    const entries = await AuditLog.find({ action: 'export.downloaded' }).sort({ seq: -1 }).lean();
    expect(entries.length).toBe(before + 1);
    expect(entries[0]).toMatchObject({ targetType: 'Export', targetId: 'identity', actorRole: 'admin' });
    expect(entries[0].details).toMatchObject({ kind: 'identity', rows: Number(res.headers['x-export-rows']), filters: { status: 'Pending' } });
  });

  test('identity export: the queue columns, one row for the pending worker', async () => {
    const res = await get('/api/admin/exports/identity');
    const [header, row] = res.text.replace('﻿', '').trim().split('\r\n');
    expect(header).toBe('worker_id,name,occupation,category,city,identity_status,cnic_on_file,requested_at_utc,reviewed_at_utc,note');
    expect(row).toContain(worker.workerIdCode);
    expect(row).toContain(',Electrician,electrical_solar,Islamabad,Pending,yes,');
  });

  test('formula injection: a name that starts with "=" is neutralised with a leading apostrophe', async () => {
    const res = await get('/api/admin/exports/users');
    expect(res.text).toContain(`"'=HYPERLINK(""http://evil.example"",""Click"") Worker"`);
    expect(res.text).not.toMatch(/(^|,)=HYPERLINK/m);
  });

  test('audit export: hashes included, filters work, and a CNIC typed into an old note is removed', async () => {
    // an old entry written before notes were checked for CNIC numbers (inserted the normal way)
    const { writeAudit } = await import('../../services/audit.js');
    await writeAudit({ action: 'test.legacy', reason: `Old note with ${CNIC} inside` });
    const res = await get('/api/admin/exports/audit?action=test.legacy');
    const lines = res.text.replace('﻿', '').trim().split('\r\n');
    expect(lines[0]).toBe('seq,time_utc,actor,actor_role,action,target_type,target_id,from_state,to_state,reason,prev_hash,hash');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Old note with [CNIC removed] inside');
    expect(lines[1]).toMatch(/[a-f0-9]{64},[a-f0-9]{64}$/);
    const none = await get('/api/admin/exports/audit?from=2001-01-01&to=2001-01-02');
    expect(none.text.replace('﻿', '').trim().split('\r\n')).toHaveLength(1); // header only
  });

  test('evidence export has no image data, only facts about the item', async () => {
    const res = await get('/api/admin/exports/evidence');
    expect(res.text).toContain(`${evidenceId},${worker.workerIdCode},`);
    expect(res.text).toContain(',House wiring,certificate,pending,');
    expect(res.text).not.toMatch(/sha256|dhash|fileId/);
  });

  test('bad requests', async () => {
    expect((await get('/api/admin/exports/passwords')).body.code).toBe('EXPORT_KIND_UNKNOWN');
    expect((await get('/api/admin/exports/audit?from=yesterday')).body.code).toBe('DATE_INVALID');
    expect((await get('/api/admin/exports/users?fields=password')).body.code).toBe('UNKNOWN_FIELD');
    expect((await get('/api/admin/exports/users?status[$ne]=x')).status).toBe(400);
  });
});

describe('reason templates (feature 29)', () => {
  const post = (body, cookie = adminCookie) => api(app, cookie).post('/api/admin/reason-templates').send(body);
  let id;

  test('admin only', async () => {
    expect((await get('/api/admin/reason-templates', worker.cookie)).status).toBe(403);
    expect((await post({ kind: 'identity_reject', text: { en: 'Not allowed to add this' } }, customer.cookie)).status).toBe(403);
  });

  test('the starter set has every kind in three languages, and no CNIC-like numbers', () => {
    expect(new Set(STARTER_TEMPLATES.map((t) => t.kind))).toEqual(new Set(TEMPLATE_KINDS));
    for (const t of STARTER_TEMPLATES) {
      for (const lang of ['en', 'ur', 'ur-Latn']) expect(t.text[lang].length, `${t.kind} ${lang}`).toBeGreaterThan(10);
      expect(JSON.stringify(t)).not.toMatch(/\d{5}/);
    }
  });

  test('empty at first; "add the starter set" fills it once and is safe to press again', async () => {
    expect((await get('/api/admin/reason-templates')).body.templates).toEqual([]);
    const first = await api(app, adminCookie).post('/api/admin/reason-templates/starter-set');
    expect(first.status).toBe(201);
    expect(first.body.added).toBe(STARTER_TEMPLATES.length);
    const second = await api(app, adminCookie).post('/api/admin/reason-templates/starter-set');
    expect(second.status).toBe(200);
    expect(second.body.added).toBe(0);
    expect(await ReasonTemplate.countDocuments()).toBe(STARTER_TEMPLATES.length);
    expect(await AuditLog.countDocuments({ action: 'template.starter_set' })).toBe(1);
  });

  test('filter by kind', async () => {
    const res = await get('/api/admin/reason-templates?kind=user_suspend');
    expect(res.body.templates.length).toBe(2);
    expect(res.body.templates.every((t) => t.kind === 'user_suspend')).toBe(true);
    expect(Object.keys(res.body.templates[0].text).sort()).toEqual(['en', 'ur', 'ur-Latn']);
    expect((await get('/api/admin/reason-templates?kind=jokes')).body.code).toBe('TEMPLATE_KIND_INVALID');
  });

  test('create, edit and delete; each change is audited', async () => {
    const made = await post({ kind: 'identity_reject', text: { en: 'The photo on the card is not this person.', ur: 'کارڈ کی تصویر اس شخص کی نہیں ہے۔' } });
    expect(made.status).toBe(201);
    id = made.body.template._id;
    expect(made.body.template.text).toEqual({ en: 'The photo on the card is not this person.', ur: 'کارڈ کی تصویر اس شخص کی نہیں ہے۔', 'ur-Latn': '' });

    const edited = await api(app, adminCookie).patch(`/api/admin/reason-templates/${id}`).send({ text: { en: 'The photo on the card shows another person.', 'ur-Latn': 'Card ki tasveer kisi aur ki hai.' } });
    expect(edited.status).toBe(200);
    expect(edited.body.template.text).toEqual({ en: 'The photo on the card shows another person.', ur: '', 'ur-Latn': 'Card ki tasveer kisi aur ki hai.' });

    const gone = await api(app, adminCookie).delete(`/api/admin/reason-templates/${id}`);
    expect(gone.body).toEqual({ deleted: true });
    expect((await api(app, adminCookie).delete(`/api/admin/reason-templates/${id}`)).body.code).toBe('TEMPLATE_NOT_FOUND');
    expect((await api(app, adminCookie).patch(`/api/admin/reason-templates/${id}`).send({ text: { en: 'Too late for this one' } })).body.code).toBe('TEMPLATE_NOT_FOUND');
    for (const action of ['template.created', 'template.updated', 'template.deleted']) {
      expect(await AuditLog.countDocuments({ action, targetId: id }), action).toBe(1);
    }
  });

  test('validation: English text needed, no CNIC numbers, kind cannot be changed, unknown keys refused', async () => {
    const cases = [
      [{ kind: 'identity_reject', text: { ur: 'صرف اردو' } }, 'TEXT_MUST_BE_TEXT'],
      [{ kind: 'identity_reject', text: { en: 'abc' } }, 'TEMPLATE_TEXT_REQUIRED'],
      [{ kind: 'identity_reject', text: { en: `CNIC ${CNIC} does not match` } }, 'NOTE_HAS_CNIC'],
      [{ kind: 'nonsense', text: { en: 'A good long sentence' } }, 'TEMPLATE_KIND_INVALID'],
      [{ kind: 'identity_reject', text: { en: 'A good long sentence', fr: 'Bonjour' } }, 'UNKNOWN_FIELD'],
      [{ kind: 'identity_reject', text: { en: 'x'.repeat(301) } }, 'TEXT_TOO_LONG'],
    ];
    for (const [body, code] of cases) {
      const res = await post(body);
      expect(res.status, JSON.stringify(body).slice(0, 60)).toBe(400);
      expect(res.body.errors.map((e) => e.code)).toContain(code);
    }
    const anyId = (await get('/api/admin/reason-templates')).body.templates[0]._id;
    const kindChange = await api(app, adminCookie).patch(`/api/admin/reason-templates/${anyId}`).send({ kind: 'user_suspend', text: { en: 'Trying to change the kind' } });
    expect(kindChange.body.code).toBe('UNKNOWN_FIELD');
  });

  test('there is a limit on the number of templates', async () => {
    const { MAX_TEMPLATES } = await import('../../models/ReasonTemplate.js');
    const missing = MAX_TEMPLATES - (await ReasonTemplate.countDocuments());
    await ReasonTemplate.insertMany(Array.from({ length: missing }, (_, i) => ({ kind: 'evidence_reject', text: { en: `Filler template number ${i}` } })));
    const res = await post({ kind: 'evidence_reject', text: { en: 'One more than the limit' } });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('TEMPLATE_LIMIT');
  });
});
