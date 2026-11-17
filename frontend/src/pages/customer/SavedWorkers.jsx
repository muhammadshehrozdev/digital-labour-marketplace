// A customer's saved workers (Batch 4, feature 23). The same cards as the search page.
import { Button, Alert, EmptyState, PageHeader, Skeleton } from '../../components/ui';
import CompareTray from '../../features/customer/CompareTray';
import WorkerCard from '../../features/customer/WorkerCard';
import { MAX_COMPARE, useCompare } from '../../features/customer/compareStore';
import { useSavedWorkers } from '../../features/customer/useSavedWorkers';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/customer/Customer.module.css';

export default function SavedWorkers() {
  const { t, te } = useT();
  useDocumentTitle(t('customerx.titles.saved'));
  const { data, error, reload } = useApiQuery('/saved');
  const saved = useSavedWorkers();
  const compare = useCompare();
  // A worker removed with the heart leaves the page at once; "Undo" brings it back.
  const visible = (data?.workers ?? []).filter((w) => saved.isSaved(w.workerIdCode));

  return (
    <div className={styles.page}>
      <PageHeader title={t('customerx.saved.title')} description={t('customerx.saved.lead')} actions={<Button to="/find" variant="secondary">{t('customerx.saved.find')}</Button>} />
      {error && <Alert tone="danger" action={<Button size="sm" variant="secondary" onClick={reload}>{t('common.tryAgain')}</Button>}>{te(error)}</Alert>}
      {!data && !error && <div className={styles.cards} aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} variant="block" height={232} />)}</div>}
      {data && visible.length === 0 && (
        <EmptyState art="saved" headingLevel={2} title={t('customerx.saved.emptyTitle')} description={t('customerx.saved.emptyText')} action={<Button to="/find">{t('customerx.saved.find')}</Button>} />
      )}
      {data && visible.length > 0 && (
        <>
          <p className={styles.resultsTitle} aria-live="polite">{t('customerx.saved.count', { count: visible.length })}</p>
          <ul className={styles.cards}>
            {visible.map((w, i) => (
              <WorkerCard
                key={w.workerIdCode}
                worker={w}
                index={i}
                saved
                showRequest
                onToggleSave={() => saved.toggle(w.workerIdCode)}
                compare={compare.has(w.workerIdCode)}
                compareDisabled={compare.list.length >= MAX_COMPARE}
                onToggleCompare={() => (compare.has(w.workerIdCode) ? compare.remove(w.workerIdCode) : compare.add({ id: w.workerIdCode, name: w.user?.name ?? t('common.worker') }))}
              />
            ))}
          </ul>
        </>
      )}
      <CompareTray />
    </div>
  );
}
