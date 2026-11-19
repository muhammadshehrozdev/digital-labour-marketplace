// Validation for the Module 4 routes: bookings, reviews, disputes, moderation, flags (zod, strict:
// unknown keys -> 400). Free text that the other person will read goes through the contact-info
// check (TEXT_HAS_CONTACT_INFO); text written to the audit log may not contain a CNIC (noCnic).
import { z } from 'zod';
import {
  BOOKING_STATUSES, BOOKING_TEXT_MAX, CANCEL_REASONS, DECLINE_REASONS, DISPUTE_REASONS, TIME_SLOTS,
} from '../config/bookingRules.js';
import { HIDE_REASONS, REPORT_REASONS, REVIEW_ANSWERS, REVIEW_TEXT_MAX } from '../models/Review.js';
import { hasContactInfo } from '../services/booking/contactInfo.js';
import { noCnic, objectId, queryInt } from './common.js';
import { offerSchema } from './wage.js';

const text = (max) => z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(max, 'TEXT_TOO_LONG');
const noContact = (schema) => schema.refine((t) => !hasContactInfo(t), { message: 'TEXT_HAS_CONTACT_INFO' });
const one = (max) => z.string({ error: 'ONE_VALUE' }).trim().max(max, 'TEXT_TOO_LONG');
const WORKER_ID = /^DLM-\d{4}-\d{4,6}$/;

