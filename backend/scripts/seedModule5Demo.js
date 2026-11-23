// LOCAL DEMO ONLY: adds SYNTHETIC Module 5 demo data (agreed prices, a waiting price change, a below-minimum
// offer, payment records in every state, one "[Demo]" price guide entry) on top of the Module 4 demo data.
// Run by `bash scripts/preview.sh demo` (on an empty demo database) and `bash scripts/preview.sh reset-demo`,
// after seedModule4Demo.js.
//
// Safety: only a local mongodb:// database whose name ends in "_demo" (the same guard as resetDemo.js), so it
// can never touch Atlas or the team's own preview database. Every booking is synthetic: true, every new name
// ends in "(synthetic)", every note starts with "[Demo]". Every amount here is SYNTHETIC test data, never a
// real price, and must not be used to report results. The production price guide starts empty (only this
// local seed creates an entry, labelled "[Demo]", synthetic: true).
//
// Run in ./backend (MongoDB running):  npm run demo:module5
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import PriceGuide from '../models/PriceGuide.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { checkDemoUri, DEFAULT_DEMO_URI } from './resetDemo.js';
import { checkWriteAllowed } from './lib/dbGuard.js';
import { DEMO_PASSWORD } from './seedModule4Demo.js';
import { regionOf } from '../config/regions.js';
import { nextBookingCode } from '../services/booking/lifecycle.js';
import { pktDate, scheduledStartFor } from '../services/booking/schedule.js';
import { notify } from '../services/notifications.js';
import { bookingParams } from '../services/booking/notify.js';
import { recomputeReputation } from '../services/reputation/recompute.js';
import { snapshotOf, termsFields } from '../services/wage/termsRules.js';
import { paymentSummary } from '../services/wage/paymentSummary.js';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const trusted = (v) => mongoose.trusted(v);
const event = (from, to, by, at, reason = null) => ({ from, to, by, at, reason });

function main() {
  const uri = process.env.DEMO_MONGO_URI || DEFAULT_DEMO_URI;
  const problem = checkDemoUri(uri);
  if (problem) throw new Error(`Refusing to run: ${problem}.`);
  const allowed = checkWriteAllowed(uri, []);
  if (!allowed.ok) throw new Error(allowed.message);
  return seed(uri);
}

// agreed terms (version 1, proposed by the customer, agreed by the worker) and their history
function agreedTerms(input, at) {
  const fields = termsFields(input);
  const proposedAt = new Date(at.getTime() - HOUR);
  return {
    terms: { status: 'agreed', version: 1, proposedBy: 'customer', proposedAt, ...fields, agreed: { ...fields, version: 1, agreedAt: at } },
    termsHistory: [
      { version: 1, by: 'customer', action: 'proposed', at: proposedAt, snapshot: snapshotOf(fields) },
      { version: 1, by: 'worker', action: 'agreed', at, snapshot: snapshotOf(fields) },
    ],
  };
}

const record = (kind, amount, method, paidOn, recordedBy, recordedAt, status, extra = {}) => ({
  _id: new mongoose.Types.ObjectId(), kind, amount, method, paidOn, recordedBy, recordedAt, status, respondedAt: status === 'awaiting_confirmation' ? null : new Date(recordedAt.getTime() + HOUR), disputeReason: null, disputeNote: '', ...extra,
});

// writes terms and payments onto a booking; paymentState is computed with the same pure function as the API
async function setMoney(b, { terms, termsHistory, payments = [] }) {
  const state = paymentSummary({ terms, payments }).state;
  await Booking.collection.updateOne({ _id: b._id }, { $set: { terms, termsHistory, payments, paymentState: state, moneyVersion: termsHistory.length + payments.length * 2 } });
}

