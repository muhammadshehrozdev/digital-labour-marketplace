// A minimal Work Booking (Module 4, decision D-037): a customer's hire request to ONE worker.
// No photos, no check-in. Every change of status is a conditional update on the expected status (409 on
// conflict) and is pushed onto statusHistory.
//
// Module 5 (Batch 7, DONE): `region` (from the city), the price terms (`terms`, every version in
// `termsHistory`), the payment records (`payments`) and `paymentState` (a stored copy of
// paymentSummary().state for admin filters). The app never moves money. Each terms or payment step is ONE
// conditional update on `terms.version` / the record's status (409 on conflict).
//
// EXTENSION POINTS (do not add these now; docs/modules/MODULE-4.md and MODULE-5.md list them):
//   Module 6  (job posting) jobRequest (ref JobRequest) when the booking came from a posted job
//   Module 8  (agreement)   READS `terms.agreed` (and `termsHistory`) to build the formal agreement: work timeline,
//                           written scope of work, beforeEvidence[], afterEvidence[], a sealed agreement version
//   Module 9  (disputes)    a full dispute record (the small `dispute` below is only what reliability needs)
//   Module 10 (check-in)    checkIn { at, location }, checkOut { at, location }
import mongoose from 'mongoose';
import {
  BOOKING_STATUSES, BOOKING_TEXT_MAX, CANCEL_REASONS, DECLINE_REASONS, DISPUTE_REASONS, DISPUTE_TYPES, TIME_SLOTS,
} from '../config/bookingRules.js';
import { OUTCOMES } from '../services/reputation/reliabilityEngine.js';
import {
  DURATIONS, MATERIALS, PAYMENT_DISPUTE_REASONS, PAYMENT_KINDS, PAYMENT_METHODS, PAYMENT_STATES, PAYMENT_STATUSES, PAYMENT_TIMINGS,
  TERMS_STATUSES, UNITS, VISIT_CHARGES, EXTRA_WORK_RULE,
} from '../config/workTerms.js';
import { PAYMENT_NOTE_MAX, TERMS_NOTE_MAX, WAGE_RULES } from '../config/wageRules.js';
import { REGION_CODES } from '../config/regions.js';

export const ACTORS = Object.freeze(['customer', 'worker', 'system', 'admin']);
const ALL_DECISIONS = ['work_done', 'not_done_worker_fault', 'not_done_no_fault', 'no_show_confirmed', 'no_show_rejected', 'worker_fault', 'no_fault'];

const historySchema = new mongoose.Schema(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    by: { type: String, enum: ACTORS, required: true },
    at: { type: Date, required: true },
    reason: { type: String, default: null, maxlength: 60 }, // a code, never free text
  },
  { _id: false }
);

const noShowSchema = new mongoose.Schema(
  {
    reportedAt: { type: Date, default: null },
    workerResponse: { type: String, enum: ['admit', 'dispute', 'no_answer', null], default: null },
    respondedAt: { type: Date, default: null },
  },
  { _id: false }
);

// The small dispute step: only what reliability needs (Module 9 will handle real disputes).
// A sub-schema, because a field called `type` inside a plain nested object would be misread by Mongoose.
const disputeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: [...DISPUTE_TYPES, null], default: null },
    openedBy: { type: String, enum: ['customer', 'worker', null], default: null },
    reasonCode: { type: String, enum: [...DISPUTE_REASONS, null], default: null },
    note: { type: String, trim: true, maxlength: BOOKING_TEXT_MAX.note, default: '' },
    openedAt: { type: Date, default: null },
    status: { type: String, enum: ['open', 'decided', null], default: null },
    decision: { type: String, enum: [...ALL_DECISIONS, null], default: null },
    decisionNote: { type: String, trim: true, maxlength: 500, default: '' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
  },
  { _id: false }
);

