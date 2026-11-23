// Module 6: agreement between two annotators who labelled the same descriptions independently (protocol step 2).
// Run in ./backend:  npm run agreement:jobs -- --a <annotator-a.csv> --b <annotator-b.csv>
// Cohen's kappa (Cohen 1960) and Krippendorff's alpha (nominal; Module 2's code) for category, task type, script,
// city, day, time slot and urgent; for skills the mean per-item Jaccard index and micro-F1 of B against A.
// "Not stated" (an empty cell) is a label of its own. Compute it BEFORE the annotators discuss anything.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJobDataset } from './dataset.js';
import { cohensKappa, krippendorffAlphaNominal, jaccard, microMacro } from './metrics.js';

const EMPTY = '(not stated)';
export const AGREEMENT_FIELDS = Object.freeze({
  category: (it) => it.gold.category,
  taskType: (it) => it.gold.taskType,
  script: (it) => it.script,
  city: (it) => it.gold.city,
  when: (it) => it.gold.when,
  timeSlot: (it) => it.gold.timeSlot,
  urgent: (it) => (it.gold.urgent ? 'yes' : 'no'),
});

export function jobAgreement(itemsA, itemsB) {
  const byId = new Map(itemsB.map((it) => [it.id, it]));
  const missing = itemsA.filter((it) => !byId.has(it.id)).map((it) => it.id);
  const extra = itemsB.filter((it) => !itemsA.some((a) => a.id === it.id)).map((it) => it.id);
  if (missing.length || extra.length) throw new Error(`The two files must have the same ids. Only in A: ${missing.join(', ') || '-'}; only in B: ${extra.join(', ') || '-'}`);
  const pairs = itemsA.map((a) => [a, byId.get(a.id)]);
  const fields = {};
  for (const [name, get] of Object.entries(AGREEMENT_FIELDS)) {
    const la = pairs.map(([a]) => get(a) ?? EMPTY);
    const lb = pairs.map(([, b]) => get(b) ?? EMPTY);
    fields[name] = {
      items: pairs.length,
      sameLabel: la.filter((x, i) => x === lb[i]).length,
      cohensKappa: cohensKappa(la, lb),
      krippendorffAlpha: krippendorffAlphaNominal(la.map((x, i) => [x, lb[i]])),
    };
  }
  const jac = pairs.map(([a, b]) => jaccard(a.gold.skills, b.gold.skills));
  const skills = {
    items: pairs.length,
    meanJaccard: jac.reduce((s, x) => s + x, 0) / (jac.length || 1),
    microF1BAgainstA: microMacro(pairs.map(([a, b]) => ({ gold: a.gold.skills, predicted: b.gold.skills }))).micro.f1,
  };
  return { fields, skills, disagreements: pairs.filter(([a, b]) => a.gold.category !== b.gold.category).map(([a]) => a.id) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? undefined : process.argv[i + 1]; };
  if (!arg('a') || !arg('b')) {
    console.error('Usage: npm run agreement:jobs -- --a <annotator-a.csv> --b <annotator-b.csv>');
    process.exit(1);
  }
  try {
    const A = loadJobDataset(arg('a'));
    const B = loadJobDataset(arg('b'));
    if (A.synthetic || B.synthetic) console.log('\n*** SYNTHETIC DATA: these numbers only test the script. Never report them. ***\n');
    const r = jobAgreement(A.items, B.items);
    console.log(`Annotator A: ${A.file} (sha256 ${A.sha256.slice(0, 12)}…)   Annotator B: ${B.file} (sha256 ${B.sha256.slice(0, 12)}…)`);
    console.log('\nField       same label   Cohen kappa   Krippendorff alpha');
    for (const [name, f] of Object.entries(r.fields)) console.log(`${name.padEnd(11)} ${`${f.sameLabel}/${f.items}`.padEnd(12)} ${f.cohensKappa.toFixed(3).padStart(11)}   ${f.krippendorffAlpha.toFixed(3).padStart(18)}`);
    console.log(`skills      mean Jaccard ${r.skills.meanJaccard.toFixed(3)}, micro-F1 of B against A ${r.skills.microF1BAgainstA.toFixed(3)}`);
    console.log(`\nCategory disagreements to discuss AFTER this report: ${r.disagreements.join(', ') || 'none'}`);
    if (r.fields.category.cohensKappa < 0.6) console.log('Category kappa is below 0.60: revise the guide and label everything again, blind (PROTOCOL.md step 2).');
  } catch (err) {
    console.error(`Agreement failed: ${err.message}`);
    process.exit(1);
  }
}
