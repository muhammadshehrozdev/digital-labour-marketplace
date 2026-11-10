import styles from './ProgressRing.module.css';

export default function ProgressRing({ value, size = 96, label }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={styles.ring} role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className={styles.track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} className={styles.value} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} strokeLinecap="round" style={{ '--ring-full': c }} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={`${styles.number} tabular`}>{v}%</span>
    </div>
  );
}
