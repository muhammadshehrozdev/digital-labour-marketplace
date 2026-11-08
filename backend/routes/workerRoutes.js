import express from 'express';
import {
  getWorkerProfile,
  updateWorkerProfile,
  analyzeWorkerSkills,
  resetAiSkillProfile,
  addRecommendedSkill,
  getAllWorkers,
  verifyWorkerIdentity,
  getAllUsersForAdmin,
} from '../controllers/workerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Module 1 routes
router.get('/profile', protect, authorizeRoles('worker'), getWorkerProfile);
router.post('/profile', protect, authorizeRoles('worker'), updateWorkerProfile);

// Module 2 routes
router.post('/ai-skill-profiler', protect, authorizeRoles('worker'), analyzeWorkerSkills);
router.delete('/ai-skill-profiler/reset', protect, authorizeRoles('worker'), resetAiSkillProfile);
router.post('/add-recommended-skill', protect, authorizeRoles('worker'), addRecommendedSkill);

// Customer & Admin routes
router.get('/all', protect, authorizeRoles('customer', 'admin', 'worker'), getAllWorkers);
router.put('/verify/:id', protect, authorizeRoles('admin'), verifyWorkerIdentity);
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsersForAdmin);

export default router;
