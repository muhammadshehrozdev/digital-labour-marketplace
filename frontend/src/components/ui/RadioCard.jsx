import { useT } from '../../i18n/context';
import FieldAssist from '../../features/assist/FieldAssist';
import styles from './RadioCard.module.css';

// One large selectable card. A real radio input inside keeps keyboard (arrow keys) and screen readers working.
export function RadioCard({ name, value, checked, onChange, title, description, icon: Icon, art, disabled }) {
  return (
    <label className={[styles.card, checked && styles.checked, disabled && styles.disabled].filter(Boolean).join(' ')}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      {art && <span className={styles.art}>{art}</span>}
      {!art && Icon && <span className={styles.icon}><Icon size={24} strokeWidth={1.75} aria-hidden="true" /></span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      <span className={styles.dot} aria-hidden="true" />
    </label>
  );
}

// A group of RadioCards with a visible legend (fieldset), as one question.
// assist (Batch 5): help key for a Listen button under the question (choices are never spoken into).
export default function RadioCardGroup({ legend, name, value, onChange, options, error, columns = 1, assist }) {
  const { te } = useT();
  return (
    <fieldset className={styles.group} aria-invalid={error ? true : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {assist && <FieldAssist helpKey={assist} label={typeof legend === 'string' ? legend : ''} />}
      <div className={[styles.grid, columns === 2 && styles.two].filter(Boolean).join(' ')}>
        {options.map((o) => (
          <RadioCard key={o.value} name={name} {...o} checked={value === o.value} onChange={onChange} />
        ))}
      </div>
      {error && <p className={styles.error}>{te(error)}</p>}
    </fieldset>
  );
}
