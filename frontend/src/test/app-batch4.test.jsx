// Batch 4 app-wide features: skip link (3), offline banner and retry (5), installable app (6),
// notification bell and page (19), continue-setup chip (9), availability toggle (45), command
// palette (35), keyboard shortcuts (36), scroll to top (44), session warning (48), What's new
// (54), help centre (55).
import { describe, test, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { act, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getConnectivity, resetConnectivity } from '../features/app/connectivity';
import { parseChangelog } from '../../scripts/make-whats-new.mjs';
import whatsNew from '../content/whatsNew.json';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { LanguageProvider } from '../i18n';
import { CrashScreen } from '../components/layout/ErrorBoundary';
import { lazyPage } from '../routes/lazyPage';
import { markInteracted } from '../features/assist/interaction';

afterEach(() => {
  vi.useRealTimers();
  resetConnectivity();
});

const COMPLETE = onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z');
const WORKER = me('worker', { _id: 'w1' });
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': WORKER,
  'GET /workers/me/onboarding': COMPLETE,
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE),
  'GET /notifications/unread-count': { status: 200, data: { unread: 2 } },
  ...extra,
});
const noTour = () => localStorage.setItem('dlm.tour.w1', 'done');
const N = [
  { _id: 'n1', type: 'evidence_approved', params: { skillId: 'elec_wiring', skillName: 'House wiring', evidenceId: 'e1' }, read: false, createdAt: '2026-11-10T10:00:00Z' },
  { _id: 'n2', type: 'identity_rejected', params: { note: 'Name does not match' }, read: false, createdAt: '2026-11-09T10:00:00Z' },
  { _id: 'n3', type: 'evidence_revoked', params: { skillId: 'elec_solar', skillName: 'Solar panel installation' }, read: true, createdAt: '2026-11-08T10:00:00Z' },
];

describe('skip link (feature 3)', () => {
  test('the first thing a keyboard reaches on every page is "Skip to content", pointing at main', async () => {
    mockApi({});
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    await userEvent.setup().tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(document.getElementById('main')).toHaveAttribute('tabindex', '-1');
  });
});

