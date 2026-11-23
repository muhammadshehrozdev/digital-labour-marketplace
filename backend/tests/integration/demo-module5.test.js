// Module 5 demo data (scripts/seedModule5Demo.js, run by preview.sh demo / reset-demo after the Module 4 seed):
// only a local "_demo" database; afterwards a platform price range for Islamabad wiring, a skill with too few
// jobs and a "[Demo]" price guide entry, a waiting price change, an offer below the minimum wage reference, and
// payment records in every state (with an over-payment). Everything synthetic; a second run adds nothing.
import { spawn } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { priceRange } from '../../services/wage/priceRange.js';
import { termsChecks } from '../../services/wage/termsChecks.js';
import { wageReferenceFor } from '../../services/wage/wageReference.js';

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

describe('Module 5 demo seed', () => {
  let mongo;
  let uri;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    uri = `${mongo.getUri()}module5_test_demo`;
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  test('refuses any database that is not a local *_demo one', async () => {
    for (const bad of ['mongodb+srv://u:p@cluster0.example.mongodb.net/dlm_demo', 'mongodb://127.0.0.1:27017/dlm_local_preview']) {
      const result = await run('scripts/seedModule5Demo.js', { DEMO_MONGO_URI: bad });
      expect(result.status).toBe(1);
      expect(result.out).toMatch(/Refusing to run/);
    }
  });

  test('after the reset and the Module 4 seed: a range, a guide entry, a waiting change, a low offer, every payment state; all synthetic; once only', async () => {
    for (const script of ['scripts/resetDemo.js', 'scripts/seedModule4Demo.js']) {
      const r = await run(script, { DEMO_MONGO_URI: uri });
      expect(r.status, r.out).toBe(0);
    }
    const first = await run('scripts/seedModule5Demo.js', { DEMO_MONGO_URI: uri });
    expect(first.status, first.out).toBe(0);
    expect(first.out).toMatch(/Module 5 demo data added \(synthetic\)/);
    const second = await run('scripts/seedModule5Demo.js', { DEMO_MONGO_URI: uri });
    expect(second.out).toMatch(/already there/);

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const bookings = await db.collection('bookings').find().toArray();
    expect(bookings.every((b) => b.synthetic === true)).toBe(true);
    const priced = bookings.filter((b) => ['proposed', 'agreed'].includes(b.terms?.status));
    // the platform range for Islamabad wiring, computed by the production engine from the stored jobs
    const jobs = bookings.map((b) => ({ bookingId: String(b._id), workerId: String(b.worker), customerId: String(b.customer), skillId: b.skillId, category: b.category, region: b.region, city: b.city, status: b.status, completedAt: b.completedAt, completionMethod: b.completionMethod, agreed: b.terms?.agreed ? { unit: b.terms.agreed.unit, amount: b.terms.agreed.amount } : null }));
    const range = priceRange(jobs, { skillId: 'elec_wiring', category: 'electrical_solar', unit: 'job', city: 'Islamabad', region: 'ICT' }, { now: new Date() });
    expect(range).toMatchObject({ level: 'city', scope: 'skill' });
    expect(range.jobs).toBeGreaterThanOrEqual(6);
    expect(range.workers).toBeGreaterThanOrEqual(4);
    // too few leak-repair prices, and the "[Demo]" guide entry
    expect(priceRange(jobs, { skillId: 'plumb_leak', category: 'plumbing_sanitary', unit: 'job', city: 'Islamabad', region: 'ICT' }, { now: new Date() })).toBeNull();
    const guides = await db.collection('priceguides').find().toArray();
    expect(guides).toHaveLength(1);
    expect(guides[0]).toMatchObject({ synthetic: true, status: 'active', skillId: 'plumb_leak', region: 'PK' });
    expect(guides[0].sourceNote).toMatch(/^\[Demo\]/);
    // a waiting change next to an agreed price
    expect(priced.some((b) => b.terms.status === 'proposed' && b.terms.agreed && b.terms.version === 2)).toBe(true);
    // an offer below the minimum wage reference for one day (Islamabad), on the open request
    const low = priced.find((b) => b.status === 'requested');
    expect(termsChecks({ terms: low.terms, category: low.category, wageRef: wageReferenceFor(low.region) }).map((c) => c.id)).toContain('below_minimum_job');
    // payment records in every state, an over-payment, and paymentState stored as the summary says
    const statuses = new Set(priced.flatMap((b) => (b.payments ?? []).map((p) => p.status)));
    expect(statuses).toEqual(new Set(['awaiting_confirmation', 'confirmed', 'disputed']));
    expect(new Set(priced.map((b) => b.paymentState))).toEqual(new Set(['has_dispute', 'paid', 'not_paid', 'no_price']));
    expect(priced.some((b) => b.terms.agreed && (b.payments ?? []).filter((p) => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0) > b.terms.agreed.total)).toBe(true);
    expect(priced.flatMap((b) => b.payments ?? []).filter((p) => p.disputeNote).every((p) => p.disputeNote.startsWith('[Demo]'))).toBe(true);
    // the new accounts are synthetic, with @example.com addresses
    const users = await db.collection('users').find({ email: /^elec\d\.demo@example\.com$/ }).toArray();
    expect(users).toHaveLength(3);
    expect(users.every((u) => /\(synthetic\)$/.test(u.name))).toBe(true);
    // every booking has its region from the city table
    expect(bookings.filter((b) => b.city === 'Islamabad').every((b) => b.region === 'ICT')).toBe(true);
    await mongoose.disconnect();
  }, 120000);
});
