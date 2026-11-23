// Module 5 (Batch 7) end to end: a customer requests with a price offer and sees the price information; the
// worker hears the offer, accepts and agrees; both see "Price agreed"; both press "Work done"; the customer
// records the payment, the worker confirms it, My earnings shows it, the printable record opens. Then: a
// below-minimum offer warns both people, a price change and its history, a disputed payment on both sides and on
// the admin Payments page, the admin price guide as the fallback, and axe on the new parts in three languages
// and both themes. Synthetic accounts, the e2e database only; every amount is synthetic test data.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LANGS, T, login, readyWorker, registerUser, setLanguage, setMode, skipTour, uniqueEmail, watchConsole } from './helpers.js';
import { E2E_ADMIN } from './accounts.js';

const t = T('en');
const phone = () => `0300${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;
const pktDay = (offset = 0) => new Date(Date.now() + 5 * 3600e3 + offset * 864e5).toISOString().slice(0, 10);
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function newWorker(browser, name) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  const made = await readyWorker(page, { name, bio: `Synthetic e2e worker m5 ${Date.now()}` });
  expect((await page.request.put('/api/workers/me', { data: { phone: phone(), city: 'Islamabad' } })).ok()).toBe(true);
  const code = (await (await page.request.get('/api/workers/me')).json()).workerIdCode;
  await page.goto('/worker');
  await skipTour(page);
  return { context, page, ...made, code };
}

async function newCustomer(browser, name) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  const made = await registerUser(page, { role: 'customer', name, email: uniqueEmail('e2e.m5.customer'), phone: phone() });
  return { context, page, ...made };
}

const post = async (who, url, data = {}) => {
  const res = await who.page.request.post(url, { data });
  expect(res.ok(), await res.text()).toBe(true);
  return (await res.json()).booking;
};
const apiBooking = (customer, worker, extra = {}) => post(customer, '/api/bookings', {
  workerIdCode: worker.code, skillId: 'elec_wiring', preferredDate: pktDay(1), timeSlot: 'morning', city: 'Islamabad', area: 'G-9', description: 'E2E synthetic job.', ...extra,
});
// a booking with an agreed price, completed by both (through the API: the subject of the test comes later)
async function completedWithPrice(customer, worker, amount = 2500) {
  const b = await apiBooking(customer, worker, { offer: { amount, unit: 'job', duration: 'few_hours' } });
  await post(worker, `/api/bookings/${b._id}/accept`);
  await post(worker, `/api/bookings/${b._id}/terms/agree`, { version: 1 });
  await post(worker, `/api/bookings/${b._id}/confirm-done`);
  await post(customer, `/api/bookings/${b._id}/confirm-done`);
  return b;
}

test('offer -> hear and accept -> agree -> Work done -> the customer records the payment -> the worker confirms -> My earnings -> printable record', async ({ browser }) => {
  test.setTimeout(150_000);
  const worker = await newWorker(browser, `E2E Price Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Price Customer (synthetic)');
  const watch = watchConsole(customer.page);

  // the customer sees the price information and offers a price for the whole job
  await customer.page.goto(`/workers/${worker.code}/request`);
  const info = customer.page.getByTestId('request-price-info');
  await expect(info).toBeVisible();
  await expect(info.getByTestId('wage-ref')).toContainText('Government minimum wage for unskilled work in Islamabad');
  await customer.page.getByRole('button', { name: t('wage.offer.open') }).click();
  await customer.page.getByRole('textbox', { name: t('wage.form.amount.job') }).fill('2500');
  await customer.page.locator('label:has(input[name=offer-duration][value=few_hours])').click();
  await customer.page.getByLabel(/^Area or sector/).fill('G-9 Markaz');
  await customer.page.getByRole('button', { name: t('booking.request.send') }).click();
  await expect(customer.page).toHaveURL(/\/bookings\/[a-f0-9]{24}$/);
  const bookingId = customer.page.url().split('/').pop();
  await expect(customer.page.getByTestId('terms-summary')).toContainText(t('wage.terms.proposedBy', { by: t('wage.terms.by.customer') }));

  // the worker sees the offer on the card, hears it (or sees there is no voice), accepts: the price part opens
  await worker.page.goto('/worker/requests');
  const card = worker.page.getByTestId('booking-card').first();
  await expect(card.getByTestId('price-state')).toContainText('Offer: Rs 2,500 for the whole job');
  await card.getByRole('button', { name: t('booking.hear.button') }).click();
  await expect(card.getByRole('button', { name: t('booking.hear.button'), pressed: true }).or(card.getByText(t('booking.hear.noVoice')))).toBeVisible();
  await card.getByRole('button', { name: t('booking.action.accept') }).click();
  await expect(worker.page).toHaveURL(new RegExp(`/worker/jobs/${bookingId}`));
  const terms = worker.page.getByTestId('terms-summary');
  await terms.getByRole('button', { name: t('wage.terms.agree') }).click();
  const agree = worker.page.getByRole('dialog', { name: t('wage.terms.agreeTitle') });
  await expect(agree.getByTestId('agree-read-back')).toContainText('You agree to: Rs 2,500 for the whole job.');
  await agree.getByRole('button', { name: t('wage.terms.agree') }).click();
  await expect(terms.getByTestId('price-agreed')).toContainText('Price agreed: Rs 2,500 for the whole job');
  await customer.page.reload();
  await expect(customer.page.getByTestId('price-agreed')).toContainText('Price agreed: Rs 2,500 for the whole job');

  // both press "Work done"
  await worker.page.getByRole('button', { name: t('booking.action.workDone') }).first().click();
  await worker.page.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(worker.page.getByText(t('booking.done.confirmed'))).toBeVisible();
  await customer.page.reload();
  await customer.page.getByRole('button', { name: t('booking.action.workDone') }).click();
  await customer.page.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(customer.page.getByText(t('booking.status.completed')).first()).toBeVisible();

  // the customer records "I paid Rs 2,500 in cash"
  const pay = customer.page.getByTestId('payments-card');
  await pay.getByRole('button', { name: t('wage.pay.record') }).click();
  const record = customer.page.getByRole('dialog', { name: t('wage.pay.recordTitle.customer') });
  await record.getByRole('textbox', { name: t('wage.pay.amount') }).fill('2500');
  await record.getByRole('button', { name: t('wage.pay.save') }).click();
  await expect(customer.page.getByText(t('wage.pay.recordedDone'))).toBeVisible();
  await expect(pay.getByTestId('payment-records')).toContainText(t('wage.record.awaiting_confirmation'));

  // the worker confirms "Yes, I received it"
  await worker.page.reload();
  const wpay = worker.page.getByTestId('payments-card');
  await wpay.getByRole('button', { name: t('wage.pay.yes.worker') }).click();
  await worker.page.getByRole('dialog', { name: t('wage.pay.confirmTitle.worker') }).getByRole('button', { name: t('wage.pay.yes.worker') }).click();
  await expect(worker.page.getByText(t('wage.pay.confirmedDone'))).toBeVisible();
  await expect(wpay.getByTestId('payment-summary')).toContainText('Agreed Rs 2,500 · Confirmed paid Rs 2,500 · Nothing left to pay');

  // My earnings counts it (only confirmed money)
  await worker.page.goto('/worker/earnings');
  await expect(worker.page.getByTestId('earnings-this-month')).toContainText('Rs 2,500');

  // the printable payment record
  await customer.page.reload();
  await customer.page.getByRole('link', { name: t('wage.pay.printable') }).click();
  await expect(customer.page).toHaveURL(new RegExp(`/bookings/${bookingId}/payment-record$`));
  const printable = customer.page.getByTestId('payment-record');
  await expect(printable).toContainText('Rs 2,500 for the whole job');
  await expect(printable.getByTestId('not-a-receipt')).toContainText('It is not a bank receipt.');
  watch.assertClean();
  await worker.context.close();
  await customer.context.close();
});

