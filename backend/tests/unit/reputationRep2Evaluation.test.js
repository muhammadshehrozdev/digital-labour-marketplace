// Batch 6B: the rep-2 evaluation code (new scenarios, the selection rule, the test-run guard, the success
// criteria). These tests use small seeds of their own; they NEVER run the test seeds 20270101..20270130.
// The report objects in the criteria tests are made-up fixtures for the arithmetic, not results.
import { describe, test, expect } from 'vitest';
import { simulateWorld } from '../../evaluation/reputation/simulate.js';
import { SCENARIOS, SCENARIO_GROUPS, SIM_NOW, DAY_MS, DEV_SEED_BASE, TEST_SEED_BASE, PROTOCOL_SEEDS, SELECTION_ATTACKS, SEED_BASE } from '../../evaluation/reputation/config.js';
import { rep2CandidateMethods, rep2TestMethods, scoreAll } from '../../evaluation/reputation/methods.js';
import { evaluateScenario, rep2TestRefusal } from '../../evaluation/reputation/evaluate.js';
import { applySelectionRule } from '../../evaluation/reputation/selectRep2.js';
import { checkCriteria } from '../../evaluation/reputation/rep2Criteria.js';
import { REP2_SELECTED, rep2Params } from '../../config/reputationParams.js';
import { computeReputation, platformBaseRate } from '../../services/reputation/reputationEngine.js';

const ageDays = (rv) => (SIM_NOW.getTime() - new Date(rv.createdAt).getTime()) / DAY_MS;

describe('protocol constants (written before any run)', () => {
  test('development seeds 20261116..20261145, test seeds 20270101..20270130, 30 each; the five attacks of the rule', () => {
    expect([DEV_SEED_BASE, TEST_SEED_BASE, PROTOCOL_SEEDS]).toEqual([20261116, 20270101, 30]);
    expect(DEV_SEED_BASE).toBe(SEED_BASE); // the development seeds are the Batch 6 seeds
    expect(SELECTION_ATTACKS).toEqual(['sybil_k3', 'sybil_k5', 'sybil_k10', 'pair_collusion', 'combined']);
    expect(SCENARIO_GROUPS.noise).toEqual(['base_noise30', 'base_noise50', 'sybil_k5_noise30', 'sybil_k5_noise50']);
    for (const name of ['slow_sybil', 'busy_genuine', 'new_platform', 'base', 'combined', 'smart_sybil_k10', 'quality_change', 'inflation']) expect(SCENARIOS[name]).toBeDefined();
  });
});

describe('the Batch 6B scenarios', () => {
  test('slow_sybil: the same attacked workers as sybil_k5, five fakes 73 days apart over the last year (never 3 in 14 days)', () => {
    const slow = simulateWorld({ seed: 7, scenario: SCENARIOS.slow_sybil, workers: 120 });
    const fast = simulateWorld({ seed: 7, scenario: SCENARIOS.sybil_k5, workers: 120 });
    expect(slow.workers.filter((w) => w.attacked).map((w) => w.id)).toEqual(fast.workers.filter((w) => w.attacked).map((w) => w.id));
    for (const w of slow.workers.filter((x) => x.attacked)) {
      const fakes = w.reviews.filter((r) => r.kind === 'sybil').map(ageDays).sort((a, b) => a - b);
      expect(fakes.map((d) => Math.round(d * 10) / 10)).toEqual([36.5, 109.5, 182.5, 255.5, 328.5]);
      expect(w.reviews.filter((r) => r.kind === 'sybil').every((r) => r.reviewerOtherWorkers === 0 && r.stars === 5)).toBe(true);
    }
  });

  test('busy_genuine: 10% of workers get 8 extra GENUINE reviews from the last 14 days; nobody is attacked', () => {
    const base = simulateWorld({ seed: 8, scenario: SCENARIOS.base, workers: 200 });
    const busy = simulateWorld({ seed: 8, scenario: SCENARIOS.busy_genuine, workers: 200 });
    const busyOnes = busy.workers.filter((w) => w.busy);
    expect(busyOnes).toHaveLength(20);
    expect(busy.workers.some((w) => w.attacked)).toBe(false);
    for (const w of busyOnes) {
      const before = base.workers.find((x) => x.id === w.id).reviews;
      const extra = w.reviews.slice(before.length);
      expect(w.reviews.slice(0, before.length)).toEqual(before); // the base reviews are untouched
      expect(extra).toHaveLength(8);
      expect(extra.every((r) => r.kind === 'genuine' && ageDays(r) >= 0 && ageDays(r) < 14)).toBe(true);
    }
  });

  test('new_platform: about 80% of genuine reviewers have no other hiring history; stars and dates as in base', () => {
    const base = simulateWorld({ seed: 9, scenario: SCENARIOS.base, workers: 300 });
    const young = simulateWorld({ seed: 9, scenario: SCENARIOS.new_platform, workers: 300 });
    const reviews = young.workers.flatMap((w) => w.reviews);
    const share = reviews.filter((r) => r.reviewerOtherWorkers === 0).length / reviews.length;
    expect(share).toBeGreaterThan(0.75);
    expect(share).toBeLessThan(0.85);
    const strip = (ws) => ws.flatMap((w) => w.reviews.map(({ reviewerOtherWorkers, ...rest }) => rest));
    expect(strip(young.workers)).toEqual(strip(base.workers));
  });

  test('noise variants: same workers, same dates, only the star noise is larger', () => {
    const base = simulateWorld({ seed: 10, scenario: SCENARIOS.base, workers: 150 });
    const noisy = simulateWorld({ seed: 10, scenario: SCENARIOS.base_noise50, workers: 150 });
    expect(noisy.workers.map((w) => [w.quality, w.reviews.length])).toEqual(base.workers.map((w) => [w.quality, w.reviews.length]));
    expect(noisy.workers.flatMap((w) => w.reviews.map((r) => r.createdAt.getTime()))).toEqual(base.workers.flatMap((w) => w.reviews.map((r) => r.createdAt.getTime())));
    const differs = noisy.workers.flatMap((w, i) => w.reviews.map((r, j) => r.stars !== base.workers[i].reviews[j].stars)).filter(Boolean).length;
    expect(differs).toBeGreaterThan(0);
  });
});

