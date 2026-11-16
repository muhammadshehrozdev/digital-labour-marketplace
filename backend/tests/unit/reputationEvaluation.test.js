// Module 4 evaluation harness (evaluation/reputation): metric functions on small hand-worked lists,
// the baselines, and the simulator's determinism. These tests check the TOOLS, not the results.
import { describe, test, expect } from 'vitest';
import { kendallTauB, ndcgAtK, precisionAtK, topShare, rankOrder, ranksFromOrder, percentileRanks, summarize, pairedComparison, percentile } from '../../evaluation/reputation/metrics.js';
import { plainAverage, bayesianAverage, wilsonLower, METHODS, scoreAll } from '../../evaluation/reputation/methods.js';
import { simulateWorld, withoutAttacks, starsFrom } from '../../evaluation/reputation/simulate.js';
import { SCENARIOS, scenarioNames, SIM_NOW } from '../../evaluation/reputation/config.js';
import { evaluateSeed, evaluateScenario } from '../../evaluation/reputation/evaluate.js';
import { computeReputation } from '../../services/reputation/reputationEngine.js';

const r4 = (x) => Number(x.toFixed(4));

describe('metrics (hand-worked)', () => {
  test('Kendall tau-b: same order 1, reversed -1, one swap of four 0.6667, ties handled (0.8165), no variation null', () => {
    expect(kendallTauB([1, 2, 3], [1, 2, 3])).toBe(1);
    expect(kendallTauB([1, 2, 3], [3, 2, 1])).toBe(-1);
    expect(r4(kendallTauB([1, 2, 3, 4], [1, 3, 2, 4]))).toBe(0.6667);
    // pairs: (0,1) tie in x; (0,2) and (1,2) concordant -> 2 / sqrt((3 - 1) * (3 - 0))
    expect(r4(kendallTauB([1, 1, 2], [1, 2, 3]))).toBe(0.8165);
    expect(kendallTauB([1, 1, 1], [1, 2, 3])).toBeNull();
    expect(() => kendallTauB([1], [1, 2])).toThrow();
  });

  test('NDCG@k: ideal order 1; reversed three items 0.7900; k cuts the list', () => {
    expect(ndcgAtK([0, 1, 2], [3, 2, 1], 3)).toBe(1);
    // DCG = 1/log2(2) + 2/log2(3) + 3/log2(4) = 3.7619; ideal = 3 + 2/log2(3) + 1/2 = 4.7619
    expect(r4(ndcgAtK([2, 1, 0], [3, 2, 1], 3))).toBe(0.79);
    expect(r4(ndcgAtK([1, 0, 2], [3, 2, 1], 1))).toBe(r4(2 / 3));
    expect(ndcgAtK([0, 1], [0, 0], 2)).toBeNull();
  });

  test('Precision@k against the true top 20%', () => {
    const gains = [0.9, 0.1, 0.8, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.05];
    const top = topShare(gains, 0.2);
    expect([...top].sort()).toEqual([0, 2]);
    expect(precisionAtK([0, 2, 1], top, 2)).toBe(1);
    expect(precisionAtK([0, 1, 2], top, 2)).toBe(0.5);
    expect(precisionAtK([], top, 10)).toBeNull();
  });

  test('ranking order breaks ties with the seeded key; ranks and percentile ranks', () => {
    const order = rankOrder([0.5, 0.9, 0.5], [0.7, 0.1, 0.2]);
    expect(order).toEqual([1, 2, 0]);
    expect(ranksFromOrder(order)).toEqual([3, 1, 2]);
    expect(percentileRanks(order)).toEqual([0, 100, 50]);
    expect(percentileRanks([0])).toEqual([100]);
  });

  test('summaries and the paired comparison', () => {
    const s = summarize([1, 2, 3, 4, null]);
    expect(s).toMatchObject({ n: 4, mean: 2.5 });
    expect(r4(s.sd)).toBe(1.291);
    expect(percentile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(percentile([1, 2, 3, 4, 5], 0.025)).toBeCloseTo(1.1, 10);
    expect(summarize([])).toMatchObject({ n: 0, mean: null, sd: null });
    expect(pairedComparison([0.5, 0.6, 0.7], [0.4, 0.6, 0.8])).toEqual({ seeds: 3, meanDifference: expect.any(Number), shareOursBetter: 1 / 3, shareEqual: 1 / 3 });
    expect(pairedComparison([1, 2], [3, 4], { higherIsBetter: false }).shareOursBetter).toBe(1);
    expect(pairedComparison([null], [1]).seeds).toBe(0);
  });
});

describe('baselines', () => {
  const R = (stars) => ({ stars });
  test('B1 plain average (no reviews last), B2 Bayesian average, B3 Wilson lower bound', () => {
    expect(plainAverage([R(5), R(4)])).toBe(4.5);
    expect(plainAverage([])).toBe(-1);
    expect(bayesianAverage([R(5)], { m: 5, C: 4 })).toBeCloseTo(25 / 6, 10);
    expect(bayesianAverage([], { m: 5, C: 4 })).toBe(4);
    expect(wilsonLower(0, 0)).toBe(0);
    // 9 of 10 positive, z = 1.96: lower bound about 0.5958 (Wilson 1927)
    expect(r4(wilsonLower(9, 10))).toBe(0.5958);
    expect(wilsonLower(10, 10)).toBeLessThan(1);
  });

  test('"ours" is the production engine itself (cautious), B4 the plain Beta with all weights 1', () => {
    const reviews = [{ id: 'a', customerId: 'x', stars: 5, createdAt: new Date(SIM_NOW.getTime() - 400 * 864e5), completionMethod: 'auto', reviewerOtherWorkers: 0 }];
    expect(METHODS.ours.score(reviews)).toBe(computeReputation(reviews, { now: SIM_NOW }).cautious);
    expect(METHODS.B4.score(reviews)).toBeCloseTo(2 / 3, 10);
    const scores = scoreAll([{ reviews }, { reviews: [] }], ['B1', 'B2']);
    expect(scores.B1).toEqual([5, -1]);
    expect(scores.B2[1]).toBe(5); // C = mean of all reviews in the run
  });
});

describe('simulator', () => {
  test('stars formula: clamp(round(1 + 4 * clip(q + L + noise, 0, 1)), 1, 5)', () => {
    expect(starsFrom(0.67, 0, 0)).toBe(4);
    expect(starsFrom(1.4, 0, 0)).toBe(5);
    expect(starsFrom(-0.3, 0, 0)).toBe(1);
    expect(starsFrom(0.5, 0.15, 0)).toBe(4);
  });

  test('the same seed gives the same world; another seed another world', () => {
    const a = simulateWorld({ seed: 11, scenario: SCENARIOS.combined, workers: 60 });
    const b = simulateWorld({ seed: 11, scenario: SCENARIOS.combined, workers: 60 });
    const c = simulateWorld({ seed: 12, scenario: SCENARIOS.combined, workers: 60 });
    expect(JSON.stringify(a.workers)).toBe(JSON.stringify(b.workers));
    expect(JSON.stringify(a.workers)).not.toBe(JSON.stringify(c.workers));
  });

  test('an attack leaves the genuine reviews of the same seed unchanged; attacked workers come from the lower half', () => {
    const base = simulateWorld({ seed: 5, scenario: SCENARIOS.base, workers: 100 });
    const attacked = simulateWorld({ seed: 5, scenario: SCENARIOS.sybil_k5, workers: 100 });
    expect(JSON.stringify(withoutAttacks(attacked.workers).map((w) => w.reviews))).toBe(JSON.stringify(base.workers.map((w) => w.reviews)));
    const targets = attacked.workers.filter((w) => w.attacked);
    expect(targets).toHaveLength(10);
    const median = [...attacked.workers.map((w) => w.quality)].sort((x, y) => x - y)[50];
    for (const w of targets) {
      expect(w.quality).toBeLessThan(median);
      const fakes = w.reviews.filter((r) => r.kind === 'sybil');
      expect(fakes).toHaveLength(5);
      expect(new Set(fakes.map((f) => f.customerId)).size).toBe(5);
      expect(fakes.every((f) => f.stars === 5 && f.reviewerOtherWorkers === 0 && f.completionMethod === 'both')).toBe(true);
    }
  });

  test('about 30% of workers have no reviews; counts at most 60; collusion uses one repeat customer; quality change lowers q', () => {
    const { workers } = simulateWorld({ seed: 3, scenario: SCENARIOS.combined, workers: 300 });
    const none = workers.filter((w) => !w.hadGenuineReviews).length / 300;
    expect(none).toBeGreaterThan(0.2);
    expect(none).toBeLessThan(0.4);
    expect(Math.max(...workers.map((w) => w.reviews.filter((r) => r.kind === 'genuine').length))).toBeLessThanOrEqual(60);
    const friends = workers.filter((w) => w.reviews.some((r) => r.kind === 'collusion'));
    expect(friends).toHaveLength(15);
    for (const w of friends) expect(new Set(w.reviews.filter((r) => r.kind === 'collusion').map((r) => r.customerId)).size).toBe(1);
    const changed = workers.filter((w) => w.changed);
    expect(changed).toHaveLength(60);
    for (const w of changed) expect(w.quality).toBeCloseTo(Math.max(0, w.oldQuality - 0.3), 10);
  });

  test('smart Sybil accounts have hired 1 to 3 other workers', () => {
    const { workers } = simulateWorld({ seed: 9, scenario: SCENARIOS.smart_sybil_k3, workers: 100 });
    const fakes = workers.flatMap((w) => w.reviews.filter((r) => r.kind === 'sybil'));
    expect(fakes.length).toBe(30);
    expect(fakes.every((f) => f.reviewerOtherWorkers >= 1 && f.reviewerOtherWorkers <= 3)).toBe(true);
  });
});

describe('runner', () => {
  test('scenario names and groups', () => {
    expect(scenarioNames('sybil')).toEqual(['sybil_k3', 'sybil_k5', 'sybil_k10']);
    expect(scenarioNames('all')).toHaveLength(Object.keys(SCENARIOS).length);
    expect(() => scenarioNames('nope')).toThrow(/Unknown scenario/);
  });

  test('one seed: every method has every metric; the attack lift exists only when there is an attack', () => {
    const base = evaluateSeed({ seed: 1, scenario: SCENARIOS.base, workers: 60 });
    expect(Object.keys(base.result)).toEqual(Object.keys(METHODS));
    expect(base.result.ours.attackLift).toBeNull();
    expect(base.result.ours.all.tau).toEqual(expect.any(Number));
    const attacked = evaluateSeed({ seed: 1, scenario: SCENARIOS.sybil_k10, workers: 60 });
    expect(attacked.counts.attacked).toBe(6);
    expect(attacked.result.B1.attackLift).toEqual(expect.any(Number));
  });

  test('a scenario report is labelled SIMULATION, with seeds and the parameter hash', () => {
    const report = evaluateScenario('pair_collusion', { seeds: 2, workers: 40 });
    expect(report.label).toBe('SIMULATION');
    expect(report.warning).toMatch(/not real-world/i);
    expect(report.seeds).toMatchObject({ count: 2 });
    expect(report.parametersHash).toMatch(/^[a-f0-9]{12}$/);
    expect(report.paired.map((p) => p.other)).not.toContain('ours');
    expect(report.methods.ours.metrics['all.tau'].n).toBe(2);
  });
});
