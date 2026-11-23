// Module 6 (Batch 8A): which job analyzer the live API uses, and the names of the methods.
//
// In Batch 8A the live API uses the rule-based word lists only (D-085). The classifier goes live only if the frozen
// rule of docs/evaluation/job-analysis/PROTOCOL.md (step 7) says so in Batch 8C. Then `jobs:train --format js`
// writes config/jobModel.generated.js and this file imports it STATICALLY, so Vercel bundles it
// (a JSON file read with fs at runtime would not be bundled):
//
//   import LIVE_MODEL_FILE from './jobModel.generated.js';
//   export const LIVE_MODEL = LIVE_MODEL_FILE;
//
// services/jobAnalyzer/live.js refuses a model trained on synthetic data in production (it falls back to rules).

export const ANALYZER_VERSION = 'job-rules-1';
export const METHODS = Object.freeze(['rules', 'nb', 'hybrid']);
export const METHOD_NAMES = Object.freeze({
  rules: 'rule-based word lists',
  nb: "naive Bayes classifier: a simple word-count model trained on the team's labelled examples",
  hybrid: 'rule-based word lists first; the naive Bayes classifier only when the word lists give no trade',
});

export const LIVE_METHOD = 'rules';
export const LIVE_MODEL = null;
