import mongoose from 'mongoose';
import { CATEGORY_IDS, AVAILABILITY, categoryIdFrom } from '../config/skillTaxonomy.js';
import { nextWorkerIdCode } from '../services/workerId.js';

export const IDENTITY_STATUSES = ['Unverified', 'Pending', 'Verified', 'Rejected'];

const workHistorySchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true, trim: true, maxlength: 100 },
    clientOrEmployer: { type: String, trim: true, maxlength: 100, default: '' },
    duration: { type: String, trim: true, maxlength: 50, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: true }
);

// Module 3: what users may see about a skill's evidence (no numbers; b, d, u, E are admin-only and
// computed on demand). Recomputed after every upload, review decision and deletion.
const evidenceSummarySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['self_declared', 'evidence_pending', 'verified', 'disputed'], default: 'self_declared' },
    approved: { type: Number, min: 0, default: 0 },
    pending: { type: Number, min: 0, default: 0 },
    strength: { type: String, enum: ['none', 'weak', 'moderate', 'strong'], default: 'none' },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

// Module 2: ONE skills array (fixes M2-10). A skill is a taxonomy id, or a clearly marked
// custom skill. No confidence, level or score is stored (fixes M2-8, M2-9).
const skillSchema = new mongoose.Schema(
  {
    skillId: { type: String, required: true, maxlength: 80 },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, required: true, enum: CATEGORY_IDS },
    // extractor = from the rule-based suggestions; manual = picked from the list;
    // related = confirmed from "You may also do..." (same category, Batch 4)
    addedVia: { type: String, required: true, enum: ['extractor', 'manual', 'related'] },
    custom: { type: Boolean, default: false },
    addedAt: { type: Date, default: () => new Date() },
    evidenceSummary: { type: evidenceSummarySchema, default: () => ({}) },
  },
  { _id: false }
);

