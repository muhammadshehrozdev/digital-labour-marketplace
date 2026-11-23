// Find workers search bar (Batch 7 layout fix): both fields show their label, and the top of the search box is level
// with the top of the sort box (1 px) in English and Urdu, light and dark, at the widths of laptop screens, also when
// a label wraps; below 1024 px the Filters button lines up with the boxes; at 360 px nothing scrolls sideways; axe
// finds no serious problem. Synthetic customer, the e2e database only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { T, login, registerUser, setLanguage, uniqueEmail } from './helpers.js';

const DESKTOP = [1024, 1280, 1366, 1536, 1920];
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

let customer;
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await setLanguage(page, 'en');
  customer = await registerUser(page, { role: 'customer', email: uniqueEmail('e2e.find.bar') });
  await page.close();
});

// The search bar's boxes, measured in the page (top edges, sizes, and whether anything leaves the window).
const measure = (page) => page.evaluate(() => {
  const form = document.querySelector('form[role=search]');
  const box = (el) => (el ? el.getBoundingClientRect() : null);
  const input = box(form.querySelector('input[type=search]'));
  const select = box(form.querySelector('select'));
  const filters = [...form.querySelectorAll('button')].find((b) => b.offsetParent !== null && !b.closest('[data-assist]'));
  const width = document.documentElement.clientWidth;
  const outside = [...form.querySelectorAll('input, select, button, label')]
    .filter((el) => el.offsetParent !== null && !el.classList.contains('visually-hidden'))
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 1 && (r.left < -0.5 || r.right > width + 0.5); })
    .map((el) => el.textContent.trim().slice(0, 30) || el.tagName);
  return {
    inputTop: input.top, inputHeight: input.height, selectTop: select.top,
    filtersTop: filters ? box(filters).top : null, filtersHeight: filters ? box(filters).height : null,
    labelHidden: form.querySelector('label[for]').classList.contains('visually-hidden'),
    scrollWidth: document.documentElement.scrollWidth, width, outside,
  };
});

async function openFind(page, lang, mode) {
  await page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
  await page.goto('/find');
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
  await expect(page.getByRole('searchbox', { name: T(lang)('find.searchLabel') })).toBeVisible();
}

for (const lang of ['en', 'ur']) {
  test(`the search box and the sort box are level and the search label is shown (${lang}, light and dark, 1024-1920 px)`, async ({ browser }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await setLanguage(page, 'en');
    await login(page, customer.email);
    for (const mode of ['light', 'dark']) {
      await openFind(page, lang, mode);
      for (const width of DESKTOP) {
        await page.setViewportSize({ width, height: 900 });
        const m = await measure(page);
        const label = `${lang} ${mode} ${width}px`;
        expect(m.labelHidden, `${label}: the search label is shown`).toBe(false);
        expect(Math.abs(m.inputTop - m.selectTop), `${label}: search box top ${m.inputTop}, sort box top ${m.selectTop}`).toBeLessThanOrEqual(1);
        expect(m.scrollWidth, `${label}: no sideways scroll`).toBeLessThanOrEqual(m.width);
      }
    }
    // a label that wraps (three lines) must not move one box: the label row is shared by both fields
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.evaluate(() => { document.querySelector('form[role=search] select').closest('div').querySelector('label').textContent = 'A very long sort label that has to wrap onto more than one line here'; });
    const wrapped = await measure(page);
    expect(Math.abs(wrapped.inputTop - wrapped.selectTop), `${lang} wrapped label: ${wrapped.inputTop} vs ${wrapped.selectTop}`).toBeLessThanOrEqual(1);
    // narrower screens: the Filters button lines up with the boxes (top and height); at 360 px everything stacks inside
    await page.reload();
    await expect(page.getByRole('searchbox', { name: T(lang)('find.searchLabel') })).toBeVisible(); // measure only once the page is drawn
    for (const width of [640, 768]) {
      await page.setViewportSize({ width, height: 900 });
      const m = await measure(page);
      expect(Math.abs(m.inputTop - m.selectTop), `${lang} ${width}px: boxes level`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.filtersTop - m.inputTop), `${lang} ${width}px: Filters top ${m.filtersTop} vs box ${m.inputTop}`).toBeLessThanOrEqual(1);
      expect(Math.abs(m.filtersHeight - m.inputHeight), `${lang} ${width}px: Filters as tall as the box`).toBeLessThanOrEqual(1);
    }
    await page.setViewportSize({ width: 360, height: 800 });
    const phone = await measure(page);
    expect(phone.scrollWidth, `${lang} 360px: no sideways scroll`).toBeLessThanOrEqual(phone.width);
    expect(phone.outside, `${lang} 360px: nothing outside the window`).toEqual([]);
    await context.close();
  });
}

test('axe: Find workers has no serious or critical problems (en and ur, light and dark)', async ({ browser }) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  await login(page, customer.email);
  const problems = [];
  for (const lang of ['en', 'ur']) for (const mode of ['light', 'dark']) {
    await openFind(page, lang, mode);
    await page.waitForLoadState('networkidle');
    const result = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    problems.push(...result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang} ${mode}: ${v.id} ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
  }
  expect(problems).toEqual([]);
  await context.close();
});
