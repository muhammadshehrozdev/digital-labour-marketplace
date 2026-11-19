// Module 5 (Batch 7, §8): the price-range simulation. Metric functions on small hand-worked lists, the simulator
// gives the same output for the same seed, attacks never touch the genuine jobs, and "ours" is the production
// engine (imported). Everything here is a SIMULATION tool; no result is asserted as a real-world fact.
import { describe, test, expect } from 'vitest';
import { attackShift, availability, availabilityFlips, coverage, coverageOf, medianError } from '../../evaluation/price-range/metrics.js';
import { plainMean, plainMedian, ours } from '../../evaluation/price-range/methods.js';
import { simulateMarkets } from '../../evaluation/price-range/simulate.js';
import { SCENARIOS, SIMULATION, scenarioNames } from '../../evaluation/price-range/config.js';
import { evaluateScenario, evaluateSeed, parametersHash } from '../../evaluation/price-range/evaluate.js';

const r = (value, low = value, high = value) => ({ value, low, high });

describe('metrics (hand-worked)', () => {
  test('availability: 2 of 4 markets have a number -> 0.5; none -> null', () => {
    expect(availability([r(1), null, r(2), null])).toBe(0.5);
    expect(availability([])).toBeNull();
  });
  test('medianError: |1100-1000|/1000 = 0.1, |1800-2000|/2000 = 0.1, |3600-3000|/3000 = 0.2 -> median 0.1', () => {
    expect(medianError([r(1100), r(1800), null, r(3600)], [1000, 2000, 5000, 3000])).toBeCloseTo(0.1, 12);
    // two errors 0.1 and 0.3: the median (definition 7) is 0.2
    expect(medianError([r(1100), r(1300)], [1000, 1000])).toBeCloseTo(0.2, 12);
    expect(medianError([null], [1000])).toBeNull();
  });
  test('coverage: [900, 1100] holds 900, 1000, 1100 of 900, 1000, 1100, 1200 -> 0.75 (ends included); mean over markets', () => {
    expect(coverageOf([900, 1000, 1100, 1200], 900, 1100)).toBe(0.75);
    expect(coverageOf([], 0, 1)).toBeNull();
    expect(coverage([r(1000, 900, 1100), null, r(1000, 0, 10)], [[900, 1000, 1100, 1200], [1], [500, 600]])).toBeCloseTo((0.75 + 0) / 2, 12);
  });
  test('attackShift: |1500-1000|/1000 = 0.5 and |2100-2000|/2000 = 0.05 -> mean 0.275; a market with no number either way is left out', () => {
    expect(attackShift([r(1500), r(2100), r(9)], [r(1000), r(2000), null], [1000, 2000, 3000])).toBeCloseTo(0.275, 12);
    expect(attackShift([null], [r(1)], [1])).toBeNull();
  });
  test('availabilityFlips counts numbers the attack made appear or disappear', () => {
    expect(availabilityFlips([r(1), null, r(2), r(3)], [null, r(1), r(2), null])).toEqual({ appeared: 2, vanished: 1 });
  });
});

describe('the methods', () => {
  const NOW = new Date('2026-11-19T00:00:00Z');
  const job = (price, { w, c, agreed = true, method = 'both' }) => ({
    bookingId: `b-${w}-${c}-${price}`, workerId: w, customerId: c, skillId: 'sim_skill', category: 'sim', region: null, city: 'market-0', status: 'completed',
    completedAt: new Date(NOW.getTime() - 86400000), completionMethod: method, agreed: agreed ? { unit: 'job', amount: price } : null, price,
  });
  test('M1 mean +/- sd and M2 median with its middle half read every completed price (also auto and proposed-only)', () => {
    const jobs = [job(1000, { w: 'a', c: '1' }), job(2000, { w: 'b', c: '2', agreed: false }), job(3000, { w: 'c', c: '3', method: 'auto' })];
    const m1 = plainMean(jobs); // mean 2000, sd = sqrt(((1000)^2 + 0 + (1000)^2) / 2) = 1000
    expect(m1.value).toBe(2000);
    expect(m1.low).toBeCloseTo(1000, 9);
    expect(m1.high).toBeCloseTo(3000, 9);
    expect(plainMedian(jobs)).toEqual({ value: 2000, low: 1500, high: 2500 });
    expect(plainMean([])).toBeNull();
    expect(plainMedian([])).toBeNull();
  });
  test('ours = the production priceRange: those 3 jobs are below the minimums -> null; 5 good jobs -> the range', () => {
    expect(ours([job(1000, { w: 'a', c: '1' })], 'market-0', { now: NOW })).toBeNull();
    const five = [1000, 1500, 2000, 2500, 3000].map((p, i) => job(p, { w: `w${i}`, c: `c${i}` }));
    expect(ours(five, 'market-0', { now: NOW })).toEqual({ value: 2000, low: 1500, high: 2500 });
  });
});

