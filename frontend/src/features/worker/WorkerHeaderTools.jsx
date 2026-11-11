// Worker tools in the header (Batch 4):
// - "Continue setup" chip with a progress ring while onboarding is not finished (feature 9)
// - Available / Busy quick toggle once the profile exists (feature 45)
// - the notification bell (feature 19)
// The onboarding state is asked again on every page change, so the chip disappears as soon as
// the last step is saved.
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../api';
import { useToast } from '../../components/ui';
import NotificationBell from '../notifications/NotificationBell';
import { useApiQuery } from '../../hooks/useApiQuery';
import { STEP_IDS } from '../../hooks/useOnboarding';
import { useT } from '../../i18n';
import styles from './HeaderTools.module.css';

function SetupChip({ state }) {
  const { t } = useT();
  const total = 3; // about, work, skills are needed
  const done = ['about', 'work', 'skills'].filter((s) => state.steps?.[s]).length;
  const n = Math.min(total, done + 1);
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <Link to={`/onboarding/${state.nextStep}`} className={styles.setup} aria-label={t('workerx.setup.label', { n, total })} data-testid="setup-chip">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} transform="rotate(-90 12 12)" className={styles.setupRing} />
      </svg>
      <span className={styles.setupText}>{t('workerx.setup.chip')}</span>
    </Link>
  );
}

function AvailabilitySwitch() {
  const { t } = useT();
  const toast = useToast();
  const profile = useApiQuery('/workers/me');
  const [value, setValue] = useState(null);
  const current = value ?? profile.data?.availability;
  if (!current) return null;
  const available = current === 'Available';
  const flip = async () => {
    const next = available ? 'Busy' : 'Available';
    setValue(next);
    try {
      await API.put('/workers/me', { availability: next });
      toast.show({ title: t('workerx.availability.saved', { status: t(`status.availability.${next}`) }) });
    } catch {
      setValue(current);
      toast.show({ tone: 'danger', title: t('workerx.availability.failed') });
    }
  };
  return (
    <button type="button" role="switch" aria-checked={available} className={styles.availability} data-state={available ? 'on' : 'off'} onClick={flip} title={t('workerx.availability.toggle')} aria-label={t('workerx.availability.toggle')}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.availabilityText} aria-hidden="true">{t(`status.availability.${current}`)}</span>
    </button>
  );
}

export default function WorkerHeaderTools() {
  const { pathname } = useLocation();
  const onboarding = useApiQuery('/workers/me/onboarding', undefined, { refreshKey: pathname, keepPrevious: true });
  const state = onboarding.data;
  const inOnboarding = pathname.startsWith('/onboarding');
  return (
    <>
      {state && !state.complete && !inOnboarding && STEP_IDS.includes(state.nextStep) && <SetupChip state={state} />}
      {state?.complete && <span className={styles.desktopOnly}><AvailabilitySwitch /></span>}
      <NotificationBell />
    </>
  );
}
