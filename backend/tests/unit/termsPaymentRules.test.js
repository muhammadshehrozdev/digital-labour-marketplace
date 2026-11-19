// Module 5 (Batch 7, §4.2 and §4.7): the price-terms rules, the payment rules, paymentSummary and
// earningsByMonth. Every allowed and forbidden action; hand-worked summaries for every state. Pure functions.
import { describe, test, expect } from 'vitest';
import { availableTermsActions, canTerms, snapshotOf, termsFields } from '../../services/wage/termsRules.js';
import { availablePaymentActions, canRecordPayment, canRespondPayment, checkPaidOn } from '../../services/wage/paymentRules.js';
import { earningsByMonth, paymentSummary } from '../../services/wage/paymentSummary.js';

const NOW = new Date('2026-11-19T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const booking = (extra = {}) => ({
  status: 'accepted', acceptedAt: new Date('2026-11-18T10:00:00Z'), createdAt: new Date('2026-11-17T10:00:00Z'), customerConfirmedAt: null, workerConfirmedAt: null,
  noShow: {}, dispute: {}, terms: { status: 'proposed', version: 1, proposedBy: 'customer' }, payments: [], ...extra,
});

describe('canTerms: propose_terms', () => {
  test('the customer may propose on a request (the offer) and both may propose after acceptance', () => {
    expect(canTerms('propose_terms', booking({ status: 'requested', terms: { status: 'none', version: 0 } }), 'customer', { seen: 0 })).toEqual({ ok: true });
    expect(canTerms('propose_terms', booking(), 'customer', { seen: 1 })).toEqual({ ok: true });
    expect(canTerms('propose_terms', booking(), 'worker', { seen: 1 })).toEqual({ ok: true });
    // proposing again over one's own waiting version is allowed (a correction is a new version)
    expect(canTerms('propose_terms', booking(), 'customer', { seen: 1 }).ok).toBe(true);
  });
  test('the worker may not propose before accepting', () => {
    expect(canTerms('propose_terms', booking({ status: 'requested' }), 'worker', { seen: 1 })).toEqual({ ok: false, code: 'TERMS_NOT_ALLOWED' });
  });
  test.each([
    ['after the customer pressed "Work done"', { customerConfirmedAt: NOW }, 'TERMS_NOT_ALLOWED'],
    ['after the worker pressed "Work done"', { workerConfirmedAt: NOW }, 'TERMS_NOT_ALLOWED'],
    ['during a no-show report', { noShow: { reportedAt: NOW } }, 'TERMS_NOT_ALLOWED'],
    ['during an open dispute', { dispute: { type: 'completion_contested', status: 'open' } }, 'DISPUTE_OPEN'],
    ['on a completed booking', { status: 'completed' }, 'TERMS_NOT_ALLOWED'],
    ['on a cancelled booking', { status: 'cancelled' }, 'TERMS_NOT_ALLOWED'],
    ['on a declined booking', { status: 'declined' }, 'TERMS_NOT_ALLOWED'],
    ['on an expired booking', { status: 'expired' }, 'TERMS_NOT_ALLOWED'],
    ['with 10 versions already', { terms: { status: 'proposed', version: 10, proposedBy: 'worker' } }, 'TERMS_LIMIT'],
  ])('refused %s', (_name, extra, code) => {
    const b = booking(extra);
    expect(canTerms('propose_terms', b, 'customer', { seen: b.terms.version })).toEqual({ ok: false, code });
  });
  test('a stale baseVersion -> TERMS_CHANGED; an admin or a stranger role -> FORBIDDEN; an unknown action', () => {
    expect(canTerms('propose_terms', booking(), 'worker', { seen: 0 })).toEqual({ ok: false, code: 'TERMS_CHANGED' });
    expect(canTerms('propose_terms', booking(), 'admin', { seen: 1 })).toEqual({ ok: false, code: 'FORBIDDEN' });
    expect(canTerms('delete_terms', booking(), 'worker')).toEqual({ ok: false, code: 'TERMS_NOT_ALLOWED' });
  });
});

