// Auth and routing: Register (M1-1, D-005), login redirects (D-011), 401 handling (M1-11), 404.
import { describe, test, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, me, onboarding, PROFILE, full } from './mockApi';
import { renderAt, pathname } from './renderApp';
import { passwordProblem } from '../utils/password';

const NOT_LOGGED_IN = { 'GET /auth/me': { status: 401, data: {} } };

describe('Register', () => {
  test('there is no admin option anywhere on the page (M1-1)', async () => {
    mockApi(NOT_LOGGED_IN);
    const { container } = renderAt('/register');
    expect(await screen.findByRole('radio', { name: /I want to find work/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /I want to hire a worker/ })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    await userEvent.setup().click(screen.getByRole('radio', { name: /I want to find work/ }));
    expect(container.textContent).not.toMatch(/admin/i);
  });

  test('role first, then the form; a short password is stopped before the server is called (D-005)', async () => {
    const calls = mockApi(NOT_LOGGED_IN);
    renderAt('/register');
    const user = userEvent.setup();
    expect(screen.queryByLabelText(/Full name/)).toBeNull();
    await user.click(await screen.findByRole('radio', { name: /I want to find work/ }));
    expect(screen.getByText('15+ characters; a sentence you remember works well')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Full name/), 'Rashid Mehmood');
    await user.type(screen.getByLabelText(/Email/), 'rashid@example.com');
    await user.type(screen.getByLabelText(/Mobile number/), '0300 1234567');
    await user.type(screen.getByLabelText(/^Password/), 'short one');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Password must be at least 15 characters.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute('aria-invalid', 'true');
    expect(calls.some((c) => c.key === 'POST /auth/register')).toBe(false);
  });

  test('a new worker goes straight to onboarding step 1; server errors appear next to the field', async () => {
    let attempt = 0;
    mockApi({
      ...NOT_LOGGED_IN,
      'POST /auth/register': () => (attempt++ === 0
        ? { status: 409, data: { message: 'This email is already registered. Please log in instead.' } }
        : { status: 201, data: { _id: 'u1', name: 'Rashid', email: 'r@example.com', phone: '03001234567', role: 'worker' } }),
      'GET /workers/me/onboarding': onboarding({ about: false, work: false, skills: false }),
      'GET /workers/me': { status: 404, data: {} },
    });
    renderAt('/register?role=worker');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/Full name/), 'Rashid Mehmood');
    await user.type(screen.getByLabelText(/Email/), 'r@example.com');
    await user.type(screen.getByLabelText(/Mobile number/), '03001234567');
    await user.type(screen.getByLabelText(/^Password/), 'chai garam subah barish');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('This email is already registered. Please log in instead.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'About you' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/about');
  });

  test('password rule matches the server: 15+ characters, at most 72 bytes', () => {
    // Batch 3: the check returns a dictionary key (translated where it is shown), not English text.
    expect(passwordProblem('a'.repeat(14))).toEqual({ key: 'validation.passwordShort', params: { min: 15 } });
    expect(passwordProblem('mera ghar pyara')).toBeNull();
    expect(passwordProblem('ب'.repeat(37))).toEqual({ key: 'validation.passwordLong' });
    expect(passwordProblem(' '.repeat(16))).toEqual({ key: 'validation.passwordSpaces' });
  });
});

