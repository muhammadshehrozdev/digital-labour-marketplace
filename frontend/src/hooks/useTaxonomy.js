// Categories and skills come from the backend (GET /api/meta/taxonomy), the one source of
// truth (audit M1-16). Fetched once and shared by every page.
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
    let active = true;
    loadTaxonomy()
      .then((t) => active && setTaxonomy(t))
      .catch(() => active && setError('Could not load the list of trades. Please reload the page.'));
    return () => {
      active = false;
    };
  }, []);
  const categories = taxonomy?.categories || [];
  const skills = taxonomy?.skills || [];
  return {
    loaded: Boolean(taxonomy),
    categories,
    skills,
    error,
    categoryLabel: (id) => categories.find((c) => c.id === id)?.label || '',
    categoryOccupation: (id) => categories.find((c) => c.id === id)?.occupation || '',
  };
}
