// Regions of Pakistan and the city table (Module 5, decision D-069). PURE: data and one lookup.
// Price ranges and minimum wages depend on the province, but `Booking.city` is free text, so a city is
// mapped to its region through this table. An unknown city gives `null`: the app never guesses.
//
// Region codes are object KEYS here (never quoted strings), because the error-catalog test treats every
// quoted UPPER_CASE word in config/ as an error code.
import { normalizeText } from '../services/skillExtractor/normalize.js';

// Names in the three website languages. `short` is the name used in sentences ("in Islamabad").
export const REGIONS = Object.freeze({
  ICT: { en: 'Islamabad Capital Territory', ur: 'اسلام آباد وفاقی علاقہ', 'ur-Latn': 'Islamabad Capital Territory', short: { en: 'Islamabad', ur: 'اسلام آباد', 'ur-Latn': 'Islamabad' } },
  PB: { en: 'Punjab', ur: 'پنجاب', 'ur-Latn': 'Punjab' },
  SD: { en: 'Sindh', ur: 'سندھ', 'ur-Latn': 'Sindh' },
  KP: { en: 'Khyber Pakhtunkhwa', ur: 'خیبر پختونخوا', 'ur-Latn': 'Khyber Pakhtunkhwa' },
  BA: { en: 'Balochistan', ur: 'بلوچستان', 'ur-Latn': 'Balochistan' },
  GB: { en: 'Gilgit-Baltistan', ur: 'گلگت بلتستان', 'ur-Latn': 'Gilgit-Baltistan' },
  AJK: { en: 'Azad Jammu and Kashmir', ur: 'آزاد جموں و کشمیر', 'ur-Latn': 'Azad Jammu o Kashmir' },
});
export const REGION_CODES = Object.freeze(Object.keys(REGIONS));
// `PK` = all of Pakistan (used by the admin price guide and the "country" level of the price range).
export const COUNTRY = 'PK';

// The main cities: [English name, Urdu name, other spellings people type (Roman Urdu, old names)].
const CITIES_BY_REGION = {
  ICT: [['Islamabad', 'اسلام آباد', []]],
  PB: [
    ['Rawalpindi', 'راولپنڈی', ['pindi', 'rawal pindi', 'پنڈی']],
    ['Lahore', 'لاہور', ['lahor']],
    ['Faisalabad', 'فیصل آباد', ['faisal abad']],
    ['Multan', 'ملتان', []],
    ['Gujranwala', 'گوجرانوالہ', ['gujranwala']],
    ['Sialkot', 'سیالکوٹ', []],
    ['Bahawalpur', 'بہاولپور', []],
    ['Sargodha', 'سرگودھا', []],
    ['Sheikhupura', 'شیخوپورہ', ['shekhupura']],
    ['Gujrat', 'گجرات', []],
    ['Jhelum', 'جہلم', []],
    ['Sahiwal', 'ساہیوال', []],
    ['Okara', 'اوکاڑہ', []],
    ['Kasur', 'قصور', ['qasur']],
    ['Rahim Yar Khan', 'رحیم یار خان', ['rahimyar khan']],
    ['Dera Ghazi Khan', 'ڈیرہ غازی خان', ['dg khan', 'd g khan']],
    ['Attock', 'اٹک', ['atak']],
    ['Chakwal', 'چکوال', []],
    ['Wah Cantt', 'واہ کینٹ', ['wah', 'wah cantonment']],
    ['Taxila', 'ٹیکسلا', []],
    ['Murree', 'مری', ['mari']],
  ],
  SD: [
    ['Karachi', 'کراچی', []],
    ['Hyderabad', 'حیدرآباد', ['haiderabad', 'حیدر آباد']],
    ['Sukkur', 'سکھر', ['sakhar']],
    ['Larkana', 'لاڑکانہ', []],
    ['Nawabshah', 'نوابشاہ', ['shaheed benazirabad', 'benazirabad', 'شہید بینظیر آباد', 'نواب شاہ']],
    ['Mirpur Khas', 'میرپور خاص', ['mirpurkhas']],
  ],
  KP: [
    ['Peshawar', 'پشاور', []],
    ['Mardan', 'مردان', []],
    ['Abbottabad', 'ایبٹ آباد', ['abbotabad', 'abbottabad']],
    ['Mingora', 'مینگورہ', ['swat', 'سوات']],
    ['Kohat', 'کوہاٹ', []],
    ['Dera Ismail Khan', 'ڈیرہ اسماعیل خان', ['di khan', 'd i khan']],
    ['Nowshera', 'نوشہرہ', ['naushera']],
    ['Mansehra', 'مانسہرہ', []],
    ['Haripur', 'ہری پور', []],
    ['Bannu', 'بنوں', []],
  ],
  BA: [
    ['Quetta', 'کوئٹہ', []],
    ['Gwadar', 'گوادر', []],
    ['Turbat', 'تربت', []],
    ['Khuzdar', 'خضدار', []],
  ],
  GB: [
    ['Gilgit', 'گلگت', []],
    ['Skardu', 'سکردو', []],
  ],
  AJK: [
    ['Muzaffarabad', 'مظفرآباد', ['مظفر آباد', 'muzafarabad']],
    ['Mirpur', 'میرپور', []],
  ],
};

// The lookup form of a city name: Unicode NFC, lower case, Western digits, the Urdu letter variants and
// punctuation as in the skill extractor, and NO spaces at all ("Rawal Pindi" = "rawalpindi", "اسلام آباد" =
// "اسلام‌آباد" with an invisible joiner).
export const cityKey = (city) => normalizeText(String(city ?? '')).replace(/\s+/g, '');

// key -> { region, city (the English name) }
const LOOKUP = new Map();
for (const [region, cities] of Object.entries(CITIES_BY_REGION)) {
  for (const [en, ur, others] of cities) {
    for (const spelling of [en, ur, ...others]) LOOKUP.set(cityKey(spelling), Object.freeze({ region, city: en }));
  }
}

// The city table for the API and the docs: [{ city, ur, region }].
export const CITY_REGIONS = Object.freeze(
  Object.entries(CITIES_BY_REGION).flatMap(([region, cities]) => cities.map(([city, ur]) => Object.freeze({ city, ur, region })))
);

// The region code of a city, or null when the city is not in the table (never a guess).
export function regionOf(city) {
  const key = cityKey(city);
  return key ? LOOKUP.get(key)?.region ?? null : null;
}

// The English name of a known city ("pindi" -> "Rawalpindi"), or null. Used to compare cities in the
// price range, so "Pindi" and "Rawalpindi" are the same market.
export function canonicalCity(city) {
  const key = cityKey(city);
  return key ? LOOKUP.get(key)?.city ?? null : null;
}

// A comparable key for any city: the English name of a known city, else its lookup form.
export const marketCity = (city) => canonicalCity(city) ?? cityKey(city);
