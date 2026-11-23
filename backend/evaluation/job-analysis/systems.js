// Module 6: the systems compared in the evaluation (7.4). Every one runs the SAME code as the live API
// (services/jobAnalyzer/index.js) or Module 2 as it is. A prediction is plain data:
//   { category (id or null), skills (Set of ids), taskType, city, when, timeSlot, budget, urgent, hasFields }
// hasFields = false for systems that only give a trade (the baselines): they are left out of the field tables.
import { analyzeJob } from '../../services/jobAnalyzer/index.js';
import { predict } from '../../services/jobAnalyzer/naiveBayes.js';
import { extractSkills } from '../../services/skillExtractor/extractor.js';

// The clock of the evaluation: day words are compared as words (today / tomorrow / day_after), so it does not
// change any compared value. Fixed, so every run is the same.
export const EVALUATION_NOW = new Date('2026-11-24T10:00:00+05:00');

const fromAnalysis = (a) => ({
  category: a.category.suggested,
  skills: new Set(a.skills.map((s) => s.skillId)),
  taskType: a.taskType.suggested,
  city: a.city.suggested,
  when: a.when.suggested,
  timeSlot: a.timeSlot.suggested,
  budget: a.budget.suggested,
  urgent: a.urgent.suggested,
  hasFields: true,
});
const tradeOnly = (category, skills = new Set()) => ({ category, skills, taskType: null, city: null, when: null, timeSlot: null, budget: null, urgent: false, hasFields: false });

// The most frequent label of the training (development) file: the model's largest prior; a tie -> the earlier label.
export function majorityLabel(model) {
  return model.labels.reduce((best, c) => (best === null || model.logPrior[c] > model.logPrior[best] ? c : best), null);
}

export const SYSTEM_NAMES = Object.freeze(['rules', 'rules_no_phrases', 'rules_no_variants', 'rules_no_phrase_unlock', 'baseline_module2', 'baseline_majority', 'nb', 'nb_no_variants', 'hybrid']);

/**
 * model: the category model (from the development file); nvModel: the same parameters without spelling variants.
 * Returns { name: (text) => prediction } for every system that can run (nb_no_variants needs nvModel).
 */
export function buildSystems({ model, nvModel = null, now = EVALUATION_NOW }) {
  const rules = (options) => (text) => fromAnalysis(analyzeJob(text, { now, method: 'rules', options }));
  const majority = majorityLabel(model);
  const systems = {
    rules: rules({}),
    rules_no_phrases: rules({ phrases: false }),
    rules_no_variants: rules({ variants: false }),
    rules_no_phrase_unlock: rules({ phraseUnlocksWeak: false }),
    baseline_module2: (text) => {
      const m = extractSkills(text);
      return tradeOnly(m.suggestedCategory, new Set(m.skills.map((s) => s.skillId)));
    },
    baseline_majority: () => tradeOnly(majority),
    nb: (text) => fromAnalysis(analyzeJob(text, { now, method: 'nb', model })),
    hybrid: (text) => fromAnalysis(analyzeJob(text, { now, method: 'hybrid', model })),
  };
  if (nvModel) systems.nb_no_variants = (text) => fromAnalysis(analyzeJob(text, { now, method: 'nb', model: nvModel }));
  return Object.fromEntries(SYSTEM_NAMES.filter((n) => systems[n]).map((n) => [n, systems[n]]));
}

// Task type (secondary comparison): the rules' task type against the task-type classifier.
export function taskTypeSystems({ taskModel = null, now = EVALUATION_NOW }) {
  const systems = { rules: (text) => analyzeJob(text, { now, method: 'rules' }).taskType.suggested };
  if (taskModel) systems.nb = (text) => predict(taskModel, text).suggested;
  return systems;
}
