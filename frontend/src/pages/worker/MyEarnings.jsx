// /worker/earnings — My earnings (Module 5, §7): this month's CONFIRMED money as a big number with 🔊, then
// month by month (Pakistan time) each job with its agreed price and payment state. Money waiting for the
// customer's confirmation and disputed money are shown on their own lines and never added in. The app does not
// move money: these are the records both people confirmed (GET /api/workers/me/earnings).
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { Alert, EmptyState, PageHeader, Skeleton } from '../../components/ui';
import ListenButton from '../../features/wage/ListenButton';
import { PaymentStateChip } from '../../features/wage/PaymentsCard';
import { monthWords, rupees, spokenRupees } from '../../features/wage/wageText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/wage/Wage.module.css';

export default function MyEarnings() {
  const { t, te, formatNumber, formatDate } = useT();
  const { skillName } = useTaxonomy();
  useDocumentTitle(t('wage.earnings.title'));
  const { data, error } = useApiQuery('/workers/me/earnings');
  const money = (n) => rupees(t, formatNumber, n);
  return (
    <div className={styles.page}>
      <PageHeader title={t('wage.earnings.title')} description={t('wage.earnings.lead')} />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={200} />}
      {data && (
        <>
          <section className={styles.hero} aria-labelledby="this-month" data-testid="earnings-this-month">
            <h2 id="this-month" className={styles.sectionTitle}><Wallet size={20} aria-hidden="true" /> {t('wage.earnings.thisMonth', { month: monthWords(formatDate, data.thisMonth.month) })}</h2>
            <p className={`${styles.heroNumber} tabular`} dir="ltr">{money(data.thisMonth.confirmed)}</p>
            <p className={styles.muted}>{t('wage.earnings.onlyConfirmed')}</p>
            <ListenButton build={(spokenT) => spokenT('wage.spoken.earnings', { month: monthWords(formatDate, data.thisMonth.month), amount: spokenRupees(spokenT)(data.thisMonth.confirmed) })} />
          </section>
          {data.months.length === 0 && <EmptyState icon={Wallet} headingLevel={2} title={t('wage.earnings.empty')} description={t('wage.earnings.emptyText')} />}
          <ol className={styles.months} data-testid="earnings-months">
            {data.months.map((m) => (
              <li key={m.month} className={styles.month}>
                <h3 className={styles.sectionTitle}>{monthWords(formatDate, m.month)}</h3>
                <p className={styles.big}>{t('wage.earnings.monthTotal', { amount: money(m.confirmed), count: m.jobs })}</p>
                {m.awaiting > 0 && <p className={styles.muted} data-testid="earnings-awaiting">{t('wage.earnings.awaiting', { amount: money(m.awaiting) })}</p>}
                {m.disputed > 0 && <p className={styles.muted} data-testid="earnings-disputed">{t('wage.earnings.disputed', { amount: money(m.disputed) })}</p>}
                {m.materials > 0 && <p className={styles.muted}>{t('wage.earnings.materials', { amount: money(m.materials) })}</p>}
                <ul className={styles.items}>
                  {m.items.map((i) => (
                    <li key={`${m.month}-${i.bookingId}`} className={styles.item}>
                      <span>
                        <Link to={`/worker/jobs/${i.bookingId}`} className={styles.link}>{skillName({ skillId: i.skillId, name: i.skillName })}</Link>
                        <span className={styles.muted}> · <span dir="ltr" className="tabular">{i.code}</span></span>
                      </span>
                      <span className={styles.muted}>{i.agreedTotal !== null ? t('wage.earnings.agreed', { amount: money(i.agreedTotal) }) : t('wage.earnings.noPrice')} · {t('wage.earnings.received', { amount: money(i.confirmed) })}</span>
                      <PaymentStateChip state={i.state} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className={styles.notice}>{t('wage.pay.noMoney')}</p>
        </>
      )}
    </div>
  );
}