describe('rep-2 methods in the simulator', () => {
  test('the platform base rate comes from ALL reviews of the run, fakes included', () => {
    const { workers } = simulateWorld({ seed: 11, scenario: SCENARIOS.sybil_k10, workers: 80 });
    const all = workers.flatMap((w) => w.reviews);
    const mean = all.reduce((s, r) => s + (r.stars - 1) / 4, 0) / all.length;
    const methods = rep2CandidateMethods();
    const scores = scoreAll(workers, ['rep2_B2-burst-off'], methods)['rep2_B2-burst-off'];
    const params = rep2Params({ newReviewerBudget: 2, burst: false });
    const expected = workers.map((w) => computeReputation(w.reviews, { now: SIM_NOW, params, baseRate: platformBaseRate({ count: all.length, meanEvidence: mean }, params) }).expected);
    expect(scores).toEqual(expected);
    // a worker without reviews scores exactly the base rate a
    const empty = workers.findIndex((w) => w.reviews.length === 0);
    expect(scores[empty]).toBeCloseTo(Math.min(0.9, Math.max(0.2, mean)), 12);
  });

  test('six candidates plus B1 and B4; the test methods need a frozen rep-2', () => {
    expect(Object.keys(rep2CandidateMethods())).toEqual(['B1', 'B4', 'rep2_B1-burst-off', 'rep2_B1-burst-on', 'rep2_B2-burst-off', 'rep2_B2-burst-on', 'rep2_B3-burst-off', 'rep2_B3-burst-on']);
    if (REP2_SELECTED) expect(Object.keys(rep2TestMethods())).toEqual(['B1', 'B2', 'B3', 'B4', 'rep1_cautious', 'rep1_expected', 'rep2_expected', 'rep2_cautious']);
    else expect(() => rep2TestMethods()).toThrow(/not frozen/);
    const frozen = rep2TestMethods(rep2Params({ newReviewerBudget: 1, burst: true }));
    expect(frozen.rep2_expected.label).toMatch(/rep-2, expected/);
  });

  test('a report keeps the per-seed numbers and the paired comparison of the chosen method (small run, own seeds)', () => {
    const methods = rep2TestMethods(rep2Params({ newReviewerBudget: 2, burst: false }));
    const report = evaluateScenario('sybil_k5', { seeds: 2, workers: 40, seedBase: 101, methods, ours: 'rep2_expected', perSeed: true, params: rep2Params({ newReviewerBudget: 2, burst: false }) });
    expect(report).toMatchObject({ label: 'SIMULATION', ours: 'rep2_expected', engineVersion: 'rep-2', seeds: { first: 101, last: 102 } });
    expect(report.methods.rep2_expected.perSeed['all.ndcg10']).toHaveLength(2);
    expect(report.paired.map((p) => p.other)).toEqual(['B1', 'B2', 'B3', 'B4', 'rep1_cautious', 'rep1_expected', 'rep2_cautious']);
  });
});

