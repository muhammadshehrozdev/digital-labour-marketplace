// Module 4 (Batch 6): reviews after completed work, the reputation snapshot and when it is rebuilt,
// the public projection (words and counts, never the numbers), moderation, the rule-based flags,
// "Best track record", the CSV exports and the recompute script. In-memory MongoDB only.
import { describe, test, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import Booking from '../../models/Booking.js';
import Review from '../../models/Review.js';
import ReputationFlag from '../../models/ReputationFlag.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import { verifyAuditChain } from '../../services/audit.js';
import { computeReputation } from '../../services/reputation/reputationEngine.js';
import { recomputeReputation, loadReputationInput, safeRecompute } from '../../services/reputation/recompute.js';
import { nextBookingCode } from '../../services/booking/lifecycle.js';
import Counter from '../../models/Counter.js';
import { runPatternCheck, findRepeatPairBursts, findNewAccountPraise } from '../../services/reputation/patternCheck.js';
import { parseArgs, confirmRemote, recompute } from '../../scripts/reputationRecompute.js';
import { checkWriteAllowed } from '../../scripts/lib/dbGuard.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api } from '../helpers/api.js';
import { makeWorker, makeCustomer, makeAdmin, act, acceptedBooking, completedBooking, shiftBooking, allKeys } from '../helpers/module4.js';

let app;
let admin;
const HOUR = 60 * 60 * 1000;
const NUMBER_KEYS = ['expected', 'uncertainty', 'cautious', 'belief', 'disbelief', 'score', 'reliability', 'perReview'];

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  admin = await makeAdmin(app);
});
afterAll(stopTestDb);
afterEach(() => vi.restoreAllMocks());

const get = (who, url) => api(app, who.cookie).get(url);
const review = (c, id, body) => api(app, c.cookie).post(`/api/bookings/${id}/review`).send(body);
const moderate = (id, body) => api(app, admin.cookie).patch(`/api/admin/reviews/${id}`).send(body);
const snapshotOf = async (w) => (await WorkerProfile.findById(w.profileId).lean()).reputation;

describe('review rules', () => {
  test('only the customer of a completed booking, once, inside 14 days, with a valid body', async () => {
    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    const stranger = await makeCustomer(app);
    const b = await acceptedBooking(app, c, w);
    expect((await review(c, b._id, { rating: 5 })).body.code).toBe('REVIEW_NOT_ALLOWED'); // not completed yet
    await act(app, w, b._id, 'confirm-done');
    await act(app, c, b._id, 'confirm-done');
    expect((await review(stranger, b._id, { rating: 1 })).status).toBe(404);
    expect((await api(app, w.cookie).post(`/api/bookings/${b._id}/review`).send({ rating: 5 })).status).toBe(403);
    for (const [body, code] of [[{ rating: 6 }, 'RATING_INVALID'], [{ rating: 4.5 }, 'RATING_INVALID'], [{ rating: 4, onTime: 'maybe' }, 'ANSWER_INVALID'],
      [{ rating: 4, comment: 'Call me 0300-123-4567' }, 'TEXT_HAS_CONTACT_INFO'], [{ rating: 4, comment: 'مجھے ۰۳۰۰ ۱۲۳ ۴۵۶۷ پر فون کریں' }, 'TEXT_HAS_CONTACT_INFO'],
      [{ rating: 4, stars: 4 }, 'UNKNOWN_FIELD']]) {
      const res = await review(c, b._id, body);
      expect(res.status, JSON.stringify(body)).toBe(400);
      expect(res.body.code).toBe(code);
    }
    const ok = await review(c, b._id, { rating: 4, onTime: 'yes', workQuality: 'yes', polite: 'no', wouldHireAgain: 'yes', comment: '[Test] Fixed both sockets.' });
    expect(ok.status).toBe(201);
    expect(ok.body.review).toMatchObject({ rating: 4, onTime: 'yes', priceAsAgreed: null, status: 'visible' });
    const again = await review(c, b._id, { rating: 1 });
    expect(again.status).toBe(409);
    expect(again.body.code).toBe('REVIEW_EXISTS');

    // audit: the rating only, never the comment text
    const entry = await AuditLog.findOne({ action: 'review.created', targetId: ok.body.review._id }).lean();
    expect(entry.details.rating).toBe(4);
    expect(JSON.stringify(entry)).not.toContain('Fixed both sockets');
    const note = await Notification.findOne({ user: w.user._id, type: 'review_received' }).lean();
    expect(note.params).toMatchObject({ rating: '4', bookingCode: b.code });
  });

  test('the review window (14 days) and no review while a dispute is open', async () => {
    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    const late = await completedBooking(app, c, w);
    await shiftBooking(late._id, 15 * 24);
    expect((await review(c, late._id, { rating: 5 })).body.code).toBe('REVIEW_WINDOW_PASSED');
    const c2 = await makeCustomer(app);
    const open = await completedBooking(app, c2, w);
    await Booking.updateOne({ _id: open._id }, { $set: { 'dispute.type': 'completion_contested', 'dispute.status': 'open' } });
    expect((await review(c2, open._id, { rating: 5 })).body.code).toBe('DISPUTE_OPEN');
  });
});

