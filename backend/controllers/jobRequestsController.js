// Module 6 (Batch 8A): the customer's job requests (decisions D-080 to D-084).
// Ownership is checked on the server for every route: a job is found only through a filter that contains the
// logged-in customer's own id, so someone else's job answers 404 JOB_NOT_FOUND (never 403) and nobody learns that it
// exists. Every change is ONE conditional update on what was checked (version, status, activeBooking): 409 on conflict.
// Workers never reach these routes (403 in routes/jobRequests.js). The job's text is never logged.
import mongoose from 'mongoose';
import JobRequest from '../models/JobRequest.js';
import Booking from '../models/Booking.js';
import { httpError } from '../utils/httpError.js';
import { skillById } from '../config/skillTaxonomy.js';
import { regionOf } from '../config/regions.js';
import { BOOKING_RULES } from '../config/bookingRules.js';
import { ACTIVE_JOB_STATES, JOB_RULES } from '../config/jobRules.js';
import { isAllowedDate, addHours } from '../services/booking/schedule.js';
import { trusted } from '../services/booking/lifecycle.js';
import { prepareBookingRequest, createBookingRecord, afterBookingRequest } from '../services/booking/create.js';
import { nextYearlyCode } from '../services/codes.js';
import { analyzeLive } from '../services/jobAnalyzer/live.js';
import { analysisRecord, changedFor } from '../services/jobs/analysis.js';
import { canJob, jobActions, reservationIsFree } from '../services/jobs/state.js';
import { stateOf, statesFor } from '../services/jobs/load.js';
import { jobBookingView, ownerJobView } from '../services/jobs/views.js';
import { workersForJob } from '../services/jobs/workersForJob.js';
import { peopleFor, respond } from './bookingsController.js';

const nextJobCode = (now) => nextYearlyCode('jobRequestCode', 'JR', now);
const noStore = (res) => res.set('Cache-Control', 'no-store');

// One of MY jobs (lean) or 404.
async function loadOwnJob(req) {
  const job = await JobRequest.findOne({ _id: req.validated.params.id, customer: req.user._id }).lean();
  if (!job) throw httpError(404, 'JOB_NOT_FOUND');
  return job;
}

// The confirmed fields -> the stored fields (skill names from the taxonomy; the region from the city table).
function confirmedFields(fields, now) {
  const out = { ...fields };
  if (fields.skills !== undefined) out.skills = fields.skills.map((id) => ({ skillId: id, name: skillById(id).name }));
  if (fields.city !== undefined) out.region = regionOf(fields.city);
  if (fields.preferredDate && !isAllowedDate(fields.preferredDate, now)) throw httpError(400, 'BOOKING_DATE_RANGE', { max: BOOKING_RULES.MAX_DAYS_AHEAD });
  return out;
}

// Every skill must be in the job's trade.
function checkSkillsFitTrade(job) {
  if ((job.skills ?? []).some((s) => skillById(s.skillId)?.category !== job.category)) throw httpError(400, 'JOB_SKILL_CATEGORY');
}

async function detail(job, now, { status = 200 } = {}, res) {
  const { state, bookings } = await stateOf(job, now);
  const people = await peopleFor(bookings);
  noStore(res);
  res.status(status).json({
    job: ownerJobView(job, {
      state,
      actions: jobActions(state, { hasBookings: bookings.length > 0 }),
      bookingsCount: bookings.length,
      analysis: true,
      bookings: bookings.map((b) => jobBookingView(b, people(b))),
    }),
  });
}

// POST /api/job-requests/analyze  (customer, admin) — the live analyzer's suggestions. Saves NOTHING, logs no text.
export const analyzeText = async (req, res) => {
  noStore(res);
  res.json(analyzeLive(req.validated.body.text, new Date()));
};

