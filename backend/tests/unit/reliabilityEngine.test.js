// Module 4: the reliability record (services/reputation/reliabilityEngine.js), the snapshot builder
// and toMatchingSignals. Hand-worked examples from the Batch 6 plan, section 4.7, and property tests.
import { describe, test, expect } from 'vitest';
import { computeReliability, OUTCOMES } from '../../services/reputation/reliabilityEngine.js';
import { computeReputation } from '../../services/reputation/reputationEngine.js';
import { buildReputationSnapshot, perSkillFacts, snapshotFrom } from '../../services/reputation/snapshot.js';
import { toMatchingSignals, NEW_WORKER_CAUTIOUS } from '../../services/reputation/matchingSignals.js';
import { paramsHash, withParams, REPUTATION_ENGINE_VERSION, REP1_PARAMS } from '../../config/reputationParams.js';
import { createRng } from '../../evaluation/reputation/rng.js';

const NOW = new Date('2026-11-16T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const round4 = (x) => Number(x.toFixed(4));
const daysAgo = (d) => new Date(NOW.getTime() - d * DAY);
let n = 0;
const booking = (outcome, extra = {}) => {
  n += 1;
  return { outcome, closedAt: NOW, customerId: `c${n}`, skillId: 'elec_wiring', ...extra };
};
const times = (k, make) => Array.from({ length: k }, make);
const ev = (list) => {
  const res = computeReliability(list, { now: NOW });
  return { expected: round4(res.expected), uncertainty: round4(res.uncertainty) };
};

describe('hand-worked examples (section 4.7, all weights 1)', () => {
  test.each([
    ['nothing', [], { expected: 0.5, uncertainty: 1 }],
    ['10 completed', times(10, () => booking('completed')), { expected: 0.9167, uncertainty: 0.1667 }],
    ['10 completed + 1 late cancellation', [...times(10, () => booking('completed')), booking('cancelled_by_worker_late')], { expected: 0.8462, uncertainty: 0.1538 }],
    ['10 completed + 1 early cancellation (0.5)', [...times(10, () => booking('completed')), booking('cancelled_by_worker_early')], { expected: 0.88, uncertainty: 0.16 }],
    ['3 completed + 1 no-show', [...times(3, () => booking('completed')), booking('worker_no_show')], { expected: 0.6667, uncertainty: 0.3333 }],
  ])('%s', (_name, list, want) => {
    expect(ev(list)).toEqual(want);
  });

  test('raw counts are never weighted; repeat customers have 2 or more completed jobs', () => {
    const res = computeReliability([
      booking('completed', { customerId: 'a', closedAt: daysAgo(800) }), booking('completed', { customerId: 'a' }),
      booking('completed', { customerId: 'b' }), booking('cancelled_by_worker_early'), booking('cancelled_by_worker_late'),
      booking('worker_no_show'), booking('declined'), booking('expired'), booking('cancelled_by_customer'),
      booking('closed_no_fault', { accepted: true }), booking('cancelled_by_customer', { accepted: true }),
    ], { now: NOW });
    expect(res).toMatchObject({ completed: 3, workerCancelledEarly: 1, workerCancelledLate: 1, noShows: 1, acceptedTotal: 8, repeatCustomers: 1 });
  });

  test('depth is "none" until a booking was accepted', () => {
    expect(computeReliability([booking('declined'), booking('expired')], { now: NOW }).depth).toBe('none');
    expect(computeReliability([booking('completed')], { now: NOW }).depth).toBe('few');
  });

  test('older outcomes count less (same half-life as reviews), unless recency is switched off', () => {
    const old = [booking('worker_no_show', { closedAt: daysAgo(365) })];
    expect(computeReliability(old, { now: NOW }).s).toBeCloseTo(0.5, 10);
    expect(computeReliability(old, { now: NOW, params: withParams({ factors: { recency: false } }) }).s).toBe(1);
  });

  test('unknown outcomes and a missing clock are refused', () => {
    expect(() => computeReliability([booking('lost')], { now: NOW })).toThrow(/outcome/);
    expect(() => computeReliability([], {})).toThrow(/now/);
  });
});

describe('property tests (seeded, 300 random cases each)', () => {
  const rng = createRng(1611);
  const random = () => times(rng.int(0, 20), () => booking(rng.pick(OUTCOMES), { closedAt: daysAgo(rng.int(0, 900)), customerId: `c${rng.int(1, 6)}` }));
  const CASES = Array.from({ length: 300 }, random);
  const nums = (list) => {
    const res = computeReliability(list, { now: NOW });
    return { r: res.r, s: res.s, expected: res.expected, uncertainty: res.uncertainty, completed: res.completed, noShows: res.noShows, workerCancelledEarly: res.workerCancelledEarly, workerCancelledLate: res.workerCancelledLate };
  };

  test('declined, expired, cancelled_by_customer and closed_no_fault never change the numbers', () => {
    for (const list of CASES) {
      for (const outcome of ['declined', 'expired', 'cancelled_by_customer', 'closed_no_fault']) {
        expect(nums([...list, booking(outcome, { closedAt: daysAgo(rng.int(0, 400)) })])).toEqual(nums(list));
      }
    }
  });

  test('a completed job never lowers expected; a late cancellation lowers it more than an early one', () => {
    for (const list of CASES) {
      const base = computeReliability(list, { now: NOW }).expected;
      expect(computeReliability([...list, booking('completed')], { now: NOW }).expected).toBeGreaterThanOrEqual(base - 1e-12);
      const early = computeReliability([...list, booking('cancelled_by_worker_early')], { now: NOW }).expected;
      const late = computeReliability([...list, booking('cancelled_by_worker_late')], { now: NOW }).expected;
      expect(late).toBeLessThan(early);
      expect(early).toBeLessThan(base);
    }
  });
});

describe('snapshot (buildReputationSnapshot) and matching signals', () => {
  const reviews = [
    { id: 'r1', customerId: 'a', stars: 5, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, skillId: 'elec_wiring' },
    { id: 'r2', customerId: 'b', stars: 3, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, skillId: 'elec_solar' },
    { id: 'r3', customerId: 'c', stars: 1, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, skillId: 'elec_wiring', hidden: true },
  ];
  const closed = [
    booking('completed', { skillId: 'elec_wiring', closedAt: daysAgo(3), customerId: 'a' }),
    booking('completed', { skillId: 'elec_wiring', closedAt: daysAgo(1), customerId: 'a' }),
    booking('completed', { skillId: 'elec_solar', closedAt: daysAgo(2), customerId: 'b' }),
    booking('cancelled_by_worker_late', { skillId: 'elec_solar' }),
  ];

  test('perSkill: completed jobs, visible reviews, plain average and the last completion, per skill', () => {
    const facts = perSkillFacts(closed.filter((b) => b.outcome === 'completed').map((b) => ({ skillId: b.skillId, completedAt: b.closedAt })), reviews);
    expect(facts).toEqual([
      { skillId: 'elec_wiring', completedJobs: 2, reviewCount: 1, ratingAverage: 5, lastCompletedAt: daysAgo(1) },
      { skillId: 'elec_solar', completedJobs: 1, reviewCount: 1, ratingAverage: 3, lastCompletedAt: daysAgo(2) },
    ]);
  });

  // Batch 6B: rep-2 is live; this test keeps checking a rep-1 snapshot BY NAME (rep-2: the next test)
  test('the snapshot keeps the numbers out of its public part', () => {
    const { snapshot } = snapshotFrom({ reviews, closedBookings: closed, now: NOW, params: REP1_PARAMS });
    expect(snapshot.engineVersion).toBe('rep-1');
    expect(snapshot.paramsHash).toBe(paramsHash(REP1_PARAMS));
    expect(snapshot.computedAt).toBe(NOW);
    expect(snapshot.public).toMatchObject({ ratingAverage: 4, reviewCount: 2, depth: 'few', completedJobs: 3, workerCancelledLate: 1, repeatCustomers: 1, lastCompletedAt: daysAgo(1) });
    expect(JSON.stringify(snapshot.public)).not.toMatch(/expected|uncertainty|cautious|belief/);
    expect(snapshot.score.cautious).toBeLessThan(snapshot.score.expected);
    expect(snapshot.reliability).toMatchObject({ completed: 3, acceptedTotal: 4, workerCancelledLate: 1 });
    expect(() => buildReputationSnapshot({ reputation: computeReputation([], { now: NOW }), reliability: computeReliability([], { now: NOW }) })).toThrow(/computedAt/);
  });

  test('rep-2 (live since Batch 6B): the snapshot names rep-2, stores the base rate, and its public depth word follows the visible reviews', () => {
    const { snapshot } = snapshotFrom({ reviews, closedBookings: closed, now: NOW, baseRate: 0.8 });
    expect(snapshot.engineVersion).toBe(REPUTATION_ENGINE_VERSION);
    expect(snapshot.engineVersion).toBe('rep-2');
    expect(snapshot.paramsHash).toBe(paramsHash());
    expect(snapshot.baseRate).toBe(0.8);
    expect(JSON.stringify(snapshot.public)).not.toMatch(/expected|uncertainty|cautious|belief|baseRate/);
    // twelve 5 star reviews from twelve first-time customers: little counted evidence (B = 1), but the public
    // word follows what customers see ("Many reviews"), never "Few reviews yet" next to "(12)"
    const twelve = Array.from({ length: 12 }, (_, i) => ({ id: `t${i}`, customerId: `n${i}`, stars: 5, createdAt: new Date(NOW.getTime() - i * 20 * DAY), completionMethod: 'both', reviewerOtherWorkers: 0 }));
    const fresh = snapshotFrom({ reviews: twelve, closedBookings: [], now: NOW, baseRate: 0.8 }).snapshot;
    expect(fresh.score.depth).toBe('few');
    expect(fresh.public).toMatchObject({ reviewCount: 12, depth: 'many' });
    expect(snapshotFrom({ reviews: twelve, closedBookings: [], now: NOW, params: REP1_PARAMS }).snapshot.public.depth).toBe('some'); // rep-1 unchanged
    expect(toMatchingSignals(fresh)).toMatchObject({ baseRate: 0.8, engineVersion: 'rep-2', depth: 'few' });
  });

  test('toMatchingSignals: the documented fields only; a worker with no snapshot gets the prior and isNew', () => {
    const { snapshot } = snapshotFrom({ reviews, closedBookings: closed, now: NOW });
    const signals = toMatchingSignals(snapshot);
    // Batch 6B added baseRate to the contract (docs/contracts/MATCHING-INPUTS.md); every old field stays
    expect(Object.keys(signals).sort()).toEqual(['baseRate', 'cautious', 'depth', 'engineVersion', 'expected', 'isNew', 'perSkill', 'reliability', 'repeatCustomers', 'uncertainty']);
    expect(signals).toMatchObject({ expected: snapshot.score.expected, cautious: snapshot.score.cautious, depth: 'few', repeatCustomers: 1, isNew: false });
    expect(signals.reliability).toMatchObject({ completed: 3, acceptedTotal: 4 });
    expect(signals.perSkill).toHaveLength(2);
    expect(signals).not.toHaveProperty('ratingAverage');

    const none = toMatchingSignals(null);
    expect(none).toMatchObject({ expected: 0.5, uncertainty: 1, depth: 'none', isNew: true, repeatCustomers: 0, perSkill: [], engineVersion: null });
    expect(round4(none.cautious)).toBe(0.13);
    expect(NEW_WORKER_CAUTIOUS).toBe(none.cautious);
  });
});