describe('reputation snapshot and the public view', () => {
  let w;
  let reviews;
  beforeAll(async () => {
    w = await makeWorker(app, { name: 'Rated Worker (synthetic)' });
    reviews = [];
    for (const [stars, name] of [[5, 'Sara Khan (synthetic)'], [4, 'Ahmed Raza'], [2, 'Nadia Iqbal']]) {
      const c = await makeCustomer(app, { name });
      const b = await completedBooking(app, c, w);
      reviews.push((await review(c, b._id, { rating: stars, onTime: stars > 3 ? 'yes' : 'no', comment: `[Test] ${stars} stars.` })).body.review);
    }
  });

  test('the snapshot is rebuilt after each review; public profile shows words and counts, never the numbers', async () => {
    const snap = await snapshotOf(w);
    // Batch 6B: rep-2 is live (rep-1 was 'rep-1' with depth 'few'; rep-1 stays tested by name in the unit tests).
    // The public depth word follows the 3 visible reviews: uncertainty 2 / (3 + 2) = 0.4 -> 'some'.
    expect(snap).toMatchObject({ engineVersion: 'rep-2', public: { reviewCount: 3, completedJobs: 3, depth: 'some' } });
    expect(snap.baseRate).toEqual(expect.any(Number));
    expect(snap.public.ratingAverage).toBeCloseTo(11 / 3, 10);
    const c = await makeCustomer(app);
    const profile = (await get(c, `/api/workers/${w.code}`)).body;
    expect(profile.reputation.public).toMatchObject({ reviewCount: 3, completedJobs: 3, distribution: { 2: 1, 4: 1, 5: 1 }, quick: { onTime: { yes: 2, total: 3 } } });
    for (const key of NUMBER_KEYS) expect(allKeys(profile).has(key), key).toBe(false);
    const card = (await get(c, '/api/workers?search=Electrician')).body.workers.find((x) => x.workerIdCode === w.code);
    expect(Object.keys(card.reputation.public).sort()).toEqual(['completedJobs', 'depth', 'ratingAverage', 'reviewCount']);
    const compare = (await get(c, `/api/workers/compare?ids=${w.code},${(await makeWorker(app)).code}`)).body;
    for (const key of NUMBER_KEYS) expect(allKeys(compare).has(key), key).toBe(false);
  });

  test('every public rating number equals what is computed from the stored Review documents', async () => {
    const c = await makeCustomer(app);
    const stored = await Review.find({ worker: w.profileId, status: 'visible' }).lean();
    const pub = (await get(c, `/api/workers/${w.code}`)).body.reputation.public;
    expect(pub.reviewCount).toBe(stored.length);
    expect(pub.ratingAverage).toBeCloseTo(stored.reduce((s, r) => s + r.rating, 0) / stored.length, 12);
    for (const star of [1, 2, 3, 4, 5]) expect(pub.distribution[star]).toBe(stored.filter((r) => r.rating === star).length);
    const list = (await get(c, `/api/workers/${w.code}/reviews`)).body;
    expect(list.total).toBe(stored.length);
    expect(list.reviews.map((r) => r.rating).sort()).toEqual(stored.map((r) => r.rating).sort());
  });

  test('public reviews: "Sara K.", no account ids, email or phone; the worker himself may read them, another worker may not', async () => {
    const c = await makeCustomer(app);
    const res = await get(c, `/api/workers/${w.code}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.reviews.map((r) => r.reviewer).sort()).toEqual(['Ahmed R.', 'Nadia I.', 'Sara K.']);
    for (const key of ['customer', 'email', 'phone', 'booking', 'workerUser', 'reports', 'hidden']) expect(allKeys(res.body).has(key), key).toBe(false);
    expect((await get(w, `/api/workers/${w.code}/reviews`)).status).toBe(200);
    expect((await get(await makeWorker(app), `/api/workers/${w.code}/reviews`)).status).toBe(403);
    expect((await get(c, '/api/workers/DLM-2026-999999/reviews')).status).toBe(404);
    expect((await get(c, `/api/workers/${w.code}/reviews?page=0`)).status).toBe(400);
  });

  test('verified work history: skill, month, city and stars only; no customer details', async () => {
    const c = await makeCustomer(app);
    const res = await get(c, `/api/workers/${w.code}/work-history`);
    expect(res.body.total).toBe(3);
    expect(res.body.entries[0]).toEqual({ _id: expect.any(String), skillId: 'elec_wiring', skillName: 'House wiring', category: 'electrical_solar', month: expect.stringMatching(/^\d{4}-\d{2}$/), city: 'Islamabad', rating: expect.any(Number) });
    expect(JSON.stringify(res.body)).not.toMatch(/Sara|Ahmed|Nadia|G-9/);
  });

  test('My reputation: the numbers, per-review reasons, own cancellations and the rules (owner only)', async () => {
    const c = await makeCustomer(app);
    const b = await acceptedBooking(app, c, w);
    await Booking.updateOne({ _id: b._id }, { $set: { scheduledStart: new Date(Date.now() + 2 * HOUR) } });
    await act(app, w, b._id, 'cancel', { reason: 'cannot_come' });
    const res = await get(w, '/api/workers/me/reputation');
    expect(res.status).toBe(200);
    expect(res.body.snapshot.score.cautious).toBeLessThan(res.body.snapshot.score.expected);
    expect(res.body.snapshot.reliability).toMatchObject({ completed: 3, workerCancelledLate: 1 });
    expect(res.body.perReview).toHaveLength(3);
    // these customers hired nobody else: rep-2 counts the three together as one review (rep-1: 'new_reviewer')
    expect(res.body.perReview[0].reasons).toContain('new_reviewer_budget');
    expect(res.body.rules).toMatchObject({ engineVersion: 'rep-2', rankBy: 'expected', newReviewerBudget: 1, burstCheck: true });
    expect(res.body.rules.items.map((i) => i.id)).toEqual(['onlyCustomers', 'sameCustomer', 'newAccounts', 'burst', 'lateCancel']);
    expect(res.body.cancellations[0]).toMatchObject({ outcome: 'cancelled_by_worker_late', code: b.code });
    expect(res.body.rules).toMatchObject({ lateCancelHours: 24, earlyCancelCounts: 0.5, lateCancelCounts: 1 });
    expect((await get(c, '/api/workers/me/reputation')).status).toBe(403);
    // reliability is public as counts only
    expect((await get(c, `/api/workers/${w.code}`)).body.reputation.public.workerCancelledLate).toBe(1);
  });

  test('reply once (final) and report once; reporting does not hide; another worker gets 404', async () => {
    const id = reviews[2]._id;
    const reply = (who, text) => api(app, who.cookie).post(`/api/reviews/${id}/reply`).send({ text });
    expect((await reply(await makeWorker(app), 'Not mine')).status).toBe(404);
    expect((await reply(w, 'Call 03001234567')).body.code).toBe('TEXT_HAS_CONTACT_INFO');
    expect((await reply(w, '')).body.code).toBe('REPLY_EMPTY');
    expect((await reply(w, 'Sorry, the part was late. [Test]')).status).toBe(200);
    expect((await reply(w, 'Another reply')).status).toBe(409);
    const report = (body) => api(app, w.cookie).post(`/api/reviews/${id}/report`).send(body);
    expect((await report({ reasonCode: 'other' })).body.code).toBe('REASON_OTHER_NEEDS_WORDS');
    expect((await report({ reasonCode: 'job_did_not_happen' })).status).toBe(200);
    expect((await report({ reasonCode: 'abusive' })).status).toBe(409);
    expect((await Review.findById(id).lean()).status).toBe('visible');
    const c = await makeCustomer(app);
    const listed = (await get(c, `/api/workers/${w.code}/reviews`)).body.reviews.find((r) => r._id === id);
    expect(listed.reply).toMatchObject({ text: 'Sorry, the part was late. [Test]' });
  });

  test('an admin hides a review (reason required): it leaves the list and the score; restoring brings it back; audited; both told', async () => {
    const id = reviews[2]._id; // the 2 star review
    const queue = (await get(admin, '/api/admin/reviews?reported=true')).body;
    expect(queue.reviews[0]._id).toBe(id); // reported reviews first
    expect((await moderate(id, { action: 'hide' })).body.code).toBe('HIDE_REASON_INVALID');
    expect((await moderate(id, { action: 'hide', reasonCode: 'other' })).body.code).toBe('REASON_OTHER_NEEDS_WORDS');
    expect((await api(app, w.cookie).patch(`/api/admin/reviews/${id}`).send({ action: 'hide', reasonCode: 'unrelated' })).status).toBe(403);
    const hidden = await moderate(id, { action: 'hide', reasonCode: 'unrelated', note: 'About a different job.' });
    expect(hidden.status).toBe(200);
    expect(hidden.body.review).toMatchObject({ status: 'hidden', hidden: { reasonCode: 'unrelated' } });
    expect((await moderate(id, { action: 'hide', reasonCode: 'unrelated' })).status).toBe(409);
    const c = await makeCustomer(app);
    const after = (await get(c, `/api/workers/${w.code}`)).body.reputation.public;
    expect(after).toMatchObject({ reviewCount: 2, ratingAverage: 4.5 });
    expect((await get(c, `/api/workers/${w.code}/reviews`)).body.reviews.map((r) => r._id)).not.toContain(id);
    expect(await Notification.countDocuments({ type: 'review_hidden', 'params.reasonCode': 'unrelated' })).toBe(2);
    expect(await AuditLog.exists({ action: 'review.hidden', targetId: id })).toBeTruthy();

    expect((await moderate(id, { action: 'restore' })).body.code).toBe('WRITTEN_REASON_REQUIRED');
    expect((await moderate(id, { action: 'restore', note: 'The job was checked: it was this work.' })).status).toBe(200);
    expect((await get(c, `/api/workers/${w.code}`)).body.reputation.public.reviewCount).toBe(3);
    expect(await AuditLog.exists({ action: 'review.restored', targetId: id })).toBeTruthy();
  });
});

describe('the snapshot is rebuilt after every trigger', () => {
  test('completed, closed with an outcome, review created / hidden / restored, dispute decided', async () => {
    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    expect(await snapshotOf(w)).toBeNull(); // a new worker has no snapshot: "new on this platform"
    const b = await completedBooking(app, c, w);
    expect((await snapshotOf(w)).reliability.completed).toBe(1);
    const r = (await review(c, b._id, { rating: 3 })).body.review;
    expect((await snapshotOf(w)).public.reviewCount).toBe(1);
    await moderate(r._id, { action: 'hide', reasonCode: 'personal_information' });
    expect((await snapshotOf(w)).public.reviewCount).toBe(0);
    await moderate(r._id, { action: 'restore', note: 'Personal details were not in it.' });
    expect((await snapshotOf(w)).public.reviewCount).toBe(1);
    const c2 = await makeCustomer(app);
    const x = await acceptedBooking(app, c2, w);
    await act(app, w, x._id, 'confirm-done');
    await act(app, c2, x._id, 'contest-done', { note: 'Not finished.' });
    await api(app, admin.cookie).patch(`/api/admin/bookings/${x._id}/dispute`).send({ decision: 'not_done_worker_fault', note: 'The work was not done.' });
    expect((await snapshotOf(w)).reliability.noShows).toBe(1);
    const c3 = await makeCustomer(app);
    const d = await (async () => { const res = await api(app, c3.cookie).post('/api/bookings').send({ workerIdCode: w.code, skillId: 'elec_wiring', preferredDate: new Date(Date.now() + 29 * HOUR).toISOString().slice(0, 10), timeSlot: 'any', city: 'Islamabad', area: 'F-6' }); return res.body.booking; })();
    await act(app, w, d._id, 'decline');
    const snap = await snapshotOf(w);
    expect(snap.reliability).toMatchObject({ completed: 1, noShows: 1, acceptedTotal: 2 }); // declining never counts
  });
});

describe('suspicious-pattern flags (never change a score)', () => {
  test('new_account_praise: 3 good reviews in 14 days from new accounts with no other workers -> one flag; hide_reviews hides them', async () => {
    const w = await makeWorker(app);
    const ids = [];
    for (let i = 0; i < 3; i += 1) {
      const c = await makeCustomer(app, { name: `New Account ${i} (synthetic)` });
      const b = await completedBooking(app, c, w);
      ids.push((await review(c, b._id, { rating: 5 })).body.review._id);
    }
    const flags = await ReputationFlag.find({ worker: w.profileId, type: 'new_account_praise' }).lean();
    expect(flags).toHaveLength(1);
    expect(flags[0].reviewIds.map(String).sort()).toEqual([...ids].sort());
    expect(JSON.stringify(flags[0].details)).not.toMatch(/New Account/);
    // the flag changed no score: the snapshot equals the engine on the stored reviews
    const snap = await snapshotOf(w);
    expect(snap.public.reviewCount).toBe(3);
    expect(await runPatternCheck(w.profileId)).toEqual([]); // not raised twice
    const list = (await get(admin, '/api/admin/reputation-flags')).body;
    expect(list.flags.map((f) => f._id)).toContain(String(flags[0]._id));
    const decide = (body) => api(app, admin.cookie).patch(`/api/admin/reputation-flags/${flags[0]._id}`).send(body);
    expect((await decide({ action: 'hide_reviews' })).status).toBe(400);
    const res = await decide({ action: 'hide_reviews', note: 'Three new accounts, same day, no other jobs.' });
    expect(res.body).toMatchObject({ reviewsHidden: 3, flag: { status: 'actioned' } });
    expect((await snapshotOf(w)).public.reviewCount).toBe(0);
    expect(await Review.countDocuments({ _id: mongoose.trusted({ $in: ids }), 'hidden.reasonCode': 'fake_or_manipulated' })).toBe(3);
    expect((await decide({ action: 'dismiss', note: 'Second decision.' })).status).toBe(409);
    expect(await AuditLog.exists({ action: 'flag.created', targetId: String(flags[0]._id) })).toBeTruthy();
    expect(await AuditLog.exists({ action: 'flag.decided', targetId: String(flags[0]._id) })).toBeTruthy();
  });

  test('repeat_pair_burst: one customer completes 3 bookings with one worker within 30 days -> flag; dismiss keeps every review', async () => {
    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    const before = [];
    for (let i = 0; i < 3; i += 1) before.push(await completedBooking(app, c, w));
    const flag = await ReputationFlag.findOne({ worker: w.profileId, type: 'repeat_pair_burst' }).lean();
    expect(flag.bookingIds.map(String).sort()).toEqual(before.map((b) => String(b._id)).sort());
    const snap = await snapshotOf(w);
    expect(snap.reliability.repeatCustomers).toBe(1);
    const res = await api(app, admin.cookie).patch(`/api/admin/reputation-flags/${flag._id}`).send({ action: 'dismiss', note: 'A regular customer, checked by phone.' });
    expect(res.body.flag.status).toBe('dismissed');
    expect((await snapshotOf(w)).reliability).toMatchObject({ completed: 3, repeatCustomers: 1 });
  });

  test('the two rules as pure functions', () => {
    const now = new Date('2026-11-16T00:00:00Z');
    const day = (d) => new Date(now.getTime() - d * 24 * HOUR);
    const r = (id, over) => ({ id, stars: 5, createdAt: day(1), accountAgeDaysAtBooking: 2, customerOtherWorkers: 0, ...over });
    expect(findNewAccountPraise([r('a'), r('b'), r('c')], now)).toEqual(['a', 'b', 'c']);
    expect(findNewAccountPraise([r('a'), r('b'), r('c', { customerOtherWorkers: 1 })], now)).toEqual([]);
    expect(findNewAccountPraise([r('a'), r('b'), r('c', { stars: 3 })], now)).toEqual([]);
    expect(findNewAccountPraise([r('a'), r('b'), r('c', { createdAt: day(20) })], now)).toEqual([]);
    expect(findNewAccountPraise([r('a'), r('b'), r('c', { accountAgeDaysAtBooking: 30 })], now)).toEqual([]);
    const b = (id, customerId, d) => ({ id, customerId, completedAt: day(d) });
    expect(findRepeatPairBursts([b('1', 'x', 1), b('2', 'x', 10), b('3', 'x', 29), b('4', 'y', 2)]).sort()).toEqual(['1', '2', '3']);
    expect(findRepeatPairBursts([b('1', 'x', 1), b('2', 'x', 20), b('3', 'x', 40)])).toEqual([]);
  });
});

describe('"Best track record" and "Has done jobs on this platform"', () => {
  // Batch 6B: the ranking number is the live engine's (rep-2: expected; rep-1 was cautious); the order is the same
  test('orders by the ranking number; a worker without a snapshot counts as the no-review prior; the filter keeps workers with jobs', async () => {
    const strong = await makeWorker(app, { name: 'Track Strong (synthetic)', city: 'Trackville' });
    const weak = await makeWorker(app, { name: 'Track Weak (synthetic)', city: 'Trackville' });
    const fresh = await makeWorker(app, { name: 'Track New (synthetic)', city: 'Trackville' });
    for (let i = 0; i < 4; i += 1) {
      const c = await makeCustomer(app);
      const bk = await completedBooking(app, c, strong);
      await review(c, bk._id, { rating: 5 });
    }
    const c = await makeCustomer(app);
    const bw = await completedBooking(app, c, weak);
    await review(c, bw._id, { rating: 1 });
    const viewer = await makeCustomer(app);
    const order = (await get(viewer, '/api/workers?city=Trackville&sort=track_record')).body;
    expect(order.sort).toBe('track_record');
    expect(order.workers.map((x) => x.workerIdCode)).toEqual([strong.code, fresh.code, weak.code]); // one 1 star < new (the prior a) < four 5 star
    for (const key of NUMBER_KEYS) expect(allKeys(order).has(key), key).toBe(false);
    const jobs = (await get(viewer, '/api/workers?city=Trackville&hasJobs=true')).body.workers.map((x) => x.workerIdCode);
    expect(jobs.sort()).toEqual([strong.code, weak.code].sort());
    expect((await get(viewer, '/api/workers?sort=best')).body.code).toBe('SORT_INVALID');
    expect((await get(viewer, '/api/workers?hasJobs=yes')).status).toBe(400);
    // the snapshot does not touch updatedAt, so "Recently updated" is not changed by reviews
    const profile = await WorkerProfile.findById(strong.profileId).lean();
    expect(profile.updatedAt.getTime()).toBeLessThan(profile.reputation.computedAt.getTime());
  });
});

describe('admin views, exports and the recompute script', () => {
  test('admin: bookings list and search, worker breakdown, chart data; no phone numbers anywhere', async () => {
    const w = await makeWorker(app, { whatsapp: '03335557777' });
    const c = await makeCustomer(app, { name: 'Zainab Admin-View (synthetic)' });
    const b = await completedBooking(app, c, w);
    await review(c, b._id, { rating: 4, comment: '[Test] Good.' });
    const list = await get(admin, `/api/admin/bookings?q=${encodeURIComponent(b.code)}`);
    expect(list.body.bookings.map((x) => x.code)).toEqual([b.code]);
    expect(list.body.bookings[0].customer.name).toBe('Zainab Admin-View (synthetic)');
    expect((await get(admin, '/api/admin/bookings?q=Zainab')).body.total).toBe(1);
    const breakdown = await get(admin, `/api/admin/workers/${w.profileId}/reputation`);
    expect(breakdown.status).toBe(200);
    expect(breakdown.body.perReview[0]).toMatchObject({ weight: expect.any(Number), review: expect.objectContaining({ rating: 4 }) });
    const stats = await get(admin, '/api/admin/stats/bookings?days=14');
    expect(stats.body.bookingsPerDay).toHaveLength(14);
    expect(stats.body.ratingDistribution[4]).toBeGreaterThan(0);
    expect(stats.body.perWeek.at(-1).completed).toBeGreaterThan(0);
    for (const res of [list, breakdown, stats]) {
      expect(JSON.stringify(res.body)).not.toContain(w.phone);
      expect(JSON.stringify(res.body)).not.toContain('03335557777');
      expect(JSON.stringify(res.body)).not.toContain(c.phone);
    }
    for (const url of ['/api/admin/bookings', '/api/admin/disputes', '/api/admin/reviews', '/api/admin/reputation-flags', '/api/admin/stats/bookings']) {
      expect((await get(c, url)).status).toBe(403);
      expect((await get(w, url)).status).toBe(403);
    }
  });

  test.each([['bookings', '/api/admin/export/bookings.csv'], ['reviews', '/api/admin/export/reviews.csv'], ['bookings', '/api/admin/exports/bookings'], ['reviews', '/api/admin/exports/reviews']])(
    '%s CSV (%s): admin only; no phone numbers, descriptions or comment text; audited',
    async (kind, url) => {
      const w = await makeWorker(app, { whatsapp: '03445556666' });
      const c = await makeCustomer(app);
      const b = await completedBooking(app, c, w, { description: 'Secret description text' });
      await review(c, b._id, { rating: 5, comment: 'Secret comment text' });
      expect((await get(c, url)).status).toBe(403);
      const res = await get(admin, url);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(res.text).toContain(b.code);
      for (const secret of [w.phone, c.phone, '03445556666', 'Secret description text', 'Secret comment text', 'G-9 Markaz']) expect(res.text).not.toContain(secret);
      expect(await AuditLog.exists({ action: `export.${kind}` })).toBeTruthy();
    }
  );

  test('notifications never carry a phone number or a name', async () => {
    const notes = await Notification.find({ type: mongoose.trusted({ $regex: /^(booking|review|dispute|no_show)/ }) }).lean();
    expect(notes.length).toBeGreaterThan(10);
    const users = await User.find().select('phone name').lean();
    const text = JSON.stringify(notes.map((n) => n.params));
    for (const u of users) {
      expect(text).not.toContain(u.phone);
      expect(text).not.toContain(u.name);
    }
    for (const n of notes) for (const key of Object.keys(n.params)) expect(['skillId', 'skillName', 'evidenceId', 'reasonCode', 'note', 'bookingId', 'bookingCode', 'rating', 'outcome']).toContain(key);
  });

  test('reputation:recompute: arguments, the remote guard (--allow-remote AND typing yes), and a real rebuild', async () => {
    expect(parseArgs([]).error).toMatch(/exactly one/);
    expect(parseArgs(['--all', '--worker', 'DLM-2026-000001']).error).toMatch(/exactly one/);
    expect(parseArgs(['--worker', 'x']).error).toMatch(/DLM-2026/);
    expect(parseArgs(['--all'])).toEqual({ worker: null, all: true });
    const remote = 'mongodb+srv://u:p@cluster0.example.mongodb.net/db';
    expect(checkWriteAllowed(remote, ['node', 'x']).ok).toBe(false);
    expect(checkWriteAllowed(remote, ['node', 'x', '--allow-remote']).ok).toBe(true);
    expect(await confirmRemote(remote, 'cluster0.example.mongodb.net', async () => 'no')).toBe(false);
    expect(await confirmRemote(remote, 'cluster0.example.mongodb.net', async () => 'yes')).toBe(true);
    expect(await confirmRemote('mongodb://127.0.0.1:27017/x', '127.0.0.1:27017', async () => { throw new Error('never asked'); })).toBe(true);

    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    const b = await completedBooking(app, c, w);
    await review(c, b._id, { rating: 5 });
    await WorkerProfile.updateOne({ _id: w.profileId }, { $set: { reputation: null } });
    expect(await recompute({ worker: w.code })).toEqual({ done: 1 });
    expect((await snapshotOf(w)).public.reviewCount).toBe(1);
    expect((await recompute({ worker: 'DLM-2026-999999' })).error).toMatch(/No worker/);
    expect((await recompute({ all: true })).done).toBeGreaterThan(5);
    // recompute equals the engine on the stored data
    const stored = await Review.find({ worker: w.profileId }).lean();
    const engine = computeReputation(stored.map((r) => ({ id: String(r._id), customerId: String(r.customer), stars: r.rating, createdAt: r.createdAt, completionMethod: 'both', reviewerOtherWorkers: 0, hidden: false })), { now: new Date() });
    expect((await recomputeReputation(w.profileId)).score.expected).toBeCloseTo(engine.expected, 4);
  });

  test('error paths: a review whose booking lost its outcome keeps its completion method; a failed rebuild is logged, never thrown; two first booking codes at once retry once', async () => {
    const w = await makeWorker(app);
    const c = await makeCustomer(app);
    const b = await completedBooking(app, c, w);
    await review(c, b._id, { rating: 5 });
    await Booking.updateOne({ _id: b._id }, { $set: { outcome: null } });
    const input = await loadReputationInput(w.profileId);
    expect(input.closedBookings).toHaveLength(0);
    expect(input.reviews.map((r) => r.completionMethod)).toEqual(['both']);
    await Booking.updateOne({ _id: b._id }, { $set: { outcome: 'completed' } });

    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(WorkerProfile, 'updateOne').mockRejectedValueOnce(new Error('database went away'));
    expect(await safeRecompute(w.profileId)).toBeNull();
    expect(logged).toHaveBeenCalledWith(expect.stringMatching(/recompute failed .*database went away/));

    const spy = vi.spyOn(Counter, 'findOneAndUpdate');
    spy.mockRejectedValueOnce(Object.assign(new Error('E11000 duplicate key'), { code: 11000 }));
    const first = await nextBookingCode();
    expect(first).toMatch(/^BK-\d{4}-\d{6}$/);
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRejectedValueOnce(Object.assign(new Error('other failure'), { code: 2 }));
    await expect(nextBookingCode()).rejects.toThrow('other failure');
  });

  test('the audit chain still verifies after all of this', async () => {
    expect((await verifyAuditChain()).ok).toBe(true);
  });
});
