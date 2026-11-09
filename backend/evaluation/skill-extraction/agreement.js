// Inter-annotator agreement between two label files in the dataset format
// (docs/evaluation/annotation-guide.md).
// Run in .\backend:   npm run agreement:skills -- --a <annotator1.csv> --b <annotator2.csv>
//
// 1. Category: one label per description ("none" if empty) -> Cohen's kappa + Krippendorff's alpha.
// 2. Skills: one yes/no decision per (description, skill) for every skill that EITHER annotator
//    used anywhere in the files -> Cohen's kappa + Krippendorff's alpha.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataset } from './dataset.js';
import { cohensKappa, krippendorffAlphaNominal } from './metrics.js';

export function agreement(itemsA, itemsB) {
  const byId = new Map(itemsB.map((it) => [it.id, it]));
  const shared = itemsA.filter((it) => byId.has(it.id));
  if (shared.length === 0) throw new Error('The two files share no item ids');
  const catA = shared.map((it) => it.goldCategory ?? 'none');
  const catB = shared.map((it) => byId.get(it.id).goldCategory ?? 'none');

  const used = new Set();
  for (const it of [...itemsA, ...itemsB]) for (const s of it.goldSkills) used.add(s);
  const decA = [];
  const decB = [];
  for (const it of shared) {
    for (const s of used) {
      decA.push(it.goldSkills.has(s) ? 'yes' : 'no');
      decB.push(byId.get(it.id).goldSkills.has(s) ? 'yes' : 'no');
    }
  }
  return {
    items: shared.length,
    onlyInA: itemsA.length - shared.length,
    onlyInB: itemsB.length - shared.length,
    category: {
      cohensKappa: cohensKappa(catA, catB),
      krippendorffAlpha: krippendorffAlphaNominal(catA.map((a, i) => [a, catB[i]])),
      rawAgreement: catA.filter((a, i) => a === catB[i]).length / shared.length,
    },
    skills: {
      skillsConsidered: used.size,
      decisions: decA.length,
      cohensKappa: decA.length ? cohensKappa(decA, decB) : null,
      krippendorffAlpha: decA.length ? krippendorffAlphaNominal(decA.map((a, i) => [a, decB[i]])) : null,
      rawAgreement: decA.length ? decA.filter((a, i) => a === decB[i]).length / decA.length : null,
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? undefined : process.argv[i + 1]; };
  if (!arg('a') || !arg('b')) {
    console.error('Usage: npm run agreement:skills -- --a <annotator1.csv> --b <annotator2.csv>');
    process.exit(1);
  }
  try {
    const a = loadDataset(arg('a'));
    const b = loadDataset(arg('b'));
    if (a.synthetic || b.synthetic) console.log('*** SYNTHETIC DATA: these numbers only test the script. Never report them. ***');
    console.log(JSON.stringify(agreement(a.items, b.items), null, 2));
  } catch (err) {
    console.error(`Agreement failed: ${err.message}`);
    process.exit(1);
  }
}
