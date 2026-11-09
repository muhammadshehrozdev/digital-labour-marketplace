// Evaluates the rule-based skill extractor on a labelled dataset.
// Run in .\backend:   npm run evaluate:skills -- --file <path-to-dataset.csv or .json> [--out <folder>]
//
// Prints a table and writes JSON (date + SHA-256 of the dataset file) to results/.
// A dataset whose file name or header says "synthetic" is marked SYNTHETIC: its numbers only
// prove that the script works and must NEVER be reported as results (CLAUDE.md).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataset, SCRIPTS } from './dataset.js';
import { SYSTEMS } from './systems.js';
import { microMacro, itemCounts, sumCounts, prf, wilson, bootstrapF1, pairedBootstrap } from './metrics.js';
import { CATEGORIES, SKILLS, TAXONOMY_VERSION } from '../../config/skillTaxonomy.js';

const RESAMPLES = 1000;
const SEED = 20261109;
const categoryOf = Object.fromEntries(SKILLS.map((s) => [s.id, s.category]));

const sameExperience = (a, b) => (a === null && b === null) || (a && b && a.years === b.years && a.months === b.months);

export function evaluateSystem(items, system) {
  const pairs = items.map((item) => {
    const pred = system(item.text);
    return { item, gold: item.goldSkills, predicted: pred.skills, pred };
  });
  const counts = pairs.map((p) => itemCounts(p.gold, p.predicted));
  const { micro, macro } = microMacro(pairs);
  const pooled = sumCounts(counts);

  const perCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c.id, microMacro(pairs, (id) => categoryOf[id] === c.id).micro])
      .filter(([, m]) => m.tp + m.fp + m.fn > 0)
  );
  const byScript = Object.fromEntries(
    SCRIPTS.map((s) => {
      const subset = pairs.filter((p) => p.item.script === s);
      return [s, { items: subset.length, ...prf(sumCounts(subset.map((p) => itemCounts(p.gold, p.predicted)))) }];
    }).filter(([, v]) => v.items > 0)
  );

  const withCategory = pairs.filter((p) => p.item.goldCategory);
  const categoryCorrect = withCategory.filter((p) => p.pred.category === p.item.goldCategory).length;
  const experienceCorrect = pairs.filter((p) => sameExperience(p.pred.experience, p.item.experience)).length;

  return {
    micro,
    macro,
    wilson95: { precision: wilson(pooled.tp, pooled.tp + pooled.fp), recall: wilson(pooled.tp, pooled.tp + pooled.fn) },
    bootstrap95F1: bootstrapF1(counts, { resamples: RESAMPLES, seed: SEED }),
    perCategory,
    byScript,
    categoryAccuracy: { correct: categoryCorrect, total: withCategory.length, value: withCategory.length ? categoryCorrect / withCategory.length : null },
    experienceExactMatch: { correct: experienceCorrect, total: pairs.length, value: pairs.length ? experienceCorrect / pairs.length : null },
    _counts: counts,
  };
}

export function evaluateDataset(dataset) {
  const systems = {};
  for (const [name, fn] of Object.entries(SYSTEMS)) systems[name] = evaluateSystem(dataset.items, fn);
  const comparisons = Object.keys(SYSTEMS)
    .filter((n) => n !== 'extractor')
    .map((other) => ({
      a: 'extractor',
      b: other,
      test: 'paired bootstrap on micro F1',
      ...pairedBootstrap(systems.extractor._counts, systems[other]._counts, { resamples: RESAMPLES, seed: SEED }),
    }));
  for (const s of Object.values(systems)) delete s._counts;
  return {
    synthetic: dataset.synthetic,
    warning: dataset.synthetic ? 'SYNTHETIC DATA: these numbers only test the script. Never report them as results.' : null,
    dataset: { file: dataset.file, sha256: dataset.sha256, items: dataset.items.length },
    taxonomyVersion: TAXONOMY_VERSION,
    date: new Date().toISOString(),
    resamples: RESAMPLES,
    seed: SEED,
    systems,
    comparisons,
  };
}

const pct = (x) => (x === null || Number.isNaN(x) ? '  n/a' : `${(x * 100).toFixed(1).padStart(5)}`);

function printReport(r) {
  if (r.synthetic) console.log(`\n*** ${r.warning} ***\n`);
  console.log(`Dataset ${r.dataset.file} (${r.dataset.items} items, sha256 ${r.dataset.sha256.slice(0, 12)}…), taxonomy ${r.taxonomyVersion}`);
  console.log('\nSystem                          microP microR microF1  [F1 95% bootstrap]  macroF1  cat.acc  exp.exact');
  for (const [name, s] of Object.entries(r.systems)) {
    console.log(
      `${name.padEnd(31)} ${pct(s.micro.precision)}  ${pct(s.micro.recall)}  ${pct(s.micro.f1)}   [${pct(s.bootstrap95F1.low)}, ${pct(s.bootstrap95F1.high)}]    ${pct(s.macro.f1)}   ${pct(s.categoryAccuracy.value)}    ${pct(s.experienceExactMatch.value)}`
    );
  }
  console.log('\nPaired comparison (extractor minus other system, micro F1):');
  for (const c of r.comparisons) {
    console.log(`  vs ${c.b.padEnd(30)} diff ${pct(c.observedDiff)}  95% [${pct(c.low)}, ${pct(c.high)}]  p = ${c.pValue.toFixed(3)}`);
  }
  const ext = r.systems.extractor;
  console.log('\nExtractor by script:', Object.entries(ext.byScript).map(([k, v]) => `${k} F1 ${pct(v.f1)} (n=${v.items})`).join(' | '));
  console.log('Wilson 95%: precision', `[${pct(ext.wilson95.precision.low)}, ${pct(ext.wilson95.precision.high)}]`, 'recall', `[${pct(ext.wilson95.recall.low)}, ${pct(ext.wilson95.recall.high)}]`);
}

export function writeResults(report, outDir) {
  mkdirSync(outDir, { recursive: true });
  const name = `${report.synthetic ? 'SYNTHETIC-' : ''}${report.date.slice(0, 10)}-${report.dataset.sha256.slice(0, 8)}.json`;
  const path = join(outDir, name);
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
  return path;
}

// CLI
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? undefined : process.argv[i + 1]; };
  const file = arg('file');
  if (!file) {
    console.error('Usage: npm run evaluate:skills -- --file <dataset.csv|.json> [--out <folder>]');
    process.exit(1);
  }
  try {
    const report = evaluateDataset(loadDataset(file));
    printReport(report);
    const out = writeResults(report, arg('out') ?? join(dirname(fileURLToPath(import.meta.url)), 'results'));
    console.log(`\nSaved: ${out}`);
  } catch (err) {
    console.error(`Evaluation failed: ${err.message}`);
    process.exit(1);
  }
}
