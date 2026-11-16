// Sound settings of this device (Batch 5, D-033): one versioned localStorage key, never sent to
// the server. Works without storage (private windows): the defaults are used and nothing breaks.
import { useSyncExternalStore } from 'react';

export const SETTINGS_KEY = 'dlm.assist.v1';
export const DEFAULT_SETTINGS = Object.freeze({
  showButtons: true, // the Listen and Speak buttons under the fields
  autoRead: false, // speak the page help on arrival and a field's help on focus
  noticeAccepted: false, // the voice typing privacy notice was accepted on this device
  autoReadOffered: false, // the "read aloud?" question was answered once
  offerPending: false, // a language was just chosen: ask the "read aloud?" question next
  seenPages: [], // pages whose help button has stopped pulsing
});

const listeners = new Set();
let cached = null;

function read() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const clean = {};
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      clean[key] = typeof parsed?.[key] === typeof value && (!Array.isArray(value) || Array.isArray(parsed[key])) ? parsed[key] : value;
    }
    clean.seenPages = clean.seenPages.filter((p) => typeof p === 'string').slice(-50);
    return clean;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function getSettings() {
  if (!cached) cached = read();
  return cached;
}

export function setSettings(patch) {
  cached = { ...getSettings(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(cached));
  } catch {
    // storage is blocked: keep the setting for this visit only
  }
  listeners.forEach((fn) => fn());
}

// For tests (and when another tab changed the key): read again from storage.
export function reloadSettings() {
  cached = null;
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => { if (e.key === SETTINGS_KEY || e.key === null) reloadSettings(); };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

export function useAssistSettings() {
  const settings = useSyncExternalStore(subscribe, getSettings, getSettings);
  return [settings, setSettings];
}
