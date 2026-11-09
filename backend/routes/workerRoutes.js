// Module 2 (old profiler) routes, mounted at /api/worker until the Phase 4 redesign
// replaces them with /api/workers/me/skills/*. Module 1 routes moved to routes/workers.js
// and routes/admin.js in Phase 3.
import express from 'express';
import { z } from 'zod';
import { analyzeWorkerSkills, resetAiSkillProfile, addRecommendedSkill } from '../controllers/workerController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const analyzeSchema = z
  .object({
    rawExperienceText: z.string({ error: 'Text is required' }).max(2000, 'Text must be at most 2000 characters'),
    isVoiceInput: z.boolean().optional(),
  })
  .strict();

const addSkillSchema = z
  .object({
    skillName: z.string({ error: 'Skill name is required' }).trim().min(1, 'Skill name is required').max(60),
    category: z.string().trim().max(60).optional(),
    level: z.enum(['Beginner', 'Intermediate', 'Expert']).optional(),
  })
  .strict();

router.post('/ai-skill-profiler', protect, requireRole('worker'), validate(analyzeSchema), analyzeWorkerSkills);
router.delete('/ai-skill-profiler/reset', protect, requireRole('worker'), resetAiSkillProfile);
router.post('/add-recommended-skill', protect, requireRole('worker'), validate(addSkillSchema), addRecommendedSkill);

export default router;
