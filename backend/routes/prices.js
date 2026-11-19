// Module 5 (Batch 7): price information. Logged in (customer, worker, admin for the estimate; customer and
// worker for the draft check). Only aggregates are returned, so these routes get no extra rate limiter.
import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { priceCheck, priceEstimate } from '../controllers/wageController.js';
import { estimateQuerySchema, priceCheckSchema } from '../validators/wage.js';

const router = express.Router();
router.use(protect);
router.get('/estimate', requireRole('customer', 'worker', 'admin'), validate(estimateQuerySchema, 'query'), priceEstimate);
router.post('/check', requireRole('customer', 'worker'), validate(priceCheckSchema), priceCheck);

export default router;
