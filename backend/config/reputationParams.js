// Module 4: parameters of the reputation and reliability engines (Batch 6, decisions D-043 to D-046).
//
// PROVISIONAL: every number here is a DESIGN PARAMETER that the evaluation tests
// (`npm run evaluate:reputation`, `npm run reputation:sensitivity`). None of them is a measured fact.
// Changing one changes the parameter hash stored with every snapshot, so old and new snapshots can
// be told apart.
import { createHash } from 'node:crypto';

// Bump when the formulas change (not when only a parameter changes: that is what the hash is for).
export const REPUTATION_ENGINE_VERSION = 'rep-1';

export const DEFAULT_REPUTATION_PARAMS = Object.freeze({
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

// A copy of the defaults with some values changed (deep for the nested groups). Used by the
// sensitivity script and the evaluation, never by the live API.
export function withParams(changes = {}) {
  const base = DEFAULT_REPUTATION_PARAMS;
  const merged = { ...base, ...changes };
  for (const key of ['provenance', 'depthThresholds', 'factors', 'reliabilityPositive', 'reliabilityNegative']) {
    merged[key] = { ...base[key], ...(changes[key] || {}) };
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
  return createHash('sha256').update(`${REPUTATION_ENGINE_VERSION}|${canonical(params)}`).digest('hex').slice(0, 12);
}
