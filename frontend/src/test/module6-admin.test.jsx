// Module 6 (Batch 8B, Part C) admin screens: the job request list (no budget), its filters, the detail drawer
// (budget, analysis, bookings, the customer's name only), "How suggestions were used" (per detail, by method and input
// mode, with the fixed note), and "Try the analyzer" (the suggestion and its words; nothing saved). Synthetic data only.
import { describe, test, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me } from './mockApi';
import { renderAt } from './renderApp';
import { ANALYSES, TAXONOMY_FULL } from './module6Fixtures';
import { NAV_LINKS } from '../components/layout/navLinks';
import { destinationsFor } from '../features/navigation/destinations';

const ADMIN = me('admin', { _id: 'admin1', name: 'Test Admin' });
const base = (extra = {}) => ({ 'GET /auth/me': ADMIN, 'GET /meta/taxonomy': { status: 200, data: TAXONOMY_FULL }, 'GET /admin/reason-templates': { status: 200, data: { templates: [], max: 60 } }, ...extra });
const LIST_JOB = {
  _id: 'j1', code: 'JR-2026-000001', state: 'requested', category: 'plumbing_sanitary', skills: [{ skillId: 'plumb_leak', name: 'Water leak repair' }], taskType: 'repair',
  description: '[synthetic] Nalka tapak raha hai', inputMode: 'voice', city: 'Rawalpindi', region: 'PB', area: 'Satellite Town', preferredDate: null, timeSlot: 'morning', urgent: false,
  openUntil: '2026-12-24T05:00:00.000Z', closedAt: null, closeReason: null, createdAt: '2026-11-24T05:00:00.000Z', updatedAt: '2026-11-24T05:00:00.000Z',
  customer: { name: 'Sara Khan (synthetic)' }, bookingsCount: 1, analysisMethod: 'rules',
};
const DETAIL = {
  ...LIST_JOB, version: 1, budget: { amount: 2500, unit: 'job' }, synthetic: true,
  analysis: {
    method: 'rules', versions: { analyzer: 'job-rules-1', taxonomy: '2026-11-09-v1', phrases: '2026-11-24-v3', model: null }, analyzedAt: '2026-11-24T05:00:00.000Z',
    suggested: { category: 'plumbing_sanitary', categoryTie: [], skills: ['plumb_leak'], taskType: 'repair', city: 'Rawalpindi', preferredDate: null, timeSlot: 'morning', urgent: false, budget: null, notes: [] },
    changed: { category: false, skills: false, taskType: false, city: false, preferredDate: null, timeSlot: false, urgent: null, budget: null },
  },
  bookings: [{ _id: 'b1', code: 'BK-2026-000031', status: 'requested', skillId: 'plumb_leak', skillName: 'Water leak repair', preferredDate: '2026-11-25', timeSlot: 'morning', worker: { name: 'Pindi Plumber (synthetic)', workerIdCode: 'DLM-2026-000012' }, createdAt: '2026-11-24T06:00:00Z' }],
  bookingsCount: 1,
};
const STATS = {
  days: 30, jobs: 4, byMethod: { rules: 4 }, byInputMode: { text: 3, voice: 1 },
  fields: {
    category: { kept: 3, changed: 1, notSuggested: 0 }, skills: { kept: 2, changed: 2, notSuggested: 0, added: 1, removed: 2 }, taskType: { kept: 2, changed: 1, notSuggested: 1 },
    city: { kept: 1, changed: 0, notSuggested: 3 }, preferredDate: { kept: 2, changed: 0, notSuggested: 2 }, timeSlot: { kept: 1, changed: 1, notSuggested: 2 },
    urgent: { kept: 1, changed: 0, notSuggested: 3 }, budget: { kept: 0, changed: 1, notSuggested: 3 },
  },
  note: 'A customer may keep a wrong suggestion or change a right one, so these numbers describe use, not correctness.',
};