// POST /api/job-requests  (customer)
export const createJob = async (req, res) => {
  const now = new Date();
  const body = req.validated.body;
  const open = await JobRequest.find({
    customer: req.user._id,
    status: 'open',
    $or: [{ createdAt: trusted({ $gte: new Date(now.getTime() - JOB_RULES.OPEN_DAYS * 24 * 3600 * 1000) }) }, { activeBooking: trusted({ $ne: null }) }],
  }).select('_id status createdAt').lean();
  const states = await statesFor(open, now);
  const active = [...states.values()].filter((s) => ACTIVE_JOB_STATES.includes(s.state)).length;
  if (active >= JOB_RULES.MAX_OPEN_PER_CUSTOMER) throw httpError(409, 'JOB_LIMIT_OPEN', { max: JOB_RULES.MAX_OPEN_PER_CUSTOMER });
  const today = await JobRequest.countDocuments({ customer: req.user._id, createdAt: trusted({ $gte: addHours(now, -24) }) });
  if (today >= JOB_RULES.MAX_NEW_PER_DAY) throw httpError(429, 'JOB_LIMIT_DAY', { max: JOB_RULES.MAX_NEW_PER_DAY });

  const fields = confirmedFields({ taskType: null, preferredDate: null, timeSlot: null, urgent: false, budget: null, ...body }, now);
  checkSkillsFitTrade(fields);
  const job = await JobRequest.create({
    ...fields,
    code: await nextJobCode(now),
    customer: req.user._id,
    analysis: analysisRecord(analyzeLive(fields.description, now), fields, now),
  });
  await detail(job.toObject(), now, { status: 201 }, res);
};

// GET /api/job-requests/mine?state=&page=&limit=  (customer) — own jobs, newest first, with state and actions
export const listMyJobs = async (req, res) => {
  const now = new Date();
  const { state = 'all', page = 1, limit = 20 } = req.validated.query;
  const all = await JobRequest.find({ customer: req.user._id }).select('_id status createdAt').sort({ createdAt: -1, _id: -1 }).lean();
  const states = await statesFor(all, now);
  const counts = Object.fromEntries(['open', 'requested', 'accepted', 'done', 'expired', 'closed'].map((s) => [s, 0]));
  for (const s of states.values()) counts[s.state] += 1;
  counts.active = ACTIVE_JOB_STATES.reduce((n, s) => n + counts[s], 0);
  const wanted = all.filter((j) => {
    const s = states.get(String(j._id)).state;
    return state === 'all' || s === state || (state === 'active' && ACTIVE_JOB_STATES.includes(s));
  });
  const pageIds = wanted.slice((page - 1) * limit, page * limit).map((j) => j._id);
  const docs = new Map((await JobRequest.find({ _id: trusted({ $in: pageIds }), customer: req.user._id }).lean()).map((j) => [String(j._id), j]));
  noStore(res);
  res.json({
    // a job deleted between the two reads is skipped (never a 500)
    jobs: pageIds.filter((id) => docs.has(String(id))).map((id) => {
      const job = docs.get(String(id));
      const { state: s, bookings } = states.get(String(id));
      return ownerJobView(job, { state: s, actions: jobActions(s, { hasBookings: bookings.length > 0 }), bookingsCount: bookings.length });
    }),
    counts,
    page,
    limit,
    total: wanted.length,
  });
};

// GET /api/job-requests/:id  (customer, owner)
export const getMyJob = async (req, res) => {
  await detail(await loadOwnJob(req), new Date(), {}, res);
};

