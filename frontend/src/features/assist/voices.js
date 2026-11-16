// Which spoken language and which device voice to use (Batch 5, D-034). Pure functions.
// Roman Urdu is Urdu written in Latin letters: it is SPOKEN with the Urdu audio and the Urdu text.
// Roman Urdu text is never given to an English voice (it would come out as nonsense).
const AUDIO_LANG = { en: 'en', ur: 'ur', 'ur-Latn': 'ur' };

export const audioLangFor = (websiteLang) => AUDIO_LANG[websiteLang] ?? 'en';

// 'ur' when the text has Urdu (Arabic) script, otherwise 'en'.
export const scriptOf = (text) => (/[؀-ۿ]/.test(String(text ?? '')) ? 'ur' : 'en');

const norm = (lang) => String(lang ?? '').toLowerCase().replace('_', '-');

// The best installed voice for 'ur' or 'en', or null. Never a voice of another language.
export function pickVoice(voices, lang) {
  const list = (voices ?? []).filter((v) => v && typeof v.lang === 'string');
  const prefer = lang === 'ur' ? ['ur-pk', 'ur-in', 'ur'] : ['en-pk', 'en-in', 'en-gb', 'en-us', 'en'];
  for (const code of prefer) {
    const exact = list.find((v) => norm(v.lang) === code);
    if (exact) return exact;
  }
  return list.find((v) => norm(v.lang).startsWith(`${lang}-`) || norm(v.lang) === lang) ?? null;
}
