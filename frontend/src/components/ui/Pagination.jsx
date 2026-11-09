import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import styles from './Pagination.module.css';

export default function Pagination({ page, pages, onChange, label = 'Pages' }) {
  if (pages <= 1) return null;
  return (
    <nav className={styles.nav} aria-label={label}>
      <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <span className={`${styles.status} tabular`} aria-live="polite">Page {page} of {pages}</span>
      <Button variant="secondary" size="sm" iconRight={ChevronRight} disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </nav>
  );
}
