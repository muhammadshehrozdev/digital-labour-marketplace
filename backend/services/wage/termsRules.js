// Who may propose or agree the price terms of a booking, and when (Module 5, decision D-073). PURE, in the
// style of services/booking/transitions.js: the controller asks here first, then makes ONE conditional
// update on `terms.version` and the booking status, so a stale screen or a double tap gets 409.
//
//   propose_terms  customer or worker   booking requested (customer only: the offer) or accepted; nobody
//                                       pressed "Work done"; no no-show report; no open dispute; fewer than
//                                       MAX_TERMS_VERSIONS versions; `baseVersion` = the current version
//   agree_terms    the person who did NOT propose the current version   booking accepted; terms proposed;
//                                       nobody pressed "Work done"; no no-show report; no open dispute;
//                                       `version` = the current version
// Terms are frozen once the booking is completed, cancelled, declined or expired. A change still waiting
// at that moment stays in the history as "not agreed"; only `terms.agreed` counts.
import { WAGE_RULES } from '../../config/wageRules.js';
import { EXTRA_WORK_RULE } from '../../config/workTerms.js';
import { termsTotal } from './termsChecks.js';

const PEOPLE = ['customer', 'worker'];
const disputeOpen = (b) => b.dispute?.status === 'open';
const workDonePressed = (b) => Boolean(b.customerConfirmedAt || b.workerConfirmedAt);
const noShowReported = (b) => Boolean(b.noShow?.reportedAt);
export const currentVersion = (b) => b.terms?.version ?? 0;

// Can `role` take `action` on booking `b`? `seen` = the version the person looked at (baseVersion or version).
// Returns { ok: true } or { ok: false, code }.
export function canTerms(action, b, role, { seen, params = WAGE_RULES } = {}) {
  if (!['propose_terms', 'agree_terms'].includes(action)) return { ok: false, code: 'TERMS_NOT_ALLOWED' };
  if (!PEOPLE.includes(role)) return { ok: false, code: 'FORBIDDEN' };
  if (disputeOpen(b)) return { ok: false, code: 'DISPUTE_OPEN' };
  const terms = b.terms ?? {};
  if (action === 'propose_terms') {
    const open = b.status === 'accepted' || (b.status === 'requested' && role === 'customer');
    if (!open || workDonePressed(b) || noShowReported(b)) return { ok: false, code: 'TERMS_NOT_ALLOWED' };
    if (currentVersion(b) >= params.MAX_TERMS_VERSIONS) return { ok: false, code: 'TERMS_LIMIT' };
  } else {
    if (b.status !== 'accepted' || terms.status !== 'proposed' || workDonePressed(b) || noShowReported(b)) return { ok: false, code: 'TERMS_NOT_ALLOWED' };
    if (terms.proposedBy === role) return { ok: false, code: 'TERMS_OWN_VERSION' };
  }
  if (seen !== undefined && seen !== currentVersion(b)) return { ok: false, code: 'TERMS_CHANGED' };
  return { ok: true };
}

// The terms buttons that fit for this person now (the server checks each one again on the press).
export const availableTermsActions = (b, role) => ['propose_terms', 'agree_terms'].filter((a) => canTerms(a, b, role).ok);

// The stored fields of one version from what a person sent (the server computes quantity rules and the
// total; the browser never sends the total). Conditions not answered stay null.
export function termsFields(input) {
  const unit = input.unit;
  const quantity = unit === 'job' ? 1 : input.quantity ?? 1;
  const fields = {
    amount: input.amount,
    unit,
    quantity,
    total: null,
    duration: unit === 'job' ? input.duration ?? null : null,
    materials: input.materials ?? null,
    advance: input.advance ?? null,
    paymentTiming: input.paymentTiming ?? null,
    paymentMethod: input.paymentMethod ?? null,
    visitCharge: input.visitCharge ?? null,
    extraWork: EXTRA_WORK_RULE,
    note: input.note ?? '',
  };
  fields.total = termsTotal(fields);
  return fields;
}

// The fields kept in a history snapshot and in `terms.agreed` (never a phone number: there is none here).
export const SNAPSHOT_FIELDS = Object.freeze(['amount', 'unit', 'quantity', 'total', 'duration', 'materials', 'advance', 'paymentTiming', 'paymentMethod', 'visitCharge', 'extraWork', 'note']);
export const snapshotOf = (t) => Object.fromEntries(SNAPSHOT_FIELDS.map((k) => [k, t?.[k] ?? (k === 'note' ? '' : null)]));
