// Module 6 (Batch 8B) customer pages after saving: the job request page (actions decide the buttons, the requests
// sent, "what the app understood"), close and delete, edit with baseVersion and JOB_CHANGED, "Workers for this job"
// (reasons, sorts, filters, empty, truncated, not open), the request page in job mode (and its old mode unchanged),
// bookings that came from a job (customer and worker) and the budget privacy on worker pages.
// SYNTHETIC test data only; the API is answered from a table (mockApi).
import { describe, test, expect, beforeAll, afterEach } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { TAXONOMY_FULL } from './module6Fixtures';
import { installSpeech, uninstallSpeech, VOICES } from './speechMocks';
import { addDays, pktDay } from '../features/booking/bookingText';
import { requestDayOf } from '../features/jobs/jobText';

const TODAY = pktDay();
const WCODE = 'DLM-2026-000012';

const ANALYSIS = {
  method: 'rules', versions: { analyzer: 'job-rules-1', taxonomy: '2026-11-09-v1', phrases: '2026-11-24-v3', model: null }, analyzedAt: '2026-11-24T05:00:00.000Z',
  suggested: { category: 'plumbing_sanitary', categoryTie: [], skills: ['plumb_leak', 'plumb_fixtures', 'elec_fittings'], taskType: 'repair', city: 'Rawalpindi', preferredDate: addDays(TODAY, 1), timeSlot: 'morning', urgent: false, budget: null, notes: [] },
  changed: { category: false, skills: true, taskType: false, city: false, preferredDate: false, timeSlot: false, urgent: null, budget: null },
};
export const JOB = (extra = {}) => ({
  _id: 'j1', code: 'JR-2026-000001', state: 'open', version: 2, actions: ['edit', 'find_workers', 'request', 'close', 'delete'], category: 'plumbing_sanitary',
  skills: [{ skillId: 'plumb_leak', name: 'Water leak repair' }], taskType: 'repair', description: '[synthetic] Bathroom ka nalka tapak raha hai', inputMode: 'text',
  city: 'Rawalpindi', region: 'PB', area: 'Satellite Town', preferredDate: addDays(TODAY, 1), timeSlot: 'morning', urgent: false, budget: { amount: 2000, unit: 'job' },
  openUntil: '2026-12-24T05:00:00.000Z', closedAt: null, closeReason: null, createdAt: '2026-11-24T05:00:00.000Z', updatedAt: '2026-11-24T05:00:00.000Z',
  bookingsCount: 0, analysis: ANALYSIS, bookings: [], ...extra,
});
const SENT = (extra = {}) => ({ _id: 'b1', code: 'BK-2026-000031', status: 'requested', skillId: 'plumb_leak', skillName: 'Water leak repair', preferredDate: addDays(TODAY, 1), timeSlot: 'morning', worker: { name: 'Pindi Plumber (synthetic)', workerIdCode: WCODE }, createdAt: '2026-11-24T06:00:00.000Z', ...extra });
// the public worker view (GET /api/workers/:id) with a decoy phone that must never be rendered
const WORKER = {
  workerIdCode: WCODE, user: { name: 'Pindi Plumber (synthetic)' }, occupation: 'Plumber', category: 'plumbing_sanitary', city: 'Pindi', availability: 'Available',
  verificationStatus: 'Verified', experienceYears: 4, workHistory: [], phone: '03001234567',
  skills: [
    { skillId: 'plumb_leak', name: 'Water leak repair', category: 'plumbing_sanitary' },
    { skillId: 'plumb_fixtures', name: 'Bathroom and sanitary fittings', category: 'plumbing_sanitary' },
    { skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar' },
  ],
};
const customerRoutes = (extra = {}) => ({
  'GET /auth/me': me('customer', { _id: 'c1', name: 'Sara Khan (synthetic)' }),
  'GET /meta/taxonomy': { status: 200, data: TAXONOMY_FULL },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});
const workerRoutes = (extra = {}) => ({
  'GET /auth/me': me('worker', { _id: 'w1' }),
  'GET /meta/taxonomy': { status: 200, data: TAXONOMY_FULL },
  'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
  'GET /workers/me': { status: 200, data: PROFILE },
  'GET /notifications/unread-count': { status: 200, data: { unread: 0 } },
  ...extra,
});
const SUMMARY = { agreedTotal: null, confirmedPaid: 0, awaiting: 0, disputed: 0, balance: null, materials: { confirmed: 0, awaiting: 0, disputed: 0 }, records: 0, state: 'no_price' };
const BOOKING = (extra = {}) => ({
  _id: 'b1', code: 'BK-2026-000031', status: 'requested', skillId: 'plumb_leak', skillName: 'Water leak repair', category: 'plumbing_sanitary', preferredDate: addDays(TODAY, 1),
  timeSlot: 'morning', city: 'Rawalpindi', area: 'Satellite Town', description: '[synthetic] Bathroom ka nalka tapak raha hai', worker: { name: 'Pindi Plumber (synthetic)', workerIdCode: WCODE },
  customer: { name: 'Sara Khan (synthetic)' }, actions: [], timeline: [], dispute: null, review: null, contact: null, noShow: {}, createdAt: '2026-11-24T06:00:00Z', region: 'PB',
  terms: { status: 'none', version: 0, proposedBy: null, current: null, agreed: null }, termsHistory: [], payments: [], paymentSummary: SUMMARY, termsChecks: [], wageReference: null,
  termsActions: [], paymentActions: { record: false, respond: [] }, ...extra,
});

beforeAll(async () => {
  await Promise.all(['JobRequestPage', 'EditJobRequest', 'JobWorkers'].map((p) => import(`../pages/jobs/${p}.jsx`)).concat(import('../pages/customer/RequestWorker'), import('../pages/booking/BookingDetail')));
}, 60_000);
afterEach(() => uninstallSpeech());

describe('the job request page (/job-requests/:id)', () => {
  test('the details with the private budget, the state and its meaning, and only the buttons of job.actions', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } } }));
    renderAt('/job-requests/j1');
    expect(await screen.findByRole('heading', { level: 1, name: 'Plumbing & Sanitary' })).toBeInTheDocument();
    expect(screen.getByText('JR-2026-000001')).toBeInTheDocument();
    expect(screen.getAllByText('Open: choose a worker').length).toBeGreaterThan(0);
    expect(screen.getByTestId('job-budget')).toHaveTextContent('Budget: Rs 2,000 for the whole job');
    expect(screen.getByTestId('job-budget')).toHaveTextContent('Only you and the admins see this.');
    const actions = screen.getByTestId('job-actions');
    expect(within(actions).getByRole('link', { name: 'Choose a worker' })).toHaveAttribute('href', '/job-requests/j1/workers');
    expect(within(actions).getByRole('link', { name: 'Change the details' })).toHaveAttribute('href', '/job-requests/j1/edit');
    expect(within(actions).getAllByRole('button').map((b) => b.textContent)).toEqual(['Close the job request', 'Delete']);
    expect(screen.getByText('No request sent yet. Choose a worker to send this job to.')).toBeInTheDocument();
  });

  test('a waiting request: only "Workers for this job" and "Close"; the requests sent are listed and link to the booking', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB({ state: 'requested', actions: ['find_workers', 'close'], bookingsCount: 1, bookings: [SENT()] }) } } }));
    renderAt('/job-requests/j1');
    const actions = await screen.findByTestId('job-actions');
    expect(within(actions).getAllByRole('link').map((l) => l.textContent)).toEqual(['Workers for this job']);
    expect(within(actions).getAllByRole('button').map((b) => b.textContent)).toEqual(['Close the job request']);
    const sent = screen.getByTestId('job-bookings');
    expect(within(sent).getByRole('link', { name: 'BK-2026-000031' })).toHaveAttribute('href', '/bookings/b1');
    expect(sent).toHaveTextContent(`Pindi Plumber (synthetic) · Worker ID ${WCODE}`);
    expect(sent).toHaveTextContent('Waiting for an answer');
  });

  test('"What the app understood": collapsed; suggestion and choice per detail, kept / changed / nothing suggested; never a score', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } } }));
    renderAt('/job-requests/j1');
    const summary = await screen.findByText('What the app understood from your words');
    const details = summary.closest('details');
    expect(details).not.toHaveAttribute('open');
    const row = (field) => details.querySelector(`tr[data-field="${field}"]`);
    expect(row('category')).toHaveTextContent('TradePlumbing & SanitaryPlumbing & SanitaryKept');
    // the analyzer found an electrical skill too, but only the job's trade is compared (as analysis.changed.skills)
    expect(row('skills')).toHaveTextContent('Water leak repair, Bathroom and sanitary fittings');
    expect(row('skills')).not.toHaveTextContent('Light');
    expect(row('skills')).toHaveTextContent('Changed');
    expect(row('urgent')).toHaveTextContent('Nothing suggested');
    expect(details).toHaveTextContent('Checked with: rule-based word lists.');
    expect(details.textContent).not.toMatch(/%|score|confiden/i);
  });

  test('Close: four picture reasons, a reason is required, then the state is Closed; bookings are not touched', async () => {
    const calls = mockApi(customerRoutes({
      'GET /job-requests/j1': { status: 200, data: { job: JOB() } },
      'POST /job-requests/j1/close': (config, body) => ({ status: 200, data: { job: JOB({ state: 'closed', actions: ['delete'], closedAt: '2026-11-24T08:00:00.000Z', closeReason: body.reason }) } }),
    }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1');
    await user.click(await screen.findByRole('button', { name: 'Close the job request' }));
    const dialog = await screen.findByRole('dialog', { name: 'Close this job request?' });
    expect(within(dialog).getByText('Closing never changes a request you already sent: an accepted booking goes on.')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('radio').map((r) => r.value)).toEqual(['work_done', 'not_needed', 'found_elsewhere', 'other']);
    expect(within(dialog).getAllByRole('button', { name: /^Listen/ }).length).toBeGreaterThan(0);
    await user.click(within(dialog).getByRole('button', { name: 'Close the job request' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Choose a reason.');
    await user.click(within(dialog).getByRole('radio', { name: 'Work done' }));
    await user.click(within(dialog).getByRole('button', { name: 'Close the job request' }));
    await waitFor(() => expect(screen.getAllByText('Closed').length).toBeGreaterThan(0));
    expect(calls.find((c) => c.key === 'POST /job-requests/j1/close').body).toEqual({ reason: 'work_done' });
    expect(calls.filter((c) => c.key.includes('/bookings'))).toEqual([]);
    expect(screen.getByText(/Reason: Work done/)).toBeInTheDocument();
  });

  test('Delete: only when job.actions has delete, after a confirmation; then back to My job requests', async () => {
    const calls = mockApi(customerRoutes({
      'GET /job-requests/j1': { status: 200, data: { job: JOB({ state: 'closed', actions: ['delete'] }) } },
      'DELETE /job-requests/j1': { status: 204, data: '' },
      'GET /job-requests/mine': { status: 200, data: { jobs: [], counts: { open: 0, requested: 0, accepted: 0, done: 0, expired: 0, closed: 0, active: 0 }, page: 1, limit: 20, total: 0 } },
    }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1');
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete this job request?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(pathname()).toBe('/job-requests'));
    expect(calls.some((c) => c.key === 'DELETE /job-requests/j1')).toBe(true);
  });

  test('a job of someone else (404): a calm "not found" page', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j9': { status: 404, data: { code: 'JOB_NOT_FOUND', message: 'Job request not found' } } }));
    renderAt('/job-requests/j9');
    expect(await screen.findByRole('heading', { level: 1, name: 'Job request not found' })).toBeInTheDocument();
  });
});

describe('edit (/job-requests/:id/edit)', () => {
  test('sends baseVersion and only the changed fields; then the job page says "Changes saved"', async () => {
    const calls = mockApi(customerRoutes({
      'GET /job-requests/j1': { status: 200, data: { job: JOB() } },
      'PATCH /job-requests/j1': (config, body) => ({ status: 200, data: { job: JOB({ version: 3, area: body.area }) } }),
    }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/edit');
    const area = await screen.findByRole('textbox', { name: /^Area/ });
    expect(area).toHaveValue('Satellite Town');
    expect(await screen.findByRole('radio', { name: /Plumbing & Sanitary/ })).toBeChecked(); // the trades come with the taxonomy
    expect(screen.getByRole('textbox', { name: /Budget amount/ })).toHaveValue('2,000');
    await user.clear(area);
    await user.type(area, 'G-10');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await waitFor(() => expect(pathname()).toBe('/job-requests/j1'));
    expect(calls.find((c) => c.key === 'PATCH /job-requests/j1').body).toEqual({ baseVersion: 2, area: 'G-10' });
    expect(await screen.findByText('Changes saved.')).toBeInTheDocument();
  });

  test('nothing changed: "Change at least one thing before saving." and no request', async () => {
    const calls = mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } } }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/edit');
    await user.click(await screen.findByRole('button', { name: 'Save the changes' }));
    expect(await screen.findByText('Change at least one thing before saving.')).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('PATCH /job-requests'))).toBe(false);
  });

  test('409 JOB_CHANGED: "This job request was changed just now" with Reload, which loads the newest version', async () => {
    let version = 2;
    const calls = mockApi(customerRoutes({
      'GET /job-requests/j1': () => ({ status: 200, data: { job: JOB({ version, area: version === 2 ? 'Satellite Town' : 'Saddar' }) } }),
      'PATCH /job-requests/j1': () => { version = 3; return { status: 409, data: { code: 'JOB_CHANGED', message: 'This job request was changed just now. Please reload the page.' } }; },
    }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/edit');
    await user.type(await screen.findByRole('textbox', { name: /^Area/ }), ' Block B');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    expect(await screen.findByText('This job request was changed just now')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reload' }));
    expect(await screen.findByDisplayValue('Saddar')).toBeInTheDocument();
    expect(calls.filter((c) => c.key === 'GET /job-requests/j1')).toHaveLength(2);
  });

  test('a job that cannot be edited (a request is waiting): the server\'s rule in plain words, no form', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB({ state: 'requested', actions: ['find_workers', 'close'] }) } } }));
    renderAt('/job-requests/j1/edit');
    expect(await screen.findByText(/This job request cannot be changed now/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save the changes' })).toBeNull();
  });
});

