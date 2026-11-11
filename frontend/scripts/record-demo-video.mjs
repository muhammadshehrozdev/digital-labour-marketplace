// Records docs/DEMO-SCRIPT.md as a video, on the local preview's DEMO database (synthetic accounts only).
//   1. bash scripts/preview.sh demo && bash scripts/preview.sh reset-demo   (in /workspace)
//   2. node scripts/record-demo-video.mjs                                   (in /workspace/frontend)
// Writes docs/demo/demo-video.webm (1280x720; not in Git) and docs/demo/NARRATION.md (the English
// voice-over with the real start and end time of every line, measured during this recording).
//
// One browser tab is recorded. The demo uses three windows (worker, admin, customer); here the tab
// switches between them by swapping their login cookies (the admin and customer log in off camera), and a
// small label shows whose window it is. A drawn cursor glides to every click and a ring shows each click.
// Every step lasts at least as long as its narration line (about 2.1 words per second).
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { T, startsWith } from '../e2e/helpers.js';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.DEMO_URL || 'http://127.0.0.1:5173';
const OUT_DIR = resolve(here, '../../docs/demo');
const PHOTO = resolve(OUT_DIR, 'work-photo-synthetic.jpg');
const SIZE = { width: 1280, height: 720 };
const WORDS_PER_SECOND = 2.1;
const ur = T('ur');
const en = T('en');
const WORKER = { name: 'Bilal Ahmed (synthetic)', email: 'bilal.demo@example.com', phone: '03000000071', password: 'demo pass phrase 2026' };
const SENTENCE = 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔';

// ---- the drawn cursor, the click ring and the window label (inside the page, so they are recorded) ----
const OVERLAY = () => {
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* title card: no storage */ } },
  };
  const install = () => {
    if (document.getElementById('demo-cursor')) return;
    const style = document.createElement('style');
    style.textContent = `
      #demo-cursor { position: fixed; z-index: 2147483647; pointer-events: none; width: 26px; height: 26px; margin: -3px 0 0 -3px; transition: none; filter: drop-shadow(0 2px 2px rgba(0,0,0,.35)); }
      .demo-ring { position: fixed; z-index: 2147483646; pointer-events: none; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; border: 4px solid #f5a524; animation: demo-ring .6s ease-out forwards; }
      @keyframes demo-ring { from { transform: scale(.3); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
      #demo-label { position: fixed; z-index: 2147483645; pointer-events: none; left: 16px; bottom: 16px; padding: 6px 14px; border-radius: 999px; background: rgba(15, 40, 30, .88); color: #fff; font: 600 15px/1.4 system-ui, sans-serif; direction: ltr; }`;
    document.documentElement.appendChild(style);
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7 19 2.5-7.5L20 11z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const saved = JSON.parse(store.get('demo-cursor') || '{"x":640,"y":360}');
    cursor.style.left = `${saved.x}px`;
    cursor.style.top = `${saved.y}px`;
    document.documentElement.appendChild(cursor);
    const label = document.createElement('div');
    label.id = 'demo-label';
    label.textContent = store.get('demo-label') || '';
    label.hidden = !label.textContent;
    document.documentElement.appendChild(label);
    addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      store.set('demo-cursor', JSON.stringify({ x: e.clientX, y: e.clientY }));
    }, true);
    addEventListener('mousedown', (e) => {
      const ring = document.createElement('div');
      ring.className = 'demo-ring';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.documentElement.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
};

const pause = (page, ms) => page.waitForTimeout(ms);
let mouse = { x: 640, y: 360 };

async function glideTo(page, x, y) {
  const steps = 24;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    await page.mouse.move(mouse.x + (x - mouse.x) * ease, mouse.y + (y - mouse.y) * ease);
    await page.waitForTimeout(16);
  }
  mouse = { x, y };
}

async function pointAt(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await pause(page, 250);
  const box = await locator.boundingBox();
  await glideTo(page, box.x + box.width / 2, box.y + box.height / 2);
}

async function clickOn(page, locator) {
  await pointAt(page, locator);
  await pause(page, 200);
  await page.mouse.down();
  await page.mouse.up();
  await pause(page, 350);
}

async function typeInto(page, locator, text, delay = 55) {
  await clickOn(page, locator);
  await page.keyboard.type(text, { delay });
  await pause(page, 300);
}

async function setLabel(page, text) {
  await page.evaluate((t) => {
    sessionStorage.setItem('demo-label', t);
    const label = document.getElementById('demo-label');
    if (label) { label.textContent = t; label.hidden = !t; }
  }, text);
}

