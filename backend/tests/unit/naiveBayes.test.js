// Module 6 (Batch 8A): the team's own multinomial naive Bayes classifier, the hybrid, and the production loader
// check. Hand-worked numbers of 6.5 of the batch plan (4 decimals). Every text here is SYNTHETIC.
import { describe, test, expect, vi } from 'vitest';
import {
  train, predict, predictDetailed, features, checkModel, checkModelForDisk, labelsWithoutData, modelIdOf,
} from '../../services/jobAnalyzer/naiveBayes.js';
import { analyzeJob } from '../../services/jobAnalyzer/index.js';
import { chooseLiveAnalyzer, analyzeLive, liveAnalyzer } from '../../services/jobAnalyzer/live.js';
import { CATEGORY_IDS } from '../../config/skillTaxonomy.js';

const NOW = new Date('2026-11-24T10:00:00+05:00');
const TOY = [
  { text: 'fan kharab', label: 'A' },
  { text: 'fan wiring', label: 'A' },
  { text: 'pipe leak', label: 'B' },
];
const toy = (minDf = 1) => train(TOY, { label: 'toy', labels: ['A', 'B'], alpha: 1, ngram: 1, minDf });
const r4 = (x) => Math.round(x * 10000) / 10000;
const P = (m, label, word) => Math.exp(m.logLikelihood[label][m.vocab.indexOf(word)]);

describe('hand-worked example (6.5): alpha = 1, unigrams, minDf = 1', () => {
  const m = toy();
  test('priors', () => {
    expect(r4(Math.exp(m.logPrior.A))).toBe(0.6667);
    expect(r4(Math.exp(m.logPrior.B))).toBe(0.3333);
  });
  test('likelihoods of A', () => {
    expect(['fan', 'kharab', 'wiring', 'pipe', 'leak'].map((w) => r4(P(m, 'A', w)))).toEqual([0.3333, 0.2222, 0.2222, 0.1111, 0.1111]);
  });
  test('likelihoods of B', () => {
    expect(['fan', 'pipe', 'leak', 'kharab', 'wiring'].map((w) => r4(P(m, 'B', w)))).toEqual([0.1429, 0.2857, 0.2857, 0.1429, 0.1429]);
  });
  test('"fan leak": s(A), s(B), prediction, margin, words', () => {
    const d = predictDetailed(m, 'fan leak');
    expect([r4(d.scores.A), r4(d.scores.B), d.suggested, r4(d.margin)]).toEqual([-3.7013, -4.2973, 'A', 0.596]);
    expect(d.words).toEqual(['fan']);
    expect(r4(d.contributions[0].push)).toBe(0.8473);
    const leak = m.vocab.indexOf('leak');
    expect(r4(m.logLikelihood.A[leak] - m.logLikelihood.B[leak])).toBe(-0.9445); // negative: not listed
  });
  test('"pipe"', () => {
    const d = predictDetailed(m, 'pipe');
    expect([r4(d.scores.A), r4(d.scores.B), d.suggested, r4(d.margin)]).toEqual([-2.6027, -2.3514, 'B', 0.2513]);
  });
  test('"tap fan": the unknown word "tap" is ignored', () => {
    const d = predictDetailed(m, 'tap fan');
    expect([r4(d.scores.A), r4(d.scores.B), d.suggested, r4(d.margin)]).toEqual([-1.5041, -3.0445, 'A', 1.5404]);
  });
  test('minDf = 2: the vocabulary is [fan]; for "fan leak" the likelihoods are equal and the prior decides', () => {
    const m2 = toy(2);
    expect(m2.vocab).toEqual(['fan']);
    expect(P(m2, 'A', 'fan')).toBeCloseTo(1, 12);
    expect(P(m2, 'B', 'fan')).toBeCloseTo(1, 12);
    expect(predict(m2, 'fan leak').suggested).toBe('A');
  });
});

