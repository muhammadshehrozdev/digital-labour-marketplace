// Module 6: the job's derived state and what it allows (4.4 of the batch plan). PURE: plain data and `now` in.
//
// State, in this order:
//   1. status 'closed'                         -> closed
//   2. a booking made from it is completed     -> done
//   3. a booking is accepted                   -> accepted
//   4. a booking is requested                  -> requested
//   5. now - createdAt > OPEN_DAYS days        -> expired   (derived: no cron job)
//   6. otherwise                               -> open
// Closing a job never changes its bookings (an accepted booking goes on; Module 4 rules apply).
import { JOB_RULES } from '../../config/jobRules.js';
import { OPEN_STATUSES } from '../../config/bookingRules.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function jobState(job, bookings = [], now) {
  if (job.status === 'closed') return 'closed';
  const statuses = new Set(bookings.map((b) => b.status));
  if (statuses.has('completed')) return 'done';
  if (statuses.has('accepted')) return 'accepted';
  if (statuses.has('requested')) return 'requested';
  if (now.getTime() - new Date(job.createdAt).getTime() > JOB_RULES.OPEN_DAYS * DAY_MS) return 'expired';
  return 'open';
}

// What each state allows (the table of 4.4). Delete: only when no booking was ever made from the job.
const ALLOWED = Object.freeze({
  open: ['edit', 'find_workers', 'request', 'close', 'delete'],
  requested: ['find_workers', 'close'],
  accepted: ['find_workers', 'close'],
  done: ['close'],
  expired: ['close', 'delete'],
  closed: ['delete'],
});

export const canJob = (action, state, { hasBookings = false } = {}) => (ALLOWED[state] ?? []).includes(action) && !(action === 'delete' && hasBookings);
export const jobActions = (state, extra = {}) => (ALLOWED[state] ?? []).filter((a) => canJob(a, state, extra));

// The one-request reservation (D-082). Is the slot that `activeBooking` points to free?
//   null                              -> free
//   a booking that is still open      -> taken
//   a closed booking (declined, ...)  -> free (the next request replaces it)
//   no such booking                   -> taken while the reservation is fresh (its booking is being written);
//                                        free after STALE_RESERVATION_SECONDS (a request that crashed in between).
//                                        The ObjectId holds its own creation time, so no extra field is needed.
export function reservationIsFree(activeBooking, booking, now) {
  if (!activeBooking) return true;
  if (booking) return !OPEN_STATUSES.includes(booking.status);
  const madeAt = typeof activeBooking.getTimestamp === 'function' ? activeBooking.getTimestamp().getTime() : NaN;
  return Number.isFinite(madeAt) && now.getTime() - madeAt > JOB_RULES.STALE_RESERVATION_SECONDS * 1000;
}

// The day after which an open job without activity counts as expired (for the customer's screen).
export const openUntil = (job) => new Date(new Date(job.createdAt).getTime() + JOB_RULES.OPEN_DAYS * DAY_MS);
