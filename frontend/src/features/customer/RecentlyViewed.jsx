// "Recently viewed" strip on the search page (feature 25). Read from this browser only.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { Avatar, Button } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import { clearRecent, readRecent } from './recentlyViewed';
import styles from './Customer.module.css';

export default function RecentlyViewed() {
  const { t } = useT();
  const { user } = useAuth();
  const { categoryOccupation } = useTaxonomy();
  const [items, setItems] = useState(() => readRecent(user?._id));
  if (items.length === 0) return null;
  return (
    <section className={styles.recent} aria-labelledby="recent-title">
      <div className={styles.recentHead}>
        <h2 id="recent-title" className={styles.recentTitle}><History size={18} aria-hidden="true" /> {t('customerx.recent.title')}</h2>
        <span className={styles.meta}>{t('customerx.recent.hint')}</span>
        <Button size="sm" variant="ghost" onClick={() => { clearRecent(user?._id); setItems([]); }}>{t('customerx.recent.clear')}</Button>
      </div>
      <ul className={styles.recentList}>
        {items.map((w) => (
          <li key={w.workerIdCode}>
            <Link to={`/workers/${w.workerIdCode}`} className={styles.recentItem} viewTransition>
              <Avatar name={w.name} size="sm" />
              <span className={styles.recentText}><strong dir="auto">{w.name}</strong><span>{categoryOccupation(w.category) || w.occupation}{w.city ? ` · ${w.city}` : ''}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
