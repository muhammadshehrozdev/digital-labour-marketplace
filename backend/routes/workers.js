import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { getMyProfile, getMyFullProfile, getMyOnboarding, updateMyProfile, listDirectory, getPublicProfile, compareWorkers } from '../controllers/workersController.js';
import { extract, listMySkills, listPotentialSkills, addSkills, addCustomSkill, removeSkill } from '../controllers/skillsController.js';
import { extractSchema, addSkillsSchema, customSkillSchema, skillIdParams } from '../validators/skills.js';
import { profileUpdateSchema, directoryQuerySchema, workerIdCodeParams, compareQuerySchema } from '../validators/workers.js';

const router = express.Router();

// Own profile (worker only)
router.get('/me', protect, requireRole('worker'), getMyProfile);
router.put('/me', protect, requireRole('worker'), validate(profileUpdateSchema), updateMyProfile);
router.get('/me/onboarding', protect, requireRole('worker'), getMyOnboarding);
router.get('/me/full', protect, requireRole('worker'), getMyFullProfile);

// Own skills (Module 2). Extract gives suggestions and saves nothing.
router.post('/me/skills/extract', protect, requireRole('worker'), validate(extractSchema), extract);
router.get('/me/skills', protect, requireRole('worker'), listMySkills);
router.get('/me/skills/potential', protect, requireRole('worker'), listPotentialSkills);
router.post('/me/skills', protect, requireRole('worker'), validate(addSkillsSchema), addSkills);
router.post('/me/skills/custom', protect, requireRole('worker'), validate(customSkillSchema), addCustomSkill);
router.delete('/me/skills/:skillId', protect, requireRole('worker'), validate(skillIdParams, 'params'), removeSkill);

// Public directory (customer, admin). Workers may not browse other workers (audit M1-2).
router.get('/', protect, requireRole('customer', 'admin'), validate(directoryQuerySchema, 'query'), listDirectory);
router.get('/compare', protect, requireRole('customer', 'admin'), validate(compareQuerySchema, 'query'), compareWorkers);
router.get('/:workerIdCode', protect, requireRole('customer', 'admin'), validate(workerIdCodeParams, 'params'), getPublicProfile);

export default router;
