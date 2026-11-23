// Module 6: the rule-based job analyzer, version job-rules-1 (Batch 8A). PURE: plain data in, plain data out; the
// clock is passed in. It extends Module 2's rule-based skill extractor with problem phrases, Roman Urdu spelling
// variants, task-type words, and the city, day, time, urgency, budget and address readers. It is word lists, not a
// trained model. Nothing is saved. No score, probability or percentage anywhere in the output.
//
// Rules (docs/modules/MODULE-6.md, section 3)
// 1. Whole words and whole word sequences only (Module 2's containsSequence / tokenEquals), never parts of words.
// 2. Terms = the taxonomy's strong and weak terms + the problem phrases of config/jobPhrases.js (phrases are strong).
// 3. A weak term counts only if the SAME category has strong evidence; a phrase is strong evidence too.
// 4. Categories are ordered by the number of distinct matched words, then taxonomy order. A tie is reported
//    (suggested: null, tie: true), never decided.
// 5. Negative phrases ("kuch nahi chahiye") only explain an empty result.
//
// Options exist only for the evaluation's ablation study (evaluation/job-analysis):
//   phrases            false -> no problem phrases
//   variants           false -> no spelling-variant map
//   phraseUnlocksWeak  false -> a phrase does not let weak terms of its category count
import { CATEGORIES, SKILLS, TAXONOMY_VERSION } from '../../config/skillTaxonomy.js';
import {
  CATEGORY_DEFAULT_TASK, JOB_NEGATIVE_PHRASES, JOB_PHRASES_VERSION, SKILL_PHRASES, TASK_TYPE_WORDS,
} from '../../config/jobPhrases.js';
import { ANALYZER_VERSION, METHOD_NAMES } from '../../config/jobAnalyzer.js';
import { compileTerm, jobTokens, termMatches } from './tokens.js';
import { findCity, findDay, findTimeSlot, findUrgent, looksLikeAddress } from './fields.js';
import { findBudget } from './budget.js';

export const DEFAULT_OPTIONS = Object.freeze({ phrases: true, variants: true, phraseUnlocksWeak: true });
const CATEGORY_ORDER = new Map(CATEGORIES.map((c, i) => [c.id, i]));
const cache = new Map();

function compile(options) {
  const key = JSON.stringify(options);
  if (cache.has(key)) return cache.get(key);
  const opts = { variants: options.variants };
  const terms = (list, kind) => list.map((t) => ({ ...compileTerm(t, opts), kind })).filter((t) => t.parts.length > 0);
  const result = {
    skills: SKILLS.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      terms: [...terms(s.strong, 'strong'), ...(options.phrases ? terms(SKILL_PHRASES[s.id] ?? [], 'phrase') : []), ...terms(s.weak, 'weak')],
    })),
    negatives: terms(JOB_NEGATIVE_PHRASES, 'negative'),
    tasks: TASK_TYPE_WORDS.map(([type, words]) => ({ type, terms: terms(words, 'task') })),
  };
  cache.set(key, result);
  return result;
}

