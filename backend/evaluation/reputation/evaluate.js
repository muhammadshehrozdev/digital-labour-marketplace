// Runs the Module 4 simulation and compares the ranking methods.
// Run in .\backend:   npm run evaluate:reputation -- --scenario <name|all> --seeds 30 [--workers 300] [--out <folder>]
//
// EVERY NUMBER THIS PRINTS IS A SIMULATION RESULT. It shows how the methods behave IF the simulator's
// assumptions hold (README.md); it says nothing about the real marketplace. Report it only with the
// label "simulation", the scenario, the number of seeds and the parameter hash.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { simulateWorld, withoutAttacks } from './simulate.js';
import { METHODS, scoreAll } from './methods.js';
import { kendallTauB, ndcgAtK, pairedComparison, percentileRanks, precisionAtK, rankOrder, ranksFromOrder, summarize, topShare, mean } from './metrics.js';
import { SCENARIOS, SEED_BASE, SIMULATION, scenarioNames } from './config.js';
import { DEFAULT_REPUTATION_PARAMS, REPUTATION_ENGINE_VERSION, paramsHash } from '../../config/reputationParams.js';

export const METRICS = Object.freeze([
  // [key, label, higher is better?]
  ['all.tau', 'Kendall tau-b (all)', true],
  ['all.ndcg10', 'NDCG@10 (all)', true],
  ['all.ndcg20', 'NDCG@20 (all)', true],
  ['all.p10', 'Precision@10 (all)', true],
  ['reviewed.tau', 'Kendall tau-b (>= 1 review)', true],
  ['reviewed.ndcg10', 'NDCG@10 (>= 1 review)', true],
  ['reviewed.ndcg20', 'NDCG@20 (>= 1 review)', true],
  ['reviewed.p10', 'Precision@10 (>= 1 review)', true],
  ['attackLift', 'Attack lift (places bought)', false],
  ['newWorkerPosition', 'New-worker percentile (report only)', null],
]);

// tau, NDCG@10, NDCG@20 and Precision@10 for one group of workers
function rankingMetrics(scores, quality, tieKeys) {
  const order = rankOrder(scores, tieKeys);
  return {
    tau: kendallTauB(scores, quality),
    ndcg10: ndcgAtK(order, quality, 10),
    ndcg20: ndcgAtK(order, quality, 20),
    p10: precisionAtK(order, topShare(quality, 0.2), 10),
  };
}

const pick = (list, indices) => indices.map((i) => list[i]);

// All metrics of every method for ONE seed of one scenario.
export function evaluateSeed({ seed, scenario, workers = SIMULATION.workers, methods = METHODS, settings = SIMULATION }) {
  const world = simulateWorld({ seed, scenario, workers, settings });
  const list = world.workers;
  const quality = list.map((w) => w.quality);
  const tieKeys = list.map((w) => world.tieBreak.get(w.id));
  const reviewed = list.map((w, i) => (w.reviews.length > 0 ? i : -1)).filter((i) => i >= 0);
  const unreviewed = list.map((w, i) => (w.reviews.length === 0 ? i : -1)).filter((i) => i >= 0);
  const attacked = list.map((w, i) => (w.attacked ? i : -1)).filter((i) => i >= 0);

  const names = Object.keys(methods);
  const scores = scoreAll(list, names, methods);
  const cleanScores = attacked.length ? scoreAll(withoutAttacks(list), names, methods) : null;

  const result = {};
  for (const name of names) {
    const s = scores[name];
    const order = rankOrder(s, tieKeys);
    const pr = percentileRanks(order);
    let attackLift = null;
    if (cleanScores) {
      const withAttack = ranksFromOrder(order);
      const without = ranksFromOrder(rankOrder(cleanScores[name], tieKeys));
      attackLift = mean(attacked.map((i) => without[i] - withAttack[i])); // places gained by the attack
    }
    result[name] = {
      all: rankingMetrics(s, quality, tieKeys),
      reviewed: rankingMetrics(pick(s, reviewed), pick(quality, reviewed), pick(tieKeys, reviewed)),
      attackLift,
      newWorkerPosition: unreviewed.length ? mean(unreviewed.map((i) => pr[i])) : null,
    };
  }
  return { result, counts: { workers: list.length, reviewed: reviewed.length, unreviewed: unreviewed.length, attacked: attacked.length, reviews: list.reduce((n, w) => n + w.reviews.length, 0) } };
}

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

