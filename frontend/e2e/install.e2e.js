// Batch 6B, Part B: "Install this app" in a real browser. The invitation appears on the second page after a
// touch (never on the first), the footer button is on every page, and the steps dialog opens when the browser
// has no saved install question. axe on the sheet and the steps dialog, English and Urdu, light and dark.
// The browser's own install dialog cannot be shown in a headless test (and no site can press "Install" for the
// person): the saved-event path is covered by the component tests; the real phone test is manual
// (docs/INSTALL-MANUAL-TEST.md).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { T, setLanguage, setMode, watchConsole } from './helpers.js';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const serious = async (page, include) => (await new AxeBuilder({ page }).include(include).withTags(WCAG).analyze()).violations
  .filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);

for (const lang of ['en', 'ur']) for (const mode of ['light', 'dark']) {
  test(`first visit: the invitation on the second page, the steps dialog, the footer button; axe (${lang}, ${mode})`, async ({ browser }) => {
    const t = T(lang);
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const browserConsole = watchConsole(page);
    await setLanguage(page, lang);
    await setMode(page, mode);
    // keep the browser's own install question away from the app, so Install shows the menu steps
    await page.addInitScript(() => window.addEventListener('beforeinstallprompt', (e) => e.stopImmediatePropagation(), true));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await page.mouse.click(5, 300); // the first touch
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('install-hint')).toHaveCount(0); // never on the first page
    await expect(page.getByRole('contentinfo').getByRole('button', { name: t('b6b.install.footerButton'), exact: true })).toBeVisible();

    await page.getByRole('banner').getByRole('link', { name: t('header.login'), exact: true }).click();
    const sheet = page.getByTestId('install-hint');
    await expect(sheet).toBeVisible({ timeout: 5000 });
    await expect(sheet).toContainText(t('b6b.install.line'));
    expect(await serious(page, '[data-testid="install-hint"]'), `${lang} ${mode} sheet`).toEqual([]);
    // it never covers the page help button: that one moves above it
    const helpButton = page.getByRole('button', { name: t('assist.pageHelp'), exact: true });
    await expect.poll(async () => {
      const help = await helpButton.boundingBox();
      const box = await sheet.boundingBox();
      return help.y + help.height <= box.y + 1;
    }, { message: 'the page help button moves above the sheet' }).toBe(true);

    await sheet.getByRole('button', { name: t('b6b.install.install'), exact: true }).click();
    const steps = page.getByRole('dialog', { name: t('b6b.install.stepsTitle') });
    await expect(steps).toBeVisible();
    await expect(steps.getByRole('listitem')).toHaveCount(3);
    expect(await serious(page, 'dialog[open]'), `${lang} ${mode} steps`).toEqual([]);
    await steps.getByRole('button', { name: t('b6b.install.done'), exact: true }).click();
    await expect(steps).toHaveCount(0);
    await expect(sheet).toHaveCount(0);
    // answered: it does not come back on the next page; the footer button stays
    await page.getByRole('banner').getByRole('link', { name: t('header.createAccount'), exact: true }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('install-hint')).toHaveCount(0);
    await expect(page.getByRole('contentinfo').getByRole('button', { name: t('b6b.install.footerButton'), exact: true })).toBeVisible();
    browserConsole.assertClean();
    await context.close();
  });
}
