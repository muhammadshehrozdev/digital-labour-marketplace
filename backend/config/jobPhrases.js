// Module 6 (Batch 8A): the word and phrase lists of the rule-based job analyzer (services/jobAnalyzer).
//
// STATUS OF THESE LISTS (read this first)
//   Version 1, written by Claude Code on 23-24 Nov 2026 from general knowledge of Pakistani household work, BEFORE
//   any real job description was collected. The team reviews them (docs/i18n/REVIEW-BATCH-8A.md has the Urdu ones).
//   In Batch 8C they may be improved using the DEVELOPMENT set only; the test set is never used for that
//   (docs/evaluation/job-analysis/PROTOCOL.md). Every change gets a dated line in the change log below and in
//   docs/CHANGELOG.md, and a new JOB_PHRASES_VERSION.
//
// Rules for writing terms
//   - lower case only (the error-catalog test reads every quoted UPPER_CASE word in config/ as an error code);
//     Urdu in Urdu script. normalize.js and the spelling variants below are applied to the terms AND to the text.
//   - a term matches whole words or a whole word sequence, never a part of a word.
//   - 'a + b' (co-occurrence) matches when every part appears anywhere in the text.
//   - the taxonomy (config/skillTaxonomy.js) is NOT changed here: that would change Module 2's results.
//
// Change log
//   2026-11-24-v1  first version (Batch 8A)
//   2026-11-24-v2  after the Batch 8A independent review, still before any real data: the Urdu spelling "اٹک" (also
//                  "stuck") is not used alone as the city Attock; a free-standing "k" is not a thousand (budget.js)

export const JOB_PHRASES_VERSION = '2026-11-24-v2';

// Roman Urdu spelling variants -> one spelling (Khan et al. 2020 describe why Roman Urdu spelling varies).
// Spelling only: one word for one word. Inflected forms ("pankhay") are phrase terms below, not variants.
// Known side effect: "nai" also means "new" in Roman Urdu; it only matters inside the fault phrases.
export const SPELLING_VARIANTS = Object.freeze({
  nahi: ['nhi', 'nahin', 'nai', 'nahee'],
  kar: ['kr'],
  karna: ['krna'],
  karni: ['krni'],
  karne: ['krne'],
  karwana: ['krwana', 'karvana', 'krvana'],
  karwani: ['krwani', 'karvani'],
  karwane: ['krwane', 'karvane'],
  karwa: ['krwa', 'karva'],
  gaya: ['gya'],
  gayi: ['gai', 'gyi', 'gayee'],
  raha: ['rha'],
  rahi: ['rhi'],
  rahe: ['rhe'],
  chahiye: ['chahye', 'chahie', 'chaiye', 'chahiay', 'chahiey', 'chaheye'],
  pani: ['paani'],
  bijli: ['bijlee', 'bjli'],
  thanda: ['thnda'],
  thandi: ['thndi'],
  kharab: ['kharaab', 'khrab'],
  theek: ['thik', 'theak', 'thek'],
  safai: ['safaai', 'safayi', 'safaee'],
  jaldi: ['jldi', 'jaldee'],
  foran: ['fauran'],
  abhi: ['abhee'],
  subah: ['subha'],
  dopahar: ['dopehar', 'dupahar', 'dopahr', 'dopeher'],
  shaam: ['sham'],
  lagana: ['lgana'],
  lagwana: ['lagvana', 'lgwana'],
  lagani: ['lgani'],
  lagwani: ['lagvani', 'lgwani'],
  samaan: ['saman'],
  deewar: ['diwar', 'dewar', 'deewaar', 'diwaar'],
  darar: ['darrar', 'daraar'],
  seelan: ['silan', 'seelen', 'sealan', 'seelin'],
  darwaza: ['darwaaza', 'darvaza'],
  tooti: ['tonti', 'toonti'],
  geyser: ['geezer', 'gizer', 'geysar'],
  pankha: ['pankhaa'],
  nalka: ['nalkaa'],
  mistri: ['mistry', 'mestri'],
  electrician: ['electrition', 'elctrician', 'electricion'],
  plumber: ['plumbar'],
  carpenter: ['carpainter', 'carpender'],
  fridge: ['frij', 'freej'],
  wiring: ['wairing'],
});

