// Module 4 (Batch 6): the minimal Work Booking. State machine, ownership, limits, the phone-number
// rules of D-002, the sweep, disputes, notifications and audit entries. In-memory MongoDB only.
import { describe, test, expect, beforeAll, beforeEach, afterAll, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import Booking from '../../models/Booking.js';
import Notification from '../../models/Notification.js';
import AuditLog from '../../models/AuditLog.js';
import User from '../../models/User.js';
import { verifyAuditChain } from '../../services/audit.js';
import { sweepBookings } from '../../services/booking/sweep.js';
import { scheduledStartFor } from '../../services/booking/schedule.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api } from '../helpers/api.js';
import {
  makeWorker, makeCustomer, makeAdmin, request, requestBody, act, acceptedBooking, completedBooking, shiftBooking, allKeys, tomorrowPkt,
} from '../helpers/module4.js';

let app;
let admin;
let workerA;
let workerB;
let customer;
let other;
const HOUR = 60 * 60 * 1000;
const PHONE_KEYS = ['phone', 'whatsapp', 'whatsappNumber', 'whatsappLink'];

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  admin = await makeAdmin(app);
  workerA = await makeWorker(app, { whatsapp: '03215550011' });
  workerB = await makeWorker(app, { name: 'Imran Worker (synthetic)' });
  customer = await makeCustomer(app);
  other = await makeCustomer(app, { name: 'Other Customer (synthetic)' });
});
afterAll(stopTestDb);
afterEach(() => vi.restoreAllMocks());

const get = (who, url) => api(app, who.cookie).get(url);
// Fresh customers for every test that makes bookings, so the request limits of one test never block
// the next (the limits themselves are tested in "creating a request").
const freshCustomers = () => beforeEach(async () => {
  customer = await makeCustomer(app);
  other = await makeCustomer(app, { name: 'Other Customer (synthetic)' });
});

