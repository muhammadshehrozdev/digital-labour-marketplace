// Module 5 (Batch 7) screens: the terms form (picture radio groups, the stepper with the keyboard, the read-back,
// the live checks, the conditions per category), the request form's offer step, the payments card (the right
// buttons for each person and state), My earnings (only confirmed money in the total), the price info card (all
// three sources and the empty state), the admin guide form (source required), the rupees mask, and the
// notifications. Synthetic test data only; the API is answered from a table (mockApi). Every amount here is
// test data, never a real price.
import { describe, test, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { mockApi, me, onboarding, PROFILE } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { LanguageProvider } from '../i18n';
import { ToastProvider } from '../components/ui';
import PriceInfoCard from '../features/wage/PriceInfoCard';
import PaymentsCard from '../features/wage/PaymentsCard';
import { maskStatus, formatRupees, westernDigits } from '../utils/masks';
import { notificationLink, notificationTextKey, notificationTone } from '../features/notifications/notificationText';
import { pageHelpName, PAGE_HELP_NAMES } from '../features/assist/pageHelp';
import { checkText, draftOf, summaryLine, tipText, safetyKinds } from '../features/wage/wageLogic';
import { priceLine, readBack, rupees } from '../features/wage/wageText';
import en from '../i18n/dictionaries/en';
import { createTranslator } from '../i18n/translate';

const t = createTranslator('en', en, en);
const money = (n) => rupees(t, (x) => new Intl.NumberFormat('en').format(x), n);
const CODE = 'DLM-2026-000077';

// GET /api/meta/work-terms (the server's lists, as test data)
const REPAIR = ['price', 'paymentTiming', 'paymentMethod', 'materials', 'advance', 'visitCharge'];
export const WORK_TERMS = {
  units: ['job', 'day', 'hour'], durations: ['few_hours', 'one_day', 'two_three_days', 'longer'],
  categoryConditions: { electrical_solar: REPAIR, domestic_work: ['price', 'paymentTiming', 'paymentMethod', 'materials'], painting_renovation: REPAIR.slice(0, 5) },
  defaultConditions: ['price', 'paymentTiming', 'paymentMethod'], categoryNotes: { domestic_work: ['working_day_hours'] },
  limits: { amountMin: 100, amountMax: 5000000, quantityMax: { job: 1, day: 60, hour: 200 } },
};
// a minimum wage reference as the API sends it (synthetic test values)
const REF = { region: 'ICT', monthly: 30000, daily: 1200, hourly: 150, status: 'notified', effectiveFrom: '2026-07-01', hoursPerDay: 8, names: { en: 'Islamabad Capital Territory', ur: 'اسلام آباد', 'ur-Latn': 'Islamabad', short: { en: 'Islamabad', ur: 'اسلام آباد', 'ur-Latn': 'Islamabad' } } };
const SUMMARY = (extra = {}) => ({ agreedTotal: null, confirmedPaid: 0, awaiting: 0, disputed: 0, balance: null, materials: { confirmed: 0, awaiting: 0, disputed: 0 }, records: 0, state: 'no_price', ...extra });
const PRICE = (extra = {}) => ({ amount: 2500, unit: 'job', quantity: 1, total: 2500, duration: 'few_hours', materials: null, advance: null, paymentTiming: null, paymentMethod: null, visitCharge: null, extraWork: 'new_price_first', note: '', ...extra });
const booking = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000001', status: 'accepted', skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar', preferredDate: '2026-11-25',
  timeSlot: 'morning', city: 'Islamabad', area: 'G-9', description: '', worker: { name: 'Bilal Ahmed', workerIdCode: CODE }, customer: { name: 'Sara K.' },
  actions: [], timeline: [], dispute: null, review: null, contact: null, noShow: {}, createdAt: '2026-11-20T10:00:00Z', region: 'ICT',
  terms: { status: 'none', version: 0, proposedBy: null, current: null, agreed: null }, termsHistory: [], payments: [], paymentSummary: SUMMARY(),
  termsChecks: [], wageReference: REF, termsActions: [], paymentActions: { record: false, respond: [] }, ...extra,
});
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': me('worker', { _id: 'w1' }),
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  'GET /meta/work-terms': { status: 200, data: WORK_TERMS },
  ...extra,
});
const customerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1' }),
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  'GET /meta/work-terms': { status: 200, data: WORK_TERMS },
  ...extra,
});
const wrap = (ui) => render(<MemoryRouter><LanguageProvider initialLanguage="en"><ToastProvider>{ui}</ToastProvider></LanguageProvider></MemoryRouter>);

