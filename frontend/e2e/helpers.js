// Shared helpers for the end-to-end tests (synthetic accounts only, local preview only).
import { expect } from '@playwright/test';

export const PASSWORD = 'local e2e pass phrase';
export const uniqueEmail = (prefix) => `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

// Collects console errors/warnings and page errors; call assertClean() at the end of a test.
export function watchConsole(page) {
  const problems = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  return { problems, assertClean: () => expect(problems, 'browser console').toEqual([]) };
}

export async function registerWorker(page, { name = 'E2E Worker (synthetic)', email = uniqueEmail('e2e.worker') } = {}) {
  await page.goto('/register?role=worker');
  await page.getByLabel(/^Full name/).fill(name);
  await page.getByLabel(/^Email/).fill(email);
  await page.getByLabel(/^Mobile number/).fill('03000000041');
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/onboarding\/about$/);
  return { email };
}

export async function completeSteps1and2(page) {
  await page.getByLabel(/^City/).fill('Rawalpindi');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/onboarding\/work$/);
  await page.getByLabel(/^Main trade/).selectOption('electrical_solar');
  await page.getByLabel(/^Years of experience/).fill('5');
  await page.getByLabel(/^Rate per day/).fill('4000');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/onboarding\/skills$/);
}