// Problem phrases per skill: how customers describe a SYMPTOM rather than a trade. They count as STRONG terms of
// that skill; they also let the weak terms of the same category count (the option phraseUnlocksWeak).
export const SKILL_PHRASES = Object.freeze({
  // ---- Electrical & Solar
  elec_general: [
    'bijli nahi aa rahi', 'bijli nahi aati', 'light nahi aa rahi', 'light chali jati', 'light chali jaati',
    'current lag raha', 'current lagta', 'karant lag', 'sparking',
    'بجلی نہیں آ رہی', 'لائٹ چلی جاتی', 'کرنٹ لگ',
  ],
  elec_wiring: ['wire jal', 'taar jal', 'wire jal gayi', 'تار جل'],
  elec_db: [
    'short ho gaya', 'short ho gayi', 'breaker gir', 'breaker girta', 'trip ho', 'fuse ur gaya', 'fuse udd gaya',
    'main switch', 'شارٹ ہو گیا', 'بریکر گر',
  ],
  elec_fittings: [
    'pankhay', 'pankhe', 'pankhon', 'pankha nahi chal', 'fan nahi chal', 'switch kharab', 'socket kharab',
    'tube light', 'tubelight', 'پنکھے', 'ٹیوب لائٹ',
  ],
  elec_ups: ['ups lagwana', 'ups lagwani', 'ups lagana', 'ups lagani', 'ups kharab', 'ups ki battery'],

  // ---- Plumbing & Sanitary
  plumb_fixtures: ['nalka', 'nalkay', 'nalke', 'nalkon', 'flush', 'flush tank', 'shower kharab', 'نلکا', 'نلکے', 'فلش'],
  plumb_leak: ['tapak', 'tapakta', 'tapakti', 'tapakna', 'pani tapak', 'pani beh raha', 'ٹپک', 'ٹپکتا', 'ٹپک رہا'],
  plumb_pump: [
    'pani nahi aa raha', 'pani nahi aa rahi', 'pani nahi aata', 'pani nahi chadh raha', 'pani nahi charh raha',
    'motor nahi chal', 'motor kharab', 'پانی نہیں آ رہا', 'پانی نہیں آتا', 'موٹر خراب',
  ],
  plumb_drain: ['gutter', 'gutter band', 'naali band', 'nali band', 'drain band', 'sink band', 'pani ruk gaya', 'نالی بند'],
  plumb_pipe: ['pipe phat gaya', 'pipe phat gayi', 'pipe toot gaya', 'pipe burst', 'پائپ پھٹ'],

  // ---- Construction & Masonry
  mason_waterproof: ['seelan', 'seelan aa rahi', 'chhat tapak', 'chhat se pani', 'chhat leak', 'سیلن', 'چھت ٹپک'],
  mason_plaster: ['darar + deewar', 'crack + deewar', 'crack + wall', 'دراڑ + دیوار', 'کریک + دیوار'],
  mason_general: ['chardiwari', 'char diwari', 'boundary wall', 'kamra banwana', 'kamra banana', 'چار دیواری'],

  // ---- Carpentry & Woodwork
  carp_doors: [
    'darwaza toot', 'darwaza kharab', 'darwaza band nahi', 'khirki toot', 'khirki kharab',
    'دروازہ ٹوٹ', 'دروازہ خراب',
  ],
  carp_locks: ['tala kharab', 'taala kharab', 'lock kharab', 'تالا خراب'],
  carp_furniture: ['kursi toot', 'bed toot', 'sofa repair', 'کرسی ٹوٹ'],

  // ---- Painting & Renovation
  paint_interior: [
    'rang karwana', 'rang karwani', 'paint karwana', 'paint karwani', 'rang roghan', 'rang o roghan',
    'رنگ کروانا', 'پینٹ کروانا', 'رنگ و روغن',
  ],

  // ---- AC & Appliance Repair
  ac_gas: [
    'thanda nahi', 'thandi nahi', 'cooling nahi', 'gas bharni', 'gas bharwani', 'gas dalwani', 'gas khatam',
    'ٹھنڈا نہیں', 'ٹھنڈک نہیں', 'کولنگ نہیں',
  ],
  ac_general: ['a c'],
  ac_install: ['ac lagwana', 'ac lagwani', 'ac lagana', 'ac lagani'],

  // ---- Home Maintenance
  home_general: ['chhota mota kaam', 'chota mota kaam'],
  home_fixtures: ['parda lagana', 'parday lagane', 'tasveer lagani', 'drill karna', 'پردے لگانے'],

  // ---- Domestic Work
  dom_cleaning: ['safai karwani', 'safai karwana', 'safai wali', 'deep cleaning', 'صفائی کروانی'],
  dom_cooking: ['khana banane wali', 'khana banane wala', 'khana pakane wali', 'cook chahiye', 'کھانا بنانے والی', 'کھانا پکانے والی'],
  dom_laundry: ['kapre dhone', 'kapray dhone', 'kapde dhone', 'kapray istri', 'کپڑے دھونے'],
  dom_childcare: ['bachon ko sambhalna', 'bache sambhalne', 'baby sitter', 'بچوں کی دیکھ بھال'],
  dom_eldercare: ['mareez ki dekh bhaal', 'buzurg ki dekh bhaal', 'attendant', 'بزرگ کی دیکھ بھال'],
  dom_general: ['ghar ka kaam', 'ghar ke kaam'],

  // ---- Moving & Loading
  move_shifting: [
    'shift karna', 'shift karni', 'shift karwana', 'shift karwani', 'ghar shift', 'samaan shift',
    'شفٹ کرنا', 'سامان شفٹ',
  ],
  move_loading: ['samaan utarna', 'samaan utarwana', 'samaan charhana', 'samaan chadhana', 'سامان اتارنا'],
});

