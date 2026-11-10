// Hero typewriter (Batch 3, Part 4.5): types a line, holds, erases, types the next one, loops.
// - Text is split into grapheme clusters (Intl.Segmenter), so Urdu letters never break apart.
// - The moving text is aria-hidden; screen readers get `label` (the headline in the current
//   language). With reduced motion only the static label is shown.
// lines: [{ text, lang, dir }]. Timing: type 45 ms per character, erase 25 ms, hold 2.2 s.
import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { ERASE_MS, graphemes, HOLD_MS, TYPE_MS } from './typewriterText';
import styles from './Typewriter.module.css';

export default function Typewriter({ lines, label, className }) {
  const reduced = useReducedMotion();
  const split = useMemo(() => lines.map((l) => ({ ...l, parts: graphemes(l.text, l.lang) })), [lines]);
  const [state, setState] = useState({ line: 0, count: 0, phase: 'typing' });

  useEffect(() => {
    if (reduced) return undefined;
    const current = split[state.line];
    let delay = TYPE_MS;
    let next;
    if (state.phase === 'typing') {
      if (state.count < current.parts.length) next = { ...state, count: state.count + 1 };
      else {
        next = { ...state, phase: 'erasing' };
        delay = HOLD_MS;
      }
    } else if (state.count > 0) {
      next = { ...state, count: state.count - 1 };
      delay = ERASE_MS;
    } else {
      next = { line: (state.line + 1) % split.length, count: 0, phase: 'typing' };
      delay = 350;
    }
    const timer = setTimeout(() => setState(next), delay);
    return () => clearTimeout(timer);
  }, [state, split, reduced]);

  if (reduced) return <span className={className}>{label}</span>;
  const current = split[state.line];
  // All lines sit invisibly in the same grid cell ("ghosts"), so the headline is always as tall
  // as its tallest line and nothing below it moves while typing (no layout shift).
  return (
    <span className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <span className="visually-hidden">{label}</span>
      <span className={styles.stage} aria-hidden="true">
        {split.map((l) => (
          <span key={l.lang} className={`${styles.line} ${styles.ghost}`} lang={l.lang} dir={l.dir}>{l.text}</span>
        ))}
        <span className={styles.line} lang={current.lang} dir={current.dir} data-testid="typewriter">
          {current.parts.slice(0, state.count).join('')}
          <span className={styles.caret} />
        </span>
      </span>
    </span>
  );
}
