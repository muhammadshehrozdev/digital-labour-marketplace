// Help centre (Batch 4, feature 55): short how-to guides in the website language, for everyone
// (a page outside any login). A worker sees the worker guides first, a customer the customer ones.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope } from 'lucide-react';
import OptionListen from '../../features/assist/OptionListen';
import { SceneArt } from '../../components/illustrations';
import { PageHeader, TextField } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { useDocumentTitle, useT } from '../../i18n';
import { useApiQuery } from '../../hooks/useApiQuery';
import { guideLine } from '../../features/reputation/reputationText';
import styles from './HelpCentre.module.css';

const GROUPS = [
  { role: 'worker', guides: [['profile', 'step-work'], ['proof', 'step-proof'], ['identity', 'step-about'], ['jobs', 'all-done', 'booking.guides'], ['reputation', 'step-done', 'booking.guides']] },
  { role: 'customer', guides: [['find', 'empty-search'], ['badges', 'compare'], ['request', 'saved', 'booking.guides']] },
  // Batch 5: listen, speak, see (their texts are in help.centre.guides, the Batch 5 part of the dictionaries).
  // Module 4 guides (worker: jobs, reputation; customer: request) are in booking.guides.
  { role: 'everyone', guides: [['sound', 'all-done', 'help.centre.guides'], ['voiceTyping', 'step-skills', 'help.centre.guides'], ['display', 'all-done'], ['install', 'offline']] },
];
const DEFAULT_BASE = 'appx.help.guides';

export default function HelpCentre() {
  const { t } = useT();
  const { user } = useAuth();
  useDocumentTitle(t('appx.help.title'));
  const [query, setQuery] = useState('');
  // Batch 6B: the reputation guide is written from the live engine's rules (GET /api/meta/reputation-rules),
  // so it always says what the code does; the Batch 6 text is kept for rep-1 and while the rules load.
  const rules = useApiQuery('/meta/reputation-rules').data;
  const stepsOf = (id, base, tt = t) => (id === 'reputation' && rules?.engineVersion === 'rep-2'
    ? rules.items.map((item) => guideLine(tt, item))
    : tt(`${base}.${id}.steps`).split('|'));
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (id, base = DEFAULT_BASE) => {
    const text = `${t(`${base}.${id}.title`)} ${stepsOf(id, base).join(' ')}`.toLowerCase();
    return words.every((w) => text.includes(w));
  };
  // the person's own guides first
  const groups = [...GROUPS].sort((a, b) => (b.role === user?.role) - (a.role === user?.role));
  const shown = groups.map((g) => ({ ...g, guides: g.guides.filter(([id, , base]) => matches(id, base)) })).filter((g) => g.guides.length);

  return (
    <div className={styles.page}>
      <PageHeader title={t('appx.help.title')} description={t('appx.help.lead')} />
      <div role="search" className={styles.search}>
        <TextField label={t('appx.help.search')} type="search" icon={Search} value={query} onChange={(e) => setQuery(e.target.value)} assist="helpCentre.search" />
      </div>
      {shown.length === 0 && <p className={styles.none} role="status">{t('appx.help.none')}</p>}
      {shown.map((group) => (
        <section key={group.role} aria-labelledby={`help-${group.role}`} className={styles.group}>
          <h2 id={`help-${group.role}`} className={styles.groupTitle}>{t(`appx.help.forRole.${group.role}`)}</h2>
          <div className={styles.guides}>
            {group.guides.map(([id, art, base = DEFAULT_BASE]) => (
              <article key={id} className={styles.guide} data-art-hover>
                <SceneArt name={art} size={120} />
                <h3 className={styles.guideTitle}>{t(`${base}.${id}.title`)}</h3>
                <ol className={styles.steps}>
                  {stepsOf(id, base).map((step) => <li key={step}>{step}</li>)}
                </ol>
                {id === 'voiceTyping' && (
                  <>
                    <p className={styles.notice}>{t('voice.notice')}</p>
                    <Link to="/voice-check" className={styles.checkLink}><Stethoscope size={18} aria-hidden="true" /> {t('assist.voiceCheckLink')}</Link>
                  </>
                )}
                {/* Batch 5: every guide can be heard (in the spoken language) */}
                <OptionListen
                  helpKey="help.centre.read"
                  name={t(`${base}.${id}.title`)}
                  params={{
                    title: (lang, spokenT) => spokenT(`${base}.${id}.title`),
                    steps: (lang, spokenT) => stepsOf(id, base, spokenT).join(' '),
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
