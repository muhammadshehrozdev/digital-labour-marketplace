// The install service (Batch 6B, Part B, decision D-060): ONE store for the whole app, used by the
// first-visit invitation (InstallSheet) and the "Install this app" button in the footer.
//
// What the browsers allow (checked 16-17 Nov 2026, see docs/INSTALL-MANUAL-TEST.md):
// - Chromium (Chrome, Edge, Samsung Internet, Opera; desktop and Android) fires `beforeinstallprompt`. We keep
//   that event; its prompt() shows the BROWSER's own question and can be used only once per saved event.
// - No website can install itself: the person must press "Install" in the browser's own dialog.
// - iPhone and iPad: only Safari can add a web app to the home screen (Share -> Add to Home Screen);
//   `beforeinstallprompt` never fires there.
// - `display-mode: standalone` (or fullscreen), or `navigator.standalone` on iOS, means the person is already
//   in the installed app; Chromium fires `appinstalled` after an install.
import { useSyncExternalStore } from 'react';

export const INSTALL_KEY = 'dlm.install.v1'; // { hideUntil: <ms> } on this device only
export const HIDE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

// chromium | ios-safari | ios-other | other, from the user agent (iPadOS reports a Mac with touch).
export function detectPlatform(ua = '', maxTouchPoints = 0) {
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 1);
  if (ios) {
    const otherApp = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|GSA\/|FBAN|FBAV|Instagram|Line\//i.test(ua);
    return !otherApp && /Version\/[\d.]+.*Safari\//i.test(ua) ? 'ios-safari' : 'ios-other';
  }
  if (/Firefox\//i.test(ua)) return 'other';
  if (/Chrome\/|Chromium\/|Edg\//i.test(ua)) return 'chromium';
  return 'other';
}

const media = (query) => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query) : null);

export function isStandalone() {
  return Boolean(media('(display-mode: standalone)')?.matches || media('(display-mode: fullscreen)')?.matches || (typeof navigator !== 'undefined' && navigator.standalone === true));
}

let deferred = null; // the saved beforeinstallprompt event
let installed = false; // appinstalled was seen, or the person accepted in the browser's dialog
let started = false;
let snapshot = null;
const listeners = new Set();

function build() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  return Object.freeze({
    canPrompt: Boolean(deferred),
    isInstalled: installed || isStandalone(),
    platform: detectPlatform(nav.userAgent ?? '', nav.maxTouchPoints ?? 0),
  });
}

function emit() {
  snapshot = build();
  listeners.forEach((fn) => fn());
}

export function getInstallState() {
  if (!snapshot) snapshot = build();
  return snapshot;
}

// Called once at app start (main.jsx), so no saved event is missed while the language chooser is open.
// useInstall() calls it too (safe to call again).
export function startInstallListening(win = typeof window !== 'undefined' ? window : null) {
  if (started || !win) return;
  started = true;
  win.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // our own button and invitation instead of the browser's mini bar
    deferred = event;
    emit();
  });
  win.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    emit();
  });
  media('(display-mode: standalone)')?.addEventListener?.('change', emit);
}

// Shows the browser's own question. 'accepted' | 'dismissed' | 'unavailable' (no saved event).
export async function promptInstall() {
  const event = deferred;
  if (!event) return 'unavailable';
  deferred = null; // a saved event can be used only once
  emit();
  try {
    const shown = event.prompt();
    const choice = (await event.userChoice) ?? (await shown);
    const outcome = choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
    if (outcome === 'accepted') {
      installed = true;
      emit();
    }
    return outcome;
  } catch {
    return 'dismissed';
  }
}

// "Not now" (and a "dismissed" answer): the invitation stays away for 14 days on this device.
export function hiddenUntil() {
  try {
    const value = JSON.parse(window.localStorage.getItem(INSTALL_KEY) ?? '{}')?.hideUntil;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}
export function hideForDays(days = HIDE_DAYS, now = Date.now()) {
  try {
    window.localStorage.setItem(INSTALL_KEY, JSON.stringify({ hideUntil: now + days * DAY_MS }));
  } catch {
    // storage is blocked: the invitation may come back on the next visit
  }
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useInstall() {
  startInstallListening();
  const state = useSyncExternalStore(subscribe, getInstallState, getInstallState);
  return { ...state, promptInstall };
}

// For tests: forget the saved event and the install, and read the platform again.
export function resetInstallForTests() {
  deferred = null;
  installed = false;
  emit();
}
export const refreshInstallState = emit;
