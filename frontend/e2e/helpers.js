// Shared helpers for the end-to-end tests (synthetic accounts, e2e database only).
// Texts come from the same dictionaries as the app, so a test can run in any language.
import { expect } from '@playwright/test';
import en from '../src/i18n/dictionaries/en.js';
import ur from '../src/i18n/dictionaries/ur.js';
import urLatn from '../src/i18n/dictionaries/ur-Latn.js';
import { createTranslator } from '../src/i18n/translate.js';

export const PASSWORD = 'local e2e pass phrase';
export const LANGS = ['en', 'ur', 'ur-Latn'];
const DICTS = { en, ur, 'ur-Latn': urLatn };
export const T = (lang) => createTranslator(lang, DICTS[lang], en);
export const uniqueEmail = (prefix) => `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const startsWith = (text) => new RegExp(`^${escape(text)}`);

// The website language for this page, as if it had been chosen before (skips the chooser).
export async function setLanguage(page, lang = 'en') {
  await page.addInitScript((l) => {
    try {
      window.localStorage.setItem('dlm.language', l);
    } catch {
      // about:blank has no storage; nothing to do there
    }
  }, lang);
}

// Collects console errors/warnings and page errors; call assertClean() at the end of a test.
// Failed responses are listed in the failure message, so a "404" or "401" says which request.
export function watchConsole(page) {
  const problems = [];
  const failed = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname} (on ${new URL(page.url()).pathname})`);
  });
  return { problems, assertClean: () => expect(problems, `browser console; failed requests: ${failed.join(', ') || 'none'}`).toEqual([]) };
}

export async function registerUser(page, { role = 'worker', lang = 'en', name = `E2E ${role} (synthetic)`, email = uniqueEmail(`e2e.${role}`), phone = '03000000041' } = {}) {
  const t = T(lang);
  await page.goto(`/register?role=${role}`);
  await page.getByLabel(startsWith(t('auth.register.fullName'))).fill(name);
  await page.getByLabel(startsWith(t('auth.register.email'))).fill(email);
  await page.getByLabel(startsWith(t('auth.register.mobile'))).fill(phone);
  await page.locator('input[type=password]').fill(PASSWORD);
  await page.getByRole('button', { name: t('auth.register.submit') }).click();
  await expect(page).toHaveURL(role === 'worker' ? /\/onboarding\/about$/ : /\/find$/);
  return { email, name };
}

export const registerWorker = (page, options = {}) => registerUser(page, { ...options, role: 'worker' });

export async function login(page, email, password = PASSWORD, lang = 'en') {
  const t = T(lang);
  await page.goto('/login');
  await page.getByLabel(startsWith(t('auth.login.email'))).fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: t('auth.login.submit') }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

// Leave the app first, so no page request is still running when the session ends
// (that request would correctly get a 401 and log it in the console).
export async function logout(page) {
  await page.goto('about:blank');
  await page.request.post('/api/auth/logout');
  await page.context().clearCookies();
}

export async function completeSteps1and2(page, lang = 'en') {
  const t = T(lang);
  await page.getByLabel(startsWith(t('about.city'))).fill('Rawalpindi');
  await page.getByRole('button', { name: t('onboarding.saveContinue') }).click();
  await expect(page).toHaveURL(/\/onboarding\/work$/);
  await page.getByLabel(startsWith(t('work.trade'))).selectOption('electrical_solar');
  await page.getByLabel(startsWith(t('work.experience'))).fill('5');
  await page.getByLabel(startsWith(t('work.daily'))).fill('4000');
  await page.getByRole('button', { name: t('onboarding.saveContinue') }).click();
  await expect(page).toHaveURL(/\/onboarding\/skills$/);
}

// Step 3 with a sentence; adds the suggested skills and continues to Step 4.
export async function completeStep3(page, lang = 'en', sentence = 'Main 5 saal se wiring aur solar panel ka kaam karta hoon') {
  const t = T(lang);
  await page.getByLabel(startsWith(t('skills.describeLabel'))).fill(sentence);
  await page.getByRole('button', { name: t('skills.find') }).click();
  await page.getByRole('button', { name: new RegExp(escape(t('skills.addSelected'))) }).click();
  const next = page.getByRole('button', { name: t('common.continue'), exact: true });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page).toHaveURL(/\/onboarding\/proof$/);
}

// A real small JPEG made by the browser (canvas), for upload tests. No real people or places.
export async function makeJpeg(page, seed = 1) {
  const dataUrl = await page.evaluate((s) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 40; i += 1) {
      ctx.fillStyle = `hsl(${(s * 47 + i * 37) % 360} 60% ${30 + (i % 5) * 10}%)`;
      ctx.fillRect((i * 53 + s * 17) % 300, (i * 29 + s * 11) % 220, 40 + (i % 7) * 10, 30 + (i % 3) * 15);
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  }, seed);
  return { name: `proof-${seed}.jpg`, mimeType: 'image/jpeg', buffer: Buffer.from(dataUrl.split(',')[1], 'base64') };
}
