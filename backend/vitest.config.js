import { defineConfig } from 'vitest/config';

// Backend tests run in Node (no browser). `npm test` runs every file in one run.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    // Starting an in-memory MongoDB can take a few seconds on first run.
    testTimeout: 30000,
    hookTimeout: 120000,
  },
});
