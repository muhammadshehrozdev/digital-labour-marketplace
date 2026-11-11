import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import styles from './DataTable.module.css';

// columns: [{ key, header, render?(row), sortValue?(row), sortable?, align?, minWidth?, sub?(row) }]
//   minWidth: a CSS length, so names do not break into one word per line;
//   sub: a second, quieter line under the value (outside the row button, so its name stays short).
// Below 768 px every row becomes a stacked card with the column names as labels.
// When the table is wider than its box, the box scrolls sideways and becomes a named, focusable region,
// so keyboard users can scroll it too (axe: scrollable-region-focusable).
export default function DataTable({ columns, rows, rowKey, caption, empty, onRowClick, rowLabel }) {
  const [sort, setSort] = useState(null); // { key, dir }
  const wrapRef = useRef(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    // the observer reports once at the start and again whenever the box or the table changes size
    const observer = new ResizeObserver(() => setScrolls(el.scrollWidth > el.clientWidth + 1));
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, []);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const value = col.sortValue ?? ((r) => r[col.key]);
    return [...rows].sort((a, b) => {
      const x = value(a) ?? '';
      const y = value(b) ?? '';
      const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? result : -result;
    });
  }, [rows, sort, columns]);

  const toggle = (key) => setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  if (!rows.length) return empty ?? null;
  return (
    <div ref={wrapRef} className={styles.wrap} {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': caption } : {})}>
      <table className={styles.table}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className={c.align === 'end' ? styles.end : undefined} style={c.minWidth ? { minInlineSize: c.minWidth } : undefined}>
                  {c.sortable ? (
                    <button type="button" className={styles.sortButton} onClick={() => toggle(c.key)}>
                      {c.header}
                      <Icon size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)} className={onRowClick ? styles.clickable : undefined}>
              {columns.map((c, i) => (
                <td key={c.key} data-label={c.header} className={c.align === 'end' ? styles.end : undefined} style={c.minWidth ? { minInlineSize: c.minWidth } : undefined}>
                  {i === 0 && onRowClick ? (
                    <button type="button" className={styles.rowButton} onClick={() => onRowClick(row)} aria-label={rowLabel ? rowLabel(row) : undefined}>
                      {c.render ? c.render(row) : row[c.key]}
                    </button>
                  ) : c.render ? (
                    c.render(row)
                  ) : (
                    row[c.key]
                  )}
                  {c.sub && c.sub(row) != null && <span className={styles.sub}>{c.sub(row)}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
