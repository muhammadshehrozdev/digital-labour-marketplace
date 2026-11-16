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
    // Playwright itself says this when service workers are switched off for a test (config)
    if (m.text().includes('Service Worker registration blocked by Playwright')) return;
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
  // Batch 5: the trade is a picture card (a radio inside a label), chosen by its value in every language
  await page.locator('label:has(input[name=category][value=electrical_solar])').click();
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

// Batch 4: the welcome tour appears once on a worker's first dashboard visit; most tests do not
// need it (it has its own unit tests), so it is marked as seen for the logged-in account.
export async function skipTour(page) {
  await page.evaluate(async () => {
    const r = await fetch('/api/auth/session');
    const { user } = await r.json();
    if (user) localStorage.setItem(`dlm.tour.${user._id}`, 'done');
  });
}

// Batch 4: light or dark for this page, as if it had been chosen before.
export async function setMode(page, mode = 'light') {
  await page.addInitScript((m) => {
    try {
      window.localStorage.setItem('dlm.theme', m);
    } catch {
      // about:blank has no storage
    }
  }, mode);
}

// A worker whose onboarding is finished, made through the API after registering (faster than the
// screens, which have their own tests). Returns { email, name }.
export async function readyWorker(page, { name = 'E2E Ready Worker (synthetic)', skills = ['elec_wiring'], bio = '' } = {}) {
  const made = await registerUser(page, { role: 'worker', name, email: uniqueEmail('e2e.ready') });
  expect((await page.request.put('/api/workers/me', { data: { city: 'Rawalpindi', occupation: 'Electrician', category: 'electrical_solar', experienceYears: 6, dailyRate: 3500, bio } })).ok()).toBe(true);
  expect((await page.request.post('/api/workers/me/skills', { data: { skillIds: skills, addedVia: 'manual' } })).ok()).toBe(true);
  return made;
}

export async function uploadProof(page, { skillId = 'elec_wiring', seed = 1, type = 'work_photo' } = {}) {
  const file = await makeJpeg(page, seed);
  const res = await page.request.post('/api/evidence', { multipart: { skillId, type, consent: 'true', image: file } });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()).evidence._id;
}

// The wordmark (after Batch 4): the full name as one element, one weight (700), and the colour of its
// logo (dark text on light surfaces, light text on dark ones). Checks every visible wordmark on the page.
export async function checkWordmarks(page, lang, label) {
  const name = T(lang)('app.name');
  const found = await page.evaluate(() => [...document.querySelectorAll('[data-wordmark]')]
    .filter((el) => getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0)
    .map((el) => ({ text: el.textContent, children: el.childElementCount, weight: getComputedStyle(el).fontWeight, color: getComputedStyle(el).color, logoColor: getComputedStyle(el.parentElement).color })));
  expect(found.length, `${label}: at least one visible wordmark`).toBeGreaterThan(0);
  for (const word of found) {
    expect(word, label).toMatchObject({ text: name, children: 0, weight: '700' });
    expect(word.color, `${label}: wordmark colour = logo colour`).toBe(word.logoColor);
  }
}