describe('canTerms: agree_terms', () => {
  test('only the person who did NOT propose the current version may agree', () => {
    expect(canTerms('agree_terms', booking(), 'worker', { seen: 1 })).toEqual({ ok: true });
    expect(canTerms('agree_terms', booking(), 'customer', { seen: 1 })).toEqual({ ok: false, code: 'TERMS_OWN_VERSION' });
    expect(canTerms('agree_terms', booking({ terms: { status: 'proposed', version: 2, proposedBy: 'worker' } }), 'customer', { seen: 2 })).toEqual({ ok: true });
  });
  test.each([
    ['on a request (accepting is not agreeing)', { status: 'requested' }, 'TERMS_NOT_ALLOWED'],
    ['when nothing is waiting', { terms: { status: 'agreed', version: 1, proposedBy: 'customer' } }, 'TERMS_NOT_ALLOWED'],
    ['when there are no terms', { terms: { status: 'none', version: 0 } }, 'TERMS_NOT_ALLOWED'],
    ['after "Work done"', { workerConfirmedAt: NOW }, 'TERMS_NOT_ALLOWED'],
    ['during a no-show report', { noShow: { reportedAt: NOW } }, 'TERMS_NOT_ALLOWED'],
    ['during an open dispute', { dispute: { status: 'open' } }, 'DISPUTE_OPEN'],
    ['on a completed booking', { status: 'completed' }, 'TERMS_NOT_ALLOWED'],
  ])('refused %s', (_name, extra, code) => {
    const b = booking(extra);
    expect(canTerms('agree_terms', b, 'worker', { seen: b.terms.version })).toEqual({ ok: false, code });
  });
  test('a stale version -> TERMS_CHANGED (nobody agrees to a price that changed a second ago)', () => {
    expect(canTerms('agree_terms', booking({ terms: { status: 'proposed', version: 3, proposedBy: 'customer' } }), 'worker', { seen: 2 })).toEqual({ ok: false, code: 'TERMS_CHANGED' });
  });
  test('availableTermsActions', () => {
    expect(availableTermsActions(booking(), 'worker')).toEqual(['propose_terms', 'agree_terms']);
    expect(availableTermsActions(booking(), 'customer')).toEqual(['propose_terms']);
    expect(availableTermsActions(booking({ status: 'requested' }), 'worker')).toEqual([]);
    expect(availableTermsActions(booking({ status: 'completed' }), 'customer')).toEqual([]);
  });
});

describe('termsFields and snapshots: the server computes the total', () => {
  test('a whole job is quantity 1 whatever was sent; days multiply; duration only for a job', () => {
    expect(termsFields({ amount: 2500, unit: 'job', quantity: 7, duration: 'one_day' })).toMatchObject({ amount: 2500, unit: 'job', quantity: 1, total: 2500, duration: 'one_day', extraWork: 'new_price_first' });
    expect(termsFields({ amount: 1600, unit: 'day', quantity: 3, duration: 'one_day' })).toMatchObject({ quantity: 3, total: 4800, duration: null });
    expect(termsFields({ amount: 200, unit: 'hour' })).toMatchObject({ quantity: 1, total: 200, materials: null, advance: null, note: '' });
  });
  test('a snapshot holds exactly the terms fields (no phone, no ids)', () => {
    expect(Object.keys(snapshotOf(termsFields({ amount: 2500, unit: 'job' })))).toEqual(['amount', 'unit', 'quantity', 'total', 'duration', 'materials', 'advance', 'paymentTiming', 'paymentMethod', 'visitCharge', 'extraWork', 'note']);
  });
});

