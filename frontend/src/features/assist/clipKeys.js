// Which help texts the team can record (Batch 5, D-034; docs/audio/RECORDING-GUIDE.md).
// A clip says ONE fixed text, so texts with a value in them ("Written: {value}") are always spoken by
// a device voice and are not on the list. Order: what a new person hears first comes first.
import { flattenKeys, lookup } from '../../i18n/translate';
import { LANGUAGES } from '../../i18n/languages';
import { audioLangFor } from './voices';

const RECORDABLE = [
  'help.screen.', 'help.field.', 'help.option.',
  'assist.noMic', 'assist.offlineMic', 'assist.notUnderstood', 'assist.noVoice', 'assist.offerText',
  'voice.notice', 'voice.errors.',
];

export const DIGIT_KEYS = Array.from({ length: 10 }, (_, d) => `digit.${d}`);

// The digits as words, for recording digit-0 ... digit-9 (phone numbers are read back digit by digit).
export const DIGIT_WORDS = {
  ur: ['صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
};

// The language-chooser cards whose sentence is spoken in this language (Roman Urdu is spoken in Urdu).
export const chooserFor = (lang) => LANGUAGES.filter((l) => audioLangFor(l.code) === lang);

// dict: the Urdu or English dictionary; lang: 'ur' or 'en'. Chooser keys first, then the dictionary
// keys, then the digits.
export function clipKeysFrom(dict, lang) {
  const keys = flattenKeys(dict)
    .filter((key) => RECORDABLE.some((p) => (p.endsWith('.') ? key.startsWith(p) : key === p)))
    .filter((key) => !/\{\w+\}/.test(String(lookup(dict, key))));
  return [...chooserFor(lang).map((l) => `help.chooser.${l.code}`), ...keys, ...DIGIT_KEYS];
}

// The text that is said in a clip.
export function clipText(key, dict, lang) {
  if (key.startsWith('help.chooser.')) {
    const card = LANGUAGES.find((l) => `help.chooser.${l.code}` === key);
    if (!card) return '';
    // the English meaning of an Urdu chooser sentence (shown under it in the recorder)
    if (lang === 'en' && card.code !== 'en') return `Press here for ${card.code === 'ur' ? 'Urdu' : 'Roman Urdu'}.`;
    return card.chooserSpoken;
  }
  if (key.startsWith('digit.')) return DIGIT_WORDS[lang][Number(key.slice(6))];
  return String(lookup(dict, key) ?? '');
}

// The file name of a clip, without its extension: dots become dashes.
export const clipBaseName = (key) => String(key).replace(/\./g, '-');

// Clip files whose name is not a recordable key of their language (a typo, or a text that was
// removed): the website would never play them. assistClips.test.js keeps this list empty.
export function unknownClipFiles(clips, dicts) {
  const bad = [];
  for (const lang of ['ur', 'en']) {
    const known = new Set(clipKeysFrom(dicts[lang], lang).map(clipBaseName));
    for (const file of clips[lang] ?? []) {
      if (!known.has(file.replace(/\.[^.]+$/, ''))) bad.push(`${lang}/${file}`);
    }
  }
  return bad;
}