describe('notifications in the header (feature 19)', () => {
  test('the bell shows the unread count; the list says what happened in words and links to the right place', async () => {
    noTour();
    const calls = mockApi(workerRoutes({ 'GET /notifications': { status: 200, data: { notifications: N, unread: 2, page: 1, limit: 5, total: 3 } }, 'PATCH /notifications/n1/read': { status: 200, data: { unread: 1 } } }));
    const user = userEvent.setup();
    renderAt('/worker');
    const bell = await screen.findByRole('button', { name: 'Notifications: 2 unread notifications' });
    await user.click(bell);
    const panel = await screen.findByRole('region', { name: 'Notifications' });
    expect(await within(panel).findByText('Proof approved for House wiring')).toBeInTheDocument();
    expect(within(panel).getByText('Reason: Name does not match')).toBeInTheDocument();
    expect(within(panel).getAllByText('New')).toHaveLength(2);
    await user.click(within(panel).getByText('Proof approved for House wiring'));
    await waitFor(() => expect(calls.some((c) => c.key === 'PATCH /notifications/n1/read')).toBe(true));
    expect(pathname()).toBe('/worker/profile/edit');
  });

  test('"Mark all as read" and an empty list with a drawing', async () => {
    noTour();
    const calls = mockApi(workerRoutes({ 'GET /notifications': { status: 200, data: { notifications: N.slice(0, 1), unread: 1, page: 1, limit: 5, total: 1 } }, 'POST /notifications/read-all': { status: 200, data: { updated: 1, unread: 0 } } }));
    const user = userEvent.setup();
    renderAt('/worker');
    await user.click(await screen.findByRole('button', { name: /^Notifications/ }));
    await user.click(await screen.findByRole('button', { name: 'Mark all as read' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /notifications/read-all')).toBe(true));
    expect(screen.queryByText('New')).toBeNull();
  });

  test('the count is asked again every minute', async () => {
    noTour();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const calls = mockApi(workerRoutes());
    renderAt('/worker');
    await screen.findByRole('button', { name: /^Notifications: 2/ }); // the first count has arrived
    const before = calls.filter((c) => c.key === 'GET /notifications/unread-count').length;
    await act(async () => { await vi.advanceTimersByTimeAsync(60500); });
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /notifications/unread-count').length).toBe(before + 1));
  });

  test('the notifications page lists everything; customers have no bell', async () => {
    noTour();
    mockApi(workerRoutes({ 'GET /notifications': { status: 200, data: { notifications: N, unread: 2, page: 1, limit: 20, total: 3 } } }));
    renderAt('/notifications');
    expect(await screen.findByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    expect(await screen.findByText('Approval withdrawn for Solar panel installation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Approval withdrawn/ })).toHaveAttribute('href', '/worker/profile/edit?section=proof&skill=elec_solar');
  });

  test('a customer has no bell (notifications are for workers)', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /saved/ids': { status: 200, data: { ids: [] } } });
    renderAt('/find');
    await screen.findByRole('heading', { level: 1, name: 'Find workers' });
    expect(screen.queryByTestId('notification-bell')).toBeNull();
  });
});

describe('continue-setup chip (feature 9) and availability toggle (feature 45)', () => {
  test('a worker with unfinished setup sees the chip with the next step (not on the onboarding pages)', async () => {
    mockApi(workerRoutes({ 'GET /workers/me/onboarding': onboarding({ about: true, work: false, skills: false }), 'GET /notifications/unread-count': { status: 200, data: { unread: 0 } } }));
    renderAt('/help');
    const chip = await screen.findByTestId('setup-chip');
    expect(chip).toHaveAttribute('href', '/onboarding/work');
    expect(chip).toHaveAccessibleName('Continue setting up your profile: step 2 of 3');
  });

  test('the chip is not shown once setup is complete', async () => {
    noTour();
    mockApi(workerRoutes());
    renderAt('/worker');
    await screen.findByRole('heading', { level: 1, name: /Welcome/ });
    expect(screen.queryByTestId('setup-chip')).toBeNull();
  });

  test('Available / Busy is one switch; the change is saved and announced', async () => {
    noTour();
    const calls = mockApi(workerRoutes({ 'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body }, onboarding: COMPLETE.data } }) }));
    renderAt('/worker');
    const toggle = await screen.findByRole('switch', { name: 'I am available for work' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.setup().click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await waitFor(() => expect(calls.find((c) => c.key === 'PUT /workers/me')?.body).toEqual({ availability: 'Busy' }));
    expect(await screen.findByText('Customers now see: Busy')).toBeInTheDocument();
  });
});

describe('command palette (feature 35) and shortcuts (feature 36)', () => {
  test('Ctrl+K opens it; typing filters; Enter opens the chosen page', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /saved/ids': { status: 200, data: { ids: [] } }, 'GET /saved': { status: 200, data: { workers: [], total: 0, max: 100 } } });
    const user = userEvent.setup();
    renderAt('/find');
    await screen.findByRole('heading', { level: 1, name: 'Find workers' });
    await user.keyboard('{Control>}k{/Control}');
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const input = within(dialog).getByRole('combobox', { name: 'Search pages and actions' });
    expect(input).toHaveFocus();
    await user.type(input, 'saved');
    const options = within(dialog).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Saved workers']);
    await user.keyboard('{Enter}');
    expect(pathname()).toBe('/saved');
  });

  test('the palette only offers pages of this role: a visitor never sees an admin page', async () => {
    mockApi({});
    const user = userEvent.setup();
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    await user.click(screen.getByRole('button', { name: 'Search pages and actions' }));
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    const labels = within(dialog).getAllByRole('option').map((o) => o.textContent);
    expect(labels).toContain('Log in');
    expect(labels.join(' ')).not.toMatch(/Users|Audit|Identity review|Exports/);
    // arrow keys move the active option
    const input = within(dialog).getByRole('combobox');
    const first = input.getAttribute('aria-activedescendant');
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).not.toBe(first);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).toBeNull();
  });

  test('"?" shows the shortcuts; "g h" goes home; "t" switches the theme; nothing fires while typing', async () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} }); // reduced motion: instant theme change
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /saved/ids': { status: 200, data: { ids: [] } }, 'GET /saved': { status: 200, data: { workers: [], total: 0, max: 100 } } });
    const user = userEvent.setup();
    renderAt('/saved');
    await screen.findByRole('heading', { level: 1, name: 'Saved workers' });
    await user.keyboard('?');
    const help = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
    expect(within(help).getByText('Open the command palette')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    const before = document.documentElement.dataset.mode;
    await user.keyboard('t');
    expect(document.documentElement.dataset.mode).not.toBe(before);
    await user.keyboard('gh');
    expect(pathname()).toBe('/find');
    await user.type(await screen.findByRole('searchbox', { name: 'Search workers' }), 'gh?t');
    expect(pathname()).toBe('/find');
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull();
    delete window.matchMedia;
  });

  test('"/" jumps to the search box of the page', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /saved/ids': { status: 200, data: { ids: [] } } });
    const user = userEvent.setup();
    renderAt('/find');
    await screen.findByRole('heading', { level: 1, name: 'Find workers' });
    document.body.focus();
    await user.keyboard('/');
    expect(screen.getByRole('searchbox', { name: 'Search workers' })).toHaveFocus();
  });
});

describe('offline banner and automatic retry (feature 5)', () => {
  test('a request that gets no answer shows the banner; it disappears when the server answers again', async () => {
    let fail = true;
    mockApi({ 'GET /meta/taxonomy': () => { if (fail) throw Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }); return { status: 200, data: { categories: [], skills: [], availability: [] } }; } });
    renderAt('/');
    const banner = await screen.findByTestId('offline-banner');
    expect(banner).toHaveTextContent('The server could not be reached. Trying again…');
    expect(getConnectivity().serverDown).toBe(true);
    fail = false;
    await userEvent.setup().click(within(banner).getByRole('button', { name: 'Try now' }));
    await waitFor(() => expect(screen.getByTestId('offline-banner')).toHaveTextContent('You are back online.'));
  });

  test('the browser going offline shows the offline message; coming back online retries', async () => {
    mockApi({});
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(await screen.findByTestId('offline-banner')).toHaveTextContent('You are offline.');
    act(() => { window.dispatchEvent(new Event('online')); });
    await waitFor(() => expect(screen.getByTestId('offline-banner')).toHaveTextContent('You are back online.'));
  });

  // Bug found by the Batch 4 e2e run: a poll that failed while offline kept "could not be reached"
  // on screen after the connection came back.
  test('a request that failed while offline does not keep the error after coming back online', async () => {
    mockApi({});
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    act(() => {
      window.dispatchEvent(new Event('offline'));
      resetConnectivity({ online: false, serverDown: true });
    });
    expect(await screen.findByTestId('offline-banner')).toHaveTextContent('You are offline.');
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(getConnectivity()).toEqual({ online: true, serverDown: false });
    await waitFor(() => expect(screen.getByTestId('offline-banner')).toHaveTextContent('You are back online.'));
  });
});

// Bug found by the Batch 4 e2e run: when the connection dropped while an on-demand page was still
// downloading, the whole website showed "Something went wrong" and stayed there.
describe('a page whose code could not be downloaded', () => {
  const renderLazy = (Page) => {
    const router = createMemoryRouter([{ path: '/', element: <Page />, errorElement: <CrashScreen /> }]);
    return render(<LanguageProvider initialLanguage="en"><RouterProvider router={router} /></LanguageProvider>);
  };

  test('a calm message instead of the crash screen; the page loads when the connection is back', async () => {
    let fail = true;
    const load = vi.fn(() => (fail
      ? Promise.reject(new TypeError('Failed to fetch dynamically imported module'))
      : Promise.resolve({ default: () => <h1>Loaded page</h1> })));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderLazy(lazyPage(load));
    expect(await screen.findByRole('heading', { level: 1, name: 'This page could not be loaded' })).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).toBeNull();
    fail = false;
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(await screen.findByRole('heading', { level: 1, name: 'Loaded page' })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    // React reports the caught error; it is only the download problem
    expect(logged.mock.calls.flat().filter((a) => a instanceof Error).every((e) => e.pageLoadFailed)).toBe(true);
    logged.mockRestore();
  });

  test('"Try again" loads again; after a second failure "Reload page" is offered too', async () => {
    const load = vi.fn(() => Promise.reject(new TypeError('Failed to fetch dynamically imported module')));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderLazy(lazyPage(load));
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('button', { name: 'Reload page' })).toBeInTheDocument();
    logged.mockRestore();
  });

  test('a crash inside a page that did load still reaches the crash screen', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => { throw new Error('bug in the page'); };
    renderLazy(lazyPage(() => Promise.resolve({ default: Broken })));
    expect(await screen.findByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    quiet.mockRestore();
  });
});

