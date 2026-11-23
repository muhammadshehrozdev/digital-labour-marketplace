// Module 6: what each person may see of a job request (4.9 of the batch plan). Explicit field lists only.
//   the customer (owner)  everything, including the budget and the analysis
//   an admin              everything; the customer's name only (no phone, no email); the list has no budget
//   a worker              NOTHING here: a worker sees a job only as a booking request (services/booking/views.js)
import { openUntil } from './state.js';

const skillList = (job) => (job.skills ?? []).map((s) => ({ skillId: s.skillId, name: s.name ?? '' }));

function common(job, state) {
  return {
    _id: job._id,
    code: job.code,
    state,
    category: job.category,
    skills: skillList(job),
    taskType: job.taskType ?? null,
    description: job.description,
    inputMode: job.inputMode,
    city: job.city,
    region: job.region ?? null,
    area: job.area,
    preferredDate: job.preferredDate ?? null,
    timeSlot: job.timeSlot ?? null,
    urgent: job.urgent === true,
    openUntil: openUntil(job),
    closedAt: job.closedAt ?? null,
    closeReason: job.closeReason ?? null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

const budgetView = (job) => (job.budget ? { amount: job.budget.amount, unit: job.budget.unit } : null);

export function analysisView(a) {
  if (!a) return null;
  const s = a.suggested ?? {};
  return {
    method: a.method,
    versions: { analyzer: a.versions?.analyzer ?? null, taxonomy: a.versions?.taxonomy ?? null, phrases: a.versions?.phrases ?? null, model: a.versions?.model ?? null },
    analyzedAt: a.analyzedAt,
    suggested: {
      category: s.category ?? null,
      categoryTie: [...(s.categoryTie ?? [])],
      skills: [...(s.skills ?? [])],
      taskType: s.taskType ?? null,
      city: s.city ?? null,
      preferredDate: s.preferredDate ?? null,
      timeSlot: s.timeSlot ?? null,
      urgent: s.urgent === true,
      budget: s.budget ? { amount: s.budget.amount, unit: s.budget.unit } : null,
      notes: [...(s.notes ?? [])],
    },
    changed: { ...(a.changed ?? {}) },
  };
}

// A booking made from the job, as its customer or an admin sees it in the job (no phone numbers).
export const jobBookingView = (b, people) => ({
  _id: b._id,
  code: b.code,
  status: b.status,
  skillId: b.skillId,
  skillName: b.skillName ?? '',
  preferredDate: b.preferredDate,
  timeSlot: b.timeSlot,
  worker: { name: people.workerName ?? '', workerIdCode: people.workerIdCode ?? null },
  createdAt: b.createdAt,
});

// The owner's view. detail: also the analysis and the bookings made from the job.
export function ownerJobView(job, { state, actions, bookingsCount = 0, analysis = false, bookings = null }) {
  return {
    ...common(job, state),
    version: job.version,
    actions,
    budget: budgetView(job),
    bookingsCount,
    ...(analysis ? { analysis: analysisView(job.analysis) } : {}),
    ...(bookings ? { bookings } : {}),
  };
}

// The admin list: no budget.
export const adminJobListView = (job, { state, customerName, bookingsCount }) => ({
  ...common(job, state),
  customer: { name: customerName ?? '' },
  bookingsCount,
  analysisMethod: job.analysis?.method ?? null,
});

// The admin detail: everything, the customer's name only.
export const adminJobView = (job, { state, customerName, bookings }) => ({
  ...common(job, state),
  version: job.version,
  customer: { name: customerName ?? '' },
  budget: budgetView(job),
  analysis: analysisView(job.analysis),
  bookings,
  bookingsCount: bookings.length,
  synthetic: job.synthetic === true,
});
