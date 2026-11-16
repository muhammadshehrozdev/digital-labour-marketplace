// Speaking help and reading answers back, in the right language (Batch 5, D-034).
//   say(id, key, params)  plays the help text of a dictionary key: a recorded clip if the team made
//                         one, else a device voice, else nothing ('none': the caller shows the text).
//                         A param may be a function (spokenLang, spokenT) => text, so values such as
//                         a skill's name are also in the SPOKEN language.
//   readBack(id, value, mode) says what was written ("Written: Bilal Ahmed"). mode 'digits' reads a
//                         phone number digit by digit (recorded Urdu digit clips first).
// Roman Urdu is spoken with the Urdu audio and the URDU text of the same key (never Roman Urdu text
// through an English voice). The text on screen always stays in the website language.
import { useCallback } from 'react';
import { useLanguage } from '../../i18n';
import { createTranslator } from '../../i18n/translate';
import { englishDictionary, loadDictionary } from '../../i18n/loadDictionary';
import { clipUrl, play } from './audio';
import manifest from './clipManifest.json';
import { audioLangFor, scriptOf } from './voices';
import { digitsForSpeech } from '../../utils/spokenNumbers';

const englishT = createTranslator('en', englishDictionary, englishDictionary);

// A translator for the language that is SPOKEN ('en' or 'ur').
export async function spokenTranslator(audioLang) {
  if (audioLang !== 'ur') return englishT;
  const ur = await loadDictionary('ur');
  return createTranslator('ur', ur, englishDictionary);
}

// The digit clips, if the team recorded all ten: ['/audio/help/ur/digit-0.webm', …] by digit.
export function digitClips(lang, clips = manifest) {
  const urls = Array.from({ length: 10 }, (_, d) => clipUrl(lang, `digit.${d}`, clips));
  return urls.every(Boolean) ? urls : null;
}

export function useSay() {
  const { lang } = useLanguage();
  const audioLang = audioLangFor(lang);

  const say = useCallback(async (id, key, params) => {
    const spokenT = await spokenTranslator(audioLang);
    const values = params && Object.fromEntries(Object.entries(params).map(([k, v]) => [k, typeof v === 'function' ? v(audioLang, spokenT) : v]));
    // a recorded clip says the fixed text of a key; texts with values ({name}) are spoken by a voice
    const clip = params ? null : clipUrl(audioLang, key);
    return play({ id, clip, text: spokenT(key, values), lang: audioLang });
  }, [audioLang]);

  const readBack = useCallback(async (id, value, mode = 'text') => {
    const text = String(value ?? '').trim();
    if (!text) return 'none';
    if (mode === 'digits') {
      const digits = text.replace(/\D/g, '');
      const clips = digitClips(audioLang);
      if (clips) return play({ id, clips: digits.split('').map((d) => clips[Number(d)]) });
      const spokenT = await spokenTranslator(audioLang);
      return play({ id, text: spokenT('assist.wrote', { value: digitsForSpeech(digits) }), lang: audioLang });
    }
    // words: the voice of the script the answer is written in (Urdu letters -> Urdu voice)
    const voiceLang = mode === 'number' ? audioLang : scriptOf(text);
    const spokenT = await spokenTranslator(voiceLang);
    return play({ id, text: spokenT('assist.wrote', { value: text }), lang: voiceLang });
  }, [audioLang]);

  return { say, readBack, audioLang };
}
