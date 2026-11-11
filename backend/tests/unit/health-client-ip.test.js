// The one-off check after deployment (docs/DEPLOY-RUNBOOK.md): with SHOW_CLIENT_IP=1, /api/health also
// shows the caller their own IP as the server sees it. Own file: the setting is read once at start.
import { describe, expect, test } from 'vitest';
import request from 'supertest';

process.env.SHOW_CLIENT_IP = '1';
const { createApp } = await import('../../app.js');

describe('SHOW_CLIENT_IP=1', () => {
  test('the caller sees only their own address as the server sees it', async () => {
    const res = await request(createApp()).get('/api/health').set('X-Forwarded-For', '203.0.113.7').set('X-Real-IP', '203.0.113.7');
    expect(res.status).toBe(200);
    expect(res.body.client).toMatchObject({ forwardedFor: '203.0.113.7', realIp: '203.0.113.7' });
    expect(typeof res.body.client.ip).toBe('string');
    expect(Object.keys(res.body).sort()).toEqual(['client', 'db', 'ok']); // nothing else is added
  });
});
