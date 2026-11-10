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
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})