describe('payment rules (§4.7)', () => {
  const completed = (ago) => booking({ status: 'completed', completedAt: new Date(NOW.getTime() - ago * DAY), closedAt: new Date(NOW.getTime() - ago * DAY) });
  test('either person may record while accepted, and up to 30 days after completion or cancellation', () => {
    expect(canRecordPayment(booking(), 'customer', NOW)).toEqual({ ok: true });
    expect(canRecordPayment(booking(), 'worker', NOW)).toEqual({ ok: true });
    expect(canRecordPayment(completed(30), 'worker', NOW)).toEqual({ ok: true });
    expect(canRecordPayment(completed(31), 'worker', NOW)).toEqual({ ok: false, code: 'PAYMENT_WINDOW_PASSED' });
    const cancelled = booking({ status: 'cancelled', closedAt: new Date(NOW.getTime() - 3 * DAY) });
    expect(canRecordPayment(cancelled, 'customer', NOW)).toEqual({ ok: true });
  });
  test.each([
    ['a request', { status: 'requested', acceptedAt: null }, 'PAYMENT_NOT_ALLOWED'],
    ['a booking cancelled before acceptance', { status: 'cancelled', acceptedAt: null, closedAt: NOW }, 'PAYMENT_NOT_ALLOWED'],
    ['a declined booking', { status: 'declined', acceptedAt: null }, 'PAYMENT_NOT_ALLOWED'],
    ['an open dispute', { dispute: { status: 'open' } }, 'DISPUTE_OPEN'],
    ['10 records already', { payments: Array.from({ length: 10 }, (_, i) => ({ _id: `p${i}` })) }, 'PAYMENT_LIMIT'],
  ])('recording refused on %s', (_name, extra, code) => {
    expect(canRecordPayment(booking(extra), 'customer', NOW)).toEqual({ ok: false, code });
  });
  test('an admin cannot record', () => {
    expect(canRecordPayment(booking(), 'admin', NOW)).toEqual({ ok: false, code: 'FORBIDDEN' });
  });
  test('paidOn: not in the future (Pakistan day), not before the day the booking was created', () => {
    // NOW = 19 Nov 12:00 UTC = 19 Nov 17:00 in Pakistan
    expect(checkPaidOn('2026-11-19', booking(), NOW)).toEqual({ ok: true });
    expect(checkPaidOn('2026-11-20', booking(), NOW)).toEqual({ ok: false, code: 'PAYMENT_DATE_FUTURE' });
    expect(checkPaidOn('2026-11-17', booking(), NOW)).toEqual({ ok: true });
    expect(checkPaidOn('2026-11-16', booking(), NOW)).toEqual({ ok: false, code: 'PAYMENT_DATE_TOO_EARLY' });
    // 19:30 UTC on 19 Nov is already 20 Nov in Pakistan
    expect(checkPaidOn('2026-11-20', booking(), new Date('2026-11-19T19:30:00Z'))).toEqual({ ok: true });
  });
  test('only the OTHER person confirms or disputes, once; a double tap gets PAYMENT_CHANGED', () => {
    const p = { _id: 'p1', recordedBy: 'customer', status: 'awaiting_confirmation' };
    const b = booking({ payments: [p] });
    expect(canRespondPayment('confirm_payment', b, p, 'worker')).toEqual({ ok: true });
    expect(canRespondPayment('dispute_payment', b, p, 'worker')).toEqual({ ok: true });
    expect(canRespondPayment('confirm_payment', b, p, 'customer')).toEqual({ ok: false, code: 'PAYMENT_OWN_RECORD' });
    expect(canRespondPayment('confirm_payment', b, { ...p, status: 'confirmed' }, 'worker')).toEqual({ ok: false, code: 'PAYMENT_CHANGED' });
    expect(canRespondPayment('dispute_payment', b, { ...p, status: 'disputed' }, 'worker')).toEqual({ ok: false, code: 'PAYMENT_CHANGED' });
    expect(canRespondPayment('confirm_payment', b, undefined, 'worker')).toEqual({ ok: false, code: 'PAYMENT_NOT_FOUND' });
    expect(canRespondPayment('confirm_payment', booking({ dispute: { status: 'open' } }), p, 'worker')).toEqual({ ok: false, code: 'DISPUTE_OPEN' });
    expect(canRespondPayment('confirm_payment', b, p, 'admin')).toEqual({ ok: false, code: 'FORBIDDEN' });
    expect(canRespondPayment('edit_payment', b, p, 'worker')).toEqual({ ok: false, code: 'PAYMENT_NOT_ALLOWED' });
  });
  test('availablePaymentActions', () => {
    const b = booking({ payments: [{ _id: 'p1', recordedBy: 'customer', status: 'awaiting_confirmation' }, { _id: 'p2', recordedBy: 'worker', status: 'awaiting_confirmation' }] });
    expect(availablePaymentActions(b, 'worker', NOW)).toEqual({ record: true, respond: ['p1'] });
    expect(availablePaymentActions(b, 'customer', NOW)).toEqual({ record: true, respond: ['p2'] });
    expect(availablePaymentActions(completed(40), 'customer', NOW)).toEqual({ record: false, respond: [] });
  });
});

