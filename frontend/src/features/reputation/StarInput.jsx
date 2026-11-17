// Five big stars as ONE real radio group (keyboard: Tab into it, arrow keys move), each with its own
// 🔊 ("5 stars: very good work"). The group has its Listen row under the question (Batch 5 rules).
import { useState } from 'react';
import { Star } from 'lucide-react';
import FieldAssist from '../assist/FieldAssist';
import OptionListen from '../assist/OptionListen';
import { useT } from '../../i18n';
import styles from './Reputation.module.css';

export default function StarInput({ legend, name = 'rating', value, onChange, error, assist = 'rate.stars' }) {
  const { t, te } = useT();
  const [noVoice, setNoVoice] = useState(false);
  return (
    <fieldset className={styles.starGroup} aria-invalid={error ? true : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      <FieldAssist helpKey={assist} label={legend} />
      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={styles.starOption}>
            <label className={[styles.starCard, value >= n && styles.starCardOn, value === n && styles.starCardChosen].filter(Boolean).join(' ')}>
              <input type="radio" className={styles.starInput} name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
              <Star size={40} strokeWidth={1.5} aria-hidden="true" />
              <span className={styles.starWord}>{t(`reputation.starWords.${n}`)}</span>
            </label>
            <OptionListen helpKey={`help.option.stars.${n}`} name={t(`reputation.starWords.${n}`)} onNoVoice={() => setNoVoice(true)} />
          </div>
        ))}
      </div>
      {noVoice && <p className={styles.note}>{t('assist.noVoiceOption')}</p>}
      {error && <p className={styles.error}>{te(error)}</p>}
    </fieldset>
  );
}
