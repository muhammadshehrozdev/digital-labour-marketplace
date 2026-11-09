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
