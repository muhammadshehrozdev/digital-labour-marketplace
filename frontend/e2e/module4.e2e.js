// Module 4 (Batch 6) end to end: a customer requests a worker, the worker hears the request and accepts,
// both see the Call button, both press "Work done", the customer rates, and the public profile and the
// directory card show the new reputation. Then: a late cancellation in the reliability record, a no-show
// that the worker disputes and an admin decides, a reported review that an admin hides, and the new sort.
// Synthetic accounts, the e2e database only. Time is moved in the e2e DATABASE (never waited for).
import { test, expect } from '@playwright/test';
import mongoose from '../../backend/node_modules/mongoose/index.js';
import { T, login, readyWorker, registerUser, setLanguage, skipTour, uniqueEmail, watchConsole } from './helpers.js';
import { E2E_ADMIN } from './accounts.js';

const t = T('en');
const E2E_URI = process.env.E2E_MONGO_URI || 'mongodb://127.0.0.1:27017/dlm_e2e';
const phone = () => `0300${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`;
const pktDay = (offset = 0) => new Date(Date.now() + 5 * 3600e3 + offset * 864e5).toISOString().slice(0, 10);

// Moves a booking's start time into the past in the e2e database (a no-show can be reported only
// from the start + 2 hours). Refuses anything but a local *_e2e database, like global-setup.js.
async function startHoursAgo(bookingId, hours) {
  const { hostname, pathname } = new URL(E2E_URI.replace(/^mongodb:/, 'http:'));
  if (!['127.0.0.1', 'localhost'].includes(hostname) || !pathname.endsWith('_e2e')) throw new Error('e2e database only');
  const conn = await mongoose.createConnection(E2E_URI, { serverSelectionTimeoutMS: 5000 }).asPromise();
  await conn.collection('bookings').updateOne({ _id: new mongoose.Types.ObjectId(bookingId) }, { $set: { scheduledStart: new Date(Date.now() - hours * 3600e3) } });
  await conn.close();
}

async function newWorker(browser, name) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  const tag = `m4tag${Date.now()}`; // the directory searches the bio, not the name
  const made = await readyWorker(page, { name, bio: `Synthetic e2e worker ${tag}` });
  const number = phone();
  const whatsapp = phone();
  expect((await page.request.put('/api/workers/me', { data: { phone: number, whatsappNumber: whatsapp } })).ok()).toBe(true);
  const code = (await (await page.request.get('/api/workers/me')).json()).workerIdCode;
  await page.goto('/worker');
  await skipTour(page);
  return { context, page, ...made, code, phone: number, whatsapp, tag };
}

async function newCustomer(browser, name) {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await setLanguage(page, 'en');
  const number = phone();
  const made = await registerUser(page, { role: 'customer', name, email: uniqueEmail('e2e.m4.customer'), phone: number });
  return { context, page, ...made, phone: number };
}

// A booking made and moved through the API (for the tests whose subject comes later).
async function apiBooking(customer, worker, extra = {}) {
  const res = await customer.page.request.post('/api/bookings', { data: { workerIdCode: worker.code, skillId: 'elec_wiring', preferredDate: pktDay(1), timeSlot: 'morning', city: 'Rawalpindi', area: 'Satellite Town', description: 'E2E synthetic job.', ...extra } });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()).booking;
}
const step = async (who, id, action, data = {}) => {
  const res = await who.page.request.post(`/api/bookings/${id}/${action}`, { data });
  expect(res.ok(), await res.text()).toBe(true);
  return (await res.json()).booking;
};