describe('paymentSummary: hand-worked, one case per state', () => {
  const agreed = (total) => ({ terms: { agreed: { total } } });
  const pay = (amount, status = 'confirmed', kind = 'final') => ({ amount, status, kind });
  test('no_price: no agreed terms (records still summed, no balance)', () => {
    expect(paymentSummary({ payments: [pay(500)] })).toMatchObject({ agreedTotal: null, confirmedPaid: 500, balance: null, state: 'no_price' });
  });
  test('not_paid: agreed 2,500, nothing confirmed (1,000 awaiting) -> balance 2,500', () => {
    expect(paymentSummary({ ...agreed(2500), payments: [pay(1000, 'awaiting_confirmation')] })).toMatchObject({ agreedTotal: 2500, confirmedPaid: 0, awaiting: 1000, balance: 2500, state: 'not_paid' });
  });
  test('part_paid: agreed 2,500, advance 500 confirmed -> balance 2,000', () => {
    expect(paymentSummary({ ...agreed(2500), payments: [pay(500, 'confirmed', 'advance')] })).toMatchObject({ confirmedPaid: 500, balance: 2000, state: 'part_paid' });
  });
  test('paid: 500 + 2,000 confirmed against 2,500 -> balance 0', () => {
    expect(paymentSummary({ ...agreed(2500), payments: [pay(500, 'confirmed', 'advance'), pay(2000)] })).toMatchObject({ confirmedPaid: 2500, balance: 0, state: 'paid' });
  });
  test('over-payment: 3,000 against 2,500 -> paid, balance -500 ("Rs 500 more than the agreed price")', () => {
    expect(paymentSummary({ ...agreed(2500), payments: [pay(3000)] })).toMatchObject({ confirmedPaid: 3000, balance: -500, state: 'paid' });
  });
  test('has_dispute wins over everything: one disputed record, even when the rest is paid', () => {
    expect(paymentSummary({ ...agreed(2500), payments: [pay(2500), pay(300, 'disputed')] })).toMatchObject({ confirmedPaid: 2500, disputed: 300, state: 'has_dispute' });
    expect(paymentSummary({ payments: [pay(300, 'disputed')] }).state).toBe('has_dispute');
  });
  test('materials money is never counted against the price (but a disputed materials record still marks the booking)', () => {
    const s = paymentSummary({ ...agreed(2500), payments: [pay(1000, 'confirmed', 'materials'), pay(2500)] });
    expect(s).toMatchObject({ confirmedPaid: 2500, balance: 0, state: 'paid', materials: { confirmed: 1000, awaiting: 0, disputed: 0 } });
    expect(paymentSummary({ ...agreed(2500), payments: [pay(1000, 'confirmed', 'materials')] }).state).toBe('not_paid');
    expect(paymentSummary({ ...agreed(2500), payments: [pay(400, 'disputed', 'materials')] }).state).toBe('has_dispute');
  });
  test('no records at all', () => {
    expect(paymentSummary({})).toMatchObject({ agreedTotal: null, confirmedPaid: 0, awaiting: 0, disputed: 0, records: 0, state: 'no_price' });
  });
});

describe('earningsByMonth (Pakistan time; only confirmed money in the total)', () => {
  const job = (code, payments, extra = {}) => ({ _id: code, code, skillId: 'elec_wiring', skillName: 'House wiring', status: 'completed', completedAt: new Date('2026-11-10T08:00:00Z'), terms: { agreed: { total: 2500 } }, payments, ...extra });
  test('a payment recorded at 00:30 on 1 Nov in Pakistan (19:30 UTC on 31 Oct) with today as paidOn belongs to November', () => {
    const recordedAt = new Date('2026-10-31T19:30:00Z');
    const out = earningsByMonth([job('BK-1', [{ amount: 2500, kind: 'final', status: 'confirmed', paidOn: '2026-11-01', recordedAt }])], { now: NOW });
    expect(out.months.map((m) => m.month)).toEqual(['2026-11']);
    expect(out.thisMonth).toEqual({ month: '2026-11', confirmed: 2500 });
  });
  test('awaiting and disputed are listed apart, never added in; materials apart; newest month first', () => {
    const out = earningsByMonth([
      job('BK-1', [{ amount: 2000, kind: 'final', status: 'confirmed', paidOn: '2026-11-05' }, { amount: 500, kind: 'part', status: 'awaiting_confirmation', paidOn: '2026-11-06' }]),
      job('BK-2', [{ amount: 1500, kind: 'final', status: 'disputed', paidOn: '2026-11-07' }, { amount: 700, kind: 'materials', status: 'confirmed', paidOn: '2026-11-07' }]),
      job('BK-3', [{ amount: 1200, kind: 'final', status: 'confirmed', paidOn: '2026-10-28' }], { terms: { agreed: { total: 1200 } } }),
    ], { now: NOW });
    expect(out.months.map((m) => [m.month, m.confirmed, m.awaiting, m.disputed, m.materials, m.jobs, m.agreedTotal])).toEqual([
      ['2026-11', 2000, 500, 1500, 700, 2, 5000],
      ['2026-10', 1200, 0, 0, 0, 1, 1200],
    ]);
    expect(out.thisMonth.confirmed).toBe(2000);
    expect(out.months[0].items.map((i) => [i.code, i.state])).toEqual([['BK-2', 'has_dispute'], ['BK-1', 'part_paid']]);
  });
  test('a completed job with no record shows in the month it was completed (Pakistan time); a year filter', () => {
    const out = earningsByMonth([job('BK-9', [], { completedAt: new Date('2026-09-30T20:00:00Z') })], { now: NOW }); // 1 Oct 01:00 in Pakistan
    expect(out.months.map((m) => [m.month, m.confirmed, m.items[0].state])).toEqual([['2026-10', 0, 'not_paid']]);
    expect(earningsByMonth([job('BK-9', [{ amount: 100, kind: 'final', status: 'confirmed', paidOn: '2025-12-31' }])], { now: NOW, year: 2026 }).months).toEqual([]);
    expect(earningsByMonth([], { now: NOW })).toEqual({ thisMonth: { month: '2026-11', confirmed: 0 }, months: [] });
    expect(() => earningsByMonth([])).toThrow(/now/);
  });
});
