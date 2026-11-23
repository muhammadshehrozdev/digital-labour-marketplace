// Module 6 (Batch 8A): the evaluation harness. Hand-worked numbers of 7.3 of the batch plan; split and
// cross-validation determinism and no leakage; the dataset checks; the pre-registered decision and claim rules.
// The only data used is the SYNTHETIC file (its numbers are never results).
import { describe, test, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  singleLabelReport, macroF1, mcnemar, holm, discordant, exactMatch, jaccard, bootstrapMacroF1, pairedBootstrapDiff,
} from '../../evaluation/job-analysis/metrics.js';
import { loadJobDataset, parseJobCsv, toCsv } from '../../evaluation/job-analysis/dataset.js';
import { stratifiedSplit, assignFolds, crossValidate, examplesFor, trainFold, shuffle } from '../../evaluation/job-analysis/cv.js';
import { runSplit, insideRepo, REPO_ROOT } from '../../evaluation/job-analysis/split.js';
import { runTraining, moduleText } from '../../evaluation/job-analysis/train.js';
import { evaluateJobs, liveDecision, claimFor, runEvaluation } from '../../evaluation/job-analysis/evaluate.js';
import { jobAgreement } from '../../evaluation/job-analysis/agreement.js';
import { buildSystems, majorityLabel } from '../../evaluation/job-analysis/systems.js';
import { train, features, checkModel } from '../../services/jobAnalyzer/naiveBayes.js';
import { seededRandom } from '../../evaluation/skill-extraction/metrics.js';

const DIR = join(process.cwd(), 'evaluation', 'job-analysis');
const ALL = join(DIR, 'dataset.synthetic.all.csv');
const B = join(DIR, 'dataset.synthetic.annotator-b.csv');
const r4 = (x) => Math.round(x * 10000) / 10000;

describe('single-label metrics (7.3, hand-worked)', () => {
  test('gold [A, A, B, B], predicted [A, B, B, none]', () => {
    const r = singleLabelReport(['A', 'A', 'B', 'B'], ['A', 'B', 'B', null]);
    expect([r.accuracy, r.coverage, r4(r.selectiveAccuracy)]).toEqual([0.5, 0.75, 0.6667]);
    expect([r4(r.perClass.A.f1), r.perClass.B.f1, r4(r.macroF1)]).toEqual([0.6667, 0.5, 0.5833]);
    expect(r.perClass.B).toMatchObject({ tp: 1, fp: 1, fn: 1 }); // the missing answer is a false negative of B only
    expect(r.confusion).toEqual({ A: { A: 1, B: 1 }, B: { B: 1, '(no answer)': 1 } });
    expect(r4(macroF1(['A', 'A', 'B', 'B'], ['A', 'B', 'B', null]))).toBe(0.5833);
  });

  test('a class that is only predicted counts in macro-F1; nothing answered gives no selective accuracy', () => {
    expect(singleLabelReport(['A'], ['C']).classesCounted).toBe(2);
    expect(singleLabelReport(['A', 'B'], [null, null])).toMatchObject({ coverage: 0, selectiveAccuracy: null, accuracy: 0 });
    expect(() => singleLabelReport(['A'], [])).toThrow();
  });

  test('bootstrap intervals are repeatable (seed 20261124) and contain the observed value here', () => {
    const gold = ['A', 'A', 'B', 'B', 'A', 'B', 'A', 'B'];
    const pred = ['A', 'B', 'B', null, 'A', 'B', 'A', 'A'];
    const a = bootstrapMacroF1(gold, pred);
    expect(bootstrapMacroF1(gold, pred)).toEqual(a);
    expect(a.seed).toBe(20261124);
    expect(a.resamples).toBe(1000);
    expect(a.low).toBeLessThanOrEqual(macroF1(gold, pred));
    expect(a.high).toBeGreaterThanOrEqual(macroF1(gold, pred));
    const d = pairedBootstrapDiff(gold, pred, pred);
    expect([d.accuracy.observed, d.accuracy.low, d.accuracy.high, d.macroF1.low]).toEqual([0, 0, 0, 0]);
  });
});

