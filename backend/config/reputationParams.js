// Module 4: parameters of the reputation and reliability engines (Batch 6, decisions D-043 to D-046;
// Batch 6B, rep-2: decisions D-061 to D-065).
//
// PROVISIONAL: every number here is a DESIGN PARAMETER that the evaluation tests
// (`npm run evaluate:reputation`, `npm run reputation:sensitivity`). None of them is a measured fact.
// Changing one changes the parameter hash stored with every snapshot, so old and new snapshots can
// be told apart.
//
// Two parameter sets live here:
//   rep-1  the Batch 6 engine, UNCHANGED (its hash stays 23974876a27d, so the Batch 6 results still match);
//          it stays in the evaluation as a method.
//   rep-2  the Batch 6B engine: five changes that follow from the Batch 6 simulation (docs/modules/MODULE-4.md
//          section 5.4). Its two open values (the new-reviewer budget B and the burst check) are chosen by the
//          pre-registered selection on the development seeds and then frozen in REP2_SELECTED.
// LIVE_ENGINE says which set the website uses. DEFAULT_REPUTATION_PARAMS is that set.
import { createHash } from 'node:crypto';

export const REP1_PARAMS = Object.freeze({
  // Beta prior (Josang & Ismail 2002): weight W and base rate a. With W = 2 and a = 0.5,
  // expected = (r + 1) / (r + s + 2), the mean of Beta(r + 1, s + 1).
  priorWeight: 2,
  baseRate: 0.5,

  // provenance: how the job's completion was confirmed.
  provenance: Object.freeze({ both: 1.0, admin: 1.0, auto: 0.6 }),

  // recency: 0.5 ^ (ageDays / halfLifeDays) (the paper's forgetting factor).
  halfLifeDays: 365,

  // reviewerTrust: trustFloor + (1 - trustFloor) * min(n, trustCap) / trustCap,
  // n = other workers this customer has a completed booking with.
  trustFloor: 0.5,
  trustCap: 3,

  // cautious = max(0, expected - cautiousZ * sd); 1.2816 is the 10th percentile of the normal
  // distribution (a normal approximation of the Beta's lower 10% point).
  cautiousZ: 1.2816,

  // depth from uncertainty: > few -> "few"; <= many -> "many"; otherwise "some".
  depthThresholds: Object.freeze({ few: 0.4, many: 0.2 }),

  // Which weight factors are used. All on in production; the evaluation switches one off at a time
  // (ablations). The live API never changes these.
  factors: Object.freeze({ provenance: true, recency: true, reviewerTrust: true, pairFactor: true }),

  // Reliability: evidence per booking outcome (Section 4.4 of the Batch 6 plan).
  reliabilityPositive: Object.freeze({ completed: 1 }),
  reliabilityNegative: Object.freeze({ cancelled_by_worker_early: 0.5, cancelled_by_worker_late: 1, worker_no_show: 1 }),
});

// rep-2 change 3: a review is a "burst" review when at least `minOthers` OTHER reviews of the same worker
// have a date in the `windowDays` days before it (the same moment counts as before); it counts `weight`.
export const BURST_RULE = Object.freeze({ windowDays: 14, minOthers: 3, weight: 0.5 });

