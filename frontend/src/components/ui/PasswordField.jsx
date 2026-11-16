import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';
import IconButton from './IconButton';
import { useT } from '../../i18n/context';
import styles from './Field.module.css';

// hint: undefined = the standard password hint; null = no hint (login).
// icon: a leading icon (Batch 5). assist: help key; a password gets Listen only, never Speak or read-back.
export default function PasswordField({ label, hint, error, required, id, icon: Icon, assist, ...rest }) {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  return (
    <Field
      label={label ?? t('password.label')} hint={hint === undefined ? t('password.hint') : hint} error={error} required={required} id={id}
      assist={assist} assistControl={assist ? { icon: Icon, inputType: 'password', secret: true } : undefined}
    >
      {(fieldProps) => (
        <div className={[styles.withButton, Icon && styles.shell].filter(Boolean).join(' ')}>
          {Icon && <span className={styles.adornStart} aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>}
          <input {...fieldProps} {...rest} type={visible ? 'text' : 'password'} className={[styles.control, Icon && styles.padStart].filter(Boolean).join(' ')} />
          <span className={styles.inside}>
            <IconButton
              label={visible ? t('password.hide') : t('password.show')}
              icon={visible ? EyeOff : Eye}
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
            />
          </span>
        </div>
      )}
    </Field>
  );
}
