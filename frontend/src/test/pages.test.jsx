// Worker, customer and admin pages: navigation, privacy (D-002), identity review (M1-9).
import { describe, test, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE } from './mockApi';
import { renderAt, pathname } from './renderApp';

const COMPLETE = onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z');
const workerRoutes = (extra = {}) => ({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': COMPLETE, 'GET /workers/me': { status: 200, data: PROFILE }, ...extra });

// Private data that must never appear on customer screens (even if a buggy server sent it).
const SECRETS = ['03001234567', '03007654321', '03111111111', 'Satellite Town', 'rashid@example.com', '37405-1234567-1', '3740512345671'];
const LEAKY_WORKER = {
  _id: 'p1', workerIdCode: 'DLM-2026-000042', occupation: 'Electrician', category: 'electrical_solar', city: 'Rawalpindi',
  experienceYears: 6, hourlyRate: 800, dailyRate: 4000, availability: 'Available', verificationStatus: 'Verified', languages: ['Urdu'],
  skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', custom: false }],
  user: { name: 'Rashid Mehmood', phone: '03001234567', email: 'rashid@example.com' },
  phone: '03001234567', whatsappNumber: '03007654321', emergencyContact: '03111111111', address: 'Satellite Town', cnicNumber: '37405-1234567-1', email: 'rashid@example.com',
  workHistory: [{ jobTitle: 'House wiring', duration: '2 weeks', description: 'Full house', clientOrEmployer: 'Satellite Town client' }],
};

describe('worker navigation (D-011)', () => {
  test('the top menu has Dashboard and Profile only: no Module 2 / skills link, no "AI"', async () => {
    mockApi(workerRoutes());
    renderAt('/worker');
    const nav = await screen.findAllByRole('navigation', { name: 'Main' });
    for (const n of nav) {
      const names = within(n).queryAllByRole('link').map((l) => l.textContent);
      expect(names).toEqual(['Dashboard', 'Profile']);
    }
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open menu' }));
    const mobile = screen.getAllByRole('navigation', { name: 'Main' }).at(-1);
    expect(within(mobile).queryAllByRole('link').map((l) => l.textContent)).toEqual(['Dashboard', 'Profile']);
    expect(document.querySelector('header').textContent).not.toMatch(/skill|profiler|\bAI\b/i);
  });

  test('dashboard: real worker ID, completion ring, identity chip, skills with "Self-declared", "Update skills" opens /worker/skills', async () => {
    mockApi(workerRoutes());
    renderAt('/worker');
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome, Rashid' })).toBeInTheDocument();
    expect(screen.getByText(/DLM-2026-000042/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Profile completion' })).toHaveAttribute('aria-valuenow', '80');
    expect(screen.getByText('Identity pending review')).toBeInTheDocument();
    expect(screen.getAllByText('Self-declared').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Update skills' })).toHaveAttribute('href', '/worker/skills');
    expect(screen.getByText('Coming next')).toBeInTheDocument();
  });

  test('a rejected identity shows the admin reason on the dashboard', async () => {
    mockApi(workerRoutes({ 'GET /workers/me': { status: 200, data: { ...PROFILE, verificationStatus: 'Rejected', identityNote: 'Name on CNIC does not match' } } }));
    renderAt('/worker');
    expect(await screen.findByText('Name on CNIC does not match')).toBeInTheDocument();
    expect(screen.getByText('Identity not accepted')).toBeInTheDocument();
  });

  test('profile page: real worker ID (never a placeholder), own phone shown to the owner, CNIC "Saved (hidden)", M1-15 fields', async () => {
    mockApi(workerRoutes());
    const { container } = renderAt('/worker/profile');
    expect(await screen.findByRole('heading', { level: 1, name: 'Your profile' })).toBeInTheDocument();
    expect(screen.getByText(/DLM-2026-000042/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/DLM-2026-NEW/);
    expect(screen.getByLabelText(/^Phone number/)).toHaveValue('03001234567');
    expect(screen.getByLabelText(/^CNIC number/)).toHaveAttribute('placeholder', 'Saved (hidden). Type only to change it');
    expect(screen.getByLabelText(/^CNIC number/)).toHaveValue('');
    expect(screen.getByLabelText(/^Emergency contact/)).toHaveValue('Brother 03111111111');
    expect(screen.getByLabelText(/^Languages you speak/)).toHaveValue('Urdu');
    expect(screen.getByRole('link', { name: 'Edit skills' })).toHaveAttribute('href', '/worker/skills');
  });

  test('past work records keep duration and description (M1-15)', async () => {
    const calls = mockApi(workerRoutes({ 'PUT /workers/me': (cfg, body) => ({ status: 200, data: { profile: { ...PROFILE, ...body }, onboarding: COMPLETE.data } }) }));
    renderAt('/worker/profile');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Add a past job' }));
    await user.type(screen.getByLabelText(/^Job title/), 'House wiring');
    await user.type(screen.getByLabelText(/^Duration/), '2 weeks');
    await user.type(screen.getByLabelText(/^What you did/), 'Full house');
    await user.click(screen.getByRole('button', { name: 'Save work details' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PUT /workers/me')?.body.workHistory).toEqual([
      { jobTitle: 'House wiring', clientOrEmployer: '', duration: '2 weeks', description: 'Full house' },
    ]));
  });

  test('removing a skill asks first (ConfirmDialog), then calls DELETE', async () => {
    const calls = mockApi(workerRoutes({
      'GET /workers/me/skills': { status: 200, data: { skills: PROFILE.skills } },
      'DELETE /workers/me/skills/elec_wiring': { status: 200, data: { skills: [], onboarding: onboarding({ about: true, work: true, skills: false }).data } },
    }));
    renderAt('/worker/skills');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Remove House wiring' }));
    const dialog = screen.getByRole('dialog', { name: 'Remove this skill?' });
    expect(calls.some((c) => c.key.startsWith('DELETE'))).toBe(false);
    await user.click(within(dialog).getByRole('button', { name: 'Remove skill' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'DELETE /workers/me/skills/elec_wiring')).toBe(true));
  });

  test('a worker who has not finished onboarding cannot open /worker/profile (sent to the right step)', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': onboarding({ about: true, work: false, skills: false }), 'GET /workers/me': { status: 200, data: { ...PROFILE, skills: [] } } });
    renderAt('/worker/profile');
    expect(await screen.findByRole('heading', { level: 1, name: 'Your work' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/work');
  });
});

describe('customer pages (D-002)', () => {
  test('directory cards never render phone, WhatsApp, email, address or CNIC', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [LEAKY_WORKER], page: 1, limit: 12, total: 1 } } });
    const { container } = renderAt('/find');
    const card = await screen.findByTestId('worker-card');
    expect(within(card).getByRole('link', { name: 'Rashid Mehmood' })).toHaveAttribute('href', '/workers/DLM-2026-000042');
    expect(within(card).getByText('Identity verified')).toBeInTheDocument();
    expect(within(card).getByText('House wiring')).toBeInTheDocument();
    for (const s of SECRETS) expect(container.textContent).not.toContain(s);
  });

  test('filters ask the server (identity=verified, category) and an empty result shows a way out', async () => {
    const calls = mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/find');
    const user = userEvent.setup();
    await screen.findByRole('option', { name: 'Domestic Work' });
    await user.click(screen.getByRole('switch', { name: 'Identity verified only' }));
    await user.selectOptions(screen.getByLabelText('Trade'), 'domestic_work');
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /workers' && c.params.identity === 'verified' && c.params.category === 'domestic_work')).toBe(true));
    expect(await screen.findByRole('heading', { name: 'No workers match' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear search and filters' })).toBeInTheDocument();
  });

  test('a server error shows a message with "Try again"', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 500, data: { message: 'Something went wrong on the server. Please try again later.' } } });
    renderAt('/find');
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on the server');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  test('public profile: public fields and skills only, contact note, no private data, no client name', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers/DLM-2026-000042': { status: 200, data: LEAKY_WORKER } });
    const { container } = renderAt('/workers/DLM-2026-000042');
    expect(await screen.findByRole('heading', { level: 1, name: 'Rashid Mehmood' })).toBeInTheDocument();
    expect(screen.getByText('Contact details are shared after a booking is accepted (coming in a later module).')).toBeInTheDocument();
    expect(screen.getAllByText('Self-declared').length).toBe(1);
    for (const s of [...SECRETS, 'Satellite Town client']) expect(container.textContent).not.toContain(s);
  });

  test('unknown worker ID -> "Worker not found"', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers/DLM-2026-999999': { status: 404, data: { message: 'Worker not found' } } });
    renderAt('/workers/DLM-2026-999999');
    expect(await screen.findByRole('heading', { level: 1, name: 'Worker not found' })).toBeInTheDocument();
  });
});

