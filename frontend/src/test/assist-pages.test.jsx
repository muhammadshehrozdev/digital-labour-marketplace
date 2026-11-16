// Batch 5, stage 4: page help, the Sound menu, auto-read, the one-time "read aloud?" question,
// notifications that can be heard, the Help Centre guides, the voice check page and the search filters.
// Speech features are faked (speechMocks.js); nothing makes a sound.
import { afterEach, describe, test, expect } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSettings, setSettings, SETTINGS_KEY } from '../features/assist/settingsStore';
import { markInteracted, resetInteraction } from '../features/assist/interaction';
import { pageHelpName } from '../features/assist/pageHelp';
import ur from '../i18n/dictionaries/ur';
import urLatn from '../i18n/dictionaries/ur-Latn';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt } from './renderApp';
import { VOICES, installSpeech, uninstallSpeech } from './speechMocks';

afterEach(() => {
  uninstallSpeech();
  resetInteraction();
});

const NOT_LOGGED_IN = { 'GET /auth/me': { status: 401, data: {} } };
const WORKER = me('worker', { _id: 'w1' });
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': WORKER,
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /workers/me/full': full(PROFILE),
  'GET /notifications/unread-count': { status: 200, data: { unread: 1 } },
  ...extra,
});

describe('page help: the round 🔊 in the same corner of every in-scope page (D-033)', () => {
  test('which pages have it: worker and customer pages yes, admin and developer pages no', () => {
    expect(pageHelpName('/')).toBe('landing');
    expect(pageHelpName('/onboarding/work')).toBe('onboardingWork');
    expect(pageHelpName('/workers/DLM-2026-000001')).toBe('workerProfile');
    expect(pageHelpName('/worker/profile/edit/')).toBe('profileEdit');
    expect(pageHelpName('/admin')).toBeNull();
    expect(pageHelpName('/admin/evidence')).toBeNull();
    expect(pageHelpName('/dev/styleguide')).toBeNull();
  });

  test('it says what the page is for, shows the same text, and stops pulsing after the first visit', async () => {
    const synth = installSpeech({ voices: [VOICES.en] });
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    const user = userEvent.setup();
    const button = await screen.findByRole('button', { name: 'Help for this page' });
    expect(button.className).toMatch(/pulse/);
    await user.click(button);
    expect(screen.getByRole('group', { name: 'Help for this page' })).toHaveTextContent('Here you log in.');
    await waitFor(() => expect(synth.last?.text).toBe('Here you log in. Type your email and password, then press the green button below.'));
    await user.click(screen.getByRole('link', { name: 'Create an account' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();
    expect(getSettings().seenPages).toContain('login');
  });

  test('not on admin pages', async () => {
    mockApi({ 'GET /auth/me': me('admin'), 'GET /admin/stats': { status: 200, data: {} } });
    renderAt('/admin');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('button', { name: 'Help for this page' })).toBeNull();
  });
});

describe('the Sound menu (D-033)', () => {
  test('two switches saved on this device: hide the buttons, read aloud by itself', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    const user = userEvent.setup();
    expect(await screen.findByRole('button', { name: 'Listen: Email' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sound settings' }));
    const show = screen.getByRole('switch', { name: 'Show the Listen and Speak buttons' });
    const auto = screen.getByRole('switch', { name: 'Read aloud by itself' });
    expect(show).toHaveAttribute('aria-checked', 'true');
    expect(auto).toHaveAttribute('aria-checked', 'false');
    await user.click(show);
    expect(screen.queryByRole('button', { name: 'Listen: Email' })).toBeNull();
    expect(screen.getByRole('textbox', { name: /Email/ })).toBeInTheDocument(); // the form still works
    await user.click(auto);
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY))).toMatchObject({ showButtons: false, autoRead: true });
    expect(screen.getByRole('link', { name: 'Check sound and voice on this device' })).toHaveAttribute('href', '/voice-check');
  });
});

describe('auto-read (off by default, D-033)', () => {
  test('never on first load: nothing is spoken before the person has touched the page', async () => {
    setSettings({ autoRead: true });
    const synth = installSpeech({ voices: [VOICES.en] });
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    await new Promise((r) => { setTimeout(r, 600); });
    expect(synth.spoken).toHaveLength(0);
  });

  test('after a touch: the page help on arrival, and a box\'s help when it gets focus; typing stops it', async () => {
    setSettings({ autoRead: true });
    markInteracted();
    const synth = installSpeech({ voices: [VOICES.en] });
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    await waitFor(() => expect(synth.last?.text).toMatch(/^Here you log in/));
    const email = screen.getByRole('textbox', { name: /Email/ });
    act(() => { email.focus(); });
    await waitFor(() => expect(synth.last?.text).toBe('Type the email address you used when you made your account.'));
    const cancelled = synth.cancelled;
    fireEvent.input(email, { target: { value: 'a' } });
    expect(synth.cancelled).toBeGreaterThan(cancelled);
  });

  test('the "read aloud?" question comes once, right after the language is chosen', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/', { language: null });
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^English/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Should the website read aloud?' });
    expect(within(dialog).getByRole('button', { name: 'Listen' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Yes, read aloud' }));
    expect(getSettings()).toMatchObject({ autoRead: true, autoReadOffered: true, offerPending: false });
    expect(screen.queryByRole('dialog', { name: 'Should the website read aloud?' })).toBeNull();
  });
});

describe('notifications can be heard', () => {
  const N = [{ _id: 'n1', type: 'evidence_approved', params: { skillId: 'elec_wiring', skillName: 'House wiring' }, read: false, createdAt: '2026-11-10T10:00:00Z' }];

  test('English: title and text are read', async () => {
    localStorage.setItem('dlm.tour.w1', 'done');
    const synth = installSpeech({ voices: [VOICES.en] });
    mockApi(workerRoutes({ 'GET /notifications': { status: 200, data: { notifications: N, unread: 1, page: 1, limit: 20, total: 1 } } }));
    renderAt('/notifications');
    const listen = await screen.findByRole('button', { name: /^Listen: Proof approved/ });
    await userEvent.setup().click(listen);
    await waitFor(() => expect(synth.last?.text).toMatch(/^Proof approved for House wiring\. /));
  });

  test('Roman Urdu: the Urdu voice reads the URDU sentences', async () => {
    localStorage.setItem('dlm.tour.w1', 'done');
    const synth = installSpeech({ voices: [VOICES.ur] });
    mockApi(workerRoutes({ 'GET /notifications': { status: 200, data: { notifications: N, unread: 1, page: 1, limit: 20, total: 1 } } }));
    renderAt('/notifications', { language: 'ur-Latn' });
    const listen = await screen.findByRole('button', { name: new RegExp(`^${urLatn.assist.listenTo.split(':')[0]}: `) });
    await userEvent.setup().click(listen);
    await waitFor(() => expect(synth.spoken).toHaveLength(1));
    expect(synth.last.voice.lang).toBe('ur-PK');
    expect(synth.last.text).toContain(ur.workerx.notifications.types.evidence_approved.text);
    expect(synth.last.text).not.toContain(urLatn.workerx.notifications.types.evidence_approved.text);
  });
});

describe('Help Centre and voice check', () => {
  test('the Help Centre explains listening and voice typing, keeps the voice notice, and every guide can be heard', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/help');
    expect(await screen.findByRole('heading', { level: 3, name: 'Listen to the help' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Speak instead of typing' })).toBeInTheDocument();
    expect(screen.getByText(/may send your audio to an online service/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Listen: Speak instead of typing' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Check sound and voice on this device' })).toHaveAttribute('href', '/voice-check');
  });

  test('voice check: says in plain words what works on this device', async () => {
    installSpeech({ voices: [VOICES.en], recognition: false });
    mockApi(NOT_LOGGED_IN);
    renderAt('/voice-check');
    expect(await screen.findByRole('heading', { level: 1, name: 'Check sound and voice' })).toBeInTheDocument();
    expect(await screen.findByText('Help in Urdu: no voice yet, so the help is shown as text.')).toBeInTheDocument();
    expect(screen.getByText("Help in English: works, with this device's voice.")).toBeInTheDocument();
    expect(screen.getByText('Voice typing: not available in this browser. Typing always works.')).toBeInTheDocument();
    expect(screen.getByText('English (US)')).toBeInTheDocument();
    expect(screen.getByText('Recorded help from the team: 0 in Urdu, 0 in English.')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Play an Urdu test' }));
    expect(await screen.findByText('This device could not speak Urdu.')).toBeInTheDocument();
  });
});

describe('customer search: picture filters and voice search', () => {
  test('trade and availability are picture groups with "All" first; the search box can be spoken', async () => {
    mockApi({
      'GET /auth/me': me('customer', { _id: 'c1' }),
      'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0, sort: 'updated' } },
      'GET /saved/ids': { status: 200, data: { ids: [], max: 100 } },
    });
    renderAt('/find');
    await screen.findByRole('radio', { name: 'Electrical & Solar' });
    const trade = screen.getAllByRole('group', { name: 'Trade' })[0];
    expect(within(trade).getAllByRole('radio')[0]).toHaveAccessibleName('All trades');
    expect(within(trade).getByRole('radio', { name: 'All trades' })).toBeChecked();
    expect(within(trade).getByRole('button', { name: 'Listen: Electrical & Solar' })).toBeInTheDocument();
    const availability = screen.getAllByRole('group', { name: 'Availability' })[0];
    expect(within(availability).getAllByRole('radio').map((r) => r.closest('label').textContent)).toEqual(['Any', 'Available', 'Busy', 'Offline']);
    expect(screen.getByRole('button', { name: /^Speak: Search/ })).toBeInTheDocument();
  });
});
