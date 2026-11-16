// Rule-based pattern check (Module 4, decision D-051): it creates a ReputationFlag for an admin when a
// worker's reviews or bookings look like a known manipulation pattern. A flag NEVER changes a score.
//   new_account_praise  within 14 days, 3 or more reviews of 4 or 5 stars for one worker came from
//                       customers whose accounts were less than 14 days old at booking time AND who have
//                       no completed booking with any other worker
//   repeat_pair_burst   one customer completed 3 or more bookings with the same worker within 30 days
// All thresholds are provisional (PATTERN_RULES). The two find* functions are PURE.
import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import Review from '../../models/Review.js';
import User from '../../models/User.js';
import ReputationFlag from '../../models/ReputationFlag.js';
import { writeAudit } from '../audit.js';
import { otherWorkersByCustomer } from './recompute.js';

export const PATTERN_RULES = Object.freeze({
  praiseWindowDays: 14, praiseMinStars: 4, praiseMinReviews: 3, newAccountDays: 14,
  burstWindowDays: 30, burstMinBookings: 3,
});
const DAY = 24 * 60 * 60 * 1000;

// reviews: [{ id, stars, createdAt, accountAgeDaysAtBooking, customerOtherWorkers }]
export function findNewAccountPraise(reviews, now, rules = PATTERN_RULES) {
  const since = now.getTime() - rules.praiseWindowDays * DAY;
  const hits = reviews.filter((r) => new Date(r.createdAt).getTime() >= since && r.stars >= rules.praiseMinStars
    && r.accountAgeDaysAtBooking < rules.newAccountDays && r.customerOtherWorkers === 0);
  return hits.length >= rules.praiseMinReviews ? hits.map((r) => r.id) : [];
}

// completed: [{ id, customerId, completedAt }] of ONE worker. Returns the booking ids of every customer
// with a burst (3 or more completed bookings inside one 30-day window).
export function findRepeatPairBursts(completed, rules = PATTERN_RULES) {
  const byCustomer = new Map();
  for (const b of completed) {
    if (!byCustomer.has(b.customerId)) byCustomer.set(b.customerId, []);
    byCustomer.get(b.customerId).push(b);
  }
  const ids = [];
  for (const list of byCustomer.values()) {
    const sorted = [...list].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    const inBurst = new Set();
    for (let i = 0; i + rules.burstMinBookings - 1 < sorted.length; i += 1) {
      const last = sorted[i + rules.burstMinBookings - 1];
      if (new Date(last.completedAt) - new Date(sorted[i].completedAt) <= rules.burstWindowDays * DAY) {
        for (let j = i; j < i + rules.burstMinBookings; j += 1) inBurst.add(sorted[j].id);
      }
    }
    ids.push(...inBurst);
  }
  return ids;
}

// Creates a flag, or adds new ids to the open flag of the same type. Skips a pattern whose ids are all
// in earlier flags (a dismissed flag is not raised again for the same reviews).
async function raiseFlag(workerProfileId, type, field, ids, details, now) {
  if (ids.length === 0) return null;
  const earlier = await ReputationFlag.find({ worker: workerProfileId, type }).select(`status ${field}`).lean();
  const known = new Set(earlier.flatMap((f) => f[field].map(String)));
  if (ids.every((id) => known.has(String(id)))) return null;
  const open = earlier.find((f) => f.status === 'open');
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(String(id)));
  if (open) {
    return ReputationFlag.findOneAndUpdate(
      { _id: open._id, status: 'open' },
      { $addToSet: { [field]: mongoose.trusted({ $each: objectIds }) }, $set: { details } },
      { returnDocument: 'after' }
    ).lean();
  }
  const flag = await ReputationFlag.create({ worker: workerProfileId, type, [field]: objectIds, details });
  await writeAudit({
    actorRole: 'system', action: 'flag.created', targetType: 'ReputationFlag', targetId: flag._id,
    toState: 'open', reason: `Pattern check: ${type}`, details: { type, workerProfileId: String(workerProfileId), count: ids.length, ...details },
  });
  return flag;
}

// Runs both rules for one worker. Never throws (a failed check must not fail a review or a booking).
export async function runPatternCheck(workerProfileId, now = new Date()) {
  try {
    const id = new mongoose.Types.ObjectId(String(workerProfileId));
    const since = new Date(now.getTime() - Math.max(PATTERN_RULES.praiseWindowDays, PATTERN_RULES.burstWindowDays) * DAY);
    const reviews = await Review.find({ worker: id, status: 'visible', createdAt: mongoose.trusted({ $gte: since }) }).select('booking customer rating createdAt').lean();
    const flags = [];
    if (reviews.length >= PATTERN_RULES.praiseMinReviews) {
      const customerIds = [...new Set(reviews.map((r) => String(r.customer)))].map((c) => new mongoose.Types.ObjectId(c));
      const [customers, bookings, others] = await Promise.all([
        User.find({ _id: mongoose.trusted({ $in: customerIds }) }).select('createdAt').lean(),
        Booking.find({ _id: mongoose.trusted({ $in: reviews.map((r) => r.booking) }) }).select('createdAt').lean(),
        otherWorkersByCustomer(customerIds, id),
      ]);
      const created = new Map(customers.map((c) => [String(c._id), c.createdAt]));
      const bookedAt = new Map(bookings.map((b) => [String(b._id), b.createdAt]));
      const ids = findNewAccountPraise(reviews.map((r) => ({
        id: String(r._id),
        stars: r.rating,
        createdAt: r.createdAt,
        accountAgeDaysAtBooking: (new Date(bookedAt.get(String(r.booking)) ?? r.createdAt) - new Date(created.get(String(r.customer)) ?? 0)) / DAY,
        customerOtherWorkers: others.get(String(r.customer)) ?? 0,
      })), now);
      flags.push(await raiseFlag(id, 'new_account_praise', 'reviewIds', ids, { reviews: ids.length, windowDays: PATTERN_RULES.praiseWindowDays }, now));
    }
    const burstSince = new Date(now.getTime() - PATTERN_RULES.burstWindowDays * 2 * DAY);
    const completed = await Booking.find({ worker: id, status: 'completed', completedAt: mongoose.trusted({ $gte: burstSince }) }).select('customer completedAt').lean();
    const burst = findRepeatPairBursts(completed.map((b) => ({ id: String(b._id), customerId: String(b.customer), completedAt: b.completedAt })));
    flags.push(await raiseFlag(id, 'repeat_pair_burst', 'bookingIds', burst, { bookings: burst.length, windowDays: PATTERN_RULES.burstWindowDays }, now));
    return flags.filter(Boolean);
  } catch (err) {
    console.error(`[pattern-check] failed for ${workerProfileId}: ${err.message}`);
    return [];
  }
}
