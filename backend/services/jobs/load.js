// Module 6: database reads shared by the customer's and the admin's job routes.
// Before any state is computed, the due booking timers of those jobs' bookings are applied (sweepBookings), so an
// unanswered request that passed 48 hours counts as expired (4.4).
import Booking from '../../models/Booking.js';
import { sweepBookings } from '../booking/sweep.js';
import { trusted } from '../booking/lifecycle.js';
import { jobState } from './state.js';

const BOOKING_FIELDS = '_id code status jobRequest worker workerUser customer skillId skillName preferredDate timeSlot createdAt';

// jobs: [{ _id, status, createdAt }] -> Map jobId -> { state, bookings (newest first) }
export async function statesFor(jobs, now) {
  const ids = jobs.map((j) => j._id);
  const byJob = new Map(jobs.map((j) => [String(j._id), []]));
  if (ids.length) {
    await sweepBookings({ now, filter: { jobRequest: trusted({ $in: ids }) } });
    const bookings = await Booking.find({ jobRequest: trusted({ $in: ids }) }).select(BOOKING_FIELDS).sort({ createdAt: -1, _id: -1 }).lean();
    for (const b of bookings) byJob.get(String(b.jobRequest))?.push(b);
  }
  return new Map(jobs.map((j) => {
    const bookings = byJob.get(String(j._id));
    return [String(j._id), { state: jobState(j, bookings, now), bookings }];
  }));
}

export const stateOf = async (job, now) => (await statesFor([job], now)).get(String(job._id));
