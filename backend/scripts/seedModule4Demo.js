// LOCAL DEMO ONLY: adds SYNTHETIC Module 4 demo data (bookings, reviews, a dispute, a no-show, a
// reputation flag) on top of the three demo accounts made by resetDemo.js. Run by
// `bash scripts/preview.sh demo` (on an empty demo database) and `bash scripts/preview.sh reset-demo`.
//
// Safety: only a local mongodb:// database whose name ends in "_demo" (the same guard as resetDemo.js),
// so it can never touch Atlas or the team's own preview database. Every booking and review is marked
// synthetic: true, every name ends in "(synthetic)", every comment starts with "[Demo]". Not for results.
//
// Run in ./backend (MongoDB running):  npm run demo:module4
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { checkDemoUri, DEFAULT_DEMO_URI } from './resetDemo.js';
import { checkWriteAllowed } from './lib/dbGuard.js';
import { nextBookingCode } from '../services/booking/lifecycle.js';
import { scheduledStartFor, pktDate } from '../services/booking/schedule.js';
import { recomputeReputation } from '../services/reputation/recompute.js';
import { runPatternCheck } from '../services/reputation/patternCheck.js';
import { notify } from '../services/notifications.js';
import { bookingParams } from '../services/booking/notify.js';

export const DEMO_PASSWORD = 'local-demo-password-123'; // the same local-only password as seedLocalDemo.js
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const WORKERS = [
  { key: 'plumber', name: 'Demo Plumber (synthetic)', occupation: 'Plumber', category: 'plumbing_sanitary', skills: [['plumb_leak', 'Water leak repair'], ['plumb_pipe', 'PPRC and uPVC pipe fitting']], whatsapp: '03000000021', city: 'Islamabad' },
  { key: 'painter', name: 'Demo Painter (synthetic)', occupation: 'Painter', category: 'painting_renovation', skills: [['paint_interior', 'Interior emulsion and distemper']], city: 'Rawalpindi' },
  { key: 'mason', name: 'Demo Mason (synthetic)', occupation: 'Mason', category: 'construction_masonry', skills: [['mason_brick', 'Brickwork']], city: 'Islamabad' },
  { key: 'carpenter', name: 'Demo Carpenter (synthetic)', occupation: 'Carpenter', category: 'carpentry_woodwork', skills: [['carp_doors', 'Door and window fitting']], city: 'Islamabad' },
  { key: 'ac', name: 'Demo AC Technician (synthetic)', occupation: 'AC technician', category: 'ac_appliance_repair', skills: [['ac_gas', 'AC gas charging']], city: 'Islamabad' },
];

function main() {
  const uri = process.env.DEMO_MONGO_URI || DEFAULT_DEMO_URI;
  const problem = checkDemoUri(uri);
  if (problem) throw new Error(`Refusing to run: ${problem}.`);
  const allowed = checkWriteAllowed(uri, []);
  if (!allowed.ok) throw new Error(allowed.message);
  return seed(uri);
}

async function user(data, { daysOld = 200 } = {}) {
  const found = await User.findOne({ email: data.email });
  const u = found ?? (await User.create({ ...data, password: DEMO_PASSWORD }));
  if (!found && daysOld) await User.collection.updateOne({ _id: u._id }, { $set: { createdAt: new Date(Date.now() - daysOld * DAY) } });
  return u;
}

async function worker(spec, n) {
  const u = await user({ name: spec.name, email: `${spec.key}.demo@example.com`, phone: `030000001${String(n).padStart(2, '0')}`, role: 'worker' });
  let p = await WorkerProfile.findOne({ user: u._id });
  if (!p) {
    p = await WorkerProfile.create({
      user: u._id, occupation: spec.occupation, category: spec.category, city: spec.city, experienceYears: 3 + n, hourlyRate: 500 + 50 * n, dailyRate: 3000 + 200 * n,
      whatsappNumber: spec.whatsapp ?? '', bio: 'Synthetic demo profile for the local preview (Module 4).',
      skills: spec.skills.map(([skillId, name]) => ({ skillId, name, category: spec.category, addedVia: 'manual' })),
      onboardingCompletedAt: new Date(),
    });
  }
  return { user: u, profile: p, skills: spec.skills };
}

