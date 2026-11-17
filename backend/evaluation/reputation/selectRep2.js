// rep-2 SELECTION on the DEVELOPMENT seeds (BATCH_6B section 5.4, steps 2 and 3). SIMULATION RESULTS ONLY.
// Run in .\backend:   node evaluation/reputation/selectRep2.js
//
// The six pre-registered candidates (B in {1, 2, 3} x burst off/on; all with recency off, the platform prior
// and `expected` as the ranking number) run on the development seeds 20261116..20261145 (already seen in
// Batch 6). The rule, fixed before any run:
//   1. keep the candidates whose base-world NDCG@10 (all workers, expected) is at least B4's minus 0.01;
//   2. among them choose the highest mean NDCG@10 over sybil_k3, sybil_k5, sybil_k10, pair_collusion, combined;
//   3. ties go to the smaller B, then to burst off.
// If no candidate passes step 1, the script says STOP and exits with code 2 (the team decides).
// It never touches the test seeds and never changes the live parameters.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateScenario, RESULTS_DIR } from './evaluate.js';
import { rep2CandidateMethods } from './methods.js';
import { DEV_SEED_BASE, PROTOCOL_SEEDS, SELECTION_ATTACKS, SIMULATION } from './config.js';
import { REP2_CANDIDATES } from '../../config/reputationParams.js';

export const BASE_MARGIN = 0.01;
const TIE = 1e-12;

// rows: [{ id, base, attackMean }] in the pre-registered tie-break order; b4Base: B4's base NDCG@10 mean.
export function applySelectionRule(rows, b4Base, margin = BASE_MARGIN) {
  const eligible = rows.filter((r) => r.base >= b4Base - margin);
  if (eligible.length === 0) return { chosen: null, eligible: [] };
  let chosen = eligible[0];
  for (const r of eligible.slice(1)) if (r.attackMean > chosen.attackMean + TIE) chosen = r; // a tie keeps the earlier one
  return { chosen, eligible: eligible.map((r) => r.id) };
}

export function runSelection({ seeds = PROTOCOL_SEEDS, workers = SIMULATION.workers, seedBase = DEV_SEED_BASE } = {}) {
  const methods = rep2CandidateMethods();
  const reports = Object.fromEntries(['base', ...SELECTION_ATTACKS].map((name) => [name, evaluateScenario(name, { seeds, workers, seedBase, methods, ours: 'B4' })]));
  const ndcg = (scenario, method) => reports[scenario].methods[method].metrics['all.ndcg10'].mean;
  const lift = (scenario, method) => reports[scenario].methods[method].metrics.attackLift.mean;
  const row = (method) => ({
    base: ndcg('base', method),
    attacks: Object.fromEntries(SELECTION_ATTACKS.map((s) => [s, ndcg(s, method)])),
    attackMean: SELECTION_ATTACKS.reduce((sum, s) => sum + ndcg(s, method), 0) / SELECTION_ATTACKS.length,
    attackLift: Object.fromEntries(SELECTION_ATTACKS.map((s) => [s, lift(s, method)])),
    baseTau: reports.base.methods[method].metrics['all.tau'].mean,
  });
  const rows = REP2_CANDIDATES.map((c) => ({ id: c.id, candidate: c, method: `rep2_${c.id}`, ...row(`rep2_${c.id}`) }));
  const baselines = { B1: row('B1'), B4: row('B4') };
  const { chosen, eligible } = applySelectionRule(rows, baselines.B4.base);
  return { rows, baselines, eligible, chosen, reports };
}

const f3 = (x) => (x === null || x === undefined ? '  -  ' : x.toFixed(3));

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const started = new Date();
  let commit = null;
  try {
    commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    commit = null;
  }
  console.log('rep-2 SELECTION on the DEVELOPMENT seeds. SIMULATION RESULTS ONLY: not real-world results.');
  console.log(`Seeds ${DEV_SEED_BASE}..${DEV_SEED_BASE + PROTOCOL_SEEDS - 1}, ${SIMULATION.workers} workers per run, git ${commit ?? 'unknown'}.`);
  const result = runSelection();
  const { rows, baselines, eligible, chosen } = result;
  console.log(`\nRule: base NDCG@10 >= B4 (${f3(baselines.B4.base)}) - ${BASE_MARGIN} = ${f3(baselines.B4.base - BASE_MARGIN)}; then the highest mean NDCG@10 over ${SELECTION_ATTACKS.join(', ')}.\n`);
  const head = ['candidate'.padEnd(16), 'base'.padStart(8), ...SELECTION_ATTACKS.map((s) => s.padStart(15)), 'attack mean'.padStart(12), 'passes base'.padStart(12)].join('');
  console.log(head);
  const line = (id, r, pass) => console.log([id.padEnd(16), f3(r.base).padStart(8), ...SELECTION_ATTACKS.map((s) => f3(r.attacks[s]).padStart(15)), f3(r.attackMean).padStart(12), pass.padStart(12)].join(''));
  for (const [id, r] of Object.entries(baselines)) line(id, r, '');
  for (const r of rows) line(r.id, r, eligible.includes(r.id) ? 'yes' : 'NO');
  console.log('\nattack lift (places bought, lower is better), for information:');
  for (const r of [...Object.entries(baselines).map(([id, x]) => ({ id, ...x })), ...rows]) console.log([r.id.padEnd(16), ...SELECTION_ATTACKS.map((s) => f3(r.attackLift[s]).padStart(15))].join(''));
  const out = {
    label: 'SIMULATION',
    kind: 'rep-2 selection on the development seeds (BATCH_6B section 5.4, steps 2-3)',
    warning: 'Simulation results only. Development seeds (already seen in Batch 6): these numbers choose the candidate; they are not the evaluation. The test seeds are used once, after the frozen commit.',
    seeds: { count: PROTOCOL_SEEDS, first: DEV_SEED_BASE, last: DEV_SEED_BASE + PROTOCOL_SEEDS - 1 },
    workersPerRun: SIMULATION.workers,
    rule: { baseMargin: BASE_MARGIN, attacks: SELECTION_ATTACKS, tieBreak: 'smaller B, then burst off' },
    baselines,
    candidates: rows.map(({ id, candidate, base, attacks, attackMean, attackLift, baseTau }) => ({ id, candidate, paramsHash: result.reports.base.methods[`rep2_${id}`].paramsHash, base, attacks, attackMean, attackLift, baseTau })),
    eligible,
    chosen: chosen ? chosen.candidate : null,
    gitCommit: commit,
    startedAt: started.toISOString(),
  };
  mkdirSync(RESULTS_DIR, { recursive: true });
  const file = join(RESULTS_DIR, `SIMULATION-rep2-dev-${started.toISOString().slice(0, 10)}-selection.json`);
  writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`\nwritten: ${file.replace(process.cwd(), '.')}`);
  if (!chosen) {
    console.log('\nSTOP: no candidate passes the base-world condition. Report to the team (BATCH_6B section 8).');
    process.exit(2);
  }
  console.log(`\nChosen by the rule: ${chosen.id} (newReviewerBudget ${chosen.candidate.newReviewerBudget}, burst ${chosen.candidate.burst ? 'on' : 'off'}).`);
}
