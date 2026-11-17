// Prints the Module 4 SIMULATION results as markdown tables, straight from the committed result files
// (backend/evaluation/reputation/results/SIMULATION-*.json), so no number is copied by hand.
//   node docs/tools/simulation-tables.mjs [date]
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../../backend/evaluation/reputation/results');
const date = process.argv[2];
const files = readdirSync(dir).filter((f) => /^SIMULATION-\d{4}-\d{2}-\d{2}-.+\.json$/.test(f) && !f.includes('exploration') && (!date || f.includes(date)));
const ORDER = ['base', 'inflation', 'sybil_k3', 'sybil_k5', 'sybil_k10', 'smart_sybil_k3', 'smart_sybil_k5', 'smart_sybil_k10', 'pair_collusion', 'quality_change', 'combined'];
const reports = files.map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8'))).sort((a, b) => ORDER.indexOf(a.scenario) - ORDER.indexOf(b.scenario));
const f3 = (x) => (x === null || x === undefined ? '–' : x.toFixed(3));
const ms = (m) => (m.mean === null ? '–' : `${f3(m.mean)} (${f3(m.sd)})`);
const r0 = reports[0];
console.log(`SIMULATION results: ${r0.seeds.count} seeds (${r0.seeds.first}..${r0.seeds.last}), ${r0.workersPerRun} workers per run, engine ${r0.engineVersion}, parameters ${r0.parametersHash}, git ${r0.gitCommit}, run on ${r0.date}. Mean (standard deviation) over seeds.\n`);
console.log('| Scenario | Method | Kendall tau-b (>= 1 review) | NDCG@10 (all) | Precision@10 (all) | Attack lift (places) | New-worker percentile |');
console.log('|---|---|---|---|---|---|---|');
for (const r of reports) {
  for (const m of ['B1', 'B2', 'B3', 'B4', 'ours', 'ours_expected']) {
    const x = r.methods[m].metrics;
    console.log(`| ${r.scenario} | ${r.methods[m].label} | ${ms(x['reviewed.tau'])} | ${ms(x['all.ndcg10'])} | ${ms(x['all.p10'])} | ${x.attackLift.n ? ms(x.attackLift) : '–'} | ${ms(x.newWorkerPosition)} |`);
  }
}
console.log('\nAblations (ours with one factor switched off), attack lift and NDCG@10, mean over seeds:\n');
console.log('| Scenario | ours | no recency | no reviewer trust | no pair factor | no provenance |');
console.log('|---|---|---|---|---|---|');
for (const r of reports.filter((x) => x.methods.ours.metrics.attackLift.n)) {
  const cell = (m) => `${f3(r.methods[m].metrics.attackLift.mean)} / ${f3(r.methods[m].metrics['all.ndcg10'].mean)}`;
  console.log(`| ${r.scenario} | ${cell('ours')} | ${cell('no_recency')} | ${cell('no_reviewer_trust')} | ${cell('no_pair_factor')} | ${cell('no_provenance')} |`);
}
console.log('\nPaired, ours minus B1 (plain average), seed by seed: mean difference [share of seeds where ours is better]:\n');
console.log('| Scenario | tau-b (>= 1 review) | NDCG@10 (all) | Attack lift |');
console.log('|---|---|---|---|');
for (const r of reports) {
  const p = r.paired.find((x) => x.other === 'B1').metrics;
  const c = (k) => (p[k]?.meanDifference == null ? '–' : `${p[k].meanDifference >= 0 ? '+' : ''}${f3(p[k].meanDifference)} [${Math.round(100 * p[k].shareOursBetter)}%]`);
  console.log(`| ${r.scenario} | ${c('reviewed.tau')} | ${c('all.ndcg10')} | ${c('attackLift')} |`);
}