test('an offer below the minimum wage reference warns both people (and never blocks)', async ({ browser }) => {
  test.setTimeout(90_000);
  const worker = await newWorker(browser, `E2E Low Offer Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Low Offer Customer (synthetic)');
  await customer.page.goto(`/workers/${worker.code}/request`);
  await customer.page.getByRole('button', { name: t('wage.offer.open') }).click();
  await customer.page.locator('label:has(input[name=offer-unit][value=day])').click();
  await customer.page.getByRole('textbox', { name: t('wage.form.amount.day') }).fill('1000');
  const warning = customer.page.getByTestId('offer-step').locator('[data-check=below_minimum_day]');
  await expect(warning).toContainText('less than the government minimum wage reference for one day of work in Islamabad');
  await customer.page.getByLabel(/^Area or sector/).fill('G-9');
  await customer.page.getByRole('button', { name: t('booking.request.send') }).click();
  await expect(customer.page).toHaveURL(/\/bookings\/[a-f0-9]{24}$/); // the warning did not block the request
  const bookingId = customer.page.url().split('/').pop();
  await expect(customer.page.getByTestId('terms-summary').locator('[data-check=below_minimum_day]')).toBeVisible();
  await worker.page.goto(`/worker/jobs/${bookingId}`);
  await expect(worker.page.getByTestId('terms-summary').locator('[data-check=below_minimum_day]')).toContainText('in Islamabad');
  await worker.context.close();
  await customer.context.close();
});

test('a price change is proposed and agreed; the history shows both versions', async ({ browser }) => {
  test.setTimeout(90_000);
  const worker = await newWorker(browser, `E2E Change Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Change Customer (synthetic)');
  const b = await apiBooking(customer, worker, { offer: { amount: 2000, unit: 'job' } });
  await post(worker, `/api/bookings/${b._id}/accept`);
  await post(worker, `/api/bookings/${b._id}/terms/agree`, { version: 1 });
  await worker.page.goto(`/worker/jobs/${b._id}`);
  const terms = worker.page.getByTestId('terms-summary');
  await terms.getByRole('button', { name: t('wage.terms.proposeChange') }).click();
  const form = worker.page.getByTestId('terms-form');
  await form.getByRole('textbox', { name: t('wage.form.amount.job') }).fill('3000');
  await form.locator('label:has(input[value=customer_buys])').click();
  await form.getByRole('button', { name: t('wage.form.checkAndSend') }).click();
  const readBack = worker.page.getByRole('dialog', { name: t('wage.readBack.title') });
  await expect(readBack.getByTestId('terms-read-back')).toContainText('You propose: Rs 3,000 for the whole job. The customer buys the materials.');
  await readBack.getByRole('button', { name: t('wage.readBack.send') }).click();
  await expect(worker.page.getByText(t('wage.terms.sent'))).toBeVisible();
  await expect(terms.getByTestId('price-agreed')).toContainText('Rs 2,000'); // the agreed price stays until the customer agrees

  await customer.page.goto(`/bookings/${b._id}`);
  const cterms = customer.page.getByTestId('terms-summary');
  await expect(cterms).toContainText(t('wage.terms.changeWaiting', { by: t('wage.terms.by.worker') }));
  await cterms.getByRole('button', { name: t('wage.terms.agree') }).click();
  await customer.page.getByRole('dialog', { name: t('wage.terms.agreeTitle') }).getByRole('button', { name: t('wage.terms.agree') }).click();
  await expect(cterms.getByTestId('price-agreed')).toContainText('Price agreed: Rs 3,000 for the whole job');
  await cterms.locator('summary').click();
  const history = cterms.getByTestId('terms-history');
  await expect(history).toContainText('Version 1: proposed by the customer');
  await expect(history).toContainText('Version 2: proposed by the worker');
  await expect(history).toContainText('Version 2: agreed by the customer');
  await worker.context.close();
  await customer.context.close();
});

test('a disputed payment shows on both sides and on the admin Payments page (read-only)', async ({ browser }) => {
  test.setTimeout(120_000);
  const worker = await newWorker(browser, `E2E Dispute Pay Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Dispute Pay Customer (synthetic)');
  const b = await completedWithPrice(customer, worker, 2500);
  await post(worker, `/api/bookings/${b._id}/payments`, { kind: 'final', amount: 3000, method: 'cash', paidOn: pktDay(0) });

  await customer.page.goto(`/bookings/${b._id}`);
  const pay = customer.page.getByTestId('payments-card');
  await pay.getByRole('button', { name: t('wage.pay.notRight') }).click();
  const dialog = customer.page.getByRole('dialog', { name: t('wage.pay.disputeTitle') });
  await dialog.locator('label:has(input[name=pay-reason][value=wrong_amount])').click();
  await dialog.getByRole('button', { name: t('wage.pay.notRight') }).click();
  await expect(customer.page.getByText(t('wage.pay.disputedDone'))).toBeVisible();
  await expect(pay).toContainText(t('wage.state.has_dispute'));
  await worker.page.goto(`/worker/jobs/${b._id}`);
  await expect(worker.page.getByTestId('payments-card')).toContainText(t('wage.pay.disputedBecause', { reason: t('wage.pay.reasons.wrong_amount') }));

  const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
  const admin = await adminContext.newPage();
  await setLanguage(admin, 'en');
  await login(admin, E2E_ADMIN.email, E2E_ADMIN.password);
  await admin.goto('/admin/payments?state=has_dispute');
  await expect(admin.getByText(t('wage.admin.payments.readOnly'))).toBeVisible();
  await admin.getByRole('button', { name: t('adminm4.bookings.open', { code: b.code }) }).click();
  const drawer = admin.getByRole('dialog');
  await expect(drawer.getByTestId('payments-card')).toContainText(t('wage.record.disputed'));
  await expect(drawer.getByRole('button', { name: t('wage.pay.record') })).toHaveCount(0); // read-only for admins
  await adminContext.close();
  await worker.context.close();
  await customer.context.close();
});

test('the admin creates, edits and archives a price guide entry; the customer sees it only while there is no platform range', async ({ browser }) => {
  test.setTimeout(120_000);
  const adminContext = await browser.newContext({ reducedMotion: 'reduce' });
  const admin = await adminContext.newPage();
  await setLanguage(admin, 'en');
  await login(admin, E2E_ADMIN.email, E2E_ADMIN.password);
  await admin.goto('/admin/price-guide');
  await expect(admin.getByText(t('wage.admin.guide.warning')).first()).toBeVisible();
  await admin.getByRole('button', { name: t('wage.admin.guide.new') }).click();
  const form = admin.getByRole('dialog', { name: t('wage.admin.guide.newTitle') });
  await form.getByRole('combobox', { name: t('wage.admin.guide.category') }).selectOption('electrical_solar');
  await form.getByRole('combobox', { name: t('wage.admin.guide.skill') }).selectOption('elec_solar');
  await form.getByRole('combobox', { name: t('wage.admin.guide.region') }).selectOption('ICT');
  await form.getByRole('textbox', { name: t('wage.admin.guide.low') }).fill('8000');
  await form.getByRole('textbox', { name: t('wage.admin.guide.high') }).fill('12000');
  await form.getByRole('button', { name: t('wage.admin.guide.save') }).click();
  await expect(form.getByText(t('errors.SOURCE_NOTE_REQUIRED'))).toBeVisible(); // no source: nothing is saved
  await form.getByRole('textbox', { name: /Source/ }).fill('E2E synthetic source note, not a real survey');
  await form.getByRole('button', { name: t('wage.admin.guide.save') }).click();
  await expect(admin.getByText(t('wage.admin.guide.saved'))).toBeVisible();

  const worker = await newWorker(browser, `E2E Solar Worker ${Date.now()} (synthetic)`);
  expect((await worker.page.request.post('/api/workers/me/skills', { data: { skillIds: ['elec_solar'], addedVia: 'manual' } })).ok()).toBe(true);
  const customer = await newCustomer(browser, 'E2E Guide Customer (synthetic)');
  await customer.page.goto(`/workers/${worker.code}/request`);
  await customer.page.locator('label:has(input[name=skill][value=elec_solar])').click();
  await expect(customer.page.getByTestId('price-guide')).toContainText('Price guide from the admin team: Rs 8,000 to Rs 12,000 for one job');
  await expect(customer.page.getByTestId('price-guide')).toContainText('E2E synthetic source note, not a real survey');

  // edit (new numbers need the source again), then archive: the customer no longer sees it
  await admin.getByRole('row').filter({ hasText: 'E2E synthetic source note' }).getByRole('button', { name: t('wage.admin.guide.edit') }).click();
  const edit = admin.getByRole('dialog', { name: t('wage.admin.guide.editTitle') });
  await edit.getByRole('textbox', { name: t('wage.admin.guide.high') }).fill('13000');
  await edit.getByRole('button', { name: t('wage.admin.guide.save') }).click();
  await expect(admin.getByText('Rs 8,000 – Rs 13,000')).toBeVisible();
  await admin.getByRole('row').filter({ hasText: 'E2E synthetic source note' }).getByRole('button', { name: t('wage.admin.guide.history') }).click();
  await expect(admin.getByTestId('guide-history')).toContainText(t('wage.admin.guide.events.updated'));
  await admin.keyboard.press('Escape');
  await admin.getByRole('row').filter({ hasText: 'E2E synthetic source note' }).getByRole('button', { name: t('wage.admin.guide.archive') }).click();
  await admin.getByRole('dialog', { name: t('wage.admin.guide.archiveTitle') }).getByRole('button', { name: t('wage.admin.guide.archive') }).click();
  await expect(admin.getByText(t('wage.admin.guide.archived'))).toBeVisible();
  await customer.page.reload();
  await customer.page.locator('label:has(input[name=skill][value=elec_solar])').click();
  await expect(customer.page.getByTestId('request-price-info').getByTestId('price-none')).toBeVisible();
  await adminContext.close();
  await worker.context.close();
  await customer.context.close();
});

// axe on the new parts that need a booking: the booking detail with terms and payments, the printable record,
// and the request form with the offer step open, in every language and both themes
for (const lang of LANGS) for (const mode of ['light', 'dark']) {
  test(`axe: price terms, payments, the payment record and the offer step have no serious problems in ${lang}, ${mode} mode`, async ({ browser }) => {
    test.setTimeout(150_000);
    const worker = await newWorker(browser, `E2E Axe M5 Worker ${Date.now()} (synthetic)`);
    const customer = await newCustomer(browser, 'E2E Axe M5 Customer (synthetic)');
    const b = await completedWithPrice(customer, worker, 2500);
    await post(customer, `/api/bookings/${b._id}/payments`, { kind: 'final', amount: 2500, method: 'cash', paidOn: pktDay(0) });
    await setMode(customer.page, mode);
    await customer.page.request.patch('/api/users/me/preferences', { data: { preferredLanguage: lang, preferredTheme: mode } });
    const problems = [];
    const check = async (label) => {
      await customer.page.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page: customer.page }).withTags(WCAG).analyze();
      problems.push(...result.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${lang} ${mode} ${label}: ${v.id} ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
    };
    await customer.page.goto(`/bookings/${b._id}`);
    await expect(customer.page.getByTestId('payments-card')).toBeVisible();
    await check('booking detail');
    await customer.page.goto(`/bookings/${b._id}/payment-record`);
    await expect(customer.page.getByTestId('payment-record')).toBeVisible();
    await check('payment record');
    await customer.page.goto(`/workers/${worker.code}/request`);
    await customer.page.getByRole('button', { name: T(lang)('wage.offer.open') }).click();
    await expect(customer.page.getByTestId('offer-step').getByRole('textbox').first()).toBeVisible();
    await check('request with offer');
    await customer.page.goto('/help#fair-pay');
    await expect(customer.page.getByTestId('wage-table')).toBeVisible();
    await check('help centre fair pay');
    expect(problems).toEqual([]);
    await worker.context.close();
    await customer.context.close();
  });
}
