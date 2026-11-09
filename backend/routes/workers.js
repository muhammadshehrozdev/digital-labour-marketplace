import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { getMyProfile, updateMyProfile, listDirectory, getPublicProfile } from '../controllers/workersController.js';
import { profileUpdateSchema, directoryQuerySchema, workerIdCodeParams } from '../validators/workers.js';

const router = express.Router();

// Own profile (worker only)
router.get('/me', protect, requireRole('worker'), getMyProfile);
router.put('/me', protect, requireRole('worker'), validate(profileUpdateSchema), updateMyProfile);

// Public directory (customer, admin). Workers may not browse other workers (audit M1-2).
router.get('/', protect, requireRole('customer', 'admin'), validate(directoryQuerySchema, 'query'), listDirectory);
router.get('/:workerIdCode', protect, requireRole('customer', 'admin'), validate(workerIdCodeParams, 'params'), getPublicProfile);

export default router;
