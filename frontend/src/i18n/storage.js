// The visitor's language choice is a per-browser convenience in localStorage. Storage can be
// blocked (private window, settings), so every access is wrapped in try/catch.
import { isLanguage } from './languages';

const KEY = 'dlm.language';

export function readStoredLanguage() {
  try {
    const value = window.localStorage.getItem(KEY);
    return isLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeLanguage(code) {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    // Not saved in this browser; the choice still works until the page is closed.
  }
}
