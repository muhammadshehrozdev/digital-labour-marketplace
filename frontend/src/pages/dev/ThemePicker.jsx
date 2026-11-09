// Development only: switch the colour theme of the whole page (D-017). Not saved anywhere;
// the shipped default is DEFAULT_THEME in src/styles/theme.js.
import { useState } from 'react';
import { applyTheme, DEFAULT_THEME, THEMES } from '../../styles/theme';
import styles from './ThemeLab.module.css';

export default function ThemePicker() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || DEFAULT_THEME);
  return (
    <div className={styles.picker} role="radiogroup" aria-label="Colour theme">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={theme === t.id}
          className={styles.pickerOption}
          data-theme-preview={t.id}
          onClick={() => setTheme(applyTheme(t.id))}
        >
          <span className={styles.swatches} aria-hidden="true">
            <span className={styles.swatchDark} />
            <span className={styles.swatchPrimary} />
            <span className={styles.swatchAccent} />
          </span>
          <span>
            <strong>{t.name}</strong>
            {t.id === DEFAULT_THEME && <em> (default)</em>}
            <small>{t.description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
