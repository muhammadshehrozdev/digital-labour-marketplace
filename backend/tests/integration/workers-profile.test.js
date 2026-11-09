// Phase 3: the worker's own profile. Audit IDs: M1-6, M1-8, M1-15 (backend), CNIC (D-007).
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';

import { createApp } from '../../app.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import { nextWorkerIdCode, karachiYear } from '../../services/workerId.js';
import { decryptCnic } from '../../services/cnic.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser } from '../helpers/api.js';

let app;
beforeAll(async () => {
  await startTestDb();
  app = createApp();
});
afterAll(stopTestDb);

const goodProfile = {
  occupation: 'Electrician',
  category: 'electrical_solar',
  skills: ['House Wiring', 'Solar Panel'],
  experienceYears: 6,
  hourlyRate: 800,
  dailyRate: 5000,
  city: 'Islamabad',
  address: 'Sector G-10',
  whatsappNumber: '0300 7654321',
  emergencyContact: 'Brother Ahmed 03111111111',
  languages: ['Urdu', 'Punjabi'],
  availability: 'Available',
  bio: 'Wiring and solar work for houses.',
  workHistory: [
    { jobTitle: 'House wiring', clientOrEmployer: 'G-10 house', duration: '2 weeks', description: 'Full wiring of a new house' },
  ],
};

describe('PUT /api/workers/me', () => {
  test('saves a full profile, including emergency contact, languages and work-history duration/description (M1-15)', async () => {
    const { cookie } = await registerUser(app);
    const res = await api(app, cookie).put('/api/workers/me').send(goodProfile);
    expect(res.status).toBe(200);
    const p = res.body.profile;
    expect(p.emergencyContact).toBe('Brother Ahmed 03111111111');
    expect(p.languages).toEqual(['Urdu', 'Punjabi']);
    expect(p.workHistory[0]).toMatchObject({ duration: '2 weeks', description: 'Full wiring of a new house' });
    expect(p.whatsappNumber).toBe('03007654321');
    expect(p.verificationStatus).toBe('Unverified'); // no CNIC yet
    expect(p.workerIdCode).toMatch(new RegExp(`^DLM-${karachiYear()}-\\d{6}$`));

    const again = await api(app, cookie).get('/api/workers/me');
    expect(again.status).toBe(200);
    expect(again.body.emergencyContact).toBe('Brother Ahmed 03111111111');
  });

  test.each([
    ['negative hourly rate', { hourlyRate: -500 }, /cannot be negative/],
    ['negative experience', { experienceYears: -3 }, /cannot be negative/],
    ['experience over 60', { experienceYears: 61 }, /60 years or less/],
    ['experience 2.5', { experienceYears: 2.5 }, /whole years/],
    ['rate as text', { hourlyRate: '800' }, /must be a number/],
    ['CNIC "abc"', { cnicNumber: 'abc' }, /12345-1234567-1/],
    ['empty occupation', { occupation: '' }, /at least 2/],
    ['invalid availability', { availability: 'Sleeping' }, /Available, Busy or Offline/],
    ['unknown category', { category: 'Rocket Science' }, /listed trades/],
    ['old category label', { category: 'Electrical & Solar' }, /listed trades/],
    ['setting verificationStatus', { verificationStatus: 'Verified' }, /Unrecognized key/],
    ['setting workerIdCode', { workerIdCode: 'DLM-2026-000001' }, /Unrecognized key/],
    ['object as city', { city: { $ne: 'x' } }, /City must be text/],
    ['31 skills', { skills: Array.from({ length: 31 }, (_, i) => `Skill ${i}`) }, /At most 30/],
  ])('%s -> 400 (M1-6)', async (_label, body, message) => {
    const { cookie } = await registerUser(app);
    const res = await api(app, cookie).put('/api/workers/me').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
  });

  test('no body -> 400; customer -> 403; not logged in -> 401', async () => {
    const worker = await registerUser(app);
    const customer = await registerUser(app, { role: 'customer' });
    expect((await api(app, worker.cookie).put('/api/workers/me')).status).toBe(400);
    expect((await api(app, customer.cookie).put('/api/workers/me').send({ city: 'Lahore' })).status).toBe(403);
    expect((await api(app).put('/api/workers/me').send({ city: 'Lahore' })).status).toBe(401);
  });
});

