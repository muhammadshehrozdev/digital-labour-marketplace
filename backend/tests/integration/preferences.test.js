// Batch 3: session endpoint, preferred language, and the full "My profile" endpoint.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

import { createApp } from '../../app.js';
import User from '../../models/User.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';
import { jpeg } from '../helpers/images.js';

let app;
let adminCookie;
beforeAll(async () => {
  await startTestDb();
  app = createApp();
  const email = uniqueEmail('admin');
  await createAdminAccount({ name: 'Prefs Admin', email, phone: '03009998887', password: GOOD_PASSWORD });
  adminCookie = sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD }));
});
afterAll(stopTestDb);

describe('GET /api/auth/session', () => {
  test('a visitor gets 200 { user: null } (no 401 in the browser console)', async () => {
    const res = await api(app).get('/api/auth/session');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('a broken or forged cookie also gets { user: null }, and the cookie is removed', async () => {
    const res = await api(app, 'dlm_session=not-a-real-token').get('/api/auth/session');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
    expect((res.headers['set-cookie'] || []).join(';')).toMatch(/dlm_session=;/);
  });

  test('a logged-in user gets only their own safe fields, with preferredLanguage', async () => {
    const { cookie } = await registerUser(app, { role: 'customer' });
    const res = await api(app, cookie).get('/api/auth/session');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.user).sort()).toEqual(['_id', 'email', 'name', 'phone', 'preferredLanguage', 'role']);
    expect(res.body.user.preferredLanguage).toBeNull(); // not chosen yet
    expect(JSON.stringify(res.body)).not.toMatch(/password|tokenVersion|failedLogin|lockUntil/);
  });

  test('after logout the old cookie gives { user: null }', async () => {
    const { cookie } = await registerUser(app);
    await api(app, cookie).post('/api/auth/logout');
    const res = await api(app, cookie).get('/api/auth/session');
    expect(res.body).toEqual({ user: null });
  });
});