describe('creating a request', () => {
  test('a customer sends a request: 201, readable code, Pakistan start time, statusHistory, notification without private data', async () => {
    const date = tomorrowPkt();
    const res = await api(app, customer.cookie).post('/api/bookings').send(requestBody(workerA, { preferredDate: date, timeSlot: 'evening' }));
    expect(res.status).toBe(201);
    const b = res.body.booking;
    expect(b.code).toMatch(/^BK-\d{4}-\d{6}$/);
    expect(b.status).toBe('requested');
    expect(new Date(b.scheduledStart).toISOString()).toBe(`${date}T12:00:00.000Z`); // 17:00 in Pakistan
    expect(b.timeline).toEqual([expect.objectContaining({ from: null, to: 'requested', by: 'customer' })]);
    expect(b.contact).toBeNull();
    expect(b.actions).toEqual(['cancel']);
    expect(b.worker).toMatchObject({ workerIdCode: workerA.code });
    const note = await Notification.findOne({ user: workerA.user._id, type: 'booking_requested' }).lean();
    expect(note.params).toMatchObject({ bookingId: b._id, bookingCode: b.code, skillId: 'elec_wiring' });
    expect(Object.keys(note.params).sort()).toEqual(['bookingCode', 'bookingId', 'skillId', 'skillName']);
    await act(app, customer, b._id, 'cancel');
  });

  test('only customers create requests; logged-out 401', async () => {
    expect((await api(app, workerB.cookie).post('/api/bookings').send(requestBody(workerA))).status).toBe(403);
    expect((await api(app, admin.cookie).post('/api/bookings').send(requestBody(workerA))).status).toBe(403);
    expect((await api(app).post('/api/bookings').send(requestBody(workerA))).status).toBe(401);
  });

  test.each([
    ['an unknown key', { extra: 1 }, 'UNKNOWN_FIELD'],
    ['a bad date', { preferredDate: '2026-02-30' }, 'DATE_NOT_REAL'],
    ['a bad slot', { timeSlot: 'night' }, 'TIME_SLOT_INVALID'],
    ['a phone number in the area', { area: 'Call 0300 123 4567' }, 'TEXT_HAS_CONTACT_INFO'],
    ['an Urdu-digit phone number in the description', { description: 'نمبر ۰۳۰۰۱۲۳۴۵۶۷ پر کال کریں' }, 'TEXT_HAS_CONTACT_INFO'],
    ['an email in the description', { description: 'mail me at sara@example.com' }, 'TEXT_HAS_CONTACT_INFO'],
    ['a link in the description', { description: 'see www.mysite.pk please' }, 'TEXT_HAS_CONTACT_INFO'],
    ['a CNIC in the area', { area: '37405-1234567-1' }, 'NOTE_HAS_CNIC'],
    ['a too long description', { description: 'x'.repeat(501) }, 'TEXT_TOO_LONG'],
    ['a bad worker ID', { workerIdCode: 'DLM-1' }, 'WORKER_ID_INVALID'],
  ])('%s -> 400 %s', async (_name, extra, code) => {
    const res = await api(app, customer.cookie).post('/api/bookings').send(requestBody(workerA, extra));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(code);
  });

  test('a day in the past or more than 30 days ahead -> 400 BOOKING_DATE_RANGE', async () => {
    const day = (offset) => new Date(Date.now() + offset * 24 * HOUR + 5 * HOUR).toISOString().slice(0, 10);
    for (const date of [day(-2), day(32)]) {
      const res = await api(app, customer.cookie).post('/api/bookings').send(requestBody(workerA, { preferredDate: date }));
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ code: 'BOOKING_DATE_RANGE', params: { max: 30 } });
    }
  });

  test('a skill the worker does not have -> 400; an unknown worker -> 404; a suspended worker -> 409', async () => {
    expect((await api(app, customer.cookie).post('/api/bookings').send(requestBody(workerA, { skillId: 'plumb_geyser' }))).body.code).toBe('BOOKING_SKILL_NOT_OFFERED');
    expect((await api(app, customer.cookie).post('/api/bookings').send(requestBody({ code: 'DLM-2026-999999' }))).status).toBe(404);
    const s = await makeWorker(app);
    await User.updateOne({ _id: s.user._id }, { $set: { status: 'suspended' } });
    const res = await api(app, customer.cookie).post('/api/bookings').send(requestBody(s));
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('BOOKING_WORKER_UNAVAILABLE');
  });

  test('BOOKING_SELF: the customer phone equals the worker phone or WhatsApp number (in any written form)', async () => {
    const twin = await makeCustomer(app, { phone: '+92 321 5550011' }); // workerA's WhatsApp
    const res = await api(app, twin.cookie).post('/api/bookings').send(requestBody(workerA));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BOOKING_SELF');
    const same = await makeCustomer(app, { phone: workerB.phone });
    expect((await api(app, same.cookie).post('/api/bookings').send(requestBody(workerB))).body.code).toBe('BOOKING_SELF');
  });

  test('limits: one open request per pair, five open per customer, ten new per 24 hours', async () => {
    const c = await makeCustomer(app);
    const first = await request(app, c, workerA);
    const pair = await api(app, c.cookie).post('/api/bookings').send(requestBody(workerA));
    expect(pair.status).toBe(409);
    expect(pair.body.code).toBe('BOOKING_LIMIT_PAIR');
    const workers = [];
    for (let i = 0; i < 5; i += 1) workers.push(await makeWorker(app));
    for (const w of workers.slice(0, 4)) await request(app, c, w);
    const sixth = await api(app, c.cookie).post('/api/bookings').send(requestBody(workers[4]));
    expect(sixth.status).toBe(409);
    expect(sixth.body).toMatchObject({ code: 'BOOKING_LIMIT_OPEN', params: { max: 5 } });
    // cancel all five, then five more fit; the eleventh in 24 hours is refused
    for (const b of await Booking.find({ customer: c.user._id }).lean()) await act(app, c, b._id, 'cancel');
    const more = [];
    for (let i = 0; i < 5; i += 1) more.push(await makeWorker(app));
    for (const w of more) {
      const b = await request(app, c, w);
      await act(app, c, b._id, 'cancel');
    }
    const eleventh = await api(app, c.cookie).post('/api/bookings').send(requestBody(workers[4]));
    expect(eleventh.status).toBe(429);
    expect(eleventh.body).toMatchObject({ code: 'BOOKING_LIMIT_DAY', params: { max: 10 } });
    expect(first.code).toMatch(/^BK-/);
  });
});

