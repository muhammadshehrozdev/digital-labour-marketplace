// Module 6: evaluates the job analyzers on a labelled TEST file (protocol step 6; run ONCE on the real test file).
// Run in ./backend:
//   npm run evaluate:jobs -- --file <test.csv> --model <model.json> [--nv-model <model.no-variants.json>]
//                            [--task-model <task-model.json>] [--out <folder>]
// --nv-model defaults to <model>.no-variants.json next to --model (written by jobs:train).
//
// Writes results/<SYNTHETIC->date-<dataset sha8>.json: the dataset and model hashes, the Git commit, every metric of
// every system, the pre-registered decision and claims (docs/evaluation/job-analysis/PROTOCOL.md), and the per-item
// predictions with ids ONLY (never text). A synthetic file's numbers only prove that the script works.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_IDS, TAXONOMY_VERSION } from '../../config/skillTaxonomy.js';
import { TASK_TYPES } from '../../config/jobRules.js';
import { JOB_PHRASES_VERSION } from '../../config/jobPhrases.js';
import { ANALYZER_VERSION } from '../../config/jobAnalyzer.js';
import { checkModel } from '../../services/jobAnalyzer/naiveBayes.js';
import { loadJobDataset, NONE, SCRIPTS, PROMPTS } from './dataset.js';
import { buildSystems, taskTypeSystems } from './systems.js';
import {
  singleLabelReport, bootstrapMacroF1, mcnemar, discordant, holm, pairedBootstrapDiff, exactMatch, microMacro, RESAMPLES, SEED,
} from './metrics.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

// The pre-registered rules (PROTOCOL.md steps 7 and 8). TOL only absorbs floating-point noise of k/n fractions.
export const PROTOCOL = Object.freeze({ LIVE_GAIN: 0.03, CLOSE: 0.01, ALPHA: 0.05, MIN_TEST_FOR_CLAIMS: 60, TOL: 1e-9 });
export const CLAIM_FAMILY = Object.freeze([['rules', 'nb'], ['rules', 'hybrid'], ['nb', 'hybrid']]);

// Step 7: which method goes live.
export function liveDecision(acc) {
  const { rules, nb, hybrid } = acc;
  if ([rules, nb, hybrid].some((x) => typeof x !== 'number')) return { method: null, reason: 'not computed: rules, nb and hybrid are all needed' };
  const best = Math.max(nb, hybrid);
  if (best - rules < PROTOCOL.LIVE_GAIN - PROTOCOL.TOL) return { method: 'rules', reason: `max(Acc_nb, Acc_hybrid) - Acc_rules = ${(best - rules).toFixed(4)} < ${PROTOCOL.LIVE_GAIN}: rules stay live` };
  if (Math.abs(nb - hybrid) <= PROTOCOL.CLOSE + PROTOCOL.TOL) return { method: 'hybrid', reason: `gain ${(best - rules).toFixed(4)} >= ${PROTOCOL.LIVE_GAIN}; nb and hybrid within ${PROTOCOL.CLOSE}: hybrid (keeps the rules' explanations)` };
  return { method: nb > hybrid ? 'nb' : 'hybrid', reason: `gain ${(best - rules).toFixed(4)} >= ${PROTOCOL.LIVE_GAIN}: the better of nb and hybrid` };
}

// Step 8: what the report may claim.
export function claimFor(cmp, accA, accB, items) {
  if (items < PROTOCOL.MIN_TEST_FOR_CLAIMS) return `${cmp.a} vs ${cmp.b}: numbers only; the test set has ${items} items (fewer than ${PROTOCOL.MIN_TEST_FOR_CLAIMS}), so no "better than" claim is made.`;
  if (!cmp.significant) return `No significant difference was found between ${cmp.a} and ${cmp.b} on ${items} items (McNemar exact p = ${cmp.exactP.toFixed(4)}, Holm-adjusted ${cmp.adjustedP.toFixed(4)}).`;
  const [better, worse] = accA >= accB ? [cmp.a, cmp.b] : [cmp.b, cmp.a];
  return `${better} is more accurate than ${worse} on ${items} items (McNemar exact p = ${cmp.exactP.toFixed(4)}, Holm-adjusted ${cmp.adjustedP.toFixed(4)} < ${PROTOCOL.ALPHA}).`;
}

