// Module 5 (Batch 7): price terms, payment records, price information, the admin price guide and the payments
// CSV, through the real API with an in-memory MongoDB. Synthetic accounts only. Time is never waited for:
// shiftBooking moves a booking's dates into the past.
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import Booking from '../../models/Booking.js';
import Notification from '../../models/Notification.js';
import AuditLog from '../../models/AuditLog.js';
import PriceGuide from '../../models/PriceGuide.js';
import { ALLOWED_PARAMS } from '../../services/notifications.js';
import { verifyAuditChain } from '../../services/audit.js';
import { priceJobsFilter } from '../../services/wage/load.js';
import { pktDate, scheduledStartFor } from '../../services/booking/schedule.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api } from '../helpers/api.js';
import {
  makeWorker, makeCustomer, makeAdmin, request, act, acceptedBooking, completedBooking, shiftBooking, allKeys,
} from '../helpers/module4.js';

let app;
let admin;
let workerA;
let workerB;
let customer;
let other;
const HOUR = 60 * 60 * 1000;
const PHONE_KEYS = ['phone', 'whatsapp', 'whatsappNumber', 'whatsappLink'];
const today = () => pktDate(new Date());

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  admin = await makeAdmin(app);
  workerA = await makeWorker(app, { whatsapp: '03215550099' });
  workerB = await makeWorker(app, { name: 'Imran Worker (synthetic)' });
}, 120000);
afterAll(stopTestDb);
beforeEach(async () => {
  customer = await makeCustomer(app);
  other = await makeCustomer(app, { name: 'Other Customer (synthetic)' });
});

