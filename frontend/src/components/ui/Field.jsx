import { useId } from 'react';
import styles from './Field.module.css';

// Shared frame for form controls: label above, hint below, error linked with aria-describedby.
// children is a function that receives the props the control must spread.
export default function Field({ label, hint, error, required, id: givenId, children, counter, hideLabel }) {
  const autoId = useId();
  const id = givenId || `f${autoId.replace(/:/g, '')}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
        {required && (
          <span className={styles.required}>
            <span aria-hidden="true"> *</span>
            <span className="visually-hidden"> (required)</span>
          </span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {(hint || counter) && (
        <div className={styles.below}>
          {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
          {counter}
        </div>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