const workerProfileSchema = new mongoose.Schema(
  {
    // ================= MODULE 1 FIELDS =================
    // Ranges and lengths here are a second safety net; the zod schemas in
    // validators/workers.js check every request first (audit M1-6).
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    workerIdCode: {
      type: String,
      unique: true,
    },
    // No pretend defaults: an empty value means "not filled in yet" (onboarding derives its state from it).
    occupation: { type: String, trim: true, maxlength: 60, default: '' },
    // One taxonomy (config/skillTaxonomy.js) for UI, API and database (audit M1-16).
    category: { type: String, enum: [...CATEGORY_IDS, null], default: null },
    skills: {
      type: [skillSchema],
      default: [],
      validate: {
        validator: (list) => new Set(list.map((s) => s.skillId)).size === list.length,
        message: 'A skill can be added only once',
      },
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 60,
      validate: { validator: (v) => v === null || Number.isInteger(v), message: 'experienceYears must be a whole number' },
      default: null,
    },
    hourlyRate: { type: Number, min: 0, max: 1000000, default: 0 },
    dailyRate: { type: Number, min: 0, max: 1000000, default: 0 },
    city: { type: String, trim: true, maxlength: 50, default: '' },
    // Private (owner and admin only): address, WhatsApp, emergency contact, CNIC.
    address: { type: String, trim: true, maxlength: 200, default: '' },
    whatsappNumber: { type: String, trim: true, maxlength: 20, default: '' },
    emergencyContact: { type: String, trim: true, maxlength: 100, default: '' },
    // CNIC (decision D-007): never stored in plain text.
    // cnicEncrypted = AES-256-GCM ciphertext; cnicHash = HMAC for duplicate detection.
    // Both are select:false, so a normal query never loads them.
    cnicEncrypted: { type: String, select: false },
    cnicHash: { type: String, select: false },
    cnicOnFile: { type: Boolean, default: false },
    // OLD plain-text field. Kept only so scripts/migrateCnic.js can read and remove it.
    cnicNumber: { type: String, select: false },
    languages: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      default: ['Urdu'],
    },
    availability: {
      type: String,
      enum: AVAILABILITY,
      default: 'Available',
    },
    // IDENTITY verification only (CNIC checked offline by an admin). Skill verification is Module 3.
    verificationStatus: {
      type: String,
      enum: IDENTITY_STATUSES,
      default: 'Unverified',
    },
    // When the worker last asked for an identity check (saved a CNIC). The admin queue shows
    // "waiting N days" from this date (Batch 4).
    identityRequestedAt: { type: Date, default: null },
    identityNote: { type: String, trim: true, maxlength: 500, default: '' },
    identityReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    identityReviewedAt: { type: Date, default: null },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    workHistory: {
      type: [workHistorySchema],
      default: [],
    },
    profileCompletion: {
      type: Number,
      default: 20,
    },

    // Sum of approved proof items over all skills: the sort key "most approved evidence" of the
    // directory (Batch 4). Kept in step by the save hook below and by recomputeSkillSummary.
    approvedEvidenceCount: { type: Number, min: 0, default: 0 },

    // Set once, when about + work + skills are first all done (GET /api/workers/me/onboarding).
    onboardingCompletedAt: { type: Date, default: null },

    // ================= MODULE 2: EXPERIENCE AND SKILL PROFILER =================
    // The text the worker used when they last ADDED skills from suggestions (owner/admin only).
    rawExperienceText: { type: String, maxlength: 2000, default: '', select: false },
    lastExtractedAt: { type: Date, default: null },

    // ================= MODULE 4: REPUTATION AND RELIABILITY =================
    // The snapshot from services/reputation/snapshot.js, rebuilt by services/reputation/recompute.js
    // (never by the worker). null = "new on this platform" (no migration needed). Parts:
    //   public       what customers may see (stars with count, depth, counts, per-skill facts)
    //   score        reputation numbers: owner, admin and Module 7 matching only
    //   reliability  reliability numbers: owner, admin and matching only
    // plus engineVersion, paramsHash, computedAt. Public responses select ONLY reputation.public.
    reputation: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// One CNIC per account: unique only where a hash exists.
workerProfileSchema.index(
  { cnicHash: 1 },
  { unique: true, partialFilterExpression: { cnicHash: { $type: 'string' } } }
);

// Old documents stored the category label ("Electrical & Solar"); convert it to the id.
workerProfileSchema.pre('validate', function () {
  if (this.category === null || this.category === undefined) return;
  const id = categoryIdFrom(this.category);
  if (id && id !== this.category) this.category = id;
});

// The directory's "most approved evidence" sort key always matches the skills on the profile.
export const sumApprovedEvidence = (skills) => (skills || []).reduce((sum, s) => sum + (s.evidenceSummary?.approved ?? 0), 0);
workerProfileSchema.pre('save', function () {
  this.approvedEvidenceCount = sumApprovedEvidence(this.skills);
});
workerProfileSchema.index({ approvedEvidenceCount: -1, _id: -1 });
workerProfileSchema.index({ experienceYears: -1, _id: -1 });
// "Best track record" (Module 4): cautious score, then completed jobs
workerProfileSchema.index({ 'reputation.score.cautious': -1, 'reputation.public.completedJobs': -1, updatedAt: -1, _id: -1 });
// the identity queue: by status, longest waiting first (Batch 4 review R-05)
workerProfileSchema.index({ verificationStatus: 1, identityRequestedAt: 1 });

// Worker ID from an atomic counter, never random (audit M1-8).
workerProfileSchema.pre('save', async function () {
  if (!this.workerIdCode) {
    this.workerIdCode = await nextWorkerIdCode();
  }
});

// Safety net: never send CNIC data in JSON, even if a query loaded it by mistake.
workerProfileSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.cnicEncrypted;
    delete ret.cnicHash;
    delete ret.cnicNumber;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('WorkerProfile', workerProfileSchema);
