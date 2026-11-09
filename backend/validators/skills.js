import { z } from 'zod';
import { SKILL_IDS, CATEGORY_IDS } from '../config/skillTaxonomy.js';
import { MAX_TEXT_LENGTH } from '../services/skillExtractor/extractor.js';

const text = z
  .string({ error: 'Text must be a string' })
  .max(MAX_TEXT_LENGTH, `Text must be at most ${MAX_TEXT_LENGTH} characters`);

// POST /api/workers/me/skills/extract — saves nothing (fixes M2-2, M2-3, M2-11).
export const extractSchema = z
  .object({
    text: text.refine((t) => t.trim().length > 0, { message: 'Please write a few words about your work' }),
    inputMode: z.enum(['text', 'voice'], { error: 'inputMode must be text or voice' }).optional(),
  })
  .strict();

// POST /api/workers/me/skills — only taxonomy ids (fixes M2-9). Custom skills use their own route.
export const addSkillsSchema = z
  .object({
    skillIds: z
      .array(z.enum(SKILL_IDS, { error: 'Unknown skill. Choose a skill from the list.' }))
      .min(1, 'Choose at least one skill')
      .max(30, 'At most 30 skills at once'),
    addedVia: z.enum(['extractor', 'manual'], { error: 'addedVia must be extractor or manual' }),
    sourceText: text.optional(),
  })
  .strict();

// POST /api/workers/me/skills/custom — a clearly marked skill that is not in the taxonomy.
export const customSkillSchema = z
  .object({
    name: z.string({ error: 'Skill name is required' }).trim().min(2, 'Skill name must be at least 2 characters').max(60, 'Skill name must be at most 60 characters'),
    category: z.enum(CATEGORY_IDS, { error: 'Category must be one of the listed trades' }),
  })
  .strict();

export const skillIdParams = z
  .object({ skillId: z.string().regex(/^(custom-[a-z0-9-]{1,60}|[a-z0-9_]{2,40})$/, 'Invalid skill id') })
  .strict();