describe("McNemar's exact test and the mid-p (7.3, hand-worked)", () => {
  test.each([
    [1, 7, 0.0703, 0.0391], // Fagerland et al. 2013, supplement
    [1, 6, 0.125, 0.0703],
    [0, 5, 0.0625, 0.0313],
    [2, 2, 1, 1],
    [0, 0, 1, 1],
    [3, 12, 0.0352, 0.0213],
  ])('(b, c) = (%i, %i)', (b, c, exact, mid) => {
    const r = mcnemar(b, c);
    expect([r4(r.exactP), r4(r.midP)]).toEqual([exact, mid]);
  });
  test('(0, 5) mid-p is exactly 1/32; symmetric in b and c; bad input refused', () => {
    expect(mcnemar(0, 5).midP).toBeCloseTo(0.03125, 12);
    expect(mcnemar(7, 1)).toMatchObject({ exactP: mcnemar(1, 7).exactP });
    expect(() => mcnemar(-1, 2)).toThrow();
  });
  test('discordant pairs from predictions', () => {
    expect(discordant(['A', 'A', 'B', 'B'], ['A', 'B', 'B', 'A'], ['B', 'A', 'B', null])).toEqual({ b: 1, c: 1 });
  });
});

describe("Holm's correction (7.3, hand-worked)", () => {
  test('p = {0.010, 0.040, 0.030}, alpha 0.05 -> only the 0.010 comparison is significant', () => {
    const r = holm([{ name: 'rules-nb', p: 0.01 }, { name: 'rules-hybrid', p: 0.04 }, { name: 'nb-hybrid', p: 0.03 }], 0.05);
    expect(r.map((x) => x.significant)).toEqual([true, false, false]);
    expect(r.map((x) => r4(x.adjustedP))).toEqual([0.03, 0.06, 0.06]);
  });
});

describe('field and agreement metrics', () => {
  test('exact match: "not stated" and no suggestion is a match', () => {
    const r = exactMatch([{ gold: null, pred: null }, { gold: 'Lahore', pred: 'Lahore' }, { gold: 'Lahore', pred: null }, { gold: null, pred: 'Karachi' }]);
    expect([r.correct, r.items, r.value]).toEqual([2, 4, 0.5]);
  });
  test('Jaccard', () => {
    expect(jaccard(new Set(), new Set())).toBe(1);
    expect(jaccard(new Set(['a', 'b']), new Set(['b', 'c']))).toBeCloseTo(1 / 3, 12);
  });
});

describe('the dataset format (7.2)', () => {
  const HEADER = 'id,source,prompt,script,text,gold_category,gold_skills,gold_task_type,gold_city,gold_when,gold_time_slot,gold_budget_amount,gold_budget_unit,gold_urgent';
  const one = (cells) => parseJobCsv(`${HEADER}\n${cells}\n`);
  test('a good row; "none" is allowed', () => {
    const { items } = one('j-1,form,general,roman_urdu,"AC service, kal",ac_appliance_repair,ac_service,service,Lahore,tomorrow,morning,2000,job,no');
    expect(items[0].gold).toMatchObject({ category: 'ac_appliance_repair', taskType: 'service', city: 'Lahore', when: 'tomorrow', timeSlot: 'morning', budget: { amount: 2000, unit: 'job' }, urgent: false });
    expect(one('j-2,other,targeted,urdu,x,none,,,,,,,,yes').items[0].gold).toMatchObject({ category: 'none', taskType: null, urgent: true });
  });
  test.each([
    ['j-1,form,general,roman_urdu,x,plumbing,,,,,,,,no', /unknown category/],
    ['j-1,form,general,roman_urdu,x,none,plumb_magic,,,,,,,no', /unknown skill id/],
    ['j-1,form,general,klingon,x,none,,,,,,,,no', /script/],
    ['j-1,web,general,roman_urdu,x,none,,,,,,,,no', /source/],
    ['j-1,form,general,roman_urdu,x,none,,,Pindi,,,,,no', /English city name/],
    ['j-1,form,general,roman_urdu,x,none,,,,,,2000,,no', /both/],
    ['j-1,form,general,roman_urdu,x,none,,,,,,20.5,job,no', /whole rupees/],
    ['j-1,form,general,roman_urdu,x,none,,,,,,,,maybe', /gold_urgent/],
    ['j-1,form,general,roman_urdu,x,none,,fixing,,,,,,no', /gold_task_type/],
    ['j-1,form,general,roman_urdu, ,none,,,,,,,,no', /text is empty/],
  ])('%s', (row, error) => expect(() => one(row)).toThrow(error));
  test('review finding 5: only the file name or the FIRST line marks a file as synthetic; a byte-order mark is ignored', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'dlm-syn-'));
    const body = readFileSync(ALL, 'utf8').split('\n').filter((l) => !l.startsWith('#')).join('\n');
    const real = join(tmp, 'gold.csv');
    writeFileSync(real, `# Gold file, real data, not synthetic (labelled by two people)\n${body}`);
    expect(loadJobDataset(real).synthetic).toBe(false);
    const marked = join(tmp, 'marked.csv');
    writeFileSync(marked, `\uFEFF# SYNTHETIC test file\n${body}`);
    const d = loadJobDataset(marked);
    expect(d.synthetic).toBe(true);
    expect(d.items.length).toBe(120);
    const bom = join(tmp, 'export.csv');
    writeFileSync(bom, `\uFEFF${body}`);
    expect(loadJobDataset(bom)).toMatchObject({ synthetic: false });
    expect(loadJobDataset(join(tmp, '..', tmp.split(/[\\/]/).pop(), 'gold.csv')).file).toBe('gold.csv');
  });

  test('duplicate ids and a missing column are refused', () => {
    expect(() => parseJobCsv(`${HEADER}\nj-1,form,general,urdu,x,none,,,,,,,,no\nj-1,form,general,urdu,y,none,,,,,,,,no\n`)).toThrow(/Duplicate/);
    expect(() => parseJobCsv('id,text\nj-1,x\n')).toThrow(/missing/);
  });
  test('the synthetic file loads, says SYNTHETIC in its first line, and writes back unchanged', () => {
    const d = loadJobDataset(ALL);
    expect(d.synthetic).toBe(true);
    expect(readFileSync(ALL, 'utf8').split('\n')[0]).toMatch(/^# SYNTHETIC/);
    expect(d.items.length).toBe(120);
    expect(new Set(d.items.map((i) => i.gold.category)).size).toBe(10); // 9 trades and "none"
    expect(new Set(d.items.map((i) => i.script))).toEqual(new Set(['english', 'roman_urdu', 'urdu', 'mixed']));
    expect(toCsv(d)).toBe(readFileSync(ALL, 'utf8'));
  });
});

