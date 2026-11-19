// "Identification of important payment and work conditions" (Module 5, decision D-075): fixed, rule-based
// checks of a price proposal. PURE: plain data in, plain data out. Every check WARNS; none blocks anything.
// The same function serves POST /api/prices/check (a draft, nothing saved) and the saved booking detail.
//
//   below_minimum_day     unit day and amount < the region's daily minimum-wage reference          warning
//   below_minimum_hour    unit hour and amount < the hourly reference                              warning
//   below_minimum_job     unit job: duration one_day and total < daily, or two_three_days and
//                         total < 2 x daily                                                         warning
//   large_advance         advance > LARGE_ADVANCE_SHARE x total                       warning (customer)
//   worker_buys_no_advance  materials worker_buys_customer_pays and advance 0              info (worker)
//   missing_condition     one per condition of the category that is not answered yet                 info
//   below_platform_range  a platform range exists for this unit and amount < its 25th percentile    info
//
// The three below_minimum_* checks run only when the region has a reference (unknown city, GB, AJK: none),
// below_platform_range only when a platform range exists. The others always run. Every check is shown to
// BOTH people; `audience` says whom its words speak to (the website adds "For the worker:" for the other one).
import { CHECKS, conditionsFor } from '../../config/workTerms.js';
import { WAGE_RULES } from '../../config/wageRules.js';

const check = (id, params = {}) => ({ id, severity: CHECKS[id].severity, audience: CHECKS[id].audience, params });
const answered = (value) => value !== null && value !== undefined;

// The total of a draft or a version: amount x quantity (a whole job is always quantity 1).
export function termsTotal(t) {
  if (!Number.isFinite(t?.amount)) return null;
  const quantity = t.unit === 'job' ? 1 : Number.isFinite(t.quantity) ? t.quantity : 1;
  return t.amount * quantity;
}

// Is condition `c` answered in terms `t`?
function hasCondition(c, t) {
  if (c === 'price') return Number.isFinite(t.amount) && answered(t.unit);
  return answered(t[c]);
}

/**
 * terms:    { amount, unit, quantity, duration, materials, advance, paymentTiming, paymentMethod, visitCharge }
 *           (any of them may be null in a draft)
 * category: the trade category of the booking's skill (or null)
 * wageRef:  wageReferenceFor(region) or null;  range: a priceRange() result or null
 * Returns a list of { id, severity, audience, params } in a fixed order.
 */
export function termsChecks({ terms = {}, category = null, wageRef = null, range = null, rules = WAGE_RULES }) {
  const t = terms ?? {};
  const out = [];
  const total = termsTotal(t);
  const amount = Number.isFinite(t.amount) ? t.amount : null;

  if (wageRef && amount !== null) {
    const region = wageRef.region;
    if (t.unit === 'day' && amount < wageRef.daily) out.push(check('below_minimum_day', { region, reference: wageRef.daily, amount }));
    if (t.unit === 'hour' && amount < wageRef.hourly) out.push(check('below_minimum_hour', { region, reference: wageRef.hourly, amount }));
    if (t.unit === 'job') {
      if (t.duration === 'one_day' && total < wageRef.daily) out.push(check('below_minimum_job', { region, reference: wageRef.daily, days: 1, total }));
      if (t.duration === 'two_three_days' && total < 2 * wageRef.daily) out.push(check('below_minimum_job', { region, reference: 2 * wageRef.daily, days: 2, total }));
    }
  }
  if (Number.isFinite(t.advance) && total !== null && t.advance > rules.LARGE_ADVANCE_SHARE * total) {
    out.push(check('large_advance', { advance: t.advance, total }));
  }
  if (t.materials === 'worker_buys_customer_pays' && t.advance === 0) out.push(check('worker_buys_no_advance'));
  for (const condition of conditionsFor(category)) {
    if (!hasCondition(condition, t)) out.push(check('missing_condition', { condition }));
  }
  if (range && amount !== null && range.unit === t.unit && amount < range.low) {
    out.push(check('below_platform_range', { low: range.low, unit: range.unit }));
  }
  return out;
}
