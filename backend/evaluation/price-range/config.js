// Settings of the Module 5 price-range simulation (Batch 7, §8). Every value is an ASSUMPTION of the
// simulated world (README.md), not a fact about real prices. The production rules come from
// config/wageRules.js (imported by the production priceRange, unchanged).

export const SIM_NOW = new Date('2026-11-19T00:00:00Z'); // fixed, so a seed always gives the same world
export const DAY_MS = 24 * 60 * 60 * 1000;
export const SEED_BASE = 20261119; // seed i of a run is SEED_BASE + i

export const SIMULATION = Object.freeze({
  markets: 40, // one skill in one city, unit `job`
  trueMin: 1000, // the hidden true typical price m ~ Uniform(1000, 6000)
  trueMax: 6000,
  sigma: 0.35, // a genuine agreed price is round(m x exp(e)), e ~ Normal(0, 0.35)
  meanJobs: 8, // completed jobs per market: geometric with this mean
  workersMin: 2, // workers per market: 2 to 10
  workersMax: 10,
  repeatPairShare: 0.15, // share of jobs that repeat an earlier customer-worker pair
  autoShare: 0.1, // completed `auto` (one side only): the production rule excludes them
  proposedOnlyShare: 0.2, // only a proposed price, never agreed: the production rule excludes them
  holdout: 20, // genuine prices kept aside per market, only to measure coverage
  maxAgeDays: 330, // job ages uniform over the last 330 days (inside the 365-day window)
});

export const SCENARIOS = Object.freeze({
  base: Object.freeze({ description: 'as described in the README', meanJobs: SIMULATION.meanJobs, attack: null }),
  sparse: Object.freeze({ description: 'a young platform: mean 3 jobs per market', meanJobs: 3, attack: null }),
  inflator: Object.freeze({
    description: 'in 30% of markets one worker adds 4 jobs at 2.5 x m with 2 fake customer accounts (both-confirmed, recent)',
    meanJobs: SIMULATION.meanJobs,
    attack: Object.freeze({ type: 'inflator', share: 0.3, jobs: 4, factor: 2.5, fakeCustomers: 2, maxAgeDays: 14 }),
  }),
  pair_flood: Object.freeze({
    description: 'in 30% of markets one customer-worker pair adds 6 jobs at 2 x m',
    meanJobs: SIMULATION.meanJobs,
    attack: Object.freeze({ type: 'pair_flood', share: 0.3, jobs: 6, factor: 2, maxAgeDays: 14 }),
  }),
});

export function scenarioNames(arg) {
  if (arg === 'all') return Object.keys(SCENARIOS);
  if (!SCENARIOS[arg]) throw new Error(`Unknown scenario "${arg}". Use one of: ${Object.keys(SCENARIOS).join(', ')}, all`);
  return [arg];
}
