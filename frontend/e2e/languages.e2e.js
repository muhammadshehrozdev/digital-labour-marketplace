// Batch 3, Part 3 and Part 7.1: language chooser, switcher, RTL, remembered choice, saved for
// logged-in users, Urdu font only for Urdu, and the whole onboarding path in all three languages.
import { test, expect } from '@playwright/test';
import { LANGS, T, answerReadAloud, completeStep3, completeSteps1and2, registerWorker, setLanguage, startsWith, watchConsole } from './helpers.js';

const SENTENCE = {
  en: 'I have done house wiring and solar panel work for 5 years',
  ur: 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔',
  'ur-Latn': 'Main 5 saal se wiring aur solar panel ka kaam karta hoon',
};

test('first visit: the chooser; Urdu turns the whole site right-to-left and is remembered after a reload', async ({ page }) => {
  const browserConsole = watchConsole(page);
  await page.goto('/');
  const cards = page.getByRole('button', { name: /Continue in English|اردو میں جاری رکھیں|Roman Urdu mein jaari rakhein/ });
  await expect(cards).toHaveCount(3);
  await page.getByRole('button', { name: /اردو میں جاری رکھیں/ }).click();
  await answerReadAloud(page, 'ur'); // Batch 5: asked once, in the chosen language
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(T('ur')('landing.title'));
  // Mirrored layout: the logo sits on the right of the header.
  const box = await page.locator('header a[href="/"]').first().boundingBox();
  expect(box.x).toBeGreaterThan(640);
  await page.reload();
  await expect(page.getByRole('button', { name: /Continue in English/ })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0); // the read-aloud question is not asked again
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  browserConsole.assertClean();
});

test('the switcher on Login changes the whole page at once and keeps what was typed', async ({ page }) => {
  const browserConsole = watchConsole(page);
  await setLanguage(page, 'en');
  await page.goto('/login');
  await page.getByLabel(/^Email/).fill('typed.before@example.com');
  await page.getByRole('button', { name: /Change language/ }).first().click();
  await page.getByRole('button', { name: 'Roman Urdu' }).click();
  await expect(page.getByRole('button', { name: T('ur-Latn')('auth.login.submit') })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ur-Latn');
  await expect(page.getByLabel(startsWith(T('ur-Latn')('auth.login.email')))).toHaveValue('typed.before@example.com');
  await expect(page).toHaveTitle(`${T('ur-Latn')('titles.login')} · ${T('ur-Latn')('app.name')}`);
  browserConsole.assertClean();
});

test('a logged-in user: the language is saved on the server (it follows them to another device)', async ({ page, browser }) => {
  await setLanguage(page, 'en');
  const { email } = await registerWorker(page);
  await page.getByRole('button', { name: /Change language/ }).first().click();
  await page.getByRole('button', { name: 'اردو' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect.poll(async () => (await (await page.request.get('/api/auth/session')).json()).user.preferredLanguage).toBe('ur');
  // "Another device": a new browser profile that has never chosen a language, same login.
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.context().addCookies(await page.context().cookies());
  await otherPage.goto('/onboarding/about');
  await expect(otherPage.locator('html')).toHaveAttribute('lang', 'ur');
  expect(email).toContain('@example.com');
  await other.close();
});

test('the Urdu font (Noto Nastaliq) is downloaded only when Urdu is chosen', async ({ browser }) => {
  for (const lang of LANGS) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const fontRequests = [];
    page.on('request', (r) => { if (/nastaliq/i.test(r.url())) fontRequests.push(r.url()); });
    await setLanguage(page, lang);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    if (lang === 'ur') expect(fontRequests.length, 'Urdu loads Nastaliq').toBeGreaterThan(0);
    else expect(fontRequests, `${lang} must not load Nastaliq`).toEqual([]);
    await context.close();
  }
});

for (const lang of LANGS) {
  test(`full onboarding in ${lang}: steps 1-5 (Step 3 continues), "All set" with the celebration`, async ({ page }) => {
    const browserConsole = watchConsole(page);
    const t = T(lang);
    await setLanguage(page, lang);
    await registerWorker(page, { lang });
    await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('onboarding.steps.about'));
    await completeSteps1and2(page, lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('onboarding.steps.skills'));
    await completeStep3(page, lang, SENTENCE[lang]);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('onboarding.steps.proof'));
    await page.getByRole('button', { name: t('onboarding.proof.skip') }).click();
    await expect(page).toHaveURL(/\/onboarding\/done$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('onboarding.steps.done'));
    await expect(page.getByText(t('onboarding.celebrate'))).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(1); // the confetti burst (motion allowed here)
    await expect(page.getByText(/DLM-\d{4}-\d{6}/)).toBeVisible(); // the real worker ID, Western digits
    await page.getByRole('link', { name: t('onboarding.goDashboard') }).click();
    await expect(page).toHaveURL(/\/worker$/);
    browserConsole.assertClean();
  });
}
