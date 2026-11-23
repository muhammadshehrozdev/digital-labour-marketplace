// Validation for the Module 6 routes (Batch 8A): job requests, the analysis, the worker list, the request with a job,
// the admin list and statistics. zod, strict: unknown keys -> 400 (so `analysis` or `customer` can never be sent).
// Free text the worker will read (the description, the area) goes through the contact-info check and may not hold a
// CNIC (it is copied into the booking).
import { z } from 'zod';
import { CATEGORY_IDS, SKILL_IDS } from '../config/skillTaxonomy.js';
import { TIME_SLOTS } from '../config/bookingRules.js';
import { CLOSE_REASONS, INPUT_MODES, JOB_LIST_STATES, JOB_RULES, JOB_TEXT_MAX, JOB_TEXT_MIN, TASK_TYPES } from '../config/jobRules.js';
import { UNITS } from '../config/workTerms.js';
import { WAGE_RULES } from '../config/wageRules.js';
import { hasContactInfo } from '../services/booking/contactInfo.js';
import { isoDate, noCnic, objectId, queryInt } from './common.js';
import { offerSchema, rupees } from './wage.js';
import { directoryQuerySchema } from './workers.js';

const text = (max) => z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(max, 'TEXT_TOO_LONG');
const noContact = (schema) => schema.refine((t) => !hasContactInfo(t), { message: 'TEXT_HAS_CONTACT_INFO' });
const one = (max) => z.string({ error: 'ONE_VALUE' }).trim().max(max, 'TEXT_TOO_LONG');
const WORKER_ID = /^DLM-\d{4}-\d{4,6}$/;
const version = z.number({ error: 'NUMBER_REQUIRED' }).int('WHOLE_NUMBER').min(1, 'NUMBER_TOO_SMALL').max(1000000, 'NUMBER_TOO_LARGE');

const description = noContact(noCnic(text(JOB_TEXT_MAX.description).min(JOB_TEXT_MIN.description, 'TEXT_TOO_SHORT')));
const area = noContact(noCnic(text(JOB_TEXT_MAX.area).min(JOB_TEXT_MIN.area, 'TEXT_TOO_SHORT')));
const city = text(50).min(2, 'TEXT_TOO_SHORT');
const inputMode = z.enum(INPUT_MODES, { error: 'INPUT_MODE_INVALID' });
const category = z.enum(CATEGORY_IDS, { error: 'CATEGORY_INVALID' });
// skill ids (the server adds the names); repeated ids count once
const skills = z
  .array(z.string({ error: 'SKILL_UNKNOWN' }).refine((id) => SKILL_IDS.includes(id), { message: 'SKILL_UNKNOWN' }), { error: 'WRONG_TYPE' })
  .max(JOB_RULES.MAX_SKILLS, 'LIST_TOO_LONG')
  .transform((ids) => [...new Set(ids)]);
const taskType = z.enum(TASK_TYPES, { error: 'TASK_TYPE_INVALID' }).nullable();
const timeSlot = z.enum(Object.keys(TIME_SLOTS), { error: 'TIME_SLOT_INVALID' }).nullable();
const urgent = z.boolean({ error: 'WRONG_TYPE' });
// The budget: both the amount (whole rupees) and the unit, or neither (null, or an object with both empty).
const budget = z
  .object({ amount: rupees(WAGE_RULES.AMOUNT_MIN, WAGE_RULES.AMOUNT_MAX).nullable().optional(), unit: z.enum(UNITS, { error: 'UNIT_INVALID' }).nullable().optional() })
  .strict()
  .refine((b) => (b.amount === null || b.amount === undefined) === (b.unit === null || b.unit === undefined), { message: 'JOB_BUDGET_INCOMPLETE' })
  .transform((b) => (b.amount === null || b.amount === undefined ? null : { amount: b.amount, unit: b.unit }))
  .nullable();

export const jobIdParams = z.object({ id: objectId }).strict();

// POST /api/job-requests/analyze — nothing is saved
export const analyzeSchema = z
  .object({ text: noContact(noCnic(text(JOB_TEXT_MAX.description).min(JOB_TEXT_MIN.analyze, 'TEXT_TOO_SHORT'))), inputMode: inputMode.optional() })
  .strict();

// POST /api/job-requests
export const createJobSchema = z
  .object({
    description,
    inputMode,
    category,
    skills,
    taskType,
    city,
    area,
    preferredDate: isoDate.nullable().optional(),
    timeSlot: timeSlot.optional(),
    urgent: urgent.optional(),
    budget: budget.optional(),
  })
  .strict();

// PATCH /api/job-requests/:id — baseVersion and at least one editable field
const EDITABLE = ['description', 'inputMode', 'category', 'skills', 'taskType', 'city', 'area', 'preferredDate', 'timeSlot', 'urgent', 'budget'];
export const updateJobSchema = z
  .object({
    baseVersion: version,
    description: description.optional(),
    inputMode: inputMode.optional(),
    category: category.optional(),
    skills: skills.optional(),
    taskType: taskType.optional(),
    city: city.optional(),
    area: area.optional(),
    preferredDate: isoDate.nullable().optional(),
    timeSlot: timeSlot.optional(),
    urgent: urgent.optional(),
    budget: budget.optional(),
  })
  .strict()
  .refine((b) => EDITABLE.some((k) => b[k] !== undefined), { message: 'JOB_EDIT_EMPTY' });

export const closeJobSchema = z.object({ reason: z.enum(CLOSE_REASONS, { error: 'CLOSE_REASON_INVALID' }) }).strict();

export const myJobsQuerySchema = z
  .object({
    state: z.enum(JOB_LIST_STATES, { error: 'STATUS_UNKNOWN' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 50).optional(),
  })
  .strict();

// GET /api/job-requests/:id/workers — the directory's own query pieces (no search, city or trade: the job decides)
const d = directoryQuerySchema.shape;
export const jobWorkersQuerySchema = z
  .object({ sort: d.sort, availability: d.availability, identity: d.identity, skills: d.skills, page: d.page, limit: d.limit })
  .strict();

// POST /api/job-requests/:id/request — the booking fields that are not copied from the job
export const jobRequestWorkerSchema = z
  .object({
    jobVersion: version,
    workerIdCode: z.string({ error: 'WORKER_ID_INVALID' }).regex(WORKER_ID, 'WORKER_ID_INVALID'),
    skillId: z.string({ error: 'SKILL_ID_INVALID' }).trim().min(1, 'SKILL_ID_INVALID').max(80, 'SKILL_ID_INVALID'),
    preferredDate: isoDate,
    timeSlot: z.enum(Object.keys(TIME_SLOTS), { error: 'TIME_SLOT_INVALID' }),
    offer: offerSchema.optional(),
  })
  .strict();

// ---- admin ----
export const adminJobsQuerySchema = z
  .object({
    state: z.enum(JOB_LIST_STATES, { error: 'STATUS_UNKNOWN' }).optional(),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_UNKNOWN' }).optional(),
    q: one(20).optional(), // a JR code or a part of one
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();
