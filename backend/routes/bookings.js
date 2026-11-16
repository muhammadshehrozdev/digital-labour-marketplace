// Module 4: the Work Booking routes. The role check is here; ownership is checked in the controller
// for every booking (a filter on the logged-in user's own id).
import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createBooking, listMyBookings, getBooking, acceptBooking, declineBooking, cancelBooking, confirmDone, contestDone,
  reportNoShow, respondNoShow, workerDispute,
} from '../controllers/bookingsController.js';
import { createReview } from '../controllers/reviewsController.js';
import {
  allowEmptyBody, bookingIdParams, createBookingSchema, myBookingsQuerySchema, declineSchema, cancelSchema, emptySchema,
  contestSchema, noShowRespondSchema, workerDisputeSchema, reviewSchema,
} from '../validators/bookings.js';

const router = express.Router();
const id = validate(bookingIdParams, 'params');
const body = (schema) => [allowEmptyBody, validate(schema)];
const people = requireRole('customer', 'worker');

router.use(protect);
router.post('/', requireRole('customer'), validate(createBookingSchema), createBooking);
router.get('/mine', people, validate(myBookingsQuerySchema, 'query'), listMyBookings);
router.get('/:id', requireRole('customer', 'worker', 'admin'), id, getBooking);
router.post('/:id/accept', requireRole('worker'), id, ...body(emptySchema), acceptBooking);
router.post('/:id/decline', requireRole('worker'), id, ...body(declineSchema), declineBooking);
router.post('/:id/cancel', people, id, ...body(cancelSchema), cancelBooking);
router.post('/:id/confirm-done', people, id, ...body(emptySchema), confirmDone);
router.post('/:id/contest-done', people, id, ...body(contestSchema), contestDone);
router.post('/:id/no-show', requireRole('customer'), id, ...body(emptySchema), reportNoShow);
router.post('/:id/no-show/respond', requireRole('worker'), id, validate(noShowRespondSchema), respondNoShow);
router.post('/:id/dispute', requireRole('worker'), id, validate(workerDisputeSchema), workerDispute);
router.post('/:id/review', requireRole('customer'), id, validate(reviewSchema), createReview);

export default router;
