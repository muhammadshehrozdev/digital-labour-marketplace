import { z } from 'zod';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, REJECT_REASONS } from '../config/evidence.js';
import { objectId, queryInt } from './common.js';

const skillId = z.string({ error: 'SKILL_CHOOSE_OWN' }).regex(/^(custom-[a-z0-9-]{1,60}|[a-z0-9_]{2,40})$/, 'SKILL_CHOOSE_OWN');
export const CONSENT_TEXT = "I own this photo or have permission to share it, and it shows no other person's private information.";

// The text fields of the multipart upload (multer puts them in req.body as strings).
export const uploadFieldsSchema = z
  .object({
    skillId,
    type: z.enum(EVIDENCE_TYPES, { error: 'EVIDENCE_TYPE_INVALID' }),
    title: z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(80, 'TEXT_TOO_LONG').optional(),
    consent: z.literal('true', { error: 'CONSENT_REQUIRED' }),
  })
  .strict();

export const evidenceIdParams = z.object({ id: objectId }).strict();

export const myEvidenceQuerySchema = z.object({ skillId: skillId.optional() }).strict();

export const adminEvidenceQuerySchema = z
  .object({
    status: z.enum(['all', ...EVIDENCE_STATUSES], { error: 'STATUS_UNKNOWN' }).optional(),
    type: z.enum(['all', ...EVIDENCE_TYPES], { error: 'TYPE_UNKNOWN' }).optional(),
    skillId: skillId.optional(),
    duplicates: z.enum(['true'], { error: 'DUPLICATES_FILTER_INVALID' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

const note = z.string({ error: 'TEXT_MUST_BE_TEXT' }).trim().max(500, 'TEXT_TOO_LONG');

// PATCH /api/admin/evidence/:id — reject needs a reason code; suspected fake and revoke need a
// written reason; "other" needs a written note too.
export const evidenceDecisionSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'suspected_fake', 'revoke'], { error: 'ACTION_UNKNOWN' }),
    reasonCode: z.enum(REJECT_REASONS, { error: 'REASON_CODE_INVALID' }).optional(),
    note: note.optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    const written = (v.note ?? '').length >= 5;
    if (v.action === 'reject' && !v.reasonCode) ctx.addIssue({ code: 'custom', path: ['reasonCode'], message: 'REASON_REQUIRED_TO_REJECT' });
    if (v.action === 'reject' && v.reasonCode === 'other' && !written) ctx.addIssue({ code: 'custom', path: ['note'], message: 'REASON_OTHER_NEEDS_WORDS' });
    if ((v.action === 'suspected_fake' || v.action === 'revoke') && !written) {
      ctx.addIssue({ code: 'custom', path: ['note'], message: 'WRITTEN_REASON_REQUIRED' });
    }
    if (v.action !== 'reject' && v.reasonCode) ctx.addIssue({ code: 'custom', path: ['reasonCode'], message: 'REASON_CODE_ONLY_FOR_REJECT' });
  });
