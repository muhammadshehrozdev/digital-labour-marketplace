// "Close the job request" (Module 6): the four reasons as picture choices (each can be heard), then
// POST /api/job-requests/:id/close { reason }. Closing never changes a booking that was already sent.
import { useState } from 'react';
import { Button, Dialog, RadioCardGroup } from '../../components/ui';
import { useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import { CLOSE_ICONS, CLOSE_REASONS } from './jobText';
import styles from './Jobs.module.css';

export default function CloseJobDialog({ open, onClose, onConfirm }) {
  const { t, te } = useT();
  const [reason, setReason] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!reason) {
      setError('jobs.close.choose');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('jobs.close.title')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button loading={busy} onClick={submit}>{t('jobs.close.confirm')}</Button>
        </>
      }
    >
      <div className={styles.form} data-testid="close-job-dialog">
        <p className={styles.notice}>{t('jobs.close.intro')}</p>
        <RadioCardGroup
          legend={t('jobs.close.legend')}
          name="closeReason"
          value={reason}
          onChange={(v) => { setReason(v); setError(null); }}
          assist="jobs.closeReason"
          listen="jobClose"
          options={CLOSE_REASONS.map((r) => ({ value: r, title: t(`jobs.close.reasons.${r}`), icon: CLOSE_ICONS[r] }))}
        />
        {error && <p className={styles.muted} role="alert">{te(error)}</p>}
      </div>
    </Dialog>
  );
}
