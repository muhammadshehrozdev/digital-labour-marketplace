// Ranking metrics for the Module 4 simulation. PURE functions, unit-tested with small hand-worked lists
// (tests/unit/reputationEvaluation.test.js).
//   Kendall's tau-b (Kendall 1938), with ties handled
//   NDCG@k (Jarvelin & Kekalainen 2002): DCG = sum of g_i / log2(i + 1), divided by the ideal DCG
//   Precision@k: the share of the top k that is in the true top 20%
//   percentile rank: 100 = first place, 0 = last place

// Indices in ranking order: higher score first; equal scores by the tie-break key (smaller first).
export function rankOrder(scores, tieKeys) {
  return scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || (tieKeys ? tieKeys[a] - tieKeys[b] : a - b));
}

// rank[i] = 1 for the first place
export function ranksFromOrder(order) {
  const ranks = new Array(order.length);
  order.forEach((index, position) => { ranks[index] = position + 1; });
  return ranks;
}

export function kendallTauB(x, y) {
  const n = x.length;
  if (n !== y.length) throw new Error('x and y must have the same length');
  let concordant = 0;
  let discordant = 0;
  let tiesX = 0;
  let tiesY = 0;
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const dx = Math.sign(x[i] - x[j]);
      const dy = Math.sign(y[i] - y[j]);
      if (dx === 0) tiesX += 1;
      if (dy === 0) tiesY += 1;
      if (dx * dy > 0) concordant += 1;
      else if (dx * dy < 0) discordant += 1;
    }
  }
  const pairs = (n * (n - 1)) / 2;
  const denominator = Math.sqrt((pairs - tiesX) * (pairs - tiesY));
  return denominator === 0 ? null : (concordant - discordant) / denominator;
}

export function dcg(gainsInOrder, k) {
  return gainsInOrder.slice(0, k).reduce((sum, g, i) => sum + g / Math.log2(i + 2), 0);
}

// order: indices in the method's ranking order; gains: the true value of each index
export function ndcgAtK(order, gains, k) {
  const ideal = dcg([...gains].sort((a, b) => b - a), k);
  return ideal === 0 ? null : dcg(order.map((i) => gains[i]), k) / ideal;
}

// The indices whose true value is in the top `share` (at least one).
export function topShare(gains, share = 0.2) {
  const count = Math.max(1, Math.ceil(share * gains.length));
  return new Set(gains.map((g, i) => [g, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, count).map(([, i]) => i));
}

export function precisionAtK(order, relevant, k) {
  const top = order.slice(0, Math.min(k, order.length));
  return top.length === 0 ? null : top.filter((i) => relevant.has(i)).length / top.length;
}

export function percentileRanks(order) {
  const n = order.length;
  const ranks = ranksFromOrder(order);
  return ranks.map((r) => (n === 1 ? 100 : (100 * (n - r)) / (n - 1)));
}

export const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

// Percentile by linear interpolation between the closest ranks (the "type 7" rule).
export function percentile(xs, p) {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// mean, sample standard deviation, 2.5th and 97.5th percentiles across seeds (null values skipped)
export function summarize(values) {
  const xs = values.filter((v) => v !== null && v !== undefined && Number.isFinite(v));
  const m = mean(xs);
  const sd = xs.length > 1 ? Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)) : 0;
  return { n: xs.length, mean: m, sd: xs.length ? sd : null, p2_5: percentile(xs, 0.025), p97_5: percentile(xs, 0.975) };
}

// Seed-by-seed comparison of ours (a) against another method (b): the mean difference a - b and the
// share of seeds where ours is better (and where they are equal).
export function pairedComparison(a, b, { higherIsBetter = true } = {}) {
  const pairs = a.map((x, i) => [x, b[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length === 0) return { seeds: 0, meanDifference: null, shareOursBetter: null, shareEqual: null };
  const diffs = pairs.map(([x, y]) => x - y);
  const better = diffs.filter((d) => (higherIsBetter ? d > 1e-12 : d < -1e-12)).length;
  const equal = diffs.filter((d) => Math.abs(d) <= 1e-12).length;
  return { seeds: pairs.length, meanDifference: mean(diffs), shareOursBetter: better / pairs.length, shareEqual: equal / pairs.length };
}
