// Module 6 (Batch 8A): job requests through the real API with an in-memory MongoDB. Synthetic accounts and texts only.
// Time is never waited for: dates are moved into the past in the database, and the booking sweep runs on every read.
import { describe, test, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import JobRequest from '../../models/JobRequest.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import AuditLog from '../../models/AuditLog.js';
import Notification from '../../models/Notification.js';
import { startTestDb, stopTestDb } from '../helpers/testDb.js';
import { api } from '../helpers/api.js';
import { makeWorker, makeCustomer, makeAdmin, act, shiftBooking, allKeys, tomorrowPkt, request as plainRequest } from '../helpers/module4.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const PRIVATE_WORKER_KEYS = ['phone', 'whatsappNumber', 'whatsapp', 'whatsappLink', 'email', 'address', 'emergencyContact', 'cnicEncrypted', 'cnicHash', 'cnicOnFile', 'password'];
const BUDGET = 98765; // a number that appears nowhere else

let app;
let admin;
let wPindi; // plumber in "Pindi" (= Rawalpindi)
let wRwp; // plumber in Rawalpindi
let wLahore; // plumber in another city
let wElec; // electrician in Rawalpindi (another trade)
let wSusp; // suspended plumber in Rawalpindi
let wUnlisted; // plumber in Rawalpindi without the "Your work" step
let wNoCity; // plumber without a city
let customer;
let other;
let worker; // a worker account, for the 403 checks

const jobBody = (extra = {}) => ({
  description: 'Bathroom ka nalka tapak raha hai, kal subah koi aa jaye (synthetic)',
  inputMode: 'text',
  category: 'plumbing_sanitary',
  skills: ['plumb_leak', 'plumb_fixtures'],
  taskType: 'repair',
  city: 'Rawalpindi',
  area: 'Satellite Town',
  preferredDate: tomorrowPkt(),
  timeSlot: 'morning',
  urgent: true,
  budget: { amount: BUDGET, unit: 'job' },
  ...extra,
});
const as = (who) => api(app, who.cookie);
async function newJob(who = customer, extra) {
  const res = await as(who).post('/api/job-requests').send(jobBody(extra));
  if (res.status !== 201) throw new Error(`job failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.job;
}
const sendTo = (who, job, w, extra = {}) => as(who).post(`/api/job-requests/${job._id}/request`).send({
  jobVersion: job.version, workerIdCode: w.code, skillId: w.skill, preferredDate: tomorrowPkt(), timeSlot: 'morning', ...extra,
});
async function dbCounts() {
  const collections = await mongoose.connection.db.collections();
  const counts = await Promise.all(collections.map(async (c) => [c.collectionName, await c.countDocuments()]));
  return Object.fromEntries(counts);
}

beforeAll(async () => {
  await startTestDb();
  app = createApp();
  admin = await makeAdmin(app);
  wPindi = { ...(await makeWorker(app, { name: 'Pindi Plumber (synthetic)', skills: ['plumb_leak', 'plumb_fixtures'], city: 'Pindi', whatsapp: '03215550101' })), skill: 'plumb_leak' };
  wRwp = { ...(await makeWorker(app, { name: 'Rawalpindi Plumber (synthetic)', skills: ['plumb_general'], city: 'Rawalpindi' })), skill: 'plumb_general' };
  wLahore = { ...(await makeWorker(app, { skills: ['plumb_leak'], city: 'Lahore' })), skill: 'plumb_leak' };
  wElec = { ...(await makeWorker(app, { skills: ['elec_wiring'], city: 'Rawalpindi' })), skill: 'elec_wiring' };
  wSusp = { ...(await makeWorker(app, { skills: ['plumb_leak'], city: 'Rawalpindi' })), skill: 'plumb_leak' };
  wUnlisted = await makeWorker(app, { skills: ['plumb_leak'], city: 'Rawalpindi' });
  wNoCity = await makeWorker(app, { skills: ['plumb_leak'], city: 'Rawalpindi' });
  await User.updateOne({ _id: wSusp.user._id }, { $set: { status: 'suspended' } });
  await WorkerProfile.updateOne({ _id: wUnlisted.profileId }, { $set: { occupation: '' } });
  await WorkerProfile.updateOne({ _id: wNoCity.profileId }, { $set: { city: '' } });
  worker = wRwp;
}, 180000);
afterAll(stopTestDb);
beforeEach(async () => {
  customer = await makeCustomer(app);
  other = await makeCustomer(app, { name: 'Other Customer (synthetic)' });
});

describe('POST /api/job-requests/analyze: suggestions only, nothing saved', () => {
  test('the live method (rules) for a customer and an admin; the database is unchanged; no text in any log', async () => {
    const before = await dbCounts();
    const spies = ['log', 'info', 'warn', 'error'].map((m) => vi.spyOn(console, m));
    const res = await as(customer).post('/api/job-requests/analyze').send({ text: 'Kal subah AC ki service karwani hai, Rawalpindi mein', inputMode: 'voice' });
    const logged = spies.flatMap((s) => s.mock.calls.flat()).map(String).join(' ');
    spies.forEach((s) => s.mockRestore());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ method: 'rules', methodName: 'rule-based word lists', category: { suggested: 'ac_appliance_repair' }, city: { suggested: 'Rawalpindi' } });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(JSON.stringify(res.body)).not.toMatch(/score|probab|confiden|%/i);
    expect(logged).not.toContain('service karwani');
    expect(await dbCounts()).toEqual(before);
    expect((await as(admin).post('/api/job-requests/analyze').send({ text: 'plumber chahiye' })).status).toBe(200);
  });

  // Batch 8B: the screen's "Which city?" buttons need the names of the matched city spellings (added, nothing removed)
  test('city.candidates: the English names of the matched city spellings, in text order', async () => {
    const two = await as(customer).post('/api/job-requests/analyze').send({ text: 'Mari se Pindi samaan shift karna hai' });
    expect(two.body.city).toEqual({ suggested: null, region: null, matched: ['mari', 'pindi'], conflict: true, candidates: ['Murree', 'Rawalpindi'] });
    const one = await as(customer).post('/api/job-requests/analyze').send({ text: 'pindi mein plumber' });
    expect(one.body.city).toMatchObject({ suggested: 'Rawalpindi', candidates: ['Rawalpindi'] });
    const none = await as(customer).post('/api/job-requests/analyze').send({ text: 'plumber chahiye' });
    expect(none.body.city).toMatchObject({ suggested: null, matched: [], candidates: [] });
  });

  test('contact details and CNIC numbers are refused; strict body; length limits', async () => {
    const r1 = await as(customer).post('/api/job-requests/analyze').send({ text: 'Call 0300-1234567 for AC repair' });
    expect([r1.status, r1.body.code]).toEqual([400, 'TEXT_HAS_CONTACT_INFO']);
    const r2 = await as(customer).post('/api/job-requests/analyze').send({ text: 'mera CNIC 12345-1234567-1 hai' });
    expect(r2.status).toBe(400);
    expect(r2.body.errors.map((e) => e.code)).toContain('NOTE_HAS_CNIC');
    expect((await as(customer).post('/api/job-requests/analyze').send({ text: '   ' })).body.code).toBe('TEXT_TOO_SHORT');
    expect((await as(customer).post('/api/job-requests/analyze').send({ text: 'a'.repeat(501) })).body.code).toBe('TEXT_TOO_LONG');
    expect((await as(customer).post('/api/job-requests/analyze').send({ text: 'AC', save: true })).body.code).toBe('UNKNOWN_FIELD');
    expect((await as(customer).post('/api/job-requests/analyze').send({ text: 'AC', inputMode: 'telepathy' })).body.code).toBe('INPUT_MODE_INVALID');
  });
});

describe('roles: workers get 403 everywhere; nobody without a login', () => {
  test('every route', async () => {
    const job = await newJob();
    const id = job._id;
    const calls = [
      ['post', '/api/job-requests/analyze', { text: 'AC' }], ['post', '/api/job-requests', jobBody()], ['get', '/api/job-requests/mine'],
      ['get', `/api/job-requests/${id}`], ['patch', `/api/job-requests/${id}`, { baseVersion: 1, urgent: false }],
      ['post', `/api/job-requests/${id}/close`, { reason: 'other' }], ['delete', `/api/job-requests/${id}`],
      ['get', `/api/job-requests/${id}/workers`], ['post', `/api/job-requests/${id}/request`, {}],
      ['get', '/api/admin/job-requests'], ['get', '/api/admin/job-requests/stats'], ['get', `/api/admin/job-requests/${id}`],
    ];
    for (const [method, url, body] of calls) {
      const res = await as(worker)[method](url).send(body);
      expect([url, res.status]).toEqual([url, 403]);
      expect((await api(app)[method](url).send(body)).status).toBe(401);
    }
    // customers cannot use the admin routes; admins cannot save jobs for someone
    expect((await as(customer).get('/api/admin/job-requests')).status).toBe(403);
    expect((await as(admin).post('/api/job-requests').send(jobBody())).status).toBe(403);
  });
});

describe('POST /api/job-requests: save a confirmed job', () => {
  test('201: the owner view with code, state, actions, budget and the analysis computed on the server', async () => {
    const res = await as(customer).post('/api/job-requests').send(jobBody());
    expect(res.status).toBe(201);
    const job = res.body.job;
    expect(job.code).toMatch(/^JR-\d{4}-\d{6}$/);
    expect(job).toMatchObject({
      state: 'open', version: 1, category: 'plumbing_sanitary', taskType: 'repair', city: 'Rawalpindi', region: 'PB', area: 'Satellite Town',
      urgent: true, budget: { amount: BUDGET, unit: 'job' }, bookingsCount: 0, bookings: [], actions: ['edit', 'find_workers', 'request', 'close', 'delete'],
    });
    expect(job.skills).toEqual([{ skillId: 'plumb_leak', name: 'Water leak repair' }, { skillId: 'plumb_fixtures', name: 'Bathroom and sanitary fittings' }]);
    expect(job.analysis).toMatchObject({ method: 'rules', versions: { analyzer: 'job-rules-1' }, suggested: { category: 'plumbing_sanitary', taskType: 'repair' } });
    expect(job.analysis.changed).toMatchObject({ category: false, taskType: false, city: null, preferredDate: false, timeSlot: false });
    expect(Object.keys(job)).not.toContain('customer');
    expect(Object.keys(job)).not.toContain('activeBooking');
  });

  test('strict: the analysis, the customer or the code can never be sent', async () => {
    for (const extra of [{ analysis: { method: 'rules' } }, { customer: String(new mongoose.Types.ObjectId()) }, { code: 'JR-2026-999999' }, { status: 'closed' }]) {
      const res = await as(customer).post('/api/job-requests').send(jobBody(extra));
      expect([Object.keys(extra)[0], res.status, res.body.code]).toEqual([Object.keys(extra)[0], 400, 'UNKNOWN_FIELD']);
    }
  });

  test.each([
    [{ skills: ['elec_wiring'] }, 'JOB_SKILL_CATEGORY'],
    [{ skills: ['plumb_magic'] }, 'SKILL_UNKNOWN'],
    [{ skills: ['plumb_leak', 'plumb_pipe', 'plumb_pump', 'plumb_drain', 'plumb_geyser', 'plumb_general'] }, 'LIST_TOO_LONG'],
    [{ category: 'magic' }, 'CATEGORY_INVALID'],
    [{ taskType: 'fixing' }, 'TASK_TYPE_INVALID'],
    [{ inputMode: 'paper' }, 'INPUT_MODE_INVALID'],
    [{ timeSlot: 'night' }, 'TIME_SLOT_INVALID'],
    [{ budget: { amount: 2000 } }, 'JOB_BUDGET_INCOMPLETE'],
    [{ budget: { unit: 'day' } }, 'JOB_BUDGET_INCOMPLETE'],
    [{ budget: { amount: 50, unit: 'job' } }, 'NUMBER_TOO_SMALL'],
    [{ budget: { amount: 2000, unit: 'week' } }, 'UNIT_INVALID'],
    [{ preferredDate: '2026-02-30' }, 'DATE_NOT_REAL'],
    [{ preferredDate: '2020-01-01' }, 'BOOKING_DATE_RANGE'],
    [{ description: 'ok' }, 'TEXT_TOO_SHORT'],
    [{ description: 'Call me on 0300 1234567 please' }, 'TEXT_HAS_CONTACT_INFO'],
    [{ description: 'see www.example.com for photos' }, 'TEXT_HAS_CONTACT_INFO'],
    [{ area: 'near test@example.com' }, 'TEXT_HAS_CONTACT_INFO'],
    [{ urgent: 'yes' }, 'WRONG_TYPE'],
    [{ city: 'X' }, 'TEXT_TOO_SHORT'],
  ])('400 for %j -> %s', async (extra, code) => {
    const res = await as(customer).post('/api/job-requests').send(jobBody(extra));
    expect(res.status).toBe(400);
    expect(res.body.errors?.map((e) => e.code) ?? [res.body.code]).toContain(code);
  });

  test('optional fields: no budget, no day, no slot, an unknown city (no region)', async () => {
    const job = await newJob(customer, { budget: null, preferredDate: null, timeSlot: null, taskType: null, city: 'Chak 45', skills: [] });
    expect(job).toMatchObject({ budget: null, preferredDate: null, timeSlot: null, taskType: null, region: null, skills: [] });
    const minimal = { ...jobBody() };
    for (const k of ['preferredDate', 'timeSlot', 'urgent', 'budget']) delete minimal[k];
    expect((await as(customer).post('/api/job-requests').send(minimal)).body.job).toMatchObject({ urgent: false, budget: null });
  });

  test('limits: 10 active jobs (409 JOB_LIMIT_OPEN), 10 new jobs in 24 hours (429 JOB_LIMIT_DAY)', async () => {
    for (let i = 0; i < 10; i += 1) await newJob();
    await JobRequest.collection.updateMany({ customer: new mongoose.Types.ObjectId(customer.user._id) }, { $set: { createdAt: new Date(Date.now() - 25 * HOUR) } });
    const open = await as(customer).post('/api/job-requests').send(jobBody());
    expect([open.status, open.body.code, open.body.params]).toEqual([409, 'JOB_LIMIT_OPEN', { max: 10 }]);

    for (let i = 0; i < 10; i += 1) {
      const j = await newJob(other);
      await as(other).post(`/api/job-requests/${j._id}/close`).send({ reason: 'not_needed' });
    }
    const day = await as(other).post('/api/job-requests').send(jobBody());
    expect([day.status, day.body.code]).toEqual([429, 'JOB_LIMIT_DAY']);
  });

  test('expired jobs do not count as open', async () => {
    for (let i = 0; i < 10; i += 1) await newJob();
    await JobRequest.collection.updateMany({ customer: new mongoose.Types.ObjectId(customer.user._id) }, { $set: { createdAt: new Date(Date.now() - 31 * DAY) } });
    expect((await as(customer).post('/api/job-requests').send(jobBody())).status).toBe(201);
  });
});

describe('reading own jobs: ownership through a filter (someone else\'s job is 404)', () => {
  test('GET /mine lists only my jobs, newest first, with states, actions and counts; filters', async () => {
    const a = await newJob();
    const b = await newJob();
    await newJob(other);
    await as(customer).post(`/api/job-requests/${a._id}/close`).send({ reason: 'work_done' });
    const res = await as(customer).get('/api/job-requests/mine');
    expect(res.status).toBe(200);
    expect(res.body.jobs.map((j) => j.code)).toEqual([b.code, a.code]);
    expect(res.body.jobs[1]).toMatchObject({ state: 'closed', actions: ['delete'], budget: { amount: BUDGET } });
    expect(res.body.counts).toMatchObject({ open: 1, closed: 1, active: 1 });
    expect(res.body.jobs[0].analysis).toBeUndefined(); // the list is short; the detail has the analysis
    expect((await as(customer).get('/api/job-requests/mine?state=active')).body.jobs.map((j) => j.code)).toEqual([b.code]);
    expect((await as(customer).get('/api/job-requests/mine?state=closed&limit=1')).body).toMatchObject({ total: 1, limit: 1 });
    expect((await as(customer).get('/api/job-requests/mine?state=magic')).body.code).toBe('STATUS_UNKNOWN');
    expect((await as(customer).get('/api/job-requests/mine?customer=x')).body.code).toBe('UNKNOWN_FIELD');
  });

  test('another customer\'s job is 404 on every route; a bad id is 400', async () => {
    const job = await newJob(other);
    const id = job._id;
    for (const [method, url, body] of [
      ['get', `/api/job-requests/${id}`], ['patch', `/api/job-requests/${id}`, { baseVersion: 1, urgent: false }],
      ['post', `/api/job-requests/${id}/close`, { reason: 'other' }], ['delete', `/api/job-requests/${id}`],
      ['get', `/api/job-requests/${id}/workers`],
      ['post', `/api/job-requests/${id}/request`, { jobVersion: 1, workerIdCode: wRwp.code, skillId: wRwp.skill, preferredDate: tomorrowPkt(), timeSlot: 'morning' }],
    ]) {
      const res = await as(customer)[method](url).send(body);
      expect([url, method, res.status, res.body.code]).toEqual([url, method, 404, 'JOB_NOT_FOUND']);
    }
    expect((await as(customer).get(`/api/job-requests/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
    expect((await as(customer).get('/api/job-requests/not-an-id')).body.code).toBe('ID_INVALID');
    expect((await JobRequest.findById(id).lean()).status).toBe('open'); // nothing changed
  });
});

