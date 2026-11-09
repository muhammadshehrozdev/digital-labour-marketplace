import { z } from 'zod';
import { CATEGORY_IDS, AVAILABILITY } from '../config/skillTaxonomy.js';
import { name, phone, optionalPhone, cnic, queryInt, objectId } from './common.js';

const text = (max, label) => z.string({ error: `${label} must be text` }).trim().max(max, `${label} must be at most ${max} characters`);

const workHistoryItem = z
  .object({
    jobTitle: text(100, 'Job title').min(2, 'Job title must be at least 2 characters'),
    clientOrEmployer: text(100, 'Client / location').optional().default(''),
    duration: text(50, 'Duration').optional().default(''),
    description: text(500, 'Description').optional().default(''),
  })
  .strict();

// PUT /api/workers/me — every field optional (send only what changed), unknown keys -> 400.
// The worker can never set workerIdCode, verificationStatus, cnicOnFile, user, etc.
// Skills are not set here: they have their own routes (/api/workers/me/skills, Module 2).
export const profileUpdateSchema = z
  .object({
    name: name.optional(),
    phone: phone.optional(),
    occupation: text(60, 'Occupation').min(2, 'Occupation must be at least 2 characters').optional(),
    category: z.enum(CATEGORY_IDS, { error: 'Category must be one of the listed trades' }).optional(),
    experienceYears: z
      .number({ error: 'Experience must be a number' })
      .int('Experience must be whole years')
      .min(0, 'Experience cannot be negative')
      .max(60, 'Experience must be 60 years or less')
      .optional(),
    hourlyRate: z.number({ error: 'Hourly rate must be a number' }).min(0, 'Hourly rate cannot be negative').max(1000000, 'Hourly rate is too high').optional(),
    dailyRate: z.number({ error: 'Daily rate must be a number' }).min(0, 'Daily rate cannot be negative').max(1000000, 'Daily rate is too high').optional(),
    city: text(50, 'City').min(2, 'City must be at least 2 characters').optional(),
    address: text(200, 'Address').optional(),
    whatsappNumber: optionalPhone.optional(),
    emergencyContact: text(100, 'Emergency contact').optional(),
    cnicNumber: cnic.optional(),
    languages: z.array(text(30, 'Language').min(1, 'Language cannot be empty')).max(10, 'At most 10 languages').optional(),
    availability: z.enum(AVAILABILITY, { error: 'Availability must be Available, Busy or Offline' }).optional(),
    bio: text(500, 'Bio').optional(),
    workHistory: z.array(workHistoryItem).max(20, 'At most 20 work records').optional(),
  })
  .strict();

// GET /api/workers — every value must be ONE string (no arrays, no objects), from known
// values where possible. Unknown keys such as "category[$ne]" -> 400 (audit M1-3, M1-4).
export const directoryQuerySchema = z
  .object({
    search: z.string({ error: 'search must be one text value' }).trim().max(50, 'Search text must be at most 50 characters').optional(),
    city: z.string({ error: 'city must be one text value' }).trim().max(50, 'City must be at most 50 characters').optional(),
    category: z.enum(['All', ...CATEGORY_IDS], { error: 'Unknown category' }).optional(),
    availability: z.enum(['All', ...AVAILABILITY], { error: 'Unknown availability' }).optional(),
    identity: z.enum(['all', 'verified'], { error: 'identity must be all or verified' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 50).optional(),
  })
  .strict();

export const workerIdCodeParams = z
  .object({ workerIdCode: z.string().regex(/^DLM-\d{4}-\d{4,6}$/, 'Worker ID must look like DLM-2026-000123') })
  .strict();

export const profileIdParams = z.object({ id: objectId }).strict();

// PATCH /api/admin/workers/:id/identity (audit M1-9): a decision always has a note.
export const identityDecisionSchema = z
  .object({
    status: z.enum(['Verified', 'Rejected'], { error: 'Status must be Verified or Rejected' }),
    note: z
      .string({ error: 'A note is required' })
      .trim()
      .min(5, 'Please write a note of at least 5 characters (how the CNIC was checked)')
      .max(500, 'Note must be at most 500 characters'),
  })
  .strict();

export const adminWorkersQuerySchema = z
  .object({
    status: z.enum(['All', 'Unverified', 'Pending', 'Verified', 'Rejected'], { error: 'Unknown status' }).optional(),
    q: z.string({ error: 'q must be one text value' }).trim().max(50, 'Search text must be at most 50 characters').optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

const isoDate = z
  .string({ error: 'Date must be one value' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like 2026-11-09')
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), { message: 'Not a real date' });

export const auditQuerySchema = z
  .object({
    action: z.string({ error: 'action must be one value' }).regex(/^[a-z]+(\.[a-z_]+)+$/, 'Unknown action').max(60).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    page: queryInt(1, 10000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();
