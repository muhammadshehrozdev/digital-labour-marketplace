// Module 4, admin side: bookings and their timelines, the dispute queue and decisions, review
// moderation, reputation flags, a worker's full reputation breakdown, and chart data.
// Every route here is behind protect + requireRole('admin'). No phone number is ever sent from here
// (the contact block exists only in GET /api/bookings/:id). Every decision is audited.
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import ReputationFlag from '../models/ReputationFlag.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { httpError } from '../utils/httpError.js';
import { escapeRegex } from '../validators/common.js';
import { writeAudit } from '../services/audit.js';
import { notify } from '../services/notifications.js';
import { DISPUTE_DECISIONS } from '../config/bookingRules.js';
import { disputeResult } from '../services/booking/transitions.js';
import { sweepBookings } from '../services/booking/sweep.js';
import { afterClose, applyStep, trusted } from '../services/booking/lifecycle.js';
import { bookingParams } from '../services/booking/notify.js';
import { bookingView } from '../services/booking/views.js';
import { rangeForBooking } from '../services/wage/load.js';
import { peopleFor } from './bookingsController.js';
import { loadReputationInput, reputationExplanation, safeRecompute } from '../services/reputation/recompute.js';
import { snapshotFrom } from '../services/reputation/snapshot.js';
import { CHART_TIMEZONE, pktDay } from './adminInsightsController.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// ---- bookings ----

// GET /api/admin/bookings?status=&q=&page=  (q: booking code, worker ID, or a name)
export const listBookings = async (req, res) => {
  const now = new Date();
  await sweepBookings({ now });
  const { status = 'all', q, page = 1, limit = 25 } = req.validated.query;
  const filter = {};
  if (status === 'disputed') filter['dispute.status'] = 'open';
  else if (status !== 'all') filter.status = status;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    const [profiles, users] = await Promise.all([
      WorkerProfile.find({ workerIdCode: pattern }).select('_id').limit(200).lean(),
      User.find({ name: pattern }).select('_id').limit(200).lean(),
    ]);
    const userIds = users.map((u) => u._id);
    filter.$or = [{ code: pattern }, { worker: trusted({ $in: profiles.map((p) => p._id) }) }, { customer: trusted({ $in: userIds }) }, { workerUser: trusted({ $in: userIds }) }];
  }
  const [items, total] = await Promise.all([
    Booking.find(filter).select('-statusHistory').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);
  const people = await peopleFor(items);
  res.set('Cache-Control', 'no-store');
  res.json({ bookings: items.map((b) => bookingView(b, { viewer: 'admin', now, people: people(b) })), page, limit, total });
};

// GET /api/admin/bookings/:id — the full timeline (no phone numbers)
export const getBookingForAdmin = async (req, res) => {
  const now = new Date();
  const { id } = req.validated.params;
  if (!(await Booking.exists({ _id: id }))) throw httpError(404, 'BOOKING_NOT_FOUND');
  await sweepBookings({ now, filter: { _id: new mongoose.Types.ObjectId(id) } });
  const b = await Booking.findById(id).lean();
  const [people, review, range] = await Promise.all([peopleFor([b]), Review.findOne({ booking: b._id }).lean(), rangeForBooking(b, now)]);
  res.set('Cache-Control', 'no-store');
  res.json({
    booking: {
      ...bookingView(b, { viewer: 'admin', now, people: people(b), hasReview: Boolean(review), detail: true, range }),
      allowedDecisions: b.dispute?.status === 'open' ? DISPUTE_DECISIONS[b.dispute.type] : [],
      review: review ? { _id: review._id, rating: review.rating, status: review.status, createdAt: review.createdAt } : null,
    },
  });
};

