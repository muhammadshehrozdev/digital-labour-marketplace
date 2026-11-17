// Admin: one worker's full reputation breakdown (Module 4): the numbers, how every review was weighed
// (the four factors), hidden reviews, flags and bookings by state. Admin only (server checked).
import { Badge, DataTable, Skeleton, Alert } from '../../components/ui';
import Stars from '../reputation/Stars';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';
import styles from '../../pages/admin/Admin.module.css';

const n2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '');
const n4 = (x) => (Number.isFinite(x) ? x.toFixed(4) : '');

export default function ReputationBreakdown({ profileId }) {
  const { t, te, formatDate } = useT();
  const { data, error } = useApiQuery(profileId ? `/admin/workers/${profileId}/reputation` : null);
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!data) return <Skeleton variant="block" height={200} />;
  const { snapshot: s } = data;
  const columns = [
    { key: 'stars', header: t('adminm4.breakdown.stars'), render: (p) => <Stars value={p.stars} size={14} /> },
    { key: 'date', header: t('adminm4.breakdown.date'), sortable: true, sortValue: (p) => p.createdAt, render: (p) => <span className="tabular">{formatDate(p.createdAt)}</span>, sub: (p) => p.review?.customer?.name },
    { key: 'weight', header: t('adminm4.breakdown.weight'), sortable: true, sortValue: (p) => p.weight, render: (p) => <span className="tabular">{n2(p.weight)}</span> },
    { key: 'factors', header: t('adminm4.breakdown.factors'), render: (p) => <span className="tabular">{t('adminm4.breakdown.factorValues', { provenance: n2(p.factors.provenance), recency: n2(p.factors.recency), trust: n2(p.factors.reviewerTrust), pair: n2(p.factors.pairFactor) })}</span> },
    { key: 'reasons', header: t('adminm4.breakdown.reasons'), render: (p) => p.reasons.map((r) => t(`reputation.reason.${r}`)).join(' ') },
  ];
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }} data-testid="reputation-breakdown">
      <dl className={styles.details}>
        <div><dt>{t('adminm4.breakdown.expected')}</dt><dd className="tabular">{n4(s.score.expected)}</dd></div>
        <div><dt>{t('adminm4.breakdown.cautious')}</dt><dd className="tabular">{n4(s.score.cautious)}</dd></div>
        <div><dt>{t('adminm4.breakdown.uncertainty')}</dt><dd className="tabular">{n4(s.score.uncertainty)} · {t(`reputation.depth.${s.public.reviewCount ? s.score.depth : 'none'}`)}</dd></div>
        <div><dt>{t('adminm4.breakdown.reliability')}</dt><dd className="tabular">{n4(s.reliability.expected)} · {t('adminm4.breakdown.reliabilityCounts', { completed: s.reliability.completed, early: s.reliability.workerCancelledEarly, late: s.reliability.workerCancelledLate, noShows: s.reliability.noShows })}</dd></div>
        <div><dt>{t('adminm4.breakdown.stored')}</dt><dd>{data.storedSnapshot ? t('adminm4.breakdown.storedAt', { date: formatDate(data.storedSnapshot.computedAt, { dateStyle: 'medium', timeStyle: 'short' }), version: data.storedSnapshot.engineVersion, hash: data.storedSnapshot.paramsHash }) : t('adminm4.breakdown.noSnapshot')}</dd></div>
        <div><dt>{t('adminm4.breakdown.bookings')}</dt><dd>{Object.entries(data.bookingsByStatus).map(([k, v]) => `${t(`booking.status.${k}`)}: ${v}`).join(' · ') || t('common.empty')}</dd></div>
      </dl>
      <p className={styles.method}>{t('adminm4.breakdown.method')}</p>
      <DataTable caption={t('adminm4.breakdown.perReview')} columns={columns} rows={data.perReview} rowKey={(p) => p.id} empty={<p className={styles.method}>{t('reputation.noReviews')}</p>} />
      {data.hiddenReviews.length > 0 && <p className={styles.method}>{t('adminm4.breakdown.hiddenCount', { count: data.hiddenReviews.length })}</p>}
      {data.flags.length > 0 && (
        <ul className={styles.activity}>
          {data.flags.map((f) => <li key={f._id}><Badge tone={f.status === 'open' ? 'warning' : 'neutral'}>{t(`adminm4.flags.type.${f.type}`)}</Badge> {t(`adminm4.flags.status.${f.status}`)} · {formatDate(f.createdAt)}</li>)}
        </ul>
      )}
    </div>
  );
}
