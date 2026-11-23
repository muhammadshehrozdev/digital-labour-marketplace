// The creation of a booking request, shared by POST /api/bookings (Module 4) and POST /api/job-requests/:id/request
// (Module 6), so both run the SAME checks, limits, notification and audit entry (one code path).
//   1. prepareBookingRequest  the worker exists, is listed and not suspended, offers the skill (and, for a job, the
//                             skill is in the job's trade), the date is allowed, not the same person, the customer's
//                             open / pair / day limits
//   2. createBookingRecord    writes the booking (an optional offer creates price terms version 1)
//   3. afterBookingRequest    the terms.proposed audit entry (only with an offer) and the booking_requested notification
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import { httpError } from '../../utils/httpError.js';
import { BOOKING_RULES as RULES, OPEN_STATUSES } from '../../config/bookingRules.js';
import { regionOf } from '../../config/regions.js';
import { notify } from '../notifications.js';
import { writeAudit } from '../audit.js';
import { isAllowedDate, scheduledStartFor, addHours } from './schedule.js';
import { normalizePhone } from './contactInfo.js';
import { nextBookingCode, trusted } from './lifecycle.js';
import { bookingParams } from './notify.js';
import { snapshotOf, termsFields } from '../wage/termsRules.js';

// request: { workerIdCode, skillId, preferredDate }; jobCategory: the job's trade (Module 6) or null.
export async function prepareBookingRequest(customer, request, now, { jobCategory = null } = {}) {
  const profile = await WorkerProfile.findOne({ workerIdCode: request.workerIdCode }).select('user skills occupation category whatsappNumber').lean();
  if (!profile) throw httpError(404, 'WORKER_NOT_FOUND');
  const workerUser = await User.findById(profile.user).select('phone status role').lean();
  if (!workerUser || workerUser.role !== 'worker' || workerUser.status === 'suspended' || !profile.occupation || !profile.category) {
    throw httpError(409, 'BOOKING_WORKER_UNAVAILABLE');
  }
  const skill = (profile.skills ?? []).find((s) => s.skillId === request.skillId);
  if (!skill) throw httpError(400, 'BOOKING_SKILL_NOT_OFFERED');
  if (jobCategory && skill.category !== jobCategory) throw httpError(400, 'BOOKING_JOB_MISMATCH');
  if (!isAllowedDate(request.preferredDate, now)) throw httpError(400, 'BOOKING_DATE_RANGE', { max: RULES.MAX_DAYS_AHEAD });

  // the same person on both sides (one phone number), for example to praise himself
  const mine = normalizePhone(customer.phone);
  if (mine && [workerUser.phone, profile.whatsappNumber].some((p) => normalizePhone(p) === mine)) throw httpError(400, 'BOOKING_SELF');

  const open = { customer: customer._id, status: trusted({ $in: OPEN_STATUSES }) };
  const [openCount, pairCount, dayCount] = await Promise.all([
    Booking.countDocuments(open),
    Booking.countDocuments({ ...open, workerUser: profile.user }),
    Booking.countDocuments({ customer: customer._id, createdAt: trusted({ $gte: addHours(now, -24) }) }),
  ]);
  if (pairCount >= RULES.MAX_OPEN_PER_PAIR) throw httpError(409, 'BOOKING_LIMIT_PAIR');
  if (openCount >= RULES.MAX_OPEN_PER_CUSTOMER) throw httpError(409, 'BOOKING_LIMIT_OPEN', { max: RULES.MAX_OPEN_PER_CUSTOMER });
  if (dayCount >= RULES.MAX_NEW_PER_DAY) throw httpError(429, 'BOOKING_LIMIT_DAY', { max: RULES.MAX_NEW_PER_DAY });
  return { profile, skill };
}

// fields: { preferredDate, timeSlot, city, area, description, offer? }; extra: { _id?, jobRequest?, jobCode?, jobTaskType? }
// Returns { booking (a Mongoose document), offer (the computed terms or null) }.
export async function createBookingRecord(customer, { profile, skill }, fields, now, extra = {}) {
  // Module 5: an optional offer creates price terms version 1, proposed by the customer (accepting the
  // request does NOT agree to it). The region comes from the city table (unknown city: null).
  const offer = fields.offer ? termsFields(fields.offer) : null;
  const booking = await Booking.create({
    ...(extra._id ? { _id: extra._id } : {}),
    code: await nextBookingCode(now),
    customer: customer._id,
    worker: profile._id,
    workerUser: profile.user,
    skillId: skill.skillId,
    skillName: skill.name,
    category: skill.category ?? profile.category,
    preferredDate: fields.preferredDate,
    timeSlot: fields.timeSlot,
    scheduledStart: scheduledStartFor(fields.preferredDate, fields.timeSlot),
    city: fields.city,
    area: fields.area,
    description: fields.description,
    statusHistory: [{ from: null, to: 'requested', by: 'customer', at: now, reason: null }],
    region: regionOf(fields.city),
    ...(offer ? {
      terms: { status: 'proposed', version: 1, proposedBy: 'customer', proposedAt: now, ...offer, agreed: null },
      termsHistory: [{ version: 1, by: 'customer', action: 'proposed', at: now, snapshot: snapshotOf(offer) }],
      moneyVersion: 1,
    } : {}),
    ...(extra.jobRequest ? { jobRequest: extra.jobRequest, jobCode: extra.jobCode, jobTaskType: extra.jobTaskType ?? null } : {}),
  });
  return { booking, offer };
}

export async function afterBookingRequest(customer, { booking, offer }) {
  if (offer) {
    await writeAudit({
      actor: customer._id, actorRole: 'customer', action: 'terms.proposed', targetType: 'Booking', targetId: booking._id, toState: 'proposed',
      reason: `Price offer with the request ${booking.code}`, details: { code: booking.code, version: 1, amount: offer.amount, unit: offer.unit, total: offer.total },
    });
  }
  await notify(booking.workerUser, 'booking_requested', bookingParams(booking, offer ? { amount: offer.amount, unit: offer.unit } : {}));
}
