// Go-live kit (docs/DEPLOY-RUNBOOK.md): the production settings check, the Vercel files, and the
// function entry. Nothing here talks to Vercel or Atlas.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import request from 'supertest';
import { loadEnv } from '../../config/env.js';

const root = resolve(import.meta.dirname, '../..');
const json = (file) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));

const PROD = {
  NODE_ENV: 'production',
  MONGO_URI: 'mongodb+srv://user:pw@cluster0.example.mongodb.net/dlm_production',
  JWT_SECRET: 'x'.repeat(48),
  CLIENT_ORIGIN: 'https://digital-labour-web.vercel.app',
  CNIC_ENC_KEY: Buffer.alloc(32, 1).toString('base64'),
  CNIC_HASH_KEY: Buffer.alloc(32, 2).toString('base64'),
  TRUST_PROXY: '1',
};

describe('production settings: the server refuses to start with a clear message', () => {
  test('a complete production configuration is accepted', () => {
    expect(loadEnv(PROD)).toMatchObject({ NODE_ENV: 'production', TRUST_PROXY: 1, SHOW_CLIENT_IP: '0' });
  });

  test.each([
    ['MONGO_URI'], ['JWT_SECRET'], ['CLIENT_ORIGIN'], ['CNIC_ENC_KEY'], ['CNIC_HASH_KEY'],
  ])('%s missing -> "missing (required)" and where to fix it on Vercel', (key) => {
    const { [key]: _gone, ...rest } = PROD;
    expect(() => loadEnv(rest)).toThrow(`${key}: missing (required)`);
    expect(() => loadEnv(rest)).toThrow(/will not start.*on Vercel: Project -> Settings -> Environment Variables/s);
  });

  test.each([
    ['TRUST_PROXY not set', { TRUST_PROXY: undefined }, 'TRUST_PROXY: missing'],
    ['the local database', { MONGO_URI: 'mongodb://127.0.0.1:27017/dlm_local_preview' }, 'MONGO_URI: points at this computer'],
    ['localhost with a user', { MONGO_URI: 'mongodb://u:p@localhost:27017/x' }, 'MONGO_URI: points at this computer'],
    ['an http origin', { CLIENT_ORIGIN: 'https://ok.vercel.app,http://127.0.0.1:5173' }, 'CLIENT_ORIGIN: the live site accepts https://'],
  ])('%s -> refused', (_name, change, message) => {
    expect(() => loadEnv({ ...PROD, ...change })).toThrow(message);
  });

  test('on Vercel production, NODE_ENV must be production', () => {
    const { NODE_ENV: _n, ...rest } = PROD;
    expect(() => loadEnv({ ...rest, VERCEL_ENV: 'production' })).toThrow('NODE_ENV: must be "production"');
  });

  test('a secret value is never printed, even in a production error', () => {
    const secret = 'a-very-secret-but-short';
    try {
      loadEnv({ ...PROD, JWT_SECRET: secret, TRUST_PROXY: undefined });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.message).toMatch(/JWT_SECRET/);
      expect(err.message).not.toContain(secret);
    }
  });

  test('local development keeps working without the production rules', () => {
    expect(() => loadEnv({ ...PROD, NODE_ENV: 'development', MONGO_URI: 'mongodb://127.0.0.1:27017/x', CLIENT_ORIGIN: 'http://127.0.0.1:5173', TRUST_PROXY: undefined })).not.toThrow();
  });
});

describe('Vercel files', () => {
  test('backend: one function for every path, no legacy "builds", only public/ served as files', () => {
    const config = json('vercel.json');
    expect(config.builds).toBeUndefined();
    expect(config.routes).toBeUndefined();
    expect(config).toMatchObject({ framework: null, outputDirectory: 'public', installCommand: 'npm ci --omit=dev' });
    expect(config.rewrites).toEqual([{ source: '/(.*)', destination: '/api' }]);
    expect(existsSync(resolve(root, 'public/robots.txt'))).toBe(true);
    expect(existsSync(resolve(root, 'api/index.js'))).toBe(true);
    expect(json('package.json').engines.node).toBe('24.x');
  });

  test('frontend: /api goes to the backend over https first, then every other path to the app', () => {
    const config = JSON.parse(readFileSync(resolve(root, '../frontend/vercel.json'), 'utf8'));
    expect(config.framework).toBe('vite');
    const [api, spa, ...rest] = config.rewrites;
    expect(rest).toEqual([]);
    expect(api.source).toBe('/api/:path*');
    expect(api.destination).toMatch(/^https:\/\/[a-z0-9-]+\.vercel\.app\/api\/:path\*$/);
    expect(spa).toEqual({ source: '/(.*)', destination: '/index.html' });
  });
});

describe('the Vercel function entry', () => {
  afterEach(() => {
    delete process.env.VERCEL;
  });

  test('exports the real Express app (and does not listen on a port on Vercel)', async () => {
    process.env.VERCEL = '1'; // as on Vercel: server.js only builds the app
    const { default: app } = await import('../../api/index.js');
    expect(typeof app).toBe('function');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.client).toBeUndefined(); // the IP check is off by default
  });
});
