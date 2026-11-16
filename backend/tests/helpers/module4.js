// Helpers for the Module 4 tests (synthetic accounts only, in-memory MongoDB).
// Time is controlled, never waited for: `shiftBooking` moves a booking's dates into the past, and the
// sweep is called with an explicit `now`.
import Booking from '../../models/Booking.js';
import { createAdminAccount } from '../../services/adminAccounts.js';
import { pktDate } from '../../services/booking/schedule.js';
import { api, registerUser, sessionCookie, uniqueEmail, GOOD_PASSWORD } from './api.js';

const HOUR = 60 * 60 * 1000;
let phoneSeq = 1000;
export const nextPhone = () => `0300${String((phoneSeq += 1)).padStart(7, '0')}`;

export async function makeWorker(app, { name = 'Bilal Ahmed (synthetic)', phone = nextPhone(), whatsapp = '', skills = ['elec_wiring', 'elec_solar'], city = 'Islamabad', availability = 'Available' } = {}) {
  const w = await registerUser(app, { name, phone, role: 'worker' });
  const res = await api(app, w.cookie).put('/api/workers/me').send({
    occupation: 'Electrician', category: 'electrical_solar', city, experienceYears: 4, hourlyRate: 600, availability,
    ...(whatsapp ? { whatsappNumber: whatsapp } : {}),
  });
  if (res.status !== 200) throw new Error(`profile failed: ${res.status} ${JSON.stringify(res.body)}`);
  const added = await api(app, w.cookie).post('/api/workers/me/skills').send({ skillIds: skills, addedVia: 'manual' });
  if (added.status >= 300) throw new Error(`skills failed: ${added.status} ${JSON.stringify(added.body)}`);
  return { ...w, phone, whatsapp, code: res.body.profile.workerIdCode, profileId: res.body.profile._id };
}

export async function makeCustomer(app, { name = 'Sara Khan (synthetic)', phone = nextPhone() } = {}) {
  const c = await registerUser(app, { name, phone, role: 'customer' });
  return { ...c, phone };
}

export async function makeAdmin(app) {
  const email = uniqueEmail('admin');
  await createAdminAccount({ name: 'Module 4 Admin (synthetic)', email, phone: nextPhone(), password: GOOD_PASSWORD });
  return { cookie: sessionCookie(await api(app).post('/api/auth/login').send({ email, password: GOOD_PASSWORD })) };
}

// Tomorrow in Pakistan time (always inside the allowed 30 days).
export const tomorrowPkt = () => pktDate(new Date(Date.now() + 24 * HOUR));

export const requestBody = (worker, extra = {}) => ({
  workerIdCode: worker.code, skillId: 'elec_wiring', preferredDate: tomorrowPkt(), timeSlot: 'morning',
  city: 'Islamabad', area: 'G-9 Markaz', description: 'Two sockets do not work.', ...extra,
});

export async function request(app, customer, worker, extra = {}) {
  const res = await api(app, customer.cookie).post('/api/bookings').send(requestBody(worker, extra));
  if (res.status !== 201) throw new Error(`request failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.booking;
}

export const act = (app, who, id, action, body) => api(app, who.cookie).post(`/api/bookings/${id}/${action}`).send(body);

export async function acceptedBooking(app, customer, worker, extra) {
  const b = await request(app, customer, worker, extra);
  const res = await act(app, worker, b._id, 'accept');
  if (res.status !== 200) throw new Error(`accept failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.booking;
}

export async function completedBooking(app, customer, worker, extra) {
  const b = await acceptedBooking(app, customer, worker, extra);
  await act(app, worker, b._id, 'confirm-done');
  const res = await act(app, customer, b._id, 'confirm-done');
  if (res.body.booking?.status !== 'completed') throw new Error(`complete failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.booking;
}

// Moves every date of a booking `hours` into the past (as if that much time had gone by).
export async function shiftBooking(id, hours) {
  const b = await Booking.findById(id).lean();
  const back = (d) => (d ? new Date(new Date(d).getTime() - hours * HOUR) : d);
  const set = {};
  for (const key of ['createdAt', 'scheduledStart', 'acceptedAt', 'customerConfirmedAt', 'workerConfirmedAt', 'completedAt', 'closedAt']) if (b[key]) set[key] = back(b[key]);
  if (b.noShow?.reportedAt) set['noShow.reportedAt'] = back(b.noShow.reportedAt);
  if (b.dispute?.openedAt) set['dispute.openedAt'] = back(b.dispute.openedAt);
  await Booking.collection.updateOne({ _id: b._id }, { $set: set });
}

// Every key name anywhere inside a JSON value.
export function allKeys(value, keys = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, keys));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      allKeys(v, keys);
    }
  }
  return keys;
}