describe('the simulator', () => {
  test('the same seed gives the same markets and the same evaluation; another seed differs', () => {
    expect(simulateMarkets({ seed: 42, scenario: SCENARIOS.inflator })).toEqual(simulateMarkets({ seed: 42, scenario: SCENARIOS.inflator }));
    expect(evaluateSeed({ seed: 42, scenario: SCENARIOS.base })).toEqual(evaluateSeed({ seed: 42, scenario: SCENARIOS.base }));
    expect(simulateMarkets({ seed: 43, scenario: SCENARIOS.base })).not.toEqual(simulateMarkets({ seed: 42, scenario: SCENARIOS.base }));
  });
  test('an attack scenario has exactly the genuine jobs of the base scenario (same seed) plus separate attack jobs', () => {
    const base = simulateMarkets({ seed: 7, scenario: SCENARIOS.base });
    for (const name of ['inflator', 'pair_flood']) {
      const attacked = simulateMarkets({ seed: 7, scenario: SCENARIOS[name] });
      expect(attacked.map((mk) => mk.jobs)).toEqual(base.map((mk) => mk.jobs));
      const hit = attacked.filter((mk) => mk.attacked);
      expect(hit.length).toBeGreaterThan(0);
      for (const mk of hit) {
        expect(mk.attackJobs).toHaveLength(SCENARIOS[name].attack.jobs);
        expect(mk.attackJobs.every((j) => j.agreed.amount === Math.round(SCENARIOS[name].attack.factor * mk.m) && j.completionMethod === 'both')).toBe(true);
        expect(new Set(mk.attackJobs.map((j) => j.workerId)).size).toBe(1); // one worker
        expect(new Set(mk.attackJobs.map((j) => j.customerId)).size).toBe(name === 'inflator' ? 2 : 1);
      }
      expect(attacked.filter((mk) => !mk.attacked).every((mk) => mk.attackJobs.length === 0)).toBe(true);
    }
  });
  test('the world follows the stated settings: 40 markets, m in [1000, 6000], 20 held-out prices, ids never shared across markets', () => {
    const markets = simulateMarkets({ seed: 1, scenario: SCENARIOS.base });
    expect(markets).toHaveLength(SIMULATION.markets);
    for (const mk of markets) {
      expect(mk.m).toBeGreaterThanOrEqual(1000);
      expect(mk.m).toBeLessThanOrEqual(6000);
      expect(mk.holdout).toHaveLength(20);
      expect(mk.jobs.every((j) => j.workerId.startsWith(`m${mk.id}-`) && j.customerId.startsWith(`m${mk.id}-`))).toBe(true);
    }
  });
  test('scenario names, the parameter hash, and the report labels every number as SIMULATION', () => {
    expect(scenarioNames('all')).toEqual(['base', 'sparse', 'inflator', 'pair_flood']);
    expect(() => scenarioNames('nope')).toThrow(/Unknown scenario/);
    expect(parametersHash(SCENARIOS.base)).toMatch(/^[0-9a-f]{12}$/);
    expect(parametersHash(SCENARIOS.base)).not.toBe(parametersHash(SCENARIOS.sparse));
    const report = evaluateScenario('pair_flood', { seeds: 2 });
    expect(report.label).toBe('SIMULATION');
    expect(report.warning).toMatch(/SIMULATION/);
    expect(report.seeds).toEqual({ count: 2, first: 20261119, last: 20261120 });
    expect(Object.keys(report.methods)).toEqual(['M1', 'M2', 'ours']);
    expect(report.paired.map((p) => [p.other, Object.keys(p.metrics)])).toEqual([['M1', ['availability', 'error', 'attackShift']], ['M2', ['availability', 'error', 'attackShift']]]);
    expect(Object.keys(evaluateScenario('base', { seeds: 1 }).paired[0].metrics)).toEqual(['availability', 'error']);
  });
});
