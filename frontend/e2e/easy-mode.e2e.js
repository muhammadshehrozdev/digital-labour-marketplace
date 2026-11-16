// Batch 5, "Listen, Speak, See" in a real browser (Chromium). The container has no sound and no
// microphone, so the browser's speech features are replaced by fakes before any page script runs:
// every spoken text is recorded in window.__spoken, and window.__say('...') plays the part of the
// browser's speech recognition. Synthetic accounts in the e2e database only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LANGS, T, setLanguage, setMode, startsWith, uniqueEmail, watchConsole } from './helpers.js';

const en = T('en');
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// voices: the device voices the fake offers (none, English, Urdu)
async function fakeSpeech(page, voices = [{ name: 'English (US)', lang: 'en-US' }]) {
  await page.addInitScript((list) => {
    window.__spoken = [];
    const synth = {
      getVoices: () => list,
      addEventListener() {},
      removeEventListener() {},
      speak(u) { window.__spoken.push({ text: u.text, lang: u.lang }); setTimeout(() => u.onend?.(), 30); },
      cancel() {},
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    class FakeRecognition {
      constructor() { window.__recognition = this; }
      start() { this.started = true; }
      stop() { this.onend?.(); }
      abort() { this.onend?.(); }
    }
    window.webkitSpeechRecognition = FakeRecognition;
    window.SpeechRecognition = FakeRecognition;
    window.__say = (text) => {
      const r = window.__recognition;
      r.onresult?.({ results: [[{ transcript: text }]] });
      r.onend?.();
    };
  }, voices);
}
const spoken = (page) => page.evaluate(() => window.__spoken.map((s) => s.text));

test('register by voice: the name is spoken, written, read back; then the trade is chosen by picture', async ({ page }) => {
  await setLanguage(page, 'en');
  await fakeSpeech(page);
  const browserConsole = watchConsole(page);
  await page.goto('/register');
  await page.locator('label:has(input[name=role][value=worker])').click();
  // 🎤 on the name: the one-time notice first
  await page.getByRole('button', { name: `${en('assist.speak')}: ${en('auth.register.fullName')}` }).click();
  const notice = page.getByRole('dialog', { name: en('assist.noticeTitle') });
  await expect(notice).toContainText(en('voice.notice'));
  await notice.getByRole('button', { name: en('assist.noticeAccept') }).click();
  await page.evaluate(() => window.__say('Bilal Ahmed synthetic'));
  const name = page.getByRole('textbox', { name: startsWith(en('auth.register.fullName')) });
  await expect(name).toHaveValue('Bilal Ahmed synthetic');
  await expect.poll(() => spoken(page)).toContain(en('assist.wrote', { value: 'Bilal Ahmed synthetic' }));
  // no 🎤 on email or password
  await expect(page.getByRole('button', { name: `${en('assist.speak')}: ${en('auth.register.email')}` })).toHaveCount(0);
  await expect(page.getByRole('button', { name: startsWith(`${en('assist.speak')}: ${en('password.label')}`) })).toHaveCount(0);
  // the mobile number said in words goes through the mask
  await page.getByRole('button', { name: `${en('assist.speak')}: ${en('auth.register.mobile')}` }).click();
  await page.evaluate(() => window.__say('zero three zero zero one two three four five six seven'));
  await expect(page.getByRole('textbox', { name: startsWith(en('auth.register.mobile')) })).toHaveValue('0300-1234567');
  await page.getByRole('textbox', { name: startsWith(en('auth.register.email')) }).fill(uniqueEmail('e2e.voice'));
  await page.locator('input[type=password]').fill('local e2e pass phrase');
  await page.getByRole('button', { name: en('auth.register.submit') }).click();
  await expect(page).toHaveURL(/\/onboarding\/about$/);

  // step 1, then the trade as a picture; its 🔊 says its name
  await page.getByRole('textbox', { name: startsWith(en('about.city')) }).fill('Rawalpindi');
  await page.getByRole('button', { name: en('onboarding.saveContinue') }).click();
  await expect(page).toHaveURL(/\/onboarding\/work$/);
  const trade = page.getByRole('group', { name: startsWith(en('work.trade')) });
  await trade.getByRole('button', { name: /^Listen: Electrical/ }).click();
  await expect.poll(() => spoken(page)).toContain(en('help.option.trade.electrical_solar'));
  await page.locator('label:has(input[name=category][value=electrical_solar])').click();
  await expect(trade.getByRole('radio', { name: /Electrical/ })).toBeChecked();
  // years by voice, as a word
  await page.getByRole('button', { name: startsWith(`${en('assist.speak')}: ${en('work.experience')}`) }).click();
  await page.evaluate(() => window.__say('five years'));
  await expect(page.getByRole('textbox', { name: startsWith(en('work.experience')) })).toHaveValue('5');
  await page.getByRole('textbox', { name: startsWith(en('work.daily')) }).fill('4000');
  await page.getByRole('button', { name: en('onboarding.saveContinue') }).click();
  await expect(page).toHaveURL(/\/onboarding\/skills$/);
  browserConsole.assertClean();
});

test('Listen: the help is heard and shown; without a voice for the language it is shown with a note', async ({ browser }) => {
  for (const [voices, expectNote] of [[[{ name: 'English (US)', lang: 'en-US' }], false], [[], true]]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setLanguage(page, 'en');
    await fakeSpeech(page, voices);
    await page.goto('/login');
    await page.getByRole('button', { name: `${en('assist.listen')}: ${en('auth.login.email')}` }).click();
    const bubble = page.getByRole('group', { name: en('assist.bubbleLabel', { field: en('auth.login.email') }) });
    await expect(bubble).toContainText(en('help.field.login.email'));
    if (expectNote) {
      await expect(bubble).toContainText(en('assist.noVoice'));
      expect(await spoken(page)).toEqual([]);
    } else {
      await expect.poll(() => spoken(page)).toContain(en('help.field.login.email'));
    }
    // the page help in the corner
    await page.getByRole('button', { name: en('assist.pageHelp') }).click();
    await expect(page.getByRole('group', { name: en('assist.pageHelp') })).toContainText(en('help.screen.login'));
    await context.close();
  }
});

test('Roman Urdu: the bubble is in Roman Urdu, the Urdu voice says the Urdu text', async ({ page }) => {
  const rl = T('ur-Latn');
  const ur = T('ur');
  await setLanguage(page, 'ur-Latn');
  await fakeSpeech(page, [{ name: 'Urdu', lang: 'ur-PK' }, { name: 'English (US)', lang: 'en-US' }]);
  await page.goto('/login');
  await page.getByRole('button', { name: `${rl('assist.listen')}: ${rl('auth.login.email')}` }).click();
  await expect(page.getByRole('group', { name: rl('assist.bubbleLabel', { field: rl('auth.login.email') }) })).toContainText(rl('help.field.login.email'));
  await expect.poll(() => spoken(page)).toContain(ur('help.field.login.email'));
  const said = await page.evaluate(() => window.__spoken.at(-1));
  expect(said.lang).toBe('ur-PK');
});

test('offline: Speak says that voice typing needs the internet, and typing still works', async ({ page, context }) => {
  await setLanguage(page, 'en');
  await fakeSpeech(page);
  await page.addInitScript(() => localStorage.setItem('dlm.assist.v1', JSON.stringify({ noticeAccepted: true })));
  await page.goto('/register?role=worker');
  await context.setOffline(true);
  await page.getByRole('button', { name: `${en('assist.speak')}: ${en('auth.register.fullName')}` }).click();
  await expect(page.getByText(en('assist.offlineMic'))).toBeVisible();
  const name = page.getByRole('textbox', { name: startsWith(en('auth.register.fullName')) });
  await name.fill('Typed name');
  await expect(name).toHaveValue('Typed name');
  await context.setOffline(false);
});

// axe on the changed screens, with the new parts open (help bubble, Sound menu, picture cards)
for (const lang of LANGS) for (const mode of ['light', 'dark']) {
  test(`axe: Listen, Speak, See screens have no serious or critical problems in ${lang}, ${mode} mode`, async ({ page }) => {
    test.setTimeout(120_000);
    const t = T(lang);
    await setLanguage(page, lang);
    await setMode(page, mode);
    await fakeSpeech(page, []);
    const problems = [];
    const axe = async (label) => {
      const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      problems.push(...result.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
        .map((v) => `${lang} ${mode} ${label}: ${v.id} ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
    };
    await page.goto('/register?role=worker');
    await page.getByRole('button', { name: `${t('assist.listen')}: ${t('auth.register.fullName')}` }).click();
    await page.getByRole('button', { name: t('assist.soundMenu') }).click();
    await page.getByRole('button', { name: t('assist.pageHelp') }).click();
    await axe('register with bubble, Sound menu and page help open');
    await page.goto('/voice-check');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await axe('voice check');
    await page.goto('/help');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await axe('help centre');
    expect(problems).toEqual([]);
  });
}
