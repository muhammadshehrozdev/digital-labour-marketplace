// Settings of the Module 4 simulation (evaluation/reputation). Every value is documented in README.md.
// These are ASSUMPTIONS of a simulation, chosen to copy the sparse data we expect; they are not
// measurements of the real marketplace.

// A fixed "today" for every simulated run, so the same seed always gives the same output.
export const SIM_NOW = new Date('2026-01-01T00:00:00Z');
export const DAY_MS = 24 * 60 * 60 * 1000;

export const SIMULATION = Object.freeze({
  workers: 300,
  // hidden true quality q ~ Beta(4, 2), mean about 0.67
  qualityAlpha: 4,
  qualityBeta: 2,
  // 30% of workers have no reviews; the others have 1 + Geometric(mean 3) reviews (mean 4), at most 60
  shareWithoutReviews: 0.3,
  reviewsMean: 4,
  reviewsCap: 60,
  // a genuine review's stars: clamp(round(1 + 4 * clip(q + L + noise, 0, 1)), 1, 5), noise ~ Normal(0, 0.15)
  noiseSd: 0.15,
  // review ages: uniform over the last 24 months
  maxAgeDays: 730,
  // a genuine reviewer has hired Geometric(mean 1.5) other workers
  reviewerOtherWorkersMean: 1.5,
  // 90% of genuine jobs were confirmed by both people, 10% were auto-completed
  shareAuto: 0.1,
  // attacks: fake reviews are recent (uniform over the last 30 days); collusion reviews the last 60 days
  fakeMaxAgeDays: 30,
  collusionMaxAgeDays: 60,
});

// One scenario = changes to the base world. Names with a k are the three attack sizes of the plan.
const sybil = (k, smart = false) => ({ sybil: { share: 0.1, fromLowerHalf: true, k, smart } });
export const SCENARIOS = Object.freeze({
  base: { description: 'Sparse data, no inflation, no attacks' },
  inflation: { description: 'Every rater is more lenient: L = +0.15', leniency: 0.15 },
  sybil_k3: { description: '10% of lower-half workers get 3 fake 5 star reviews from fresh accounts', ...sybil(3) },
  sybil_k5: { description: '10% of lower-half workers get 5 fake 5 star reviews from fresh accounts', ...sybil(5) },
  sybil_k10: { description: '10% of lower-half workers get 10 fake 5 star reviews from fresh accounts', ...sybil(10) },
  smart_sybil_k3: { description: 'As sybil_k3, but each fake account first completed jobs with 1 to 3 other workers', ...sybil(3, true) },
  smart_sybil_k5: { description: 'As sybil_k5, but each fake account first completed jobs with 1 to 3 other workers', ...sybil(5, true) },
  smart_sybil_k10: { description: 'As sybil_k10, but each fake account first completed jobs with 1 to 3 other workers', ...sybil(10, true) },
  pair_collusion: { description: '5% of workers get 4 extra 5 star reviews from one repeat customer', collusion: { share: 0.05, extra: 4 } },
  quality_change: { description: '20% of workers lost 0.3 of quality twelve months ago; older reviews reflect the old quality', qualityChange: { share: 0.2, drop: 0.3, daysAgo: 365 } },
  combined: {
    description: 'inflation + sybil (k = 5) + pair_collusion + quality_change',
    leniency: 0.15,
    ...sybil(5),
    collusion: { share: 0.05, extra: 4 },
    qualityChange: { share: 0.2, drop: 0.3, daysAgo: 365 },
  },
  // Batch 6B: three scenarios that test the limits of rep-2's new defences (added BEFORE any rep-2 selection)
  slow_sybil: { description: 'As sybil_k5, but the five fake reviews are spread evenly over the last 12 months (no burst)', sybil: { share: 0.1, fromLowerHalf: true, k: 5, smart: false, spreadDays: 365 } },
  busy_genuine: { description: '10% of workers (any quality) get 8 extra GENUINE reviews in the last 14 days (the cost of the burst check)', busy: { share: 0.1, extra: 8, maxAgeDays: 14 } },
  new_platform: { description: '80% of genuine reviewers have no other hiring history (the cost of the new-reviewer budget on a young platform)', newPlatform: { shareNoHistory: 0.8 } },
  // the noise variants: the star noise of base (sd 0.15) raised to 0.3 and 0.5
  base_noise30: { description: 'base with star noise sd 0.3', noiseSd: 0.3 },
  base_noise50: { description: 'base with star noise sd 0.5', noiseSd: 0.5 },
  sybil_k5_noise30: { description: 'sybil_k5 with star noise sd 0.3', ...sybil(5), noiseSd: 0.3 },
  sybil_k5_noise50: { description: 'sybil_k5 with star noise sd 0.5', ...sybil(5), noiseSd: 0.5 },
});

// Short names on the command line: "sybil" runs k = 3, 5 and 10.
export const SCENARIO_GROUPS = Object.freeze({
  sybil: ['sybil_k3', 'sybil_k5', 'sybil_k10'],
  smart_sybil: ['smart_sybil_k3', 'smart_sybil_k5', 'smart_sybil_k10'],
  noise: ['base_noise30', 'base_noise50', 'sybil_k5_noise30', 'sybil_k5_noise50'],
  all: Object.keys(SCENARIOS),
});

export function scenarioNames(arg) {
  if (SCENARIO_GROUPS[arg]) return SCENARIO_GROUPS[arg];
  if (SCENARIOS[arg]) return [arg];
  throw new Error(`Unknown scenario "${arg}". Use one of: ${[...Object.keys(SCENARIO_GROUPS), ...Object.keys(SCENARIOS)].join(', ')}`);
}

export const SEED_BASE = 20261116; // seed i of a run is SEED_BASE + i

// Batch 6B, the pre-registered rep-2 protocol (README.md, "rep-2 protocol"). Written down before any run:
//   development seeds 20261116..20261145 (already seen in Batch 6): the rep-2 selection only
//   test seeds        20270101..20270130 (never used before): ONE run after the rep-2 parameters are frozen
export const PROTOCOL_SEEDS = 30;
export const DEV_SEED_BASE = 20261116;
export const TEST_SEED_BASE = 20270101;
// The selection rule's scenarios (base-world condition + the mean NDCG@10 over these five attacks)
export const SELECTION_ATTACKS = Object.freeze(['sybil_k3', 'sybil_k5', 'sybil_k10', 'pair_collusion', 'combined']);
