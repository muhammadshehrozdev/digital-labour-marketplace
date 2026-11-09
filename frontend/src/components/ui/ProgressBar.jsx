import styles from './ProgressBar.module.css';

export default function ProgressBar({ value, label }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={styles.wrap}>
      <div className={styles.top}><span>{label}</span><span className="tabular">{v}%</span></div>
      <div className={styles.track} role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.bar} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