// GET /api/admin/disputes?status=open — the queue, oldest first
export const listDisputes = async (req, res) => {
  const now = new Date();
  await sweepBookings({ now });
  const { status = 'open' } = req.validated.query;
  const filter = status === 'all' ? { 'dispute.type': trusted({ $ne: null }) } : { 'dispute.status': status };
  const items = await Booking.find(filter).sort({ 'dispute.openedAt': 1, _id: 1 }).limit(200).lean();
  const people = await peopleFor(items);
  res.set('Cache-Control', 'no-store');
  res.json({
    disputes: items.map((b) => ({ ...bookingView(b, { viewer: 'admin', now, people: people(b), detail: true }), allowedDecisions: DISPUTE_DECISIONS[b.dispute.type] ?? [] })),
    total: items.length,
  });
};

// PATCH /api/admin/bookings/:id/dispute { decision, note } — required note; 409 if already decided
export const decideDispute = async (req, res) => {
  const now = new Date();
  const { id } = req.validated.params;
  const { decision, note } = req.validated.body;
  const b = await Booking.findById(id).lean();
  if (!b) throw httpError(404, 'BOOKING_NOT_FOUND');
  if (b.dispute?.status !== 'open') throw httpError(409, b.dispute?.status === 'decided' ? 'DISPUTE_ALREADY_DECIDED' : 'DISPUTE_NOT_OPEN');
  if (!(DISPUTE_DECISIONS[b.dispute.type] ?? []).includes(decision)) throw httpError(400, 'DISPUTE_DECISION_INVALID');
  const result = disputeResult(b.dispute.type, decision, b);
  const decided = { 'dispute.status': 'decided', 'dispute.decision': decision, 'dispute.decisionNote': note, 'dispute.decidedBy': req.user._id, 'dispute.decidedAt': now };
  const changes = result.unchanged ? {} : {
    status: result.status,
    outcome: result.outcome,
    closedAt: b.closedAt ?? now,
    ...(result.status === 'completed' ? { completedAt: now, completionMethod: 'admin' } : {}),
    ...(result.status === 'cancelled' && b.status === 'accepted' ? { cancelledBy: 'admin', cancelReason: 'dispute_decision' } : {}),
  };
  const updated = await applyStep(b, { expect: { 'dispute.status': 'open' }, set: { ...decided, ...changes }, by: 'admin', reason: decision, now });
  if (!updated) throw httpError(409, 'DISPUTE_ALREADY_DECIDED');
  await writeAudit({
    actor: req.user._id, actorRole: 'admin', action: 'dispute.decided', targetType: 'Booking', targetId: updated._id,
    fromState: b.dispute.type, toState: decision, reason: note, details: { code: updated.code, type: b.dispute.type, decision, outcome: updated.outcome },
  });
  if (!result.unchanged && updated.outcome !== b.outcome) await afterClose(updated, { actorId: req.user._id, by: 'admin', now });
  else await safeRecompute(updated.worker, now);
  for (const user of [updated.customer, updated.workerUser]) await notify(user, 'dispute_decided', bookingParams(updated));
  const people = await peopleFor([updated]);
  res.json({ booking: bookingView(updated, { viewer: 'admin', now, people: people(updated), detail: true }) });
};

// ---- reviews ----

async function adminReviewViews(items) {
  const userIds = [...new Set(items.flatMap((r) => [String(r.customer), String(r.workerUser)]))];
  const [users, profiles, bookings] = await Promise.all([
    User.find({ _id: trusted({ $in: userIds }) }).select('name').lean(),
    WorkerProfile.find({ _id: trusted({ $in: items.map((r) => r.worker) }) }).select('workerIdCode').lean(),
    Booking.find({ _id: trusted({ $in: items.map((r) => r.booking) }) }).select('code completionMethod').lean(),
  ]);
  const name = new Map(users.map((u) => [String(u._id), u.name]));
  const code = new Map(profiles.map((p) => [String(p._id), p.workerIdCode]));
  const booking = new Map(bookings.map((b) => [String(b._id), b]));
  return items.map((r) => ({
    _id: r._id,
    rating: r.rating,
    onTime: r.onTime, workQuality: r.workQuality, polite: r.polite, priceAsAgreed: r.priceAsAgreed, wouldHireAgain: r.wouldHireAgain,
    comment: r.comment ?? '',
    status: r.status,
    hidden: r.status === 'hidden' ? { reasonCode: r.hidden?.reasonCode ?? null, note: r.hidden?.note ?? '', at: r.hidden?.at ?? null } : null,
    reply: r.reply?.at ? { text: r.reply.text, at: r.reply.at } : null,
    reports: (r.reports ?? []).map((p) => ({ reasonCode: p.reasonCode, note: p.note, at: p.at })),
    skillId: r.skillId,
    createdAt: r.createdAt,
    worker: { profileId: r.worker, name: name.get(String(r.workerUser)) ?? '', workerIdCode: code.get(String(r.worker)) ?? null },
    customer: { name: name.get(String(r.customer)) ?? '' },
    booking: { _id: r.booking, code: booking.get(String(r.booking))?.code ?? null, completionMethod: booking.get(String(r.booking))?.completionMethod ?? null },
    synthetic: Boolean(r.synthetic),
  }));
}

