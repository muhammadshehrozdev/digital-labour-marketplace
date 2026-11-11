// The workers chosen for comparison (Batch 4, feature 24): up to three, remembered for this
// browser tab (sessionStorage), shared by every page through a tiny store.
// Only what the tray needs is kept: the public worker ID and the public name.
import { useSyncExternalStore } from 'react';

export const MAX_COMPARE = 3;
const KEY = 'dlm.compare';
const listeners = new Set();
let items = read();

function read() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((w) => w && typeof w.id === 'string' && typeof w.name === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function write(next) {
  items = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // not saved; the choice still works until the page is closed
  }
  listeners.forEach((listener) => listener());
}

export const compareStore = {
  get: () => items,
  has: (id) => items.some((w) => w.id === id),
  // Returns false when the list is already full.
  add(worker) {
    if (compareStore.has(worker.id)) return true;
    if (items.length >= MAX_COMPARE) return false;
    write([...items, { id: worker.id, name: worker.name }]);
    return true;
  },
  remove: (id) => write(items.filter((w) => w.id !== id)),
  clear: () => write([]),
  reset: () => { items = read(); listeners.forEach((listener) => listener()); }, // tests
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useCompare() {
  const list = useSyncExternalStore(subscribe, compareStore.get, compareStore.get);
  return { list, ...compareStore };
}
