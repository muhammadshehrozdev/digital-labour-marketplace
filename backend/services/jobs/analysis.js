// Module 6: the analysis stored on a job request (4.2 of the batch plan). PURE.
// Computed on the SERVER at save and on every edit (never taken from the client):
//   suggested  the analyzer's values for the saved description (ids and values only, never text)
//   changed    per field: true = the customer saved something else, false = kept the suggestion,
//              null = nothing was suggested. "Kept" is use, not correctness (D-088).
import { skillById } from '../../config/skillTaxonomy.js';
import { marketCity } from '../../config/regions.js';
import { CHANGED_FIELDS, JOB_RULES } from '../../config/jobRules.js';

// The analyzer output (services/jobAnalyzer) -> what is stored as `suggested`.
export function suggestedFrom(output) {
  return {
    category: output.category.suggested,
    categoryTie: output.category.tie ? [...output.category.ranked] : [],
    skills: output.skills.map((s) => s.skillId),
    taskType: output.taskType.suggested,
    city: output.city.suggested,
    preferredDate: output.when.date,
    timeSlot: output.timeSlot.suggested,
    urgent: output.urgent.suggested === true,
    budget: output.budget.suggested ? { amount: output.budget.suggested.amount, unit: output.budget.suggested.unit } : null,
    notes: [...output.notes],
  };
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
// Kept: the same set; or, when more suggested skills fit the trade than a job may hold (MAX_SKILLS), the customer saved
// the maximum and every saved skill was suggested (keeping all of them was not possible; Batch 8A review).
export const keptSkills = (suggested, saved) => sameSet(suggested, saved)
  || (suggested.length > JOB_RULES.MAX_SKILLS && saved.length === JOB_RULES.MAX_SKILLS && saved.every((id) => suggested.includes(id)));

// The suggested skills that fit the job's (confirmed) trade: the ones the website can pre-select for it.
export const suggestedSkillsFor = (suggested, category) => (suggested.skills ?? []).filter((id) => skillById(id)?.category === category);

export function changedFor(suggested, job) {
  const s = suggested;
  const skills = suggestedSkillsFor(s, job.category);
  const saved = (job.skills ?? []).map((x) => x.skillId ?? x);
  const differs = {
    category: s.category ? job.category !== s.category : null,
    skills: skills.length ? !keptSkills(skills, saved) : null,
    taskType: s.taskType ? (job.taskType ?? null) !== s.taskType : null,
    city: s.city ? marketCity(job.city) !== marketCity(s.city) : null,
    preferredDate: s.preferredDate ? (job.preferredDate ?? null) !== s.preferredDate : null,
    timeSlot: s.timeSlot ? (job.timeSlot ?? null) !== s.timeSlot : null,
    urgent: s.urgent ? job.urgent !== true : null,
    budget: s.budget ? !(job.budget && job.budget.amount === s.budget.amount && job.budget.unit === s.budget.unit) : null,
  };
  return Object.fromEntries(CHANGED_FIELDS.map((f) => [f, differs[f]]));
}

export const analysisRecord = (output, job, now) => {
  const suggested = suggestedFrom(output);
  return { method: output.method, versions: { ...output.versions }, analyzedAt: now, suggested, changed: changedFor(suggested, job) };
};
