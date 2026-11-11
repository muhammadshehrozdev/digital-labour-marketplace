// Screenshot run (Batch 3 Part 7.2; Batch 4 Part 2.3). Synthetic accounts in the e2e database only.
// SHOTS_OUT chooses the folder (default: the Batch 4 set, docs/design/screenshots/all-v3; the Batch 3
// "before" set is docs/design/screenshots/all). Light mode for the main set; a dark set of key
// screens follows.
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { LANGS, PASSWORD, T, completeSteps1and2, login, logout, makeJpeg, registerUser, setLanguage, setMode, skipTour, startsWith, uniqueEmail } from './helpers.js';

const OUT = process.env.SHOTS_OUT || '../docs/design/screenshots/all-v3';
const WIDTHS = [360, 768, 1280];
const SENTENCE = { en: 'I have done house wiring and solar panel work for 5 years', ur: 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔', 'ur-Latn': 'Main 5 saal se wiring aur solar panel ka kaam karta hoon' };

async function shoot(page, lang, name) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    // from the top: a full-page picture of a scrolled page draws the sticky header in the middle
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${lang}/${name}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
}

async function go(page, path) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
}

test.use({ reducedMotion: 'reduce' }); // calm, repeatable pictures (the static headline, no confetti)

test('every main screen in every language at 360, 768 and 1280 px', async ({ browser }) => {
  // Shared data: a worker with a full profile and proof, a customer, the e2e admin.
  const seed = await browser.newPage();
  await setLanguage(seed, 'en');
  const workerEmail = uniqueEmail('shots.worker');
  await seed.request.post('/api/auth/register', { data: { name: 'Rashid Mehmood (synthetic)', email: workerEmail, phone: '03000000061', password: PASSWORD, role: 'worker' } });
  await seed.request.put('/api/workers/me', {
    data: {
      city: 'Rawalpindi', address: 'Satellite Town', whatsappNumber: '03000000062', emergencyContact: 'Brother 03000000063',
      cnicNumber: `35202-${String(Date.now()).slice(-7)}-1`, occupation: 'Electrician', category: 'electrical_solar', experienceYears: 6,
      hourlyRate: 800, dailyRate: 4500, languages: ['Urdu', 'Punjabi'], bio: 'House wiring and solar panels, neat work (synthetic profile).',
      workHistory: [{ jobTitle: 'House wiring', clientOrEmployer: 'Private client', duration: '2 weeks', description: 'Full wiring of a new house' }],
    },
  });
  await seed.request.post('/api/workers/me/skills', { data: { skillIds: ['elec_wiring', 'elec_solar', 'elec_db'], addedVia: 'manual' } });
  await seed.goto('/');
  for (const [i, skillId] of ['elec_wiring', 'elec_solar'].entries()) {
    await seed.request.post('/api/evidence', { multipart: { skillId, type: i ? 'certificate' : 'work_photo', consent: 'true', image: await makeJpeg(seed, Date.now() + i) } });
  }
  const { workerIdCode } = await (await seed.request.get('/api/workers/me')).json();
  // a second listed worker, for the comparison screen
  await seed.request.post('/api/auth/logout');
  await seed.request.post('/api/auth/register', { data: { name: 'Sana Bibi (synthetic)', email: uniqueEmail('shots.worker2'), phone: '03000000065', password: PASSWORD, role: 'worker' } });
  await seed.request.put('/api/workers/me', { data: { city: 'Islamabad', occupation: 'Electrician', category: 'electrical_solar', experienceYears: 3, dailyRate: 3000, bio: 'Wiring and UPS work (synthetic profile).' } });
  await seed.request.post('/api/workers/me/skills', { data: { skillIds: ['elec_wiring', 'elec_ups'], addedVia: 'manual' } });
  const { workerIdCode: secondIdCode } = await (await seed.request.get('/api/workers/me')).json();
  await seed.close();
  const customerEmail = uniqueEmail('shots.customer');

  for (const lang of LANGS) {
    mkdirSync(`${OUT}/${lang}`, { recursive: true });
    const t = T(lang);
    // A fresh browser profile per language (no remembered language, no cookies).
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    await setMode(page, 'light');

    // Visitor
    await go(page, '/');
    await shoot(page, lang, '00-language-chooser');
    await setLanguage(page, lang);
    await go(page, '/');
    await shoot(page, lang, '01-landing');
    await go(page, '/login');
    await shoot(page, lang, '02-login');
    await go(page, '/register');
    await shoot(page, lang, '03-register-roles');
    await go(page, '/register?role=worker');
    await shoot(page, lang, '04-register-form');
    await go(page, '/no-such-page');
    await shoot(page, lang, '05-not-found');
    await go(page, '/help');
    await shoot(page, lang, '06-help-centre');

    // Onboarding with a new worker in this language
    await registerUser(page, { role: 'worker', lang });
    await shoot(page, lang, '10-onboarding-1-about');
    await completeSteps1and2(page, lang);
    await page.getByLabel(startsWith(t('skills.describeLabel'))).fill(SENTENCE[lang]);
    await page.getByRole('button', { name: t('skills.find') }).click();
    await expect(page.getByRole('heading', { name: t('skills.suggestionsTitle') })).toBeVisible();
    await shoot(page, lang, '12-onboarding-3-skills');
    await page.getByRole('button', { name: new RegExp(t('skills.addSelected')) }).click();
    await page.getByRole('button', { name: t('common.continue'), exact: true }).click();
    await expect(page).toHaveURL(/\/onboarding\/proof$/);
    await shoot(page, lang, '13-onboarding-4-proof');
    await page.getByRole('button', { name: t('onboarding.proof.skip') }).click();
    await expect(page).toHaveURL(/\/onboarding\/done$/);
    await shoot(page, lang, '14-onboarding-5-done');
    await go(page, '/onboarding/work');
    await shoot(page, lang, '11-onboarding-2-work');
    await logout(page);

    // The worker with a full profile
    await login(page, workerEmail, PASSWORD, lang);
    await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: 'light' } });
    await skipTour(page);
    await go(page, '/worker');
    await shoot(page, lang, '20-worker-dashboard');
    await go(page, '/worker/profile');
    await shoot(page, lang, '21-profile-view');
    await page.getByRole('switch', { name: t('profile.viewToggle') }).click();
    await shoot(page, lang, '22-profile-customer-view');
    for (const [i, section] of ['about', 'work', 'skills', 'proof', 'history', 'language'].entries()) {
      await go(page, `/worker/profile/edit?section=${section}`);
      await shoot(page, lang, `${23 + i}-edit-${section}`);
    }
    await logout(page);

    // Customer
    if (lang === 'en') await registerUser(page, { role: 'customer', lang, email: customerEmail, phone: '03000000064' });
    else await login(page, customerEmail, PASSWORD, lang);
    await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: 'light' } });
    await go(page, '/find');
    await shoot(page, lang, '30-customer-search');
    await go(page, `/workers/${workerIdCode}`);
    await shoot(page, lang, '31-worker-public-profile');
    await page.request.put(`/api/saved/${workerIdCode}`);
    await go(page, '/saved');
    await shoot(page, lang, '32-saved-workers');
    await go(page, `/compare?ids=${workerIdCode},${secondIdCode}`);
    await shoot(page, lang, '33-compare');
    await logout(page);

    // Admin
    await login(page, 'e2e.admin@example.com', 'local e2e admin pass phrase', lang);
    await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: 'light' } });
    await go(page, '/admin');
    await shoot(page, lang, '40-admin-overview');
    await go(page, '/admin/identity?status=Pending');
    await shoot(page, lang, '41-admin-identity');
    await page.getByRole('button', { name: new RegExp('Rashid Mehmood') }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await shoot(page, lang, '42-admin-identity-drawer');
    await go(page, '/admin/evidence?status=pending');
    await shoot(page, lang, '43-admin-evidence');
    await page.getByRole('button', { name: /Rashid Mehmood/ }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await shoot(page, lang, '44-admin-evidence-drawer');
    await go(page, '/admin/audit');
    await shoot(page, lang, '45-admin-audit');
    await go(page, '/admin/users');
    await shoot(page, lang, '46-admin-users');
    await go(page, '/admin/templates');
    await shoot(page, lang, '47-admin-templates');
    await go(page, '/admin/exports');
    await shoot(page, lang, '48-admin-exports');
    await context.close();
  }

  // Dark mode: the key screens in English at 360 and 1280 px.
  const dark = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await dark.newPage();
  await setLanguage(page, 'en');
  await setMode(page, 'dark');
  mkdirSync(`${OUT}/dark`, { recursive: true });
  const darkShot = async (name) => {
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${OUT}/dark/${name}-${width}.png`, fullPage: true });
    }
  };
  await go(page, '/');
  await darkShot('01-landing');
  await go(page, '/login');
  await darkShot('02-login');
  await login(page, workerEmail, PASSWORD);
  await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'en', preferredTheme: 'dark' } });
  await skipTour(page);
  await go(page, '/worker');
  await darkShot('20-worker-dashboard');
  await go(page, '/worker/profile');
  await darkShot('21-profile-view');
  await logout(page);
  await login(page, customerEmail, PASSWORD);
  await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'en', preferredTheme: 'dark' } });
  await go(page, '/find');
  await darkShot('30-customer-search');
  await logout(page);
  await login(page, 'e2e.admin@example.com', 'local e2e admin pass phrase');
  await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'en', preferredTheme: 'dark' } });
  await go(page, '/admin');
  await darkShot('40-admin-overview');
  await go(page, '/admin/users');
  await darkShot('46-admin-users');
  await dark.close();
});
