// M1-10: failed login/register attempts from one IP are limited (here: 3 per 15 minutes,
// set low for the test; the real default is 10). Successful logins are not counted.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, GOOD_PASSWORD } from '../helpers/api.js';

let app;
beforeAll(async () => {
  process.env.AUTH_RATE_LIMIT = '3';
  const { createApp } = await import('../../app.js');
  await startTestDb();
  app = createApp();
});
afterAll(stopTestDb);

describe('auth rate limit', () => {
  test('after 3 failed attempts the 4th gets 429 with a clear message and RateLimit headers', async () => {
    const { user } = await registerUser(app); // success: not counted
    for (let i = 0; i < 3; i += 1) {
      const res = await api(app).post('/api/auth/login').send({ email: user.email, password: 'definitely the wrong one' });
      expect(res.status).toBe(401);
    }
    const blocked = await api(app).post('/api/auth/login').send({ email: user.email, password: GOOD_PASSWORD });
    expect(blocked.status).toBe(429);
    expect(blocked.body.message).toMatch(/Too many failed attempts/);
    expect(blocked.headers['ratelimit-policy'] || blocked.headers.ratelimit).toBeDefined();
  });
});
