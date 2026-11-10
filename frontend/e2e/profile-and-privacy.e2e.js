// Batch 3, Part 5 and Part 7.1: profile view -> edit -> save -> view; "See what customers see";
// a customer never sees phone, WhatsApp, email, address, CNIC or proof photos.
import { test, expect } from '@playwright/test';
import { PASSWORD, login, logout, makeJpeg, registerUser, setLanguage, uniqueEmail, watchConsole } from './helpers.js';

const PRIVATE = {
  phone: '03004445566',
  whatsappNumber: '03007778899',
  address: 'House 12 Private Lane',
  emergencyContact: 'Brother Private 03112223344',
};
// Every seeded worker needs its own (synthetic) CNIC: the server refuses a CNIC that is already used.
const syntheticCnic = () => `35202-${String(Date.now()).slice(-7)}-${Math.floor(Math.random() * 10)}`;

// A worker with a complete profile, one skill and one proof photo, made through the API.
async function seedWorker(page) {
  const email = uniqueEmail('e2e.seed');
  const api = page.request;
  const reg = await api.post('/api/auth/register', { data: { name: 'Seeded Worker (synthetic)', email, phone: PRIVATE.phone, password: PASSWORD, role: 'worker', preferredLanguage: 'en' } });
  expect(reg.status()).toBe(201);
  const cnic = syntheticCnic();
  const put = await api.put('/api/workers/me', {
    data: {
      ...PRIVATE, cnicNumber: cnic, city: 'Rawalpindi', occupation: 'Electrician', category: 'electrical_solar', experienceYears: 7, dailyRate: 4500,
      bio: 'Wiring and solar work (synthetic).', workHistory: [{ jobTitle: 'House wiring', clientOrEmployer: 'Private Client Name', duration: '2 weeks', description: 'New house' }],
    },
  });
  expect(put.status()).toBe(200);
  expect((await api.post('/api/workers/me/skills', { data: { skillIds: ['elec_wiring'], addedVia: 'manual' } })).status()).toBe(201);
  await page.goto('/');
  const photo = await makeJpeg(page, Math.floor(Math.random() * 1e6)); // a different picture per worker (no duplicate flag)
  const up = await api.post('/api/evidence', { multipart: { skillId: 'elec_wiring', type: 'work_photo', consent: 'true', image: photo } });
  expect(up.status()).toBe(201);
  const profile = await (await api.get('/api/workers/me')).json();
  const evidenceId = (await up.json()).evidence._id;
  return { email, workerIdCode: profile.workerIdCode, evidenceId, cnicDigits: cnic.split('-')[1] };
}

test('profile view -> edit -> save -> view shows the new data at once; customers see none of the private data', async ({ page }) => {
  const browserConsole = watchConsole(page);
  await setLanguage(page, 'en');
  const { workerIdCode, cnicDigits } = await seedWorker(page);

  await page.goto('/worker/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Seeded Worker (synthetic)' })).toBeVisible();
  await expect(page.getByText(PRIVATE.phone)).toBeVisible(); // the owner sees the own phone
  await expect(page.locator('img[src*="/evidence/"]')).toHaveCount(1); // and the own proof photo
  await expect(page.getByRole('textbox')).toHaveCount(0); // read only

  await page.getByRole('link', { name: 'Edit profile' }).first().click();
  await expect(page).toHaveURL(/\/worker\/profile\/edit/);
  await page.getByRole('tab', { name: /Work and rates/ }).click();
  await page.getByLabel(/^Short bio/).fill('Solar and wiring, neat and on time (synthetic).');
  await page.getByRole('button', { name: 'Save work details' }).click();
  await expect(page.getByText('Your profile shows the new details now.')).toBeVisible();
  await page.getByRole('link', { name: 'View my profile' }).click();
  await expect(page.getByText('Solar and wiring, neat and on time (synthetic).')).toBeVisible();

  // "See what customers see": exactly the public view.
  await page.getByRole('switch', { name: 'See what customers see' }).click();
  await expect(page.getByText(/This is what customers see/)).toBeVisible();
  const publicText = await page.locator('main').innerText();
  for (const secret of [PRIVATE.phone, PRIVATE.whatsappNumber, PRIVATE.address, 'Brother Private', cnicDigits, 'Private Client Name', '@example.com']) {
    expect(publicText).not.toContain(secret);
  }
  await expect(page.locator('main img[src*="/evidence/"]')).toHaveCount(0);
  browserConsole.assertClean();

  // A real customer: directory and public profile.
  await logout(page);
  await registerUser(page, { role: 'customer' });
  await page.goto(`/workers/${workerIdCode}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Seeded Worker (synthetic)' })).toBeVisible();
  const customerText = await page.locator('body').innerText();
  for (const secret of [PRIVATE.phone, PRIVATE.whatsappNumber, PRIVATE.address, 'Brother Private', cnicDigits, 'Private Client Name']) {
    expect(customerText).not.toContain(secret);
  }
  await expect(page.locator('img[src*="/evidence/"]')).toHaveCount(0);
  await page.goto('/find');
  await expect(page.getByTestId('worker-card').first()).toBeVisible();
  const directoryText = await page.locator('main').innerText();
  for (const secret of [PRIVATE.phone, PRIVATE.whatsappNumber, PRIVATE.address, cnicDigits]) expect(directoryText).not.toContain(secret);
});

test('a customer cannot open a proof photo even with its address (server check, not only the screen)', async ({ page }) => {
  await setLanguage(page, 'en');
  const { evidenceId } = await seedWorker(page);
  await logout(page);
  await registerUser(page, { role: 'customer' });
  const res = await page.request.get(`/api/evidence/${evidenceId}/file`);
  expect([403, 404]).toContain(res.status());
});

test('admin evidence review still works: the admin approves, the worker\'s skill becomes "Verified by evidence"', async ({ page }) => {
  const browserConsole = watchConsole(page);
  await setLanguage(page, 'en');
  const { email } = await seedWorker(page);
  await logout(page);

  await login(page, 'e2e.admin@example.com', 'local e2e admin pass phrase');
  await page.goto('/admin/evidence');
  await page.getByRole('button', { name: /Review proof from Seeded Worker \(synthetic\) for House wiring/ }).first().click();
  const drawer = page.getByRole('dialog');
  await expect(drawer.locator('img')).toHaveCount(1); // the admin sees the photo
  await drawer.getByRole('button', { name: 'Approve' }).click();
  await page.getByRole('dialog', { name: 'Approve this proof?' }).getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('The decision was written to the audit log.')).toBeVisible();
  browserConsole.assertClean();

  await logout(page);
  await login(page, email);
  await page.goto('/worker/profile');
  await expect(page.getByText('Verified by evidence').first()).toBeVisible();
});
