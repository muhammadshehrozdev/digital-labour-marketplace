// Milestone celebrations (Batch 4, feature 52): each plays once per account on this device.
//   complete       the profile strength reaches "Complete"          -> stars
//   firstApproved  the first proof item is approved by an admin      -> ribbons
const key = (userId, id) => `dlm.milestone.${userId}.${id}`;

export function milestoneToCelebrate(userId, { level, approved }) {
  if (!userId) return null;
  const seen = (id) => {
    try {
      return window.localStorage.getItem(key(userId, id)) === '1';
    } catch {
      return true; // storage blocked: never celebrate again and again
    }
  };
  if (level === 'complete' && !seen('complete')) return { id: 'complete', variant: 'stars' };
  if (approved > 0 && !seen('firstApproved')) return { id: 'firstApproved', variant: 'ribbons' };
  return null;
}

export function markCelebrated(userId, id) {
  try {
    window.localStorage.setItem(key(userId, id), '1');
  } catch {
    // not remembered
  }
}
