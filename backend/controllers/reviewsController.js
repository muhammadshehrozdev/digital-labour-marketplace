// Module 4: reviews after completed work, the public reputation lists, and the worker's own
// "My reputation" data (decisions D-040, D-041, D-047).
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { httpError } from '../utils/httpError.js';
import { writeAudit } from '../services/audit.js';
import { notify } from '../services/notifications.js';
import { hideSuspendedWorkers } from '../services/accountStatus.js';
import { canDo } from '../services/booking/transitions.js';
import { sweepBookings } from '../services/booking/sweep.js';
import { bookingParams } from '../services/booking/notify.js';
import { pktDate } from '../services/booking/schedule.js';
import { shortName } from '../services/booking/views.js';
import { trusted } from '../services/booking/lifecycle.js';
import { loadReputationInput, safeRecompute, reputationExplanation } from '../services/reputation/recompute.js';
import { snapshotFrom } from '../services/reputation/snapshot.js';
import { runPatternCheck } from '../services/reputation/patternCheck.js';
import { reputationRules } from '../services/reputation/rules.js';
import { BOOKING_RULES } from '../config/bookingRules.js';
import { DEFAULT_REPUTATION_PARAMS as P } from '../config/reputationParams.js';

export const WORK_HISTORY_LIMIT = 20;
const QUICK = ['onTime', 'workQuality', 'polite', 'priceAsAgreed', 'wouldHireAgain'];

// What anyone who may see the profile sees of a review: no account ids, phone, email or full name.
export const publicReviewView = (r, names) => ({
  _id: r._id,
  rating: r.rating,
  ...Object.fromEntries(QUICK.map((q) => [q, r[q] ?? null])),
  comment: r.comment ?? '',
  reviewer: shortName(names.get(String(r.customer))),
  skillId: r.skillId,
  createdAt: r.createdAt,
  reply: r.reply?.at ? { text: r.reply.text, at: r.reply.at } : null,
});

const ownReviewView = (r) => ({
  _id: r._id, booking: r.booking, rating: r.rating, ...Object.fromEntries(QUICK.map((q) => [q, r[q] ?? null])),
  comment: r.comment ?? '', status: r.status, createdAt: r.createdAt,
});

// POST /api/bookings/:id/review  (the customer of a completed booking; once; inside 14 days; no open dispute)
export const createReview = async (req, res) => {
  const now = new Date();
  const { id } = req.validated.params;
  const filter = { _id: id, customer: req.user._id };
  if (!(await Booking.exists(filter))) throw httpError(404, 'BOOKING_NOT_FOUND');
  await sweepBookings({ now, filter: { _id: new mongoose.Types.ObjectId(id) } });
  const b = await Booking.findOne(filter).lean();
  const hasReview = Boolean(await Review.exists({ booking: b._id }));
  const allowed = canDo('review', b, 'customer', now, { hasReview });
  if (!allowed.ok) {
    if (allowed.code === 'BOOKING_NOT_ALLOWED') throw httpError(400, 'REVIEW_NOT_ALLOWED');
    throw httpError(allowed.code === 'REVIEW_EXISTS' ? 409 : 400, allowed.code);
  }
  let review;
  try {
    review = await Review.create({ booking: b._id, worker: b.worker, workerUser: b.workerUser, customer: req.user._id, skillId: b.skillId, ...req.validated.body });
  } catch (err) {
    if (err.code === 11000) throw httpError(409, 'REVIEW_EXISTS'); // two sends at the same moment
    throw err;
  }
  // audit: the rating only, never the comment text
  await writeAudit({
    actor: req.user._id, actorRole: 'customer', action: 'review.created', targetType: 'Review', targetId: review._id,
    toState: 'visible', reason: `Review of booking ${b.code}`, details: { code: b.code, rating: review.rating, worker: String(b.worker) },
  });
  await notify(b.workerUser, 'review_received', bookingParams(b, { rating: review.rating }));
  await safeRecompute(b.worker, now);
  await runPatternCheck(b.worker, now);
  res.status(201).json({ review: ownReviewView(review.toObject()) });
};

// The profile behind /api/workers/:workerIdCode/... for this viewer: customers and admins (a suspended
// worker is hidden from customers), or the worker himself. Another worker gets 403.
async function profileForViewer(req) {
  const { workerIdCode } = req.validated.params;
  let filter = { workerIdCode };
  if (req.user.role === 'customer') filter = await hideSuspendedWorkers(filter);
  const profile = await WorkerProfile.findOne(filter).select('user workerIdCode').lean();
  if (!profile) throw httpError(404, 'WORKER_NOT_FOUND');
  if (req.user.role === 'worker' && String(profile.user) !== String(req.user._id)) throw httpError(403, 'FORBIDDEN');
  return profile;
}

const namesOf = async (reviews) => new Map((await User.find({ _id: trusted({ $in: [...new Set(reviews.map((r) => String(r.customer)))] }) }).select('name').lean()).map((u) => [String(u._id), u.name]));

