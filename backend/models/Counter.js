// A named number that only goes up, changed atomically with $inc (audit M1-8).
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // e.g. "workerId-2026"
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.model('Counter', counterSchema);