describe('admin: job requests', () => {
  test('the sidebar and the palette have "Job requests"; customers have no admin link', async () => {
    mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [], page: 1, limit: 20, total: 0 } } }));
    renderAt('/admin/job-requests');
    const nav = await screen.findByRole('navigation', { name: /Admin/ });
    expect(within(nav).getByRole('link', { name: 'Job requests' })).toHaveAttribute('href', '/admin/job-requests');
    expect(destinationsFor('admin').some((d) => d.to === '/admin/job-requests')).toBe(true);
    expect(NAV_LINKS.customer.some((l) => l.to.startsWith('/admin'))).toBe(false);
  });

  test('the list: code, customer, state, requests sent, method and input mode; NO budget; the filters ask the server', async () => {
    const calls = mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [LIST_JOB], page: 1, limit: 20, total: 1 } } }));
    const user = userEvent.setup();
    renderAt('/admin/job-requests');
    const row = (await screen.findByRole('button', { name: 'Open JR-2026-000001' })).closest('tr') ?? (await screen.findByText('JR-2026-000001')).closest('tr');
    expect(row).toHaveTextContent('Sara Khan (synthetic)');
    expect(row).toHaveTextContent('Waiting for a worker');
    expect(row).toHaveTextContent('rule-based word lists');
    expect(row).toHaveTextContent('Spoken');
    expect(screen.getByRole('table').textContent).not.toMatch(/Budget|2,500/);
    await user.selectOptions(screen.getByRole('combobox', { name: 'State' }), 'open');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Trade' }), 'plumbing_sanitary');
    await user.type(screen.getByRole('textbox', { name: 'Job request code' }), 'JR-2026-0000');
    await user.click(screen.getByRole('button', { name: 'Find' }));
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /admin/job-requests').at(-1).params).toMatchObject({ state: 'open', category: 'plumbing_sanitary', q: 'JR-2026-0000' }));
  });

  test('the drawer: everything, including the budget, the analysis and the requests sent; the customer\'s name only', async () => {
    mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [LIST_JOB], page: 1, limit: 20, total: 1 } }, 'GET /admin/job-requests/j1': { status: 200, data: { job: DETAIL } } }));
    const user = userEvent.setup();
    renderAt('/admin/job-requests');
    await user.click(await screen.findByRole('button', { name: 'Open JR-2026-000001' }));
    const drawer = await screen.findByTestId('admin-job-drawer');
    expect(within(drawer).getByTestId('job-budget')).toHaveTextContent('Budget: Rs 2,500 for the whole job');
    expect(within(drawer).getByText('Synthetic demo data')).toBeInTheDocument();
    expect(within(drawer).getByTestId('understood')).toHaveTextContent('Kept');
    expect(drawer).toHaveTextContent('BK-2026-000031');
    expect(drawer).toHaveTextContent('Pindi Plumber (synthetic) · Worker ID DLM-2026-000012');
    expect(screen.getByRole('dialog')).toHaveTextContent('Customer: Sara Khan (synthetic)');
    expect(screen.getByRole('dialog').textContent).not.toMatch(/@example\.com|0300/);
  });

  test('"How suggestions were used": the fixed note, kept / changed / not suggested per detail, by method and input mode; the period asks the server', async () => {
    const calls = mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [], page: 1, limit: 20, total: 0 } }, 'GET /admin/job-requests/stats': { status: 200, data: STATS } }));
    const user = userEvent.setup();
    renderAt('/admin/job-requests');
    await user.click(await screen.findByRole('tab', { name: /How suggestions were used/ }));
    const stats = await screen.findByTestId('job-stats');
    expect(stats).toHaveTextContent('This shows how customers used the suggestions, not whether they were correct.');
    expect(await within(stats).findByText('4 job requests saved in the last 30 days')).toBeInTheDocument();
    const row = within(stats).getByTestId('stats-table').querySelector('tr[data-field="category"]');
    expect(row).toHaveTextContent('Trade');
    expect([...row.querySelectorAll('td.tabular')].map((td) => td.textContent)).toEqual(['3', '1', '0']);
    expect(stats).toHaveTextContent('Skills the customers added: 1. Suggested skills they removed: 2.');
    expect(within(stats).getByText('By method')).toBeInTheDocument();
    expect(stats).toHaveTextContent('Spoken');
    expect(stats.textContent).not.toMatch(/%|accura|correct suggestion|confiden/i);
    await user.selectOptions(within(stats).getByRole('combobox', { name: 'Period' }), '7');
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /admin/job-requests/stats').at(-1).params).toEqual({ days: '7' }));
  });

  test('"Try the analyzer": the suggestion and the words that led to it, as jobs:try prints them; nothing is saved', async () => {
    const calls = mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [], page: 1, limit: 20, total: 0 } }, 'POST /job-requests/analyze': { status: 200, data: ANALYSES.PINDI } }));
    const user = userEvent.setup();
    renderAt('/admin/job-requests');
    await user.click(await screen.findByRole('tab', { name: /Try the analyzer/ }));
    await user.type(await screen.findByRole('textbox', { name: 'Job description' }), 'Bathroom ka nalka tapak raha hai, Pindi mein, kal subah');
    await user.click(screen.getByRole('button', { name: 'Show the suggestions' }));
    const table = await screen.findByTestId('try-table');
    const row = (f) => table.querySelector(`tr[data-field="${f}"]`);
    expect(row('category')).toHaveTextContent('Plumbing & Sanitary');
    expect(row('category')).toHaveTextContent('tapak, nalka, bathroom');
    expect(row('city')).toHaveTextContent('Rawalpindi');
    expect(row('city')).toHaveTextContent('pindi');
    expect(row('taskType')).toHaveTextContent('Repair');
    expect(row('missing')).toHaveTextContent('area');
    expect(screen.getByText('Nothing was saved. These are suggestions; the customer confirms or changes every one.')).toBeInTheDocument();
    expect(screen.getByText(/Method: rule-based word lists \(analyzer job-rules-1, word lists 2026-11-24-v3\)/)).toBeInTheDocument();
    expect(calls.filter((c) => c.key.startsWith('POST')).map((c) => c.key)).toEqual(['POST /job-requests/analyze']);
  });

  test('"Try the analyzer": a tie and two cities are reported as such; an error appears under the box', async () => {
    let answer = { status: 200, data: ANALYSES.TIE };
    mockApi(base({ 'GET /admin/job-requests': { status: 200, data: { jobs: [], page: 1, limit: 20, total: 0 } }, 'POST /job-requests/analyze': () => answer }));
    const user = userEvent.setup();
    renderAt('/admin/job-requests');
    await user.click(await screen.findByRole('tab', { name: /Try the analyzer/ }));
    const box = await screen.findByRole('textbox', { name: 'Job description' });
    await user.type(box, 'Mujhe kal ek electrician aur ek plumber chahiye');
    await user.click(screen.getByRole('button', { name: 'Show the suggestions' }));
    expect((await screen.findByTestId('try-table')).querySelector('tr[data-field="category"]')).toHaveTextContent('Tie: Electrical & Solar, Plumbing & Sanitary');
    answer = { status: 200, data: ANALYSES.TWO_CITIES };
    await user.click(screen.getByRole('button', { name: 'Show the suggestions' }));
    await waitFor(() => expect(screen.getByTestId('try-table').querySelector('tr[data-field="city"]')).toHaveTextContent('Two cities: the customer chooses'));
    answer = { status: 400, data: { code: 'VALIDATION_FAILED', errors: [{ field: 'text', code: 'TEXT_HAS_CONTACT_INFO' }] } };
    await user.click(screen.getByRole('button', { name: 'Show the suggestions' }));
    expect(await screen.findByText('Please do not write phone numbers, links or ID numbers here.')).toBeInTheDocument();
  });
});
