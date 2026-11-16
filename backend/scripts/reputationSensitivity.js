// Sensitivity of the Module 4 reputation score to its PROVISIONAL parameters (Batch 6, D-048).
// Run in .\backend:   npm run reputation:sensitivity
// Prints formula outputs (expected / cautious) for the hand-worked cases of the plan while ONE
// parameter moves. These are NOT measured results: they show how the formula reacts.
import { computeReputation } from '../services/reputation/reputationEngine.js';
import { DEFAULT_REPUTATION_PARAMS as P, withParams } from '../config/reputationParams.js';

const NOW = new Date('2026-01-01T00:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
let id = 0;
// weight 1 unless changed: today, completed by both, the customer has hired 3 other workers
const R = (stars, extra = {}) => {
  id += 1;
  return { id: `s${id}`, customerId: `c${id}`, stars, createdAt: NOW, completionMethod: 'both', reviewerOtherWorkers: 3, ...extra };
};
const times = (n, make) => Array.from({ length: n }, (_, i) => make(i));

export const CASES = [
  ['No reviews', []],
  ['One 5 star', [R(5)]],
  ['One 1 star', [R(1)]],
  ['One 4 star', [R(4)]],
  ['One 3 star', [R(3)]],
  ['One 5 star, new reviewer (n = 0)', [R(5, { reviewerOtherWorkers: 0 })]],
  ['One 5 star, one year old', [R(5, { createdAt: new Date(NOW.getTime() - 365 * DAY) })]],
  ['One 5 star, auto-completed', [R(5, { completionMethod: 'auto' })]],
  ['Ten 5 star', times(10, () => R(5))],
  ['Three 5 star, same customer', times(3, (i) => R(5, { customerId: 'same', id: `same${i}` }))],
  ['28 x 5 star + 12 x 4 star', [...times(28, () => R(5)), ...times(12, () => R(4))]],
];

// One parameter at a time; the middle value of each group is the default.
export const GROUPS = [
  { name: 'half-life (days)', values: [180, 365, 730], params: (v) => withParams({ halfLifeDays: v }) },
  { name: 'auto-completion weight', values: [0.4, 0.6, 0.8], params: (v) => withParams({ provenance: { auto: v } }) },
  { name: 'reviewer trust floor', values: [0.3, 0.5, 0.7], params: (v) => withParams({ trustFloor: v }) },
  { name: 'prior weight W', values: [1, 2, 4], params: (v) => withParams({ priorWeight: v }) },
];

const fmt = (x) => x.toFixed(4);

export function sensitivityTable() {
  return GROUPS.map((group) => ({
    group: group.name,
    values: group.values,
    rows: CASES.map(([name, reviews]) => ({
      name,
      cells: group.values.map((v) => {
        const res = computeReputation(reviews, { now: NOW, params: group.params(v) });
        return { expected: res.expected, cautious: res.cautious };
      }),
    })),
  }));
}

if (process.argv[1] && process.argv[1].endsWith('reputationSensitivity.js')) {
  console.log('Reputation sensitivity (formula outputs for the hand-worked cases, NOT measured results)');
  console.log(`Defaults: W = ${P.priorWeight}, a = ${P.baseRate}, half-life ${P.halfLifeDays} days, auto weight ${P.provenance.auto}, trust floor ${P.trustFloor} (cap ${P.trustCap}), z = ${P.cautiousZ}`);
  console.log('Each cell: expected / cautious. Only one parameter moves at a time; the middle column is the default.\n');
  for (const table of sensitivityTable()) {
    const header = [`${table.group}`.padEnd(36), ...table.values.map((v) => String(v).padStart(17))].join(' ');
    console.log(header);
    console.log('-'.repeat(header.length));
    for (const row of table.rows) {
      console.log([row.name.padEnd(36), ...row.cells.map((c) => `${fmt(c.expected)} / ${fmt(c.cautious)}`.padStart(17))].join(' '));
    }
    console.log('');
  }
  const order = (params) => {
    const score = (list) => computeReputation(list, { now: NOW, params }).cautious;
    return score(CASES[10][1]) > score(CASES[8][1]) && score(CASES[8][1]) > score(CASES[1][1]);
  };
  const keeps = GROUPS.flatMap((g) => g.values.map((v) => [`${g.name} = ${v}`, order(g.params(v))]));
  console.log('Does "40 reviews averaging 4.7 > ten 5 star > one 5 star" (by cautious) hold for every value above?');
  for (const [label, ok] of keeps) console.log(`  ${ok ? 'yes' : 'NO '}  ${label}`);
}
