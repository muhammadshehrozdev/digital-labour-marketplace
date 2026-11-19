// What each person may see of a booking's price terms and payment records (Module 5). Explicit field lists
// only; never a phone number (there is none in these fields) and never another booking's data. Terms and
// payments are visible to the two people in the booking and to admins (GET /api/bookings/:id); lists
// (/mine) get only the terms state, the agreed total, the waiting offer's price and the payment state.
import { REGIONS } from '../../config/regions.js';
import { SNAPSHOT_FIELDS, availableTermsActions } from './termsRules.js';
import { availablePaymentActions } from './paymentRules.js';
import { paymentSummary } from './paymentSummary.js';
import { termsChecks } from './termsChecks.js';
import { wageReferenceFor } from './wageReference.js';

const priceOf = (t) => Object.fromEntries(SNAPSHOT_FIELDS.map((k) => [k, t?.[k] ?? (k === 'note' ? '' : null)]));

// The list view: the state, the agreed total, and the price of a change that is waiting (so a worker's
// Requests card can show and read out the customer's offer).
export function termsListView(b) {
  const t = b.terms ?? {};
  const status = t.status ?? 'none';
  return {
    status,
    version: t.version ?? 0,
    proposedBy: t.proposedBy ?? null,
    agreedTotal: t.agreed?.total ?? null,
    agreedUnit: t.agreed?.unit ?? null,
    offer: status === 'proposed' ? { amount: t.amount, unit: t.unit, quantity: t.quantity, total: t.total, duration: t.duration ?? null } : null,
  };
}

const paymentView = (p) => ({
  _id: p._id,
  kind: p.kind,
  amount: p.amount,
  method: p.method,
  paidOn: p.paidOn,
  recordedBy: p.recordedBy,
  recordedAt: p.recordedAt,
  status: p.status,
  respondedAt: p.respondedAt ?? null,
  disputeReason: p.disputeReason ?? null,
  disputeNote: p.disputeNote ?? '',
});

const historyView = (h) => ({ version: h.version, by: h.by, action: h.action, at: h.at, snapshot: h.snapshot ? priceOf(h.snapshot) : null });

// The region's minimum-wage reference for the screens (names in three languages from config/regions.js).
export function wageReferenceView(region) {
  const ref = wageReferenceFor(region);
  return ref ? { ...ref, names: REGIONS[region] } : null;
}

// The detail part. `range` = the platform range for the current terms' unit (or null), loaded by the caller.
export function wageDetailView(b, { viewer, now, range = null }) {
  const t = b.terms ?? {};
  const status = t.status ?? 'none';
  const people = viewer === 'customer' || viewer === 'worker';
  return {
    region: b.region ?? null,
    regionNames: b.region ? REGIONS[b.region] : null,
    terms: {
      status,
      version: t.version ?? 0,
      proposedBy: t.proposedBy ?? null,
      proposedAt: t.proposedAt ?? null,
      current: status === 'none' ? null : priceOf(t),
      agreed: t.agreed ? { ...priceOf(t.agreed), version: t.agreed.version, agreedAt: t.agreed.agreedAt } : null,
    },
    termsHistory: (b.termsHistory ?? []).map(historyView),
    payments: (b.payments ?? []).map(paymentView),
    paymentSummary: paymentSummary(b),
    termsChecks: status === 'none' ? [] : termsChecks({ terms: t, category: b.category, wageRef: wageReferenceFor(b.region), range }),
    wageReference: wageReferenceView(b.region),
    termsActions: people ? availableTermsActions(b, viewer) : [],
    paymentActions: people ? availablePaymentActions(b, viewer, now) : { record: false, respond: [] },
  };
}
