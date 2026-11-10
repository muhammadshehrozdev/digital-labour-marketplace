// Admin overview v3 (Batch 4): what needs attention now (queues with waiting times, the audit
// chain), then trends and totals as charts, and the latest activity. Every number is a real count
// from the database (GET /api/admin/stats, /api/admin/charts); nothing is estimated.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileClock, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { BarList, ColumnChart, SegmentBar } from '../../components/charts';
import { Alert, PageHeader, Skeleton, StatusChip } from '../../components/ui';
import ActivityFeed from '../../features/admin/ActivityFeed';
import ChainStatus from '../../features/admin/ChainStatus';
import { waitingDays } from '../../features/admin/adminHelpers';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './AdminOverview.module.css';

const PERIODS = [7, 30, 90];
const BUCKETS = ['under1Day', 'days1to3', 'days4to7', 'over7Days'];
const IDENTITY = ['Pending', 'Unverified', 'Verified', 'Rejected'];
const EVIDENCE = ['pending', 'approved', 'rejected', 'suspected_fake', 'revoked'];

// One queue: the count, how long items have waited, and a link to the queue.
function QueueTile({ icon: Icon, label, value, waiting, to, tone }) {
  const { t, formatNumber } = useT();
  const oldest = waiting?.oldest ? waitingDays(waiting.oldest) : null;
  return (
    <article className={[styles.queue, value > 0 && styles[tone]].filter(Boolean).join(' ')}>
      <div className={styles.queueHead}>
        <span className={styles.queueIcon} aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
        <h3 className={styles.queueLabel}>{label}</h3>
      </div>
      <p className={styles.queueValue}>{formatNumber(value)}</p>
      {value === 0 && <p className={styles.muted}>{t('adminx.dash.nothingWaiting')}</p>}
      {value > 0 && waiting && (
        <>
          {oldest !== null && <p className={styles.muted}>{t('adminx.dash.oldest', { waiting: oldest === 0 ? t('adminx.waiting.today') : t('adminx.waiting.days', { count: oldest }) })}</p>}
          <SegmentBar label={t('adminx.dash.waitingLabel')} formatNumber={formatNumber} segments={BUCKETS.map((id) => ({ id, label: t(`adminx.dash.buckets.${id}`), value: waiting[id] }))} />
        </>
      )}
      <Link to={to} className={styles.queueLink}>
        {t('adminx.dash.open')}<span className="visually-hidden">: {label}</span> <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function AdminOverview() {
  const { t, te, formatNumber, formatDate } = useT();
  useDocumentTitle(t('titles.adminOverview'));
  const { categoryLabel } = useTaxonomy();
  const [days, setDays] = useState(30);
  const stats = useApiQuery('/admin/stats');
  const charts = useApiQuery('/admin/charts', { days: String(days) });
  // While another period loads, the last charts stay on screen (dimmed) instead of jumping.
  const [kept, setKept] = useState(null);
  if (charts.data && charts.data !== kept) setKept(charts.data);
  const c = charts.data ?? kept;
  const s = stats.data;

  const day = (iso, options) => formatDate(`${iso}T12:00:00+05:00`, options);

  return (
    <div className={styles.page}>
      <PageHeader title={t('admin.overview.title')} description={t('admin.overview.lead')} />
      {(stats.error || charts.error) && <Alert tone="danger">{te(stats.error ?? charts.error)}</Alert>}

      <section aria-labelledby="now-title" className={styles.block}>
        <h2 id="now-title" className={styles.blockTitle}>{t('adminx.dash.nowTitle')}</h2>
        {!s || !c ? (
          <div className={styles.queues} aria-busy="true">{[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="block" height={190} />)}</div>
        ) : (
          <div className={styles.queues}>
            <QueueTile icon={UserRoundCheck} tone="attention" label={t('adminx.dash.queueIdentity')} value={s.workers.Pending} waiting={c.identity.waiting} to="/admin/identity?status=Pending" />
            <QueueTile icon={FileClock} tone="attention" label={t('adminx.dash.queueProof')} value={s.evidence?.pending ?? 0} waiting={c.evidence.waiting} to="/admin/evidence?status=pending" />
            <QueueTile icon={ShieldAlert} tone="danger" label={t('adminx.dash.queueFake')} value={s.evidence?.suspected_fake ?? 0} to="/admin/evidence?status=suspected_fake" />
            <ChainStatus />
          </div>
        )}
      </section>

      <section aria-labelledby="trends-title" className={styles.block}>
        <div className={styles.blockHead}>
          <h2 id="trends-title" className={styles.blockTitle}>{t('adminx.dash.trendsTitle')}</h2>
          <div role="radiogroup" aria-label={t('adminx.dash.period')} className={styles.periods}>
            {PERIODS.map((p) => (
              <button key={p} type="button" role="radio" aria-checked={days === p} className={styles.period} onClick={() => setDays(p)}>{t('adminx.dash.periodDays', { count: p })}</button>
            ))}
          </div>
        </div>
        {!c ? (
          <Skeleton variant="block" height={320} />
        ) : (
          <div className={[styles.grid, charts.loading && styles.stale].filter(Boolean).join(' ')} aria-busy={charts.loading}>
            <div className={`${styles.card} ${styles.wide}`}>
              <ColumnChart
                title={t('adminx.dash.registrations')}
                subtitle={t('adminx.dash.registrationsSub')}
                data={c.registrations.map((d) => ({ key: d.date, label: day(d.date, { day: 'numeric', month: 'short' }), fullLabel: day(d.date, { dateStyle: 'medium' }), values: { worker: d.worker, customer: d.customer } }))}
                series={[{ id: 'worker', label: t('adminx.dash.seriesWorkers'), color: 'var(--viz-1)' }, { id: 'customer', label: t('adminx.dash.seriesCustomers'), color: 'var(--viz-2)' }]}
                emptyText={t('adminx.dash.noRegistrations')}
                tableLabel={t('adminx.dash.showTable')}
                dateHeader={t('adminx.dash.date')}
                totalLabel={t('adminx.dash.total')}
                formatNumber={formatNumber}
              />
            </div>
            <div className={styles.feedCell}><ActivityFeed /></div>
            <div className={styles.card}>
              <BarList title={t('adminx.dash.identityByStatus')} emptyText={t('adminx.dash.noData')} formatNumber={formatNumber}
                rows={IDENTITY.map((id) => ({ id, label: <StatusChip kind="identity" status={id} />, value: c.identity.counts[id] }))} />
            </div>
            <div className={styles.card}>
              <BarList title={t('adminx.dash.evidenceByStatus')} emptyText={t('adminx.dash.noData')} formatNumber={formatNumber}
                rows={EVIDENCE.map((id) => ({ id, label: <StatusChip kind="evidence" status={id} />, value: c.evidence.counts[id] }))} />
            </div>
            <div className={`${styles.card} ${styles.full}`}>
              <BarList title={t('adminx.dash.skillsByCategory')} emptyText={t('adminx.dash.noData')} formatNumber={formatNumber} sorted
                rows={c.skillsByCategory.map((row) => ({ id: row.category, label: categoryLabel(row.category) || row.category, value: row.count }))} />
            </div>
          </div>
        )}
      </section>

      {s && (
        <section aria-labelledby="accounts-title" className={styles.block}>
          <h2 id="accounts-title" className={styles.blockTitle}>{t('adminx.dash.accountsTitle')}</h2>
          <dl className={styles.accounts}>
            {[['worker', s.users.worker, '/admin/users?role=worker'], ['customer', s.users.customer, '/admin/users?role=customer'], ['admin', s.users.admin, '/admin/users?role=admin'], ['profiles', s.workers.total, '/admin/identity?status=All']].map(([key, value, to]) => (
              <div key={key} className={styles.account}>
                <dt>{t(`adminx.dash.accounts.${key}`)}</dt>
                <dd><Link to={to}>{formatNumber(value)}</Link></dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
