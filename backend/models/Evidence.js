// One evidence item: a photo that supports ONE skill of ONE worker (Module 3, D-013, D-015).
// Metadata only; the bytes are in EvidenceFile (fileId).
import mongoose from 'mongoose';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, REJECT_REASONS } from '../config/evidence.js';

const evidenceSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // owner
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    skillId: { type: String, required: true, maxlength: 80 },
    skillName: { type: String, required: true, maxlength: 60 }, // snapshot for the admin queue
    type: { type: String, required: true, enum: EVIDENCE_TYPES },
    title: { type: String, trim: true, maxlength: 80, default: '' },
    status: { type: String, required: true, enum: EVIDENCE_STATUSES, default: 'pending' },
    reasonCode: { type: String, enum: [...REJECT_REASONS, null], default: null }, // for "rejected"
    reviewNote: { type: String, trim: true, maxlength: 500, default: '' }, // shown to the worker
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    consentAt: { type: Date, required: true }, // the worker ticked the consent box
    // File facts (processed WebP): never the original, never EXIF.
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'EvidenceFile', required: true },
    contentType: { type: String, required: true, enum: ['image/webp'] },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sha256: { type: String, required: true, match: /^[a-f0-9]{64}$/ },
    dhash: { type: String, required: true, match: /^[a-f0-9]{16}$/ },
    // Another worker's item with the same or a very similar picture (admin-only warning).
    possibleDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence', default: null },
    duplicateKind: { type: String, enum: ['exact', 'similar', null], default: null },
    duplicateDistance: { type: Number, default: null },
  },
  { timestamps: true, versionKey: false }
);

evidenceSchema.index({ worker: 1, skillId: 1 });
// The same processed photo cannot be saved twice for the same worker and skill (also under a race).
evidenceSchema.index({ worker: 1, skillId: 1, sha256: 1 }, { unique: true });
evidenceSchema.index({ status: 1, createdAt: 1 }); // review queue, oldest first
evidenceSchema.index({ sha256: 1 }); // exact duplicates
evidenceSchema.index({ possibleDuplicateOf: 1 }, { partialFilterExpression: { possibleDuplicateOf: { $type: 'objectId' } } });

export default mongoose.model('Evidence', evidenceSchema);
