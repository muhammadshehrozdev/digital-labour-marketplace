// GET /api/meta/job-options (Module 6): the kinds of work, the close reasons, the limits and the live analyzer's
// method and name. Asked once and shared (like the taxonomy). The screens read the method's NAME from here, so a
// later batch can switch the method without changing a screen.
import { useEffect, useState } from 'react';
import API from '../../api';

let cache = null;
let pending = null;

export const DEFAULT_LIMITS = Object.freeze({ descriptionMin: 3, descriptionMax: 500, areaMin: 2, areaMax: 80, maxSkills: 5, openDays: 30, amountMin: 100, amountMax: 5000000 });

export function resetJobOptionsCache() {
  cache = null;
  pending = null;
}

export function useJobOptions() {
  const [options, setOptions] = useState(cache);
  useEffect(() => {
    if (cache) return undefined;
    let active = true;
    pending ??= API.get('/meta/job-options').then(({ data }) => { cache = data; return data; }).finally(() => { pending = null; });
    pending.then((data) => active && setOptions(data)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return { options, limits: { ...DEFAULT_LIMITS, ...(options?.limits ?? {}) }, analyzer: options?.analyzer ?? null };
}
