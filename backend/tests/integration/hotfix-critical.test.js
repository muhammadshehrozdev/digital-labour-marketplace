// Regression tests for the two Critical holes fixed by the Phase 0B hotfix (M1-1, M1-2).
// Phase 3 rewrote them to run against the real app and an in-memory MongoDB (never Atlas),
// using the new routes. The original assertions are kept.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

import { createApp } from '../../app.js';
import User from '../../models/User.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, uniqueEmail, GOOD_PASSWORD } from '../helpers/api.js';

let app;
beforeAll(async () => {
  await startTestDb();
  app = createApp();
});
afterAll(stopTestDb);

const newUser = () => ({
  name: 'Test Person',
  email: uniqueEmail('hotfix'),
  password: GOOD_PASSWORD,
  phone: '03001234567',
});

describe('M1-1: public registration cannot create an admin', () => {
  test('role "admin" -> 400 and no user is created', async () => {
    const body = { ...newUser(), role: 'admin' };
    const res = await api(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Role must be worker or customer');
    expect(await User.countDocuments({ role: 'admin' })).toBe(0);
  });

  test('worker, customer and "no role" still register (no regression)', async () => {
    for (const [sent, expected] of [['worker', 'worker'], ['customer', 'customer'], [undefined, 'worker']]) {
      const res = await api(app).post('/api/auth/register').send({ ...newUser(), role: sent });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe(expected);
    }
  });
});

describe('M1-2: worker directory sends only safe fields', () => {
  test('a worker calling GET /api/workers -> 403', async () => {
    const res = await api(app).post('/api/auth/register').send(newUser());
    const cookie = res.headers['set-cookie'][0].split(';')[0];
    expect((await api(app, cookie).get('/api/workers')).status).toBe(403);
  });

  test('a customer gets no CNIC, address, emergency contact, WhatsApp, phone or email', async () => {
    const w = await api(app).post('/api/auth/register').send({ ...newUser(), name: 'Ali Worker', phone: '03001112222' });
    const workerCookie = w.headers['set-cookie'][0].split(';')[0];
    await api(app, workerCookie).put('/api/workers/me').send({
      occupation: 'Electrician', cnicNumber: '37405-1234567-1', address: 'House 1, Street 2, G-10',
      emergencyContact: '03111111111', whatsappNumber: '03222222222',
    });
    const c = await api(app).post('/api/auth/register').send({ ...newUser(), role: 'customer' });
    const customerCookie = c.headers['set-cookie'][0].split(';')[0];

    const res = await api(app, customerCookie).get('/api/workers');
    expect(res.status).toBe(200);
    const w0 = res.body.workers[0];
    for (const secret of ['cnicNumber', 'cnicEncrypted', 'cnicHash', 'address', 'emergencyContact', 'whatsappNumber', 'rawExperienceText']) {
      expect(w0[secret], `${secret} must not be sent`).toBeUndefined();
    }
    expect(w0.user).toEqual({ name: 'Ali Worker' }); // D-002: phone removed too
    expect(w0.occupation).toBe('Electrician');
  });
});
