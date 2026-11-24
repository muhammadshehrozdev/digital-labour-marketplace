// Module 6 (Batch 8B) end to end: a customer describes a job by typing, checks the words, changes the kind of work,
// writes the area and a private budget, saves it (JR-…, Open); "Workers for this job" lists a synthetic Rawalpindi
// plumber with the reasons; "Send this job" opens the request page in job mode; the booking says "From job request";
// a second request is refused in plain words; the worker sees the job code and the kind of work and never the budget,
// accepts; both press "Work done" (the job is Done); the customer closes it (Closed) and the booking is unchanged.
// Then: a tie and an Urdu text on the first step, the admin list, stats note and try box, and axe (WCAG 2.2 AA) and
// "no sideways scrolling" on every new page. Synthetic accounts, the e2e database only.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LANGS, T, login, readyWorker, registerUser, setLanguage, setMode, skipTour, uniqueEmail, watchConsole } from './helpers.js';
import { E2E_ADMIN } from './accounts.js';

const t = T('en');
const phone = () => `0300${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;
const pktDay = (offset = 0) => new Date(Date.now() + 5 * 3600e3 + offset * 864e5).toISOString().slice(0, 10);
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const TEXT = 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah';

async function newPlumber(browser, name) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  const made = await readyWorker(page, { name, skills: ['plumb_leak'], bio: `Synthetic e2e plumber m6 ${Date.now()}` });
  expect((await page.request.put('/api/workers/me', { data: { phone: phone(), city: 'Rawalpindi', occupation: 'Plumber', category: 'plumbing_sanitary' } })).ok()).toBe(true);
  const code = (await (await page.request.get('/api/workers/me')).json()).workerIdCode;
  await page.goto('/worker');
  await skipTour(page);
  return { context, page, ...made, code };
}

async function newCustomer(browser, name, lang = 'en') {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, lang);
  const made = await registerUser(page, { role: 'customer', name, email: uniqueEmail('e2e.m6.customer'), phone: phone(), lang });
  return { context, page, ...made };
}

// a job request through the API (the screens that save one have their own test)
async function apiJob(customer, extra = {}) {
  const res = await customer.page.request.post('/api/job-requests', {
    data: {
      description: `${TEXT} [synthetic e2e]`, inputMode: 'text', category: 'plumbing_sanitary', skills: ['plumb_leak'], taskType: 'repair', city: 'Rawalpindi',
      area: 'Satellite Town', preferredDate: pktDay(1), timeSlot: 'morning', urgent: false, budget: { amount: 2500, unit: 'job' }, ...extra,
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()).job;
}

test('describe by typing -> check -> save (Open) -> workers for this job -> send -> one request at a time -> the worker never sees the budget -> Done -> Closed', async ({ browser }) => {
  test.setTimeout(240_000);
  const workerName = `E2E M6 Plumber ${Date.now()} (synthetic)`;
  const worker = await newPlumber(browser, workerName);
  const other = await newPlumber(browser, `E2E M6 Second Plumber ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E M6 Customer (synthetic)');
  const watch = watchConsole(customer.page);
  const p = customer.page;

  // 1. the words, typed, then "Check my words": plumbing, and the words are marked
  await p.goto('/job-requests/new');
  await p.getByRole('textbox', { name: t('jobs.describe.label') }).fill(TEXT);
  await p.getByRole('button', { name: t('jobs.describe.check') }).click();
  const found = p.getByTestId('found-words');
  await expect(found).toContainText('tapak');
  await expect(found).toContainText('pindi');
  await expect(p.getByTestId('highlight-mirror').locator('mark').first()).toBeVisible();
  await p.getByRole('button', { name: t('jobs.new.toDetails') }).click();
  await expect(p.locator('input[name=category][value=plumbing_sanitary]')).toBeChecked();
  await expect(p.locator('input[name=taskType][value=repair]')).toBeChecked();
  await expect(p.getByRole('textbox', { name: /^City/ })).toHaveValue('Rawalpindi');
  // 2. the customer changes the kind of work, writes the area and a private budget, and saves
  await p.locator('label:has(input[name=taskType][value=service])').click();
  await p.getByRole('textbox', { name: /^Area/ }).fill('Satellite Town');
  await p.getByRole('textbox', { name: t('jobs.budget.amount') }).fill('2500');
  await p.locator('label:has(input[name=budgetUnit][value=job])').click();
  await p.getByRole('button', { name: t('jobs.new.toSave') }).click();
  await expect(p.getByTestId('job-budget')).toContainText('Budget: Rs 2,500 for the whole job');
  await p.getByRole('button', { name: t('jobs.new.save') }).click();
  await expect(p).toHaveURL(/\/job-requests\/[a-f0-9]{24}$/);
  const jobId = p.url().split('/').pop();
  const code = (await (await p.request.get(`/api/job-requests/${jobId}`)).json()).job.code;
  expect(code).toMatch(/^JR-\d{4}-\d{6}$/);
  await expect(p.getByText(code).first()).toBeVisible();
  await expect(p.getByText(t('jobs.state.open'), { exact: true }).first()).toBeVisible();
  await expect(p.getByTestId('next-step')).toBeVisible();

  // 3. Workers for this job: our plumber with the reasons; "Send this job" opens the request in job mode
  await p.getByTestId('next-step').getByRole('link', { name: t('jobs.card.chooseWorker') }).click();
  await expect(p.getByTestId('not-ranked')).toContainText(t('jobs.workers.lead'));
  const card = p.getByTestId('worker-card').filter({ hasText: workerName });
  await expect(card).toContainText('Offers: Water leak repair');
  await expect(card).toContainText('Same city: Rawalpindi');
  await card.getByRole('link', { name: new RegExp(t('jobs.workers.send')) }).click();
  await expect(p.getByTestId('your-job')).toContainText(code);
  await expect(p.getByRole('textbox', { name: /^City/ })).toHaveCount(0);
  await p.getByRole('button', { name: t('booking.request.send') }).click();
  await expect(p).toHaveURL(/\/bookings\/[a-f0-9]{24}$/);
  const bookingId = p.url().split('/').pop();
  await expect(p.getByTestId('from-job')).toContainText(`From job request ${code}`);

  // 4. the job waits for the answer; a second request to another worker is refused in plain words
  await p.goto(`/job-requests/${jobId}`);
  await expect(p.getByText(t('jobs.meaning.requested')).first()).toBeVisible();
  await p.goto(`/workers/${other.code}/request?job=${jobId}`);
  await expect(p.getByTestId('request-blocked')).toContainText(t('jobs.request.withWorker'));
  const refused = await p.request.post(`/api/job-requests/${jobId}/request`, { data: { jobVersion: 1, workerIdCode: other.code, skillId: 'plumb_leak', preferredDate: pktDay(1), timeSlot: 'morning' } });
  expect(refused.status()).toBe(409);
  expect((await refused.json()).code).toBe('JOB_HAS_OPEN_REQUEST');

  // 5. the worker: the job code and the kind of work, never the budget; accepts
  const w = worker.page;
  await w.goto('/worker/requests');
  const request = w.getByTestId('booking-card').filter({ hasText: code });
  await expect(request.getByTestId('from-job')).toContainText(`From job request ${code}`);
  await expect(request.getByTestId('from-job')).toContainText('Kind of work: Service');
  await expect(w.locator('body')).not.toContainText(/budget|2,500/i);
  const raw = JSON.stringify(await (await w.request.get(`/api/bookings/${bookingId}`)).json());
  expect(raw).not.toMatch(/budget|"analysis"/);
  expect((await w.request.get(`/api/job-requests/${jobId}`)).status()).toBe(403);
  await request.getByRole('button', { name: t('booking.action.accept') }).click();
  await expect(w.getByTestId('booking-card').filter({ hasText: code })).toHaveCount(0); // accepted: it leaves Requests
  await w.goto(`/worker/jobs/${bookingId}`);
  await expect(w.getByTestId('from-job')).toContainText(`From job request ${code}`);
  await expect(w.getByTestId('from-job').getByRole('link')).toHaveCount(0); // text only for a worker
  await expect(w.locator('body')).not.toContainText(/budget|2,500/i);
  await p.goto(`/job-requests/${jobId}`);
  await expect(p.getByText(t('jobs.meaning.accepted')).first()).toBeVisible();

  // 6. both press "Work done": the job is Done; the customer closes it; the booking is unchanged
  await w.getByRole('button', { name: t('booking.action.workDone') }).first().click();
  await w.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(w.getByText(t('booking.done.confirmed'))).toBeVisible();
  await p.goto(`/bookings/${bookingId}`);
  await p.getByRole('button', { name: t('booking.action.workDone') }).click();
  await p.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(p.getByText(t('booking.status.completed')).first()).toBeVisible();
  await p.goto(`/job-requests/${jobId}`);
  await expect(p.getByText(t('jobs.state.done'), { exact: true }).first()).toBeVisible();
  await p.getByRole('button', { name: t('jobs.detail.close') }).click();
  const dialog = p.getByRole('dialog', { name: t('jobs.close.title') });
  await dialog.locator('label:has(input[name=closeReason][value=work_done])').click();
  await dialog.getByRole('button', { name: t('jobs.close.confirm') }).click();
  await expect(p.getByText(t('jobs.state.closed'), { exact: true }).first()).toBeVisible();
  const after = await (await p.request.get(`/api/bookings/${bookingId}`)).json();
  expect(after.booking.status).toBe('completed');
  watch.assertClean();
  await worker.context.close();
  await other.context.close();
  await customer.context.close();
});

