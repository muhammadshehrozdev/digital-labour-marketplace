// Compare two or three workers side by side (Batch 4, feature 24). The workers come from the
// address (?ids=A,B,C), so a comparison can be bookmarked. Public fields only; a real table, so
// screen readers can move by row and column.
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, X } from 'lucide-react';
import { Alert, Avatar, Badge, Button, EmptyState, PageHeader, Skeleton, StatusChip } from '../../components/ui';
import { compareStore } from '../../features/customer/compareStore';
import { PrintButton } from '../../features/customer/ShareButtons';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/customer/Customer.module.css';

const ID = /^DLM-\d{4}-\d{4,6}$/;

export default function CompareWorkers() {
  const { t, te, formatNumber } = useT();
  useDocumentTitle(t('customerx.titles.compare'));
  const { categoryLabel, categoryOccupation, skillName } = useTaxonomy();
  const [params, setParams] = useSearchParams();
  const ids = [...new Set((params.get('ids') ?? '').split(',').map((s) => s.trim()).filter((s) => ID.test(s)))].slice(0, 3);
  const enough = ids.length >= 2;
  const { data, error, loading } = useApiQuery(enough ? '/workers/compare' : null, { ids: ids.join(',') });

  const removeColumn = (id) => {
    compareStore.remove(id);
    setParams({ ids: ids.filter((x) => x !== id).join(',') }, { replace: true });
  };
  const rate = (n) => (n ? <span className="tabular" dir="ltr">{t('common.rupees', { amount: formatNumber(n) })}</span> : t('common.empty'));
  const skillChips = (list) => (list.length
    ? <ul className={styles.skills}>{list.map((s) => <li key={s.skillId}><Badge tone={s.evidenceSummary?.status === 'verified' ? 'success' : 'neutral'} icon={s.evidenceSummary?.status === 'verified' ? BadgeCheck : undefined}>{skillName(s)}</Badge></li>)}</ul>
    : <span className={styles.meta}>{t('customerx.compare.none')}</span>);

  const workers = data?.workers ?? [];
  const rows = [
    ['trade', (w) => <>{categoryOccupation(w.category) || w.occupation}<br /><span className={styles.meta}>{categoryLabel(w.category)}</span></>],
    ['city', (w) => w.city || t('common.empty')],
    ['experience', (w) => t('common.years', { count: w.experienceYears ?? 0 })],
    ['perHour', (w) => rate(w.hourlyRate)],
    ['perDay', (w) => rate(w.dailyRate)],
    ['availability', (w) => (w.availability ? t(`status.availability.${w.availability}`) : t('common.empty'))],
    ['identity', (w) => <StatusChip kind="identity" status={w.verificationStatus} />],
    ['verifiedSkills', (w) => skillChips((w.skills ?? []).filter((s) => s.evidenceSummary?.status === 'verified'))],
    ['otherSkills', (w) => skillChips((w.skills ?? []).filter((s) => s.evidenceSummary?.status !== 'verified'))],
    ['languages', (w) => (w.languages ?? []).join(', ') || t('common.empty')],
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('customerx.compare.title')}
        description={t('customerx.compare.lead')}
        actions={<><Button to="/find" variant="secondary" icon={ArrowLeft}>{t('publicProfile.back')}</Button>{workers.length > 0 && <PrintButton size="md" />}</>}
      />
      {!enough && <EmptyState art="compare" headingLevel={2} title={t('customerx.compare.needTwo')} description={t('customerx.compare.needTwoText')} action={<Button to="/find">{t('customerx.saved.find')}</Button>} />}
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {loading && <Skeleton variant="block" height={360} />}
      {data && data.missing.length > 0 && <Alert tone="warning">{t('customerx.compare.missing')}</Alert>}
      {data && workers.length > 0 && (
        <div className={styles.compareWrap}>
          <table className={styles.compareTable}>
            <caption className="visually-hidden">{t('customerx.compare.caption')}</caption>
            <thead>
              <tr>
                <td />
                {workers.map((w) => {
                  const name = w.user?.name ?? t('common.worker');
                  return (
                    <th key={w.workerIdCode} scope="col">
                      <div className={styles.compareHead}>
                        <Avatar name={name} size="lg" />
                        <span className={styles.name} dir="auto">{name}</span>
                        <span className={`${styles.meta} tabular`} dir="ltr">{w.workerIdCode}</span>
                        <span className={styles.compareActions} data-print="hide">
                          <Link to={`/workers/${w.workerIdCode}`}>{t('customerx.compare.viewProfile')}<span className="visually-hidden">: {name}</span></Link>
                          <button type="button" className={styles.trayRemove} aria-label={t('customerx.compare.removeColumn', { name })} onClick={() => removeColumn(w.workerIdCode)}><X size={14} aria-hidden="true" /></button>
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(([key, cell]) => (
                <tr key={key}>
                  <th scope="row">{t(`customerx.compare.rows.${key}`)}</th>
                  {workers.map((w) => <td key={w.workerIdCode}>{cell(w)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