async function electrician(n) {
  const email = `elec${n}.demo@example.com`;
  let u = await User.findOne({ email });
  if (!u) u = await User.create({ name: `Demo Electrician ${n} (synthetic)`, email, phone: `0300000005${n}`, role: 'worker', password: DEMO_PASSWORD });
  let p = await WorkerProfile.findOne({ user: u._id });
  if (!p) {
    p = await WorkerProfile.create({
      user: u._id, occupation: 'Electrician', category: 'electrical_solar', city: 'Islamabad', experienceYears: 2 + n, hourlyRate: 400 + 50 * n, dailyRate: 2500 + 200 * n,
      bio: 'Synthetic demo profile for the local preview (Module 5).', skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', addedVia: 'manual' }],
      onboardingCompletedAt: new Date(),
    });
  }
  return { user: u, profile: p };
}

// a completed, both-confirmed wiring job in Islamabad with an agreed price per job (synthetic)
async function wiringJob(w, customer, amount, daysAgo, payments = []) {
  const start = scheduledStartFor(pktDate(new Date(Date.now() - daysAgo * DAY)), 'morning');
  const created = new Date(start.getTime() - 3 * DAY);
  const accepted = new Date(created.getTime() + HOUR);
  const done = new Date(start.getTime() + 5 * HOUR);
  const money = agreedTerms({ amount, unit: 'job', duration: 'few_hours', materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'none' }, new Date(accepted.getTime() + 2 * HOUR));
  const doc = await Booking.create({
    code: await nextBookingCode(), customer: customer._id, worker: w.profile._id, workerUser: w.user._id, skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar',
    preferredDate: pktDate(start), timeSlot: 'morning', scheduledStart: start, city: 'Islamabad', region: 'ICT', area: 'G-9', description: '[Demo] Rewire one room.',
    status: 'completed', outcome: 'completed', acceptedAt: accepted, workerConfirmedAt: done, customerConfirmedAt: new Date(done.getTime() + HOUR), completedAt: new Date(done.getTime() + HOUR),
    completionMethod: 'both', closedAt: new Date(done.getTime() + HOUR), synthetic: true,
    statusHistory: [event(null, 'requested', 'customer', created), event('requested', 'accepted', 'worker', accepted), event('accepted', 'accepted', 'worker', done, 'confirmed_done'), event('accepted', 'completed', 'customer', new Date(done.getTime() + HOUR), 'both_confirmed')],
  });
  await Booking.collection.updateOne({ _id: doc._id }, { $set: { createdAt: created } });
  const paid = payments.map((p) => p(pktDate(done), done));
  await setMoney(doc, { ...money, payments: paid });
  return doc;
}