function gitInfo() {
  try {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: HERE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: HERE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() !== '';
    return { commit, dirty };
  } catch {
    return { commit: null, dirty: null };
  }
}

// Two systems on the same items: onlyA / onlyB = the discordant pairs (McNemar's b and c), the exact and mid-p
// values, and the paired bootstrap of the accuracy and macro-F1 differences (A - B).
export function pairedTest(gold, predA, predB) {
  const { b, c } = discordant(gold, predA, predB);
  const m = mcnemar(b, c);
  return { onlyA: b, onlyB: c, discordantPairs: m.n, exactP: m.exactP, midP: m.midP, pairedBootstrap: pairedBootstrapDiff(gold, predA, predB) };
}

const brief = (r) => ({ items: r.items, accuracy: r.accuracy, coverage: r.coverage, selectiveAccuracy: r.selectiveAccuracy, macroF1: r.macroF1 });
const sameBudget = (a, b) => a.amount === b.amount && a.unit === b.unit;

/**
 * dataset: loadJobDataset(); models: { model, nvModel?, taskModel? } (checked); info: hashes and file names.
 */
export function evaluateJobs(dataset, { model, nvModel = null, taskModel = null, info = {} }) {
  const systems = buildSystems({ model, nvModel });
  const names = Object.keys(systems);
  const preds = Object.fromEntries(names.map((n) => [n, dataset.items.map((it) => systems[n](it.text))]));

  // ---- category (main)
  const withCat = dataset.items.map((it, i) => ({ it, i })).filter(({ it }) => it.gold.category !== NONE);
  const noneItems = dataset.items.map((it, i) => ({ it, i })).filter(({ it }) => it.gold.category === NONE);
  const gold = withCat.map(({ it }) => it.gold.category);
  const catOf = (n) => withCat.map(({ i }) => preds[n][i].category);
  const category = { items: withCat.length, systems: {}, abstentionOnNone: {} };
  for (const n of names) {
    const p = catOf(n);
    const subset = (key, value) => {
      const idx = withCat.map(({ it }, j) => (it[key] === value ? j : -1)).filter((j) => j >= 0);
      return idx.length ? brief(singleLabelReport(idx.map((j) => gold[j]), idx.map((j) => p[j]), { order: CATEGORY_IDS })) : null;
    };
    category.systems[n] = {
      ...singleLabelReport(gold, p, { order: CATEGORY_IDS }),
      bootstrap95MacroF1: bootstrapMacroF1(gold, p),
      byScript: Object.fromEntries(SCRIPTS.map((s) => [s, subset('script', s)]).filter(([, v]) => v)),
      byPrompt: Object.fromEntries(PROMPTS.map((s) => [s, subset('prompt', s)]).filter(([, v]) => v)),
    };
    const abstained = noneItems.filter(({ i }) => preds[n][i].category === null).length;
    category.abstentionOnNone[n] = { items: noneItems.length, noCategory: abstained, value: noneItems.length ? abstained / noneItems.length : null };
  }
  const compare = (a, b) => ({ a, b, ...pairedTest(gold, catOf(a), catOf(b)) });
  const family = CLAIM_FAMILY.filter(([a, b]) => systems[a] && systems[b]).map(([a, b]) => compare(a, b));
  const corrected = holm(family.map((c) => ({ name: `${c.a}-${c.b}`, p: c.exactP })), PROTOCOL.ALPHA);
  category.claimFamily = family.map((c, k) => ({ ...c, adjustedP: corrected[k].adjustedP, significant: corrected[k].significant }));
  category.descriptive = names.filter((n) => n !== 'rules' && !['nb', 'hybrid'].includes(n)).map((n) => ({ ...compare('rules', n), note: 'descriptive only; not part of the claim family' }));
  const acc = Object.fromEntries(['rules', 'nb', 'hybrid'].map((n) => [n, category.systems[n]?.accuracy ?? null]));
  category.liveDecision = liveDecision(acc);
  category.claims = category.claimFamily.map((c) => claimFor(c, acc[c.a], acc[c.b], withCat.length));

  // ---- skills (descriptive)
  const skills = Object.fromEntries(names.filter((n) => n !== 'baseline_majority').map((n) => {
    const mm = microMacro(dataset.items.map((it, i) => ({ gold: it.gold.skills, predicted: preds[n][i].skills })));
    return [n, { micro: mm.micro, macro: mm.macro }];
  }));

  // ---- task type (secondary): items with an empty gold task type are left out
  const tt = taskTypeSystems({ taskModel });
  const ttItems = dataset.items.filter((it) => it.gold.taskType);
  const ttGold = ttItems.map((it) => it.gold.taskType);
  const ttPred = Object.fromEntries(Object.entries(tt).map(([n, f]) => [n, ttItems.map((it) => f(it.text))]));
  const taskType = {
    items: ttItems.length,
    leftOutEmptyGold: dataset.items.length - ttItems.length,
    systems: Object.fromEntries(Object.entries(ttPred).map(([n, p]) => [n, { ...singleLabelReport(ttGold, p, { order: TASK_TYPES }), bootstrap95MacroF1: bootstrapMacroF1(ttGold, p) }])),
    comparison: ttPred.nb ? { a: 'rules', b: 'nb', ...pairedTest(ttGold, ttPred.rules, ttPred.nb) } : null,
  };

  // ---- the other fields (exact match; "not stated" and no suggestion count as a match)
  const fields = Object.fromEntries(names.filter((n) => preds[n][0]?.hasFields !== false).map((n) => {
    const pairs = (get, predGet) => dataset.items.map((it, i) => ({ gold: get(it.gold), pred: predGet(preds[n][i]) }));
    return [n, {
      city: exactMatch(pairs((g) => g.city, (p) => p.city)),
      when: exactMatch(pairs((g) => g.when, (p) => p.when)),
      timeSlot: exactMatch(pairs((g) => g.timeSlot, (p) => p.timeSlot)),
      budget: exactMatch(pairs((g) => g.budget, (p) => p.budget), sameBudget),
      urgent: exactMatch(pairs((g) => g.urgent, (p) => p.urgent)),
    }];
  }));

  const git = gitInfo();
  return {
    synthetic: dataset.synthetic,
    warning: dataset.synthetic ? 'SYNTHETIC DATA: these numbers only test the script. Never report them as results.' : null,
    dataset: { file: dataset.file, sha256: dataset.sha256, items: dataset.items.length, itemsWithCategory: withCat.length, itemsNone: noneItems.length },
    models: info.models ?? null,
    versions: { analyzer: ANALYZER_VERSION, phrases: JOB_PHRASES_VERSION, taxonomy: TAXONOMY_VERSION },
    gitCommit: git.commit,
    gitDirty: git.dirty,
    date: new Date().toISOString(),
    resamples: RESAMPLES,
    seed: SEED,
    category,
    skills,
    taskType,
    fields,
    // ids only, never text
    predictions: dataset.items.map((it, i) => ({
      id: it.id,
      script: it.script,
      prompt: it.prompt,
      gold: { category: it.gold.category, taskType: it.gold.taskType },
      systems: Object.fromEntries(names.map((n) => {
        const p = preds[n][i];
        return [n, { category: p.category, skills: [...p.skills], taskType: p.taskType, city: p.city, when: p.when, timeSlot: p.timeSlot, budget: p.budget, urgent: p.urgent }];
      })),
      taskTypeNb: ttPred.nb ? ttPred.nb[ttItems.indexOf(it)] ?? null : null,
    })),
  };
}

