// GET data for a page. "loading" is derived from the request key (no state reset inside the
// effect), so every change of url/params loads again, and reload() asks again.
import { useEffect, useState } from 'react';
import API from '../api';
import { apiMessage } from '../utils/apiErrors';

export function useApiQuery(url, params) {
  const [nonce, setNonce] = useState(0);
  const key = `${JSON.stringify([url, params ?? null])}#${nonce}`;
  const [result, setResult] = useState({ key: null, data: null, error: '', status: null });

  useEffect(() => {
    let active = true;
    const [u, p] = JSON.parse(key.slice(0, key.lastIndexOf('#')));
    API.get(u, p ? { params: p } : undefined)
      .then((res) => active && setResult({ key, data: res.data, error: '', status: res.status }))
      .catch((err) => active && setResult({ key, data: null, error: apiMessage(err), status: err.response?.status ?? 0 }));
    return () => {
      active = false;
    };
  }, [key]);

  const loading = result.key !== key;
  return {
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    status: loading ? null : result.status,
    loading,
    reload: () => setNonce((n) => n + 1),
  };
}
