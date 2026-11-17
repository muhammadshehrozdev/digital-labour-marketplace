// The weighted Beta reputation model (Module 4, decisions D-043 to D-045; rep-2: D-061 to D-065). PURE
// FUNCTION: no database, no clock (`now` is passed in), no randomness. The live API, the snapshot builder,
// the sensitivity script and the simulation (evaluation/reputation) all import THIS file.
//
// Step 1, stars to evidence (graded feedback, Josang & Ismail 2002, section 2.7): p = (stars - 1) / 4.
//   A review adds w * p to the positive evidence r and w * (1 - p) to the negative evidence s.
// Step 2, the weight w (each factor between 0 and 1). rep-1 (Batch 6):
//   provenance    completion by both or by an admin 1.0, auto-completed 0.6
//   recency       0.5 ^ (ageDays / 365)
//   reviewerTrust 0.5 + 0.5 * min(n, 3) / 3, n = other workers this customer finished a job with.
//                 It uses the customer's history NOW, so an old review counts more once its author
//                 has hired other workers (intended, docs/modules/MODULE-4.md).
//   pairFactor    the k-th review from the same customer for this worker gets 1 / k
// rep-2 (Batch 6B) keeps provenance and pairFactor and changes the rest:
//   recency       off (halfLifeDays: null, every review 1)
//   burst         (if on) a review with 3 or more other reviews of this worker in the 14 days before it: 0.5
//   budget        reviews from NEW reviewers (n = 0) count fully, but together at most B reviews' worth:
//                 with m = the sum of their weights so far, each is multiplied by min(1, B / m)
//   base rate a   the platform's mean of p, clamped to [0.2, 0.9] (0.5 below 20 platform reviews),
//                 passed in as `baseRate` (platformBaseRate below), never read from a database here
// Step 3, the Beta numbers (beta.js) and `depth` (how much evidence there is). `rank` is the number used
// for ordering: rep-1 `cautious`, rep-2 `expected`.
// All numbers marked provisional live in config/reputationParams.js.
import { DEFAULT_REPUTATION_PARAMS, rankFieldOf } from '../../config/reputationParams.js';
import { DAY_MS, ageInDays, betaNumbers, depthFrom, recencyWeight, requireNow } from './beta.js';

export const QUICK_ANSWERS = Object.freeze(['onTime', 'workQuality', 'polite', 'priceAsAgreed']);
// A factor below this counts as "less than fully" in the explanation.
const FULL = 0.99;
const ONE_YEAR_DAYS = 365;
const MONTH_DAYS = 30;

// n as a whole number >= 0 (anything else counts as 0: a new reviewer)
const otherWorkers = (n) => (Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);

export const reviewerTrustFor = (n, { trustFloor, trustCap }) => {
  if (!(trustCap > 0) || !Number.isFinite(trustFloor)) return 1; // a set without the ramp (rep-2)
  return trustFloor + (1 - trustFloor) * (Math.min(otherWorkers(n), trustCap) / trustCap);
};

// rep-2, change 4: the base rate from the platform's visible reviews. platform = { count, meanEvidence },
// meanEvidence = the plain mean of p = (stars - 1) / 4 over every visible review on the platform.
// rep-1 (no platformPrior) always uses its fixed base rate.
export function clampBaseRate(a, params) {
  const { min, max } = params.platformPrior;
  return Math.min(max, Math.max(min, a));
}
export function platformBaseRate(platform, params = DEFAULT_REPUTATION_PARAMS) {
  if (!params.platformPrior) return params.baseRate;
  const count = platform?.count ?? 0;
  const mean = platform?.meanEvidence;
  if (!(count >= params.platformPrior.minReviews) || !Number.isFinite(mean)) return params.baseRate;
  return clampBaseRate(mean, params);
}
// The base rate the engine uses: a passed-in platform base rate (clamped) for rep-2, else the fixed one.
function resolveBaseRate(params, baseRate) {
  if (!params.platformPrior || baseRate === undefined || baseRate === null) return params.baseRate;
  if (!Number.isFinite(baseRate)) throw new Error('baseRate must be a number');
  return clampBaseRate(baseRate, params);
}

// rep-2, change 3: the ids of burst reviews. A review is one when at least `minOthers` OTHER visible
// reviews of the worker have a date in the `windowDays` days before it (the same moment counts as before).
// Depends only on the dates, so the order of the input never matters.
export function burstReviewIds(reviews, { windowDays, minOthers }) {
  const times = reviews.map((rv) => new Date(rv.createdAt).getTime());
  const window = windowDays * DAY_MS;
  const ids = new Set();
  reviews.forEach((rv, i) => {
    let others = 0;
    for (let j = 0; j < times.length; j += 1) if (j !== i && times[j] <= times[i] && times[j] >= times[i] - window) others += 1;
    if (others >= minOthers) ids.add(rv.id);
  });
  return ids;
}

export const starsToEvidence = (stars) => (stars - 1) / 4;

// Reviews from the same customer, oldest first; ties by id so the result never depends on input order.
const byTimeThenId = (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a.id).localeCompare(String(b.id));

function checkStars(stars) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error('stars must be a whole number from 1 to 5');
}