// Category and skills (rules 1-5).
export function findTrade(tokens, options = DEFAULT_OPTIONS) {
  const { skills, negatives } = compile(options);
  const hits = skills.map((s) => {
    const matched = s.terms.filter((t) => termMatches(tokens, t));
    return { skill: s, strong: matched.filter((t) => t.kind === 'strong'), phrase: matched.filter((t) => t.kind === 'phrase'), weak: matched.filter((t) => t.kind === 'weak') };
  });
  const strongCategories = new Set(
    hits.filter((h) => h.strong.length || (options.phraseUnlocksWeak && h.phrase.length)).map((h) => h.skill.category)
  );
  const found = [];
  for (const h of hits) {
    const weak = strongCategories.has(h.skill.category) ? h.weak : [];
    const matched = [...new Set([...h.strong, ...h.phrase, ...weak].map((t) => t.term))];
    if (matched.length) found.push({ skillId: h.skill.id, name: h.skill.name, category: h.skill.category, matched });
  }
  if (found.length === 0) {
    const negative = negatives.some((t) => termMatches(tokens, t));
    return { skills: [], categories: [], suggested: null, tie: false, ranked: [], matched: [], reason: negative ? 'negative_phrase' : 'no_trade_words' };
  }
  const categories = CATEGORIES.map((c) => ({ id: c.id, words: [...new Set(found.filter((s) => s.category === c.id).flatMap((s) => s.matched))] }))
    .filter((c) => c.words.length)
    .sort((a, b) => b.words.length - a.words.length || CATEGORY_ORDER.get(a.id) - CATEGORY_ORDER.get(b.id));
  const top = categories.filter((c) => c.words.length === categories[0].words.length);
  const tie = top.length > 1;
  return {
    skills: found,
    categories,
    suggested: tie ? null : categories[0].id,
    tie,
    ranked: tie ? top.map((c) => c.id) : categories.map((c) => c.id),
    matched: [...new Set((tie ? top : [categories[0]]).flatMap((c) => c.words))],
    reason: null,
  };
}

// Task type: the first word list (in the fixed order) with a word in the text; else the category's usual work.
export function findTaskType(tokens, category, skills, options = DEFAULT_OPTIONS) {
  for (const { type, terms } of compile(options).tasks) {
    const matched = terms.filter((t) => termMatches(tokens, t)).map((t) => t.term);
    if (matched.length) return { suggested: type, tie: false, matched, fromCategory: false };
  }
  let fallback = category ? CATEGORY_DEFAULT_TASK[category] ?? null : null;
  if (category === 'domestic_work' && skills.some((s) => s.skillId === 'dom_cleaning')) fallback = 'cleaning';
  return { suggested: fallback, tie: false, matched: [], fromCategory: fallback !== null };
}

export const missingFields = (categorySuggested, citySuggested) => [
  ...(categorySuggested ? [] : ['category']),
  ...(citySuggested ? [] : ['city']),
  'area', // always: the neighbourhood is never read from the text (address hint below)
];

// The whole analysis of one text with the rules. `now` (a Date) is required: "aaj" and "kal" become calendar days.
export function analyzeRules(text, { now, options: userOptions = {} } = {}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('analyzeRules needs `now` (a Date)');
  const options = { ...DEFAULT_OPTIONS, ...userOptions };
  const raw = typeof text === 'string' ? text : '';
  const tokens = jobTokens(raw, { variants: options.variants });
  const opts = { variants: options.variants };

  const trade = findTrade(tokens, options);
  const taskType = findTaskType(tokens, trade.suggested, trade.skills, options);
  const city = findCity(tokens, opts);
  const when = findDay(tokens, now, opts);
  const timeSlot = findTimeSlot(tokens, opts);
  const urgent = findUrgent(tokens, opts);
  const budget = findBudget(raw, opts);

  const notes = [];
  if (trade.reason) notes.push(trade.reason);
  if (trade.tie) notes.push('category_tie');
  if (city.conflict) notes.push('city_conflict');
  if (budget.outOfRange) notes.push('budget_out_of_range');
  if (looksLikeAddress(tokens, opts)) notes.push('address_in_text');

  return {
    method: 'rules',
    methodName: METHOD_NAMES.rules,
    versions: { analyzer: ANALYZER_VERSION, taxonomy: TAXONOMY_VERSION, phrases: JOB_PHRASES_VERSION, model: null },
    category: { suggested: trade.suggested, tie: trade.tie, ranked: trade.ranked, matched: trade.matched, source: trade.suggested ? 'rules' : null, words: [] },
    skills: trade.skills,
    taskType,
    city,
    when,
    timeSlot,
    urgent,
    budget: { suggested: budget.suggested, matched: budget.matched },
    notes,
    missing: missingFields(trade.suggested, city.suggested),
  };
}
