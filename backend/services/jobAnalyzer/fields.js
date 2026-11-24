// Module 6: the city, day, time of day, urgency and address hint in a job's text. PURE (the clock is passed in).
import { CITY_SPELLINGS } from '../../config/regions.js';
import {
  ADDRESS_WORDS, CITY_PLACE_WORDS, CITY_ROAD_WORDS, CITY_SPELLINGS_SKIPPED, DAY_OFFSETS, DAY_WORDS, SLOT_WORDS, URGENT_WORDS,
} from '../../config/jobPhrases.js';
import { pktDate } from '../booking/schedule.js';
import { compileTerm, jobTokens, sequenceStarts, termMatches } from './tokens.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

function compiled(variants) {
  const key = variants ? 'v' : 'plain';
  if (cache.has(key)) return cache.get(key);
  const opts = { variants };
  const skipped = new Set(CITY_SPELLINGS_SKIPPED.map((s) => jobTokens(s, opts).join(' ')));
  const words = (list) => new Set(list.flatMap((w) => jobTokens(w, opts)));
  const cities = CITY_SPELLINGS
    .map((c) => ({ ...c, tokens: jobTokens(c.spelling, opts) }))
    .filter((c) => c.tokens.length > 0)
    .map((c) => ({ ...c, everyday: skipped.has(c.tokens.join(' ')) }));
  const lists = (groups) => Object.entries(groups).map(([key, terms]) => ({ key, terms: terms.map((t) => compileTerm(t, opts)) }));
  const result = {
    cities,
    placeWords: words(CITY_PLACE_WORDS),
    roadWords: words(CITY_ROAD_WORDS),
    days: lists(DAY_WORDS),
    slots: lists(SLOT_WORDS),
    urgent: URGENT_WORDS.map((t) => compileTerm(t, opts)),
    address: ADDRESS_WORDS.map((t) => jobTokens(t, opts)),
  };
  cache.set(key, result);
  return result;
}

// One city -> its English name and region. Two different cities -> no suggestion, conflict (the customer chooses).
// A spelling inside a longer match does not count ("Mirpur Khas" is not also "Mirpur"). Then (word lists v3): a
// spelling directly before a road word is a road ("Murree Road"), and an everyday-word spelling ("mari", "اٹک")
// counts only directly before a place word ("مری میں"). Never a guess.
export function findCity(tokens, { variants = true } = {}) {
  const { cities, placeWords, roadWords } = compiled(variants);
  const hits = [];
  for (const c of cities) {
    for (const start of sequenceStarts(tokens, c.tokens)) hits.push({ city: c.city, region: c.region, start, end: start + c.tokens.length, words: c.tokens.join(' '), everyday: c.everyday });
  }
  const longest = hits.filter((h) => !hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start));
  const next = (h) => tokens[h.end] ?? '';
  const kept = longest.filter((h) => !roadWords.has(next(h)) && (!h.everyday || placeWords.has(next(h))));
  const names = [...new Set(kept.map((h) => h.city))];
  const matched = [...new Set(kept.sort((a, b) => a.start - b.start).map((h) => h.words))];
  if (names.length === 1) return { suggested: names[0], region: kept[0].region, matched, conflict: false };
  return { suggested: null, region: null, matched, conflict: names.length > 1 };
}

// Words of one group that appear in the text -> the one key, or null when none or two different keys appear.
function oneOf(groups, tokens) {
  const found = groups
    .map(({ key, terms }) => ({ key, words: terms.filter((t) => termMatches(tokens, t)).map((t) => t.term) }))
    .filter((g) => g.words.length > 0);
  return { key: found.length === 1 ? found[0].key : null, matched: [...new Set(found.flatMap((g) => g.words))] };
}

// "aaj / kal / parson" -> today / tomorrow / day after, and the calendar day in Pakistan time from `now`.
export function findDay(tokens, now, { variants = true } = {}) {
  const { key, matched } = oneOf(compiled(variants).days, tokens);
  return { suggested: key, date: key ? pktDate(new Date(now.getTime() + DAY_OFFSETS[key] * DAY_MS)) : null, matched };
}

export function findTimeSlot(tokens, { variants = true } = {}) {
  const { key, matched } = oneOf(compiled(variants).slots, tokens);
  return { suggested: key, matched };
}

// true only when an urgency word is in the text; false = "no urgency word found" (not a suggestion of "not urgent").
export function findUrgent(tokens, { variants = true } = {}) {
  const matched = compiled(variants).urgent.filter((t) => termMatches(tokens, t)).map((t) => t.term);
  return { suggested: matched.length > 0, matched };
}

// "house no 12", "gali number 5", "makan 12": an address word followed directly by a number. Never blocks.
export function looksLikeAddress(tokens, { variants = true } = {}) {
  return compiled(variants).address.some((seq) => sequenceStarts(tokens, seq).some((start) => /^\d+$/.test(tokens[start + seq.length] ?? '')));
}
