// Batch 5 coverage guard (Batch 5 plan, section 8): every field of every in-scope form has a help row, and
// every help key that is used exists in all three dictionaries. Fails when a new field is added
// without help, or when a help text is missing in one language.
import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { lookup } from '../i18n/translate';
import { PAGE_HELP_NAMES, pageHelpName } from '../features/assist/pageHelp';
import en from '../i18n/dictionaries/en';
import ur from '../i18n/dictionaries/ur';
import urLatn from '../i18n/dictionaries/ur-Latn';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt } from './renderApp';
import { ANALYSES, TAXONOMY_FULL } from './module6Fixtures';

const DICTS = { en, ur, 'ur-Latn': urLatn };
const missingIn = (key) => Object.entries(DICTS).filter(([, d]) => typeof lookup(d, key) !== 'string' && typeof lookup(d, key) !== 'object').map(([l]) => l);

// The fields of a page that need help, and the ones that have none.
function fieldsWithoutHelp(root) {
  const missing = [];
  const hasHelpNear = (el, levels = 5) => {
    let node = el.parentElement;
    for (let i = 0; node && i < levels; i += 1, node = node.parentElement) {
      if (node.querySelector('[data-assist]')) return true;
    }
    return false;
  };
  // text boxes, drop-downs and text areas: their OWN help row (it names the control it belongs to)
  for (const el of root.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([type=file]), textarea, select')) {
    if (el.closest('dialog')) continue; // dialogs are not form fields of the page
    if (!el.id || !root.querySelector(`[data-assist-for="${el.id}"]`)) missing.push(el.id || el.name || el.type);
  }
  // a check box or a photo: a help row right next to it
  for (const el of root.querySelectorAll('input[type=checkbox], input[type=file]')) {
    if (el.closest('dialog')) continue;
    if (!hasHelpNear(el, 3)) missing.push(el.id || el.name || el.type);
  }
  for (const fieldset of root.querySelectorAll('fieldset')) {
    if (fieldset.querySelector('input[type=radio]') && !fieldset.querySelector(':scope > [data-assist]')) {
      missing.push(`radio group "${fieldset.querySelector('legend')?.textContent}"`);
    }
  }
  return missing;
}

function keysUsed(root) {
  return [
    ...[...root.querySelectorAll('[data-assist]')].map((el) => `help.field.${el.dataset.assist}`),
    ...[...root.querySelectorAll('[data-help-key]')].map((el) => el.dataset.helpKey),
    ...[...document.querySelectorAll('[data-page-help]')].map((el) => `help.screen.${el.dataset.pageHelp}`),
  ];
}

const WORKER = me('worker', { _id: 'w1' });
const SKILLS = [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', custom: false, evidenceSummary: { status: 'self_declared', approved: 0 } }];
const workerRoutes = (steps = { about: true, work: true, skills: true }) => ({
  'GET /auth/me': WORKER,
  'GET /workers/me/onboarding': onboarding(steps, steps.skills ? '2026-11-09T10:00:00Z' : null),
  'GET /workers/me': { status: 200, data: { ...PROFILE, skills: SKILLS } },
  'GET /workers/me/full': full({ ...PROFILE, skills: SKILLS }, []),
  'GET /workers/me/skills': { status: 200, data: { skills: SKILLS } },
  'GET /evidence/mine': { status: 200, data: { evidence: [] } },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
});

// Module 4 fixtures (synthetic)
const M4_CODE = 'DLM-2026-000077';
const M4_WORKER = {
  workerIdCode: M4_CODE, user: { name: 'Bilal Ahmed' }, occupation: 'Electrician', category: 'electrical_solar', city: 'Islamabad', availability: 'Available',
  skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar' }], verificationStatus: 'Verified', workHistory: [],
};
const M4_BOOKING = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000001', status: 'requested', skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar', preferredDate: '2026-11-20',
  timeSlot: 'morning', city: 'Islamabad', area: 'G-9', description: 'Two sockets.', worker: { name: 'Bilal Ahmed', workerIdCode: M4_CODE }, customer: { name: 'Sara K.' },
  actions: [], timeline: [], dispute: null, review: null, contact: null, noShow: {}, ...extra,
});
// Module 5 fixtures (synthetic): the work-terms lists and the price parts of a booking detail
const M5_TERMS = {
  categoryConditions: { electrical_solar: ['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge'] },
  defaultConditions: ['price', 'paymentTiming', 'paymentMethod'], categoryNotes: {}, limits: { amountMin: 100, amountMax: 5000000 },
};
const M5_PARTS = {
  terms: { status: 'none', version: 0, proposedBy: null, current: null, agreed: null }, termsHistory: [], payments: [], termsChecks: [], wageReference: null,
  paymentSummary: { agreedTotal: null, confirmedPaid: 0, awaiting: 0, disputed: 0, balance: null, materials: { confirmed: 0, awaiting: 0, disputed: 0 }, records: 0, state: 'no_price' },
  paymentActions: { record: false, respond: [] }, termsActions: [],
};
const m4CustomerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1' }),
  [`GET /workers/${M4_CODE}`]: { status: 200, data: M4_WORKER },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});