// GET /api/admin/reviews?status=&reported=  — reported reviews first, then newest
export const listReviewsForAdmin = async (req, res) => {
  const { status = 'all', reported, page = 1, limit = 25 } = req.validated.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (reported === 'true') filter['reports.0'] = trusted({ $exists: true });
  if (reported === 'false') filter['reports.0'] = trusted({ $exists: false });
  const [items, total, reportedOpen] = await Promise.all([
    Review.find(filter).sort({ 'reports.at': -1, createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments(filter),
    Review.countDocuments({ status: 'visible', 'reports.0': trusted({ $exists: true }) }),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({ reviews: await adminReviewViews(items), page, limit, total, reportedVisible: reportedOpen });
};

// Hide or restore one review (used by the moderation route and by the flag decision).
async function moderate(review, { action, reasonCode = null, note = '', admin, now }) {
  const toHide = action === 'hide';
  const updated = await Review.findOneAndUpdate(
    { _id: review._id, status: toHide ? 'visible' : 'hidden' },
    toHide
      ? { $set: { status: 'hidden', 'hidden.reasonCode': reasonCode, 'hidden.note': note, 'hidden.by': admin, 'hidden.at': now } }
      : { $set: { status: 'visible', 'hidden.reasonCode': null, 'hidden.note': '', 'hidden.by': null, 'hidden.at': null } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) return null;
  const b = await Booking.findById(updated.booking).select('code skillId skillName outcome').lean();
  await writeAudit({
    actor: admin, actorRole: 'admin', action: toHide ? 'review.hidden' : 'review.restored', targetType: 'Review', targetId: updated._id,
    fromState: toHide ? 'visible' : 'hidden', toState: updated.status, reason: toHide ? (note || reasonCode) : note,
    details: { code: b?.code ?? null, reasonCode, rating: updated.rating }, // never the comment text
  });
  const params = bookingParams(b ?? { _id: updated.booking }, { reasonCode, rating: updated.rating });
  for (const user of [updated.customer, updated.workerUser]) await notify(user, toHide ? 'review_hidden' : 'review_restored', params);
  return updated;
}

// PATCH /api/admin/reviews/:id { action: hide | restore, reasonCode?, note? }
export const moderateReview = async (req, res) => {
  const now = new Date();
  const review = await Review.findById(req.validated.params.id).lean();
  if (!review) throw httpError(404, 'REVIEW_NOT_FOUND');
  const updated = await moderate(review, { ...req.validated.body, admin: req.user._id, now });
  if (!updated) throw httpError(409, 'REVIEW_STATUS_CHANGED');
  await safeRecompute(updated.worker, now);
  res.json({ review: (await adminReviewViews([updated]))[0] });
};

// ---- reputation flags ----

async function flagViews(flags) {
  const reviews = await Review.find({ _id: trusted({ $in: flags.flatMap((f) => f.reviewIds) }) }).lean();
  const bookings = await Booking.find({ _id: trusted({ $in: flags.flatMap((f) => f.bookingIds) }) }).select('code completedAt status').lean();
  const profiles = await WorkerProfile.find({ _id: trusted({ $in: flags.map((f) => f.worker) }) }).select('workerIdCode user').populate('user', 'name').lean();
  const reviewViews = new Map((await adminReviewViews(reviews)).map((r) => [String(r._id), r]));
  const bookingById = new Map(bookings.map((b) => [String(b._id), b]));
  const profileById = new Map(profiles.map((p) => [String(p._id), p]));
  return flags.map((f) => ({
    _id: f._id,
    type: f.type,
    status: f.status,
    details: f.details ?? {},
    createdAt: f.createdAt,
    decision: f.decision?.at ? { note: f.decision.note, at: f.decision.at } : null,
    worker: { profileId: f.worker, workerIdCode: profileById.get(String(f.worker))?.workerIdCode ?? null, name: profileById.get(String(f.worker))?.user?.name ?? '' },
    reviews: f.reviewIds.map((id) => reviewViews.get(String(id))).filter(Boolean),
    bookings: f.bookingIds.map((id) => bookingById.get(String(id))).filter(Boolean).map((b) => ({ _id: b._id, code: b.code, completedAt: b.completedAt, status: b.status })),
  }));
}

// GET /api/admin/reputation-flags?status=open — oldest first
export const listFlags = async (req, res) => {
  const { status = 'open' } = req.validated.query;
  const flags = await ReputationFlag.find(status === 'all' ? {} : { status }).sort({ createdAt: 1, _id: 1 }).limit(200).lean();
  res.set('Cache-Control', 'no-store');
  res.json({ flags: await flagViews(flags), total: flags.length, open: await ReputationFlag.countDocuments({ status: 'open' }) });
};

// PATCH /api/admin/reputation-flags/:id { action: dismiss | hide_reviews, note }
export const decideFlag = async (req, res) => {
  const now = new Date();
  const { action, note } = req.validated.body;
  const flag = await ReputationFlag.findById(req.validated.params.id).lean();
  if (!flag) throw httpError(404, 'FLAG_NOT_FOUND');
  const updated = await ReputationFlag.findOneAndUpdate(
    { _id: flag._id, status: 'open' },
    { $set: { status: action === 'dismiss' ? 'dismissed' : 'actioned', 'decision.note': note, 'decision.by': req.user._id, 'decision.at': now } },
    { returnDocument: 'after' }
  ).lean();
  if (!updated) throw httpError(409, 'FLAG_ALREADY_DECIDED');
  let hidden = 0;
  if (action === 'hide_reviews') {
    const targets = await Review.find({ status: 'visible', $or: [{ _id: trusted({ $in: flag.reviewIds }) }, { booking: trusted({ $in: flag.bookingIds }) }] }).lean();
    for (const review of targets) {
      if (await moderate(review, { action: 'hide', reasonCode: 'fake_or_manipulated', note, admin: req.user._id, now })) hidden += 1;
    }
  }
  await writeAudit({
    actor: req.user._id, actorRole: 'admin', action: 'flag.decided', targetType: 'ReputationFlag', targetId: flag._id,
    fromState: 'open', toState: updated.status, reason: note, details: { type: flag.type, action, reviewsHidden: hidden },
  });
  await safeRecompute(flag.worker, now);
  res.json({ flag: (await flagViews([updated]))[0], reviewsHidden: hidden });
};

// ---- one worker's full breakdown ----

// GET /api/admin/workers/:id/reputation  (id = the WorkerProfile id)
export const getWorkerReputationForAdmin = async (req, res) => {
  const now = new Date();
  const profile = await WorkerProfile.findById(req.validated.params.id).select('workerIdCode user reputation').lean();
  if (!profile) throw httpError(404, 'WORKER_PROFILE_NOT_FOUND');
  const input = await loadReputationInput(profile._id);
  const { snapshot } = snapshotFrom({ ...input, now });
  const [explanation, flags, byStatus] = await Promise.all([
    reputationExplanation(profile._id, now),
    ReputationFlag.find({ worker: profile._id }).sort({ createdAt: -1 }).limit(20).lean(),
    Booking.aggregate([{ $match: { worker: profile._id } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const reviews = await Review.find({ worker: profile._id }).sort({ createdAt: -1 }).limit(100).lean();
  const views = new Map((await adminReviewViews(reviews)).map((r) => [String(r._id), r]));
  res.set('Cache-Control', 'no-store');
  res.json({
    workerIdCode: profile.workerIdCode,
    snapshot,
    storedSnapshot: profile.reputation ? { computedAt: profile.reputation.computedAt, engineVersion: profile.reputation.engineVersion, paramsHash: profile.reputation.paramsHash } : null,
    perReview: explanation.perReview.map((p) => ({ ...p, review: views.get(p.id) ?? null })),
    hiddenReviews: reviews.filter((r) => r.status === 'hidden').map((r) => views.get(String(r._id))),
    flags: await flagViews(flags),
    bookingsByStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.n])),
  });
};

// ---- chart data (real counts only) ----

// GET /api/admin/stats/bookings?days=30
export const getBookingStats = async (req, res) => {
  const days = req.validated.query.days ?? 30;
  const now = new Date();
  const firstDay = pktDay(new Date(now.getTime() - (days - 1) * DAY_MS));
  const since = new Date(new Date(`${firstDay}T00:00:00.000Z`).getTime() - 5 * 60 * 60 * 1000);
  const weeks = Math.ceil(days / 7);
  const weeksSince = new Date(now.getTime() - weeks * 7 * DAY_MS);
  const [perDay, ratings, closed, open] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: CHART_TIMEZONE } }, status: '$status' }, n: { $sum: 1 } } },
    ]),
    Review.aggregate([{ $match: { status: 'visible' } }, { $group: { _id: '$rating', n: { $sum: 1 } } }]),
    Booking.find({ closedAt: trusted({ $gte: weeksSince }), outcome: trusted({ $in: ['completed', 'cancelled_by_worker_early', 'cancelled_by_worker_late', 'worker_no_show'] }) }).select('closedAt outcome').lean(),
    Booking.countDocuments({ 'dispute.status': 'open' }),
  ]);
  const statuses = ['requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled'];
  const byDay = new Map();
  for (let i = 0; i < days; i += 1) {
    const date = pktDay(new Date(since.getTime() + i * DAY_MS + 2.5 * 60 * 60 * 1000));
    byDay.set(date, { date, ...Object.fromEntries(statuses.map((s) => [s, 0])) });
  }
  for (const row of perDay) {
    const day = byDay.get(row._id.day);
    if (day && row._id.status in day) day[row._id.status] = row.n;
  }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of ratings) if (row._id in distribution) distribution[row._id] = row.n;
  // week 1 = the oldest of the shown weeks; each week is 7 days ending today
  const perWeek = Array.from({ length: weeks }, (_, i) => ({ week: i + 1, from: pktDay(new Date(now.getTime() - (weeks - i) * 7 * DAY_MS + DAY_MS)), completed: 0, workerCancelled: 0, noShows: 0 }));
  for (const b of closed) {
    const index = weeks - 1 - Math.floor((now.getTime() - new Date(b.closedAt).getTime()) / (7 * DAY_MS));
    const week = perWeek[index];
    if (!week) continue;
    if (b.outcome === 'completed') week.completed += 1;
    else if (b.outcome === 'worker_no_show') week.noShows += 1;
    else week.workerCancelled += 1;
  }
  res.set('Cache-Control', 'no-store');
  res.json({
    days, timezone: CHART_TIMEZONE, generatedAt: now,
    bookingsPerDay: [...byDay.values()],
    ratingDistribution: distribution,
    perWeek,
    queues: { openDisputes: open, openFlags: await ReputationFlag.countDocuments({ status: 'open' }), reportedReviews: await Review.countDocuments({ status: 'visible', 'reports.0': trusted({ $exists: true }) }) },
  });
};