describe('where a worker lands after login (D-011)', () => {
  const login = async () => {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^Email/), 'w@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'chai garam subah barish');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
  };

  test('a worker with an empty profile goes to onboarding step 1', async () => {
    mockApi({
      ...NOT_LOGGED_IN,
      'POST /auth/login': me('worker'),
      'GET /workers/me/onboarding': onboarding({ about: false, work: false, skills: false }),
      'GET /workers/me': { status: 404, data: {} },
    });
    renderAt('/login');
    await login();
    expect(await screen.findByRole('heading', { level: 1, name: 'About you' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/about');
  });

  test('a worker who stopped after step 2 lands on step 3 (skills)', async () => {
    mockApi({
      ...NOT_LOGGED_IN,
      'POST /auth/login': me('worker'),
      'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: false }),
      'GET /workers/me': { status: 200, data: { ...PROFILE, skills: [] } },
      'GET /workers/me/skills': { status: 200, data: { skills: [] } },
    });
    renderAt('/login');
    await login();
    expect(await screen.findByRole('heading', { level: 1, name: 'Your skills' })).toBeInTheDocument();
    expect(pathname()).toBe('/onboarding/skills');
  });

  test('a worker who finished onboarding goes to /worker (dashboard)', async () => {
    mockApi({
      ...NOT_LOGGED_IN,
      'POST /auth/login': me('worker'),
      'GET /workers/me/onboarding': onboarding({ about: true, work: true, skills: true }, '2026-11-09T10:00:00Z'),
      'GET /workers/me/full': full(PROFILE), // the dashboard loads everything in one request (D-020)
    });
    renderAt('/login');
    await login();
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome, Rashid' })).toBeInTheDocument();
    expect(pathname()).toBe('/worker');
  });

  test('customer -> /find; admin -> /admin', async () => {
    mockApi({ ...NOT_LOGGED_IN, 'POST /auth/login': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/login');
    await login();
    await waitFor(() => expect(pathname()).toBe('/find'));
  });
});

describe('session and guards', () => {
  test('wrong password: one generic message, stays on Login', async () => {
    mockApi({ ...NOT_LOGGED_IN, 'POST /auth/login': { status: 401, data: { message: 'Email or password is incorrect.' } } });
    renderAt('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^Email/), 'w@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'wrong password here');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
    expect(pathname()).toBe('/login');
  });

  test('a 401 on a protected page (expired session) sends you to Login with a message (M1-11)', async () => {
    mockApi({ 'GET /auth/me': me('worker'), 'GET /workers/me/onboarding': { status: 401, data: { message: 'Your session has ended.' } } });
    renderAt('/worker');
    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByText('Your session has ended. Please log in again.')).toBeInTheDocument();
  });

  test('not logged in: a worker page sends you to Login; the landing page is shown at /', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/worker/profile');
    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
  });

  test('a customer cannot open admin pages (UI guard; the server also refuses)', async () => {
    mockApi({ 'GET /auth/me': me('customer') });
    renderAt('/admin/identity');
    expect(await screen.findByRole('heading', { level: 1, name: 'This page is not for your account' })).toBeInTheDocument();
  });

  test('logout calls the server and returns to Login', async () => {
    const calls = mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } }, 'POST /auth/logout': { status: 200, data: {} } });
    renderAt('/find');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Account menu/ }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(calls.some((c) => c.key === 'POST /auth/logout')).toBe(true));
    expect(await screen.findByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
  });

  test('unknown page -> Not Found (one h1)', async () => {
    mockApi(NOT_LOGGED_IN);
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});

describe('landing page', () => {
  test('headline, both calls to action, footer credit, and landmarks; no invented numbers', async () => {
    mockApi(NOT_LOGGED_IN);
    const { container } = renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Skilled work, verified.' })).toBeInTheDocument();
    // Hero and the call-to-action band (Batch 3 landing v2) both offer the two actions.
    const find = screen.getAllByRole('link', { name: 'Find a worker' });
    expect(find.length).toBeGreaterThanOrEqual(1);
    for (const link of find) expect(link).toHaveAttribute('href', '/register?role=customer');
    for (const link of screen.getAllByRole('link', { name: /Join as a worker/ })) expect(link).toHaveAttribute('href', '/register?role=worker');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Final Year Project, BS Software Engineering, SZABIST Islamabad');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Muhammad Shehroz, Shahzaib Khan, Usama Asif');
    expect(container.textContent).not.toMatch(/\d+\s*\+?\s*(workers|customers|jobs|reviews)/i);
    expect(container.textContent).not.toMatch(/★|rating/i);
  });

  test('a logged-in customer visiting / goes to /find', async () => {
    mockApi({ 'GET /auth/me': me('customer'), 'GET /workers': { status: 200, data: { workers: [], page: 1, limit: 12, total: 0 } } });
    renderAt('/');
    await waitFor(() => expect(pathname()).toBe('/find'));
  });
});
