import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';
import IconButton from './IconButton';
import styles from './Field.module.css';

export const PASSWORD_HINT = '15+ characters; a sentence you remember works well';

export default function PasswordField({ label = 'Password', hint = PASSWORD_HINT, error, required, id, ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error} required={required} id={id}>
      {(fieldProps) => (
        <div className={styles.withButton}>
          <input {...fieldProps} {...rest} type={visible ? 'text' : 'password'} className={styles.control} />
          <span className={styles.inside}>
            <IconButton
              label={visible ? 'Hide password' : 'Show password'}
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