describe('admin pages (M1-9)', () => {
  const ADMIN_WORKER = { ...PROFILE, user: { name: 'Rashid Mehmood', email: 'rashid@example.com', phone: '03001234567' }, updatedAt: '2026-11-09T10:00:00Z' };
  const adminRoutes = (extra = {}) => ({
    'GET /auth/me': me('admin'),
    'GET /admin/workers': { status: 200, data: { workers: [ADMIN_WORKER], page: 1, limit: 25, total: 1 } },
    ...extra,
  });

  test('overview shows the real counts from the server', async () => {
    mockApi({ 'GET /auth/me': me('admin'), 'GET /admin/stats': { status: 200, data: { workers: { total: 7, Unverified: 1, Pending: 3, Verified: 2, Rejected: 1 }, users: { worker: 7, customer: 4, admin: 1 } } } });
    renderAt('/admin');
    expect(await screen.findByRole('heading', { level: 1, name: 'Admin overview' })).toBeInTheDocument();
    const label = await screen.findByText('Waiting for identity review', { selector: 'p' });
    expect(label.previousSibling).toHaveTextContent('3');
    expect(label.parentElement.querySelector('a')).toHaveAttribute('href', '/admin/identity?status=Pending');
    expect(label.parentElement.querySelector('a')).toHaveTextContent('Open Waiting for identity review');
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();
  });

  test('decision drawer: a note is required; nothing is sent without it', async () => {
    const calls = mockApi(adminRoutes());
    renderAt('/admin/identity');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Review Rashid Mehmood' }));
    const drawer = screen.getByRole('dialog');
    await user.click(within(drawer).getByRole('button', { name: 'Save decision' }));
    expect(within(drawer).getByText(/Write a note of at least 5 characters/)).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(false);
  });

  test('with a note the decision is sent, a toast confirms it, and the list reloads', async () => {
    const calls = mockApi(adminRoutes({ 'PATCH /admin/workers/p1/identity': { status: 200, data: {} } }));
    renderAt('/admin/identity');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Review Rashid Mehmood' }));
    const drawer = screen.getByRole('dialog');
    await user.type(within(drawer).getByLabelText(/^Note/), 'Original CNIC seen on a video call');
    await user.click(within(drawer).getByRole('button', { name: 'Save decision' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/workers/p1/identity')?.body).toEqual({ status: 'Verified', note: 'Original CNIC seen on a video call' }));
    expect(await screen.findByText('Identity marked Verified')).toBeInTheDocument();
    expect(calls.filter((c) => c.key === 'GET /admin/workers').length).toBe(2);
  });

  test('CNIC reveal needs a confirmation that says it is audited; Cancel sends nothing', async () => {
    const calls = mockApi(adminRoutes({ 'GET /admin/workers/p1/cnic': { status: 200, data: { cnic: '37405-1234567-1' } } }));
    renderAt('/admin/identity');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Review Rashid Mehmood' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reveal' }));
    const confirm = screen.getByRole('dialog', { name: 'Show the full CNIC?' });
    expect(within(confirm).getByText('This will be recorded in the audit log.')).toBeInTheDocument();
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    expect(calls.some((c) => c.key.endsWith('/cnic'))).toBe(false);
    await user.click(within(screen.getByRole('dialog', { name: /Rashid Mehmood/ })).getByRole('button', { name: 'Reveal' }));
    await user.click(within(screen.getByRole('dialog', { name: 'Show the full CNIC?' })).getByRole('button', { name: 'Show CNIC' }));
    expect(await screen.findByText('37405-1234567-1')).toBeInTheDocument();
    expect(calls.filter((c) => c.key === 'GET /admin/workers/p1/cnic')).toHaveLength(1);
  });

  test('Verified cannot be chosen for a worker without a CNIC', async () => {
    mockApi(adminRoutes({ 'GET /admin/workers': { status: 200, data: { workers: [{ ...ADMIN_WORKER, cnicOnFile: false }], page: 1, limit: 25, total: 1 } } }));
    renderAt('/admin/identity');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Review Rashid Mehmood' }));
    expect(screen.getByRole('radio', { name: /^Verified/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /^Rejected/ })).toBeChecked();
  });

  test('audit log viewer lists entries and filters by action and date (read-only)', async () => {
    const calls = mockApi({
      'GET /auth/me': me('admin'),
      'GET /admin/audit': { status: 200, data: { entries: [{ seq: 4, createdAt: '2026-11-09T10:00:00Z', actor: { name: 'Demo Admin' }, actorRole: 'admin', action: 'identity.decision', targetType: 'WorkerProfile', targetId: 'p1', fromState: 'Pending', toState: 'Verified', reason: 'Seen on video call' }], total: 1, page: 1, limit: 50, actions: ['cnic.reveal', 'identity.decision'] } },
    });
    renderAt('/admin/audit');
    expect(await screen.findByText('Seen on video call')).toBeInTheDocument();
    expect(screen.getByText('Pending → Verified')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete|edit/i })).toBeNull();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Action'), 'cnic.reveal');
    await user.type(screen.getByLabelText('From'), '2026-11-01');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /admin/audit' && c.params.action === 'cnic.reveal' && c.params.from === '2026-11-01')).toBe(true));
  });
});

describe('error boundary', () => {
  test('a crash shows a calm message, no technical details', async () => {
    const { default: ErrorBoundary } = await import('../components/layout/ErrorBoundary');
    const { render } = await import('@testing-library/react');
    const Boom = () => {
      throw new Error('secret stack detail');
    };
    // React itself logs caught errors; that is expected here.
    const silence = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('secret stack detail');
    silence.mockClear();
  });
});
