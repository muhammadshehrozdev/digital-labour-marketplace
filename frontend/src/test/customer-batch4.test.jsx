// Batch 4 customer features: URL-synced filters (20), instant search with highlighting (21),
// sort (22), saved workers (23), compare (24), recently viewed (25), share (46), print (47),
// undo toast (17), haptics (50).
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Highlight from '../features/customer/Highlight';
import { splitMatches } from '../features/customer/highlightText';
import { compareStore, MAX_COMPARE } from '../features/customer/compareStore';
import { MAX_RECENT, readRecent, rememberWorker, clearRecent } from '../features/customer/recentlyViewed';
import { shareProfile, profileUrl } from '../features/customer/share';
import { buzz } from '../utils/haptics';
import { ToastProvider, useToast } from '../components/ui';
import { mockApi, me } from './mockApi';
import { renderAt, currentSearch, pathname } from './renderApp';

const worker = (n, extra = {}) => ({
  workerIdCode: `DLM-2026-00000${n}`,
  user: { name: `Worker ${n}` },
  occupation: 'Electrician',
  category: 'electrical_solar',
  city: 'Rawalpindi',
  experienceYears: n + 2,
  hourlyRate: 500 + n * 100,
  dailyRate: 3000,
  availability: 'Available',
  verificationStatus: n === 1 ? 'Verified' : 'Pending',
  languages: ['Urdu'],
  skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', custom: false, evidenceSummary: { status: n === 1 ? 'verified' : 'self_declared', approved: n === 1 ? 1 : 0, strength: 'none' } }],
  ...extra,
});
const W = [worker(1), worker(2), worker(3), worker(4)];
const CUSTOMER = me('customer', { _id: 'c1' });
const list = (workers = W) => ({ status: 200, data: { workers, page: 1, limit: 12, total: workers.length, sort: 'updated' } });
const routes = (extra = {}) => ({
  'GET /auth/me': CUSTOMER,
  'GET /workers': list(),
  'GET /saved/ids': { status: 200, data: { ids: ['DLM-2026-000002'], max: 100 } },
  ...extra,
});
const lastSearch = (calls) => calls.filter((c) => c.key === 'GET /workers').at(-1)?.params;

beforeEach(() => {
  sessionStorage.clear();
  compareStore.reset();
});
afterEach(() => {
  vi.useRealTimers();
  delete navigator.share;
  delete navigator.vibrate;
});

describe('search highlighting (feature 21)', () => {
  test('matched words are split out, in any letter case; short or empty queries match nothing', () => {
    expect(splitMatches('House wiring and Wiring repair', 'wiring')).toEqual([
      { text: 'House ', match: false }, { text: 'wiring', match: true }, { text: ' and ', match: false }, { text: 'Wiring', match: true }, { text: ' repair', match: false },
    ]);
    expect(splitMatches('House wiring', '')).toEqual([{ text: 'House wiring', match: false }]);
    expect(splitMatches('House wiring', 'w')).toEqual([{ text: 'House wiring', match: false }]);
    expect(splitMatches(null, 'x')).toEqual([{ text: '', match: false }]);
  });

  test('regex characters typed by the user are matched literally', () => {
    expect(() => splitMatches('C++ (advanced)', '(adv')).not.toThrow();
    expect(splitMatches('C++ (advanced)', '(adv').filter((p) => p.match).map((p) => p.text)).toEqual(['(adv']);
    expect(splitMatches('aaaa', '.*').some((p) => p.match)).toBe(false);
  });

  test('Highlight renders <mark> around matches and Urdu text works too', () => {
    const { container } = render(<p><Highlight text="گھر کی وائرنگ" query="وائرنگ" /></p>);
    expect(container.querySelector('mark')).toHaveTextContent('وائرنگ');
    expect(container.textContent).toBe('گھر کی وائرنگ');
  });
});

