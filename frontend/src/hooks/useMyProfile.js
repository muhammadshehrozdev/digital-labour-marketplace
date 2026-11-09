// The logged-in worker's own profile (GET /api/workers/me). 404 = not created yet -> null.
// profile is undefined while loading. setProfile() keeps a fresher copy after a save.
import { useState } from 'react';
import { useApiQuery } from './useApiQuery';

export function useMyProfile() {
  const query = useApiQuery('/workers/me');
  const [saved, setSaved] = useState(null);
  let profile;
  if (!query.loading) profile = query.status === 404 ? null : query.data;
  if (saved) profile = saved;
  const error = !query.loading && query.status !== 404 && query.error ? query.error : '';
  return { profile, setProfile: setSaved, error, reload: query.reload };
}
