// GET data for a page. "loading" is derived from the request key (no state reset inside the
// effect), so every change of url/params loads again, and reload() asks again.
// error is a translatable descriptor (show it with te() from useT()), or null.
// url null = do not ask (yet): nothing is loading and data is null.
// options.keepPrevious: while the next answer loads, `data` keeps the last one and `stale` is
// true (instant search and charts: the screen does not flash empty between two answers).
import { useEffect, useState } from 'react';
import API from '../api';
import { apiError } from '../utils/apiErrors';
import { onRetry } from '../features/app/connectivity';

// options.refreshKey: any value; when it changes, the data is asked for again (it is not sent).
export function useApiQuery(url, params, { keepPrevious = false, refreshKey = '' } = {}) {
  const [nonce, setNonce] = useState(0);
  const key = `${JSON.stringify([url, params ?? null])}#${nonce}#${refreshKey}`;
  const [result, setResult] = useState({ key: null, data: null, error: null, status: null });

  useEffect(() => {
    let active = true;
    const [u, p] = JSON.parse(key.slice(0, key.indexOf('#')));
    if (u === null) return undefined;
    API.get(u, p ? { params: p } : undefined)
      .then((res) => active && setResult({ key, data: res.data, error: null, status: res.status }))
      .catch((err) => active && setResult({ key, data: null, error: apiError(err), status: err.response?.status ?? 0 }));
    return () => {
      active = false;
    };
  }, [key]);

  // A request that got no answer at all (status 0) is asked again when the connection is back.
  const failedOffline = result.key === key && result.status === 0;
  useEffect(() => (failedOffline ? onRetry(() => setNonce((n) => n + 1)) : undefined), [failedOffline]);

  const loading = url !== null && result.key !== key;
  const stale = keepPrevious && loading && result.data !== null;
  return {
    data: loading && !stale ? null : result.data,
    stale,
    error: loading ? null : result.error,
    status: loading ? null : result.status,
    loading,
    reload: () => setNonce((n) => n + 1),
  };
}