const get = (who, url) => api(app, who.cookie).get(url);
const post = (who, url, body) => api(app, who.cookie).post(url).send(body);
const propose = (who, id, body) => post(who, `/api/bookings/${id}/terms`, body);
const agree = (who, id, version) => post(who, `/api/bookings/${id}/terms/agree`, { version });
const pay = (who, id, body) => post(who, `/api/bookings/${id}/payments`, { kind: 'final', amount: 2500, method: 'cash', paidOn: today(), ...body });
const answer = (who, id, pid, action, body) => post(who, `/api/bookings/${id}/payments/${pid}/${action}`, body);
const OFFER = { amount: 2500, unit: 'job', duration: 'few_hours' };
const FULL = { materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', paymentMethod: 'cash', visitCharge: 'none' };

describe('an offer with the request (terms version 1)', () => {
  test('creates version 1 proposed by the customer; region from the city; the worker sees the offer; accepting does not agree', async () => {
    const b = await request(app, customer, workerA, { offer: { ...OFFER, quantity: 9 } });
    expect(b.region).toBe('ICT');
    expect(b.terms).toMatchObject({ status: 'proposed', version: 1, proposedBy: 'customer', agreed: null });
    expect(b.terms.current).toMatchObject({ amount: 2500, unit: 'job', quantity: 1, total: 2500, duration: 'few_hours', extraWork: 'new_price_first' });
    expect(b.termsHistory).toEqual([expect.objectContaining({ version: 1, by: 'customer', action: 'proposed' })]);
    expect(b.paymentSummary).toMatchObject({ state: 'no_price', agreedTotal: null });
    expect(b.wageReference).toMatchObject({ region: 'ICT', daily: 1565, hourly: 196, status: 'notified' });
    expect(b.termsActions).toEqual(['propose_terms']); // the customer may change the offer; the worker cannot agree yet

    const list = await get(workerA, '/api/bookings/mine?status=requested');
    const card = list.body.bookings.find((x) => x._id === b._id);
    expect(card.terms).toEqual({ status: 'proposed', version: 1, proposedBy: 'customer', agreedTotal: null, agreedUnit: null, offer: { amount: 2500, unit: 'job', quantity: 1, total: 2500, duration: 'few_hours' } });
    expect(card.paymentSummary).toEqual({ state: 'no_price' });
    expect(card.payments).toBeUndefined();
    expect(card.termsHistory).toBeUndefined();

    const note = await Notification.findOne({ user: workerA.user._id, type: 'booking_requested', 'params.bookingId': b._id }).lean();
    expect(note.params).toMatchObject({ amount: '2500', unit: 'job' });
    expect(await AuditLog.exists({ action: 'terms.proposed', targetId: b._id })).toBeTruthy();

    const detail = await get(workerA, `/api/bookings/${b._id}`);
    expect(detail.body.booking.termsActions).toEqual([]); // the worker must accept first
    const accepted = await act(app, workerA, b._id, 'accept');
    expect(accepted.body.booking.terms.status).toBe('proposed');
    expect(accepted.body.booking.terms.agreed).toBeNull();
    expect(accepted.body.booking.termsActions).toEqual(['propose_terms', 'agree_terms']);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });

  test('a request without an offer works exactly as in Module 4 (no terms, no notification params added)', async () => {
    const b = await request(app, customer, workerA);
    expect(b.terms).toMatchObject({ status: 'none', version: 0, current: null, agreed: null });
    expect(b.termsChecks).toEqual([]);
    const note = await Notification.findOne({ type: 'booking_requested', 'params.bookingId': b._id }).lean();
    expect(Object.keys(note.params).sort()).toEqual(['bookingCode', 'bookingId', 'skillId', 'skillName']);
    await act(app, customer, b._id, 'cancel');
  });

  test.each([
    ['an amount below 100', { amount: 99, unit: 'job' }, 'NUMBER_TOO_SMALL'],
    ['an unknown unit', { amount: 500, unit: 'week' }, 'UNIT_INVALID'],
    ['61 days', { amount: 1600, unit: 'day', quantity: 61 }, 'QUANTITY_INVALID'],
    ['an unknown key', { amount: 500, unit: 'job', total: 99 }, 'UNKNOWN_FIELD'],
    ['a decimal amount', { amount: 500.5, unit: 'job' }, 'WHOLE_NUMBER'],
  ])('a bad offer is refused: %s', async (_name, offer, code) => {
    const res = await post(customer, '/api/bookings', { workerIdCode: workerA.code, skillId: 'elec_wiring', preferredDate: today(), timeSlot: 'any', city: 'Islamabad', area: 'G-9', offer });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(code);
  });

  test('an amount typed with Urdu digits and a comma is read as rupees; an unknown city has no region and no wage reference', async () => {
    const b = await request(app, customer, workerA, { city: 'Chak 45', offer: { amount: '۲,۵۰۰', unit: 'job' } });
    expect(b.terms.current.amount).toBe(2500);
    expect(b.region).toBeNull();
    expect(b.wageReference).toBeNull();
    await act(app, customer, b._id, 'cancel');
  });
});

describe('propose, agree, propose a change, agree again', () => {
  test('the full flow, the history, the summary and the stored payment state', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    const v1 = await agree(workerA, b._id, 1);
    expect(v1.status).toBe(200);
    expect(v1.body.booking.terms).toMatchObject({ status: 'agreed', version: 1 });
    expect(v1.body.booking.terms.agreed).toMatchObject({ amount: 2500, total: 2500, version: 1 });
    expect(v1.body.booking.paymentSummary).toMatchObject({ state: 'not_paid', agreedTotal: 2500, balance: 2500 });
    expect((await Booking.findById(b._id).lean()).paymentState).toBe('not_paid');

    // the worker adds the conditions: version 2; the agreed version 1 stays until the customer agrees
    const v2 = await propose(workerA, b._id, { baseVersion: 1, amount: 2500, unit: 'job', duration: 'few_hours', ...FULL, note: 'Wires from the customer.' });
    expect(v2.status).toBe(200);
    expect(v2.body.booking.terms).toMatchObject({ status: 'proposed', version: 2, proposedBy: 'worker' });
    expect(v2.body.booking.terms.agreed).toMatchObject({ version: 1, materials: null });
    expect(v2.body.booking.termsActions).toEqual(['propose_terms']);
    const seen = await get(customer, `/api/bookings/${b._id}`);
    expect(seen.body.booking.termsActions).toEqual(['propose_terms', 'agree_terms']);
    expect(seen.body.booking.termsChecks).toEqual([]); // every condition answered, a fair amount
    const v2agreed = await agree(customer, b._id, 2);
    expect(v2agreed.body.booking.terms.agreed).toMatchObject({ version: 2, materials: 'customer_buys', advance: 0, paymentTiming: 'after_work', note: 'Wires from the customer.' });
    expect(v2agreed.body.booking.termsHistory.map((h) => `${h.version}:${h.by}:${h.action}`)).toEqual(['1:customer:proposed', '1:worker:agreed', '2:worker:proposed', '2:customer:agreed']);

    const notes = await Notification.find({ 'params.bookingId': b._id, type: mongoose.trusted({ $in: ['terms_proposed', 'terms_agreed'] }) }).lean();
    expect(notes.map((n) => n.type).sort()).toEqual(['terms_agreed', 'terms_agreed', 'terms_agreed', 'terms_agreed', 'terms_proposed']);
    for (const n of notes) expect(Object.keys(n.params).every((k) => ALLOWED_PARAMS.includes(k))).toBe(true);
    expect(await AuditLog.countDocuments({ targetId: b._id, action: mongoose.trusted({ $in: ['terms.proposed', 'terms.agreed'] }) })).toBe(4);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });

  test('a change still waiting when both press "Work done" is not counted anywhere; terms are frozen afterwards', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await agree(workerA, b._id, 1);
    await propose(workerA, b._id, { baseVersion: 1, amount: 4000, unit: 'job' });
    await act(app, workerA, b._id, 'confirm-done');
    expect((await agree(customer, b._id, 2)).body.code).toBe('TERMS_NOT_ALLOWED'); // after "Work done"
    const done = await act(app, customer, b._id, 'confirm-done');
    expect(done.body.booking.status).toBe('completed');
    expect(done.body.booking.terms.agreed).toMatchObject({ version: 1, total: 2500 });
    expect(done.body.booking.paymentSummary.agreedTotal).toBe(2500);
    expect(done.body.booking.termsActions).toEqual([]);
    expect((await propose(customer, b._id, { baseVersion: 2, amount: 3000, unit: 'job' })).body.code).toBe('TERMS_NOT_ALLOWED');
    expect((await get(workerA, '/api/workers/me/earnings')).body.months[0].items.find((i) => i.code === b.code).agreedTotal).toBe(2500);
  });

  test('the proposer cannot agree to his own version; a stale baseVersion or version gets 409 TERMS_CHANGED', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    const own = await agree(customer, b._id, 1);
    expect([own.status, own.body.code]).toEqual([400, 'TERMS_OWN_VERSION']);
    const stale = await propose(workerA, b._id, { baseVersion: 0, amount: 3000, unit: 'job' });
    expect([stale.status, stale.body.code]).toEqual([409, 'TERMS_CHANGED']);
    await propose(workerA, b._id, { baseVersion: 1, amount: 3000, unit: 'job' });
    const old = await agree(customer, b._id, 1); // looked at version 1, it is now 2
    expect([old.status, old.body.code]).toEqual([409, 'TERMS_CHANGED']);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });

  test('two agrees at the same time: one succeeds, the other gets 409', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    const results = await Promise.all([agree(workerA, b._id, 1), agree(workerA, b._id, 1)]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect((await Booking.findById(b._id).lean()).termsHistory.filter((h) => h.action === 'agreed')).toHaveLength(1);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });

  test('terms are refused during a no-show report, during an open dispute, on a closed booking, and after 10 versions', async () => {
    // no-show report
    const n = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await Booking.updateOne({ _id: n._id }, { $set: { scheduledStart: new Date(Date.now() - 3 * HOUR) } });
    expect((await act(app, customer, n._id, 'no-show')).status).toBe(200);
    expect((await propose(workerA, n._id, { baseVersion: 1, amount: 3000, unit: 'job' })).body.code).toBe('TERMS_NOT_ALLOWED');
    expect((await agree(workerA, n._id, 1)).body.code).toBe('TERMS_NOT_ALLOWED');
    // open dispute: the worker says "I did come"
    await act(app, workerA, n._id, 'no-show/respond', { answer: 'dispute' });
    expect((await propose(customer, n._id, { baseVersion: 1, amount: 3000, unit: 'job' })).body.code).toBe('DISPUTE_OPEN');
    expect((await pay(customer, n._id)).body.code).toBe('DISPUTE_OPEN');
    // a closed (declined) booking
    const c2 = await makeCustomer(app);
    const d = await request(app, c2, workerB, { offer: OFFER });
    await act(app, workerB, d._id, 'decline');
    expect((await propose(c2, d._id, { baseVersion: 1, amount: 3000, unit: 'job' })).body.code).toBe('TERMS_NOT_ALLOWED');
    // the worker may not propose on a request
    const c3 = await makeCustomer(app);
    const r = await request(app, c3, workerB);
    expect((await propose(workerB, r._id, { baseVersion: 0, amount: 3000, unit: 'job' })).body.code).toBe('TERMS_NOT_ALLOWED');
    // the 11th version
    await act(app, workerB, r._id, 'accept');
    for (let v = 0; v < 10; v += 1) expect((await propose(v % 2 ? workerB : c3, r._id, { baseVersion: v, amount: 1000 + v, unit: 'job' })).status).toBe(200);
    const eleventh = await propose(c3, r._id, { baseVersion: 10, amount: 2000, unit: 'job' });
    expect([eleventh.status, eleventh.body.code, eleventh.body.params?.max]).toEqual([400, 'TERMS_LIMIT', 10]);
    await act(app, c3, r._id, 'cancel', { reason: 'plans_changed' });
  });

  test('an advance above the total is refused; a note with a phone number, a link or a CNIC is refused', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    expect((await propose(workerA, b._id, { baseVersion: 1, amount: 1600, unit: 'day', quantity: 2, advance: 3201 })).body.code).toBe('ADVANCE_TOO_HIGH');
    for (const note of ['Call 0300 1234567', 'see www.mysite.pk', 'CNIC 35202-1234567-1', 'نمبر ۰۳۰۰۱۲۳۴۵۶۷']) {
      const res = await propose(workerA, b._id, { baseVersion: 1, amount: 2500, unit: 'job', note });
      expect(res.status, note).toBe(400);
      expect(['TEXT_HAS_CONTACT_INFO', 'NOTE_HAS_CNIC']).toContain(res.body.code);
    }
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });
});

