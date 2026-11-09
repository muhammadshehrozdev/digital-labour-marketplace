// Language system (Batch 3, D-019). See docs/design/06-i18n.md.
export { LanguageProvider } from './LanguageProvider';
export { useLanguage, useT } from './context';
export { useChangeLanguage } from './useChangeLanguage';
export { useDocumentTitle } from './useDocumentTitle';
export { default as LanguageSync } from './LanguageSync';
export { default as Rich } from './Rich';
export { LANGUAGES, languageInfo, isLanguage } from './languages';
