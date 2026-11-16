// Turns what the browser's speech feature heard into digits (Batch 5, decision D-036). Pure function.
//   spokenToDigits(text, 'digits'): a phone number said digit by digit -> "03001234567"
//   spokenToDigits(text, 'number'): one amount or count -> "4000", "5"
// Rule: if any part of the phrase is not understood, the answer is null and nothing is written,
// because a wrong phone number is worse than an empty box.
import { NUMBER_WORDS_RAW } from './numberWords.js';

const URDU_DIGITS = /[۰-۹]/g; // ۰-۹
const ARABIC_DIGITS = /[٠-٩]/g; // ٠-٩

// Single digits said as words, in English, Roman Urdu and Urdu script.
const DIGIT_WORDS = {
  zero: 0, oh: 0, o: 0, nought: 0, sifar: 0, sifr: 0, 'صفر': 0, 'زیرو': 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chay: 6, chhay: 6, chhe: 6, che: 6,
  saat: 7, aath: 8, nau: 9,
  'ایک': 1, 'دو': 2, 'تین': 3, 'چار': 4, 'پانچ': 5, 'چھ': 6, 'سات': 7, 'آٹھ': 8, 'نو': 9,
};
const REPEAT_WORDS = { double: 2, dabal: 2, dubble: 2, 'ڈبل': 2, triple: 3, tripal: 3, tripple: 3, 'ٹرپل': 3 };
const MULTIPLIERS = { hundred: 100, sau: 100, 'سو': 100, thousand: 1000, hazar: 1000, hazaar: 1000, 'ہزار': 1000, lakh: 100000, lac: 100000, 'لاکھ': 100000 };
// Words that may surround an amount and carry no number: currency, "years", "and", "per day".
const FILLER = new Set(['plus', 'پلس', 'and', 'aur', 'اور', 'rs', 'rupees', 'rupee', 'rupay', 'rupaye', 'روپے', 'روپیہ', 'روپیے',
  'saal', 'sal', 'year', 'years', 'سال', 'per', 'a', 'day', 'din', 'دن', 'roz', 'روز', 'rozana', 'روزانہ']);
const NUMBER_WORDS = { ...Object.fromEntries(Object.entries(NUMBER_WORDS_RAW)), zero: 0, sifar: 0, 'صفر': 0 };

function tokens(text) {
  return String(text ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(URDU_DIGITS, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(ARABIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/(\d)[,٬](?=\d{3}\b)/g, '$1') // 4,000 -> 4000
    .replace(/[+\-–—.,،۔:;()/]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

const digitOf = (token) => (/^\d$/.test(token) ? Number(token) : DIGIT_WORDS[token]);

function toDigits(list) {
  let out = '';
  for (let i = 0; i < list.length; i += 1) {
    const token = list[i];
    if (token === 'plus' || token === 'پلس') continue;
    if (/^\d+$/.test(token)) { out += token; continue; }
    if (REPEAT_WORDS[token]) {
      const next = digitOf(list[i + 1]);
      if (next === undefined) return null; // "double" with nothing after it
      out += String(next).repeat(REPEAT_WORDS[token]);
      i += 1;
      continue;
    }
    const digit = DIGIT_WORDS[token];
    if (digit === undefined) return null;
    out += String(digit);
  }
  return out || null;
}

function toNumber(list) {
  let total = 0;
  let current = 0;
  let seen = false;
  let lastWasPlain = false; // a number with no multiplier yet ("4" in "4 hazaar")
  for (const token of list) {
    if (FILLER.has(token)) continue;
    if (/^\d+$/.test(token)) {
      if (lastWasPlain) return null; // "5 3" is not one number
      current += Number(token);
      seen = true;
      lastWasPlain = true;
      continue;
    }
    if (MULTIPLIERS[token]) {
      const m = MULTIPLIERS[token];
      const base = current || 1;
      if (m === 100) current = base * 100;
      else { total += base * m; current = 0; }
      seen = true;
      lastWasPlain = false;
      continue;
    }
    const value = NUMBER_WORDS[token];
    if (value === undefined) return null;
    // "twenty five" adds up; "five twenty" does not.
    if (lastWasPlain && !(current % 10 === 0 && value < 10 && current >= 20)) return null;
    current += value;
    seen = true;
    lastWasPlain = true;
  }
  return seen ? String(total + current) : null;
}

export function spokenToDigits(text, mode = 'digits') {
  const list = tokens(text);
  if (list.length === 0) return null;
  return mode === 'number' ? toNumber(list) : toDigits(list);
}

// For reading a number back: "0300-1234567" -> "0 3 0 0 1 2 3 4 5 6 7" (each digit on its own).
export const digitsForSpeech = (value) => String(value ?? '').replace(/\D/g, '').split('').join(' ');