describe('ownership: only the two people (and admins) reach terms and payments', () => {
  test('another worker or customer gets 404 on every terms and payment route; an admin cannot act; a customer cannot confirm his own record', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    const p = await pay(customer, b._id, { amount: 500, kind: 'advance' });
    expect(p.status).toBe(201);
    const pid = p.body.booking.payments[0]._id;
    for (const stranger of [workerB, other]) {
      expect((await get(stranger, `/api/bookings/${b._id}`)).status).toBe(404);
      expect((await propose(stranger, b._id, { baseVersion: 1, amount: 3000, unit: 'job' })).status).toBe(404);
      expect((await agree(stranger, b._id, 1)).status).toBe(404);
      expect((await pay(stranger, b._id)).status).toBe(404);
      expect((await answer(stranger, b._id, pid, 'confirm')).status).toBe(404);
      expect((await answer(stranger, b._id, pid, 'dispute', { reason: 'not_received' })).status).toBe(404);
    }
    expect((await propose(admin, b._id, { baseVersion: 1, amount: 3000, unit: 'job' })).status).toBe(403);
    expect((await pay(admin, b._id)).status).toBe(403);
    const own = await answer(customer, b._id, pid, 'confirm');
    expect([own.status, own.body.code]).toEqual([400, 'PAYMENT_OWN_RECORD']);
    const unknown = await answer(workerA, b._id, new mongoose.Types.ObjectId().toString(), 'confirm');
    expect([unknown.status, unknown.body.code]).toEqual([404, 'PAYMENT_NOT_FOUND']);
    expect((await get(admin, `/api/bookings/${b._id}`)).body.booking.payments).toHaveLength(1);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });
});

