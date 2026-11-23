// The price part of a proposal (Module 5, §7): how the price is counted (picture cards: a wrench for the whole
// job, a sun for a day, a clock for an hour), the amount (the rupees mask on the number keypad, Western or Urdu
// digits; 🔊 reads it back), the number of days or hours (a stepper with big − and + buttons; the arrow keys
// work too) and, for a whole job, how long it will take (only used for the minimum-wage check).
import { useId } from 'react';
import { Minus, Plus } from 'lucide-react';
import { MaskedField, RadioCardGroup, TextField } from '../../components/ui';
import { westernDigits } from '../../utils/masks';
import { amountOf } from './wageLogic';
import { useT } from '../../i18n';
import { DURATION_ICONS, UNIT_ICONS, rupees } from './wageText';
import styles from './Wage.module.css';

const UNITS = ['job', 'day', 'hour'];
const DURATIONS = ['few_hours', 'one_day', 'two_three_days', 'longer'];
const QUANTITY_MAX = { job: 1, day: 60, hour: 200 };

export function QuantityStepper({ label, value, onChange, min = 1, max, assist }) {
  const { t } = useT();
  const id = `qty${useId().replace(/:/g, '')}`;
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className={styles.stepper} data-testid="quantity-stepper">
      <button type="button" className={styles.stepButton} aria-label={t('wage.form.less', { label })} aria-controls={id} disabled={value <= min} onClick={() => set(value - 1)}>
        <Minus size={24} aria-hidden="true" />
      </button>
      <TextField
        id={id}
        label={label}
        inputMode="numeric"
        className={styles.stepInput}
        value={String(value)}
        speak="number"
        assist={assist}
        onChange={(e) => {
          const n = Number.parseInt(westernDigits(e.target.value).replace(/\D/g, ''), 10);
          set(Number.isFinite(n) ? n : min);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); set(value + 1); }
          if (e.key === 'ArrowDown') { e.preventDefault(); set(value - 1); }
        }}
      />
      <button type="button" className={styles.stepButton} aria-label={t('wage.form.more', { label })} aria-controls={id} disabled={value >= max} onClick={() => set(value + 1)}>
        <Plus size={24} aria-hidden="true" />
      </button>
    </div>
  );
}

// value: { unit, amount ("2,500"), quantity, duration }
export default function PriceFields({ value, onChange, errors = {}, name = 'terms', amountMax }) {
  const { t, formatNumber } = useT();
  const set = (changes) => onChange({ ...value, ...changes });
  const amount = amountOf(value.amount);
  const multi = value.unit !== 'job';
  return (
    <div className={styles.fields}>
      <RadioCardGroup
        legend={t('wage.form.unit')}
        name={`${name}-unit`}
        layout="tiles"
        value={value.unit}
        onChange={(unit) => set({ unit, quantity: unit === 'job' ? 1 : Math.min(value.quantity || 1, QUANTITY_MAX[unit]) })}
        assist="wage.unit"
        listen="wageUnit"
        error={errors.unit}
        options={UNITS.map((u) => ({ value: u, title: t(`wage.unit.${u}`), icon: UNIT_ICONS[u] }))}
      />
      <MaskedField
        mask="rupees"
        prefix="Rs"
        max={amountMax}
        label={t(`wage.form.amount.${value.unit ?? 'job'}`)}
        inputMode="numeric"
        value={value.amount}
        onChange={(e) => set({ amount: e.target.value })}
        error={errors.amount}
        assist="wage.amount"
      />
      {multi && value.unit && (
        <QuantityStepper label={t(`wage.form.quantity.${value.unit}`)} value={value.quantity || 1} max={QUANTITY_MAX[value.unit]} onChange={(quantity) => set({ quantity })} assist="wage.quantity" />
      )}
      {multi && amount && value.quantity > 1 && (
        <p className={styles.total} data-testid="terms-total">{t('wage.form.total', { total: rupees(t, formatNumber, amount * value.quantity) })}</p>
      )}
      {value.unit === 'job' && (
        <RadioCardGroup
          legend={t('wage.form.duration')}
          name={`${name}-duration`}
          layout="tiles"
          value={value.duration}
          onChange={(duration) => set({ duration })}
          assist="wage.duration"
          listen="wageDuration"
          options={DURATIONS.map((d) => ({ value: d, title: t(`wage.duration.${d}`), icon: DURATION_ICONS[d] }))}
        />
      )}
    </div>
  );
}
