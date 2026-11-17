// Builds the reputation snapshot stored on WorkerProfile.reputation (Module 4, D-047). PURE.
//
// The snapshot has three parts, so a public projection can never leak a number by a missed field:
//   public       what anyone who may see the profile sees: average stars with the count, depth,
//                star distribution, quick-answer counts, reliability COUNTS, per-skill facts
//   score        the reputation numbers (owner, admin and Module 7 matching only)
//   reliability  the reliability numbers and counts (owner, admin and matching only)
// `perReview` (the explanation) is not stored: it is rebuilt when the worker or an admin asks.
// `baseRate` is the base rate (a) that the reputation numbers used (rep-1 always 0.5; rep-2 the platform prior at
// that moment), so every number can be re-done by hand.
import { computeReputation } from './reputationEngine.js';
import { computeReliability } from './reliabilityEngine.js';
import { DEFAULT_REPUTATION_PARAMS, engineVersionOf, paramsHash } from '../../config/reputationParams.js';

const pickNumbers = ({ r, s, belief, disbelief, uncertainty, expected, cautious, depth }) => ({ r, s, belief, disbelief, uncertainty, expected, cautious, depth });

// completedBookings: [{ skillId, completedAt }]; reviews: [{ skillId, stars, hidden }]
export function perSkillFacts(completedBookings = [], reviews = []) {
  const bySkill = new Map();
  const entry = (skillId) => {
    if (!bySkill.has(skillId)) bySkill.set(skillId, { skillId, completedJobs: 0, reviewCount: 0, starSum: 0, lastCompletedAt: null });
    return bySkill.get(skillId);
  };
  for (const b of completedBookings) {
    const e = entry(b.skillId);
    e.completedJobs += 1;
    const at = new Date(b.completedAt);
    if (!e.lastCompletedAt || at > e.lastCompletedAt) e.lastCompletedAt = at;
  }
  for (const rv of reviews) {
    if (rv.hidden) continue;
    const e = entry(rv.skillId);
    e.reviewCount += 1;
    e.starSum += rv.stars;
  }
  return [...bySkill.values()]
    .map(({ starSum, ...e }) => ({ ...e, ratingAverage: e.reviewCount ? starSum / e.reviewCount : null }))
    .sort((a, b) => b.completedJobs - a.completedJobs || String(a.skillId).localeCompare(String(b.skillId)));
}

/**
 * reputation: the result of computeReputation; reliability: the result of computeReliability;
 * completedBookings / reviews: for the per-skill facts. computedAt: the `now` used for the engines.
 */
export function buildReputationSnapshot({ reputation, reliability, completedBookings = [], reviews = [], computedAt, params = DEFAULT_REPUTATION_PARAMS }) {
  if (!(computedAt instanceof Date)) throw new Error('pass computedAt (the same `now` given to the engines)');
  const perSkill = perSkillFacts(completedBookings, reviews);
  const lastCompletedAt = perSkill.reduce((latest, s) => (s.lastCompletedAt && (!latest || s.lastCompletedAt > latest) ? s.lastCompletedAt : latest), null);
  return {
    engineVersion: engineVersionOf(params),
    paramsHash: paramsHash(params),
    computedAt,
    baseRate: reputation.baseRate ?? params.baseRate,
    public: {
      ratingAverage: reputation.ratingAverage,
      reviewCount: reputation.reviewCount,
      depth: reputation.depth,
      distribution: { ...reputation.distribution },
      quick: JSON.parse(JSON.stringify(reputation.quick)),
      wouldHireAgain: { ...reputation.wouldHireAgain },
      completedJobs: reliability.completed,
      workerCancelledEarly: reliability.workerCancelledEarly,
      workerCancelledLate: reliability.workerCancelledLate,
      noShows: reliability.noShows,
      repeatCustomers: reliability.repeatCustomers,
      lastCompletedAt,
      perSkill,
    },
    score: pickNumbers(reputation),
    reliability: {
      ...pickNumbers(reliability),
      completed: reliability.completed,
      workerCancelledEarly: reliability.workerCancelledEarly,
      workerCancelledLate: reliability.workerCancelledLate,
      noShows: reliability.noShows,
      acceptedTotal: reliability.acceptedTotal,
      repeatCustomers: reliability.repeatCustomers,
    },
  };
}

// Convenience: run both engines and build the snapshot from plain data (used by recompute.js and tests).
// baseRate: the platform base rate (rep-2; recompute.js computes it); rep-1 ignores it.
export function snapshotFrom({ reviews = [], closedBookings = [], now, params = DEFAULT_REPUTATION_PARAMS, baseRate }) {
  const reputation = computeReputation(reviews, { now, params, baseRate });
  const reliability = computeReliability(closedBookings, { now, params });
  const completedBookings = closedBookings.filter((b) => b.outcome === 'completed').map((b) => ({ skillId: b.skillId, completedAt: b.closedAt }));
  return { snapshot: buildReputationSnapshot({ reputation, reliability, completedBookings, reviews, computedAt: now, params }), reputation, reliability };
}
