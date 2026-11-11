// A short vibration on phones for small confirmations (Batch 4, feature 50): saving a worker,
// copying an ID, finishing an upload. Nothing happens on devices without a vibration motor,
// when the browser does not allow it, or when the person asked for reduced motion.
const REDUCED = '(prefers-reduced-motion: reduce)';

export function buzz(pattern = 12) {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
    if (typeof window.matchMedia === 'function' && window.matchMedia(REDUCED).matches) return false;
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}
