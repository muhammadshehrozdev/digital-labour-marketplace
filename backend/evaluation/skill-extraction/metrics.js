// Evaluation metrics for the rule-based skill extractor. Pure functions, unit-tested with
// hand-worked numbers (tests/unit/evaluationMetrics.test.js).

// Precision, recall, F1 from counts. When a denominator is 0 the value is 0 (and flagged).
export function prf({ tp, fp, fn }) {
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { tp, fp, fn, precision, recall, f1, undefinedPrecision: tp + fp === 0, undefinedRecall: tp + fn === 0 };
}

// Wilson score interval for a proportion k/n (better than the normal interval for small n).
export function wilson(k, n, z = 1.959963984540054) {
  if (n === 0) return { low: 0, high: 1 };
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) };
}

// Small seeded random number generator (mulberry32), so bootstrap results are repeatable.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Per-item counts: gold and predicted are Sets of skill ids.
export function itemCounts(gold, predicted) {
  let tp = 0;
  for (const s of predicted) if (gold.has(s)) tp += 1;
  return { tp, fp: predicted.size - tp, fn: gold.size - tp };
}

export function sumCounts(list) {
  return list.reduce((acc, c) => ({ tp: acc.tp + c.tp, fp: acc.fp + c.fp, fn: acc.fn + c.fn }), { tp: 0, fp: 0, fn: 0 });
}

// Micro: pool all decisions. Macro: average per skill over skills seen in gold or predictions.
export function microMacro(pairs, skillFilter = () => true) {
  const perSkill = new Map();
  const bump = (id, key) => {
    if (!skillFilter(id)) return;
    if (!perSkill.has(id)) perSkill.set(id, { tp: 0, fp: 0, fn: 0 });
    perSkill.get(id)[key] += 1;
  };
  for (const { gold, predicted } of pairs) {
    for (const s of predicted) bump(s, gold.has(s) ? 'tp' : 'fp');
    for (const s of gold) if (!predicted.has(s)) bump(s, 'fn');
  }
  const micro = prf(sumCounts([...perSkill.values()]));
  const skills = Object.fromEntries([...perSkill.entries()].map(([id, c]) => [id, prf(c)]));
  const values = Object.values(skills);
  const mean = (key) => (values.length ? values.reduce((a, v) => a + v[key], 0) / values.length : 0);
  return { micro, macro: { precision: mean('precision'), recall: mean('recall'), f1: mean('f1'), skillsCounted: values.length }, perSkill: skills };
}

function percentile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Bootstrap 95% interval of micro F1: resample whole descriptions with replacement.
export function bootstrapF1(itemCountList, { resamples = 1000, seed = 20261109 } = {}) {
  const rand = seededRandom(seed);
  const n = itemCountList.length;
  const values = [];
  for (let b = 0; b < resamples; b += 1) {
    const sample = [];
    for (let i = 0; i < n; i += 1) sample.push(itemCountList[Math.floor(rand() * n)]);
    values.push(prf(sumCounts(sample)).f1);
  }
  values.sort((a, c) => a - c);
  return { low: percentile(values, 0.025), high: percentile(values, 0.975), resamples, seed };
}

// Paired bootstrap: the same resampled descriptions for both systems. Returns the observed
// F1 difference (A - B), its 95% interval, and a two-sided p-value.
export function pairedBootstrap(countsA, countsB, { resamples = 1000, seed = 20261109 } = {}) {
  if (countsA.length !== countsB.length) throw new Error('Paired test needs the same items for both systems');
  const rand = seededRandom(seed);
  const n = countsA.length;
  const observed = prf(sumCounts(countsA)).f1 - prf(sumCounts(countsB)).f1;
  const diffs = [];
  for (let b = 0; b < resamples; b += 1) {
    const a = [];
    const c = [];
    for (let i = 0; i < n; i += 1) {
      const k = Math.floor(rand() * n);
      a.push(countsA[k]);
      c.push(countsB[k]);
    }
    diffs.push(prf(sumCounts(a)).f1 - prf(sumCounts(c)).f1);
  }
  diffs.sort((x, y) => x - y);
  const atOrBelow = diffs.filter((d) => d <= 0).length / resamples;
  const atOrAbove = diffs.filter((d) => d >= 0).length / resamples;
  return {
    observedDiff: observed,
    low: percentile(diffs, 0.025),
    high: percentile(diffs, 0.975),
    pValue: Math.min(1, 2 * Math.min(atOrBelow, atOrAbove)),
    resamples,
    seed,
  };
}

// Cohen's kappa for two raters, nominal labels.
export function cohensKappa(labelsA, labelsB) {
  if (labelsA.length !== labelsB.length || labelsA.length === 0) throw new Error('Need two equal, non-empty label lists');
  const n = labelsA.length;
  const cats = [...new Set([...labelsA, ...labelsB])];
  const observed = labelsA.filter((a, i) => a === labelsB[i]).length / n;
  const expected = cats.reduce((sum, c) => {
    const pa = labelsA.filter((x) => x === c).length / n;
    const pb = labelsB.filter((x) => x === c).length / n;
    return sum + pa * pb;
  }, 0);
  return expected === 1 ? 1 : (observed - expected) / (1 - expected);
}

// Krippendorff's alpha, nominal, any number of coders; null/undefined = missing value.
// units: array of arrays, each inner array = the values the coders gave that unit.
export function krippendorffAlphaNominal(units) {
  const coincidence = new Map(); // "c|k" -> weight
  let total = 0;
  for (const unit of units) {
    const values = unit.filter((v) => v !== null && v !== undefined);
    const m = values.length;
    if (m < 2) continue; // not pairable
    for (let i = 0; i < m; i += 1) {
      for (let j = 0; j < m; j += 1) {
        if (i === j) continue;
        const key = `${values[i]}|${values[j]}`;
        coincidence.set(key, (coincidence.get(key) ?? 0) + 1 / (m - 1));
      }
    }
    total += m;
  }
  if (total === 0) throw new Error('No pairable values');
  const marginal = new Map();
  let disagreeObserved = 0;
  for (const [key, w] of coincidence) {
    const [c, k] = key.split('|');
    marginal.set(c, (marginal.get(c) ?? 0) + w);
    if (c !== k) disagreeObserved += w;
  }
  let disagreeExpected = 0;
  const cats = [...marginal.keys()];
  for (const c of cats) for (const k of cats) if (c !== k) disagreeExpected += marginal.get(c) * marginal.get(k);
  if (disagreeExpected === 0) return 1;
  return 1 - ((total - 1) * disagreeObserved) / disagreeExpected;
}
