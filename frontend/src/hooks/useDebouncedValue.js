// The value, but only after it has stopped changing for `ms` milliseconds (instant search:
// the server is asked when the person pauses typing, not for every letter).
import { useEffect, useState } from 'react';

export function useDebouncedValue(value, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
