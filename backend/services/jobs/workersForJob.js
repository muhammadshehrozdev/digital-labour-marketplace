// Module 6: "workers for this job" (4.7 of the batch plan; decision D-084). A simple FILTER, not a ranking:
//   1. candidates: the directory's listed, not-suspended workers who offer at least one skill in the job's trade, with
//      the directory's own optional filters, in the customer's chosen directory sort, at most CANDIDATE_LIMIT
//   2. only workers in the SAME city: marketCity(worker.city) === marketCity(job.city) ("Pindi" = "Rawalpindi"; an
//      unknown city matches only the same name after cityKey normalisation); workers without a city are not listed
//   3. paged in JavaScript
// Each worker: the directory's public fields (PUBLIC_WORKER_FIELDS, the user's name only) and the REASONS it is
// listed: matchedSkills (the job's skills the worker offers) and sameCity. No price-based order (PRICE-INPUTS.md).
// Module 7 replaces this list with ranking and fair exposure.
import WorkerProfile from '../../models/WorkerProfile.js';
import { hideSuspendedWorkers } from '../accountStatus.js';
import { JOB_RULES } from '../../config/jobRules.js';
import { canonicalCity, marketCity } from '../../config/regions.js';
import {
  DIRECTORY_SORT, LISTED_FILTER, PUBLIC_USER_FIELDS, PUBLIC_WORKER_FIELDS, trackRecordPage,
} from '../../controllers/workersController.js';

export async function candidateFilter(job, { availability, identity, skills }) {
  const filter = await hideSuspendedWorkers(LISTED_FILTER());
  filter['skills.category'] = job.category;
  if (availability && availability !== 'All') filter.availability = availability;
  if (identity === 'verified') filter.verificationStatus = 'Verified';
  if (skills === 'verified') filter['skills.evidenceSummary.status'] = 'verified';
  return filter;
}

export async function workersForJob(job, query = {}) {
  const { sort = 'updated', page = 1, limit = 20 } = query;
  const filter = await candidateFilter(job, query);
  const candidates = sort === 'track_record'
    ? await trackRecordPage(filter, { page: 1, limit: JOB_RULES.CANDIDATE_LIMIT })
    : await WorkerProfile.find(filter).select(PUBLIC_WORKER_FIELDS).populate('user', PUBLIC_USER_FIELDS)
      .sort(DIRECTORY_SORT[sort]).limit(JOB_RULES.CANDIDATE_LIMIT).lean();

  const target = marketCity(job.city);
  const jobSkills = new Set((job.skills ?? []).map((s) => s.skillId));
  const sameCity = candidates.filter((w) => w.city && String(w.city).trim() && marketCity(w.city) === target);
  const start = (page - 1) * limit;
  const workers = sameCity.slice(start, start + limit).map((w) => ({
    ...w,
    matchedSkills: (w.skills ?? []).filter((s) => jobSkills.has(s.skillId)).map((s) => ({ skillId: s.skillId, name: s.name })),
    sameCity: true,
  }));
  return {
    workers,
    page,
    limit,
    total: sameCity.length,
    sort,
    truncated: candidates.length >= JOB_RULES.CANDIDATE_LIMIT,
    filter: { category: job.category, city: job.city, marketCity: target, cityKnown: canonicalCity(job.city) !== null },
  };
}
