// Playwright: end-to-end checks and screenshots against the RUNNING local preview
// (http://127.0.0.1:5173). It uses the dev container's Chromium (Debian package) and never
// downloads a browser (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1, CHROMIUM_PATH=/usr/bin/chromium).
// Only the local app is opened: http://127.0.0.1:5173 and http://127.0.0.1:5000.
import { defineConfig } from '@playwright/test';

const executablePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

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
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'off',
    launchOptions: { executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] },
  },
});
