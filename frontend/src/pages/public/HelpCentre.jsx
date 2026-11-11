// Help centre (Batch 4, feature 55): short how-to guides in the website language, for everyone
// (a page outside any login). A worker sees the worker guides first, a customer the customer ones.
import { useState } from 'react';
import { Search } from 'lucide-react';
import { SceneArt } from '../../components/illustrations';
import { PageHeader, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useDocumentTitle, useT } from '../../i18n';
import styles from './HelpCentre.module.css';

const GROUPS = [
  { role: 'worker', guides: [['profile', 'step-work'], ['proof', 'step-proof'], ['identity', 'step-about']] },
  { role: 'customer', guides: [['find', 'empty-search'], ['badges', 'compare']] },
  { role: 'everyone', guides: [['display', 'all-done'], ['install', 'offline']] },
];

export default function HelpCentre() {
  const { t } = useT();
  const { user } = useAuth();
  useDocumentTitle(t('appx.help.title'));
  const [query, setQuery] = useState('');
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (id) => {
    const text = `${t(`appx.help.guides.${id}.title`)} ${t(`appx.help.guides.${id}.steps`)}`.toLowerCase();
    return words.every((w) => text.includes(w));
  };
  // the person's own guides first
  const groups = [...GROUPS].sort((a, b) => (b.role === user?.role) - (a.role === user?.role));
  const shown = groups.map((g) => ({ ...g, guides: g.guides.filter(([id]) => matches(id)) })).filter((g) => g.guides.length);

  return (
    <div className={styles.page}>
      <PageHeader title={t('appx.help.title')} description={t('appx.help.lead')} />
      <div role="search" className={styles.search}>
        <TextField label={t('appx.help.search')} type="search" icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {shown.length === 0 && <p className={styles.none} role="status">{t('appx.help.none')}</p>}
      {shown.map((group) => (
        <section key={group.role} aria-labelledby={`help-${group.role}`} className={styles.group}>
          <h2 id={`help-${group.role}`} className={styles.groupTitle}>{t(`appx.help.forRole.${group.role}`)}</h2>
          <div className={styles.guides}>
            {group.guides.map(([id, art]) => (
              <article key={id} className={styles.guide} data-art-hover>
                <SceneArt name={art} size={120} />
                <h3 className={styles.guideTitle}>{t(`appx.help.guides.${id}.title`)}</h3>
                <ol className={styles.steps}>
                  {t(`appx.help.guides.${id}.steps`).split('|').map((step) => <li key={step}>{step}</li>)}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
