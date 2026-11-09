// Everything about the logged-in worker's own profile in one request (GET /api/workers/me/full):
// { profile, evidence, publicView, listedInDirectory, onboarding }. One source of truth from the
// server: every page that shows the profile loads it fresh when it opens, and setData() keeps a
// newer copy after a save on the same page.
import { useState } from 'react';
import { useApiQuery } from './useApiQuery';

export function useMyFullProfile() {
  const query = useApiQuery('/workers/me/full');
  const [fresh, setFresh] = useState(null);
  const data = fresh ?? query.data;
  return {
    data,
    loading: query.loading && !fresh,
    error: query.error,
    // Merge a partial change (e.g. { profile }) into the current data.
    update: (changes) => setFresh((prev) => ({ ...(prev ?? query.data), ...changes })),
    reload: () => {
      setFresh(null);
      query.reload();
    },
  };
}
