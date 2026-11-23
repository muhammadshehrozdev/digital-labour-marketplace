// Module 6: "how often did customers keep a suggestion?" (4.10 of the batch plan; decision D-088). PURE.
// kept         a suggestion existed and the saved value equals it
// changed      a suggestion existed and the saved value differs
// notSuggested no suggestion
// A customer may keep a wrong suggestion or change a right one, so these numbers describe USE, not correctness.
// Aggregates only: no text, no ids.
import { CHANGED_FIELDS } from '../../config/jobRules.js';
import { suggestedSkillsFor } from './analysis.js';

const count = (list, key) => list.reduce((acc, x) => ({ ...acc, [x[key]]: (acc[x[key]] ?? 0) + 1 }), {});

export function keptStats(jobs) {
  const fields = Object.fromEntries(CHANGED_FIELDS.map((f) => [f, { kept: 0, changed: 0, notSuggested: 0 }]));
  fields.skills.added = 0;
  fields.skills.removed = 0;
  for (const job of jobs) {
    const changed = job.analysis?.changed ?? {};
    for (const f of CHANGED_FIELDS) {
      const v = changed[f];
      if (v === true) fields[f].changed += 1;
      else if (v === false) fields[f].kept += 1;
      else fields[f].notSuggested += 1;
    }
    const suggested = suggestedSkillsFor(job.analysis?.suggested ?? {}, job.category);
    const saved = (job.skills ?? []).map((s) => s.skillId);
    fields.skills.added += saved.filter((id) => !suggested.includes(id)).length;
    fields.skills.removed += suggested.filter((id) => !saved.includes(id)).length;
  }
  return {
    jobs: jobs.length,
    byMethod: count(jobs.map((j) => ({ m: j.analysis?.method ?? 'unknown' })), 'm'),
    byInputMode: count(jobs.map((j) => ({ m: j.inputMode })), 'm'),
    fields,
    note: 'A customer may keep a wrong suggestion or change a right one, so these numbers describe use, not correctness.',
  };
}
