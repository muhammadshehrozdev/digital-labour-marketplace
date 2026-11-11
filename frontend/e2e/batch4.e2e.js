// Batch 4 end to end: dark mode everywhere (with the reveal), account suspension, notifications,
// saved workers and compare, the duplicate compare slider, Tier 1 features (masks, text size,
// command palette, offline banner), and the installable app. Synthetic accounts, e2e database only.
import { test, expect } from '@playwright/test';
import { E2E_ADMIN } from './accounts.js';
import { LANGS, PASSWORD, T, login, logout, readyWorker, registerUser, setLanguage, setMode, skipTour, startsWith, uniqueEmail, uploadProof, watchConsole } from './helpers.js';

const en = T('en');

test.describe('dark mode (Part 3)', () => {
  for (const lang of LANGS) {
    test(`the night-mode button is on every visitor page and the choice survives a reload (${lang})`, async ({ browser }) => {
      const t = T(lang);
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      const browserConsole = watchConsole(page);
      // the language chooser (first visit) has it too
      await page.goto('/');
      await expect(page.getByRole('button', { name: T('en')('theme.toggle') })).toBeVisible();
      await setLanguage(page, lang);
      for (const path of ['/', '/login', '/register', '/help', '/no-such-page']) {
        await page.goto(path);
        await expect(page.getByRole('banner').getByRole('button', { name: t('theme.toggle') })).toBeVisible();
      }
      await page.goto('/login');
      const toggle = page.getByRole('banner').getByRole('button', { name: t('theme.toggle') });
      const before = await page.evaluate(() => document.documentElement.dataset.mode);
      await toggle.click();
      const after = before === 'dark' ? 'light' : 'dark';
      await expect(page.locator('html')).toHaveAttribute('data-mode', after);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-mode', after); // no flash back: set before React
      browserConsole.assertClean();
      await context.close();
    });
  }

  test('with motion the change grows as a circle from the button; with reduced motion it is instant', async ({ browser }) => {
    for (const [reducedMotion, expected] of [['no-preference', 1], ['reduce', 0]]) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await setLanguage(page, 'en');
      await page.addInitScript(() => {
        window.__vt = 0;
        const original = document.startViewTransition?.bind(document);
        if (original) document.startViewTransition = (cb) => { window.__vt += 1; return original(cb); };
      });
      await page.goto('/login');
      await page.getByRole('banner').getByRole('button', { name: en('theme.toggle') }).click();
      await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
      expect(await page.evaluate(() => window.__vt)).toBe(expected);
      await context.close();
    }
  });

  test('Light / Dark / System menu: "System" follows the device', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await setLanguage(page, 'en');
    await setMode(page, 'light');
    await page.goto('/login');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
    await page.getByRole('banner').getByRole('button', { name: en('theme.options') }).click();
    await page.getByRole('menuitemradio', { name: /System/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark'); // this device prefers dark
    await context.close();
  });
});

