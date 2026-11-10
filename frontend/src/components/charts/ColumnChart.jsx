// Stacked columns over time (admin overview: registrations per day). Own SVG, no library.
// data: [{ key, label, values: { [seriesId]: number } }] in time order
// series: [{ id, label, color }]  (color: a CSS value, e.g. var(--viz-1))
// The reader gets the numbers three ways: the tooltip (mouse, or arrow keys when the chart has
// focus), the legend, and the table under "Show the numbers as a table".
import { useId, useState } from 'react';
import { columnPath, labelIndexes, niceScale } from './chartMath';
import styles from './viz.module.css';

const W = 720;
const H = 240;
const PAD = { top: 12, right: 8, bottom: 28, left: 34 };
const MAX_BAR = 24;
const GAP = 2; // surface gap between stacked segments

export default function ColumnChart({ title, subtitle, data, series, emptyText, tableLabel, dateHeader, totalLabel, formatNumber = String }) {
  const [active, setActive] = useState(null);
  const tableId = useId();
  const total = (d) => series.reduce((sum, s) => sum + (d.values[s.id] ?? 0), 0);
  const grand = data.reduce((sum, d) => sum + total(d), 0);
  const scale = niceScale(Math.max(0, ...data.map(total)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = data.length ? plotW / data.length : plotW;
  const bar = Math.min(MAX_BAR, Math.max(3, band * 0.62));
  const y = (value) => PAD.top + plotH - (value / scale.max) * plotH;
  const labels = new Set(labelIndexes(data.length));
  const current = active === null ? null : data[active];

  const onKeyDown = (e) => {
    if (!data.length) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      setActive((i) => (i === null ? (step > 0 ? 0 : data.length - 1) : Math.min(data.length - 1, Math.max(0, i + step))));
    } else if (e.key === 'Escape') setActive(null);
  };

  return (
    <figure className={styles.viz}>
      <figcaption className={styles.head}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <ul className={styles.legend}>
          {series.map((s) => <li key={s.id}><span className={styles.swatch} style={{ background: s.color }} />{s.label}</li>)}
        </ul>
      </figcaption>

      {grand === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div
          className={styles.plot}
          tabIndex={0}
          role="group"
          aria-label={`${title}. ${totalLabel}: ${formatNumber(grand)}`}
          aria-describedby={tableId}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
          dir="ltr"
        >
          <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
            {scale.ticks.map((tick) => (
              <g key={tick}>
                <line className={styles.grid} x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
                <text className={styles.tick} x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">{formatNumber(tick)}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = PAD.left + i * band + (band - bar) / 2;
              let stacked = 0;
              const present = series.filter((s) => (d.values[s.id] ?? 0) > 0);
              return (
                <g key={d.key} className={[styles.column, active !== null && active !== i && styles.dim].filter(Boolean).join(' ')}>
                  <rect className={active === i ? styles.bandActive : styles.band} x={PAD.left + i * band} y={PAD.top} width={band} height={plotH} onPointerEnter={() => setActive(i)} onPointerDown={() => setActive(i)} />
                  {present.map((s, index) => {
                    const value = d.values[s.id];
                    const top = y(stacked + value);
                    const height = y(stacked) - top - (index > 0 ? GAP : 0);
                    stacked += value;
                    const isTop = index === present.length - 1;
                    // only the top segment has the rounded data end; lower ones are square
                    return isTop
                      ? <path key={s.id} d={columnPath(x, top, bar, Math.max(1, height), 4)} fill={s.color} pointerEvents="none" />
                      : <rect key={s.id} x={x} y={top} width={bar} height={Math.max(1, height)} fill={s.color} pointerEvents="none" />;
                  })}
                  {labels.has(i) && <text className={styles.tick} x={PAD.left + i * band + band / 2} y={H - 8} textAnchor="middle">{d.label}</text>}
                </g>
              );
            })}
          </svg>
          {current && (
            <div className={styles.tooltip} role="status" style={{ insetInlineStart: `${((PAD.left + active * band + band / 2) / W) * 100}%` }}>
              <p className={styles.tooltipDate}>{current.fullLabel ?? current.label}</p>
              {series.map((s) => (
                <p key={s.id} className={styles.tooltipRow}>
                  <span className={styles.key} style={{ background: s.color }} />
                  <strong>{formatNumber(current.values[s.id] ?? 0)}</strong> {s.label}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <details className={styles.table} id={tableId}>
        <summary>{tableLabel}</summary>
        <div className={styles.tableScroll}>
          <table>
            <thead>
              <tr><th scope="col">{dateHeader}</th>{series.map((s) => <th key={s.id} scope="col">{s.label}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key}><th scope="row">{d.fullLabel ?? d.label}</th>{series.map((s) => <td key={s.id}>{formatNumber(d.values[s.id] ?? 0)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
