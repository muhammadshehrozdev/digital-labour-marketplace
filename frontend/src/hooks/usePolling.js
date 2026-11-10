// Calls `callback` every `ms` milliseconds while the page is visible (Batch 4: the notification
// bell and the admin activity feed; no websockets). When the tab comes back to the front it runs
// once at once, so the person never looks at old numbers. ms = 0 turns it off.
import { useEffect, useRef } from 'react';

export function usePolling(callback, ms) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!ms) return undefined;
    const tick = () => {
      if (document.visibilityState !== 'hidden') saved.current();
    };
    const timer = window.setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms]);
}