describe('wording helpers (pure)', () => {
  test('price lines, the read-back, conditions and the summary line', () => {
    expect(priceLine(t, money, PRICE())).toBe('Rs 2,500 for the whole job');
    expect(priceLine(t, money, PRICE({ unit: 'day', amount: 1600, quantity: 3, total: 4800 }))).toBe('Rs 1,600 a day × 3 days = Rs 4,800');
    expect(readBack(t, money, PRICE({ duration: null, materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash' }), { category: 'electrical_solar' }))
      .toBe('You propose: Rs 2,500 for the whole job. The customer buys the materials. No advance. Payment in cash, after the work.');
    expect(summaryLine(t, money, SUMMARY({ agreedTotal: 2500, confirmedPaid: 2500, balance: 0 }))).toBe('Agreed Rs 2,500 · Confirmed paid Rs 2,500 · Nothing left to pay');
    expect(summaryLine(t, money, SUMMARY({ agreedTotal: 2500, confirmedPaid: 3000, balance: -500 }))).toBe('Agreed Rs 2,500 · Confirmed paid Rs 3,000 · Rs 500 more than the agreed price');
  });
  test('check texts name the region; a note for the other person says whom it is for', () => {
    expect(checkText(t, money, { id: 'below_minimum_day', audience: 'both', params: { region: 'ICT', reference: 1200 } }, { names: REF.names, lang: 'en', viewer: 'worker' }))
      .toBe('This is less than the government minimum wage reference for one day of work in Islamabad (about Rs 1,200). Please check the price.');
    expect(checkText(t, money, { id: 'large_advance', audience: 'customer', params: {} }, { viewer: 'worker' })).toBe('For the customer: Paying more than half before the work is risky.');
    expect(checkText(t, money, { id: 'large_advance', audience: 'customer', params: {} }, { viewer: 'customer' })).toBe('Paying more than half before the work is risky.');
    expect(checkText(t, money, { id: 'missing_condition', audience: 'both', params: { condition: 'visitCharge' } }, {})).toBe('Not answered yet: the visit charge.');
  });
  test('draftOf sends only the conditions the category asks, and "No advance" as 0', () => {
    const d = draftOf({ unit: 'job', amount: '2,500', quantity: 4, duration: 'one_day' }, { materials: 'customer_buys', advanceChoice: 'none', visitCharge: 'none', paymentTiming: 'daily' }, ['price', 'materials', 'advance', 'paymentTiming']);
    expect(d).toEqual({ amount: 2500, unit: 'job', quantity: 1, duration: 'one_day', materials: 'customer_buys', advance: 0, paymentTiming: 'daily', paymentMethod: null, visitCharge: null });
  });
  test('safety tips follow the trade; every tip has a text', () => {
    expect(safetyKinds('electrical_solar')).toEqual(['electrical', 'height']);
    expect(tipText(t, 'worker', 'safety', 'plumbing_sanitary')).toContain('never go in alone');
    expect(tipText(t, 'worker', 'safety', 'plumbing_sanitary')).toContain('General advice from the team, not training.');
    expect(tipText(t, 'worker', 'emergency')).toContain('1122');
  });
});

describe('the rupees mask (Western and Urdu digits, a higher limit for prices)', () => {
  test('Urdu digits become Western digits; the default limit stays Rs 1,000,000; a price may go to Rs 5,000,000', () => {
    expect(westernDigits('۲۵۰۰')).toBe('2500');
    expect(formatRupees(westernDigits('۲۵۰۰'))).toBe('2,500');
    expect(maskStatus('rupees', '1,000,001').message).toBe('workerx.masks.rupeesMax');
    expect(maskStatus('rupees', '1,000,001', { max: 5000000 }).state).toBe('ok');
    expect(maskStatus('rupees', '5,000,001', { max: 5000000 })).toEqual({ state: 'problem', message: 'wage.form.amountMax', params: { max: '5,000,000' } });
  });
});

describe('price information card: platform range, admin guide, nothing yet', () => {
  const estimate = (data) => ({ 'GET /prices/estimate': { status: 200, data: { query: { skillId: 'elec_wiring', category: 'electrical_solar', unit: 'job', city: 'Islamabad', region: 'ICT' }, platform: null, guide: null, wageReference: REF, workerRates: null, rules: { minJobs: 5, minWorkers: 3, minCustomers: 3, windowDays: 365 }, ...data } } });
  test('the platform range with the jobs and workers, the worker\'s own rates and the minimum wage reference', async () => {
    const calls = mockApi(estimate({ platform: { level: 'city', scope: 'skill', unit: 'job', low: 2000, median: 2500, high: 3000, jobs: 8, workers: 4 }, workerRates: { hourlyRate: 600, dailyRate: null } }));
    wrap(<PriceInfoCard skillId="elec_wiring" unit="job" city="Islamabad" workerIdCode={CODE} />);
    expect(await screen.findByText('Typical price on this platform in Islamabad: Rs 2,000 to Rs 3,000 for one job')).toBeInTheDocument();
    expect(screen.getByText('Middle price Rs 2,500. From 8 jobs by 4 workers.')).toBeInTheDocument();
    expect(screen.getByTestId('worker-rates')).toHaveTextContent("This worker's own rates: Rs 600 an hour.");
    expect(screen.getByTestId('wage-ref')).toHaveTextContent('Government minimum wage for unskilled work in Islamabad: Rs 30,000 a month (from 1 July 2026). That is about Rs 1,200 for one 8-hour day.');
    expect(screen.getByTestId('wage-ref')).toHaveTextContent('These laws are written for workers in shops and factories.');
    expect(calls.find((c) => c.key === 'GET /prices/estimate').params).toEqual({ skillId: 'elec_wiring', unit: 'job', city: 'Islamabad', workerIdCode: CODE });
    expect(screen.getByRole('button', { name: 'Listen' })).toBeInTheDocument();
  });
  test('no platform range: the admin guide with its source and month', async () => {
    mockApi(estimate({ guide: { scope: 'skill', region: 'ICT', unit: 'job', low: 1500, high: 2500, sourceNote: 'Team survey [test]', note: '', updatedAt: '2026-11-19T10:00:00Z' } }));
    wrap(<PriceInfoCard skillId="elec_wiring" unit="job" city="Islamabad" />);
    expect(await screen.findByText('Price guide from the admin team: Rs 1,500 to Rs 2,500 for one job')).toBeInTheDocument();
    expect(screen.getByText('Source: Team survey [test]. Updated November 2026.')).toBeInTheDocument();
  });
  test('nothing yet: the empty sentence, the rule of the minimums; an unknown city has no reference', async () => {
    mockApi(estimate({ query: { skillId: 'elec_wiring', category: 'electrical_solar', unit: 'job', city: 'Chak 45', region: null }, wageReference: null }));
    wrap(<PriceInfoCard skillId="elec_wiring" unit="job" city="Chak 45" />);
    expect(await screen.findByTestId('price-none')).toHaveTextContent('Not enough prices on this platform yet for this work in Chak 45.');
    expect(screen.getByText(/at least 5 finished jobs by 3 workers for 3 customers/)).toBeInTheDocument();
    expect(screen.getByTestId('wage-ref-none')).toHaveTextContent('The app does not know the city "Chak 45", so it shows no minimum wage reference.');
  });
});

describe('the terms form on a booking', () => {
  const detail = (extra) => ({ 'GET /bookings/b1': { status: 200, data: { booking: booking(extra) } } });
  test('electrical work: picture radio groups for the unit and every condition, the stepper with the keyboard, live checks, the read-back, Send', async () => {
    const checks = [{ id: 'below_minimum_day', severity: 'warning', audience: 'both', params: { region: 'ICT', reference: 1200, amount: 1000 } }];
    const calls = mockApi(workerRoutes({
      ...detail({ termsActions: ['propose_terms'] }),
      'POST /prices/check': { status: 200, data: { checks, region: 'ICT', wageReference: REF, platform: null } },
      'POST /bookings/b1/terms': (config, body) => ({ status: 200, data: { booking: booking({ terms: { status: 'proposed', version: 1, proposedBy: 'worker', current: PRICE({ ...body, total: body.amount * body.quantity }), agreed: null }, termsActions: ['propose_terms'] }) } }),
    }));
    renderAt('/worker/jobs/b1');
    const user = userEvent.setup();
    expect(await screen.findByTestId('terms-none')).toHaveTextContent('Price not agreed in the app yet.');
    await user.click(screen.getByRole('button', { name: 'Propose a price' }));
    const form = await screen.findByTestId('terms-form');
    const unit = within(form).getByRole('group', { name: 'How is the price counted?' });
    expect(within(unit).getAllByRole('radio')).toHaveLength(3);
    await user.click(within(unit).getByRole('radio', { name: 'Per day' }));
    await user.type(within(form).getByRole('textbox', { name: 'Price for one day' }), '1000');
    const qty = within(form).getByRole('textbox', { name: 'Number of days' });
    qty.focus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(qty).toHaveValue('3');
    await user.click(within(form).getByRole('button', { name: 'One less: Number of days' }));
    expect(qty).toHaveValue('2');
    expect(within(form).getByTestId('terms-total')).toHaveTextContent('Total: Rs 2,000');
    // the conditions of electrical work, as picture radio groups
    for (const name of ['Who buys the materials?', 'Is there an advance?', 'When is the payment?', 'How will the money be paid?', 'Is there a visit charge?']) {
      expect(within(form).getByRole('group', { name })).toBeInTheDocument();
    }
    expect(within(form).getByTestId('extra-work-rule')).toHaveTextContent('Extra work only after a new price is agreed in the app.');
    await user.click(within(form).getByRole('radio', { name: 'Customer buys the materials' }));
    await user.click(within(form).getByRole('radio', { name: 'No advance' }));
    await user.click(within(form).getByRole('radio', { name: 'Cash' }));
    await user.click(within(form).getByRole('radio', { name: 'After the work' }));
    // the live check (shown to both people; it never blocks)
    expect(await within(form).findByText(/less than the government minimum wage reference for one day of work in Islamabad \(about Rs 1,200\)/)).toBeInTheDocument();
    await user.click(within(form).getByRole('button', { name: 'Check and send' }));
    const dialog = await screen.findByRole('dialog', { name: 'Is this right?' });
    expect(within(dialog).getByTestId('terms-read-back')).toHaveTextContent('You propose: Rs 1,000 a day × 2 days = Rs 2,000. The customer buys the materials. No advance. Payment in cash, after the work.');
    expect(within(dialog).getByRole('button', { name: 'Listen' })).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings/b1/terms')).toBe(true));
    expect(calls.find((c) => c.key === 'POST /bookings/b1/terms').body).toEqual({
      baseVersion: 0, amount: 1000, unit: 'day', quantity: 2, duration: null, materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: null,
    });
    expect(calls.find((c) => c.key === 'POST /prices/check').body).toMatchObject({ skillId: 'elec_wiring', category: 'electrical_solar', city: 'Islamabad' });
  });

  test('domestic work: no advance or visit-charge question, the 8-hour note; a missing amount is asked for before the read-back', async () => {
    mockApi(workerRoutes({ ...detail({ category: 'domestic_work', skillId: 'dom_cleaning', skillName: 'House cleaning', termsActions: ['propose_terms'] }), 'POST /prices/check': { status: 200, data: { checks: [], wageReference: REF } } }));
    renderAt('/worker/jobs/b1');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Propose a price' }));
    const form = await screen.findByTestId('terms-form');
    expect(within(form).getByRole('group', { name: 'Who buys the cleaning supplies?' })).toBeInTheDocument();
    expect(within(form).queryByRole('group', { name: 'Is there an advance?' })).toBeNull();
    expect(within(form).queryByRole('group', { name: 'Is there a visit charge?' })).toBeNull();
    expect(within(form).getByText(/count a working day as 8 hours/)).toBeInTheDocument();
    await user.click(within(form).getByRole('button', { name: 'Check and send' }));
    expect(await within(form).findByText('Please write the price in rupees.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Is this right?' })).toBeNull();
  });

  test('a waiting change next to the agreed price; Agree reads it back and sends the version; the history lists both', async () => {
    const agreed = { ...PRICE(), version: 1, agreedAt: '2026-11-21T10:00:00Z' };
    const calls = mockApi(customerRoutes({
      ...detail({
        terms: { status: 'proposed', version: 2, proposedBy: 'worker', current: PRICE({ amount: 3000, total: 3000, materials: 'customer_buys' }), agreed },
        termsHistory: [
          { version: 1, by: 'customer', action: 'proposed', at: '2026-11-20T10:00:00Z', snapshot: PRICE() },
          { version: 1, by: 'worker', action: 'agreed', at: '2026-11-21T10:00:00Z', snapshot: PRICE() },
          { version: 2, by: 'worker', action: 'proposed', at: '2026-11-22T10:00:00Z', snapshot: PRICE({ amount: 3000, total: 3000 }) },
        ],
        termsActions: ['propose_terms', 'agree_terms'], paymentSummary: SUMMARY({ agreedTotal: 2500, balance: 2500, state: 'not_paid' }),
      }),
      'POST /bookings/b1/terms/agree': { status: 200, data: { booking: booking({ terms: { status: 'agreed', version: 2, proposedBy: 'worker', current: PRICE({ amount: 3000 }), agreed: { ...PRICE({ amount: 3000, total: 3000 }), version: 2, agreedAt: '2026-11-22T11:00:00Z' } } }) } },
    }));
    renderAt('/bookings/b1');
    const user = userEvent.setup();
    const summary = await screen.findByTestId('terms-summary');
    expect(within(summary).getByTestId('price-agreed')).toHaveTextContent('Price agreed: Rs 2,500 for the whole job');
    expect(within(summary).getByText('Change waiting, proposed by the worker')).toBeInTheDocument();
    expect(within(summary).getByTestId('terms-waiting')).toHaveTextContent('Waiting for your answer.');
    expect(within(summary).getByTestId('terms-history')).toHaveTextContent('Version 2: proposed by the worker');
    await user.click(within(summary).getByRole('button', { name: 'Agree' }));
    const dialog = await screen.findByRole('dialog', { name: 'Agree to this price?' });
    expect(within(dialog).getByTestId('agree-read-back')).toHaveTextContent('You agree to: Rs 3,000 for the whole job. The work takes a few hours. The customer buys the materials.');
    await user.click(within(dialog).getByRole('button', { name: 'Agree' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /bookings/b1/terms/agree')?.body).toEqual({ version: 2 }));
    expect(await screen.findByTestId('price-agreed')).toHaveTextContent('Price agreed: Rs 3,000 for the whole job');
  });
});

describe('the request form: an optional offer', () => {
  const WORKER = { workerIdCode: CODE, user: { name: 'Bilal Ahmed' }, occupation: 'Electrician', category: 'electrical_solar', city: 'Islamabad', availability: 'Available', skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar' }], verificationStatus: 'Verified', workHistory: [] };
  test('closed by default (the request works as before); opened: price fields, live checks without the condition notes, the tip; the offer is sent', async () => {
    const calls = mockApi(customerRoutes({
      [`GET /workers/${CODE}`]: { status: 200, data: WORKER },
      'GET /prices/estimate': { status: 200, data: { query: { skillId: 'elec_wiring', unit: 'job', city: 'Islamabad', region: 'ICT' }, platform: null, guide: null, wageReference: REF, workerRates: { hourlyRate: 600, dailyRate: 4000 }, rules: { minJobs: 5, minWorkers: 3, minCustomers: 3 } } },
      'POST /prices/check': { status: 200, data: { checks: [{ id: 'below_minimum_job', severity: 'warning', audience: 'both', params: { region: 'ICT', reference: 1200, days: 1 } }, { id: 'missing_condition', severity: 'info', audience: 'both', params: { condition: 'materials' } }], wageReference: REF } },
      'POST /bookings': { status: 201, data: { booking: { _id: 'b9' } } },
      'GET /bookings/b9': { status: 200, data: { booking: booking({ _id: 'b9', status: 'requested' }) } },
    }));
    renderAt(`/workers/${CODE}/request`);
    const user = userEvent.setup();
    expect(await screen.findByTestId('request-price-info')).toBeInTheDocument();
    expect(await screen.findByTestId('worker-rates')).toHaveTextContent('Rs 600 an hour · Rs 4,000 a day');
    const step = screen.getByTestId('offer-step');
    expect(within(step).queryByRole('textbox')).toBeNull();
    expect(within(step).getByTestId('protect-customer-agree_first')).toHaveTextContent('Agree the price and the conditions in the app before the work starts.');
    await user.click(within(step).getByRole('button', { name: 'Offer a price' }));
    await user.type(within(step).getByRole('textbox', { name: 'Price for the whole job' }), '1000');
    await user.click(within(step).getByRole('radio', { name: 'One day' }));
    expect(await within(step).findByText(/for one day of work in Islamabad/)).toBeInTheDocument();
    expect(within(step).queryByText(/Not answered yet/)).toBeNull(); // conditions come later, on the booking
    await user.type(screen.getByLabelText(/^Area or sector/), 'G-9 Markaz');
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings')).toBe(true));
    expect(calls.find((c) => c.key === 'POST /bookings').body.offer).toEqual({ amount: 1000, unit: 'job', duration: 'one_day' });
    await waitFor(() => expect(pathname()).toBe('/bookings/b9'));
  });
});

describe('payments card: the right buttons for each person and state', () => {
  const rec = (extra) => ({ _id: 'p1', kind: 'final', amount: 2500, method: 'cash', paidOn: '2026-11-22', recordedBy: 'customer', recordedAt: '2026-11-22T10:00:00Z', status: 'awaiting_confirmation', respondedAt: null, disputeReason: null, disputeNote: '', ...extra });
  test('the worker confirms the customer\'s record ("Yes, I received it"); the line says the app moves no money', async () => {
    const calls = mockApi({ 'POST /bookings/b1/payments/p1/confirm': { status: 200, data: { booking: booking({ payments: [rec({ status: 'confirmed' })], paymentSummary: SUMMARY({ agreedTotal: 2500, confirmedPaid: 2500, balance: 0, state: 'paid' }) }) } } });
    const b = booking({ payments: [rec()], paymentSummary: SUMMARY({ agreedTotal: 2500, awaiting: 2500, balance: 2500, state: 'not_paid' }), paymentActions: { record: true, respond: ['p1'] } });
    let fresh = null;
    wrap(<PaymentsCard booking={b} viewer="worker" onChanged={(x) => { fresh = x; }} recordPath="/worker/jobs/b1/payment-record" />);
    const user = userEvent.setup();
    expect(screen.getByTestId('payment-summary')).toHaveTextContent('Agreed Rs 2,500 · Confirmed paid Rs 0 · Rs 2,500 left to pay');
    expect(screen.getByText('Waiting for confirmation: Rs 2,500')).toBeInTheDocument();
    expect(screen.getAllByText('The app does not move money. It keeps a record you both confirm.').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Printable payment record' })).toHaveAttribute('href', '/worker/jobs/b1/payment-record');
    await user.click(screen.getByRole('button', { name: 'Yes, I received it' }));
    const dialog = await screen.findByRole('dialog', { name: 'Did you receive this money?' });
    await user.click(within(dialog).getByRole('button', { name: 'Yes, I received it' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings/b1/payments/p1/confirm')).toBe(true));
    expect(fresh.paymentSummary.state).toBe('paid');
  });
  test('the customer sees no confirm button on his own record, only "waiting"; "This is not right" needs a reason', async () => {
    const own = booking({ payments: [rec()], paymentSummary: SUMMARY({ awaiting: 2500 }), paymentActions: { record: true, respond: [] } });
    wrap(<PaymentsCard booking={own} viewer="customer" />);
    expect(screen.queryByRole('button', { name: 'Yes, I paid this' })).toBeNull();
    expect(screen.getByText('Waiting for the other person to confirm.')).toBeInTheDocument();
  });
  test('the customer disputes the worker\'s record with a reason; a disputed record shows its reason', async () => {
    const calls = mockApi({ 'POST /bookings/b1/payments/p1/dispute': { status: 200, data: { booking: booking({ payments: [rec({ recordedBy: 'worker', status: 'disputed', disputeReason: 'wrong_amount' })], paymentSummary: SUMMARY({ disputed: 2500, state: 'has_dispute' }) }) } } });
    const b = booking({ payments: [rec({ recordedBy: 'worker' })], paymentSummary: SUMMARY({ awaiting: 2500 }), paymentActions: { record: true, respond: ['p1'] } });
    wrap(<PaymentsCard booking={b} viewer="customer" />);
    const user = userEvent.setup();
    expect(screen.getByRole('button', { name: 'Yes, I paid this' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'This is not right' }));
    const dialog = await screen.findByRole('dialog', { name: 'What is not right?' });
    await user.click(within(dialog).getByRole('button', { name: 'This is not right' }));
    expect(await within(dialog).findByText('Please choose what is not right.')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: 'Wrong amount' }));
    await user.click(within(dialog).getByRole('button', { name: 'This is not right' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /bookings/b1/payments/p1/dispute')?.body).toEqual({ reason: 'wrong_amount' }));
  });
  test('recording a payment: kind, amount and "Today" as the default day', async () => {
    const calls = mockApi({ 'POST /bookings/b1/payments': { status: 201, data: { booking: booking() } } });
    wrap(<PaymentsCard booking={booking({ paymentSummary: SUMMARY({ agreedTotal: 2500, balance: 2500, state: 'not_paid' }), paymentActions: { record: true, respond: [] } })} viewer="customer" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Record a payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'I paid' });
    expect(within(dialog).getByRole('radio', { name: 'Today' })).toBeChecked();
    expect(within(dialog).getByRole('radio', { name: 'Final payment' })).toBeChecked();
    await user.type(within(dialog).getByRole('textbox', { name: 'Amount' }), '۲۵۰۰');
    expect(within(dialog).getByRole('textbox', { name: 'Amount' })).toHaveValue('2,500');
    await user.click(within(dialog).getByRole('button', { name: 'Save the record' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /bookings/b1/payments')).toBe(true));
    const body = calls.find((c) => c.key === 'POST /bookings/b1/payments').body;
    expect(body).toMatchObject({ kind: 'final', amount: 2500, method: 'cash' });
    expect(body.paidOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('My earnings (only confirmed money in the total)', () => {
  test('the month\'s confirmed total as a big number, waiting and disputed money apart, each job with its state', async () => {
    mockApi(workerRoutes({
      'GET /workers/me/earnings': { status: 200, data: { thisMonth: { month: '2026-11', confirmed: 2000 }, months: [{ month: '2026-11', confirmed: 2000, awaiting: 500, disputed: 1500, materials: 0, jobs: 2, agreedTotal: 5000, items: [
        { bookingId: 'b1', code: 'BK-2026-000001', skillId: 'elec_wiring', skillName: 'House wiring', agreedTotal: 2500, state: 'part_paid', confirmed: 2000, awaiting: 500, disputed: 0, materials: 0 },
        { bookingId: 'b2', code: 'BK-2026-000002', skillId: 'elec_wiring', skillName: 'House wiring', agreedTotal: 2500, state: 'has_dispute', confirmed: 0, awaiting: 0, disputed: 1500, materials: 0 },
      ] }] } },
    }));
    renderAt('/worker/earnings');
    const hero = await screen.findByTestId('earnings-this-month');
    expect(hero).toHaveTextContent('This month (November 2026)');
    expect(hero).toHaveTextContent('Rs 2,000');
    expect(within(hero).getByRole('button', { name: 'Listen' })).toBeInTheDocument();
    expect(screen.getByText('Rs 2,000 confirmed · 2 jobs')).toBeInTheDocument();
    expect(screen.getByTestId('earnings-awaiting')).toHaveTextContent("Waiting for the customer's confirmation: Rs 500 (not added in)");
    expect(screen.getByTestId('earnings-disputed')).toHaveTextContent('Disputed: Rs 1,500 (not added in)');
    expect(screen.getByText('Payment question open')).toBeInTheDocument();
    expect(screen.getByText('Part paid')).toBeInTheDocument();
  });
});

describe('the admin price guide form', () => {
  test('a source is required before anything is sent; the warning is on the page', async () => {
    const calls = mockApi({
      'GET /auth/me': me('admin', { _id: 'a1' }),
      'GET /admin/price-guides': { status: 200, data: { guides: [], history: {} } },
      'GET /admin/stats': { status: 200, data: {} },
    });
    renderAt('/admin/price-guide');
    const user = userEvent.setup();
    expect(await screen.findAllByText('Type only numbers you can show a source for. Never guess.')).not.toHaveLength(0);
    expect(await screen.findByText('No entries')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'New entry' }));
    const dialog = await screen.findByRole('dialog', { name: 'New price guide entry' });
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Trade' }), 'electrical_solar');
    await user.type(within(dialog).getByRole('textbox', { name: 'Low price' }), '1500');
    await user.type(within(dialog).getByRole('textbox', { name: 'High price' }), '2500');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(await within(dialog).findByText('Write where these numbers come from (at least 10 characters).')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /admin/price-guides')).toBe(false);
    await user.type(within(dialog).getByRole('textbox', { name: /Source/ }), 'Team survey of 6 electricians [test]');
    calls.length = 0;
    mockApi({
      'GET /auth/me': me('admin', { _id: 'a1' }),
      'GET /admin/price-guides': { status: 200, data: { guides: [], history: {} } },
      'POST /admin/price-guides': (config, body) => ({ status: 201, data: { guide: { _id: 'g1', ...body, status: 'active' } } }),
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'New price guide entry' })).toBeNull());
  });
});

describe('notifications and page help of Module 5', () => {
  test('the five types have texts, lead to the booking, and a tone', () => {
    for (const type of ['terms_proposed', 'terms_agreed', 'payment_recorded', 'payment_confirmed', 'payment_disputed']) {
      expect(notificationTextKey(type)).toBe(`wage.notify.${type}`);
      expect(typeof en.wage.notify[type].title).toBe('string');
      expect(notificationLink({ type, params: { bookingId: 'b1' } }, 'worker')).toBe('/worker/jobs/b1');
      expect(notificationLink({ type, params: { bookingId: 'b1' } }, 'customer')).toBe('/bookings/b1');
    }
    expect(notificationTone('terms_agreed')).toBe('success');
    expect(notificationTone('payment_recorded')).toBe('info');
    expect(notificationTone('payment_disputed')).toBe('danger');
  });
  test('every new page has page help', () => {
    expect(pageHelpName('/worker/earnings')).toBe('myEarnings');
    expect(pageHelpName('/prices')).toBe('priceInfo');
    expect(pageHelpName('/bookings/b1/payment-record')).toBe('paymentRecord');
    expect(pageHelpName('/worker/jobs/b1/payment-record')).toBe('paymentRecord');
    expect(pageHelpName('/worker/jobs/b1')).toBe('bookingDetail');
    for (const name of ['myEarnings', 'priceInfo', 'paymentRecord']) expect(PAGE_HELP_NAMES).toContain(name);
  });
});

describe('the printable payment record', () => {
  test('short names, the agreed price, each payment, "not a bank receipt", no phone number', async () => {
    mockApi(customerRoutes({
      'GET /bookings/b1': { status: 200, data: { booking: booking({
        terms: { status: 'agreed', version: 1, proposedBy: 'customer', current: PRICE(), agreed: { ...PRICE(), version: 1, agreedAt: '2026-11-21T10:00:00Z' } },
        payments: [{ _id: 'p1', kind: 'final', amount: 2500, method: 'cash', paidOn: '2026-11-22', recordedBy: 'customer', status: 'confirmed' }],
        paymentSummary: SUMMARY({ agreedTotal: 2500, confirmedPaid: 2500, balance: 0, state: 'paid' }),
        contact: { worker: { phone: '03001112222' } },
      }) } },
    }));
    renderAt('/bookings/b1/payment-record');
    const record = await screen.findByTestId('payment-record');
    expect(record).toHaveTextContent('Bilal A.');
    expect(record).toHaveTextContent('Sara K.');
    expect(record).not.toHaveTextContent('Bilal Ahmed');
    expect(record).toHaveTextContent('Rs 2,500 for the whole job');
    expect(within(record).getByTestId('not-a-receipt')).toHaveTextContent('It is not a bank receipt.');
    expect(record).not.toHaveTextContent('03001112222');
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
  });
});

describe('the price part of a request the worker has not accepted yet', () => {
  test('the worker reads "Accept the request first", and no "not answered yet" notes before acceptance', async () => {
    mockApi(workerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: booking({
      status: 'requested', actions: ['accept', 'decline'],
      terms: { status: 'proposed', version: 1, proposedBy: 'customer', current: PRICE({ amount: 1000, total: 1000, duration: 'one_day' }), agreed: null },
      termsChecks: [{ id: 'below_minimum_job', severity: 'warning', audience: 'both', params: { region: 'ICT', reference: 1200, days: 1 } }, { id: 'missing_condition', severity: 'info', audience: 'both', params: { condition: 'materials' } }],
    }) } } }));
    renderAt('/worker/jobs/b1');
    const summary = await screen.findByTestId('terms-summary');
    expect(within(summary).getByTestId('terms-waiting')).toHaveTextContent('Accept the request first. Then you can agree to this price or propose another.');
    expect(within(summary).getByText(/for one day of work in Islamabad/)).toBeInTheDocument();
    expect(within(summary).queryByText(/Not answered yet/)).toBeNull();
    expect(within(summary).queryByRole('button', { name: 'Agree' })).toBeNull();
  });
});
