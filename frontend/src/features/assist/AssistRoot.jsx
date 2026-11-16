// Mounted once, inside the router (RootLayout), on every page including the language chooser
// (Batch 5). It keeps the "one sound or one microphone at a time" rule safe:
//   - leaving a page stops every sound and microphone;
//   - Escape stops them too (a dialog still closes as usual);
// it renders the one polite live region that says "playing", "listening", "stopped", and asks the
// one-time "read aloud?" question after the language is chosen.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { stopAll } from './audio';
import { useAnnouncement } from './announce';
import { markInteracted } from './interaction';
import AutoReadOffer from './AutoReadOffer';

export default function AssistRoot() {
  const { pathname } = useLocation();
  const message = useAnnouncement();

  useEffect(() => stopAll, [pathname]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') stopAll(); };
    document.addEventListener('keydown', onKey);
    // speech may start only after the first touch of the page (auto-read waits for it)
    const touched = () => markInteracted();
    document.addEventListener('pointerdown', touched, { once: true });
    document.addEventListener('keydown', touched, { once: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', touched);
      document.removeEventListener('keydown', touched);
    };
  }, []);

  return (
    <>
      <div className="visually-hidden" aria-live="polite" data-testid="assist-live">{message}</div>
      <AutoReadOffer />
    </>
  );
}