describe('the model object', () => {
  test('format, sorted vocabulary, file NAME only, a modelId from the content', () => {
    const m = train(TOY, { label: 'toy', labels: ['A', 'B'], minDf: 1, trainedOn: { file: 'dev.synthetic.csv', sha256: 'ab'.repeat(32), synthetic: true } });
    expect(Object.keys(m)).toEqual(['kind', 'formatVersion', 'label', 'labels', 'params', 'vocab', 'logPrior', 'logLikelihood', 'trainedOn', 'tokenizer', 'modelId']);
    expect(m.kind).toBe('dlm-job-nb');
    expect(m.vocab).toEqual([...m.vocab].sort());
    expect(m.trainedOn).toEqual({ file: 'dev.synthetic.csv', sha256: 'ab'.repeat(32), items: 3, synthetic: true });
    expect(m.tokenizer).toMatchObject({ variants: true });
    const { modelId, ...rest } = m;
    expect(modelId).toBe(modelIdOf(rest));
    expect(modelId).toMatch(/^[0-9a-f]{12}$/);
    expect(checkModel(m)).toBe(m);
  });

  test('a changed model file is refused (the modelId no longer matches)', () => {
    const m = toy();
    expect(() => checkModel({ ...m, labels: ['B', 'A'] })).toThrow(/modelId/);
    expect(() => checkModel({ kind: 'other' })).toThrow(/valid/);
    expect(() => checkModel(null)).toThrow();
  });

  test('the file writer refuses minDf < 2 (privacy)', () => {
    expect(() => checkModelForDisk(toy(1))).toThrow(/minDf/);
    expect(checkModelForDisk(toy(2)).params.minDf).toBe(2);
  });

  test('bad training input is refused with a clear message', () => {
    expect(() => train([])).toThrow(/no training items/);
    expect(() => train(TOY, { labels: ['A'], label: 'toy' })).toThrow(/unknown label/);
    expect(() => train(TOY, { labels: ['A', 'B'], alpha: 0 })).toThrow(/alpha/);
    expect(() => train(TOY, { labels: ['A', 'B'], ngram: 3 })).toThrow(/ngram/);
    expect(() => train(TOY, { labels: ['A', 'B'], minDf: 0 })).toThrow(/minDf/);
  });

  test('labels without training documents cannot be predicted and are reported', () => {
    const m = train([{ text: 'AC service', label: 'ac_appliance_repair' }, { text: 'plumber chahiye', label: 'plumbing_sanitary' }], { minDf: 1 });
    expect(m.labels).toEqual(['plumbing_sanitary', 'ac_appliance_repair']); // taxonomy order
    expect(labelsWithoutData(m)).toEqual(CATEGORY_IDS.filter((c) => !m.labels.includes(c)));
  });
});

