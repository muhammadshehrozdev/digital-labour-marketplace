// "Back to top" with a ring that fills as the page is read (Batch 4, feature 44). Appears after
// the first screen. Smooth scroll, or a jump with reduced motion. Focus goes to the page's top.
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useT } from '../../i18n';
import { useBottomLift } from './useBottomLift';
import styles from './AppFeatures.module.css';

export const SHOW_AFTER_PX = 600;

function readProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

export default function ScrollTop() {
  const { t } = useT();
  const [state, setState] = useState({ show: false, progress: 0 });
  const lift = useBottomLift(); // Batch 6B: above the install invitation and other bottom bars

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setState({ show: window.scrollY > SHOW_AFTER_PX, progress: readProgress() }));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!state.show) return null;
  const r = 20;
  const c = 2 * Math.PI * r;
  const top = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };
  return (
    <button type="button" className={styles.scrollTop} style={{ '--lift': `${lift}px` }} onClick={top} aria-label={t('appx.scrollTop')} title={t('appx.scrollTop')} data-testid="scroll-top">
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - state.progress)} transform="rotate(-90 24 24)" />
      </svg>
      <ArrowUp size={18} aria-hidden="true" className={styles.scrollArrow} />
    </button>
  );
}
