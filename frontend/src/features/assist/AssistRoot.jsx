// Mounted once, inside the router (RootLayout), on every page including the language chooser
// (Batch 5). It keeps the "one sound or one microphone at a time" rule safe:
//   - leaving a page stops every sound and microphone;
//   - Escape stops them too (a dialog still closes as usual);
// and it renders the one polite live region that says "playing", "listening", "stopped".
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { stopAll } from './audio';
import { useAnnouncement } from './announce';

export default function AssistRoot() {
  const { pathname } = useLocation();
  const message = useAnnouncement();

  useEffect(() => stopAll, [pathname]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') stopAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return <div className="visually-hidden" aria-live="polite" data-testid="assist-live">{message}</div>;
}
