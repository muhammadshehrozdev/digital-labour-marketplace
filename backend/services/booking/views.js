// What each person may see of a booking (Module 4). Explicit field lists only. Phone numbers are never
// here: they come only from contact.js, and only in GET /api/bookings/:id (decision D-002).
import { availableActions } from './transitions.js';
import { termsListView, wageDetailView } from '../wage/views.js';

// "Sara Khan" -> "Sara K.": the first word and the first letter of the last word that starts with a
// letter ("Demo Customer (synthetic)" -> "Demo C."). Never the phone number, email or account id.
export function shortName(fullName) {
  const words = String(fullName ?? '').trim().split(/\s+/u).filter((w) => /^\p{L}/u.test(w));
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  return `${words[0]} ${[...words[words.length - 1]][0].toUpperCase()}.`;
}

const timelineView = (h) => ({ from: h.from ?? null, to: h.to, by: h.by, at: h.at, reason: h.reason ?? null });

const disputeView = (d, viewer) => {
  if (!d?.type) return null;
  const view = { type: d.type, openedBy: d.openedBy, reasonCode: d.reasonCode, openedAt: d.openedAt, status: d.status, decision: d.decision, decidedAt: d.decidedAt };
  // the opener's note is shown to the two people and the admin; the admin's note to everyone in it
  view.note = d.note ?? '';
  view.decisionNote = d.decisionNote ?? '';
  if (viewer === 'admin') view.decidedBy = d.decidedBy ?? null;
  return view;
};

// The common part (no phone numbers, no account ids of the other person).
function base(b) {
  return {
    _id: b._id,
    code: b.code,
    status: b.status,
    outcome: b.outcome ?? null,
    skillId: b.skillId,
    skillName: b.skillName ?? '',
    category: b.category ?? null,
    preferredDate: b.preferredDate,
    timeSlot: b.timeSlot,
    scheduledStart: b.scheduledStart,
    city: b.city,
    area: b.area,
    description: b.description ?? '',
    acceptedAt: b.acceptedAt ?? null,
    customerConfirmedAt: b.customerConfirmedAt ?? null,
    workerConfirmedAt: b.workerConfirmedAt ?? null,
    completedAt: b.completedAt ?? null,
    completionMethod: b.completionMethod ?? null,
    closedAt: b.closedAt ?? null,
    declineReason: b.declineReason ?? null,
    cancelledBy: b.cancelledBy ?? null,
    cancelReason: b.cancelReason ?? null,
    noShow: { reportedAt: b.noShow?.reportedAt ?? null, workerResponse: b.noShow?.workerResponse ?? null },
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// people: { workerName, workerIdCode, customerName } (loaded by the controller)
// range (Module 5, detail only): the platform price range for the current terms' unit, loaded by the caller
export function bookingView(b, { viewer, now, people = {}, hasReview = false, detail = false, range = null }) {
  const view = {
    ...base(b),
    worker: { name: people.workerName ?? '', workerIdCode: people.workerIdCode ?? null },
    // the worker sees the customer's short name only; an admin sees the full name
    customer: { name: viewer === 'admin' ? (people.customerName ?? '') : shortName(people.customerName) },
    disputeStatus: b.dispute?.status ?? null,
    hasReview,
    actions: viewer === 'admin' ? [] : availableActions(b, viewer, now, { hasReview }),
  };
  // Module 6: only on a booking sent from a job request. The worker gets the code and the kind of work only; the
  // customer and admins also the job's id (to link back). Never the budget or the analysis (they are not on the booking).
  if (b.jobRequest) {
    view.job = viewer === 'worker'
      ? { code: b.jobCode ?? null, taskType: b.jobTaskType ?? null }
      : { _id: b.jobRequest, code: b.jobCode ?? null, taskType: b.jobTaskType ?? null };
  }
  if (detail) {
    view.timeline = (b.statusHistory ?? []).map(timelineView);
    view.dispute = disputeView(b.dispute, viewer);
    // Module 5: terms, history, payments, summary, checks and the terms / payment buttons (separate from
    // `actions`, so the Module 4 buttons are unchanged)
    Object.assign(view, wageDetailView(b, { viewer, now, range }));
  } else {
    // Module 5 in lists: only the terms state, the agreed total, a waiting offer's price and the payment state
    view.terms = termsListView(b);
    view.paymentSummary = { state: b.paymentState ?? 'no_price' };
  }
  return view;
}