const isoDate = z
  .string({ error: 'DATE_INVALID' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'DATE_INVALID')
  .refine((d) => {
    const t = Date.parse(`${d}T00:00:00Z`);
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === d;
  }, { message: 'DATE_NOT_REAL' });

// Express leaves req.body undefined when a POST has no body; the action routes accept "no body" as {}.
export const allowEmptyBody = (req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
};

// ---- bookings ----
export const bookingIdParams = z.object({ id: objectId }).strict();

export const createBookingSchema = z
  .object({
    workerIdCode: z.string({ error: 'WORKER_ID_INVALID' }).regex(WORKER_ID, 'WORKER_ID_INVALID'),
    skillId: z.string({ error: 'SKILL_ID_INVALID' }).trim().min(1, 'SKILL_ID_INVALID').max(80, 'SKILL_ID_INVALID'),
    preferredDate: isoDate,
    timeSlot: z.enum(Object.keys(TIME_SLOTS), { error: 'TIME_SLOT_INVALID' }),
    city: text(50).min(2, 'TEXT_TOO_SHORT'),
    area: noContact(noCnic(text(BOOKING_TEXT_MAX.area).min(2, 'TEXT_TOO_SHORT'))),
    description: noContact(noCnic(text(BOOKING_TEXT_MAX.description))).optional().default(''),
    offer: offerSchema.optional(), // Module 5: an optional price offer (amount, unit, quantity, duration)
  })
  .strict();

export const BOOKING_LIST_STATUSES = Object.freeze(['active', 'past', 'all', ...BOOKING_STATUSES]);
export const myBookingsQuerySchema = z
  .object({
    as: z.enum(['customer', 'worker'], { error: 'BOOKING_AS_INVALID' }).optional(),
    status: z.enum(BOOKING_LIST_STATUSES, { error: 'STATUS_UNKNOWN' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 50).optional(),
  })
  .strict();

export const declineSchema = z.object({ reason: z.enum(DECLINE_REASONS, { error: 'DECLINE_REASON_INVALID' }).optional() }).strict();
export const cancelSchema = z.object({ reason: z.enum(CANCEL_REASONS, { error: 'CANCEL_REASON_INVALID' }).optional() }).strict();
export const emptySchema = z.object({}).strict();

const disputeNote = noContact(noCnic(text(BOOKING_TEXT_MAX.note))).optional().default('');
export const contestSchema = z
  .object({ reasonCode: z.enum(DISPUTE_REASONS, { error: 'DISPUTE_REASON_INVALID' }).optional(), note: disputeNote })
  .strict();
export const noShowRespondSchema = z
  .object({ answer: z.enum(['admit', 'dispute'], { error: 'NO_SHOW_ANSWER_INVALID' }), note: disputeNote })
  .strict();
export const workerDisputeSchema = z
  .object({ reasonCode: z.enum(DISPUTE_REASONS, { error: 'DISPUTE_REASON_INVALID' }), note: disputeNote })
  .strict();

// ---- reviews ----
const answer = z.enum(REVIEW_ANSWERS, { error: 'ANSWER_INVALID' }).optional();
export const reviewSchema = z
  .object({
    rating: z.number({ error: 'RATING_INVALID' }).int('RATING_INVALID').min(1, 'RATING_INVALID').max(5, 'RATING_INVALID'),
    onTime: answer,
    workQuality: answer,
    polite: answer,
    priceAsAgreed: answer,
    wouldHireAgain: answer,
    comment: noContact(noCnic(text(REVIEW_TEXT_MAX.comment))).optional().default(''),
  })
  .strict();

export const reviewIdParams = z.object({ id: objectId }).strict();
export const replySchema = z.object({ text: noContact(noCnic(text(REVIEW_TEXT_MAX.reply).min(1, 'REPLY_EMPTY'))) }).strict();
export const reportSchema = z
  .object({ reasonCode: z.enum(REPORT_REASONS, { error: 'REPORT_REASON_INVALID' }), note: noCnic(text(REVIEW_TEXT_MAX.note)).optional().default('') })
  .strict()
  .refine((b) => b.reasonCode !== 'other' || b.note.length >= 5, { message: 'REASON_OTHER_NEEDS_WORDS', path: ['note'] });

export const workerReviewsQuerySchema = z.object({ page: queryInt(1, 1000).optional(), limit: queryInt(1, 50).optional() }).strict();

// ---- admin ----
export const adminBookingsQuerySchema = z
  .object({
    status: z.enum(['all', 'disputed', ...BOOKING_STATUSES], { error: 'STATUS_UNKNOWN' }).optional(),
    q: one(50).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();
export const disputesQuerySchema = z.object({ status: z.enum(['open', 'decided', 'all'], { error: 'STATUS_UNKNOWN' }).optional() }).strict();

const ALL_DECISIONS = ['work_done', 'not_done_worker_fault', 'not_done_no_fault', 'no_show_confirmed', 'no_show_rejected', 'worker_fault', 'no_fault'];
const adminNote = noCnic(z.string({ error: 'WRITTEN_REASON_REQUIRED' }).trim().min(5, 'WRITTEN_REASON_REQUIRED').max(500, 'TEXT_TOO_LONG'));
export const disputeDecisionSchema = z
  .object({ decision: z.enum(ALL_DECISIONS, { error: 'DISPUTE_DECISION_INVALID' }), note: adminNote })
  .strict();

export const adminReviewsQuerySchema = z
  .object({
    status: z.enum(['all', 'visible', 'hidden'], { error: 'STATUS_UNKNOWN' }).optional(),
    reported: z.enum(['true', 'false'], { error: 'INVALID_VALUE' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

// hide: a reason code is required (and words for "other"); restore: a written reason is required.
export const reviewModerationSchema = z
  .object({
    action: z.enum(['hide', 'restore'], { error: 'ACTION_UNKNOWN' }),
    reasonCode: z.enum(HIDE_REASONS, { error: 'HIDE_REASON_INVALID' }).optional(),
    note: noCnic(text(REVIEW_TEXT_MAX.note)).optional().default(''),
  })
  .strict()
  .refine((b) => b.action !== 'hide' || b.reasonCode, { message: 'HIDE_REASON_INVALID', path: ['reasonCode'] })
  .refine((b) => !(b.action === 'hide' && b.reasonCode === 'other') || b.note.length >= 5, { message: 'REASON_OTHER_NEEDS_WORDS', path: ['note'] })
  .refine((b) => b.action !== 'restore' || b.note.length >= 5, { message: 'WRITTEN_REASON_REQUIRED', path: ['note'] });

export const flagsQuerySchema = z.object({ status: z.enum(['open', 'dismissed', 'actioned', 'all'], { error: 'STATUS_UNKNOWN' }).optional() }).strict();
export const flagIdParams = z.object({ id: objectId }).strict();
export const flagDecisionSchema = z.object({ action: z.enum(['dismiss', 'hide_reviews'], { error: 'ACTION_UNKNOWN' }), note: adminNote }).strict();

export const adminWorkerIdParams = z.object({ id: objectId }).strict();
export const statsQuerySchema = z.object({ days: queryInt(7, 90).optional() }).strict();