describe('properties (6.5)', () => {
  const ITEMS = [
    { text: 'AC ki service karwani hai', label: 'ac_appliance_repair' },
    { text: 'AC thanda nahi kar raha', label: 'ac_appliance_repair' },
    { text: 'fridge kharab hai', label: 'ac_appliance_repair' },
    { text: 'nalka tapak raha hai', label: 'plumbing_sanitary' },
    { text: 'pani nahi aa raha tanki', label: 'plumbing_sanitary' },
    { text: 'geyser lagwana hai 2000 rupay', label: 'plumbing_sanitary' },
    { text: 'pankha nahi chal raha', label: 'electrical_solar' },
    { text: 'wiring karwani hai 15000 tak', label: 'electrical_solar' },
  ];
  test('shuffling the training items never changes the model (byte-identical)', () => {
    const a = JSON.stringify(train(ITEMS, { minDf: 1, ngram: 2 }));
    const shuffled = [ITEMS[5], ITEMS[2], ITEMS[7], ITEMS[0], ITEMS[3], ITEMS[6], ITEMS[1], ITEMS[4]];
    expect(JSON.stringify(train(shuffled, { minDf: 1, ngram: 2 }))).toBe(a);
  });

  test('an empty or all-unknown text gets the prior label', () => {
    const m = train(ITEMS, { minDf: 1 });
    // priors: AC 3, plumbing 3, electrical 2 -> a tie between AC and plumbing; plumbing comes first in the taxonomy
    expect(predict(m, '').suggested).toBe('plumbing_sanitary');
    expect(predict(m, 'zzz qqq').suggested).toBe('plumbing_sanitary');
    expect(predict(m, '').words).toEqual([]);
  });

  test('adding a training document of class c never lowers P(c)', () => {
    const before = Math.exp(train(ITEMS, { minDf: 1 }).logPrior.electrical_solar);
    const after = Math.exp(train([...ITEMS, { text: 'switch board', label: 'electrical_solar' }], { minDf: 1 }).logPrior.electrical_solar);
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('no feature with 3 or more digits is ever in the model', () => {
    const m = train(ITEMS, { minDf: 1, ngram: 2 });
    expect(m.vocab.some((f) => /\d{3,}/.test(f))).toBe(false);
    expect(JSON.stringify(m.vocab)).not.toMatch(/2000|15000/);
    expect(features('AC 1.5 ton 2000 rupay', { ngram: 2 })).toEqual(['ac', '1', '5', 'ton', 'rupay', 'ac 1', '1 5', '5 ton']);
  });

  test('bigrams with ngram = 2; the spelling variants follow the model', () => {
    expect(features('pani nhi aa', { ngram: 2 })).toEqual(['pani', 'nahi', 'aa', 'pani nahi', 'nahi aa']);
    expect(features('pani nhi', { variants: false })).toEqual(['pani', 'nhi']);
    const m = train(ITEMS, { minDf: 1, variants: false });
    expect(m.tokenizer.variants).toBe(false);
  });

  test('predict shows no number; ranked holds at most three labels; words at most five', () => {
    const m = train(ITEMS, { minDf: 1 });
    const p = predict(m, 'AC ki service aur fridge thanda nahi');
    expect(Object.keys(p)).toEqual(['suggested', 'ranked', 'words']);
    expect(p.ranked.length).toBeLessThanOrEqual(3);
    expect(p.words.length).toBeLessThanOrEqual(5);
    expect(JSON.stringify(p)).not.toMatch(/\d/);
  });

  test('a model with one label has no runner-up: no words, no margin', () => {
    const m = train([{ text: 'AC service', label: 'ac_appliance_repair' }], { minDf: 1 });
    expect(predictDetailed(m, 'AC service')).toMatchObject({ suggested: 'ac_appliance_repair', words: [], margin: null });
  });
});

describe('the hybrid (6.4)', () => {
  // A SYNTHETIC fixture model, built here; nothing synthetic is imported by live code.
  const model = train([
    { text: 'mera kamra theek karna', label: 'home_maintenance' },
    { text: 'ghar mein chhota kaam theek karna', label: 'home_maintenance' },
    { text: 'nalka tapak raha', label: 'plumbing_sanitary' },
    { text: 'pani tapak raha', label: 'plumbing_sanitary' },
    { text: 'bijli ka kaam', label: 'electrical_solar' },
  ], { minDf: 1, trainedOn: { file: 'fixture', synthetic: true } });

  test('the rules give a trade -> the hybrid keeps it (source rules)', () => {
    const h = analyzeJob('Bathroom ka nalka tapak raha hai, plumber chahiye', { now: NOW, method: 'hybrid', model });
    expect(h.category).toMatchObject({ suggested: 'plumbing_sanitary', source: 'rules' });
    expect(h.method).toBe('hybrid');
    expect(h.versions.model).toBe(model.modelId);
  });

  test('the rules give nothing -> the classifier decides (source nb, with its words); the rules keep the rest', () => {
    const text = 'kal subah mera kamra theek karna hai, Lahore';
    expect(analyzeJob(text, { now: NOW }).category.suggested).toBeNull();
    const h = analyzeJob(text, { now: NOW, method: 'hybrid', model });
    expect(h.category).toMatchObject({ suggested: 'home_maintenance', tie: false, source: 'nb', matched: [] });
    expect(h.category.words.length).toBeGreaterThan(0);
    expect(h.city.suggested).toBe('Lahore');
    expect(h.when.suggested).toBe('tomorrow');
    expect(h.notes).not.toContain('no_trade_words');
    expect(h.missing).toEqual(['area']);
  });

  test('a tie of the rules -> the classifier decides; only the rules\' skills of that trade are kept', () => {
    const text = 'electrician aur plumber, nalka tapak raha';
    const rules = analyzeJob('electrician aur plumber', { now: NOW });
    expect(rules.category.tie).toBe(true);
    const h = analyzeJob('electrician aur plumber', { now: NOW, method: 'hybrid', model });
    expect(h.category.source).toBe('nb');
    expect(h.skills.every((s) => s.category === h.category.suggested)).toBe(true);
    expect(h.notes).not.toContain('category_tie');
    expect(analyzeJob(text, { now: NOW, method: 'hybrid', model }).category.source).toBe('rules');
  });

  test('method nb: always the classifier\'s trade, same output shape', () => {
    const n = analyzeJob('Bathroom ka nalka tapak raha hai', { now: NOW, method: 'nb', model });
    expect(n.category.source).toBe('nb');
    expect(Object.keys(n)).toEqual(Object.keys(analyzeJob('x', { now: NOW })));
    expect(JSON.stringify(n)).not.toMatch(/score|probab|confiden|%/i);
  });

  test('a task-type model is not a category model', () => {
    const task = train([{ text: 'AC lagana', label: 'install' }], { label: 'task_type', minDf: 1 });
    expect(() => analyzeJob('AC', { now: NOW, method: 'hybrid', model: task })).toThrow(/category model/);
  });
});

describe('the production loader check (6.6)', () => {
  const synthetic = train([{ text: 'AC service', label: 'ac_appliance_repair' }, { text: 'plumber', label: 'plumbing_sanitary' }], { minDf: 1, trainedOn: { file: 'x.synthetic.csv', synthetic: true } });
  const real = train([{ text: 'AC service', label: 'ac_appliance_repair' }, { text: 'plumber', label: 'plumbing_sanitary' }], { minDf: 1, trainedOn: { file: 'dev.csv', synthetic: false } });

  test('in production a model trained on synthetic data is refused: rules, one log line without text', () => {
    const log = vi.fn();
    expect(chooseLiveAnalyzer({ method: 'hybrid', model: synthetic, env: 'production', log })).toEqual({ method: 'rules', model: null, fallback: 'synthetic_model' });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toMatch(/synthetic/);
    expect(log.mock.calls[0][0]).not.toMatch(/AC service|plumber/);
  });

  test('outside production, or with a real model, the chosen method is used', () => {
    expect(chooseLiveAnalyzer({ method: 'hybrid', model: synthetic, env: 'test', log: vi.fn() })).toMatchObject({ method: 'hybrid', fallback: null });
    expect(chooseLiveAnalyzer({ method: 'nb', model: real, env: 'production', log: vi.fn() })).toMatchObject({ method: 'nb', fallback: null });
  });

  test('no model or a broken model -> rules', () => {
    expect(chooseLiveAnalyzer({ method: 'nb', model: null, log: vi.fn() }).fallback).toBe('no_model');
    expect(chooseLiveAnalyzer({ method: 'nb', model: { ...real, vocab: ['x'] }, log: vi.fn() }).fallback).toBe('invalid_model');
    expect(chooseLiveAnalyzer({ method: 'rules', log: vi.fn() })).toEqual({ method: 'rules', model: null, fallback: null });
  });

  test('the live analyzer of Batch 8A is the rules', () => {
    expect(liveAnalyzer()).toMatchObject({ method: 'rules', model: null });
    expect(analyzeLive('AC service', NOW).method).toBe('rules');
  });
});

describe('npm run jobs:try -- "..." --model <file>: also the classifier and the hybrid', () => {
  test('a synthetic fixture model is shown with the SYNTHETIC warning; a broken file is refused', async () => {
    const { mkdtempSync, writeFileSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { execFileSync, spawnSync } = await import('node:child_process');
    const dir = mkdtempSync(join(tmpdir(), 'dlm-try-'));
    const file = join(dir, 'fixture.synthetic.json');
    writeFileSync(file, JSON.stringify(train([
      { text: 'mera kamra theek karna', label: 'home_maintenance' }, { text: 'chhota kaam theek karna', label: 'home_maintenance' },
      { text: 'nalka tapak raha', label: 'plumbing_sanitary' }, { text: 'pani tapak raha', label: 'plumbing_sanitary' },
    ], { minDf: 1, trainedOn: { file: 'fixture', synthetic: true } })));
    const out = execFileSync(process.execPath, ['scripts/jobsTry.js', 'mera kamra theek karna hai', '--model', file, '--now', '2026-11-24T10:00:00+05:00'], { encoding: 'utf8' });
    expect(out).toMatch(/SYNTHETIC/);
    expect(out).toMatch(/Naive Bayes/);
    expect(out).toMatch(/Hybrid[\s\S]*trade \(category\)\s+home_maintenance/);
    writeFileSync(file, '{"kind":"other"}');
    const bad = spawnSync(process.execPath, ['scripts/jobsTry.js', 'AC', '--model', file], { encoding: 'utf8' });
    expect(bad.status).toBe(1);
    expect(bad.stderr).toMatch(/Could not use the model/);
  });
});