describe('preferred language', () => {
  test('register can save the language chosen before registering', async () => {
    const { cookie, user } = await registerUser(app, { preferredLanguage: 'ur' });
    expect(user.preferredLanguage).toBe('ur');
    expect((await api(app, cookie).get('/api/auth/session')).body.user.preferredLanguage).toBe('ur');
  });

  test('register rejects an unknown language with code LANGUAGE_INVALID', async () => {
    const res = await api(app)
      .post('/api/auth/register')
      .send({ name: 'Lang Test', email: uniqueEmail(), password: GOOD_PASSWORD, phone: '03001234567', preferredLanguage: 'fr' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('LANGUAGE_INVALID');
  });

  test.each(['en', 'ur', 'ur-Latn'])('PATCH /api/users/me/preferences saves "%s"', async (lang) => {
    const { cookie, user } = await registerUser(app);
    const res = await api(app, cookie).patch('/api/users/me/preferences').send({ preferredLanguage: lang });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ preferredLanguage: lang });
    expect((await User.findById(user._id).lean()).preferredLanguage).toBe(lang);
    expect((await api(app, cookie).get('/api/auth/session')).body.user.preferredLanguage).toBe(lang);
  });

  test('works for customers and admins too', async () => {
    const { cookie } = await registerUser(app, { role: 'customer' });
    expect((await api(app, cookie).patch('/api/users/me/preferences').send({ preferredLanguage: 'ur-Latn' })).status).toBe(200);
    expect((await api(app, adminCookie).patch('/api/users/me/preferences').send({ preferredLanguage: 'ur' })).status).toBe(200);
  });

  test('bad input is rejected with 400 and a code', async () => {
    const { cookie } = await registerUser(app);
    const cases = [
      [{ preferredLanguage: 'urdu' }, 'LANGUAGE_INVALID'],
      [{ preferredLanguage: { $ne: 'en' } }, 'LANGUAGE_INVALID'],
      [{}, 'LANGUAGE_INVALID'],
      [{ preferredLanguage: 'en', role: 'admin' }, 'UNKNOWN_FIELD'],
    ];
    for (const [body, code] of cases) {
      const res = await api(app, cookie).patch('/api/users/me/preferences').send(body);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(res.body.errors.map((e) => e.code)).toContain(code);
    }
    // The role was not changed by the extra field.
    expect((await api(app, cookie).get('/api/auth/session')).body.user.role).toBe('worker');
  });

  test('needs a login, and is blocked from another website (CSRF)', async () => {
    expect((await api(app).patch('/api/users/me/preferences').send({ preferredLanguage: 'ur' })).status).toBe(401);
    const { cookie } = await registerUser(app);
    const res = await request(app)
      .patch('/api/users/me/preferences')
      .set('Origin', 'https://evil.example')
      .set('Cookie', cookie)
      .send({ preferredLanguage: 'ur' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CSRF_BLOCKED');
  });
});

describe('GET /api/workers/me/full (read-only "My profile", D-020)', () => {
  const profile = {
    occupation: 'Electrician',
    category: 'electrical_solar',
    experienceYears: 6,
    dailyRate: 5000,
    city: 'Islamabad',
    address: 'Sector G-10 house 1',
    whatsappNumber: '03007654321',
    emergencyContact: 'Brother 03111111111',
    cnicNumber: '35202-9876543-1',
    bio: 'Wiring and solar work.',
    workHistory: [{ jobTitle: 'House wiring', clientOrEmployer: 'Mr. Client G-10', duration: '2 weeks', description: 'New house' }],
  };

  test('the owner gets profile, proof items, onboarding and the exact public view', async () => {
    const w = await registerUser(app, { name: 'Full Profile Worker' });
    await api(app, w.cookie).put('/api/workers/me').send(profile);
    await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds: ['elec_wiring'], addedVia: 'manual' });
    const up = await api(app, w.cookie)
      .post('/api/evidence')
      .field('skillId', 'elec_wiring')
      .field('type', 'work_photo')
      .field('consent', 'true')
      .attach('image', await jpeg(901), { filename: 'p.jpg', contentType: 'image/jpeg' });
    expect(up.status).toBe(201);

    const res = await api(app, w.cookie).get('/api/workers/me/full');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const { profile: own, evidence, publicView, listedInDirectory, onboarding } = res.body;

    // Owner part: private fields are there for the owner, the CNIC only as "on file".
    expect(own.address).toBe(profile.address);
    expect(own.emergencyContact).toBe(profile.emergencyContact);
    expect(own.cnicOnFile).toBe(true);
    expect(JSON.stringify(res.body)).not.toMatch(/35202|9876543|cnicEncrypted|cnicHash/);
    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({ skillId: 'elec_wiring', status: 'pending' });
    expect(evidence[0]).not.toHaveProperty('fileId');
    expect(evidence[0]).not.toHaveProperty('sha256');
    expect(listedInDirectory).toBe(true);
    expect(onboarding.steps).toBeTruthy();

    // Public part: exactly what a customer/admin gets from the public endpoint.
    const asAdmin = await api(app, adminCookie).get(`/api/workers/${own.workerIdCode}`);
    expect(publicView).toEqual(asAdmin.body);
    const publicText = JSON.stringify(publicView);
    for (const secret of ['03007654321', '03001234567', 'Sector G-10', 'Brother', 'Mr. Client', '@example.com', 'cnic']) {
      expect(publicText).not.toContain(secret);
    }
  });

  test('a worker without a profile gets 404 PROFILE_NOT_CREATED; customers get 403', async () => {
    const w = await registerUser(app);
    const none = await api(app, w.cookie).get('/api/workers/me/full');
    expect(none.status).toBe(404);
    expect(none.body.code).toBe('PROFILE_NOT_CREATED');
    const c = await registerUser(app, { role: 'customer' });
    expect((await api(app, c.cookie).get('/api/workers/me/full')).status).toBe(403);
    expect((await api(app).get('/api/workers/me/full')).status).toBe(401);
  });

  test('listedInDirectory is false until the "Your work" step is saved', async () => {
    const w = await registerUser(app);
    await api(app, w.cookie).put('/api/workers/me').send({ city: 'Rawalpindi' });
    const res = await api(app, w.cookie).get('/api/workers/me/full');
    expect(res.status).toBe(200);
    expect(res.body.listedInDirectory).toBe(false);
  });
});
