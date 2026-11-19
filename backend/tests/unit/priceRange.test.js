// Module 5 (Batch 7, §4.4): the platform price range. Hand-worked cases A-H (the calculation of every expected
// number is in the comments) and property tests with a seeded generator. Pure function, `now` passed in.
//
// Quantile, Hyndman & Fan (1996) definition 7: sort x[0..n-1]; h = (n - 1) p; j = floor(h);
// Q(p) = x[j] + (h - j)(x[j+1] - x[j]). Then round to the nearest 50, halves up.
import { describe, test, expect } from 'vitest';
import { WAGE_RULES } from '../../config/wageRules.js';
import { createRng } from '../../evaluation/reputation/rng.js';
import { levelsFor, meetsMinimums, onePerPair, priceRange, qualifyingJobs, quantile, roundTo, summarize } from '../../services/wage/priceRange.js';

const NOW = new Date('2026-11-19T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(NOW.getTime() - n * DAY);
let seq = 0;
// one job: worker w, customer c, completed `ago` days before NOW, agreed per job
function job(amount, { w, c, ago = 10, unit = 'job', skillId = 'elec_wiring', category = 'electrical_solar', city = 'Islamabad', region = 'ICT', status = 'completed', method = 'both', agreed = true } = {}) {
  seq += 1;
  return {
    bookingId: `b${String(seq).padStart(4, '0')}`, workerId: w ?? `w${seq}`, customerId: c ?? `c${seq}`, skillId, category, region, city, status,
    completedAt: daysAgo(ago), completionMethod: method, agreed: agreed ? { unit, amount } : null,
  };
}
const QUERY = { skillId: 'elec_wiring', category: 'electrical_solar', unit: 'job', city: 'Islamabad', region: 'ICT' };
const range = (jobs, query = QUERY) => priceRange(jobs, query, { now: NOW });
// five jobs, five different workers and customers
const five = (amounts, extra = {}) => amounts.map((a, i) => job(a, { w: `w${i}`, c: `c${i}`, ...extra }));

describe('the quantile and the rounding', () => {
  test('definition 7 on small lists; an empty list has none', () => {
    expect(quantile([10], 0.25)).toBe(10);
    expect(quantile([10, 20], 0.5)).toBe(15);
    expect(quantile([1, 2, 3, 4], 0.75)).toBe(3.25); // h = 3 x 0.75 = 2.25: 3 + 0.25 x 1
    expect(quantile([], 0.5)).toBeNull();
  });
  test('round to 50, halves up', () => {
    expect(roundTo(1725, 50)).toBe(1750);
    expect(roundTo(1724.99, 50)).toBe(1700);
    expect(roundTo(1625, 50)).toBe(1650);
    expect(roundTo(2875, 50)).toBe(2900);
    expect(roundTo(1350, 50)).toBe(1350);
  });
});

describe('hand-worked cases (§4.4)', () => {
  test('A: 1000, 1500, 2000, 2500, 3000 -> 1500 · 2000 · 2500 (the plain mean is also 2000)', () => {
    // n = 5. p = .25: h = 1, x[1] = 1500. p = .5: h = 2, x[2] = 2000. p = .75: h = 3, x[3] = 2500.
    expect(range(five([1000, 1500, 2000, 2500, 3000]))).toEqual({ level: 'city', scope: 'skill', unit: 'job', low: 1500, median: 2000, high: 2500, jobs: 5, workers: 5 });
  });

  test('B: 800, 1000, 1200, 1500, 1800, 5000 -> 1050 · 1350 · 1750 (the mean would be 1883.33)', () => {
    // n = 6. p = .25: h = 1.25, 1000 + .25 x 200 = 1050. p = .5: h = 2.5, 1200 + .5 x 300 = 1350.
    // p = .75: h = 3.75, 1500 + .75 x 300 = 1725 -> 1750 (half up). Mean = 11300 / 6 = 1883.33.
    const jobs = [800, 1000, 1200, 1500, 1800, 5000].map((a, i) => job(a, { w: `w${i % 4}`, c: `c${i}` }));
    expect(range(jobs)).toMatchObject({ low: 1050, median: 1350, high: 1750, jobs: 6, workers: 4 });
  });

  test('C: 2000, 2200, 2500, 3000, 3500, 4000, 4500 -> 2350 · 3000 · 3750', () => {
    // n = 7. p = .25: h = 1.5, 2200 + .5 x 300 = 2350. p = .5: h = 3, x[3] = 3000.
    // p = .75: h = 4.5, 3500 + .5 x 500 = 3750.
    const jobs = [2000, 2200, 2500, 3000, 3500, 4000, 4500].map((a, i) => job(a, { w: `w${i % 3}`, c: `c${i}` }));
    expect(range(jobs)).toMatchObject({ low: 2350, median: 3000, high: 3750, jobs: 7, workers: 3 });
  });

  test('D: 700, 900, 1100, 1250, 1400 -> 900 · 1100 · 1250', () => {
    // n = 5. h = 1, 2, 3: x[1] = 900, x[2] = 1100, x[3] = 1250.
    expect(range(five([700, 900, 1100, 1250, 1400]))).toMatchObject({ low: 900, median: 1100, high: 1250 });
  });

  test('E: case A from only 2 workers (and 5 customers) -> null at this level (3 workers needed), the next level is tried', () => {
    const jobs = [1000, 1500, 2000, 2500, 3000].map((a, i) => job(a, { w: `w${i % 2}`, c: `c${i}` }));
    expect(meetsMinimums(onePerPair(jobs))).toEqual({ ok: false, jobs: 5, workers: 2, customers: 5 });
    expect(range(jobs)).toBeNull(); // every level holds the same 5 jobs here
    // in Rawalpindi there are none, but the region level (Punjab) has 5 jobs from 3 workers
    const pindi = [1000, 1500, 2000, 2500, 3000].map((a, i) => job(a, { w: `p${i % 3}`, c: `pc${i}`, city: 'Lahore', region: 'PB' }));
    expect(range([...jobs, ...pindi], { ...QUERY, city: 'Rawalpindi', region: 'PB' })).toMatchObject({ level: 'region', scope: 'skill', low: 1500, median: 2000, high: 2500 });
  });

  test('F: case A plus 3 jobs of 9000 from ONE new pair -> 1650 · 2250 · 2900 (without the pair rule: 1900 · 2750 · 9000)', () => {
    // The pair counts once (its most recent job): 1000, 1500, 2000, 2500, 3000, 9000 (n = 6).
    // p = .25: h = 1.25, 1500 + .25 x 500 = 1625 -> 1650. p = .5: h = 2.5, 2000 + .5 x 500 = 2250.
    // p = .75: h = 3.75, 2500 + .75 x 500 = 2875 -> 2900.
    // Without the rule (n = 8): 1000 1500 2000 2500 3000 9000 9000 9000; p = .25: h = 1.75, 1500 + .75 x 500 = 1875 -> 1900;
    // p = .5: h = 3.5, 2500 + .5 x 500 = 2750; p = .75: h = 5.25, 9000.
    const pair = [1, 2, 3].map((ago) => job(9000, { w: 'wX', c: 'cX', ago }));
    expect(range([...five([1000, 1500, 2000, 2500, 3000]), ...pair])).toMatchObject({ low: 1650, median: 2250, high: 2900, jobs: 6, workers: 6 });
    const noRule = summarize([1000, 1500, 2000, 2500, 3000, 9000, 9000, 9000]);
    expect([noRule.q25, noRule.q50, noRule.q75].map((x) => roundTo(x, 50))).toEqual([1900, 2750, 9000]);
  });

  test('G: 5 jobs, one auto-completed and one with only a proposed price -> null (3 remain)', () => {
    const jobs = [
      ...five([1000, 1500, 2000]),
      job(2500, { w: 'w8', c: 'c8', method: 'auto' }),
      job(3000, { w: 'w9', c: 'c9', agreed: false }),
    ];
    expect(qualifyingJobs(jobs, { unit: 'job', now: NOW })).toHaveLength(3);
    expect(range(jobs)).toBeNull();
  });

  test('H: 5 qualifying jobs, but one was completed 400 days ago -> null (outside the 365-day window)', () => {
    const jobs = [...five([1000, 1500, 2000, 2500]), job(3000, { w: 'w9', c: 'c9', ago: 400 })];
    expect(range(jobs)).toBeNull();
    // exactly 365 days ago still counts
    expect(range([...five([1000, 1500, 2000, 2500]), job(3000, { w: 'w9', c: 'c9', ago: 365 })])).toMatchObject({ jobs: 5 });
  });
});

describe('the filters and the levels', () => {
  test('completed by an admin decision counts; cancelled, accepted and auto do not; jobs in the future do not', () => {
    const jobs = [
      job(1000, { method: 'admin' }), job(1000, { status: 'cancelled' }), job(1000, { status: 'accepted', method: null }), job(1000, { method: 'auto' }), job(1000, { ago: -1 }),
    ];
    expect(qualifyingJobs(jobs, { unit: 'job', now: NOW })).toHaveLength(1);
  });

  test('city first, then region, then Pakistan; "Pindi" and "Rawalpindi" are the same city', () => {
    const pindi = five([1000, 1500, 2000, 2500, 3000], { city: 'pindi', region: 'PB' });
    expect(range(pindi, { ...QUERY, city: 'Rawalpindi', region: 'PB' })).toMatchObject({ level: 'city', scope: 'skill' });
    const karachi = five([1000, 1500, 2000, 2500, 3000], { city: 'Karachi', region: 'SD' });
    expect(range(karachi, { ...QUERY, city: 'Lahore', region: 'PB' })).toMatchObject({ level: 'country', scope: 'skill' });
    // an unknown city: no region level, the country level still works
    expect(levelsFor({ ...QUERY, city: 'Chak 45', region: null }).map((l) => `${l.scope}:${l.level}`)).toEqual(['skill:city', 'skill:country']);
  });

  test('a whole job never falls back to the category; a day does (after all skill levels)', () => {
    expect(levelsFor(QUERY).map((l) => `${l.scope}:${l.level}`)).toEqual(['skill:city', 'skill:region', 'skill:country']);
    expect(levelsFor({ ...QUERY, unit: 'day' }).map((l) => `${l.scope}:${l.level}`))
      .toEqual(['skill:city', 'skill:region', 'skill:country', 'category:city', 'category:region', 'category:country']);
    const solarDays = five([1600, 1700, 1800, 1900, 2000], { unit: 'day', skillId: 'elec_solar' });
    expect(range(solarDays, { ...QUERY, unit: 'day' })).toMatchObject({ level: 'city', scope: 'category', low: 1700, median: 1800, high: 1900 });
    expect(range(five([1600, 1700, 1800, 1900, 2000], { skillId: 'elec_solar' }))).toBeNull(); // whole jobs of another skill
  });

  test('the output is aggregates only: no amounts list, no ids, no names', () => {
    const out = range(five([1000, 1500, 2000, 2500, 3000]));
    expect(Object.keys(out).sort()).toEqual(['high', 'jobs', 'level', 'low', 'median', 'scope', 'unit', 'workers']);
  });

  test('`now` is required (the engine never reads the clock)', () => {
    expect(() => priceRange([], QUERY)).toThrow(/now/);
  });
});

describe('property tests (seeded, 200 random markets each)', () => {
  const rng = createRng(20261119);
  function market() {
    const n = rng.int(5, 25);
    const workers = rng.int(3, 8);
    return Array.from({ length: n }, (_, i) => job(rng.int(2, 120) * 50, { w: `w${i % workers}`, c: `c${i}`, ago: rng.int(0, 300) }));
  }
  const runs = Array.from({ length: 200 }, market);

  test('the order of the input never matters', () => {
    for (const jobs of runs) expect(range(rng.shuffle(jobs))).toEqual(range(jobs));
  });

  test('multiplying every amount by k multiplies the three numbers by k (before rounding)', () => {
    for (const jobs of runs) {
      const k = rng.int(2, 9);
      const base = summarize(onePerPair(qualifyingJobs(jobs, { unit: 'job', now: NOW })).map((j) => j.agreed.amount));
      const scaled = summarize(onePerPair(qualifyingJobs(jobs.map((j) => ({ ...j, agreed: { ...j.agreed, amount: j.agreed.amount * k } })), { unit: 'job', now: NOW })).map((j) => j.agreed.amount));
      for (const key of ['q25', 'q50', 'q75']) expect(scaled[key]).toBeCloseTo(base[key] * k, 6);
    }
  });

  test('low <= median <= high, and never from fewer than the minimums', () => {
    for (const jobs of runs) {
      const out = range(jobs);
      if (!out) continue;
      expect(out.low).toBeLessThanOrEqual(out.median);
      expect(out.median).toBeLessThanOrEqual(out.high);
      expect(out.jobs).toBeGreaterThanOrEqual(WAGE_RULES.MIN_JOBS);
      expect(out.workers).toBeGreaterThanOrEqual(WAGE_RULES.MIN_WORKERS);
    }
    // a random small market below a minimum is always null
    for (let i = 0; i < 100; i += 1) {
      const few = Array.from({ length: rng.int(1, 4) }, (_, k) => job(rng.int(2, 60) * 50, { w: `w${k}`, c: `c${k}` }));
      expect(range(few)).toBeNull();
      const twoWorkers = Array.from({ length: rng.int(5, 12) }, (_, k) => job(rng.int(2, 60) * 50, { w: `w${k % 2}`, c: `c${k}` }));
      expect(range(twoWorkers)).toBeNull();
      const twoCustomers = Array.from({ length: rng.int(5, 12) }, (_, k) => job(rng.int(2, 60) * 50, { w: `w${k}`, c: `c${k % 2}` }));
      expect(range(twoCustomers)).toBeNull();
    }
  });

  test('adding an OLDER job from an existing pair never changes the result; a newer one replaces that pair\'s job', () => {
    for (const jobs of runs) {
      const before = range(jobs);
      const pick = rng.pick(jobs);
      const older = { ...job(rng.int(2, 120) * 50, { w: pick.workerId, c: pick.customerId }), completedAt: new Date(new Date(pick.completedAt).getTime() - DAY) };
      expect(range([...jobs, older])).toEqual(before);
      const newer = { ...older, bookingId: `${older.bookingId}n`, completedAt: new Date(new Date(pick.completedAt).getTime() + 1000), agreed: { unit: 'job', amount: pick.agreed.amount } };
      if (new Date(newer.completedAt) <= NOW) expect(range([...jobs, newer])).toEqual(before); // same amount, newer: same numbers
    }
  });

  test('jobs in a different unit never change the result', () => {
    for (const jobs of runs) {
      const days = jobs.map((j) => ({ ...j, bookingId: `${j.bookingId}d`, customerId: `${j.customerId}d`, agreed: { unit: 'day', amount: j.agreed.amount * 3 } }));
      expect(range([...jobs, ...days])).toEqual(range(jobs));
    }
  });
});