// GET /api/workers/:workerIdCode/reviews?page=  — visible reviews, newest first
export const listWorkerReviews = async (req, res) => {
  const profile = await profileForViewer(req);
  const { page = 1, limit = 10 } = req.validated.query;
  const filter = { worker: profile._id, status: 'visible' };
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  const names = await namesOf(items);
  res.json({ reviews: items.map((r) => publicReviewView(r, names)), page, limit, total });
};

// GET /api/workers/:workerIdCode/work-history  — "Done through this platform": the latest 20 completed
// bookings: skill, month and year (Pakistan time), city, and the stars if the review is visible.
export const getWorkHistory = async (req, res) => {
  const profile = await profileForViewer(req);
  const done = await Booking.find({ worker: profile._id, status: 'completed' })
    .select('skillId skillName category city completedAt').sort({ completedAt: -1, _id: -1 }).limit(WORK_HISTORY_LIMIT).lean();
  const reviews = await Review.find({ booking: trusted({ $in: done.map((b) => b._id) }), status: 'visible' }).select('booking rating').lean();
  const stars = new Map(reviews.map((r) => [String(r.booking), r.rating]));
  const total = await Booking.countDocuments({ worker: profile._id, status: 'completed' });
  res.json({
    entries: done.map((b) => ({ _id: b._id, skillId: b.skillId, skillName: b.skillName ?? '', category: b.category, month: pktDate(b.completedAt).slice(0, 7), city: b.city, rating: stars.get(String(b._id)) ?? null })),
    total,
    limit: WORK_HISTORY_LIMIT,
  });
};

// GET /api/workers/me/reputation  (worker) — his own numbers, the per-review explanation, his own
// cancellations and the rules in force. Computed fresh (the stored snapshot may be a day old).
export const getMyReputation = async (req, res) => {
  const now = new Date();
  const profile = await WorkerProfile.findOne({ user: req.user._id }).select('_id workerIdCode').lean();
  if (!profile) throw httpError(404, 'PROFILE_NOT_CREATED');
  await sweepBookings({ now, filter: { workerUser: req.user._id } });
  const input = await loadReputationInput(profile._id);
  const { snapshot } = snapshotFrom({ ...input, now });
  const [explanation, cancellations] = await Promise.all([
    reputationExplanation(profile._id, now),
    Booking.find({ worker: profile._id, outcome: trusted({ $in: ['cancelled_by_worker_early', 'cancelled_by_worker_late', 'worker_no_show'] }) })
      .select('code skillId skillName scheduledStart closedAt outcome dispute.status dispute.decision').sort({ closedAt: -1 }).limit(50).lean(),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({
    workerIdCode: profile.workerIdCode,
    snapshot,
    perReview: explanation.perReview,
    hiddenReviews: explanation.hiddenCount,
    cancellations: cancellations.map((c) => ({
      _id: c._id, code: c.code, skillId: c.skillId, skillName: c.skillName ?? '', scheduledStart: c.scheduledStart, closedAt: c.closedAt, outcome: c.outcome,
      disputeStatus: c.dispute?.status ?? null, disputeDecision: c.dispute?.decision ?? null,
    })),
    rules: {
      // Batch 6B: the rules of the live engine as ids and numbers (rules.js), so the page says what the code does
      ...reputationRules(),
      lateCancelHours: BOOKING_RULES.LATE_CANCEL_HOURS,
      earlyCancelCounts: P.reliabilityNegative.cancelled_by_worker_early,
      lateCancelCounts: P.reliabilityNegative.cancelled_by_worker_late,
      halfLifeDays: P.halfLifeDays,
      disputeWindowDays: BOOKING_RULES.DISPUTE_WINDOW_DAYS,
    },
  });
};

async function myReview(req) {
  const review = await Review.findOne({ _id: req.validated.params.id, workerUser: req.user._id }).lean();
  if (!review) throw httpError(404, 'REVIEW_NOT_FOUND');
  return review;
}

// POST /api/reviews/:id/reply { text }  (the reviewed worker; once; final)
export const replyToReview = async (req, res) => {
  const review = await myReview(req);
  const now = new Date();
  const updated = await Review.findOneAndUpdate(
    { _id: review._id, workerUser: req.user._id, 'reply.at': null },
    { $set: { 'reply.text': req.validated.body.text, 'reply.at': now } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw httpError(409, 'REPLY_EXISTS');
  const b = await Booking.findById(updated.booking).select('code skillId skillName outcome').lean();
  await notify(updated.customer, 'review_reply', bookingParams(b ?? { _id: updated.booking }, { rating: updated.rating }));
  res.json({ review: { _id: updated._id, reply: { text: updated.reply.text, at: updated.reply.at } } });
};

// POST /api/reviews/:id/report { reasonCode, note? }  (the reviewed worker; once). Reporting does not hide.
export const reportReview = async (req, res) => {
  const review = await myReview(req);
  const { reasonCode, note } = req.validated.body;
  const updated = await Review.findOneAndUpdate(
    { _id: review._id, workerUser: req.user._id, reports: trusted({ $size: 0 }) },
    { $push: { reports: { reasonCode, note, at: new Date() } } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw httpError(409, 'REPORT_EXISTS');
  res.json({ review: { _id: updated._id, reported: true, status: updated.status } });
};
