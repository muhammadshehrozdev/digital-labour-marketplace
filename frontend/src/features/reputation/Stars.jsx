// A row of stars for a whole-number rating (a stored review), with the number in words for screen readers.
import { Star } from 'lucide-react';
import { useT } from '../../i18n';
import styles from './Reputation.module.css';

export default function Stars({ value, size = 18 }) {
  const { t } = useT();
  return (
    <span className={styles.stars} role="img" aria-label={t('reputation.starsLabel', { count: value })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} strokeWidth={1.75} aria-hidden="true" className={n <= value ? styles.starOn : styles.starOff} />
      ))}
    </span>
  );
}
