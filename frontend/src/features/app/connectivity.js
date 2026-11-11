// Is the connection working? (Batch 4, feature 5)
//   online      the browser's own answer (navigator.onLine and the online/offline events)
//   serverDown  the last API request failed without any answer (network error, timeout)
// The API client reports every success and network failure here; the offline banner shows the
// state; retryAll() asks every page that failed this way to load again.
const listeners = new Set();
const retryListeners = new Set();
let state = { online: typeof navigator === 'undefined' ? true : navigator.onLine !== false, serverDown: false };

const emit = () => listeners.forEach((listener) => listener(state));
const set = (changes) => {
  const next = { ...state, ...changes };
  if (next.online === state.online && next.serverDown === state.serverDown) return;
  state = next;
  emit();
};

export const getConnectivity = () => state;
export function subscribeConnectivity(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const reportRequestSuccess = () => set({ serverDown: false });
export const reportNetworkFailure = () => set({ serverDown: true });
export function onRetry(listener) {
  retryListeners.add(listener);
  return () => retryListeners.delete(listener);
}
export function retryAll() {
  retryListeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    set({ online: true });
    retryAll();
  });
  window.addEventListener('offline', () => set({ online: false }));
}

// tests
export function resetConnectivity(next = { online: true, serverDown: false }) {
  state = next;
  emit();
}
