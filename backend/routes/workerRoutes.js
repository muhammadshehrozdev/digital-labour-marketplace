import express from 'express';
import { getWorkerProfile, updateWorkerProfile } from '../controllers/workerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Yeh routes sirf logged-in 'worker' ke liye hain
router.get('/profile', protect, authorizeRoles('worker'), getWorkerProfile);
router.post('/profile', protect, authorizeRoles('worker'), updateWorkerProfile);

export default router;