describe('payment records', () => {
  test('record, confirm, dispute; double confirm 409; the summary and paymentState after each step; never edited', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await agree(workerA, b._id, 1);
    const state = async () => (await Booking.findById(b._id).lean()).paymentState;

    const adv = await pay(customer, b._id, { kind: 'advance', amount: 500, method: 'easypaisa' });
    expect(adv.body.booking.paymentSummary).toMatchObject({ confirmedPaid: 0, awaiting: 500, state: 'not_paid' });
    expect(adv.body.booking.paymentActions).toEqual({ record: true, respond: [] });
    const advId = adv.body.booking.payments[0]._id;
    const workerView = await get(workerA, `/api/bookings/${b._id}`);
    expect(workerView.body.booking.paymentActions).toEqual({ record: true, respond: [advId] });

    const ok = await answer(workerA, b._id, advId, 'confirm');
    expect(ok.body.booking.payments[0]).toMatchObject({ status: 'confirmed', recordedBy: 'customer' });
    expect(ok.body.booking.paymentSummary).toMatchObject({ confirmedPaid: 500, balance: 2000, state: 'part_paid' });
    expect(await state()).toBe('part_paid');
    const twice = await answer(workerA, b._id, advId, 'confirm');
    expect([twice.status, twice.body.code]).toEqual([409, 'PAYMENT_CHANGED']);
    expect((await answer(workerA, b._id, advId, 'dispute', { reason: 'wrong_amount' })).status).toBe(409);

    // the worker records "I received" the rest; the customer disputes it (wrong amount), then a new record
    const rest = await pay(workerA, b._id, { amount: 2500 });
    const restId = rest.body.booking.payments[1]._id;
    const bad = await answer(customer, b._id, restId, 'dispute', { reason: 'wrong_amount', note: 'I paid 2000.' });
    expect(bad.body.booking.payments[1]).toMatchObject({ status: 'disputed', disputeReason: 'wrong_amount', disputeNote: 'I paid 2000.' });
    expect(bad.body.booking.paymentSummary.state).toBe('has_dispute');
    expect(await state()).toBe('has_dispute');
    const fix = await pay(workerA, b._id, { amount: 2000 });
    await answer(customer, b._id, fix.body.booking.payments[2]._id, 'confirm');
    const after = await get(customer, `/api/bookings/${b._id}`);
    expect(after.body.booking.paymentSummary).toMatchObject({ confirmedPaid: 2500, disputed: 2500, state: 'has_dispute' }); // the disputed record stays, marked
    expect(after.body.booking.payments).toHaveLength(3);

    const notes = await Notification.find({ 'params.bookingId': b._id, type: /^payment_/ }).lean();
    expect(notes.map((n) => n.type).sort()).toEqual(['payment_confirmed', 'payment_confirmed', 'payment_disputed', 'payment_recorded', 'payment_recorded', 'payment_recorded']);
    for (const n of notes) expect(Object.keys(n.params).every((k) => ALLOWED_PARAMS.includes(k))).toBe(true);
    expect(notes.find((n) => n.type === 'payment_disputed').params.note).toBeUndefined(); // the note is never in a notification
    const audit = await AuditLog.find({ targetId: b._id, action: /^payment\./ }).lean();
    expect(audit.map((a) => a.action).sort()).toEqual(['payment.confirmed', 'payment.confirmed', 'payment.disputed', 'payment.recorded', 'payment.recorded', 'payment.recorded']);
    expect(JSON.stringify(audit)).not.toContain('I paid 2000');
    await act(app, workerA, b._id, 'confirm-done');
    await act(app, customer, b._id, 'confirm-done');
  });

  test('an over-payment is "paid" with a negative balance; materials money is apart', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await agree(workerA, b._id, 1);
    const p = await pay(customer, b._id, { amount: 3000 });
    await answer(workerA, b._id, p.body.booking.payments[0]._id, 'confirm');
    const m = await pay(customer, b._id, { kind: 'materials', amount: 800 });
    const done = await answer(workerA, b._id, m.body.booking.payments[1]._id, 'confirm');
    expect(done.body.booking.paymentSummary).toMatchObject({ confirmedPaid: 3000, balance: -500, state: 'paid', materials: { confirmed: 800, awaiting: 0, disputed: 0 } });
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });

  test('the 11th record is refused; a future paidOn or one before the booking is refused; 31 days after completion is refused', async () => {
    const b = await acceptedBooking(app, customer, workerA);
    for (let i = 0; i < 10; i += 1) expect((await pay(customer, b._id, { amount: 100 + i })).status).toBe(201);
    const eleventh = await pay(customer, b._id, { amount: 100 });
    expect([eleventh.status, eleventh.body.code, eleventh.body.params?.max]).toEqual([400, 'PAYMENT_LIMIT', 10]);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });

    const c = await completedBooking(app, other, workerB);
    const tomorrow = pktDate(new Date(Date.now() + 24 * HOUR));
    expect((await pay(other, c._id, { paidOn: tomorrow })).body.code).toBe('PAYMENT_DATE_FUTURE');
    expect((await pay(other, c._id, { paidOn: '2025-01-01' })).body.code).toBe('PAYMENT_DATE_TOO_EARLY');
    expect((await pay(other, c._id, { paidOn: '2026-02-30' })).body.code).toBe('DATE_NOT_REAL');
    expect((await pay(other, c._id, { amount: 0 })).body.code).toBe('NUMBER_TOO_SMALL');
    expect((await pay(other, c._id, { kind: 'tip' })).body.code).toBe('PAYMENT_KIND_INVALID');
    expect((await pay(other, c._id)).status).toBe(201); // completed today: inside the 30 days
    await shiftBooking(c._id, 31 * 24);
    const late = await pay(other, c._id);
    expect([late.status, late.body.code, late.body.params?.days]).toEqual([400, 'PAYMENT_WINDOW_PASSED', 30]);
    // an unconfirmed record stays unconfirmed (never confirmed automatically), and can still be answered
    const still = await get(workerB, `/api/bookings/${c._id}`);
    expect(still.body.booking.payments[0].status).toBe('awaiting_confirmation');
    expect(still.body.booking.paymentActions.respond).toHaveLength(1);
  });

  test('a booking never accepted cannot get a payment; a dispute needs a known reason; its note is checked for contact details', async () => {
    const r = await request(app, customer, workerA);
    expect((await pay(customer, r._id)).body.code).toBe('PAYMENT_NOT_ALLOWED');
    await act(app, workerA, r._id, 'accept');
    const p = await pay(customer, r._id);
    const pid = p.body.booking.payments[0]._id;
    expect((await answer(workerA, r._id, pid, 'dispute', {})).body.code).toBe('PAYMENT_REASON_INVALID');
    expect((await answer(workerA, r._id, pid, 'dispute', { reason: 'other', note: 'WhatsApp me 03001234567' })).body.code).toBe('TEXT_HAS_CONTACT_INFO');
    expect((await answer(workerA, r._id, pid, 'confirm', { extra: 1 })).body.code).toBe('UNKNOWN_FIELD');
    await act(app, customer, r._id, 'cancel', { reason: 'plans_changed' });
  });
});

