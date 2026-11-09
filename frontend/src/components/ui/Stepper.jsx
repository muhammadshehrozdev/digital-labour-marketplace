import { Check } from 'lucide-react';
import { useT } from '../../i18n/context';
import styles from './Stepper.module.css';

// steps: [{ id, label }]; current: id; completed: array of ids.
// On small screens the labels hide and "Step x of n: label" is shown instead.
export default function Stepper({ steps, current, completed = [], label }) {
  const { t } = useT();
  const index = steps.findIndex((s) => s.id === current);
  return (
    <nav aria-label={label} className={styles.nav} style={{ '--progress': steps.length > 1 ? index / (steps.length - 1) : 0 }}>
      <p className={styles.compact}>
        {t('ui.stepper.compact', { n: index + 1, total: steps.length })} <strong>{steps[index]?.label}</strong>
      </p>
      <ol className={styles.list}>
        {steps.map((step, i) => {
          const done = completed.includes(step.id) && step.id !== current;
          const isCurrent = step.id === current;
          return (
            <li key={step.id} className={[styles.item, done && styles.done, isCurrent && styles.current].filter(Boolean).join(' ')} aria-current={isCurrent ? 'step' : undefined}>
              <span className={styles.marker} aria-hidden="true">{done ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
              <span className={styles.label}>
                {step.label}
                {done && <span className="visually-hidden"> {t('common.done')}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
