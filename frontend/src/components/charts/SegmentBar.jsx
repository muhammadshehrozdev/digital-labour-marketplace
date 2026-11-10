// A thin segmented bar for one whole split into ordered parts (how long items have waited), with
// the figures listed beside it: the list carries the numbers, the bar shows the proportion.
// segments: [{ id, label, value }] in order (shortest wait first). One hue, light to dark.
import styles from './viz.module.css';

const RAMP = ['var(--viz-ord-1)', 'var(--viz-ord-2)', 'var(--viz-ord-3)', 'var(--viz-ord-4)'];

export default function SegmentBar({ label, segments, formatNumber = String }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  return (
    <div className={styles.viz}>
      <div className={styles.segments} role="img" aria-label={`${label}: ${segments.map((s) => `${s.label} ${formatNumber(s.value)}`).join(', ')}`}>
        {segments.map((s, i) => (s.value > 0 ? <span key={s.id} style={{ flexGrow: s.value, background: RAMP[i % RAMP.length] }} /> : null))}
      </div>
      <ul className={styles.segmentList}>
        {segments.map((s, i) => (
          <li key={s.id}><span className={styles.swatch} style={{ background: RAMP[i % RAMP.length] }} />{s.label}<strong>{formatNumber(s.value)}</strong></li>
        ))}
      </ul>
    </div>
  );
}
