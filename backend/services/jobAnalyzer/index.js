// Module 6: the one entry point of the job analyzer. PURE. The live API and the evaluation scripts import THIS file,
// so both run exactly the same code.
//
//   analyzeJob(text, { now, method = LIVE_METHOD, model = null, options })
//     rules   the rule-based word lists (services/jobAnalyzer/rules.js)
//     nb      the trade from the naive Bayes classifier; everything else as the hybrid
//     hybrid  (fixed in Batch 8A, 6.4) the trade from the rules when they give one (not null, no tie); otherwise the
//             classifier's top label (category.source says which). Skills, task type, city, day, time, urgency and
//             budget always come from the rules; when the trade came from the classifier, only the rules' skills of
//             that trade are kept, the task type's trade default (step 7) uses that trade, and the notes
//             category_tie / no_trade_words are removed.
// The output has the same shape for every method (docs/modules/MODULE-6.md, section 3.1). Nothing is saved.
import { LIVE_METHOD, METHOD_NAMES, METHODS } from '../../config/jobAnalyzer.js';
import { analyzeRules, DEFAULT_OPTIONS, findTaskType, missingFields } from './rules.js';
import { predict } from './naiveBayes.js';
import { jobTokens } from './tokens.js';

const CATEGORY_NOTES = new Set(['category_tie', 'no_trade_words']);

export function analyzeJob(text, { now, method = LIVE_METHOD, model = null, options = {} } = {}) {
  if (!METHODS.includes(method)) throw new Error(`Unknown job analyzer method "${method}"`);
  const rules = analyzeRules(text, { now, options });
  if (method === 'rules') return rules;
  if (!model) throw new Error(`The method "${method}" needs a trained model`);
  if (model.label !== 'category') throw new Error('The job analyzer needs a category model');

  const fromRules = method === 'hybrid' && rules.category.suggested !== null;
  if (fromRules) return { ...rules, method, methodName: METHOD_NAMES[method], versions: { ...rules.versions, model: model.modelId } };

  const nb = predict(model, text);
  const category = nb.suggested;
  const skills = rules.skills.filter((s) => s.category === category);
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const tokens = jobTokens(typeof text === 'string' ? text : '', { variants: merged.variants });
  return {
    ...rules,
    method,
    methodName: METHOD_NAMES[method],
    versions: { ...rules.versions, model: model.modelId },
    category: { suggested: category, tie: false, ranked: nb.ranked, matched: [], source: category ? 'nb' : null, words: nb.words },
    skills,
    taskType: findTaskType(tokens, category, skills, merged),
    notes: category ? rules.notes.filter((n) => !CATEGORY_NOTES.has(n)) : rules.notes,
    missing: missingFields(category, rules.city.suggested),
  };
}
