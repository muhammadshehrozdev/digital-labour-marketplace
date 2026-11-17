// The unread count next to "Notifications" in the customer's menu (Module 4). Customers get booking and
// review notifications; their way in is this menu link (the bell in the header stays a worker tool,
// as the Batch 4 tests require). Asked again on every page change; number AND words.
import { useLocation } from 'react-router-dom';
import { Badge } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useT } from '../../i18n';

export default function NotificationsCount() {
  const { t } = useT();
  const { pathname } = useLocation();
  const { data } = useApiQuery('/notifications/unread-count', undefined, { refreshKey: pathname, keepPrevious: true });
  const unread = data?.unread ?? 0;
  if (!unread) return null;
  return (
    <span data-testid="notifications-count" style={{ marginInlineStart: '0.35rem' }}>
      <Badge tone="danger"><span aria-hidden="true">{unread}</span><span className="visually-hidden">{t('workerx.notifications.unread', { count: unread })}</span></Badge>
    </span>
  );
}
