// Module 4, rep-2 (Batch 6B): the hand-worked examples of BATCH_6B section 5.2 (explicit parameters,
// four decimal places) and the rep-2 property tests (seeded generator). rep-1 keeps its own tests in
// reputationEngine.test.js.
import { describe, test, expect } from 'vitest';
import { computeReputation, platformBaseRate, burstReviewIds } from '../../services/reputation/reputationEngine.js';
import { computeReliability } from '../../services/reputation/reliabilityEngine.js';
import { REP1_PARAMS, REP2_CANDIDATES, BURST_RULE, rep2Params, withParams, paramsHash, engineVersionOf, rankFieldOf } from '../../config/reputationParams.js';
import { createRng } from '../../evaluation/reputation/rng.js';

const NOW = new Date('2026-11-17T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const round4 = (x) => Number(x.toFixed(4));
const daysAgo = (d) => new Date(NOW.getTime() - d * DAY);
const times = (n, make) => Array.from({ length: n }, make);
const numbers = (res) => ({ r: round4(res.r), s: round4(res.s), uncertainty: round4(res.uncertainty), expected: round4(res.expected), cautious: round4(res.cautious) });

// B = 2, burst off: the parameters of the hand-worked table
const P2 = rep2Params({ newReviewerBudget: 2, burst: false });
const NO_BUDGET = withParams({ factors: { newReviewerBudget: false } }, P2);

let seq = 0;
// weight 1 unless changed: today, completed by both, from a customer who hired 3 other workers ("history")
const review = (stars, extra = {}) => {
  seq += 1;
  return { id: `q${String(seq).padStart(4, '0')}`, customerId: `k${seq}`, stars, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, hidden: false, ...extra };
};
const fresh = (stars, extra = {}) => review(stars, { reviewerOtherWorkers: 0, ...extra }); // a new reviewer

describe('rep-2 hand-worked examples (BATCH_6B section 5.2)', () => {
  const CASES = [
    ['No reviews (a = 0.8)', [], P2, 0.8, { r: 0, s: 0, uncertainty: 1, expected: 0.8, cautious: 0.504 }],
    ['One 5 star (a = 0.8)', [review(5)], P2, 0.8, { r: 1, s: 0, uncertainty: 0.6667, expected: 0.8667, cautious: 0.6488 }],
    ['One 1 star (a = 0.8)', [review(1)], P2, 0.8, { r: 0, s: 1, uncertainty: 0.6667, expected: 0.5333, cautious: 0.2136 }],
    ['Ten 5 star, reviewers with history (a = 0.8)', times(10, () => review(5)), P2, 0.8, { r: 10, s: 0, uncertainty: 0.1667, expected: 0.9667, cautious: 0.9029 }],
    ['28 x 5 star + 12 x 4 star, reviewers with history (a = 0.8)', [...times(28, () => review(5)), ...times(12, () => review(4))], P2, 0.8, { r: 37, s: 3, uncertainty: 0.0476, expected: 0.919, cautious: 0.8657 }],
    ['Three 5 star from the same customer, weights 1, 1/2, 1/3 (a = 0.8)', times(3, (_, i) => review(5, { customerId: 'same', id: `same${i}` })), P2, 0.8, { r: 1.8333, s: 0, uncertainty: 0.5217, expected: 0.8957, cautious: 0.7174 }],
    ['Ten 5 star from ten new reviewers, B = 2, so each weighs 0.2 (a = 0.8)', times(10, () => fresh(5)), P2, 0.8, { r: 2, s: 0, uncertainty: 0.5, expected: 0.9, cautious: 0.7281 }],
    ['Two 4 star (history) + five 5 star from new reviewers, B = 2, so 0.4 each (a = 0.8)', [...times(2, () => review(4)), ...times(5, () => fresh(5))], P2, 0.8, { r: 3.5, s: 0.5, uncertainty: 0.3333, expected: 0.85, cautious: 0.677 }],
    ['The same seven reviews with no budget (a = 0.8)', [...times(2, () => review(4)), ...times(5, () => fresh(5))], NO_BUDGET, 0.8, { r: 6.5, s: 0.5, uncertainty: 0.2222, expected: 0.9, cautious: 0.7784 }],
    ['Two 5 star from two new reviewers, B = 2: the budget does not bite (a = 0.8)', times(2, () => fresh(5)), P2, 0.8, { r: 2, s: 0, uncertainty: 0.5, expected: 0.9, cautious: 0.7281 }],
    ['Platform with fewer than 20 reviews: a = 0.5, one 5 star', [review(5)], P2, platformBaseRate({ count: 19, meanEvidence: 0.9 }, P2), { r: 1, s: 0, uncertainty: 0.6667, expected: 0.6667, cautious: 0.3646 }],
  ];
  test.each(CASES)('%s', (_name, reviews, params, baseRate, want) => {
    expect(numbers(computeReputation(reviews, { now: NOW, params, baseRate }))).toEqual(want);
  });

  test('the budget per review: ten new reviewers weigh 0.2 each and say why; reviewers with history count 1', () => {
    const res = computeReputation([...times(10, () => fresh(5)), review(4, { id: 'old-hand' })], { now: NOW, params: P2, baseRate: 0.8 });
    for (const p of res.perReview.filter((x) => x.id !== 'old-hand')) {
      expect(round4(p.weight)).toBe(0.2);
      expect(p.reasons).toEqual(['new_reviewer_budget']);
      expect(round4(p.factors.newReviewerBudget)).toBe(0.2);
    }
    const oldHand = res.perReview.find((p) => p.id === 'old-hand');
    expect(oldHand).toMatchObject({ weight: 1, reasons: ['counted_fully'] });
    // recency is off: a three-year-old review still counts fully, and no reason mentions age
    const old = computeReputation([review(5, { createdAt: daysAgo(1100) })], { now: NOW, params: P2, baseRate: 0.8 });
    expect(old.perReview[0]).toMatchObject({ weight: 1, reasons: ['counted_fully'] });
  });

  test('pair factor and provenance stay as in rep-1; the budget uses the weights after them', () => {
    // one new customer with three reviews (1 + 1/2 + 1/3 = 1.8333) and one auto-completed new reviewer (0.6): m = 2.4333 > 2
    const list = [...times(3, (_, i) => fresh(5, { customerId: 'friend', id: `f${i}`, createdAt: daysAgo(3 - i) })), fresh(5, { completionMethod: 'auto' })];
    const res = computeReputation(list, { now: NOW, params: P2, baseRate: 0.8 });
    expect(round4(res.r)).toBe(2);
    expect(round4(res.perReview.reduce((sum, p) => sum + p.weight, 0))).toBe(2);
    expect(res.perReview.find((p) => p.id === 'f1').reasons).toEqual(['new_reviewer_budget', 'repeat_reviewer']);
  });

  test('burst check (hand-worked): four 5 star reviews on four days in a row; only the last has 3 others in the 14 days before it', () => {
    const burstOn = rep2Params({ newReviewerBudget: 2, burst: true });
    const list = [0, 1, 2, 3].map((d) => review(5, { id: `b${d}`, createdAt: daysAgo(d) }));
    const res = computeReputation(list, { now: NOW, params: burstOn, baseRate: 0.8 });
    expect(res.perReview.find((p) => p.id === 'b0')).toMatchObject({ weight: 0.5, reasons: ['burst'] });
    expect(res.perReview.filter((p) => p.weight === 1)).toHaveLength(3);
    expect(round4(res.r)).toBe(3.5); // E = (3.5 + 1.6) / (3.5 + 2) = 0.9273
    expect(round4(res.expected)).toBe(0.9273);
    // the same reviews 20 days apart: no burst
    const spread = [0, 20, 40, 60].map((d) => review(5, { id: `s${d}`, createdAt: daysAgo(d) }));
    expect(computeReputation(spread, { now: NOW, params: burstOn, baseRate: 0.8 }).r).toBe(4);
    // the same moment counts as "before": three reviews at one moment plus one more -> all four are bursts
    expect(burstReviewIds(times(4, (_, i) => ({ id: `t${i}`, createdAt: NOW })), BURST_RULE).size).toBe(4);
    expect(burstReviewIds(times(3, (_, i) => ({ id: `t${i}`, createdAt: NOW })), BURST_RULE).size).toBe(0);
  });

  test('the platform base rate: the plain mean of p, clamped to [0.2, 0.9]; 0.5 below 20 reviews; rep-1 always 0.5', () => {
    expect(platformBaseRate({ count: 20, meanEvidence: 0.8 }, P2)).toBe(0.8);
    expect(platformBaseRate({ count: 500, meanEvidence: 0.95 }, P2)).toBe(0.9);
    expect(platformBaseRate({ count: 500, meanEvidence: 0.1 }, P2)).toBe(0.2);
    expect(platformBaseRate({ count: 19, meanEvidence: 0.8 }, P2)).toBe(0.5);
    expect(platformBaseRate({ count: 0, meanEvidence: null }, P2)).toBe(0.5);
    expect(platformBaseRate({ count: 500, meanEvidence: 0.8 }, REP1_PARAMS)).toBe(0.5);
    // rep-1 ignores a passed-in base rate (its numbers never change)
    expect(computeReputation([], { now: NOW, params: REP1_PARAMS, baseRate: 0.8 }).expected).toBe(0.5);
    expect(() => computeReputation([], { now: NOW, params: P2, baseRate: 'high' })).toThrow(/baseRate/);
  });

  test('ranking number, version, hash: rep-2 ranks by expected, rep-1 by cautious; reliability keeps rep-1 behaviour', () => {
    expect(rankFieldOf(P2)).toBe('expected');
    expect(rankFieldOf(REP1_PARAMS)).toBe('cautious');
    const res = computeReputation([review(5)], { now: NOW, params: P2, baseRate: 0.8 });
    expect(res.rank).toBe(res.expected);
    expect(res.baseRate).toBe(0.8);
    expect(computeReputation([review(5)], { now: NOW, params: REP1_PARAMS }).rank).toBe(computeReputation([review(5)], { now: NOW, params: REP1_PARAMS }).cautious);
    expect(engineVersionOf(P2)).toBe('rep-2');
    expect(engineVersionOf(REP1_PARAMS)).toBe('rep-1');
    expect(paramsHash(REP1_PARAMS)).toBe('23974876a27d'); // the Batch 6 hash: rep-1 did not change
    expect(new Set(REP2_CANDIDATES.map((c) => paramsHash(rep2Params(c)))).size).toBe(6);
    expect(REP2_CANDIDATES.map((c) => c.id)).toEqual(['B1-burst-off', 'B1-burst-on', 'B2-burst-off', 'B2-burst-on', 'B3-burst-off', 'B3-burst-on']);
    expect(() => rep2Params({ newReviewerBudget: 4, burst: false })).toThrow();
    // a one-year-old completed job still weighs 0.5 in reliability under rep-2, and 0.5 is the base rate there
    const oldJob = [{ outcome: 'completed', closedAt: daysAgo(365), customerId: 'c' }];
    expect(round4(computeReliability(oldJob, { now: NOW, params: P2 }).r)).toBe(0.5);
    expect(computeReliability(oldJob, { now: NOW, params: P2 }).r).toBe(computeReliability(oldJob, { now: NOW, params: REP1_PARAMS }).r);
    expect(computeReliability([], { now: NOW, params: P2 }).expected).toBe(0.5);
  });
});

describe('rep-2 property tests (seeded generator, 300 random cases per candidate)', () => {
  const rng = createRng(20261117);
  const randomReviews = () => times(rng.int(0, 25), (_, i) => ({
    id: `x${i}`,
    customerId: `c${rng.int(1, 8)}`, // a small pool, so repeat reviewers happen
    stars: rng.int(1, 5),
    createdAt: daysAgo(rng.int(1, 60)), // within two months, so the burst check matters
    completionMethod: rng.pick(['both', 'auto', 'admin']),
    reviewerOtherWorkers: rng.pick([0, 0, 0, 1, 2, 4]),
    hidden: rng.next() < 0.1,
  }));
  const CASES = Array.from({ length: 300 }, randomReviews);
  const newest = (stars, extra = {}) => ({ id: 'zz-new', customerId: `c${rng.int(1, 10)}`, stars, createdAt: NOW, completionMethod: rng.pick(['both', 'auto']), reviewerOtherWorkers: rng.pick([0, 2]), hidden: false, ...extra });

  for (const candidate of REP2_CANDIDATES) {
    const params = rep2Params(candidate);
    const B = candidate.newReviewerBudget;
    const a = 0.75;
    const run = (list, baseRate = a) => computeReputation(list, { now: NOW, params, baseRate });
    const newWeight = (res, list) => {
      const fresh = new Set(list.filter((rv) => !rv.hidden && (rv.reviewerOtherWorkers ?? 0) === 0).map((rv) => rv.id));
      return res.perReview.filter((p) => fresh.has(p.id)).reduce((sum, p) => sum + p.weight, 0);
    };

    describe(candidate.id, () => {
      test('adding a 5 star review never lowers expected; adding a 1 star review never raises it; uncertainty never rises', () => {
        for (const list of CASES) {
          const before = run(list);
          expect(run([...list, newest(5)]).expected).toBeGreaterThanOrEqual(before.expected - 1e-12);
          expect(run([...list, newest(1)]).expected).toBeLessThanOrEqual(before.expected + 1e-12);
          expect(run([...list, newest(rng.int(1, 5))]).uncertainty).toBeLessThanOrEqual(before.uncertainty + 1e-12);
        }
      });

      test('the new reviewers together never weigh more than B, also after one more new reviewer', () => {
        for (const list of CASES) {
          expect(newWeight(run(list), list)).toBeLessThanOrEqual(B + 1e-9);
          const more = [...list, newest(rng.int(1, 5), { reviewerOtherWorkers: 0 })];
          expect(newWeight(run(more), more)).toBeLessThanOrEqual(B + 1e-9);
        }
      });

      test('the order of the reviews never matters; hidden reviews change nothing', () => {
        for (const list of CASES) {
          expect(run(rng.shuffle(list))).toEqual(run(list));
          const shown = list.filter((rv) => !rv.hidden);
          const core = (res) => [res.r, res.s, res.expected, res.cautious, res.reviewCount];
          expect(core(run(list))).toEqual(core(run(shown)));
        }
      });

      test('a base rate outside [0.2, 0.9] is clamped; below 20 platform reviews the result equals the a = 0.5 case', () => {
        for (const list of CASES.slice(0, 60)) {
          expect(run(list, 0.97)).toEqual(run(list, 0.9));
          expect(run(list, 0.05)).toEqual(run(list, 0.2));
          expect(run(list, platformBaseRate({ count: 19, meanEvidence: 0.97 }, params))).toEqual(run(list, 0.5));
        }
      });

      test('every weight and factor is between 0 and 1, and cautious <= expected', () => {
        for (const list of CASES) {
          const res = run(list);
          for (const p of res.perReview) {
            expect(p.weight).toBeGreaterThanOrEqual(0);
            expect(p.weight).toBeLessThanOrEqual(1);
            for (const f of Object.values(p.factors)) expect(f >= 0 && f <= 1).toBe(true);
          }
          expect(res.cautious).toBeLessThanOrEqual(res.expected);
          expect(res.cautious).toBeGreaterThanOrEqual(0);
        }
      });
    });
  }
});

describe('rep-2 sensitivity tables (npm run reputation:sensitivity)', () => {
  test('four groups (B, burst, base rate, W); the a = 0.8 column gives the hand-worked numbers', async () => {
    const { rep2SensitivityTable, REP2_CASES } = await import('../../scripts/reputationSensitivity.js');
    const tables = rep2SensitivityTable();
    expect(tables.map((t) => [t.group, t.values])).toEqual([
      ['new-reviewer budget B', [1, 2, 3]], ['burst check', ['off', 'on']], ['base rate a', [0.5, 0.7, 0.8]], ['prior weight W', [1, 2, 4]],
    ]);
    for (const t of tables) expect(t.rows).toHaveLength(REP2_CASES.length);
    const a08 = Object.fromEntries(tables[2].rows.map((r) => [r.name, [round4(r.cells[2].expected), round4(r.cells[2].cautious)]]));
    expect(a08['No reviews']).toEqual([0.8, 0.504]);
    expect(a08['One 5 star']).toEqual([0.8667, 0.6488]);
    expect(a08['One 1 star']).toEqual([0.5333, 0.2136]);
    expect(a08['28 x 5 star + 12 x 4 star']).toEqual([0.919, 0.8657]);
    // B moves only the reviews of new reviewers
    const byB = tables[0].rows;
    expect(new Set(byB.find((r) => r.name === 'Ten 5 star, reviewers with history').cells.map((c) => c.expected)).size).toBe(1);
    expect(new Set(byB.find((r) => r.name === 'Ten 5 star from ten new reviewers').cells.map((c) => c.expected)).size).toBe(3);
  });
});