// Module 6 (Batch 8B): the customer's job request screens
const m6Routes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1' }),
  'GET /meta/taxonomy': { status: 200, data: TAXONOMY_FULL },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  'POST /job-requests/analyze': { status: 200, data: ANALYSES.PINDI },
  ...extra,
});
const describeStep2 = async (user) => {
  await user.click(await screen.findByRole('textbox', { name: 'Describe the job in your own words' }));
  await user.paste('Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
  await user.click(screen.getByRole('button', { name: 'Next: check the details' }));
  await user.click(await screen.findByRole('radio', { name: /^Pick a date/ })); // the date box appears
  await user.click(screen.getByRole('radio', { name: /^Per day/ }));
};

const PAGES = [
  // Module 6 (Batch 8B): Describe a job, step 1 and step 2 (every field shown)
  { path: '/job-requests/new', routes: m6Routes() },
  { path: '/job-requests/new', routes: m6Routes(), ready: describeStep2 },
  { path: '/register', routes: { 'GET /auth/me': { status: 401, data: {} } }, ready: async (user) => user.click(await screen.findByRole('radio', { name: /I want to find work/ })) },
  { path: '/login', routes: { 'GET /auth/me': { status: 401, data: {} } } },
  { path: '/onboarding/about', routes: workerRoutes({ about: false, work: false, skills: false }) },
  { path: '/onboarding/work', routes: workerRoutes({ about: true, work: false, skills: false }), ready: () => screen.findByRole('radio', { name: 'Electrical & Solar' }) },
  { path: '/onboarding/skills', routes: workerRoutes({ about: true, work: true, skills: false }) },
  { path: '/onboarding/proof', routes: workerRoutes(), ready: () => screen.findByRole('radio', { name: 'House wiring' }) },
  ...['about', 'work', 'skills', 'proof', 'history', 'language'].map((section) => ({
    path: `/worker/profile/edit?section=${section}`,
    routes: workerRoutes(),
    ready: section === 'history' ? async (user) => user.click(await screen.findByRole('button', { name: /Add a past job/ })) : undefined,
  })),
  {
    path: '/find',
    routes: { 'GET /auth/me': me('customer', { _id: 'c1' }), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0, sort: 'updated' } }, 'GET /saved/ids': { status: 200, data: { ids: [], max: 100 } } },
    ready: () => screen.findByRole('radio', { name: 'Electrical & Solar' }),
  },
  { path: '/help', routes: { 'GET /auth/me': { status: 401, data: {} } } },
  // Module 4 (Batch 6): the request form, the rating form, and the worker's reply form
  { path: `/workers/${M4_CODE}/request`, routes: m4CustomerRoutes(), ready: () => screen.findByRole('radio', { name: 'House wiring' }) },
  { path: `/workers/${M4_CODE}/request`, routes: m4CustomerRoutes(), ready: async (user) => user.click(await screen.findByRole('radio', { name: 'Pick a date' })) },
  { path: '/bookings/b1/rate', routes: m4CustomerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: M4_BOOKING({ status: 'completed', actions: ['review'] }) } } }), ready: () => screen.findByRole('group', { name: 'How was the work?' }) },
  // Module 5 (Batch 7): the request form with the offer step open, the terms form on a booking (worker), the
  // price information page, My earnings and the printable payment record
  {
    path: `/workers/${M4_CODE}/request`,
    routes: m4CustomerRoutes({ 'GET /meta/work-terms': { status: 200, data: M5_TERMS } }),
    ready: async (user) => user.click(await screen.findByRole('button', { name: 'Offer a price' })),
  },
  {
    path: '/worker/jobs/b1',
    routes: { ...workerRoutes(), 'GET /meta/work-terms': { status: 200, data: M5_TERMS }, 'GET /bookings/b1': { status: 200, data: { booking: M4_BOOKING({ status: 'accepted', ...M5_PARTS, termsActions: ['propose_terms'] }) } } },
    ready: async (user) => {
      await user.click(await screen.findByRole('button', { name: 'Propose a price' }));
      await user.click(await screen.findByRole('radio', { name: 'Some advance' })); // the advance amount field appears
      await user.click(screen.getByRole('radio', { name: 'Per day' })); // the stepper appears
    },
  },
  { path: '/prices', routes: { ...workerRoutes() }, ready: () => screen.findByRole('radio', { name: 'Electrical & Solar' }) },
  { path: '/worker/earnings', routes: { ...workerRoutes(), 'GET /workers/me/earnings': { status: 200, data: { thisMonth: { month: '2026-11', confirmed: 0 }, months: [] } } } },
  { path: '/bookings/b1/payment-record', routes: m4CustomerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: M4_BOOKING({ status: 'completed', ...M5_PARTS }) } } }) },
  {
    path: '/worker/reviews',
    routes: { ...workerRoutes(), [`GET /workers/${PROFILE.workerIdCode}/reviews`]: { status: 200, data: { reviews: [{ _id: 'r1', rating: 4, comment: 'Good [test].', reviewer: 'Sara K.', skillId: 'elec_wiring', createdAt: '2026-11-10T10:00:00Z', reply: null }], page: 1, limit: 10, total: 1 } } },
    ready: async (user) => user.click(await screen.findByRole('button', { name: 'Reply' })),
  },
];

