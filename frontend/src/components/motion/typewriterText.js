// Timing and text splitting for the hero typewriter (Batch 3, Part 4.5).
export const TYPE_MS = 45;
export const ERASE_MS = 25;
export const HOLD_MS = 2200;

// Split text into grapheme clusters (what a reader sees as one letter), so an Urdu letter with
// its marks, or an emoji, is never cut in half while typing.
export function graphemes(text, lang) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(lang, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
  }
  return Array.from(text); // code points: still never splits a surrogate pair
}
