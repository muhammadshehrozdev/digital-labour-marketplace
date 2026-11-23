// Years / months of experience from free text (fixes M2-7). Works on normalised tokens:
// a number (digits, or an English / Roman Urdu / Urdu number word) directly followed by a
// whole-word unit. "30000 salary" is not a unit, so it is ignored.
import { tokenize, normalizeText } from './normalize.js';

export const NUMBER_WORDS_RAW = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  // Roman Urdu
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chay: 6, chhay: 6, chhe: 6, che: 6,
  saat: 7, aath: 8, nau: 9, das: 10, gyarah: 11, gyara: 11, barah: 12, bara: 12, terah: 13,
  chaudah: 14, pandrah: 15, pandra: 15, solah: 16, satrah: 17, atharah: 18, unees: 19, bees: 20,
  pachees: 25, tees: 30, chalees: 40, pachas: 50,
  // Urdu
  'ایک': 1, 'دو': 2, 'تین': 3, 'چار': 4, 'پانچ': 5, 'چھ': 6, 'سات': 7, 'آٹھ': 8, 'نو': 9, 'دس': 10,
  'گیارہ': 11, 'بارہ': 12, 'تیرہ': 13, 'چودہ': 14, 'پندرہ': 15, 'سولہ': 16, 'سترہ': 17, 'اٹھارہ': 18,
  'انیس': 19, 'بیس': 20, 'پچیس': 25, 'تیس': 30, 'چالیس': 40, 'پچاس': 50,
};
const NUMBER_WORDS = new Map(Object.entries(NUMBER_WORDS_RAW).map(([w, n]) => [normalizeText(w), n]));

const YEAR_UNITS = new Set(['saal', 'sal', 'saalon', 'year', 'years', 'yr', 'yrs', 'baras', 'سال', 'سالوں', 'برس'].map(normalizeText));
const MONTH_UNITS = new Set(['mahine', 'mahina', 'mahinay', 'maheene', 'month', 'months', 'مہینے', 'مہینہ', 'ماہ'].map(normalizeText));

export const MAX_YEARS = 60;

function numberAt(token) {
  if (/^\d{1,6}$/.test(token)) return Number(token);
  return NUMBER_WORDS.get(token) ?? null;
}

// Returns { experience: { years, months } | null, note: null | 'over_60' }
export function extractExperience(text) {
  const tokens = tokenize(text);
  const yearHits = [];
  const monthHits = [];
  let tooLarge = false;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const value = numberAt(tokens[i]);
    if (value === null) continue;
    const unit = tokens[i + 1];
    if (YEAR_UNITS.has(unit)) {
      if (value > MAX_YEARS) tooLarge = true;
      else yearHits.push({ index: i, value });
    } else if (MONTH_UNITS.has(unit)) {
      if (value > MAX_YEARS * 12) tooLarge = true;
      else monthHits.push({ index: i, value });
    }
  }

  if (yearHits.length === 0 && monthHits.length === 0) {
    return { experience: null, note: tooLarge ? 'over_60' : null };
  }

  let years = 0;
  let months = 0;
  if (yearHits.length) {
    // The largest stated number of years is taken as total experience.
    const best = yearHits.reduce((a, b) => (b.value > a.value ? b : a));
    years = best.value;
    // "2 saal 6 mahine" / "2 years and 6 months": months right after that years phrase.
    const near = monthHits.find((m) => m.index > best.index && m.index - best.index <= 3);
    if (near) months = near.value;
  } else {
    months = Math.max(...monthHits.map((m) => m.value));
  }
  years += Math.floor(months / 12);
  months %= 12;
  if (years > MAX_YEARS) return { experience: null, note: 'over_60' };
  return { experience: { years, months }, note: tooLarge ? 'over_60' : null };
}
