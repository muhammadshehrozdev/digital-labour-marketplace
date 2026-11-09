// Evaluation harness (Module 2, M2-15): metric functions checked against hand-worked numbers,
// and the harness run end-to-end on the SYNTHETIC sample (structure only, never the numbers).
import { describe, test, expect } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  prf, wilson, itemCounts, microMacro, bootstrapF1, pairedBootstrap, cohensKappa, krippendorffAlphaNominal, seededRandom,
} from '../../evaluation/skill-extraction/metrics.js';
import { parseCsv, loadDataset } from '../../evaluation/skill-extraction/dataset.js';
import { evaluateDataset, writeResults } from '../../evaluation/skill-extraction/evaluate.js';
import { agreement } from '../../evaluation/skill-extraction/agreement.js';

const SAMPLE = 'evaluation/skill-extraction/dataset.synthetic.dev.csv';
const SAMPLE_B = 'evaluation/skill-extraction/dataset.synthetic.annotator-b.csv';

describe('metrics (hand-worked)', () => {
  test('TP=8, FP=2, FN=4 -> P 0.8, R 0.6667, F1 0.7273', () => {
    const r = prf({ tp: 8, fp: 2, fn: 4 });
    expect(r.precision).toBeCloseTo(0.8, 10);
    expect(r.recall).toBeCloseTo(8 / 12, 10);
    expect(r.f1).toBeCloseTo((2 * 0.8 * (2 / 3)) / (0.8 + 2 / 3), 10); // 0.72727
  });

  test('no predictions -> precision 0 and flagged undefined', () => {
    expect(prf({ tp: 0, fp: 0, fn: 3 })).toMatchObject({ precision: 0, recall: 0, f1: 0, undefinedPrecision: true });
  });

  test('Wilson 95% for 8/10 = [0.4902, 0.9433] (worked by hand: centre 0.7168, margin 0.2266)', () => {
    const { low, high } = wilson(8, 10);
    expect(low).toBeCloseTo(0.4902, 4);
    expect(high).toBeCloseTo(0.9433, 4);
    expect(wilson(0, 0)).toEqual({ low: 0, high: 1 });
  });

  test('item counts and micro vs macro', () => {
    expect(itemCounts(new Set(['a', 'b']), new Set(['b', 'c']))).toEqual({ tp: 1, fp: 1, fn: 1 });
    // skill a: tp 2; skill b: fp 1, fn 1  -> micro P 2/3, R 2/3; macro F1 = (1 + 0)/2 = 0.5
    const r = microMacro([
      { gold: new Set(['a']), predicted: new Set(['a']) },
      { gold: new Set(['a', 'b']), predicted: new Set(['a']) },
      { gold: new Set([]), predicted: new Set(['b']) },
    ]);
    expect(r.micro.precision).toBeCloseTo(2 / 3, 10);
    expect(r.micro.recall).toBeCloseTo(2 / 3, 10);
    expect(r.macro.f1).toBeCloseTo(0.5, 10);
    expect(r.macro.skillsCounted).toBe(2);
  });

  test("Cohen's kappa: 2x2 table (20 yes/yes, 5 yes/no, 10 no/yes, 15 no/no) -> 0.4", () => {
    const a = [...Array(20).fill('y'), ...Array(5).fill('y'), ...Array(10).fill('n'), ...Array(15).fill('n')];
    const b = [...Array(20).fill('y'), ...Array(5).fill('n'), ...Array(10).fill('y'), ...Array(15).fill('n')];
    // po = 35/50 = 0.7; pe = 0.5*0.6 + 0.5*0.4 = 0.5; kappa = 0.2/0.5 = 0.4
    expect(cohensKappa(a, b)).toBeCloseTo(0.4, 10);
  });

  test("Krippendorff's alpha (nominal) on the same table -> 0.4 (coincidences: o_yy 40, o_nn 30, o_yn 30; 1 - 99*30/(2*55*45))", () => {
    const units = [
      ...Array(20).fill(['y', 'y']), ...Array(5).fill(['y', 'n']), ...Array(10).fill(['n', 'y']), ...Array(15).fill(['n', 'n']),
    ];
    expect(krippendorffAlphaNominal(units)).toBeCloseTo(0.4, 10);
  });

  test("alpha differs from kappa when the raters' totals differ: 3 units [a,a],[a,b],[b,b] -> alpha 0.4444", () => {
    // n=6 values; o_aa=2, o_bb=2, o_ab=o_ba=1; n_a=n_b=3; alpha = 1 - 5*2/(2*3*3) = 0.4444
    expect(krippendorffAlphaNominal([['a', 'a'], ['a', 'b'], ['b', 'b']])).toBeCloseTo(4 / 9, 10);
    expect(krippendorffAlphaNominal([['a', 'a', null], ['b', 'b']])).toBe(1);
  });

  test('bootstrap is repeatable with a fixed seed and its interval contains the point estimate', () => {
    const counts = [{ tp: 1, fp: 0, fn: 0 }, { tp: 0, fp: 1, fn: 1 }, { tp: 2, fp: 0, fn: 1 }, { tp: 1, fp: 1, fn: 0 }];
    const a = bootstrapF1(counts, { resamples: 500, seed: 7 });
    const b = bootstrapF1(counts, { resamples: 500, seed: 7 });
    expect(a).toEqual(b);
    const point = prf({ tp: 4, fp: 2, fn: 2 }).f1;
    expect(a.low).toBeLessThanOrEqual(point);
    expect(a.high).toBeGreaterThanOrEqual(point);
    expect(seededRandom(1)()).toBe(seededRandom(1)());
  });

  test('paired bootstrap: identical systems -> difference 0 and p = 1', () => {
    const counts = [{ tp: 1, fp: 0, fn: 0 }, { tp: 0, fp: 1, fn: 1 }];
    const r = pairedBootstrap(counts, counts, { resamples: 200, seed: 1 });
    expect(r.observedDiff).toBe(0);
    expect(r.pValue).toBe(1);
  });
});

