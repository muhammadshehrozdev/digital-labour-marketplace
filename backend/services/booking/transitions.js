// The Work Booking state machine (Module 4, decision D-037). PURE functions, no database: the
// controller asks `canDo` first and then makes a CONDITIONAL update on the state it checked, so a
// stale or double action gets 409 (the same pattern as services/evidence/transitions.js).
//
//   (new) ---------------------------------------------------> requested   (customer)
//   requested --accept (worker)-------------------------------> accepted
//   requested --decline (worker, optional reason)-------------> declined
//   requested --cancel (customer)-----------------------------> cancelled   outcome cancelled_by_customer
//   requested --expire (system, after 48 h)--------------------> expired
//   accepted  --cancel (customer or worker, reason)-----------> cancelled   by customer: no fault; by worker: early / late
//   accepted  --both pressed "Work done" / auto after 72 h / admin --> completed
//   accepted  --confirmed no-show / dispute decision (system, admin) --> cancelled
import { BOOKING_RULES as RULES } from '../../config/bookingRules.js';
import { addDays, addHours } from './schedule.js';

export const STATE_TABLE = Object.freeze({
  accept: { from: ['requested'], to: 'accepted', roles: ['worker'] },
  decline: { from: ['requested'], to: 'declined', roles: ['worker'] },
  cancel: { from: ['requested', 'accepted'], to: 'cancelled', roles: ['customer', 'worker'] },
  confirm_done: { from: ['accepted'], to: 'accepted|completed', roles: ['customer', 'worker'] },
  contest_done: { from: ['accepted'], to: 'accepted', roles: ['customer', 'worker'] },
  report_no_show: { from: ['accepted'], to: 'accepted', roles: ['customer'] },
  respond_no_show: { from: ['accepted'], to: 'accepted|cancelled', roles: ['worker'] },
  dispute: { from: ['cancelled'], to: 'cancelled', roles: ['worker'] },
  review: { from: ['completed'], to: 'completed', roles: ['customer'] },
  // system and admin steps (never offered as a button to the two people)
  expire: { from: ['requested'], to: 'expired', roles: ['system'] },
  auto_complete: { from: ['accepted'], to: 'completed', roles: ['system'] },
  close_no_show: { from: ['accepted'], to: 'cancelled', roles: ['system'] },
  decide_dispute: { from: ['accepted', 'cancelled'], to: 'completed|cancelled', roles: ['admin'] },
});

const PEOPLE_ACTIONS = ['accept', 'decline', 'cancel', 'confirm_done', 'contest_done', 'report_no_show', 'respond_no_show', 'dispute', 'review'];

export const disputeOpen = (b) => b.dispute?.status === 'open';
const hasDispute = (b) => Boolean(b.dispute?.type);
const anyConfirmed = (b) => Boolean(b.customerConfirmedAt || b.workerConfirmedAt);
const noShowReported = (b) => Boolean(b.noShow?.reportedAt);

// The earliest moment the customer may press "Worker did not come".
export const noShowFrom = (b) => addHours(b.scheduledStart, RULES.NO_SHOW_AFTER_START_HOURS);

