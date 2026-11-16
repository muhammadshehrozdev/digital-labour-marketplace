import { useId } from 'react';
import { useT } from '../../i18n/context';
import FieldAssist from '../../features/assist/FieldAssist';
import styles from './Field.module.css';

// Shared frame for form controls: label above, hint below, error linked with aria-describedby.
// children is a function that receives the props the control must spread.
// error may be a dictionary key, a server error descriptor ({ code, params }) or text: te() handles all.
// assist (Batch 5): a help key such as "register.name" puts the Listen / Speak row under the control
// (help text help.field.<key>); assistControl comes from the control: { value, onValue, speak,
// multiline, inputType, mask, secret, icon } (the control decides what voice typing may do).
export default function Field({ label, hint, error, required, id: givenId, children, counter, hideLabel, assist, assistControl }) {
  const { t, te } = useT();
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
            <span className="visually-hidden"> {t('common.required')}</span>
          </span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {assist && <FieldAssist helpKey={assist} label={label} {...assistControl} />}
      {(hint || counter) && (
        <div className={styles.below}>
          {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
          {counter}
        </div>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {te(error)}
        </p>
      )}
    </div>
  );
}
