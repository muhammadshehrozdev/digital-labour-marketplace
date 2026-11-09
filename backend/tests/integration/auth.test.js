// Phase 3: registration, login, sessions, logout, lockout, CSRF, admin creation.
// Audit IDs: M1-1, M1-5, M1-10, M1-11, M1-14.
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { createApp } from '../../app.js';
import User from '../../models/User.js';
import AuditLog from '../../models/AuditLog.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { LOGIN_FAILED } from '../../controllers/authController.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD, ORIGIN } from '../helpers/api.js';

let app;
beforeAll(async () => {
  await startTestDb();
  app = createApp();
});
afterAll(stopTestDb);

const validBody = () => ({
  name: 'Ali Raza',
  email: uniqueEmail('reg'),
  password: GOOD_PASSWORD,
  phone: '0300 1234567',
});

describe('M1-1: public registration cannot create an admin', () => {
  test('role "admin" -> 400 "Role must be worker or customer" and no user is created', async () => {
    const body = { ...validBody(), role: 'admin' };
    const res = await api(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Role must be worker or customer');
    expect(await User.exists({ email: body.email })).toBeNull();
  });

  test('worker, customer and "no role" register (no role -> worker)', async () => {
    for (const [sent, expected] of [['worker', 'worker'], ['customer', 'customer'], [undefined, 'worker']]) {
      const res = await api(app).post('/api/auth/register').send({ ...validBody(), role: sent });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe(expected);
    }
  });

  test('createAdminAccount (the create-admin script) is the way to make an admin, and it is audited', async () => {
    const result = await createAdminAccount({
      name: 'Script Admin', email: uniqueEmail('admin'), phone: '03001112222', password: GOOD_PASSWORD,
    });
    expect(result.ok).toBe(true);
    expect((await User.findById(result.id)).role).toBe('admin');
    const entry = await AuditLog.findOne({ action: 'admin.created', targetId: result.id });
    expect(entry).not.toBeNull();
  });

  test('createAdminAccount refuses a short password and an existing email', async () => {
    const email = uniqueEmail('admin2');
    expect((await createAdminAccount({ name: 'A Admin', email, phone: '03001112222', password: 'short' })).ok).toBe(false);
    await createAdminAccount({ name: 'A Admin', email, phone: '03001112222', password: GOOD_PASSWORD });
    const again = await createAdminAccount({ name: 'A Admin', email, phone: '03001112222', password: GOOD_PASSWORD });
    expect(again.ok).toBe(false);
    expect(again.message).toMatch(/already exists/);
  });
});

describe('M1-5: server-side validation -> 400 with a message, never 500', () => {
  test.each([
    ['no body', undefined, /body is required/i],
    ['missing email', { name: 'Ali Raza', password: GOOD_PASSWORD, phone: '03001234567' }, /email/i],
    ['email "abc"', { ...validBody(), email: 'abc' }, /Email address is not valid/],
    ['1-character password', { ...validBody(), password: 'x' }, /at least 15 characters/],
    ['14-character password', { ...validBody(), password: 'abcdefghijklmn' }, /at least 15 characters/],
    ['password over 72 bytes', { ...validBody(), password: 'a'.repeat(73) }, /too long/],
    ['Urdu password over 72 bytes (37 letters x 2 bytes)', { ...validBody(), password: 'ب'.repeat(37) }, /too long/],
    ['blank name', { ...validBody(), name: '   ' }, /Name must be at least 2/],
    ['non-string name', { ...validBody(), name: 12345 }, /name/],
    ['phone "hello"', { ...validBody(), phone: 'hello' }, /Pakistani mobile/],
    ['unknown extra field', { ...validBody(), isAdmin: true }, /Unrecognized key/],
  ])('register with %s -> 400', async (_label, body, message) => {
    const req = api(app).post('/api/auth/register');
    const res = body === undefined ? await req : await req.send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
  });

  test('a 15-character passphrase with spaces is accepted', async () => {
    const res = await api(app).post('/api/auth/register').send({ ...validBody(), password: 'mera ghar pyara' });
    expect(res.status).toBe(201);
  });

  test('duplicate email (any letter case) -> 409', async () => {
    const body = validBody();
    expect((await api(app).post('/api/auth/register').send(body)).status).toBe(201);
    const res = await api(app).post('/api/auth/register').send({ ...body, email: body.email.toUpperCase() });
    expect(res.status).toBe(409);
  });

  test.each([
    ['object as email', { email: { $ne: 'x' }, password: 'whatever' }],
    ['no password', { email: 'a@example.com' }],
    ['array as password', { email: 'a@example.com', password: ['a'] }],
  ])('login with %s -> 400', async (_label, body) => {
    const res = await api(app).post('/api/auth/login').send(body);
    expect(res.status).toBe(400);
  });
});

describe('M1-14: user schema', () => {
  test('email is stored lower-case and trimmed; password hashed with bcrypt cost 12 and never returned', async () => {
    const email = uniqueEmail('Case');
    const res = await api(app).post('/api/auth/register').send({ ...validBody(), email: `  ${email.toUpperCase()} ` });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email.toLowerCase());
    expect(res.body.password).toBeUndefined();

    const plain = await User.findOne({ email: email.toLowerCase() }).lean();
    expect(plain.password).toBeUndefined(); // select: false
    const withPw = await User.findOne({ email: email.toLowerCase() }).select('+password').lean();
    expect(withPw.password.startsWith('$2b$12$')).toBe(true);
  });
});

