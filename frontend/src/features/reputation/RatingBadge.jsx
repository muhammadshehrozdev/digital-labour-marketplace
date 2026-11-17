// The short reputation line of a directory card and the compare page (Batch 6, section 4.9): a star,
// the average with the number of reviews and the number of jobs, or "New on this platform".
// Only public facts from the server; no rating value is ever written here.
import { Sparkles } from 'lucide-react';
import { useT } from '../../i18n';
import { depthOf, oneDecimal } from './reputationText';
import styles from './Reputation.module.css';

export default function RatingBadge({ reputation, className }) {
  const { t } = useT();
  const pub = reputation?.public;
  const jobs = pub?.completedJobs ?? 0;
  if (depthOf(pub) === 'none') {
    return (
      <p className={[styles.badge, className].filter(Boolean).join(' ')} data-testid="rating-badge">
        <Sparkles size={16} aria-hidden="true" />
        <span>{t('reputation.depth.none')}</span>
        {jobs > 0 && <span className={styles.badgeJobs}>· {t('reputation.jobs', { count: jobs })}</span>}
      </p>
    );
  }
  return (
    <p className={[styles.badge, className].filter(Boolean).join(' ')} data-testid="rating-badge">
      <span aria-hidden="true" className={styles.star}>★</span>
      <span className="visually-hidden">{t('reputation.averageSpoken', { average: oneDecimal(pub.ratingAverage), count: pub.reviewCount })}</span>
      <span aria-hidden="true"><strong className="tabular">{oneDecimal(pub.ratingAverage)}</strong> ({pub.reviewCount})</span>
      <span className={styles.badgeJobs}>· {t('reputation.jobs', { count: jobs })}</span>
    </p>
  );
}
