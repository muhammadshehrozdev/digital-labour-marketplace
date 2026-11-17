// Prints the rep-2 SIMULATION tables of docs/modules/MODULE-4.md section 5.4 straight from the committed result
// files (backend/evaluation/reputation/results/SIMULATION-rep2-*.json), so no number is copied by hand.
//   node docs/tools/rep2-tables.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCriteria, loadTestReports } from '../../backend/evaluation/reputation/rep2Criteria.js';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../../backend/evaluation/reputation/results');
const f3 = (x) => (x === null || x === undefined ? '–' : x.toFixed(3));
const pct = (x) => (x === null || x === undefined ? '–' : `${Math.round(100 * x)}%`);
const signed = (x) => (x === null || x === undefined ? '–' : `${x >= 0 ? '+' : ''}${x.toFixed(3)}`);
const ms = (m) => (m.mean === null ? '–' : `${f3(m.mean)} (${f3(m.sd)})`);

// 1. the development-seed selection
const dev = readdirSync(dir).filter((f) => /^SIMULATION-rep2-dev-.*-selection\.json$/.test(f)).sort().pop();
if (dev) {
  const s = JSON.parse(readFileSync(join(dir, dev), 'utf8'));
  console.log(`**Selection on the DEVELOPMENT seeds** (SIMULATION; seeds ${s.seeds.first}..${s.seeds.last}, ${s.workersPerRun} workers per run, git ${s.gitCommit}, ${s.startedAt}). NDCG@10 (all workers), mean over seeds. Base-world line: B4 ${f3(s.baselines.B4.base)} − ${s.rule.baseMargin} = ${f3(s.baselines.B4.base - s.rule.baseMargin)}.\n`);
  console.log(`| Method | base | ${s.rule.attacks.join(' | ')} | attack mean | passes the base line |`);
  console.log(`|---|---|${s.rule.attacks.map(() => '---').join('|')}|---|---|`);
  for (const [id, r] of Object.entries(s.baselines)) console.log(`| ${id} | ${f3(r.base)} | ${s.rule.attacks.map((a) => f3(r.attacks[a])).join(' | ')} | ${f3(r.attackMean)} | – |`);
  for (const c of s.candidates) console.log(`| rep-2 ${c.id} | ${f3(c.base)} | ${s.rule.attacks.map((a) => f3(c.attacks[a])).join(' | ')} | ${f3(c.attackMean)} | ${s.eligible.includes(c.id) ? 'yes' : 'no'} |`);
  console.log(`\nChosen by the rule: **${s.chosen ? `B = ${s.chosen.newReviewerBudget}, burst ${s.chosen.burst ? 'on' : 'off'}` : 'none (stop)'}**.\n`);
  console.log('Attack lift (places bought; lower is better), development seeds, mean:\n');
  console.log(`| Method | ${s.rule.attacks.join(' | ')} |`);
  console.log(`|---|${s.rule.attacks.map(() => '---').join('|')}|`);
  for (const [id, r] of Object.entries(s.baselines)) console.log(`| ${id} | ${s.rule.attacks.map((a) => f3(r.attackLift[a])).join(' | ')} |`);
  for (const c of s.candidates) console.log(`| rep-2 ${c.id} | ${s.rule.attacks.map((a) => f3(c.attackLift[a])).join(' | ')} |`);
}

