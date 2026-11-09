import { z } from 'zod';
import { SKILL_IDS, CATEGORY_IDS } from '../config/skillTaxonomy.js';
import { MAX_TEXT_LENGTH } from '../services/skillExtractor/extractor.js';

const text = z
  .string({ error: 'TEXT_MUST_BE_TEXT' })
  .max(MAX_TEXT_LENGTH, 'TEXT_TOO_LONG');

// POST /api/workers/me/skills/extract — saves nothing (fixes M2-2, M2-3, M2-11).
export const extractSchema = z
  .object({
    text: text.refine((t) => t.trim().length > 0, { message: 'TEXT_EMPTY' }),
    inputMode: z.enum(['text', 'voice'], { error: 'INPUT_MODE_INVALID' }).optional(),
  })
  .strict();

// POST /api/workers/me/skills — only taxonomy ids (fixes M2-9). Custom skills use their own route.
export const addSkillsSchema = z
  .object({
    skillIds: z
      .array(z.enum(SKILL_IDS, { error: 'SKILL_UNKNOWN' }))
      .min(1, 'SKILL_CHOOSE_ONE')
      .max(30, 'LIST_TOO_LONG'),
    addedVia: z.enum(['extractor', 'manual'], { error: 'ADDED_VIA_INVALID' }),
    sourceText: text.optional(),
  })
  .strict();

// POST /api/workers/me/skills/custom — a clearly marked skill that is not in the taxonomy.
export const customSkillSchema = z
  .object({
    name: z.string({ error: 'NAME_REQUIRED' }).trim().min(2, 'TEXT_TOO_SHORT').max(60, 'TEXT_TOO_LONG'),
    category: z.enum(CATEGORY_IDS, { error: 'CATEGORY_INVALID' }),
  })
  .strict();

export const skillIdParams = z
  .object({ skillId: z.string().regex(/^(custom-[a-z0-9-]{1,60}|[a-z0-9_]{2,40})$/, 'SKILL_ID_INVALID') })
  .strict();
