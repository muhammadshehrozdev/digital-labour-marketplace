// A suspicious pattern found by the rule-based pattern check (Module 4, decision D-051). A flag is
// only a note for an admin: it NEVER changes a score by itself. The admin dismisses it (with a note)
// or hides the listed reviews as fake_or_manipulated (with a note). Both are audited.
import mongoose from 'mongoose';

export const FLAG_TYPES = Object.freeze(['new_account_praise', 'repeat_pair_burst']);
export const FLAG_STATUSES = Object.freeze(['open', 'dismissed', 'actioned']);

const flagSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    type: { type: String, enum: FLAG_TYPES, required: true },
    reviewIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }], default: [] },
    bookingIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }], default: [] },
    // counts and windows only: never names, phone numbers or comment text
    details: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    status: { type: String, enum: FLAG_STATUSES, default: 'open' },
    decision: {
      note: { type: String, trim: true, maxlength: 500, default: '' },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      at: { type: Date, default: null },
    },
    synthetic: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false }
);

flagSchema.index({ status: 1, createdAt: 1 });
flagSchema.index({ worker: 1, type: 1, status: 1 });

export default mongoose.model('ReputationFlag', flagSchema);
