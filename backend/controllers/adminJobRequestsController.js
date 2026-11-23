// Module 6 (Batch 8A): the admin's read-only view of job requests. The list has no budget; the detail has everything,
// with the customer's NAME only (never a phone number or an email). The statistics describe use, not accuracy (D-088).
import JobRequest from '../models/JobRequest.js';
import User from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { escapeRegex } from '../validators/common.js';
import { trusted } from '../services/booking/lifecycle.js';
import { ACTIVE_JOB_STATES } from '../config/jobRules.js';
import { stateOf, statesFor } from '../services/jobs/load.js';
import { adminJobListView, adminJobView, jobBookingView } from '../services/jobs/views.js';
import { keptStats } from '../services/jobs/stats.js';
import { peopleFor } from './bookingsController.js';

const DAY_MS = 24 * 60 * 60 * 1000;

async function customerNames(jobs) {
  const ids = [...new Set(jobs.map((j) => String(j.customer)))];
  const users = await User.find({ _id: trusted({ $in: ids }) }).select('name').lean();
  return new Map(users.map((u) => [String(u._id), u.name]));
}

// GET /api/admin/job-requests?state=&category=&q=&page=&limit=
export const listJobsForAdmin = async (req, res) => {
  const now = new Date();
  const { state = 'all', category, q, page = 1, limit = 25 } = req.validated.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.code = new RegExp(escapeRegex(q), 'i');
  const all = await JobRequest.find(filter).select('_id status createdAt').sort({ createdAt: -1, _id: -1 }).lean();
  const states = await statesFor(all, now);
  const wanted = all.filter((j) => {
    const s = states.get(String(j._id)).state;
    return state === 'all' || s === state || (state === 'active' && ACTIVE_JOB_STATES.includes(s));
  });
  const pageIds = wanted.slice((page - 1) * limit, page * limit).map((j) => j._id);
  const docs = await JobRequest.find({ _id: trusted({ $in: pageIds }) }).select('-budget').lean();
  const byId = new Map(docs.map((j) => [String(j._id), j]));
  const names = await customerNames(docs);
  res.set('Cache-Control', 'no-store');
  res.json({
    // a job deleted between the two reads is skipped (never a 500)
    jobs: pageIds.filter((id) => byId.has(String(id))).map((id) => {
      const job = byId.get(String(id));
      const { state: s, bookings } = states.get(String(id));
      return adminJobListView(job, { state: s, customerName: names.get(String(job.customer)), bookingsCount: bookings.length });
    }),
    page,
    limit,
    total: wanted.length,
  });
};

// GET /api/admin/job-requests/stats?days=7..90 — "how often did customers keep a suggestion?" (use, not accuracy)
export const jobStatsForAdmin = async (req, res) => {
  const days = req.validated.query.days ?? 30;
  const since = new Date(Date.now() - days * DAY_MS);
  const jobs = await JobRequest.find({ createdAt: trusted({ $gte: since }) }).select('inputMode category skills analysis.method analysis.suggested analysis.changed').lean();
  res.set('Cache-Control', 'no-store');
  res.json({ days, ...keptStats(jobs) });
};

// GET /api/admin/job-requests/:id — everything, including the budget, the analysis and the bookings
export const getJobForAdmin = async (req, res) => {
  const now = new Date();
  const job = await JobRequest.findById(req.validated.params.id).lean();
  if (!job) throw httpError(404, 'JOB_NOT_FOUND');
  const [{ state, bookings }, names] = await Promise.all([stateOf(job, now), customerNames([job])]);
  const people = await peopleFor(bookings);
  res.set('Cache-Control', 'no-store');
  res.json({ job: adminJobView(job, { state, customerName: names.get(String(job.customer)), bookings: bookings.map((b) => jobBookingView(b, people(b))) }) });
};
