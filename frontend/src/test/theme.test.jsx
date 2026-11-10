// Dark mode and text size (Batch 4, Part 3 and feature 4).
import { afterEach, describe, test, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../theme';
import { TEXT_SIZE_KEY, THEME_KEY, applyMode, applyTextSize, isTextSize, isThemePreference, readStored, resolveMode } from '../theme/mode';
import { changeMode } from '../theme/reveal';
import ThemeToggle from '../components/layout/ThemeToggle';
import TextSizeControl from '../components/layout/TextSizeControl';
import { DEFAULT_THEME } from '../styles/theme';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt } from './renderApp';

const root = document.documentElement;

// jsdom has no matchMedia; each test says what the "device" prefers.
function device({ dark = false, reducedMotion = false } = {}) {
  const listeners = new Set();
  const state = { dark };
  window.matchMedia = (query) => ({
    media: query,
    get matches() {
      return query.includes('prefers-color-scheme') ? state.dark : query.includes('prefers-reduced-motion') ? reducedMotion : false;
    },
    addEventListener: (_, fn) => query.includes('prefers-color-scheme') && listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  });
  return {
    setDark(value) {
      state.dark = value;
      listeners.forEach((fn) => fn({ matches: value }));
    },
  };
}

afterEach(() => {
  delete window.matchMedia;
  delete document.startViewTransition;
  vi.useRealTimers();
});

describe('mode helpers', () => {
  test('resolveMode: light and dark are kept; system follows the device', () => {
    device({ dark: true });
    expect(resolveMode('light')).toBe('light');
    expect(resolveMode('dark')).toBe('dark');
    expect(resolveMode('system')).toBe('dark');
    device({ dark: false });
    expect(resolveMode('system')).toBe('light');
  });

  test('without matchMedia (very old browser) the mode is light', () => {
    expect(resolveMode('system')).toBe('light');
  });

  test('only known values are read from storage; blocked storage gives null', () => {
    localStorage.setItem(THEME_KEY, 'pink');
    expect(readStored(THEME_KEY, isThemePreference)).toBeNull();
    localStorage.setItem(THEME_KEY, 'dark');
    expect(readStored(THEME_KEY, isThemePreference)).toBe('dark');
    const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readStored(TEXT_SIZE_KEY, isTextSize)).toBeNull();
    blocked.mockRestore();
  });

  test('applyMode and applyTextSize write on <html>', () => {
    applyMode('dark');
    expect(root.dataset.mode).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
    applyTextSize('large');
    expect(root.dataset.textSize).toBe('large');
    applyTextSize('normal');
    expect(root.dataset.textSize).toBeUndefined();
  });
});

describe('changing the mode: reveal, fallback, reduced motion', () => {
  function viewTransitions() {
    const animate = vi.fn();
    root.animate = animate;
    let done;
    const finished = new Promise((r) => { done = r; });
    document.startViewTransition = vi.fn((apply) => {
      apply();
      return { ready: Promise.resolve(), finished };
    });
    return { animate, done };
  }

  test('with View Transitions: a circle grows from the button, clipped on the new page', async () => {
    device();
    const { animate, done } = viewTransitions();
    const apply = vi.fn();
    expect(changeMode(apply, { x: 300, y: 40 })).toBe('reveal');
    expect(apply).toHaveBeenCalledTimes(1);
    expect(root.dataset.transition).toBe('theme');
    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1));
    const [frames, options] = animate.mock.calls[0];
    expect(frames.clipPath[0]).toBe('circle(0px at 300px 40px)');
    expect(frames.clipPath[1]).toMatch(/^circle\(\d+(\.\d+)?px at 300px 40px\)$/);
    // far enough to reach the farthest corner of the window
    const radius = Number(/circle\(([\d.]+)px/.exec(frames.clipPath[1])[1]);
    expect(radius).toBeGreaterThanOrEqual(Math.hypot(window.innerWidth - 300, window.innerHeight - 40) - 1);
    expect(options.pseudoElement).toBe('::view-transition-new(root)');
    done();
    await waitFor(() => expect(root.dataset.transition).toBeUndefined());
    delete root.animate;
  });

  test('reduced motion: instant, no view transition and no fade', () => {
    device({ reducedMotion: true });
    const { animate } = viewTransitions();
    const apply = vi.fn();
    expect(changeMode(apply, { x: 10, y: 10 })).toBe('instant');
    expect(apply).toHaveBeenCalledTimes(1);
    expect(document.startViewTransition).not.toHaveBeenCalled();
    expect(animate).not.toHaveBeenCalled();
    expect(root.classList.contains('mode-fade')).toBe(false);
    delete root.animate;
  });

  test('no View Transitions in the browser: a short cross-fade class, then removed', () => {
    device();
    vi.useFakeTimers();
    const apply = vi.fn();
    expect(changeMode(apply)).toBe('fade');
    expect(apply).toHaveBeenCalledTimes(1);
    expect(root.classList.contains('mode-fade')).toBe(true);
    vi.advanceTimersByTime(500);
    expect(root.classList.contains('mode-fade')).toBe(false);
  });
});

