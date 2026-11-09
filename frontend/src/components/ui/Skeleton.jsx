import styles from './Skeleton.module.css';

// Grey placeholder shapes while data loads. Hidden from screen readers; wrap a loading
// area in <div aria-busy="true"> with a visually hidden "Loading…" text.
export default function Skeleton({ variant = 'text', width, height, lines = 1 }) {
  if (variant === 'text' && lines > 1) {
    return (
      <span className={styles.lines} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={[styles.skeleton, styles.text].join(' ')} style={{ width: i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    );
  }
  return <span className={[styles.skeleton, styles[variant]].join(' ')} style={{ width, height }} aria-hidden="true" />;
}
