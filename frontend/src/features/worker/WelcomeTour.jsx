// Welcome tour (Batch 4, feature 37): four coach marks on the worker's first dashboard visit.
// Own code, no library. Each step points at an element marked data-tour="..."; steps whose
// element is not on the page are skipped. Skippable at any time (button or Esc), remembered per
// account on this device, and never shown again after "Done" or "Skip".
// The card is a non-modal dialog: focus moves into it, Tab stays usable, the page stays readable.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button, IconButton } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useT } from '../../i18n';
import { TOUR_STEPS, markSeen, tourSeen } from './tourStorage';
import styles from './WelcomeTour.module.css';

export default function WelcomeTour() {
  const { t } = useT();
  const { user } = useAuth();
  const [open, setOpen] = useState(() => Boolean(user?._id) && !tourSeen(user._id));
  const [steps, setSteps] = useState([]);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState(null);
  const cardRef = useRef(null);

  // Which steps exist on this page (after the dashboard has drawn).
  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => {
      const present = TOUR_STEPS.filter((id) => document.querySelector(`[data-tour="${id}"]`));
      if (present.length === 0) setOpen(false);
      setSteps(present);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  const step = steps[index];

  const measure = useCallback(() => {
    const target = step && document.querySelector(`[data-tour="${step}"]`);
    if (!target) return setBox(null);
    const r = target.getBoundingClientRect();
    return setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return undefined;
    const target = document.querySelector(`[data-tour="${step}"]`);
    target?.scrollIntoView?.({ block: 'center', behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const frame = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    cardRef.current?.focus();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step, measure]);

  const finish = useCallback(() => {
    if (user?._id) markSeen(user._id);
    setOpen(false);
  }, [user]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, finish]);

  if (!open || !step) return null;
  const last = index === steps.length - 1;
  // the card sits under the target when there is room, otherwise above it
  const below = !box || box.top + box.height + 240 < window.innerHeight;
  const cardStyle = box
    ? { top: below ? box.top + box.height + 12 : Math.max(12, box.top - 12), left: Math.min(Math.max(12, box.left), window.innerWidth - 352), transform: below ? undefined : 'translateY(-100%)' }
    : { top: 80, left: 12 };

  return (
    <div className={styles.layer} data-testid="welcome-tour">
      {box && <div className={styles.spot} aria-hidden="true" style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }} />}
      <div ref={cardRef} className={styles.card} role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-text" tabIndex={-1} style={cardStyle}>
        <div className={styles.head}>
          <p className={styles.position}>{t('workerx.tour.label')} · {t('workerx.tour.position', { n: index + 1, total: steps.length })}</p>
          <IconButton size="sm" label={t('workerx.tour.skip')} icon={X} onClick={finish} />
        </div>
        <h2 id="tour-title" className={styles.title}>{t(`workerx.tour.steps.${step}.title`)}</h2>
        <p id="tour-text" className={styles.text}>{t(`workerx.tour.steps.${step}.text`)}</p>
        <div className={styles.dots} aria-hidden="true">{steps.map((s, i) => <span key={s} data-active={i === index} />)}</div>
        <div className={styles.actions}>
          {index > 0 ? <Button size="sm" variant="ghost" onClick={() => setIndex(index - 1)}>{t('workerx.tour.back')}</Button> : <Button size="sm" variant="ghost" onClick={finish}>{t('workerx.tour.skip')}</Button>}
          <Button size="sm" onClick={() => (last ? finish() : setIndex(index + 1))}>{last ? t('workerx.tour.done') : t('workerx.tour.next')}</Button>
        </div>
      </div>
    </div>
  );
}
