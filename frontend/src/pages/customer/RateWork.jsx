// /bookings/:id/rate — "Rate this work" (Batch 6, section 7). Five big stars (each can be heard), four
// quick questions with thumbs up / thumbs down / skip, "Would you hire again?", and a comment that can
// be spoken. Reviews cannot be changed after sending, so a final dialog reads the answers back first.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Volume2 } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Dialog, EmptyState, PageHeader, TextArea, useToast } from '../../components/ui';
import StarInput from '../../features/reputation/StarInput';
import Stars from '../../features/reputation/Stars';
import ThumbsInput from '../../features/reputation/ThumbsInput';
import { QUICK_QUESTIONS } from '../../features/reputation/reputationText';
import { useSay } from '../../features/assist/useSay';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { apiError, apiFieldErrors } from '../../utils/apiErrors';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/booking/Booking.module.css';

const QUESTIONS = [...QUICK_QUESTIONS, 'wouldHireAgain'];

export default function RateWork() {
  const { id } = useParams();
  const { t, te } = useT();
  const toast = useToast();
  const navigate = useNavigate();
  const { skillName } = useTaxonomy();
  const { readBack } = useSay();
  useDocumentTitle(t('booking.titles.rate'));
  const { data, error, status, loading } = useApiQuery(`/bookings/${encodeURIComponent(id)}`);
  const [rating, setRating] = useState(null);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) return <EmptyState art="not-found" headingLevel={1} title={t('booking.detail.notFound')} description={t('booking.detail.notFoundText')} action={<Button to="/bookings">{t('booking.detail.back')}</Button>} />;
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  const b = data.booking;
  const canRate = (b.actions ?? []).includes('review');

  const ask = (e) => {
    e.preventDefault();
    if (!rating) {
      setFieldErrors({ rating: 'booking.rate.chooseStars' });
      return;
    }
    setFieldErrors({});
    setConfirming(true);
  };
  const send = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const body = { rating, ...Object.fromEntries(Object.entries(answers).filter(([, v]) => v)) };
      if (comment.trim()) body.comment = comment.trim();
      await API.post(`/bookings/${b._id}/review`, body);
      toast.show({ tone: 'success', title: t('booking.rate.sent') });
      navigate(`/bookings/${b._id}`);
    } catch (err) {
      setConfirming(false);
      setFieldErrors(apiFieldErrors(err));
      setProblem(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <Button to={`/bookings/${b._id}`} variant="ghost" size="sm" icon={ArrowLeft}>{t('booking.detail.back')}</Button>
      <PageHeader title={t('booking.rate.title')} description={t('booking.rate.lead', { skill: skillName({ skillId: b.skillId, name: b.skillName }), name: b.worker?.name ?? '' })} />
      {!canRate && <Alert tone="info">{t(b.hasReview ? 'booking.rate.already' : 'booking.rate.notNow')}</Alert>}
      {canRate && (
        <form className={styles.form} onSubmit={ask} noValidate>
          <StarInput legend={t('booking.rate.stars')} value={rating} onChange={setRating} error={fieldErrors.rating} />
          {QUESTIONS.map((q) => (
            <ThumbsInput key={q} legend={t(`booking.rate.q.${q}`)} name={q} value={answers[q] ?? null} onChange={(v) => setAnswers((a) => ({ ...a, [q]: v }))} assist={`rate.${q}`} />
          ))}
          <TextArea label={t('booking.rate.comment')} hint={t('booking.rate.commentHint')} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} error={fieldErrors.comment} assist="rate.comment" urdu />
          <p className={styles.warning} role="note">{t('booking.rate.final')}</p>
          {problem && <Alert tone="danger">{te(problem)}</Alert>}
          <div className={styles.actions}><Button type="submit" size="lg" icon={Send}>{t('booking.rate.check')}</Button></div>
        </form>
      )}
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('booking.rate.confirmTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>{t('booking.rate.change')}</Button>
            <Button loading={busy} icon={Send} onClick={send}>{t('booking.rate.send')}</Button>
          </>
        }
      >
        <div className={styles.dialogBody}>
          <p>{t('booking.rate.confirmText')}</p>
          {rating && <p className={styles.big}><Stars value={rating} size={24} /> {t(`reputation.starWords.${rating}`)}</p>}
          <ul className={styles.when}>
            {QUESTIONS.filter((q) => answers[q]).map((q) => <li key={q}>{t(`booking.rate.q.${q}`)}: <strong>{t(`reputation.thumb.${answers[q]}`)}</strong></li>)}
          </ul>
          {comment.trim() ? (
            <>
              <p className={styles.description} dir="auto">{comment.trim()}</p>
              <Button variant="secondary" icon={Volume2} onClick={() => readBack('rate-readback', comment.trim())}>{t('booking.rate.hearComment')}</Button>
            </>
          ) : <p className={styles.muted}>{t('booking.rate.noComment')}</p>}
        </div>
      </Dialog>
    </div>
  );
}
