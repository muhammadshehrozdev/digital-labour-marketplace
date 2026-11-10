// A customer's saved worker (Batch 4, feature 23). One row per customer and worker profile.
import mongoose from 'mongoose';

export const MAX_SAVED_WORKERS = 100;

const savedWorkerSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false }
);

// Saving twice keeps one row (also when two requests race).
savedWorkerSchema.index({ customer: 1, profile: 1 }, { unique: true });
savedWorkerSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model('SavedWorker', savedWorkerSchema);
