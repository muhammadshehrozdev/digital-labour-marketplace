// Batch 4 admin area: charts, overview, users, reason templates, exports, review shortcuts,
// waiting badges, the duplicate compare slider.
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BarList, ColumnChart, SegmentBar, columnPath, labelIndexes, niceScale } from '../components/charts';
import CompareSlider from '../features/admin/CompareSlider';
import WaitingBadge from '../features/admin/WaitingBadge';
import { actionKey, filenameFrom, isTypingTarget, waitingDays, waitingTone } from '../features/admin/adminHelpers';
import { mockApi, me } from './mockApi';
import { renderAt, currentSearch } from './renderApp';

afterEach(() => {
  vi.useRealTimers();
});

const ADMIN = me('admin', { _id: 'admin1', name: 'Test Admin' });
const STATS = { status: 200, data: { workers: { total: 5, Unverified: 1, Pending: 2, Verified: 2, Rejected: 0 }, users: { worker: 5, customer: 3, admin: 1 }, evidence: { total: 4, pending: 1, approved: 2, rejected: 0, suspected_fake: 1, revoked: 0 } } };
// distinct days, oldest first, like the real endpoint
const day = (n) => new Date(Date.UTC(2026, 7, 1) + n * 86400000).toISOString().slice(0, 10);
const charts = (days = 30) => ({
  status: 200,
  data: {
    days,
    timezone: 'Asia/Karachi',
    generatedAt: '2026-11-10T10:00:00Z',
    registrations: Array.from({ length: days }, (_, i) => ({ date: day(i), worker: i === days - 1 ? 2 : 0, customer: i === days - 1 ? 1 : 0 })),
    identity: { counts: { Unverified: 1, Pending: 2, Verified: 2, Rejected: 0 }, waiting: { under1Day: 1, days1to3: 0, days4to7: 1, over7Days: 0, oldest: new Date(Date.now() - 5 * 86400000).toISOString() } },
    evidence: { counts: { pending: 1, approved: 2, rejected: 0, suspected_fake: 1, revoked: 0 }, waiting: { under1Day: 1, days1to3: 0, days4to7: 0, over7Days: 0, oldest: new Date().toISOString() } },
    skillsByCategory: [{ category: 'electrical_solar', count: 4 }, { category: 'plumbing_sanitary', count: 1 }, { category: 'domestic_work', count: 0 }],
  },
});
const AUDIT = { status: 200, data: { entries: [{ seq: 9, createdAt: '2026-11-10T09:00:00Z', actor: { name: 'Test Admin' }, actorRole: 'admin', action: 'user.suspended', targetType: 'User', targetId: 'u9', fromState: 'active', toState: 'suspended', reason: 'Copied proof' }], total: 1, page: 1, limit: 8, actions: ['user.suspended'] } };
const VERIFY_OK = { status: 200, data: { ok: true, count: 9, checkedAt: '2026-11-10T10:00:00Z' } };
const overviewRoutes = (extra = {}) => ({
  'GET /auth/me': ADMIN,
  'GET /admin/stats': STATS,
  'GET /admin/charts': (config) => charts(Number(config.params.days)),
  'GET /admin/audit': AUDIT,
  'GET /admin/audit/verify': VERIFY_OK,
  ...extra,
});

describe('chart maths', () => {
  test('niceScale: round tick values that cover the largest value', () => {
    expect(niceScale(0)).toEqual({ max: 4, ticks: [0, 1, 2, 3, 4] });
    expect(niceScale(3)).toEqual({ max: 3, ticks: [0, 1, 2, 3] });
    expect(niceScale(7)).toEqual({ max: 8, ticks: [0, 2, 4, 6, 8] });
    expect(niceScale(18)).toEqual({ max: 20, ticks: [0, 5, 10, 15, 20] });
    expect(niceScale(230).max).toBeGreaterThanOrEqual(230);
    expect(niceScale(230).ticks.length).toBeLessThanOrEqual(6);
  });

  test('labelIndexes: never more than the limit, always the first and the last', () => {
    expect(labelIndexes(5)).toEqual([0, 1, 2, 3, 4]);
    const picked = labelIndexes(30);
    expect(picked[0]).toBe(0);
    expect(picked.at(-1)).toBe(29);
    expect(picked.length).toBeLessThanOrEqual(6);
    expect(new Set(picked).size).toBe(picked.length);
  });

  test('columnPath: rounded on top, square at the baseline; nothing for zero height', () => {
    expect(columnPath(10, 20, 12, 0, 4)).toBe('');
    const path = columnPath(10, 20, 12, 40, 4);
    expect(path.startsWith('M10 60V24')).toBe(true); // starts at the baseline corner
    expect(path.endsWith('V60Z')).toBe(true); // and returns to the baseline with no curve
  });
});

