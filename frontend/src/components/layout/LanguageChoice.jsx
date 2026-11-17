// The three languages as one row of buttons (Batch 6B): used inside the account menu, the "More" menu and
// the mobile menu when the header has no room for the globe button. Same saving as the globe button.
import { LANGUAGES, useChangeLanguage, useLanguage } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

export default function LanguageChoice() {
  const { lang, t } = useLanguage();
  const changeLanguage = useChangeLanguage();
  return (
    <div role="radiogroup" aria-label={t('language.label')} className={styles.choice} data-testid="language-choice">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={l.code === lang}
          lang={l.htmlLang}
          dir={l.dir}
          className={styles.choiceOption}
          onClick={() => changeLanguage(l.code)}
        >
          {l.nativeName}
        </button>
      ))}
    </div>
  );
}
