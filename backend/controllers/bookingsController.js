// Module 4: the minimal Work Booking, for the two people in it (decision D-037).
// Ownership is checked on the server for every route: a booking is found only through a filter that
// contains the logged-in user's own id, so someone else's booking answers 404 (not 403), and nobody
// learns that it exists. Every step: canDo (pure rules) -> one conditional update -> 409 on conflict.
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { prepareBookingRequest, createBookingRecord, afterBookingRequest } from '../services/booking/create.js';
import { httpError } from '../utils/httpError.js';
import { OPEN_STATUSES } from '../config/bookingRules.js';
import { notify } from '../services/notifications.js';
import { writeAudit } from '../services/audit.js';
import { canDo, cancelOutcome } from '../services/booking/transitions.js';
import { contactBlock } from '../services/booking/contact.js';
import { sweepBookings } from '../services/booking/sweep.js';
import { afterClose, applyStep, closeValues, trusted } from '../services/booking/lifecycle.js';
import { bookingParams } from '../services/booking/notify.js';
import { bookingView } from '../services/booking/views.js';
import { rangeForBooking } from '../services/wage/load.js';

export const roleOf = (req) => req.user.role; // 'customer' | 'worker' (routes allow only these two and admin)
const mineFilter = (req) => (roleOf(req) === 'worker' ? { workerUser: req.user._id } : { customer: req.user._id });
export const otherSide = (b, role) => (role === 'customer' ? b.workerUser : b.customer);

// Names for the views: the worker's public name and ID, the customer's name (shortened for the worker).
export async function peopleFor(bookings) {
  const userIds = [...new Set(bookings.flatMap((b) => [String(b.customer), String(b.workerUser)]))];
  const profileIds = [...new Set(bookings.map((b) => String(b.worker)))];
  const [users, profiles] = await Promise.all([
    User.find({ _id: trusted({ $in: userIds }) }).select('name').lean(),
    WorkerProfile.find({ _id: trusted({ $in: profileIds }) }).select('workerIdCode').lean(),
  ]);
  const name = new Map(users.map((u) => [String(u._id), u.name]));
  const code = new Map(profiles.map((p) => [String(p._id), p.workerIdCode]));
  return (b) => ({ workerName: name.get(String(b.workerUser)) ?? '', workerIdCode: code.get(String(b.worker)) ?? null, customerName: name.get(String(b.customer)) ?? '' });
}

async function reviewedSet(bookings) {
  const done = bookings.filter((b) => b.status === 'completed').map((b) => b._id);
  if (done.length === 0) return new Set();
  return new Set((await Review.find({ booking: trusted({ $in: done }) }).select('booking').lean()).map((r) => String(r.booking)));
}

// Loads one of MY bookings (or any, for an admin), after applying its due timers.
export async function loadOwn(req, now) {
  const { id } = req.validated.params;
  const filter = roleOf(req) === 'admin' ? { _id: id } : { _id: id, ...mineFilter(req) };
  if (!(await Booking.exists(filter))) throw httpError(404, 'BOOKING_NOT_FOUND');
  await sweepBookings({ now, filter: { _id: new mongoose.Types.ObjectId(id) } });
  return Booking.findOne(filter).lean();
}

async function detailResponse(b, viewer, now) {
  const [people, review, range] = await Promise.all([
    peopleFor([b]),
    Review.findOne({ booking: b._id }).select('rating createdAt status').lean(),
    rangeForBooking(b, now), // Module 5: for the "lower than most prices on this platform" check
  ]);
  const view = bookingView(b, { viewer, now, people: people(b), hasReview: Boolean(review), detail: true, range });
  view.review = review ? { rating: review.rating, createdAt: review.createdAt, status: review.status } : null;
  view.contact = await contactBlock(b, viewer, now); // null unless the contact window is open (D-002)
  return view;
}

function check(action, b, role, now, extra) {
  const result = canDo(action, b, role, now, extra);
  if (!result.ok) throw httpError(result.code === 'FORBIDDEN' ? 403 : ['REVIEW_EXISTS', 'BOOKING_CHANGED'].includes(result.code) ? 409 : 400, result.code);
  return result;
}

export const respond = async (res, b, req, now, status = 200) => {
  res.set('Cache-Control', 'no-store');
  res.status(status).json({ booking: await detailResponse(b, roleOf(req), now) });
};

