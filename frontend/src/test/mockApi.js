// Test helper: answer API requests from a table instead of the network.
// The real axios instance (with its 401 interceptor) is used; only the adapter is replaced.
import { AxiosError } from 'axios';
import API from '../api';
import { resetTaxonomyCache } from '../hooks/useTaxonomy';
import { resetJobOptionsCache } from '../features/jobs/useJobOptions';

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

// Answers for requests a test did not list. GET /auth/session (Batch 3) is derived from the
// test's 'GET /auth/me' entry, so older tests stay short: 200 -> { user }, otherwise { user: null }.
function defaultRoute(key, routes) {
  if (key === 'GET /meta/taxonomy') return { status: 200, data: TAXONOMY };
  if (key === 'GET /auth/session') {
    const me = routes['GET /auth/me'];
    return me?.status === 200 ? { status: 200, data: { user: me.data } } : { status: 200, data: { user: null } };
  }
  if (key === 'PATCH /users/me/preferences') return (config, body) => ({ status: 200, data: body });
  if (key === 'GET /meta/job-options') return { status: 200, data: JOB_OPTIONS };
  return { status: 404, data: { code: 'ROUTE_NOT_FOUND', message: 'Not found' } };
}

// GET /api/meta/job-options (Module 6) as the server sends it (backend/routes/meta.js).
export const JOB_OPTIONS = {
  taskTypes: ['install', 'repair', 'service', 'new_work', 'cleaning', 'moving', 'household_help'],
  closeReasons: ['work_done', 'not_needed', 'found_elsewhere', 'other'],
  inputModes: ['text', 'voice'],
  budgetUnits: ['job', 'day', 'hour'],
  limits: { descriptionMin: 3, descriptionMax: 500, areaMin: 2, areaMax: 80, maxSkills: 5, maxOpenPerCustomer: 10, maxNewPerDay: 10, openDays: 30, amountMin: 100, amountMax: 5000000 },
  analyzer: { method: 'rules', methodName: 'rule-based word lists', versions: { analyzer: 'job-rules-1', taxonomy: '2026-11-09-v1', phrases: '2026-11-24-v3', model: null } },
};

// routes: { 'GET /auth/me': { status, data } | (config, body) => ({ status, data }) }
export function mockApi(routes) {
  const calls = [];
  resetTaxonomyCache();
  resetJobOptionsCache();
  API.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    let body;
    if (config.data instanceof FormData) body = Object.fromEntries(config.data.entries()); // uploads
    else body = config.data ? JSON.parse(config.data) : undefined;
    calls.push({ key, body, params: config.params });
    let route = routes[key] ?? defaultRoute(key, routes);
    if (typeof route === 'function') route = await route(config, body); // a route may answer later (or fail, e.g. a cancelled upload)
    const response = { data: route.data, status: route.status, statusText: String(route.status), headers: route.headers ?? {}, config };
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

// GET /api/workers/me/full (Batch 3, D-020) for a profile: the owner's data, the proof items,
// and the public view built from the same public fields as the server (no private data).
export const PUBLIC_KEYS = ['workerIdCode', 'occupation', 'category', 'experienceYears', 'hourlyRate', 'dailyRate', 'city', 'availability', 'verificationStatus', 'bio', 'languages', 'profileCompletion'];
export function publicViewOf(profile) {
  const view = Object.fromEntries(PUBLIC_KEYS.filter((k) => k in profile).map((k) => [k, profile[k]]));
  view.user = { name: profile.user?.name };
  view.skills = (profile.skills ?? []).map(({ skillId, name, category, custom, evidenceSummary }) => ({ skillId, name, category, custom, evidenceSummary }));
  view.workHistory = (profile.workHistory ?? []).map(({ jobTitle, duration, description }) => ({ jobTitle, duration, description }));
  return view;
}
// The "strength" block of GET /api/workers/me/full (services/profileStrength.js), in the same shape;
// for tests the numbers come straight from the profile.
export function strengthOf(profile) {
  const skills = profile.skills ?? [];
  const approved = skills.filter((s) => (s.evidenceSummary?.approved ?? 0) > 0).length;
  const pending = skills.filter((s) => !(s.evidenceSummary?.approved > 0) && (s.evidenceSummary?.pending ?? 0) > 0).length;
  const none = skills.length - approved - pending;
  const tips = [];
  if (!profile.cnicOnFile) tips.push({ code: 'add_cnic' });
  for (const s of skills.filter((x) => !(x.evidenceSummary?.approved > 0) && !(x.evidenceSummary?.pending > 0)).slice(0, 2)) tips.push({ code: 'add_proof', params: { skillId: s.skillId, skillName: s.name } });
  if (!(profile.workHistory ?? []).length) tips.push({ code: 'add_work_history' });
  const percent = profile.profileCompletion ?? 20;
  const level = percent === 100 && approved > 0 ? 'complete' : percent >= 80 ? 'strong' : percent >= 50 ? 'good' : 'starting';
  const checks = ['account', 'trade', 'experienceRate', 'cityAddress', 'contact', 'skills', 'bio', 'workHistory'].map((id, i) => ({ id, weight: [20, 15, 15, 10, 10, 15, 5, 10][i], done: i < 6 }));
  return { percent, level, checks, proof: { skills: skills.length, approved, pending, none }, tips: tips.slice(0, 5) };
}

export const full = (profile, evidence = [], extra = {}) => ({
  status: 200,
  data: {
    profile,
    evidence,
    strength: strengthOf(profile),
    publicView: publicViewOf(profile),
    listedInDirectory: Boolean(profile.occupation && profile.category),
    onboarding: { steps: { about: true, work: true, skills: true }, nextStep: null, complete: true, completedAt: '2026-11-09T10:00:00Z' },
    ...extra,
  },
});
