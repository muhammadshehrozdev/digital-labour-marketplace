// Module 5 (Batch 7): price terms, payment records and price information.
// Ownership: every booking route loads the booking through loadOwn (a filter with the logged-in user's own id,
// so someone else's booking answers 404). Every step: pure rules (services/wage/*) -> ONE conditional update on
// `moneyVersion` (and the state that was checked) -> 409 on conflict. `paymentState` is computed from exactly
// the data it is stored with. The app never moves money.
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { httpError } from '../utils/httpError.js';
import { notify } from '../services/notifications.js';
import { writeAudit } from '../services/audit.js';
import { bookingParams } from '../services/booking/notify.js';
import { loadOwn, otherSide, respond, roleOf } from './bookingsController.js';
import { regionOf } from '../config/regions.js';
import { skillById } from '../config/skillTaxonomy.js';
import { WAGE_RULES } from '../config/wageRules.js';
import { canTerms, currentVersion, snapshotOf, termsFields } from '../services/wage/termsRules.js';
import { canRecordPayment, canRespondPayment, checkPaidOn } from '../services/wage/paymentRules.js';
import { earningsByMonth, paymentSummary } from '../services/wage/paymentSummary.js';
import { termsChecks } from '../services/wage/termsChecks.js';
import { wageReferenceFor } from '../services/wage/wageReference.js';
import { wageReferenceView } from '../services/wage/views.js';
import { guideFor, platformRange } from '../services/wage/load.js';

const trusted = (value) => mongoose.trusted(value);
const STATUS_OF = { FORBIDDEN: 403, TERMS_CHANGED: 409, PAYMENT_CHANGED: 409, PAYMENT_NOT_FOUND: 404 };
const PARAMS_OF = { TERMS_LIMIT: { max: WAGE_RULES.MAX_TERMS_VERSIONS }, PAYMENT_LIMIT: { max: WAGE_RULES.MAX_PAYMENTS }, PAYMENT_WINDOW_PASSED: { days: WAGE_RULES.PAYMENT_RECORD_DAYS } };
const refuse = (result) => httpError(STATUS_OF[result.code] ?? 400, result.code, PARAMS_OF[result.code]);
const prefixed = (prefix, fields) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [`${prefix}${k}`, v]));

// The conditions every terms step repeats in its update (the same as canTerms checked on the loaded booking).
const termsOpen = (b) => ({
  _id: b._id, status: b.status, moneyVersion: b.moneyVersion ?? 0, 'terms.version': currentVersion(b),
  customerConfirmedAt: null, workerConfirmedAt: null, 'noShow.reportedAt': null, 'dispute.status': trusted({ $ne: 'open' }),
});

// After a lost conditional update: say what changed (the price itself, or something else on the booking).
async function lostRace(b, code) {
  const now = await Booking.findById(b._id).select('terms.version').lean();
  return httpError(409, currentVersion(now ?? {}) !== currentVersion(b) ? 'TERMS_CHANGED' : code);
}

