// The money summary of one booking, and a worker's earnings by month (Module 5, decision D-076). PURE.
//
// paymentSummary(booking):
//   agreedTotal    terms.agreed.total, or null (no agreed price)
//   confirmedPaid  confirmed records that pay for the work (advance, part, final, extra work)
//   awaiting       records not confirmed yet;  disputed  records the other person disputed
//   balance        agreedTotal - confirmedPaid (only with an agreed total; negative = paid more)
//   materials      money for materials ({ confirmed, awaiting, disputed }): never counted against the price
//   state          has_dispute (any disputed record) > no_price > paid (confirmed >= agreed) > part_paid > not_paid
// earningsByMonth(bookings, { now }): per month in Pakistan time (the month of `paidOn`, the day the money
//   changed hands), the CONFIRMED money a worker received, the jobs and their agreed totals; awaiting and
//   disputed amounts are listed apart and never added in.
import { PRICE_PAYMENT_KINDS } from '../../config/workTerms.js';
import { pktDate } from '../booking/schedule.js';

const forPrice = (p) => PRICE_PAYMENT_KINDS.includes(p.kind);
const sum = (list) => list.reduce((s, p) => s + (Number(p.amount) || 0), 0);
const byStatus = (list, status) => sum(list.filter((p) => p.status === status));

export function paymentSummary(b) {
  const payments = b.payments ?? [];
  const price = payments.filter(forPrice);
  const materials = payments.filter((p) => p.kind === 'materials');
  const agreedTotal = Number.isFinite(b.terms?.agreed?.total) ? b.terms.agreed.total : null;
  const confirmedPaid = byStatus(price, 'confirmed');
  let state;
  if (payments.some((p) => p.status === 'disputed')) state = 'has_dispute';
  else if (agreedTotal === null) state = 'no_price';
  else if (confirmedPaid >= agreedTotal) state = 'paid';
  else if (confirmedPaid > 0) state = 'part_paid';
  else state = 'not_paid';
  return {
    agreedTotal,
    confirmedPaid,
    awaiting: byStatus(price, 'awaiting_confirmation'),
    disputed: byStatus(price, 'disputed'),
    balance: agreedTotal === null ? null : agreedTotal - confirmedPaid,
    materials: { confirmed: byStatus(materials, 'confirmed'), awaiting: byStatus(materials, 'awaiting_confirmation'), disputed: byStatus(materials, 'disputed') },
    records: payments.length,
    state,
  };
}

const monthOf = (day) => String(day).slice(0, 7); // 'YYYY-MM-DD' -> 'YYYY-MM'

/**
 * bookings: the worker's bookings (with code, skillId, skillName, status, completedAt, terms.agreed, payments)
 * Returns { thisMonth: { month, confirmed }, months: [{ month, confirmed, awaiting, disputed, materials, jobs,
 *           agreedTotal, items: [{ bookingId, code, skillId, skillName, agreedTotal, state, confirmed,
 *           awaiting, disputed, materials }] }] } with the newest month first.
 */
export function earningsByMonth(bookings, { now, year = null } = {}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('pass `now` as a valid Date');
  const months = new Map();
  const monthRow = (month) => {
    if (!months.has(month)) months.set(month, { month, confirmed: 0, awaiting: 0, disputed: 0, materials: 0, jobs: 0, agreedTotal: 0, items: [] });
    return months.get(month);
  };
  for (const b of bookings) {
    const summary = paymentSummary(b);
    const payments = b.payments ?? [];
    const touched = new Set(payments.map((p) => monthOf(p.paidOn)));
    // a completed job with no payment record yet still shows, in the month it was completed
    if (touched.size === 0 && b.status === 'completed' && b.completedAt) touched.add(monthOf(pktDate(new Date(b.completedAt))));
    for (const month of touched) {
      const inMonth = payments.filter((p) => monthOf(p.paidOn) === month);
      const price = inMonth.filter(forPrice);
      const item = {
        bookingId: String(b._id),
        code: b.code,
        skillId: b.skillId,
        skillName: b.skillName ?? '',
        agreedTotal: summary.agreedTotal,
        state: summary.state,
        confirmed: byStatus(price, 'confirmed'),
        awaiting: byStatus(price, 'awaiting_confirmation'),
        disputed: byStatus(price, 'disputed'),
        materials: byStatus(inMonth.filter((p) => p.kind === 'materials'), 'confirmed'),
      };
      const row = monthRow(month);
      row.items.push(item);
      row.jobs += 1;
      row.confirmed += item.confirmed;
      row.awaiting += item.awaiting;
      row.disputed += item.disputed;
      row.materials += item.materials;
      row.agreedTotal += item.agreedTotal ?? 0;
    }
  }
  const current = monthOf(pktDate(now));
  const list = [...months.values()]
    .filter((m) => !year || m.month.startsWith(`${year}-`))
    .sort((a, b) => (a.month < b.month ? 1 : -1));
  list.forEach((m) => m.items.sort((a, b) => (a.code < b.code ? 1 : -1)));
  return { thisMonth: { month: current, confirmed: months.get(current)?.confirmed ?? 0 }, months: list };
}
