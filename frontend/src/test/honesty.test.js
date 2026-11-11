// Academic honesty (docs/evaluation/README.md, M2-15, M2-8): the UI never calls the rule-based extractor "AI",
// never shows a "confidence %", and shows no invented reviews or ratings.
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

describe('honest wording in the frontend source', () => {
  test.each(files.map((f) => [f.replace(process.cwd(), '.'), f]))('%s has no "AI", "confidence" or rating words', (_name, file) => {
    const text = readFileSync(file, 'utf8');
    expect(text).not.toMatch(/\bAI\b/);
    expect(text).not.toMatch(/\bAI-/); // e.g. the old "AI-Extracted"; "WAI-ARIA" is fine
    expect(text).not.toMatch(/Ai Skill|artificial intelligence/i);
    expect(text).not.toMatch(/confidence/i);
    expect(text).not.toMatch(/testimonial|★|star rating/i);
  });
});
