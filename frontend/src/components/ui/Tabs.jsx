import { useId, useRef } from 'react';
import styles from './Tabs.module.css';

// tabs: [{ id, label, content }]. Arrow keys move between tabs (roving tabindex).
export default function Tabs({ tabs, value, onChange, label }) {
  const base = `t${useId().replace(/:/g, '')}`;
  const refs = useRef([]);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const move = (i) => {
    const next = (i + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${base}-${t.id}`}
            aria-selected={i === index}
            aria-controls={`${base}-${t.id}-panel`}
            tabIndex={i === index ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(i + 1);
              if (e.key === 'ArrowLeft') move(i - 1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-${tabs[index].id}-panel`} aria-labelledby={`${base}-${tabs[index].id}`} className={styles.panel}>
        {tabs[index].content}
      </div>
    </div>
  );
}
