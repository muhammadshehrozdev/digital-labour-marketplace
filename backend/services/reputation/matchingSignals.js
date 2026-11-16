// The stable entry point for Module 7 (matching): the reputation fields it may read
// (docs/contracts/MATCHING-INPUTS.md). PURE. Two rules for Module 7, repeated here on purpose:
//   1. never rank by the plain average of stars (ratingAverage is for display only);
//   2. handle new workers on purpose (isNew): fair exposure is Module 7's own research part.
import { computeReputation } from './reputationEngine.js';
import { computeReliability } from './reliabilityEngine.js';

// The numbers of a worker with no data at all (no snapshot yet): the Beta prior.
const EPOCH = new Date(0);
const NO_REVIEWS = computeReputation([], { now: EPOCH });
const NO_BOOKINGS = computeReliability([], { now: EPOCH });

export function toMatchingSignals(snapshot) {
  const score = snapshot?.score ?? NO_REVIEWS;
  const rel = snapshot?.reliability ?? NO_BOOKINGS;
  const pub = snapshot?.public ?? {};
  return {
    expected: score.expected,
    uncertainty: score.uncertainty,
    cautious: score.cautious,
    depth: score.depth,
    reliability: {
      expected: rel.expected,
      uncertainty: rel.uncertainty,
      depth: rel.depth,
      completed: rel.completed ?? 0,
      workerCancelledEarly: rel.workerCancelledEarly ?? 0,
      workerCancelledLate: rel.workerCancelledLate ?? 0,
      noShows: rel.noShows ?? 0,
      acceptedTotal: rel.acceptedTotal ?? 0,
    },
    perSkill: (pub.perSkill ?? []).map(({ skillId, completedJobs, reviewCount, ratingAverage, lastCompletedAt }) => ({ skillId, completedJobs, reviewCount, ratingAverage, lastCompletedAt })),
    repeatCustomers: rel.repeatCustomers ?? pub.repeatCustomers ?? 0,
    isNew: !snapshot || ((pub.reviewCount ?? 0) === 0 && (rel.acceptedTotal ?? 0) === 0),
    engineVersion: snapshot?.engineVersion ?? null,
  };
}

// The cautious score of a worker with no reviews (0.1300 with the default parameters). The directory's
// "Best track record" order gives this value to workers without a snapshot, so they sort exactly like
// workers whose snapshot has no reviews.
export const NEW_WORKER_CAUTIOUS = NO_REVIEWS.cautious;