// ---- the narration timeline ----
const lines = [];
let started;
const now = () => (Date.now() - started) / 1000;
async function step(page, text, actions) {
  const start = now();
  await actions();
  const minimum = text.split(/\s+/).length / WORDS_PER_SECOND + 1.2;
  const left = start + minimum - now();
  if (left > 0) await pause(page, left * 1000);
  lines.push({ start, end: now(), text });
}

async function loginOffCamera(browser, email, password) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('dlm.language', 'en'));
  await page.goto(`${BASE}/login`);
  await page.getByLabel(startsWith(en('auth.login.email'))).fill(email);
  await page.locator('input[type=password]').fill(password);
  await page.getByRole('button', { name: en('auth.login.submit') }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'));
  const cookies = await context.cookies();
  await context.close();
  return cookies;
}

async function switchWindow(page, context, cookies, { label, language, path }) {
  await context.clearCookies();
  await context.addCookies(cookies);
  await page.evaluate((l) => localStorage.setItem('dlm.language', l), language);
  await setLabel(page, label);
  await page.goto(`${BASE}${path}`);
  await page.waitForLoadState('networkidle');
}

const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const adminCookies = await loginOffCamera(browser, 'admin.demo@example.com', 'local admin demo passphrase');
const customerCookies = await loginOffCamera(browser, 'customer.demo@example.com', 'local-demo-password-123');

const videoDir = resolve(here, '../../.local/demo-video');
rmSync(videoDir, { recursive: true, force: true });
const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: videoDir, size: SIZE } });
await context.addInitScript(OVERLAY);
const page = await context.newPage();
started = Date.now();

// 0. Title card
await page.setContent(`<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0f2a1e;color:#fff;font-family:system-ui,sans-serif;text-align:center">
  <div><div style="font-size:44px;font-weight:700">Digital Labour Marketplace</div>
  <div style="font-size:26px;margin-top:14px;opacity:.9">Modules 1 to 3: identity, rule-based skill suggestions, verified proof</div>
  <div style="font-size:18px;margin-top:26px;opacity:.7">Final Year Project demo · all names, emails and photos are synthetic</div></div></body>`);
await step(page, 'Welcome. This is a short demo of the Digital Labour Marketplace, Modules one to three. Everything you see uses synthetic data.', async () => {});

// 1. Worker: language chooser, Urdu
await page.goto(BASE);
await setLabel(page, 'Worker window (new visitor)');
await step(page, 'A new worker opens the website. The first screen asks for the language. Our worker chooses Urdu, and the whole site turns right to left.', async () => {
  await pause(page, 2500);
  await clickOn(page, page.getByRole('button', { name: /اردو میں جاری رکھیں/ }));
  await page.waitForLoadState('networkidle');
});
await step(page, 'On the home page, the worker taps Join as a worker.', async () => {
  await pause(page, 1200);
  await clickOn(page, page.getByRole('link', { name: ur('landing.joinWorker') }).first());
  await page.waitForURL(/register/);
});

// 2. Registration
await step(page, 'Sign-up needs only a name, an email, a mobile number and a password of at least fifteen characters. Public sign-up offers only worker and customer accounts. Admins are created by a command on the server.', async () => {
  await typeInto(page, page.getByLabel(startsWith(ur('auth.register.fullName'))), WORKER.name, 45);
  await typeInto(page, page.getByLabel(startsWith(ur('auth.register.email'))), WORKER.email, 40);
  await typeInto(page, page.getByLabel(startsWith(ur('auth.register.mobile'))), WORKER.phone, 70);
  await typeInto(page, page.locator('input[type=password]'), WORKER.password, 40);
  await clickOn(page, page.getByRole('button', { name: ur('auth.register.submit') }));
  await page.waitForURL(/onboarding\/about/);
});

// 3. Module 1: About you, CNIC
await step(page, 'Step one is About you. The name and number are already filled in. The worker adds a city and the CNIC number. The CNIC is checked as it is typed, stored encrypted, and never shown to customers.', async () => {
  await pause(page, 1500);
  await typeInto(page, page.getByLabel(startsWith(ur('about.city'))), 'Rawalpindi', 70);
  await typeInto(page, page.getByLabel(startsWith(ur('about.cnic'))), '1234512345671', 110);
  await pause(page, 1200);
  await clickOn(page, page.getByRole('button', { name: ur('onboarding.saveContinue') }));
  await page.waitForURL(/onboarding\/work/);
});
await step(page, 'Step two is Your work: the trade, the years of experience and a daily rate. Each step saves on its own.', async () => {
  const trade = page.getByLabel(startsWith(ur('work.trade')));
  await pointAt(page, trade);
  await trade.selectOption('electrical_solar');
  await pause(page, 700);
  await typeInto(page, page.getByLabel(startsWith(ur('work.experience'))), '5', 120);
  await typeInto(page, page.getByLabel(startsWith(ur('work.daily'))), '4000', 120);
  await clickOn(page, page.getByRole('button', { name: ur('onboarding.saveContinue') }));
  await page.waitForURL(/onboarding\/skills/);
});