describe('split (7.5): stratified, seeded, repeatable', () => {
  const { items } = loadJobDataset(ALL);
  test('the same file and seed give the same split; 40% of each stratum (rounded) to development', () => {
    const a = stratifiedSplit(items);
    expect(stratifiedSplit(items)).toEqual(a);
    expect(a.seed).toBe(20261124);
    for (const s of Object.values(a.strata)) expect(s.dev).toBe(Math.round(0.4 * s.items));
    expect(new Set([...a.dev, ...a.test]).size).toBe(items.length);
    expect(a.dev.filter((id) => a.test.includes(id))).toEqual([]);
    expect(stratifiedSplit(items, { seed: 1 }).dev).not.toEqual(a.dev);
  });
  test('Fisher-Yates with the seeded generator is repeatable and a permutation', () => {
    const x = shuffle([1, 2, 3, 4, 5, 6], seededRandom(20261124));
    expect(shuffle([1, 2, 3, 4, 5, 6], seededRandom(20261124))).toEqual(x);
    expect([...x].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  test('a real (non-synthetic) file is never written inside the project', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'dlm-split-'));
    const real = join(tmp, 'all.csv');
    writeFileSync(real, readFileSync(ALL, 'utf8').split('\n').filter((l) => !l.startsWith('#')).join('\n'));
    expect(insideRepo(join(REPO_ROOT, 'backend', 'evaluation', 'job-analysis', 'data'))).toBe(true);
    expect(insideRepo(tmp)).toBe(false);
    expect(() => runSplit({ file: real, outDir: join(REPO_ROOT, 'backend', 'evaluation', 'job-analysis', 'data'), resultsDir: tmp })).toThrow(/OUTSIDE the project/);
    const ok = runSplit({ file: real, outDir: join(tmp, 'out'), resultsDir: tmp });
    expect(ok.record.synthetic).toBe(false);
    expect(ok.recordPath).toMatch(/[\\/]split-\d{4}-\d{2}-\d{2}-[0-9a-f]{8}\.json$/);
    expect(JSON.stringify(ok.record)).not.toMatch(/"text"|wiring|Pankha/); // ids and hashes only
  });
  test('a synthetic split writes SYNTHETIC- records and *.synthetic.csv files', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'dlm-split-'));
    const r = runSplit({ file: ALL, outDir: tmp, resultsDir: tmp });
    expect(r.recordPath).toMatch(/SYNTHETIC-split-/);
    expect(r.devPath).toMatch(/dev\.synthetic\.csv$/);
    expect(readFileSync(r.testPath, 'utf8').split('\n')[0]).toMatch(/^# SYNTHETIC/);
    expect(loadJobDataset(r.devPath).items.length + loadJobDataset(r.testPath).items.length).toBe(120);
  });
});

