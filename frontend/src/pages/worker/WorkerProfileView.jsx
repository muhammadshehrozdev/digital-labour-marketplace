import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Alert, Button, Switch } from '../../components/ui';
import ProfileDisplay from '../../features/profile/ProfileDisplay';
import { useMyFullProfile } from '../../hooks/useMyFullProfile';
import { useDocumentTitle, useT } from '../../i18n';
import { PageLoading } from '../../routes/guards';
import styles from './Worker.module.css';

// /worker/profile: the worker's complete profile, read only (D-020). "See what customers see"
// shows publicView: the exact data the server sends to customers (same query and field list).
export default function WorkerProfileView() {
  const { t, te } = useT();
  useDocumentTitle(t('titles.profile'));
  const { data, error } = useMyFullProfile();
  const [publicMode, setPublicMode] = useState(false);
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!data) return <PageLoading />;

  const actions = (
    <>
      <Switch label={t('profile.viewToggle')} hint={t('profile.viewToggleHint')} checked={publicMode} onChange={setPublicMode} />
      <Button to="/worker/profile/edit" icon={Pencil}>{t('profile.edit')}</Button>
    </>
  );

  return (
    <div className={styles.profilePage}>
      {publicMode && (
        <Alert tone="info" title={t('profile.viewToggle')}>
          {t('profile.publicBanner')}
          {!data.listedInDirectory && <> {t('profile.notListed')}</>}
        </Alert>
      )}
      {publicMode ? (
        data.publicView ? (
          <ProfileDisplay key="public" profile={data.publicView} mode="public" actions={actions} />
        ) : (
          <Alert tone="info">{t('profile.notListed')}</Alert>
        )
      ) : (
        <ProfileDisplay key="owner" profile={data.profile} evidence={data.evidence} mode="owner" actions={actions} />
      )}
    </div>
  );
}
