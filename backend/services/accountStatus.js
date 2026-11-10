// Suspended accounts (Batch 4). A suspended worker is not shown to customers: not in the
// directory, not as a public profile, not in saved lists or comparisons.
import mongoose from 'mongoose';
import User from '../models/User.js';

// Adds "not a suspended worker" to a WorkerProfile filter. One small query; at this project's
// size the list of suspended workers is short (documented in docs/REVIEW-2026-11.md).
export async function hideSuspendedWorkers(filter) {
  const suspended = await User.find({ role: 'worker', status: 'suspended' }).distinct('_id');
  if (suspended.length > 0) filter.user = mongoose.trusted({ $nin: suspended });
  return filter;
}
