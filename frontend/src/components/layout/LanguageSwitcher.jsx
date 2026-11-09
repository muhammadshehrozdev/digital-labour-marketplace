// Globe button + current language. Opens a small list of the three languages.
// Disclosure pattern: button[aria-expanded] + list of buttons; Escape or a click outside closes it
// and focus goes back to the button. tone="dark" for dark sections (hero, footer).
import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES, useChangeLanguage, useLanguage } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher({ tone = 'light', compact = false, placement = 'below' }) {
  const { lang, info, t } = useLanguage();
  const changeLanguage = useChangeLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const listId = `lang-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown') {
        if (e.key !== 'Escape') return;
        setOpen(false);
        buttonRef.current?.focus();
      } else if (!wrapRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const choose = async (code) => {
    setOpen(false);
    buttonRef.current?.focus();
    await changeLanguage(code);
  };

  return (
    <div ref={wrapRef} className={[styles.wrap, styles[tone], compact && styles.compact].filter(Boolean).join(' ')}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('language.change', { name: info.nativeName })}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.current} lang={info.htmlLang}>{info.nativeName}</span>
        <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
      </button>
      {open && (
        <ul id={listId} className={[styles.list, styles[placement]].join(' ')} aria-label={t('language.label')}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={styles.option}
                lang={l.htmlLang}
                dir={l.dir}
                aria-current={l.code === lang ? 'true' : undefined}
                onClick={() => choose(l.code)}
              >
                <span>{l.nativeName}</span>
                {l.code === lang && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
