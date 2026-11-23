// A text field that formats what is typed (CNIC, mobile number, rupees) and says, under the box,
// how it is going: "3 more digits", then "Mobile number looks right" (Batch 4, feature 7).
// The live line is polite for screen readers; a server or form error still wins.
import { Check } from 'lucide-react';
import TextField from './TextField';
import { MASKS, maskStatus, westernDigits } from '../../utils/masks';
import { useT } from '../../i18n/context';
import styles from './Field.module.css';

// Batch 5: with an assist key, a mobile number may be SPOKEN digit by digit and rupees as an amount;
// a CNIC never (FieldAssist refuses it a second time).
const SPEAK_FOR_MASK = { mobile: 'digits', rupees: 'number' };

// max (Batch 7, rupees only): a higher limit for prices; the default keeps the Module 1 limit.
export default function MaskedField({ mask, value, onChange, hint, error, max, ...rest }) {
  const { t } = useT();
  const format = mask === 'rupees' ? (text) => MASKS.rupees(westernDigits(text)) : MASKS[mask];
  const status = maskStatus(mask, value, max ? { max } : undefined);
  const live = status.message && !error ? (
    <span className={[styles.live, styles[status.state]].join(' ')} aria-live="polite" data-state={status.state}>
      {status.state === 'ok' && <Check size={14} aria-hidden="true" />}
      {t(status.message, status.params)}
    </span>
  ) : null;
  return (
    <TextField
      {...rest}
      dir="ltr"
      speak={SPEAK_FOR_MASK[mask] ?? false}
      assistMask={mask}
      value={value}
      error={error}
      hint={live || hint ? <>{live}{live && hint ? ' · ' : ''}{hint}</> : undefined}
      onChange={(e) => onChange({ ...e, target: { ...e.target, value: format(e.target.value) } })}
    />
  );
}
