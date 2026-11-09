import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest: run React component tests in a simulated browser (jsdom).
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
