// Text normalisation for the rule-based skill extractor (Module 2).
// The SAME function is applied to the worker's text and to every taxonomy term, so both
// sides are compared in one form. Pure function, no database.

const URDU_DIGITS = /[۰-۹]/g; // ۰-۹
const ARABIC_DIGITS = /[٠-٩]/g; // ٠-٩
const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g; // zer, zabar, pesh, shadda, tatweel ...
const ZERO_WIDTH = /[​-‍﻿]/g;

// Letter variants that look the same but have different codes (Arabic vs Urdu keyboards).
const LETTER_VARIANTS = [
  [/ي/g, 'ی'], // ي -> ی
  [/ى/g, 'ی'], // ى -> ی
  [/ك/g, 'ک'], // ك -> ک
  [/ه/g, 'ہ'], // ه -> ہ
];

export function normalizeText(input) {
  if (typeof input !== 'string') return '';
  let text = input.normalize('NFC').toLowerCase();
  text = text
    .replace(URDU_DIGITS, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(ARABIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(ARABIC_DIACRITICS, '')
    .replace(ZERO_WIDTH, '');
  for (const [from, to] of LETTER_VARIANTS) text = text.replace(from, to);
  // Punctuation (including Urdu ، ۔ ؟) and symbols become spaces.
  text = text.replace(/[^\p{L}\p{N}\p{M}\s]/gu, ' ');
  // "5saal" -> "5 saal", "r22" -> "r 22" (terms get the same treatment, so they still match).
  text = text.replace(/(\p{N})(\p{L})/gu, '$1 $2').replace(/(\p{L})(\p{N})/gu, '$1 $2');
  return text.replace(/\s+/g, ' ').trim();
}

export function tokenize(input) {
  const text = normalizeText(input);
  return text ? text.split(' ') : [];
}

// Ablation "dictionary only": lower case and split on spaces, nothing else.
export function tokenizeRaw(input) {
  if (typeof input !== 'string') return [];
  return input.toLowerCase().split(/\s+/).filter(Boolean);
}

export const hasArabicScript = (text) => /[؀-ۿ]/.test(text);