// 2. the test-seed run
const { files, reports } = loadTestReports(dir);
if (files.length) {
  const any = Object.values(reports)[0];
  const first = Object.values(reports).map((r) => r.startedAt).sort()[0];
  console.log(`\n**Test seeds** (SIMULATION; seeds ${any.seeds.first}..${any.seeds.last}, ${any.seeds.count} seeds, ${any.workersPerRun} workers per run; rep-2 = ${JSON.stringify(any.rep2Selected)}, parameters ${any.parametersHash}; frozen commit ${any.gitCommit}; first file started ${first}${any.rerunReason ? `; RE-RUN: ${any.rerunReason}` : ''}). Mean (standard deviation) over seeds.\n`);
  const order = ['base', 'inflation', 'sybil_k3', 'sybil_k5', 'sybil_k10', 'smart_sybil_k3', 'smart_sybil_k5', 'smart_sybil_k10', 'slow_sybil', 'pair_collusion', 'quality_change', 'combined', 'busy_genuine', 'new_platform', 'base_noise30', 'base_noise50', 'sybil_k5_noise30', 'sybil_k5_noise50'];
  const names = Object.keys(reports).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (process.argv.includes('--brief')) {
    const m = (r, k, f) => r.methods[k].metrics[f];
    console.log('| Scenario | NDCG@10: B1 / B4 / rep-1 cautious / **rep-2** | Attack lift: B1 / B4 / rep-1 cautious / **rep-2** | tau-b (all): B4 / **rep-2** | New-worker percentile: rep-1 / **rep-2** |');
    console.log('|---|---|---|---|---|');
    for (const name of names) {
      const r = reports[name];
      const four = (f) => ['B1', 'B4', 'rep1_cautious', 'rep2_expected'].map((k, i) => (i === 3 ? `**${f3(m(r, k, f).mean)}**` : f3(m(r, k, f).mean))).join(' / ');
      console.log(`| ${name} | ${four('all.ndcg10')} | ${m(r, 'B1', 'attackLift').n ? four('attackLift') : '–'} | ${f3(m(r, 'B4', 'all.tau').mean)} / **${f3(m(r, 'rep2_expected', 'all.tau').mean)}** | ${f3(m(r, 'rep1_cautious', 'newWorkerPosition').mean)} / **${f3(m(r, 'rep2_expected', 'newWorkerPosition').mean)}** |`);
    }
    const c = checkCriteria(reports);
    console.log(`\n- **S1** (base: rep-2 NDCG@10 ≥ B4 − 0.01 and ≥ B1): rep-2 ${f3(c.s1.rep2)}, B4 ${f3(c.s1.B4)}, B1 ${f3(c.s1.B1)} → **${c.s1.met ? 'met' : 'not met'}**`);
    console.log(`- **S2** (lower attack lift and higher NDCG@10 than B1 and B4, each in ≥ 80% of seeds): ${c.s2.map((s) => `${s.scenario} ${s.checks.map((x) => pct(x.share)).join('/')}`).join('; ')} → **${c.verdict.S2 ? 'met' : 'not met'}**`);
    console.log(`- **S3** (NDCG@10 above rep-1 cautious in ≥ 80% of seeds): ${c.s3.map((s) => `${s.scenario} ${pct(s.share)}`).join(', ')} → **${c.verdict.S3 ? 'met' : 'not met'}**`);
    console.log(`- Engine by the pre-registered rule: **${c.liveEngine}**`);
    process.exit(0);
  }
  console.log('| Scenario | Method | NDCG@10 (all) | Kendall tau-b (all) | Precision@10 (all) | Attack lift | New-worker percentile |');
  console.log('|---|---|---|---|---|---|---|');
  for (const name of names) {
    for (const m of Object.values(reports[name].methods)) {
      const x = m.metrics;
      console.log(`| ${name} | ${m.label} | ${ms(x['all.ndcg10'])} | ${ms(x['all.tau'])} | ${ms(x['all.p10'])} | ${x.attackLift.n ? ms(x.attackLift) : '–'} | ${ms(x.newWorkerPosition)} |`);
    }
  }
  console.log('\nPaired, rep-2 (expected) minus the other method, seed by seed: mean difference [share of seeds where rep-2 is better]:\n');
  console.log('| Scenario | vs | NDCG@10 | Attack lift | tau-b (all) |');
  console.log('|---|---|---|---|---|');
  for (const name of names) {
    for (const other of ['B1', 'B4', 'rep1_cautious']) {
      const p = reports[name].paired.find((x) => x.other === other).metrics;
      const c = (k) => (p[k]?.meanDifference == null ? '–' : `${signed(p[k].meanDifference)} [${pct(p[k].shareOursBetter)}]`);
      console.log(`| ${name} | ${other} | ${c('all.ndcg10')} | ${c('attackLift')} | ${c('all.tau')} |`);
    }
  }
  const c = checkCriteria(reports);
  console.log(`\n- **S1** (base: rep-2 NDCG@10 ≥ B4 − 0.01 and ≥ B1): rep-2 ${f3(c.s1.rep2)}, B4 ${f3(c.s1.B4)}, B1 ${f3(c.s1.B1)} → **${c.s1.met ? 'met' : 'not met'}**`);
  console.log(`- **S2** (each check in ≥ 80% of seeds): ${c.s2.map((s) => `${s.scenario} ${s.met ? 'met' : `not met (${s.checks.filter((x) => !x.met).map((x) => `${x.metric} vs ${x.other} ${pct(x.share)}`).join(', ')})`}`).join('; ')} → **${c.verdict.S2 ? 'met' : 'not met'}**`);
  console.log(`- **S3** (NDCG@10 above rep-1 cautious in ≥ 80% of seeds): ${c.s3.map((s) => `${s.scenario} ${pct(s.share)}`).join(', ')} → **${c.verdict.S3 ? 'met' : 'not met'}**`);
  console.log(`- Engine by the pre-registered rule: **${c.liveEngine}**`);
}
