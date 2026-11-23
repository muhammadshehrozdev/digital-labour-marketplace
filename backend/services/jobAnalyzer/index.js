// Module 6: the one entry point of the job analyzer. PURE. The live API and the evaluation scripts import THIS file,
// so both run exactly the same code.
//
//   analyzeJob(text, { now, method = LIVE_METHOD, options })
//     rules   the rule-based word lists (services/jobAnalyzer/rules.js)
// The output has the same shape for every method (docs/modules/MODULE-6.md, section 3.1). Nothing is saved.
import { LIVE_METHOD, METHODS } from '../../config/jobAnalyzer.js';
import { analyzeRules } from './rules.js';

export function analyzeJob(text, { now, method = LIVE_METHOD, model = null, options = {} } = {}) {
  if (!METHODS.includes(method)) throw new Error(`Unknown job analyzer method "${method}"`);
  if (method !== 'rules' && !model) throw new Error(`The method "${method}" needs a trained model`);
  if (method !== 'rules') throw new Error(`The method "${method}" is not built yet`);
  return analyzeRules(text, { now, options });
}