test('the first step: a tie selects nothing and asks the person; an Urdu text in the Urdu website', async ({ browser }) => {
  test.setTimeout(120_000);
  const customer = await newCustomer(browser, 'E2E M6 Tie Customer (synthetic)');
  const p = customer.page;
  await p.goto('/job-requests/new');
  await p.getByRole('textbox', { name: t('jobs.describe.label') }).fill('Mujhe kal ek electrician aur ek plumber chahiye');
  await p.getByRole('button', { name: t('jobs.new.toDetails') }).click();
  await expect(p.getByText(t('jobs.form.tie'))).toBeVisible();
  await expect(p.locator('input[name=category]:checked')).toHaveCount(0);
  const order = await p.locator('input[name=category]').evaluateAll((els) => els.slice(0, 2).map((e) => e.value));
  expect(order).toEqual(['electrical_solar', 'plumbing_sanitary']);

  const tu = T('ur');
  await p.request.patch('/api/users/me/preferences', { data: { preferredLanguage: 'ur' } });
  await setLanguage(p, 'ur');
  await p.goto('/job-requests/new');
  await expect(p.locator('html')).toHaveAttribute('dir', 'rtl');
  await p.getByRole('textbox', { name: tu('jobs.describe.label') }).fill('پنکھا نہیں چل رہا، آج شام کو کوئی آ جائے');
  await p.getByRole('button', { name: tu('jobs.describe.check') }).click();
  await expect(p.getByTestId('found-words')).toContainText('پنکھا');
  await p.getByRole('button', { name: tu('jobs.new.toDetails') }).click();
  await expect(p.locator('input[name=category][value=electrical_solar]')).toBeChecked();
  await expect(p.locator('input[name=day][value=today]')).toBeChecked();
  await expect(p.locator('input[name=timeSlot][value=evening]')).toBeChecked();
  await customer.context.close();
});

