// The three website languages (Batch 3, decision D-019). Same codes as the server
// (backend/config/languages.js): en, ur, ur-Latn.
//   htmlLang: the <html lang> value. dir: text direction.
//   locale: for dates (Intl.DateTimeFormat). Digits stay Western (0-9) in every language,
//           because people in Pakistan type phone numbers, CNIC and rates with them.
//   speech: the language for browser voice typing (Roman Urdu is recognised best as English).
//   preview, chooser*: texts of the first-visit language chooser. They are here, not in the
//   dictionaries, because the chooser shows all three languages at once before any is chosen.
export const LANGUAGES = [
  {
    code: 'en', htmlLang: 'en', dir: 'ltr', nativeName: 'English', locale: 'en-PK', speech: 'en-US',
    preview: 'Find skilled workers you can trust.',
    chooserTitle: 'Choose your language',
    chooserHint: 'You can change it at any time from the top of the page.',
    chooserContinue: 'Continue in English',
  },
  {
    code: 'ur', htmlLang: 'ur', dir: 'rtl', nativeName: 'اردو', locale: 'ur-PK', speech: 'ur-PK',
    preview: 'بھروسے کے قابل ہنر مند کاریگر تلاش کریں۔',
    chooserTitle: 'اپنی زبان چنیں',
    chooserHint: 'آپ اسے کسی بھی وقت صفحے کے اوپر سے بدل سکتے ہیں۔',
    chooserContinue: 'اردو میں جاری رکھیں',
  },
  {
    code: 'ur-Latn', htmlLang: 'ur-Latn', dir: 'ltr', nativeName: 'Roman Urdu', locale: 'en-PK', speech: 'en-US',
    preview: 'Bharosay ke qabil hunarmand karigar talaash karein.',
    chooserTitle: 'Apni zabaan chunein',
    chooserHint: 'Aap ise kisi bhi waqt safhay ke oopar se badal sakte hain.',
    chooserContinue: 'Roman Urdu mein jaari rakhein',
  },
];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANGUAGE = 'en';
export const isLanguage = (code) => LANGUAGE_CODES.includes(code);
export const languageInfo = (code) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

// Western digits in every language (the "-u-nu-latn" extension asks Intl for 0-9).
export const intlLocale = (code) => `${languageInfo(code).locale}-u-nu-latn`;
