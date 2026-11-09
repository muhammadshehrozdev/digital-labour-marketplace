import { useId } from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

export default function Checkbox({ label, hint, checked, onChange, disabled, id: givenId, children, ...rest }) {
  const autoId = `c${useId().replace(/:/g, '')}`;
  const id = givenId || autoId;
  return (
    <div className={styles.row}>
      <span className={styles.boxWrap}>
        <input
          id={id}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
      </span>
      <span className={styles.text}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {hint && <span id={`${id}-hint`} className={styles.hint}>{hint}</span>}
        {children}
      </span>
    </div>
  );
}