test('admin: the job in the list (no budget), the stats page with its fixed note, and the try box', async ({ browser }) => {
  test.setTimeout(120_000);
  const customer = await newCustomer(browser, 'E2E M6 Admin-view Customer (synthetic)');
  const job = await apiJob(customer);
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  await login(page, E2E_ADMIN.email, E2E_ADMIN.password);
  await page.goto('/admin/job-requests');
  await page.getByRole('textbox', { name: t('jobs.admin.search') }).fill(job.code);
  await page.getByRole('button', { name: t('jobs.admin.find') }).click();
  const row = page.getByRole('row').filter({ hasText: job.code });
  await expect(row).toContainText('E2E M6 Admin-view Customer (synthetic)');
  await expect(page.getByRole('table')).not.toContainText(/2,500|Budget/);
  await page.getByRole('button', { name: `Open ${job.code}` }).click();
  await expect(page.getByTestId('admin-job-drawer').getByTestId('job-budget')).toContainText('Rs 2,500');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: t('jobs.admin.tabs.stats') }).click();
  await expect(page.getByTestId('job-stats')).toContainText(t('jobs.admin.stats.note'));
  await page.getByRole('tab', { name: t('jobs.admin.tabs.try') }).click();
  await page.getByRole('textbox', { name: t('jobs.admin.try.label') }).fill(TEXT);
  await page.getByRole('button', { name: t('jobs.admin.try.run') }).click();
  await expect(page.getByTestId('try-table').locator('tr[data-field="category"]')).toContainText('Plumbing & Sanitary');
  await expect(page.getByText(t('jobs.admin.try.nothingSaved'))).toBeVisible();
  await context.close();
  await customer.context.close();
});

