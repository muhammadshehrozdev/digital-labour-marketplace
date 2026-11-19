// Runs the Module 5 price-range simulation (Batch 7, §8) and compares ours with a plain mean and a plain median.
// Run in .\backend:   npm run evaluate:price-range -- --scenario <name|all> --seeds 30 [--out <folder>]
//
// EVERY NUMBER THIS PRINTS IS A SIMULATION RESULT. It shows how the rules behave IF the assumed price spread and
// the assumed attacks hold (README.md); it says nothing about real prices. Quote a number only with the label
// "simulation", the scenario and the number of seeds.
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WAGE_RULES } from '../../config/wageRules.js';
import { SCENARIOS, SEED_BASE, SIM_NOW, SIMULATION, scenarioNames } from './config.js';
import { simulateMarkets } from './simulate.js';
import { METHODS } from './methods.js';
import { attackShift, availability, availabilityFlips, coverage, medianError, pairedComparison, summarize } from './metrics.js';

export const RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'results');
// [key, label, higher is better? (null = report only)]
export const METRICS = Object.freeze([
  ['availability', 'availability', true],
  ['error', 'median |median - m| / m', false],
  ['coverage', 'coverage of held-out prices', null],
  ['attackShift', 'attack shift / m', false],
]);

// The rules and the world in one short hash, so a result file names exactly what produced it.
export function parametersHash(scenario) {
  const rules = { MIN_JOBS: WAGE_RULES.MIN_JOBS, MIN_WORKERS: WAGE_RULES.MIN_WORKERS, MIN_CUSTOMERS: WAGE_RULES.MIN_CUSTOMERS, PRICE_WINDOW_DAYS: WAGE_RULES.PRICE_WINDOW_DAYS, ROUND_TO: WAGE_RULES.ROUND_TO };
  return createHash('sha256').update(JSON.stringify({ rules, SIMULATION, scenario })).digest('hex').slice(0, 12);
}

// Every metric of every method for ONE seed.
export function evaluateSeed({ seed, scenario, methods = METHODS }) {
  const markets = simulateMarkets({ seed, scenario });
  const truths = markets.map((mk) => mk.m);
  const attackedIdx = markets.map((mk, i) => (mk.attacked ? i : -1)).filter((i) => i >= 0);
  const out = {};
  for (const [name, method] of Object.entries(methods)) {
    // the platform as it is (with the attack jobs, if any), and the same markets without them
    const seen = markets.map((mk) => method.run([...mk.jobs, ...mk.attackJobs], mk.city));
    const clean = markets.map((mk) => method.run(mk.jobs, mk.city));
    const withA = attackedIdx.map((i) => seen[i]);
    const withoutA = attackedIdx.map((i) => clean[i]);
    out[name] = {
      availability: availability(seen),
      error: medianError(seen, truths),
      coverage: coverage(seen, markets.map((mk) => mk.holdout)),
      attackShift: attackedIdx.length ? attackShift(withA, withoutA, attackedIdx.map((i) => truths[i])) : null,
      flips: availabilityFlips(withA, withoutA),
    };
  }
  const jobs = markets.reduce((n, mk) => n + mk.jobs.length, 0);
  return { result: out, counts: { markets: markets.length, jobs, attacked: attackedIdx.length, attackJobs: markets.reduce((n, mk) => n + mk.attackJobs.length, 0) } };
}

export function evaluateScenario(name, { seeds = 30, seedBase = SEED_BASE, methods = METHODS } = {}) {
  const scenario = SCENARIOS[name];
  const seedList = Array.from({ length: seeds }, (_, i) => seedBase + i);
  const runs = seedList.map((seed) => evaluateSeed({ seed, scenario, methods }));
  const per = (method, key) => runs.map((r) => r.result[method][key]);
  const report = {};
  for (const [method, def] of Object.entries(methods)) {
    report[method] = {
      label: def.label,
      metrics: Object.fromEntries(METRICS.map(([key]) => [key, summarize(per(method, key))])),
      flips: {
        appeared: runs.reduce((n, r) => n + r.result[method].flips.appeared, 0),
        vanished: runs.reduce((n, r) => n + r.result[method].flips.vanished, 0),
      },
    };
  }
  const paired = ['M1', 'M2'].map((other) => ({
    ours: 'ours',
    other,
    metrics: Object.fromEntries(METRICS.filter(([key, , hib]) => hib !== null && (key !== 'attackShift' || scenario.attack)).map(([key, , higherIsBetter]) => [
      key, pairedComparison(per('ours', key), per(other, key), { higherIsBetter }),
    ])),
  }));
  const meanOf = (key) => runs.reduce((s, r) => s + r.counts[key], 0) / runs.length;
  return {
    label: 'SIMULATION',
    warning: 'SIMULATION RESULTS: assumed price spreads and assumed attacks. They show how the rules behave IF the assumptions hold, not what real prices look like.',
    scenario: name,
    description: scenario.description,
    scenarioSettings: scenario,
    seeds: { count: seeds, first: seedList[0], last: seedList[seedList.length - 1] },
    simulation: SIMULATION,
    simulatedToday: SIM_NOW.toISOString().slice(0, 10),
    rules: { MIN_JOBS: WAGE_RULES.MIN_JOBS, MIN_WORKERS: WAGE_RULES.MIN_WORKERS, MIN_CUSTOMERS: WAGE_RULES.MIN_CUSTOMERS, PRICE_WINDOW_DAYS: WAGE_RULES.PRICE_WINDOW_DAYS, ROUND_TO: WAGE_RULES.ROUND_TO },
    parametersHash: parametersHash(scenario),
    meanCounts: { markets: meanOf('markets'), jobs: meanOf('jobs'), attacked: meanOf('attacked'), attackJobs: meanOf('attackJobs') },
    methods: report,
    paired,
  };
}

