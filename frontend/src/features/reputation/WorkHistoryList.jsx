// Verified work history (Batch 6, section 4.10): completed bookings, labelled "Done through this
// platform" and drawn differently from the worker's own (self-declared) work history. Skill picture,
// month and year, city, and the stars if the customer reviewed it. No customer details.
import { ShieldCheck } from 'lucide-react';
import { TradeArt } from '../../components/illustrations';
import { Alert, Skeleton } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { useT } from '../../i18n';
import Stars from './Stars';
import styles from './Reputation.module.css';

export default function WorkHistoryList({ workerIdCode, headingLevel = 2 }) {
  const { t, te, formatDate } = useT();
  const { skillName } = useTaxonomy();
  const { data, error, status } = useApiQuery(workerIdCode ? `/workers/${encodeURIComponent(workerIdCode)}/work-history` : null);
  const H = `h${headingLevel}`;
  if (status === 404) return null; // unknown worker: the page itself says so
  return (
    <section className={[styles.panel, styles.verified].join(' ')} aria-labelledby="verified-history-title" data-testid="verified-history">
      <H id="verified-history-title" className={styles.panelTitle}>{t('reputation.historyTitle')}</H>
      <p className={styles.verifiedLabel}><ShieldCheck size={18} aria-hidden="true" /> {t('reputation.historyLabel')}</p>
      {error && <Alert tone="danger">{te(error)}</Alert>}
      {!data && !error && <Skeleton variant="block" height={80} />}
      {data && data.entries.length === 0 && <p className={styles.muted}>{t('reputation.historyEmpty')}</p>}
      {data && data.entries.length > 0 && (
        <ul className={styles.history}>
          {data.entries.map((e) => (
            <li key={e._id} className={styles.historyItem}>
              <TradeArt category={e.category} size={40} />
              <span className={styles.historyText}>
                <strong>{skillName({ skillId: e.skillId, name: e.skillName })}</strong>
                <span className={styles.muted}>{formatDate(`${e.month}-15T00:00:00Z`, { month: 'long', year: 'numeric' })} · <span dir="auto">{e.city}</span></span>
              </span>
              {e.rating ? <Stars value={e.rating} size={16} /> : <span className={styles.muted}>{t('reputation.notRated')}</span>}
            </li>
          ))}
        </ul>
      )}
      {data && data.total > data.entries.length && <p className={styles.muted}>{t('reputation.historyMore', { count: data.total - data.entries.length })}</p>}
    </section>
  );
}
