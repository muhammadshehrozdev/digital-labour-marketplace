// The ranking methods compared by the Module 4 simulation. Each method gives one score per worker
// (higher = ranked higher). "Ours" IMPORTS the production engine; nothing is copied.
//   B1  plain average of stars (workers without reviews go last)
//   B2  Bayesian average (sum of stars + m * C) / (n + m), m = 5, C = mean of all reviews in the run
//   B3  Wilson lower bound (Wilson 1927, z = 1.96) on the share of 4 and 5 star reviews
//   B4  plain Beta expected value with every weight 1 (Josang & Ismail 2002)
//   ours            the production reputationEngine, cautious score (what the directory orders by)
//   ours_expected   the production engine, expected instead of cautious (ablation)
//   no_recency, no_reviewer_trust, no_pair_factor, no_provenance: one weight factor switched off (ablations)
import { computeReputation } from '../../services/reputation/reputationEngine.js';
import { DEFAULT_REPUTATION_PARAMS, withParams } from '../../config/reputationParams.js';
import { SIM_NOW } from './config.js';

export const BAYES_M = 5;
export const WILSON_Z = 1.96;
const NO_REVIEWS_B1 = -1; // below every possible average, so these workers go last

export function plainAverage(reviews) {
  if (reviews.length === 0) return NO_REVIEWS_B1;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

export function bayesianAverage(reviews, { m = BAYES_M, C }) {
  return (reviews.reduce((s, r) => s + r.stars, 0) + m * C) / (reviews.length + m);
}

// Lower end of the Wilson score interval for `positive` successes out of `n`.
export function wilsonLower(positive, n, z = WILSON_Z) {
  if (n === 0) return 0;
  const p = positive / n;
  const z2 = z * z;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  return (centre - margin) / (1 + z2 / n);
}

const plainBeta = withParams({ factors: { provenance: false, recency: false, reviewerTrust: false, pairFactor: false } });
const engine = (params, field) => (reviews) => computeReputation(reviews, { now: SIM_NOW, params })[field];

export const METHODS = Object.freeze({
  B1: { label: 'B1 plain average', kind: 'baseline', score: (reviews) => plainAverage(reviews) },
  B2: { label: 'B2 Bayesian average (m = 5)', kind: 'baseline', score: (reviews, ctx) => bayesianAverage(reviews, { C: ctx.meanStars }) },
  B3: { label: 'B3 Wilson lower bound (4-5 stars)', kind: 'baseline', score: (reviews) => wilsonLower(reviews.filter((r) => r.stars >= 4).length, reviews.length) },
  B4: { label: 'B4 plain Beta (all weights 1)', kind: 'baseline', score: engine(plainBeta, 'expected') },
  ours: { label: 'Ours: weighted Beta, cautious', kind: 'ours', score: engine(DEFAULT_REPUTATION_PARAMS, 'cautious') },
  ours_expected: { label: 'Ablation: expected instead of cautious', kind: 'ablation', score: engine(DEFAULT_REPUTATION_PARAMS, 'expected') },
  no_recency: { label: 'Ablation: without recency', kind: 'ablation', score: engine(withParams({ factors: { recency: false } }), 'cautious') },
  no_reviewer_trust: { label: 'Ablation: without reviewer trust', kind: 'ablation', score: engine(withParams({ factors: { reviewerTrust: false } }), 'cautious') },
  no_pair_factor: { label: 'Ablation: without pair factor', kind: 'ablation', score: engine(withParams({ factors: { pairFactor: false } }), 'cautious') },
  no_provenance: { label: 'Ablation: without provenance', kind: 'ablation', score: engine(withParams({ factors: { provenance: false } }), 'cautious') },
});

// Scores of every worker by every method. ctx.meanStars: the mean of ALL reviews in the run
// (the system cannot tell fake reviews from real ones).
export function scoreAll(workers, methodNames = Object.keys(METHODS), table = METHODS) {
  const all = workers.flatMap((w) => w.reviews);
  const ctx = { meanStars: all.length ? all.reduce((s, r) => s + r.stars, 0) / all.length : 3 };
  return Object.fromEntries(methodNames.map((name) => [name, workers.map((w) => table[name].score(w.reviews, ctx))]));
}

// A method built from other engine parameters (used by explore.js only).
export const engineMethod = (label, params, field = 'cautious') => ({ label, kind: 'exploration', score: engine(params, field) });
