// The logged-in worker's own profile (GET /api/workers/me). 404 = not created yet -> null.
// profile is undefined while loading. setProfile() keeps a fresher copy after a save.
// exists: false (from the onboarding state) skips the request: profile is null at once,
// so a new worker's browser does not log a 404.
import { useState } from 'react';
import { useApiQuery } from './useApiQuery';

export function useMyProfile({ exists } = {}) {
  const skip = exists === false;
  const query = useApiQuery(skip ? null : '/workers/me');
  const [saved, setSaved] = useState(null);
  let profile;
  if (skip) profile = null;
  else if (!query.loading) profile = query.status === 404 ? null : query.data;
  if (saved) profile = saved;
  const error = !query.loading && query.status !== 404 && query.error ? query.error : null;
  return { profile, setProfile: setSaved, error, reload: query.reload };
}
