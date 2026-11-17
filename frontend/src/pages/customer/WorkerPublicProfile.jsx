import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Scale } from 'lucide-react';
import { Alert, Button, EmptyState, useToast } from '../../components/ui';
import ProfileDisplay from '../../features/profile/ProfileDisplay';
import CompareTray from '../../features/customer/CompareTray';
import SaveButton from '../../features/customer/SaveButton';
import { PrintButton, ShareButton } from '../../features/customer/ShareButtons';
import { useCompare } from '../../features/customer/compareStore';
import { rememberWorker } from '../../features/customer/recentlyViewed';
import { useSavedWorkers } from '../../features/customer/useSavedWorkers';
import { useAuth } from '../../context/auth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from '../../features/customer/Customer.module.css';

// A worker's profile as a customer sees it: only the public fields the server sends (D-002),
// in the same layout as the worker's own "See what customers see" preview.
// Batch 4: save, compare, share and print; the visit is remembered on this device ("recently viewed").
export default function WorkerPublicProfile() {
  const { workerId } = useParams();
  const { t, te } = useT();
  const { user } = useAuth();
  const toast = useToast();
  const { categoryOccupation } = useTaxonomy();
  useDocumentTitle(t('titles.workerProfile'));
  const { data: worker, error, status, loading } = useApiQuery(`/workers/${encodeURIComponent(workerId)}`);
  const saved = useSavedWorkers();
  const compare = useCompare();

  useEffect(() => {
    if (worker && user?.role === 'customer') rememberWorker(user._id, worker);
  }, [worker, user]);

  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return (
      <EmptyState
        art="empty-search"
        headingLevel={1}
        title={t('publicProfile.notFoundTitle')}
        description={t('publicProfile.notFoundText')}
        action={<Button to="/find">{t('publicProfile.back')}</Button>}
      />
    );
  }
  if (error) return <Alert tone="danger">{te(error)}</Alert>;

  const name = worker.user?.name ?? t('common.worker');
  const inCompare = compare.has(worker.workerIdCode);
  const toggleCompare = () => {
    if (inCompare) compare.remove(worker.workerIdCode);
    else if (!compare.add({ id: worker.workerIdCode, name })) toast.show({ tone: 'info', title: t('customerx.compare.full') });
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profileBar} data-print="hide">
        <Button to="/find" variant="ghost" size="sm" icon={ArrowLeft} viewTransition>{t('publicProfile.back')}</Button>
        <div className={styles.profileActions}>
          <Button size="sm" icon={CalendarPlus} to={`/workers/${encodeURIComponent(worker.workerIdCode)}/request`}>{t('booking.request.button')}</Button>
          {saved.enabled && <SaveButton name={name} saved={saved.isSaved(worker.workerIdCode)} onToggle={() => saved.toggle(worker.workerIdCode)} />}
          <Button size="sm" variant="secondary" icon={Scale} aria-pressed={inCompare} onClick={toggleCompare}>{t(inCompare ? 'customerx.compare.remove' : 'customerx.compare.add', { name })}</Button>
          <ShareButton workerIdCode={worker.workerIdCode} name={name} trade={categoryOccupation(worker.category) || worker.occupation} />
          <PrintButton />
        </div>
      </div>
      <ProfileDisplay profile={worker} mode="public" />
      <div data-print="hide"><Alert tone="info" title={t('profile.contactTitle')}>{t('profile.contactNote')}</Alert></div>
      <CompareTray />
    </div>
  );
}