// "I need nothing" phrases: they only EXPLAIN an empty result (note negative_phrase), as in Module 2.
export const JOB_NEGATIVE_PHRASES = Object.freeze([
  'kuch nahi chahiye', 'kuch bhi nahi chahiye', 'koi kaam nahi', 'nothing', 'no work', 'nothing needed',
  'کچھ نہیں چاہیے', 'کوئی کام نہیں',
]);

// Task type: the FIRST list (in this order) with a word in the text decides (5.4 of the batch plan).
// household_help words come before new_work words, because "banana" (new work) is also in "khana banana" (cooking).
export const TASK_TYPE_WORDS = Object.freeze([
  ['install', ['lagana', 'lagwana', 'lagani', 'lagwani', 'install', 'installation', 'fitting', 'fit karna', 'fit karwana', 'لگانا', 'لگوانا', 'لگانی', 'لگوانی']],
  ['repair', [
    'kharab', 'kaam nahi kar', 'nahi kar raha', 'nahi kar rahi', 'nahi chal', 'nahi aa raha', 'nahi aa rahi',
    'thanda nahi', 'band ho gaya', 'band ho gayi', 'toot', 'tut gaya', 'jal gaya', 'jal gayi', 'phat gaya',
    'short ho', 'leak', 'tapak', 'theek karna', 'theek karwana', 'repair', 'marammat', 'not working', 'broken',
    'خراب', 'ٹھیک', 'مرمت', 'نہیں چل', 'نہیں آ رہا', 'نہیں آ رہی', 'ٹوٹ گیا', 'ٹپک',
  ]],
  ['service', ['service', 'servicing', 'chemical wash', 'maintenance', 'سروس']],
  ['cleaning', ['safai', 'clean', 'cleaning', 'jharu', 'pocha', 'صفائی']],
  ['moving', ['shift', 'shifting', 'loading', 'unloading', 'samaan utarna', 'movers', 'شفٹ', 'شفٹنگ']],
  ['household_help', [
    'khana banana', 'khana pakana', 'kapray dhona', 'kapre dhona', 'bachon ki dekh bhaal', 'dekh bhaal',
    'کھانا پکانا', 'کھانا بنانا', 'کپڑے دھونا', 'دیکھ بھال',
  ]],
  ['new_work', ['banana', 'banwana', 'banani', 'banwani', 'tameer', 'construction', 'renovation', 'renovate', 'paint karwana', 'rang karwana', 'tiles lagwane', 'بنانا', 'بنوانا', 'تعمیر']],
]);