describe('Workers for this job (/job-requests/:id/workers)', () => {
  const LISTED = { ...WORKER, matchedSkills: [{ skillId: 'plumb_leak', name: 'Water leak repair' }], sameCity: true };
  const answer = (extra = {}) => ({ status: 200, data: { workers: [LISTED], page: 1, limit: 20, total: 1, sort: 'updated', truncated: false, filter: { category: 'plumbing_sanitary', city: 'Rawalpindi', marketCity: 'Rawalpindi', cityKnown: true }, ...extra } });

  test('each card says why the worker is listed and has "Send this job"; the list is not a ranking; public fields only', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } }, 'GET /job-requests/j1/workers': answer() }));
    renderAt('/job-requests/j1/workers');
    const card = await screen.findByTestId('worker-card');
    expect(card).toHaveTextContent('Offers: Water leak repair');
    expect(card).toHaveTextContent('Same city: Rawalpindi');
    expect(within(card).getByRole('link', { name: /Send this job/ })).toHaveAttribute('href', `/workers/${WCODE}/request?job=j1`);
    expect(screen.getByTestId('not-ranked')).toHaveTextContent('in the order you choose. The app does not rank them.');
    expect(document.body.textContent).not.toContain('03001234567');
    expect(document.body.textContent).not.toMatch(/Budget|2,000/);
  });

  test('the directory\'s sorts and filters ask the server', async () => {
    const calls = mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } }, 'GET /job-requests/j1/workers': answer() }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/workers');
    await screen.findByTestId('worker-card');
    await user.selectOptions(screen.getByRole('combobox', { name: /Sort by/ }), 'experience');
    await user.click(screen.getByRole('radio', { name: /^Available/ }));
    await user.click(screen.getByRole('switch', { name: /identity/i }));
    await waitFor(() => {
      const last = calls.filter((c) => c.key === 'GET /job-requests/j1/workers').at(-1).params;
      expect(last).toMatchObject({ sort: 'experience', availability: 'Available', identity: 'verified' });
    });
    expect(screen.getByRole('combobox', { name: /Sort by/ }).querySelectorAll('option')).toHaveLength(4);
  });

  test('nobody yet: "No workers of this trade in Rawalpindi yet." with ways forward; more than 500: a plain note', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } }, 'GET /job-requests/j1/workers': answer({ workers: [], total: 0 }) }));
    renderAt('/job-requests/j1/workers');
    expect(await screen.findByText('No workers of this trade in Rawalpindi yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search all workers' })).toHaveAttribute('href', '/find');
    expect(screen.getByRole('link', { name: 'Change the city' })).toHaveAttribute('href', '/job-requests/j1/edit');
  });

  test('truncated: "Showing the first 500 matching workers."', async () => {
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } }, 'GET /job-requests/j1/workers': answer({ truncated: true }) }));
    renderAt('/job-requests/j1/workers');
    expect(await screen.findByText('Showing the first 500 matching workers.')).toBeInTheDocument();
  });

  test('done, expired or closed: the page explains why no list is shown, and does not ask for one', async () => {
    const calls = mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB({ state: 'done', actions: ['close'] }) } } }));
    renderAt('/job-requests/j1/workers');
    expect(await screen.findByText('This job request is closed, done or expired.')).toBeInTheDocument();
    expect(screen.getByText(/The work of this job is done, so no workers are listed/)).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'GET /job-requests/j1/workers')).toBe(false);
  });
});

