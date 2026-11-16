import Field from './Field';
import { useValueSetter } from './useValueSetter';
import styles from './Field.module.css';

// With a live character counter when maxLength is set. urdu -> dir="auto" + Urdu font stack.
// assist (Batch 5): help key; voice typing ADDS the spoken words at the end. icon: shown in the help.
export default function TextArea({ label, hint, error, required, id, maxLength, value = '', urdu = false, rows = 4, assist, speak = 'text', icon, ...rest }) {
  const length = [...String(value)].length;
  const onValue = useValueSetter(rest.onChange, rest.name);
  const counter = maxLength ? (
    <span className={[styles.counter, length > maxLength && styles.counterOver].filter(Boolean).join(' ')} aria-live="polite">
      {length.toLocaleString('en')}/{maxLength.toLocaleString('en')}
    </span>
  ) : null;
  return (
    <Field
      label={label} hint={hint} error={error} required={required} id={id} counter={counter} assist={assist}
      assistControl={assist ? { icon, speak, multiline: true, value, onValue } : undefined}
    >
      {(fieldProps) => (
        <textarea
          {...fieldProps}
          {...rest}
          rows={rows}
          value={value}
          maxLength={maxLength}
          dir={urdu ? 'auto' : rest.dir}
          className={[styles.control, styles.textarea, urdu && styles.urdu].filter(Boolean).join(' ')}
        />
      )}
    </Field>
  );
}