export function evaluateScenario(name, { seeds = 30, workers = SIMULATION.workers } = {}) {
  const scenario = SCENARIOS[name];
  const seedList = Array.from({ length: seeds }, (_, i) => SEED_BASE + i);
  const runs = seedList.map((seed) => evaluateSeed({ seed, scenario, workers }));
  const methods = {};
  for (const [method, def] of Object.entries(METHODS)) {
    methods[method] = {
      label: def.label,
      kind: def.kind,
      metrics: Object.fromEntries(METRICS.map(([key]) => [key, summarize(runs.map((r) => get(r.result[method], key)))])),
    };
  }
  const paired = Object.keys(METHODS).filter((m) => m !== 'ours').map((other) => ({
    ours: 'ours',
    other,
    otherKind: METHODS[other].kind,
    metrics: Object.fromEntries(METRICS.filter(([, , hib]) => hib !== null).map(([key, , higherIsBetter]) => [
      key,
      pairedComparison(runs.map((r) => get(r.result.ours, key)), runs.map((r) => get(r.result[other], key)), { higherIsBetter }),
    ])),
  }));
  return {
    label: 'SIMULATION',
    warning: 'SIMULATION RESULTS: these numbers show how the methods behave if the simulator assumptions hold. They are not real-world results.',
    scenario: name,
    description: scenario.description,
    scenarioSettings: scenario,
    seeds: { count: seeds, first: seedList[0], last: seedList[seedList.length - 1] },
    workersPerRun: workers,
    meanCounts: Object.fromEntries(Object.keys(runs[0].counts).map((k) => [k, mean(runs.map((r) => r.counts[k]))])),
    simulation: SIMULATION,
    engineVersion: REPUTATION_ENGINE_VERSION,
    parametersHash: paramsHash(DEFAULT_REPUTATION_PARAMS),
    methods,
    paired,
  };
}

// ---- printing ----
const f3 = (x) => (x === null || x === undefined ? '  -  ' : x.toFixed(3));
const cell = (s) => (s.mean === null ? '-'.padStart(13) : `${f3(s.mean)} (${f3(s.sd)})`.padStart(13));

export function printScenario(report, log = console.log) {
  log(`\n=== SIMULATION | scenario: ${report.scenario} | ${report.seeds.count} seeds | ${report.workersPerRun} workers per run | parameters ${report.parametersHash} ===`);
  log(`    ${report.description}`);
  const c = report.meanCounts;
  log(`    per run (mean): ${c.reviewed} workers with reviews, ${c.unreviewed} without, ${c.attacked} attacked, ${c.reviews} reviews`);
  const shown = METRICS.filter(([key]) => key !== 'attackLift' || report.methods.ours.metrics.attackLift.n > 0);
  log(`    each cell: mean (sd) over seeds\n`);
  log(['method'.padEnd(40), ...shown.map(([key]) => key.padStart(13))].join(''));
  for (const m of Object.values(report.methods)) log([m.label.padEnd(40), ...shown.map(([key]) => cell(m.metrics[key]))].join(''));
  log('\n    paired, ours minus other, seed by seed: mean difference [share of seeds where ours is better]');
  const keys = ['all.tau', 'all.ndcg10', 'all.p10', 'reviewed.tau', ...(report.methods.ours.metrics.attackLift.n > 0 ? ['attackLift'] : [])];
  log(['vs'.padEnd(40), ...keys.map((k) => k.padStart(18))].join(''));
  for (const p of report.paired) {
    log([METHODS[p.other].label.padEnd(40), ...keys.map((k) => {
      const x = p.metrics[k];
      return (x.meanDifference === null ? '-' : `${x.meanDifference >= 0 ? '+' : ''}${f3(x.meanDifference)} [${Math.round(100 * x.shareOursBetter)}%]`).padStart(18);
    })].join(''));
  }
}

function gitCommit() {
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain -- .', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() !== '';
    return dirty ? `${sha}+uncommitted-changes` : sha;
  } catch {
    return null;
  }
}

function args(argv) {
  const value = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    scenario: value('--scenario', 'base'),
    seeds: Number.parseInt(value('--seeds', '30'), 10),
    workers: Number.parseInt(value('--workers', String(SIMULATION.workers)), 10),
    out: value('--out', join(dirname(fileURLToPath(import.meta.url)), 'results')),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = args(process.argv.slice(2));
  if (!(opts.seeds >= 1 && opts.seeds <= 500) || !(opts.workers >= 20 && opts.workers <= 5000)) {
    console.error('Use --seeds 1..500 and --workers 20..5000');
    process.exit(1);
  }
  let names;
  try {
    names = scenarioNames(opts.scenario);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const date = new Date().toISOString().slice(0, 10);
  const commit = gitCommit();
  console.log('Module 4 reputation evaluation. ALL NUMBERS BELOW ARE SIMULATION RESULTS, NOT REAL-WORLD RESULTS.');
  console.log(`Engine ${REPUTATION_ENGINE_VERSION}, parameters ${paramsHash()}, git ${commit ?? 'unknown'}, ${opts.seeds} seeds (${SEED_BASE}..${SEED_BASE + opts.seeds - 1}).`);
  mkdirSync(opts.out, { recursive: true });
  for (const name of names) {
    const started = Date.now();
    const report = { ...evaluateScenario(name, opts), date, gitCommit: commit };
    printScenario(report);
    const file = join(opts.out, `SIMULATION-${date}-${name}.json`);
    writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`    written: ${file.replace(process.cwd(), '.')} (${((Date.now() - started) / 1000).toFixed(1)} s)`);
  }
}
