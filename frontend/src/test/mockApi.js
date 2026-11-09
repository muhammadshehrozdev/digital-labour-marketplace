// Test helper: answer API requests from a table instead of the network.
// The real axios instance (with its 401 interceptor) is used; only the adapter is replaced.
import { AxiosError } from 'axios';
import API from '../api';
import { resetTaxonomyCache } from '../hooks/useTaxonomy';

export const TAXONOMY = {
  version: 'test',
  status: 'provisional',
  categories: [
    { id: 'electrical_solar', label: 'Electrical & Solar', iscoCode: null },
    { id: 'plumbing_sanitary', label: 'Plumbing & Sanitary', iscoCode: null },
    { id: 'domestic_work', label: 'Domestic Work', iscoCode: null },
  ],
  availability: ['Available', 'Busy', 'Offline'],
};

// routes: { 'GET /auth/me': { status: 200, data: {...} } | (config) => ({ status, data }) }
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
