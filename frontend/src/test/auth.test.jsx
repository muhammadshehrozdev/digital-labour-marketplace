// Phase 3 frontend: Register (M1-1, D-005), 401 handling (M1-11), route guard, 404 page.
import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppRoutes } from '../App';
import { passwordProblem } from '../utils/password';
import { mockApi } from './mockApi';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>
  );

const WORKER = { _id: 'u1', name: 'Ali Worker', email: 'ali@example.com', phone: '03001234567', role: 'worker' };

describe('Register page', () => {
  test('offers only Worker and Customer, never Admin (M1-1)', async () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/register');
    expect(await screen.findByRole('button', { name: 'Worker' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Customer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /admin/i })).toBeNull();
    expect(screen.queryByText(/admin/i)).toBeNull();
  });

  test('shows the password rule and blocks a short password before calling the server (D-005)', async () => {
    const calls = mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/register');
    expect(await screen.findByText(/At least 15 characters\. Easy to remember/)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Muhammad Ali'), 'Ali Raza');
    await user.type(screen.getByPlaceholderText('name@example.com'), 'ali@example.com');
    await user.type(screen.getByPlaceholderText('0300 1234567'), '03001234567');
    await user.type(screen.getByLabelText('Password'), 'short pass');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Password must be at least 15 characters.')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /auth/register')).toBe(false);
  });

  test('password rule matches the server: 15+ characters, at most 72 bytes', () => {
    expect(passwordProblem('a'.repeat(14))).toMatch(/at least 15/);
    expect(passwordProblem('mera ghar pyara')).toBe('');
    expect(passwordProblem('a'.repeat(73))).toMatch(/too long/);
    expect(passwordProblem('ب'.repeat(37))).toMatch(/too long/); // 74 bytes
  });
});

describe('login state comes from the server, not localStorage (M1-11)', () => {
  test('not logged in: a protected page sends you to Login', async () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/worker-profile');
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  test('a 401 on a protected page (expired session) sends you to Login with a message', async () => {
    mockApi({
      'GET /auth/me': { status: 200, data: WORKER },
      'GET /workers/me': { status: 401, data: { message: 'Your session has ended. Please log in again.' } },
    });
    renderAt('/worker-profile');
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByText('Your session has ended. Please log in again.')).toBeInTheDocument();
  });

  test('a wrong password on Login shows the server message and does not redirect', async () => {
    mockApi({
      'GET /auth/me': { status: 401, data: {} },
      'POST /auth/login': { status: 401, data: { message: 'Email or password is incorrect.' } },
    });
    renderAt('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByPlaceholderText('name@example.com'), 'ali@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrong password here');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  });

  test('"/" sends a logged-in worker to their profile; logout calls the server', async () => {
    const calls = mockApi({
      'GET /auth/me': { status: 200, data: WORKER },
      'GET /workers/me': { status: 404, data: { message: 'none yet' } },
      'POST /auth/logout': { status: 200, data: {} },
    });
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Worker Digital Profile' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /auth/logout')).toBe(true));
    expect(await screen.findByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
  });

  test('a customer cannot open the admin page (UI guard; the server also refuses)', async () => {
    mockApi({ 'GET /auth/me': { status: 200, data: { ...WORKER, role: 'customer' } } });
    renderAt('/admin-dashboard');
    expect(await screen.findByText('Access Denied')).toBeInTheDocument();
  });

  test('unknown page -> Not Found page', async () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
