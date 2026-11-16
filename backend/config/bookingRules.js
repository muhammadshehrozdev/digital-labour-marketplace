// Module 4: rules of the minimal Work Booking (Batch 6, decisions D-037, D-039, D-040).
//
// PROVISIONAL: the hours and limits below are DESIGN PARAMETERS, not facts. They are written down
// here, in one place, so the team can change them after the pilot (docs/evaluation/REPUTATION-PILOT-PLAN.md).
export const BOOKING_RULES = Object.freeze({
  REQUEST_EXPIRY_HOURS: 48, // a request the worker does not answer expires
  AUTO_COMPLETE_HOURS: 72, // one side pressed "Work done" and the other did nothing
  LATE_CANCEL_HOURS: 24, // a worker cancelling less than this before the start is "late"
  NO_SHOW_AFTER_START_HOURS: 2, // "Worker did not come" can be pressed from the start + this
  NO_SHOW_RESPONSE_HOURS: 72, // the worker's time to answer a no-show report
  DISPUTE_WINDOW_DAYS: 14, // a worker may dispute a cancellation fault or an unanswered no-show
  REVIEW_WINDOW_DAYS: 14, // the customer may review this long after completion
  REVIEW_REMINDER_DAYS: 3, // one reminder after this many days without a review
  CONTACT_VISIBLE_DAYS_AFTER_CLOSE: 7, // phone numbers stay visible this long after the booking closed
  MAX_OPEN_PER_CUSTOMER: 5,
  MAX_OPEN_PER_PAIR: 1,
  MAX_NEW_PER_DAY: 10, // per customer, in the last 24 hours
  MAX_DAYS_AHEAD: 30, // preferredDate: today up to this many days ahead (Pakistan time)
});

// Time slots: the start hour in Pakistan time. "any" is treated as 09:00.
export const TIME_SLOTS = Object.freeze({ morning: 9, afternoon: 13, evening: 17, any: 9 });

export const BOOKING_STATUSES = Object.freeze(['requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled']);
export const OPEN_STATUSES = Object.freeze(['requested', 'accepted']);
export const DECLINE_REASONS = Object.freeze(['busy', 'too_far', 'not_my_work', 'other']);
// Reasons for cancelling (picture cards). Required after acceptance.
export const CANCEL_REASONS = Object.freeze(['plans_changed', 'found_someone_else', 'cannot_come', 'emergency', 'price', 'other']);
export const DISPUTE_TYPES = Object.freeze(['completion_contested', 'no_show_contested', 'cancellation_fault']);
// Why someone opens a dispute (picture cards on the worker's and customer's side).
export const DISPUTE_REASONS = Object.freeze(['work_was_done', 'work_not_done', 'i_did_come', 'not_my_fault', 'other']);
export const DISPUTE_DECISIONS = Object.freeze({
  completion_contested: ['work_done', 'not_done_worker_fault', 'not_done_no_fault'],
  no_show_contested: ['no_show_confirmed', 'no_show_rejected'],
  cancellation_fault: ['worker_fault', 'no_fault'],
});
export const BOOKING_TEXT_MAX = Object.freeze({ area: 80, description: 500, note: 300 });
