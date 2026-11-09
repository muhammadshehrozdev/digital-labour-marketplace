import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';
import IconButton from './IconButton';
import { useT } from '../../i18n/context';
import styles from './Field.module.css';

// hint: undefined = the standard password hint; null = no hint (login).
export default function PasswordField({ label, hint, error, required, id, ...rest }) {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label ?? t('password.label')} hint={hint === undefined ? t('password.hint') : hint} error={error} required={required} id={id}>
      {(fieldProps) => (
        <div className={styles.withButton}>
          <input {...fieldProps} {...rest} type={visible ? 'text' : 'password'} className={styles.control} />
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
