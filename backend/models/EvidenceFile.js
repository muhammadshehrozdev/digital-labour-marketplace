// The processed image bytes of one evidence item (D-013). Separate from Evidence, so list
// queries never load bytes. Reached only through services/evidence/storage.js.
import mongoose from 'mongoose';

const evidenceFileSchema = new mongoose.Schema(
  {
    data: { type: Buffer, required: true }, // stored by MongoDB as BinData
    contentType: { type: String, required: true, enum: ['image/webp'] },
    size: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default mongoose.model('EvidenceFile', evidenceFileSchema);