const f3 = (x) => (x === null || x === undefined ? '  -  ' : x.toFixed(3));
const cell = (s) => (s.mean === null ? '-'.padStart(16) : `${f3(s.mean)} (${f3(s.sd)})`.padStart(16));

export function printScenario(r, log = console.log) {
  log(`\n=== SIMULATION | price range | scenario: ${r.scenario} | ${r.seeds.count} seeds (${r.seeds.first}..${r.seeds.last}) | parameters ${r.parametersHash} ===`);
  log(`    ${r.description}`);
  const c = r.meanCounts;
  log(`    per seed (mean): ${c.markets} markets, ${c.jobs.toFixed(1)} genuine jobs, ${c.attacked.toFixed(1)} attacked markets, ${c.attackJobs.toFixed(1)} attack jobs`);
  const shown = METRICS.filter(([key]) => key !== 'attackShift' || r.scenarioSettings.attack);
  log('    each cell: mean (sd) over seeds; 95% of seeds between p2.5 and p97.5 (in the JSON file)\n');
  log(['method'.padEnd(32), ...shown.map(([key]) => key.padStart(16))].join(''));
  for (const m of Object.values(r.methods)) log([m.label.padEnd(32), ...shown.map(([key]) => cell(m.metrics[key]))].join(''));
  if (r.scenarioSettings.attack) {
    log('\n    attacked markets where the attack made a number appear / disappear (all seeds):');
    for (const m of Object.values(r.methods)) log(`    ${m.label.padEnd(32)} appeared ${m.flips.appeared}, disappeared ${m.flips.vanished}`);
  }
  log('\n    paired, ours minus other, seed by seed: mean difference [share of seeds where ours is better]');
  const keys = Object.keys(r.paired[0].metrics);
  log(['vs'.padEnd(32), ...keys.map((k) => k.padStart(18))].join(''));
  for (const p of r.paired) {
    log([r.methods[p.other].label.padEnd(32), ...keys.map((k) => {
      const x = p.metrics[k];
      return (x.meanDifference === null ? '-' : `${x.meanDifference >= 0 ? '+' : ''}${f3(x.meanDifference)} [${Math.round(100 * x.shareOursBetter)}%]`).padStart(18);
    })].join(''));
  }
}

function gitCommit() {
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain -- .', { stdio: ['ignore', 'pipe', 'ignore'] }).toString()
      .split('\n').filter((line) => line.trim() && !/node_modules|evaluation\/price-range\/results\//.test(line)).length > 0;
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
  return { scenario: value('--scenario', 'base'), seeds: Number.parseInt(value('--seeds', '30'), 10), out: value('--out', RESULTS_DIR) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opts = args(process.argv.slice(2));
  if (!(opts.seeds >= 1 && opts.seeds <= 500)) {
    console.error('Use --seeds 1..500');
    process.exit(1);
  }
  let names;
  try {
    names = scenarioNames(opts.scenario);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const commit = gitCommit();
  const date = new Date().toISOString().slice(0, 10); // the day of the run (the simulated world has its own fixed day)
  mkdirSync(opts.out, { recursive: true });
  console.log('SIMULATION RESULTS (Module 5 price range). Assumed price spreads and assumed attacks: these numbers show how the');
  console.log('rules behave IF the assumptions hold. They are not real prices and not real-world performance.');
  for (const name of names) {
    const report = { ...evaluateScenario(name, { seeds: opts.seeds }), date, gitCommit: commit };
    printScenario(report);
    const file = join(opts.out, `SIMULATION-price-${date}-${name}.json`);
    writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\n    written: ${file.replace(`${process.cwd()}/`, '')}`);
  }
}
