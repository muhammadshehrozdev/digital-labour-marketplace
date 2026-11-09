import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import { useT } from '../../i18n/context';
import styles from './Pagination.module.css';

export default function Pagination({ page, pages, onChange, label }) {
  const { t } = useT();
  if (pages <= 1) return null;
  return (
    <nav className={styles.nav} aria-label={label ?? t('ui.pagination.label')}>
      <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('common.previous')}</Button>
      <span className={`${styles.status} tabular`} aria-live="polite">{t('ui.pagination.status', { page, pages })}</span>
      <Button variant="secondary" size="sm" iconRight={ChevronRight} disabled={page >= pages} onClick={() => onChange(page + 1)}>{t('common.next')}</Button>
    </nav>
  );
}