describe('find workers: address-synced filters, instant search, sort (features 20, 21, 22)', () => {
  test('the address decides the first request: filters, sort and page come from the URL', async () => {
    const calls = mockApi(routes());
    renderAt('/find?q=wiring&category=electrical_solar&identity=verified&sort=experience&page=2');
    await screen.findAllByTestId('worker-card');
    expect(lastSearch(calls)).toMatchObject({ search: 'wiring', category: 'electrical_solar', identity: 'verified', sort: 'experience', page: '2' });
    expect(screen.getByRole('searchbox', { name: 'Search workers' })).toHaveValue('wiring');
    expect(screen.getByLabelText('Sort by')).toHaveValue('experience');
    // the filters in use are listed as removable chips
    const chips = screen.getByRole('list', { name: 'Filters in use' });
    expect(within(chips).getAllByRole('button').map((b) => b.textContent)).toEqual(['Search: wiring', 'Electrical & Solar', 'Identity verified']);
  });

  test('typing searches by itself after a short pause, updates the address, and marks the matches', async () => {
    const calls = mockApi(routes());
    const user = userEvent.setup();
    renderAt('/find');
    await screen.findAllByTestId('worker-card');
    const before = calls.filter((c) => c.key === 'GET /workers').length;
    await user.type(screen.getByRole('searchbox', { name: 'Search workers' }), 'wiring');
    await waitFor(() => expect(lastSearch(calls)).toMatchObject({ search: 'wiring' }));
    // one request for the whole word, not one per letter
    expect(calls.filter((c) => c.key === 'GET /workers').length).toBeLessThanOrEqual(before + 2);
    expect(currentSearch()).toBe('?q=wiring');
    await waitFor(() => expect(document.querySelectorAll('[data-testid="worker-card"] mark').length).toBeGreaterThan(0));
    expect(document.querySelector('[data-testid="worker-card"] mark')).toHaveTextContent('wiring');
    expect(screen.getByText('Results update as you type.')).toBeInTheDocument();
  });

  test('sorting and filters change the address and ask the server; a chip removes one filter', async () => {
    const calls = mockApi(routes());
    const user = userEvent.setup();
    renderAt('/find');
    await screen.findAllByTestId('worker-card');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'evidence');
    await waitFor(() => expect(lastSearch(calls)).toMatchObject({ sort: 'evidence' }));
    expect(currentSearch()).toBe('?sort=evidence');
    expect(screen.getByText(/"Most approved proof" counts the photos an admin approved/)).toBeInTheDocument();

    const sidebar = screen.getByRole('complementary', { name: 'Filters' });
    await user.click(within(within(sidebar).getByRole('group', { name: 'Trade' })).getByRole('radio', { name: 'Plumbing & Sanitary' }));
    await user.click(within(sidebar).getByRole('switch', { name: /Verified skills only/ }));
    await waitFor(() => expect(lastSearch(calls)).toMatchObject({ category: 'plumbing_sanitary', skills: 'verified', sort: 'evidence' }));
    expect(currentSearch()).toBe('?sort=evidence&category=plumbing_sanitary&skills=verified');

    await user.click(screen.getByRole('button', { name: 'Remove filter: Plumbing & Sanitary' }));
    await waitFor(() => expect(lastSearch(calls).category).toBe('All'));
    expect(currentSearch()).toBe('?sort=evidence&skills=verified');
    await user.click(within(sidebar).getByRole('button', { name: 'Clear all' }));
    expect(currentSearch()).toBe('');
  });

  test('unknown values in the address are ignored instead of being sent to the server', async () => {
    const calls = mockApi(routes());
    renderAt('/find?sort=rating&category=hacking&page=-4&availability=Never');
    await screen.findAllByTestId('worker-card');
    expect(lastSearch(calls)).toMatchObject({ sort: 'updated', category: 'All', availability: 'All', page: '1' });
  });

  test('no result: an illustrated empty state with a way to clear the filters', async () => {
    mockApi(routes({ 'GET /workers': list([]) }));
    const { container } = renderAt('/find?q=zzz');
    expect(await screen.findByRole('heading', { name: 'No workers match' })).toBeInTheDocument();
    expect(container.querySelector('svg[data-scene="empty-search"]')).not.toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Clear search and filters' }));
    expect(currentSearch()).toBe('');
  });

  test('cards never show private contact data, even if the server sent it by mistake', async () => {
    const leaky = worker(1, { user: { name: 'Leaky Worker', phone: '03001234567', email: 'leak@example.com' }, whatsappNumber: '03007654321', address: 'Secret Street', cnicNumber: '3740512345671' });
    mockApi(routes({ 'GET /workers': list([leaky]) }));
    const { container } = renderAt('/find');
    await screen.findByTestId('worker-card');
    expect(container.textContent).not.toMatch(/03001234567|leak@example\.com|03007654321|Secret Street|3740512345671/);
  });
});

