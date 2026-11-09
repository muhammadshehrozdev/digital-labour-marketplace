// Phase 2 (M1-12): when MongoDB cannot be reached, /api routes answer 503 with a
// clear message instead of continuing and failing later with an unclear 500.
// MONGO_URI in tests points at a closed port, and no in-memory DB is started here.
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('database unavailable', () => {
  test('an /api route -> 503 "Service temporarily unavailable"', async () => {
    const original = console.error;
    console.error = () => {};
    const res = await request(createApp()).get('/api/auth/me');
    console.error = original;
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/temporarily unavailable/);
  });

  test('/api/health still answers and reports the database state', async () => {
    const res = await request(createApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.db).not.toBe('connected');
  });
});
