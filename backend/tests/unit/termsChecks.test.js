// Module 5 (Batch 7, §4.3): the important conditions and the rule-based checks. Every check has a case that
// fires and one that does not. Pure function, no database.
import { describe, test, expect } from 'vitest';
import { CATEGORY_CONDITIONS, CHECK_IDS, conditionsFor, workTermsMeta } from '../../config/workTerms.js';
import { termsChecks, termsTotal } from '../../services/wage/termsChecks.js';
import { wageReferenceFor } from '../../services/wage/wageReference.js';

const ICT = wageReferenceFor('ICT'); // daily 1565, hourly 196
const PB = wageReferenceFor('PB'); // daily 1538, hourly 192
// every condition answered, so only the check under test appears
const full = (extra = {}) => ({ amount: 2500, unit: 'job', quantity: 1, duration: 'few_hours', materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'none', ...extra });
const ids = (list) => list.map((c) => c.id);
const run = (terms, extra = {}) => termsChecks({ terms, category: 'electrical_solar', wageRef: ICT, ...extra });

describe('the important conditions per trade category', () => {
  test('every category asks price, payment timing and method; the repair trades also visit charge', () => {
    for (const list of Object.values(CATEGORY_CONDITIONS)) expect(list.slice(0, 3)).toEqual(['price', 'paymentTiming', 'paymentMethod']);
    for (const c of ['electrical_solar', 'plumbing_sanitary', 'ac_appliance_repair', 'home_maintenance']) expect(CATEGORY_CONDITIONS[c]).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge']);
    for (const c of ['carpentry_woodwork', 'painting_renovation', 'construction_masonry']) expect(CATEGORY_CONDITIONS[c]).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance']);
    expect(CATEGORY_CONDITIONS.domestic_work).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials']);
    expect(CATEGORY_CONDITIONS.moving_loading).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance']);
    expect(conditionsFor(null)).toEqual(['price', 'paymentTiming', 'paymentMethod']);
    expect(conditionsFor('unknown')).toEqual(['price', 'paymentTiming', 'paymentMethod']);
  });
  test('the meta list carries the ids the website words, and the domestic-work hours note', () => {
    const meta = workTermsMeta();
    expect(meta.units).toEqual(['job', 'day', 'hour']);
    expect(meta.extraWork).toBe('new_price_first');
    expect(meta.categoryNotes.domestic_work).toEqual(['working_day_hours']);
    expect(Object.keys(meta.checks)).toEqual(CHECK_IDS);
    expect(meta.pricePaymentKinds).not.toContain('materials');
  });
});

describe('termsTotal: amount x quantity, a whole job is always 1', () => {
  test.each([
    [{ amount: 2500, unit: 'job', quantity: 4 }, 2500],
    [{ amount: 1600, unit: 'day', quantity: 3 }, 4800],
    [{ amount: 200, unit: 'hour', quantity: 6 }, 1200],
    [{ amount: 200, unit: 'hour' }, 200],
    [{ unit: 'day', quantity: 3 }, null],
  ])('%j -> %s', (t, total) => expect(termsTotal(t)).toBe(total));
});

describe('below_minimum_* (warnings, only with a reference for the region)', () => {
  test('ICT, day: 1564 -> below_minimum_day with the region and the reference; 1565 -> nothing', () => {
    const c = run(full({ unit: 'day', amount: 1564, duration: null }));
    expect(ids(c)).toEqual(['below_minimum_day']);
    expect(c[0]).toEqual({ id: 'below_minimum_day', severity: 'warning', audience: 'both', params: { region: 'ICT', reference: 1565, amount: 1564 } });
    expect(run(full({ unit: 'day', amount: 1565, duration: null }))).toEqual([]);
  });
  test('ICT, hour: 195 -> below_minimum_hour; 196 -> nothing', () => {
    expect(ids(run(full({ unit: 'hour', amount: 195, duration: null })))).toEqual(['below_minimum_hour']);
    expect(run(full({ unit: 'hour', amount: 196, duration: null }))).toEqual([]);
  });
  test('PB, job: one_day total 1200 -> below; two_three_days total 2500 -> below (2 x 1538 = 3076); few_hours 500 -> no check', () => {
    const pb = (t) => termsChecks({ terms: full(t), category: 'electrical_solar', wageRef: PB });
    const one = pb({ amount: 1200, duration: 'one_day' });
    expect(ids(one)).toEqual(['below_minimum_job']);
    expect(one[0].params).toEqual({ region: 'PB', reference: 1538, days: 1, total: 1200 });
    const two = pb({ amount: 2500, duration: 'two_three_days' });
    expect(ids(two)).toEqual(['below_minimum_job']);
    expect(two[0].params).toEqual({ region: 'PB', reference: 3076, days: 2, total: 2500 });
    expect(pb({ amount: 3076, duration: 'two_three_days' })).toEqual([]);
    expect(pb({ amount: 1538, duration: 'one_day' })).toEqual([]);
    expect(pb({ amount: 500, duration: 'few_hours' })).toEqual([]);
    expect(pb({ amount: 500, duration: 'longer' })).toEqual([]);
    expect(pb({ amount: 500, duration: null })).toEqual([]);
  });
  test('an unknown city (no reference) -> no minimum-wage check at all', () => {
    expect(run(full({ unit: 'day', amount: 500, duration: null }), { wageRef: null })).toEqual([]);
    expect(run(full({ unit: 'hour', amount: 10, duration: null }), { wageRef: null })).toEqual([]);
  });
  test('a whole job ignores a quantity that was sent (always 1): 1500 for one day is still below 1565', () => {
    expect(ids(run(full({ amount: 1500, quantity: 5, duration: 'one_day' })))).toEqual(['below_minimum_job']);
  });
});

