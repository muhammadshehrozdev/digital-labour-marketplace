import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The e2e tests start a second copy on another port with its own backend (playwright.config.js);
// normal use keeps 5173 -> 5000.
const port = Number(process.env.FRONTEND_PORT || 5173)
const apiTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Local dev: the browser talks only to Vite (http://127.0.0.1:5173). Vite forwards
  // every /api request to the backend, so the login cookie stays same-origin.
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget },
    },
  },
  // vite preview (used by the e2e tests: a production build, so editing source files during a
  // run cannot reload the page under test).
  preview: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget },
    },
  },
  // Vitest: run React component tests in a simulated browser (jsdom).
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Tests that simulate typing many characters can take a few seconds on a busy machine.
    testTimeout: 15000,
    // At most 3 test files at once: with the dev servers running on a 4-core machine, more
    // parallel files made some page tests slow enough to time out (seen in Batch 4).
    maxWorkers: 3,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    // Code coverage (Batch 4, Part 6.3): npm run coverage. Target: at least 80% of lines in src/.
    // Not counted: the tests themselves, the entry file, and the development-only pages
    // (/dev/styleguide, /dev/themes), which are not part of the production build.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{js,jsx}', 'src/main.jsx', 'src/pages/dev/**'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: '../.local/coverage-frontend',
      thresholds: { lines: 80 },
    },
  },
})
