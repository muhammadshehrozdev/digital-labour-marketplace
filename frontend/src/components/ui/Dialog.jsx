import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import styles from './Dialog.module.css';

// Modal dialog on the native <dialog> element: showModal() gives the focus trap and makes the
// rest of the page inert; Esc closes; focus returns to the element that opened it.
// variant "drawer" slides in from the right (bottom sheet on phones).
export default function Dialog({ open, onClose, title, description, children, footer, variant = 'dialog', size = 'md' }) {
  const ref = useRef(null);
  const opener = useRef(null);
  const titleId = `d${useId().replace(/:/g, '')}`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      opener.current?.focus?.();
    }
  }, [open]);

  useEffect(() => () => opener.current?.focus?.(), []);

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[variant], styles[size]].join(' ')}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      {open && (
        <div className={styles.inner}>
          <div className={styles.head}>
            <div className={styles.titles}>
              <h2 id={titleId} className={styles.title}>{title}</h2>
              {description && <p className={styles.description}>{description}</p>}
            </div>
            <IconButton label="Close" icon={X} onClick={onClose} />
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