describe('the selection rule (fixed before any run)', () => {
  const row = (id, base, attackMean) => ({ id, base, attackMean });
  test('only candidates within 0.01 of B4 in the base world; then the best attack mean', () => {
    const rows = [row('B1-burst-off', 0.920, 0.80), row('B1-burst-on', 0.935, 0.81), row('B2-burst-off', 0.931, 0.85), row('B2-burst-on', 0.900, 0.95), row('B3-burst-off', 0.930, 0.84), row('B3-burst-on', 0.94, 0.79)];
    const { chosen, eligible } = applySelectionRule(rows, 0.938);
    expect(eligible).toEqual(['B1-burst-on', 'B2-burst-off', 'B3-burst-off', 'B3-burst-on']); // 0.928 is the line
    expect(chosen.id).toBe('B2-burst-off'); // B2-burst-on has the best attacks but fails the base world
  });
  test('ties go to the smaller B, then to burst off; no candidate -> null (stop and ask)', () => {
    const tied = [row('B1-burst-off', 0.93, 0.8), row('B1-burst-on', 0.93, 0.9), row('B2-burst-off', 0.93, 0.9), row('B2-burst-on', 0.93, 0.9)];
    expect(applySelectionRule(tied, 0.93).chosen.id).toBe('B1-burst-on');
    expect(applySelectionRule([row('B2-burst-off', 0.5, 0.9)], 0.93)).toEqual({ chosen: null, eligible: [] });
  });
});

describe('the test run is guarded', () => {
  const ok = { selected: { newReviewerBudget: 2, burst: false }, commit: 'abc1234', existing: [], seeds: 30, workers: 300 };
  test('refuses before the freeze, with uncommitted changes, with other seeds or workers, or a second time', () => {
    expect(rep2TestRefusal(ok)).toBeNull();
    expect(rep2TestRefusal({ ...ok, selected: null })).toMatch(/not frozen/);
    expect(rep2TestRefusal({ ...ok, commit: 'abc1234+uncommitted-changes' })).toMatch(/commit/);
    expect(rep2TestRefusal({ ...ok, seeds: 10 })).toMatch(/30 seeds/);
    expect(rep2TestRefusal({ ...ok, existing: ['SIMULATION-rep2-test-2026-11-17-base.json'] })).toMatch(/ONCE/);
    expect(rep2TestRefusal({ ...ok, existing: ['x'], rerun: 'bug fix in the burst check, commit 1234567' })).toBeNull();
  });
});

describe('the success criteria (arithmetic on made-up fixture reports)', () => {
  const metric = (mean) => ({ mean, sd: 0, n: 30 });
  const pair = (share, diff = 0.01) => ({ shareOursBetter: share, meanDifference: diff, seeds: 30, shareEqual: 0 });
  const fixture = ({ rep2 = 0.93, B4 = 0.935, B1 = 0.9, liftB1 = 0.9, liftB4 = 0.9, ndcgB1 = 0.9, ndcgB4 = 0.9, rep1 = 0.9 } = {}) => ({
    methods: { rep2_expected: { metrics: { 'all.ndcg10': metric(rep2) } }, B4: { metrics: { 'all.ndcg10': metric(B4) } }, B1: { metrics: { 'all.ndcg10': metric(B1) } } },
    paired: [
      { ours: 'rep2_expected', other: 'B1', metrics: { attackLift: pair(liftB1), 'all.ndcg10': pair(ndcgB1) } },
      { ours: 'rep2_expected', other: 'B4', metrics: { attackLift: pair(liftB4), 'all.ndcg10': pair(ndcgB4) } },
      { ours: 'rep2_expected', other: 'rep1_cautious', metrics: { 'all.ndcg10': pair(rep1) } },
    ],
  });
  const all = (over = {}, perScenario = {}) => Object.fromEntries(['base', ...SELECTION_ATTACKS].map((s) => [s, fixture({ ...over, ...(perScenario[s] ?? {}) })]));

  test('all met -> rep-2 goes live', () => {
    const c = checkCriteria(all());
    expect(c.verdict).toEqual({ S1: true, S2: true, S3: true });
    expect(c.liveEngine).toBe('rep-2');
  });
  test('S1 fails when rep-2 is more than 0.01 below B4 or below B1 in base -> rep-1 stays', () => {
    expect(checkCriteria(all({}, { base: { rep2: 0.92, B4: 0.935 } })).verdict.S1).toBe(false);
    expect(checkCriteria(all({}, { base: { rep2: 0.93, B4: 0.93, B1: 0.931 } })).liveEngine).toBe('rep-1');
  });
  test('S2 needs every check in every attack at 80% of seeds; it does not decide the engine', () => {
    const c = checkCriteria(all({}, { pair_collusion: { liftB4: 0.79 } }));
    expect(c.verdict).toEqual({ S1: true, S2: false, S3: true });
    expect(c.liveEngine).toBe('rep-2');
  });
  test('S3 needs base and every attack against rep-1 cautious', () => {
    expect(checkCriteria(all({}, { base: { rep1: 0.7 } })).verdict.S3).toBe(false);
    expect(() => checkCriteria({ base: fixture() })).toThrow(/missing/);
  });
});
