import Dialog from './Dialog';
import Button from './Button';
import { useT } from '../../i18n/context';

// A yes/no question in a modal. Used for the CNIC reveal and for destructive actions.
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, tone = 'primary', loading, onConfirm, onCancel }) {
  const { t } = useT();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelLabel ?? t('common.cancel')}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel ?? t('common.continue')}</Button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}