// POST /api/bookings  (customer) — a hire request to one worker. The checks, the limits, the notification and the
// audit entry are shared with Module 6's request with a job (services/booking/create.js).
export const createBooking = async (req, res) => {
  const now = new Date();
  const body = req.validated.body;
  const checked = await prepareBookingRequest(req.user, body, now);
  const created = await createBookingRecord(req.user, checked, body, now);
  await afterBookingRequest(req.user, created);
  await respond(res, created.booking.toObject(), req, now, 201);
};

// GET /api/bookings/mine?as=&status=active|past|all|<status>&page=  — own bookings, no phone numbers
export const listMyBookings = async (req, res) => {
  const now = new Date();
  const { as, status = 'all', page = 1, limit = 20 } = req.validated.query;
  if (as && as !== roleOf(req)) throw httpError(403, 'FORBIDDEN');
  const mine = mineFilter(req);
  await sweepBookings({ now, filter: mine });
  const filter = { ...mine };
  if (status === 'active') filter.status = trusted({ $in: OPEN_STATUSES });
  else if (status === 'past') filter.status = trusted({ $nin: OPEN_STATUSES });
  else if (status !== 'all') filter.status = status;
  const [items, total, requested, accepted] = await Promise.all([
    Booking.find(filter).select('-statusHistory -dispute.note -dispute.decisionNote -termsHistory -payments').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Booking.countDocuments(filter),
    Booking.countDocuments({ ...mine, status: 'requested' }),
    Booking.countDocuments({ ...mine, status: 'accepted' }),
  ]);
  const [people, reviewed] = await Promise.all([peopleFor(items), reviewedSet(items)]);
  res.set('Cache-Control', 'no-store');
  res.json({
    bookings: items.map((b) => bookingView(b, { viewer: roleOf(req), now, people: people(b), hasReview: reviewed.has(String(b._id)) })),
    counts: { requested, accepted },
    page, limit, total,
  });
};

// GET /api/bookings/:id  (the two people, admin) — the only place phone numbers can appear
export const getBooking = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  await respond(res, b, req, now);
};

// POST /api/bookings/:id/accept  (the worker)
export const acceptBooking = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  check('accept', b, roleOf(req), now);
  const updated = await applyStep(b, { set: { status: 'accepted', acceptedAt: now }, by: 'worker', now });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await notify(updated.customer, 'booking_accepted', bookingParams(updated));
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/decline { reason? }  (the worker) — declining never counts against a worker
export const declineBooking = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  check('decline', b, roleOf(req), now);
  const updated = await applyStep(b, { set: closeValues('declined', 'declined', now, { declineReason: req.validated.body.reason ?? null }), by: 'worker', reason: req.validated.body.reason ?? null, now });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await notify(updated.customer, 'booking_declined', bookingParams(updated, { reasonCode: updated.declineReason }));
  await afterClose(updated, { actorId: req.user._id, by: 'worker', now });
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/cancel { reason }  (customer or worker; a reason is required after acceptance)
export const cancelBooking = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  check('cancel', b, role, now);
  const { reason = null } = req.validated.body;
  if (b.status === 'accepted' && !reason) throw httpError(400, 'CANCEL_REASON_REQUIRED');
  const outcome = cancelOutcome(b, role, now);
  const updated = await applyStep(b, {
    expect: { customerConfirmedAt: null, workerConfirmedAt: null, 'noShow.reportedAt': null },
    set: closeValues('cancelled', outcome, now, { cancelledBy: role, cancelReason: reason }),
    by: role,
    reason,
    now,
  });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await notify(otherSide(updated, role), 'booking_cancelled', bookingParams(updated, { reasonCode: reason }));
  await afterClose(updated, { actorId: req.user._id, by: role, now });
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/confirm-done  (each side once; both -> completed)
export const confirmDone = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  check('confirm_done', b, role, now);
  const mine = role === 'customer' ? 'customerConfirmedAt' : 'workerConfirmedAt';
  let updated = await applyStep(b, { expect: { [mine]: null, 'noShow.reportedAt': null, 'dispute.status': trusted({ $ne: 'open' }) }, set: { [mine]: now }, by: role, reason: 'confirmed_done', now });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  if (updated.customerConfirmedAt && updated.workerConfirmedAt) {
    // both pressed "Work done": complete it (only one of two simultaneous presses can win this step)
    const completed = await applyStep(updated, {
      expect: { customerConfirmedAt: trusted({ $ne: null }), workerConfirmedAt: trusted({ $ne: null }) },
      set: closeValues('completed', 'completed', now, { completedAt: now, completionMethod: 'both' }),
      by: role,
      reason: 'both_confirmed',
      now,
    });
    if (completed) {
      updated = completed;
      await notify(updated.workerUser, 'booking_completed', bookingParams(updated));
      await notify(updated.customer, 'review_requested', bookingParams(updated));
      await afterClose(updated, { actorId: req.user._id, by: role, now });
    } else {
      updated = await Booking.findById(b._id).lean();
    }
  } else {
    await notify(otherSide(updated, role), 'booking_confirm_request', bookingParams(updated));
  }
  await respond(res, updated, req, now);
};

