// Payment records of a booking (Module 5, decision D-076). PURE, in the style of services/booking/transitions.js.
// The app never moves money: a record says "I paid" (customer) or "I received" (worker), and only the OTHER
// person confirms or disputes it. A record is never edited, deleted or confirmed automatically: a mistake is
// corrected by disputing it and recording a new one (a record that can be changed later can be bargained over).
//
//   record_payment   customer or worker   booking accepted, or up to PAYMENT_RECORD_DAYS after it was
//                                         completed or cancelled (only if it was ever accepted); fewer than
//                                         MAX_PAYMENTS records; no open dispute
//   confirm_payment  the other person     the record is awaiting confirmation; no open dispute
//   dispute_payment  the other person     the same (a reason is required)
import { WAGE_RULES } from '../../config/wageRules.js';
import { addDays, pktDate } from '../booking/schedule.js';

const PEOPLE = ['customer', 'worker'];
const disputeOpen = (b) => b.dispute?.status === 'open';

// The moment the 30-day window starts: when the booking was completed or cancelled.
const closedMoment = (b) => b.completedAt ?? b.closedAt ?? null;

export function canRecordPayment(b, role, now, params = WAGE_RULES) {
  if (!PEOPLE.includes(role)) return { ok: false, code: 'FORBIDDEN' };
  if (disputeOpen(b)) return { ok: false, code: 'DISPUTE_OPEN' };
  if (!b.acceptedAt) return { ok: false, code: 'PAYMENT_NOT_ALLOWED' }; // never accepted: no work, no payment
  if (b.status === 'accepted') {
    // open
  } else if (['completed', 'cancelled'].includes(b.status) && closedMoment(b)) {
    if (now > addDays(closedMoment(b), params.PAYMENT_RECORD_DAYS)) return { ok: false, code: 'PAYMENT_WINDOW_PASSED' };
  } else {
    return { ok: false, code: 'PAYMENT_NOT_ALLOWED' };
  }
  if ((b.payments ?? []).length >= params.MAX_PAYMENTS) return { ok: false, code: 'PAYMENT_LIMIT' };
  return { ok: true };
}

// `paidOn` ('YYYY-MM-DD', the day in Pakistan): not in the future, not before the day the booking was created.
export function checkPaidOn(paidOn, b, now) {
  if (paidOn > pktDate(now)) return { ok: false, code: 'PAYMENT_DATE_FUTURE' };
  if (b.createdAt && paidOn < pktDate(new Date(b.createdAt))) return { ok: false, code: 'PAYMENT_DATE_TOO_EARLY' };
  return { ok: true };
}

// Confirm or dispute one record (`payment`, or undefined when the id is not on this booking).
export function canRespondPayment(action, b, payment, role) {
  if (!['confirm_payment', 'dispute_payment'].includes(action)) return { ok: false, code: 'PAYMENT_NOT_ALLOWED' };
  if (!PEOPLE.includes(role)) return { ok: false, code: 'FORBIDDEN' };
  if (!payment) return { ok: false, code: 'PAYMENT_NOT_FOUND' };
  if (disputeOpen(b)) return { ok: false, code: 'DISPUTE_OPEN' };
  if (payment.recordedBy === role) return { ok: false, code: 'PAYMENT_OWN_RECORD' };
  if (payment.status !== 'awaiting_confirmation') return { ok: false, code: 'PAYMENT_CHANGED' };
  return { ok: true };
}

// The payment buttons for this person now: { record: bool, respond: [paymentId] }.
export function availablePaymentActions(b, role, now) {
  const record = canRecordPayment(b, role, now).ok;
  const respond = (b.payments ?? []).filter((p) => canRespondPayment('confirm_payment', b, p, role).ok).map((p) => String(p._id));
  return { record, respond };
}