test.describe('admin: users and suspension (Part 5, feature 26)', () => {
  test('an admin suspends a worker: the open session ends and login says "suspended"; reactivating lets them back in', async ({ browser }) => {
    test.setTimeout(120_000);
    const workerContext = await browser.newContext({ reducedMotion: 'reduce' });
    const workerPage = await workerContext.newPage();
    await setLanguage(workerPage, 'en');
    const worker = await readyWorker(workerPage, { name: 'E2E Suspend Me (synthetic)' });
    await workerPage.goto('/worker');
    await skipTour(workerPage);
    await expect(workerPage.getByRole('heading', { level: 1, name: /Welcome/ })).toBeVisible();

    const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
    const admin = await adminContext.newPage();
    await setLanguage(admin, 'en');
    await login(admin, E2E_ADMIN.email, E2E_ADMIN.password);
    await expect(admin).toHaveURL(/\/admin$/);
    await admin.getByRole('navigation', { name: 'Admin' }).getByRole('link', { name: en('admin.nav.users') }).click();
    await admin.getByRole('searchbox', { name: en('adminx.users.search') }).fill(worker.email);
    await admin.getByRole('button', { name: en('common.search'), exact: true }).click();
    await admin.getByRole('button', { name: `Open ${worker.name}` }).click();
    const drawer = admin.getByRole('dialog', { name: worker.name });
    await drawer.getByRole('button', { name: en('adminx.users.suspend') }).click();
    const ask = admin.getByRole('dialog', { name: `Suspend ${worker.name}?` });
    await ask.getByLabel(/^Reason/).fill('E2E test: copied proof (synthetic)');
    await ask.getByRole('button', { name: en('adminx.users.suspend') }).click();
    await expect(admin.getByText(en('adminx.users.suspended')).first()).toBeVisible();

    // the worker's open page: the next request finds the session ended -> Log in with a message
    await workerPage.goto('/worker/profile');
    await expect(workerPage).toHaveURL(/\/login$/);
    await workerPage.getByLabel(startsWith(en('auth.login.email'))).fill(worker.email);
    await workerPage.locator('input[type=password]').fill(PASSWORD);
    await workerPage.getByRole('button', { name: en('auth.login.submit') }).click();
    await expect(workerPage.getByText(en('errors.ACCOUNT_SUSPENDED'))).toBeVisible();
    await expect(workerPage).toHaveURL(/\/login$/);

    // the audit log has it
    await admin.goto('/admin/audit');
    await expect(admin.getByRole('table').getByText(en('adminx.actions.user_suspended')).first()).toBeVisible();

    // reactivate
    await admin.goto('/admin/users?status=suspended');
    await admin.getByRole('button', { name: `Open ${worker.name}` }).click();
    await admin.getByRole('dialog', { name: worker.name }).getByRole('button', { name: en('adminx.users.reactivate') }).click();
    const back = admin.getByRole('dialog', { name: `Reactivate ${worker.name}?` });
    await back.getByLabel(/^Reason/).fill('E2E test: resolved (synthetic)');
    await back.getByRole('button', { name: en('adminx.users.reactivate') }).click();
    await expect(admin.getByText(en('adminx.users.reactivated')).first()).toBeVisible();
    await login(workerPage, worker.email);
    await expect(workerPage).toHaveURL(/\/worker$/);
    await workerContext.close();
    await adminContext.close();
  });

  test('visitors see no admin link anywhere; /admin sends a visitor to Log in', async ({ page }) => {
    await setLanguage(page, 'en');
    for (const path of ['/', '/login', '/register', '/help']) {
      await page.goto(path);
      await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
    }
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('notifications, duplicate compare, saved workers and compare (features 19, 23, 24, 34)', () => {
  test('a proof decision reaches the worker as a notification; a copied photo shows the compare slider to the admin', async ({ browser }) => {
    test.setTimeout(120_000);
    const a = await browser.newContext({ reducedMotion: 'reduce' });
    const workerA = await a.newPage();
    await setLanguage(workerA, 'en');
    await readyWorker(workerA, { name: 'E2E Notify Worker (synthetic)' });
    const original = await uploadProof(workerA, { seed: 77 });

    const b = await browser.newContext({ reducedMotion: 'reduce' });
    const workerB = await b.newPage();
    await setLanguage(workerB, 'en');
    await readyWorker(workerB, { name: 'E2E Copy Worker (synthetic)' });
    const copy = await uploadProof(workerB, { seed: 77 }); // the same picture

    const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
    const admin = await adminContext.newPage();
    await setLanguage(admin, 'en');
    await login(admin, E2E_ADMIN.email, E2E_ADMIN.password);
    // the copy: both photos in the compare slider
    await admin.goto('/admin/evidence?status=pending');
    await admin.getByRole('button', { name: /E2E Copy Worker/ }).first().click();
    await expect(admin.getByRole('slider', { name: en('adminx.compare.slider') })).toBeVisible();
    await admin.keyboard.press('Escape');
    // the original: approve with the keyboard shortcut A
    await admin.getByRole('button', { name: /E2E Notify Worker/ }).first().click();
    await expect(admin.getByRole('dialog', { name: /House wiring/ })).toBeVisible();
    // the shortcut works only once the item has loaded (nobody approves a photo before seeing it)
    await expect(admin.getByRole('dialog', { name: /House wiring/ }).getByRole('button', { name: en('admin.evidence.actions.approve.label'), exact: true })).toBeVisible();
    await admin.keyboard.press('a');
    const confirm = admin.getByRole('dialog', { name: en('admin.evidence.actions.approve.title') });
    await confirm.getByRole('button', { name: en('admin.evidence.actions.approve.label') }).click();
    // the drawer now shows the new state
    await expect(admin.getByRole('dialog', { name: /House wiring/ }).getByText(en('status.evidence.approved')).first()).toBeVisible();
    expect(original).not.toBe(copy);

    // the worker's bell
    await workerA.goto('/worker');
    await skipTour(workerA);
    await workerA.reload();
    const bell = workerA.getByRole('button', { name: /^Notifications: 1 unread/ });
    await expect(bell).toBeVisible();
    await bell.click();
    await expect(workerA.getByText('Proof approved for House wiring')).toBeVisible();
    await workerA.getByRole('button', { name: en('workerx.notifications.markAll') }).click();
    await expect(workerA.getByRole('button', { name: 'Notifications', exact: true })).toBeVisible();
    for (const c of [a, b, adminContext]) await c.close();
  });

  test('a customer saves two workers, finds them on Saved, and compares them side by side', async ({ browser }) => {
    test.setTimeout(120_000);
    const w = await browser.newContext({ reducedMotion: 'reduce' });
    const wp = await w.newPage();
    await setLanguage(wp, 'en');
    // the directory searches trade, skills and bio (not names), so both share a unique word in the bio
    const word = `pair${Date.now()}`;
    const first = await readyWorker(wp, { name: 'E2E Compare One (synthetic)', bio: `Synthetic ${word} worker` });
    await logout(wp);
    const second = await readyWorker(wp, { name: 'E2E Compare Two (synthetic)', bio: `Synthetic ${word} worker` });
    await w.close();

    const c = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await c.newPage();
    await setLanguage(page, 'en');
    const browserConsole = watchConsole(page);
    await registerUser(page, { role: 'customer', email: uniqueEmail('e2e.saver') });
    await page.goto(`/find?q=${word}`);
    await expect(page.getByTestId('worker-card')).toHaveCount(2);
    await expect(page).toHaveURL(new RegExp(`q=${word}`)); // the search lives in the address
    for (const worker of [first, second]) {
      await page.getByRole('button', { name: `Save ${worker.name}` }).click();
      await expect(page.getByRole('button', { name: `Remove ${worker.name} from saved` })).toBeVisible();
      await page.getByRole('checkbox', { name: `Add ${worker.name} to compare` }).check();
    }
    await page.getByRole('banner').getByRole('link', { name: en('nav.saved') }).click();
    await expect(page.getByText('2 saved workers')).toBeVisible();
    await page.getByRole('link', { name: en('customerx.compare.open') }).click();
    const table = page.getByRole('table', { name: en('customerx.compare.caption') });
    await expect(table.getByRole('columnheader')).toHaveCount(2);
    await expect(table).toContainText('E2E Compare One');
    await expect(table).toContainText('E2E Compare Two');
    await expect(table).not.toContainText(/03000000041|@example\.com/); // no contact data
    browserConsole.assertClean();
    await c.close();
  });
});

test.describe('Tier 1 features in the browser (features 3, 4, 5, 7, 35)', () => {
  test('masks, text size, command palette and the offline banner', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await setLanguage(page, 'en');
    await registerUser(page, { role: 'worker', email: uniqueEmail('e2e.tier1') });
    // CNIC and mobile masks with a live check
    const cnic = page.getByLabel(/^CNIC number/);
    await cnic.fill('3740512345671');
    await expect(cnic).toHaveValue('37405-1234567-1');
    await expect(page.getByText(en('workerx.masks.cnicOk'))).toBeVisible();
    // text size from the footer, kept after a reload
    await page.getByRole('contentinfo').getByRole('radio', { name: en('textSize.large') }).click();
    await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large');
    // command palette
    await page.keyboard.press('Control+k');
    const palette = page.getByRole('dialog', { name: en('appx.palette.label') });
    await palette.getByRole('combobox').fill('help');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/help$/);
    // offline
    await context.setOffline(true);
    await expect(page.getByTestId('offline-banner')).toContainText(en('appx.offline.banner').slice(0, 20));
    await context.setOffline(false);
    await expect(page.getByTestId('offline-banner')).toContainText(en('appx.offline.back'));
    await context.close();
  });
});

test.describe('installable app (feature 6)', () => {
  test('manifest and service worker; API answers are never cached', async ({ browser }) => {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await context.newPage();
    await setLanguage(page, 'en');
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
    const manifest = await (await page.request.get('/manifest.webmanifest')).json();
    expect(manifest.display).toBe('standalone');
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
    expect(scope).toBe('http://127.0.0.1:5174/');
    await page.reload(); // now controlled by the service worker
    await page.evaluate(() => fetch('/api/health').then((r) => r.json()));
    const cached = await page.evaluate(async () => {
      const urls = [];
      for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) urls.push(new URL(request.url).pathname);
      return urls;
    });
    expect(cached.length).toBeGreaterThan(0);
    expect(cached.filter((u) => u.startsWith('/api/'))).toEqual([]);
    await context.close();
  });
});
