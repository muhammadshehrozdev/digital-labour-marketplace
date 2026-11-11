// All notifications of the logged-in worker (Batch 4, feature 19), newest first.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck } from 'lucide-react';
import API from '../../api';
import { Alert, Button, EmptyState, PageHeader, Pagination, Skeleton } from '../../components/ui';
import NotificationItem from '../../features/notifications/NotificationItem';
import { notificationLink } from '../../features/notifications/notificationText';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useDocumentTitle, useT } from '../../i18n';
import styles from '../../features/notifications/Notifications.module.css';

const PAGE_SIZE = 20;

export default function Notifications() {
  const { t, te } = useT();
  useDocumentTitle(t('workerx.notifications.title'));
  const [page, setPage] = useState(1);
  const { data, error, reload } = useApiQuery('/notifications', { page: String(page), limit: String(PAGE_SIZE) });
  const markAll = async () => {
    await API.post('/notifications/read-all').catch(() => {});
    reload();
  };
  return (
    <div>
      <PageHeader
        title={t('workerx.notifications.title')}
        description={t('workerx.notifications.lead')}
        actions={data?.unread > 0 ? <Button variant="secondary" icon={CheckCheck} onClick={markAll}>{t('workerx.notifications.markAll')}</Button> : null}
      />
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={240} />}
      {data && data.notifications.length === 0 && <EmptyState art="no-notifications" title={t('workerx.notifications.empty')} description={t('workerx.notifications.emptyText')} />}
      {data && data.notifications.length > 0 && (
        <>
          <ul className={styles.pageList}>
            {data.notifications.map((n) => (
              <li key={n._id}>
                <Link to={notificationLink(n)} className={styles.pageItem} onClick={() => !n.read && API.patch(`/notifications/${n._id}/read`).catch(() => {})}>
                  <NotificationItem n={n} />
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} onChange={setPage} />
        </>
      )}
    </div>
  );
}
