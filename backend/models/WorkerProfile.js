import mongoose from 'mongoose';

const workHistorySchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    clientOrEmployer: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
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
      default: 'General Technician',
    },
    category: {
      type: String,
      required: true,
      default: 'Home Maintenance',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    dailyRate: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      required: true,
      default: 'Islamabad',
    },
    address: {
      type: String,
      default: '',
    },
    whatsappNumber: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    cnicNumber: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['Urdu'],
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Offline'],
      default: 'Available',
    },
    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Pending', 'Verified'],
      default: 'Pending',
    },
    bio: {
      type: String,
      default: '',
    },
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

workerProfileSchema.pre('save', function () {
  if (!this.workerIdCode) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.workerIdCode = `DLM-2026-${randomDigits}`;
  }
});

export default mongoose.model('WorkerProfile', workerProfileSchema);