const readModel = (path) => {
  const content = readFileSync(path, 'utf8');
  return { model: checkModel(JSON.parse(content)), info: { file: path.split(/[\\/]/).pop(), sha256: sha256(content) } };
};

export function writeJobResults(report, outDir = join(HERE, 'results')) {
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, `${report.synthetic ? 'SYNTHETIC-' : ''}${report.date.slice(0, 10)}-${report.dataset.sha256.slice(0, 8)}.json`);
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
  return path;
}

export function runEvaluation({ file, modelPath, nvModelPath, taskModelPath }) {
  const dataset = loadJobDataset(file);
  const main = readModel(modelPath);
  const nvPath = nvModelPath ?? modelPath.replace(/\.json$/i, '') + '.no-variants.json';
  const nv = existsSync(nvPath) ? readModel(nvPath) : null;
  const task = taskModelPath ? readModel(taskModelPath) : null;
  if (main.model.label !== 'category') throw new Error('--model must be a category model');
  if (task && task.model.label !== 'task_type') throw new Error('--task-model must be a task_type model');
  const describe = (m) => (m ? { ...m.info, modelId: m.model.modelId, params: m.model.params, trainedOn: m.model.trainedOn } : null);
  return evaluateJobs(dataset, { model: main.model, nvModel: nv?.model ?? null, taskModel: task?.model ?? null, info: { models: { category: describe(main), noVariants: describe(nv), taskType: describe(task) } } });
}