describe('large_advance and worker_buys_no_advance', () => {
  test('advance above half of the total -> large_advance (to the customer); exactly half -> nothing', () => {
    const c = run(full({ amount: 2500, advance: 1300 }));
    expect(c).toEqual([{ id: 'large_advance', severity: 'warning', audience: 'customer', params: { advance: 1300, total: 2500 } }]);
    expect(run(full({ amount: 2500, advance: 1250 }))).toEqual([]);
    // per day: the total is amount x quantity (3 x 1600 = 4800; half 2400)
    expect(ids(run(full({ unit: 'day', amount: 1600, quantity: 3, duration: null, advance: 2401 })))).toEqual(['large_advance']);
  });
  test('the worker buys materials and there is no advance -> info to the worker; with an advance -> nothing', () => {
    const c = run(full({ materials: 'worker_buys_customer_pays', advance: 0 }));
    expect(c).toEqual([{ id: 'worker_buys_no_advance', severity: 'info', audience: 'worker', params: {} }]);
    expect(run(full({ materials: 'worker_buys_customer_pays', advance: 500 }))).toEqual([]);
    // "not answered yet" (null) is not "no advance": only the missing-condition note
    expect(ids(run(full({ materials: 'worker_buys_customer_pays', advance: null })))).toEqual(['missing_condition']);
  });
});

describe('missing_condition (one info per missing condition of the category)', () => {
  test('electrical: nothing answered but the price -> materials, advance, visit charge, timing and method', () => {
    const c = run({ amount: 2500, unit: 'job', quantity: 1 });
    expect(c.map((x) => x.params.condition)).toEqual(['paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge']);
    expect(c.every((x) => x.id === 'missing_condition' && x.severity === 'info')).toBe(true);
  });
  test('a draft with no amount -> "price" is missing too; domestic work does not ask advance or visit charge', () => {
    expect(run({}).map((x) => x.params.condition)).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge']);
    expect(termsChecks({ terms: { amount: 1600, unit: 'day', quantity: 1 }, category: 'domestic_work', wageRef: ICT }).map((x) => x.params.condition))
      .toEqual(['paymentTiming', 'paymentMethod', 'materials']);
  });
  test('advance 0 ("No advance" on purpose) counts as answered', () => {
    expect(run(full({ advance: 0 }))).toEqual([]);
  });
});

describe('below_platform_range (only with a platform range in the same unit)', () => {
  const range = { level: 'city', scope: 'skill', unit: 'job', low: 2000, median: 2500, high: 3000, jobs: 8, workers: 4 };
  test('below the 25th percentile -> info with the low end; at the low end -> nothing', () => {
    expect(run(full({ amount: 1900 }), { range })).toEqual([{ id: 'below_platform_range', severity: 'info', audience: 'both', params: { low: 2000, unit: 'job' } }]);
    expect(run(full({ amount: 2000 }), { range })).toEqual([]);
  });
  test('no range, or a range in another unit -> no check', () => {
    expect(run(full({ amount: 100 }))).toEqual([]);
    expect(run(full({ unit: 'day', amount: 1600, duration: null }), { range })).toEqual([]);
  });
  test('the checks come in a fixed order', () => {
    const c = run({ amount: 1000, unit: 'day', quantity: 1, advance: 900, materials: 'worker_buys_customer_pays' }, { range: { ...range, unit: 'day', low: 1500 } });
    expect(ids(c)).toEqual(['below_minimum_day', 'large_advance', 'missing_condition', 'missing_condition', 'missing_condition', 'below_platform_range']);
  });
});
