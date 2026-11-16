// Batch 5 (D-036): numbers said aloud become digits. A phone number must be exact, so anything not
// understood gives null (nothing is written) instead of a guess.
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { spokenToDigits, digitsForSpeech } from '../utils/spokenNumbers';
import { NUMBER_WORDS_RAW } from '../utils/numberWords';

describe('phone numbers said digit by digit', () => {
  test.each([
    ['03001234567', '03001234567'],
    ['0300 1234567', '03001234567'],
    ['0300-123-4567', '03001234567'],
    ['+92 300 1234567', '923001234567'],
    ['zero three zero zero one two three four five six seven', '03001234567'],
    ['oh three double zero one two three four five six seven', '03001234567'],
    ['zero three triple zero one two', '0300012'],
    ['sifar teen sifar sifar ek do teen char paanch chhay saat', '03001234567'],
    ['sifar teen dabal sifar ek do teen chaar panch che saat', '03001234567'],
    ['صفر تین صفر صفر ایک دو تین چار پانچ چھ سات', '03001234567'],
    ['۰۳۰۰۱۲۳۴۵۶۷', '03001234567'],
    ['٠٣٠٠١٢٣٤٥٦٧', '03001234567'],
    ['صفر تین ڈبل صفر ۱۲۳ چار پانچ چھ سات', '03001234567'],
    ['Zero Three Zero Zero', '0300'],
  ])('%s -> %s', (said, digits) => {
    expect(spokenToDigits(said, 'digits')).toBe(digits);
  });

  test.each([
    ['zero three banana one'],
    ['my number is 0300'],
    ['double'],
    ['zero three double'],
    [''],
    ['   '],
    ['twelve'], // a number word is not a single digit: a phone number must be said digit by digit
  ])('not understood: %j -> null (nothing is written)', (said) => {
    expect(spokenToDigits(said, 'digits')).toBeNull();
  });
});

describe('amounts and years said as a number', () => {
  test.each([
    ['5', '5'],
    ['five', '5'],
    ['paanch', '5'],
    ['پانچ', '5'],
    ['5 saal', '5'],
    ['twenty five', '25'],
    ['twenty five years', '25'],
    ['pachees', '25'],
    ['4000', '4000'],
    ['4,000', '4000'],
    ['4 hazaar', '4000'],
    ['four thousand', '4000'],
    ['char hazaar paanch sau', '4500'],
    ['چار ہزار پانچ سو', '4500'],
    ['four thousand five hundred rupees', '4500'],
    ['Rs 3500', '3500'],
    ['3500 روپے', '3500'],
    ['ek lakh', '100000'],
    ['۲۵۰۰', '2500'],
    ['do sau pachas', '250'],
  ])('%s -> %s', (said, number) => {
    expect(spokenToDigits(said, 'number')).toBe(number);
  });

  test.each([
    ['five twenty'],
    ['5 3'],
    ['four banana'],
    ['rupees'],
    [''],
  ])('not understood: %j -> null', (said) => {
    expect(spokenToDigits(said, 'number')).toBeNull();
  });
});

test('a number is read back one digit at a time', () => {
  expect(digitsForSpeech('0300-1234567')).toBe('0 3 0 0 1 2 3 4 5 6 7');
  expect(digitsForSpeech('')).toBe('');
});

// The website's number words are a COPY of the skill extractor's list (frontend code never imports
// backend code). If someone changes one list, this test fails until the other is changed too.
test('the number words are the same as in backend/services/skillExtractor/experience.js', () => {
  const source = readFileSync('../backend/services/skillExtractor/experience.js', 'utf8');
  const block = source.match(/const NUMBER_WORDS_RAW = \{([\s\S]*?)\n\};/)[1];
  const backend = Object.fromEntries(
    [...block.matchAll(/'?([^\s',:{}]+)'?\s*:\s*(\d+)/g)].map(([, word, n]) => [word, Number(n)]),
  );
  expect(Object.keys(backend).length).toBeGreaterThan(70);
  expect(NUMBER_WORDS_RAW).toEqual(backend);
});
