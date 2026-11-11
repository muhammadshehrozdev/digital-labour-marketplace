// Which coach marks the welcome tour has, and whether this account has seen it (this device only).
export const TOUR_STEPS = ['strength', 'potential', 'proof', 'header'];
const KEY = (userId) => `dlm.tour.${userId}`;

export function tourSeen(userId) {
  try {
    return window.localStorage.getItem(KEY(userId)) === 'done';
  } catch {
    return true; // storage blocked: do not show the tour on every visit
  }
}
export function markSeen(userId) {
  try {
    window.localStorage.setItem(KEY(userId), 'done');
  } catch {
    // not remembered
  }
}