test('request -> hear and accept -> both see Call -> both press Work done -> rate -> profile and card show the reputation', async ({ browser }) => {
  test.setTimeout(150_000);
  const worker = await newWorker(browser, `E2E Request Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Request Customer (synthetic)');
  const watch = watchConsole(customer.page);

  // the customer sends the request with picture choices
  await customer.page.goto(`/workers/${worker.code}/request`);
  await expect(customer.page.getByRole('group', { name: t('booking.request.skill') })).toBeVisible();
  await customer.page.locator('label:has(input[name=timeSlot][value=afternoon])').click();
  await customer.page.getByLabel(/^Area or sector/).fill('G-9 Markaz');
  await customer.page.getByLabel(/^What is the work/).fill('Two sockets in the kitchen do not work.');
  await customer.page.getByRole('button', { name: t('booking.request.send') }).click();
  await expect(customer.page).toHaveURL(/\/bookings\/[a-f0-9]{24}$/);
  const bookingId = customer.page.url().split('/').pop();
  await expect(customer.page.getByText(t('booking.contact.hiddenCustomer'))).toBeVisible();

  // the worker sees the count, hears the request (or sees that this browser has no voice), accepts
  await worker.page.goto('/worker/requests');
  await expect(worker.page.getByTestId('requests-count').first()).toContainText('1');
  const card = worker.page.getByTestId('booking-card').first();
  await expect(card.getByText('Two sockets in the kitchen do not work.')).toBeVisible();
  await card.getByRole('button', { name: t('booking.hear.button') }).click();
  await expect(card.getByRole('button', { name: t('booking.hear.button'), pressed: true }).or(card.getByText(t('booking.hear.noVoice')))).toBeVisible();
  await card.getByRole('button', { name: t('booking.action.accept') }).click();
  await expect(worker.page.getByText(t('booking.done.accepted'))).toBeVisible();

  // both see the other's number with a Call button (and the worker's WhatsApp)
  await worker.page.goto('/worker/jobs');
  await expect(worker.page.getByRole('link', { name: t('booking.contact.call') }).first()).toHaveAttribute('href', `tel:${customer.phone}`);
  await customer.page.reload();
  const contact = customer.page.getByTestId('contact-card');
  await expect(contact.getByRole('link', { name: t('booking.contact.call') })).toHaveAttribute('href', `tel:${worker.phone}`);
  await expect(contact.getByRole('link', { name: t('booking.contact.whatsapp') })).toHaveAttribute('href', `https://wa.me/92${worker.whatsapp.slice(1)}`);

  // both press "Work done"
  await worker.page.getByRole('button', { name: t('booking.action.workDone') }).first().click();
  await worker.page.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(worker.page.getByText(t('booking.done.confirmed'))).toBeVisible();
  await customer.page.reload();
  await customer.page.getByRole('button', { name: t('booking.action.workDone') }).click();
  await customer.page.getByRole('dialog').getByRole('button', { name: t('booking.action.workDone') }).click();
  await expect(customer.page.getByText(t('booking.status.completed')).first()).toBeVisible();

  // the customer rates: five stars, "on time: yes", a comment, the read-back dialog, send
  await customer.page.getByRole('link', { name: t('booking.action.rate') }).click();
  await expect(customer.page).toHaveURL(new RegExp(`/bookings/${bookingId}/rate$`));
  await customer.page.locator('label:has(input[name=rating][value="5"])').click();
  await customer.page.locator('label:has(input[name=onTime][value=yes])').click();
  await customer.page.getByLabel(/^Comment/).fill('Fixed both sockets quickly. [e2e]');
  await customer.page.getByRole('button', { name: t('booking.rate.check') }).click();
  const confirm = customer.page.getByRole('dialog', { name: t('booking.rate.confirmTitle') });
  await expect(confirm.getByText('Fixed both sockets quickly. [e2e]')).toBeVisible();
  await confirm.getByRole('button', { name: t('booking.rate.send') }).click();
  await expect(customer.page).toHaveURL(new RegExp(`/bookings/${bookingId}$`));

  // the public profile and the directory card show the new reputation (words and counts only)
  await customer.page.goto(`/workers/${worker.code}`);
  const panel = customer.page.getByTestId('reputation-panel');
  await expect(panel).toContainText('5.0');
  await expect(panel).toContainText(t('reputation.depth.few'));
  await expect(panel).toContainText('1 job done on this platform');
  await expect(customer.page.getByText('Fixed both sockets quickly. [e2e]')).toBeVisible();
  await expect(customer.page.getByTestId('verified-history')).toContainText(t('reputation.historyLabel'));
  await customer.page.goto(`/find?q=${worker.tag}`);
  await expect(customer.page.getByTestId('rating-badge').first()).toContainText('5.0 (1)');
  await expect(customer.page.getByTestId('rating-badge').first()).toContainText('1 job');
  watch.assertClean();
  await worker.context.close();
  await customer.context.close();
});

test('a late cancellation by the worker shows in the reliability record and on My reputation', async ({ browser }) => {
  test.setTimeout(90_000);
  const worker = await newWorker(browser, `E2E Late Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Late Customer (synthetic)');
  const b = await apiBooking(customer, worker, { preferredDate: pktDay(0), timeSlot: 'any' });
  await step(worker, b._id, 'accept');
  await worker.page.goto('/worker/jobs');
  await worker.page.getByRole('button', { name: t('booking.action.cancel') }).first().click();
  const dialog = worker.page.getByRole('dialog', { name: t('booking.dialog.cancelTitle') });
  await expect(dialog.getByText(t('booking.dialog.lateWarning'))).toBeVisible();
  await dialog.locator('label:has(input[value=cannot_come])').click();
  await dialog.getByRole('button', { name: t('booking.dialog.cancelConfirm') }).click();
  await expect(worker.page.getByText(t('booking.done.cancelled'))).toBeVisible();
  await worker.page.goto('/worker/reputation');
  await expect(worker.page.getByText(t('booking.outcome.cancelled_by_worker_late')).first()).toBeVisible();
  await customer.page.goto(`/workers/${worker.code}`);
  await expect(customer.page.getByTestId('reputation-panel')).toContainText('1 cancelled by the worker');
  await worker.context.close();
  await customer.context.close();
});

test('a no-show is reported, the worker says "I did come", an admin decides', async ({ browser }) => {
  test.setTimeout(120_000);
  const worker = await newWorker(browser, `E2E NoShow Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E NoShow Customer (synthetic)');
  const b = await apiBooking(customer, worker, { preferredDate: pktDay(0), timeSlot: 'any' });
  await step(worker, b._id, 'accept');
  await startHoursAgo(b._id, 3);

  await customer.page.goto(`/bookings/${b._id}`);
  await customer.page.getByRole('button', { name: t('booking.action.noShow') }).click();
  await customer.page.getByRole('dialog').getByRole('button', { name: t('booking.action.noShow') }).click();
  await expect(customer.page.getByText(t('booking.done.noShow'))).toBeVisible();

  await worker.page.goto('/worker/jobs');
  await expect(worker.page.getByText(t('booking.jobs.noShowAsked'))).toBeVisible();
  await worker.page.getByRole('button', { name: t('booking.action.iCame') }).first().click();
  const dialog = worker.page.getByRole('dialog', { name: t('booking.dialog.iCameTitle') });
  await dialog.getByLabel(/^What happened/).fill('I was at the gate at nine. [e2e]');
  await dialog.getByRole('button', { name: t('booking.action.iCame') }).click();
  await expect(worker.page.getByText(t('booking.done.disputed'))).toBeVisible();

  const admin = await browser.newContext({ reducedMotion: 'reduce' });
  const adminPage = await admin.newPage();
  await setLanguage(adminPage, 'en');
  await login(adminPage, E2E_ADMIN.email, E2E_ADMIN.password);
  await adminPage.goto('/admin/disputes');
  await adminPage.getByRole('button', { name: `Open booking ${b.code}` }).click();
  const drawer = adminPage.getByRole('dialog');
  await expect(drawer.getByText('“I was at the gate at nine. [e2e]”')).toBeVisible();
  await drawer.locator('label:has(input[value=no_show_rejected])').click();
  await drawer.getByLabel(/^Note for the record/).fill('Both called; the worker was there. [e2e]');
  await drawer.getByRole('button', { name: t('adminm4.disputes.save') }).click();
  await expect(adminPage.getByText(t('adminm4.disputes.saved'))).toBeVisible();
  await customer.page.goto(`/bookings/${b._id}`);
  await expect(customer.page.getByText(t('booking.dispute.decision.no_show_rejected'))).toBeVisible();
  await admin.close();
  await worker.context.close();
  await customer.context.close();
});

test('the worker reports a review, an admin hides it: the list and the score change', async ({ browser }) => {
  test.setTimeout(120_000);
  const worker = await newWorker(browser, `E2E Report Worker ${Date.now()} (synthetic)`);
  const customer = await newCustomer(browser, 'E2E Report Customer (synthetic)');
  const b = await apiBooking(customer, worker);
  await step(worker, b._id, 'accept');
  await step(worker, b._id, 'confirm-done');
  await step(customer, b._id, 'confirm-done');
  expect((await customer.page.request.post(`/api/bookings/${b._id}/review`, { data: { rating: 2, comment: 'This is about another job. [e2e]' } })).status()).toBe(201);

  await worker.page.goto('/worker/reviews');
  await worker.page.getByRole('button', { name: t('reputation.mine.report'), exact: true }).first().click();
  const report = worker.page.getByRole('dialog', { name: t('reputation.mine.reportTitle') });
  await report.locator('label:has(input[value=not_about_my_work])').click();
  await report.getByRole('button', { name: t('reputation.mine.report'), exact: true }).click();
  await expect(worker.page.getByText(t('reputation.mine.reported'))).toBeVisible();

  await customer.page.goto(`/workers/${worker.code}`);
  await expect(customer.page.getByTestId('reputation-panel')).toContainText('2.0');

  const admin = await browser.newContext({ reducedMotion: 'reduce' });
  const adminPage = await admin.newPage();
  await setLanguage(adminPage, 'en');
  await login(adminPage, E2E_ADMIN.email, E2E_ADMIN.password);
  await adminPage.goto('/admin/reviews');
  const card = adminPage.getByTestId('admin-review').filter({ hasText: 'This is about another job. [e2e]' });
  await expect(card.getByText(t('adminm4.reviews.reportedBadge'))).toBeVisible();
  await card.getByRole('button', { name: t('adminm4.reviews.hide') }).click();
  const dialog = adminPage.getByRole('dialog', { name: t('adminm4.reviews.hideTitle') });
  await expect(dialog.getByText(t('adminm4.reviews.neverNegative'))).toBeVisible();
  await dialog.locator('label:has(input[value=unrelated])').click();
  await dialog.getByRole('button', { name: t('adminm4.reviews.hide') }).click();
  await expect(adminPage.getByText(t('adminm4.reviews.hidden'))).toBeVisible();

  await customer.page.reload();
  await expect(customer.page.getByTestId('reputation-panel')).toContainText(t('reputation.depth.none'));
  await expect(customer.page.getByText('This is about another job. [e2e]')).toHaveCount(0);
  await admin.close();
  await worker.context.close();
  await customer.context.close();
});

test('"Best track record" sort with its honest note, and the "Has done jobs" filter', async ({ browser }) => {
  const customer = await newCustomer(browser, 'E2E Sort Customer (synthetic)');
  await customer.page.goto('/find?sort=track_record');
  await expect(customer.page.getByTestId('track-note')).toHaveText(t('reputation.sortTrackNote'));
  await expect(customer.page.getByLabel(/^Sort by/)).toHaveValue('track_record');
  await customer.page.getByRole('switch', { name: t('reputation.hasJobs') }).first().click();
  await expect(customer.page).toHaveURL(/hasJobs=true/);
  await customer.context.close();
});
