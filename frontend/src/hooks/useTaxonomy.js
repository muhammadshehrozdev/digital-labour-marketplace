// Trade categories come from the backend (GET /api/meta/taxonomy), the one source of truth
// (audit M1-16). Fetched once and shared by every page.
import { useEffect, useState } from 'react';
import API from '../api';

let cache = null;
let pending = null;

export function loadTaxonomy() {
  if (cache) return Promise.resolve(cache);
  pending ??= API.get('/meta/taxonomy')
    .then(({ data }) => {
      cache = data;
      return data;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
}

export function resetTaxonomyCache() {
  cache = null;
}

export function useTaxonomy() {
  const [taxonomy, setTaxonomy] = useState(cache);
  const [error, setError] = useState('');
  useEffect(() => {
    if (cache) return;
    loadTaxonomy()
      .then(setTaxonomy)
      .catch(() => setError('Could not load the trade categories. Please reload the page.'));
  }, []);
  const categories = taxonomy?.categories || [];
  const labelFor = (id) => categories.find((c) => c.id === id)?.label || id || '';
  return { categories, labelFor, error };
}
