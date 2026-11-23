// Module 6: the budget in a job's text (5.7 of the batch plan). PURE.
// It reads the RAW text, before Module 2's normalisation (that turns "15,000" into "15 000" and "1.5" into "1 5").
// A number is money only next to a money word ("Rs", "rupay", "budget", ...), with a multiplier ("2 hazar", "1.5k")
// or with the Pakistani "/-" after it ("15000/-"). "3 pankhay", "2 rooms" and years are not money.
import { NUMBER_WORDS_RAW } from '../skillExtractor/experience.js';
import { normalizeText, toWesternDigits } from '../skillExtractor/normalize.js';
import { WAGE_RULES } from '../../config/wageRules.js';
import {
  BUDGET_UNIT_WORDS, MONEY_MULTIPLIERS, MONEY_WORDS, NUMBER_FRACTIONS, UNIT_WINDOW,
} from '../../config/jobPhrases.js';
import { VARIANT_MAP, jobTokens } from './tokens.js';

const norm = (w) => normalizeText(w);
const MONEY = new Set(MONEY_WORDS.map(norm));
const MULTIPLIERS = new Map(Object.entries(MONEY_MULTIPLIERS).map(([w, n]) => [norm(w), n]));
const SPOKEN = new Map([
  ...Object.entries(NUMBER_WORDS_RAW).map(([w, n]) => [norm(w), n]),
  ...Object.entries(NUMBER_FRACTIONS).map(([w, n]) => [norm(w), n]),
]);
const UNIT_TERMS = Object.entries(BUDGET_UNIT_WORDS).flatMap(([unit, terms]) => terms.map((t) => ({ unit, term: t, tokens: jobTokens(t) })));

// Digit groups that end in three digits: "1,000,000" and "15,000" (Western), "1,50,000" (South Asian); else plain digits
// ("10,12 hazar" is "10 or 12 thousand", not 1,012,000); "1.5"; Urdu and Arabic digits (already Western); or a word.
const NUMBER = '\\d{1,3}(?:[,٬]\\d{3})+(?:[.٫]\\d+)?|\\d{1,3}(?:[,٬]\\d{2})+[,٬]\\d{3}(?:[.٫]\\d+)?|\\d+(?:[.٫]\\d+)?';
const SCAN = new RegExp(`(${NUMBER})|([\\p{L}\\p{M}]+)`, 'gu');
// "k" means a thousand only when it is joined to the digits ("1.5k", "5k"); a free-standing "k" is Roman Urdu "ke/ki"
// ("3 k baad" = after 3). The other multipliers may stand apart ("2 hazar").
const GLUED_ONLY = new Set([norm('k')]);
const FILLER_MAX = 10; // "budget hai 5000", "rs around 5000": one short word between the money word and the number

function scan(raw, variants) {
  const text = toWesternDigits(raw.normalize('NFKC')).toLowerCase();
  const tokens = [];
  let numberEnd = -1; // where the last number ended, to see whether a word is joined to it ("5k")
  for (const m of text.matchAll(SCAN)) {
    if (m[1] !== undefined) {
      tokens.push({ kind: 'num', text: m[1], value: Number(m[1].replace(/[,٬]/g, '').replace('٫', '.')), slashDash: /^\s*\/-/.test(text.slice(m.index + m[1].length)) });
      numberEnd = m.index + m[1].length;
    } else {
      const word = norm(m[2]);
      if (word) tokens.push({ kind: 'word', text: variants ? VARIANT_MAP.get(word) ?? word : word, glued: m.index === numberEnd });
    }
  }
  return tokens;
}

const isWord = (t, set) => t?.kind === 'word' && set.has(t.text);
// the multiplier right after position i ("hazar", or a joined "k"), or null
const multiplierAfter = (tokens, i) => (isWord(tokens[i + 1], MULTIPLIERS) && (!GLUED_ONLY.has(tokens[i + 1].text) || tokens[i + 1].glued) ? MULTIPLIERS.get(tokens[i + 1].text) : null);

// Every amount in the text: { value, first, last } (token positions of the whole money expression).
function amounts(tokens) {
  const found = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const multiplier = multiplierAfter(tokens, i);
    const spoken = t.kind === 'word' && SPOKEN.has(t.text) && multiplier !== null;
    if (t.kind !== 'num' && !spoken) continue;
    let value = t.kind === 'num' ? t.value : SPOKEN.get(t.text);
    let last = i;
    let money = spoken || Boolean(t.slashDash);
    if (multiplier !== null) {
      value *= multiplier;
      last = i + 1;
      money = true;
    }
    let first = i;
    if (isWord(tokens[i - 1], MONEY)) { money = true; first = i - 1; }
    else if (isWord(tokens[i - 2], MONEY) && tokens[i - 1].kind === 'word' && tokens[i - 1].text.length <= FILLER_MAX) { money = true; first = i - 2; }
    if (isWord(tokens[last + 1], MONEY)) { money = true; last += 1; }
    if (money) found.push({ value: Math.round(value * 1000) / 1000, first, last }); // 1.5 x 1000 without float noise
  }
  return found;
}

// The unit from words near the amount: day, hour, or a whole job. Both day and hour words near -> null (unclear).
function unitNear(tokens, { first, last }) {
  const window = tokens.slice(Math.max(0, first - UNIT_WINDOW), last + 1 + UNIT_WINDOW).map((t) => t.text);
  const hits = UNIT_TERMS.filter(({ tokens: seq }) => window.some((_, i) => seq.every((w, j) => window[i + j] === w)));
  const units = [...new Set(hits.map((h) => h.unit))];
  if (units.length > 1) return { unit: null, words: hits.map((h) => h.term) };
  return { unit: units[0] ?? 'job', words: hits.map((h) => h.term) };
}

// -> { suggested: { amount, unit } | null, matched: [words], outOfRange: boolean }
export function findBudget(raw, { variants = true } = {}) {
  if (typeof raw !== 'string' || !raw.trim()) return { suggested: null, matched: [], outOfRange: false };
  const tokens = scan(raw, variants);
  const found = amounts(tokens).map((a) => ({ ...a, ...unitNear(tokens, a) }));
  if (found.length === 0) return { suggested: null, matched: [], outOfRange: false };
  const matched = [...new Set(found.flatMap((a) => [...tokens.slice(a.first, a.last + 1).map((t) => t.text), ...a.words]))];
  const distinct = [...new Map(found.map((a) => [`${a.value}|${a.unit}`, a])).values()];
  if (distinct.length > 1 || distinct[0].unit === null) return { suggested: null, matched, outOfRange: false };
  const { value, unit } = distinct[0];
  const inRange = Number.isInteger(value) && value >= WAGE_RULES.AMOUNT_MIN && value <= WAGE_RULES.AMOUNT_MAX;
  return inRange ? { suggested: { amount: value, unit }, matched, outOfRange: false } : { suggested: null, matched, outOfRange: true };
}