// PATCH /api/job-requests/:id { baseVersion, ...fields }  (customer, owner) — only while the job is open
export const updateJob = async (req, res) => {
  const now = new Date();
  const { baseVersion, ...changes } = req.validated.body;
  const job = await loadOwnJob(req);
  const { state, bookings } = await stateOf(job, now);
  if (!canJob('edit', state)) throw httpError(409, 'JOB_NOT_EDITABLE');
  if (baseVersion !== job.version) throw httpError(409, 'JOB_CHANGED');
  // a request reserved the job and its booking is being written right now (D-082): the worker gets the text as it was
  const current = job.activeBooking ? bookings.find((b) => String(b._id) === String(job.activeBooking)) ?? null : null;
  if (!reservationIsFree(job.activeBooking, current, now)) throw httpError(409, 'JOB_NOT_EDITABLE');

  const set = confirmedFields(changes, now);
  const merged = { ...job, ...set };
  checkSkillsFitTrade(merged);
  // a changed description is analysed again; the "changed" flags are always computed from the saved values
  const analysis = set.description !== undefined && set.description !== job.description
    ? analysisRecord(analyzeLive(merged.description, now), merged, now)
    : { ...job.analysis, changed: changedFor(job.analysis.suggested, merged) };
  const updated = await JobRequest.findOneAndUpdate(
    { _id: job._id, customer: req.user._id, status: 'open', version: job.version, activeBooking: job.activeBooking ?? null },
    { $set: { ...set, analysis }, $inc: { version: 1 } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw httpError(409, 'JOB_CHANGED');
  await detail(updated, now, {}, res);
};

// POST /api/job-requests/:id/close { reason }  (customer, owner). Never changes the job's bookings.
export const closeJob = async (req, res) => {
  const now = new Date();
  const job = await loadOwnJob(req);
  const { state } = await stateOf(job, now);
  if (!canJob('close', state)) throw httpError(409, 'JOB_NOT_OPEN');
  const updated = await JobRequest.findOneAndUpdate(
    { _id: job._id, customer: req.user._id, status: 'open' },
    { $set: { status: 'closed', closedAt: now, closeReason: req.validated.body.reason } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw httpError(409, 'JOB_NOT_OPEN');
  await detail(updated, now, {}, res);
};

// DELETE /api/job-requests/:id  (customer, owner) — only a job that was never sent to a worker
export const deleteJob = async (req, res) => {
  const now = new Date();
  const job = await loadOwnJob(req);
  if (await Booking.exists({ jobRequest: job._id })) throw httpError(409, 'JOB_HAS_BOOKINGS');
  // a reservation whose booking is being written right now (D-082)
  if (!reservationIsFree(job.activeBooking, null, now)) throw httpError(409, 'JOB_HAS_OPEN_REQUEST');
  const removed = await JobRequest.deleteOne({ _id: job._id, customer: req.user._id, activeBooking: job.activeBooking ?? null });
  if (removed.deletedCount !== 1) throw httpError(409, 'JOB_HAS_BOOKINGS');
  res.status(204).end();
};

// GET /api/job-requests/:id/workers  (customer, owner) — "workers for this job" (a filter, not a ranking)
export const listWorkersForJob = async (req, res) => {
  const now = new Date();
  const job = await loadOwnJob(req);
  const { state } = await stateOf(job, now);
  if (!canJob('find_workers', state)) throw httpError(409, 'JOB_NOT_OPEN');
  noStore(res);
  res.json(await workersForJob(job, req.validated.query));
};

// POST /api/job-requests/:id/request { jobVersion, workerIdCode, skillId, preferredDate, timeSlot, offer? }  (customer,
// owner) — ONE open request per job, by a reservation (compare-and-swap on activeBooking, D-082):
//   1. the job's state and version   2. every check of POST /api/bookings (+ the skill is in the job's trade)
//   3. reserve: one conditional update from the value read to a new booking id (the loser of two taps gets 409)
//   4. write the booking with that id; city, area and description are copied from the job; never the budget
//   5. if writing the booking fails, release the reservation and rethrow
export const requestWorkerForJob = async (req, res) => {
  const now = new Date();
  const body = req.validated.body;
  const job = await loadOwnJob(req);
  const { state, bookings } = await stateOf(job, now);
  if (state === 'requested' || state === 'accepted') throw httpError(409, 'JOB_HAS_OPEN_REQUEST');
  if (!canJob('request', state)) throw httpError(409, 'JOB_NOT_OPEN');
  if (body.jobVersion !== job.version) throw httpError(409, 'JOB_CHANGED');

  const checked = await prepareBookingRequest(req.user, body, now, { jobCategory: job.category });

  const read = job.activeBooking ?? null;
  const current = read ? bookings.find((b) => String(b._id) === String(read)) ?? null : null;
  if (!reservationIsFree(read, current, now)) throw httpError(409, 'JOB_HAS_OPEN_REQUEST');
  const bookingId = new mongoose.Types.ObjectId();
  const reserved = await JobRequest.findOneAndUpdate(
    { _id: job._id, customer: req.user._id, status: 'open', version: job.version, activeBooking: read },
    { $set: { activeBooking: bookingId } },
    { returnDocument: 'after' }
  ).lean();
  if (!reserved) throw httpError(409, 'JOB_HAS_OPEN_REQUEST');

  let created;
  try {
    created = await createBookingRecord(req.user, checked, {
      preferredDate: body.preferredDate, timeSlot: body.timeSlot, city: job.city, area: job.area, description: job.description, offer: body.offer,
    }, now, { _id: bookingId, jobRequest: job._id, jobCode: job.code, jobTaskType: job.taskType ?? null });
  } catch (err) {
    await JobRequest.updateOne({ _id: job._id, activeBooking: bookingId }, { $set: { activeBooking: read } });
    throw err;
  }
  await afterBookingRequest(req.user, created);
  await respond(res, created.booking.toObject(), req, now, 201);
};
