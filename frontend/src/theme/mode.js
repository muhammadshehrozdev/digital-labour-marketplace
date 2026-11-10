// Light / dark mode and text size (Batch 4, D-022). Plain functions, no React.
//   preference  what the person chose: 'light', 'dark' or 'system' (follow the device)
//   mode        what is shown now: 'light' or 'dark'
// The choice is a per-browser convenience in localStorage (it can be blocked, so every access is
// wrapped in try/catch) and is also saved on the account (preferredTheme, preferredTextSize).
// index.html has a tiny copy of readStored + resolveMode that runs before React, so the page never
// flashes in the wrong mode. Keep the two storage keys the same in both places (a test checks).
export const THEME_PREFERENCES = ['light', 'dark', 'system'];
export const TEXT_SIZES = ['small', 'normal', 'large'];
export const THEME_KEY = 'dlm.theme';
export const TEXT_SIZE_KEY = 'dlm.textSize';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export const isThemePreference = (value) => THEME_PREFERENCES.includes(value);
export const isTextSize = (value) => TEXT_SIZES.includes(value);

export function readStored(key, isValid) {
  try {
    const value = window.localStorage.getItem(key);
    return isValid(value) ? value : null;
  } catch {
    return null;
  }
}

export function store(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not saved in this browser; the choice still works until the page is closed.
  }
}

export function darkQuery() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
}

export const systemMode = () => (darkQuery()?.matches ? 'dark' : 'light');
export const resolveMode = (preference) => (preference === 'light' || preference === 'dark' ? preference : systemMode());

// Writes the mode on <html>; the browser bar colour (mobile) follows it.
export function applyMode(mode) {
  const root = document.documentElement;
  root.dataset.mode = mode;
  root.style.colorScheme = mode;
  const colour = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && colour) meta.setAttribute('content', colour);
}

export function applyTextSize(size) {
  const root = document.documentElement;
  if (size === 'normal') delete root.dataset.textSize;
  else root.dataset.textSize = size;
}