describe('phone numbers still only as D-002 / D-052 allow, with terms and payments present', () => {
  test('lists, notifications and the earnings never hold a phone; the detail holds it only while accepted', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await agree(workerA, b._id, 1);
    const p = await pay(customer, b._id);
    await answer(workerA, b._id, p.body.booking.payments[0]._id, 'confirm');
    for (const who of [customer, workerA]) {
      const list = await get(who, '/api/bookings/mine');
      for (const key of PHONE_KEYS) expect(allKeys(list.body).has(key), key).toBe(false);
      expect(JSON.stringify(list.body)).not.toContain(workerA.phone);
      expect(JSON.stringify(list.body)).not.toContain(customer.phone);
    }
    const earnings = await get(workerA, '/api/workers/me/earnings');
    expect(JSON.stringify(earnings.body)).not.toMatch(/03\d{9}/);
    const notes = await Notification.find({ user: mongoose.trusted({ $in: [customer.user._id, workerA.user._id] }) }).lean();
    expect(JSON.stringify(notes)).not.toContain(workerA.phone);
    expect(JSON.stringify(notes)).not.toContain(customer.phone);
    expect((await get(customer, `/api/bookings/${b._id}`)).body.booking.contact.worker.phone).toBe(workerA.phone);
    const r = await request(app, other, workerB, { offer: OFFER });
    expect(r.contact).toBeNull();
    await act(app, other, r._id, 'cancel');
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });
});

// ---- price information ----
let seq = 0;
const ids = { workers: [], customers: [] };
function idFor(list, n) {
  while (list.length <= n) list.push(new mongoose.Types.ObjectId());
  return list[n];
}
// A completed booking written straight into the test database (faster than the API; synthetic).
async function insertJob({ w = 0, c = 0, amount = 2000, unit = 'job', skillId = 'elec_db', category = 'electrical_solar', city = 'Islamabad', region = 'ICT', method = 'both', agreed = true, daysAgo = 10, status = 'completed' } = {}) {
  seq += 1;
  const at = new Date(Date.now() - daysAgo * 24 * HOUR);
  const price = { amount, unit, quantity: 1, total: amount };
  await Booking.create({
    code: `BK-2099-${String(seq).padStart(6, '0')}`, customer: idFor(ids.customers, c), worker: idFor(ids.workers, w), workerUser: idFor(ids.workers, w + 500),
    skillId, category, preferredDate: '2026-01-01', timeSlot: 'any', scheduledStart: scheduledStartFor('2026-01-01', 'any'), city, area: 'Test', status,
    completedAt: status === 'completed' ? at : null, completionMethod: status === 'completed' ? method : null, closedAt: at, region, synthetic: true,
    terms: { status: agreed ? 'agreed' : 'proposed', version: 1, proposedBy: 'customer', ...price, agreed: agreed ? { ...price, version: 1, agreedAt: at } : null },
  });
}
const estimate = (who, q) => get(who, `/api/prices/estimate?${new URLSearchParams(q)}`);

