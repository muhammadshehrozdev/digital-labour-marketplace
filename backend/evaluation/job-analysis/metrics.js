// Module 6: evaluation metrics. PURE functions with hand-worked tests (tests/unit/jobEvaluation.test.js).
// Module 2's metrics are imported, not copied; the single-label ones, McNemar's test and Holm's correction are new.
import { prf, wilson, seededRandom, microMacro, cohensKappa, krippendorffAlphaNominal } from '../skill-extraction/metrics.js';

export { prf, wilson, seededRandom, microMacro, cohensKappa, krippendorffAlphaNominal };
export const SEED = 20261124;
export const RESAMPLES = 1000;
export const NO_ANSWER = '(no answer)';

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// Per-class counts of a single-label task. pred null = no answer: a false negative of the gold class, never a false
// positive. Classes counted: those present in the gold labels or in the (non-null) predictions.
function classCounts(gold, pred) {
  const counts = new Map();
  const bump = (c, k) => {
    if (!counts.has(c)) counts.set(c, { tp: 0, fp: 0, fn: 0 });
    counts.get(c)[k] += 1;
  };
  gold.forEach((g, i) => {
    const p = pred[i];
    if (!counts.has(g)) counts.set(g, { tp: 0, fp: 0, fn: 0 });
    if (p === g) bump(g, 'tp');
    else {
      bump(g, 'fn');
      if (p !== null && p !== undefined) bump(p, 'fp');
    }
  });
  return counts;
}

export function macroF1(gold, pred) {
  const counts = classCounts(gold, pred);
  return mean([...counts.values()].map((c) => prf(c).f1));
}

export const accuracy = (gold, pred) => (gold.length ? gold.filter((g, i) => pred[i] === g).length / gold.length : 0);

// The full single-label report (7.3): accuracy (no answer = wrong), coverage, selective accuracy, per class P/R/F1,
// macro-F1, the confusion matrix, and a Wilson 95% interval for the accuracy.
export function singleLabelReport(gold, pred, { order = [] } = {}) {
  if (gold.length !== pred.length) throw new Error('gold and predictions must have the same length');
  const n = gold.length;
  const correct = gold.filter((g, i) => pred[i] === g).length;
  const answered = pred.filter((p) => p !== null && p !== undefined).length;
  const counts = classCounts(gold, pred);
  const rank = (c) => (order.includes(c) ? order.indexOf(c) : order.length);
  const classes = [...counts.keys()].sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0));
  const perClass = Object.fromEntries(classes.map((c) => [c, prf(counts.get(c))]));
  const confusion = {};
  gold.forEach((g, i) => {
    const p = pred[i] ?? NO_ANSWER;
    confusion[g] ??= {};
    confusion[g][p] = (confusion[g][p] ?? 0) + 1;
  });
  return {
    items: n,
    correct,
    accuracy: n ? correct / n : null,
    wilson95: wilson(correct, n),
    answered,
    coverage: n ? answered / n : null,
    selectiveAccuracy: answered ? correct / answered : null,
    macroF1: n ? mean(Object.values(perClass).map((c) => c.f1)) : null,
    classesCounted: classes.length,
    perClass,
    confusion,
  };
}

// Percentile with linear interpolation (the same method as Module 2's bootstrap).
export function percentile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Resample whole items with replacement. stat(indices) -> a number. 95% percentile interval.
export function bootstrapInterval(n, stat, { resamples = RESAMPLES, seed = SEED } = {}) {
  if (n === 0) return { low: null, high: null, resamples, seed };
  const rand = seededRandom(seed);
  const values = [];
  for (let b = 0; b < resamples; b += 1) {
    const idx = Array.from({ length: n }, () => Math.floor(rand() * n));
    values.push(stat(idx));
  }
  values.sort((a, c) => a - c);
  return { low: percentile(values, 0.025), high: percentile(values, 0.975), resamples, seed };
}

