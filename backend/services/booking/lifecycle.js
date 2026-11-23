// Database steps shared by the booking controller, the admin decisions and the sweep (Module 4).
// Every change is ONE conditional update on the state that was checked, so a stale screen, a double
// tap or two sweeps at the same time can never apply a step twice: the loser gets null (-> 409).
import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import { writeAudit } from '../audit.js';
import { nextYearlyCode } from '../codes.js';
import { safeRecompute } from '../reputation/recompute.js';
import { runPatternCheck } from '../reputation/patternCheck.js';

// Booking code BK-<year>-<6 digits> from one atomic counter per year (like the worker ID).
export const nextBookingCode = (date = new Date()) => nextYearlyCode('bookingCode', 'BK', date);

/**
 * Applies one step if the booking is still as expected.
 *   booking: the version that was checked (its _id and status are part of the condition)
 *   expect:  more conditions (field -> value; operators must be wrapped in mongoose.trusted)
 *   set:     the new values;  by: customer | worker | system | admin;  reason: a short code
 * Returns the updated booking (lean) or null when someone else changed it first.
 */
export async function applyStep(booking, { expect = {}, set = {}, by, reason = null, now }) {
  const to = set.status ?? booking.status;
  return Booking.findOneAndUpdate(
    { _id: booking._id, status: booking.status, ...expect },
    { $set: set, $push: { statusHistory: { from: booking.status, to, by, at: now, reason } } },
    { returnDocument: 'after', runValidators: true }
  ).lean();
}

// The values that close a booking with an outcome.
export const closeValues = (status, outcome, now, extra = {}) => ({ status, outcome, closedAt: now, ...extra });

const ACTOR_ROLE = { customer: 'customer', worker: 'worker', system: 'system', admin: 'admin' };

// After a booking got an outcome: audit it, rebuild the worker's reputation, and (for completed work)
// run the pattern check. The audit entry holds no phone number and no free text.
export async function afterClose(updated, { actorId = null, by, now }) {
  await writeAudit({
    actor: actorId,
    actorRole: ACTOR_ROLE[by] ?? 'system',
    action: updated.outcome === 'completed' ? 'booking.completed' : 'booking.closed',
    targetType: 'Booking',
    targetId: updated._id,
    toState: updated.status,
    reason: `Booking ${updated.code}: ${updated.outcome}`,
    details: { code: updated.code, outcome: updated.outcome, completionMethod: updated.completionMethod ?? null, worker: String(updated.worker) },
  });
  await safeRecompute(updated.worker, now);
  if (updated.outcome === 'completed') await runPatternCheck(updated.worker, now);
}

export const trusted = (value) => mongoose.trusted(value);
