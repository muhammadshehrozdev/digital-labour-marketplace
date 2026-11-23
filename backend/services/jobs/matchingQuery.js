// Module 6 -> Module 7: the job profile as a matching query (docs/contracts/JOB-PROFILE.md). PURE.
// Exactly these fields. Rules for Module 7: never use the budget to rank or filter workers (it is not here on
// purpose); the description is for people to read (not here); add fields, never rename or remove them.
import { marketCity, regionOf } from '../../config/regions.js';

export function toMatchingQuery(job) {
  return {
    category: job.category,
    skillIds: (job.skills ?? []).map((s) => s.skillId),
    taskType: job.taskType ?? null,
    city: job.city,
    marketCity: marketCity(job.city),
    region: job.region ?? regionOf(job.city),
    preferredDate: job.preferredDate ?? null,
    timeSlot: job.timeSlot ?? null,
    urgent: job.urgent === true,
  };
}