const event = (from, to, by, at, reason = null) => ({ from, to, by, at, reason });

// One booking, written straight to the demo database with dates in the past (or the future).
// state: requested | accepted | completed | declined | expired | cancelled_customer | cancelled_worker_late | no_show | disputed | decided_no_fault
async function booking({ customer, worker: w, skill = 0, startDays, state, slot = 'morning', area, description, method = 'both', extra = {} }) {
  const [skillId, skillName] = w.skills[skill];
  const date = pktDate(new Date(Date.now() + startDays * DAY));
  const start = scheduledStartFor(date, slot);
  // an open request or job is from today (an older request would expire at once: 48-hour rule)
  const created = ['requested', 'accepted'].includes(state) ? new Date(Date.now() - 2 * HOUR) : new Date(Math.min(Date.now() - HOUR, start.getTime() - 3 * DAY));
  const accepted = new Date(created.getTime() + HOUR);
  const after = new Date(start.getTime() + 4 * HOUR);
  const doc = {
    code: await nextBookingCode(), customer: customer._id, worker: w.profile._id, workerUser: w.user._id, skillId, skillName, category: w.profile.category,
    preferredDate: date, timeSlot: slot, scheduledStart: start, city: w.profile.city, area, description, synthetic: true,
    statusHistory: [event(null, 'requested', 'customer', created)],
  };
  const close = (status, outcome, at, more = {}) => Object.assign(doc, { status, outcome, closedAt: at, ...more });
  switch (state) {
    case 'requested':
      doc.status = 'requested';
      break;
    case 'accepted':
      Object.assign(doc, { status: 'accepted', acceptedAt: accepted });
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted));
      break;
    case 'completed':
      Object.assign(doc, { acceptedAt: accepted, workerConfirmedAt: after, customerConfirmedAt: method === 'both' ? new Date(after.getTime() + HOUR) : null });
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted), event('accepted', 'accepted', 'worker', after, 'confirmed_done'));
      if (method === 'both') doc.statusHistory.push(event('accepted', 'completed', 'customer', doc.customerConfirmedAt, 'both_confirmed'));
      else doc.statusHistory.push(event('accepted', 'completed', 'system', new Date(after.getTime() + 72 * HOUR), 'auto_completed'));
      close('completed', 'completed', doc.statusHistory.at(-1).at, { completedAt: doc.statusHistory.at(-1).at, completionMethod: method });
      break;
    case 'declined':
      doc.statusHistory.push(event('requested', 'declined', 'worker', accepted, 'too_far'));
      close('declined', 'declined', accepted, { declineReason: 'too_far' });
      break;
    case 'expired': {
      const at = new Date(created.getTime() + 49 * HOUR);
      doc.statusHistory.push(event('requested', 'expired', 'system', at, 'no_answer'));
      close('expired', 'expired', at);
      break;
    }
    case 'cancelled_customer':
      doc.statusHistory.push(event('requested', 'cancelled', 'customer', accepted));
      close('cancelled', 'cancelled_by_customer', accepted, { cancelledBy: 'customer' });
      break;
    case 'cancelled_worker_late': {
      const at = new Date(start.getTime() - 5 * HOUR);
      Object.assign(doc, { acceptedAt: accepted });
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted), event('accepted', 'cancelled', 'worker', at, 'cannot_come'));
      close('cancelled', 'cancelled_by_worker_late', at, { cancelledBy: 'worker', cancelReason: 'cannot_come' });
      break;
    }
    case 'no_show': { // reported, no answer for 3 days: a confirmed no-show the worker may still dispute
      const reported = new Date(start.getTime() + 3 * HOUR);
      const at = new Date(reported.getTime() + 73 * HOUR);
      Object.assign(doc, { acceptedAt: accepted, noShow: { reportedAt: reported, workerResponse: 'no_answer', respondedAt: null } });
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted), event('accepted', 'accepted', 'customer', reported, 'no_show_reported'), event('accepted', 'cancelled', 'system', at, 'no_show_unanswered'));
      close('cancelled', 'worker_no_show', at, { cancelledBy: 'system', cancelReason: 'no_show' });
      break;
    }
    case 'disputed': { // the worker pressed "Work done", the customer says it was not done: open dispute
      const opened = new Date(after.getTime() + 2 * HOUR);
      Object.assign(doc, { status: 'accepted', acceptedAt: accepted, workerConfirmedAt: after });
      doc.dispute = { type: 'completion_contested', openedBy: 'customer', reasonCode: 'work_not_done', note: '[Demo] The paint is patchy in two rooms.', openedAt: opened, status: 'open' };
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted), event('accepted', 'accepted', 'worker', after, 'confirmed_done'), event('accepted', 'accepted', 'customer', opened, 'dispute_completion_contested'));
      break;
    }
    case 'decided_no_fault': {
      const opened = new Date(after.getTime() + 2 * HOUR);
      const decided = new Date(opened.getTime() + 30 * HOUR);
      Object.assign(doc, { acceptedAt: accepted, workerConfirmedAt: after });
      doc.dispute = { type: 'completion_contested', openedBy: 'customer', reasonCode: 'work_not_done', note: '[Demo] The part did not arrive.', openedAt: opened, status: 'decided', decision: 'not_done_no_fault', decisionNote: '[Demo] Both called: the shop did not deliver the part. Nobody at fault.', decidedAt: decided };
      doc.statusHistory.push(event('requested', 'accepted', 'worker', accepted), event('accepted', 'accepted', 'worker', after, 'confirmed_done'), event('accepted', 'accepted', 'customer', opened, 'dispute_completion_contested'), event('accepted', 'cancelled', 'admin', decided, 'not_done_no_fault'));
      close('cancelled', 'closed_no_fault', decided, { cancelledBy: 'admin', cancelReason: 'dispute_decision' });
      break;
    }
    default:
      throw new Error(`unknown demo state ${state}`);
  }
  Object.assign(doc, extra);
  const saved = await Booking.create(doc);
  await Booking.collection.updateOne({ _id: saved._id }, { $set: { createdAt: created, updatedAt: doc.closedAt ?? doc.statusHistory.at(-1).at } });
  return saved.toObject();
}

