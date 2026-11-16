// A minimal Work Booking (Module 4, decision D-037): a customer's hire request to ONE worker.
// Deliberately small: no price, no terms, no photos, no check-in. Every change of status is a
// conditional update on the expected status (409 on conflict) and is pushed onto statusHistory.
//
// EXTENSION POINTS (do not add these now; docs/modules/MODULE-4.md lists them):
//   Module 5  (wages)       agreedPrice, priceUnit, wageEstimateId
//   Module 6  (job posting) jobRequest (ref JobRequest) when the booking came from a posted job
//   Module 8  (agreement)   agreement { terms, acceptedByCustomerAt, acceptedByWorkerAt }, beforeEvidence[], afterEvidence[]
//   Module 9  (disputes)    a full dispute record (the small `dispute` below is only what reliability needs)
//   Module 10 (check-in)    checkIn { at, location }, checkOut { at, location }
import mongoose from 'mongoose';
import {
  BOOKING_STATUSES, BOOKING_TEXT_MAX, CANCEL_REASONS, DECLINE_REASONS, DISPUTE_REASONS, DISPUTE_TYPES, TIME_SLOTS,
} from '../config/bookingRules.js';
import { OUTCOMES } from '../services/reputation/reliabilityEngine.js';

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

export default mongoose.model('Booking', bookingSchema);
