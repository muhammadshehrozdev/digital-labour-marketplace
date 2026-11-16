// One polite live region for the whole website (Batch 5): "Playing the help", "Listening", "Stopped".
// AssistRoot renders it; anything may call announce(). Screen readers hear it without losing focus.
import { useSyncExternalStore } from 'react';

let message = '';
let counter = 0;
const listeners = new Set();

export function announce(text) {
  counter += 1;
  // the counter makes the same sentence twice in a row still count as a change
  message = text ? `${text}${'​'.repeat(counter % 2)}` : '';
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getMessage = () => message;

export const useAnnouncement = () => useSyncExternalStore(subscribe, getMessage, getMessage);
