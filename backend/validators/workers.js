import { z } from 'zod';
import { CATEGORY_IDS, AVAILABILITY } from '../config/skillTaxonomy.js';
import { name, phone, optionalPhone, cnic, queryInt, objectId, noCnic } from './common.js';

// Text field: codes TEXT_MUST_BE_TEXT / TEXT_TOO_LONG; the field name comes from the request key.
const text = (max) => z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(max, 'TEXT_TOO_LONG');

const workHistoryItem = z
  .object({
    jobTitle: text(100).min(2, 'TEXT_TOO_SHORT'),
    clientOrEmployer: text(100).optional().default(''),
    duration: text(50).optional().default(''),
    description: text(500).optional().default(''),
  })
  .strict();

// PUT /api/workers/me — every field optional (send only what changed), unknown keys -> 400.
// The worker can never set workerIdCode, verificationStatus, cnicOnFile, user, etc.
// Skills are not set here: they have their own routes (/api/workers/me/skills, Module 2).
export const profileUpdateSchema = z
  .object({
    name: name.optional(),
    phone: phone.optional(),
    occupation: text(60).min(2, 'TEXT_TOO_SHORT').optional(),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_INVALID' }).optional(),
    experienceYears: z
      .number({ error: 'NUMBER_REQUIRED' })
      .int('EXPERIENCE_WHOLE')
      .min(0, 'NOT_NEGATIVE')
      .max(60, 'EXPERIENCE_TOO_HIGH')
      .optional(),
    hourlyRate: z.number({ error: 'NUMBER_REQUIRED' }).min(0, 'NOT_NEGATIVE').max(1000000, 'RATE_TOO_HIGH').optional(),
    dailyRate: z.number({ error: 'NUMBER_REQUIRED' }).min(0, 'NOT_NEGATIVE').max(1000000, 'RATE_TOO_HIGH').optional(),
    city: text(50).min(2, 'TEXT_TOO_SHORT').optional(),
    address: text(200).optional(),
    whatsappNumber: optionalPhone.optional(),
    emergencyContact: text(100).optional(),
    cnicNumber: cnic.optional(),
    languages: z.array(text(30).min(1, 'TEXT_EMPTY_ITEM')).max(10, 'LIST_TOO_LONG').optional(),
    availability: z.enum(AVAILABILITY, { error: 'AVAILABILITY_INVALID' }).optional(),
    bio: text(500).optional(),
    workHistory: z.array(workHistoryItem).max(20, 'LIST_TOO_LONG').optional(),
  })
  .strict();

export const DIRECTORY_SORTS = Object.freeze(['updated', 'experience', 'evidence']);

// GET /api/workers — every value must be ONE string (no arrays, no objects), from known
// values where possible. Unknown keys such as "category[$ne]" -> 400 (audit M1-3, M1-4).
export const directoryQuerySchema = z
  .object({
    search: z.string({ error: 'ONE_VALUE' }).trim().max(50, 'TEXT_TOO_LONG').optional(),
    city: z.string({ error: 'ONE_VALUE' }).trim().max(50, 'TEXT_TOO_LONG').optional(),
    category: z.enum(['All', ...CATEGORY_IDS], { error: 'CATEGORY_UNKNOWN' }).optional(),
    availability: z.enum(['All', ...AVAILABILITY], { error: 'AVAILABILITY_UNKNOWN' }).optional(),
    identity: z.enum(['all', 'verified'], { error: 'IDENTITY_FILTER_INVALID' }).optional(),
    skills: z.enum(['all', 'verified'], { error: 'SKILLS_FILTER_INVALID' }).optional(),
    // Batch 4: updated = recently updated (default), experience = most years first,
    // evidence = most approved proof items first.
    sort: z.enum(DIRECTORY_SORTS, { error: 'SORT_INVALID' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 50).optional(),
  })
  .strict();

const WORKER_ID = /^DLM-\d{4}-\d{4,6}$/;

// GET /api/workers/compare?ids=DLM-2026-000001,DLM-2026-000002 — two or three different workers.
export const compareQuerySchema = z
  .object({
    ids: z
      .string({ error: 'ONE_VALUE' })
      .max(80, 'TEXT_TOO_LONG')
      .transform((text) => text.split(',').map((part) => part.trim()).filter(Boolean))
      .pipe(
        z
          .array(z.string().regex(WORKER_ID, 'WORKER_ID_INVALID'))
          .min(2, 'COMPARE_NEEDS_TWO')
          .max(3, 'COMPARE_MAX_THREE')
          .refine((list) => new Set(list).size === list.length, { message: 'COMPARE_SAME_WORKER' })
      ),
  })
  .strict();

export const workerIdCodeParams = z
  .object({ workerIdCode: z.string().regex(/^DLM-\d{4}-\d{4,6}$/, 'WORKER_ID_INVALID') })
  .strict();

export const profileIdParams = z.object({ id: objectId }).strict();

// PATCH /api/admin/workers/:id/identity (audit M1-9): a decision always has a note.
export const identityDecisionSchema = z
  .object({
    status: z.enum(['Verified', 'Rejected'], { error: 'IDENTITY_STATUS_INVALID' }),
    note: noCnic(
      z
        .string({ error: 'NOTE_REQUIRED' })
        .trim()
        .min(5, 'IDENTITY_NOTE_TOO_SHORT')
        .max(500, 'TEXT_TOO_LONG')
    ),
  })
  .strict();

export const adminWorkersQuerySchema = z
  .object({
    status: z.enum(['All', 'Unverified', 'Pending', 'Verified', 'Rejected'], { error: 'STATUS_UNKNOWN' }).optional(),
    q: z.string({ error: 'ONE_VALUE' }).trim().max(50, 'TEXT_TOO_LONG').optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

const isoDate = z
  .string({ error: 'ONE_VALUE' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'DATE_INVALID')
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), { message: 'DATE_NOT_REAL' });

export const auditQuerySchema = z
  .object({
    action: z.string({ error: 'ONE_VALUE' }).regex(/^[a-z]+(\.[a-z_]+)+$/, 'ACTION_UNKNOWN').max(60, 'TEXT_TOO_LONG').optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    page: queryInt(1, 10000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();
