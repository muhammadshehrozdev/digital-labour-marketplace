import Field from './Field';
import styles from './Field.module.css';

// urdu: the worker may type Urdu here -> dir="auto" and an Urdu-friendly font stack.
export default function TextField({ label, hint, error, required, id, urdu = false, hideLabel, className, ...inputProps }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} hideLabel={hideLabel}>
      {(fieldProps) => (
        <input
          type="text"
          {...fieldProps}
          {...inputProps}
          dir={urdu ? 'auto' : inputProps.dir}
          className={[styles.control, urdu && styles.urdu, className].filter(Boolean).join(' ')}
        />
      )}
    </Field>
  );
}
