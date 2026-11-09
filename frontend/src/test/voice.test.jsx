// Batch 3, Part 2.2: voice typing. A fake SpeechRecognition replaces the browser's, so every
// error code and the language choice can be tested without a microphone.
import { afterEach, describe, test, expect } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillsEditor from '../features/skills/SkillsEditor';
import { ToastProvider } from '../components/ui';
import { LanguageProvider } from '../i18n';
import { SPEECH_ERROR_CODES, voiceErrorKey } from '../features/skills/useVoiceTyping';
import en from '../i18n/dictionaries/en';
import ur from '../i18n/dictionaries/ur';
import { mockApi } from './mockApi';

let instances = [];
class FakeRecognition {
  constructor() {
    this.started = false;
    this.stopped = false;
    instances.push(this);
  }
  start() { this.started = true; }
  stop() {
    this.stopped = true;
    // like Chrome: stop() ends with "aborted" or simply "end"
    this.onerror?.({ error: 'aborted' });
    this.onend?.();
  }
  abort() { this.onend?.(); }
}
const last = () => instances[instances.length - 1];

function setup({ language = 'en', supported = true } = {}) {
  instances = [];
  if (supported) window.webkitSpeechRecognition = FakeRecognition;
  const calls = mockApi({
    'GET /workers/me/skills': { status: 200, data: { skills: [], onboarding: null } },
    'POST /workers/me/skills/extract': { status: 200, data: { skills: [], categories: [], noSkillReason: 'no_trade_words' } },
  });
  render(
    <LanguageProvider initialLanguage={language}>
      <ToastProvider><SkillsEditor /></ToastProvider>
    </LanguageProvider>
  );
  return { calls, user: userEvent.setup() };
}

afterEach(() => {
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
});

describe('voice typing (Web Speech API)', () => {
  test('without SpeechRecognition there is no voice button, but the keyboard alternatives are still offered', async () => {
    setup({ supported: false });
    await screen.findByRole('heading', { name: 'Describe your work' });
    expect(screen.queryByRole('button', { name: 'Use voice typing' })).not.toBeInTheDocument();
    expect(screen.getByText(/Gboard/)).toBeInTheDocument();
    expect(screen.getByText('Win + H').tagName).toBe('STRONG');
    expect(screen.queryByText(/Works best in Google Chrome/)).not.toBeInTheDocument();
  });

  test('with SpeechRecognition: the button, "works best in Chrome", the privacy notice (M2-13) and the alternatives', async () => {
    setup();
    expect(await screen.findByRole('button', { name: 'Use voice typing' })).toBeInTheDocument();
    expect(screen.getByText(/Works best in Google Chrome on desktop or Android/)).toBeInTheDocument();
    expect(screen.getByText(/may send your audio to an online service/)).toBeInTheDocument();
    expect(screen.getByText(/Gboard/)).toBeInTheDocument();
  });

  test.each([
    ['ur', 'ur-PK'],
    ['en', 'en-US'],
    ['ur-Latn', 'en-US'],
  ])('website language %s -> speech language %s', async (language, speechLang) => {
    const { user } = setup({ language });
    const start = await screen.findByRole('button', { name: { ur: 'بول کر لکھیں', en: 'Use voice typing', 'ur-Latn': 'Bol kar likhein' }[language] });
    await user.click(start);
    expect(last().lang).toBe(speechLang);
    expect(last().started).toBe(true);
  });

  test('what was said is added to the text box, and the request says inputMode "voice"', async () => {
    const { user, calls } = setup();
    await user.click(await screen.findByRole('button', { name: 'Use voice typing' }));
    expect(screen.getByRole('button', { name: 'Stop voice typing' })).toHaveAttribute('aria-pressed', 'true');
    act(() => {
      last().onresult({ results: [[{ transcript: 'main wiring ka kaam karta hoon' }]] });
      last().onend();
    });
    expect(screen.getByRole('textbox', { name: /In your own words/ })).toHaveValue('main wiring ka kaam karta hoon');
    await user.click(screen.getByRole('button', { name: 'Find my skills' }));
    const extract = calls.find((c) => c.key === 'POST /workers/me/skills/extract');
    expect(extract.body.inputMode).toBe('voice');
  });

  test.each(SPEECH_ERROR_CODES.filter((c) => c !== 'aborted'))('error "%s" shows its own message, not a generic one', async (code) => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Use voice typing' }));
    act(() => {
      last().onerror({ error: code });
      last().onend();
    });
    const expected = en.voice.errors[code].replace('{language}', 'English');
    const alert = await screen.findByText(expected);
    expect(alert).toBeInTheDocument();
    expect(screen.queryByText(en.voice.errors.other)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use voice typing' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('"language-not-supported" in Urdu names the language and suggests English or Roman Urdu', async () => {
    const { user } = setup({ language: 'ur' });
    await user.click(await screen.findByRole('button', { name: 'بول کر لکھیں' }));
    act(() => {
      last().onerror({ error: 'language-not-supported' });
      last().onend();
    });
    expect(await screen.findByText(ur.voice.errors['language-not-supported'].replace('{language}', 'اردو'))).toBeInTheDocument();
  });

  test('pressing Stop ends with "aborted", which is not shown as an error', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Use voice typing' }));
    await user.click(screen.getByRole('button', { name: 'Stop voice typing' }));
    expect(last().stopped).toBe(true);
    expect(screen.queryByText(en.voice.errors.aborted)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use voice typing' })).toBeInTheDocument();
  });

  test('an "aborted" the user did not cause is explained; an unknown code gets the general message', async () => {
    const { user } = setup();
    await user.click(await screen.findByRole('button', { name: 'Use voice typing' }));
    act(() => {
      last().onerror({ error: 'aborted' });
      last().onend();
    });
    expect(await screen.findByText(en.voice.errors.aborted)).toBeInTheDocument();
    expect(voiceErrorKey('something-new')).toBe('voice.errors.other');
  });

  test('every error code has a message in all three languages', async () => {
    const { default: urLatn } = await import('../i18n/dictionaries/ur-Latn');
    for (const dict of [en, ur, urLatn]) {
      for (const code of [...SPEECH_ERROR_CODES, 'other']) expect(dict.voice.errors[code], code).toBeTruthy();
    }
    expect(within(document.body).queryByRole('alert')).toBeNull();
  });
});
