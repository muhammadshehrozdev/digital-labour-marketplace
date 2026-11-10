// Validation for the Batch 4 admin routes: users, charts, exports, reason templates.
import { z } from 'zod';
import { EVIDENCE_STATUSES } from '../config/evidence.js';
import { IDENTITY_STATUSES } from '../models/WorkerProfile.js';
import { TEMPLATE_KINDS, TEMPLATE_TEXT_MAX } from '../models/ReasonTemplate.js';
import { noCnic, objectId, queryInt } from './common.js';

const one = (max) => z.string({ error: 'ONE_VALUE' }).trim().max(max, 'TEXT_TOO_LONG');

// GET /api/admin/users
export const adminUsersQuerySchema = z
  .object({
    q: one(50).optional(),
    role: z.enum(['all', 'worker', 'customer', 'admin'], { error: 'ROLE_FILTER_INVALID' }).optional(),
    status: z.enum(['all', 'active', 'suspended'], { error: 'USER_STATUS_INVALID' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

export const userIdParams = z.object({ id: objectId }).strict();

// PATCH /api/admin/users/:id/status — a reason is always required, and it is written to the audit log.
export const userStatusSchema = z
  .object({
    status: z.enum(['active', 'suspended'], { error: 'USER_STATUS_INVALID' }),
    reason: noCnic(z.string({ error: 'REASON_REQUIRED' }).trim().min(5, 'REASON_TOO_SHORT').max(300, 'TEXT_TOO_LONG')),
  })
  .strict();

// GET /api/admin/charts
export const chartsQuerySchema = z.object({ days: queryInt(7, 90).optional() }).strict();

// GET /api/admin/exports/:kind
export const EXPORT_KINDS = Object.freeze(['audit', 'identity', 'evidence', 'users']);
export const exportParams = z.object({ kind: z.enum(EXPORT_KINDS, { error: 'EXPORT_KIND_UNKNOWN' }) }).strict();

const isoDate = z
  .string({ error: 'ONE_VALUE' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'DATE_INVALID')
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), { message: 'DATE_NOT_REAL' });

export const exportQuerySchema = z
  .object({
    action: z.string({ error: 'ONE_VALUE' }).regex(/^[a-z]+(\.[a-z_]+)+$/, 'ACTION_UNKNOWN').max(60, 'TEXT_TOO_LONG').optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    status: z.enum(['all', 'All', ...IDENTITY_STATUSES, ...EVIDENCE_STATUSES, 'active', 'suspended'], { error: 'STATUS_UNKNOWN' }).optional(),
  })
  .strict();

// Reason templates
const templateText = (min) => noCnic(z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().min(min, 'TEMPLATE_TEXT_REQUIRED').max(TEMPLATE_TEXT_MAX, 'TEXT_TOO_LONG'));
const texts = z
  .object({ en: templateText(5), ur: templateText(0).optional(), 'ur-Latn': templateText(0).optional() })
  .strict();
const kind = z.enum(TEMPLATE_KINDS, { error: 'TEMPLATE_KIND_INVALID' });

export const templateQuerySchema = z.object({ kind: kind.optional() }).strict();
export const templateCreateSchema = z.object({ kind, text: texts }).strict();
export const templateUpdateSchema = z.object({ text: texts }).strict();
export const templateIdParams = z.object({ id: objectId }).strict();
