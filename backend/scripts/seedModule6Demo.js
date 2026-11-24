// LOCAL DEMO ONLY: adds SYNTHETIC Module 6 demo data for customer.demo@example.com: one job request in every state
// (open, requested, accepted, done, expired, closed), descriptions in English, Roman Urdu and Urdu, each analysed by
// the REAL live analyzer at seed time (so its stored `analysis` is genuine for that text). Run by
// `bash scripts/preview.sh demo` (on an empty demo database) and `bash scripts/preview.sh reset-demo`, after the
// Module 4 and Module 5 seeds.
//
// The booking rules stay true (at most one open booking per customer-worker pair, at most five per customer): the
// "requested" and "accepted" jobs are the demo customer's two open Module 4 requests (to Demo Worker and to Demo
// Plumber), linked to a job exactly as POST /api/job-requests/:id/request would have made them (the booking keeps the
// job's city, area and words; the job's description IS the booking's description). The "done" job gets a new
// completed booking with Demo Carpenter. The open job (electrical, Islamabad) can be sent to Demo Electrician 1-3.
//
// Safety: only a local mongodb:// database whose name ends in "_demo" (the same guard as resetDemo.js). Every job is
// synthetic: true; no new account. Not for results (the analyzer's real evaluation is Batch 8C, on real data).
//
// Run in ./backend (MongoDB running):  npm run demo:module6
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import JobRequest from '../models/JobRequest.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { checkDemoUri, DEFAULT_DEMO_URI } from './resetDemo.js';
import { checkWriteAllowed } from './lib/dbGuard.js';
import { regionOf } from '../config/regions.js';
import { skillById } from '../config/skillTaxonomy.js';
import { nextBookingCode } from '../services/booking/lifecycle.js';
import { pktDate, scheduledStartFor } from '../services/booking/schedule.js';
import { nextYearlyCode } from '../services/codes.js';
import { analyzeLive } from '../services/jobAnalyzer/live.js';
import { analysisRecord } from '../services/jobs/analysis.js';
import { recomputeReputation } from '../services/reputation/recompute.js';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;
const event = (from, to, by, at, reason = null) => ({ from, to, by, at, reason });
const trusted = (v) => mongoose.trusted(v);

function main() {
  const uri = process.env.DEMO_MONGO_URI || DEFAULT_DEMO_URI;
  const problem = checkDemoUri(uri);
  if (problem) throw new Error(`Refusing to run: ${problem}.`);
  const allowed = checkWriteAllowed(uri, []);
  if (!allowed.ok) throw new Error(allowed.message);
  return seed(uri);
}

// One job request as the API saves it: the customer's confirmed fields, the code, and the analysis of the REAL live
// analyzer for the text, at the job's own time (day words become dates then).
async function saveJob(customer, fields, { createdAt, status = 'open', closedAt = null, closeReason = null, activeBooking = null }) {
  const job = {
    taskType: null, preferredDate: null, timeSlot: null, urgent: false, budget: null, ...fields,
    skills: fields.skills.map((id) => ({ skillId: id, name: skillById(id).name })),
    region: regionOf(fields.city),
  };
  const doc = await JobRequest.create({
    ...job,
    code: await nextYearlyCode('jobRequestCode', 'JR', createdAt),
    customer: customer._id,
    status,
    closedAt,
    closeReason,
    activeBooking,
    analysis: analysisRecord(analyzeLive(job.description, createdAt), job, createdAt),
    synthetic: true,
  });
  await JobRequest.collection.updateOne({ _id: doc._id }, { $set: { createdAt, updatedAt: closedAt ?? createdAt } });
  return doc;
}

// Link an existing open request of the demo customer to a job, as the request with the job would have made it.
async function fromJob(booking, customer, fields, extra = {}) {
  const createdAt = new Date(new Date(booking.createdAt).getTime() - 15 * MIN);
  const job = await saveJob(customer, {
    ...fields, description: booking.description, city: booking.city, area: booking.area, preferredDate: booking.preferredDate, timeSlot: booking.timeSlot,
    category: booking.category, skills: [booking.skillId],
  }, { createdAt, activeBooking: booking._id, ...extra });
  await Booking.collection.updateOne({ _id: booking._id }, { $set: { jobRequest: job._id, jobCode: job.code, jobTaskType: job.taskType ?? null } });
  return job;
}

