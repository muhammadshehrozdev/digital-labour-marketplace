// Module 6 (Batch 8A): a customer's job request (decisions D-080 to D-084). The customer describes the job in their
// own words; the analyzer suggests a structured job profile; the customer confirms or changes every suggestion and
// saves it. Then the customer picks a worker and sends ONE request at a time with the job attached (activeBooking).
// Workers never see a list of jobs: a worker sees a job only through a booking request sent to that worker.
//
// Only `status` (open | closed) is stored; the state the customer sees (open, requested, accepted, done, expired,
// closed) is DERIVED from the job and its bookings (services/jobs/state.js). Every edit is ONE conditional update on
// `version` (optimistic check, like Module 5's baseVersion): a stale screen gets 409.
//
// Privacy (docs/SECURITY.md): the description and the area passed the contact-info and CNIC checks; the BUDGET is
// private to the customer and admins (never in a booking view, never to a worker); `analysis` is computed on the
// server, never taken from the client.
import mongoose from 'mongoose';
import { CATEGORY_IDS } from '../config/skillTaxonomy.js';
import { TIME_SLOTS } from '../config/bookingRules.js';
import { CHANGED_FIELDS, CLOSE_REASONS, INPUT_MODES, JOB_RULES, JOB_TEXT_MAX, TASK_TYPES } from '../config/jobRules.js';
import { UNITS } from '../config/workTerms.js';
import { WAGE_RULES } from '../config/wageRules.js';
import { REGION_CODES } from '../config/regions.js';
import { METHODS } from '../config/jobAnalyzer.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const whole = (min, max) => ({ type: Number, min, max, validate: { validator: (v) => v === null || Number.isInteger(v), message: 'whole rupees' } });

const skillSchema = new mongoose.Schema({ skillId: { type: String, required: true, maxlength: 80 }, name: { type: String, trim: true, maxlength: 60, default: '' } }, { _id: false });
const budgetSchema = new mongoose.Schema({ amount: { ...whole(WAGE_RULES.AMOUNT_MIN, WAGE_RULES.AMOUNT_MAX), required: true }, unit: { type: String, enum: UNITS, required: true } }, { _id: false });

// What the analyzer suggested for the saved description (ids and values only, never text).
const suggestedSchema = new mongoose.Schema(
  {
    category: { type: String, enum: [...CATEGORY_IDS, null], default: null },
    categoryTie: { type: [String], default: [] }, // the tied trades when the analyzer reported a tie
    skills: { type: [String], default: [] }, // every skill the analyzer found (any trade)
    taskType: { type: String, enum: [...TASK_TYPES, null], default: null },
    city: { type: String, maxlength: 50, default: null },
    preferredDate: { type: String, match: DATE, default: null },
    timeSlot: { type: String, enum: [...Object.keys(TIME_SLOTS), null], default: null },
    urgent: { type: Boolean, default: false }, // true only when an urgency word was found
    budget: { type: budgetSchema, default: null },
    notes: { type: [String], default: [] },
  },
  { _id: false }
);
// Per field: true = the customer saved something else than the suggestion, false = kept it, null = nothing suggested.
const changedSchema = new mongoose.Schema(Object.fromEntries(CHANGED_FIELDS.map((f) => [f, { type: Boolean, default: null }])), { _id: false });
const analysisSchema = new mongoose.Schema(
  {
    method: { type: String, enum: METHODS, required: true },
    versions: {
      analyzer: { type: String, maxlength: 40, required: true },
      taxonomy: { type: String, maxlength: 40, required: true },
      phrases: { type: String, maxlength: 40, required: true },
      model: { type: String, maxlength: 40, default: null },
    },
    analyzedAt: { type: Date, required: true },
    suggested: { type: suggestedSchema, default: () => ({}) },
    changed: { type: changedSchema, default: () => ({}) },
  },
  { _id: false }
);

const jobRequestSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // JR-2026-000001
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    version: { type: Number, min: 1, default: 1 },
    description: { type: String, required: true, trim: true, minlength: 3, maxlength: JOB_TEXT_MAX.description },
    inputMode: { type: String, enum: INPUT_MODES, required: true },
    category: { type: String, enum: CATEGORY_IDS, required: true },
    skills: {
      type: [skillSchema],
      default: [],
      validate: { validator: (v) => v.length <= JOB_RULES.MAX_SKILLS, message: 'too many skills' },
    },
    taskType: { type: String, enum: [...TASK_TYPES, null], default: null },
    city: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    region: { type: String, enum: [...REGION_CODES, null], default: null }, // regionOf(city) at save time
    area: { type: String, required: true, trim: true, minlength: 2, maxlength: JOB_TEXT_MAX.area },
    preferredDate: { type: String, match: DATE, default: null },
    timeSlot: { type: String, enum: [...Object.keys(TIME_SLOTS), null], default: null },
    urgent: { type: Boolean, default: false },
    budget: { type: budgetSchema, default: null }, // PRIVATE: the customer and admins only
    activeBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }, // the one-request reservation (D-082)
    analysis: { type: analysisSchema, required: true },
    closedAt: { type: Date, default: null },
    closeReason: { type: String, enum: [...CLOSE_REASONS, null], default: null },
    synthetic: { type: Boolean, default: false }, // demo data only
  },
  { timestamps: true }
);

jobRequestSchema.index({ code: 1 }, { unique: true });
jobRequestSchema.index({ customer: 1, createdAt: -1 });
jobRequestSchema.index({ status: 1, category: 1, createdAt: -1 });

export default mongoose.model('JobRequest', jobRequestSchema);
