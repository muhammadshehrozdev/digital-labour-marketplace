// Academic honesty (docs/evaluation/README.md, M2-15, M2-8): the UI never calls the rule-based extractor "AI",
// never shows a "confidence %", and shows no invented reviews or ratings (Batch 6: real stars only in
// src/features/reputation/, with no rating value written into the code).
import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'src');
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(jsx?|css|html)$/.test(name) && !path.includes(`${join('src', 'test')}`)) files.push(path);
  }
})(SRC);
files.push(resolve(process.cwd(), 'index.html'));

// Batch 6: the only folder where stars may be drawn (RatingBadge, ReputationPanel, ...).
const REPUTATION_DIR = join(SRC, 'features', 'reputation');
const isReputationFile = (file) => file.startsWith(`${REPUTATION_DIR}/`) || file.startsWith(`${REPUTATION_DIR}\\`);

describe('honest wording in the frontend source', () => {
  test.each(files.map((f) => [f.replace(process.cwd(), '.'), f]))('%s has no "AI", "confidence" or rating words', (_name, file) => {
    const text = readFileSync(file, 'utf8');
    expect(text).not.toMatch(/\bAI\b/);
    expect(text).not.toMatch(/\bAI-/); // e.g. the old "AI-Extracted"; "WAI-ARIA" is fine
    expect(text).not.toMatch(/Ai Skill|artificial intelligence/i);
    expect(text).not.toMatch(/confidence/i);
    // Batch 6 (decision D-056): the one planned change. "testimonial" stays banned everywhere. Stars may
    // appear only in src/features/reputation/ (real ratings from stored reviews), never with a
    // hard-coded rating value next to them and never with sample review text.
    expect(text).not.toMatch(/testimonial/i);
    if (isReputationFile(file)) {
      expect(text).not.toMatch(/\d\s*(?:[.,]\s*\d)?\s*★|★\s*\(?\s*\d/);
      expect(text).not.toMatch(/['"`][^'"`\n]*(?:great work|excellent|highly recommended|best worker|very professional|\[demo\])[^'"`\n]*['"`]/i);
    } else {
      expect(text).not.toMatch(/★|star rating/i);
    }
  });
});

// Batch 7 (Module 5, section 10): the platform range is never called a "fair price", and no price-range or
// minimum-wage amount is written into the Module 5 code, its pages or its texts: those numbers always come from
// the API (backend/config/wageReferences.js and the price statistics). Existing input placeholders elsewhere
// (for example "800" in WorkForm.jsx) are not part of this check.
describe('Module 5: honest price words and no hard-coded amounts', () => {
  const MODULE5 = [join(SRC, 'features', 'wage'), join(SRC, 'pages', 'wage'), join(SRC, 'pages', 'worker', 'MyEarnings.jsx'), join(SRC, 'pages', 'admin', 'AdminPriceGuide.jsx'), join(SRC, 'pages', 'admin', 'AdminPayments.jsx')];
  const inModule5 = (file) => MODULE5.some((m) => file === m || file.startsWith(`${m}/`) || file.startsWith(`${m}\\`));
  // every figure of the wage table and its daily and hourly values, read from the backend file as text
  const wageFile = readFileSync(resolve(process.cwd(), '..', 'backend', 'config', 'wageReferences.js'), 'utf8');
  const monthly = [...new Set([...wageFile.matchAll(/monthly: (\d{4,})/g)].map((m) => Number(m[1])))];
  const figures = [...new Set(monthly.flatMap((m) => [m, Math.round(m / 26), Math.round(m / 26 / 8)]))];
  const forms = (n) => [String(n), new Intl.NumberFormat('en').format(n)];

  test('the wage figures were found in the backend file (so the check below means something)', () => {
    expect(monthly.length).toBeGreaterThanOrEqual(3);
  });

  test.each(files.filter(inModule5).map((f) => [f.replace(process.cwd(), '.'), f]))('%s: no wage figure, no "fair price"', (_name, file) => {
    const text = readFileSync(file, 'utf8');
    for (const n of figures) for (const f of forms(n)) expect(text, `${f} in ${file}`).not.toMatch(new RegExp(`(?<![\\d,])${f.replace(',', '\\,')}(?![\\d,])`));
    expect(text).not.toMatch(/fair price|fair rate|munasib qeemat|مناسب قیمت|منصفانہ قیمت/i);
  });

  test('the Module 5 texts (wage group) in all three dictionaries hold no amount and no "fair price"', async () => {
    for (const lang of ['en', 'ur', 'ur-Latn']) {
      const dict = (await import(`../i18n/dictionaries/${lang}.js`)).default;
      const text = JSON.stringify(dict.wage);
      for (const n of figures) for (const f of forms(n)) expect(text, `${lang}: ${f}`).not.toContain(f);
      // amounts are placeholders: no "Rs" followed by a number, and no number of 3 or more digits except the helpline
      // numbers of section 4.8 (1122, 1314), the "2026" of a source's date and the 10-character minimum of a source
      expect(text).not.toMatch(/Rs\s?\d/);
      const numbers = [...text.matchAll(/\d{3,}/g)].map((m) => m[0]).filter((n) => !['1122', '1314', '2026'].includes(n));
      expect(numbers, lang).toEqual([]);
      expect(text).not.toMatch(/fair price|fair rate|munasib qeemat|مناسب قیمت|منصفانہ قیمت/i);
    }
  });
});