async function review(b, stars, { comment = '', answers = {}, daysAfter = 1, reply = null, report = null, hidden = null } = {}) {
  const at = new Date(Math.min(Date.now() - HOUR, new Date(b.completedAt).getTime() + daysAfter * DAY));
  const r = await Review.create({
    booking: b._id, worker: b.worker, workerUser: b.workerUser, customer: b.customer, skillId: b.skillId, rating: stars, comment, ...answers, synthetic: true,
    ...(reply ? { reply: { text: reply, at: new Date(at.getTime() + DAY) } } : {}),
    ...(report ? { reports: [{ reasonCode: report, note: '', at: new Date(at.getTime() + 2 * DAY) }] } : {}),
    ...(hidden ? { status: 'hidden', hidden: { reasonCode: hidden, note: '[Demo] Hidden for the demo.', at: new Date(at.getTime() + 3 * DAY) } } : {}),
  });
  await Review.collection.updateOne({ _id: r._id }, { $set: { createdAt: at, updatedAt: at } });
  return r;
}

const yes = (...keys) => Object.fromEntries(keys.map((k) => [k, 'yes']));

async function seed(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    if (await Booking.exists({ synthetic: true })) {
      console.log('Module 4 demo data is already there: nothing added.');
      return;
    }
    const demoWorkerUser = await User.findOne({ email: 'worker.demo@example.com' });
    const demoCustomer = await User.findOne({ email: 'customer.demo@example.com' });
    if (!demoWorkerUser || !demoCustomer) throw new Error('Run the demo reset first (the three demo accounts are missing).');
    const demoProfile = await WorkerProfile.findOne({ user: demoWorkerUser._id });
    await WorkerProfile.updateOne({ _id: demoProfile._id }, { $set: { whatsappNumber: '03000000011', onboardingCompletedAt: new Date() } });
    const electrician = { user: demoWorkerUser, profile: demoProfile, skills: demoProfile.skills.map((s) => [s.skillId, s.name]) };

    const w = {};
    for (const [i, spec] of WORKERS.entries()) w[spec.key] = await worker(spec, i + 1);
    const c = [];
    for (let i = 1; i <= 12; i += 1) c.push(await user({ name: `Demo Customer ${String(i).padStart(2, '0')} (synthetic)`, email: `customer${String(i).padStart(2, '0')}.demo@example.com`, phone: `030000002${String(i).padStart(2, '0')}`, role: 'customer' }));
    // three NEW accounts that only praise the carpenter: the rule-based check flags this pattern
    const fresh = [];
    for (let i = 1; i <= 3; i += 1) fresh.push(await user({ name: `Demo New Account ${i} (synthetic)`, email: `newaccount${i}.demo@example.com`, phone: `030000003${String(i).padStart(2, '0')}`, role: 'customer' }, { daysOld: 0 }));

    // Many reviews: the plumber, 12 recent reviews from customers who also hired other workers.
    for (const [i, customer] of c.entries()) {
      await booking({ customer, worker: w.ac, startDays: -(40 + i), state: 'completed', area: 'F-7', description: '[Demo] AC not cooling.' });
      await booking({ customer, worker: w.painter, startDays: -(50 + i), state: 'completed', area: 'G-11', description: '[Demo] Paint one room.' });
      const b = await booking({ customer, worker: w.plumber, skill: i % 2, startDays: -(3 + 4 * i), state: 'completed', method: i === 5 ? 'auto' : 'both', area: 'G-9 Markaz', description: '[Demo] Leak under the kitchen sink.' });
      const stars = [5, 5, 4, 5, 5, 4, 5, 5, 4, 5, 3, 5][i];
      await review(b, stars, {
        comment: i % 3 === 0 ? '[Demo] Came on time and fixed the leak.' : i % 3 === 1 ? '[Demo] Clean work, fair price.' : '',
        answers: stars >= 4 ? yes('onTime', 'workQuality', 'polite', 'priceAsAgreed', 'wouldHireAgain') : { onTime: 'no', workQuality: 'yes', wouldHireAgain: 'no' },
        reply: i === 10 ? '[Demo] Thank you, I will bring the right part next time.' : null,
      });
    }
    // the AC technician: two reviews only (few)
    const acJobs = await Booking.find({ worker: w.ac.profile._id, status: 'completed' }).sort({ completedAt: -1 }).limit(2).lean();
    await review(acJobs[0], 5, { comment: '[Demo] The AC cools well now.', answers: yes('onTime', 'workQuality') });
    await review(acJobs[1], 4, { comment: '', answers: { priceAsAgreed: 'yes' } });
    // a hidden review (abusive), so the moderation page has both states
    const hiddenOne = await booking({ customer: c[11], worker: w.plumber, startDays: -70, state: 'completed', area: 'G-9', description: '[Demo] Tap repair.' });
    await review(hiddenOne, 1, { comment: '[Demo] (An abusive comment, hidden by the admin.)', hidden: 'abusive_language' });

    // Some reviews: the painter (5 reviews, one reported), a declined request, an open dispute, a no-show.
    const painted = await Booking.find({ worker: w.painter.profile._id, status: 'completed' }).sort({ completedAt: 1 }).limit(5).lean();
    for (const [i, b] of painted.entries()) {
      await review(b, [4, 3, 5, 2, 4][i], {
        comment: ['[Demo] Neat edges, good colour.', '[Demo] Late by one hour.', '[Demo] Very clean work.', '[Demo] The wrong colour was used.', ''][i],
        report: i === 3 ? 'not_about_my_work' : null,
      });
    }
    await booking({ customer: demoCustomer, worker: w.painter, startDays: -6, state: 'declined', area: 'G-9 Markaz', description: '[Demo] Paint the boundary wall.' });
    await booking({ customer: demoCustomer, worker: w.painter, startDays: -2, state: 'disputed', area: 'G-9 Markaz', description: '[Demo] Paint two bedrooms.' });
    await booking({ customer: c[5], worker: w.painter, startDays: -5, state: 'no_show', area: 'I-8', description: '[Demo] Paint the kitchen.' });

    // Few reviews: the demo electrician (worker.demo) with every kind of booking.
    const request = await booking({ customer: demoCustomer, worker: electrician, startDays: 1, state: 'requested', area: 'G-9 Markaz', description: '[Demo] Two sockets in the kitchen do not work.' });
    await booking({ customer: c[6], worker: electrician, startDays: 1, slot: 'afternoon', state: 'accepted', area: 'F-10', description: '[Demo] New light in the drawing room.' });
    const e1 = await booking({ customer: c[7], worker: electrician, startDays: -12, state: 'completed', area: 'G-10', description: '[Demo] Rewire the bedroom.' });
    await review(e1, 5, { comment: '[Demo] Came on time and fixed the wiring.', answers: yes('onTime', 'workQuality', 'polite', 'wouldHireAgain'), reply: '[Demo] Thank you, call me any time.' });
    const e2 = await booking({ customer: c[8], worker: electrician, startDays: -25, state: 'completed', area: 'G-10', description: '[Demo] Fan not working.' });
    await review(e2, 4, { comment: '[Demo] Good work, a little late.', answers: { onTime: 'no', workQuality: 'yes', polite: 'yes' } });
    const unrated = await booking({ customer: demoCustomer, worker: electrician, startDays: -1, state: 'completed', area: 'G-9 Markaz', description: '[Demo] Change the main switch.' });
    await booking({ customer: c[9], worker: electrician, startDays: -20, state: 'cancelled_worker_late', area: 'F-6', description: '[Demo] Doorbell wiring.' });
    await booking({ customer: c[10], worker: electrician, startDays: -9, state: 'expired', area: 'F-8', description: '[Demo] Check the meter.' });
    await booking({ customer: c[11], worker: electrician, startDays: -15, state: 'cancelled_customer', area: 'F-11', description: '[Demo] UPS wiring.' });
    await booking({ customer: c[8], worker: electrician, startDays: -30, state: 'decided_no_fault', area: 'G-10', description: '[Demo] Install a new socket board.' });
    // the demo customer's active booking with a phone number to see: the plumber accepted it
    const active = await booking({ customer: demoCustomer, worker: w.plumber, startDays: 1, slot: 'evening', state: 'accepted', area: 'G-9 Markaz', description: '[Demo] Water heater pipe is leaking.' });

    // The flagged pattern: three new accounts, three quick 5-star reviews for the carpenter.
    for (const [i, customer] of fresh.entries()) {
      const b = await booking({ customer, worker: w.carpenter, startDays: -(2 + i), state: 'completed', area: 'G-13', description: '[Demo] Fix a door.' });
      await Booking.collection.updateOne({ _id: b._id }, { $set: { createdAt: new Date(Date.now() - (3 + i) * DAY) } });
      await review(b, 5, { comment: '[Demo] Excellent!!!' });
    }

    // a few notifications, so both demo accounts see the bell / the menu count
    await notify(demoWorkerUser._id, 'booking_requested', bookingParams(request));
    await notify(demoCustomer._id, 'booking_accepted', bookingParams(active));
    await notify(demoCustomer._id, 'review_requested', bookingParams(unrated));

    // reputation snapshots and the rule-based check, exactly as the live app computes them
    const workerIds = await Booking.distinct('worker');
    for (const id of workerIds) await recomputeReputation(id);
    let flags = 0;
    for (const id of workerIds) flags += (await runPatternCheck(id)).length;

    const counts = Object.fromEntries((await Booking.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])).map((r) => [r._id, r.n]));
    console.log(`Module 4 demo data added (synthetic): ${await Booking.countDocuments()} bookings ${JSON.stringify(counts)}, ${await Review.countDocuments()} reviews, ${flags} flag(s).`);
    console.log('  workers: worker.demo (few reviews), plumber.demo (many), painter.demo (some), mason.demo (new), carpenter.demo (flagged), ac.demo (few)');
    console.log(`  customers: customer.demo, customer01..12.demo, newaccount1..3.demo  (password ${DEMO_PASSWORD})`);
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error('Module 4 demo seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

export { main as seedModule4Demo };