describe('GET /api/prices/estimate', () => {
  beforeAll(async () => {
    // Islamabad DB-board work (a skill no other test books): 4 good jobs (4 workers, 4 customers), plus jobs that must never count
    for (const [i, amount] of [1000, 1500, 2000, 2500].entries()) await insertJob({ w: i, c: i, amount });
    await insertJob({ w: 9, c: 9, amount: 9000, method: 'auto' });
    await insertJob({ w: 8, c: 8, amount: 9000, agreed: false });
    await insertJob({ w: 7, c: 7, amount: 9000, daysAgo: 400 });
    await insertJob({ w: 6, c: 6, amount: 9000, status: 'cancelled' });
    // Lahore DB-board work: 5 jobs from 3 workers (for the region / country fallback)
    for (const [i, amount] of [1200, 1400, 1600, 1800, 2000].entries()) await insertJob({ w: 20 + (i % 3), c: 20 + i, amount, city: 'Lahore', region: 'PB' });
  });

  test('below the minimums in Islamabad -> the country level (Islamabad + Lahore = 9 jobs); aggregates only', async () => {
    const res = await estimate(customer, { skillId: 'elec_db', unit: 'job', city: 'Islamabad' });
    expect(res.status).toBe(200);
    // 1000 1200 1400 1500 1600 1800 2000 2000 2500 (n = 9): h = 2, 4, 6 -> 1400 · 1600 · 2000
    expect(res.body.platform).toEqual({ level: 'country', scope: 'skill', unit: 'job', low: 1400, median: 1600, high: 2000, jobs: 9, workers: 7 });
    expect(res.body.guide).toBeNull();
    expect(res.body.wageReference).toMatchObject({ region: 'ICT', monthly: 40700, daily: 1565, hourly: 196 });
    expect(res.body.query).toEqual({ skillId: 'elec_db', category: 'electrical_solar', unit: 'job', city: 'Islamabad', region: 'ICT' });
    const keys = allKeys(res.body);
    for (const k of ['bookingId', 'workerId', 'customerId', 'amounts', 'name', '_id', 'customer', 'worker']) expect(keys.has(k), k).toBe(false);
    expect(JSON.stringify(res.body)).not.toContain('9000');
  });

  test('a fifth job (new pair) in Islamabad -> the city level; another job of the same pair changes nothing unless newer', async () => {
    await insertJob({ w: 4, c: 4, amount: 3000 });
    const city = await estimate(workerA, { skillId: 'elec_db', unit: 'job', city: 'islamabad' });
    expect(city.body.platform).toEqual({ level: 'city', scope: 'skill', unit: 'job', low: 1500, median: 2000, high: 2500, jobs: 5, workers: 5 });
    await insertJob({ w: 4, c: 4, amount: 9000, daysAgo: 30 }); // older job of the same pair: one opinion, the newest counts
    expect((await estimate(workerA, { skillId: 'elec_db', unit: 'job', city: 'Islamabad' })).body.platform.median).toBe(2000);
    // in Rawalpindi: no city range, the Punjab region (Lahore, 5 jobs from 3 workers): 1400 · 1600 · 1800
    expect((await estimate(customer, { skillId: 'elec_db', unit: 'job', city: 'Pindi' })).body.platform).toMatchObject({ level: 'region', low: 1400, median: 1600, high: 1800 });
  });

  test('no platform range -> the admin guide (with its source); an unknown city -> no minimum-wage reference; the worker\'s own rates', async () => {
    const noGuide = await estimate(customer, { skillId: 'plumb_general', unit: 'job', city: 'Chak 45', workerIdCode: workerA.code });
    expect(noGuide.body).toMatchObject({ platform: null, guide: null, wageReference: null, query: { region: null } });
    expect(noGuide.body.workerRates).toEqual({ hourlyRate: 600, dailyRate: null });
    await PriceGuide.create({ category: 'plumbing_sanitary', unit: 'job', region: 'PK', low: 1500, high: 2500, sourceNote: 'Team survey of 6 plumbers [synthetic test]', createdBy: new mongoose.Types.ObjectId() });
    await PriceGuide.create({ skillId: 'plumb_general', category: 'plumbing_sanitary', unit: 'job', region: 'PB', low: 1800, high: 2800, sourceNote: 'Team survey of 4 plumbers in Lahore [synthetic test]', createdBy: new mongoose.Types.ObjectId() });
    const lahore = await estimate(customer, { skillId: 'plumb_general', unit: 'job', city: 'Lahore' });
    expect(lahore.body.guide).toMatchObject({ scope: 'skill', region: 'PB', low: 1800, high: 2800, sourceNote: 'Team survey of 4 plumbers in Lahore [synthetic test]' });
    const karachi = await estimate(customer, { skillId: 'plumb_general', unit: 'job', city: 'Karachi' });
    expect(karachi.body.guide).toMatchObject({ scope: 'category', region: 'PK', low: 1500, high: 2500 });
    expect(karachi.body.wageReference).toMatchObject({ region: 'SD', daily: 1654 });
  });

  test('validation and roles: unit and a skill or category are required; unknown keys refused; logged-out 401', async () => {
    expect((await estimate(customer, { unit: 'job' })).body.code).toBe('SKILL_ID_INVALID');
    expect((await estimate(customer, { skillId: 'nope', unit: 'job' })).body.code).toBe('SKILL_ID_INVALID');
    expect((await estimate(customer, { skillId: 'elec_wiring', unit: 'week' })).body.code).toBe('UNIT_INVALID');
    expect((await estimate(customer, { skillId: 'elec_wiring', category: 'domestic_work', unit: 'job' })).body.code).toBe('CATEGORY_INVALID');
    expect((await estimate(customer, { skillId: 'elec_wiring', unit: 'job', city: 'x'.repeat(51) })).body.code).toBe('TEXT_TOO_LONG');
    expect((await estimate(customer, { skillId: 'elec_wiring', unit: 'job', sort: 'amount' })).body.code).toBe('UNKNOWN_FIELD');
    expect((await estimate(admin, { skillId: 'elec_wiring', unit: 'job' })).status).toBe(200);
    expect((await api(app).get('/api/prices/estimate?skillId=elec_wiring&unit=job')).status).toBe(401);
  });

  test('the query uses the price-statistics index (explain)', async () => {
    const now = new Date();
    const plan = await Booking.find(priceJobsFilter({ skillId: 'elec_wiring', category: 'electrical_solar', unit: 'job' }, now)).explain('queryPlanner');
    expect(JSON.stringify(plan.queryPlanner.winningPlan)).toContain('status_1_skillId_1_terms.agreed.unit_1_region_1_completedAt_-1');
    const dayPlan = await Booking.find(priceJobsFilter({ skillId: 'elec_wiring', category: 'electrical_solar', unit: 'day' }, now)).explain('queryPlanner');
    expect(JSON.stringify(dayPlan.queryPlanner.winningPlan)).toContain('status_1_category_1_terms.agreed.unit_1_completedAt_-1');
  });
});

