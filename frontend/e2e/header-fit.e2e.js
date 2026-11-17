// Batch 6B, Part A: the header and its menus always fit. For every role (visitor, customer, worker, admin),
// both languages (English, Urdu) and the widths of Windows laptops at 100-150% display scaling plus a phone
// and a tablet: the page never scrolls sideways, nothing in the header reaches past the window or is squeezed,
// and the open account menu (or the mobile menu) is fully inside the window, 8 px from its edges.
// `body { overflow-x: clip }` hides a scrollbar but not the overflow, so positions are checked, not only scrollWidth.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { E2E_ADMIN } from './accounts.js';
import { T, completeStep3, completeSteps1and2, login, logout, registerUser, setLanguage, skipTour, uniqueEmail } from './helpers.js';

const WIDTHS = [360, 768, 1024, 1152, 1280, 1366, 1440, 1536, 1600, 1920];
const SPOT_WIDTHS = [360, 1280, 1536]; // the other main pages of each role
const PAGES = {
  visitor: ['/', '/login', '/register', '/help'],
  customer: ['/find', '/bookings', '/saved', '/notifications'],
  worker: ['/worker', '/worker/requests', '/worker/jobs', '/worker/profile', '/worker/reputation'],
  admin: ['/admin', '/admin/bookings', '/admin/users', '/admin/identity'],
};

let worker;
let customer;
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await setLanguage(page, 'en');
  // long synthetic names on purpose: the widest header a real account can have
  worker = await registerUser(page, { role: 'worker', email: uniqueEmail('e2e.header.worker'), name: 'Muhammad Abdul Rehman Qureshi (synthetic)' });
  await completeSteps1and2(page);
  await completeStep3(page);
  await logout(page);
  customer = await registerUser(page, { role: 'customer', email: uniqueEmail('e2e.header.customer.with.a.long.address'), name: 'Ayesha Siddiqui Malik (synthetic)' });
  await page.close();
});

// Everything the window shows of the header, measured in the page.
const measure = (page) => page.evaluate(() => {
  const de = document.documentElement;
  const width = de.clientWidth;
  const out = { scrollWidth: de.scrollWidth, width, outside: [], squeezed: [] };
  for (const el of document.querySelectorAll('header a, header button')) {
    const box = el.getBoundingClientRect();
    if (box.width < 2 || getComputedStyle(el).visibility === 'hidden') continue; // not shown
    const name = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
    if (box.left < -0.5 || box.right > width + 0.5) out.outside.push(`${name} ${Math.round(box.left)}..${Math.round(box.right)}`);
    if (el.scrollWidth > el.clientWidth + 1) out.squeezed.push(name);
  }
  return out;
});

async function expectFits(page, label) {
  const m = await measure(page);
  expect(m.scrollWidth, `${label}: the page scrolls sideways`).toBeLessThanOrEqual(m.width);
  expect(m.outside, `${label}: header controls outside the window`).toEqual([]);
  expect(m.squeezed, `${label}: header controls squeezed`).toEqual([]);
  return m;
}

// An open popover must be inside the window with 8 px to spare (margin 8). The mobile menu is a full-width
// panel under the header (its contents are padded), so it is checked with margin 0.
async function expectInside(page, locator, label, margin = 8) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  const width = await page.evaluate(() => document.documentElement.clientWidth);
  expect(box.x, `${label}: menu starts outside`).toBeGreaterThanOrEqual(margin - 0.5);
  expect(box.x + box.width, `${label}: menu ends outside`).toBeLessThanOrEqual(width - margin + 0.5);
}

async function openRole(browser, role, lang) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, lang);
  if (role === 'customer') await login(page, customer.email, undefined, lang);
  if (role === 'worker') {
    await login(page, worker.email, undefined, lang);
    await skipTour(page);
  }
  if (role === 'admin') await login(page, E2E_ADMIN.email, E2E_ADMIN.password, lang);
  // the account's saved language wins over the browser's
  if (role !== 'visitor') await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang } });
  return { context, page };
}

for (const lang of ['en', 'ur']) {
  test(`the header fits for every role at every width, and its menus stay inside the window (${lang})`, async ({ browser }) => {
    test.setTimeout(480_000);
    const t = T(lang);
    for (const role of Object.keys(PAGES)) {
      const { context, page } = await openRole(browser, role, lang);
      const [main, ...others] = PAGES[role];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(main);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', lang === 'ur' ? 'ur' : 'en');
        const label = `${role} ${lang} ${width}px ${main}`;
        await expectFits(page, label);
        const header = page.getByRole('banner');
        if (role === 'visitor') {
          const more = header.getByRole('button', { name: t('b6b.header.more') });
          if (await more.isVisible()) {
            await more.click();
            await expectInside(page, page.locator('#more-menu'), `${label} More`);
            await page.keyboard.press('Escape');
          }
          continue;
        }
        const account = header.getByRole('button', { name: new RegExp(t('header.accountMenu')) });
        const menuButton = header.getByRole('button', { name: t('nav.openMenu') });
        if (await account.isVisible()) {
          await account.click();
          await expectInside(page, page.locator('#account-menu'), `${label} account menu`);
          await expectFits(page, `${label} with the account menu open`);
          await page.keyboard.press('Escape');
          await expect(page.locator('#account-menu')).toHaveCount(0);
        } else {
          // the mobile level: links and the account are in the menu
          await menuButton.click();
          await expectInside(page, page.locator('#mobile-menu'), `${label} mobile menu`, 0);
          await expectFits(page, `${label} with the mobile menu open`);
          await expect(page.locator('#mobile-menu').getByRole('button', { name: t('header.logout') })).toBeVisible();
          await header.getByRole('button', { name: t('nav.closeMenu') }).click(); // the same button, renamed while open
          await expect(page.locator('#mobile-menu')).toHaveCount(0);
        }
      }
      for (const path of others) {
        for (const width of SPOT_WIDTHS) {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(path);
          await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
          await expectFits(page, `${role} ${lang} ${width}px ${path}`);
        }
      }
      if (role !== 'visitor') await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'en' } });
      await context.close();
    }
  });
}

test('axe: the account menu with Sound and language moved into it has no serious or critical problems (en, ur)', async ({ browser }) => {
  test.setTimeout(120_000);
  for (const lang of ['en', 'ur']) {
    const t = T(lang);
    const { context, page } = await openRole(browser, 'customer', lang);
    await page.setViewportSize({ width: 1152, height: 800 });
    await page.goto('/find');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.getByRole('banner').getByRole('button', { name: new RegExp(t('header.accountMenu')) }).click();
    await expect(page.locator('#account-menu')).toBeVisible();
    const result = await new AxeBuilder({ page }).include('header').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang}: ${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
    await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'en' } });
    await context.close();
  }
});
