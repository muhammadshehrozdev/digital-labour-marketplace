// Test helper: answer API requests from a table instead of the network.
// The real axios instance (with its 401 interceptor) is used; only the adapter is replaced.
import { AxiosError } from 'axios';
import API from '../api';
import { resetTaxonomyCache } from '../hooks/useTaxonomy';

export const TAXONOMY = {
  version: 'test',
  categories: [
    { id: 'electrical_solar', label: 'Electrical & Solar', occupation: 'Electrician', iscoCode: null },
    { id: 'plumbing_sanitary', label: 'Plumbing & Sanitary', occupation: 'Plumber', iscoCode: null },
    { id: 'domestic_work', label: 'Domestic Work', occupation: 'Domestic worker', iscoCode: null },
  ],
  skills: [
    { id: 'elec_wiring', name: 'House wiring', category: 'electrical_solar' },
    { id: 'elec_solar', name: 'Solar panel installation', category: 'electrical_solar' },
    { id: 'plumb_geyser', name: 'Geyser installation', category: 'plumbing_sanitary' },
    { id: 'dom_cleaning', name: 'House cleaning', category: 'domestic_work' },
  ],
  availability: ['Available', 'Busy', 'Offline'],
};

// routes: { 'GET /auth/me': { status, data } | (config, body) => ({ status, data }) }
export function mockApi(routes) {
  const calls = [];
  resetTaxonomyCache();
  API.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    const body = config.data ? JSON.parse(config.data) : undefined;
    calls.push({ key, body, params: config.params });
    let route = routes[key] ?? (key === 'GET /meta/taxonomy' ? { status: 200, data: TAXONOMY } : { status: 404, data: { message: 'Not found' } });
    if (typeof route === 'function') route = route(config, body);
    const response = { data: route.data, status: route.status, statusText: String(route.status), headers: {}, config };
    if (route.status >= 400) {
      throw new AxiosError(`Request failed with status code ${route.status}`, 'ERR_BAD_REQUEST', config, null, response);
    }
    return response;
  };
  return calls;
}

export const me = (role, extra = {}) => ({
  status: 200,
  data: { _id: 'u1', name: `Test ${role[0].toUpperCase()}${role.slice(1)}`, email: `${role}@example.com`, phone: '03001234567', role, ...extra },
});

export const onboarding = (steps, completedAt = null) => {
  const order = ['about', 'work', 'skills'];
  const nextStep = order.find((s) => !steps[s]) ?? null;
  return { status: 200, data: { steps, nextStep, complete: nextStep === null, completedAt } };
};

// A complete worker profile as GET /api/workers/me returns it (synthetic test data).
export const PROFILE = {
  _id: 'p1',
  workerIdCode: 'DLM-2026-000042',
  user: { name: 'Rashid Mehmood', email: 'rashid@example.com', phone: '03001234567' },
  occupation: 'Electrician',
  category: 'electrical_solar',
  experienceYears: 6,
  hourlyRate: 800,
  dailyRate: 4000,
  city: 'Rawalpindi',
  address: 'Satellite Town',
  whatsappNumber: '03007654321',
  emergencyContact: 'Brother 03111111111',
  cnicOnFile: true,
  languages: ['Urdu'],
  availability: 'Available',
  verificationStatus: 'Pending',
  identityNote: '',
  bio: 'Wiring and solar.',
  workHistory: [],
  skills: [{ skillId: 'elec_wiring', name: 'House wiring', category: 'electrical_solar', addedVia: 'manual', custom: false }],
  profileCompletion: 80,
};
