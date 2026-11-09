// Module 1: the worker's own profile, and the public worker directory.
import mongoose from 'mongoose';
import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { escapeRegex } from '../validators/common.js';
import { calculateCompletion } from '../services/profileCompletion.js';
import { encryptCnic, hashCnic } from '../services/cnic.js';
import { writeAudit } from '../services/audit.js';
import { refreshOnboarding } from '../services/onboarding.js';
import Evidence from '../models/Evidence.js';
import { ownerView as evidenceOwnerView } from './evidenceController.js';

// PUBLIC fields: what customers and admins see in the directory (audit M1-2, decision D-002).
// Never: CNIC data, address, emergency contact, WhatsApp, phone, email, raw experience text.
export const PUBLIC_WORKER_FIELDS = [
  'workerIdCode', 'occupation', 'category', 'skills.skillId', 'skills.name', 'skills.category', 'skills.custom',
  // Module 3: chip state, approved count and strength label only — never images, files or numbers.
  'skills.evidenceSummary.status', 'skills.evidenceSummary.approved', 'skills.evidenceSummary.strength',
  'experienceYears', 'hourlyRate', 'dailyRate', 'city', 'availability', 'verificationStatus', 'bio', 'languages',
  'profileCompletion', 'user',
].join(' ');
// From the linked user: the name only (no phone, no email).
export const PUBLIC_USER_FIELDS = 'name -_id';
// The single public profile adds work history, without the client's name.
const PUBLIC_PROFILE_FIELDS = `${PUBLIC_WORKER_FIELDS} workHistory.jobTitle workHistory.duration workHistory.description`;

// One query for the public profile, used by the customer page AND by the owner's
// "See what customers see" preview, so both always show exactly the same fields.
const findPublicProfile = (filter) =>
  WorkerProfile.findOne(filter).select(PUBLIC_PROFILE_FIELDS).populate('user', PUBLIC_USER_FIELDS).lean();

// The owner sees their whole profile (toJSON removes the CNIC fields; cnicOnFile says if one is saved).
async function ownerView(profileId) {
  return WorkerProfile.findById(profileId).populate('user', 'name email phone role');
}

// GET /api/workers/me/onboarding — where the worker is in the guided onboarding (D-011).
export const getMyOnboarding = async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id });
  res.json(await refreshOnboarding(req.user, profile));
};

// GET /api/workers/me
export const getMyProfile = async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone role');
  if (!profile) throw httpError(404, 'PROFILE_NOT_CREATED');
  res.json(profile);
};

// GET /api/workers/me/full — everything the read-only "My profile" page needs (Batch 3, D-020):
// the owner's profile, their proof items (metadata only), onboarding state, and the public view
// (built with the same field list as GET /api/workers/:workerIdCode).
export const getMyFullProfile = async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone role');
  if (!profile) throw httpError(404, 'PROFILE_NOT_CREATED');
  const [evidence, publicView, onboarding] = await Promise.all([
    Evidence.find({ worker: req.user._id }).sort({ createdAt: -1 }).lean(),
    findPublicProfile({ _id: profile._id }),
    refreshOnboarding(req.user, profile),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({
    profile,
    evidence: evidence.map(evidenceOwnerView),
    publicView,
    // Same rule as the directory: customers can find a worker only after the "Your work" step.
    listedInDirectory: Boolean(profile.occupation && profile.category),
    onboarding,
  });
};

// PUT /api/workers/me  (body already checked by profileUpdateSchema)
export const updateMyProfile = async (req, res) => {
  const { name, phone, cnicNumber, ...fields } = req.validated.body;

  const userChanges = {};
  if (name !== undefined) userChanges.name = name;
  if (phone !== undefined) userChanges.phone = phone;
  if (Object.keys(userChanges).length) {
    await User.updateOne({ _id: req.user._id }, { $set: userChanges }, { runValidators: true });
  }

  let profile = await WorkerProfile.findOne({ user: req.user._id }).select('+cnicHash');
  if (!profile) profile = new WorkerProfile({ user: req.user._id });
  profile.set(fields);

  let identityChange = null;
  if (cnicNumber !== undefined) {
    const hash = hashCnic(cnicNumber);
    if (hash !== profile.cnicHash) {
      const other = await WorkerProfile.findOne({ cnicHash: hash }).select('_id').lean();
      if (other && String(other._id) !== String(profile._id)) {
        throw httpError(409, 'CNIC_TAKEN');
      }
      profile.cnicHash = hash;
      profile.cnicEncrypted = encryptCnic(cnicNumber, req.user._id);
      profile.cnicOnFile = true;
      // A new CNIC must be checked again by an admin.
      identityChange = { from: profile.verificationStatus, to: 'Pending' };
      profile.verificationStatus = 'Pending';
      profile.identityReviewedBy = null;
      profile.identityReviewedAt = null;
    }
  }

  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();

  if (identityChange) {
    await writeAudit({
      actor: req.user._id,
      actorRole: 'worker',
      action: 'cnic.updated',
      targetType: 'WorkerProfile',
      targetId: profile._id,
      fromState: identityChange.from,
      toState: identityChange.to,
      reason: 'Worker saved a new CNIC; identity must be checked again',
    });
  }

  const fresh = await ownerView(profile._id);
  const user = { ...req.user, ...userChanges };
  res.json({ message: 'Profile saved.', profile: fresh, onboarding: await refreshOnboarding(user, fresh) });
};

// GET /api/workers  (customer, admin) — public directory, paginated, safe fields only.
export const listDirectory = async (req, res) => {
  const { search, city, category, availability, identity, skills, page = 1, limit = 20 } = req.validated.query;

  // Only workers who finished the "Your work" step are listed (a card needs a trade).
  const filter = {
    occupation: mongoose.trusted({ $nin: ['', null] }),
    category: mongoose.trusted({ $ne: null }),
  };
  if (category && category !== 'All') filter.category = category;
  if (availability && availability !== 'All') filter.availability = availability;
  if (identity === 'verified') filter.verificationStatus = 'Verified';
  if (skills === 'verified') filter['skills.evidenceSummary.status'] = 'verified'; // at least one skill backed by approved proof
  if (city) filter.city = new RegExp(escapeRegex(city), 'i');
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ occupation: pattern }, { 'skills.name': pattern }, { bio: pattern }];
  }

  const [workers, total] = await Promise.all([
    WorkerProfile.find(filter)
      .select(PUBLIC_WORKER_FIELDS)
      .populate('user', PUBLIC_USER_FIELDS)
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WorkerProfile.countDocuments(filter),
  ]);

  res.json({ workers, page, limit, total });
};

// GET /api/workers/:workerIdCode  (customer, admin)
export const getPublicProfile = async (req, res) => {
  const profile = await findPublicProfile({ workerIdCode: req.validated.params.workerIdCode });
  if (!profile) throw httpError(404, 'WORKER_NOT_FOUND');
  res.json(profile);
};