describe('POST /api/prices/check (a draft, nothing saved)', () => {
  test('the low-pay warning for a day in Islamabad, the missing conditions, and nothing saved', async () => {
    const before = await Booking.countDocuments();
    const res = await post(customer, '/api/prices/check', { skillId: 'elec_wiring', city: 'Islamabad', amount: 1200, unit: 'day', quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.checks.map((c) => c.id)).toEqual(['below_minimum_day', 'missing_condition', 'missing_condition', 'missing_condition', 'missing_condition', 'missing_condition']);
    expect(res.body.checks[0].params).toEqual({ region: 'ICT', reference: 1565, amount: 1200 });
    expect(res.body.region).toBe('ICT');
    expect(await Booking.countDocuments()).toBe(before);
    expect((await post(customer, '/api/prices/check', { city: 'Chak 45', amount: 100, unit: 'day' })).body.checks.map((c) => c.id)).toEqual(['missing_condition', 'missing_condition']);
    expect((await post(admin, '/api/prices/check', { unit: 'day' })).status).toBe(403);
    expect((await post(customer, '/api/prices/check', { unit: 'day', hack: 1 })).body.code).toBe('UNKNOWN_FIELD');
  });
});

describe('the admin price guide', () => {
  const ENTRY = { category: 'painting_renovation', unit: 'day', region: 'ICT', low: 1500, high: 2500, sourceNote: 'Team survey of 5 painters in G-9, Nov 2026 [synthetic test]' };
  test('admin only; a source is required; low <= high; one active entry per key; every change audited with old and new numbers', async () => {
    expect((await post(customer, '/api/admin/price-guides', ENTRY)).status).toBe(403);
    expect((await post(workerA, '/api/admin/price-guides', ENTRY)).status).toBe(403);
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, sourceNote: undefined })).body.code).toBe('SOURCE_NOTE_REQUIRED');
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, sourceNote: 'guess' })).body.code).toBe('SOURCE_NOTE_REQUIRED');
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, low: 3000 })).body.code).toBe('PRICE_GUIDE_LOW_HIGH');
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, region: 'XX' })).body.code).toBe('REGION_INVALID');
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, skillId: 'elec_wiring' })).body.code).toBe('CATEGORY_INVALID');
    expect((await post(admin, '/api/admin/price-guides', { ...ENTRY, note: 'Call 03001234567' })).body.code).toBe('TEXT_HAS_CONTACT_INFO');
    const made = await post(admin, '/api/admin/price-guides', ENTRY);
    expect(made.status).toBe(201);
    const id = made.body.guide._id;
    expect((await post(admin, '/api/admin/price-guides', ENTRY)).body.code).toBe('PRICE_GUIDE_EXISTS');

    const patch = (body) => api(app, admin.cookie).patch(`/api/admin/price-guides/${id}`).send(body);
    expect((await patch({ low: 1600, high: 2600 })).body.code).toBe('SOURCE_NOTE_REQUIRED'); // new numbers need their source
    expect((await api(app, customer.cookie).patch(`/api/admin/price-guides/${id}`).send({ status: 'archived' })).status).toBe(403);
    const updated = await patch({ low: 1600, high: 2600, sourceNote: 'Team survey of 7 painters in G-9, Nov 2026 [synthetic test]' });
    expect(updated.body.guide).toMatchObject({ low: 1600, high: 2600, status: 'active' });
    const archived = await patch({ status: 'archived' });
    expect(archived.body.guide.status).toBe('archived');
    expect((await patch({ status: 'archived' })).body.code).toBe('PRICE_GUIDE_ARCHIVED');
    expect((await post(admin, '/api/admin/price-guides', ENTRY)).status).toBe(201); // a new active entry after archiving

    const audit = await AuditLog.find({ targetType: 'PriceGuide', targetId: id }).sort({ seq: 1 }).lean();
    expect(audit.map((a) => a.action)).toEqual(['priceguide.created', 'priceguide.updated', 'priceguide.archived']);
    expect(audit[1].details).toMatchObject({ before: { low: 1500, high: 2500 }, after: { low: 1600, high: 2600 } });
    const list = await get(admin, '/api/admin/price-guides?status=all&category=painting_renovation');
    expect(list.body.guides.map((g) => g.status).sort()).toEqual(['active', 'archived']);
    expect(list.body.history[id].map((h) => h.action)).toEqual(['priceguide.archived', 'priceguide.updated', 'priceguide.created']);
    expect((await get(customer, '/api/admin/price-guides')).status).toBe(403);
  });
});

