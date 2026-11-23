// /bookings/:id/payment-record and /worker/jobs/:id/payment-record — the printable "Payment record" of one
// booking (Module 5, §4.7): booking code, work, date, both SHORT names, the agreed price and conditions, each
// payment with its status. It says plainly that it is a record both people confirmed in the app, not a bank
// receipt. No phone numbers and no full names (the worker's public name is shortened here too).
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Alert, Button, EmptyState, PageHeader } from '../../components/ui';
import { PaymentStateChip } from '../../features/wage/PaymentsCard';
import { summaryLine } from '../../features/wage/wageLogic';
import { conditionWords, dayDate, priceLine, rupees } from '../../features/wage/wageText';
import { useAuth } from '../../context/auth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/wage/Wage.module.css';

// "Bilal Ahmed" -> "Bilal A." (the customer's name already comes shortened from the server)
const short = (name) => {
  const words = String(name ?? '').trim().split(/\s+/u).filter((w) => /^\p{L}/u.test(w));
  return words.length > 1 ? `${words[0]} ${[...words[words.length - 1]][0].toUpperCase()}.` : words[0] ?? '';
};

export default function PaymentRecord() {
  const { id } = useParams();
  const { user } = useAuth();
  const viewer = user?.role === 'worker' ? 'worker' : 'customer';
  const { t, te, formatNumber, formatDate } = useT();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('wage.record.title'));
  const [printedAt] = useState(() => new Date()); // read once, not during every render
  const { data, error, status, loading } = useApiQuery(`/bookings/${encodeURIComponent(id)}`);
  const back = viewer === 'worker' ? `/worker/jobs/${id}` : `/bookings/${id}`;
  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) return <EmptyState art="not-found" headingLevel={1} title={t('booking.detail.notFound')} description={t('booking.detail.notFoundText')} />;
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  const b = data.booking;
  const money = (n) => rupees(t, formatNumber, n);
  const agreed = b.terms?.agreed;
  return (
    <div className={styles.page}>
      <div className={`${styles.actions} ${styles.noPrint}`}>
        <Button to={back} variant="ghost" size="sm" icon={ArrowLeft}>{t('booking.detail.back')}</Button>
        <Button icon={Printer} onClick={() => window.print()}>{t('wage.record.print')}</Button>
      </div>
      <PageHeader title={t('wage.record.title')} description={t('wage.record.lead')} />
      <article className={styles.receipt} data-testid="payment-record">
        <dl className={styles.items}>
          <div className={styles.receiptRow}><dt>{t('wage.record.code')}</dt><dd dir="ltr" className="tabular">{b.code}</dd></div>
          <div className={styles.receiptRow}><dt>{t('wage.record.work')}</dt><dd>{skillName({ skillId: b.skillId, name: b.skillName })}</dd></div>
          <div className={styles.receiptRow}><dt>{t('wage.record.date')}</dt><dd>{dayDate(formatDate, b.preferredDate)}</dd></div>
          <div className={styles.receiptRow}><dt>{t('wage.record.worker')}</dt><dd dir="auto">{short(b.worker?.name)}</dd></div>
          <div className={styles.receiptRow}><dt>{t('wage.record.customer')}</dt><dd dir="auto">{short(b.customer?.name)}</dd></div>
          <div className={styles.receiptRow}><dt>{t('wage.record.price')}</dt><dd>{agreed ? priceLine(t, money, agreed) : t('wage.terms.none')}</dd></div>
          {agreed && <div className={styles.receiptRow}><dt>{t('wage.record.conditions')}</dt><dd>{conditionWords(t, money, agreed, { category: b.category }).join(' ') || '—'}</dd></div>}
          {agreed && <div className={styles.receiptRow}><dt>{t('wage.record.agreedOn')}</dt><dd>{formatDate(agreed.agreedAt, { day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>}
        </dl>
        <h2 className={styles.sectionTitle}>{t('wage.pay.title')}</h2>
        {(b.payments ?? []).length === 0 ? <p>{t('wage.record.noPayments')}</p> : (
          <div className={styles.tableWrap}><table className={styles.table}>
            <thead><tr><th scope="col">{t('wage.record.paidOn')}</th><th scope="col">{t('wage.pay.kind')}</th><th scope="col">{t('wage.pay.amount')}</th><th scope="col">{t('wage.pay.method')}</th><th scope="col">{t('wage.record.recordedBy')}</th><th scope="col">{t('wage.record.status')}</th></tr></thead>
            <tbody>
              {b.payments.map((p) => (
                <tr key={p._id}>
                  <td>{dayDate(formatDate, p.paidOn)}</td>
                  <td>{t(`wage.kind.${p.kind}`)}</td>
                  <td className="tabular">{money(p.amount)}</td>
                  <td>{t(`wage.method.name.${p.method}`)}</td>
                  <td>{t(`wage.pay.by.${p.recordedBy}`)}</td>
                  <td>{t(`wage.record.${p.status}`)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        <p className={styles.big}>{summaryLine(t, money, b.paymentSummary)} <PaymentStateChip state={b.paymentSummary.state} /></p>
        <p className={styles.notice} data-testid="not-a-receipt">{t('wage.record.notBank')}</p>
        <p className={styles.muted}>{t('wage.record.madeOn', { date: formatDate(printedAt, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
      </article>
    </div>
  );
}
