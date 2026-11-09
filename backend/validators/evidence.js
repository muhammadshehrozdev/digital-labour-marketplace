import { z } from 'zod';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, REJECT_REASONS } from '../config/evidence.js';
import { objectId, queryInt } from './common.js';

const skillId = z.string({ error: 'Choose one of your skills' }).regex(/^(custom-[a-z0-9-]{1,60}|[a-z0-9_]{2,40})$/, 'Choose one of your skills');
export const CONSENT_TEXT = "I own this photo or have permission to share it, and it shows no other person's private information.";

// The text fields of the multipart upload (multer puts them in req.body as strings).
export const uploadFieldsSchema = z
  .object({
    skillId,
    type: z.enum(EVIDENCE_TYPES, { error: 'Choose the kind of proof: certificate, work photo or reference letter' }),
    title: z.string().trim().max(80, 'Title must be at most 80 characters').optional(),
    consent: z.literal('true', { error: 'Please tick the consent box before uploading' }),
  })
  .strict();

export const evidenceIdParams = z.object({ id: objectId }).strict();

export const myEvidenceQuerySchema = z.object({ skillId: skillId.optional() }).strict();

export const adminEvidenceQuerySchema = z
  .object({
    status: z.enum(['all', ...EVIDENCE_STATUSES], { error: 'Unknown status' }).optional(),
    type: z.enum(['all', ...EVIDENCE_TYPES], { error: 'Unknown type' }).optional(),
    skillId: skillId.optional(),
    duplicates: z.enum(['true'], { error: 'duplicates must be "true"' }).optional(),
    page: queryInt(1, 1000).optional(),
    limit: queryInt(1, 100).optional(),
  })
  .strict();

const note = z.string({ error: 'The reason must be text' }).trim().max(500, 'The reason must be at most 500 characters');

// PATCH /api/admin/evidence/:id — reject needs a reason code; suspected fake and revoke need a
// written reason; "other" needs a written note too.
export const evidenceDecisionSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'suspected_fake', 'revoke'], { error: 'Unknown action' }),
    reasonCode: z.enum(REJECT_REASONS, { error: 'Choose a reason: unclear, not relevant, wrong skill or other' }).optional(),
    note: note.optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    const written = (v.note ?? '').length >= 5;
    if (v.action === 'reject' && !v.reasonCode) ctx.addIssue({ code: 'custom', path: ['reasonCode'], message: 'A reason is required to reject' });
    if (v.action === 'reject' && v.reasonCode === 'other' && !written) ctx.addIssue({ code: 'custom', path: ['note'], message: 'Write the reason (at least 5 characters)' });
    if ((v.action === 'suspected_fake' || v.action === 'revoke') && !written) {
      ctx.addIssue({ code: 'custom', path: ['note'], message: 'A written reason (at least 5 characters) is required' });
    }
    if (v.action !== 'reject' && v.reasonCode) ctx.addIssue({ code: 'custom', path: ['reasonCode'], message: 'A reason code is only used to reject' });
  });
