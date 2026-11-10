// Small helpers shared by the admin pages (Batch 4).
const DAY_MS = 24 * 60 * 60 * 1000;

// Whole days an item has waited since `date` (0 = less than a day). null without a date.
export function waitingDays(date, now = Date.now()) {
  if (!date) return null;
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((now - then) / DAY_MS));
}

// Tone of the "waiting" badge: the longer, the louder (words always say the number too).
export const waitingTone = (days) => (days >= 8 ? 'danger' : days >= 4 ? 'warning' : days >= 1 ? 'info' : 'neutral');

// 'identity.decision' -> 'adminx.actions.identity_decision' (dictionary keys cannot contain dots).
export const actionKey = (action) => `adminx.actions.${String(action).replace(/\./g, '_')}`;

// Keyboard shortcuts must never fire while someone is typing.
export function isTypingTarget(target) {
  if (!target || !target.tagName) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable === true;
}

// Saves a file the server sent (CSV export) from the browser.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 'attachment; filename="dlm-audit-2026-11-10.csv"' -> 'dlm-audit-2026-11-10.csv'
export function filenameFrom(disposition, fallback) {
  const match = /filename="([^"]+)"/.exec(disposition ?? '');
  return match ? match[1] : fallback;
}