// Can `role` take `action` on booking `b` at `now`? Returns { ok: true } or { ok: false, code }.
// `extra.hasReview`: whether the booking already has a review (for "review").
export function canDo(action, b, role, now, extra = {}) {
  const rule = STATE_TABLE[action];
  if (!rule) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
  if (!rule.roles.includes(role)) return { ok: false, code: 'FORBIDDEN' };
  // already where this step leads (a double tap, or two people at once): 409; any other wrong state: 400
  if (!rule.from.includes(b.status)) return { ok: false, code: rule.to.split('|').includes(b.status) ? 'BOOKING_CHANGED' : 'BOOKING_NOT_ALLOWED' };
  if (disputeOpen(b) && action !== 'decide_dispute') return { ok: false, code: 'DISPUTE_OPEN' };
  const mine = role === 'customer' ? 'customerConfirmedAt' : 'workerConfirmedAt';
  const theirs = role === 'customer' ? 'workerConfirmedAt' : 'customerConfirmedAt';

  switch (action) {
    case 'cancel':
      // after "Work done" or a no-show report, the right step is the other side's answer, not a cancel
      if (b.status === 'requested' && role !== 'customer') return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      if (b.status === 'accepted' && (anyConfirmed(b) || noShowReported(b))) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      return { ok: true };
    case 'confirm_done':
      if (b[mine]) return { ok: false, code: 'BOOKING_CHANGED' }; // pressed twice
      if (noShowReported(b)) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      return { ok: true };
    case 'contest_done':
      // "This work was not done": instead of confirming, after the OTHER side pressed "Work done" (D-050)
      if (b[mine] || !b[theirs]) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      return { ok: true };
    case 'report_no_show':
      if (anyConfirmed(b) || noShowReported(b)) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      if (now < noShowFrom(b)) return { ok: false, code: 'NO_SHOW_TOO_EARLY' };
      return { ok: true };
    case 'respond_no_show':
      if (!noShowReported(b) || b.noShow?.workerResponse) return { ok: false, code: 'BOOKING_NOT_ALLOWED' };
      return { ok: true };
    case 'dispute': {
      // a worker disputes a cancellation that counts against him, or a no-show confirmed only because
      // he did not answer; within DISPUTE_WINDOW_DAYS of the close; at most one dispute per booking (D-049)
      const cancelFault = ['cancelled_by_worker_early', 'cancelled_by_worker_late'].includes(b.outcome);
      const lateNoShow = b.outcome === 'worker_no_show' && b.noShow?.workerResponse === 'no_answer';
      if (hasDispute(b) || !(cancelFault || lateNoShow)) return { ok: false, code: 'DISPUTE_NOT_ALLOWED' };
      if (now > addDays(b.closedAt, RULES.DISPUTE_WINDOW_DAYS)) return { ok: false, code: 'DISPUTE_WINDOW_PASSED' };
      return { ok: true, type: cancelFault ? 'cancellation_fault' : 'no_show_contested' };
    }
    case 'review':
      if (extra.hasReview) return { ok: false, code: 'REVIEW_EXISTS' };
      if (now > addDays(b.completedAt, RULES.REVIEW_WINDOW_DAYS)) return { ok: false, code: 'REVIEW_WINDOW_PASSED' };
      return { ok: true };
    case 'decide_dispute':
      if (!disputeOpen(b)) return { ok: false, code: 'DISPUTE_NOT_OPEN' };
      return { ok: true };
    default:
      return { ok: true };
  }
}

// The buttons that fit the booking for this person now (the server checks each one again).
export const availableActions = (b, role, now, extra = {}) => PEOPLE_ACTIONS.filter((action) => canDo(action, b, role, now, extra).ok);

// The outcome when a booking is cancelled (Section 4.4 of the plan).
export function cancelOutcome(b, role, now) {
  if (role === 'customer') return 'cancelled_by_customer';
  return addHours(now, RULES.LATE_CANCEL_HOURS) <= new Date(b.scheduledStart) ? 'cancelled_by_worker_early' : 'cancelled_by_worker_late';
}

// What an admin decision does: the new status and outcome (null = leave as it is).
export function disputeResult(type, decision, b) {
  const stillOpen = b.status === 'accepted';
  switch (`${type}:${decision}`) {
    case 'completion_contested:work_done':
      return { status: 'completed', outcome: 'completed', completionMethod: 'admin' };
    case 'completion_contested:not_done_worker_fault':
      return { status: 'cancelled', outcome: 'worker_no_show' };
    case 'completion_contested:not_done_no_fault':
      return { status: 'cancelled', outcome: 'closed_no_fault' };
    case 'no_show_contested:no_show_confirmed':
      return { status: 'cancelled', outcome: 'worker_no_show', ...(stillOpen ? {} : { unchanged: true }) };
    case 'no_show_contested:no_show_rejected':
      return { status: 'cancelled', outcome: 'closed_no_fault' };
    case 'cancellation_fault:worker_fault':
      return { status: b.status, outcome: b.outcome, unchanged: true };
    case 'cancellation_fault:no_fault':
      return { status: 'cancelled', outcome: 'closed_no_fault' };
    default:
      return null;
  }
}
