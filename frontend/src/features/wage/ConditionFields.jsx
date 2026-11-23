// The important payment and work conditions as a short checklist of picture cards (Module 5, §4.3): only the
// questions the server lists for the booking's trade category (GET /api/meta/work-terms), the fixed extra-work
// rule, and the category's fixed notes (domestic work: the 8-hour day). A missing answer is listed by the
// checks before anyone agrees; it never blocks.
import { Info, ShieldCheck } from 'lucide-react';
import { MaskedField, RadioCardGroup } from '../../components/ui';
import { useT } from '../../i18n';
import { ADVANCE_ICONS, CONDITION_ORDER, MATERIALS_ICONS, METHOD_ICONS, TIMING_ICONS, VISIT_ICONS, materialsWhat } from './wageText';
import styles from './Wage.module.css';

const OPTIONS = {
  materials: ['customer_buys', 'included_in_price', 'worker_buys_customer_pays'],
  paymentTiming: ['after_work', 'daily', 'part_before_rest_after'],
  paymentMethod: ['cash', 'easypaisa', 'jazzcash', 'bank', 'other'],
  visitCharge: ['none', 'included', 'separate'],
};
const ICONS = { materials: MATERIALS_ICONS, paymentTiming: TIMING_ICONS, paymentMethod: METHOD_ICONS, visitCharge: VISIT_ICONS };
const LISTEN = { materials: 'wageMaterials', paymentTiming: 'wageTiming', paymentMethod: 'wageMethod', visitCharge: 'wageVisit', advance: 'wageAdvance' };

// value: { materials, advanceChoice ('none' | 'some' | null), advanceAmount ("1,000"), paymentTiming, paymentMethod, visitCharge }
export default function ConditionFields({ conditions = [], notes = [], category, value, onChange, errors = {}, name = 'terms', amountMax }) {
  const { t } = useT();
  const set = (changes) => onChange({ ...value, ...changes });
  const what = t(`wage.materialsKind.${materialsWhat(category)}`);
  const asked = CONDITION_ORDER.filter((c) => conditions.includes(c));
  return (
    <div className={styles.fields} data-testid="condition-fields">
      <h4 className={styles.subTitle}>{t('wage.form.conditionsTitle')}</h4>
      {asked.map((c) => (c === 'advance' ? (
        <div key={c} className={styles.fields}>
          <RadioCardGroup
            legend={t('wage.form.advance')}
            name={`${name}-advance`}
            layout="tiles"
            value={value.advanceChoice}
            onChange={(advanceChoice) => set({ advanceChoice })}
            assist="wage.advance"
            listen={LISTEN.advance}
            options={['none', 'some'].map((v) => ({ value: v, title: t(`wage.advance.option.${v}`), icon: ADVANCE_ICONS[v] }))}
          />
          {value.advanceChoice === 'some' && (
            <MaskedField mask="rupees" prefix="Rs" max={amountMax} label={t('wage.form.advanceAmount')} inputMode="numeric" value={value.advanceAmount} onChange={(e) => set({ advanceAmount: e.target.value })} error={errors.advance} assist="wage.advanceAmount" />
          )}
        </div>
      ) : (
        <RadioCardGroup
          key={c}
          legend={t(`wage.form.${c}`, { what })}
          name={`${name}-${c}`}
          layout="tiles"
          value={value[c]}
          onChange={(v) => set({ [c]: v })}
          assist={`wage.${c}`}
          listen={LISTEN[c]}
          options={OPTIONS[c].map((v) => ({ value: v, title: t(`wage.${c === 'paymentTiming' ? 'timing' : c === 'paymentMethod' ? 'method' : c === 'visitCharge' ? 'visit' : 'materials'}.option.${v}`, { what }), icon: ICONS[c][v] }))}
        />
      )))}
      {notes.includes('working_day_hours') && <p className={styles.note}><Info size={18} aria-hidden="true" /> {t('wage.form.workingDayHours')}</p>}
      <p className={styles.rule} data-testid="extra-work-rule"><ShieldCheck size={18} aria-hidden="true" /> {t('wage.form.extraWorkRule')}</p>
    </div>
  );
}
