import { useCallback, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';
import { ToastContext } from './toastContext';
import { useT } from '../../i18n/context';
import styles from './Toast.module.css';

const ICONS = { success: CircleCheck, danger: CircleAlert, info: Info };
const DURATION = 4000;

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

  const schedule = useCallback((id) => {
    timers.current.set(id, setTimeout(() => dismiss(id), DURATION));
  }, [dismiss]);

  const show = useCallback(({ tone = 'success', title, message }) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list.slice(-2), { id, tone, title, message }]);
    schedule(id);
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
              onMouseLeave={() => schedule(t.id)}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={styles.icon} />
              <div className={styles.text}>
                <p className={styles.title}>{t.title}</p>
                {t.message && <p className={styles.message}>{t.message}</p>}
              </div>
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
