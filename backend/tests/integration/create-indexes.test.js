// npm run db:indexes on an empty database: every unique index exists afterwards; running it twice
// changes nothing. The real script, on a private in-memory MongoDB (asynchronous run, see demo-reset).
import { spawn } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

function run(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/createIndexes.js'], { env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

describe('npm run db:indexes', () => {
  let mongo;
  let uri;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uri = `${mongo.getUri()}fresh_production_like`;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  test('builds the unique indexes on an empty database, and a second run is harmless', async () => {
    for (let i = 0; i < 2; i += 1) {
      const result = await run({ MONGO_URI: uri });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toMatch(/All indexes are in place/);
    }
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const unique = async (collection, field) => (await db.collection(collection).indexes()).some((i) => i.unique && i.key[field] === 1);
    expect(await unique('users', 'email')).toBe(true);
    expect(await unique('auditlogs', 'seq')).toBe(true);
    expect(await unique('workerprofiles', 'workerIdCode')).toBe(true);
    expect(await db.collection('users').countDocuments()).toBe(0); // no data written
  }, 120000);
});
