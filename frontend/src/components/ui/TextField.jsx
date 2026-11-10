import Field from './Field';
import styles from './Field.module.css';

// urdu: the worker may type Urdu here -> dir="auto" and an Urdu-friendly font stack.
// icon: a small leading icon. prefix / suffix: short fixed text inside the box, e.g. "Rs" or "/day"
// (both decorative: the label already says what the field is).
export default function TextField({ label, hint, error, required, id, urdu = false, hideLabel, className, icon: Icon, prefix, suffix, ...inputProps }) {
  const adorned = Boolean(Icon || prefix || suffix);
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} hideLabel={hideLabel}>
      {(fieldProps) => {
        const input = (
          <input
            type="text"
            {...fieldProps}
            {...inputProps}
            dir={urdu ? 'auto' : inputProps.dir}
            className={[styles.control, urdu && styles.urdu, (Icon || prefix) && styles.padStart, suffix && styles.padEnd, className].filter(Boolean).join(' ')}
          />
        );
        if (!adorned) return input;
        return (
          <span className={styles.shell}>
            {Icon && <span className={styles.adornStart} aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>}
            {!Icon && prefix && <span className={styles.adornStart} aria-hidden="true">{prefix}</span>}
            {input}
            {suffix && <span className={styles.adornEnd} aria-hidden="true">{suffix}</span>}
          </span>
        );
      }}
    </Field>
  );
}
