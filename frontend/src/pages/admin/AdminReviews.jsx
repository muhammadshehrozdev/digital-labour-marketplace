// Admin: review moderation (Module 4). Reported reviews come first. Hide (with a reason code) or
// restore (with a written reason). A hidden review leaves the public list and every score; both people
// are told why. Being negative is NEVER a reason to hide a review (docs/ADMIN-GUIDE.md).
import { useState } from 'react';
import { EyeOff, Flag, RotateCcw } from 'lucide-react';
import API from '../../api';
import { Alert, Badge, Button, Dialog, EmptyState, PageHeader, Pagination, RadioCardGroup, Select, Skeleton, TextArea, useToast } from '../../components/ui';
import TemplatePicker from '../../features/admin/TemplatePicker';
import WaitingBadge from '../../features/admin/WaitingBadge';
import Stars from '../../features/reputation/Stars';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { apiError } from '../../utils/apiErrors';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

const HIDE_REASONS = Object.freeze(['abusive_language', 'personal_information', 'unrelated', 'fake_or_manipulated', 'other']);
const PAGE_SIZE = 25;

function ModerateDialog({ review, action, onClose, onDone }) {
  const { t, te } = useT();
  const toast = useToast();
  const [reasonCode, setReasonCode] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const hide = action === 'hide';
  const send = async () => {
    if (hide && !reasonCode) return setError({ key: 'adminm4.reviews.chooseReason' });
    if ((!hide || reasonCode === 'other') && note.trim().length < 5) return setError({ key: 'adminm4.reviews.needNote' });
    setBusy(true);
    try {
      await API.patch(`/admin/reviews/${review._id}`, { action, ...(hide ? { reasonCode } : {}), ...(note.trim() ? { note: note.trim() } : {}) });
      toast.show({ title: t(hide ? 'adminm4.reviews.hidden' : 'adminm4.reviews.restored') });
      onDone();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
    return null;
  };
  return (
    <Dialog open onClose={onClose} title={t(hide ? 'adminm4.reviews.hideTitle' : 'adminm4.reviews.restoreTitle')}
      footer={<><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button variant={hide ? 'danger' : 'primary'} loading={busy} onClick={send}>{t(hide ? 'adminm4.reviews.hide' : 'adminm4.reviews.restore')}</Button></>}>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {hide && <Alert tone="warning">{t('adminm4.reviews.neverNegative')}</Alert>}
        {hide && <RadioCardGroup legend={t('adminm4.reviews.reason')} name="hide-reason" value={reasonCode} onChange={setReasonCode} options={HIDE_REASONS.map((r) => ({ value: r, title: t(`adminm4.reviews.reasons.${r}`) }))} />}
        {hide && <TemplatePicker kind="review_hide" onPick={setNote} />}
        <TextArea label={t(hide ? 'adminm4.reviews.noteOptional' : 'adminm4.reviews.noteRequired')} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} urdu />
        {error && <Alert tone="danger">{te(error)}</Alert>}
      </div>
    </Dialog>
  );
}

export function AdminReviewCard({ review: r, onModerate }) {
  const { t, formatDate } = useT();
  const { skillName } = useTaxonomy();
  return (
    <li className={styles.template} data-testid="admin-review">
      <div className={styles.statusRow}>
        <Stars value={r.rating} />
        <Badge tone={r.status === 'hidden' ? 'danger' : 'success'} icon={r.status === 'hidden' ? EyeOff : undefined}>{t(`adminm4.reviews.status.${r.status}`)}</Badge>
        {r.reports.length > 0 && <Badge tone="warning" icon={Flag}>{t('adminm4.reviews.reportedBadge')}</Badge>}
        {r.synthetic && <Badge>{t('adminm4.synthetic')}</Badge>}
      </div>
      <p className={styles.method}>{r.worker.name} (<span dir="ltr">{r.worker.workerIdCode}</span>) · {t('adminm4.reviews.by', { name: r.customer.name })} · <span dir="ltr">{r.booking.code}</span> · {skillName({ skillId: r.skillId })} · {formatDate(r.createdAt)}</p>
      {r.comment ? <p className={styles.wrapAnywhere} dir="auto">{r.comment}</p> : <p className={styles.method}>{t('adminm4.reviews.noComment')}</p>}
      {r.reply && <p className={styles.method} dir="auto">{t('reputation.workerReply')}: {r.reply.text}</p>}
      {r.reports.map((p) => (
        <p key={p.at} className={styles.method}>
          <Flag size={14} aria-hidden="true" /> {t(`booking.reasons.report.${p.reasonCode}`)}{p.note && <> · <span dir="auto">{p.note}</span></>} · <WaitingBadge since={p.at} />
        </p>
      ))}
      {r.hidden && <p className={styles.method}>{t('adminm4.reviews.hiddenBecause', { reason: t(`adminm4.reviews.reasons.${r.hidden.reasonCode}`) })}{r.hidden.note && <> · <span dir="auto">{r.hidden.note}</span></>}</p>}
      {onModerate && (
        <div className={styles.actions}>
          {r.status === 'visible'
            ? <Button size="sm" variant="danger" icon={EyeOff} onClick={() => onModerate(r, 'hide')}>{t('adminm4.reviews.hide')}</Button>
            : <Button size="sm" icon={RotateCcw} onClick={() => onModerate(r, 'restore')}>{t('adminm4.reviews.restore')}</Button>}
        </div>
      )}
    </li>
  );
}

export default function AdminReviews() {
  const { t, te } = useT();
  useDocumentTitle(t('adminm4.reviews.title'));
  const [status, setStatus] = useState('all');
  const [reported, setReported] = useState('');
  const [page, setPage] = useState(1);
  const [asking, setAsking] = useState(null);
  const query = { status, page: String(page), limit: String(PAGE_SIZE) };
  if (reported) query.reported = reported;
  const { data, error, reload } = useApiQuery('/admin/reviews', query);
  return (
    <div>
      <PageHeader title={t('adminm4.reviews.title')} description={t('adminm4.reviews.lead')} />
      <div className={styles.filters}>
        <Select label={t('adminm4.reviews.show')} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} options={['all', 'visible', 'hidden'].map((s) => ({ value: s, label: t(`adminm4.reviews.filter.${s}`) }))} />
        <Select label={t('adminm4.reviews.reports')} value={reported} onChange={(e) => { setPage(1); setReported(e.target.value); }} options={[{ value: '', label: t('adminm4.reviews.filter.any') }, { value: 'true', label: t('adminm4.reviews.filter.reported') }, { value: 'false', label: t('adminm4.reviews.filter.notReported') }]} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && data.reviews.length === 0 && <EmptyState art="all-done" headingLevel={2} title={t('adminm4.reviews.empty')} description={t('adminm4.reviews.emptyText')} />}
      {data && data.reviews.length > 0 && (
        <>
          <p className={styles.count} aria-live="polite">{t('adminm4.reviews.count', { count: data.total })}</p>
          <ul className={styles.templateList}>{data.reviews.map((r) => <AdminReviewCard key={r._id} review={r} onModerate={(review, action) => setAsking({ review, action })} />)}</ul>
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {asking && <ModerateDialog review={asking.review} action={asking.action} onClose={() => setAsking(null)} onDone={() => { setAsking(null); reload(); }} />}
    </div>
  );
}
