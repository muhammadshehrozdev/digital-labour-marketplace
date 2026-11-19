// The platform price range (Module 5, decisions D-070 and D-071). PURE: no database, no clock (`now` is
// passed in), no randomness. The live API (GET /api/prices/estimate) and the simulator
// (evaluation/price-range) import THIS file.
//
// Which jobs count (the controller loads them with one query; this file filters again, so the rule is tested):
//   - completed, and completed by BOTH people or by an admin decision (not `auto`: one side only);
//   - with agreed terms (`agreed`: the amount both people confirmed) in the same unit; the per-unit amount;
//   - completed within the last PRICE_WINDOW_DAYS (prices rise every year);
//   - ONE job per customer-worker pair (the most recent): ten jobs between two friends are one opinion.
// Levels: the skill in the city, the region, Pakistan; for `day` and `hour` only, then the trade category in
// the city, the region, Pakistan (a day of electrical work is comparable across electrical skills, a whole
// job is not). The first level with at least MIN_JOBS jobs, MIN_WORKERS workers and MIN_CUSTOMERS customers
// wins. Numbers: the 25th percentile, the median and the 75th percentile (Hyndman & Fan 1996, definition 7,
// the default of R and of QUARTILE.INC), each rounded to the nearest ROUND_TO rupees, halves up. The median,
// not the mean: one extreme price cannot move it far (breakdown point 50%, Hampel 1971).
// Output: aggregates only. Never a list of prices, a booking id, a name or a worker id.
import { WAGE_RULES } from '../../config/wageRules.js';
import { COUNTRY, marketCity } from '../../config/regions.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const LEVELS = Object.freeze(['city', 'region', 'country']);
// a range in these units may fall back to the whole trade category
export const CATEGORY_UNITS = Object.freeze(['day', 'hour']);

// Sample quantile, Hyndman & Fan definition 7: sorted x[0..n-1], h = (n - 1) p, j = floor(h),
// Q(p) = x[j] + (h - j)(x[j+1] - x[j]); x[n-1] when j = n - 1.
export function quantile(sorted, p) {
  const n = sorted.length;
  if (n === 0) return null;
  const h = (n - 1) * p;
  const j = Math.floor(h);
  if (j >= n - 1) return sorted[n - 1];
  return sorted[j] + (h - j) * (sorted[j + 1] - sorted[j]);
}

// Nearest `step`, halves up (1725 -> 1750 for step 50). The epsilon keeps a stored 34.4999999 at 34.5.
export const roundTo = (x, step) => Math.floor(x / step + 0.5 + 1e-9) * step;

// The three numbers before rounding (used by the property tests: scaling every amount scales these).
export function summarize(amounts) {
  const sorted = [...amounts].sort((a, b) => a - b);
  return { q25: quantile(sorted, 0.25), q50: quantile(sorted, 0.5), q75: quantile(sorted, 0.75), n: sorted.length };
}

const id = (value) => String(value ?? '');

// The jobs that may count at all (status, completion method, agreed terms in this unit, the time window).
export function qualifyingJobs(jobs, { unit, now, params = WAGE_RULES }) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('pass `now` as a valid Date (the engine never reads the clock)');
  const from = now.getTime() - params.PRICE_WINDOW_DAYS * DAY_MS;
  return jobs.filter((j) => {
    if (j.status !== 'completed' || !['both', 'admin'].includes(j.completionMethod)) return false;
    if (!j.agreed || j.agreed.unit !== unit || !Number.isFinite(j.agreed.amount) || j.agreed.amount <= 0) return false;
    const at = new Date(j.completedAt).getTime();
    return Number.isFinite(at) && at >= from && at <= now.getTime();
  });
}

// One job per customer-worker pair: the most recent (ties: the larger booking id, so the order of the input
// never matters).
export function onePerPair(jobs) {
  const latest = new Map();
  for (const j of jobs) {
    const key = `${id(j.customerId)}|${id(j.workerId)}`;
    const seen = latest.get(key);
    const at = new Date(j.completedAt).getTime();
    const seenAt = seen ? new Date(seen.completedAt).getTime() : -Infinity;
    if (!seen || at > seenAt || (at === seenAt && id(j.bookingId) > id(seen.bookingId))) latest.set(key, j);
  }
  return [...latest.values()];
}

// The levels to try for a query, in order: [{ level, scope, match(job) }].
export function levelsFor({ skillId, category, unit, city, region }) {
  const cityKey = city ? marketCity(city) : null;
  const where = {
    city: (j) => Boolean(cityKey) && marketCity(j.city) === cityKey,
    region: (j) => Boolean(region) && region !== COUNTRY && j.region === region,
    country: () => true,
  };
  const out = [];
  if (skillId) for (const level of LEVELS) out.push({ level, scope: 'skill', match: (j) => j.skillId === skillId && where[level](j) });
  if (category && CATEGORY_UNITS.includes(unit)) {
    for (const level of LEVELS) out.push({ level, scope: 'category', match: (j) => j.category === category && where[level](j) });
  }
  // a level that cannot be asked (no city, no region) is skipped
  return out.filter((l) => !(l.level === 'city' && !cityKey) && !(l.level === 'region' && (!region || region === COUNTRY)));
}

// Do these (already one-per-pair) jobs meet the minimums?
export function meetsMinimums(jobs, params = WAGE_RULES) {
  const workers = new Set(jobs.map((j) => id(j.workerId))).size;
  const customers = new Set(jobs.map((j) => id(j.customerId))).size;
  return { ok: jobs.length >= params.MIN_JOBS && workers >= params.MIN_WORKERS && customers >= params.MIN_CUSTOMERS, jobs: jobs.length, workers, customers };
}

// The range of one set of jobs (no minimums): rounded numbers, or null when there are none.
export function rangeOf(jobs, params = WAGE_RULES) {
  if (jobs.length === 0) return null;
  const { q25, q50, q75 } = summarize(jobs.map((j) => j.agreed.amount));
  return { low: roundTo(q25, params.ROUND_TO), median: roundTo(q50, params.ROUND_TO), high: roundTo(q75, params.ROUND_TO) };
}

/**
 * jobs:  [{ bookingId, workerId, customerId, skillId, category, region, city, status, completedAt,
 *           completionMethod, agreed: { unit, amount } | null }]
 * query: { skillId, category, unit, city, region }
 * Returns { level, scope, unit, low, median, high, jobs, workers } or null.
 */
export function priceRange(jobs, query, { now, params = WAGE_RULES } = {}) {
  const usable = qualifyingJobs(jobs, { unit: query.unit, now, params });
  for (const { level, scope, match } of levelsFor(query)) {
    const market = onePerPair(usable.filter(match));
    const counts = meetsMinimums(market, params);
    if (!counts.ok) continue;
    return { level, scope, unit: query.unit, ...rangeOf(market, params), jobs: counts.jobs, workers: counts.workers };
  }
  return null;
}
