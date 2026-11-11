// Categories and skills come from the backend (GET /api/meta/taxonomy), the one source of
// truth (audit M1-16). Fetched once and shared by every page.
import { useEffect, useState } from 'react';
import API from '../api';
import { useLanguage } from '../i18n/context';
import { onRetry } from '../features/app/connectivity';

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

// Names in the current language: the taxonomy carries i18n.{ur,ur-Latn} (backend
// config/skillTaxonomy.js); English is label / occupation / name. Custom skills keep the
// name the worker typed.
export function useTaxonomy() {
  const { lang } = useLanguage();
  const [taxonomy, setTaxonomy] = useState(cache);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (cache) return;
    let active = true;
    loadTaxonomy()
      .then((t) => active && setTaxonomy(t))
      .catch(() => active && setError('work.taxonomyError'));
    return () => {
      active = false;
    };
  }, []);
  // Failed (for example offline): try again when the connection is back (Batch 4, feature 5).
  useEffect(() => {
    if (!error) return undefined;
    return onRetry(() => {
      loadTaxonomy().then((t) => { setError(null); setTaxonomy(t); }).catch(() => {});
    });
  }, [error]);
  const localCategory = (c) => (lang === 'en' ? c : { ...c, label: c.i18n?.[lang]?.label || c.label, occupation: c.i18n?.[lang]?.occupation || c.occupation });
  const localSkill = (s) => (lang === 'en' ? s : { ...s, name: s.i18n?.[lang] || s.name });
  const categories = (taxonomy?.categories || []).map(localCategory);
  const skills = (taxonomy?.skills || []).map(localSkill);
  const skillsById = new Map(skills.map((s) => [s.id, s]));
  return {
    loaded: Boolean(taxonomy),
    categories,
    skills,
    error,
    categoryLabel: (id) => categories.find((c) => c.id === id)?.label || '',
    categoryOccupation: (id) => categories.find((c) => c.id === id)?.occupation || '',
    // A saved skill ({ skillId, name, custom }) or a suggestion: the taxonomy name in this language.
    skillName: (skill) => (skill && !skill.custom && skillsById.get(skill.skillId ?? skill.id)?.name) || skill?.name || '',
  };
}
