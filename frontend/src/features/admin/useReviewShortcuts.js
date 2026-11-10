// Keyboard shortcuts in the review drawers (Batch 4, feature 30):
//   A approve / verified · R reject / not accepted · J next · K previous · ? help
// Never while typing in a box, never with Ctrl / Alt / Cmd held, and only while `enabled`.
import { useEffect } from 'react';
import { isTypingTarget } from './adminHelpers';

export const REVIEW_KEYS = [
  { key: 'A', action: 'approve' },
  { key: 'R', action: 'reject' },
  { key: 'J', action: 'next' },
  { key: 'K', action: 'previous' },
  { key: '?', action: 'help' },
];

export function useReviewShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      if (isTypingTarget(event.target)) return;
      const key = event.key === '?' ? '?' : event.key.toUpperCase();
      const match = REVIEW_KEYS.find((k) => k.key === key);
      const handler = match && handlers[match.action];
      if (!handler) return;
      event.preventDefault();
      handler();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handlers, enabled]);
}
