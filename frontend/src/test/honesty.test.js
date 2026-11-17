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
