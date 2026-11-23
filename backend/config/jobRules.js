// Module 6 (Batch 8A): rules of the job request (decisions D-080 to D-084).
//
// PROVISIONAL: the limits below are DESIGN PARAMETERS, not facts (like config/bookingRules.js). They are written
// down here, in one place, so the team can change them after the pilot.
import { BOOKING_TEXT_MAX } from './bookingRules.js';

export const JOB_RULES = Object.freeze({
  MAX_OPEN_PER_CUSTOMER: 10, // jobs in state open, requested or accepted
  MAX_NEW_PER_DAY: 10, // per customer, in the last 24 hours
  OPEN_DAYS: 30, // a job with no booking activity "expires" (derived, no cron) this long after it was saved
  MAX_SKILLS: 5,
  MAX_OPEN_BOOKINGS_PER_JOB: 1, // one request at a time (D-081); enforced by the activeBooking reservation
  CANDIDATE_LIMIT: 500, // "workers for this job": at most this many candidates are read before the city filter
  STALE_RESERVATION_SECONDS: 60, // a reservation whose booking was never written is free after this long (D-082)
});

// What kind of work it is (the annotation guide defines each one with examples):
//   install        fit something new or a replacement
//   repair         something is broken, leaking or not working
//   service        routine care of something that works (AC service, chemical wash)
//   new_work       build, make, paint, renovate, tile
//   cleaning       cleaning
//   moving         shifting, loading
//   household_help cooking, laundry, child or elder care, daily help
export const TASK_TYPES = Object.freeze(['install', 'repair', 'service', 'new_work', 'cleaning', 'moving', 'household_help']);
export const CLOSE_REASONS = Object.freeze(['work_done', 'not_needed', 'found_elsewhere', 'other']);
export const INPUT_MODES = Object.freeze(['text', 'voice']);
// The job's text fits into a booking: the same limits as a booking's description and area.
export const JOB_TEXT_MAX = Object.freeze({ description: BOOKING_TEXT_MAX.description, area: BOOKING_TEXT_MAX.area });
export const JOB_TEXT_MIN = Object.freeze({ description: 3, area: 2, analyze: 1 });

// The derived states of a job (services/jobs/state.js) and the list filters of GET /api/job-requests/mine.
export const JOB_STATES = Object.freeze(['open', 'requested', 'accepted', 'done', 'expired', 'closed']);
export const ACTIVE_JOB_STATES = Object.freeze(['open', 'requested', 'accepted']);
export const JOB_LIST_STATES = Object.freeze([...JOB_STATES, 'active', 'all']);
export const JOB_ACTIONS = Object.freeze(['edit', 'find_workers', 'request', 'close', 'delete']);