describe('coverage guard: help on every field of the in-scope forms', () => {
  test.each(PAGES.map((p) => [p.path, p]))('%s', async (path, page) => {
    localStorage.setItem('dlm.tour.w1', 'done');
    mockApi(page.routes);
    renderAt(path);
    const user = userEvent.setup();
    const main = await screen.findByRole('main');
    await within(main).findAllByRole('heading', { level: 1 });
    await page.ready?.(user);
    await screen.findAllByRole('button', { name: /^Listen/ });
    expect(fieldsWithoutHelp(main)).toEqual([]);
    const keys = keysUsed(main);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) expect(missingIn(key), key).toEqual([]);
  });
});

describe('coverage guard: every help key in the code exists in en, ur and ur-Latn', () => {
  const files = [];
  const walk = (dir) => readdirSync(dir).forEach((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== 'test') walk(p); } else if (/\.jsx?$/.test(f)) files.push(p);
  });
  walk('src');
  const source = files.map((f) => readFileSync(f, 'utf8')).join('\n');

  test('assist="..." keys used in the source', () => {
    const keys = [...new Set([...source.matchAll(/assist="([\w.]+)"/g)].map((m) => `help.field.${m[1]}`))];
    expect(keys.length).toBeGreaterThan(30); // 39 on 16 Nov 2026
    for (const key of keys) expect(missingIn(key), key).toEqual([]);
  });

  test('Module 4: the reason pickers inside dialogs have their help in all three languages', () => {
    for (const group of ['cancel', 'decline', 'dispute', 'report']) expect(missingIn(`help.field.booking.${group}Reason`), group).toEqual([]);
    for (const key of ['request.skill', 'request.day', 'request.date', 'request.time', 'request.city', 'request.area', 'request.description', 'rate.stars', 'rate.comment', 'booking.note', 'reviews.reply']) {
      expect(missingIn(`help.field.${key}`), key).toEqual([]);
    }
    for (const name of ['requestWorker', 'myBookings', 'bookingDetail', 'rateWork', 'requests', 'myJobs', 'myReviews', 'myReputation']) expect(PAGE_HELP_NAMES).toContain(name);
    // pages without form fields (lists and buttons) still have their page help
    expect(Object.fromEntries(['/bookings', '/bookings/b1', '/bookings/b1/rate', `/workers/${M4_CODE}/request`, '/worker/requests', '/worker/jobs', '/worker/jobs/b1', '/worker/reviews', '/worker/reputation'].map((p) => [p, pageHelpName(p)]))).toEqual({
      '/bookings': 'myBookings', '/bookings/b1': 'bookingDetail', '/bookings/b1/rate': 'rateWork', [`/workers/${M4_CODE}/request`]: 'requestWorker',
      '/worker/requests': 'requests', '/worker/jobs': 'myJobs', '/worker/jobs/b1': 'bookingDetail', '/worker/reviews': 'myReviews', '/worker/reputation': 'myReputation',
    });
    expect(pageHelpName(`/workers/${M4_CODE}`)).toBe('workerProfile');
  });

  test('page help of every in-scope page', () => {
    for (const name of PAGE_HELP_NAMES) expect(missingIn(`help.screen.${name}`), name).toEqual([]);
  });

  test('picture groups: every option a group can show has its spoken line', () => {
    const groups = {
      trade: ['All', 'electrical_solar', 'plumbing_sanitary', 'construction_masonry', 'carpentry_woodwork', 'painting_renovation', 'ac_appliance_repair', 'home_maintenance', 'domestic_work', 'moving_loading'],
      availability: ['All', 'Available', 'Busy', 'Offline'],
      evidenceType: ['certificate', 'work_photo', 'reference_letter'],
      // Module 4 (Batch 6)
      requestSkill: ['any'],
      requestDay: ['today', 'tomorrow', 'pick'],
      timeSlot: ['morning', 'afternoon', 'evening', 'any'],
      thumb: ['yes', 'no', 'skip'],
      stars: ['1', '2', '3', '4', '5'],
      cancelReason: ['plans_changed', 'found_someone_else', 'cannot_come', 'emergency', 'price', 'other'],
      declineReason: ['busy', 'too_far', 'not_my_work', 'other'],
      disputeReason: ['work_was_done', 'work_not_done', 'i_did_come', 'not_my_fault', 'other'],
      reportReason: ['abusive', 'personal_information', 'not_about_my_work', 'job_did_not_happen', 'other'],
      // Module 6 (Batch 8B)
      jobTask: ['install', 'repair', 'service', 'new_work', 'cleaning', 'moving', 'household_help', 'none'],
      jobDay: ['today', 'tomorrow', 'pick', 'none'],
      jobTime: ['morning', 'afternoon', 'evening', 'any', 'none'],
    };
    for (const [group, values] of Object.entries(groups)) {
      for (const value of values) expect(missingIn(`help.option.${group}.${value}`), `${group}.${value}`).toEqual([]);
    }
  });

  test('the same keys in all three dictionaries for the whole Batch 5 part (help and assist)', () => {
    const flat = (d, prefix) => Object.keys(Object.fromEntries(Object.entries(d).filter(([k]) => k === prefix))).length;
    expect(flat(en, 'help') + flat(ur, 'help') + flat(urLatn, 'help')).toBe(3);
    const leaves = (obj, p = '') => Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' ? leaves(v, `${p}${k}.`) : [`${p}${k}`]));
    for (const top of ['help', 'assist']) {
      const keys = leaves(en[top]).sort();
      expect(leaves(ur[top]).sort(), top).toEqual(keys);
      expect(leaves(urLatn[top]).sort(), top).toEqual(keys);
    }
  });
});
