// Limits and example texts used by the skills editor. Labels and messages are in the dictionaries.
export const MAX_TEXT = 2000;

// Example sentences for the carousel in Step 3 (Batch 4, feature 13): three per script. The
// carousel starts with the examples of the website language. Example text only (not real people);
// each stays in its own script in every website language.
export const EXAMPLES = [
  { id: 'ur', lang: 'ur', dir: 'rtl', text: 'میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔' },
  { id: 'ur2', lang: 'ur', dir: 'rtl', text: 'میں پلمبر ہوں، پائپ فٹنگ اور گیزر لگاتا ہوں۔ تین سال کا تجربہ ہے۔' },
  { id: 'ur3', lang: 'ur', dir: 'rtl', text: 'میں گھروں میں صفائی اور کھانا پکانے کا کام کرتی ہوں۔' },
  { id: 'roman', lang: 'ur-Latn', dir: 'ltr', text: 'Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon.' },
  { id: 'roman2', lang: 'ur-Latn', dir: 'ltr', text: 'Main carpenter hoon, darwaze aur almari banata hoon. 10 saal ka tajurba hai.' },
  { id: 'roman3', lang: 'ur-Latn', dir: 'ltr', text: 'Main 3 saal se AC repair aur gas filling ka kaam karta hoon.' },
  { id: 'en', lang: 'en', dir: 'ltr', text: 'I am a painter with 6 years of experience in emulsion, putty and texture work.' },
  { id: 'en2', lang: 'en', dir: 'ltr', text: 'I do house wiring, DB boards and UPS installation. 8 years of experience.' },
  { id: 'en3', lang: 'en', dir: 'ltr', text: 'I install and service split ACs and repair fridges.' },
];

// The examples in the order the carousel shows them: the website language first.
export const examplesFor = (lang) => [...EXAMPLES.filter((e) => e.lang === lang), ...EXAMPLES.filter((e) => e.lang !== lang)];

// Where the matched words are in the typed text (feature 12): [{ text, match }] parts. Matching is
// case-insensitive and literal (the words are escaped), longest word first.
export function markMatches(text, words) {
  const clean = [...new Set((words ?? []).map((w) => String(w).trim()).filter((w) => w.length >= 2))].sort((a, b) => b.length - a.length);
  if (!text || clean.length === 0) return [{ text: text ?? '', match: false }];
  const pattern = new RegExp(`(${clean.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'giu');
  return text.split(pattern).filter((part) => part !== '').map((part) => ({ text: part, match: clean.some((w) => w.toLocaleLowerCase() === part.toLocaleLowerCase()) }));
}
