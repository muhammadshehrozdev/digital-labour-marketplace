// Phase 3 frontend pages: worker profile (M1-15, M1-16, CNIC), customer directory (M1-2, M1-9, D-002),
// admin identity decision (M1-9).
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppRoutes } from '../App';
import { buildProfilePayload } from '../utils/profilePayload';
import { mockApi } from './mockApi';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>
  );

const me = (role) => ({ status: 200, data: { _id: 'u1', name: `A ${role}`, email: 'a@example.com', phone: '03001234567', role } });

afterEach(() => vi.restoreAllMocks());

describe('Worker profile page', () => {
  test('has emergency contact, languages and work-history duration/description inputs (M1-15)', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me': { status: 404, data: {} } });
    renderAt('/worker-profile');
    expect(await screen.findByLabelText('Emergency Contact')).toBeInTheDocument();
    expect(screen.getByLabelText('Languages (comma separated)')).toBeInTheDocument();
    expect(screen.getByLabelText('Job duration')).toBeInTheDocument();
    expect(screen.getByLabelText('Job description')).toBeInTheDocument();
  });

  test('categories come from GET /api/meta/taxonomy, including Domestic Work (M1-16)', async () => {
    const calls = mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me': { status: 404, data: {} } });
    renderAt('/worker-profile');
    const select = await screen.findByLabelText('Category');
    await waitFor(() => expect(within(select).getByRole('option', { name: 'Domestic Work' })).toBeInTheDocument());
    expect(within(select).getAllByRole('option')).toHaveLength(3);
    expect(calls.some((c) => c.key === 'GET /meta/taxonomy')).toBe(true);
  });

  test('saving sends emergency contact, languages and work history with duration/description (M1-15)', async () => {
    const calls = mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me': { status: 404, data: {} },
      'PUT /workers/me': (config, body) => ({ status: 200, data: { profile: { ...body, user: { name: body.name, phone: body.phone } } } }),
    });
    renderAt('/worker-profile');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Emergency Contact'), 'Brother Ahmed 03111111111');
    await user.clear(screen.getByLabelText('Languages (comma separated)'));
    await user.type(screen.getByLabelText('Languages (comma separated)'), 'Urdu, Pashto');
    await user.type(screen.getByPlaceholderText('e.g. Electrician, Plumber'), 'Electrician');
    await user.type(screen.getByLabelText('Job title'), 'House wiring');
    await user.type(screen.getByLabelText('Job duration'), '2 weeks');
    await user.type(screen.getByLabelText('Job description'), 'Full house');
    await user.click(screen.getByRole('button', { name: '+ Add Record' }));
    await user.click(screen.getByRole('button', { name: 'Save Profile' }));

    await screen.findByText('Profile saved successfully!');
    const put = calls.find((c) => c.key === 'PUT /workers/me');
    expect(put.body.emergencyContact).toBe('Brother Ahmed 03111111111');
    expect(put.body.languages).toEqual(['Urdu', 'Pashto']);
    expect(put.body.workHistory).toEqual([
      { jobTitle: 'House wiring', clientOrEmployer: '', duration: '2 weeks', description: 'Full house' },
    ]);
    expect(put.body.cnicNumber).toBeUndefined(); // not typed -> not sent
  });

  test('buildProfilePayload sends only editable fields, numbers as numbers', () => {
    const payload = buildProfilePayload({
      name: 'Ali', phone: '03001234567', occupation: 'Mason', category: 'domestic_work', skillsInput: 'a, b',
      experienceYears: '5', hourlyRate: '', dailyRate: '2000', city: 'Lahore', address: '', whatsappNumber: '',
      emergencyContact: '', languagesInput: 'Urdu', availability: 'Busy', bio: '', workHistory: [],
      // server-owned fields that must never be sent back:
      _id: 'x', workerIdCode: 'DLM-2026-000001', verificationStatus: 'Verified', cnicOnFile: true, user: {}, cnicNumber: ' ',
    });
    expect(payload).not.toHaveProperty('verificationStatus');
    expect(payload).not.toHaveProperty('workerIdCode');
    expect(payload).not.toHaveProperty('_id');
    expect(payload).not.toHaveProperty('cnicNumber');
    expect(payload).toMatchObject({ experienceYears: 5, hourlyRate: 0, dailyRate: 2000, skills: ['a', 'b'] });
  });

  test('a saved CNIC is never shown, only "Saved (hidden)"', async () => {
    mockApi({
      'GET /auth/me': me('worker'),
      'GET /workers/me': { status: 200, data: { occupation: 'Mason', category: 'electrical_solar', cnicOnFile: true, verificationStatus: 'Pending', skills: [], languages: ['Urdu'], workHistory: [], user: {} } },
    });
    renderAt('/worker-profile');
    const input = await screen.findByLabelText('CNIC Number');
    await waitFor(() => expect(input).toHaveAttribute('placeholder', 'Saved (hidden). Type only to change it'));
    expect(input).toHaveValue('');
  });
});

