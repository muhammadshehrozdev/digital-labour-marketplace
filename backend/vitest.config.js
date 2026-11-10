import { defineConfig } from 'vitest/config';

// Backend tests run in Node (no browser). `npm test` runs every file in one run.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    setupFiles: ['./tests/setup/env.js'],
    // Starting an in-memory MongoDB can take a few seconds on first run.
    testTimeout: 30000,
    hookTimeout: 120000,
    // Code coverage (Batch 4, Part 6.3): npm run coverage. Target: at least 90% of lines in
    // services/, controllers/ and middleware/. Scripts, evaluation tools and tests are not app code.
    coverage: {
      provider: 'v8',
      include: ['services/**/*.js', 'controllers/**/*.js', 'middleware/**/*.js', 'routes/**/*.js', 'validators/**/*.js', 'models/**/*.js', 'config/**/*.js', 'utils/**/*.js', 'errors/**/*.js', 'app.js'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: '../.local/coverage-backend',
      thresholds: {
        'services/**/*.js': { lines: 90 },
        'controllers/**/*.js': { lines: 90 },
        'middleware/**/*.js': { lines: 90 },
      },
    },
  },
});