// ---- Module 5 (Batch 7) ----
const money = (max) => ({ type: Number, min: 0, max, validate: { validator: (v) => v === null || Number.isInteger(v), message: 'whole rupees' } });
// the price fields of one version (also the snapshot in termsHistory and the copy in terms.agreed)
const priceFields = {
  amount: { ...money(WAGE_RULES.AMOUNT_MAX), default: null },
  unit: { type: String, enum: [...UNITS, null], default: null },
  quantity: { type: Number, min: 1, max: 200, default: null },
  total: { ...money(WAGE_RULES.AMOUNT_MAX * 200), default: null }, // amount x quantity, computed on the server
  duration: { type: String, enum: [...DURATIONS, null], default: null },
  materials: { type: String, enum: [...MATERIALS, null], default: null },
  advance: { ...money(WAGE_RULES.AMOUNT_MAX * 200), default: null }, // 0 = "No advance" on purpose; null = not answered
  paymentTiming: { type: String, enum: [...PAYMENT_TIMINGS, null], default: null },
  paymentMethod: { type: String, enum: [...PAYMENT_METHODS, null], default: null },
  visitCharge: { type: String, enum: [...VISIT_CHARGES, null], default: null },
  extraWork: { type: String, enum: [EXTRA_WORK_RULE, null], default: null }, // a fixed rule, not a choice
  note: { type: String, trim: true, maxlength: TERMS_NOTE_MAX, default: '' },
};
const agreedSchema = new mongoose.Schema({ ...priceFields, version: { type: Number, min: 1 }, agreedAt: { type: Date } }, { _id: false });
const termsSchema = new mongoose.Schema(
  {
    status: { type: String, enum: TERMS_STATUSES, default: 'none' },
    version: { type: Number, min: 0, default: 0 },
    proposedBy: { type: String, enum: ['customer', 'worker', null], default: null },
    proposedAt: { type: Date, default: null },
    ...priceFields, // the CURRENT version (agreed, or the change waiting for the other person)
    agreed: { type: agreedSchema, default: null }, // the last version BOTH agreed: the only part that counts
  },
  { _id: false }
);
const termsHistorySchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    by: { type: String, enum: ['customer', 'worker'], required: true },
    action: { type: String, enum: ['proposed', 'agreed'], required: true },
    at: { type: Date, required: true },
    snapshot: { type: new mongoose.Schema(priceFields, { _id: false }), default: null }, // never a phone number
  },
  { _id: false }
);
const paymentSchema = new mongoose.Schema({
  kind: { type: String, enum: PAYMENT_KINDS, required: true },
  amount: { type: Number, required: true, min: WAGE_RULES.PAYMENT_AMOUNT_MIN, max: WAGE_RULES.PAYMENT_AMOUNT_MAX, validate: { validator: Number.isInteger, message: 'whole rupees' } },
  method: { type: String, enum: PAYMENT_METHODS, required: true }, // a record only: the app moves no money
  paidOn: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // the day in Pakistan
  recordedBy: { type: String, enum: ['customer', 'worker'], required: true },
  recordedAt: { type: Date, required: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: 'awaiting_confirmation' },
  respondedAt: { type: Date, default: null },
  disputeReason: { type: String, enum: [...PAYMENT_DISPUTE_REASONS, null], default: null },
  disputeNote: { type: String, trim: true, maxlength: PAYMENT_NOTE_MAX, default: '' },
});

const bookingSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // BK-2026-000123, easy to read out on the phone
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    workerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: String, required: true, maxlength: 80 },
    skillName: { type: String, trim: true, maxlength: 60, default: '' }, // copied from the worker's skill (custom skills have no taxonomy name)
    category: { type: String, default: null, maxlength: 40 },
    preferredDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // the day in Pakistan
    timeSlot: { type: String, required: true, enum: Object.keys(TIME_SLOTS) },
    scheduledStart: { type: Date, required: true }, // preferredDate + slot hour, Pakistan time, stored in UTC
    city: { type: String, required: true, trim: true, maxlength: 50 },
    area: { type: String, required: true, trim: true, maxlength: BOOKING_TEXT_MAX.area },
    description: { type: String, trim: true, maxlength: BOOKING_TEXT_MAX.description, default: '' },
    status: { type: String, enum: BOOKING_STATUSES, default: 'requested' },
    statusHistory: { type: [historySchema], default: [] },
    acceptedAt: { type: Date, default: null },
    declineReason: { type: String, enum: [...DECLINE_REASONS, null], default: null },
    cancelledBy: { type: String, enum: [...ACTORS, null], default: null },
    cancelReason: { type: String, enum: [...CANCEL_REASONS, 'no_show', 'dispute_decision', null], default: null },
    customerConfirmedAt: { type: Date, default: null },
    workerConfirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    completionMethod: { type: String, enum: ['both', 'auto', 'admin', null], default: null },
    noShow: { type: noShowSchema, default: () => ({}) },
    dispute: { type: disputeSchema, default: () => ({}) },
    outcome: { type: String, enum: [...OUTCOMES, null], default: null }, // the one field reliability reads
    closedAt: { type: Date, default: null },
    reviewRemindedAt: { type: Date, default: null },
    // Module 5 (Batch 7)
    region: { type: String, enum: [...REGION_CODES, null], default: null }, // from `city` at creation (config/regions.js)
    terms: { type: termsSchema, default: () => ({}) },
    termsHistory: { type: [termsHistorySchema], default: [] },
    payments: { type: [paymentSchema], default: [] },
    paymentState: { type: String, enum: PAYMENT_STATES, default: 'no_price' },
    // +1 on every terms or payment change; each such change is conditional on the value it read, so paymentState
    // is always computed from exactly the data it is stored with (a concurrent change gets 409)
    moneyVersion: { type: Number, min: 0, default: 0 },
    synthetic: { type: Boolean, default: false }, // demo data only
  },
  { timestamps: true }
);

bookingSchema.index({ code: 1 }, { unique: true });
bookingSchema.index({ workerUser: 1, status: 1, createdAt: -1 });
bookingSchema.index({ customer: 1, status: 1, createdAt: -1 });
bookingSchema.index({ status: 1, scheduledStart: 1 });
bookingSchema.index({ status: 1, updatedAt: 1 });
bookingSchema.index({ 'dispute.status': 1 });
// reliability and verified work history read a worker's closed bookings
bookingSchema.index({ worker: 1, closedAt: -1 });
// Module 5: the price statistics (one query per estimate), the worker's earnings, the admin Payments page
bookingSchema.index({ status: 1, skillId: 1, 'terms.agreed.unit': 1, region: 1, completedAt: -1 });
// a day or an hour may fall back to the whole trade category (services/wage/load.js)
bookingSchema.index({ status: 1, category: 1, 'terms.agreed.unit': 1, completedAt: -1 });
bookingSchema.index({ workerUser: 1, completedAt: -1 });
bookingSchema.index({ paymentState: 1, updatedAt: -1 });

export default mongoose.model('Booking', bookingSchema);