// The reasons in plain codes, from the final factors.
function reasonsFor(factors, ageDays) {
  const reasons = [];
  if (factors.provenance < FULL) reasons.push('auto_completed');
  if (factors.recency < FULL) reasons.push(ageDays >= ONE_YEAR_DAYS ? 'older_than_a_year' : ageDays >= MONTH_DAYS ? 'months_old' : 'weeks_old');
  if (factors.reviewerTrust < FULL) reasons.push('new_reviewer');
  if (factors.newReviewerBudget !== undefined && factors.newReviewerBudget < FULL) reasons.push('new_reviewer_budget');
  if (factors.burst !== undefined && factors.burst < FULL) reasons.push('burst');
  if (factors.pairFactor < FULL) reasons.push('repeat_reviewer');
  if (reasons.length === 0) reasons.push('counted_fully');
  return reasons;
}

// One review's weight before the new-reviewer budget, its factors and the reasons in plain codes.
// rep-1 has four factors; rep-2 adds `burst` when the burst check is on (the budget is applied by
// computeReputation, which sees all reviews).
export function reviewWeight(review, k, now, params, { burst = false } = {}) {
  const use = params.factors;
  const ageDays = ageInDays(review.createdAt, now);
  const factors = {
    provenance: use.provenance ? (params.provenance[review.completionMethod] ?? params.provenance.auto) : 1,
    recency: use.recency && params.halfLifeDays ? recencyWeight(ageDays, params.halfLifeDays) : 1,
    reviewerTrust: use.reviewerTrust ? reviewerTrustFor(review.reviewerOtherWorkers, params) : 1,
    pairFactor: use.pairFactor ? 1 / k : 1,
  };
  if (params.burst && use.burst !== false) factors.burst = burst ? params.burst.weight : 1;
  const weight = Object.values(factors).reduce((w, f) => w * f, 1);
  return { weight, factors, reasons: reasonsFor(factors, ageDays), ageDays };
}

// rep-2, change 2: B, or null when the set has no budget (rep-1) or it is switched off (ablation).
const budgetOf = (params) => (Number.isFinite(params.newReviewerBudget) && params.factors.newReviewerBudget !== false ? params.newReviewerBudget : null);

const emptyDistribution = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

/**
 * reviews: [{ id, customerId, stars, createdAt, completionMethod, reviewerOtherWorkers, hidden,
 *             onTime?, workQuality?, polite?, priceAsAgreed?, wouldHireAgain? ('yes' | 'no') }]
 * baseRate (rep-2 only): the platform base rate (platformBaseRate); clamped; ignored by rep-1.
 * Returns the Beta numbers, `rank`, the base rate used, depth, the raw facts for display and `perReview`
 * (the explanation).
 */
export function computeReputation(reviews = [], { now, params = DEFAULT_REPUTATION_PARAMS, baseRate } = {}) {
  requireNow(now);
  const visible = reviews.filter((rv) => !rv.hidden);
  visible.forEach((rv) => checkStars(rv.stars));
  const ordered = [...visible].sort(byTimeThenId);
  const a = resolveBaseRate(params, baseRate);
  const bursts = params.burst && params.factors.burst !== false ? burstReviewIds(ordered, params.burst) : null;

  // pass 1: every factor except the budget
  const seen = new Map(); // customerId -> how many reviews so far
  const items = ordered.map((review) => {
    const key = String(review.customerId);
    const k = (seen.get(key) ?? 0) + 1;
    seen.set(key, k);
    return { review, ...reviewWeight(review, k, now, params, { burst: bursts?.has(review.id) ?? false }) };
  });

  // pass 2 (rep-2): the new reviewers together count at most B reviews' worth
  const B = budgetOf(params);
  if (B !== null) {
    const newOnes = items.filter((it) => otherWorkers(it.review.reviewerOtherWorkers) === 0);
    const m = newOnes.reduce((sum, it) => sum + it.weight, 0);
    const scale = m > B ? B / m : 1;
    for (const it of items) it.factors.newReviewerBudget = 1;
    for (const it of newOnes) {
      it.factors.newReviewerBudget = scale;
      it.weight *= scale;
      it.reasons = reasonsFor(it.factors, it.ageDays);
    }
  }

  let r = 0;
  let s = 0;
  const perReview = [];
  for (const { review, weight, factors, reasons, ageDays } of items) {
    const p = starsToEvidence(review.stars);
    r += weight * p;
    s += weight * (1 - p);
    perReview.push({ id: review.id, stars: review.stars, createdAt: review.createdAt, ageDays, weight, factors, reasons });
  }

  const numbers = betaNumbers(r, s, { ...params, baseRate: a });
  const distribution = emptyDistribution();
  const quick = Object.fromEntries(QUICK_ANSWERS.map((q) => [q, { yes: 0, total: 0 }]));
  const wouldHireAgain = { yes: 0, total: 0 };
  let starSum = 0;
  for (const review of visible) {
    distribution[review.stars] += 1;
    starSum += review.stars;
    for (const q of QUICK_ANSWERS) {
      if (review[q] === 'yes' || review[q] === 'no') {
        quick[q].total += 1;
        if (review[q] === 'yes') quick[q].yes += 1;
      }
    }
    if (review.wouldHireAgain === 'yes' || review.wouldHireAgain === 'no') {
      wouldHireAgain.total += 1;
      if (review.wouldHireAgain === 'yes') wouldHireAgain.yes += 1;
    }
  }

  return {
    ...numbers,
    rank: numbers[rankFieldOf(params)],
    baseRate: a,
    depth: depthFrom(numbers.uncertainty, visible.length > 0, params.depthThresholds),
    ratingAverage: visible.length ? starSum / visible.length : null,
    reviewCount: visible.length,
    distribution,
    quick,
    wouldHireAgain,
    perReview,
  };
}
