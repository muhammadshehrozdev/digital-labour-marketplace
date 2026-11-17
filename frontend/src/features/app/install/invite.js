// When the install invitation may appear (Batch 6B, BATCH_6B 4.3). Used by InstallHint.jsx.
import { hasInteracted } from '../../assist/interaction';

export const INVITE_AFTER_MS = 30_000;
export const INVITE_CHECK_MS = 1000;
const TYPING = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=file]), textarea, select, [contenteditable="true"]';

// Why the invitation may not appear right now (null: it may).
export function inviteBlocked(doc = document) {
  if (!hasInteracted()) return 'no-touch';
  if (doc.querySelector('dialog[open]')) return 'dialog';
  if (doc.activeElement?.matches?.(TYPING)) return 'typing';
  if (doc.querySelector('[aria-controls="mobile-menu"][aria-expanded="true"]')) return 'menu';
  const bars = [...doc.querySelectorAll('[data-bottom-bar]')].filter((el) => !el.closest('[data-install-sheet]') && el.getClientRects().length > 0);
  if (bars.length) return 'bottom-bar';
  return null;
}
