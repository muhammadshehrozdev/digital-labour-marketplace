// The bell in the header (Batch 4, feature 19): the number of unread notifications, asked once a
// minute while the page is visible, and a small list of the latest five with "Mark all as read".
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import API from '../../api';
import { SceneArt } from '../../components/illustrations';
import { Button } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { usePolling } from '../../hooks/usePolling';
import { useT } from '../../i18n';
import { useAuth } from '../../context/auth';
import NotificationItem from './NotificationItem';
import { NOTIFICATION_POLL_MS, notificationLink } from './notificationText';
import styles from './Notifications.module.css';
import { useStayInView } from '../../components/layout/useStayInView';

export default function NotificationBell() {
  const { t, formatNumber } = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const count = useApiQuery('/notifications/unread-count', undefined, { keepPrevious: true });
  usePolling(count.reload, NOTIFICATION_POLL_MS);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(null);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  useStayInView(panelRef, open);
  const panelId = `bell-${useId().replace(/:/g, '')}`;
  const unread = count.data?.unread ?? 0;

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications', { params: { limit: '5' } });
      setList(data.notifications);
    } catch {
      setList([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown') {
        if (e.key !== 'Escape') return;
        setOpen(false);
        buttonRef.current?.focus();
      } else if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const toggle = () => {
    if (!open) load();
    setOpen(!open);
  };
  const markAll = async () => {
    await API.post('/notifications/read-all').catch(() => {});
    setList((items) => items?.map((n) => ({ ...n, read: true })) ?? items);
    count.reload();
  };
  const openOne = async (n) => {
    setOpen(false);
    if (!n.read) await API.patch(`/notifications/${n._id}/read`).catch(() => {});
    count.reload();
    navigate(notificationLink(n, user?.role));
  };

  return (
    <div ref={wrapRef} className={styles.bellWrap}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.bell}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `${t('workerx.notifications.bell')}: ${t('workerx.notifications.unread', { count: unread })}` : t('workerx.notifications.bell')}
        onClick={toggle}
        data-testid="notification-bell"
      >
        <Bell size={20} strokeWidth={1.75} aria-hidden="true" className={unread ? styles.ring : undefined} />
        {unread > 0 && <span className={styles.count} aria-hidden="true">{unread > 9 ? '9+' : formatNumber(unread)}</span>}
      </button>
      {open && (
        <div id={panelId} ref={panelRef} className={styles.panel} role="region" aria-label={t('workerx.notifications.title')}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{t('workerx.notifications.title')}</h2>
            {list?.some((n) => !n.read) && <Button size="sm" variant="ghost" onClick={markAll}>{t('workerx.notifications.markAll')}</Button>}
          </div>
          {list === null && <p className={styles.text}>{t('common.loading')}</p>}
          {list && list.length === 0 && (
            <div className={styles.empty}>
              <SceneArt name="no-notifications" size={120} />
              <p className={styles.title}>{t('workerx.notifications.empty')}</p>
              <p className={styles.text}>{t('workerx.notifications.emptyText')}</p>
            </div>
          )}
          {list && list.length > 0 && (
            <ul className={styles.list}>
              {list.map((n) => (
                <li key={n._id}><button type="button" className={styles.itemButton} onClick={() => openOne(n)}><NotificationItem n={n} /></button></li>
              ))}
            </ul>
          )}
          <Link to="/notifications" className={styles.seeAll} onClick={() => setOpen(false)}>{t('workerx.notifications.seeAll')}</Link>
        </div>
      )}
    </div>
  );
}