describe('PATCH /api/job-requests/:id: edit with versions, only while open', () => {
  test('a stale baseVersion is 409 JOB_CHANGED; each edit adds 1; a changed description is analysed again', async () => {
    const job = await newJob();
    const before = await JobRequest.findById(job._id).lean();
    expect(before.analysis.changed.timeSlot).toBe(false); // "subah" was suggested and kept
    const r1 = await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, timeSlot: 'evening' });
    expect(r1.status).toBe(200);
    expect(r1.body.job).toMatchObject({ version: 2, timeSlot: 'evening' });
    const after1 = await JobRequest.findById(job._id).lean();
    expect(after1.analysis.analyzedAt).toEqual(before.analysis.analyzedAt); // the same description: not analysed again
    expect(after1.analysis.changed.timeSlot).toBe(true); // the suggestion "morning" is no longer kept
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, urgent: true })).body.code).toBe('JOB_CHANGED');

    const r2 = await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 2, description: 'Ghar ki safai karwani hai (synthetic)', category: 'domestic_work', skills: ['dom_cleaning'], taskType: 'cleaning' });
    expect(r2.body.job).toMatchObject({ version: 3, category: 'domestic_work', analysis: { suggested: { category: 'domestic_work', taskType: 'cleaning' }, changed: { category: false, skills: false } } });
    expect(new Date(r2.body.job.analysis.analyzedAt).getTime()).toBeGreaterThanOrEqual(new Date(before.analysis.analyzedAt).getTime());
  });

  test('validation: nothing to change, skills of another trade, strict body, a missing baseVersion', async () => {
    const job = await newJob();
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1 })).body.code).toBe('JOB_EDIT_EMPTY');
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, category: 'electrical_solar' })).body.code).toBe('JOB_SKILL_CATEGORY');
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, version: 7 })).body.code).toBe('UNKNOWN_FIELD');
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ urgent: false })).status).toBe(400);
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, budget: null, city: 'Lahore' })).body.job).toMatchObject({ budget: null, city: 'Lahore', region: 'PB', version: 2 });
  });

  test('not editable once a request is waiting, after closing, or when expired (409 JOB_NOT_EDITABLE)', async () => {
    const job = await newJob();
    expect((await sendTo(customer, job, wPindi)).status).toBe(201);
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, urgent: false })).body.code).toBe('JOB_NOT_EDITABLE');
    const old = await newJob();
    await JobRequest.collection.updateOne({ _id: new mongoose.Types.ObjectId(old._id) }, { $set: { createdAt: new Date(Date.now() - 31 * DAY) } });
    expect((await as(customer).get(`/api/job-requests/${old._id}`)).body.job).toMatchObject({ state: 'expired', actions: ['close', 'delete'] });
    expect((await as(customer).patch(`/api/job-requests/${old._id}`).send({ baseVersion: 1, urgent: false })).body.code).toBe('JOB_NOT_EDITABLE');
  });
});

