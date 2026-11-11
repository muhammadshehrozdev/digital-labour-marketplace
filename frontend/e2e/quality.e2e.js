// Batch 3, Part 7.3-7.5: accessibility (axe), keyboard, reduced motion, layout shift, console.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LANGS, PASSWORD, T, completeStep3, completeSteps1and2, login, logout, registerUser, setLanguage, setMode, skipTour, uniqueEmail, watchConsole } from './helpers.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function axe(page, label) {
  const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const bad = result.violations
    .filter((v) => ['serious', 'critical'].includes(v.impact))
    .map((v) => `${label}: ${v.id} (${v.impact}) ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  return bad;
}

// One worker (finished onboarding) and one customer, made once for all languages.
let worker;
let customer;
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await setLanguage(page, 'en');
  worker = await registerUser(page, { role: 'worker', email: uniqueEmail('e2e.a11y.worker') });
  await completeSteps1and2(page);
  await completeStep3(page);
  await logout(page);
  customer = await registerUser(page, { role: 'customer', email: uniqueEmail('e2e.a11y.customer') });
  await page.close();
});

// Batch 4: every language in light AND dark mode (contrast is checked by axe in both).
const MODES = ['light', 'dark'];
for (const lang of LANGS) for (const mode of MODES) {
  test(`axe: no serious or critical problems on the main pages in ${lang}, ${mode} mode`, async ({ browser }) => {
    test.setTimeout(180_000);
    const problems = [];
    const visit = async (page, path, label) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
      // the night-mode button is on every page (Batch 4, Part 3)
      await expect(page.locator('[data-testid="theme-toggle"]').first()).toBeVisible();
      problems.push(...(await axe(page, `${lang} ${mode} ${label}`)));
    };

    // Visitor pages (and the chooser, which has no saved language)
    const visitorContext = await browser.newContext({ reducedMotion: 'reduce' });
    const visitor = await visitorContext.newPage();
    await setMode(visitor, mode);
    await visitor.goto('/');
    problems.push(...(await axe(visitor, `${lang} ${mode} chooser`)));
    await visitor.evaluate((l) => localStorage.setItem('dlm.language', l), lang);
    for (const [path, label] of [['/', 'landing'], ['/login', 'login'], ['/register?role=worker', 'register'], ['/no-such-page', '404']]) await visit(visitor, path, label);
    await visitorContext.close();

    // Worker pages
    const workerContext = await browser.newContext({ reducedMotion: 'reduce' });
    const workerPage = await workerContext.newPage();
    await setLanguage(workerPage, 'en');
    await login(workerPage, worker.email);
    await skipTour(workerPage);
    await workerPage.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    for (const [path, label] of [['/notifications', 'notifications'], ['/worker', 'dashboard'], ['/worker/profile', 'profile view'], ['/worker/profile/edit', 'profile edit'], ['/worker/profile/edit?section=skills', 'edit skills'], ['/worker/profile/edit?section=proof', 'edit proof'], ['/onboarding/skills', 'onboarding step 3']]) {
      await visit(workerPage, path, label);
    }
    await workerContext.close();

    // Customer pages
    const customerContext = await browser.newContext({ reducedMotion: 'reduce' });
    const customerPage = await customerContext.newPage();
    await setLanguage(customerPage, 'en');
    await login(customerPage, customer.email);
    await customerPage.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    await visit(customerPage, '/find', 'find');
    // open a profile from the results first (the cards are only on /find), then the other pages
    const firstCard = customerPage.getByTestId('worker-card').first().getByRole('link');
    await firstCard.click();
    await expect(customerPage).toHaveURL(/\/workers\//);
    await expect(customerPage.getByRole('heading', { level: 1 }).first()).toBeVisible();
    problems.push(...(await axe(customerPage, `${lang} ${mode} worker public profile`)));
    await visit(customerPage, '/saved', 'saved workers');
    await visit(customerPage, '/help', 'help centre');
    await customerContext.close();

    // Admin pages
    const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
    const adminPage = await adminContext.newPage();
    await setLanguage(adminPage, 'en');
    await login(adminPage, 'e2e.admin@example.com', 'local e2e admin pass phrase');
    await adminPage.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    for (const [path, label] of [['/admin', 'admin overview'], ['/admin/identity?status=All', 'identity review'], ['/admin/evidence?status=all', 'evidence review'], ['/admin/users', 'users'], ['/admin/audit', 'audit log'], ['/admin/templates', 'reason templates'], ['/admin/exports', 'exports']]) {
      await visit(adminPage, path, label);
    }
    await adminContext.close();

    expect(problems).toEqual([]);
  });
}

test('keyboard only: skip link, then log in without a mouse', async ({ page }) => {
  await setLanguage(page, 'en');
  await page.goto('/login');
  await expect(page.getByRole('heading', { level: 1, name: 'Log in' })).toBeVisible(); // the page is drawn
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.getByLabel(/^Email/).focus();
  await page.keyboard.type(customer.email);
  await page.keyboard.press('Tab');
  await page.keyboard.type(PASSWORD);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/find$/);
  // Focus is always visible: the focused element has an outline.
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  expect(outline).not.toBe('none');
});

test('reduced motion: the hero shows the static headline, no typewriter; with motion the typewriter runs', async ({ browser }) => {
  for (const lang of LANGS) {
    const reduced = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await reduced.newPage();
    await setLanguage(page, lang);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(T(lang)('landing.title'));
    await expect(page.getByTestId('typewriter')).toHaveCount(0);
    await reduced.close();
  }
  const moving = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await moving.newPage();
  await setLanguage(page, 'en');
  await page.goto('/');
  const line = page.getByTestId('typewriter');
  // the moving text is hidden from screen readers (aria-hidden on its wrapper)
  await expect(page.locator('[aria-hidden="true"] [data-testid="typewriter"]')).toHaveCount(1);
  await expect(line).toHaveText(/Skilled/, { timeout: 4000 });
  // screen readers still get the static headline in the current language
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(T('en')('landing.title'));
  await moving.close();
});

test('no layout shift from fonts or the typewriter on the landing page (CLS < 0.1, every language)', async ({ browser }) => {
  for (const lang of LANGS) {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await setLanguage(page, lang);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(6000); // fonts swap in, and the typewriter types, erases and types again
    const cls = await page.evaluate(() => window.__cls);
    expect(cls, `${lang} CLS`).toBeLessThan(0.1);
    await context.close();
  }
});

test('the browser console stays clean on the main visitor pages in every language', async ({ page }) => {
  const browserConsole = watchConsole(page);
  for (const lang of LANGS) {
    await page.evaluate((l) => localStorage.setItem('dlm.language', l), lang).catch(() => {});
    await setLanguage(page, lang);
    for (const path of ['/', '/login', '/register', '/register?role=worker', '/no-such-page']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
  }
  browserConsole.assertClean();
});
