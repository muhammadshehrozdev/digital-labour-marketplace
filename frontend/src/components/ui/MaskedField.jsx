// A text field that formats what is typed (CNIC, mobile number, rupees) and says, under the box,
// how it is going: "3 more digits", then "Mobile number looks right" (Batch 4, feature 7).
// The live line is polite for screen readers; a server or form error still wins.
import { Check } from 'lucide-react';
import TextField from './TextField';
import { MASKS, maskStatus } from '../../utils/masks';
import { useT } from '../../i18n/context';
import styles from './Field.module.css';

export default function MaskedField({ mask, value, onChange, hint, error, ...rest }) {
  const { t } = useT();
  const format = MASKS[mask];
  const status = maskStatus(mask, value);
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
      value={value}
      error={error}
      hint={live || hint ? <>{live}{live && hint ? ' · ' : ''}{hint}</> : undefined}
      onChange={(e) => onChange({ ...e, target: { ...e.target, value: format(e.target.value) } })}
    />
  );
}
