// The demo reset script (npm run demo:reset): only a local "_demo" database, and afterwards exactly the
// three synthetic demo accounts. Runs the real script against a private in-memory MongoDB.
import { spawn } from 'node:child_process';

// Asynchronous on purpose: a synchronous run would freeze this process, and the in-memory MongoDB
// (whose log this process reads) would stop answering.
function run(args, env, input = '') {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/resetDemo.js', ...args], { env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
    child.stdin.end(input);
  });
}
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { checkDemoUri, DEFAULT_DEMO_URI } from '../../scripts/resetDemo.js';

describe('demo reset: which databases it accepts', () => {
  test('only a local database whose name ends in _demo', () => {
    expect(checkDemoUri(DEFAULT_DEMO_URI)).toBeNull();
    expect(checkDemoUri('mongodb://localhost:27017/rehearsal_demo')).toBeNull();
    expect(checkDemoUri('mongodb://127.0.0.1:27017/dlm_local_preview')).toMatch(/_demo/); // the team's own preview data
    expect(checkDemoUri('mongodb+srv://user:pw@cluster0.example.mongodb.net/dlm_demo')).toMatch(/local/); // Atlas
    expect(checkDemoUri('mongodb://10.0.0.5:27017/dlm_demo')).toMatch(/local/);
    expect(checkDemoUri('mongodb://127.0.0.1:27017/')).toMatch(/local/);
    expect(checkDemoUri(undefined)).toMatch(/local/);
  });
});

describe('demo reset: the real script', () => {
  let mongo;
  let uri;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uri = `${mongo.getUri()}reset_test_demo`;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  const reset = () => run(['--yes'], { DEMO_MONGO_URI: uri });

  test('wipes everything and leaves exactly the three demo accounts (twice in a row)', async () => {
    await mongoose.connect(uri);
    await mongoose.connection.db.collection('users').insertOne({ email: 'left.over@example.com', role: 'customer' });
    await mongoose.disconnect();

    for (let run = 1; run <= 2; run += 1) {
      const result = await reset();
      expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
      expect(result.stdout).toMatch(/Clean demo state ready/);
    }

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}, { projection: { email: 1, role: 1 } }).sort({ email: 1 }).toArray();
    expect(users.map((u) => [u.email, u.role])).toEqual([
      ['admin.demo@example.com', 'admin'],
      ['customer.demo@example.com', 'customer'],
      ['worker.demo@example.com', 'worker'],
    ]);
    expect(await db.collection('workerprofiles').countDocuments()).toBe(1);
    // the admin came from the create-admin script, which audits it
    expect(await db.collection('auditlogs').countDocuments({ action: 'admin.created' })).toBe(1);
    // indexes are back (unique email)
    const indexes = await db.collection('users').indexes();
    expect(indexes.some((i) => i.unique && i.key.email === 1)).toBe(true);
    await mongoose.disconnect();
  }, 120000);

  test('without --yes and without a terminal it changes nothing', async () => {
    const result = await run([], { DEMO_MONGO_URI: uri });
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Nothing was changed/);
  });

  test('refuses the preview database', async () => {
    const result = await run(['--yes'], { DEMO_MONGO_URI: 'mongodb://127.0.0.1:27017/dlm_local_preview' });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/Refusing to run/);
  });
});