// axe (serious and critical) on every new page, in every language and both themes; no sideways scrolling at 360,
// 768 and 1280 px (checked by position: the page is never wider than the window)
for (const lang of LANGS) for (const mode of ['light', 'dark']) {
  test(`axe and widths: the Module 6 pages in ${lang}, ${mode} mode`, async ({ browser }) => {
    test.setTimeout(240_000);
    const tl = T(lang);
    const worker = await newPlumber(browser, `E2E Axe M6 Plumber ${Date.now()} (synthetic)`);
    const customer = await newCustomer(browser, 'E2E Axe M6 Customer (synthetic)');
    const p = customer.page;
    const job = await apiJob(customer);
    const sent = await apiJob(customer, { taskType: 'install' });
    const request = await p.request.post(`/api/job-requests/${sent._id}/request`, { data: { jobVersion: 1, workerIdCode: worker.code, skillId: 'plumb_leak', preferredDate: pktDay(1), timeSlot: 'morning' } });
    expect(request.status(), await request.text()).toBe(201);
    await setMode(p, mode);
    await p.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    await setLanguage(p, lang);
    const problems = [];
    const check = async (label) => {
      await p.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page: p }).withTags(WCAG).analyze();
      problems.push(...result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang} ${mode} ${label}: ${v.id} ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
      for (const width of [360, 768, 1280]) {
        await p.setViewportSize({ width, height: 800 });
        const wide = await p.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: document.documentElement.clientWidth }));
        if (wide.scroll > wide.width) problems.push(`${lang} ${mode} ${label} at ${width}px: the page is ${wide.scroll}px wide`);
      }
      await p.setViewportSize({ width: 1280, height: 800 });
    };
    await p.goto('/job-requests/new');
    await p.getByRole('textbox', { name: tl('jobs.describe.label') }).fill(TEXT);
    await p.getByRole('button', { name: tl('jobs.describe.check') }).click();
    await expect(p.getByTestId('found-words')).toBeVisible();
    await check('describe, step 1');
    await p.getByRole('button', { name: tl('jobs.new.toDetails') }).click();
    await expect(p.getByTestId('job-budget-step')).toBeVisible();
    await check('describe, step 2');
    await p.goto('/job-requests');
    await expect(p.getByTestId('job-card').first()).toBeVisible();
    await check('my job requests');
    await p.goto(`/job-requests/${sent._id}`);
    await expect(p.getByTestId('job-bookings')).toBeVisible();
    await p.locator('details').first().evaluate((d) => { d.open = true; });
    await check('job request page');
    await p.goto(`/job-requests/${job._id}/edit`);
    await expect(p.getByTestId('job-budget-step')).toBeVisible();
    await check('edit');
    await p.goto(`/job-requests/${job._id}/workers`);
    await expect(p.getByTestId('not-ranked')).toBeVisible();
    await check('workers for this job');
    await p.goto(`/workers/${worker.code}/request?job=${job._id}`);
    await expect(p.getByTestId('your-job')).toBeVisible();
    await check('request with the job');
    await p.goto(`/job-requests/${job._id}`);
    await p.getByRole('button', { name: tl('jobs.detail.close') }).click();
    await expect(p.getByTestId('close-job-dialog')).toBeVisible();
    await check('close dialog');
    // the worker's side of a request from a job
    await worker.page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    await setMode(worker.page, mode);
    await setLanguage(worker.page, lang);
    await worker.page.goto('/worker/requests');
    await expect(worker.page.getByTestId('from-job').first()).toBeVisible();
    const workerAxe = await new AxeBuilder({ page: worker.page }).withTags(WCAG).analyze();
    problems.push(...workerAxe.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang} ${mode} worker requests: ${v.id}`));
    // the admin page (three tabs)
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const admin = await context.newPage();
    await setLanguage(admin, lang);
    await setMode(admin, mode);
    await login(admin, E2E_ADMIN.email, E2E_ADMIN.password, lang);
    await admin.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    for (const tab of ['list', 'stats', 'try']) {
      await admin.goto('/admin/job-requests');
      await admin.getByRole('tab', { name: T(lang)(`jobs.admin.tabs.${tab}`) }).click();
      await admin.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page: admin }).withTags(WCAG).analyze();
      problems.push(...result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang} ${mode} admin ${tab}: ${v.id} ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
    }
    expect(problems).toEqual([]);
    await context.close();
    await worker.context.close();
    await customer.context.close();
  });
}