describe('Customer directory page', () => {
  const worker = {
    _id: 'p1', workerIdCode: 'DLM-2026-000001', occupation: 'Electrician', category: 'electrical_solar', city: 'Islamabad',
    experienceYears: 6, hourlyRate: 800, dailyRate: 5000, skills: ['House Wiring'], availability: 'Available',
    verificationStatus: 'Pending', user: { name: 'Ali Worker' },
    // Even if a buggy server sent these, the page must not show them:
    cnicNumber: '37405-1234567-1', address: 'House 1 G-10', emergencyContact: '03111111111', whatsappNumber: '03222222222',
    phone: '03001112222', email: 'ali@example.com',
  };

  test('honest title, identity badge, and never renders CNIC, email, address or phone (M1-2, M1-9, D-002)', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [worker], page: 1, limit: 12, total: 1 } } });
    const { container } = renderAt('/customer-dashboard');
    expect(await screen.findByRole('heading', { name: 'Find workers' })).toBeInTheDocument();
    const card = await screen.findByTestId('worker-card');
    expect(within(card).getByText('Identity not verified')).toBeInTheDocument();
    expect(within(card).getByText('Electrical & Solar • Islamabad')).toBeInTheDocument();
    const text = container.textContent;
    for (const secret of ['37405', 'G-10', '03111111111', '03222222222', '03001112222', 'ali@example.com']) {
      expect(text).not.toContain(secret);
    }
  });

  test('"Identity verified only" asks the server for identity=verified', async () => {
    const calls = mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/customer-dashboard');
    await userEvent.setup().click(await screen.findByLabelText('Identity verified only'));
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /workers' && c.params.identity === 'verified')).toBe(true));
  });
});

describe('Admin page: identity decision (M1-9)', () => {
  const adminRoutes = (extra = {}) => ({
    'GET /auth/me': me('admin'),
    'GET /admin/workers': {
      status: 200,
      data: { workers: [{ _id: 'p1', workerIdCode: 'DLM-2026-000001', occupation: 'Mason', category: 'domestic_work', verificationStatus: 'Pending', cnicOnFile: true, user: { name: 'Ali' } }], page: 1, limit: 100, total: 1 },
    },
    'GET /admin/users': { status: 200, data: [] },
    ...extra,
  });

  test('a decision needs a note; without one nothing is sent', async () => {
    const calls = mockApi(adminRoutes());
    renderAt('/admin-dashboard');
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/write a note/);
    expect(calls.some((c) => c.key.startsWith('PATCH'))).toBe(false);
  });

  test('with a note, the decision is sent to PATCH /admin/workers/:id/identity', async () => {
    const calls = mockApi(adminRoutes({ 'PATCH /admin/workers/p1/identity': { status: 200, data: {} } }));
    renderAt('/admin-dashboard');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Decision note'), 'Checked CNIC on video call');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'PATCH /admin/workers/p1/identity')?.body).toEqual({ status: 'Verified', note: 'Checked CNIC on video call' }));
  });

  test('CNIC is masked until Reveal is confirmed', async () => {
    const calls = mockApi(adminRoutes({ 'GET /admin/workers/p1/cnic': { status: 200, data: { cnic: '37405-1234567-1' } } }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderAt('/admin-dashboard');
    expect(await screen.findByText('•••••-•••••••-•')).toBeInTheDocument();
    expect(screen.queryByText('37405-1234567-1')).toBeNull();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reveal' }));
    expect(await screen.findByText('37405-1234567-1')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'GET /admin/workers/p1/cnic')).toBe(true);
  });
});
