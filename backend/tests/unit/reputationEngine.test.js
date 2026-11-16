// Module 4: the weighted Beta reputation model (services/reputation/reputationEngine.js).
// Hand-worked examples from the Batch 6 plan, section 4.6 (four decimal places), and property tests
// with a seeded generator (the same seed always gives the same cases).
import { describe, test, expect } from 'vitest';
import { computeReputation, reviewWeight, reviewerTrustFor, starsToEvidence } from '../../services/reputation/reputationEngine.js';
import { recencyWeight, betaNumbers, depthFrom, ageInDays } from '../../services/reputation/beta.js';
import { DEFAULT_REPUTATION_PARAMS as P, withParams, paramsHash } from '../../config/reputationParams.js';
import { createRng, mulberry32 } from '../../evaluation/reputation/rng.js';

const NOW = new Date('2026-11-16T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const round4 = (x) => Number(x.toFixed(4));
const daysAgo = (d) => new Date(NOW.getTime() - d * DAY);

let seq = 0;
// A review with weight 1 unless changed: today, completed by both, from a customer who hired 3 others.
const review = (stars, extra = {}) => {
  seq += 1;
  return { id: `r${String(seq).padStart(4, '0')}`, customerId: `c${seq}`, stars, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, hidden: false, ...extra };
};
const times = (n, make) => Array.from({ length: n }, make);
const numbers = (res) => ({ r: round4(res.r), s: round4(res.s), uncertainty: round4(res.uncertainty), expected: round4(res.expected), cautious: round4(res.cautious) });

describe('hand-worked examples (section 4.6)', () => {
  const CASES = [
    ['no reviews', [], { r: 0, s: 0, uncertainty: 1, expected: 0.5, cautious: 0.13 }],
    ['one 5 star, weight 1', [review(5)], { r: 1, s: 0, uncertainty: 0.6667, expected: 0.6667, cautious: 0.3646 }],
    ['one 1 star, weight 1', [review(1)], { r: 0, s: 1, uncertainty: 0.6667, expected: 0.3333, cautious: 0.0313 }],
    ['one 4 star, weight 1', [review(4)], { r: 0.75, s: 0.25, uncertainty: 0.6667, expected: 0.5833, cautious: 0.2674 }],
    ['one 3 star, weight 1', [review(3)], { r: 0.5, s: 0.5, uncertainty: 0.6667, expected: 0.5, cautious: 0.1796 }],
    ['one 5 star from a new reviewer (weight 0.5)', [review(5, { reviewerOtherWorkers: 0 })], { r: 0.5, s: 0, uncertainty: 0.8, expected: 0.6, cautious: 0.2644 }],
    ['one 5 star, one year old (weight 0.5)', [review(5, { createdAt: daysAgo(365) })], { r: 0.5, s: 0, uncertainty: 0.8, expected: 0.6, cautious: 0.2644 }],
    ['one 5 star, auto-completed (weight 0.6)', [review(5, { completionMethod: 'auto' })], { r: 0.6, s: 0, uncertainty: 0.7692, expected: 0.6154, cautious: 0.2868 }],
    ['ten 5 star, each weight 1', times(10, () => review(5)), { r: 10, s: 0, uncertainty: 0.1667, expected: 0.9167, cautious: 0.8184 }],
    ['three 5 star from the SAME customer (1, 1/2, 1/3)', times(3, (_, i) => review(5, { customerId: 'same', createdAt: daysAgo(0) , id: `same${i}` })), { r: 1.8333, s: 0, uncertainty: 0.5217, expected: 0.7391, cautious: 0.4832 }],
    ['28 x 5 star + 12 x 4 star (average 4.7, 40 reviews)', [...times(28, () => review(5)), ...times(12, () => review(4))], { r: 37, s: 3, uncertainty: 0.0476, expected: 0.9048, cautious: 0.8474 }],
  ];
  test.each(CASES)('%s', (_name, reviews, want) => {
    expect(numbers(computeReputation(reviews, { now: NOW }))).toEqual(want);
  });

  test('the viva point: by cautious, 40 reviews averaging 4.7 rank above 10 perfect reviews, both far above one perfect review; a plain average puts the single 5 star first', () => {
    const one = computeReputation([review(5)], { now: NOW });
    const ten = computeReputation(times(10, () => review(5)), { now: NOW });
    const forty = computeReputation([...times(28, () => review(5)), ...times(12, () => review(4))], { now: NOW });
    expect(forty.cautious).toBeGreaterThan(ten.cautious);
    expect(ten.cautious).toBeGreaterThan(one.cautious + 0.4);
    expect(one.ratingAverage).toBe(5);
    expect(forty.ratingAverage).toBeCloseTo(4.7, 10);
    expect(one.ratingAverage).toBeGreaterThan(forty.ratingAverage);
  });

  test('recency weight: 1 at 0 days, 0.7071 at 182.5, 0.5 at 365, 0.25 at 730', () => {
    expect([0, 182.5, 365, 730].map((d) => round4(recencyWeight(d, 365)))).toEqual([1, 0.7071, 0.5, 0.25]);
  });

  test('reviewer trust: 0.5, 0.6667, 0.8333, 1 and 1 for n = 0 to 4', () => {
    expect([0, 1, 2, 3, 4].map((n) => round4(reviewerTrustFor(n, P)))).toEqual([0.5, 0.6667, 0.8333, 1, 1]);
  });

  test('stars to evidence: 5 -> 1, 4 -> 0.75, 3 -> 0.5, 2 -> 0.25, 1 -> 0', () => {
    expect([5, 4, 3, 2, 1].map(starsToEvidence)).toEqual([1, 0.75, 0.5, 0.25, 0]);
  });

  test('expected equals (r + 1) / (r + s + 2), the mean of Beta(r + 1, s + 1), with W = 2 and a = 0.5', () => {
    for (const [r, s] of [[0, 0], [1, 0], [3.5, 1.25], [37, 3]]) expect(betaNumbers(r, s, P).expected).toBeCloseTo((r + 1) / (r + s + 2), 12);
  });
});

describe('weights, reasons and display facts', () => {
  test('perReview explains each review in plain codes', () => {
    const res = computeReputation([
      review(5, { id: 'a' }),
      review(5, { id: 'b', createdAt: daysAgo(400) }),
      review(4, { id: 'c', completionMethod: 'auto' }),
      review(3, { id: 'd', reviewerOtherWorkers: 0 }),
      review(5, { id: 'e', createdAt: daysAgo(60) }),
      review(5, { id: 'f', createdAt: daysAgo(10) }),
      review(5, { id: 'g1', customerId: 'x', createdAt: daysAgo(2) }),
      review(5, { id: 'g2', customerId: 'x', createdAt: daysAgo(1) }),
    ], { now: NOW });
    const reasons = Object.fromEntries(res.perReview.map((p) => [p.id, p.reasons]));
    expect(reasons).toEqual({
      a: ['counted_fully'], b: ['older_than_a_year'], c: ['auto_completed'], d: ['new_reviewer'], e: ['months_old'], f: ['weeks_old'],
      g1: ['counted_fully'], g2: ['repeat_reviewer'],
    });
    const g2 = res.perReview.find((p) => p.id === 'g2');
    expect(g2.factors.pairFactor).toBe(0.5);
  });

  test('an admin-completed job counts like one confirmed by both; an unknown method counts like auto', () => {
    expect(reviewWeight(review(5, { completionMethod: 'admin' }), 1, NOW, P).weight).toBe(1);
    expect(reviewWeight(review(5, { completionMethod: undefined }), 1, NOW, P).weight).toBe(0.6);
  });

  test('display facts: plain average, count, distribution, quick answers and "would hire again"', () => {
    const res = computeReputation([
      review(5, { onTime: 'yes', workQuality: 'yes', polite: 'yes', priceAsAgreed: 'no', wouldHireAgain: 'yes' }),
      review(4, { onTime: 'no', wouldHireAgain: 'no' }),
      review(2),
      review(1, { hidden: true, onTime: 'yes' }),
    ], { now: NOW });
    expect(res.reviewCount).toBe(3);
    expect(res.ratingAverage).toBeCloseTo(11 / 3, 10);
    expect(res.distribution).toEqual({ 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 });
    expect(res.quick).toEqual({ onTime: { yes: 1, total: 2 }, workQuality: { yes: 1, total: 1 }, polite: { yes: 1, total: 1 }, priceAsAgreed: { yes: 0, total: 1 } });
    expect(res.wouldHireAgain).toEqual({ yes: 1, total: 2 });
  });

  test('depth: none without visible reviews; few above 0.4 uncertainty; some from 0.2 to 0.4; many at 0.2 or less', () => {
    expect(computeReputation([review(5, { hidden: true })], { now: NOW }).depth).toBe('none');
    expect(computeReputation(times(2, () => review(5)), { now: NOW }).depth).toBe('few'); // u = 0.5
    expect(computeReputation(times(3, () => review(5)), { now: NOW }).depth).toBe('some'); // u = 0.4
    expect(computeReputation(times(7, () => review(5)), { now: NOW }).depth).toBe('some'); // u = 0.2222
    expect(computeReputation(times(8, () => review(5)), { now: NOW }).depth).toBe('many'); // u = 0.2
    expect(depthFrom(0.41, true, P.depthThresholds)).toBe('few');
  });

  test('ablations switch one factor off', () => {
    const old = [review(5, { createdAt: daysAgo(365), reviewerOtherWorkers: 0, completionMethod: 'auto' })];
    const all = computeReputation(old, { now: NOW });
    expect(all.r).toBeCloseTo(0.6 * 0.5 * 0.5, 10);
    expect(computeReputation(old, { now: NOW, params: withParams({ factors: { recency: false } }) }).r).toBeCloseTo(0.3, 10);
    expect(computeReputation(old, { now: NOW, params: withParams({ factors: { reviewerTrust: false } }) }).r).toBeCloseTo(0.3, 10);
    expect(computeReputation(old, { now: NOW, params: withParams({ factors: { provenance: false } }) }).r).toBeCloseTo(0.25, 10);
    const pair = times(2, (_, i) => review(5, { customerId: 'p', id: `p${i}` }));
    expect(computeReputation(pair, { now: NOW, params: withParams({ factors: { pairFactor: false } }) }).r).toBe(2);
  });

  test('the engines never read the clock and refuse bad input', () => {
    expect(() => computeReputation([], {})).toThrow(/now/);
    expect(() => computeReputation([review(6)], { now: NOW })).toThrow(/stars/);
    expect(() => computeReputation([review(4.5)], { now: NOW })).toThrow(/stars/);
    expect(() => ageInDays('not a date', NOW)).toThrow(/date/);
    expect(() => betaNumbers(-1, 0, P)).toThrow();
  });

  test('the parameter hash is stable and changes with any parameter', () => {
    expect(paramsHash()).toMatch(/^[a-f0-9]{12}$/);
    expect(paramsHash()).toBe(paramsHash(withParams({})));
    expect(paramsHash(withParams({ halfLifeDays: 180 }))).not.toBe(paramsHash());
    expect(paramsHash(withParams({ provenance: { auto: 0.4 } }))).not.toBe(paramsHash());
  });
});

describe('property tests (seeded generator, 300 random cases each)', () => {
  const rng = createRng(20261116);
  const randomReviews = () => times(rng.int(0, 25), (_, i) => ({
    id: `x${i}`,
    customerId: `c${rng.int(1, 8)}`, // a small pool, so repeat reviewers happen
    stars: rng.int(1, 5),
    createdAt: daysAgo(rng.int(1, 1000)),
    completionMethod: rng.pick(['both', 'auto', 'admin']),
    reviewerOtherWorkers: rng.int(0, 5),
    hidden: rng.next() < 0.1,
  }));
  // a NEW review arrives now (the newest), from any customer
  const newest = (stars) => ({ id: 'zz-new', customerId: `c${rng.int(1, 10)}`, stars, createdAt: NOW, completionMethod: rng.pick(['both', 'auto']), reviewerOtherWorkers: rng.int(0, 4), hidden: false });
  const CASES = Array.from({ length: 300 }, randomReviews);
  const run = (list) => computeReputation(list, { now: NOW });
  const core = (res) => ({ r: res.r, s: res.s, expected: res.expected, uncertainty: res.uncertainty, cautious: res.cautious, depth: res.depth, reviewCount: res.reviewCount });

  test('adding a 5 star review never lowers expected; adding a 1 star review never raises it', () => {
    for (const list of CASES) {
      const before = run(list).expected;
      expect(run([...list, newest(5)]).expected).toBeGreaterThanOrEqual(before - 1e-12);
      expect(run([...list, newest(1)]).expected).toBeLessThanOrEqual(before + 1e-12);
    }
  });

  test('uncertainty never rises when a review is added', () => {
    for (const list of CASES) {
      const before = run(list).uncertainty;
      expect(run([...list, newest(rng.int(1, 5))]).uncertainty).toBeLessThanOrEqual(before + 1e-12);
    }
  });

  test('hidden reviews change nothing', () => {
    for (const list of CASES) {
      const hidden = times(rng.int(1, 4), (_, i) => ({ ...newest(rng.int(1, 5)), id: `h${i}`, createdAt: daysAgo(rng.int(0, 500)), hidden: true }));
      expect(core(run([...list, ...hidden]))).toEqual(core(run(list)));
    }
  });

  test('the order of the input array changes nothing', () => {
    for (const list of CASES) expect(run(rng.shuffle(list))).toEqual(run(list));
  });

  test('every weight is between 0 and 1, and cautious <= expected', () => {
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

describe('seeded generator', () => {
  test('the same seed gives the same sequence; another seed gives another', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const seqA = times(20, () => a());
    expect(times(20, () => b())).toEqual(seqA);
    expect(times(20, () => c())).not.toEqual(seqA);
    for (const x of seqA) expect(x >= 0 && x < 1).toBe(true);
  });

  test('normal, beta and geometric draws have about the right means (seeded, 20,000 draws)', () => {
    const rng = createRng(7);
    const mean = (f) => times(20000, f).reduce((s, x) => s + x, 0) / 20000;
    expect(mean(() => rng.normal(0, 0.15))).toBeCloseTo(0, 2);
    expect(mean(() => rng.beta(4, 2))).toBeCloseTo(4 / 6, 2);
    expect(Math.abs(mean(() => rng.geometric(4)) - 4)).toBeLessThan(0.15);
    expect(rng.geometric(0)).toBe(0);
    expect(rng.beta(0.5, 0.5)).toBeGreaterThan(0);
  });
});
