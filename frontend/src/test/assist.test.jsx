// Batch 5 core: Listen, Speak, See (D-033 to D-036). The browser's speech features are faked
// (speechMocks.js): no sound is made and no microphone is opened.
import { afterEach, describe, test, expect } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { audioLangFor, pickVoice, scriptOf } from '../features/assist/voices';
import { clipUrl, getAudioState, play } from '../features/assist/audio';
import { DEFAULT_SETTINGS, SETTINGS_KEY, getSettings, reloadSettings, setSettings } from '../features/assist/settingsStore';
import { speakModeFor } from '../features/assist/assistRules';
import { digitClips } from '../features/assist/useSay';
import ur from '../i18n/dictionaries/ur';
import urLatn from '../i18n/dictionaries/ur-Latn';
import { mockApi } from './mockApi';
import { renderAt } from './renderApp';
import { FakeRecognition, VOICES, audios, installSpeech, lastRecognition, recognitions, uninstallSpeech } from './speechMocks';

const NOT_LOGGED_IN = { 'GET /auth/me': { status: 401, data: {} } };

afterEach(() => {
  uninstallSpeech();
});

describe('which voice speaks (D-034)', () => {
  test('Roman Urdu is spoken with the Urdu audio; English with English', () => {
    expect(audioLangFor('ur-Latn')).toBe('ur');
    expect(audioLangFor('ur')).toBe('ur');
    expect(audioLangFor('en')).toBe('en');
  });

  test('an Urdu text gets an Urdu voice, never an English one', () => {
    const voices = [{ name: 'US', lang: 'en-US' }, { name: 'Pak', lang: 'ur_PK' }, { name: 'In', lang: 'ur-IN' }];
    expect(pickVoice(voices, 'ur').name).toBe('Pak');
    expect(pickVoice([{ name: 'US', lang: 'en-US' }], 'ur')).toBeNull();
    expect(pickVoice([{ name: 'GB', lang: 'en-GB' }, { name: 'US', lang: 'en-US' }], 'en').name).toBe('GB');
    expect(pickVoice([], 'en')).toBeNull();
    expect(scriptOf('بلال احمد')).toBe('ur');
    expect(scriptOf('Bilal Ahmed')).toBe('en');
  });
});

describe('where the help sound comes from: recorded clip, then device voice, then nothing (D-034)', () => {
  const clips = { ur: ['help-field-register-name.webm', 'digit-0.webm'], en: [] };

  test('a clip file name is the key with dashes; a missing clip is never requested', () => {
    expect(clipUrl('ur', 'help.field.register.name', clips)).toBe('/audio/help/ur/help-field-register-name.webm');
    expect(clipUrl('en', 'help.field.register.name', clips)).toBeNull();
    expect(clipUrl('ur', 'help.field.register.email', clips)).toBeNull();
    // digits are read from clips only when all ten were recorded
    expect(digitClips('ur', clips)).toBeNull();
    const ten = { ur: Array.from({ length: 10 }, (_, d) => `digit-${d}.mp3`) };
    expect(digitClips('ur', ten)[7]).toBe('/audio/help/ur/digit-7.mp3');
  });

  test('1. a recorded clip plays first; the device voice is not used', async () => {
    const synth = installSpeech({ voices: [VOICES.ur] });
    expect(await play({ id: 'a', clip: '/audio/help/ur/x.webm', text: 'متن', lang: 'ur' })).toBe('clip');
    expect(audios[0].src).toBe('/audio/help/ur/x.webm');
    expect(synth.spoken).toHaveLength(0);
    expect(getAudioState().playingId).toBe('a');
  });

  test('2. if the clip cannot play, a device voice for that language speaks, a little slower', async () => {
    const synth = installSpeech({ voices: [VOICES.en, VOICES.ur], audio: 'fail' });
    expect(await play({ id: 'b', clip: '/audio/help/ur/x.webm', text: 'یہاں اپنا نام بتائیں', lang: 'ur' })).toBe('voice');
    expect(synth.last.text).toBe('یہاں اپنا نام بتائیں');
    expect(synth.last.voice.lang).toBe('ur-PK');
    expect(synth.last.rate).toBe(0.9);
    act(() => synth.finish());
    expect(getAudioState().playingId).toBeNull();
  });

  test('voices that arrive late (Chrome) are still used', async () => {
    const synth = installSpeech({ voices: [] });
    const result = play({ id: 'c', text: 'Hello', lang: 'en' });
    synth.setVoices([VOICES.en]);
    expect(await result).toBe('voice');
  });

  test('3. no clip and no voice for the language: "none" (the help is shown on screen)', async () => {
    const synth = installSpeech({ voices: [VOICES.en] });
    expect(await play({ id: 'd', text: 'یہاں اپنا نام بتائیں', lang: 'ur' })).toBe('none');
    expect(synth.spoken).toHaveLength(0);
  });
});

