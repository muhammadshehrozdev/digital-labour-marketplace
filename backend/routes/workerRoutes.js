import express from 'express';
import {
  getWorkerProfile,
  updateWorkerProfile,
  getAllWorkers,
  verifyWorkerIdentity,
  getAllUsersForAdmin,
} from '../controllers/workerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Worker ke apne routes
router.get('/profile', protect, authorizeRoles('worker'), getWorkerProfile);
router.post('/profile', protect, authorizeRoles('worker'), updateWorkerProfile);

// Customer aur Admin ke liye tamam workers dekhne ka route
// M1-2: workers may not browse other workers' profiles.
router.get('/all', protect, authorizeRoles('customer', 'admin'), getAllWorkers);

// Sirf Admin ke routes (Identity verification & User management)
router.put('/verify/:id', protect, authorizeRoles('admin'), verifyWorkerIdentity);
router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsersForAdmin);

export default router;