async function seed(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    if (await Booking.exists({ synthetic: true, 'terms.status': trusted({ $in: ['proposed', 'agreed'] }) })) {
      console.log('Module 5 demo data is already there: nothing added.');
      return;
    }
    const find = (email) => User.findOne({ email });
    const [demoWorker, demoCustomer, admin, plumberUser] = await Promise.all([find('worker.demo@example.com'), find('customer.demo@example.com'), User.findOne({ role: 'admin' }), find('plumber.demo@example.com')]);
    if (!demoWorker || !demoCustomer || !plumberUser) throw new Error('Run the demo reset and the Module 4 demo seed first (the demo accounts and bookings are missing).');
    // (the Module 4 seed's e1 and e2 jobs of the demo worker are with customer08 and customer09)
    const c = await Promise.all([1, 2, 3, 4, 5, 8, 9].map((n) => find(`customer${String(n).padStart(2, '0')}.demo@example.com`)));
    const [c1, c2, c3, c4, c5, c8, c9] = c;
    if (c.some((x) => !x)) throw new Error('The Module 4 demo customers are missing: run seedModule4Demo.js first.');

    // every booking gets its region from its city (Module 4 bookings were made before regions existed)
    for (const b of await Booking.find({}).select('city').lean()) await Booking.collection.updateOne({ _id: b._id }, { $set: { region: regionOf(b.city) } });

    // 1. The platform range: completed, both-confirmed wiring jobs in Islamabad with an agreed price per job,
    //    from different customer-worker pairs (4 workers, 5 + 3 customers).
    const demoProfile = await WorkerProfile.findOne({ user: demoWorker._id });
    const w0 = { user: demoWorker, profile: demoProfile };
    const [w1, w2, w3] = [await electrician(1), await electrician(2), await electrician(3)];
    // (w0, c1): an over-payment (agreed 1,800, paid 2,000, confirmed)
    await wiringJob(w0, c1, 1800, 34, [(day, at) => record('final', 2000, 'cash', day, 'customer', at, 'confirmed')]);
    await wiringJob(w1, c2, 2000, 30, [(day, at) => record('final', 2000, 'easypaisa', day, 'customer', at, 'confirmed')]);
    await wiringJob(w2, c3, 2200, 26);
    await wiringJob(w3, c4, 2500, 21, [(day, at) => record('final', 2500, 'cash', day, 'worker', at, 'confirmed')]);
    await wiringJob(w0, c5, 2800, 16, [(day, at) => record('advance', 800, 'jazzcash', day, 'customer', at, 'confirmed'), (day, at) => record('final', 2000, 'cash', day, 'customer', at, 'confirmed')]);
    await wiringJob(w1, c3, 3000, 11);

    // 2. The demo worker's Module 4 bookings get prices and payments in every state
    const mine = await Booking.find({ workerUser: demoWorker._id }).lean();
    const byCustomer = (u, status) => mine.find((b) => String(b.customer) === String(u._id) && b.status === status);
    // completed yesterday for the demo customer: agreed 2,500, the customer recorded "I paid", waiting for the worker
    const unrated = byCustomer(demoCustomer, 'completed');
    if (unrated) {
      const at = new Date(unrated.completedAt);
      const money = agreedTerms({ amount: 2500, unit: 'job', duration: 'few_hours', materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'none' }, new Date(new Date(unrated.acceptedAt).getTime() + HOUR));
      await setMoney(unrated, { ...money, payments: [record('final', 2500, 'cash', pktDate(at), 'customer', new Date(at.getTime() + HOUR), 'awaiting_confirmation')] });
      await notify(demoWorker._id, 'payment_recorded', bookingParams(unrated, { amount: 2500 }));
    }
    // customer08: agreed 2,000, paid and confirmed
    const e1 = byCustomer(c8, 'completed');
    if (e1) {
      const at = new Date(e1.completedAt);
      await setMoney(e1, { ...agreedTerms({ amount: 2000, unit: 'job', duration: 'few_hours', paymentTiming: 'after_work', paymentMethod: 'cash', materials: 'customer_buys', advance: 0, visitCharge: 'none' }, new Date(new Date(e1.acceptedAt).getTime() + HOUR)), payments: [record('final', 2000, 'cash', pktDate(at), 'customer', at, 'confirmed')] });
    }
    // customer09: agreed 3,000; the worker recorded "I received 3,000", the customer says the amount is wrong
    const e2 = byCustomer(c9, 'completed');
    if (e2) {
      const at = new Date(e2.completedAt);
      await setMoney(e2, {
        ...agreedTerms({ amount: 3000, unit: 'job', duration: 'one_day', paymentTiming: 'after_work', paymentMethod: 'cash', materials: 'worker_buys_customer_pays', advance: 500, visitCharge: 'none' }, new Date(new Date(e2.acceptedAt).getTime() + HOUR)),
        payments: [record('final', 3000, 'cash', pktDate(at), 'worker', at, 'disputed', { disputeReason: 'wrong_amount', disputeNote: '[Demo] I paid 2,500 in cash, not 3,000.' })],
      });
    }
    // the demo customer's open request: an offer BELOW the minimum wage reference for one day (the warning shows)
    const request = byCustomer(demoCustomer, 'requested');
    if (request) {
      const offer = termsFields({ amount: 1200, unit: 'job', duration: 'one_day' });
      await Booking.collection.updateOne({ _id: request._id }, { $set: {
        terms: { status: 'proposed', version: 1, proposedBy: 'customer', proposedAt: new Date(request.createdAt), ...offer, agreed: null },
        termsHistory: [{ version: 1, by: 'customer', action: 'proposed', at: new Date(request.createdAt), snapshot: snapshotOf(offer) }], moneyVersion: 1,
      } });
      await notify(demoWorker._id, 'terms_proposed', bookingParams(request, { amount: 1200, unit: 'job' }));
    }

    // 3. A waiting price change: the demo customer's accepted job with the plumber (agreed 2,000; the plumber
    //    proposes 2,400 with the materials included, waiting for the customer)
    const active = await Booking.findOne({ customer: demoCustomer._id, workerUser: plumberUser._id, status: 'accepted' }).lean();
    if (active) {
      const at = new Date(new Date(active.acceptedAt).getTime() + HOUR);
      const money = agreedTerms({ amount: 2000, unit: 'job', duration: 'few_hours', materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'included' }, at);
      const change = termsFields({ amount: 2400, unit: 'job', duration: 'few_hours', materials: 'included_in_price', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'included', note: '[Demo] The new pipe and fittings are included.' });
      const proposedAt = new Date(at.getTime() + HOUR);
      const terms = { ...money.terms, ...change, status: 'proposed', version: 2, proposedBy: 'worker', proposedAt, agreed: money.terms.agreed };
      await setMoney(active, { terms, termsHistory: [...money.termsHistory, { version: 2, by: 'worker', action: 'proposed', at: proposedAt, snapshot: snapshotOf(change) }] });
      await notify(demoCustomer._id, 'terms_proposed', bookingParams(active, { amount: 2400, unit: 'job' }));
    }

    // 4. A skill with too few jobs (two agreed plumbing jobs) and a "[Demo]" price guide entry, so the fallback shows
    const leaks = await Booking.find({ workerUser: plumberUser._id, status: 'completed', completionMethod: 'both', skillId: 'plumb_leak' }).sort({ completedAt: -1 }).limit(2).lean();
    for (const [i, b] of leaks.entries()) await setMoney(b, agreedTerms({ amount: 1500 + 300 * i, unit: 'job', duration: 'few_hours' }, new Date(new Date(b.acceptedAt).getTime() + HOUR)));
    if (admin && !(await PriceGuide.exists({ synthetic: true }))) {
      await PriceGuide.create({
        skillId: 'plumb_leak', category: 'plumbing_sanitary', unit: 'job', region: 'PK', low: 1500, high: 3000,
        sourceNote: '[Demo] Synthetic entry for the local demo only. Not a real survey and not a real price.', note: '[Demo] Synthetic.', createdBy: admin._id, synthetic: true,
      });
    }

    for (const w of [w1, w2, w3]) await recomputeReputation(w.profile._id);
    const states = Object.fromEntries((await Booking.aggregate([{ $match: { 'terms.status': trusted({ $in: ['proposed', 'agreed'] }) } }, { $group: { _id: '$paymentState', n: { $sum: 1 } } }])).map((r) => [r._id, r.n]));
    console.log(`Module 5 demo data added (synthetic): ${await Booking.countDocuments({ 'terms.status': trusted({ $in: ['proposed', 'agreed'] }) })} bookings with prices ${JSON.stringify(states)}, ${await PriceGuide.countDocuments()} price guide entry.`);
    console.log('  new workers: elec1.demo, elec2.demo, elec3.demo (Islamabad wiring, synthetic prices)');
    console.log('  see: customer.demo -> worker.demo profile -> Request (price range); the plumber job (a waiting change); worker.demo -> Requests (low offer), My earnings');
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error('Module 5 demo seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

export { main as seedModule5Demo };
