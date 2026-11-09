import mongoose from 'mongoose';
import { CATEGORY_IDS, DEFAULT_CATEGORY_ID, AVAILABILITY, categoryIdFrom } from '../config/skillTaxonomy.js';
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

// Module 2: Category-wise organized skill item
const categorizedSkillSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Intermediate',
    },
    confidenceScore: { type: Number, default: 85 },
    source: {
      type: String,
      enum: ['AI-Extracted', 'Manual', 'Recommended-Added'],
      default: 'AI-Extracted',
    },
  },
  { _id: false }
);

// Module 2: Potential / Recommended skill item
const recommendedSkillSchema = new mongoose.Schema(
  {
    skillName: { type: String, required: true },
    category: { type: String, required: true },
    reason: { type: String, default: '' },
    demandLevel: {
      type: String,
      enum: ['High Demand', 'Growing', 'Core Trade Skill'],
      default: 'High Demand',
    },
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
    occupation: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      default: 'General Technician',
    },
    // One taxonomy (config/skillTaxonomy.js) for UI, API and database (audit M1-16).
    category: {
      type: String,
      required: true,
      enum: CATEGORY_IDS,
      default: DEFAULT_CATEGORY_ID,
    },
    skills: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      default: [],
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
      validate: { validator: Number.isInteger, message: 'experienceYears must be a whole number' },
      default: 0,
    },
    hourlyRate: { type: Number, min: 0, max: 1000000, default: 0 },
    dailyRate: { type: Number, min: 0, max: 1000000, default: 0 },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      default: 'Islamabad',
    },
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

    // ================= MODULE 2: AI EXPERIENCE & SKILL PROFILER FIELDS =================
    rawExperienceText: {
      type: String,
      default: '',
    },
    experienceTierBadge: {
      type: String,
      default: 'Skilled Worker',
    },
    aiSkillSummary: {
      type: String,
      default: '',
    },
    categorizedSkills: {
      type: [categorizedSkillSchema],
      default: [],
    },
    recommendedSkills: {
      type: [recommendedSkillSchema],
      default: [],
    },
    toolsAndEquipment: {
      type: [String],
      default: [],
    },
    skillStrengthScore: {
      type: Number,
      default: 0,
    },
    lastAiProfiledAt: {
      type: Date,
    },
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
  const id = categoryIdFrom(this.category);
  if (id && id !== this.category) this.category = id;
});

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