// The rep-2 parameter set for one candidate (newReviewerBudget = B in {1, 2, 3}, burst on or off).
export function rep2Params({ newReviewerBudget, burst }) {
  if (![1, 2, 3].includes(newReviewerBudget) || typeof burst !== 'boolean') throw new Error('rep-2 needs newReviewerBudget 1, 2 or 3 and burst true or false');
  return Object.freeze({
    engineVersion: 'rep-2',
    priorWeight: 2,
    // a = 0.5 only while the platform has fewer than platformPrior.minReviews visible reviews (change 4)
    baseRate: 0.5,
    // change 4: the base rate is the platform's plain mean of p = (stars - 1) / 4, clamped to [min, max]
    platformPrior: Object.freeze({ minReviews: 20, min: 0.2, max: 0.9 }),
    provenance: REP1_PARAMS.provenance,
    // change 1: recency off (null = every review weighs 1); the code stays, so a pilot can switch it on
    halfLifeDays: null,
    // change 2: reviews from customers with no completed job with any OTHER worker count fully, but all of
    // them together at most B reviews' worth (replaces the reviewer-trust floor and ramp)
    newReviewerBudget,
    // change 3 (a candidate): many reviews in a few days count less
    burst: burst ? BURST_RULE : null,
    // change 5: the number used for ordering ("Best track record") is `expected`
    rankBy: 'expected',
    cautiousZ: REP1_PARAMS.cautiousZ,
    depthThresholds: REP1_PARAMS.depthThresholds,
    factors: Object.freeze({ provenance: true, recency: true, reviewerTrust: false, pairFactor: true, newReviewerBudget: true, burst: true }),
    // Reliability keeps rep-1's behaviour (Batch 6B decision): booking outcomes still fade with a
    // one-year half-life; rep-2's changes are about reviews.
    reliabilityHalfLifeDays: 365,
    reliabilityPositive: REP1_PARAMS.reliabilityPositive,
    reliabilityNegative: REP1_PARAMS.reliabilityNegative,
  });
}

// The six pre-registered candidates (BATCH_6B section 5.4), in the tie-break order: smaller B first, then burst off.
export const REP2_CANDIDATES = Object.freeze([1, 2, 3].flatMap((B) => [false, true].map((burst) => Object.freeze({
  id: `B${B}-burst-${burst ? 'on' : 'off'}`,
  newReviewerBudget: B,
  burst,
}))));

// FROZEN by the pre-registered selection on the development seeds (see MODULE-4.md section 5.4).
// null until then: no rep-2 set exists before the selection.
export const REP2_SELECTED = null;
export const REP2_PARAMS = REP2_SELECTED ? rep2Params(REP2_SELECTED) : null;

export const PARAM_SETS = Object.freeze({ 'rep-1': REP1_PARAMS, ...(REP2_PARAMS ? { 'rep-2': REP2_PARAMS } : {}) });

// Which engine the website uses (decided by the success criteria S1 and S3 on the test seeds).
export const LIVE_ENGINE = 'rep-1';
export const DEFAULT_REPUTATION_PARAMS = PARAM_SETS[LIVE_ENGINE];
// Kept under its old name: the version of the live engine.
export const REPUTATION_ENGINE_VERSION = LIVE_ENGINE;

// The engine version a parameter set belongs to (rep-1's set has no version field, so its hash never changed).
export const engineVersionOf = (params) => params?.engineVersion ?? 'rep-1';
// The number used for ordering: rep-1 the cautious score, rep-2 the expected value.
export const rankFieldOf = (params) => params?.rankBy ?? 'cautious';

const NESTED = ['provenance', 'depthThresholds', 'factors', 'reliabilityPositive', 'reliabilityNegative', 'platformPrior', 'burst'];

// A copy of a parameter set with some values changed (deep for the nested groups). Used by the
// sensitivity script and the evaluation, never by the live API. `burst: null` switches the burst check off.
export function withParams(changes = {}, base = DEFAULT_REPUTATION_PARAMS) {
  const merged = { ...base, ...changes };
  for (const key of NESTED) {
    if (!(key in base) && !(key in changes)) continue; // never add a key the set does not have (the hash)
    if (changes[key] === null) merged[key] = null;
    else if (changes[key] === undefined) merged[key] = base[key] === null ? null : { ...base[key] };
    else merged[key] = { ...(base[key] || {}), ...changes[key] };
  }
  return merged;
}

// JSON with sorted keys, so the same parameters always give the same hash.
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

// First 12 hex characters of SHA-256 of the parameters (with the engine version).
export function paramsHash(params = DEFAULT_REPUTATION_PARAMS) {
  return createHash('sha256').update(`${engineVersionOf(params)}|${canonical(params)}`).digest('hex').slice(0, 12);
}
