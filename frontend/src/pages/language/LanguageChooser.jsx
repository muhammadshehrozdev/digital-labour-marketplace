// First visit: choose the website language (Batch 3, D-019). A full screen, not a browser pop-up.
// Each card is written in its own language, with lang and dir set, so screen readers read it right.
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Logo from '../../components/brand/Logo';
import ThemeToggle from '../../components/layout/ThemeToggle';
import { LANGUAGES, useChangeLanguage } from '../../i18n';
import styles from './LanguageChooser.module.css';

export default function LanguageChooser() {
  const changeLanguage = useChangeLanguage();
  const [busy, setBusy] = useState('');

  useEffect(() => {
    document.title = LANGUAGES.map((l) => l.chooserTitle).join(' · ');
  }, []);

  const choose = async (code) => {
    setBusy(code);
    await changeLanguage(code);
    setBusy('');
  };

  return (
    <main id="main" className={styles.page}>
      <div className={styles.corner}><ThemeToggle tone="dark" /></div>
      <div className={styles.inner}>
        <div className={styles.logo}><Logo size={44} animated tone="dark" /></div>
        <h1 className={styles.title}>
          {LANGUAGES.map((l) => (
            <span key={l.code} lang={l.htmlLang} dir={l.dir} className={styles.titleLine}>{l.chooserTitle}</span>
          ))}
        </h1>
        <ul className={styles.cards}>
          {LANGUAGES.map((l, i) => (
            <li key={l.code} style={{ '--i': i }}>
              <button
                type="button"
                className={styles.card}
                lang={l.htmlLang}
                dir={l.dir}
                onClick={() => choose(l.code)}
                aria-busy={busy === l.code || undefined}
                disabled={Boolean(busy)}
              >
                <span className={styles.name}>{l.nativeName}</span>
                <span className={styles.preview}>{l.preview}</span>
                <span className={styles.go}>
                  {l.chooserContinue}
                  <ArrowRight size={18} aria-hidden="true" className={styles.arrow} />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.hints}>
          {LANGUAGES.map((l) => (
            <span key={l.code} lang={l.htmlLang} dir={l.dir}>{l.chooserHint}</span>
          ))}
        </p>
      </div>
    </main>
  );
}