describe('cross-validation (7.5): no leakage, the fixed tie rule', () => {
  const { items } = loadJobDataset(ALL);
  const examples = examplesFor(items, 'category');
  test('"none" items are not category examples; empty task types are not task examples', () => {
    expect(examples.length).toBe(110);
    expect(examplesFor(items, 'task_type').length).toBe(items.filter((i) => i.gold.taskType).length);
    expect(() => examplesFor(items, 'city')).toThrow();
  });
  test('folds: repeatable, round-robin, about the same size', () => {
    const f = assignFolds(examples, { label: 'category' });
    expect(assignFolds(examples, { label: 'category' })).toEqual(f);
    const sizes = [0, 1, 2, 3, 4].map((k) => [...f.values()].filter((v) => v === k).length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });
  test('the vocabulary of each training fold comes only from that fold (no leakage)', () => {
    const f = assignFolds(examples, { label: 'category' });
    for (let k = 0; k < 5; k += 1) {
      const model = trainFold(examples, f, k, { alpha: 1, ngram: 1, minDf: 1 }, 'category');
      const trainFeatures = new Set(examples.filter((e) => f.get(e.id) !== k).flatMap((e) => features(e.text)));
      expect(model.vocab.every((w) => trainFeatures.has(w))).toBe(true);
      expect(model.trainedOn.items).toBe(examples.filter((e) => f.get(e.id) !== k).length);
    }
  });
  test('the grid has 12 settings; ties go to the larger alpha, then ngram 1, then minDf 3', () => {
    const tiny = [
      { id: 'a', text: 'pipe leak', label: 'plumbing_sanitary' }, { id: 'b', text: 'pipe tap', label: 'plumbing_sanitary' },
      { id: 'c', text: 'fan wire', label: 'electrical_solar' }, { id: 'd', text: 'fan bulb', label: 'electrical_solar' },
    ];
    const cv = crossValidate(tiny, { label: 'category' });
    expect(cv.rows.length).toBe(12);
    // with these four items every setting gets the same score, so the tie rule decides
    expect(new Set(cv.rows.map((r) => r.rounded)).size).toBe(1);
    expect(cv.chosen).toEqual({ alpha: 1, ngram: 1, minDf: 3 });
    expect(cv.classesInFewerFolds.map((c) => c.label).sort()).toEqual(['electrical_solar', 'plumbing_sanitary']);
  });
});

describe('training, evaluation and agreement on the SYNTHETIC file (the scripts work; no result)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'dlm-train-'));
  const { devPath, testPath } = runSplit({ file: ALL, outDir: tmp, resultsDir: tmp });

  test('jobs:train writes a checked model and its no-variants twin; the same input gives the same model', () => {
    const out = join(tmp, 'model.json');
    const r = runTraining({ file: devPath, params: { minDf: 2 }, out });
    expect(r.written).toEqual([out, join(tmp, 'model.no-variants.json')]);
    const saved = checkModel(JSON.parse(readFileSync(out, 'utf8')));
    expect(saved.trainedOn).toMatchObject({ file: 'dev.synthetic.csv', synthetic: true });
    expect(JSON.parse(readFileSync(join(tmp, 'model.no-variants.json'), 'utf8')).tokenizer.variants).toBe(false);
    expect(runTraining({ file: devPath, params: { minDf: 2 } }).model.modelId).toBe(saved.modelId);
    expect(r.rare.length).toBeLessThanOrEqual(30);
    expect(() => runTraining({ file: devPath, params: { minDf: 1 } })).toThrow(/minDf/);
    expect(moduleText(saved)).toMatch(/^\/\/ Generated by npm run jobs:train/);
    expect(moduleText(saved)).toContain('export default {');
  });

  test('jobs:train --cv chooses from the grid; a task-type model too', () => {
    const r = runTraining({ file: devPath, cv: true });
    expect(r.report.cv.rows.length).toBe(12);
    expect(r.model.params).toEqual(r.report.cv.chosen);
    expect(runTraining({ file: devPath, label: 'task_type', params: { minDf: 2 } }).model.label).toBe('task_type');
  });

  test('evaluate:jobs: every system, the claim family, the decision, and ids only (never text)', () => {
    const out = join(tmp, 'model.json');
    runTraining({ file: devPath, params: { minDf: 2 }, out });
    const taskOut = join(tmp, 'task.json');
    runTraining({ file: devPath, label: 'task_type', params: { minDf: 2 }, out: taskOut });
    const report = runEvaluation({ file: testPath, modelPath: out, taskModelPath: taskOut });
    expect(report.synthetic).toBe(true);
    expect(report.warning).toMatch(/SYNTHETIC/);
    expect(Object.keys(report.category.systems)).toEqual(['rules', 'rules_no_phrases', 'rules_no_variants', 'rules_no_phrase_unlock', 'baseline_module2', 'baseline_majority', 'nb', 'nb_no_variants', 'hybrid']);
    expect(report.category.claimFamily.map((c) => `${c.a}-${c.b}`)).toEqual(['rules-nb', 'rules-hybrid', 'nb-hybrid']);
    expect(report.category.claims).toHaveLength(3);
    expect(report.category.claims[0]).toMatch(/rules.*nb|nb.*rules/);
    expect(report.category.items).toBe(report.dataset.itemsWithCategory);
    expect(['rules', 'nb', 'hybrid']).toContain(report.category.liveDecision.method);
    expect(report.taskType.comparison).toMatchObject({ a: 'rules', b: 'nb' });
    expect(report.models.category.modelId).toMatch(/^[0-9a-f]{12}$/);
    // review finding 4 (PROTOCOL.md "Protocol changes" 1): the whole report per script and per prompt, with intervals
    const byScript = Object.values(report.category.systems.rules.byScript)[0];
    expect(Object.keys(byScript)).toEqual(expect.arrayContaining(['accuracy', 'wilson95', 'coverage', 'selectiveAccuracy', 'macroF1', 'perClass', 'confusion', 'bootstrap95MacroF1']));
    expect(Object.keys(Object.values(report.category.systems.nb.byPrompt)[0])).toContain('bootstrap95MacroF1');
    const keys = new Set();
    const walk = (v) => { if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); } };
    walk(report);
    expect(keys.has('text')).toBe(false);
    const json = JSON.stringify(report);
    for (const it of loadJobDataset(testPath).items) expect(json).not.toContain(it.text);
  });

  test('agreement:jobs on the two synthetic annotators', () => {
    const r = jobAgreement(loadJobDataset(ALL).items, loadJobDataset(B).items);
    expect(Object.keys(r.fields)).toEqual(['category', 'taskType', 'script', 'city', 'when', 'timeSlot', 'urgent']);
    expect(r.fields.category.cohensKappa).toBeLessThan(1);
    expect(r.fields.category.cohensKappa).toBeGreaterThan(0);
    expect(r.disagreements.length).toBeGreaterThan(0);
    expect(r.skills.meanJaccard).toBeLessThan(1);
    expect(() => jobAgreement(loadJobDataset(ALL).items, loadJobDataset(B).items.slice(1))).toThrow(/same ids/);
  });
});