describe('admin payments page and the payments CSV', () => {
  test('bookings by payment state, disputed first; read-only; the CSV has no names, phone numbers or notes and is audited', async () => {
    const b = await acceptedBooking(app, customer, workerA, { offer: OFFER });
    await agree(workerA, b._id, 1);
    const p = await pay(workerA, b._id, { amount: 2500 });
    await answer(customer, b._id, p.body.booking.payments[0]._id, 'dispute', { reason: 'not_received', note: 'Not yet paid, sorry.' });
    const list = await get(admin, '/api/admin/payments');
    expect(list.status).toBe(200);
    expect(list.body.bookings[0].paymentSummary.state).toBe('has_dispute');
    expect(list.body.counts.disputed).toBeGreaterThanOrEqual(1);
    expect(list.body.bookings[0].termsActions).toEqual([]);
    expect(list.body.bookings[0].paymentActions).toEqual({ record: false, respond: [] });
    expect((await get(admin, '/api/admin/payments?state=has_dispute')).body.bookings.every((x) => x.paymentSummary.state === 'has_dispute')).toBe(true);
    expect((await get(admin, '/api/admin/payments?state=nope')).body.code).toBe('STATUS_UNKNOWN');
    expect((await get(customer, '/api/admin/payments')).status).toBe(403);

    const csv = await get(admin, '/api/admin/export/payments.csv');
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    const [header] = csv.text.replace(/^﻿/, '').split(/\r?\n/);
    expect(header).toBe('booking_code,skill,category,region,booking_status,unit,agreed_total,confirmed_paid,awaiting,disputed,payment_records,payment_state,created_at_utc,agreed_at_utc,completed_at_utc,last_paid_on,synthetic');
    expect(csv.text).toContain(b.code);
    for (const secret of [workerA.phone, customer.phone, 'Not yet paid', 'Sara', 'Bilal', '@example.com']) expect(csv.text).not.toContain(secret);
    expect(await AuditLog.exists({ action: 'export.payments' })).toBeTruthy();
    expect((await get(admin, '/api/admin/exports/payments?status=has_dispute')).status).toBe(200);
    await act(app, customer, b._id, 'cancel', { reason: 'plans_changed' });
  });
});

describe('earnings, meta routes and the audit chain', () => {
  test('My earnings: only confirmed money in the total; waiting and disputed apart; workers only', async () => {
    const w = await makeWorker(app, { name: 'Earnings Worker (synthetic)' });
    const b = await completedBooking(app, customer, w, { offer: OFFER });
    const p1 = await pay(customer, b._id, { amount: 1000, kind: 'part' });
    await answer(w, b._id, p1.body.booking.payments[0]._id, 'confirm');
    await pay(customer, b._id, { amount: 1500 });
    const res = await get(w, '/api/workers/me/earnings');
    expect(res.status).toBe(200);
    expect(res.body.thisMonth).toEqual({ month: today().slice(0, 7), confirmed: 1000 });
    expect(res.body.months[0]).toMatchObject({ confirmed: 1000, awaiting: 1500, disputed: 0, jobs: 1 });
    expect(res.body.months[0].items[0]).toMatchObject({ code: b.code, agreedTotal: null, state: 'no_price' }); // the offer was never agreed
    expect((await get(customer, '/api/workers/me/earnings')).status).toBe(403);
    expect((await get(w, '/api/workers/me/earnings?year=1999')).body.code).toBe('NUMBER_TOO_SMALL');
  });

  test('GET /api/meta/wage-references and /api/meta/work-terms (no login): the table with sources, names, the city lookup and the lists', async () => {
    const refs = await api(app).get('/api/meta/wage-references?city=pindi');
    expect(refs.status).toBe(200);
    expect(refs.body.regions.map((r) => r.region)).toEqual(['ICT', 'PB', 'SD', 'KP', 'BA', 'GB', 'AJK']);
    expect(refs.body.regions[0]).toMatchObject({ monthly: 40700, daily: 1565, hourly: 196, status: 'notified', names: { en: 'Islamabad Capital Territory' } });
    expect(refs.body.regions[0].sources.length).toBe(2);
    expect(refs.body.city).toEqual({ name: 'pindi', region: 'PB' });
    expect(refs.body.generalSource.url).toMatch(/^https:\/\/fafen\.org/);
    expect((await api(app).get('/api/meta/wage-references?x=1')).body.code).toBe('UNKNOWN_FIELD');
    const terms = await api(app).get('/api/meta/work-terms');
    expect(terms.body.units).toEqual(['job', 'day', 'hour']);
    expect(terms.body.categoryConditions.domestic_work).toEqual(['price', 'paymentTiming', 'paymentMethod', 'materials']);
    expect(terms.body.limits).toMatchObject({ amountMin: 100, amountMax: 5000000, maxTermsVersions: 10, maxPayments: 10, paymentRecordDays: 30 });
  });

  test('every Module 5 audit entry is in the hash chain and the chain still verifies; no CNIC, phone or note text in it', async () => {
    const chain = await verifyAuditChain();
    expect(chain.ok).toBe(true);
    const entries = await AuditLog.find({ action: /^(terms|payment|priceguide|export\.payments)/ }).lean();
    expect(entries.length).toBeGreaterThan(10);
    const text = JSON.stringify(entries);
    expect(text).not.toMatch(/03\d{9}|\d{5}-\d{7}-\d/);
    expect(text).not.toContain('Wires from the customer');
  });
});
