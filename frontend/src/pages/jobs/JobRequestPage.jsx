// /job-requests/:id — one job request (Module 6, Batch 8B): the details with pictures, the state and what it means,
// the buttons the server allows (job.actions: edit, find workers, close, delete), the requests sent from this job,
// and "What the app understood from your words" (collapsed). The budget is on this page because it is the
// customer's own; a worker never reaches it (the server answers 403 to workers on every job route).
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Lightbulb, Pencil, Trash2, Users, XCircle } from 'lucide-react';
import API from '../../api';
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, useToast } from '../../components/ui';
import BookingStatusChip from '../../features/booking/BookingStatusChip';
import { dayWords } from '../../features/booking/bookingText';
import CloseJobDialog from '../../features/jobs/CloseJobDialog';
import JobStateChip from '../../features/jobs/JobStateChip';
import JobSummary from '../../features/jobs/JobSummary';
import UnderstoodTable from '../../features/jobs/UnderstoodTable';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import { apiError } from '../../utils/apiErrors';
import styles from '../../features/jobs/Jobs.module.css';

export default function JobRequestPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, te, formatDate } = useT();
  const { categoryLabel } = useTaxonomy();
  useDocumentTitle(t('jobs.titles.detail'));
  const { data, error, status, loading } = useApiQuery(`/job-requests/${encodeURIComponent(id)}`);
  const [fresh, setFresh] = useState(null);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return <EmptyState art="not-found" headingLevel={1} title={t('jobs.detail.notFound')} description={t('jobs.detail.notFoundText')} action={<Button to="/job-requests">{t('jobs.detail.back')}</Button>} />;
  }
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  const job = fresh ?? data.job;
  const actions = job.actions ?? [];
  const note = location.state ?? {};

  const close = async (reason) => {
    const { data: answer } = await API.post(`/job-requests/${encodeURIComponent(job._id)}/close`, { reason });
    setFresh(answer.job);
    setClosing(false);
    toast.show({ tone: 'success', title: t('jobs.detail.closed', { code: job.code }) });
  };
  const remove = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await API.delete(`/job-requests/${encodeURIComponent(job._id)}`);
      toast.show({ tone: 'info', title: t('jobs.detail.deleted', { code: job.code }) });
      navigate('/job-requests', { replace: true });
    } catch (err) {
      setActionError(apiError(err));
      setDeleting(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <Button to="/job-requests" variant="ghost" size="sm" icon={ArrowLeft}>{t('jobs.detail.back')}</Button>
      <PageHeader
        eyebrow={<span dir="ltr" className="tabular">{job.code}</span>}
        title={categoryLabel(job.category) || t('jobs.titles.detail')}
        description={t(`jobs.meaning.${job.state}`)}
        actions={<JobStateChip state={job.state} />}
      />
      {note.created && actions.includes('find_workers') && (
        <section className={styles.callout} aria-labelledby="next-step" data-testid="next-step">
          <span className={styles.calloutIcon}><Lightbulb size={26} aria-hidden="true" /></span>
          <div className={styles.calloutText}>
            <h2 id="next-step">{t('jobs.detail.nextTitle')}</h2>
            <p>{t('jobs.new.next')}</p>
          </div>
          <Button to={`/job-requests/${job._id}/workers`} icon={Users}>{t('jobs.card.chooseWorker')}</Button>
        </section>
      )}
      {note.saved && <Alert tone="success" title={t('jobs.detail.saved')}>{note.rechecked ? t('jobs.detail.rechecked') : null}</Alert>}
      {actionError && <Alert tone="danger">{te(actionError)}</Alert>}

      <section className={styles.section} aria-labelledby="job-details">
        <h2 id="job-details" className={styles.sectionTitle}>{t('jobs.detail.details')}</h2>
        <JobSummary job={job} showBudget showDescription />
        {job.state === 'open' && job.openUntil && <p className={styles.muted}>{t('jobs.detail.openUntil', { date: formatDate(job.openUntil) })}</p>}
        {job.state === 'closed' && job.closedAt && (
          <p className={styles.muted}>{t('jobs.detail.closedOn', { date: formatDate(job.closedAt), reason: job.closeReason ? t(`jobs.close.reasons.${job.closeReason}`) : '' })}</p>
        )}
        <div className={styles.actions} data-testid="job-actions">
          {actions.includes('find_workers') && (
            <Button to={`/job-requests/${job._id}/workers`} icon={Users}>{t(job.state === 'open' ? 'jobs.card.chooseWorker' : 'jobs.detail.workers')}</Button>
          )}
          {actions.includes('edit') && <Button to={`/job-requests/${job._id}/edit`} variant="secondary" icon={Pencil}>{t('jobs.detail.edit')}</Button>}
          {actions.includes('close') && <Button variant="secondary" icon={XCircle} onClick={() => setClosing(true)}>{t('jobs.detail.close')}</Button>}
          {actions.includes('delete') && <Button variant="ghost" icon={Trash2} onClick={() => setDeleting(true)}>{t('jobs.detail.delete')}</Button>}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="job-bookings">
        <h2 id="job-bookings" className={styles.sectionTitle}>{t('jobs.detail.sent')}</h2>
        {(job.bookings ?? []).length === 0 ? (
          <p className={styles.muted}>{t('jobs.detail.sentEmpty')}</p>
        ) : (
          <ul className={styles.bookings} data-testid="job-bookings">
            {job.bookings.map((b) => (
              <li key={b._id} className={styles.booking}>
                <Link to={`/bookings/${b._id}`}><span dir="ltr" className="tabular">{b.code}</span></Link>
                <span dir="auto">{t('jobs.detail.workerLine', { name: b.worker?.name ?? t('common.worker'), code: b.worker?.workerIdCode ?? '' })}</span>
                <BookingStatusChip booking={b} />
                <span className={styles.fromJob}><CalendarDays size={16} aria-hidden="true" /> {dayWords(t, formatDate, b.preferredDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {job.analysis && (
        <details className={styles.understood} open={Boolean(note.rechecked)}>
          <summary>{t('jobs.understood.title')}</summary>
          <UnderstoodTable job={job} />
        </details>
      )}

      <CloseJobDialog key={closing ? 'open' : 'shut'} open={closing} onClose={() => setClosing(false)} onConfirm={close} />
      <ConfirmDialog
        open={deleting}
        title={t('jobs.delete.title')}
        message={t('jobs.delete.text')}
        confirmLabel={t('jobs.delete.confirm')}
        tone="danger"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(false)}
      />
    </div>
  );
}
