// Phase 1: proves Vitest + React Testing Library + jsdom work together.
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';
import { mockApi } from './mockApi';

describe('test setup', () => {
  test('renders the Login page in a simulated browser', () => {
    mockApi({ 'GET /auth/me': { status: 401, data: {} } });
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
});
