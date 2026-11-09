// Phase 2: backend foundation (app/server split, env check, errors, CORS, 503, health).
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import mongoose from 'mongoose';

import { createApp } from '../../app.js';
import { loadEnv } from '../../config/env.js';
import { errorHandler, notFound, GENERIC_500 } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validate.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';

const ORIGIN = 'http://127.0.0.1:5173';

describe('config/env.js (M1-12: fail fast on bad settings)', () => {
  const good = {
    MONGO_URI: 'mongodb://127.0.0.1:27017/x',
    JWT_SECRET: 'x'.repeat(32),
    CLIENT_ORIGIN: 'http://127.0.0.1:5173, http://localhost:5173',
    CNIC_ENC_KEY: Buffer.alloc(32, 1).toString('base64'),
    CNIC_HASH_KEY: Buffer.alloc(32, 2).toString('base64'),
  };

  test('accepts good settings and splits CLIENT_ORIGIN into a list', () => {
    const env = loadEnv(good);
    expect(env.CLIENT_ORIGIN).toEqual(['http://127.0.0.1:5173', 'http://localhost:5173']);
    expect(env.PORT).toBe(5000);
    expect(env.HOST).toBe('127.0.0.1');
  });

  test.each([
    ['MONGO_URI missing', { MONGO_URI: undefined }, 'MONGO_URI'],
    ['JWT_SECRET too short', { JWT_SECRET: 'short' }, 'JWT_SECRET'],
    ['CLIENT_ORIGIN with a path', { CLIENT_ORIGIN: 'http://127.0.0.1:5173/app' }, 'CLIENT_ORIGIN'],
    ['CNIC_ENC_KEY wrong length', { CNIC_ENC_KEY: 'abc' }, 'CNIC_ENC_KEY'],
  ])('%s -> clear error that names the variable', (_name, change, varName) => {
    expect(() => loadEnv({ ...good, ...change })).toThrow(varName);
  });

  test.each(['JWT_SECRET', 'CNIC_ENC_KEY'])('a bad %s value is never printed in the error', (varName) => {
    const secret = 'short-secret-xyz'; // too short for JWT_SECRET, wrong length for a key
    expect(() => loadEnv({ ...good, [varName]: secret })).toThrow(varName);
    try {
      loadEnv({ ...good, [varName]: secret });
    } catch (err) {
      expect(err.message).not.toContain(secret);
    }
  });

  test('the two CNIC keys must be different', () => {
    expect(() => loadEnv({ ...good, CNIC_HASH_KEY: good.CNIC_ENC_KEY })).toThrow('different');
  });
});

describe('error handling (M1-7, M1-13)', () => {
  test('error handler hides internal error messages on a 500', async () => {
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret internal detail: connection string mongodb://user:pass@host');
    });
    app.use(errorHandler);
    const original = console.error;
    console.error = () => {}; // keep the expected log out of the test output
    const res = await request(app).get('/boom');
    console.error = original;
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: GENERIC_500 });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });

  test('async errors (Express 5) also reach the handler', async () => {
    const app = express();
    app.get('/boom', async () => {
      await Promise.resolve();
      throw new Error('async secret');
    });
    app.use(notFound, errorHandler);
    const original = console.error;
    console.error = () => {};
    const res = await request(app).get('/boom');
    console.error = original;
    expect(res.status).toBe(500);
    expect(res.body.message).toBe(GENERIC_500);
  });

  test('validate(): a POST with no body -> 400, not 500', async () => {
    const app = express();
    app.use(express.json());
    app.post('/thing', validate(z.object({ name: z.string() }).strict()), (req, res) =>
      res.json(req.validated.body)
    );
    app.use(errorHandler);
    const res = await request(app).post('/thing');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/body is required/i);
  });

  test('validate(): bad JSON -> 400 with a clear message', async () => {
    const app = express();
    app.use(express.json());
    app.post('/thing', (req, res) => res.json({}));
    app.use(errorHandler);
    const res = await request(app).post('/thing').set('Content-Type', 'application/json').send('{"name":');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not valid JSON/);
  });
});

describe('the real app with an in-memory MongoDB', () => {
  let app;
  beforeAll(async () => {
    await startTestDb();
    app = createApp();
  });
  afterAll(stopTestDb);

  test('GET /api/health -> { ok: true, db: "connected" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, db: 'connected' });
  });

  test('unknown route -> 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Route not found' });
  });

  test('routes are mounted once: old /auth and /worker paths are gone (M1-13)', async () => {
    expect((await request(app).post('/auth/login').send({})).status).toBe(404);
    expect((await request(app).get('/worker/all')).status).toBe(404);
  });

  test('CORS: our origin gets Access-Control-Allow-Origin', async () => {
    const res = await request(app).get('/api/health').set('Origin', ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });

  test('CORS: an unknown origin gets no Access-Control-Allow-Origin header (M1-10)', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('security headers from helmet are present (M1-10)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  test('JSON bodies over 100 kb -> 413', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: 'a@b.co', password: 'x'.repeat(110 * 1024) });
    expect(res.status).toBe(413);
  });

  test('sanitizeFilter is on (M1-4: operator objects are treated as data)', () => {
    expect(mongoose.get('sanitizeFilter')).toBe(true);
  });
});
