// The weighted Beta reputation model (Module 4, decisions D-043 to D-045). PURE FUNCTION: no
// database, no clock (`now` is passed in), no randomness. The live API, the snapshot builder, the
// sensitivity script and the simulation (evaluation/reputation) all import THIS file.
//
// Step 1, stars to evidence (graded feedback, Josang & Ismail 2002, section 2.7): p = (stars - 1) / 4.
//   A review adds w * p to the positive evidence r and w * (1 - p) to the negative evidence s.
// Step 2, the weight w = provenance * recency * reviewerTrust * pairFactor (each between 0 and 1):
//   provenance    completion by both or by an admin 1.0, auto-completed 0.6
//   recency       0.5 ^ (ageDays / 365)
//   reviewerTrust 0.5 + 0.5 * min(n, 3) / 3, n = other workers this customer finished a job with.
//                 It uses the customer's history NOW, so an old review counts more once its author
//                 has hired other workers (intended, docs/modules/MODULE-4.md).
//   pairFactor    the k-th review from the same customer for this worker gets 1 / k
// Step 3, the Beta numbers (beta.js) and `depth` (how much evidence there is).
// All numbers marked provisional live in config/reputationParams.js.
import { DEFAULT_REPUTATION_PARAMS } from '../../config/reputationParams.js';
import { ageInDays, betaNumbers, depthFrom, recencyWeight, requireNow } from './beta.js';

export const QUICK_ANSWERS = Object.freeze(['onTime', 'workQuality', 'polite', 'priceAsAgreed']);
// A factor below this counts as "less than fully" in the explanation.
const FULL = 0.99;
const ONE_YEAR_DAYS = 365;
const MONTH_DAYS = 30;

export const reviewerTrustFor = (n, { trustFloor, trustCap }) => {
  const count = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  return trustFloor + (1 - trustFloor) * (Math.min(count, trustCap) / trustCap);
};

export const starsToEvidence = (stars) => (stars - 1) / 4;

// Reviews from the same customer, oldest first; ties by id so the result never depends on input order.
const byTimeThenId = (a, b) => new Date(a.createdAt) - new Date(b.createdAt) || String(a.id).localeCompare(String(b.id));

function checkStars(stars) {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new Error('stars must be a whole number from 1 to 5');
}

// One review's weight, its four factors and the reasons in plain codes.
export function reviewWeight(review, k, now, params) {
  const use = params.factors;
  const ageDays = ageInDays(review.createdAt, now);
  const factors = {
    provenance: use.provenance ? (params.provenance[review.completionMethod] ?? params.provenance.auto) : 1,
    recency: use.recency ? recencyWeight(ageDays, params.halfLifeDays) : 1,
    reviewerTrust: use.reviewerTrust ? reviewerTrustFor(review.reviewerOtherWorkers, params) : 1,
    pairFactor: use.pairFactor ? 1 / k : 1,
  };
  const weight = factors.provenance * factors.recency * factors.reviewerTrust * factors.pairFactor;
  const reasons = [];
  if (factors.provenance < FULL) reasons.push('auto_completed');
  if (factors.recency < FULL) reasons.push(ageDays >= ONE_YEAR_DAYS ? 'older_than_a_year' : ageDays >= MONTH_DAYS ? 'months_old' : 'weeks_old');
  if (factors.reviewerTrust < FULL) reasons.push('new_reviewer');
  if (factors.pairFactor < FULL) reasons.push('repeat_reviewer');
  if (reasons.length === 0) reasons.push('counted_fully');
  return { weight, factors, reasons, ageDays };
}

const emptyDistribution = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

/**
 * reviews: [{ id, customerId, stars, createdAt, completionMethod, reviewerOtherWorkers, hidden,
 *             onTime?, workQuality?, polite?, priceAsAgreed?, wouldHireAgain? ('yes' | 'no') }]
 * Returns the Beta numbers, depth, the raw facts for display and `perReview` (the explanation).
 */
export function computeReputation(reviews = [], { now, params = DEFAULT_REPUTATION_PARAMS } = {}) {
  requireNow(now);
  const visible = reviews.filter((rv) => !rv.hidden);
  visible.forEach((rv) => checkStars(rv.stars));
  const ordered = [...visible].sort(byTimeThenId);

  const seen = new Map(); // customerId -> how many reviews so far
  let r = 0;
  let s = 0;
  const perReview = [];
  for (const review of ordered) {
    const key = String(review.customerId);
    const k = (seen.get(key) ?? 0) + 1;
    seen.set(key, k);
    const { weight, factors, reasons, ageDays } = reviewWeight(review, k, now, params);
    const p = starsToEvidence(review.stars);
    r += weight * p;
    s += weight * (1 - p);
    perReview.push({ id: review.id, stars: review.stars, createdAt: review.createdAt, ageDays, weight, factors, reasons });
  }

  const numbers = betaNumbers(r, s, params);
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
    depth: depthFrom(numbers.uncertainty, visible.length > 0, params.depthThresholds),
    ratingAverage: visible.length ? starSum / visible.length : null,
    reviewCount: visible.length,
    distribution,
    quick,
    wouldHireAgain,
    perReview,
  };
}
