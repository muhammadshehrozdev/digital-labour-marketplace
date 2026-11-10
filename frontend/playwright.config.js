// End-to-end tests (Batch 3). In the dev container they use the system Chromium and never download one.
// The tests run against their OWN servers and their OWN local database (dlm_e2e), not the
// preview on 5173/5000 and never Atlas (CLAUDE.md: tests use a separate database):
//   backend  http://127.0.0.1:5001  (MONGO_URI = E2E_MONGO_URI, default 127.0.0.1:27017/dlm_e2e)
//   frontend http://127.0.0.1:5174  (production build + vite preview, forwards /api to 5001)
// The local MongoDB must be running (in .\backend: npm run db:local).
import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

// Dev container: the system Chromium (CHROMIUM_PATH). Windows: Playwright's own Chromium
// (installed once with `npx playwright install chromium`), unless CHROMIUM_PATH points elsewhere.
const systemChromium = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export const E2E_MONGO_URI = process.env.E2E_MONGO_URI || 'mongodb://127.0.0.1:27017/dlm_e2e';
const FRONTEND = 'http://127.0.0.1:5174';
const BACKEND = 'http://127.0.0.1:5001';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.js',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: '../.local/playwright-results',
  globalSetup: './e2e/global-setup.js',
  use: {
    baseURL: FRONTEND,
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'off',
    launchOptions: { ...(systemChromium ? { executablePath: systemChromium } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  },
  webServer: [
    {
      command: 'node server.js',
      cwd: '../backend',
      url: `${BACKEND}/api/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        PORT: '5001',
        MONGO_URI: E2E_MONGO_URI,
        CLIENT_ORIGIN: FRONTEND,
        NODE_ENV: 'development',
        // Many synthetic accounts are created in one run; the limits themselves are tested in the backend suite.
        AUTH_RATE_LIMIT: '1000',
        UPLOAD_RATE_LIMIT: '1000',
      },
    },
    {
      // A production build served by vite preview: what users get, and immune to source edits during a run.
      command: 'npx vite build --outDir ../.local/e2e-dist --emptyOutDir && npx vite preview --outDir ../.local/e2e-dist',
      url: FRONTEND,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { FRONTEND_PORT: '5174', API_PROXY_TARGET: BACKEND },
    },
  ],
});
