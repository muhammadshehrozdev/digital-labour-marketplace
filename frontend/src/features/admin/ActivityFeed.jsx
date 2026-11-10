// Live activity feed (Batch 4, feature 33): the latest audit entries, asked again every 30 seconds
// while the page is visible. Read-only; entries never contain a CNIC.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { usePolling } from '../../hooks/usePolling';
import { Skeleton } from '../../components/ui';
import { useT } from '../../i18n';
import { actionKey } from './adminHelpers';
import styles from './AdminFeatures.module.css';

export const FEED_INTERVAL_MS = 30000;

export default function ActivityFeed({ limit = 8 }) {
  const { t, formatDate } = useT();
  const { data, reload } = useApiQuery('/admin/audit', { limit: String(limit) });
  usePolling(reload, FEED_INTERVAL_MS);
  const label = (action) => {
    const text = t(actionKey(action));
    return text === actionKey(action) ? action : text; // an action without a translation shows its code
  };
  return (
    <section className={styles.feed} aria-labelledby="feed-title">
      <div className={styles.feedHead}>
        <h2 id="feed-title" className={styles.cardTitle}>{t('adminx.feed.title')}</h2>
        <span className={styles.live}><span className={styles.pulse} aria-hidden="true" />{t('adminx.feed.live')}</span>
      </div>
      {!data && <Skeleton variant="block" height={220} />}
      {data && data.entries.length === 0 && <p className={styles.muted}>{t('adminx.feed.empty')}</p>}
      {data && data.entries.length > 0 && (
        <ol className={styles.feedList}>
          {data.entries.map((entry) => (
            <li key={entry.seq}>
              <span className={styles.feedDot} aria-hidden="true" />
              <div>
                <p className={styles.feedAction}>{label(entry.action)}</p>
                <p className={styles.muted}>
                  {entry.actor?.name ? `${entry.actor.name} · ` : ''}{t(`roles.${entry.actorRole}`) === `roles.${entry.actorRole}` ? entry.actorRole : t(`roles.${entry.actorRole}`)}
                  {' · '}<time dateTime={entry.createdAt}>{formatDate(entry.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Link to="/admin/audit" className={styles.feedLink}>{t('adminx.feed.all')} <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}
