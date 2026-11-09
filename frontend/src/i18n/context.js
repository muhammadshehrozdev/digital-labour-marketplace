// The language context and its hooks (the provider is in LanguageProvider.jsx).
import { createContext, useContext } from 'react';
import { englishDictionary } from './loadDictionary';
import { createTranslator, translateError } from './translate';
import { languageInfo, intlLocale } from './languages';

export const LanguageContext = createContext(null);

// Used when a component is rendered without the provider (a single component in a unit test,
// or the crash screen if the provider itself failed): plain English, nothing to switch.
const englishT = createTranslator('en', englishDictionary, englishDictionary);
const ENGLISH_ONLY = {
  lang: 'en',
  dir: 'ltr',
  info: languageInfo('en'),
  chosen: true,
  setLanguage: async () => {},
  t: englishT,
  te: (error) => translateError(englishT, error),
  formatDate: (date, options = { dateStyle: 'medium' }) => (date ? new Intl.DateTimeFormat(intlLocale('en'), options).format(new Date(date)) : ''),
  formatNumber: (n) => new Intl.NumberFormat(intlLocale('en')).format(Number(n) || 0),
};

// { lang, dir, info, chosen, setLanguage, t, te, formatDate, formatNumber }
export function useLanguage() {
  return useContext(LanguageContext) ?? ENGLISH_ONLY;
}

// Most components need only the translate functions.
export const useT = useLanguage;
