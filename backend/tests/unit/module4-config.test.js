// Module 4 deployment settings: the daily cron entry for Vercel (21:00 UTC = 02:00 in Pakistan) and the
// placeholder in .env.example (no real secret in the repository).
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());

describe('Module 4 deployment settings', () => {
  test('backend/vercel.json has the daily cron at 21:00 UTC, and the rewrite is unchanged', () => {
    const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
    expect(config.crons).toEqual([{ path: '/api/cron/daily', schedule: '0 21 * * *' }]);
    expect(config.rewrites).toEqual([{ source: '/(.*)', destination: '/api' }]);
  });

  test('.env.example names CRON_SECRET with a placeholder only', () => {
    const text = readFileSync(resolve(root, '.env.example'), 'utf8');
    expect(text).toMatch(/^# CRON_SECRET=replace_with_a_random_value_of_at_least_32_characters$/m);
  });
});
