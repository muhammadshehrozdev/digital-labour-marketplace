// Module 6: the stratified split and the cross-validation (7.5, fixed in Batch 8A before any real data). PURE.
//
// Split: stratified by gold_category ("none" is its own stratum), seed 20261124, 40% development / 60% test. Strata
// in taxonomy order, then "none"; ONE generator (seeded mulberry32 of Module 2) for all strata in that order; each
// stratum (in file order) is shuffled with Fisher-Yates, then the first Math.round(0.4 * n) items go to development.
//
// Cross-validation, on the development file only: stratified 5 folds (seed 20261124). Classes in label order, one
// generator; each class is shuffled, then its items are dealt round-robin to the folds with ONE counter that goes on
// across classes (so the folds have about the same size; a class with fewer than 5 items is in fewer folds). The
// vocabulary and minDf are computed INSIDE each training fold (no leakage). Score of a setting = the mean of the five
// per-fold macro-F1 values. Choice: the highest mean rounded to 3 decimals; ties -> the larger alpha, then ngram 1,
// then minDf 3 (the simpler model).
import { CATEGORY_IDS } from '../../config/skillTaxonomy.js';
import { train, predict, LABEL_ORDER } from '../../services/jobAnalyzer/naiveBayes.js';
import { macroF1, seededRandom, SEED } from './metrics.js';
import { NONE } from './dataset.js';

export const DEV_SHARE = 0.4;
export const FOLDS = 5;
export const GRID = Object.freeze({ alpha: [0.1, 0.5, 1.0], ngram: [1, 2], minDf: [2, 3] });

export function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// items: [{ id, gold: { category } }] -> { dev: [ids], test: [ids], strata: { name: { items, dev, test } } }
export function stratifiedSplit(items, { seed = SEED, devShare = DEV_SHARE } = {}) {
  const rand = seededRandom(seed);
  const dev = [];
  const test = [];
  const strata = {};
  for (const name of [...CATEGORY_IDS, NONE]) {
    const members = items.filter((it) => it.gold.category === name);
    if (members.length === 0) continue;
    const shuffled = shuffle(members, rand);
    const take = Math.round(devShare * members.length);
    shuffled.slice(0, take).forEach((it) => dev.push(it.id));
    shuffled.slice(take).forEach((it) => test.push(it.id));
    strata[name] = { items: members.length, dev: take, test: members.length - take };
  }
  return { seed, devShare, dev, test, strata };
}

// The training examples of one label: category items without "none"; task-type items with a task type.
export function examplesFor(items, label) {
  if (label === 'category') return items.filter((it) => it.gold.category !== NONE).map((it) => ({ id: it.id, text: it.text, label: it.gold.category }));
  if (label === 'task_type') return items.filter((it) => it.gold.taskType).map((it) => ({ id: it.id, text: it.text, label: it.gold.taskType }));
  throw new Error('label must be category or task_type');
}

// examples: [{ id, text, label }] -> Map id -> fold number (0..folds-1)
export function assignFolds(examples, { label, seed = SEED, folds = FOLDS } = {}) {
  const rand = seededRandom(seed);
  const order = LABEL_ORDER[label] ?? [...new Set(examples.map((e) => e.label))].sort();
  const foldOf = new Map();
  let counter = 0;
  for (const c of order) {
    for (const e of shuffle(examples.filter((x) => x.label === c), rand)) {
      foldOf.set(e.id, counter % folds);
      counter += 1;
    }
  }
  return foldOf;
}

// The model of one training fold: trained ONLY on the other folds' items (its vocabulary and minDf too).
export const trainFold = (examples, foldOf, k, params, label) => train(examples.filter((e) => foldOf.get(e.id) !== k), { label, ...params });

const ALPHA_ORDER = (a, b) => b.alpha - a.alpha || a.ngram - b.ngram || b.minDf - a.minDf;

export function crossValidate(examples, { label, seed = SEED, folds = FOLDS, grid = GRID } = {}) {
  const foldOf = assignFolds(examples, { label, seed, folds });
  const settings = grid.alpha.flatMap((alpha) => grid.ngram.flatMap((ngram) => grid.minDf.map((minDf) => ({ alpha, ngram, minDf }))));
  const rows = settings.map((params) => {
    const perFold = [];
    for (let k = 0; k < folds; k += 1) {
      const held = examples.filter((e) => foldOf.get(e.id) === k);
      if (held.length === 0) continue;
      const model = trainFold(examples, foldOf, k, params, label);
      perFold.push(macroF1(held.map((e) => e.label), held.map((e) => predict(model, e.text).suggested)));
    }
    const meanF1 = perFold.reduce((a, b) => a + b, 0) / (perFold.length || 1);
    return { ...params, foldMacroF1: perFold, meanMacroF1: meanF1, rounded: Math.round(meanF1 * 1000) / 1000 };
  });
  const chosen = [...rows].sort((a, b) => b.rounded - a.rounded || ALPHA_ORDER(a, b))[0];
  const perClass = {};
  for (const e of examples) {
    perClass[e.label] ??= new Set();
    perClass[e.label].add(foldOf.get(e.id));
  }
  return {
    label,
    seed,
    folds,
    items: examples.length,
    rows,
    chosen: { alpha: chosen.alpha, ngram: chosen.ngram, minDf: chosen.minDf },
    classesInFewerFolds: Object.entries(perClass).filter(([, s]) => s.size < folds).map(([c, s]) => ({ label: c, folds: s.size })),
  };
}
