// /worker/reviews — the worker's reviews (Batch 6, section 7): 🔊 to hear each one, Reply (🎤, once,
// final) and Report (reason cards). Reporting does not hide a review: an admin looks at it.
import { useState } from 'react';
import { Flag, MessageSquareReply, Send } from 'lucide-react';
import API from '../../api';
import { Alert, Button, PageHeader, TextArea, useToast } from '../../components/ui';
import OptionListen from '../../features/assist/OptionListen';
import ReasonDialog from '../../features/booking/ReasonDialog';
import { REPORT_REASONS } from '../../features/booking/bookingText';
import ReviewList from '../../features/reputation/ReviewList';
import { useMyFullProfile } from '../../hooks/useMyFullProfile';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError } from '../../utils/apiErrors';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';

function ReviewTools({ review: r, onDone }) {
  const { t, te } = useT();
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const reply = async () => {
    setBusy(true);
    setError(null);
    try {
      await API.post(`/reviews/${r._id}/reply`, { text: text.trim() });
      toast.show({ tone: 'success', title: t('reputation.mine.replied') });
      onDone();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={styles.dialogBody}>
      <div className={styles.actions}>
        <OptionListen helpKey="reputation.mine.hear" name={t('reputation.mine.hearName', { reviewer: r.reviewer })} params={{ count: r.rating, reviewer: r.reviewer, comment: r.comment || '' }} />
        {!r.reply && !replying && <Button size="sm" variant="secondary" icon={MessageSquareReply} onClick={() => setReplying(true)}>{t('reputation.mine.reply')}</Button>}
        <Button size="sm" variant="ghost" icon={Flag} onClick={() => setReporting(true)}>{t('reputation.mine.report')}</Button>
      </div>
      {replying && (
        <div className={styles.dialogBody}>
          <TextArea label={t('reputation.mine.replyLabel')} maxLength={300} value={text} onChange={(e) => setText(e.target.value)} assist="reviews.reply" urdu />
          <p className={styles.warning} role="note">{t('reputation.mine.replyFinal')}</p>
          {error && <Alert tone="danger">{te(error)}</Alert>}
          <div className={styles.actions}>
            <Button size="sm" icon={Send} loading={busy} disabled={!text.trim()} onClick={reply}>{t('reputation.mine.sendReply')}</Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}
      {reporting && (
        <ReasonDialog
          open
          title={t('reputation.mine.reportTitle')}
          intro={t('reputation.mine.reportText')}
          reasons={REPORT_REASONS}
          group="report"
          note
          confirmLabel={t('reputation.mine.report')}
          onClose={() => setReporting(false)}
          onConfirm={async ({ reason, note }) => {
            await API.post(`/reviews/${r._id}/report`, { reasonCode: reason, ...(note ? { note } : {}) });
            setReporting(false);
            toast.show({ tone: 'success', title: t('reputation.mine.reported') });
          }}
        />
      )}
    </div>
  );
}

export default function MyReviews() {
  const { t, te } = useT();
  useDocumentTitle(t('booking.titles.reviews'));
  const full = useMyFullProfile();
  const [refresh, setRefresh] = useState(0);
  if (full.error) return <Alert tone="danger">{te(full.error)}</Alert>;
  if (!full.data) return <PageLoading />;
  return (
    <div className={styles.page}>
      <PageHeader title={t('reputation.mine.reviewsTitle')} description={t('reputation.mine.reviewsLead')} actions={<Button to="/worker/reputation" variant="secondary">{t('booking.nav.reputation')}</Button>} />
      <ReviewList workerIdCode={full.data.profile.workerIdCode} refreshKey={refresh} renderActions={(r) => <ReviewTools review={r} onDone={() => setRefresh((n) => n + 1)} />} />
    </div>
  );
}
