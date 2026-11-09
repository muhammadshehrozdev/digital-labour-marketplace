// Phase 1: proves the test runner works and runs on the Node version we target.
import { describe, test, expect } from 'vitest';

describe('test setup', () => {
  test('runs on Node.js 24 (package.json "engines": "24.x")', () => {
    const major = Number(process.versions.node.split('.')[0]);
    expect(major).toBe(24);
  });

  test('ES modules work (this file uses import)', () => {
    expect(typeof import.meta.url).toBe('string');
  });
});
