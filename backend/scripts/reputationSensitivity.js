// Sensitivity of the Module 4 reputation score to its PROVISIONAL parameters (Batch 6, D-048).
// Run in .\backend:   npm run reputation:sensitivity
// Prints formula outputs (expected / cautious) for the hand-worked cases of the plan while ONE
// parameter moves. These are NOT measured results: they show how the formula reacts.
//
// Batch 6B: the rep-1 tables below stay as they were (rep-1's parameters by name), and rep-2 gets its own
// tables (B 1/2/3, burst off/on, base rate 0.5/0.7/0.8, W 1/2/4) around a reference set: the frozen rep-2 when
// REP2_SELECTED is set, else B = 2 and burst off (the middle of the candidates); base rate 0.7 (middle).
import { computeReputation } from '../services/reputation/reputationEngine.js';
import { REP1_PARAMS as P, REP2_SELECTED, rep2Params, withParams } from '../config/reputationParams.js';

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
const rep1 = (changes) => withParams(changes, P);
export const GROUPS = [
  { name: 'half-life (days)', values: [180, 365, 730], params: (v) => rep1({ halfLifeDays: v }) },
  { name: 'auto-completion weight', values: [0.4, 0.6, 0.8], params: (v) => rep1({ provenance: { auto: v } }) },
  { name: 'reviewer trust floor', values: [0.3, 0.5, 0.7], params: (v) => rep1({ trustFloor: v }) },
  { name: 'prior weight W', values: [1, 2, 4], params: (v) => rep1({ priorWeight: v }) },
];

// ---- rep-2 (Batch 6B) ----
export const REP2_REFERENCE = REP2_SELECTED ?? { newReviewerBudget: 2, burst: false };
export const REP2_REFERENCE_BASE_RATE = 0.7;
// rep-2 has no recency, so a date matters only for the burst check: the reviews of a case are 15 days apart
// (never a burst), except the case that shows one (four days in a row).
const spread = (list) => list.map((rv, i) => ({ ...rv, createdAt: new Date(NOW.getTime() - i * 15 * DAY) }));
const fresh = (stars, extra = {}) => R(stars, { reviewerOtherWorkers: 0, ...extra }); // a new reviewer
export const REP2_CASES = [
  ['No reviews', []],
  ['One 5 star', [R(5)]],
  ['One 1 star', [R(1)]],
  ['Ten 5 star, reviewers with history', spread(times(10, () => R(5)))],
  ['Ten 5 star from ten new reviewers', spread(times(10, () => fresh(5)))],
  ['Two 4 star (history) + five 5 star (new reviewers)', spread([...times(2, () => R(4)), ...times(5, () => fresh(5))])],
  ['Four 5 star on four days in a row', times(4, (i) => R(5, { createdAt: new Date(NOW.getTime() - i * DAY) }))],
  ['28 x 5 star + 12 x 4 star', spread([...times(28, () => R(5)), ...times(12, () => R(4))])],
];
const ref = (changes = {}) => withParams(changes, rep2Params(REP2_REFERENCE));
// one parameter at a time; the reference value is in the middle (burst: the reference's own value is marked)
export const REP2_GROUPS = [
  { name: 'new-reviewer budget B', values: [1, 2, 3], params: (v) => withParams({}, rep2Params({ ...REP2_REFERENCE, newReviewerBudget: v })), baseRate: () => REP2_REFERENCE_BASE_RATE },
  { name: 'burst check', values: ['off', 'on'], params: (v) => withParams({}, rep2Params({ ...REP2_REFERENCE, burst: v === 'on' })), baseRate: () => REP2_REFERENCE_BASE_RATE },
  { name: 'base rate a', values: [0.5, 0.7, 0.8], params: () => ref(), baseRate: (v) => v },
  { name: 'prior weight W', values: [1, 2, 4], params: (v) => ref({ priorWeight: v }), baseRate: () => REP2_REFERENCE_BASE_RATE },
];

export function rep2SensitivityTable() {
  return REP2_GROUPS.map((group) => ({
    group: group.name,
    values: group.values,
    rows: REP2_CASES.map(([name, reviews]) => ({
      name,
      cells: group.values.map((v) => {
        const res = computeReputation(reviews, { now: NOW, params: group.params(v), baseRate: group.baseRate(v) });
        return { expected: res.expected, cautious: res.cautious };
      }),
    })),
  }));
}

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

  console.log(`\n==== rep-2 (Batch 6B): reference B = ${REP2_REFERENCE.newReviewerBudget}, burst ${REP2_REFERENCE.burst ? 'on' : 'off'}, base rate a = ${REP2_REFERENCE_BASE_RATE}, W = 2${REP2_SELECTED ? ' (the frozen rep-2)' : ' (the middle of the candidates; rep-2 is not frozen yet)'}. Ranking number: expected. ====\n`);
  for (const table of rep2SensitivityTable()) {
    const header = [`${table.group}`.padEnd(52), ...table.values.map((v) => String(v).padStart(17))].join(' ');
    console.log(header);
    console.log('-'.repeat(header.length));
    for (const row of table.rows) console.log([row.name.padEnd(52), ...row.cells.map((c) => `${fmt(c.expected)} / ${fmt(c.cautious)}`.padStart(17))].join(' '));
    console.log('');
  }
}