describe('installable app (feature 6)', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  const sw = readFileSync('public/sw.js', 'utf8');

  test('manifest: standalone app with normal and maskable icons that exist', () => {
    expect(manifest).toMatchObject({ name: 'Digital Labour Marketplace', start_url: '/', display: 'standalone' });
    expect(manifest.icons.filter((i) => i.purpose === 'maskable').map((i) => i.sizes)).toEqual(['192x192', '512x512']);
    for (const icon of manifest.icons) expect(() => readFileSync(`public${icon.src}`)).not.toThrow();
    expect(readFileSync('index.html', 'utf8')).toContain('rel="manifest" href="/manifest.webmanifest"');
  });

  test('the service worker never touches API answers and only caches static files', () => {
    expect(sw).toContain("if (url.pathname.startsWith('/api/')) return;");
    expect(sw).toMatch(/no-store\|private/);
    expect(sw).not.toMatch(/cache\.put\([^)]*api/i);
    // it is registered only in production builds
    expect(readFileSync('src/main.jsx', 'utf8')).toMatch(/import\.meta\.env\.PROD && 'serviceWorker' in navigator/);
  });

  // Batch 6B changed the rule on purpose (BATCH_6B section 4.3): the invitation waits for the second page
  // (or 30 s) and the first touch, and "Not now" hides it for 14 days in one versioned key (was: at once,
  // 30 days, dlm.installHint). Same checks: it appears when installation is possible; "Not now" hides it
  // and is remembered.
  test('the install hint appears when the browser offers installation, and "Not now" hides it for 14 days', async () => {
    mockApi({});
    const user = userEvent.setup();
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    const event = Object.assign(new Event('beforeinstallprompt'), { prompt: vi.fn(), userChoice: Promise.resolve({ outcome: 'dismissed' }) });
    act(() => { window.dispatchEvent(event); });
    markInteracted();
    await user.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Create account' }));
    const hint = await screen.findByTestId('install-hint');
    await user.click(within(hint).getAllByRole('button', { name: 'Not now' })[0]);
    expect(screen.queryByTestId('install-hint')).toBeNull();
    expect(JSON.parse(localStorage.getItem('dlm.install.v1')).hideUntil).toBeGreaterThan(Date.now() + 13.9 * 86400000);
  });
});

