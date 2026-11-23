// The rule-based checks of a DRAFT while the person chooses (POST /api/prices/check; nothing is saved). Waits
// until the typing stops for a moment. A failed check is not shown as an error: the checks only help.
import { useEffect, useRef, useState } from 'react';
import API from '../../api';

export function useLiveChecks(draft, { enabled = true } = {}) {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const key = JSON.stringify(draft);
  const last = useRef(0);
  useEffect(() => {
    if (!enabled) return undefined;
    const mine = (last.current += 1);
    const timer = setTimeout(() => {
      setBusy(true);
      API.post('/prices/check', JSON.parse(key))
        .then(({ data }) => mine === last.current && setResult(data))
        .catch(() => mine === last.current && setResult(null))
        .finally(() => mine === last.current && setBusy(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [key, enabled]);
  return { checks: result?.checks ?? null, wageReference: result?.wageReference ?? null, region: result?.region ?? null, platform: result?.platform ?? null, busy };
}