// POST /api/bookings/:id/terms  (customer or worker) — propose a new version of the price terms
export const proposeTerms = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  const { baseVersion, ...input } = req.validated.body;
  const allowed = canTerms('propose_terms', b, role, { seen: baseVersion });
  if (!allowed.ok) throw refuse(allowed);
  const fields = termsFields(input);
  const version = currentVersion(b) + 1;
  const updated = await Booking.findOneAndUpdate(
    termsOpen(b),
    {
      $set: { 'terms.status': 'proposed', 'terms.version': version, 'terms.proposedBy': role, 'terms.proposedAt': now, ...prefixed('terms.', fields) },
      $push: { termsHistory: { version, by: role, action: 'proposed', at: now, snapshot: snapshotOf(fields) } },
      $inc: { moneyVersion: 1 },
    },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw await lostRace(b, 'BOOKING_CHANGED');
  await writeAudit({
    actor: req.user._id, actorRole: role, action: 'terms.proposed', targetType: 'Booking', targetId: updated._id, toState: 'proposed',
    reason: `Price terms version ${version} proposed on ${updated.code}`, details: { code: updated.code, version, amount: fields.amount, unit: fields.unit, total: fields.total },
  });
  await notify(otherSide(updated, role), 'terms_proposed', bookingParams(updated, { amount: fields.amount, unit: fields.unit }));
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/terms/agree { version }  (the person who did not propose the current version)
export const agreeTerms = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  const allowed = canTerms('agree_terms', b, role, { seen: req.validated.body.version });
  if (!allowed.ok) throw refuse(allowed);
  const agreed = { ...snapshotOf(b.terms), version: b.terms.version, agreedAt: now };
  const state = paymentSummary({ terms: { agreed }, payments: b.payments }).state;
  const updated = await Booking.findOneAndUpdate(
    { ...termsOpen(b), 'terms.status': 'proposed', 'terms.proposedBy': role === 'customer' ? 'worker' : 'customer' },
    {
      $set: { 'terms.status': 'agreed', 'terms.agreed': agreed, paymentState: state },
      $push: { termsHistory: { version: b.terms.version, by: role, action: 'agreed', at: now, snapshot: snapshotOf(b.terms) } },
      $inc: { moneyVersion: 1 },
    },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw await lostRace(b, 'BOOKING_CHANGED');
  await writeAudit({
    actor: req.user._id, actorRole: role, action: 'terms.agreed', targetType: 'Booking', targetId: updated._id, fromState: 'proposed', toState: 'agreed',
    reason: `Price terms version ${agreed.version} agreed on ${updated.code}`, details: { code: updated.code, version: agreed.version },
  });
  const params = bookingParams(updated, { amount: agreed.amount, unit: agreed.unit });
  await notify(updated.customer, 'terms_agreed', params);
  await notify(updated.workerUser, 'terms_agreed', params);
  await respond(res, updated, req, now);
};

// POST /api/bookings/:id/payments { kind, amount, method, paidOn }  (customer: "I paid"; worker: "I received")
export const recordPayment = async (req, res) => {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  const allowed = canRecordPayment(b, role, now);
  if (!allowed.ok) throw refuse(allowed);
  const body = req.validated.body;
  const date = checkPaidOn(body.paidOn, b, now);
  if (!date.ok) throw refuse(date);
  const payment = { _id: new mongoose.Types.ObjectId(), ...body, recordedBy: role, recordedAt: now, status: 'awaiting_confirmation', respondedAt: null, disputeReason: null, disputeNote: '' };
  const state = paymentSummary({ terms: b.terms, payments: [...(b.payments ?? []), payment] }).state;
  const updated = await Booking.findOneAndUpdate(
    { _id: b._id, moneyVersion: b.moneyVersion ?? 0, 'dispute.status': trusted({ $ne: 'open' }) },
    { $push: { payments: payment }, $set: { paymentState: state }, $inc: { moneyVersion: 1 } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) throw httpError(409, 'BOOKING_CHANGED');
  await writeAudit({
    actor: req.user._id, actorRole: role, action: 'payment.recorded', targetType: 'Booking', targetId: updated._id, toState: 'awaiting_confirmation',
    reason: `Payment recorded on ${updated.code}`, details: { code: updated.code, paymentId: String(payment._id), kind: payment.kind, amount: payment.amount },
  });
  await notify(otherSide(updated, role), 'payment_recorded', bookingParams(updated, { amount: payment.amount, paymentId: String(payment._id) }));
  await respond(res, updated, req, now, 201);
};

// POST /api/bookings/:id/payments/:paymentId/confirm | /dispute  (the OTHER person, once)
async function answerPayment(req, res, action) {
  const now = new Date();
  const role = roleOf(req);
  const b = await loadOwn(req, now);
  const { paymentId } = req.validated.params;
  const payment = (b.payments ?? []).find((p) => String(p._id) === paymentId);
  const allowed = canRespondPayment(action, b, payment, role);
  if (!allowed.ok) throw refuse(allowed);
  const dispute = action === 'dispute_payment';
  const answer = dispute
    ? { status: 'disputed', respondedAt: now, disputeReason: req.validated.body.reason, disputeNote: req.validated.body.note ?? '' }
    : { status: 'confirmed', respondedAt: now };
  const payments = b.payments.map((p) => (String(p._id) === paymentId ? { ...p, ...answer } : p));
  const state = paymentSummary({ terms: b.terms, payments }).state;
  const updated = await Booking.findOneAndUpdate(
    {
      _id: b._id, moneyVersion: b.moneyVersion ?? 0, 'dispute.status': trusted({ $ne: 'open' }),
      payments: trusted({ $elemMatch: { _id: payment._id, status: 'awaiting_confirmation', recordedBy: payment.recordedBy } }),
    },
    { $set: { ...prefixed('payments.$.', answer), paymentState: state }, $inc: { moneyVersion: 1 } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
  if (!updated) {
    const fresh = await Booking.findById(b._id).select('payments._id payments.status').lean();
    const still = fresh?.payments?.find((p) => String(p._id) === paymentId);
    throw httpError(409, still?.status === 'awaiting_confirmation' ? 'BOOKING_CHANGED' : 'PAYMENT_CHANGED');
  }
  await writeAudit({
    actor: req.user._id, actorRole: role, action: dispute ? 'payment.disputed' : 'payment.confirmed', targetType: 'Booking', targetId: updated._id,
    fromState: 'awaiting_confirmation', toState: answer.status,
    reason: `Payment ${dispute ? 'disputed' : 'confirmed'} on ${updated.code}`,
    details: { code: updated.code, paymentId, ...(dispute ? { reason: answer.disputeReason } : {}) },
  });
  const recorder = payment.recordedBy === 'customer' ? updated.customer : updated.workerUser;
  await notify(recorder, dispute ? 'payment_disputed' : 'payment_confirmed', bookingParams(updated, { amount: payment.amount, paymentId, ...(dispute ? { reasonCode: answer.disputeReason } : {}) }));
  await respond(res, updated, req, now);
}
export const confirmPayment = (req, res) => answerPayment(req, res, 'confirm_payment');
export const disputePayment = (req, res) => answerPayment(req, res, 'dispute_payment');

// ---- price information ----
const rulesView = () => ({ minJobs: WAGE_RULES.MIN_JOBS, minWorkers: WAGE_RULES.MIN_WORKERS, minCustomers: WAGE_RULES.MIN_CUSTOMERS, windowDays: WAGE_RULES.PRICE_WINDOW_DAYS });

// GET /api/prices/estimate?skillId=&category=&unit=&city=&workerIdCode=  (customer, worker, admin)
// The platform range or (only without one) the admin guide, the minimum-wage reference for the city's region,
// and the worker's own stated rates. Aggregates only: never a list of prices, an id or a name.
export const priceEstimate = async (req, res) => {
  const now = new Date();
  const { skillId = null, unit, city = '', workerIdCode } = req.validated.query;
  const category = req.validated.query.category ?? skillById(skillId)?.category ?? null;
  const region = regionOf(city);
  const query = { skillId, category, unit, city, region };
  const platform = await platformRange(query, now);
  const guide = platform ? null : await guideFor(query);
  let workerRates = null;
  if (workerIdCode) {
    const profile = await WorkerProfile.findOne({ workerIdCode }).select('hourlyRate dailyRate -_id').lean();
    if (profile) workerRates = { hourlyRate: profile.hourlyRate || null, dailyRate: profile.dailyRate || null };
  }
  res.set('Cache-Control', 'no-store');
  res.json({ query: { skillId, category, unit, city, region }, platform, guide, wageReference: wageReferenceView(region), workerRates, rules: rulesView() });
};

// POST /api/prices/check  (customer, worker) — the checks of a DRAFT, nothing is saved
export const priceCheck = async (req, res) => {
  const now = new Date();
  const { skillId = null, city = '', ...terms } = req.validated.body;
  const category = terms.category ?? skillById(skillId)?.category ?? null;
  delete terms.category;
  const region = regionOf(city);
  const platform = terms.unit ? await platformRange({ skillId, category, unit: terms.unit, city, region }, now) : null;
  const wageRef = wageReferenceFor(region);
  res.set('Cache-Control', 'no-store');
  res.json({ checks: termsChecks({ terms, category, wageRef, range: platform }), region, wageReference: wageReferenceView(region), platform });
};

// GET /api/workers/me/earnings?year=  (worker) — confirmed money by month (Pakistan time)
export const myEarnings = async (req, res) => {
  const now = new Date();
  const { year = null } = req.validated.query;
  const bookings = await Booking.find({
    workerUser: req.user._id,
    $or: [{ status: 'completed' }, { 'payments.0': trusted({ $exists: true }) }],
  }).select('code skillId skillName status completedAt terms.agreed payments.kind payments.amount payments.status payments.paidOn').sort({ completedAt: -1 }).limit(1000).lean();
  res.set('Cache-Control', 'no-store');
  res.json(earningsByMonth(bookings, { now, year }));
};
