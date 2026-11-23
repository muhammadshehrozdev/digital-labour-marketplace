// Rule-based (dictionary) skill extractor — Module 2 (docs/DECISIONS.md).
// It is NOT machine learning: it looks up taxonomy terms in the worker's text.
//
// Rules
// 1. Match whole tokens and whole token sequences only, in every script (fixes M2-5).
// 2. Strong term -> the skill. Weak term -> the skill only if a strong term of the SAME
//    category is also in the text (fixes M2-6). This trades recall for precision on purpose;
//    the evaluation harness measures the cost.
// 3. Negative phrases ("kuch nahi aata") only explain an empty result; they never delete
//    anything (fixes M2-4).
// 4. Output is a SUGGESTION: skills with the matched words, all matching categories, and the
//    stated experience. No percentage, no level, no score (fixes M2-8). Nothing is saved.
//
// Options exist only for the evaluation's ablation study (evaluation/skill-extraction):
//   normalize  false -> lower-case + split on spaces only ("dictionary only")
//   urduTerms  false -> ignore every term written in Urdu script
//   weakRule   false -> weak terms count like strong terms
import { CATEGORIES, SKILLS } from '../../config/skillTaxonomy.js';
import { tokenize, tokenizeRaw, hasArabicScript } from './normalize.js';
import { extractExperience } from './experience.js';

export const MAX_TEXT_LENGTH = 2000;

const NEGATIVE_PHRASES = [
  'kuch nahi aata', 'kuch nahi ata', 'kuch nhi ata', 'kuch nhi aata', 'kuch nahin aata',
  'kuch bhi nahi aata', 'koi kaam nahi aata', 'koi skill nahi', 'mujhe kuch nahi aata',
  'no experience', 'no skill', 'no skills', 'nothing', 'dont know anything', 'don t know anything',
  'کچھ نہیں آتا', 'کوئی کام نہیں آتا',
];

const DEFAULTS = { normalize: true, urduTerms: true, weakRule: true };
const compiledCache = new Map();

// Turn every taxonomy term into a token list once per option set.
function compile(options) {
  const key = JSON.stringify(options);
  if (compiledCache.has(key)) return compiledCache.get(key);
  const split = options.normalize ? tokenize : tokenizeRaw;
  const prepare = (terms, kind) =>
    terms
      .filter((term) => options.urduTerms || !hasArabicScript(term))
      .map((term) => ({ term, kind, tokens: split(term) }))
      .filter((t) => t.tokens.length > 0);
  const skills = SKILLS.map((s) => ({
    ...s,
    terms: [...prepare(s.strong, 'strong'), ...prepare(s.weak, options.weakRule ? 'weak' : 'strong')],
  }));
  const negatives = NEGATIVE_PHRASES.map((p) => split(p));
  const compiled = { skills, negatives, split };
  compiledCache.set(key, compiled);
  return compiled;
}

// English plural tolerance (only with normalisation): "fans" matches "fan", "geysers" matches "geyser".
export function tokenEquals(textToken, termToken, allowPlural) {
  if (textToken === termToken) return true;
  if (!allowPlural || !/^[a-z]+$/.test(termToken)) return false;
  return textToken === `${termToken}s` || textToken === `${termToken}es`;
}

export function containsSequence(tokens, seq, allowPlural) {
  outer: for (let i = 0; i + seq.length <= tokens.length; i += 1) {
    for (let j = 0; j < seq.length; j += 1) {
      const last = j === seq.length - 1;
      if (!tokenEquals(tokens[i + j], seq[j], allowPlural && last)) continue outer;
    }
    return true;
  }
  return false;
}

const emptyResult = (reason, experience = { experience: null, note: null }) => ({
  skills: [],
  categories: [],
  suggestedCategory: null,
  categoryTie: false,
  suggestedOccupation: null,
  experience: experience.experience,
  experienceNote: experience.note,
  noSkillReason: reason,
});

export function extractSkills(text, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };
  if (typeof text !== 'string' || !text.trim()) return emptyResult('empty');

  const { skills, negatives, split } = compile(options);
  const tokens = split(text);
  const experience = extractExperience(text);

  // Pass 1: which terms appear?
  const hits = skills.map((s) => ({
    skill: s,
    strong: s.terms.filter((t) => t.kind === 'strong' && containsSequence(tokens, t.tokens, options.normalize)),
    weak: s.terms.filter((t) => t.kind === 'weak' && containsSequence(tokens, t.tokens, options.normalize)),
  }));

  // Categories that have at least one strong term in the text.
  const strongCategories = new Set(hits.filter((h) => h.strong.length).map((h) => h.skill.category));

  // Pass 2: keep a skill if it has a strong term, or a weak term in a category with a strong term.
  const found = [];
  for (const h of hits) {
    const weakAllowed = strongCategories.has(h.skill.category) ? h.weak : [];
    const matched = [...h.strong, ...weakAllowed].map((t) => t.term);
    if (matched.length) {
      found.push({ skillId: h.skill.id, name: h.skill.name, category: h.skill.category, matched: [...new Set(matched)] });
    }
  }

  if (found.length === 0) {
    const negative = negatives.some((seq) => containsSequence(tokens, seq, false));
    return emptyResult(negative ? 'negative_phrase' : 'no_trade_words', experience);
  }

  // All matching categories, strongest first (number of distinct matched words), in taxonomy order on ties.
  const categories = CATEGORIES.map((c, order) => {
    const inCat = found.filter((s) => s.category === c.id);
    const words = [...new Set(inCat.flatMap((s) => s.matched))];
    return { id: c.id, label: c.label, matched: words, skillIds: inCat.map((s) => s.skillId), order };
  })
    .filter((c) => c.skillIds.length)
    .sort((a, b) => b.matched.length - a.matched.length || a.order - b.order)
    .map(({ order, ...rest }) => rest); // eslint-disable-line no-unused-vars

  // A tie is reported, never decided silently (fixes M2-12).
  const tie = categories.length > 1 && categories[0].matched.length === categories[1].matched.length;
  const top = tie ? null : categories[0].id;

  return {
    skills: found,
    categories,
    suggestedCategory: top,
    categoryTie: tie,
    suggestedOccupation: top ? CATEGORIES.find((c) => c.id === top).occupation : null,
    experience: experience.experience,
    experienceNote: experience.note,
    noSkillReason: null,
  };
}
