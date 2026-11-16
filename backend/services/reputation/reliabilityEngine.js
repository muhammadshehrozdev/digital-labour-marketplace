// The reliability record (Module 4, decision D-046). PURE FUNCTION: no database, no clock, no randomness.
//
// Input: the worker's CLOSED bookings { outcome, closedAt, customerId, skillId, accepted? }.
// Evidence per outcome (config/reputationParams.js, provisional):
//   completed                   1 positive
//   cancelled_by_worker_early   0.5 negative (the worker cancelled 24 hours or more before the start)
//   cancelled_by_worker_late    1 negative   (less than 24 hours before, or after the start)
//   worker_no_show              1 negative
//   declined, expired, cancelled_by_customer, closed_no_fault: nothing (a worker may always say no)
// Each item also gets the same recency weight as a review. Same Beta numbers as reviews (beta.js).
// The raw counts for display are never weighted.
import { DEFAULT_REPUTATION_PARAMS } from '../../config/reputationParams.js';
import { ageInDays, betaNumbers, depthFrom, recencyWeight, requireNow } from './beta.js';

export const OUTCOMES = Object.freeze([
  'completed', 'cancelled_by_worker_early', 'cancelled_by_worker_late', 'worker_no_show',
  'cancelled_by_customer', 'declined', 'expired', 'closed_no_fault',
]);
// Outcomes that can only happen after the worker accepted (used when `accepted` is not given).
const AFTER_ACCEPT = new Set(['completed', 'cancelled_by_worker_early', 'cancelled_by_worker_late', 'worker_no_show']);

export function computeReliability(bookings = [], { now, params = DEFAULT_REPUTATION_PARAMS } = {}) {
  requireNow(now);
  let r = 0;
  let s = 0;
  const counts = { completed: 0, workerCancelledEarly: 0, workerCancelledLate: 0, noShows: 0, acceptedTotal: 0 };
  const completedByCustomer = new Map();

  for (const b of bookings) {
    if (!OUTCOMES.includes(b.outcome)) throw new Error(`unknown outcome "${b.outcome}"`);
    const accepted = b.accepted ?? AFTER_ACCEPT.has(b.outcome);
    if (accepted) counts.acceptedTotal += 1;
    if (b.outcome === 'completed') {
      counts.completed += 1;
      const key = String(b.customerId);
      completedByCustomer.set(key, (completedByCustomer.get(key) ?? 0) + 1);
    }
    if (b.outcome === 'cancelled_by_worker_early') counts.workerCancelledEarly += 1;
    if (b.outcome === 'cancelled_by_worker_late') counts.workerCancelledLate += 1;
    if (b.outcome === 'worker_no_show') counts.noShows += 1;

    const positive = params.reliabilityPositive[b.outcome] ?? 0;
    const negative = params.reliabilityNegative[b.outcome] ?? 0;
    if (positive === 0 && negative === 0) continue; // outcomes that never count
    const weight = params.factors.recency ? recencyWeight(ageInDays(b.closedAt, now), params.halfLifeDays) : 1;
    r += weight * positive;
    s += weight * negative;
  }

  const numbers = betaNumbers(r, s, params);
  return {
    ...numbers,
    depth: depthFrom(numbers.uncertainty, counts.acceptedTotal > 0, params.depthThresholds),
    ...counts,
    repeatCustomers: [...completedByCustomer.values()].filter((n) => n >= 2).length,
  };
}