describe('dataset loader', () => {
  test('CSV parser: quotes, commas and "" inside fields', () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"']]);
  });

  test('the sample is detected as SYNTHETIC; bad labels are rejected with a clear message', () => {
    expect(loadDataset(SAMPLE).synthetic).toBe(true);
    const dir = mkdtempSync(join(tmpdir(), 'dlm-eval-'));
    const bad = join(dir, 'real.csv');
    writeFileSync(bad, 'id,script,text,gold_skills,gold_category,gold_years,gold_months\nr1,english,wiring,rocket_science,,,\n');
    expect(() => loadDataset(bad)).toThrow(/unknown skill id "rocket_science"/);
    writeFileSync(bad, 'id,script,text\nr1,english,wiring\n');
    expect(() => loadDataset(bad)).toThrow(/missing: gold_skills/);
    rmSync(dir, { recursive: true });
  });
});

describe('harness end-to-end on the SYNTHETIC sample (structure only)', () => {
  test('reports every system, the ablation steps, baselines and paired comparisons, marked SYNTHETIC', () => {
    const report = evaluateDataset(loadDataset(SAMPLE));
    expect(report.synthetic).toBe(true);
    expect(report.warning).toMatch(/Never report them as results/);
    expect(Object.keys(report.systems)).toEqual([
      'extractor', 'ablation_1_dictionary_only', 'ablation_2_plus_normalisation', 'ablation_3_plus_urdu_terms',
      'baseline_legacy_profiler', 'baseline_naive_english',
    ]);
    const ext = report.systems.extractor;
    for (const key of ['micro', 'macro', 'wilson95', 'bootstrap95F1', 'perCategory', 'byScript', 'categoryAccuracy', 'experienceExactMatch']) {
      expect(ext).toHaveProperty(key);
    }
    expect(Object.keys(ext.byScript).sort()).toEqual(['english', 'mixed', 'roman_urdu', 'urdu']);
    expect(report.comparisons).toHaveLength(5);
    expect(report.dataset.sha256).toMatch(/^[a-f0-9]{64}$/);

    const dir = mkdtempSync(join(tmpdir(), 'dlm-eval-'));
    const path = writeResults(report, dir);
    expect(path).toMatch(/SYNTHETIC-\d{4}-\d{2}-\d{2}-[a-f0-9]{8}\.json$/);
    expect(JSON.parse(readFileSync(path, 'utf8')).synthetic).toBe(true);
    rmSync(dir, { recursive: true });
  });

  test('agreement between the two synthetic annotator files runs', () => {
    const r = agreement(loadDataset(SAMPLE).items, loadDataset(SAMPLE_B).items);
    expect(r.items).toBe(12);
    expect(r.skills.decisions).toBe(12 * r.skills.skillsConsidered);
    expect(r.category.cohensKappa).toBeGreaterThan(-1);
  });
});