async function openDispute(req, b, { type, reasonCode = null, note = '', set = {}, now }) {
  const role = roleOf(req);
  const updated = await applyStep(b, {
    expect: { 'dispute.type': null, ...(set.expect ?? {}) },
    set: { ...(set.values ?? {}), dispute: { type, openedBy: role, reasonCode, note, openedAt: now, status: 'open', decision: null, decisionNote: '', decidedBy: null, decidedAt: null } },
    by: role,
    reason: `dispute_${type}`,
    now,
  });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await writeAudit({
    actor: req.user._id, actorRole: role, action: 'dispute.opened', targetType: 'Booking', targetId: updated._id,
    toState: 'open', reason: `Dispute ${type} on booking ${updated.code}`, details: { code: updated.code, type, reasonCode },
  });
  await notify(otherSide(updated, role), 'dispute_opened', bookingParams(updated, { reasonCode }));
  return updated;
}

// POST /api/bookings/:id/contest-done { reasonCode?, note? }  — "This work was not done"
export const contestDone = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  check('contest_done', b, role, now);
  const mine = role === 'customer' ? 'customerConfirmedAt' : 'workerConfirmedAt';
  const theirs = role === 'customer' ? 'workerConfirmedAt' : 'customerConfirmedAt';
  const { reasonCode = 'work_not_done', note } = req.validated.body;
  const updated = await openDispute(req, b, { type: 'completion_contested', reasonCode, note, set: { expect: { [mine]: null, [theirs]: trusted({ $ne: null }) } }, now });
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/no-show  (the customer, from the start time + 2 hours)
export const reportNoShow = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  check('report_no_show', b, roleOf(req), now);
  const updated = await applyStep(b, {
    expect: { customerConfirmedAt: null, workerConfirmedAt: null, 'noShow.reportedAt': null },
    set: { 'noShow.reportedAt': now },
    by: 'customer',
    reason: 'no_show_reported',
    now,
  });
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await notify(updated.workerUser, 'no_show_reported', bookingParams(updated));
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/no-show/respond { answer: admit | dispute, note? }  (the worker)
export const respondNoShow = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  check('respond_no_show', b, roleOf(req), now);
  const { answer, note } = req.validated.body;
  const unanswered = { 'noShow.reportedAt': trusted({ $ne: null }), 'noShow.workerResponse': null };
  let updated;
  if (answer === 'admit') {
    updated = await applyStep(b, {
      expect: unanswered,
      set: closeValues('cancelled', 'worker_no_show', now, { cancelledBy: 'system', cancelReason: 'no_show', 'noShow.workerResponse': 'admit', 'noShow.respondedAt': now }),
      by: 'worker',
      reason: 'no_show_admitted',
      now,
    });
    if (!updated) throw httpError(409, 'BOOKING_CHANGED');
    await notify(updated.customer, 'booking_cancelled', bookingParams(updated, { reasonCode: 'no_show' }));
    await afterClose(updated, { actorId: req.user._id, by: 'worker', now });
  } else {
    updated = await openDispute(req, b, {
      type: 'no_show_contested', reasonCode: 'i_did_come', note,
      set: { expect: unanswered, values: { 'noShow.workerResponse': 'dispute', 'noShow.respondedAt': now } },
      now,
    });
  }
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/dispute { reasonCode, note? }  (the worker: a cancellation that counts against
// him, or a no-show that was confirmed only because he did not answer; within 14 days)
export const workerDispute = async (req, res) => {
  const now = new Date();
  const b = await loadOwn(req, now);
  const { type } = check('dispute', b, roleOf(req), now);
  const { reasonCode, note } = req.validated.body;
  const updated = await openDispute(req, b, { type, reasonCode, note, set: { expect: { outcome: b.outcome } }, now });
  await respond(res, updated, req, now);
};
