// Module 4 demo data (scripts/seedModule4Demo.js, run by preview.sh demo / reset-demo): only a local
// "_demo" database; afterwards bookings in every state and outcome, an open dispute, a confirmed
// no-show, a flag, workers with no / few / some / many reviews, and everything marked synthetic.
import { spawn } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

function run(script, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, ...(script.endsWith('resetDemo.js') ? ['--yes'] : [])], { env: { ...process.env, ...env } });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (status) => resolve({ status, out }));
    child.stdin.end('');
  });
}

describe('Module 4 demo seed', () => {
  let mongo;
  let uri;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uri = `${mongo.getUri()}module4_test_demo`;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  test('refuses any database that is not a local *_demo one', async () => {
    for (const bad of ['mongodb+srv://u:p@cluster0.example.mongodb.net/dlm_demo', 'mongodb://127.0.0.1:27017/dlm_local_preview']) {
      const result = await run('scripts/seedModule4Demo.js', { DEMO_MONGO_URI: bad });
      expect(result.status).toBe(1);
      expect(result.out).toMatch(/Refusing to run/);
    }
  });

  test('after the reset: every state and outcome, one open dispute, one confirmed no-show, a flag; all synthetic; a second run adds nothing', async () => {
    const reset = await run('scripts/resetDemo.js', { DEMO_MONGO_URI: uri });
    expect(reset.status, reset.out).toBe(0);
    const first = await run('scripts/seedModule4Demo.js', { DEMO_MONGO_URI: uri });
    expect(first.status, first.out).toBe(0);
    expect(first.out).toMatch(/Module 4 demo data added \(synthetic\)/);
    const second = await run('scripts/seedModule4Demo.js', { DEMO_MONGO_URI: uri });
    expect(second.out).toMatch(/already there/);

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const bookings = await db.collection('bookings').find().toArray();
    expect(new Set(bookings.map((b) => b.status))).toEqual(new Set(['requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled']));
    expect(new Set(bookings.map((b) => b.outcome).filter(Boolean))).toEqual(new Set(['completed', 'declined', 'expired', 'cancelled_by_customer', 'cancelled_by_worker_late', 'worker_no_show', 'closed_no_fault']));
    expect(bookings.filter((b) => b.dispute?.status === 'open')).toHaveLength(1);
    expect(bookings.filter((b) => b.outcome === 'worker_no_show' && b.noShow?.workerResponse === 'no_answer')).toHaveLength(1);
    expect(bookings.every((b) => b.synthetic === true)).toBe(true);
    const reviews = await db.collection('reviews').find().toArray();
    expect(reviews.every((r) => r.synthetic === true)).toBe(true);
    expect(reviews.filter((r) => r.comment).every((r) => r.comment.startsWith('[Demo]'))).toBe(true);
    expect(await db.collection('reputationflags').countDocuments({ status: 'open', type: 'new_account_praise' })).toBe(1);
    // every depth word appears among the workers (a worker without a snapshot is "new")
    const profiles = await db.collection('workerprofiles').find().toArray();
    const depths = new Set(profiles.map((p) => (p.reputation?.public?.reviewCount ? p.reputation.public.depth : 'none')));
    expect(depths).toEqual(new Set(['none', 'few', 'some', 'many']));
    const users = await db.collection('users').find().toArray();
    expect(users.filter((u) => u.role !== 'admin').every((u) => u.email.endsWith('@example.com') && /\(synthetic\)$/.test(u.name))).toBe(true);
    // the demo request is fresh: opening the worker's list must not expire it (48-hour rule)
    const request = bookings.find((b) => b.status === 'requested');
    expect(Date.now() - new Date(request.createdAt).getTime()).toBeLessThan(24 * 60 * 60 * 1000);
    await mongoose.disconnect();
  }, 180000);
});
