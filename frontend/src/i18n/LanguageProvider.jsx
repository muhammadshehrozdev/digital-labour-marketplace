// Holds the website language for the whole app (Batch 3, D-019). No i18n library.
// - First visit: no language chosen yet (`chosen` false) -> the app shows the language chooser.
// - Changing the language re-renders the page in place: no reload, form input stays.
// - Urdu sets <html lang="ur" dir="rtl"> (the layout mirrors through CSS logical properties).
// - Where the browser supports View Transitions, the switch cross-fades (not with reduced motion).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LanguageContext } from './context';
import { DEFAULT_LANGUAGE, intlLocale, isLanguage, languageInfo } from './languages';
import { readStoredLanguage, storeLanguage } from './storage';
import { cachedDictionary, englishDictionary, loadDictionary } from './loadDictionary';
import { createTranslator, translateError } from './translate';
import { loadUrduFont } from './fonts';

const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function withTransition(update) {
  if (typeof document.startViewTransition === 'function' && !prefersReducedMotion()) {
    document.documentElement.dataset.transition = 'language';
    const transition = document.startViewTransition(() => flushSync(update));
    transition.finished.finally(() => delete document.documentElement.dataset.transition);
  } else {
    update();
  }
}

// initialLanguage: for tests and previews; otherwise the browser's saved choice (if any).
export function LanguageProvider({ children, initialLanguage }) {
  const [state, setState] = useState(() => {
    const start = isLanguage(initialLanguage) ? initialLanguage : readStoredLanguage();
    const lang = start ?? DEFAULT_LANGUAGE;
    // choseThisVisit: the user picked a language on this page load (chooser or switcher).
    return { lang, chosen: Boolean(start), choseThisVisit: false, dict: cachedDictionary(lang) };
  });

  // A saved Urdu or Roman Urdu choice: fetch that dictionary once at start.
  useEffect(() => {
    if (state.dict) return undefined;
    let active = true;
    loadDictionary(state.lang)
      .then((dict) => active && setState((s) => (s.lang === state.lang ? { ...s, dict } : s)))
      .catch(() => active && setState((s) => ({ ...s, lang: DEFAULT_LANGUAGE, dict: englishDictionary })));
    return () => {
      active = false;
    };
  }, [state.dict, state.lang]);

  // The latest state for setLanguage (which is created once).
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  });

  // <html lang dir> in the same commit as the new texts.
  useLayoutEffect(() => {
    const info = languageInfo(state.lang);
    document.documentElement.lang = info.htmlLang;
    document.documentElement.dir = info.dir;
    if (state.lang === 'ur') loadUrduFont();
  }, [state.lang]);

  // Resolves when the new language is on screen. Rejects only if its file could not be loaded.
  // byUser: the person picked it (chooser, switcher). false when the account's language is applied.
  const setLanguage = useCallback(async (code, { remember = true, byUser = true } = {}) => {
    if (!isLanguage(code)) return;
    if (remember) storeLanguage(code);
    const dict = await loadDictionary(code);
    if (code === 'ur') loadUrduFont();
    const current = latest.current;
    if (current.lang === code && current.chosen) {
      if (byUser && !current.choseThisVisit) setState((s) => ({ ...s, choseThisVisit: true }));
      return; // nothing to change on screen
    }
    withTransition(() => setState({ lang: code, chosen: true, choseThisVisit: byUser || current.choseThisVisit, dict }));
  }, []);

  const value = useMemo(() => {
    const t = createTranslator(state.lang, state.dict ?? englishDictionary, englishDictionary);
    const locale = intlLocale(state.lang);
    return {
      lang: state.lang,
      dir: languageInfo(state.lang).dir,
      info: languageInfo(state.lang),
      chosen: state.chosen,
      choseThisVisit: state.choseThisVisit,
      setLanguage,
      t,
      te: (error) => translateError(t, error),
      formatDate: (date, options = { dateStyle: 'medium' }) => (date ? new Intl.DateTimeFormat(locale, options).format(new Date(date)) : ''),
      formatNumber: (n) => new Intl.NumberFormat(locale).format(Number(n) || 0),
    };
  }, [state.lang, state.dict, state.chosen, state.choseThisVisit, setLanguage]);

  // Until the saved language's file is here, show a quiet placeholder (no English flash).
  if (!state.dict) return <div className="app-loading" aria-busy="true" />;
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
