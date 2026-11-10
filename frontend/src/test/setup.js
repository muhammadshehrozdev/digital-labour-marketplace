// Test setup (Vitest + React Testing Library + jsdom).
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, expect, vi } from 'vitest';

// findBy... and waitFor wait up to 5 s (the default is 1 s). On a busy machine (all test files run
// at once, next to the dev servers) a 1 s wait sometimes ended before an async image check did.
configure({ asyncUtilTimeout: 5000 });

// jsdom has <dialog> but not showModal()/close(); browsers have both.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
    // Like browsers: move focus into the dialog.
    this.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

// Quality gate 5: no console errors or warnings while pages render.
let consoleError;
let consoleWarn;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
  consoleWarn = vi.spyOn(console, 'warn');
});

afterEach(() => {
  cleanup();
  // A language, theme or text size chosen in one test must not leak into the next one.
  delete document.documentElement.dataset.mode;
  delete document.documentElement.dataset.textSize;
  delete document.documentElement.dataset.transition;
  document.documentElement.classList.remove('mode-fade');
  try {
    window.localStorage.clear();
  } catch {
    // storage not available
  }
  const errors = consoleError.mock.calls.map((c) => c.join(' '));
  const warnings = consoleWarn.mock.calls.map((c) => c.join(' '));
  vi.restoreAllMocks();
  expect(errors, 'console.error during the test').toEqual([]);
  expect(warnings, 'console.warn during the test').toEqual([]);
});