describe('charts', () => {
  const series = [{ id: 'worker', label: 'Workers', color: 'var(--viz-1)' }, { id: 'customer', label: 'Customers', color: 'var(--viz-2)' }];
  const data = [
    { key: 'a', label: '1 Nov', values: { worker: 2, customer: 1 } },
    { key: 'b', label: '2 Nov', values: { worker: 0, customer: 3 } },
  ];
  const props = { title: 'New accounts per day', series, emptyText: 'No new accounts', tableLabel: 'Show the numbers as a table', dateHeader: 'Date', totalLabel: 'Total' };

  test('column chart: a legend for both series, a summary for screen readers, and the same numbers as a table', () => {
    const { container } = render(<ColumnChart {...props} data={data} />);
    expect(screen.getByRole('heading', { name: 'New accounts per day' })).toBeInTheDocument();
    const legend = container.querySelector('figcaption ul');
    expect(within(legend).getByText('Workers')).toBeInTheDocument();
    expect(within(legend).getByText('Customers')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'New accounts per day. Total: 6' })).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows.map((r) => r.textContent)).toEqual(['DateWorkersCustomers', '1 Nov21', '2 Nov03']);
  });

  test('column chart: arrow keys walk the columns and show every series of that day; Escape hides it', async () => {
    const user = userEvent.setup();
    render(<ColumnChart {...props} data={data} />);
    screen.getByRole('group', { name: /New accounts per day/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('1 Nov2 Workers1 Customers');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('status')).toHaveTextContent('2 Nov0 Workers3 Customers');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('status')).toBeNull();
  });

  test('column chart with only zeros says so instead of drawing an empty plot', () => {
    render(<ColumnChart {...props} data={[{ key: 'a', label: '1 Nov', values: { worker: 0, customer: 0 } }]} />);
    expect(screen.getByText('No new accounts')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /New accounts per day/ })).toBeNull();
  });

  test('text is never drawn in a series colour; marks use the chart colour variables', () => {
    const { container } = render(<ColumnChart {...props} data={data} />);
    for (const text of container.querySelectorAll('svg text')) expect(text.getAttribute('fill')).toBeNull();
    expect([...container.querySelectorAll('svg path, svg rect[fill]')].map((m) => m.getAttribute('fill')).filter((f) => f?.startsWith('var(--viz-')).length).toBeGreaterThan(0);
  });

  test('bar list: one row per item with its name and figure; sorted largest first when asked', () => {
    render(<BarList title="Skills by trade" emptyText="Nothing" sorted rows={[{ id: 'a', label: 'Plumbing', value: 1 }, { id: 'b', label: 'Electrical', value: 4 }]} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Electrical4', 'Plumbing1']);
  });

  test('bar list with no values shows the empty text', () => {
    render(<BarList title="Skills by trade" emptyText="Nothing to show yet." rows={[{ id: 'a', label: 'Plumbing', value: 0 }]} />);
    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });

  test('segmented bar: the figures are listed beside it and named for screen readers; empty draws nothing', () => {
    const segments = [{ id: 'a', label: 'Under 1 day', value: 2 }, { id: 'b', label: '1 to 3 days', value: 0 }];
    const { container, rerender } = render(<SegmentBar label="Waiting" segments={segments} />);
    expect(screen.getByRole('img', { name: 'Waiting: Under 1 day 2, 1 to 3 days 0' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Under 1 day2', '1 to 3 days0']);
    rerender(<SegmentBar label="Waiting" segments={[{ id: 'a', label: 'Under 1 day', value: 0 }]} />);
    expect(container.textContent).toBe('');
  });
});

describe('admin helpers', () => {
  test('waiting days and tone', () => {
    const now = Date.parse('2026-11-10T12:00:00Z');
    expect(waitingDays('2026-11-10T08:00:00Z', now)).toBe(0);
    expect(waitingDays('2026-11-07T11:00:00Z', now)).toBe(3);
    expect(waitingDays(null, now)).toBeNull();
    expect(waitingDays('not a date', now)).toBeNull();
    expect([0, 1, 4, 8].map(waitingTone)).toEqual(['neutral', 'info', 'warning', 'danger']);
  });

  test('action names, typing targets and file names', () => {
    expect(actionKey('identity.decision')).toBe('adminx.actions.identity_decision');
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
    expect(filenameFrom('attachment; filename="dlm-audit-2026-11-10.csv"', 'x.csv')).toBe('dlm-audit-2026-11-10.csv');
    expect(filenameFrom(undefined, 'x.csv')).toBe('x.csv');
  });

  test('waiting badge: "today" for under a day, then the number of days', () => {
    const { rerender } = render(<WaitingBadge since={new Date().toISOString()} />);
    expect(screen.getByText('Waiting since today')).toBeInTheDocument();
    rerender(<WaitingBadge since={new Date(Date.now() - 3.2 * 86400000).toISOString()} />);
    expect(screen.getByText('Waiting 3 days')).toBeInTheDocument();
    rerender(<WaitingBadge since={new Date(Date.now() - 1.1 * 86400000).toISOString()} />);
    expect(screen.getByText('Waiting 1 day')).toBeInTheDocument();
  });
});

describe('admin overview (features 27, 28, 32, 33)', () => {
  test('queues with real counts and waiting times, the chain status, charts and the activity feed', async () => {
    mockApi(overviewRoutes());
    renderAt('/admin');
    const now = await screen.findByRole('region', { name: 'Needs your attention' });
    const identity = (await within(now).findByRole('heading', { name: 'Waiting for identity review' })).closest('article');
    expect(within(identity).getByText('2')).toBeInTheDocument();
    expect(within(identity).getByText('Oldest: Waiting 5 days')).toBeInTheDocument();
    expect(within(identity).getByRole('link', { name: /Open the queue: Waiting for identity review/ })).toHaveAttribute('href', '/admin/identity?status=Pending');
    expect(within(identity).getByRole('img', { name: /How long they have waited: Under 1 day 1, 1 to 3 days 0, 4 to 7 days 1, Over 7 days 0/ })).toBeInTheDocument();
    expect(await within(now).findByText('Chain intact')).toBeInTheDocument();
    expect(within(now).getByText('9 entries checked. Nothing was changed, added or removed.')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'New accounts per day' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Worker profiles by identity status' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skills on profiles, by trade' })).toBeInTheDocument();
    const feed = screen.getByRole('region', { name: 'Latest activity' });
    expect(await within(feed).findByText('Account suspended')).toBeInTheDocument(); // plain words, not "user.suspended"
    expect(within(feed).getByText('Updates every 30 seconds')).toBeInTheDocument();
  });

  test('choosing another period asks the server again with that number of days', async () => {
    const calls = mockApi(overviewRoutes());
    renderAt('/admin');
    const periods = await screen.findByRole('radiogroup', { name: 'Period for new accounts' });
    expect(within(periods).getByRole('radio', { name: 'Last 30 days' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.setup().click(within(periods).getByRole('radio', { name: 'Last 7 days' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /admin/charts' && c.params.days === '7')).toBe(true));
    expect(within(periods).getByRole('radio', { name: 'Last 7 days' })).toHaveAttribute('aria-checked', 'true');
  });

  test('a broken chain is named with its entry number and what to do; "Check again" asks again', async () => {
    const calls = mockApi(overviewRoutes({ 'GET /admin/audit/verify': { status: 200, data: { ok: false, count: 3, badSeq: 4, problemCode: 'content_changed', problem: 'content was changed', checkedAt: '2026-11-10T10:00:00Z' } } }));
    renderAt('/admin');
    expect(await screen.findByText('Chain broken at entry 4')).toBeInTheDocument();
    expect(screen.getByText(/This entry was changed after it was written\. Stop making decisions/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Check again' }));
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /admin/audit/verify')).toHaveLength(2));
  });

  test('the activity feed asks again every 30 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const calls = mockApi(overviewRoutes());
    renderAt('/admin');
    await screen.findByText('Account suspended');
    const before = calls.filter((c) => c.key === 'GET /admin/audit').length;
    await vi.advanceTimersByTimeAsync(30500);
    await waitFor(() => expect(calls.filter((c) => c.key === 'GET /admin/audit').length).toBe(before + 1));
  });

  test('the sidebar has every admin page', async () => {
    mockApi(overviewRoutes());
    renderAt('/admin');
    const nav = await screen.findByRole('navigation', { name: 'Admin' });
    // Batch 6 (Module 4) added bookings, disputes, reviews and reputation flags; Batch 7 (Module 5) payments and the price guide
    expect(within(nav).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/admin', '/admin/identity', '/admin/evidence', '/admin/bookings', '/admin/disputes', '/admin/reviews', '/admin/flags', '/admin/payments', '/admin/price-guide', '/admin/users', '/admin/audit', '/admin/templates', '/admin/exports']);
  });
});

const USERS = [
  { _id: 'u1', name: 'Rashid Worker', email: 'rashid@example.com', phone: '03001112223', role: 'worker', status: 'active', createdAt: '2026-11-01T10:00:00Z', lockedNow: false, suspendedAt: null, suspensionReason: '' },
  { _id: 'u2', name: 'Sana Customer', email: 'sana@example.com', phone: '03004445556', role: 'customer', status: 'suspended', createdAt: '2026-11-02T10:00:00Z', lockedNow: false, suspendedAt: '2026-11-05T10:00:00Z', suspensionReason: 'Reported for misuse' },
  { _id: 'admin1', name: 'Test Admin', email: 'admin@example.com', phone: '03007778889', role: 'admin', status: 'active', createdAt: '2026-10-01T10:00:00Z', lockedNow: false, suspendedAt: null, suspensionReason: '' },
];
const userDetail = (u, extra = {}) => ({ status: 200, data: { user: u, worker: null, customer: null, activity: [], ...extra } });
const usersRoutes = (extra = {}) => ({
  'GET /auth/me': ADMIN,
  'GET /admin/users': { status: 200, data: { users: USERS, page: 1, limit: 25, total: 3 } },
  'GET /admin/users/u1': userDetail(USERS[0], { worker: { profileId: 'p1', workerIdCode: 'DLM-2026-000042', occupation: 'Electrician', category: 'electrical_solar', city: 'Rawalpindi', verificationStatus: 'Pending', cnicOnFile: true, profileCompletion: 80, skills: 2, evidence: { pending: 1, approved: 2, rejected: 0, suspected_fake: 0, revoked: 0 } }, activity: [{ seq: 3, action: 'cnic.updated', createdAt: '2026-11-03T10:00:00Z', reason: 'Worker saved a new CNIC' }] }),
  'GET /admin/users/u2': userDetail(USERS[1], { customer: { savedWorkers: 2 } }),
  'GET /admin/users/admin1': userDetail(USERS[2]),
  'GET /admin/reason-templates': { status: 200, data: { templates: [{ _id: 't1', kind: 'user_suspend', text: { en: 'Copied or false proof was uploaded more than once.', ur: 'نقل شدہ ثبوت', 'ur-Latn': '' } }], max: 60 } },
  ...extra,
});

describe('admin users (feature 26)', () => {
  test('the list shows name, contact, role and a status in words; filters live in the address', async () => {
    const calls = mockApi(usersRoutes());
    const user = userEvent.setup();
    renderAt('/admin/users?role=worker');
    expect(await screen.findByRole('heading', { level: 1, name: 'Users' })).toBeInTheDocument();
    const table = await screen.findByRole('table', { name: 'User accounts' });
    expect(within(table).getByText('Suspended')).toBeInTheDocument();
    expect(within(table).getAllByText('Active')).toHaveLength(2);
    expect(calls.find((c) => c.key === 'GET /admin/users').params).toMatchObject({ role: 'worker', page: '1' });
    await user.selectOptions(screen.getByLabelText('Status'), 'suspended');
    expect(currentSearch()).toBe('?role=worker&status=suspended');
    await user.type(screen.getByRole('searchbox', { name: 'Search name, email or phone' }), 'sana');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(currentSearch()).toBe('?role=worker&status=suspended&q=sana');
    await waitFor(() => expect(calls.at(-1).params).toMatchObject({ q: 'sana', status: 'suspended', role: 'worker' }));
  });

  test('a worker: summary, last activity in plain words, and "Suspend" needs a reason', async () => {
    const calls = mockApi(usersRoutes({ 'PATCH /admin/users/u1/status': (config, body) => ({ status: 200, data: { user: { ...USERS[0], status: body.status, suspensionReason: body.reason } } }) }));
    const user = userEvent.setup();
    renderAt('/admin/users');
    await user.click(await screen.findByRole('button', { name: 'Open Rashid Worker' }));
    const drawer = await screen.findByRole('dialog', { name: 'Rashid Worker' });
    expect(await within(drawer).findByText('DLM-2026-000042')).toBeInTheDocument();
    expect(within(drawer).getByText('Approved 2 · Waiting 1 · Not accepted 0 · Suspected fake 0 · Withdrawn 0')).toBeInTheDocument();
    expect(within(drawer).getByText('CNIC saved by the worker')).toBeInTheDocument();
    expect(drawer.textContent).not.toMatch(/\d{5}-\d{7}-\d/); // never a CNIC

    await user.click(within(drawer).getByRole('button', { name: 'Suspend account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Suspend Rashid Worker?' });
    await user.click(within(dialog).getByRole('button', { name: 'Suspend account' }));
    expect(within(dialog).getByText('Write a reason of at least 5 characters.')).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('PATCH /admin/users'))).toBe(false);

    // a saved reason fills the box; the admin can still change it
    await user.selectOptions(within(dialog).getByLabelText('Insert a saved reason'), 't1');
    expect(within(dialog).getByLabelText(/^Reason/)).toHaveValue('Copied or false proof was uploaded more than once.');
    await user.click(within(dialog).getByRole('button', { name: 'Suspend account' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/users/u1/status')?.body).toEqual({ status: 'suspended', reason: 'Copied or false proof was uploaded more than once.' }));
    expect(await screen.findByText('Account suspended')).toBeInTheDocument();
  });

  test('a suspended customer shows the reason and can be reactivated', async () => {
    const calls = mockApi(usersRoutes({ 'PATCH /admin/users/u2/status': { status: 200, data: { user: { ...USERS[1], status: 'active' } } } }));
    const user = userEvent.setup();
    renderAt('/admin/users');
    await user.click(await screen.findByRole('button', { name: 'Open Sana Customer' }));
    const drawer = await screen.findByRole('dialog', { name: 'Sana Customer' });
    expect(await within(drawer).findByText('Reported for misuse')).toBeInTheDocument();
    expect(within(drawer).getByText('2 saved workers')).toBeInTheDocument();
    await user.click(within(drawer).getByRole('button', { name: 'Reactivate account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Reactivate Sana Customer?' });
    await user.type(within(dialog).getByLabelText(/^Reason/), 'Checked and resolved');
    await user.click(within(dialog).getByRole('button', { name: 'Reactivate account' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/users/u2/status')?.body).toEqual({ status: 'active', reason: 'Checked and resolved' }));
  });

  test('an admin account has no suspend button; your own account says why', async () => {
    mockApi(usersRoutes());
    const user = userEvent.setup();
    renderAt('/admin/users');
    await user.click(await screen.findByRole('button', { name: 'Open Test Admin' }));
    const drawer = await screen.findByRole('dialog', { name: 'Test Admin' });
    expect(await within(drawer).findByText('This is your own account. You cannot suspend it.')).toBeInTheDocument();
    expect(within(drawer).queryByRole('button', { name: /Suspend|Reactivate/ })).toBeNull();
  });

  test('a server refusal (for example a CNIC number in the reason) is shown at the reason box', async () => {
    mockApi(usersRoutes({ 'PATCH /admin/users/u1/status': { status: 400, data: { code: 'NOTE_HAS_CNIC', message: 'x', errors: [{ field: 'reason', code: 'NOTE_HAS_CNIC', params: {}, message: 'x' }] } } }));
    const user = userEvent.setup();
    renderAt('/admin/users');
    await user.click(await screen.findByRole('button', { name: 'Open Rashid Worker' }));
    await user.click(await screen.findByRole('button', { name: 'Suspend account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Suspend Rashid Worker?' });
    await user.type(within(dialog).getByLabelText(/^Reason/), 'cnic 37405-1234567-1');
    await user.click(within(dialog).getByRole('button', { name: 'Suspend account' }));
    expect(await within(dialog).findByText('Do not write a CNIC number here. Notes are saved in the audit log.')).toBeInTheDocument();
  });

  test('a customer or worker never reaches the admin users page', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/admin/users');
    await waitFor(() => expect(screen.queryByRole('heading', { level: 1, name: 'Users' })).toBeNull());
    expect(screen.queryByRole('table', { name: 'User accounts' })).toBeNull();
  });
});

describe('reason templates (feature 29)', () => {
  const TEMPLATES = [
    { _id: 't1', kind: 'identity_reject', text: { en: 'The name on the CNIC card does not match.', ur: 'نام نہیں ملتا۔', 'ur-Latn': 'Naam nahi milta.' } },
    { _id: 't2', kind: 'user_suspend', text: { en: 'The account is being checked.', ur: '', 'ur-Latn': '' } },
  ];

  test('empty: an illustrated empty state offers the starter set', async () => {
    const calls = mockApi({ 'GET /auth/me': ADMIN, 'GET /admin/reason-templates': { status: 200, data: { templates: [], max: 60 } }, 'POST /admin/reason-templates/starter-set': { status: 201, data: { added: 12, templates: TEMPLATES, max: 60 } } });
    const { container } = renderAt('/admin/templates');
    expect(await screen.findByRole('heading', { name: 'No templates yet' })).toBeInTheDocument();
    expect(container.querySelector('svg[data-scene]')).not.toBeNull();
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Add the starter set' })[0]);
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /admin/reason-templates/starter-set')).toBe(true));
    expect(await screen.findByText('12 templates added')).toBeInTheDocument();
  });

  test('templates are grouped by where they are used, each text in its own language and direction', async () => {
    mockApi({ 'GET /auth/me': ADMIN, 'GET /admin/reason-templates': { status: 200, data: { templates: TEMPLATES, max: 60 } } });
    renderAt('/admin/templates');
    expect(await screen.findByRole('heading', { level: 2, name: 'Identity: not accepted' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Account: suspend' })).toBeInTheDocument();
    expect(screen.getByText('2 of 60 templates')).toBeInTheDocument();
    const urdu = screen.getByText('نام نہیں ملتا۔');
    expect(urdu).toHaveAttribute('lang', 'ur');
    expect(urdu).toHaveAttribute('dir', 'rtl');
  });

  test('adding needs the English text; the three texts are sent', async () => {
    const calls = mockApi({ 'GET /auth/me': ADMIN, 'GET /admin/reason-templates': { status: 200, data: { templates: TEMPLATES, max: 60 } }, 'POST /admin/reason-templates': { status: 201, data: { template: {} } } });
    const user = userEvent.setup();
    renderAt('/admin/templates');
    await user.click(await screen.findByRole('button', { name: 'Add a template' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a reason template' });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(within(dialog).getByText('Write the English text (at least 5 characters).')).toBeInTheDocument();
    await user.selectOptions(within(dialog).getByLabelText('Used for'), 'evidence_fake');
    await user.type(within(dialog).getByLabelText(/^English text/), 'The certificate was edited.');
    await user.type(within(dialog).getByLabelText(/^Roman Urdu text/), 'Certificate mein tabdeeli ki gayi.');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /admin/reason-templates')?.body).toEqual({ kind: 'evidence_fake', text: { en: 'The certificate was edited.', 'ur-Latn': 'Certificate mein tabdeeli ki gayi.' } }));
  });

  test('editing keeps the kind fixed; deleting asks first', async () => {
    const calls = mockApi({ 'GET /auth/me': ADMIN, 'GET /admin/reason-templates': { status: 200, data: { templates: TEMPLATES, max: 60 } }, 'PATCH /admin/reason-templates/t2': { status: 200, data: { template: {} } }, 'DELETE /admin/reason-templates/t2': { status: 200, data: { deleted: true } } });
    const user = userEvent.setup();
    renderAt('/admin/templates');
    await user.click(await screen.findByRole('button', { name: 'Edit: The account is being checked.' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit the reason template' });
    expect(within(dialog).getByLabelText('Used for')).toBeDisabled();
    await user.type(within(dialog).getByLabelText(/^English text/), ' Please wait.');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/reason-templates/t2')?.body).toEqual({ text: { en: 'The account is being checked. Please wait.' } }));
    await user.click(await screen.findByRole('button', { name: 'Delete: The account is being checked.' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete this template?' });
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'DELETE /admin/reason-templates/t2')).toBe(true));
  });
});

describe('exports (feature 31)', () => {
  test('the page says what is never in a file; a download sends the filters and saves the file', async () => {
    const created = [];
    URL.createObjectURL = vi.fn((blob) => { created.push(blob); return 'blob:test'; });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const calls = mockApi({
      'GET /auth/me': ADMIN,
      'GET /admin/exports/identity': { status: 200, data: new Blob(['worker_id\r\n']), headers: { 'content-disposition': 'attachment; filename="dlm-identity-2026-11-10.csv"', 'x-export-rows': '3', 'x-export-truncated': 'false' } },
      'GET /admin/exports/audit': { status: 200, data: new Blob(['seq\r\n']), headers: { 'x-export-rows': '5000', 'x-export-truncated': 'true' } },
    });
    const user = userEvent.setup();
    renderAt('/admin/exports');
    expect(await screen.findByText(/CNIC numbers, passwords, home addresses and photos are never included/)).toBeInTheDocument();
    await user.selectOptions(within(screen.getByRole('region', { name: 'Identity queue' })).getByLabelText('Status'), 'Verified');
    await user.click(screen.getByRole('button', { name: 'Download CSV: Identity queue' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'GET /admin/exports/identity')?.params).toEqual({ status: 'Verified' }));
    expect(await screen.findByText('File downloaded: 3 rows')).toBeInTheDocument();
    expect(created).toHaveLength(1);
    expect(click).toHaveBeenCalledTimes(1);

    // empty filters are not sent; a file that hit the row limit says so
    await user.click(screen.getByRole('button', { name: 'Download CSV: Audit log' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'GET /admin/exports/audit')?.params).toEqual({}));
    expect(await screen.findByText(/Only the first 5,000 rows are in the file/)).toBeInTheDocument();
    click.mockRestore();
  });

  test('a failed download shows a message and saves nothing', async () => {
    URL.createObjectURL = vi.fn();
    mockApi({ 'GET /auth/me': ADMIN, 'GET /admin/exports/users': { status: 500, data: { code: 'SERVER_ERROR', message: 'Something went wrong on the server. Please try again later.' } } });
    renderAt('/admin/exports');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Download CSV: Users' }));
    expect(await screen.findByText('Something went wrong on the server. Please try again later.')).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});

const WORKERS = [
  { _id: 'p1', workerIdCode: 'DLM-2026-000001', user: { name: 'First Worker', email: 'a@example.com', phone: '03000000001' }, occupation: 'Electrician', category: 'electrical_solar', city: 'Rawalpindi', cnicOnFile: true, verificationStatus: 'Pending', identityRequestedAt: new Date(Date.now() - 2.5 * 86400000).toISOString(), updatedAt: '2026-11-08T10:00:00Z' },
  { _id: 'p2', workerIdCode: 'DLM-2026-000002', user: { name: 'Second Worker', email: 'b@example.com', phone: '03000000002' }, occupation: 'Plumber', category: 'plumbing_sanitary', city: 'Islamabad', cnicOnFile: true, verificationStatus: 'Pending', identityRequestedAt: new Date().toISOString(), updatedAt: '2026-11-10T10:00:00Z' },
];
const identityRoutes = () => ({
  'GET /auth/me': ADMIN,
  'GET /admin/workers': { status: 200, data: { workers: WORKERS, page: 1, limit: 25, total: 2 } },
  'GET /admin/reason-templates': (config) => ({ status: 200, data: { templates: config.params.kind === 'identity_reject' ? [{ _id: 'r1', kind: 'identity_reject', text: { en: 'The name does not match.', ur: '', 'ur-Latn': '' } }] : [], max: 60 } }),
});

describe('review shortcuts, waiting times and saved reasons (features 28, 29, 30)', () => {
  test('the identity queue shows how long each pending worker has waited', async () => {
    mockApi(identityRoutes());
    renderAt('/admin/identity');
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Waiting 2 days')).toBeInTheDocument();
    expect(within(table).getByText('Waiting since today')).toBeInTheDocument();
  });

  test('R chooses "not accepted", A chooses "verified", J and K move through the queue, ? opens the list', async () => {
    mockApi(identityRoutes());
    const user = userEvent.setup();
    renderAt('/admin/identity');
    await user.click(await screen.findByRole('button', { name: /First Worker/ }));
    const drawer = await screen.findByRole('dialog', { name: /First Worker/ });
    expect(within(drawer).getByRole('radio', { name: /^Verified/ })).toBeChecked();
    await user.keyboard('r');
    expect(within(drawer).getByRole('radio', { name: /^Rejected/ })).toBeChecked();
    await user.keyboard('a');
    expect(within(drawer).getByRole('radio', { name: /^Verified/ })).toBeChecked();

    await user.keyboard('j');
    expect(await screen.findByRole('dialog', { name: /Second Worker/ })).toBeInTheDocument();
    await user.keyboard('j'); // already the last one: stays
    expect(screen.getByRole('dialog', { name: /Second Worker/ })).toBeInTheDocument();
    await user.keyboard('k');
    expect(await screen.findByRole('dialog', { name: /First Worker/ })).toBeInTheDocument();

    await user.keyboard('?');
    const help = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
    expect(within(help).getByText('Approve / verified')).toBeInTheDocument();
    expect(within(help).getByText('Shortcuts do not work while you are typing in a box.')).toBeInTheDocument();
  });

  test('shortcuts never fire while typing a note, or with Ctrl held', async () => {
    mockApi(identityRoutes());
    const user = userEvent.setup();
    renderAt('/admin/identity');
    await user.click(await screen.findByRole('button', { name: /First Worker/ }));
    const drawer = await screen.findByRole('dialog', { name: /First Worker/ });
    const note = within(drawer).getByLabelText(/^Note/);
    await user.type(note, 'rajkumar?');
    expect(note).toHaveValue('rajkumar?');
    expect(within(drawer).getByRole('radio', { name: /^Verified/ })).toBeChecked(); // "r" in the note did nothing
    expect(screen.getByRole('dialog', { name: /First Worker/ })).toBeInTheDocument(); // "j" did not move on
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull();
    note.blur();
    fireEvent.keyDown(document.body, { key: 'r', ctrlKey: true });
    expect(within(drawer).getByRole('radio', { name: /^Verified/ })).toBeChecked();
  });

  test('a saved reason for the chosen decision fills the note', async () => {
    mockApi(identityRoutes());
    const user = userEvent.setup();
    renderAt('/admin/identity');
    await user.click(await screen.findByRole('button', { name: /First Worker/ }));
    const drawer = await screen.findByRole('dialog', { name: /First Worker/ });
    expect(await within(drawer).findByText('No saved reasons for this kind yet')).toBeInTheDocument(); // none for "verified"
    await user.click(within(drawer).getByRole('radio', { name: /^Rejected/ }));
    await user.selectOptions(await within(drawer).findByLabelText('Insert a saved reason'), 'r1');
    expect(within(drawer).getByLabelText(/^Note/)).toHaveValue('The name does not match.');
  });
});

describe('duplicate compare slider (feature 34)', () => {
  const props = { thisSrc: '/a.webp', earlierSrc: '/b.webp', thisAlt: 'This upload for House wiring', earlierAlt: 'Earlier photo of another worker', earlierLabel: 'Possible duplicate of Other Worker' };

  test('a real range slider (keyboard friendly) uncovers the earlier photo', () => {
    const { container } = render(<CompareSlider {...props} />);
    const slider = screen.getByRole('slider', { name: 'Slide to compare this upload with the earlier photo' });
    expect(slider).toHaveValue('50');
    fireEvent.change(slider, { target: { value: '80' } });
    expect(container.querySelector('[style*="--cut"]').style.getPropertyValue('--cut')).toBe('80%');
    expect(screen.getByRole('img', { name: 'This upload for House wiring' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Earlier photo of another worker' })).toBeInTheDocument();
  });

  test('"Side by side" shows both photos next to each other with captions', async () => {
    const user = userEvent.setup();
    render(<CompareSlider {...props} />);
    await user.click(screen.getByRole('button', { name: 'Side by side' }));
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Slider' }));
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });
});
