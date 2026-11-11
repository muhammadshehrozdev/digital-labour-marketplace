// The worker ID with a copy button (Batch 4, feature 18): the icon turns into a check that draws
// itself, a short vibration on phones, and a polite message for screen readers.
import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { useT } from '../../i18n';
import { buzz } from '../../utils/haptics';
import styles from './WorkerFeatures.module.css';

export default function CopyId({ id }) {
  const { t } = useT();
  const [state, setState] = useState('idle'); // idle | copied | failed

  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = window.setTimeout(() => setState('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      buzz(12);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <span className={styles.copyId}>
      <span className="tabular" dir="ltr">{t('dashboard.workerId', { id })}</span>
      <button type="button" className={styles.copyButton} onClick={copy} aria-label={t('workerx.copy.button')} title={t('workerx.copy.button')} data-state={state}>
        {state === 'copied' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={styles.copyCheck}><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" /></svg>
        ) : (
          <Copy size={16} aria-hidden="true" />
        )}
      </button>
      <span className="visually-hidden" role="status">{state === 'copied' ? t('workerx.copy.copied') : state === 'failed' ? t('workerx.copy.failed') : ''}</span>
      {state === 'failed' && <span className={styles.copyFailed} aria-hidden="true">{t('workerx.copy.failed')}</span>}
    </span>
  );
}
