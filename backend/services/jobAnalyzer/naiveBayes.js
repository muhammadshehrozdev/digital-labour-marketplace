// Module 6: the team's own small multinomial naive Bayes classifier (Batch 8A). PURE, plain JavaScript, no package.
// A simple word-count model trained on the team's labelled examples; it predicts ONE label from a text: the trade
// category (the main comparison) or, with the same code, the task type. McCallum & Nigam (1998); Manning, Raghavan
// & Schütze (2008), ch. 13. Formulas (docs/modules/MODULE-6.md, section 4):
//
//   features  the job analyzer's tokens (normalisation + spelling variants); with ngram = 2 also adjacent pairs
//   V         features found in at least minDf TRAINING documents; no feature with 3 or more digits in a row
//   prior     P(c) = N_c / N
//   P(t | c)  = (T_ct + alpha) / (sum over t' in V of T_ct' + alpha * |V|)            (Lidstone smoothing)
//   score     s(c | d) = log P(c) + sum over t of n_t(d) * log P(t | c)    (features outside V are ignored)
//   predict   the label with the highest score; ties -> the earlier label (taxonomy order / TASK_TYPES order)
//
// The API shows `ranked` and `words`, NEVER scores or probabilities: naive Bayes "probabilities" are badly calibrated
// and would read like a certainty. predictDetailed() (scores, margin) is for the evaluation scripts only.
import { createHash } from 'node:crypto';
import { CATEGORY_IDS } from '../../config/skillTaxonomy.js';
import { TASK_TYPES } from '../../config/jobRules.js';
import { JOB_PHRASES_VERSION } from '../../config/jobPhrases.js';
import { jobTokens } from './tokens.js';

export const MODEL_KIND = 'dlm-job-nb';
export const FORMAT_VERSION = 1;
export const LABEL_ORDER = Object.freeze({ category: CATEGORY_IDS, task_type: TASK_TYPES });
export const DEFAULT_PARAMS = Object.freeze({ alpha: 1, ngram: 1, minDf: 2 });
export const MIN_DF_ON_DISK = 2; // privacy: a word seen in one description only never goes into a model file
const MANY_DIGITS = /\d{3,}/;

// The features of one text (a list; a feature appears as often as it occurs).
export function features(text, { ngram = 1, variants = true } = {}) {
  const tokens = jobTokens(typeof text === 'string' ? text : '', { variants });
  const out = [...tokens];
  if (ngram >= 2) for (let i = 0; i + 1 < tokens.length; i += 1) out.push(`${tokens[i]} ${tokens[i + 1]}`);
  return out.filter((f) => !MANY_DIGITS.test(f));
}

const sha256 = (text) => createHash('sha256').update(text).digest('hex');
export const modelIdOf = (modelWithoutId) => sha256(JSON.stringify(modelWithoutId)).slice(0, 12);

function labelOrderFor(label, explicit, items) {
  if (explicit) return [...explicit];
  if (LABEL_ORDER[label]) return [...LABEL_ORDER[label]];
  return [...new Set(items.map((i) => i.label))].sort();
}

/**
 * items: [{ text, label }]. Deterministic: the same items (in any order) and parameters give a byte-identical model.
 * options: label ('category' | 'task_type'), alpha, ngram, minDf, variants, labels (explicit order, for tests),
 *          trainedOn ({ file (name only), sha256, synthetic }).
 */
export function train(items, { label = 'category', alpha = DEFAULT_PARAMS.alpha, ngram = DEFAULT_PARAMS.ngram, minDf = DEFAULT_PARAMS.minDf, variants = true, labels, trainedOn = {} } = {}) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('naive Bayes: no training items');
  if (!(alpha > 0)) throw new Error('naive Bayes: alpha must be more than 0');
  if (![1, 2].includes(ngram)) throw new Error('naive Bayes: ngram must be 1 or 2');
  if (!Number.isInteger(minDf) || minDf < 1) throw new Error('naive Bayes: minDf must be a whole number of at least 1');
  const order = labelOrderFor(label, labels, items);
  const known = new Set(order);
  const docs = items.map((item) => {
    if (!known.has(item.label)) throw new Error(`naive Bayes: unknown label "${item.label}"`);
    return { label: item.label, feats: features(item.text, { ngram, variants }) };
  });

  const df = new Map();
  for (const d of docs) for (const f of new Set(d.feats)) df.set(f, (df.get(f) ?? 0) + 1);
  const vocab = [...df.keys()].filter((f) => df.get(f) >= minDf).sort();
  const index = new Map(vocab.map((f, i) => [f, i]));

  const perLabel = new Map(order.map((c) => [c, { docs: 0, counts: new Array(vocab.length).fill(0), total: 0 }]));
  for (const d of docs) {
    const slot = perLabel.get(d.label);
    slot.docs += 1;
    for (const f of d.feats) {
      const i = index.get(f);
      if (i !== undefined) { slot.counts[i] += 1; slot.total += 1; }
    }
  }
  const trained = order.filter((c) => perLabel.get(c).docs > 0);
  const logPrior = Object.fromEntries(trained.map((c) => [c, Math.log(perLabel.get(c).docs / docs.length)]));
  const logLikelihood = Object.fromEntries(trained.map((c) => {
    const { counts, total } = perLabel.get(c);
    const denominator = total + alpha * vocab.length;
    return [c, counts.map((n) => Math.log((n + alpha) / denominator))];
  }));

  const model = {
    kind: MODEL_KIND,
    formatVersion: FORMAT_VERSION,
    label,
    labels: trained,
    params: { alpha, ngram, minDf },
    vocab,
    logPrior,
    logLikelihood,
    trainedOn: { file: trainedOn.file ?? null, sha256: trainedOn.sha256 ?? null, items: docs.length, synthetic: trainedOn.synthetic ?? null },
    tokenizer: { phrasesVersion: JOB_PHRASES_VERSION, variants },
  };
  return { ...model, modelId: modelIdOf(model) };
}

