// The methods compared in the Module 5 simulation (Batch 7, §8.3). Each takes ONE market's jobs and returns
// { value, low, high } or null (no number).
//   M1  the plain mean of every completed job with a price (auto-completed and proposed-only included), no
//       minimums; interval = mean +/- one standard deviation (so the coverage comparison is only rough)
//   M2  the plain median of the same jobs, no minimums; interval = their 25th to 75th percentile
//   ours  the PRODUCTION priceRange (imported, not copied), city level only, with the production rules
import { WAGE_RULES } from '../../config/wageRules.js';
import { priceRange, quantile } from '../../services/wage/priceRange.js';
import { SIM_NOW } from './config.js';

// what a naive system reads: every completed job with any price
const naivePrices = (jobs) => jobs.filter((j) => j.status === 'completed' && Number.isFinite(j.price)).map((j) => j.price);

export function plainMean(jobs) {
  const xs = naivePrices(jobs);
  if (xs.length === 0) return null;
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  const sd = xs.length > 1 ? Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)) : 0;
  return { value: m, low: m - sd, high: m + sd };
}

export function plainMedian(jobs) {
  const xs = naivePrices(jobs).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  return { value: quantile(xs, 0.5), low: quantile(xs, 0.25), high: quantile(xs, 0.75) };
}

export function ours(jobs, city, { now = SIM_NOW, params = WAGE_RULES } = {}) {
  // only this market's jobs are passed in, so every level of the engine sees the same city market
  const r = priceRange(jobs, { skillId: 'sim_skill', category: 'sim', unit: 'job', city, region: null }, { now, params });
  return r ? { value: r.median, low: r.low, high: r.high } : null;
}

export const METHODS = Object.freeze({
  M1: Object.freeze({ label: 'M1 plain mean (no rules)', run: (jobs) => plainMean(jobs) }),
  M2: Object.freeze({ label: 'M2 plain median (no rules)', run: (jobs) => plainMedian(jobs) }),
  ours: Object.freeze({ label: 'ours (production priceRange)', run: (jobs, city) => ours(jobs, city) }),
});
