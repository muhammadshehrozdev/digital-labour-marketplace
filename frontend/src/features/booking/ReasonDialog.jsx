// A dialog that asks "why?" with picture cards (each can be heard), and an optional note (🎤), then
// confirms. Used for cancel, decline, "This work was not done", no-show answers and disputes.
import { useState } from 'react';
import { Dialog, Button, RadioCardGroup, TextArea } from '../../components/ui';
import { useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import styles from './Booking.module.css';

export default function ReasonDialog({
  open, title, intro, warning, reasons, group, reasonRequired = true, note = false, noteLabel, confirmLabel, dismissLabel, tone = 'primary', onConfirm, onClose,
}) {
  const { t, te } = useT();
  const [reason, setReason] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (reasonRequired && reasons?.length && !reason) {
      setError('booking.reason.choose');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm({ reason, note: text.trim() });
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
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{dismissLabel ?? t('common.cancel')}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={busy} onClick={submit}>{confirmLabel}</Button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        {intro && <p>{intro}</p>}
        {warning && <p className={styles.warning} role="note">{warning}</p>}
        {reasons?.length > 0 && (
          <RadioCardGroup
            legend={t('booking.reason.legend')}
            name={`reason-${group}`}
            value={reason}
            onChange={setReason}
            assist={`booking.${group}Reason`}
            listen={`${group}Reason`}
            options={reasons.map((r) => ({ value: r, title: t(`booking.reasons.${group}.${r}`) }))}
          />
        )}
        {note && <TextArea label={noteLabel ?? t('booking.reason.note')} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} assist="booking.note" urdu />}
        {error && <p className={styles.errorText} role="alert">{te(error)}</p>}
      </div>
    </Dialog>
  );
}