function Probe() {
  const { preference, mode, textSize } = useTheme();
  return <span data-testid="probe">{`${preference}/${mode}/${textSize}`}</span>;
}
const renderToggle = () => render(<ThemeProvider><ThemeToggle /><TextSizeControl /><Probe /></ThemeProvider>);
const probe = () => screen.getByTestId('probe').textContent;

describe('theme toggle', () => {
  test('default is "system": a dark device starts dark, and following the device continues while open', () => {
    const dev = device({ dark: true, reducedMotion: true });
    renderToggle();
    expect(probe()).toBe('system/dark/normal');
    expect(root.dataset.mode).toBe('dark');
    act(() => dev.setDark(false));
    expect(probe()).toBe('system/light/normal');
    expect(root.dataset.mode).toBe('light');
  });

  test('one tap switches light <-> dark, saves the choice, and tells screen readers', async () => {
    device({ reducedMotion: true });
    const user = userEvent.setup();
    renderToggle();
    const button = screen.getByRole('button', { name: 'Dark mode' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(root.dataset.mode).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(screen.getByRole('status')).toHaveTextContent('Dark mode is on');
    await user.click(button);
    expect(root.dataset.mode).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });

  test('the choice persists: a saved "dark" is used on the next visit even on a light device', () => {
    device({ dark: false });
    localStorage.setItem(THEME_KEY, 'dark');
    renderToggle();
    expect(probe()).toBe('dark/dark/normal');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the tap starts the circular reveal from the middle of the button', async () => {
    device();
    root.animate = vi.fn();
    document.startViewTransition = vi.fn((apply) => {
      apply();
      return { ready: Promise.resolve(), finished: Promise.resolve() };
    });
    renderToggle();
    const button = screen.getByRole('button', { name: 'Dark mode' });
    button.getBoundingClientRect = () => ({ left: 200, top: 20, width: 44, height: 44 });
    await userEvent.setup().click(button);
    expect(document.startViewTransition).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(root.animate).toHaveBeenCalled());
    expect(root.animate.mock.calls[0][0].clipPath[0]).toBe('circle(0px at 222px 42px)');
    expect(root.dataset.mode).toBe('dark');
    delete root.animate;
  });

  test('the options menu offers Light, Dark and System; arrow keys move, Escape closes', async () => {
    device({ dark: true, reducedMotion: true });
    const user = userEvent.setup();
    renderToggle();
    await user.click(screen.getByRole('button', { name: 'Theme options' }));
    const menu = screen.getByRole('menu', { name: 'Theme' });
    const items = within(menu).getAllByRole('menuitemradio');
    expect(items.map((i) => i.textContent)).toEqual(['Light', 'Dark', 'SystemFollows your device']);
    expect(items[2]).toHaveAttribute('aria-checked', 'true');
    expect(items[2]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(probe()).toBe('light/light/normal');
    expect(screen.queryByRole('menu')).toBeNull();
    // Down arrow on the toggle opens the menu too; Escape gives the focus back
    screen.getByRole('button', { name: 'Dark mode' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveFocus();
  });

  test('a long press opens the menu instead of toggling; a right click too', async () => {
    device({ reducedMotion: true });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderToggle();
    const button = screen.getByRole('button', { name: 'Dark mode' });
    await user.pointer({ keys: '[MouseLeft>]', target: button });
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.pointer({ keys: '[/MouseLeft]', target: button });
    expect(root.dataset.mode).toBe('light'); // the release did not toggle
    await user.click(within(screen.getByRole('menu')).getByRole('menuitemradio', { name: /System/ }));
    expect(localStorage.getItem(THEME_KEY)).toBe('system');
    await user.pointer({ keys: '[MouseRight]', target: button });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('the icon is one SVG that knows the mode (sun or moon)', async () => {
    device({ reducedMotion: true });
    const { container } = renderToggle();
    const icon = container.querySelector('svg[data-mode]');
    expect(icon).toHaveAttribute('data-mode', 'light');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(icon).toHaveAttribute('data-mode', 'dark');
  });
});

describe('text size (A−, A, A+)', () => {
  test('three choices in one radio group; the choice is applied and saved', async () => {
    device();
    const user = userEvent.setup();
    renderToggle();
    const group = screen.getByRole('radiogroup', { name: 'Text size' });
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
    expect(within(group).getByRole('radio', { name: 'Normal text' })).toHaveAttribute('aria-checked', 'true');
    await user.click(within(group).getByRole('radio', { name: 'Larger text' }));
    expect(root.dataset.textSize).toBe('large');
    expect(localStorage.getItem(TEXT_SIZE_KEY)).toBe('large');
    await user.click(within(group).getByRole('radio', { name: 'Smaller text' }));
    expect(root.dataset.textSize).toBe('small');
    await user.click(within(group).getByRole('radio', { name: 'Normal text' }));
    expect(root.dataset.textSize).toBeUndefined();
  });

  test('a saved size is used on the next visit', () => {
    localStorage.setItem(TEXT_SIZE_KEY, 'large');
    renderToggle();
    expect(probe()).toBe('system/light/large');
    expect(root.dataset.textSize).toBe('large');
  });
});

// ---- the toggle is on every page ----
const WORKER = { 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'), 'GET /workers/me': { status: 200, data: PROFILE }, 'GET /workers/me/full': full(PROFILE) };
const CUSTOMER = { 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /workers/DLM-2026-000042': { status: 200, data: { ...PROFILE, user: { name: 'Rashid Mehmood' } } } };
const ADMIN = {
  'GET /auth/me': me('admin'),
  'GET /admin/stats': { status: 200, data: { workers: { total: 0, Unverified: 0, Pending: 0, Verified: 0, Rejected: 0 }, users: { worker: 0, customer: 0, admin: 1 } } },
  'GET /admin/workers': { status: 200, data: { workers: [], page: 1, limit: 25, total: 0 } },
  'GET /admin/evidence': { status: 200, data: { evidence: [], page: 1, limit: 25, total: 0 } },
  'GET /admin/audit': { status: 200, data: { entries: [], total: 0, page: 1, limit: 50, actions: [] } },
};
const PAGES = [
  ['landing', '/', {}],
  ['login', '/login', {}],
  ['register', '/register', {}],
  ['not found', '/no-such-page', {}],
  ['onboarding', '/onboarding/about', { ...WORKER, 'GET /workers/me/onboarding': onboarding({ about: false, work: false, skills: false }) }],
  ['worker dashboard', '/worker', WORKER],
  ['worker profile', '/worker/profile', WORKER],
  ['worker profile editor', '/worker/profile/edit', WORKER],
  ['find workers', '/find', CUSTOMER],
  ['public worker profile', '/workers/DLM-2026-000042', CUSTOMER],
  ['admin overview', '/admin', ADMIN],
  ['admin identity review', '/admin/identity', ADMIN],
  ['admin evidence review', '/admin/evidence', ADMIN],
  ['admin audit log', '/admin/audit', ADMIN],
];

describe('the night-mode button is on every page', () => {
  test.each(PAGES)('%s (%s)', async (_, path, routes) => {
    device({ reducedMotion: true });
    mockApi(routes);
    renderAt(path);
    const header = await screen.findByRole('banner');
    const toggle = await within(header).findByRole('button', { name: 'Dark mode' });
    await userEvent.setup().click(toggle);
    expect(root.dataset.mode).toBe('dark');
  });

  test('language chooser (before a language is chosen)', async () => {
    device({ reducedMotion: true });
    mockApi({});
    renderAt('/', { language: null });
    const toggle = await screen.findByRole('button', { name: 'Dark mode' });
    await userEvent.setup().click(toggle);
    expect(root.dataset.mode).toBe('dark');
  });
});

// The display settings sent to the account (the language is saved by its own request).
const saved = (calls) => calls.filter((c) => c.key === 'PATCH /users/me/preferences' && !('preferredLanguage' in c.body)).map((c) => c.body);

describe('theme and text size are saved on the account', () => {
  test('a logged-in user toggles: PATCH /users/me/preferences { preferredTheme }', async () => {
    device({ reducedMotion: true });
    const calls = mockApi({ ...CUSTOMER, 'GET /auth/me': me('customer', { preferredTheme: 'light', preferredTextSize: null }) });
    renderAt('/find');
    const toggle = await within(await screen.findByRole('banner')).findByRole('button', { name: 'Dark mode' });
    await userEvent.setup().click(toggle);
    await waitFor(() => expect(saved(calls)).toContainEqual({ preferredTheme: 'dark' }));
  });

  test('the account setting is used on a new device (nothing chosen in this browser)', async () => {
    device({ dark: false, reducedMotion: true });
    const calls = mockApi({ ...CUSTOMER, 'GET /auth/me': me('customer', { preferredTheme: 'dark', preferredTextSize: 'large' }) });
    renderAt('/find');
    await waitFor(() => expect(root.dataset.mode).toBe('dark'));
    await waitFor(() => expect(root.dataset.textSize).toBe('large'));
    expect(saved(calls)).toEqual([]);
  });

  test('the account has none yet: the setting saved in this browser is stored on the account', async () => {
    device({ reducedMotion: true });
    localStorage.setItem(THEME_KEY, 'dark');
    const calls = mockApi({ ...CUSTOMER, 'GET /auth/me': me('customer', { preferredTheme: null, preferredTextSize: null }) });
    renderAt('/find');
    await waitFor(() => expect(saved(calls)).toContainEqual({ preferredTheme: 'dark' }));
  });

  test('text size in the account menu is saved on the account', async () => {
    device({ reducedMotion: true });
    const user = userEvent.setup();
    const calls = mockApi({ ...CUSTOMER, 'GET /auth/me': me('customer', { preferredTheme: null, preferredTextSize: null }) });
    renderAt('/find');
    const header = await screen.findByRole('banner');
    await user.click(await within(header).findByRole('button', { name: /Account menu/ }));
    await user.click(within(header).getByRole('radio', { name: 'Larger text' }));
    await waitFor(() => expect(saved(calls)).toContainEqual({ preferredTextSize: 'large' }));
  });
});

describe('no flash of the wrong mode: the script in index.html', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
  const script = /<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/.exec(html)?.[1];
  // Runs the real inline script (it only touches window, document and localStorage).
  const run = () => new Function(script)();

  test('it is inline, before the app script, and uses the same storage keys and theme as the app', () => {
    expect(script).toBeTruthy();
    expect(html.indexOf('<script>')).toBeLessThan(html.indexOf('src="/src/main.jsx"'));
    expect(script).toContain(`'${THEME_KEY}'`);
    expect(script).toContain(`'${TEXT_SIZE_KEY}'`);
    expect(script).toContain(`'${DEFAULT_THEME}'`);
  });

  test.each([
    ['dark', false, 'dark'],
    ['light', true, 'light'],
    ['system', true, 'dark'],
    [null, true, 'dark'],
    [null, false, 'light'],
    ['nonsense', false, 'light'],
  ])('saved %s on a device with dark=%s -> %s', (saved, deviceDark, expected) => {
    device({ dark: deviceDark });
    if (saved) localStorage.setItem(THEME_KEY, saved);
    run();
    expect(root.dataset.mode).toBe(expected);
    expect(root.dataset.theme).toBe(DEFAULT_THEME);
    expect(resolveMode(readStored(THEME_KEY, isThemePreference) ?? 'system')).toBe(expected); // same answer as the app
  });

  test('the saved text size is applied; blocked storage does not break the page', () => {
    device();
    localStorage.setItem(TEXT_SIZE_KEY, 'large');
    run();
    expect(root.dataset.textSize).toBe('large');
    const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(run).not.toThrow();
    expect(root.dataset.mode).toBe('light');
    blocked.mockRestore();
  });
});
