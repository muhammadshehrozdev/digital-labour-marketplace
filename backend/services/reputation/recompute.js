// Rebuilds a worker's reputation snapshot (Module 4, decision D-047). The ONLY reputation code that
// touches the database: it loads plain data, calls the pure engines (snapshot.js) and saves the result
// on WorkerProfile.reputation. Called after: a booking is completed or closed with an outcome; a review
// is created, hidden or restored; a dispute is decided. The daily cron refreshes every worker with bookings.
import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import Review from '../../models/Review.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import { snapshotFrom } from './snapshot.js';
import { computeReputation } from './reputationEngine.js';

// For each customer: how many OTHER workers they have a completed booking with (reviewerTrust's n).
export async function otherWorkersByCustomer(customerIds, workerProfileId) {
  if (customerIds.length === 0) return new Map();
  const rows = await Booking.aggregate([
    { $match: { customer: { $in: customerIds }, status: 'completed', worker: { $ne: workerProfileId } } },
    { $group: { _id: '$customer', workers: { $addToSet: '$worker' } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.workers.length]));
}

// The engines' input for one worker, from the database.
export async function loadReputationInput(workerProfileId) {
  const id = new mongoose.Types.ObjectId(String(workerProfileId));
  const [closed, reviews] = await Promise.all([
    Booking.find({ worker: id, outcome: mongoose.trusted({ $ne: null }) })
      .select('outcome closedAt customer skillId acceptedAt completedAt completionMethod')
      .lean(),
    Review.find({ worker: id })
      .select('booking customer rating createdAt status skillId onTime workQuality polite priceAsAgreed wouldHireAgain')
      .lean(),
  ]);
  const bookingById = new Map(closed.map((b) => [String(b._id), b]));
  const missing = reviews.filter((r) => !bookingById.has(String(r.booking))).map((r) => r.booking);
  if (missing.length) {
    for (const b of await Booking.find({ _id: mongoose.trusted({ $in: missing }) }).select('completionMethod').lean()) bookingById.set(String(b._id), b);
  }
  const others = await otherWorkersByCustomer([...new Set(reviews.map((r) => String(r.customer)))].map((c) => new mongoose.Types.ObjectId(c)), id);
  return {
    closedBookings: closed.map((b) => ({
      id: String(b._id), outcome: b.outcome, closedAt: b.closedAt, customerId: String(b.customer), skillId: b.skillId, accepted: Boolean(b.acceptedAt),
    })),
    reviews: reviews.map((r) => ({
      id: String(r._id),
      customerId: String(r.customer),
      stars: r.rating,
      createdAt: r.createdAt,
      completionMethod: bookingById.get(String(r.booking))?.completionMethod ?? 'auto',
      reviewerOtherWorkers: others.get(String(r.customer)) ?? 0,
      hidden: r.status === 'hidden',
      skillId: r.skillId,
      onTime: r.onTime, workQuality: r.workQuality, polite: r.polite, priceAsAgreed: r.priceAsAgreed, wouldHireAgain: r.wouldHireAgain,
    })),
  };
}

// Rebuild and save. `timestamps: false`: a new snapshot is not a profile edit, so it must not move the
// worker up in the directory's "Recently updated" order.
export async function recomputeReputation(workerProfileId, now = new Date()) {
  const input = await loadReputationInput(workerProfileId);
  const { snapshot } = snapshotFrom({ ...input, now });
  await WorkerProfile.updateOne({ _id: workerProfileId }, { $set: { reputation: snapshot } }, { timestamps: false });
  return snapshot;
}

// The explanation for the worker's "How my reputation is counted" page and the admin view.
export async function reputationExplanation(workerProfileId, now = new Date()) {
  const input = await loadReputationInput(workerProfileId);
  const reputation = computeReputation(input.reviews, { now });
  const byId = new Map(input.reviews.map((r) => [r.id, r]));
  return {
    perReview: reputation.perReview.map((p) => ({ ...p, skillId: byId.get(p.id)?.skillId ?? null, reviewerOtherWorkers: byId.get(p.id)?.reviewerOtherWorkers ?? 0 })),
    hiddenCount: input.reviews.filter((r) => r.hidden).length,
  };
}

// Never let a failed recompute fail the action that caused it (the action is saved and audited).
export async function safeRecompute(workerProfileId, now = new Date()) {
  try {
    return await recomputeReputation(workerProfileId, now);
  } catch (err) {
    console.error(`[reputation] recompute failed for ${workerProfileId}: ${err.message}`);
    return null;
  }
}
