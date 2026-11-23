// Module 6: the job analyzer's tokens. PURE.
// Module 2's normalisation (normalize.js: NFC, lower case, Urdu/Arabic digits, letter variants, punctuation to
// spaces) and then the Roman Urdu spelling-variant map of config/jobPhrases.js. The SAME function is applied to the
// customer's text and to every term, so both sides are compared in one form. Module 2 itself is not changed.
import { normalizeText, tokenize } from '../skillExtractor/normalize.js';
import { containsSequence, tokenEquals } from '../skillExtractor/extractor.js';
import { SPELLING_VARIANTS } from '../../config/jobPhrases.js';

// variant -> its one spelling (both normalised)
export const VARIANT_MAP = new Map(
  Object.entries(SPELLING_VARIANTS).flatMap(([spelling, variants]) => variants.map((v) => [normalizeText(v), normalizeText(spelling)]))
);

export function jobTokens(text, { variants = true } = {}) {
  const tokens = tokenize(text);
  return variants ? tokens.map((t) => VARIANT_MAP.get(t) ?? t) : tokens;
}

// A term -> what to look for. 'a + b' = every part anywhere in the text (co-occurrence); else one word sequence.
export function compileTerm(term, { variants = true } = {}) {
  const parts = term.split(' + ').map((part) => jobTokens(part, { variants })).filter((p) => p.length > 0);
  return { term, parts };
}

// English plural tolerance on the last word, as in Module 2 ("fans" matches "fan").
export const termMatches = (tokens, compiled) =>
  compiled.parts.length > 0 && compiled.parts.every((seq) => containsSequence(tokens, seq, true));

// Where a word sequence starts in the text (exact words, no plural tolerance): for city names and address words.
export function sequenceStarts(tokens, seq) {
  const starts = [];
  outer: for (let i = 0; i + seq.length <= tokens.length; i += 1) {
    for (let j = 0; j < seq.length; j += 1) if (!tokenEquals(tokens[i + j], seq[j], false)) continue outer;
    starts.push(i);
  }
  return starts;
}
