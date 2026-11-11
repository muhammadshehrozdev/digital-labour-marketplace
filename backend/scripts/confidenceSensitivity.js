// Sensitivity of the Module 3 skill confidence to its PROVISIONAL weights (D-014).
// Run in .\backend:   npm run confidence:sensitivity
// Prints formula outputs for example evidence mixes. These are NOT measured results.
import { skillConfidence, DEFAULT_WEIGHTS, PRIOR_WEIGHT, BASE_RATE, STRENGTH_THRESHOLDS } from '../services/trust/skillConfidence.js';

const A = (type) => ({ status: 'approved', type });
const F = (type = 'certificate') => ({ status: 'suspected_fake', type });
const times = (n, item) => Array.from({ length: n }, () => item);

export const MIXES = [
  ['no evidence (self-declared)', []],
  ['1 certificate', [A('certificate')]],
  ['1 work photo', [A('work_photo')]],
  ['1 reference letter', [A('reference_letter')]],
  ['2 work photos', times(2, A('work_photo'))],
  ['5 work photos', times(5, A('work_photo'))],
  ['1 certificate + 1 work photo', [A('certificate'), A('work_photo')]],
  ['2 certificates', times(2, A('certificate'))],
  ['1 suspected fake only', [F()]],
  ['1 certificate + 1 fake certificate', [A('certificate'), F('certificate')]],
];

export const VARIANTS = [
  ['default (cert 2, photo 1, letter 1, fake 1, W 2)', {}],
  ['certificate weight 1', { weights: { certificate: 1 } }],
  ['certificate weight 3', { weights: { certificate: 3 } }],
  ['photo + letter weight 0.5', { weights: { work_photo: 0.5, reference_letter: 0.5 } }],
  ['photo + letter weight 1.5', { weights: { work_photo: 1.5, reference_letter: 1.5 } }],
  ['fake costs its type weight', { fakeCostByType: true }],
  ['at most 2 work photos count', { maxWorkPhotos: 2 }],
  ['prior weight W = 1', { W: 1 }],
  ['prior weight W = 4', { W: 4 }],
];

const fmt = (x) => x.toFixed(3);

export function sensitivityTable() {
  return MIXES.map(([name, list]) => ({
    mix: name,
    ...Object.fromEntries(VARIANTS.map(([label, opts]) => {
      const c = skillConfidence(list, opts);
      return [label, `${fmt(c.expected)} ${c.status === 'verified' ? 'V' : c.status === 'disputed' ? 'D' : c.status === 'evidence_pending' ? 'P' : 'S'}`];
    })),
  }));
}

if (process.argv[1] && process.argv[1].endsWith('confidenceSensitivity.js')) {
  console.log('Skill confidence sensitivity (formula outputs for example mixes, NOT measured results)');
  console.log(`Method: E = b + a*u with W = ${PRIOR_WEIGHT}, a = ${BASE_RATE}; default weights ${JSON.stringify(DEFAULT_WEIGHTS)}`);
  console.log(`Strength labels: strong E >= ${STRENGTH_THRESHOLDS.strong}, moderate E >= ${STRENGTH_THRESHOLDS.moderate}, else weak; "none" without counted evidence`);
  console.log('Status letter: V = Verified by evidence, D = Disputed, S = Self-declared\n');
  for (const [i, [label]] of VARIANTS.entries()) console.log(`  column ${i + 1}: ${label}`);
  console.log('');
  const header = ['Evidence on one skill'.padEnd(36), ...VARIANTS.map((_, i) => `col ${i + 1}`.padStart(8))].join(' ');
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const row of sensitivityTable()) {
    console.log([row.mix.padEnd(36), ...VARIANTS.map(([label]) => row[label].padStart(8))].join(' '));
  }
  const d = (list, opts) => fmt(skillConfidence(list, opts).expected);
  console.log('\nKnown weak points of the default weights (decision D-014):');
  console.log(`  1. Certificate + one fake = ${d([A('certificate'), F('certificate')])} (above ${d([])} for no evidence; still shown as Disputed).`);
  console.log(`     If a fake costs its type weight: ${d([A('certificate'), F('certificate')], { fakeCostByType: true })}.`);
  console.log(`  2. Five work photos = ${d(times(5, A('work_photo')))} beat one certificate = ${d([A('certificate')])}.`);
  console.log(`     With at most 2 work photos counted: ${d(times(5, A('work_photo')), { maxWorkPhotos: 2 })}.`);
}
