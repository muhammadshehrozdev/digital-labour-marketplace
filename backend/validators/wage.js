// Validation for the Module 5 routes (Batch 7): price terms, payment records, price information, the admin
// price guide and the admin payments list. zod, strict: unknown keys -> 400. Free text that the other person
// will read goes through the contact-info check (TEXT_HAS_CONTACT_INFO) and may not hold a CNIC.
// Amounts are whole rupees; a number typed with Urdu or Arabic digits or with commas ("۲,۵۰۰") is accepted.
import { z } from 'zod';
import { CATEGORY_IDS, SKILL_IDS, skillById } from '../config/skillTaxonomy.js';
import { DURATIONS, MATERIALS, PAYMENT_DISPUTE_REASONS, PAYMENT_KINDS, PAYMENT_METHODS, PAYMENT_STATES, PAYMENT_TIMINGS, UNITS, VISIT_CHARGES } from '../config/workTerms.js';
import { GUIDE_NOTE_MAX, GUIDE_SOURCE_MAX, GUIDE_SOURCE_MIN, PAYMENT_NOTE_MAX, TERMS_NOTE_MAX, WAGE_RULES } from '../config/wageRules.js';
import { GUIDE_REGIONS } from '../models/PriceGuide.js';
import { hasContactInfo } from '../services/booking/contactInfo.js';
import { toWesternDigits } from '../services/skillExtractor/normalize.js';
import { isoDate, noCnic, objectId, queryInt } from './common.js';

const text = (max) => z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(max, 'TEXT_TOO_LONG');
const noContact = (schema) => schema.refine((t) => !hasContactInfo(t), { message: 'TEXT_HAS_CONTACT_INFO' });
const WORKER_ID = /^DLM-\d{4}-\d{4,6}$/;

// "2,500", "۲۵۰۰", 2500 -> 2500 (anything else is left as it is, so zod reports it)
const toNumber = (value) => {
  if (typeof value !== 'string') return value;
  const plain = toWesternDigits(value.normalize('NFKC')).replace(/[\s,٬]/g, '');
  return /^\d{1,9}$/.test(plain) ? Number(plain) : value;
};
export const rupees = (min, max) => z.preprocess(
  toNumber,
  z.number({ error: 'NUMBER_REQUIRED' }).int('WHOLE_NUMBER').min(min, 'NUMBER_TOO_SMALL').max(max, 'NUMBER_TOO_LARGE'),
);
const whole = (min, max) => z.preprocess(toNumber, z.number({ error: 'NUMBER_REQUIRED' }).int('WHOLE_NUMBER').min(min, 'NUMBER_TOO_SMALL').max(max, 'NUMBER_TOO_LARGE'));
// null = "not answered yet" (allowed on purpose); a missing key means the same
const choice = (list, code) => z.enum(list, { error: code }).nullable().optional();

const amount = rupees(WAGE_RULES.AMOUNT_MIN, WAGE_RULES.AMOUNT_MAX);
const unit = z.enum(UNITS, { error: 'UNIT_INVALID' });
const quantity = whole(1, Math.max(...Object.values(WAGE_RULES.QUANTITY_MAX)));
const duration = choice(DURATIONS, 'DURATION_INVALID');

// quantity: a whole job is always 1 (any number sent is ignored); days 1..60; hours 1..200
function quantityFits(t, ctx) {
  if (t.unit && t.unit !== 'job' && t.quantity !== undefined && t.quantity !== null && t.quantity > WAGE_RULES.QUANTITY_MAX[t.unit]) {
    ctx.addIssue({ code: 'custom', message: 'QUANTITY_INVALID', path: ['quantity'] });
  }
}
// the advance may not be more than the total (amount x quantity), computed here the same way as on the server
function advanceFits(t, ctx) {
  if (!Number.isFinite(t.advance) || !Number.isFinite(t.amount)) return;
  const total = t.amount * (t.unit === 'job' ? 1 : t.quantity ?? 1);
  if (t.advance > total) ctx.addIssue({ code: 'custom', message: 'ADVANCE_TOO_HIGH', path: ['advance'] });
}

// The conditions (all optional; null = not answered yet)
const conditionFields = {
  materials: choice(MATERIALS, 'MATERIALS_INVALID'),
  advance: rupees(0, WAGE_RULES.AMOUNT_MAX * 200).nullable().optional(),
  paymentTiming: choice(PAYMENT_TIMINGS, 'PAYMENT_TIMING_INVALID'),
  paymentMethod: choice(PAYMENT_METHODS, 'PAYMENT_METHOD_INVALID'),
  visitCharge: choice(VISIT_CHARGES, 'VISIT_CHARGE_INVALID'),
};
const termsNote = noContact(noCnic(text(TERMS_NOTE_MAX))).optional().default('');

// POST /api/bookings: the optional offer that comes with a request (creates terms version 1)
export const offerSchema = z.object({ amount, unit, quantity: quantity.optional(), duration }).strict().superRefine(quantityFits);

// POST /api/bookings/:id/terms — propose (a new version)
export const proposeTermsSchema = z
  .object({ baseVersion: whole(0, 1000), amount, unit, quantity: quantity.optional(), duration, ...conditionFields, note: termsNote })
  .strict()
  .superRefine(quantityFits)
  .superRefine(advanceFits);

// POST /api/bookings/:id/terms/agree
export const agreeTermsSchema = z.object({ version: whole(1, 1000) }).strict();

