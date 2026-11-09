import { useParams } from 'react-router-dom';
import { ArrowLeft, UserX } from 'lucide-react';
import { Alert, Button, EmptyState } from '../../components/ui';
import ProfileDisplay from '../../features/profile/ProfileDisplay';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from './Customer.module.css';

// A worker's profile as a customer sees it: only the public fields the server sends (D-002),
// in the same layout as the worker's own "See what customers see" preview.
export default function WorkerPublicProfile() {
  const { workerId } = useParams();
  const { t, te } = useT();
  useDocumentTitle(t('titles.workerProfile'));
  const { data: worker, error, status, loading } = useApiQuery(`/workers/${encodeURIComponent(workerId)}`);

  if (loading) return <PageLoading />;
  if (status === 404 || status === 400) {
    return (
      <EmptyState
        icon={UserX}
        headingLevel={1}
        title={t('publicProfile.notFoundTitle')}
        description={t('publicProfile.notFoundText')}
        action={<Button to="/find">{t('publicProfile.back')}</Button>}
      />
    );
  }
  if (error) return <Alert tone="danger">{te(error)}</Alert>;

  return (
    <div className={styles.profile}>
      <Button to="/find" variant="ghost" size="sm" icon={ArrowLeft}>{t('publicProfile.back')}</Button>
      <Alert tone="info" title={t('profile.contactTitle')}>{t('profile.contactNote')}</Alert>
      <ProfileDisplay profile={worker} mode="public" />
    </div>
  );
}
