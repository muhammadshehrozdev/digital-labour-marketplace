import { useId, useRef } from 'react';
import { useT } from '../../i18n/context';
import styles from './Tabs.module.css';

// tabs: [{ id, label, icon?, content }]. Arrow keys move between tabs (roving tabindex).
// layout "side": a vertical list beside the panel on wide screens, a scrolling row on phones.
// In Urdu (right to left) the Left and Right arrow keys are swapped, so they follow the screen.
export default function Tabs({ tabs, value, onChange, label, layout = 'top', className }) {
  const { dir } = useT();
  const base = `t${useId().replace(/:/g, '')}`;
  const refs = useRef([]);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const move = (i) => {
    const next = (i + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  return (
    <div className={[styles.tabs, styles[layout], className].filter(Boolean).join(' ')}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((t, i) => {
          const Icon = t.icon;
          return (
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
                if (e.key === forward || e.key === 'ArrowDown') { e.preventDefault(); move(i + 1); }
                if (e.key === backward || e.key === 'ArrowUp') { e.preventDefault(); move(i - 1); }
                if (e.key === 'Home') { e.preventDefault(); move(0); }
                if (e.key === 'End') { e.preventDefault(); move(tabs.length - 1); }
              }}
            >
              {Icon && <Icon size={18} strokeWidth={1.75} aria-hidden="true" />}
              <span>{t.label}</span>
              {t.badge}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${base}-${tabs[index].id}-panel`} aria-labelledby={`${base}-${tabs[index].id}`} className={styles.panel}>
        {tabs[index].content}
      </div>
    </div>
  );
}
