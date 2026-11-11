import axios from 'axios';
import { reportNetworkFailure, reportRequestSuccess } from './features/app/connectivity';

// The API address. Locally this is "/api" on the same origin as the page: Vite forwards
// it to the backend (vite.config.js), so the login cookie is first-party.
// The same-origin Vercel rewrite is set up in Phase 8 (do not deploy this branch before that).
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the HttpOnly login cookie (JavaScript cannot read it)
  timeout: 20000,
});

// Called when the server says "not logged in" (401). AuthContext sets it.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// A 401 from these is a normal answer (not logged in yet / wrong password), not an expired session.
const NO_REDIRECT = ['/auth/session', '/auth/me', '/auth/login', '/auth/register', '/auth/logout'];

API.interceptors.response.use(
  (response) => {
    reportRequestSuccess();
    return response;
  },
  (error) => {
    // No answer at all (offline, server down, timeout) - not a cancelled request, not an HTTP error.
    if (!error.response && error.code !== 'ERR_CANCELED') reportNetworkFailure();
    else if (error.response) reportRequestSuccess(); // the server answered, so it is reachable
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !NO_REDIRECT.some((path) => url.endsWith(path)) && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default API;