describe('state machine', () => {
  freshCustomers();
  test('accept -> contact shared; both "Work done" -> completed (both); audit booking.completed; notifications', async () => {
    const b = await request(app, customer, workerA);
    const accepted = await act(app, workerA, b._id, 'accept');
    expect(accepted.status).toBe(200);
    expect(accepted.body.booking.status).toBe('accepted');
    expect(accepted.body.booking.contact.customer).toEqual({ phone: customer.phone });
    expect(await Notification.exists({ user: customer.user._id, type: 'booking_accepted' })).toBeTruthy();

    const first = await act(app, workerA, b._id, 'confirm-done');
    expect(first.body.booking).toMatchObject({ status: 'accepted', completionMethod: null });
    expect(first.body.booking.workerConfirmedAt).toBeTruthy();
    expect(await Notification.exists({ user: customer.user._id, type: 'booking_confirm_request' })).toBeTruthy();
    expect((await act(app, workerA, b._id, 'confirm-done')).status).toBe(409); // pressed twice

    const done = await act(app, customer, b._id, 'confirm-done');
    expect(done.body.booking).toMatchObject({ status: 'completed', outcome: 'completed', completionMethod: 'both' });
    expect(done.body.booking.actions).toEqual(['review']);
    expect(await Notification.exists({ user: workerA.user._id, type: 'booking_completed' })).toBeTruthy();
    expect(await Notification.exists({ user: customer.user._id, type: 'review_requested' })).toBeTruthy();
    const entry = await AuditLog.findOne({ action: 'booking.completed', targetId: String(b._id) }).lean();
    expect(entry.details).toMatchObject({ outcome: 'completed', completionMethod: 'both', code: b.code });
    expect(JSON.stringify(entry)).not.toMatch(new RegExp(customer.phone));
  });

  test('decline (optional reason) closes with outcome declined; notification to the customer', async () => {
    const b = await request(app, customer, workerB);
    expect((await act(app, workerB, b._id, 'decline', { reason: 'sometimes' })).status).toBe(400);
    const res = await act(app, workerB, b._id, 'decline', { reason: 'too_far' });
    expect(res.body.booking).toMatchObject({ status: 'declined', outcome: 'declined', declineReason: 'too_far' });
    expect((await Notification.findOne({ user: customer.user._id, type: 'booking_declined' }).lean()).params.reasonCode).toBe('too_far');
    expect(await AuditLog.exists({ action: 'booking.closed', targetId: String(b._id) })).toBeTruthy();
  });

  test('forbidden steps: accepting a cancelled booking (400), a customer accepting (403), cancel after "Work done" (400)', async () => {
    const b = await request(app, customer, workerB);
    await act(app, customer, b._id, 'cancel');
    const res = await act(app, workerB, b._id, 'accept');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('BOOKING_NOT_ALLOWED');
    const c = await request(app, customer, workerB);
    expect((await act(app, customer, c._id, 'accept')).status).toBe(403);
    await act(app, workerB, c._id, 'accept');
    await act(app, workerB, c._id, 'confirm-done');
    expect((await act(app, customer, c._id, 'cancel', { reason: 'plans_changed' })).body.code).toBe('BOOKING_NOT_ALLOWED');
    expect((await act(app, workerB, c._id, 'cancel', { reason: 'cannot_come' })).body.code).toBe('BOOKING_NOT_ALLOWED');
  });

  test('two accepts at the same time: exactly one succeeds, the other gets 409', async () => {
    const b = await request(app, customer, workerB);
    const results = await Promise.all([act(app, workerB, b._id, 'accept'), act(app, workerB, b._id, 'accept')]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(results.find((r) => r.status === 409).body.code).toBe('BOOKING_CHANGED');
    const after = await Booking.findById(b._id).lean();
    expect(after.statusHistory.filter((h) => h.to === 'accepted' && h.from === 'requested')).toHaveLength(1);
  });

  test('a step based on a stale read (changed in between) -> 409, nothing written', async () => {
    const b = await request(app, customer, workerB);
    await act(app, customer, b._id, 'cancel');
    const stale = { ...(await Booking.findById(b._id).lean()), status: 'requested' };
    // the server's read still sees "requested" (the race window); every other findOne (exists) is real
    const real = Booking.findOne.bind(Booking);
    let served = false;
    vi.spyOn(Booking, 'findOne').mockImplementation((...args) => {
      const query = real(...args);
      if (served) return query;
      return { select: (...a) => query.select(...a), lean: async () => { served = true; return stale; } };
    });
    const res = await act(app, workerB, b._id, 'accept');
    expect(res.status).toBe(409);
    expect((await Booking.findById(b._id).lean()).status).toBe('cancelled');
  });

  test('cancellation: the customer before acceptance (no reason needed); after acceptance a reason is required', async () => {
    const b = await request(app, customer, workerB);
    const res = await act(app, customer, b._id, 'cancel');
    expect(res.body.booking).toMatchObject({ status: 'cancelled', outcome: 'cancelled_by_customer', cancelledBy: 'customer' });
    expect(await Notification.exists({ user: workerB.user._id, type: 'booking_cancelled' })).toBeTruthy();
    const a = await acceptedBooking(app, customer, workerB);
    expect((await act(app, customer, a._id, 'cancel')).body.code).toBe('CANCEL_REASON_REQUIRED');
    expect((await act(app, customer, a._id, 'cancel', { reason: 'plans_changed' })).body.booking.outcome).toBe('cancelled_by_customer');
  });

  test('a worker cancelling 24 hours or more before the start is "early"; less is "late"', async () => {
    const far = new Date(Date.now() + 5 * 24 * HOUR + 5 * HOUR).toISOString().slice(0, 10);
    const early = await acceptedBooking(app, customer, workerB, { preferredDate: far });
    expect((await act(app, workerB, early._id, 'cancel', { reason: 'emergency' })).body.booking.outcome).toBe('cancelled_by_worker_early');
    const late = await acceptedBooking(app, customer, workerB);
    await Booking.updateOne({ _id: late._id }, { $set: { scheduledStart: new Date(Date.now() + 3 * HOUR) } });
    expect((await act(app, workerB, late._id, 'cancel', { reason: 'cannot_come' })).body.booking.outcome).toBe('cancelled_by_worker_late');
  });
});

describe('ownership', () => {
  freshCustomers();
  test("worker B cannot see or act on worker A's booking; another customer cannot see it (404, not 403)", async () => {
    const b = await request(app, customer, workerA);
    expect((await get(workerB, `/api/bookings/${b._id}`)).status).toBe(404);
    expect((await act(app, workerB, b._id, 'accept')).status).toBe(404);
    expect((await get(other, `/api/bookings/${b._id}`)).status).toBe(404);
    expect((await act(app, other, b._id, 'cancel')).status).toBe(404);
    expect((await get(admin, `/api/bookings/${b._id}`)).status).toBe(200);
    expect((await get(customer, '/api/bookings/not-an-id')).status).toBe(400);
    await act(app, customer, b._id, 'cancel');
  });

  test('lists show only my own bookings; "as" must match my role', async () => {
    const res = await get(other, '/api/bookings/mine');
    expect(res.status).toBe(200);
    expect(res.body.bookings).toEqual([]);
    expect((await get(workerA, '/api/bookings/mine?as=customer')).status).toBe(403);
    const mine = await get(workerA, '/api/bookings/mine?as=worker&status=all');
    expect(mine.body.bookings.length).toBeGreaterThan(0);
    expect(mine.body.counts).toEqual(expect.objectContaining({ requested: expect.any(Number), accepted: expect.any(Number) }));
    expect((await get(admin, '/api/bookings/mine')).status).toBe(403);
  });
});

describe('phone numbers (D-002)', () => {
  freshCustomers();
  test('present only while accepted and for 7 days after the close; only to the two people and admins', async () => {
    const b = await request(app, other, workerA);
    for (const who of [other, workerA, admin]) expect((await get(who, `/api/bookings/${b._id}`)).body.booking.contact).toBeNull();
    await act(app, workerA, b._id, 'accept');
    const forCustomer = (await get(other, `/api/bookings/${b._id}`)).body.booking.contact;
    expect(forCustomer.worker).toEqual({ phone: workerA.phone, whatsapp: '03215550011', whatsappLink: 'https://wa.me/923215550011' });
    expect(forCustomer.customer).toBeUndefined();
    const forWorker = (await get(workerA, `/api/bookings/${b._id}`)).body.booking.contact;
    expect(forWorker).toEqual({ visibleUntil: null, customer: { phone: other.phone } });
    const forAdmin = (await get(admin, `/api/bookings/${b._id}`)).body.booking.contact;
    expect(forAdmin.worker.phone).toBe(workerA.phone);
    expect(forAdmin.customer.phone).toBe(other.phone);

    // not in lists, notifications or the admin timeline view
    const lists = [await get(other, '/api/bookings/mine'), await get(workerA, '/api/bookings/mine'), await get(admin, '/api/admin/bookings'), await get(admin, `/api/admin/bookings/${b._id}`)];
    for (const res of lists) {
      expect(res.status).toBe(200);
      for (const key of PHONE_KEYS) expect(allKeys(res.body).has(key), key).toBe(false);
      expect(JSON.stringify(res.body)).not.toContain(workerA.phone);
      expect(JSON.stringify(res.body)).not.toContain(other.phone);
    }
    const notes = await Notification.find({ user: trustedIn([other.user._id, workerA.user._id]) }).lean();
    expect(JSON.stringify(notes)).not.toMatch(new RegExp(`${workerA.phone}|${other.phone}|03215550011`));

    // completed: still visible for 7 days, then gone
    await act(app, workerA, b._id, 'confirm-done');
    await act(app, other, b._id, 'confirm-done');
    expect((await get(other, `/api/bookings/${b._id}`)).body.booking.contact.visibleUntil).toBeTruthy();
    await shiftBooking(b._id, 8 * 24);
    for (const who of [other, workerA, admin]) expect((await get(who, `/api/bookings/${b._id}`)).body.booking.contact).toBeNull();
  });

  test('a declined or never-accepted booking never shows a number; no WhatsApp button without a saved WhatsApp number', async () => {
    const d = await request(app, other, workerB);
    await act(app, workerB, d._id, 'decline');
    expect((await get(other, `/api/bookings/${d._id}`)).body.booking.contact).toBeNull();
    const a = await acceptedBooking(app, other, workerB);
    expect((await get(other, `/api/bookings/${a._id}`)).body.booking.contact.worker).toEqual({ phone: workerB.phone, whatsapp: '', whatsappLink: null });
    await act(app, other, a._id, 'cancel', { reason: 'found_someone_else' });
  });
});

const trustedIn = (ids) => mongoose.trusted({ $in: ids });

describe('the sweep (timers without a server clock)', () => {
  freshCustomers();
  test('expiry after 48 hours; running the sweep twice changes nothing more', async () => {
    const b = await request(app, other, workerB);
    expect((await sweepBookings({ now: new Date(Date.now() + 47 * HOUR) })).expired).toBe(0);
    const now = new Date(Date.now() + 49 * HOUR);
    const [one, two] = await Promise.all([sweepBookings({ now }), sweepBookings({ now })]);
    expect(one.expired + two.expired).toBeGreaterThanOrEqual(1);
    const after = await Booking.findById(b._id).lean();
    expect(after).toMatchObject({ status: 'expired', outcome: 'expired' });
    expect(after.statusHistory.filter((h) => h.to === 'expired')).toHaveLength(1);
    expect(await Notification.countDocuments({ user: other.user._id, type: 'booking_expired', 'params.bookingId': String(b._id) })).toBe(1);
    expect((await sweepBookings({ now })).expired).toBe(0);
  });

  test('auto-completion 72 hours after one side pressed "Work done" (method auto)', async () => {
    const b = await acceptedBooking(app, other, workerB);
    await act(app, workerB, b._id, 'confirm-done');
    expect((await sweepBookings({ now: new Date(Date.now() + 71 * HOUR) })).autoCompleted).toBe(0);
    await sweepBookings({ now: new Date(Date.now() + 73 * HOUR) });
    expect(await Booking.findById(b._id).lean()).toMatchObject({ status: 'completed', completionMethod: 'auto', outcome: 'completed' });
    expect((await sweepBookings({ now: new Date(Date.now() + 74 * HOUR) })).autoCompleted).toBe(0);
  });

  test('the read endpoints sweep first, scoped to that user (an old request is expired when the list is opened)', async () => {
    const b = await request(app, other, workerB);
    await shiftBooking(b._id, 50);
    const res = await get(other, '/api/bookings/mine?status=past');
    expect(res.body.bookings.find((x) => x._id === String(b._id)).status).toBe('expired');
  });

  test('no-show: too early -> 400; after start + 2 h -> reported; no answer for 72 h -> confirmed no-show', async () => {
    const b = await acceptedBooking(app, other, workerB);
    const early = await act(app, other, b._id, 'no-show');
    expect(early.status).toBe(400);
    expect(early.body.code).toBe('NO_SHOW_TOO_EARLY');
    await shiftBooking(b._id, 24 + 3); // the start (tomorrow 09:00) is now 3 hours ago or more
    await Booking.updateOne({ _id: b._id }, { $set: { scheduledStart: new Date(Date.now() - 3 * HOUR) } });
    const reported = await act(app, other, b._id, 'no-show');
    expect(reported.status).toBe(200);
    expect(reported.body.booking.noShow.reportedAt).toBeTruthy();
    expect(await Notification.exists({ user: workerB.user._id, type: 'no_show_reported' })).toBeTruthy();
    expect((await act(app, workerB, b._id, 'confirm-done')).body.code).toBe('BOOKING_NOT_ALLOWED');
    await sweepBookings({ now: new Date(Date.now() + 73 * HOUR) });
    expect(await Booking.findById(b._id).lean()).toMatchObject({ status: 'cancelled', outcome: 'worker_no_show', cancelledBy: 'system', noShow: expect.objectContaining({ workerResponse: 'no_answer' }) });
    // the worker may still dispute it (he may have missed the notification), within 14 days
    const disputed = await act(app, workerB, b._id, 'dispute', { reasonCode: 'i_did_come', note: 'I was there at nine.' });
    expect(disputed.status).toBe(200);
    expect(disputed.body.booking.dispute).toMatchObject({ type: 'no_show_contested', status: 'open', openedBy: 'worker' });
  });

  test('review reminder once, three days after completion, only when there is no review', async () => {
    const b = await completedBooking(app, other, workerB);
    expect((await sweepBookings({ now: new Date(Date.now() + 2 * 24 * HOUR) })).reminded).toBe(0);
    await sweepBookings({ now: new Date(Date.now() + 3.5 * 24 * HOUR) });
    await sweepBookings({ now: new Date(Date.now() + 4 * 24 * HOUR) });
    expect(await Notification.countDocuments({ user: other.user._id, type: 'review_reminder', 'params.bookingId': String(b._id) })).toBe(1);
  });
});

describe('no-show answers and disputes', () => {
  freshCustomers();
  async function reportedNoShow(c, w) {
    const b = await acceptedBooking(app, c, w);
    await Booking.updateOne({ _id: b._id }, { $set: { scheduledStart: new Date(Date.now() - 3 * HOUR) } });
    expect((await act(app, c, b._id, 'no-show')).status).toBe(200);
    return b;
  }

  test('the worker admits: confirmed no-show (worker_no_show)', async () => {
    const b = await reportedNoShow(other, workerB);
    expect((await act(app, workerB, b._id, 'no-show/respond', { answer: 'maybe' })).body.code).toBe('NO_SHOW_ANSWER_INVALID');
    const res = await act(app, workerB, b._id, 'no-show/respond', { answer: 'admit' });
    expect(res.body.booking).toMatchObject({ status: 'cancelled', outcome: 'worker_no_show' });
  });

  test('the worker disputes; while open nothing else happens; the admin decides with a required note; 409 on a second decision', async () => {
    const b = await reportedNoShow(other, workerB);
    const res = await act(app, workerB, b._id, 'no-show/respond', { answer: 'dispute', note: 'I came at 9.' });
    expect(res.body.booking.dispute).toMatchObject({ type: 'no_show_contested', status: 'open' });
    expect(await AuditLog.exists({ action: 'dispute.opened', targetId: String(b._id) })).toBeTruthy();
    expect(await Notification.exists({ user: other.user._id, type: 'dispute_opened' })).toBeTruthy();
    expect((await act(app, other, b._id, 'cancel', { reason: 'other' })).body.code).toBe('DISPUTE_OPEN');
    expect((await sweepBookings({ now: new Date(Date.now() + 80 * HOUR) })).noShowConfirmed).toBe(0);

    const queue = await get(admin, '/api/admin/disputes');
    expect(queue.body.disputes.map((d) => d._id)).toContain(String(b._id));
    const decide = (body) => api(app, admin.cookie).patch(`/api/admin/bookings/${b._id}/dispute`).send(body);
    expect((await decide({ decision: 'no_show_rejected' })).status).toBe(400); // note required
    expect((await decide({ decision: 'work_done', note: 'Checked with both people.' })).body.code).toBe('DISPUTE_DECISION_INVALID');
    expect((await api(app, workerB.cookie).patch(`/api/admin/bookings/${b._id}/dispute`).send({ decision: 'no_show_rejected', note: 'Checked.' })).status).toBe(403);
    const ok = await decide({ decision: 'no_show_rejected', note: 'Both confirmed the worker came.' });
    expect(ok.status).toBe(200);
    expect(ok.body.booking).toMatchObject({ status: 'cancelled', outcome: 'closed_no_fault' });
    expect((await decide({ decision: 'no_show_confirmed', note: 'Second try.' })).status).toBe(409);
    const audit = await AuditLog.findOne({ action: 'dispute.decided', targetId: String(b._id) }).lean();
    expect(audit).toMatchObject({ fromState: 'no_show_contested', toState: 'no_show_rejected', reason: 'Both confirmed the worker came.' });
    expect(await Notification.countDocuments({ type: 'dispute_decided', 'params.bookingId': String(b._id) })).toBe(2);
  });

  test.each([
    ['work_done', { status: 'completed', outcome: 'completed', completionMethod: 'admin' }],
    ['not_done_worker_fault', { status: 'cancelled', outcome: 'worker_no_show' }],
    ['not_done_no_fault', { status: 'cancelled', outcome: 'closed_no_fault' }],
  ])('completion contested -> %s', async (decision, want) => {
    const b = await acceptedBooking(app, other, workerB);
    expect((await act(app, other, b._id, 'contest-done', {})).body.code).toBe('BOOKING_NOT_ALLOWED'); // nobody confirmed yet
    await act(app, workerB, b._id, 'confirm-done');
    const contested = await act(app, other, b._id, 'contest-done', { reasonCode: 'work_not_done', note: 'Nothing was fixed.' });
    expect(contested.body.booking.dispute).toMatchObject({ type: 'completion_contested', openedBy: 'customer' });
    expect((await sweepBookings({ now: new Date(Date.now() + 80 * HOUR) })).autoCompleted).toBe(0); // the timer stops
    const res = await api(app, admin.cookie).patch(`/api/admin/bookings/${b._id}/dispute`).send({ decision, note: 'Decided after a phone call.' });
    expect(res.body.booking).toMatchObject(want);
  });

  test.each([
    ['worker_fault', 'cancelled_by_worker_late'],
    ['no_fault', 'closed_no_fault'],
  ])('cancellation fault -> %s keeps or changes the outcome', async (decision, outcome) => {
    const b = await acceptedBooking(app, other, workerB);
    // Tomorrow 09:00 is 9 to 33 hours away, depending on the hour the suite runs. Moving the booking 12 hours back puts
    // the start less than 24 hours away at ANY hour, so the worker's cancellation is always "late" (Batch 8A: this
    // test failed between 00:00 and 09:00 Pakistan time).
    await shiftBooking(b._id, 12);
    await act(app, workerB, b._id, 'cancel', { reason: 'emergency' });
    const res = await act(app, workerB, b._id, 'dispute', { reasonCode: 'not_my_fault', note: 'The customer asked me to cancel.' });
    expect(res.body.booking.dispute.type).toBe('cancellation_fault');
    expect((await act(app, workerB, b._id, 'dispute', { reasonCode: 'not_my_fault' })).body.code).toBe('DISPUTE_OPEN');
    const decided = await api(app, admin.cookie).patch(`/api/admin/bookings/${b._id}/dispute`).send({ decision, note: 'Messages checked.' });
    expect(decided.body.booking.outcome).toBe(outcome);
    expect((await act(app, workerB, b._id, 'dispute', { reasonCode: 'not_my_fault' })).body.code).toBe('DISPUTE_NOT_ALLOWED'); // one dispute per booking
  });

  test('a cancellation dispute after 14 days is refused; a customer cancellation cannot be disputed', async () => {
    const b = await acceptedBooking(app, other, workerB);
    await act(app, workerB, b._id, 'cancel', { reason: 'emergency' });
    await shiftBooking(b._id, 15 * 24);
    expect((await act(app, workerB, b._id, 'dispute', { reasonCode: 'not_my_fault' })).body.code).toBe('DISPUTE_WINDOW_PASSED');
    const c = await request(app, other, workerB);
    await act(app, other, c._id, 'cancel');
    expect((await act(app, workerB, c._id, 'dispute', { reasonCode: 'not_my_fault' })).body.code).toBe('DISPUTE_NOT_ALLOWED');
  });
});

describe('cron endpoint and audit chain', () => {
  test('GET /api/cron/daily: 401 without the secret, with a wrong one, and when CRON_SECRET is not set', async () => {
    const env = await import('../../config/env.js');
    const secret = 'test-cron-secret-0123456789-abcdefghijk';
    const spy = vi.spyOn(env, 'getEnv');
    spy.mockReturnValue({ ...env.loadEnv(process.env), CRON_SECRET: undefined });
    expect((await api(app).get('/api/cron/daily').set('Authorization', 'Bearer anything')).status).toBe(401);
    spy.mockReturnValue({ ...env.loadEnv(process.env), CRON_SECRET: secret });
    expect((await api(app).get('/api/cron/daily')).status).toBe(401);
    expect((await api(app).get('/api/cron/daily').set('Authorization', `Bearer ${secret}x`)).status).toBe(401);
    expect((await api(app).get('/api/cron/daily').set('Authorization', secret)).status).toBe(401);
    const ok = await api(app).get('/api/cron/daily').set('Authorization', `Bearer ${secret}`);
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ ok: true, swept: expect.any(Object), refreshed: expect.any(Number) });
    const again = await api(app).get('/api/cron/daily').set('Authorization', `Bearer ${secret}`);
    expect(again.body.swept).toEqual({ expired: 0, autoCompleted: 0, noShowConfirmed: 0, reminded: 0 });
  });

  test('every booking audit entry is in the hash chain and the chain still verifies', async () => {
    const actions = await AuditLog.distinct('action');
    for (const a of ['booking.completed', 'booking.closed', 'dispute.opened', 'dispute.decided']) expect(actions).toContain(a);
    expect((await verifyAuditChain()).ok).toBe(true);
  });

  test('scheduledStartFor: Pakistan time, also on a day near midnight UTC', () => {
    expect(scheduledStartFor('2026-11-17', 'morning').toISOString()).toBe('2026-11-17T04:00:00.000Z');
    expect(scheduledStartFor('2026-12-31', 'any').toISOString()).toBe('2026-12-31T04:00:00.000Z');
    expect(() => scheduledStartFor('17-11-2026', 'morning')).toThrow();
  });
});