// 4. Module 2: rule-based skill suggestions
await step(page, 'Step three is Module two. The worker describes the work in their own words, here in Urdu: I have done wiring and solar panel work for five years.', async () => {
  const box = page.getByLabel(startsWith(ur('skills.describeLabel')));
  await clickOn(page, box);
  await box.fill(SENTENCE); // pasted, as in the live demo
  await pause(page, 1500);
});
await step(page, 'The worker taps Find my skills. These are rule-based skill suggestions. Each skill in our list has words in three languages, and a skill is suggested only when one of its words appears in the text. The matched words are shown, so the worker can see why.', async () => {
  await clickOn(page, page.getByRole('button', { name: ur('skills.find') }));
  await page.getByRole('checkbox').first().waitFor();
  await pause(page, 600);
  await pointAt(page, page.getByRole('checkbox').first());
  await pause(page, 2500);
  await pointAt(page, page.getByRole('checkbox').nth(1));
});
await step(page, "The trade and the five years of experience are found too. Nothing is added without the worker's tap. The worker adds the two skills and continues.", async () => {
  await pause(page, 1500);
  await clickOn(page, page.getByRole('button', { name: new RegExp(ur('skills.addSelected')) }));
  await pause(page, 1200);
  await clickOn(page, page.getByRole('button', { name: ur('common.continue'), exact: true }));
  await page.waitForURL(/onboarding\/proof/);
});

// 5. Module 3: proof upload
await step(page, 'Step four is Module three, proof of skills. The worker chooses the skill, house wiring, and the kind of proof, a work photo, and picks a photo. This photo is a drawn, synthetic picture.', async () => {
  const skill = page.getByLabel(startsWith(ur('evidence.form.skill')));
  await pointAt(page, skill);
  await skill.selectOption('elec_wiring');
  await pause(page, 600);
  await clickOn(page, page.getByRole('radio', { name: new RegExp(ur('evidence.types.work_photo.title')) }));
  await pointAt(page, page.getByText(ur('ui.file.choose')).first());
  await page.locator('input[type=file]').setInputFiles(PHOTO);
  await pause(page, 1500);
});
await step(page, 'The server checks the real file type, removes location data, and keeps the photo private. Only the worker and the admins can open it. Now it waits for review.', async () => {
  await clickOn(page, page.getByRole('checkbox', { name: startsWith(ur('evidence.consent')) }));
  await clickOn(page, page.getByRole('button', { name: ur('evidence.form.submit') }));
  await page.getByText(ur('status.evidence.pending')).first().waitFor();
  await pointAt(page, page.getByText(ur('status.evidence.pending')).first());
});
await step(page, 'Onboarding is done. The worker has a permanent worker ID.', async () => {
  await clickOn(page, page.getByRole('button', { name: ur('common.continue'), exact: true }));
  await page.waitForURL(/onboarding\/done/);
  await pause(page, 800);
  await pointAt(page, page.getByText(/DLM-\d{4}-\d{6}/).first());
});
const workerCookies = await context.cookies();

// 6. Admin approves
await switchWindow(page, context, adminCookies, { label: 'Admin window', language: 'en', path: '/admin/evidence' });
await step(page, 'Now an admin, in another window. The evidence review queue shows the new photo, oldest first, with how long it has waited.', async () => {
  await pause(page, 1200);
  await pointAt(page, page.getByRole('button', { name: new RegExp(`${WORKER.name.replace(/[()]/g, '\\$&')}.*House wiring`) }).first());
});
const drawer = page.getByRole('dialog', { name: /House wiring/ });
await step(page, 'The admin opens it and sees the photo and four numbers for this skill: belief, disbelief, uncertainty and the expected value. They come from a documented formula. With no approved proof yet, the uncertainty is one.', async () => {
  await clickOn(page, page.getByRole('button', { name: new RegExp(`${WORKER.name.replace(/[()]/g, '\\$&')}.*House wiring`) }).first());
  await drawer.getByRole('img').first().waitFor();
  await pause(page, 1500);
  await pointAt(page, drawer.getByText(/belief/i).first());
});
await step(page, 'The admin approves the photo. The numbers change: belief is now one third. Every decision is written to an audit log that cannot be changed without it showing.', async () => {
  await clickOn(page, drawer.getByRole('button', { name: en('admin.evidence.actions.approve.label'), exact: true }));
  const confirm = page.getByRole('dialog', { name: en('admin.evidence.actions.approve.title') });
  await pause(page, 900);
  await clickOn(page, confirm.getByRole('button', { name: en('admin.evidence.actions.approve.label') }));
  await drawer.getByText(en('status.evidence.approved')).first().waitFor();
  await pause(page, 1200);
  await pointAt(page, drawer.getByText(/belief/i).first());
});