describe('CNIC (decision D-007: encrypted + hashed, never returned)', () => {
  test('saved encrypted, never in any response, status becomes Pending, change is audited without the number', async () => {
    const { cookie, user } = await registerUser(app);
    const res = await api(app, cookie).put('/api/workers/me').send({ ...goodProfile, cnicNumber: '61101-1234567-3' });
    expect(res.status).toBe(200);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('6110112345673');
    expect(text).not.toContain('61101-1234567-3');
    expect(res.body.profile.cnicOnFile).toBe(true);
    expect(res.body.profile.cnicEncrypted).toBeUndefined();
    expect(res.body.profile.cnicHash).toBeUndefined();
    expect(res.body.profile.verificationStatus).toBe('Pending');

    const me = await api(app, cookie).get('/api/workers/me');
    expect(JSON.stringify(me.body)).not.toContain('6110112345673');

    const stored = await WorkerProfile.findOne({ user: user._id }).select('+cnicEncrypted +cnicHash').lean();
    expect(stored.cnicEncrypted).not.toContain('6110112345673');
    expect(decryptCnic(stored.cnicEncrypted, user._id)).toBe('6110112345673');

    const entry = await AuditLog.findOne({ action: 'cnic.updated', targetId: String(stored._id) }).lean();
    expect(entry).toMatchObject({ fromState: 'Unverified', toState: 'Pending', actorRole: 'worker' });
    expect(JSON.stringify(entry)).not.toContain('6110112345673');
  });

  test('the same CNIC on a second account -> 409', async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);
    expect((await api(app, a.cookie).put('/api/workers/me').send({ cnicNumber: '61101-7654321-5' })).status).toBe(200);
    const res = await api(app, b.cookie).put('/api/workers/me').send({ cnicNumber: '6110176543215' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already linked/);
  });

  test('saving the same CNIC again does not reset an identity decision', async () => {
    const { cookie, user } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ cnicNumber: '61101-1111111-1' });
    await WorkerProfile.updateOne({ user: user._id }, { $set: { verificationStatus: 'Verified' } });
    const res = await api(app, cookie).put('/api/workers/me').send({ cnicNumber: '61101-1111111-1', city: 'Lahore' });
    expect(res.body.profile.verificationStatus).toBe('Verified');
  });

  test('an old plain-text cnicNumber left in the database is never sent to the owner', async () => {
    const { cookie, user } = await registerUser(app);
    await api(app, cookie).put('/api/workers/me').send({ city: 'Karachi' });
    await WorkerProfile.collection.updateOne({ user: new mongoose.Types.ObjectId(user._id) }, { $set: { cnicNumber: '42101-9999999-9' } });
    const res = await api(app, cookie).get('/api/workers/me');
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('9999999');
  });
});

describe('worker ID from an atomic counter (M1-8)', () => {
  test('200 profiles created in a loop get 200 unique IDs in the DLM-<year>-<6 digits> format', async () => {
    const ids = new Set();
    for (let i = 0; i < 200; i += 1) {
      const p = await WorkerProfile.create({ user: new mongoose.Types.ObjectId() });
      expect(p.workerIdCode).toMatch(/^DLM-\d{4}-\d{6}$/);
      ids.add(p.workerIdCode);
    }
    expect(ids.size).toBe(200);
  });

  test('50 profiles created at the same moment still get 50 unique IDs', async () => {
    const created = await Promise.all(
      Array.from({ length: 50 }, () => WorkerProfile.create({ user: new mongoose.Types.ObjectId() }))
    );
    expect(new Set(created.map((p) => p.workerIdCode)).size).toBe(50);
  });

  test('the year comes from the date in Pakistan (Asia/Karachi)', async () => {
    // 31 Dec 2026 20:00 UTC is already 1 Jan 2027 01:00 in Karachi.
    expect(await nextWorkerIdCode(new Date('2026-12-31T20:00:00Z'))).toMatch(/^DLM-2027-000001$/);
  });
});

describe('old category labels are converted (M1-16)', () => {
  test('a saved profile with the label "Electrical & Solar" becomes "electrical_solar"', async () => {
    const p = await WorkerProfile.create({ user: new mongoose.Types.ObjectId(), category: 'Electrical & Solar' });
    expect(p.category).toBe('electrical_solar');
  });
});
