// Admin: reputation flags from the rule-based pattern check (Module 4). A flag never changes a score.
// Dismiss it with a note, or hide the listed reviews as "fake or manipulated" with a note. Audited.
import { useState } from 'react';
import { Flag } from 'lucide-react';
import API from '../../api';
import { Alert, Button, Dialog, EmptyState, PageHeader, Select, Skeleton, TextArea, useToast } from '../../components/ui';
import WaitingBadge from '../../features/admin/WaitingBadge';
import { AdminReviewCard } from './AdminReviews';
import { useApiQuery } from '../../hooks/useApiQuery';
import { apiError } from '../../utils/apiErrors';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

function FlagDialog({ flag, action, onClose, onDone }) {
  const { t, te } = useT();
  const toast = useToast();
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (note.trim().length < 5) return setError({ key: 'adminm4.flags.needNote' });
    setBusy(true);
    try {
      const { data } = await API.patch(`/admin/reputation-flags/${flag._id}`, { action, note: note.trim() });
      toast.show({ title: t(action === 'dismiss' ? 'adminm4.flags.dismissed' : 'adminm4.flags.actioned', { count: data.reviewsHidden }) });
      onDone();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
    return null;
  };
  return (
    <Dialog open onClose={onClose} title={t(action === 'dismiss' ? 'adminm4.flags.dismissTitle' : 'adminm4.flags.hideTitle')}
      footer={<><Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button><Button variant={action === 'dismiss' ? 'primary' : 'danger'} loading={busy} onClick={send}>{t(action === 'dismiss' ? 'adminm4.flags.dismiss' : 'adminm4.flags.hide')}</Button></>}>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p>{t(action === 'dismiss' ? 'adminm4.flags.dismissText' : 'adminm4.flags.hideText')}</p>
        <TextArea label={t('adminm4.flags.note')} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} required urdu />
        {error && <Alert tone="danger">{te(error)}</Alert>}
      </div>
    </Dialog>
  );
}

export default function AdminFlags() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('adminm4.flags.title'));
  const [status, setStatus] = useState('open');
  const [asking, setAsking] = useState(null);
  const { data, error, reload } = useApiQuery('/admin/reputation-flags', { status });
  return (
    <div>
      <PageHeader title={t('adminm4.flags.title')} description={t('adminm4.flags.lead')} />
      <div className={styles.filters}>
        <Select label={t('adminm4.flags.show')} value={status} onChange={(e) => setStatus(e.target.value)} options={['open', 'dismissed', 'actioned', 'all'].map((s) => ({ value: s, label: t(`adminm4.flags.status.${s}`) }))} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={200} />}
      {data && data.flags.length === 0 && <EmptyState art="all-done" headingLevel={2} title={t('adminm4.flags.empty')} description={t('adminm4.flags.emptyText')} />}
      {data && data.flags.length > 0 && (
        <ul className={styles.templateList}>
          {data.flags.map((f) => (
            <li key={f._id} className={styles.template} data-testid="flag">
              <h2 className={styles.sectionTitle}><Flag size={18} aria-hidden="true" /> {t(`adminm4.flags.type.${f.type}`)}</h2>
              <p>{t(`adminm4.flags.explain.${f.type}`)}</p>
              <p className={styles.method}>{f.worker.name} (<span dir="ltr">{f.worker.workerIdCode}</span>) · {formatDate(f.createdAt)} · {f.status === 'open' ? <WaitingBadge since={f.createdAt} /> : t(`adminm4.flags.status.${f.status}`)}</p>
              {f.reviews.length > 0 && <ul className={styles.templateList}>{f.reviews.map((r) => <AdminReviewCard key={r._id} review={r} />)}</ul>}
              {f.bookings.length > 0 && <p className={styles.method}>{t('adminm4.flags.bookings')}: {f.bookings.map((b) => b.code).join(', ')}</p>}
              {f.decision && <p className={styles.method} dir="auto">{t('adminm4.flags.decisionNote')}: {f.decision.note}</p>}
              {f.status === 'open' && (
                <div className={styles.actions}>
                  <Button size="sm" variant="secondary" onClick={() => setAsking({ flag: f, action: 'dismiss' })}>{t('adminm4.flags.dismiss')}</Button>
                  <Button size="sm" variant="danger" onClick={() => setAsking({ flag: f, action: 'hide_reviews' })}>{t('adminm4.flags.hide')}</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {asking && <FlagDialog flag={asking.flag} action={asking.action} onClose={() => setAsking(null)} onDone={() => { setAsking(null); reload(); }} />}
    </div>
  );
}
