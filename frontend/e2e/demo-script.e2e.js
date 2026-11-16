// The defence demo (docs/DEMO-SCRIPT.md), click for click, so it can never break silently before the
// demo day. Synthetic accounts in the e2e database only. Keep this file and the script in step.
//   1. A worker chooses Urdu, registers and completes onboarding (Module 1).
//   2. Skills are suggested from an Urdu sentence by the rule-based extractor (Module 2).
//   3. The worker uploads a proof photo; the admin approves it (Module 3).
//   4. A customer finds the worker: "Verified by evidence", and no phone number anywhere.
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { E2E_ADMIN } from './accounts.js';
import { T, answerReadAloud, login, registerUser, setLanguage, startsWith, uniqueEmail, watchConsole } from './helpers.js';

const ur = T('ur');
const en = T('en');
const PHOTO = fileURLToPath(new URL('../../docs/demo/work-photo-synthetic.jpg', import.meta.url));
const SENTENCE = 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔'; // the sentence said in the demo
const WORKER = { name: 'Bilal Ahmed (synthetic)', phone: '03000000071', password: 'demo pass phrase 2026' };

test('defence demo: Urdu onboarding -> suggested skills -> proof -> admin approves -> customer sees verified skill, no phone', async ({ browser }) => {
  test.setTimeout(180_000);

  // 1. Worker, fresh browser: the language chooser, then Urdu everywhere
  const workerContext = await browser.newContext();
  const worker = await workerContext.newPage();
  const workerConsole = watchConsole(worker);
  await worker.goto('/');
  await worker.getByRole('button', { name: /اردو میں جاری رکھیں/ }).click();
  await answerReadAloud(worker, 'ur'); // Batch 5: "should the website read aloud?" (asked once)
  await expect(worker.locator('html')).toHaveAttribute('dir', 'rtl');
  await worker.getByRole('link', { name: ur('landing.joinWorker') }).first().click();
  await expect(worker).toHaveURL(/\/register\?role=worker/);
  await worker.getByLabel(startsWith(ur('auth.register.fullName'))).fill(WORKER.name);
  await worker.getByLabel(startsWith(ur('auth.register.email'))).fill(uniqueEmail('demo.bilal'));
  await worker.getByLabel(startsWith(ur('auth.register.mobile'))).fill(WORKER.phone);
  await worker.locator('input[type=password]').fill(WORKER.password);
  await worker.getByRole('button', { name: ur('auth.register.submit') }).click();

  // Step 1 "About you": name and mobile are already filled; city, and a synthetic CNIC (masked, encrypted)
  await expect(worker).toHaveURL(/\/onboarding\/about$/);
  await worker.getByLabel(startsWith(ur('about.city'))).fill('راولپنڈی');
  const cnic = `35202${String(Date.now()).slice(-7)}1`;
  await worker.getByLabel(startsWith(ur('about.cnic'))).fill(cnic);
  await expect(worker.getByLabel(startsWith(ur('about.cnic')))).toHaveValue(`${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`);
  await worker.getByRole('button', { name: ur('onboarding.saveContinue') }).click();

  // Step 2 "Your work"
  await expect(worker).toHaveURL(/\/onboarding\/work$/);
  await worker.locator('label:has(input[name=category][value=electrical_solar])').click(); // the trade picture (Batch 5)
  await worker.getByLabel(startsWith(ur('work.experience'))).fill('5');
  await worker.getByLabel(startsWith(ur('work.daily'))).fill('4000');
  await worker.getByRole('button', { name: ur('onboarding.saveContinue') }).click();

  // 2. Step 3 "Your skills": the rule-based extractor reads the Urdu sentence
  await expect(worker).toHaveURL(/\/onboarding\/skills$/);
  await worker.getByLabel(startsWith(ur('skills.describeLabel'))).fill(SENTENCE);
  await worker.getByRole('button', { name: ur('skills.find') }).click();
  const suggestions = worker.getByRole('checkbox');
  await expect(suggestions.first()).toBeVisible();
  expect(await suggestions.count()).toBeGreaterThanOrEqual(2); // house wiring and solar panel installation
  await worker.getByRole('button', { name: new RegExp(ur('skills.addSelected')) }).click();
  await worker.getByRole('button', { name: ur('common.continue'), exact: true }).click();

  // 3. Step 4 "Proof of skills": a synthetic work photo for house wiring
  await expect(worker).toHaveURL(/\/onboarding\/proof$/);
  await worker.locator('label:has(input[name=evidence-skill][value=elec_wiring])').click(); // the skill picture (Batch 5)
  await worker.getByRole('radio', { name: new RegExp(ur('evidence.types.work_photo.title')) }).check();
  await worker.locator('input[type=file]').setInputFiles(PHOTO);
  await worker.getByRole('checkbox', { name: startsWith(ur('evidence.consent')) }).check();
  await worker.getByRole('button', { name: ur('evidence.form.submit') }).click();
  await expect(worker.getByText(ur('status.evidence.pending')).first()).toBeVisible();
  await worker.getByRole('button', { name: ur('common.continue'), exact: true }).click();
  await expect(worker).toHaveURL(/\/onboarding\/done$/);
  await expect(worker.getByText(ur('onboarding.celebrate'))).toBeVisible();
  const workerId = (await worker.getByText(/DLM-\d{4}-\d{6}/).first().textContent()).trim();

  // Admin (second window, English): approve the photo
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await setLanguage(admin, 'en');
  await login(admin, E2E_ADMIN.email, E2E_ADMIN.password);
  await admin.getByRole('link', { name: en('admin.nav.evidence') }).first().click();
  await admin.getByRole('button', { name: new RegExp(`${WORKER.name.replace(/[()]/g, '\\$&')}.*House wiring`) }).first().click();
  const drawer = admin.getByRole('dialog', { name: /House wiring/ });
  await expect(drawer.getByRole('img').first()).toBeVisible();
  await drawer.getByRole('button', { name: en('admin.evidence.actions.approve.label'), exact: true }).click();
  const confirm = admin.getByRole('dialog', { name: en('admin.evidence.actions.approve.title') });
  await confirm.getByRole('button', { name: en('admin.evidence.actions.approve.label') }).click();
  await expect(drawer.getByText(en('status.evidence.approved')).first()).toBeVisible();
  await adminContext.close();

  // The worker's bell (in Urdu) has the decision
  await worker.goto('/worker');
  await expect(worker.getByRole('button', { name: new RegExp(ur('workerx.notifications.bell')) }).first()).toBeVisible();

  // 4. Customer (English): finds the worker; the skill is verified; no phone number anywhere
  const customerContext = await browser.newContext();
  const customer = await customerContext.newPage();
  const customerConsole = watchConsole(customer);
  await setLanguage(customer, 'en');
  await registerUser(customer, { role: 'customer', email: uniqueEmail('demo.customer') });
  await customer.getByRole('searchbox', { name: en('find.searchLabel') }).fill('wiring');
  await customer.getByRole('link', { name: WORKER.name }).first().click();
  await expect(customer).toHaveURL(new RegExp(`/workers/${workerId}$`));
  await expect(customer.getByText(en('status.skill.verified')).first()).toBeVisible();
  await expect(customer.getByText(en('profile.contactNote'))).toBeVisible();
  const page = await customer.content();
  expect(page).not.toContain(WORKER.phone);
  expect(page).not.toContain(cnic);

  workerConsole.assertClean();
  customerConsole.assertClean();
  await workerContext.close();
  await customerContext.close();
});