// Bootstrap 95% interval of macro-F1 (1,000 resamples, seed 20261124).
export const bootstrapMacroF1 = (gold, pred, opts) => bootstrapInterval(gold.length, (idx) => macroF1(idx.map((i) => gold[i]), idx.map((i) => pred[i])), opts);

// Paired bootstrap: the SAME resampled items for both systems; the difference A - B of accuracy and of macro-F1.
export function pairedBootstrapDiff(gold, predA, predB, opts = {}) {
  const pick = (xs, idx) => idx.map((i) => xs[i]);
  const diff = (stat) => (idx) => stat(pick(gold, idx), pick(predA, idx)) - stat(pick(gold, idx), pick(predB, idx));
  const all = gold.map((_, i) => i);
  return {
    accuracy: { observed: diff(accuracy)(all), ...bootstrapInterval(gold.length, diff(accuracy), opts) },
    macroF1: { observed: diff(macroF1)(all), ...bootstrapInterval(gold.length, diff(macroF1), opts) },
  };
}

// log of n choose k (exact enough for n up to many thousands)
function logChoose(n, k) {
  let s = 0;
  for (let i = 1; i <= k; i += 1) s += Math.log(n - k + i) - Math.log(i);
  return s;
}

// McNemar's EXACT two-sided test on the discordant pairs (McNemar 1947; Fagerland et al. 2013):
//   b = items only system 1 got right, c = items only system 2 got right, n = b + c, k = min(b, c)
//   exact p = min(1, 2 * sum_{i=0..k} C(n, i) / 2^n);   mid-p = min(1, 2 * P(X <= k) - P(X = k))
// The claim rule uses the exact p (the conservative one); the mid-p is reported next to it.
export function mcnemar(b, c) {
  if (![b, c].every((x) => Number.isInteger(x) && x >= 0)) throw new Error('b and c must be whole numbers');
  const n = b + c;
  if (n === 0) return { b, c, n, exactP: 1, midP: 1 };
  const k = Math.min(b, c);
  const pmf = (i) => Math.exp(logChoose(n, i) - n * Math.LN2);
  let cdf = 0;
  for (let i = 0; i <= k; i += 1) cdf += pmf(i);
  return { b, c, n, exactP: Math.min(1, 2 * cdf), midP: Math.min(1, 2 * cdf - pmf(k)) };
}

// b and c from two systems' predictions on the same items.
export function discordant(gold, predA, predB) {
  let b = 0;
  let c = 0;
  gold.forEach((g, i) => {
    const a = predA[i] === g;
    const s = predB[i] === g;
    if (a && !s) b += 1;
    if (s && !a) c += 1;
  });
  return { b, c };
}

// Holm's step-down correction. tests: [{ name, p }] -> each with adjustedP and significant (adjustedP < alpha).
export function holm(tests, alpha = 0.05) {
  const m = tests.length;
  const order = tests.map((t, i) => ({ ...t, i })).sort((a, b) => a.p - b.p || a.i - b.i);
  let running = 0;
  const adjusted = new Map();
  order.forEach((t, j) => {
    running = Math.max(running, Math.min(1, (m - j) * t.p));
    adjusted.set(t.i, running);
  });
  return tests.map((t, i) => ({ ...t, adjustedP: adjusted.get(i), significant: adjusted.get(i) < alpha }));
}

// Exact match of one field; "not stated" in gold and no suggestion count as a match.
export function exactMatch(pairs, same = (a, b) => a === b) {
  const correct = pairs.filter(({ gold, pred }) => (gold === null && pred === null) || (gold !== null && pred !== null && same(gold, pred))).length;
  return { items: pairs.length, correct, value: pairs.length ? correct / pairs.length : null, wilson95: wilson(correct, pairs.length) };
}

export function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 1;
  let both = 0;
  for (const x of a) if (b.has(x)) both += 1;
  return both / union.size;
}