// POST /api/prices/check — a draft: everything optional, nothing saved
export const priceCheckSchema = z
  .object({
    skillId: z.string({ error: 'SKILL_ID_INVALID' }).trim().min(1, 'SKILL_ID_INVALID').max(80, 'SKILL_ID_INVALID').optional(),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_UNKNOWN' }).nullable().optional(),
    city: text(50).optional(),
    amount: amount.nullable().optional(),
    unit: unit.nullable().optional(),
    quantity: quantity.nullable().optional(),
    duration,
    ...conditionFields,
  })
  .strict()
  .superRefine(quantityFits);

// GET /api/prices/estimate?skillId=&category=&unit=&city=&workerIdCode=
export const estimateQuerySchema = z
  .object({
    skillId: z.enum(SKILL_IDS, { error: 'SKILL_ID_INVALID' }).optional(),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_UNKNOWN' }).optional(),
    unit,
    city: text(50).optional(),
    workerIdCode: z.string({ error: 'WORKER_ID_INVALID' }).regex(WORKER_ID, 'WORKER_ID_INVALID').optional(),
  })
  .strict()
  .refine((q) => q.skillId || q.category, { message: 'SKILL_ID_INVALID', path: ['skillId'] })
  .refine((q) => !q.skillId || !q.category || skillById(q.skillId)?.category === q.category, { message: 'CATEGORY_INVALID', path: ['category'] });

// ---- payment records ----
export const paymentIdParams = z.object({ id: objectId, paymentId: objectId }).strict();
export const recordPaymentSchema = z
  .object({
    kind: z.enum(PAYMENT_KINDS, { error: 'PAYMENT_KIND_INVALID' }),
    amount: rupees(WAGE_RULES.PAYMENT_AMOUNT_MIN, WAGE_RULES.PAYMENT_AMOUNT_MAX),
    method: z.enum(PAYMENT_METHODS, { error: 'PAYMENT_METHOD_INVALID' }),
    paidOn: isoDate,
  })
  .strict();
export const disputePaymentSchema = z
  .object({
    reason: z.enum(PAYMENT_DISPUTE_REASONS, { error: 'PAYMENT_REASON_INVALID' }),
    note: noContact(noCnic(text(PAYMENT_NOTE_MAX))).optional().default(''),
  })
  .strict();

// GET /api/meta/wage-references?city=
export const wageMetaQuerySchema = z.object({ city: text(50).optional() }).strict();

// GET /api/workers/me/earnings?year=
export const earningsQuerySchema = z.object({ year: queryInt(2020, 2100).optional() }).strict();

// ---- admin: the price guide ----
const guideSkill = z.enum(SKILL_IDS, { error: 'SKILL_ID_INVALID' }).nullable().optional();
const sourceNote = noContact(noCnic(z.string({ error: 'SOURCE_NOTE_REQUIRED' }).trim().min(GUIDE_SOURCE_MIN, 'SOURCE_NOTE_REQUIRED').max(GUIDE_SOURCE_MAX, 'TEXT_TOO_LONG')));
const guideNote = noContact(noCnic(text(GUIDE_NOTE_MAX))).optional();
const guideAmount = rupees(1, WAGE_RULES.AMOUNT_MAX);
const lowNotAboveHigh = (g) => !(Number.isFinite(g.low) && Number.isFinite(g.high)) || g.low <= g.high;

export const priceGuideCreateSchema = z
  .object({
    skillId: guideSkill,
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_UNKNOWN' }),
    unit,
    region: z.enum(GUIDE_REGIONS, { error: 'REGION_INVALID' }),
    low: guideAmount,
    high: guideAmount,
    sourceNote,
    note: guideNote,
  })
  .strict()
  .refine(lowNotAboveHigh, { message: 'PRICE_GUIDE_LOW_HIGH', path: ['low'] })
  .refine((g) => !g.skillId || skillById(g.skillId)?.category === g.category, { message: 'CATEGORY_INVALID', path: ['category'] });

// PATCH: either new numbers WITH a source (and an optional note), or { status: 'archived' } alone
export const priceGuideUpdateSchema = z
  .object({
    low: guideAmount.optional(),
    high: guideAmount.optional(),
    sourceNote: sourceNote.optional(),
    note: guideNote,
    status: z.enum(['archived'], { error: 'STATUS_UNKNOWN' }).optional(),
  })
  .strict()
  .refine((g) => g.status === 'archived' || (g.low !== undefined && g.high !== undefined && g.sourceNote !== undefined), { message: 'SOURCE_NOTE_REQUIRED', path: ['sourceNote'] })
  .refine((g) => g.status !== 'archived' || Object.keys(g).length === 1, { message: 'UNKNOWN_FIELD', path: ['status'] })
  .refine(lowNotAboveHigh, { message: 'PRICE_GUIDE_LOW_HIGH', path: ['low'] });

export const priceGuideIdParams = z.object({ id: objectId }).strict();
export const priceGuideQuerySchema = z
  .object({
    status: z.enum(['active', 'archived', 'all'], { error: 'STATUS_UNKNOWN' }).optional(),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_UNKNOWN' }).optional(),
  })
  .strict();

// GET /api/admin/payments?state=&page=
export const adminPaymentsQuerySchema = z
  .object({
    state: z.enum(['all', ...PAYMENT_STATES], { error: 'STATUS_UNKNOWN' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 50).optional(),
  })
  .strict();
