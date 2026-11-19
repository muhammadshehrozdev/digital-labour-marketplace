// Module 5: the rules of price information, price terms and payment records (Batch 7).
//
// PROVISIONAL: every number below is a DESIGN PARAMETER, not a fact. They are written down here, in one
// place, so the team can change them after the pilot (docs/evaluation/PRICE-PILOT-PLAN.md). The live API
// and the simulator (evaluation/price-range) read the same values.
export const WAGE_RULES = Object.freeze({
  // the platform price range (services/wage/priceRange.js, decision D-070)
  PRICE_WINDOW_DAYS: 365, // only jobs completed in the last year count: prices rise every year
  MIN_JOBS: 5, // a range is shown only from at least this many jobs ...
  MIN_WORKERS: 3, // ... by at least this many different workers ...
  MIN_CUSTOMERS: 3, // ... for at least this many different customers
  ROUND_TO: 50, // low, median and high are rounded to the nearest Rs 50 (halves up)

  // price terms (services/wage/termsRules.js, decision D-073)
  MAX_TERMS_VERSIONS: 10,
  AMOUNT_MIN: 100, // whole rupees per unit
  AMOUNT_MAX: 5000000,
  QUANTITY_MAX: Object.freeze({ job: 1, day: 60, hour: 200 }),
  LARGE_ADVANCE_SHARE: 0.5, // an advance above this share of the total gets a warning

  // payment records (services/wage/paymentRules.js, decision D-076)
  MAX_PAYMENTS: 10, // per booking
  PAYMENT_RECORD_DAYS: 30, // a payment can be recorded up to this long after the booking closed
  PAYMENT_AMOUNT_MIN: 1,
  PAYMENT_AMOUNT_MAX: 5000000,

  // minimum wage references (config/wageReferences.js)
  WAGE_REFERENCE_STALE_DAYS: 365, // the admin Overview warns when a figure was checked longer ago
});

export const TERMS_NOTE_MAX = 300;
export const PAYMENT_NOTE_MAX = 200;
export const GUIDE_SOURCE_MIN = 10;
export const GUIDE_SOURCE_MAX = 300;
export const GUIDE_NOTE_MAX = 200;
