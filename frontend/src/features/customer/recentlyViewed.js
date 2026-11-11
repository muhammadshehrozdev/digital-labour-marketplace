// Recently viewed workers (Batch 4, feature 25): kept in this browser only, per account, newest
// first, at most six. Only public card fields are stored (the same ones the search page shows).
export const MAX_RECENT = 6;
const key = (userId) => `dlm.recent.${userId}`;

export function readRecent(userId) {
  if (!userId) return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(key(userId)) ?? '[]');
    return Array.isArray(saved) ? saved.filter((w) => w && typeof w.workerIdCode === 'string').slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function rememberWorker(userId, worker) {
  if (!userId || !worker?.workerIdCode) return;
  const entry = { workerIdCode: worker.workerIdCode, name: worker.user?.name ?? '', occupation: worker.occupation ?? '', category: worker.category ?? null, city: worker.city ?? '' };
  const next = [entry, ...readRecent(userId).filter((w) => w.workerIdCode !== entry.workerIdCode)].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(key(userId), JSON.stringify(next));
  } catch {
    // storage blocked: nothing is remembered
  }
}

export function clearRecent(userId) {
  try {
    window.localStorage.removeItem(key(userId));
  } catch {
    // nothing to clear
  }
}
