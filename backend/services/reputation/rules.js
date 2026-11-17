// The reputation rules in plain words, GENERATED FROM THE PARAMETERS (Batch 6B, BATCH_6B 5.5), so the worker's
// "My reputation" page and the Help Centre guide always say what the live engine does. PURE.
// Each item is a rule id (the website has its text in three languages) and the numbers in it.
//   rep-1  only customers; newer reviews count more (half-life); one customer less each time; customers who
//          hired others count fully
//   rep-2  only customers; one customer less each time; new accounts together at most B reviews; (burst on)
//          many reviews in a few days count less; a late cancellation counts double
import { DEFAULT_REPUTATION_PARAMS, engineVersionOf, rankFieldOf } from '../../config/reputationParams.js';
import { BOOKING_RULES } from '../../config/bookingRules.js';

export function reputationRules(params = DEFAULT_REPUTATION_PARAMS) {
  const engineVersion = engineVersionOf(params);
  const items = engineVersion === 'rep-1'
    ? [
      { id: 'onlyCustomers' },
      { id: 'newerCount', values: { halfLifeDays: params.halfLifeDays } },
      { id: 'sameCustomer' },
      { id: 'hiredOthers' },
    ]
    : [
      { id: 'onlyCustomers' },
      { id: 'sameCustomer' },
      { id: 'newAccounts', values: { budget: params.newReviewerBudget } },
      ...(params.burst ? [{ id: 'burst', values: { days: params.burst.windowDays, count: params.burst.minOthers + 1 } }] : []),
      { id: 'lateCancel', values: { hours: BOOKING_RULES.LATE_CANCEL_HOURS } },
    ];
  return {
    engineVersion,
    rankBy: rankFieldOf(params),
    newReviewerBudget: params.newReviewerBudget ?? null,
    burstCheck: Boolean(params.burst),
    halfLifeDays: params.halfLifeDays ?? null,
    lateCancelHours: BOOKING_RULES.LATE_CANCEL_HOURS,
    items: items.map((item) => ({ values: {}, ...item })),
  };
}
