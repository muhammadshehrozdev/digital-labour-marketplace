// The heart on a worker card or profile (feature 23). A toggle button: its name says what a press
// will do, aria-pressed says the state, and the heart fills with a small pop.
import { Heart } from 'lucide-react';
import { useT } from '../../i18n';
import styles from './Customer.module.css';

export default function SaveButton({ name, saved, onToggle, withLabel = false }) {
  const { t } = useT();
  return (
    <button
      type="button"
      className={[styles.heart, saved && styles.heartOn, withLabel && styles.heartWide].filter(Boolean).join(' ')}
      aria-pressed={saved}
      aria-label={t(saved ? 'customerx.unsave' : 'customerx.save', { name })}
      title={t(saved ? 'customerx.unsave' : 'customerx.save', { name })}
      onClick={onToggle}
    >
      <Heart size={20} strokeWidth={1.75} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
      {withLabel && <span aria-hidden="true">{t('customerx.titles.saved').split(' ')[0]}</span>}
    </button>
  );
}
