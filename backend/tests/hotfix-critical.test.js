// Phase 0B regression tests for the two Critical holes (M1-1, M1-2).
// Runner: Node's built-in `node:test` (no extra packages). Run in .\backend:  node --test
//
// The real Express routes, middleware and controllers run on a temporary port.
// The database is replaced by fakes (no MongoDB, never Atlas), so these tests
// prove the controller and route logic, not real database behaviour.
// Real-database tests come in Phase 3 (mongodb-memory-server).

import { describe, test, before, after, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';

import authRoutes from '../routes/authRoutes.js';
import workerRoutes from '../routes/workerRoutes.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';

process.env.JWT_SECRET = 'test-only-secret-0123456789-abcdefghijklmnop';

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/worker', workerRoutes);
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

afterEach(() => mock.restoreAll());

const postJson = (path, body) =>
  fetch(baseUrl + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ---------------------------------------------------------------- M1-1
describe('M1-1: public registration cannot create an admin', () => {
  const newUser = {
    name: 'Test Person',
    email: 'test.person@example.com',
    password: 'long-enough-password',
    phone: '03001234567',
  };

  test('role "admin" -> 400 and no user is created', async () => {
    mock.method(User, 'findOne', async () => null);
    const create = mock.method(User, 'create', async (doc) => ({ _id: 'u1', ...doc }));

    const res = await postJson('/api/auth/register', { ...newUser, role: 'admin' });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.message, 'Role must be worker or customer');
    assert.equal(create.mock.callCount(), 0, 'User.create must not be called');
  });

  test('worker, customer and "no role" still register (no regression)', async () => {
    mock.method(User, 'findOne', async () => null);
    mock.method(User, 'create', async (doc) => ({ _id: 'u2', ...doc }));

    const cases = [
      { sent: 'worker', expected: 'worker' },
      { sent: 'customer', expected: 'customer' },
      { sent: undefined, expected: 'worker' },
    ];
    for (const { sent, expected } of cases) {
      const res = await postJson('/api/auth/register', { ...newUser, role: sent });
      const body = await res.json();
      assert.equal(res.status, 201, `role ${sent} should register`);
      assert.equal(body.role, expected);
    }
  });
});

// ---------------------------------------------------------------- M1-2
// A full worker profile as stored in the database, including private fields.
const storedProfile = {
  _id: 'p1',
  workerIdCode: 'DLM-2026-1234',
  occupation: 'Electrician',
  category: 'Electrical & Solar',
  skills: ['House Wiring'],
  experienceYears: 6,
  hourlyRate: 800,
  dailyRate: 5000,
  city: 'Islamabad',
  availability: 'Available',
  verificationStatus: 'Pending',
  bio: 'Wiring and solar work.',
  cnicNumber: '37405-1234567-1',
  address: 'House 1, Street 2, G-10',
  emergencyContact: '03111111111',
  whatsappNumber: '03222222222',
  rawExperienceText: 'private free text',
  user: {
    _id: 'u9',
    name: 'Ali Worker',
    phone: '03001112222',
    email: 'ali.worker@example.com',
    role: 'worker',
    password: '$2b$10$hash',
  },
};

// Fake Mongoose query: records .select() and .populate(), then imitates how
// MongoDB applies them (keeps only the named fields, plus _id). If the
// controller forgets .select(), the fake returns every field and the test fails.
function fakeWorkerQuery(docs) {
  let fields = null;
  let userFields = null;
  const pick = (obj, keys) =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => k === '_id' || keys.includes(k)));
  const query = {
    select(f) {
      fields = f.split(/\s+/);
      return query;
    },
    populate(path, f) {
      if (path === 'user') userFields = f.split(/\s+/);
      return query;
    },
    sort() {
      return query;
    },
    then(resolve, reject) {
      const out = docs.map((d) => {
        const p = fields ? pick(d, fields) : { ...d };
        if (p.user && userFields) p.user = pick(d.user, userFields);
        return p;
      });
      return Promise.resolve(out).then(resolve, reject);
    },
  };
  return query;
}

// Log in as a fake user with the given role (protect() looks the user up by id).
function authHeaderFor(role) {
  mock.method(User, 'findById', () => ({
    select: async () => ({ _id: `id-${role}`, name: `A ${role}`, role }),
  }));
  const token = jwt.sign({ id: `id-${role}`, role }, process.env.JWT_SECRET);
  return { Authorization: `Bearer ${token}` };
}

describe('M1-2: worker directory sends only safe fields', () => {
  test('a worker calling GET /api/worker/all -> 403', async () => {
    const find = mock.method(WorkerProfile, 'find', () => fakeWorkerQuery([storedProfile]));
    const res = await fetch(`${baseUrl}/api/worker/all`, { headers: authHeaderFor('worker') });

    assert.equal(res.status, 403);
    assert.equal(find.mock.callCount(), 0, 'the database must not be queried');
  });

  for (const role of ['customer', 'admin']) {
    test(`a ${role} gets no CNIC, address, emergency contact, WhatsApp or email`, async () => {
      mock.method(WorkerProfile, 'find', () => fakeWorkerQuery([storedProfile]));
      const res = await fetch(`${baseUrl}/api/worker/all`, { headers: authHeaderFor(role) });
      const workers = await res.json();

      assert.equal(res.status, 200);
      assert.equal(workers.length, 1);
      const w = workers[0];
      for (const secret of ['cnicNumber', 'address', 'emergencyContact', 'whatsappNumber', 'rawExperienceText']) {
        assert.equal(w[secret], undefined, `${secret} must not be sent`);
      }
      assert.equal(w.user.email, undefined, 'email must not be sent');
      assert.equal(w.user.password, undefined, 'password must not be sent');
      // Still useful: what the customer page shows (team decision: phone stays).
      assert.equal(w.user.name, 'Ali Worker');
      assert.equal(w.user.phone, '03001112222');
      assert.equal(w.occupation, 'Electrician');
      assert.equal(w.workerIdCode, 'DLM-2026-1234');
    });
  }
});
