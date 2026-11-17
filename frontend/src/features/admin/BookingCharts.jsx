// Admin overview, Module 4: bookings per day, bookings by state, the stars given, and completed jobs
// against jobs cancelled by the worker or missed, per week. Real counts only (GET /api/admin/stats/bookings);
// every chart has a table view and an empty state. Uses the project's validated two-colour palette.
import { Link } from 'react-router-dom';
import { ArrowRight, Flag, Gavel, MessagesSquare } from 'lucide-react';
import { BarList, ColumnChart } from '../../components/charts';
import { Skeleton } from '../../components/ui';
import BookingStatusChip from '../booking/BookingStatusChip';
import Stars from '../reputation/Stars';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import styles from '../../pages/admin/AdminOverview.module.css';

const STATES = ['requested', 'accepted', 'completed', 'declined', 'expired', 'cancelled'];

function Queue({ icon: Icon, label, value, to }) {
  const { t, formatNumber } = useT();
  return (
    <article className={[styles.queue, value > 0 && styles.attention].filter(Boolean).join(' ')}>
      <div className={styles.queueHead}>
        <span className={styles.queueIcon} aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
        <h3 className={styles.queueLabel}>{label}</h3>
      </div>
      <p className={styles.queueValue}>{formatNumber(value)}</p>
      {value === 0 && <p className={styles.muted}>{t('adminx.dash.nothingWaiting')}</p>}
      <Link to={to} className={styles.queueLink}>{t('adminx.dash.open')}<span className="visually-hidden">: {label}</span> <ArrowRight size={16} aria-hidden="true" /></Link>
    </article>
  );
}

export default function BookingCharts({ days }) {
  const { t, formatNumber, formatDate } = useT();
  const { data } = useApiQuery('/admin/stats/bookings', { days: String(days) });
  if (!data) return <Skeleton variant="block" height={260} />;
  const day = (iso, options) => formatDate(`${iso}T12:00:00+05:00`, options);
  const byState = Object.fromEntries(STATES.map((s) => [s, data.bookingsPerDay.reduce((n, d) => n + (d[s] ?? 0), 0)]));
  return (
    <>
      <div className={styles.queues}>
        <Queue icon={Gavel} label={t('adminm4.dash.disputes')} value={data.queues.openDisputes} to="/admin/disputes" />
        <Queue icon={Flag} label={t('adminm4.dash.flags')} value={data.queues.openFlags} to="/admin/flags" />
        <Queue icon={MessagesSquare} label={t('adminm4.dash.reported')} value={data.queues.reportedReviews} to="/admin/reviews?reported=true" />
      </div>
      <div className={styles.grid} data-testid="booking-charts">
        <div className={`${styles.card} ${styles.wide}`}>
          <ColumnChart
            title={t('adminm4.dash.perDay')}
            subtitle={t('adminm4.dash.perDaySub')}
            data={data.bookingsPerDay.map((d) => ({ key: d.date, label: day(d.date, { day: 'numeric', month: 'short' }), fullLabel: day(d.date, { dateStyle: 'medium' }), values: { all: STATES.reduce((n, s) => n + (d[s] ?? 0), 0) } }))}
            series={[{ id: 'all', label: t('adminm4.dash.bookings'), color: 'var(--viz-1)' }]}
            emptyText={t('adminm4.dash.noBookings')}
            tableLabel={t('adminx.dash.showTable')}
            dateHeader={t('adminx.dash.date')}
            totalLabel={t('adminx.dash.total')}
            formatNumber={formatNumber}
          />
        </div>
        <div className={styles.card}>
          <BarList title={t('adminm4.dash.byState')} emptyText={t('adminm4.dash.noBookings')} formatNumber={formatNumber}
            rows={STATES.map((s) => ({ id: s, label: <BookingStatusChip booking={{ status: s }} />, value: byState[s] }))} />
        </div>
        <div className={styles.card}>
          <BarList title={t('adminm4.dash.stars')} emptyText={t('adminm4.dash.noReviews')} formatNumber={formatNumber}
            rows={[5, 4, 3, 2, 1].map((n) => ({ id: String(n), label: <Stars value={n} size={14} />, value: data.ratingDistribution[n] ?? 0 }))} />
        </div>
        <div className={`${styles.card} ${styles.full}`}>
          <ColumnChart
            title={t('adminm4.dash.perWeek')}
            subtitle={t('adminm4.dash.perWeekSub')}
            data={data.perWeek.map((w) => ({ key: w.from, label: day(w.from, { day: 'numeric', month: 'short' }), fullLabel: t('adminm4.dash.weekFrom', { date: day(w.from, { dateStyle: 'medium' }) }), values: { completed: w.completed, failed: w.workerCancelled + w.noShows } }))}
            series={[{ id: 'completed', label: t('adminm4.dash.completed'), color: 'var(--viz-1)' }, { id: 'failed', label: t('adminm4.dash.failed'), color: 'var(--viz-2)' }]}
            emptyText={t('adminm4.dash.noClosed')}
            tableLabel={t('adminx.dash.showTable')}
            dateHeader={t('adminm4.dash.week')}
            totalLabel={t('adminx.dash.total')}
            formatNumber={formatNumber}
          />
        </div>
      </div>
    </>
  );
}
