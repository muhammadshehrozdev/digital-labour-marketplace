// The ranking methods compared by the Module 4 simulation. Each method gives one score per worker
// (higher = ranked higher). "Ours" IMPORTS the production engine; nothing is copied.
//   B1  plain average of stars (workers without reviews go last)
//   B2  Bayesian average (sum of stars + m * C) / (n + m), m = 5, C = mean of all reviews in the run
//   B3  Wilson lower bound (Wilson 1927, z = 1.96) on the share of 4 and 5 star reviews
//   B4  plain Beta expected value with every weight 1 (Josang & Ismail 2002)
//   ours            the production reputationEngine, cautious score (what the directory orders by)
//   ours_expected   the production engine, expected instead of cautious (ablation)
//   no_recency, no_reviewer_trust, no_pair_factor, no_provenance: one weight factor switched off (ablations)
//
// Batch 6B: "ours" and the ablations are the rep-1 engine BY NAME (REP1_PARAMS), so the Batch 6 table means
// the same thing whichever engine is live. rep-2 methods: rep2CandidateMethods() (the six pre-registered
// candidates, development seeds only) and rep2TestMethods() (the frozen rep-2 against everything, test seeds).
// The platform base rate of rep-2 comes from ALL reviews of the run, fakes included (as it would in reality).
import { computeReputation, platformBaseRate } from '../../services/reputation/reputationEngine.js';
import { REP1_PARAMS, REP2_CANDIDATES, REP2_PARAMS, paramsHash, rep2Params, withParams } from '../../config/reputationParams.js';
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

const plainBeta = withParams({ factors: { provenance: false, recency: false, reviewerTrust: false, pairFactor: false } }, REP1_PARAMS);
// rep-1 ignores ctx; rep-2 takes the platform base rate of the run from it
const engine = (params, field) => (reviews, ctx) => computeReputation(reviews, { now: SIM_NOW, params, baseRate: params.platformPrior ? platformBaseRate(ctx?.platform, params) : undefined })[field];
const rep1 = (changes) => withParams(changes, REP1_PARAMS);

export const METHODS = Object.freeze({
  B1: { label: 'B1 plain average', kind: 'baseline', score: (reviews) => plainAverage(reviews) },
  B2: { label: 'B2 Bayesian average (m = 5)', kind: 'baseline', score: (reviews, ctx) => bayesianAverage(reviews, { C: ctx.meanStars }) },
  B3: { label: 'B3 Wilson lower bound (4-5 stars)', kind: 'baseline', score: (reviews) => wilsonLower(reviews.filter((r) => r.stars >= 4).length, reviews.length) },
  B4: { label: 'B4 plain Beta (all weights 1)', kind: 'baseline', score: engine(plainBeta, 'expected') },
  ours: { label: 'Ours: weighted Beta, cautious', kind: 'ours', score: engine(REP1_PARAMS, 'cautious') },
  ours_expected: { label: 'Ablation: expected instead of cautious', kind: 'ablation', score: engine(REP1_PARAMS, 'expected') },
  no_recency: { label: 'Ablation: without recency', kind: 'ablation', score: engine(rep1({ factors: { recency: false } }), 'cautious') },
  no_reviewer_trust: { label: 'Ablation: without reviewer trust', kind: 'ablation', score: engine(rep1({ factors: { reviewerTrust: false } }), 'cautious') },
  no_pair_factor: { label: 'Ablation: without pair factor', kind: 'ablation', score: engine(rep1({ factors: { pairFactor: false } }), 'cautious') },
  no_provenance: { label: 'Ablation: without provenance', kind: 'ablation', score: engine(rep1({ factors: { provenance: false } }), 'cautious') },
});

// Batch 6B: the six pre-registered rep-2 candidates (changes 1, 4 and 5 in all; B and burst vary), each by
// `expected` (the rule's number), with the baselines the selection rule needs. DEVELOPMENT SEEDS ONLY.
export function rep2CandidateMethods() {
  const methods = { B1: METHODS.B1, B4: METHODS.B4 };
  for (const c of REP2_CANDIDATES) {
    const params = rep2Params(c);
    methods[`rep2_${c.id}`] = { label: `rep-2 candidate ${c.id}, expected`, kind: 'candidate', candidate: c, paramsHash: paramsHash(params), score: engine(params, 'expected') };
  }
  return methods;
}

// Batch 6B: the frozen rep-2 against the baselines and rep-1 (TEST SEEDS, one run). Needs REP2_SELECTED.
export function rep2TestMethods(params = REP2_PARAMS) {
  if (!params) throw new Error('rep-2 is not frozen yet (REP2_SELECTED is null): the test seeds may not be used');
  return {
    B1: METHODS.B1,
    B2: METHODS.B2,
    B3: METHODS.B3,
    B4: METHODS.B4,
    rep1_cautious: { label: 'rep-1 (Batch 6), cautious', kind: 'rep-1', paramsHash: paramsHash(REP1_PARAMS), score: engine(REP1_PARAMS, 'cautious') },
    rep1_expected: { label: 'rep-1 (Batch 6), expected', kind: 'rep-1', paramsHash: paramsHash(REP1_PARAMS), score: engine(REP1_PARAMS, 'expected') },
    rep2_expected: { label: 'rep-2, expected (ranking number)', kind: 'rep-2', paramsHash: paramsHash(params), score: engine(params, 'expected') },
    rep2_cautious: { label: 'rep-2, cautious', kind: 'rep-2', paramsHash: paramsHash(params), score: engine(params, 'cautious') },
  };
}

// Scores of every worker by every method. ctx.meanStars: the mean of ALL reviews in the run
// (the system cannot tell fake reviews from real ones).
// ctx.platform: { count, meanEvidence } over ALL reviews of the run (rep-2's platform prior).
export function scoreAll(workers, methodNames = Object.keys(METHODS), table = METHODS) {
  const all = workers.flatMap((w) => w.reviews);
  const ctx = {
    meanStars: all.length ? all.reduce((s, r) => s + r.stars, 0) / all.length : 3,
    platform: { count: all.length, meanEvidence: all.length ? all.reduce((s, r) => s + (r.stars - 1) / 4, 0) / all.length : null },
  };
  return Object.fromEntries(methodNames.map((name) => [name, workers.map((w) => table[name].score(w.reviews, ctx))]));
}

// A method built from other engine parameters (used by explore.js only).
export const engineMethod = (label, params, field = 'cautious') => ({ label, kind: 'exploration', score: engine(params, field) });
