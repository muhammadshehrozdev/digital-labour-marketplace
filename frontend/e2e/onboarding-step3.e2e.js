// Batch 3 Part 2.1: onboarding must not get stuck at Step 3 "Your skills".
import { test, expect } from '@playwright/test';
import { registerWorker, completeSteps1and2, setLanguage, watchConsole } from './helpers.js';

const SENTENCES = [
  ['Urdu', 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔'],
  ['Roman Urdu', 'Main 5 saal se wiring aur solar panel ka kaam karta hoon'],
  ['English', 'I have done house wiring and solar panel work for 5 years'],
];

for (const [label, sentence] of SENTENCES) {
  test(`Step 3 with ${label} text: suggestions (wiring, solar, 5 years) -> add -> Continue reaches Step 4`, async ({ page }) => {
    const browserConsole = watchConsole(page);
    await setLanguage(page, 'en');
    await registerWorker(page);
    await completeSteps1and2(page);
    await page.getByLabel(/what work do you do/).fill(sentence);
    await page.getByRole('button', { name: 'Find my skills' }).click();
    await expect(page.getByRole('checkbox', { name: 'House wiring' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Solar panel installation' })).toBeChecked();
    await expect(page.getByText('5 years', { exact: false }).first()).toBeVisible();
    await page.getByRole('button', { name: /Add selected skills/ }).click();
    const cont = page.getByRole('button', { name: 'Continue' });
    await expect(cont).toBeEnabled();
    await cont.click();
    await expect(page).toHaveURL(/\/onboarding\/proof$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Proof of skills');
    browserConsole.assertClean();
  });
}
