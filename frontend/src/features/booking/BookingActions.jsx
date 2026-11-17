// The buttons that fit a booking for this person now. The SERVER decides which ones (booking.actions,
// from the same rules it checks again on every press); this component only draws them and asks "why?"
// where a reason is needed. Big Accept (green, check) and Decline (cross) for a new request.
import { useState } from 'react';
import { Ban, Check, CircleCheck, Flag, Star, UserX, X } from 'lucide-react';
import API from '../../api';
import { apiError } from '../../utils/apiErrors';
import { Button, ConfirmDialog, useToast } from '../../components/ui';
import { useT } from '../../i18n';
import ReasonDialog from './ReasonDialog';
import { CANCEL_REASONS, DECLINE_REASONS, DISPUTE_REASONS } from './bookingText';
import styles from './Booking.module.css';

const HOUR = 60 * 60 * 1000;

export default function BookingActions({ booking: b, viewer, onChanged, compact = false }) {
  const { t, te } = useT();
  const toast = useToast();
  const [open, setOpen] = useState(null); // which dialog
  const [busy, setBusy] = useState(null);
  const [lateCancel, setLateCancel] = useState(false); // decided when the dialog opens (no clock during render)
  const actions = b.actions ?? [];
  if (actions.length === 0) return null;

  const post = async (path, body = {}, doneKey) => {
    const { data } = await API.post(`/bookings/${b._id}/${path}`, body);
    setOpen(null);
    if (doneKey) toast.show({ tone: 'success', title: t(doneKey) });
    onChanged?.(data.booking);
  };
  const press = async (key, path, body, doneKey) => {
    setBusy(key);
    try {
      await post(path, body, doneKey);
    } catch (err) {
      toast.show({ tone: 'danger', title: te(apiError(err)) });
    } finally {
      setBusy(null);
    }
  };
  const size = compact ? 'md' : 'lg';

  return (
    <div className={styles.actions} data-testid="booking-actions">
      {actions.includes('accept') && <Button size={size} icon={Check} className={styles.accept} loading={busy === 'accept'} onClick={() => press('accept', 'accept', {}, 'booking.done.accepted')}>{t('booking.action.accept')}</Button>}
      {actions.includes('decline') && <Button size={size} variant="secondary" icon={X} onClick={() => setOpen('decline')}>{t('booking.action.decline')}</Button>}
      {actions.includes('confirm_done') && <Button size={size} icon={CircleCheck} onClick={() => setOpen('done')}>{t('booking.action.workDone')}</Button>}
      {actions.includes('contest_done') && <Button size={size} variant="secondary" icon={Flag} onClick={() => setOpen('contest')}>{t('booking.action.notDone')}</Button>}
      {actions.includes('report_no_show') && <Button size={size} variant="secondary" icon={UserX} onClick={() => setOpen('noShow')}>{t('booking.action.noShow')}</Button>}
      {actions.includes('respond_no_show') && (
        <>
          <Button size={size} variant="secondary" onClick={() => setOpen('admit')}>{t('booking.action.admit')}</Button>
          <Button size={size} icon={Flag} onClick={() => setOpen('iCame')}>{t('booking.action.iCame')}</Button>
        </>
      )}
      {actions.includes('dispute') && <Button size={size} variant="secondary" icon={Flag} onClick={() => setOpen('dispute')}>{t('booking.action.dispute')}</Button>}
      {actions.includes('review') && <Button size={size} icon={Star} to={`/bookings/${b._id}/rate`}>{t('booking.action.rate')}</Button>}
      {actions.includes('cancel') && <Button size={size} variant="ghost" icon={Ban} onClick={() => { setLateCancel(viewer === 'worker' && b.status === 'accepted' && new Date(b.scheduledStart).getTime() - Date.now() < 24 * HOUR); setOpen('cancel'); }}>{t('booking.action.cancel')}</Button>}

      {open === 'decline' && (
        <ReasonDialog open title={t('booking.dialog.declineTitle')} intro={t('booking.dialog.declineText')} reasons={DECLINE_REASONS} group="decline" reasonRequired={false}
          confirmLabel={t('booking.action.decline')} onClose={() => setOpen(null)} onConfirm={({ reason }) => post('decline', reason ? { reason } : {}, 'booking.done.declined')} />
      )}
      {open === 'cancel' && (
        <ReasonDialog open tone="danger" title={t('booking.dialog.cancelTitle')} intro={t(b.status === 'requested' ? 'booking.dialog.cancelRequestText' : 'booking.dialog.cancelText')}
          warning={lateCancel ? t('booking.dialog.lateWarning') : viewer === 'worker' ? t('booking.dialog.earlyWarning') : null}
          reasons={CANCEL_REASONS} group="cancel" reasonRequired={b.status === 'accepted'}
          confirmLabel={t('booking.action.cancel')} onClose={() => setOpen(null)} onConfirm={({ reason }) => post('cancel', reason ? { reason } : {}, 'booking.done.cancelled')} />
      )}
      {open === 'contest' && (
        <ReasonDialog open title={t('booking.dialog.contestTitle')} intro={t('booking.dialog.contestText')} reasons={DISPUTE_REASONS.filter((r) => r !== 'i_did_come' && r !== 'not_my_fault')} group="dispute"
          note confirmLabel={t('booking.action.notDone')} onClose={() => setOpen(null)} onConfirm={({ reason, note }) => post('contest-done', { reasonCode: reason, ...(note ? { note } : {}) }, 'booking.done.disputed')} />
      )}
      {open === 'dispute' && (
        <ReasonDialog open title={t('booking.dialog.disputeTitle')} intro={t('booking.dialog.disputeText')} reasons={DISPUTE_REASONS.filter((r) => r !== 'work_not_done')} group="dispute"
          note confirmLabel={t('booking.action.dispute')} onClose={() => setOpen(null)} onConfirm={({ reason, note }) => post('dispute', { reasonCode: reason, ...(note ? { note } : {}) }, 'booking.done.disputed')} />
      )}
      {open === 'iCame' && (
        <ReasonDialog open title={t('booking.dialog.iCameTitle')} intro={t('booking.dialog.iCameText')} note
          confirmLabel={t('booking.action.iCame')} onClose={() => setOpen(null)} onConfirm={({ note }) => post('no-show/respond', { answer: 'dispute', ...(note ? { note } : {}) }, 'booking.done.disputed')} />
      )}
      <ConfirmDialog open={open === 'done'} title={t('booking.dialog.doneTitle')} message={t('booking.dialog.doneText')} confirmLabel={t('booking.action.workDone')} loading={busy === 'done'}
        onCancel={() => setOpen(null)} onConfirm={() => press('done', 'confirm-done', {}, 'booking.done.confirmed')} />
      <ConfirmDialog open={open === 'noShow'} title={t('booking.dialog.noShowTitle')} message={t('booking.dialog.noShowText')} confirmLabel={t('booking.action.noShow')} loading={busy === 'noShow'}
        onCancel={() => setOpen(null)} onConfirm={() => press('noShow', 'no-show', {}, 'booking.done.noShow')} />
      <ConfirmDialog open={open === 'admit'} tone="danger" title={t('booking.dialog.admitTitle')} message={t('booking.dialog.admitText')} confirmLabel={t('booking.action.admit')} loading={busy === 'admit'}
        onCancel={() => setOpen(null)} onConfirm={() => press('admit', 'no-show/respond', { answer: 'admit' }, 'booking.done.admitted')} />
    </div>
  );
}