describe('sound settings of this device (D-033)', () => {
  test('defaults: buttons on, auto-read off; saved under one versioned key; bad data is ignored', () => {
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({ showButtons: true, autoRead: false });
    setSettings({ autoRead: true });
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_KEY))).toMatchObject({ autoRead: true, showButtons: true });
    window.localStorage.setItem(SETTINGS_KEY, '{ broken');
    reloadSettings();
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ showButtons: 'yes', autoRead: true, seenPages: 'x' }));
    reloadSettings();
    expect(getSettings()).toMatchObject({ showButtons: true, autoRead: true, seenPages: [] });
  });
});

describe('never voice typing for password, CNIC or email (D-035)', () => {
  test('the rule itself, whatever a page asks for', () => {
    expect(speakModeFor({ speak: 'text', inputType: 'email' })).toBeNull();
    expect(speakModeFor({ speak: 'text', inputType: 'password' })).toBeNull();
    expect(speakModeFor({ speak: 'digits', mask: 'cnic' })).toBeNull();
    expect(speakModeFor({ speak: 'text', secret: true })).toBeNull();
    expect(speakModeFor({ speak: 'digits', mask: 'mobile' })).toBe('digits');
    expect(speakModeFor({ speak: 'text', inputType: 'text' })).toBe('text');
    expect(speakModeFor({ speak: 'loud' })).toBeNull();
  });

  test('Register: every field can be heard; only name and mobile can be spoken', async () => {
    installSpeech({ voices: [VOICES.en] });
    mockApi(NOT_LOGGED_IN);
    renderAt('/register');
    const user = userEvent.setup();
    expect(await screen.findByRole('button', { name: 'Listen: I am here because…' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /I want to find work/ }));
    for (const field of ['Full name', 'Email', 'Mobile number', 'Password']) {
      expect(screen.getByRole('button', { name: `Listen: ${field}` })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Speak: Full name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speak: Mobile number' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Speak: Email' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Speak: Password' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Speak/ })).toHaveLength(2);
  });

  test('Login: Listen only (email and password)', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    expect(await screen.findByRole('button', { name: 'Listen: Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Listen: Password' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Speak/ })).toBeNull();
  });
});

async function registerForm(options) {
  const synth = installSpeech(options);
  mockApi(NOT_LOGGED_IN);
  renderAt('/register', { language: options?.language ?? 'en' });
  const user = userEvent.setup();
  await user.click(await screen.findByRole('radio', { name: options?.workerName ?? /I want to find work/ }));
  return { synth, user };
}

describe('Listen: the help is heard AND shown (D-034)', () => {
  test('the bubble opens with the help in large text; "playing" while it speaks; a second tap stops it', async () => {
    const { synth, user } = await registerForm({ voices: [VOICES.en] });
    const listen = screen.getByRole('button', { name: 'Listen: Full name' });
    await user.click(listen);
    const bubble = screen.getByRole('group', { name: 'Help: Full name' });
    expect(within(bubble).getByText('Say or type your full name here, for example Bilal Ahmed.')).toBeInTheDocument();
    await waitFor(() => expect(listen).toHaveAttribute('aria-pressed', 'true'));
    expect(synth.last.text).toBe('Say or type your full name here, for example Bilal Ahmed.');
    expect(screen.getByTestId('assist-live')).toHaveTextContent('Playing the help');
    await user.click(listen);
    expect(listen).toHaveAttribute('aria-pressed', 'false');
    expect(synth.cancelled).toBeGreaterThan(0);
  });

  test('a device without a voice for the language says so in the bubble (the Listen button stays)', async () => {
    const { user } = await registerForm({ voices: [] });
    await user.click(screen.getByRole('button', { name: 'Listen: Mobile number' }));
    expect(await screen.findByText('This phone or computer has no voice for this language. The help is written above.')).toBeInTheDocument();
    expect(screen.getByText(/zero three zero zero/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close the help' }));
    expect(screen.queryByRole('group', { name: /^Help/ })).toBeNull();
  });

  test('Roman Urdu: the bubble shows Roman Urdu, the Urdu voice speaks the URDU text of the same key', async () => {
    const { synth, user } = await registerForm({ voices: [VOICES.en, VOICES.ur], language: 'ur-Latn', workerName: /Mujhe kaam chahiye/ });
    await user.click(screen.getByRole('button', { name: `${urLatn.assist.listen}: ${urLatn.auth.register.fullName}` }));
    expect(await screen.findByText(urLatn.help.field.register.name)).toBeInTheDocument();
    await waitFor(() => expect(synth.spoken).toHaveLength(1));
    expect(synth.last.text).toBe(ur.help.field.register.name);
    expect(synth.last.voice.lang).toBe('ur-PK');
  });

  test('Escape stops the sound', async () => {
    const { synth, user } = await registerForm({ voices: [VOICES.en] });
    const listen = screen.getByRole('button', { name: 'Listen: Full name' });
    await user.click(listen);
    await waitFor(() => expect(listen).toHaveAttribute('aria-pressed', 'true'));
    await user.keyboard('{Escape}');
    expect(listen).toHaveAttribute('aria-pressed', 'false');
    expect(synth.cancelled).toBeGreaterThan(0);
  });
});

describe('Speak: voice typing (D-035, D-036)', () => {
  test('first use shows the notice once; the name is REPLACED, read back, and Undo brings the old one back', async () => {
    const { synth, user } = await registerForm({ voices: [VOICES.en] });
    const name = screen.getByRole('textbox', { name: /Full name/ });
    await user.type(name, 'Old name');
    await user.click(screen.getByRole('button', { name: 'Speak: Full name' }));
    const notice = screen.getByRole('dialog', { name: 'Before you use voice typing' });
    expect(within(notice).getByText(/may send your audio to an online service/)).toBeInTheDocument();
    expect(recognitions).toHaveLength(0); // nothing listens before the notice is accepted
    await user.click(within(notice).getByRole('button', { name: 'OK, use voice typing' }));
    expect(lastRecognition().started).toBe(true);
    expect(lastRecognition().lang).toBe('en-US');
    expect(screen.getByRole('button', { name: 'Speak: Full name' })).toHaveAttribute('aria-pressed', 'true');
    lastRecognition().say('Bilal Ahmed');
    expect(name).toHaveValue('Bilal Ahmed');
    await waitFor(() => expect(synth.last?.text).toBe('Written: Bilal Ahmed'));
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(name).toHaveValue('Old name');
    // the second time there is no notice
    await user.click(screen.getByRole('button', { name: 'Speak: Full name' }));
    expect(screen.queryByRole('dialog', { name: 'Before you use voice typing' })).toBeNull();
    expect(recognitions).toHaveLength(2);
  });

  test('a mobile number said in words goes through the mask; something not understood writes nothing', async () => {
    setSettings({ noticeAccepted: true });
    const { synth, user } = await registerForm({ voices: [VOICES.en] });
    const phone = screen.getByRole('textbox', { name: /Mobile number/ });
    await user.click(screen.getByRole('button', { name: 'Speak: Mobile number' }));
    lastRecognition().say('zero three zero zero one two three four five six seven');
    expect(phone).toHaveValue('0300-1234567');
    await waitFor(() => expect(synth.last?.text).toBe('Written: 0 3 0 0 1 2 3 4 5 6 7'));
    await user.click(screen.getByRole('button', { name: 'Speak: Mobile number' }));
    lastRecognition().say('zero three banana');
    expect(phone).toHaveValue('0300-1234567');
    expect(await screen.findByText('I did not understand. Please say it again, or type it.')).toBeInTheDocument();
  });

  test('one sound or microphone at a time: Listen on another field stops the microphone', async () => {
    setSettings({ noticeAccepted: true });
    const { user } = await registerForm({ voices: [VOICES.en] });
    const speak = screen.getByRole('button', { name: 'Speak: Full name' });
    await user.click(speak);
    expect(speak).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Listen: Mobile number' }));
    expect(lastRecognition().aborted).toBe(true);
    expect(speak).toHaveAttribute('aria-pressed', 'false');
    expect(getAudioState().listeningId).toBeNull();
  });

  test('no voice typing in this browser: Speak stays, explains, and typing still works', async () => {
    const { user } = await registerForm({ voices: [VOICES.en], recognition: false });
    await user.click(screen.getByRole('button', { name: 'Speak: Full name' }));
    expect(await screen.findByText(/This browser cannot do voice typing/)).toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: /Full name/ });
    await user.type(name, 'Bilal');
    expect(name).toHaveValue('Bilal');
  });

  test('offline: Speak says voice typing needs the internet', async () => {
    setSettings({ noticeAccepted: true });
    const { user } = await registerForm({ voices: [VOICES.en] });
    const online = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => false });
    try {
      await user.click(screen.getByRole('button', { name: 'Speak: Full name' }));
      expect(await screen.findByText(/Voice typing needs the internet/)).toBeInTheDocument();
      expect(recognitions).toHaveLength(0);
    } finally {
      delete window.navigator.onLine;
      if (online) Object.defineProperty(Navigator.prototype, 'onLine', online);
    }
  });

  test('a microphone problem is explained with the existing message', async () => {
    setSettings({ noticeAccepted: true });
    const { user } = await registerForm({ voices: [VOICES.en] });
    await user.click(screen.getByRole('button', { name: 'Speak: Full name' }));
    lastRecognition().fail('not-allowed');
    expect(await screen.findByText(/The microphone is blocked for this website/)).toBeInTheDocument();
  });

  test('the buttons can be switched off; the form works as before', async () => {
    setSettings({ showButtons: false });
    mockApi(NOT_LOGGED_IN);
    renderAt('/login');
    await screen.findByRole('heading', { level: 1, name: 'Log in' });
    expect(screen.queryByRole('button', { name: /^Listen/ })).toBeNull();
    expect(FakeRecognition).toBeDefined();
  });
});
