// Module 4: the reviewed worker's reply (once) and report (once). Ownership in the controller.
import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { replyToReview, reportReview } from '../controllers/reviewsController.js';
import { reviewIdParams, replySchema, reportSchema } from '../validators/bookings.js';

const router = express.Router();
router.use(protect, requireRole('worker'));
router.post('/:id/reply', validate(reviewIdParams, 'params'), validate(replySchema), replyToReview);
router.post('/:id/report', validate(reviewIdParams, 'params'), validate(reportSchema), reportReview);

export default router;