// The labels of the full list that had no training document (they can never be predicted).
export const labelsWithoutData = (model, fullOrder = LABEL_ORDER[model.label] ?? []) => fullOrder.filter((c) => !model.labels.includes(c));

// Throws when the object is not a usable model of this format.
export function checkModel(model) {
  const ok = model && model.kind === MODEL_KIND && model.formatVersion === FORMAT_VERSION && Array.isArray(model.vocab)
    && Array.isArray(model.labels) && model.labels.every((c) => Array.isArray(model.logLikelihood?.[c]) && model.logLikelihood[c].length === model.vocab.length && Number.isFinite(model.logPrior?.[c]))
    && model.params && model.tokenizer;
  if (!ok) throw new Error('naive Bayes: not a valid model of this format');
  const { modelId, ...rest } = model;
  if (modelId !== modelIdOf(rest)) throw new Error('naive Bayes: the modelId does not match the model (the file was changed)');
  return model;
}

// Privacy rules for a model written to disk (6.2): minDf >= 2 and no feature with 3 or more digits.
export function checkModelForDisk(model) {
  checkModel(model);
  if (model.params.minDf < MIN_DF_ON_DISK) throw new Error(`naive Bayes: a model file needs minDf >= ${MIN_DF_ON_DISK} (a word from one description only could identify someone)`);
  if (model.vocab.some((f) => MANY_DIGITS.test(f))) throw new Error('naive Bayes: the model holds a feature with 3 or more digits');
  return model;
}

const indexCache = new WeakMap();
function vocabIndex(model) {
  if (!indexCache.has(model)) indexCache.set(model, new Map(model.vocab.map((f, i) => [f, i])));
  return indexCache.get(model);
}

// Everything, for the evaluation scripts: scores per label (log), the margin s(c1) - s(c2), ranked, words.
export function predictDetailed(model, text) {
  const index = vocabIndex(model);
  const counts = new Map();
  for (const f of features(text, { ngram: model.params.ngram, variants: model.tokenizer.variants })) {
    const i = index.get(f);
    if (i !== undefined) counts.set(i, (counts.get(i) ?? 0) + 1);
  }
  const present = [...counts.entries()].sort((a, b) => a[0] - b[0]); // a fixed order of the sum
  const order = new Map(model.labels.map((c, i) => [c, i]));
  const scores = Object.fromEntries(model.labels.map((c) => [c, present.reduce((s, [i, n]) => s + n * model.logLikelihood[c][i], model.logPrior[c])]));
  const sorted = [...model.labels].sort((a, b) => scores[b] - scores[a] || order.get(a) - order.get(b));
  const [c1, c2] = sorted;
  let words = [];
  if (c1 !== undefined && c2 !== undefined) {
    words = present
      .map(([i, n]) => ({ word: model.vocab[i], push: n * (model.logLikelihood[c1][i] - model.logLikelihood[c2][i]) }))
      .filter((w) => w.push > 0)
      .sort((a, b) => b.push - a.push || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0))
      .slice(0, 5);
  }
  return {
    suggested: c1 ?? null,
    ranked: sorted.slice(0, 3),
    words: words.map((w) => w.word),
    contributions: words,
    scores,
    margin: c2 !== undefined ? scores[c1] - scores[c2] : null,
  };
}

// What the website may show: the label, the top three labels and the words that pushed the decision. No numbers.
export function predict(model, text) {
  const { suggested, ranked, words } = predictDetailed(model, text);
  return { suggested, ranked, words };
}
