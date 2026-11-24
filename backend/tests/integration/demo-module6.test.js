// Module 6 demo data (scripts/seedModule6Demo.js, run by preview.sh demo / reset-demo after the Module 4 and 5 seeds):
// only a local "_demo" database; afterwards the demo customer has one job request in every state (open, requested,
// accepted, done, expired, closed), each analysed by the real live analyzer for its own words; the linked bookings
// keep the job's words and never hold a budget; the booking rules stay true (one open booking per pair, room for
// one more request); the open job lists Demo Electrician 1-3. Everything synthetic; a second run adds nothing.
import { spawn } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { statesFor } from '../../services/jobs/load.js';
import { workersForJob } from '../../services/jobs/workersForJob.js';
import { analyzeJob } from '../../services/jobAnalyzer/index.js';
import { JOB_PHRASES_VERSION } from '../../config/jobPhrases.js';
import { BOOKING_RULES } from '../../config/bookingRules.js';

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

describe('Module 6 demo seed', () => {
  let mongo;
  let uri;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uri = `${mongo.getUri()}module6_test_demo`;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  test('refuses any database that is not a local *_demo one', async () => {
    for (const bad of ['mongodb+srv://u:p@cluster0.example.mongodb.net/dlm_demo', 'mongodb://127.0.0.1:27017/dlm_local_preview']) {
      const result = await run('scripts/seedModule6Demo.js', { DEMO_MONGO_URI: bad });
      expect(result.status).toBe(1);
      expect(result.out).toMatch(/Refusing to run/);
    }
  });

  test('every state once, real analyses, linked bookings without a budget, the booking rules kept; synthetic; once only', async () => {
    for (const script of ['scripts/resetDemo.js', 'scripts/seedModule4Demo.js', 'scripts/seedModule5Demo.js']) {
      const r = await run(script, { DEMO_MONGO_URI: uri });
      expect(r.status, r.out).toBe(0);
    }
    const first = await run('scripts/seedModule6Demo.js', { DEMO_MONGO_URI: uri });
    expect(first.status, first.out).toBe(0);
    expect(first.out).toMatch(/Module 6 demo data added \(synthetic\): 6 job requests/);
    const second = await run('scripts/seedModule6Demo.js', { DEMO_MONGO_URI: uri });
    expect(second.status).toBe(0);
    expect(second.out).toMatch(/already there/);

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const customer = await db.collection('users').findOne({ email: 'customer.demo@example.com' });
    const jobs = await db.collection('jobrequests').find().toArray();
    expect(jobs).toHaveLength(6);
    expect(jobs.every((j) => j.synthetic === true && String(j.customer) === String(customer._id) && /^JR-\d{4}-\d{6}$/.test(j.code))).toBe(true);
    const states = await statesFor(jobs, new Date());
    expect([...states.values()].map((s) => s.state).sort()).toEqual(['accepted', 'closed', 'done', 'expired', 'open', 'requested']);

    // the stored analysis is the live analyzer's answer for the job's own words, at the job's time
    for (const j of jobs) {
      expect(j.analysis).toMatchObject({ method: 'rules', versions: { analyzer: 'job-rules-1', phrases: JOB_PHRASES_VERSION } });
      const again = analyzeJob(j.description, { now: j.createdAt });
      expect(j.analysis.suggested.category, j.code).toBe(again.category.suggested);
      expect(j.analysis.suggested.skills, j.code).toEqual(again.skills.map((s) => s.skillId));
    }
    // English, Roman Urdu and Urdu words
    expect(jobs.filter((j) => /[؀-ۿ]/.test(j.description))).toHaveLength(2);
    expect(jobs.some((j) => /\b(hai|mein|karwani)\b/.test(j.description))).toBe(true);
    expect(jobs.some((j) => /\bThe\b|\bTwo\b|\bWater\b/.test(j.description))).toBe(true);

    // the linked bookings: the job's words and place, the code and the kind of work; never a budget or an analysis
    const linked = await db.collection('bookings').find({ jobRequest: { $ne: null } }).toArray();
    expect(linked.map((b) => b.status).sort()).toEqual(['accepted', 'completed', 'requested']);
    for (const b of linked) {
      const job = jobs.find((j) => String(j._id) === String(b.jobRequest));
      expect(b).toMatchObject({ jobCode: job.code, jobTaskType: job.taskType, description: job.description, city: job.city, area: job.area, synthetic: true });
      expect(b.budget).toBeUndefined();
      expect(b.analysis).toBeUndefined();
      expect(String(job.activeBooking)).toBe(String(b._id));
    }
    const names = new Map((await db.collection('users').find({ _id: { $in: linked.map((b) => b.workerUser) } }).toArray()).map((u) => [String(u._id), u.name]));
    expect(linked.map((b) => `${b.status}:${names.get(String(b.workerUser))}`).sort()).toEqual(['accepted:Demo Plumber (synthetic)', 'completed:Demo Carpenter (synthetic)', 'requested:Demo Worker (synthetic)']);
    expect(jobs.filter((j) => j.budget).every((j) => j.budget.amount > 0)).toBe(true);

    // the booking rules still hold for the demo customer, with room for one more request
    const open = await db.collection('bookings').find({ customer: customer._id, status: { $in: ['requested', 'accepted'] } }).toArray();
    const pairs = open.map((b) => String(b.workerUser));
    expect(new Set(pairs).size).toBe(pairs.length);
    expect(open.length).toBeLessThan(BOOKING_RULES.MAX_OPEN_PER_CUSTOMER);

    // the open job: Demo Electrician 1-3 (free to ask) are listed with the reason
    const openJob = jobs.find((j) => states.get(String(j._id)).state === 'open');
    expect(openJob.budget).toEqual({ amount: 3000, unit: 'job' });
    const list = await workersForJob(openJob, {});
    const listedNames = list.workers.map((w) => w.user?.name);
    expect(listedNames).toEqual(expect.arrayContaining(['Demo Electrician 1 (synthetic)', 'Demo Electrician 2 (synthetic)', 'Demo Electrician 3 (synthetic)']));
    expect(list.workers.every((w) => w.matchedSkills.some((s) => s.skillId === 'elec_wiring'))).toBe(true);
    // the closed job keeps its reason; the expired one is older than 30 days and has no booking
    expect(jobs.find((j) => j.status === 'closed')).toMatchObject({ closeReason: 'found_elsewhere' });
    const expired = jobs.find((j) => states.get(String(j._id)).state === 'expired');
    expect(expired.activeBooking).toBeNull();
    await mongoose.disconnect();
  }, 180000);
});
