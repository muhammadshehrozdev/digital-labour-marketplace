// The pre-registered success criteria of rep-2 (BATCH_6B section 5.4, step 6), checked from the TEST-SEED
// result files (results/SIMULATION-rep2-test-*.json). SIMULATION RESULTS ONLY. Nothing here runs a simulation.
// Run in .\backend:   node evaluation/reputation/rep2Criteria.js [--markdown]
//
// Paired, seed by seed, on the test seeds, rep-2 by `expected` (rep2_expected):
//   S1 no cost without attack: in base, mean NDCG@10 of rep-2 >= B4 - 0.01 AND >= B1.
//   S2 attacks: in sybil_k3, sybil_k5, sybil_k10, pair_collusion and combined, rep-2 has a LOWER attack lift
//      AND a HIGHER NDCG@10 than B1 and than B4, each in at least 80% of seeds.
//   S3 better than v1: rep-2 has a higher NDCG@10 than rep-1 (cautious) in base and in every S2 scenario,
//      in at least 80% of seeds.
// Which engine goes live (decided before the run): rep-2 if S1 AND S3 hold; otherwise rep-1 stays and the
// team decides. S2 decides only what the report may claim.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESULTS_DIR, REP2_TEST_PREFIX } from './evaluate.js';
import { SELECTION_ATTACKS } from './config.js';

export const SHARE = 0.8;
export const S1_MARGIN = 0.01;
export const S2_SCENARIOS = SELECTION_ATTACKS; // the same five attacks as the selection rule
export const OURS = 'rep2_expected';

const pairedOf = (report, other, key) => report.paired.find((p) => p.ours === OURS && p.other === other)?.metrics[key];
const meanOf = (report, method, key) => report.methods[method].metrics[key].mean;

// reports: { [scenario]: report }. Returns every check with its numbers, and the three verdicts.
export function checkCriteria(reports) {
  const need = ['base', ...S2_SCENARIOS];
  const missing = need.filter((s) => !reports[s]);
  if (missing.length) throw new Error(`test-seed results missing for: ${missing.join(', ')}`);
  const base = reports.base;
  const s1 = {
    rep2: meanOf(base, OURS, 'all.ndcg10'),
    B4: meanOf(base, 'B4', 'all.ndcg10'),
    B1: meanOf(base, 'B1', 'all.ndcg10'),
  };
  s1.met = s1.rep2 >= s1.B4 - S1_MARGIN && s1.rep2 >= s1.B1;

  const s2 = S2_SCENARIOS.map((scenario) => {
    const r = reports[scenario];
    const checks = ['B1', 'B4'].flatMap((other) => [
      { other, metric: 'attackLift', share: pairedOf(r, other, 'attackLift').shareOursBetter, meanDifference: pairedOf(r, other, 'attackLift').meanDifference },
      { other, metric: 'all.ndcg10', share: pairedOf(r, other, 'all.ndcg10').shareOursBetter, meanDifference: pairedOf(r, other, 'all.ndcg10').meanDifference },
    ]).map((c) => ({ ...c, met: c.share >= SHARE }));
    return { scenario, checks, met: checks.every((c) => c.met) };
  });

  const s3 = ['base', ...S2_SCENARIOS].map((scenario) => {
    const p = pairedOf(reports[scenario], 'rep1_cautious', 'all.ndcg10');
    return { scenario, share: p.shareOursBetter, meanDifference: p.meanDifference, met: p.shareOursBetter >= SHARE };
  });

  const verdict = { S1: s1.met, S2: s2.every((x) => x.met), S3: s3.every((x) => x.met) };
  return { s1, s2, s3, verdict, liveEngine: verdict.S1 && verdict.S3 ? 'rep-2' : 'rep-1' };
}

export function loadTestReports(dir = RESULTS_DIR) {
  const files = readdirSync(dir).filter((f) => f.startsWith(REP2_TEST_PREFIX) && f.endsWith('.json')).sort();
  const reports = {};
  for (const f of files) {
    const r = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    reports[r.scenario] = r; // a later file of the same scenario (a documented re-run) replaces the earlier one
  }
  return { files, reports };
}

const f3 = (x) => (x === null || x === undefined ? '–' : x.toFixed(3));
const pct = (x) => (x === null || x === undefined ? '–' : `${Math.round(100 * x)}%`);
const signed = (x) => (x === null || x === undefined ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(3)}`);

// Every scenario, every method: the report-only numbers (BATCH_6B 5.4 step 6, "always report").
export function fullTable(reports) {
  const lines = ['| Scenario | Method | NDCG@10 (all) | Kendall tau-b (all) | Precision@10 (all) | Attack lift | New-worker percentile |', '|---|---|---|---|---|---|---|'];
  for (const [scenario, r] of Object.entries(reports)) {
    for (const [, m] of Object.entries(r.methods)) {
      const x = m.metrics;
      const ms = (k) => (x[k].mean === null ? '–' : `${f3(x[k].mean)} (${f3(x[k].sd)})`);
      lines.push(`| ${scenario} | ${m.label} | ${ms('all.ndcg10')} | ${ms('all.tau')} | ${ms('all.p10')} | ${x.attackLift.n ? ms('attackLift') : '–'} | ${ms('newWorkerPosition')} |`);
    }
  }
  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { files, reports } = loadTestReports();
  if (files.length === 0) {
    console.error('No test-seed results yet (results/SIMULATION-rep2-test-*.json).');
    process.exit(1);
  }
  const any = Object.values(reports)[0];
  console.log(`rep-2 SUCCESS CRITERIA. SIMULATION RESULTS on the TEST seeds ${any.seeds.first}..${any.seeds.last} (${any.seeds.count} seeds, ${any.workersPerRun} workers per run).`);
  console.log(`rep-2 ${JSON.stringify(any.rep2Selected)}, parameters ${any.parametersHash}, frozen commit ${any.gitCommit}, first file written ${Object.values(reports).map((r) => r.startedAt).sort()[0]}.`);
  const c = checkCriteria(reports);
  console.log(`\nS1 (base: rep-2 NDCG@10 >= B4 - ${S1_MARGIN} and >= B1): rep-2 ${f3(c.s1.rep2)}, B4 ${f3(c.s1.B4)}, B1 ${f3(c.s1.B1)} -> ${c.s1.met ? 'MET' : 'NOT MET'}`);
  console.log(`\nS2 (lower attack lift AND higher NDCG@10 than B1 and B4, each in >= ${pct(SHARE)} of seeds):`);
  for (const s of c.s2) console.log(`  ${s.scenario.padEnd(16)} ${s.checks.map((x) => `${x.metric} vs ${x.other}: ${pct(x.share)} (${signed(x.meanDifference)})`).join(' | ')} -> ${s.met ? 'met' : 'NOT met'}`);
  console.log(`  S2 -> ${c.verdict.S2 ? 'MET' : 'NOT MET'}`);
  console.log(`\nS3 (higher NDCG@10 than rep-1 cautious in >= ${pct(SHARE)} of seeds):`);
  for (const s of c.s3) console.log(`  ${s.scenario.padEnd(16)} ${pct(s.share)} of seeds (mean difference ${signed(s.meanDifference)}) -> ${s.met ? 'met' : 'NOT met'}`);
  console.log(`  S3 -> ${c.verdict.S3 ? 'MET' : 'NOT MET'}`);
  console.log(`\nEngine to go live by the pre-registered rule: ${c.liveEngine}`);
  if (process.argv.includes('--markdown')) console.log(`\n${fullTable(reports)}`);
}