async function seed(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    if (await JobRequest.exists({ synthetic: true })) {
      console.log('Module 6 demo data is already there: nothing added.');
      return;
    }
    const find = (email) => User.findOne({ email });
    const [customer, worker, plumber, carpenter] = await Promise.all(['customer.demo@example.com', 'worker.demo@example.com', 'plumber.demo@example.com', 'carpenter.demo@example.com'].map(find));
    if (!customer || !worker || !plumber || !carpenter) throw new Error('Run the demo reset and the Module 4 demo seed first (the demo accounts are missing).');
    const open = (workerUser) => Booking.findOne({ customer: customer._id, workerUser: workerUser._id, status: trusted({ $in: ['requested', 'accepted'] }), jobRequest: null }).lean();
    const [waiting, accepted] = [await open(worker), await open(plumber)];
    if (waiting?.status !== 'requested' || accepted?.status !== 'accepted') throw new Error('The Module 4 demo requests of the demo customer are missing: run seedModule4Demo.js first.');
    const now = Date.now();

    // 1. open (Roman Urdu): electrical in Islamabad, with a private budget; Demo Electrician 1-3 can be asked
    await saveJob(customer, {
      description: 'Kitchen ki wiring kharab hai, do socket nahi chal rahe, kal shaam Islamabad mein koi aa jaye [demo]',
      inputMode: 'voice', category: 'electrical_solar', skills: ['elec_wiring', 'elec_fittings'], taskType: 'repair', city: 'Islamabad', area: 'F-10 Markaz',
      preferredDate: pktDate(new Date(now + DAY)), timeSlot: 'afternoon', budget: { amount: 3000, unit: 'job' }, // the customer changed the time
    }, { createdAt: new Date(now - 3 * HOUR) });

    // 2. requested (English): the open request to Demo Worker (the words found no trade: the customer chose it)
    await fromJob(waiting, customer, { inputMode: 'text', taskType: 'repair' });

    // 3. accepted (English): the accepted job with Demo Plumber, with a private budget
    await fromJob(accepted, customer, { inputMode: 'text', taskType: 'repair', budget: { amount: 2000, unit: 'job' } });

    // 4. done (Urdu): a door with Demo Carpenter, both pressed "Work done"
    const carpenterProfile = await WorkerProfile.findOne({ user: carpenter._id });
    const doneAt = new Date(now - 5 * DAY);
    const start = scheduledStartFor(pktDate(doneAt), 'morning');
    const createdAt = new Date(start.getTime() - 2 * DAY);
    const doneJob = await saveJob(customer, {
      description: 'کمرے کا دروازہ ٹوٹ گیا ہے، نیا لگوانا ہے، اسلام آباد میں [ڈیمو]',
      inputMode: 'text', category: 'carpentry_woodwork', skills: ['carp_doors'], taskType: 'install', city: 'Islamabad', area: 'G-11', preferredDate: pktDate(start), timeSlot: 'morning',
    }, { createdAt });
    const acceptedAt = new Date(createdAt.getTime() + HOUR);
    const workerDone = new Date(start.getTime() + 4 * HOUR);
    const both = new Date(workerDone.getTime() + HOUR);
    const done = await Booking.create({
      code: await nextBookingCode(), customer: customer._id, worker: carpenterProfile._id, workerUser: carpenter._id, skillId: 'carp_doors', skillName: skillById('carp_doors').name,
      category: 'carpentry_woodwork', preferredDate: pktDate(start), timeSlot: 'morning', scheduledStart: start, city: doneJob.city, region: doneJob.region, area: doneJob.area,
      description: doneJob.description, status: 'completed', outcome: 'completed', acceptedAt, workerConfirmedAt: workerDone, customerConfirmedAt: both, completedAt: both,
      completionMethod: 'both', closedAt: both, synthetic: true, jobRequest: doneJob._id, jobCode: doneJob.code, jobTaskType: doneJob.taskType,
      statusHistory: [event(null, 'requested', 'customer', new Date(createdAt.getTime() + 10 * MIN)), event('requested', 'accepted', 'worker', acceptedAt), event('accepted', 'accepted', 'worker', workerDone, 'confirmed_done'), event('accepted', 'completed', 'customer', both, 'both_confirmed')],
    });
    await Booking.collection.updateOne({ _id: done._id }, { $set: { createdAt: new Date(createdAt.getTime() + 10 * MIN) } });
    await JobRequest.collection.updateOne({ _id: doneJob._id }, { $set: { activeBooking: done._id } });
    await recomputeReputation(carpenterProfile._id);

    // 5. expired (Roman Urdu): saved 40 days ago, nobody was asked
    await saveJob(customer, {
      description: 'Ghar ki safai karwani hai, do kamray hain, Rawalpindi mein [demo]', inputMode: 'text', category: 'domestic_work', skills: ['dom_cleaning'], taskType: 'cleaning', city: 'Rawalpindi', area: 'Satellite Town',
    }, { createdAt: new Date(now - 40 * DAY) });

    // 6. closed (Urdu): the customer found someone elsewhere
    await saveJob(customer, {
      description: 'دو کمروں میں رنگ کروانا ہے، راولپنڈی میں [ڈیمو]', inputMode: 'voice', category: 'painting_renovation', skills: ['paint_interior'], taskType: 'new_work', city: 'Rawalpindi', area: 'Saddar',
    }, { createdAt: new Date(now - 6 * DAY), status: 'closed', closedAt: new Date(now - 2 * DAY), closeReason: 'found_elsewhere' });

    const jobs = await JobRequest.find({ synthetic: true }).select('code status').lean();
    console.log(`Module 6 demo data added (synthetic): ${jobs.length} job requests for customer.demo (${jobs.map((j) => j.code).join(', ')}), 1 new completed booking with Demo Carpenter.`);
    console.log('  see: customer.demo -> My job requests (every state); the open job -> Workers for this job -> Send this job (Demo Electrician 1-3)');
    console.log('       worker.demo -> Requests (from a job request) · plumber.demo -> My jobs (from a job request) · admin.demo -> Job requests');
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (err) => {
    console.error('Module 6 demo seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

export { main as seedModule6Demo };
