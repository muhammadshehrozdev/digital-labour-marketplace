// Module 5: the lists behind the price terms, the important conditions and the payment records (Batch 7,
// decisions D-073 and D-075). ONE source: the validators, the pure rules and the website (through
// GET /api/meta/work-terms) all read these lists. The website words every id in three languages.

export const UNITS = Object.freeze(['job', 'day', 'hour']); // whole job, per day, per hour
export const DURATIONS = Object.freeze(['few_hours', 'one_day', 'two_three_days', 'longer']); // for a whole job only
export const MATERIALS = Object.freeze(['customer_buys', 'included_in_price', 'worker_buys_customer_pays']);
export const PAYMENT_TIMINGS = Object.freeze(['after_work', 'daily', 'part_before_rest_after']);
export const PAYMENT_METHODS = Object.freeze(['cash', 'easypaisa', 'jazzcash', 'bank', 'other']); // a record only
export const VISIT_CHARGES = Object.freeze(['none', 'included', 'separate']);
// Not a choice: shown as a fixed rule ("Extra work only after a new price is agreed in the app").
export const EXTRA_WORK_RULE = 'new_price_first';

export const TERMS_STATUSES = Object.freeze(['none', 'proposed', 'agreed']);

// The important conditions (the checklist). `price` = the amount and the unit.
export const CONDITIONS = Object.freeze(['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge']);
const ALWAYS = ['price', 'paymentTiming', 'paymentMethod'];
const WITH_MATERIALS = [...ALWAYS, 'materials', 'advance'];
const REPAIR = [...WITH_MATERIALS, 'visitCharge']; // repair visits: electrical, plumbing, AC, home maintenance
export const CATEGORY_CONDITIONS = Object.freeze({
  electrical_solar: Object.freeze(REPAIR),
  plumbing_sanitary: Object.freeze(REPAIR),
  ac_appliance_repair: Object.freeze(REPAIR),
  home_maintenance: Object.freeze(REPAIR),
  carpentry_woodwork: Object.freeze(WITH_MATERIALS),
  painting_renovation: Object.freeze(WITH_MATERIALS),
  construction_masonry: Object.freeze(WITH_MATERIALS),
  domestic_work: Object.freeze([...ALWAYS, 'materials']), // cleaning supplies
  moving_loading: Object.freeze([...ALWAYS, 'materials', 'advance']), // packing material
});
// A skill without a known category (a custom skill): the conditions every category has.
export const conditionsFor = (category) => CATEGORY_CONDITIONS[category] ?? Object.freeze(ALWAYS);

// What "materials" means in a category (the website words it: cleaning supplies, packing material).
export const MATERIALS_KIND = Object.freeze({ domestic_work: 'cleaning_supplies', moving_loading: 'packing_material' });
// Fixed texts (not questions) shown in the checklist of a category.
export const CATEGORY_NOTES = Object.freeze({ domestic_work: Object.freeze(['working_day_hours']) });

// The rule-based checks (services/wage/termsChecks.js). None blocks anything.
//   audience: whom the words speak to; every check is shown to BOTH people
export const CHECKS = Object.freeze({
  below_minimum_day: Object.freeze({ severity: 'warning', audience: 'both' }),
  below_minimum_hour: Object.freeze({ severity: 'warning', audience: 'both' }),
  below_minimum_job: Object.freeze({ severity: 'warning', audience: 'both' }),
  large_advance: Object.freeze({ severity: 'warning', audience: 'customer' }),
  worker_buys_no_advance: Object.freeze({ severity: 'info', audience: 'worker' }),
  missing_condition: Object.freeze({ severity: 'info', audience: 'both' }),
  below_platform_range: Object.freeze({ severity: 'info', audience: 'both' }),
});
export const CHECK_IDS = Object.freeze(Object.keys(CHECKS));

// Payment records
export const PAYMENT_KINDS = Object.freeze(['advance', 'part', 'final', 'materials', 'extra_work']);
// `materials` money pays for materials, not for the work: it is never counted against the agreed price
// or in the worker's earnings (decision D-076).
export const PRICE_PAYMENT_KINDS = Object.freeze(['advance', 'part', 'final', 'extra_work']);
export const PAYMENT_STATUSES = Object.freeze(['awaiting_confirmation', 'confirmed', 'disputed']);
export const PAYMENT_DISPUTE_REASONS = Object.freeze(['not_received', 'wrong_amount', 'other']);
// paymentSummary().state, decided in this order
export const PAYMENT_STATES = Object.freeze(['has_dispute', 'no_price', 'paid', 'part_paid', 'not_paid']);

// Everything the website needs, for GET /api/meta/work-terms (no database).
export function workTermsMeta() {
  return {
    units: UNITS,
    durations: DURATIONS,
    materials: MATERIALS,
    paymentTimings: PAYMENT_TIMINGS,
    paymentMethods: PAYMENT_METHODS,
    visitCharges: VISIT_CHARGES,
    extraWork: EXTRA_WORK_RULE,
    conditions: CONDITIONS,
    categoryConditions: CATEGORY_CONDITIONS,
    defaultConditions: conditionsFor(null),
    materialsKind: MATERIALS_KIND,
    categoryNotes: CATEGORY_NOTES,
    checks: CHECKS,
    paymentKinds: PAYMENT_KINDS,
    pricePaymentKinds: PRICE_PAYMENT_KINDS,
    paymentStatuses: PAYMENT_STATUSES,
    paymentDisputeReasons: PAYMENT_DISPUTE_REASONS,
    paymentStates: PAYMENT_STATES,
  };
}