describe('review findings 1 and 8 (Batch 8A, Stage 9)', () => {
  test('1: no edit while a request is being written (a fresh reservation without its booking yet)', async () => {
    const job = await newJob();
    await JobRequest.updateOne({ _id: job._id }, { $set: { activeBooking: new mongoose.Types.ObjectId() } });
    const r = await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, description: 'Other words now (synthetic)' });
    expect([r.status, r.body.code]).toEqual([409, 'JOB_NOT_EDITABLE']);
    expect((await JobRequest.findById(job._id).lean()).description).toBe(jobBody().description);
    // a stale reservation (a request that crashed in between) does not block the edit
    await JobRequest.updateOne({ _id: job._id }, { $set: { activeBooking: mongoose.Types.ObjectId.createFromTime(Math.floor(Date.now() / 1000) - 120) } });
    expect((await as(customer).patch(`/api/job-requests/${job._id}`).send({ baseVersion: 1, urgent: false })).status).toBe(200);
  });

  test('8: a job deleted between the two reads of a list is skipped (200, never a 500)', async () => {
    await newJob();
    await newJob();
    const original = JobRequest.find.bind(JobRequest);
    for (const [who, url] of [[customer, '/api/job-requests/mine'], [admin, '/api/admin/job-requests']]) {
      let calls = 0;
      const spy = vi.spyOn(JobRequest, 'find').mockImplementation((filter, ...rest) => {
        calls += 1;
        return calls === 2 ? original({ _id: new mongoose.Types.ObjectId() }, ...rest) : original(filter, ...rest); // the page's jobs are gone
      });
      const res = await as(who).get(url);
      spy.mockRestore();
      expect([url, res.status, res.body.jobs]).toEqual([url, 200, []]);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('close and delete', () => {
  test('close: a reason is required; closing twice is 409; a closed job without bookings can be deleted', async () => {
    const job = await newJob();
    expect((await as(customer).post(`/api/job-requests/${job._id}/close`).send({})).body.code).toBe('CLOSE_REASON_INVALID');
    expect((await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'bored' })).body.code).toBe('CLOSE_REASON_INVALID');
    const closed = await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'found_elsewhere' });
    expect(closed.body.job).toMatchObject({ state: 'closed', closeReason: 'found_elsewhere', actions: ['delete'] });
    expect(closed.body.job.closedAt).toBeTruthy();
    expect((await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'other' })).body.code).toBe('JOB_NOT_OPEN');
    expect((await as(customer).post(`/api/job-requests/${job._id}/request`).send({ jobVersion: 1, workerIdCode: wRwp.code, skillId: wRwp.skill, preferredDate: tomorrowPkt(), timeSlot: 'morning' })).body.code).toBe('JOB_NOT_OPEN');
    expect((await as(customer).delete(`/api/job-requests/${job._id}`)).status).toBe(204);
    expect((await as(customer).get(`/api/job-requests/${job._id}`)).status).toBe(404);
  });

  test('a job that was ever sent to a worker cannot be deleted (409 JOB_HAS_BOOKINGS), even after a decline', async () => {
    const job = await newJob();
    const sent = await sendTo(customer, job, wPindi);
    await act(app, wPindi, sent.body.booking._id, 'decline', { reason: 'busy' });
    expect((await as(customer).delete(`/api/job-requests/${job._id}`)).body.code).toBe('JOB_HAS_BOOKINGS');
    expect(await JobRequest.exists({ _id: job._id })).toBeTruthy();
  });

  test('closing a job never changes its accepted booking', async () => {
    const job = await newJob();
    const sent = await sendTo(customer, job, wPindi);
    await act(app, wPindi, sent.body.booking._id, 'accept');
    const closed = await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'other' });
    expect(closed.body.job.state).toBe('closed');
    expect((await Booking.findById(sent.body.booking._id).lean()).status).toBe('accepted');
  });
});

