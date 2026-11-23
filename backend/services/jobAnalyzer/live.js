// Module 6: which analyzer the live API runs (6.6). Batch 8A: the rule-based word lists only (config/jobAnalyzer.js).
// A model trained on SYNTHETIC data is refused in production: the server falls back to the rules and logs one line
// (never any text). A missing or broken model also falls back to the rules.
import { LIVE_METHOD, LIVE_MODEL } from '../../config/jobAnalyzer.js';
import { analyzeJob } from './index.js';
import { checkModel } from './naiveBayes.js';

const RULES = Object.freeze({ method: 'rules', model: null });

export function chooseLiveAnalyzer({ method = LIVE_METHOD, model = LIVE_MODEL, env = process.env.NODE_ENV, log = console.warn } = {}) {
  if (method === 'rules') return { ...RULES, fallback: null };
  if (!model) {
    log(`Job analyzer: method "${method}" has no model; using the rule-based word lists.`);
    return { ...RULES, fallback: 'no_model' };
  }
  try {
    checkModel(model);
  } catch {
    log(`Job analyzer: the model for method "${method}" is not valid; using the rule-based word lists.`);
    return { ...RULES, fallback: 'invalid_model' };
  }
  if (env === 'production' && model.trainedOn?.synthetic === true) {
    log(`Job analyzer: model ${model.modelId} was trained on synthetic data and is refused in production; using the rule-based word lists.`);
    return { ...RULES, fallback: 'synthetic_model' };
  }
  return { method, model, fallback: null };
}

let chosen = null;
export const liveAnalyzer = () => (chosen ??= chooseLiveAnalyzer());

// The analysis the API returns and saves: the live method, the server's clock.
export const analyzeLive = (text, now) => {
  const { method, model } = liveAnalyzer();
  return analyzeJob(text, { now, method, model });
};
