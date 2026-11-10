// Text size: A−, A, A+ (Batch 4, feature 4). Shown in the account menu and the footer; saved like
// the theme (this browser, and the account when logged in). Three radio buttons in one group.
import { useT } from '../../i18n';
import { TEXT_SIZES, useTheme } from '../../theme';
import styles from './TextSizeControl.module.css';

const GLYPH = { small: 'A−', normal: 'A', large: 'A+' };

export default function TextSizeControl({ tone = 'light' }) {
  const { textSize, setTextSize } = useTheme();
  const { t } = useT();
  return (
    <div role="radiogroup" aria-label={t('textSize.label')} className={[styles.group, styles[tone]].join(' ')} data-testid="text-size">
      {TEXT_SIZES.map((size) => (
        <button
          key={size}
          type="button"
          role="radio"
          aria-checked={textSize === size}
          aria-label={t(`textSize.${size}`)}
          title={t(`textSize.${size}`)}
          className={[styles.option, styles[size]].join(' ')}
          onClick={() => setTextSize(size)}
        >
          <span aria-hidden="true" lang="en" dir="ltr">{GLYPH[size]}</span>
        </button>
      ))}
    </div>
  );
}
