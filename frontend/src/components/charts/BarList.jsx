// Ranked horizontal bars: one name, one thin bar and one figure per row, all in one colour
// (the bars are one series; the name beside each bar says what it is). Own SVG.
// rows: [{ id, label (text or a node such as a status chip), value }]
import styles from './viz.module.css';

export default function BarList({ title, subtitle, rows, emptyText, sorted = false, formatNumber = String }) {
  const list = sorted ? [...rows].sort((a, b) => b.value - a.value) : rows;
  const max = Math.max(0, ...list.map((r) => r.value));
  return (
    <figure className={styles.viz}>
      <figcaption className={styles.head}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </figcaption>
      {max === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.rows}>
          {list.map((row) => (
            <li key={row.id} className={styles.row}>
              <span className={styles.rowName}>{row.label}</span>
              <span className={styles.rowValue}>{formatNumber(row.value)}</span>
              <span className={styles.rowBar} aria-hidden="true">
                <svg viewBox="0 0 100 10" preserveAspectRatio="none" focusable="false">
                  {/* square at the baseline, rounded at the data end */}
                  {row.value > 0 && <rect x="0" y="0" height="10" width={Math.max(1.5, (row.value / max) * 100)} rx="3" />}
                </svg>
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