// When no task word is found: the trade's usual kind of work (null = could be install or repair).
// domestic_work: cleaning when the skill dom_cleaning was found, else household_help (services/jobAnalyzer/rules.js).
export const CATEGORY_DEFAULT_TASK = Object.freeze({
  construction_masonry: 'new_work',
  painting_renovation: 'new_work',
  carpentry_woodwork: 'new_work',
  moving_loading: 'moving',
  domestic_work: 'household_help',
});

// The day (5.6). "kal" means yesterday AND tomorrow; in a request it is read as the coming day (a stated limit).
// Urdu "کل" can also be read "kul" (all); also a stated limit. Weekday names and dates are not read in version 1.
export const DAY_WORDS = Object.freeze({
  today: ['aaj', 'today', 'abhi', 'آج', 'ابھی'],
  tomorrow: ['kal', 'tomorrow', 'کل'],
  day_after: ['parson', 'parso', 'پرسوں'],
});
export const DAY_OFFSETS = Object.freeze({ today: 0, tomorrow: 1, day_after: 2 });

// The time of day. Night has no slot (none of the booking slots fits), so night words give no suggestion.
export const SLOT_WORDS = Object.freeze({
  morning: ['subah', 'morning', 'صبح'],
  afternoon: ['dopahar', 'afternoon', 'دوپہر'],
  evening: ['shaam', 'evening', 'شام'],
});

export const URGENT_WORDS = Object.freeze([
  'urgent', 'urgently', 'emergency', 'foran', 'jaldi', 'abhi', 'asap', 'فوراً', 'فوری', 'جلدی', 'ایمرجنسی', 'ابھی',
]);

// Budget (5.7): a number is money only next to one of these words, or with a multiplier.
export const MONEY_WORDS = Object.freeze([
  'rs', 'pkr', 'rupay', 'rupaye', 'rupees', 'rupee', 'rupey', 'budget', 'روپے', 'روپیہ', 'روپئے', 'بجٹ',
]);
// "k" only when joined to the digits ("5k"); see services/jobAnalyzer/budget.js
export const MONEY_MULTIPLIERS = Object.freeze({ sau: 100, hazar: 1000, hazaar: 1000, k: 1000, lakh: 100000, lac: 100000, 'سو': 100, 'ہزار': 1000, 'لاکھ': 100000 });
// Spoken fractions before a multiplier: "dedh hazar" = 1,500, "dhai lakh" = 250,000.
export const NUMBER_FRACTIONS = Object.freeze({ dedh: 1.5, dhai: 2.5, 'ڈیڑھ': 1.5, 'ڈھائی': 2.5 });
// The unit counts only within UNIT_WINDOW words of the amount.
export const BUDGET_UNIT_WORDS = Object.freeze({
  day: ['per day', 'a day', 'daily', 'rozana', 'din ka', 'din ke', 'roz ka', 'roz ke', 'dihari', 'dihaari', 'روزانہ', 'دن کا', 'دن کے', 'دیہاڑی'],
  hour: ['per hour', 'an hour', 'hourly', 'ghanta', 'ghante ka', 'ghante ke', 'گھنٹہ', 'گھنٹے کا', 'گھنٹے کے'],
});
export const UNIT_WINDOW = 3;

// Address hint (5.8): one of these followed directly by a number -> note address_in_text (never blocks).
export const ADDRESS_WORDS = Object.freeze([
  'house no', 'house number', 'house', 'h no', 'h', 'makan number', 'makan no', 'makan', 'gali number', 'gali no',
  'gali', 'street no', 'street', 'st', 'plot no', 'plot', 'flat no', 'flat', 'مکان نمبر', 'گلی نمبر', 'مکان', 'گلی',
]);

// City spellings from config/regions.js that are also everyday words; the analyzer does not suggest a city from
// them alone ("atak" / "اٹک" = stuck, "wah" = an exclamation, "mari" / "مری" = died). "Attock", "Wah Cantt" and
// "Murree" work. Kept on purpose: "قصور" (Kasur; also "fault"), because in a job text it nearly always names the city.
export const CITY_SPELLINGS_SKIPPED = Object.freeze(['atak', 'اٹک', 'wah', 'mari', 'مری']);