describe('saved workers (feature 23)', () => {
  test('the heart shows what is saved; a tap saves at once and tells the server', async () => {
    const calls = mockApi(routes({ 'PUT /saved/DLM-2026-000001': { status: 201, data: { saved: true } } }));
    navigator.vibrate = vi.fn(() => true);
    const user = userEvent.setup();
    renderAt('/find');
    expect(await screen.findByRole('button', { name: 'Remove Worker 2 from saved' })).toHaveAttribute('aria-pressed', 'true');
    const heart = screen.getByRole('button', { name: 'Save Worker 1' });
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    await user.click(heart);
    expect(await screen.findByRole('button', { name: 'Remove Worker 1 from saved' })).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(calls.some((c) => c.key === 'PUT /saved/DLM-2026-000001')).toBe(true));
    expect(await screen.findByText('Saved to your list')).toBeInTheDocument();
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  test('removing offers Undo, which saves the worker again', async () => {
    const calls = mockApi(routes({ 'DELETE /saved/DLM-2026-000002': { status: 200, data: { saved: false } }, 'PUT /saved/DLM-2026-000002': { status: 201, data: { saved: true } } }));
    const user = userEvent.setup();
    renderAt('/find');
    await user.click(await screen.findByRole('button', { name: 'Remove Worker 2 from saved' }));
    expect(await screen.findByRole('button', { name: 'Save Worker 2' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(await screen.findByRole('button', { name: 'Remove Worker 2 from saved' })).toBeInTheDocument();
    expect(calls.map((c) => c.key).filter((k) => k.includes('/saved/DLM'))).toEqual(['DELETE /saved/DLM-2026-000002', 'PUT /saved/DLM-2026-000002']);
  });

  test('if the server refuses, the heart goes back and a message is shown', async () => {
    mockApi(routes({ 'PUT /saved/DLM-2026-000001': { status: 400, data: { code: 'SAVED_LIMIT', message: 'x', params: { max: 100 } } } }));
    const user = userEvent.setup();
    renderAt('/find');
    await user.click(await screen.findByRole('button', { name: 'Save Worker 1' }));
    expect(await screen.findByText('Could not change your saved list. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Worker 1' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('the Saved page lists the saved workers; removing one takes it off the page', async () => {
    mockApi(routes({ 'GET /saved': { status: 200, data: { workers: [W[1]], total: 1, max: 100 } }, 'DELETE /saved/DLM-2026-000002': { status: 200, data: { saved: false } } }));
    const user = userEvent.setup();
    renderAt('/saved');
    expect(await screen.findByRole('heading', { level: 1, name: 'Saved workers' })).toBeInTheDocument();
    expect(await screen.findByText('1 saved worker')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Worker 2 from saved' }));
    expect(await screen.findByRole('heading', { name: 'No saved workers yet' })).toBeInTheDocument();
  });

  test('"Saved workers" is in the customer menu, next to "Find workers"', async () => {
    mockApi(routes({ 'GET /saved': { status: 200, data: { workers: [], total: 0, max: 100 } } }));
    renderAt('/saved');
    const banner = await screen.findByRole('banner');
    expect(await within(banner).findByRole('link', { name: 'Saved workers' })).toHaveAttribute('href', '/saved');
    expect(within(banner).getByRole('link', { name: 'Find workers' })).toHaveAttribute('href', '/find');
  });
});

describe('compare (feature 24)', () => {
  test('the store keeps at most three workers, without duplicates, for this tab', () => {
    expect(compareStore.add({ id: 'a', name: 'A' })).toBe(true);
    expect(compareStore.add({ id: 'a', name: 'A' })).toBe(true);
    compareStore.add({ id: 'b', name: 'B' });
    compareStore.add({ id: 'c', name: 'C' });
    expect(compareStore.add({ id: 'd', name: 'D' })).toBe(false);
    expect(compareStore.get().map((w) => w.id)).toEqual(['a', 'b', 'c']);
    expect(JSON.parse(sessionStorage.getItem('dlm.compare'))).toHaveLength(MAX_COMPARE);
    compareStore.remove('b');
    expect(compareStore.has('b')).toBe(false);
    compareStore.clear();
    expect(compareStore.get()).toEqual([]);
  });

  test('ticking "Compare" fills the tray; two or more open the comparison; a fourth is refused', async () => {
    mockApi(routes());
    const user = userEvent.setup();
    renderAt('/find');
    await screen.findAllByTestId('worker-card');
    expect(screen.queryByTestId('compare-tray')).toBeNull();
    await user.click(screen.getByRole('checkbox', { name: 'Add Worker 1 to compare' }));
    const tray = await screen.findByRole('complementary', { name: 'Workers to compare' });
    expect(within(tray).getByText('1 worker chosen. Choose one more.')).toBeInTheDocument();
    expect(within(tray).getByRole('button', { name: 'Compare now' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Add Worker 2 to compare' }));
    await user.click(screen.getByRole('checkbox', { name: 'Add Worker 3 to compare' }));
    expect(within(tray).getByRole('link', { name: 'Compare now' })).toHaveAttribute('href', '/compare?ids=DLM-2026-000001,DLM-2026-000002,DLM-2026-000003');
    expect(screen.getByRole('checkbox', { name: 'Add Worker 4 to compare' })).toBeDisabled();
    await user.click(within(tray).getByRole('button', { name: 'Remove Worker 2 from compare' }));
    expect(screen.getByRole('checkbox', { name: 'Add Worker 4 to compare' })).toBeEnabled();
    await user.click(within(tray).getByRole('button', { name: 'Clear' }));
    expect(screen.queryByTestId('compare-tray')).toBeNull();
  });

  test('the comparison is a real table: one column per worker, one row per fact, public data only', async () => {
    const calls = mockApi(routes({ 'GET /workers/compare': { status: 200, data: { workers: [W[0], W[1]], missing: [] } } }));
    const { container } = renderAt('/compare?ids=DLM-2026-000001,DLM-2026-000002');
    const table = await screen.findByRole('table', { name: 'Comparison of the chosen workers' });
    expect(calls.find((c) => c.key === 'GET /workers/compare').params).toEqual({ ids: 'DLM-2026-000001,DLM-2026-000002' });
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(expect.arrayContaining([expect.stringContaining('Worker 1'), expect.stringContaining('Worker 2')]));
    const identity = within(table).getByRole('row', { name: /^Identity/ });
    expect(within(identity).getByText('Identity verified')).toBeInTheDocument();
    expect(within(identity).getByText('Identity pending review')).toBeInTheDocument();
    const verified = within(table).getByRole('row', { name: /^Skills verified by evidence/ });
    expect(within(verified).getByText('House wiring')).toBeInTheDocument();
    expect(within(verified).getByText('None yet')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/phone|whatsapp|cnic|@example/i);
  });

  test('fewer than two workers: an explanation instead of an empty table; bad ids are dropped', async () => {
    const calls = mockApi(routes());
    renderAt('/compare?ids=DLM-2026-000001,hello,<script>');
    expect(await screen.findByRole('heading', { name: 'Choose two or three workers to compare' })).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'GET /workers/compare')).toBe(false);
  });

  test('a worker that is no longer listed is reported; removing a column updates the address', async () => {
    mockApi(routes({ 'GET /workers/compare': (config) => ({ status: 200, data: { workers: config.params.ids.split(',').map((id) => W.find((w) => w.workerIdCode === id)).filter(Boolean), missing: config.params.ids.includes('000009') ? ['DLM-2026-000009'] : [] } }) }));
    const user = userEvent.setup();
    renderAt('/compare?ids=DLM-2026-000001,DLM-2026-000002,DLM-2026-000009');
    expect(await screen.findByText('Some workers could not be shown. They may no longer be listed.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove Worker 2 from this comparison' }));
    expect(currentSearch()).toBe('?ids=DLM-2026-000001%2CDLM-2026-000009');
  });
});

describe('recently viewed (feature 25)', () => {
  test('per account, newest first, no duplicates, at most six, public fields only', () => {
    for (let n = 1; n <= 8; n += 1) rememberWorker('c1', worker(n, { user: { name: `Worker ${n}`, phone: '0300' }, address: 'x' }));
    rememberWorker('c1', worker(3));
    const recent = readRecent('c1');
    expect(recent).toHaveLength(MAX_RECENT);
    expect(recent[0].workerIdCode).toBe('DLM-2026-000003');
    expect(new Set(recent.map((w) => w.workerIdCode)).size).toBe(MAX_RECENT);
    expect(Object.keys(recent[0]).sort()).toEqual(['category', 'city', 'name', 'occupation', 'workerIdCode']);
    expect(readRecent('other-customer')).toEqual([]);
    clearRecent('c1');
    expect(readRecent('c1')).toEqual([]);
    expect(readRecent(undefined)).toEqual([]);
  });

  test('opening a profile remembers it; the search page lists it and can clear the list', async () => {
    mockApi(routes({ 'GET /workers/DLM-2026-000003': { status: 200, data: W[2] } }));
    const user = userEvent.setup();
    const first = renderAt('/workers/DLM-2026-000003');
    expect(await screen.findByRole('heading', { level: 1, name: 'Worker 3' })).toBeInTheDocument();
    await waitFor(() => expect(readRecent('c1').map((w) => w.workerIdCode)).toEqual(['DLM-2026-000003']));
    first.unmount();
    renderAt('/find');
    const recent = await screen.findByRole('region', { name: 'Recently viewed' });
    expect(within(recent).getByRole('link', { name: /Worker 3/ })).toHaveAttribute('href', '/workers/DLM-2026-000003');
    expect(within(recent).getByText('Kept on this device only.')).toBeInTheDocument();
    await user.click(within(recent).getByRole('button', { name: 'Clear the list' }));
    expect(screen.queryByRole('region', { name: 'Recently viewed' })).toBeNull();
  });
});

describe('public profile actions: save, compare, share, print (features 46, 47)', () => {
  const profileRoutes = () => routes({ 'GET /workers/DLM-2026-000001': { status: 200, data: W[0] } });

  test('share uses the phone share sheet when there is one, with the public link only', async () => {
    navigator.share = vi.fn(() => Promise.resolve());
    mockApi(profileRoutes());
    renderAt('/workers/DLM-2026-000001');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Share' }));
    expect(navigator.share).toHaveBeenCalledWith({ url: `${window.location.origin}/workers/DLM-2026-000001`, title: 'Worker 1', text: 'Worker 1, Electrician, on Digital Labour Marketplace' });
  });

  test('without a share sheet the link is copied and the person is told', async () => {
    mockApi(profileRoutes());
    renderAt('/workers/DLM-2026-000001');
    const user = userEvent.setup(); // installs its own clipboard, so ours is set after it
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await user.click(await screen.findByRole('button', { name: 'Share' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(profileUrl('DLM-2026-000001')));
    expect(await screen.findByText('Link copied')).toBeInTheDocument();
  });

  test('shareProfile: a closed share sheet is not an error; a blocked clipboard is reported', async () => {
    navigator.share = vi.fn(() => Promise.reject(Object.assign(new Error('x'), { name: 'AbortError' })));
    expect(await shareProfile({ url: 'u', title: 't', text: 'x' })).toBe('cancelled');
    delete navigator.share;
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('blocked')) }, configurable: true });
    expect(await shareProfile({ url: 'u', title: 't', text: 'x' })).toBe('failed');
  });

  test('print opens the browser print dialog; print styles hide navigation and private parts', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    mockApi(profileRoutes());
    renderAt('/workers/DLM-2026-000001');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Print' }));
    expect(print).toHaveBeenCalledTimes(1);
    const { readFileSync } = await import('node:fs');
    const css = readFileSync('src/styles/base.css', 'utf8');
    const printBlock = css.slice(css.indexOf('@media print'));
    expect(printBlock).toMatch(/header, footer, nav/);
    expect(printBlock).toContain("[data-print='hide']");
    print.mockRestore();
  });

  test('the profile page can save the worker and add them to the comparison', async () => {
    const calls = mockApi(routes({ 'GET /workers/DLM-2026-000001': { status: 200, data: W[0] }, 'PUT /saved/DLM-2026-000001': { status: 201, data: { saved: true } } }));
    const user = userEvent.setup();
    renderAt('/workers/DLM-2026-000001');
    await user.click(await screen.findByRole('button', { name: 'Save Worker 1' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'PUT /saved/DLM-2026-000001')).toBe(true));
    await user.click(screen.getByRole('button', { name: 'Add Worker 1 to compare' }));
    expect(await screen.findByRole('complementary', { name: 'Workers to compare' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Worker 1 from compare', pressed: true })).toBeInTheDocument();
    expect(pathname()).toBe('/workers/DLM-2026-000001');
  });
});

describe('toast with Undo (feature 17) and haptics (feature 50)', () => {
  function Demo({ onUndo }) {
    const toast = useToast();
    return <button type="button" onClick={() => toast.show({ title: 'Skill removed', action: { label: 'Undo', onClick: onUndo } })}>Remove</button>;
  }

  test('a toast can carry one action; pressing it runs the action and closes the toast', async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    render(<ToastProvider><Demo onUndo={onUndo} /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Skill removed')).toBeNull();
  });

  test('a toast with an action stays longer (7 s) than a plain one (4 s)', async () => {
    vi.useFakeTimers();
    render(<ToastProvider><Demo onUndo={() => {}} /></ToastProvider>);
    await act(async () => { screen.getByRole('button', { name: 'Remove' }).click(); });
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('Skill removed')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(2500); });
    expect(screen.queryByText('Skill removed')).toBeNull();
  });

  test('buzz: vibrates only where it exists, and never with reduced motion', () => {
    expect(buzz()).toBe(false); // no vibration motor here
    navigator.vibrate = vi.fn(() => true);
    expect(buzz(20)).toBe(true);
    expect(navigator.vibrate).toHaveBeenCalledWith(20);
    window.matchMedia = () => ({ matches: true });
    expect(buzz()).toBe(false);
    delete window.matchMedia;
    navigator.vibrate = () => { throw new Error('not allowed'); };
    expect(buzz()).toBe(false);
  });
});