describe('login (M1-10, M1-11)', () => {
  test('wrong password -> 401 with the generic message; unknown email -> the same message', async () => {
    const { user } = await registerUser(app);
    const wrong = await api(app).post('/api/auth/login').send({ email: user.email, password: 'not the right password' });
    const unknown = await api(app).post('/api/auth/login').send({ email: uniqueEmail('nobody'), password: 'not the right password' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(LOGIN_FAILED);
    expect(unknown.body.message).toBe(LOGIN_FAILED);
  });

  test('correct login sets an HttpOnly, Secure, SameSite=Strict cookie and returns no token or password', async () => {
    const { user } = await registerUser(app);
    const res = await api(app).post('/api/auth/login').send({ email: user.email, password: GOOD_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.password).toBeUndefined();
    const raw = res.headers['set-cookie'].find((c) => c.startsWith('dlm_session='));
    expect(raw).toMatch(/HttpOnly/i);
    expect(raw).toMatch(/Secure/i);
    expect(raw).toMatch(/SameSite=Strict/i);
    expect(raw).toMatch(/Path=\/api/);
  });

  test('the token is HS256 with issuer, audience and an 8-hour expiry', async () => {
    const { cookie } = await registerUser(app);
    const token = cookie.split('=')[1];
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload.iss).toBe('dlm-api');
    expect(decoded.payload.aud).toBe('dlm-web');
    expect(decoded.payload.exp - decoded.payload.iat).toBe(8 * 60 * 60);
  });

  test('GET /api/auth/me works with the cookie and returns only safe fields', async () => {
    const { cookie, user } = await registerUser(app);
    const res = await api(app, cookie).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(['_id', 'email', 'name', 'phone', 'preferredLanguage', 'role']);
    expect(res.body.email).toBe(user.email);
  });

  test('no cookie, a forged token, an expired token, or an "alg: none" token -> 401', async () => {
    const { user } = await registerUser(app);
    const secret = process.env.JWT_SECRET;
    const base = { subject: user._id, issuer: 'dlm-api', audience: 'dlm-web' };
    const forged = jwt.sign({ role: 'admin', tv: 0 }, 'some-other-secret-that-is-long-enough', base);
    const expired = jwt.sign({ role: 'worker', tv: 0, exp: Math.floor(Date.now() / 1000) - 10 }, secret, base);
    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(
      JSON.stringify({ sub: user._id, tv: 0, iss: 'dlm-api', aud: 'dlm-web' })
    ).toString('base64url')}.`;
    const wrongAudience = jwt.sign({ role: 'worker', tv: 0 }, secret, { ...base, audience: 'someone-else' });

    expect((await api(app).get('/api/auth/me')).status).toBe(401);
    for (const token of [forged, expired, none, wrongAudience]) {
      const res = await api(app, `dlm_session=${token}`).get('/api/auth/me');
      expect(res.status).toBe(401);
    }
  });

  test('logout works on the server: the old cookie stops working (tokenVersion)', async () => {
    const { cookie } = await registerUser(app);
    expect((await api(app, cookie).get('/api/auth/me')).status).toBe(200);
    const out = await api(app, cookie).post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect(out.headers['set-cookie'].join(';')).toMatch(/dlm_session=;/);
    expect((await api(app, cookie).get('/api/auth/me')).status).toBe(401);
  });

  test('account lockout: 5 wrong passwords -> even the right password fails for 15 minutes', async () => {
    const { user } = await registerUser(app);
    for (let i = 0; i < 5; i += 1) {
      const res = await api(app).post('/api/auth/login').send({ email: user.email, password: `wrong password number ${i}` });
      expect(res.status).toBe(401);
    }
    const locked = await api(app).post('/api/auth/login').send({ email: user.email, password: GOOD_PASSWORD });
    expect(locked.status).toBe(401);
    expect(locked.body.message).toBe(LOGIN_FAILED);

    const stored = await User.findById(user._id).lean();
    expect(stored.lockUntil.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);

    // When the lock time has passed, the right password works again and the counter resets.
    await User.updateOne({ _id: user._id }, { $set: { lockUntil: new Date(Date.now() - 1000) } });
    const ok = await api(app).post('/api/auth/login').send({ email: user.email, password: GOOD_PASSWORD });
    expect(ok.status).toBe(200);
    expect((await User.findById(user._id).lean()).lockUntil).toBeNull();
  });
});

describe('CSRF check on state-changing requests (D-006)', () => {
  test('POST from another website (Origin not allowed) -> 403, even with a valid cookie', async () => {
    const { cookie } = await registerUser(app);
    const res = await request(app).post('/api/auth/logout').set('Origin', 'https://evil.example').set('Cookie', cookie);
    expect(res.status).toBe(403);
    expect((await api(app, cookie).get('/api/auth/me')).status).toBe(200); // not logged out
  });

  test('no Origin but Sec-Fetch-Site: cross-site -> 403', async () => {
    const res = await request(app).post('/api/auth/login').set('Sec-Fetch-Site', 'cross-site').send({});
    expect(res.status).toBe(403);
  });

  test('our own origin passes; GET requests are not checked', async () => {
    expect((await request(app).post('/api/auth/login').set('Origin', ORIGIN).send({})).status).toBe(400);
    expect((await request(app).get('/api/meta/taxonomy').set('Origin', 'https://evil.example')).status).toBe(200);
  });
});

describe('register logs the new user in', () => {
  test('register sets the session cookie', async () => {
    const res = await api(app).post('/api/auth/register').send(validBody());
    expect(sessionCookie(res)).toMatch(/^dlm_session=/);
  });
});

describe('accounts created before Phase 3 (no tokenVersion / lockout fields)', () => {
  test('can log in, stay logged in, and logout still cancels the old cookie', async () => {
    const bcrypt = (await import('bcryptjs')).default;
    const email = uniqueEmail('legacy');
    // Exactly how an old account looks in the database: no tokenVersion, failedLoginCount, lockUntil.
    await User.collection.insertOne({
      name: 'Old Account', email, phone: '03001234567', role: 'worker',
      password: await bcrypt.hash('old short pw', 10), createdAt: new Date(), updatedAt: new Date(),
    });
    const login = await api(app).post('/api/auth/login').send({ email, password: 'old short pw' });
    expect(login.status).toBe(200);
    const cookie = sessionCookie(login);
    expect((await api(app, cookie).get('/api/auth/me')).status).toBe(200);
    expect((await api(app, cookie).post('/api/auth/logout')).status).toBe(200);
    expect((await api(app, cookie).get('/api/auth/me')).status).toBe(401);
  });
});