describe('request this worker with the job (/workers/:id/request?job=…)', () => {
  const routes = (job = JOB(), extra = {}) => customerRoutes({ [`GET /workers/${WCODE}`]: { status: 200, data: WORKER }, 'GET /job-requests/j1': { status: 200, data: { job } }, ...extra });

  test('the "Your job" card instead of city, area and description; only the worker\'s skills of the job\'s trade; the exact body', async () => {
    const calls = mockApi(routes(JOB(), { 'POST /job-requests/j1/request': { status: 201, data: { booking: { _id: 'b9' } } }, 'GET /bookings/b9': { status: 200, data: { booking: BOOKING({ _id: 'b9' }) } } }));
    const user = userEvent.setup();
    renderAt(`/workers/${WCODE}/request?job=j1`);
    const yours = await screen.findByTestId('your-job');
    expect(yours).toHaveTextContent('JR-2026-000001');
    expect(yours).toHaveTextContent('[synthetic] Bathroom ka nalka tapak raha hai');
    expect(yours).toHaveTextContent('Satellite Town');
    expect(yours).toHaveTextContent('Repair');
    expect(yours.textContent).not.toMatch(/Budget|2,000/);
    expect(screen.queryByRole('textbox', { name: /^City/ })).toBeNull();
    expect(screen.queryByRole('textbox', { name: /Area or sector/ })).toBeNull();
    expect(screen.queryByRole('textbox', { name: /What needs to be done/ })).toBeNull();
    const skills = within(screen.getByRole('group', { name: /skills fits this job/ })).getAllByRole('radio');
    expect(skills.map((r) => r.value)).toEqual(['plumb_leak', 'plumb_fixtures']); // not the electrical skill
    expect(screen.getByRole('radio', { name: /Water leak repair/ })).toBeChecked(); // the job's skill
    expect(screen.getByRole('radio', { name: /^Tomorrow/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^Morning/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    await waitFor(() => expect(pathname()).toBe('/bookings/b9'));
    const body = calls.find((c) => c.key === 'POST /job-requests/j1/request').body;
    expect(body).toEqual({ jobVersion: 2, workerIdCode: WCODE, skillId: 'plumb_leak', preferredDate: addDays(TODAY, 1), timeSlot: 'morning' });
    expect(calls.some((c) => c.key === 'POST /bookings')).toBe(false);
  });

  test('a past or missing day becomes Tomorrow with a note; a missing time becomes Any time; the offer goes in the body', async () => {
    expect(requestDayOf(addDays(TODAY, -1), TODAY)).toEqual({ day: 'tomorrow', date: '', moved: true });
    expect(requestDayOf(null, TODAY)).toEqual({ day: 'tomorrow', date: '', moved: true });
    expect(requestDayOf(addDays(TODAY, 4), TODAY)).toEqual({ day: 'pick', date: addDays(TODAY, 4), moved: false });
    const calls = mockApi(routes(JOB({ preferredDate: null, timeSlot: null }), { 'POST /job-requests/j1/request': { status: 201, data: { booking: { _id: 'b9' } } }, 'GET /bookings/b9': { status: 200, data: { booking: BOOKING({ _id: 'b9' }) } } }));
    const user = userEvent.setup();
    renderAt(`/workers/${WCODE}/request?job=j1`);
    expect(await screen.findByTestId('day-moved')).toHaveTextContent('so Tomorrow is chosen');
    expect(screen.getByRole('radio', { name: /^Any time/ })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Offer a price' }));
    await user.type(screen.getByRole('textbox', { name: /price for the whole job/i }), '2500');
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    await waitFor(() => expect(pathname()).toBe('/bookings/b9'));
    const body = calls.find((c) => c.key === 'POST /job-requests/j1/request').body;
    expect(Object.keys(body).sort()).toEqual(['jobVersion', 'offer', 'preferredDate', 'skillId', 'timeSlot', 'workerIdCode']);
    expect(body).toMatchObject({ timeSlot: 'any', preferredDate: addDays(TODAY, 1), offer: { amount: 2500, unit: 'job' } });
  });

  test('409 JOB_HAS_OPEN_REQUEST: "This job is already with a worker" with a link to the waiting request', async () => {
    let state = 'open';
    mockApi(customerRoutes({
      [`GET /workers/${WCODE}`]: { status: 200, data: WORKER },
      'GET /job-requests/j1': () => ({ status: 200, data: { job: state === 'open' ? JOB() : JOB({ state: 'requested', actions: ['find_workers', 'close'], bookings: [SENT({ _id: 'b5' })] }) } }),
      'POST /job-requests/j1/request': () => { state = 'requested'; return { status: 409, data: { code: 'JOB_HAS_OPEN_REQUEST', message: 'This job already has a request to a worker. Wait for the answer, or cancel that request first.' } }; },
    }));
    const user = userEvent.setup();
    renderAt(`/workers/${WCODE}/request?job=j1`);
    await user.click(await screen.findByRole('button', { name: 'Send the request' }));
    const blocked = await screen.findByTestId('request-blocked');
    expect(blocked).toHaveTextContent('This job is already with a worker. Wait for the answer or cancel that request first.');
    expect(await screen.findByRole('link', { name: 'See the waiting request' })).toHaveAttribute('href', '/bookings/b5');
    expect(screen.queryByRole('button', { name: 'Send the request' })).toBeNull();
  });

  test('a job that already has a waiting request: the message instead of the form', async () => {
    mockApi(routes(JOB({ state: 'requested', actions: ['find_workers', 'close'], bookings: [SENT()] })));
    renderAt(`/workers/${WCODE}/request?job=j1`);
    expect(await screen.findByTestId('request-blocked')).toHaveTextContent('This job is already with a worker.');
    expect(screen.getByRole('link', { name: 'See the waiting request' })).toHaveAttribute('href', '/bookings/b1');
  });

  test('409 JOB_CHANGED: the plain message and Reload; 400 BOOKING_JOB_MISMATCH and JOB_NOT_OPEN in plain words', async () => {
    let answer = { status: 409, data: { code: 'JOB_CHANGED', message: 'x' } };
    const calls = mockApi(routes(JOB(), { 'POST /job-requests/j1/request': () => answer }));
    const user = userEvent.setup();
    renderAt(`/workers/${WCODE}/request?job=j1`);
    await user.click(await screen.findByRole('button', { name: 'Send the request' }));
    expect(await screen.findByText('Reload it to send the newest version.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reload' }));
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /job-requests/j1')).toHaveLength(2));
    answer = { status: 400, data: { code: 'BOOKING_JOB_MISMATCH', message: 'x' } };
    await user.click(await screen.findByRole('button', { name: 'Send the request' }));
    expect(await screen.findByText("This skill is not in the trade of the job. Choose a skill of the job's trade.")).toBeInTheDocument();
    answer = { status: 409, data: { code: 'JOB_NOT_OPEN', message: 'x' } };
    await user.click(screen.getByRole('button', { name: 'Send the request' }));
    expect(await screen.findByText('This job request cannot be sent any more. Describe a new job if you still need the work.')).toBeInTheDocument();
  });

  test('the worker offers no skill of the job\'s trade: the page says so and goes back to the workers', async () => {
    mockApi(routes(JOB({ category: 'painting_renovation', skills: [] })));
    renderAt(`/workers/${WCODE}/request?job=j1`);
    expect(await screen.findByText('Pindi Plumber (synthetic) offers no skill of this trade')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Back to workers for this job' }).at(-1)).toHaveAttribute('href', '/job-requests/j1/workers');
  });

  test('without ?job the page is exactly the old one: city, area and description fields, no "Your job"', async () => {
    mockApi(customerRoutes({ [`GET /workers/${WCODE}`]: { status: 200, data: WORKER } }));
    renderAt(`/workers/${WCODE}/request`);
    expect(await screen.findByRole('textbox', { name: /^City/ })).toHaveValue('Pindi');
    expect(screen.getByRole('textbox', { name: /Area or sector/ })).toBeInTheDocument();
    expect(screen.queryByTestId('your-job')).toBeNull();
    expect(within(screen.getByRole('group', { name: 'Which work do you need?' })).getAllByRole('radio')).toHaveLength(3); // every skill
  });
});

describe('bookings that came from a job', () => {
  const JOB_REF_CUSTOMER = { _id: 'j1', code: 'JR-2026-000001', taskType: 'repair' };
  const JOB_REF_WORKER = { code: 'JR-2026-000001', taskType: 'repair' };

  test('customer: "From job request JR-…" links to the job, with the kind of work; a booking without a job shows nothing', async () => {
    mockApi(customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: BOOKING({ job: JOB_REF_CUSTOMER }) } } }));
    renderAt('/bookings/b1');
    const line = await screen.findByTestId('from-job');
    expect(within(line).getByRole('link', { name: 'From job request JR-2026-000001' })).toHaveAttribute('href', '/job-requests/j1');
    expect(line).toHaveTextContent('Kind of work: Repair');
  });

  test('customer: a normal booking has no job line', async () => {
    mockApi(customerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: BOOKING() } } }));
    renderAt('/bookings/b1');
    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByTestId('from-job')).toBeNull();
  });

  test('worker: the job code and kind of work as text only, never a budget; 🔊 also says the kind of work', async () => {
    const synth = installSpeech({ voices: [VOICES.en] });
    localStorage.setItem('dlm.tour.w1', 'done');
    mockApi(workerRoutes({
      'GET /bookings/mine': { status: 200, data: { bookings: [BOOKING({ job: JOB_REF_WORKER, actions: ['accept', 'decline'], description: '' })], counts: { requested: 1, accepted: 0 }, page: 1, limit: 50, total: 1 } },
      'GET /bookings/b1': { status: 200, data: { booking: BOOKING({ job: JOB_REF_WORKER }) } },
    }));
    const user = userEvent.setup();
    renderAt('/worker/requests');
    const card = (await screen.findAllByTestId('booking-card'))[0];
    const line = within(card).getByTestId('from-job');
    expect(line).toHaveTextContent('From job request JR-2026-000001');
    expect(line).toHaveTextContent('Kind of work: Repair');
    expect(within(line).queryByRole('link')).toBeNull();
    expect(document.body.textContent).not.toMatch(/Budget|budget/);
    await user.click(within(card).getByRole('button', { name: 'Hear this request' }));
    await waitFor(() => expect(synth.spoken.length).toBeGreaterThan(0));
    expect(synth.spoken[0].text).toMatch(/Kind of work: Repair\.$/);
    act(() => synth.finish());
  });

  test('worker: the booking page shows the job line as text and no budget', async () => {
    localStorage.setItem('dlm.tour.w1', 'done');
    mockApi(workerRoutes({ 'GET /bookings/b1': { status: 200, data: { booking: BOOKING({ job: JOB_REF_WORKER }) } } }));
    renderAt('/worker/jobs/b1');
    const line = await screen.findByTestId('from-job');
    expect(line).toHaveTextContent('From job request JR-2026-000001');
    expect(within(line).queryByRole('link')).toBeNull();
    expect(document.body.textContent).not.toMatch(/Budget|budget/);
  });
});

