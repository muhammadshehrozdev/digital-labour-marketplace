// Small helpers for integration tests: send requests the way our frontend does
// (Origin header of our site) and keep the login cookie.
import request from 'supertest';

export const ORIGIN = 'http://127.0.0.1:5173';
export const GOOD_PASSWORD = 'chai garam subah barish'; // 23 characters, test-only

let counter = 0;
export const uniqueEmail = (prefix = 'user') => `${prefix}.${Date.now()}.${(counter += 1)}@example.com`;

// Returns "dlm_session=<token>" from a response, for the Cookie header.
export function sessionCookie(res) {
  const raw = (res.headers['set-cookie'] || []).find((c) => c.startsWith('dlm_session='));
  return raw ? raw.split(';')[0] : null;
}

export function api(app, cookie) {
  const withHeaders = (req) => {
    req.set('Origin', ORIGIN);
    if (cookie) req.set('Cookie', cookie);
    return req;
  };
  return {
    get: (url) => withHeaders(request(app).get(url)),
    post: (url) => withHeaders(request(app).post(url)),
    put: (url) => withHeaders(request(app).put(url)),
    patch: (url) => withHeaders(request(app).patch(url)),
    delete: (url) => withHeaders(request(app).delete(url)),
  };
}

export async function registerUser(app, overrides = {}) {
  const body = {
    name: 'Test Person',
    email: uniqueEmail(overrides.role || 'worker'),
    password: GOOD_PASSWORD,
    phone: '03001234567',
    role: 'worker',
    ...overrides,
  };
  const res = await api(app).post('/api/auth/register').send(body);
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { cookie: sessionCookie(res), user: res.body, password: body.password };
}
