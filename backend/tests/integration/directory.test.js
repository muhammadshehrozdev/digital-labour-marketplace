// Phase 3: public worker directory and public profile.
// Audit IDs: M1-2 (safe fields), M1-3 (regex), M1-4 (operator injection), D-002 (no phone).
import { describe, test, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';

import { createApp } from '../../app.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api, registerUser } from '../helpers/api.js';

const PRIVATE_KEYS = ['cnicNumber', 'cnicEncrypted', 'cnicHash', 'address', 'emergencyContact', 'email', 'phone', 'whatsappNumber', 'password', 'rawExperienceText'];

// Collects every key name anywhere inside a JSON value.
function allKeys(value, keys = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, keys));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      allKeys(v, keys);
    }
  }
  return keys;
}

let app;
let customer;
let worker;
let workerCode;

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  customer = await registerUser(app, { role: 'customer' });
  worker = await registerUser(app, { name: 'Ali Worker', phone: '03001112222' });
  const res = await api(app, worker.cookie).put('/api/workers/me').send({
    occupation: 'C++ Electrician',
    category: 'electrical_solar',
    skills: ['House Wiring'],
    experienceYears: 6,
    hourlyRate: 800,
    city: 'Islamabad',
    address: 'House 1, Street 2, G-10',
    emergencyContact: '03111111111',
    whatsappNumber: '03222222222',
    cnicNumber: '37405-1234567-1',
    bio: 'Wiring (and solar) work.',
    workHistory: [{ jobTitle: 'Wiring', clientOrEmployer: 'Private client name', duration: '1 week', description: 'Done' }],
  });
  workerCode = res.body.profile.workerIdCode;
  // A second worker in another trade and city.
  const other = await registerUser(app);
  await api(app, other.cookie).put('/api/workers/me').send({ occupation: 'Plumber', category: 'plumbing_sanitary', city: 'Lahore' });
});
afterAll(stopTestDb);
afterEach(() => vi.restoreAllMocks());

describe('GET /api/workers (directory)', () => {
  test('a worker calling the directory -> 403, and the database is not queried (M1-2)', async () => {
    const find = vi.spyOn(WorkerProfile, 'find');
    const res = await api(app, worker.cookie).get('/api/workers');
    expect(res.status).toBe(403);
    expect(find).not.toHaveBeenCalled();
  });

  test('not logged in -> 401', async () => {
    expect((await api(app).get('/api/workers')).status).toBe(401);
  });

  test('a customer gets no CNIC, address, emergency contact, WhatsApp, email or phone anywhere (M1-2, D-002)', async () => {
    const res = await api(app, customer.cookie).get('/api/workers');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    const keys = allKeys(res.body);
    for (const key of PRIVATE_KEYS) expect(keys.has(key), `${key} must not be sent`).toBe(false);
    const text = JSON.stringify(res.body);
    for (const secret of ['03001112222', '03222222222', '03111111111', 'G-10', '3740512345671', '@example.com']) {
      expect(text).not.toContain(secret);
    }
    const ali = res.body.workers.find((w) => w.workerIdCode === workerCode);
    expect(ali.user).toEqual({ name: 'Ali Worker' });
    expect(ali.occupation).toBe('C++ Electrician');
  });

  test('search "C++" and "(" -> 200, matched literally (M1-3)', async () => {
    const plus = await api(app, customer.cookie).get('/api/workers').query({ search: 'C++' });
    expect(plus.status).toBe(200);
    expect(plus.body.workers.map((w) => w.workerIdCode)).toEqual([workerCode]);
    const paren = await api(app, customer.cookie).get('/api/workers').query({ search: '(' });
    expect(paren.status).toBe(200);
    expect(paren.body.workers).toHaveLength(1); // the bio "(and solar)"
    const star = await api(app, customer.cookie).get('/api/workers').query({ search: '.*' });
    expect(star.status).toBe(200);
    expect(star.body.workers).toHaveLength(0); // ".*" is text, not "match everything"
  });

  test('search over 50 characters -> 400 (M1-3)', async () => {
    const res = await api(app, customer.cookie).get('/api/workers').query({ search: 'a'.repeat(51) });
    expect(res.status).toBe(400);
  });

  test.each([
    ['category[$ne]=x', '/api/workers?category[$ne]=x'],
    ['search[]=a', '/api/workers?search[]=a'],
    ['repeated key (becomes an array)', '/api/workers?category=electrical_solar&category=plumbing_sanitary'],
    ['city[$regex]=.*', '/api/workers?city[$regex]=.*'],
    ['unknown category', '/api/workers?category=Rocket'],
    ['page=abc', '/api/workers?page=abc'],
    ['limit=1000', '/api/workers?limit=1000'],
  ])('%s -> 400 and nothing reaches MongoDB (M1-4)', async (_label, url) => {
    const find = vi.spyOn(WorkerProfile, 'find');
    const res = await api(app, customer.cookie).get(url);
    expect(res.status).toBe(400);
    expect(find).not.toHaveBeenCalled();
  });

  test('filters by category, city and identity; paginates', async () => {
    const byCat = await api(app, customer.cookie).get('/api/workers').query({ category: 'plumbing_sanitary' });
    expect(byCat.body.workers.map((w) => w.occupation)).toEqual(['Plumber']);
    const byCity = await api(app, customer.cookie).get('/api/workers').query({ city: 'lahore' });
    expect(byCity.body.total).toBe(1);
    const verified = await api(app, customer.cookie).get('/api/workers').query({ identity: 'verified' });
    expect(verified.body.total).toBe(0); // nobody has been verified by an admin yet
    const page2 = await api(app, customer.cookie).get('/api/workers').query({ limit: '1', page: '2' });
    expect(page2.body).toMatchObject({ page: 2, limit: 1, total: 2 });
    expect(page2.body.workers).toHaveLength(1);
  });
});

describe('GET /api/workers/:workerIdCode (public profile)', () => {
  test('a customer sees the public profile, with work history but no private fields or client name', async () => {
    const res = await api(app, customer.cookie).get(`/api/workers/${workerCode}`);
    expect(res.status).toBe(200);
    const keys = allKeys(res.body);
    for (const key of [...PRIVATE_KEYS, 'clientOrEmployer']) expect(keys.has(key), `${key} must not be sent`).toBe(false);
    expect(res.body.workHistory[0]).toMatchObject({ jobTitle: 'Wiring', duration: '1 week' });
    expect(JSON.stringify(res.body)).not.toContain('03001112222');
  });

  test('bad ID format -> 400; unknown ID -> 404; worker -> 403', async () => {
    expect((await api(app, customer.cookie).get('/api/workers/hello')).status).toBe(400);
    expect((await api(app, customer.cookie).get('/api/workers/DLM-2026-999999')).status).toBe(404);
    expect((await api(app, worker.cookie).get(`/api/workers/${workerCode}`)).status).toBe(403);
  });
});
