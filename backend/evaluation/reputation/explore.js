// PARAMETER EXPLORATION for the Module 4 engine (decision D-048). SIMULATION RESULTS ONLY.
// Run in .\backend:   node evaluation/reputation/explore.js --seeds 30
//
// The live engine keeps its documented default parameters. This script only shows the team how the
// simulated metrics move when the reviewer-trust floor and the half-life change, so they can decide.
// Warning (written into the output too): choosing parameters on the same simulation that measures
// them is circular. A value picked here must be checked on new seeds and, later, on the real pilot.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateSeed } from './evaluate.js';
import { METHODS, engineMethod } from './methods.js';
import { SCENARIOS, SEED_BASE, SIMULATION } from './config.js';
import { summarize, pairedComparison } from './metrics.js';
import { withParams, paramsHash, DEFAULT_REPUTATION_PARAMS } from '../../config/reputationParams.js';

export const SCENARIOS_EXPLORED = ['base', 'sybil_k5', 'smart_sybil_k5', 'pair_collusion', 'quality_change', 'combined'];

export const VARIANTS = [
  ['default (floor 0.5, half-life 365)', {}],
  ['trust floor 0.2', { trustFloor: 0.2 }],
  ['trust floor 0.0', { trustFloor: 0 }],
  ['half-life 730', { halfLifeDays: 730 }],
  ['floor 0.2 + half-life 730', { trustFloor: 0.2, halfLifeDays: 730 }],
  ['floor 0.0 + half-life 730', { trustFloor: 0, halfLifeDays: 730 }],
];

export function explorationMethods() {
  const methods = { B1: METHODS.B1, B4: METHODS.B4 };
  VARIANTS.forEach(([label, change], i) => {
    const params = withParams(change);
    methods[`v${i}_cautious`] = { ...engineMethod(`${label}, cautious`, params, 'cautious'), paramsHash: paramsHash(params) };
    methods[`v${i}_expected`] = { ...engineMethod(`${label}, expected`, params, 'expected'), paramsHash: paramsHash(params) };
  });
  return methods;
}

// A second question, about the SIMULATOR (not the engine): how much does the answer depend on the
// assumed star noise (Normal sd 0.15 in the plan)? Larger noise = one review says less about quality.
export const NOISE_RUNS = [['base', 0.3], ['base', 0.5], ['sybil_k5', 0.3], ['sybil_k5', 0.5]];

export function explore({ seeds = 30, workers = SIMULATION.workers, scenarios = SCENARIOS_EXPLORED, noiseRuns = NOISE_RUNS } = {}) {
  const methods = explorationMethods();
  const out = {};
  const runsFor = [...scenarios.map((name) => [name, name, SIMULATION]), ...noiseRuns.map(([name, sd]) => [`${name} (noise sd ${sd})`, name, { ...SIMULATION, noiseSd: sd }])];
  for (const [label, name, settings] of runsFor) {
    const runs = Array.from({ length: seeds }, (_, i) => evaluateSeed({ seed: SEED_BASE + i, scenario: SCENARIOS[name], workers, methods, settings }).result);
    out[label] = Object.fromEntries(Object.entries(methods).map(([key, m]) => [key, {
      label: m.label,
      reviewedTau: summarize(runs.map((r) => r[key].reviewed.tau)),
      allNdcg10: summarize(runs.map((r) => r[key].all.ndcg10)),
      attackLift: summarize(runs.map((r) => r[key].attackLift)),
      vsB1ReviewedTau: pairedComparison(runs.map((r) => r[key].reviewed.tau), runs.map((r) => r.B1.reviewed.tau)),
      vsB1AttackLift: pairedComparison(runs.map((r) => r[key].attackLift), runs.map((r) => r.B1.attackLift), { higherIsBetter: false }),
    }]));
  }
  return { methods, results: out };
}

const f = (x) => (x === null || x === undefined ? '-' : x.toFixed(3));

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--seeds');
  const seeds = i >= 0 ? Number.parseInt(process.argv[i + 1], 10) : 30;
  console.log('PARAMETER EXPLORATION. SIMULATION RESULTS ONLY: not real-world results, and not a validation of any value.');
  console.log(`Production defaults stay ${paramsHash(DEFAULT_REPUTATION_PARAMS)}. ${seeds} seeds (${SEED_BASE}..${SEED_BASE + seeds - 1}), ${SIMULATION.workers} workers per run.`);
  const { results } = explore({ seeds });
  for (const [scenario, rows] of Object.entries(results)) {
    console.log(`\n=== SIMULATION exploration | ${scenario} | ${seeds} seeds ===`);
    console.log(`${'method'.padEnd(52)}${'tau (>=1 review)'.padStart(18)}${'NDCG@10 (all)'.padStart(16)}${'attack lift'.padStart(14)}${'tau better than B1'.padStart(20)}`);
    for (const row of Object.values(rows)) {
      console.log(`${row.label.padEnd(52)}${`${f(row.reviewedTau.mean)} (${f(row.reviewedTau.sd)})`.padStart(18)}${f(row.allNdcg10.mean).padStart(16)}${f(row.attackLift.mean).padStart(14)}${(row.vsB1ReviewedTau.shareOursBetter === null ? '-' : `${Math.round(100 * row.vsB1ReviewedTau.shareOursBetter)}% of seeds`).padStart(20)}`);
    }
  }
  const dir = join(dirname(fileURLToPath(import.meta.url)), 'results');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `SIMULATION-${new Date().toISOString().slice(0, 10)}-exploration.json`);
  writeFileSync(file, `${JSON.stringify({ label: 'SIMULATION', kind: 'parameter exploration', warning: 'Simulation results only. Choosing parameters on the same simulation that measures them is circular; check any choice on new seeds and on real data.', seeds, workersPerRun: SIMULATION.workers, defaultsHash: paramsHash(DEFAULT_REPUTATION_PARAMS), variants: VARIANTS, results }, null, 2)}\n`);
  console.log(`\nwritten: ${file.replace(process.cwd(), '.')}`);
}
