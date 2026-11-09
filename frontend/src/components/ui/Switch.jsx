import { useId } from 'react';
import styles from './Switch.module.css';

export default function Switch({ label, checked, onChange, disabled, hint }) {
  const id = `s${useId().replace(/:/g, '')}`;
  return (
    <div className={styles.row}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        className={styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {hint && <span id={`${id}-hint`} className={styles.hint}>{hint}</span>}
      </span>
    </div>
  );
}
