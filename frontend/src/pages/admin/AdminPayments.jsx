// Admin: Payments (Module 5, §7) — bookings by payment state, disputed first. READ-ONLY: a disputed payment is only
// marked and shown here; Module 9 will decide payment disputes. Each row opens the booking drawer with its
// timeline, price history and payment records. No phone numbers (D-002).
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, DataTable, EmptyState, PageHeader, Pagination, Select, Skeleton } from '../../components/ui';
import { BookingDrawer } from './AdminBookings';
import { PaymentStateChip } from '../../features/wage/PaymentsCard';
import { summaryLine } from '../../features/wage/wageLogic';
import { rupees } from '../../features/wage/wageText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './Admin.module.css';

const STATES = ['all', 'has_dispute', 'not_paid', 'part_paid', 'paid', 'no_price'];
const PAGE_SIZE = 20;

export default function AdminPayments() {
  const { t, te, formatNumber, formatDate } = useT();
  useDocumentTitle(t('wage.admin.payments.title'));
  const { skillName } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const state = STATES.includes(params.get('state')) ? params.get('state') : 'all';
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const { data, error, reload } = useApiQuery('/admin/payments', { state, page: String(page), limit: String(PAGE_SIZE) });
  const money = (n) => rupees(t, formatNumber, n);
  const columns = [
    { key: 'code', header: t('booking.card.code'), render: (b) => <span className="tabular" dir="ltr">{b.code}</span>, sub: (b) => skillName({ skillId: b.skillId, name: b.skillName }) },
    { key: 'people', header: t('wage.admin.payments.people'), render: (b) => b.worker?.name, sub: (b) => <span dir="auto">{b.customer?.name}</span> },
    { key: 'state', header: t('wage.admin.payments.state'), render: (b) => <PaymentStateChip state={b.paymentSummary?.state} /> },
    { key: 'money', header: t('wage.admin.payments.money'), render: (b) => summaryLine(t, money, b.paymentSummary) },
    { key: 'records', header: t('wage.admin.payments.records'), render: (b) => formatNumber((b.payments ?? []).length), sub: (b) => formatDate(b.updatedAt) },
  ];
  const setState = (v) => { setPage(1); const next = new URLSearchParams(params); next.set('state', v); setParams(next); };
  return (
    <div>
      <PageHeader title={t('wage.admin.payments.title')} description={t('wage.admin.payments.lead')} />
      <Alert tone="info">{t('wage.admin.payments.readOnly')}</Alert>
      <div className={styles.filters}>
        <Select label={t('wage.admin.payments.state')} value={state} onChange={(e) => setState(e.target.value)} options={STATES.map((s) => ({ value: s, label: s === 'all' ? t('wage.admin.payments.all') : t(`wage.state.${s}`) }))} />
      </div>
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && (
        <>
          <p className={styles.count} aria-live="polite">{t('wage.admin.payments.count', { count: data.total, disputed: data.counts?.disputed ?? 0 })}</p>
          <DataTable caption={t('wage.admin.payments.title')} columns={columns} rows={data.bookings} rowKey={(b) => b._id} onRowClick={(b) => setSelected(b._id)} rowLabel={(b) => t('adminm4.bookings.open', { code: b.code })}
            empty={<EmptyState art="all-done" headingLevel={2} title={t('wage.admin.payments.empty')} description={t('wage.admin.payments.emptyText')} />} />
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
      {selected && <BookingDrawer id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
