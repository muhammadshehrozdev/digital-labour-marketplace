// Batch 6B, Part B: "Install this app" for everyone. The shared install service (platform, installed state,
// the saved browser question), the first-visit invitation and the footer button on every page.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { INSTALL_KEY, detectPlatform, getInstallState, hiddenUntil, refreshInstallState, resetInstallForTests, startInstallListening } from '../features/app/install/installStore';
import { inviteBlocked } from '../features/app/install/invite';
import { markInteracted, resetInteraction } from '../features/assist/interaction';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt } from './renderApp';

const UA = {
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  desktopChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  desktopEdge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  desktopFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  ipadDesktopMode: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
};

const useAgent = (ua) => {
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua);
  refreshInstallState();
};
// the browser's saved install question, with the person's answer
const offer = (outcome = 'accepted') => {
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), { prompt: vi.fn(() => Promise.resolve({ outcome })), userChoice: Promise.resolve({ outcome }) });
  act(() => { window.dispatchEvent(event); });
  return event;
};
const standalone = (on) => {
  window.matchMedia = vi.fn((query) => ({ matches: on && query === '(display-mode: standalone)', media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  refreshInstallState();
};
const footerButton = () => within(screen.getByRole('contentinfo')).queryByRole('button', { name: 'Install this app' });

startInstallListening();
const realMatchMedia = window.matchMedia;
beforeEach(() => {
  resetInstallForTests();
  resetInteraction();
});
afterEach(() => {
  window.matchMedia = realMatchMedia;
  resetInstallForTests();
});

describe('the install service', () => {
  test.each([
    ['Android Chrome', UA.androidChrome, 0, 'chromium'],
    ['desktop Chrome', UA.desktopChrome, 0, 'chromium'],
    ['desktop Edge', UA.desktopEdge, 0, 'chromium'],
    ['iPhone Safari', UA.iphoneSafari, 5, 'ios-safari'],
    ['iPhone Chrome', UA.iphoneChrome, 5, 'ios-other'],
    ['desktop Firefox', UA.desktopFirefox, 0, 'other'],
    ['Android Firefox', UA.androidFirefox, 5, 'other'],
    ['iPad in desktop mode (a Mac with touch)', UA.ipadDesktopMode, 5, 'ios-safari'],
    ['Safari on a Mac (no touch)', UA.ipadDesktopMode, 0, 'other'],
  ])('platform: %s', (_name, ua, touch, want) => {
    expect(detectPlatform(ua, touch)).toBe(want);
  });

  test('installed: from display-mode standalone, and after appinstalled', () => {
    standalone(false);
    expect(getInstallState().isInstalled).toBe(false);
    standalone(true);
    expect(getInstallState().isInstalled).toBe(true);
    standalone(false);
    act(() => { window.dispatchEvent(new Event('appinstalled')); });
    expect(getInstallState().isInstalled).toBe(true);
  });

  test('the saved question is kept (and the browser\'s own mini bar is stopped)', () => {
    const event = offer();
    expect(event.defaultPrevented).toBe(true);
    expect(getInstallState().canPrompt).toBe(true);
  });
});

describe('the footer button and the invitation', () => {
  test('with a saved question, Install shows the browser\'s question once; "accepted" thanks and hides everything', async () => {
    useAgent(UA.desktopChrome);
    mockApi({});
    const user = userEvent.setup();
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    const event = offer('accepted');
    await user.click(footerButton());
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Thank you! The app is being added. Look for it on your home screen.')).toBeInTheDocument();
    await waitFor(() => expect(footerButton()).toBeNull());
    expect(screen.queryByTestId('install-hint')).toBeNull();
  });

  test('"dismissed" in the browser\'s question counts like "Not now"; the next press shows the menu steps (one question per saved event)', async () => {
    useAgent(UA.androidChrome);
    mockApi({});
    const user = userEvent.setup();
    renderAt('/help');
    await screen.findByRole('heading', { level: 1, name: 'Help centre' });
    const event = offer('dismissed');
    await user.click(footerButton());
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(hiddenUntil()).toBeGreaterThan(Date.now() + 13.9 * 86400000);
    await user.click(footerButton());
    expect(event.prompt).toHaveBeenCalledTimes(1);
    const steps = await screen.findByTestId('install-steps-chromium');
    expect(within(steps).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '1Open the browser menu: the three dots ⋮ at the top.',
      '2Choose "Install app" or "Add to Home screen". On a computer it can be under "Cast, save and share".',
      '3Press "Install". The app appears on your home screen or desktop.',
    ]);
    // every step can be heard
    expect(within(steps).getAllByRole('button', { name: /^Listen: Step [123]$/ })).toHaveLength(3);
  });

  test('iPhone Safari: the three Share steps with pictures; iPhone Chrome: "open it in Safari" with a copy button; Firefox: Chrome or Edge', async () => {
    useAgent(UA.iphoneSafari);
    mockApi({});
    const user = userEvent.setup();
    renderAt('/help');
    await screen.findByRole('heading', { level: 1, name: 'Help centre' });
    await user.click(footerButton());
    const ios = await screen.findByTestId('install-steps-ios-safari');
    expect(within(ios).getAllByRole('listitem')).toHaveLength(3);
    expect(ios).toHaveTextContent('Press the Share button');
    expect(ios).toHaveTextContent('"Add to Home Screen"');
    await user.click(within(ios).getByRole('button', { name: 'Done' }));
    expect(screen.queryByTestId('install-steps-ios-safari')).toBeNull();

    useAgent(UA.iphoneChrome);
    await user.click(footerButton());
    const other = await screen.findByTestId('install-steps-ios-other');
    expect(other).toHaveTextContent('Open this page in Safari to install the app.');
    expect(within(other).getByRole('textbox', { name: 'Link to this website' })).toHaveValue(`${window.location.origin}/`);
    expect(within(other).getByRole('button', { name: 'Copy the link' })).toBeInTheDocument();
    await user.click(within(other).getByRole('button', { name: 'Done' }));

    useAgent(UA.desktopFirefox);
    await user.click(footerButton());
    expect(await screen.findByTestId('install-steps-other')).toHaveTextContent('Installing works in Chrome or Edge.');
  });

  test('the invitation: not on the first page, yes on the second (after a touch); "Not now" is remembered for 14 days', async () => {
    useAgent(UA.androidChrome);
    mockApi({});
    const user = userEvent.setup();
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    offer();
    markInteracted();
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.queryByTestId('install-hint')).toBeNull(); // first page
    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Create account' }));
    const sheet = await screen.findByTestId('install-hint', {}, { timeout: 4000 });
    expect(within(sheet).getByRole('heading', { name: 'Install the app' })).toBeInTheDocument();
    expect(sheet).toHaveTextContent('Install the app: it opens like any other app on your phone and works with weak internet.');
    expect(within(sheet).getByRole('button', { name: 'Listen: Install the app' })).toHaveAttribute('data-help-key', 'help.option.install.line');
    await user.click(within(sheet).getAllByRole('button', { name: 'Not now' })[0]);
    expect(screen.queryByTestId('install-hint')).toBeNull();
    const until = JSON.parse(localStorage.getItem(INSTALL_KEY)).hideUntil;
    expect(until).toBeGreaterThan(Date.now() + 13.9 * 86400000);
    expect(until).toBeLessThan(Date.now() + 14.1 * 86400000);
  });

  test('never before the first touch, over an open dialog or while typing', () => {
    resetInteraction();
    expect(inviteBlocked()).toBe('no-touch');
    markInteracted();
    expect(inviteBlocked()).toBeNull();
    const dialog = document.createElement('dialog');
    dialog.setAttribute('open', '');
    document.body.append(dialog);
    expect(inviteBlocked()).toBe('dialog');
    dialog.remove();
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    expect(inviteBlocked()).toBe('typing');
    input.remove();
  });

  test('inside the installed app nothing install-related is shown', async () => {
    standalone(true);
    mockApi({});
    renderAt('/help');
    await screen.findByRole('heading', { level: 1, name: 'Help centre' });
    offer();
    markInteracted();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(footerButton()).toBeNull();
    expect(screen.queryByTestId('install-hint')).toBeNull();
    expect(screen.queryByText('Install this app')).toBeNull();
  });
});

// Every route has the footer button: visitor pages, worker, customer and admin pages.
const WORKER = {
  'GET /auth/me': me('worker', { _id: 'w1' }),
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE, []),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
};
const ROUTES = [
  ['visitor', {}, ['/', '/login', '/register', '/help', '/voice-check', '/no-such-page']],
  ['customer', { 'GET /auth/me': me('customer') }, ['/find', '/saved', '/compare', '/bookings', '/notifications']],
  ['worker', WORKER, ['/worker', '/worker/profile', '/worker/requests', '/worker/jobs', '/worker/reviews', '/worker/reputation', '/notifications']],
  ['admin', { 'GET /auth/me': me('admin') }, ['/admin', '/admin/identity', '/admin/evidence', '/admin/users', '/admin/audit', '/admin/bookings', '/admin/disputes', '/admin/reviews', '/admin/flags', '/admin/exports', '/admin/templates']],
];

describe('every route renders the footer button (hidden only when installed)', () => {
  test.each(ROUTES)('%s pages', async (_role, routes, paths) => {
    for (const path of paths) {
      mockApi(routes);
      const { unmount } = renderAt(path);
      await waitFor(() => expect(footerButton(), path).toBeInTheDocument());
      unmount();
    }
  });
});