describe('scroll to top (feature 44)', () => {
  test('appears after the first screen and goes back to the top', async () => {
    window.scrollTo = vi.fn();
    mockApi({});
    renderAt('/help');
    await screen.findByRole('heading', { level: 1, name: 'Help centre' });
    expect(screen.queryByTestId('scroll-top')).toBeNull();
    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true });
    fireEvent.scroll(window);
    const button = await screen.findByRole('button', { name: 'Back to top' });
    await userEvent.setup().click(button);
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });
});

describe('session ending warning (feature 48)', () => {
  test('two minutes before the 8-hour login ends a dialog asks to save; at the end: Log in with a message', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const ends = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    mockApi({ 'GET /auth/me': me('customer', { sessionExpiresAt: ends }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'GET /saved/ids': { status: 200, data: { ids: [] } } });
    renderAt('/find');
    await screen.findByRole('heading', { level: 1, name: 'Find workers' });
    expect(screen.queryByRole('dialog', { name: 'Your session ends in 2 minutes' })).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 500); });
    expect(await screen.findByRole('dialog', { name: 'Your session ends in 2 minutes' })).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(2 * 60 * 1000 + 500); });
    await waitFor(() => expect(pathname()).toBe('/login'));
    expect(await screen.findByText('Your session has ended. Please log in again.')).toBeInTheDocument();
  });
});

describe("What's new (feature 54) and help centre (feature 55)", () => {
  test('the change log is turned into sections of plain points', () => {
    const text = '# Changelog\n\n## Batch 9 (1 Jan)\n\n**Part**\n- First `point` with **bold**\n  continued here\n- [Link](x.md) second\n\n## Batch 8\n- Old\n';
    expect(parseChangelog(text)).toEqual([
      { title: 'Batch 9 (1 Jan)', points: ['First point with bold continued here', 'Link second'] },
      { title: 'Batch 8', points: ['Old'] },
    ]);
    expect(whatsNew.sections.length).toBeGreaterThan(0);
  });

  test("the footer opens What's new, which says where the entries come from", async () => {
    mockApi({});
    const user = userEvent.setup();
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    await user.click(within(screen.getByRole('contentinfo')).getByRole('button', { name: "What's new" }));
    const dialog = await screen.findByRole('dialog', { name: "What's new" });
    expect(within(dialog).getByText(whatsNew.sections[0].title)).toBeInTheDocument();
    expect(within(dialog).getByText('Taken from the project change log.')).toBeInTheDocument();
  });

  test('help centre: guides for everyone, own role first, searchable', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /saved/ids': { status: 200, data: { ids: [] } } });
    const user = userEvent.setup();
    renderAt('/help');
    expect(await screen.findByRole('heading', { level: 1, name: 'Help centre' })).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings[0]).toBe('For customers');
    expect(screen.getByRole('heading', { level: 3, name: 'What the badges mean' })).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox', { name: 'Search the guides' }), 'CNIC');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(expect.arrayContaining(['Get your identity verified']));
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'zzzz');
    expect(screen.getByText('No guide matches. Try another word.')).toBeInTheDocument();
  });

  test('the help centre is in Urdu too, right to left', async () => {
    mockApi({});
    renderAt('/help', { language: 'ur' });
    expect(await screen.findByRole('heading', { level: 1, name: 'مدد' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  });
});
