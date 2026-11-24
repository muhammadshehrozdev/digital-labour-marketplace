import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';
import { ToastContext } from './toastContext';
import { useT } from '../../i18n/context';
import styles from './Toast.module.css';

const ICONS = { success: CircleCheck, danger: CircleAlert, info: Info };
const DURATION = 4000;
const DURATION_WITH_ACTION = 7000; // time to reach "Undo"

// Toasts appear in one aria-live="polite" region, so screen readers announce them.
// They close by themselves after 4 s (paused while the mouse is over them).
export function ToastProvider({ children }) {
  const { t: tr } = useT();
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  // When the toast area goes away (a page or a test ends), its close timers go too: a timer must never change
  // state after the area is gone (Batch 8B, Stage 10: such a late timer broke a test run after the test had ended).
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const schedule = useCallback((id, ms = DURATION) => {
    timers.current.set(id, setTimeout(() => dismiss(id), ms));
  }, [dismiss]);

  // action: { label, onClick } adds one button to the toast, e.g. "Undo" (Batch 4, feature 17).
  const show = useCallback(({ tone = 'success', title, message, action }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list.slice(-2), { id, tone, title, message, action }]);
    schedule(id, action ? DURATION_WITH_ACTION : DURATION);
    return id;
  }, [schedule]);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone] ?? Info;
          return (
            <div
              key={t.id}
              className={[styles.toast, styles[t.tone]].join(' ')}
              role="status"
              onMouseEnter={() => clearTimeout(timers.current.get(t.id))}
              onMouseLeave={() => schedule(t.id, t.action ? DURATION_WITH_ACTION : DURATION)}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
              <div className={styles.text}>
                <p className={styles.title}>{t.title}</p>
                {t.message && <p className={styles.message}>{t.message}</p>}
              </div>
              {t.action && (
                <button type="button" className={styles.action} onClick={() => { dismiss(t.id); t.action.onClick(); }}>{t.action.label}</button>
              )}
              <button type="button" className={styles.close} aria-label={tr('common.dismiss')} onClick={() => dismiss(t.id)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
