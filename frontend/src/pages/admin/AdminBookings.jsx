// Admin: every booking (Module 4). Filters in the address, a table, and a drawer with the full timeline.
// No phone number is shown here (they exist only inside the booking for the two people, D-002).
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Alert, Button, DataTable, Drawer, EmptyState, PageHeader, Pagination, Select, Skeleton, TextField } from '../../components/ui';
import BookingStatusChip from '../../features/booking/BookingStatusChip';
import BookingTimeline from '../../features/booking/BookingTimeline';
import { WhenWhere } from '../../features/booking/BookingCard';
import Stars from '../../features/reputation/Stars';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

const STATUSES = ['all', 'disputed', 'requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled'];
const PAGE_SIZE = 25;

export function BookingDrawer({ id, onClose, children }) {
  const { t, te } = useT();
  const { skillName } = useTaxonomy();
  const { data, error, loading } = useApiQuery(`/admin/bookings/${id}`);
  const b = data?.booking;
  return (
    <Drawer open onClose={onClose} title={b ? `${b.code} · ${skillName({ skillId: b.skillId, name: b.skillName })}` : t('adminm4.bookings.one')} description={b ? `${b.worker?.name} (${b.worker?.workerIdCode}) · ${b.customer?.name}` : undefined}>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {loading && <Skeleton variant="block" height={240} />}
      {b && (
        <>
          <div className={styles.statusRow}><BookingStatusChip booking={b} />{b.outcome && <span className={styles.method}>{t(`booking.outcome.${b.outcome}`)}</span>}</div>
          <WhenWhere booking={b} />
          {b.description && <p className={styles.wrapAnywhere} dir="auto">{b.description}</p>}
          {b.dispute && (
            <section aria-labelledby="admin-dispute">
              <h3 id="admin-dispute" className={styles.sectionTitle}>{t(`booking.dispute.type.${b.dispute.type}`)}</h3>
              <p>{t('adminm4.disputes.openedBy', { who: t(`booking.who.${b.dispute.openedBy}`) })}{b.dispute.reasonCode ? ` · ${t(`booking.reasons.dispute.${b.dispute.reasonCode}`)}` : ''}</p>
              {b.dispute.note ? <p className={styles.wrapAnywhere} dir="auto">“{b.dispute.note}”</p> : <p className={styles.method}>{t('adminm4.disputes.noNote')}</p>}
              {b.dispute.decision && <p><strong>{t(`booking.dispute.decision.${b.dispute.decision}`)}</strong>{b.dispute.decisionNote && <> · <span dir="auto">{b.dispute.decisionNote}</span></>}</p>}
            </section>
          )}
          {b.review && <p><Stars value={b.review.rating} /> {t(b.review.status === 'hidden' ? 'booking.detail.reviewHidden' : 'adminm4.bookings.reviewVisible')}</p>}
          <BookingTimeline timeline={b.timeline} />
          {children?.(b)}
        </>
      )}
    </Drawer>
  );
}

export default function AdminBookings() {
  const { t, te, formatDate } = useT();
  useDocumentTitle(t('adminm4.bookings.title'));
  const { skillName } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const query = { status, page: String(page), limit: String(PAGE_SIZE) };
  if (params.get('q')) query.q = params.get('q');
  const { data, error, reload } = useApiQuery('/admin/bookings', query);
  const columns = [
    { key: 'code', header: t('booking.card.code'), render: (b) => <span className="tabular" dir="ltr">{b.code}</span>, sub: (b) => skillName({ skillId: b.skillId, name: b.skillName }) },
    { key: 'worker', header: t('adminm4.bookings.worker'), render: (b) => b.worker?.name, sub: (b) => <span className="tabular" dir="ltr">{b.worker?.workerIdCode}</span> },
    { key: 'customer', header: t('adminm4.bookings.customer'), render: (b) => <span dir="auto">{b.customer?.name}</span> },
    { key: 'when', header: t('adminm4.bookings.when'), sortable: true, sortValue: (b) => b.scheduledStart, render: (b) => <span className="tabular">{formatDate(b.scheduledStart, { dateStyle: 'medium', timeStyle: 'short' })}</span> },
    { key: 'status', header: t('adminm4.bookings.state'), render: (b) => <BookingStatusChip booking={b} />, sub: (b) => (b.outcome ? t(`booking.outcome.${b.outcome}`) : null) },
    { key: 'created', header: t('adminm4.bookings.created'), sortable: true, sortValue: (b) => b.createdAt, render: (b) => <span className="tabular">{formatDate(b.createdAt)}</span> },
  ];
  const setStatus = (v) => { setPage(1); const next = new URLSearchParams(params); next.set('status', v); setParams(next); };
  return (
    <div>
      <PageHeader title={t('adminm4.bookings.title')} description={t('adminm4.bookings.lead')} />
      <form className={styles.filters} role="search" onSubmit={(e) => { e.preventDefault(); setPage(1); const next = new URLSearchParams(params); if (q.trim()) next.set('q', q.trim()); else next.delete('q'); setParams(next); }}>
        <Select label={t('adminm4.bookings.state')} value={status} onChange={(e) => setStatus(e.target.value)} options={STATUSES.map((s) => ({ value: s, label: t(s === 'all' ? 'adminm4.bookings.all' : s === 'disputed' ? 'booking.disputeOpen' : `booking.status.${s}`) }))} />
        <TextField label={t('adminm4.bookings.search')} maxLength={50} value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" icon={Search}>{t('common.search')}</Button>
      </form>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('adminm4.bookings.count', { count: data.total })}</p>
          <DataTable caption={t('adminm4.bookings.title')} columns={columns} rows={data.bookings} rowKey={(b) => b._id} onRowClick={(b) => setSelected(b._id)} rowLabel={(b) => t('adminm4.bookings.open', { code: b.code })}
            empty={<EmptyState art="all-done" headingLevel={2} title={t('adminm4.bookings.empty')} description={t('adminm4.bookings.emptyText')} />} />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && <BookingDrawer id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