describe('the pre-registered rules (PROTOCOL.md steps 7 and 8)', () => {
  test.each([
    [{ rules: 0.80, nb: 0.82, hybrid: 0.81 }, 'rules'], // gain 0.02 < 0.03
    [{ rules: 0.80, nb: 0.83, hybrid: 0.70 }, 'nb'], // gain exactly 0.03, nb clearly better
    [{ rules: 0.80, nb: 0.84, hybrid: 0.835 }, 'hybrid'], // within 0.01 -> hybrid
    [{ rules: 0.70, nb: 0.75, hybrid: 0.80 }, 'hybrid'],
    [{ rules: 0.70, nb: null, hybrid: 0.80 }, null],
  ])('%j -> %s', (acc, method) => expect(liveDecision(acc).method).toBe(method));

  test('claims: "more accurate" only when Holm-adjusted exact p < 0.05 and the test set has 60+ items', () => {
    const sig = { a: 'rules', b: 'nb', exactP: 0.004, adjustedP: 0.012, significant: true };
    expect(claimFor(sig, 0.7, 0.8, 100)).toMatch(/^nb is more accurate than rules on 100 items/);
    expect(claimFor({ ...sig, significant: false, adjustedP: 0.2 }, 0.7, 0.8, 100)).toMatch(/^No significant difference was found between rules and nb on 100 items/);
    expect(claimFor(sig, 0.7, 0.8, 59)).toMatch(/no "better than" claim/);
  });

  test('the majority baseline is the largest prior of the development model', () => {
    const m = train([{ text: 'a', label: 'plumbing_sanitary' }, { text: 'b', label: 'plumbing_sanitary' }, { text: 'c', label: 'electrical_solar' }], { minDf: 1 });
    expect(majorityLabel(m)).toBe('plumbing_sanitary');
    expect(buildSystems({ model: m }).baseline_majority('anything').category).toBe('plumbing_sanitary');
    expect(Object.keys(buildSystems({ model: m }))).not.toContain('nb_no_variants');
    const d = evaluateJobs({ items: [], file: 'x', sha256: 'y', synthetic: true }, { model: m });
    expect(d.category.items).toBe(0);
  });
});