// 7. Customer
await switchWindow(page, context, customerCookies, { label: 'Customer window', language: 'en', path: '/find' });
await step(page, 'Now a customer, in a third window, searches for wiring. Results update while typing.', async () => {
  await typeInto(page, page.getByRole('searchbox', { name: en('find.searchLabel') }), 'wiring', 120);
  await page.getByRole('link', { name: WORKER.name }).first().waitFor();
  await pause(page, 800);
});
await step(page, "On the worker's profile, house wiring shows Verified by evidence, and solar panel installation shows Self-declared. The customer can see what was really checked.", async () => {
  await clickOn(page, page.getByRole('link', { name: WORKER.name }).first());
  await page.waitForURL(/\/workers\//);
  await page.getByText(en('status.skill.verified')).first().waitFor();
  await pause(page, 600);
  const skills = page.getByRole('heading', { name: 'Skills', exact: true });
  await skills.scrollIntoViewIfNeeded();
  await pointAt(page, page.getByText(en('status.skill.verified')).last());
});
await step(page, 'There is no phone number, WhatsApp number, CNIC or address. Contact details are shared only after a booking is accepted, in a later module. The server never sends them.', async () => {
  const note = page.getByText(en('profile.contactNote'));
  await pointAt(page, note);
  await pause(page, 1500);
});

// 8. Back to the worker: the notification
await switchWindow(page, context, workerCookies, { label: 'Worker window', language: 'ur', path: '/worker' });
await page.evaluate(async () => {
  const r = await fetch('/api/auth/session');
  const { user } = await r.json();
  if (user) localStorage.setItem(`dlm.tour.${user._id}`, 'done');
});
await page.reload();
await page.waitForLoadState('networkidle');
await step(page, "Back in the worker's window, the bell shows the admin's decision, in Urdu.", async () => {
  await clickOn(page, page.getByRole('button', { name: new RegExp(ur('workerx.notifications.bell')) }).first());
  await pause(page, 1500);
});

// 9. Closing card
await setLabel(page, '');
await page.setContent(`<body style="margin:0;height:100vh;display:grid;place-items:center;background:#0f2a1e;color:#fff;font-family:system-ui,sans-serif;text-align:center">
  <div><div style="font-size:34px;font-weight:700">Modules 1 to 3</div>
  <div style="font-size:22px;margin-top:18px;line-height:1.7">Protected worker identity · rule-based skill suggestions · skills backed by checked proof</div>
  <div style="font-size:18px;margin-top:26px;opacity:.7">Synthetic data · local preview</div></div></body>`);
await step(page, "That is Modules one to three: a protected identity, rule-based skill suggestions from the worker's own words, and skills backed by checked proof. Thank you.", async () => {});

const total = now();
const video = page.video();
await context.close();
await browser.close();
mkdirSync(OUT_DIR, { recursive: true });
renameSync(await video.path(), resolve(OUT_DIR, 'demo-video.webm'));

// ---- NARRATION.md from the measured times ----
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
writeFileSync(resolve(OUT_DIR, 'NARRATION.md'), `# Demo video: English voice-over

For \`docs/demo/demo-video.webm\` (1280×720, no sound). The narration runs to ${mmss(total)}; the closing
card stays a few seconds longer. Read each line when the video reaches its start time: the video holds
each step until the line has time to finish. Simple spoken English, about two words per second.
The times were measured while the video was recorded by \`frontend/scripts/record-demo-video.mjs\`;
if the video is recorded again, this file is written again with the new times.

All names, emails, phone numbers, the CNIC and the photo are synthetic. Say "rule-based skill
suggestions" for Module 2.

| Time | Line |
|---|---|
${lines.map((l) => `| ${mmss(l.start)} – ${mmss(l.end)} | ${l.text} |`).join('\n')}
`);
console.log(`video: docs/demo/demo-video.webm, ${mmss(total)} (${total.toFixed(1)} s), ${lines.length} narration lines`);
