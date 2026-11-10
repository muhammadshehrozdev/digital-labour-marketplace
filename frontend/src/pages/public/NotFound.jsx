// "Page not found" (Batch 4, feature 49): a friendly drawing, a search box over the places this
// person can go (by role), and direct links. No dead end.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { SceneArt } from '../../components/illustrations';
import { Button, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { destinationsFor, searchDestinations } from '../../features/navigation/destinations';
import { useDocumentTitle, useT } from '../../i18n';
import { homePathFor } from '../../utils/roles';
import styles from './NotFound.module.css';

export default function NotFound() {
  const { t } = useT();
  const { user } = useAuth();
  useDocumentTitle(t('titles.notFound'));
  const [query, setQuery] = useState('');
  const places = searchDestinations(destinationsFor(user?.role), query, t).slice(0, 6);

  return (
    <div className={styles.page}>
      <SceneArt name="not-found" size={260} float play />
      <p className={styles.code} aria-hidden="true">404</p>
      <h1>{t('notFound.title')}</h1>
      <p className={styles.text}>{t('notFound.text')}</p>
      <div className={styles.search} role="search">
        <TextField label={t('notFound.searchLabel')} type="search" icon={Search} placeholder={t('notFound.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <ul className={styles.places} aria-label={t('notFound.places')} aria-live="polite">
          {places.map(({ id, to, label, icon: Icon }) => (
            <li key={id}>
              <Link to={to} className={styles.place}>
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{t(label)}</span>
                <ArrowRight size={16} aria-hidden="true" className={styles.arrow} />
              </Link>
            </li>
          ))}
          {places.length === 0 && <li className={styles.none}>{t('notFound.noPlace')}</li>}
        </ul>
      </div>
      <Button to={user ? homePathFor(user.role) : '/'} variant="secondary">{t('notFound.home')}</Button>
    </div>
  );
}