describe('GET /api/job-requests/:id/workers: a filter, not a ranking', () => {
  test('same trade, same city ("Pindi" = "Rawalpindi"), listed and not suspended only; the reasons; no private field', async () => {
    const job = await newJob();
    const res = await as(customer).get(`/api/job-requests/${job._id}/workers`);
    expect(res.status).toBe(200);
    const codes = res.body.workers.map((w) => w.workerIdCode);
    expect(codes.sort()).toEqual([wPindi.code, wRwp.code].sort());
    for (const w of [wLahore, wElec, wSusp, wUnlisted, wNoCity]) expect(codes).not.toContain(w.code);
    const pindi = res.body.workers.find((w) => w.workerIdCode === wPindi.code);
    expect(pindi.matchedSkills).toEqual([{ skillId: 'plumb_leak', name: 'Water leak repair' }, { skillId: 'plumb_fixtures', name: 'Bathroom and sanitary fittings' }]);
    expect(pindi.sameCity).toBe(true);
    expect(res.body.workers.find((w) => w.workerIdCode === wRwp.code).matchedSkills).toEqual([]);
    expect(pindi.user).toEqual({ name: 'Pindi Plumber (synthetic)' });
    expect(res.body).toMatchObject({ page: 1, limit: 20, total: 2, sort: 'updated', truncated: false, filter: { category: 'plumbing_sanitary', city: 'Rawalpindi', marketCity: 'Rawalpindi', cityKnown: true } });
    const keys = allKeys(res.body);
    for (const k of PRIVATE_WORKER_KEYS) expect([k, keys.has(k)]).toEqual([k, false]);
    expect(JSON.stringify(res.body).replace(/\b[0-9a-f]{24,}\b/g, '<id>')).not.toMatch(/0321555|0300\d{7}/); // ids are random hex
  });

  test('the directory sorts and filters; paging; bad query values are 400', async () => {
    const job = await newJob();
    const tr = await as(customer).get(`/api/job-requests/${job._id}/workers?sort=track_record&limit=1&page=2`);
    expect(tr.status).toBe(200);
    expect(tr.body).toMatchObject({ sort: 'track_record', limit: 1, page: 2, total: 2 });
    expect(tr.body.workers).toHaveLength(1);
    for (const k of PRIVATE_WORKER_KEYS) expect(allKeys(tr.body).has(k)).toBe(false);
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers?identity=verified`)).body.total).toBe(0);
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers?availability=Busy`)).body.total).toBe(0);
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers?sort=price`)).body.code).toBe('SORT_INVALID');
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers?city=Lahore`)).body.code).toBe('UNKNOWN_FIELD');
  });

  test('an unknown city matches only the same name; a done job has no worker list', async () => {
    const job = await newJob(customer, { city: 'Chak 45' });
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers`)).body).toMatchObject({ total: 0, filter: { cityKnown: false, marketCity: 'chak45' } });
    await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'other' });
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers`)).body.code).toBe('JOB_NOT_OPEN');
  });
});

