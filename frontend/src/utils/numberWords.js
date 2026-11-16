// Number words for voice typing (Batch 5). A COPY of NUMBER_WORDS_RAW in
// backend/services/skillExtractor/experience.js, so the website and the skill extractor read spoken
// numbers the same way. src/test/spokenNumbers.test.js fails if the two lists ever differ.
// (Frontend code never imports backend code.)
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
