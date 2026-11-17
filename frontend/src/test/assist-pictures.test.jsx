// Batch 5, stage 3: the language chooser's own 🔊, picture choices that stay real radio groups, and the
// help row on the onboarding forms. Speech features are faked (speechMocks.js).
import { afterEach, describe, test, expect } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSettings, setSettings } from '../features/assist/settingsStore';
import { LANGUAGES } from '../i18n/languages';
import { mockApi, me, onboarding, PROFILE } from './mockApi';
import { renderAt } from './renderApp';
import { VOICES, installSpeech, lastRecognition, uninstallSpeech } from './speechMocks';

afterEach(() => uninstallSpeech());

const ABOUT_DONE = { about: true, work: false, skills: false };
const workerAt = (step, extra = {}) => mockApi({
  'GET /auth/me': me('worker'),
  'GET /workers/me/onboarding': onboarding(step === 'about' ? { about: false, work: false, skills: false } : ABOUT_DONE),
  'GET /workers/me': step === 'about' ? { status: 404, data: {} } : { status: 200, data: { ...PROFILE, occupation: '', category: null, experienceYears: null, skills: [] } },
  'GET /workers/me/skills': { status: 200, data: { skills: [] } },
  ...extra,
});

describe('language chooser: each card can be heard in its own language', () => {
  test('three Listen buttons; Roman Urdu is spoken in Urdu; choosing a language prepares the "read aloud?" question', async () => {
    const synth = installSpeech({ voices: [VOICES.en, VOICES.ur] });
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/', { language: null });
    const user = userEvent.setup();
    for (const l of LANGUAGES) expect(await screen.findByRole('button', { name: l.chooserListenLabel })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sunein: Roman Urdu' }));
    await waitFor(() => expect(synth.spoken).toHaveLength(1));
    expect(synth.last.text).toBe('رومن اردو کے لیے یہاں دبائیں۔');
    expect(synth.last.voice.lang).toBe('ur-PK');
    await user.click(screen.getByRole('button', { name: 'Listen: English' }));
    await waitFor(() => expect(synth.last.text).toBe('Press here for English.'));
    expect(getSettings().offerPending).toBe(false);
    await user.click(screen.getByRole('button', { name: /^English/ }));
    expect(getSettings().offerPending).toBe(true);
  });

  test('a device without an Urdu voice says so on the card, in that language', async () => {
    installSpeech({ voices: [VOICES.en] });
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/', { language: null });
    await userEvent.setup().click(await screen.findByRole('button', { name: 'سنیں: اردو' }));
    expect(await screen.findByText('اس آلے میں اردو آواز نہیں ہے۔')).toBeInTheDocument();
  });
});

describe('picture choices (D-033): real radio groups, each card can be heard', () => {
  test('the trade is a group of picture cards with radios; arrow keys still move the choice; a card says its name', async () => {
    const synth = installSpeech({ voices: [VOICES.en] });
    workerAt('work');
    renderAt('/onboarding/work');
    const user = userEvent.setup();
    await screen.findByRole('radio', { name: 'Electrical & Solar' }); // the trades come from the API
    const trade = screen.getByRole('group', { name: /^Main trade/ });
    const radios = within(trade).getAllByRole('radio');
    expect(radios).toHaveLength(3); // the three test categories
    expect(trade.querySelectorAll('svg[data-art]')).toHaveLength(3); // each card has its drawing
    await user.click(within(trade).getByRole('radio', { name: 'Electrical & Solar' }));
    await user.keyboard('{ArrowRight}');
    expect(within(trade).getByRole('radio', { name: 'Plumbing & Sanitary' })).toBeChecked();
    await user.click(within(trade).getByRole('button', { name: 'Listen: Domestic Work' }));
    await waitFor(() => expect(synth.last?.text).toBe('Domestic work: cleaning, cooking and help in the home.'));
  });

  test('availability: three picture cards with icon and word (never colour alone)', async () => {
    installSpeech({ voices: [VOICES.en] });
    workerAt('work');
    renderAt('/onboarding/work');
    const group = await screen.findByRole('group', { name: 'Availability' });
    const radios = within(group).getAllByRole('radio');
    expect(radios.map((r) => r.closest('label').textContent)).toEqual(['Available', 'Busy', 'Offline']);
    expect(group.querySelectorAll('label svg')).toHaveLength(3);
    expect(within(group).getByRole('radio', { name: 'Available' })).toBeChecked();
    expect(within(group).getByRole('button', { name: 'Listen: Busy' })).toBeInTheDocument();
  });

  test('a device with no voice for the language says so under the pictures', async () => {
    installSpeech({ voices: [] });
    workerAt('work');
    renderAt('/onboarding/work');
    const group = await screen.findByRole('group', { name: 'Availability' });
    await userEvent.setup().click(within(group).getByRole('button', { name: 'Listen: Offline' }));
    expect(await within(group).findByText(/The names are written on the pictures/)).toBeInTheDocument();
  });
});

describe('onboarding forms: help everywhere, voice where it is allowed', () => {
  test('About you: every field can be heard; the CNIC can never be spoken', async () => {
    installSpeech({ voices: [VOICES.en] });
    workerAt('about');
    renderAt('/onboarding/about');
    await screen.findByRole('heading', { level: 1, name: 'About you' });
    // the form's own buttons (Batch 6B: the footer has its own 🔊 for "Install this app")
    const form = within(screen.getByRole('main'));
    expect(form.getAllByRole('button', { name: /^Listen: / })).toHaveLength(8);
    expect(form.getByRole('button', { name: /^Listen: CNIC/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Speak: CNIC/ })).toBeNull();
    expect(form.getAllByRole('button', { name: /^Speak: / })).toHaveLength(7);
  });

  test('years of experience can be said as a word ("paanch saal" -> 5)', async () => {
    setSettings({ noticeAccepted: true });
    installSpeech({ voices: [VOICES.en] });
    workerAt('work');
    renderAt('/onboarding/work');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^Speak: Years of experience/ }));
    lastRecognition().say('paanch saal');
    expect(screen.getByRole('textbox', { name: /^Years of experience/ })).toHaveValue('5');
  });

  test('a daily rate said in Urdu words goes through the rupee mask', async () => {
    setSettings({ noticeAccepted: true });
    installSpeech({ voices: [VOICES.en] });
    workerAt('work');
    renderAt('/onboarding/work');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^Speak: Rate per day/ }));
    lastRecognition().say('چار ہزار پانچ سو');
    expect(screen.getByRole('textbox', { name: /^Rate per day/ })).toHaveValue('4,500');
  });
});