describe('POST /api/job-requests/:id/request: the request with the job attached', () => {
  test('201: the booking copies city, area and description from the job; the worker sees the job code and kind, never the budget', async () => {
    const job = await newJob(customer, { city: 'Pindi', area: 'Saddar' });
    const res = await sendTo(customer, job, wPindi, { offer: { amount: 3000, unit: 'job' } });
    expect(res.status).toBe(201);
    const b = res.body.booking;
    expect(b).toMatchObject({ status: 'requested', city: 'Pindi', area: 'Saddar', description: jobBody().description, skillId: 'plumb_leak', job: { _id: job._id, code: job.code, taskType: 'repair' } });
    expect(b.code).toMatch(/^BK-\d{4}-\d{6}$/);
    const saved = await Booking.findById(b._id).lean();
    expect(saved).toMatchObject({ jobCode: job.code, jobTaskType: 'repair', region: 'PB' });
    expect(String(saved.jobRequest)).toBe(job._id);
    expect(await AuditLog.exists({ action: 'terms.proposed', targetId: saved._id })).toBeTruthy();

    // everything the worker can get about this booking
    const views = [
      (await as(wPindi).get(`/api/bookings/${b._id}`)).body,
      (await as(wPindi).get('/api/bookings/mine?as=worker')).body,
      await Notification.find({ user: wPindi.user._id }).lean(),
    ];
    expect(views[0].booking.job).toEqual({ code: job.code, taskType: 'repair' });
    expect(views[1].bookings.find((x) => x._id === b._id).job).toEqual({ code: job.code, taskType: 'repair' });
    for (const v of views) {
      const keys = allKeys(JSON.parse(JSON.stringify(v)));
      for (const k of ['budget', 'analysis', 'jobRequest', 'suggested', 'changed']) expect([k, keys.has(k)]).toEqual([k, false]);
      expect(JSON.stringify(v)).not.toContain(String(BUDGET));
    }
    // the job shows its booking (code, status, worker name and Worker ID); state requested
    const detail = (await as(customer).get(`/api/job-requests/${job._id}`)).body.job;
    expect(detail).toMatchObject({ state: 'requested', actions: ['find_workers', 'close'], bookingsCount: 1 });
    expect(detail.bookings[0]).toMatchObject({ code: b.code, status: 'requested', worker: { name: 'Pindi Plumber (synthetic)', workerIdCode: wPindi.code } });
    expect(allKeys(detail.bookings).has('phone')).toBe(false);
  });

  test('one request at a time: a second one while it is open is 409; after a decline, an expiry or a cancellation the next one works', async () => {
    const job = await newJob();
    const first = await sendTo(customer, job, wPindi);
    expect(first.status).toBe(201);
    expect((await sendTo(customer, job, wRwp)).body.code).toBe('JOB_HAS_OPEN_REQUEST');
    await act(app, wPindi, first.body.booking._id, 'decline', { reason: 'busy' });
    const second = await sendTo(customer, job, wRwp);
    expect(second.status).toBe(201);
    await shiftBooking(second.body.booking._id, 49); // unanswered for 49 hours -> expired on the next read
    expect((await as(customer).get(`/api/job-requests/${job._id}`)).body.job.state).toBe('open');
    const third = await sendTo(customer, job, wPindi);
    expect(third.status).toBe(201);
    await act(app, customer, third.body.booking._id, 'cancel', {});
    expect((await sendTo(customer, job, wRwp)).status).toBe(201);
    expect(await Booking.countDocuments({ jobRequest: job._id })).toBe(4);
  });

  test('two requests at the same moment: exactly one 201 and one 409', async () => {
    const job = await newJob();
    const results = await Promise.all([sendTo(customer, job, wPindi), sendTo(customer, job, wRwp)]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(results.find((r) => r.status === 409).body.code).toBe('JOB_HAS_OPEN_REQUEST');
    expect(await Booking.countDocuments({ jobRequest: job._id })).toBe(1);
  });

  test('accepted -> 409 JOB_HAS_OPEN_REQUEST; completed -> done, no more requests or worker lists, close still works', async () => {
    const job = await newJob();
    const sent = await sendTo(customer, job, wPindi);
    await act(app, wPindi, sent.body.booking._id, 'accept');
    expect((await as(customer).get(`/api/job-requests/${job._id}`)).body.job.state).toBe('accepted');
    expect((await sendTo(customer, job, wRwp)).body.code).toBe('JOB_HAS_OPEN_REQUEST');
    await act(app, wPindi, sent.body.booking._id, 'confirm-done');
    await act(app, customer, sent.body.booking._id, 'confirm-done');
    expect((await as(customer).get(`/api/job-requests/${job._id}`)).body.job).toMatchObject({ state: 'done', actions: ['close'] });
    expect((await sendTo(customer, job, wRwp)).body.code).toBe('JOB_NOT_OPEN');
    expect((await as(customer).get(`/api/job-requests/${job._id}/workers`)).body.code).toBe('JOB_NOT_OPEN');
    expect((await as(customer).post(`/api/job-requests/${job._id}/close`).send({ reason: 'work_done' })).body.job.state).toBe('closed');
    expect((await Booking.findById(sent.body.booking._id).lean()).status).toBe('completed');
  });

  test('the same checks as POST /api/bookings, plus the job\'s trade and version', async () => {
    const job = await newJob();
    expect((await sendTo(customer, job, wElec)).body.code).toBe('BOOKING_JOB_MISMATCH'); // the worker offers it, but it is another trade
    expect((await sendTo(customer, job, { ...wPindi, skill: 'plumb_geyser' })).body.code).toBe('BOOKING_SKILL_NOT_OFFERED');
    expect((await sendTo(customer, job, { code: 'DLM-2026-999999', skill: 'plumb_leak' })).body.code).toBe('WORKER_NOT_FOUND');
    expect((await sendTo(customer, job, wSusp)).body.code).toBe('BOOKING_WORKER_UNAVAILABLE');
    expect((await sendTo(customer, job, wPindi, { preferredDate: '2020-01-01' })).body.code).toBe('BOOKING_DATE_RANGE');
    expect((await sendTo(customer, job, wPindi, { jobVersion: 9 })).body.code).toBe('JOB_CHANGED');
    expect((await sendTo(customer, job, wPindi, { city: 'Lahore' })).body.code).toBe('UNKNOWN_FIELD'); // the job is the one source
    expect((await sendTo(customer, job, wPindi, { description: 'other words' })).body.code).toBe('UNKNOWN_FIELD');
    const self = await makeCustomer(app, { phone: wPindi.phone });
    const selfJob = await newJob(self);
    expect((await sendTo(self, selfJob, wPindi)).body.code).toBe('BOOKING_SELF');
    expect(await Booking.countDocuments({ jobRequest: job._id })).toBe(0);
    expect((await JobRequest.findById(job._id).lean()).activeBooking).toBeNull();
  });

  test('the customer\'s booking limits still apply (one open request per worker)', async () => {
    await plainRequest(app, customer, wPindi, { skillId: 'plumb_leak', city: 'Rawalpindi' });
    const job = await newJob();
    expect((await sendTo(customer, job, wPindi)).body.code).toBe('BOOKING_LIMIT_PAIR');
  });

  test('the reservation: a fresh one without its booking is taken; a stale one is free; a failed write releases it', async () => {
    const job = await newJob();
    const fresh = new mongoose.Types.ObjectId();
    await JobRequest.updateOne({ _id: job._id }, { $set: { activeBooking: fresh } });
    expect((await sendTo(customer, job, wPindi)).body.code).toBe('JOB_HAS_OPEN_REQUEST');
    expect((await as(customer).delete(`/api/job-requests/${job._id}`)).body.code).toBe('JOB_HAS_OPEN_REQUEST');
    const stale = mongoose.Types.ObjectId.createFromTime(Math.floor(Date.now() / 1000) - 120);
    await JobRequest.updateOne({ _id: job._id }, { $set: { activeBooking: stale } });
    const spy = vi.spyOn(Booking, 'create').mockRejectedValueOnce(new Error('disk full (test)'));
    const failed = await sendTo(customer, job, wPindi);
    spy.mockRestore();
    expect([failed.status, failed.body.code]).toEqual([500, 'SERVER_ERROR']);
    expect(JSON.stringify(failed.body)).not.toContain('disk full');
    expect(String((await JobRequest.findById(job._id).lean()).activeBooking)).toBe(String(stale)); // released to the value read
    const ok = await sendTo(customer, job, wPindi);
    expect(ok.status).toBe(201);
    expect(String((await JobRequest.findById(job._id).lean()).activeBooking)).toBe(ok.body.booking._id);
  });

  test('a booking made without a job has no job key at all', async () => {
    const b = await plainRequest(app, customer, wRwp, { skillId: 'plumb_general' });
    expect(Object.keys(b)).not.toContain('job');
    expect(Object.keys((await as(wRwp).get(`/api/bookings/${b._id}`)).body.booking)).not.toContain('job');
    const saved = await Booking.findById(b._id).lean();
    for (const k of ['jobRequest', 'jobCode', 'jobTaskType']) expect(Object.keys(saved)).not.toContain(k);
  });
});

describe('admin: read-only views and the use statistics', () => {
  test('the list has no budget; filters by state, trade and JR code; the detail has everything and the name only', async () => {
    const a = await newJob();
    const b = await newJob(customer, { description: 'AC ki service karwani hai (synthetic)', category: 'ac_appliance_repair', skills: ['ac_service'], taskType: 'service' });
    await sendTo(customer, a, wPindi);
    const list = await as(admin).get('/api/admin/job-requests');
    expect(list.status).toBe(200);
    expect(allKeys(list.body).has('budget')).toBe(false);
    expect(JSON.stringify(list.body)).not.toContain(String(BUDGET));
    const mine = list.body.jobs.find((j) => j.code === a.code);
    expect(mine).toMatchObject({ state: 'requested', customer: { name: 'Sara Khan (synthetic)' }, bookingsCount: 1, analysisMethod: 'rules' });
    expect((await as(admin).get(`/api/admin/job-requests?q=${b.code}`)).body.jobs.map((j) => j.code)).toEqual([b.code]);
    expect((await as(admin).get('/api/admin/job-requests?category=ac_appliance_repair&state=open')).body.jobs.map((j) => j.code)).toContain(b.code);
    expect((await as(admin).get('/api/admin/job-requests?state=requested')).body.jobs.map((j) => j.code)).not.toContain(b.code);
    expect((await as(admin).get('/api/admin/job-requests?q=(.*)')).status).toBe(200); // escaped, never a pattern
    expect((await as(admin).get('/api/admin/job-requests?category=magic')).body.code).toBe('CATEGORY_UNKNOWN');

    const detail = await as(admin).get(`/api/admin/job-requests/${a._id}`);
    expect(detail.body.job).toMatchObject({ code: a.code, budget: { amount: BUDGET, unit: 'job' }, customer: { name: 'Sara Khan (synthetic)' }, analysis: { method: 'rules' }, bookingsCount: 1 });
    expect(detail.body.job.bookings[0].worker.workerIdCode).toBe(wPindi.code);
    const keys = allKeys(detail.body);
    for (const k of ['email', 'phone', 'whatsappNumber', 'customerId']) expect(keys.has(k)).toBe(false);
    expect((await as(admin).get(`/api/admin/job-requests/${new mongoose.Types.ObjectId()}`)).body.code).toBe('JOB_NOT_FOUND');
    // the admin's booking view links to the job
    expect((await as(admin).get(`/api/admin/bookings/${detail.body.job.bookings[0]._id}`)).body.booking.job).toEqual({ _id: a._id, code: a.code, taskType: 'repair' });
  });

  test('stats: kept, changed and not suggested per field, from the jobs of the last days (use, not accuracy)', async () => {
    await JobRequest.deleteMany({});
    await newJob(); // plumbing suggested and kept
    await newJob(customer, { description: 'AC ki service karwani hai (synthetic)', category: 'domestic_work', skills: [], taskType: null, inputMode: 'voice' }); // AC suggested, changed
    await newJob(customer, { description: 'Kuch kaam hai ghar mein (synthetic)', category: 'home_maintenance', skills: [], taskType: null }); // nothing suggested
    const old = await newJob();
    await JobRequest.collection.updateOne({ _id: new mongoose.Types.ObjectId(old._id) }, { $set: { createdAt: new Date(Date.now() - 40 * DAY) } });
    const res = await as(admin).get('/api/admin/job-requests/stats?days=30');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ days: 30, jobs: 3, byMethod: { rules: 3 }, byInputMode: { text: 2, voice: 1 } });
    expect(res.body.fields.category).toEqual({ kept: 1, changed: 1, notSuggested: 1 });
    expect(res.body.fields.skills).toMatchObject({ kept: 1, notSuggested: 2 });
    expect(res.body.note).toMatch(/use, not correctness/);
    expect(JSON.stringify(res.body)).not.toMatch(/synthetic|nalka/);
    expect((await as(admin).get('/api/admin/job-requests/stats?days=3')).status).toBe(400);
    expect((await as(admin).get('/api/admin/job-requests/stats')).body.days).toBe(30);
  });
});

describe('GET /api/meta/job-options (public, no database)', () => {
  test('lists, limits and the live analyzer (no number about any suggestion)', async () => {
    const res = await api(app).get('/api/meta/job-options');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      taskTypes: ['install', 'repair', 'service', 'new_work', 'cleaning', 'moving', 'household_help'],
      closeReasons: ['work_done', 'not_needed', 'found_elsewhere', 'other'],
      inputModes: ['text', 'voice'],
      budgetUnits: ['job', 'day', 'hour'],
      limits: { descriptionMin: 3, descriptionMax: 500, areaMin: 2, areaMax: 80, maxSkills: 5, maxOpenPerCustomer: 10, maxNewPerDay: 10, openDays: 30, amountMin: 100, amountMax: 5000000 },
      analyzer: { method: 'rules', methodName: 'rule-based word lists', versions: { analyzer: 'job-rules-1', taxonomy: '2026-11-09-v1', phrases: '2026-11-24-v4', model: null } },
    });
  });
});
