// Module 4: the sensitivity script (npm run reputation:sensitivity) uses the production engine, and its
// default column equals the hand-worked values of the plan (section 4.6).
import { describe, test, expect } from 'vitest';
import { sensitivityTable, CASES, GROUPS } from '../../scripts/reputationSensitivity.js';

const round4 = (x) => Number(x.toFixed(4));

describe('reputation sensitivity table', () => {
  const tables = sensitivityTable();

  test('one table per parameter group, every case in every table, three values each', () => {
    expect(tables.map((t) => t.group)).toEqual(['half-life (days)', 'auto-completion weight', 'reviewer trust floor', 'prior weight W']);
    for (const t of tables) {
      expect(t.rows).toHaveLength(CASES.length);
      expect(t.values).toHaveLength(3);
    }
    expect(GROUPS.map((g) => g.values[1])).toEqual([365, 0.6, 0.5, 2]); // the middle value is the default
  });

  test('the default column gives the hand-worked numbers', () => {
    const middle = Object.fromEntries(tables[0].rows.map((r) => [r.name, [round4(r.cells[1].expected), round4(r.cells[1].cautious)]]));
    expect(middle['No reviews']).toEqual([0.5, 0.13]);
    expect(middle['One 5 star']).toEqual([0.6667, 0.3646]);
    expect(middle['One 5 star, auto-completed']).toEqual([0.6154, 0.2868]);
    expect(middle['28 x 5 star + 12 x 4 star']).toEqual([0.9048, 0.8474]);
  });

  test('only the parameter of a group moves its case: a longer half-life helps the one-year-old review', () => {
    const row = tables[0].rows.find((r) => r.name === 'One 5 star, one year old');
    expect(row.cells[0].expected).toBeLessThan(row.cells[1].expected);
    expect(row.cells[1].expected).toBeLessThan(row.cells[2].expected);
    const fresh = tables[0].rows.find((r) => r.name === 'One 5 star');
    expect(new Set(fresh.cells.map((c) => c.expected)).size).toBe(1);
  });
});