const pct = (x) => (x === null || x === undefined || Number.isNaN(x) ? '  n/a' : `${(x * 100).toFixed(1).padStart(5)}`);

export function printJobReport(r) {
  if (r.synthetic) console.log(`\n*** ${r.warning} ***\n`);
  console.log(`Dataset ${r.dataset.file} (${r.dataset.items} items: ${r.dataset.itemsWithCategory} with a trade, ${r.dataset.itemsNone} "none"), sha256 ${r.dataset.sha256.slice(0, 12)}…`);
  console.log(`Analyzer ${r.versions.analyzer}, phrases ${r.versions.phrases}, commit ${r.gitCommit ?? 'unknown'}${r.gitDirty ? ' (uncommitted changes!)' : ''}`);
  console.log('\nTrade (category)                accuracy [Wilson 95%]   coverage  selective  macro-F1 [bootstrap 95%]   no trade on "none"');
  for (const [n, s] of Object.entries(r.category.systems)) {
    const ab = r.category.abstentionOnNone[n];
    console.log(`${n.padEnd(31)} ${pct(s.accuracy)} [${pct(s.wilson95.low)},${pct(s.wilson95.high)}]   ${pct(s.coverage)}     ${pct(s.selectiveAccuracy)}     ${pct(s.macroF1)} [${pct(s.bootstrap95MacroF1.low)},${pct(s.bootstrap95MacroF1.high)}]       ${ab.noCategory}/${ab.items}`);
  }
  console.log('\nClaim family (McNemar exact, Holm over three):');
  for (const c of r.category.claimFamily) console.log(`  ${c.a} vs ${c.b}: only ${c.a} right ${c.onlyA}, only ${c.b} right ${c.onlyB}  exact p ${c.exactP.toFixed(4)}  mid-p ${c.midP.toFixed(4)}  Holm ${c.adjustedP.toFixed(4)}  acc diff ${pct(c.pairedBootstrap.accuracy.observed)} [${pct(c.pairedBootstrap.accuracy.low)},${pct(c.pairedBootstrap.accuracy.high)}]`);
  for (const c of r.category.claims) console.log(`  - ${c}`);
  console.log(`\nWhich method goes live (pre-registered rule): ${r.category.liveDecision.method ?? 'n/a'} — ${r.category.liveDecision.reason}`);
  console.log(`\nTask type (${r.taskType.items} items; ${r.taskType.leftOutEmptyGold} left out with no gold task type):`);
  for (const [n, s] of Object.entries(r.taskType.systems)) console.log(`  ${n.padEnd(8)} accuracy ${pct(s.accuracy)}  coverage ${pct(s.coverage)}  macro-F1 ${pct(s.macroF1)}`);
  const f = r.fields.rules;
  if (f) console.log(`\nOther fields (rules, exact match): city ${pct(f.city.value)}  day ${pct(f.when.value)}  time ${pct(f.timeSlot.value)}  budget ${pct(f.budget.value)}  urgent ${pct(f.urgent.value)}`);
  const sk = r.skills.rules;
  if (sk) console.log(`Skills (rules): micro P ${pct(sk.micro.precision)} R ${pct(sk.micro.recall)} F1 ${pct(sk.micro.f1)}; macro F1 ${pct(sk.macro.f1)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? undefined : process.argv[i + 1]; };
  if (!arg('file') || !arg('model')) {
    console.error('Usage: npm run evaluate:jobs -- --file <test.csv> --model <model.json> [--nv-model <file>] [--task-model <file>] [--out <folder>]');
    process.exit(1);
  }
  try {
    const report = runEvaluation({ file: arg('file'), modelPath: arg('model'), nvModelPath: arg('nv-model'), taskModelPath: arg('task-model') });
    printJobReport(report);
    console.log(`\nSaved: ${writeJobResults(report, arg('out'))}`);
  } catch (err) {
    console.error(`Evaluation failed: ${err.message}`);
    process.exit(1);
  }
}
