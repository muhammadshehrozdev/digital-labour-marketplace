// Academic honesty (docs/evaluation/README.md, M2-15, M2-8): live backend code never calls the rule-based
// extractor "AI" and never produces a confidence score. The old profiler in
// evaluation/baselines/ is kept unchanged on purpose (it is the evaluation baseline) and is
// not part of the live API, so it is excluded here.
import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import request from 'supertest';
import { createApp } from '../../app.js';

const ROOT = resolve(process.cwd());
const DIRS = ['app.js', 'server.js', 'config', 'controllers', 'middleware', 'models', 'routes', 'services', 'validators', 'scripts', 'evaluation/skill-extraction', 'evaluation/reputation'];
const files = [];
function walk(path) {
  if (statSync(path).isDirectory()) for (const n of readdirSync(path)) walk(join(path, n));
  else if (path.endsWith('.js')) files.push(path);
}
DIRS.forEach((d) => walk(join(ROOT, d)));

describe('honest wording in live backend code', () => {
  test.each(files.map((f) => [f.replace(ROOT, '.'), f]))('%s: no "AI" label, no confidence score', (_n, file) => {
    const text = readFileSync(file, 'utf8');
    expect(text).not.toMatch(/\bAI\b|\bAI-(?:Extracted|Voice)/);
    expect(text).not.toMatch(/confidenceScore|confidence %|skillStrengthScore\s*:/);
  });

  test('the legacy profiler is not reachable from the live API', () => {
    const live = files.filter((f) => !f.includes('evaluation')).map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(live).not.toMatch(/legacyProfiler|aiSkillProfiler/);
  });

  test('the taxonomy API says nothing about "AI"', async () => {
    const res = await request(createApp()).get('/api/meta/taxonomy');
    expect(JSON.stringify(res.body)).not.toMatch(/\bAI\b/);
  });
});