describe('help', () => {
  test('the Help Centre has the "Describe a job" guide for customers, and it can be heard', async () => {
    mockApi(customerRoutes());
    renderAt('/help');
    const title = await screen.findByRole('heading', { name: 'Describe a job' });
    const guide = title.closest('article');
    expect(guide).toHaveTextContent('Your budget is private: only you and the admins see it, never a worker.');
    expect(guide).toHaveTextContent('A job goes to one worker at a time');
    expect(within(guide).getAllByRole('button', { name: /^Listen/ }).length).toBeGreaterThan(0);
  });
});

describe('review fixes on the edit page (Batch 8B, Stage 9)', () => {
  test('finding 5: a job whose day has passed can still be edited (only the area changes)', async () => {
    const calls = mockApi(customerRoutes({
      'GET /job-requests/j1': { status: 200, data: { job: JOB({ preferredDate: addDays(TODAY, -3) }) } },
      'PATCH /job-requests/j1': (config, body) => ({ status: 200, data: { job: JOB({ version: 3, area: body.area, preferredDate: addDays(TODAY, -3) }) } }),
    }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/edit');
    const area = await screen.findByRole('textbox', { name: /^Area/ });
    await user.clear(area);
    await user.type(area, 'G-10');
    await user.click(screen.getByRole('button', { name: 'Save the changes' }));
    await waitFor(() => expect(pathname()).toBe('/job-requests/j1'));
    expect(calls.find((c) => c.key === 'PATCH /job-requests/j1').body).toEqual({ baseVersion: 2, area: 'G-10' });
  });

  test('finding 10: a microphone problem is said in words on the edit page', async () => {
    installSpeech({ voices: [VOICES.en] });
    mockApi(customerRoutes({ 'GET /job-requests/j1': { status: 200, data: { job: JOB() } } }));
    const user = userEvent.setup();
    renderAt('/job-requests/j1/edit');
    await user.click(await screen.findByRole('button', { name: 'Speak' }));
    (await import('./speechMocks')).lastRecognition().fail('not-allowed');
    const en = (await import('../i18n/dictionaries/en.js')).default;
    expect(await screen.findByText(en.voice.errors['not-allowed'])).toBeInTheDocument();
  });
});
