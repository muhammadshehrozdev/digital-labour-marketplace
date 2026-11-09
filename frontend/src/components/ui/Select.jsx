import Field from './Field';
import styles from './Field.module.css';

// options: [{ value, label }]. placeholder adds an empty first choice.
export default function Select({ label, hint, error, required, id, options = [], placeholder, hideLabel, ...rest }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id} hideLabel={hideLabel}>
      {(fieldProps) => (
        <select {...fieldProps} {...rest} className={[styles.control, styles.select].join(' ')}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </Field>
  );
}
