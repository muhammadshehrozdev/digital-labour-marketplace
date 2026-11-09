// Module 1: the worker's own profile, and the public worker directory.
import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { escapeRegex } from '../validators/common.js';
import { calculateCompletion } from '../services/profileCompletion.js';
import { encryptCnic, hashCnic } from '../services/cnic.js';
import { writeAudit } from '../services/audit.js';

// PUBLIC fields: what customers and admins see in the directory (audit M1-2, decision D-002).
// Never: CNIC data, address, emergency contact, WhatsApp, phone, email, raw experience text.
export const PUBLIC_WORKER_FIELDS = [
  'workerIdCode', 'occupation', 'category', 'skills', 'experienceYears', 'hourlyRate', 'dailyRate',
  'city', 'availability', 'verificationStatus', 'bio', 'languages', 'profileCompletion', 'user',
].join(' ');
// From the linked user: the name only (no phone, no email).
export const PUBLIC_USER_FIELDS = 'name -_id';
// The single public profile adds work history, without the client's name.
const PUBLIC_PROFILE_FIELDS = `${PUBLIC_WORKER_FIELDS} workHistory.jobTitle workHistory.duration workHistory.description`;

// The owner sees their whole profile (toJSON removes the CNIC fields; cnicOnFile says if one is saved).
async function ownerView(profileId) {
  return WorkerProfile.findById(profileId).populate('user', 'name email phone role');
}

// GET /api/workers/me
export const getMyProfile = async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone role');
  if (!profile) throw httpError(404, 'You have not created your worker profile yet.');
  res.json(profile);
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
        throw httpError(409, 'This CNIC is already linked to another account. If it is yours, please contact the admin.');
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

  res.json({ message: 'Profile saved.', profile: await ownerView(profile._id) });
};

// GET /api/workers  (customer, admin) — public directory, paginated, safe fields only.
export const listDirectory = async (req, res) => {
  const { search, city, category, availability, identity, page = 1, limit = 20 } = req.validated.query;

  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (availability && availability !== 'All') filter.availability = availability;
  if (identity === 'verified') filter.verificationStatus = 'Verified';
  if (city) filter.city = new RegExp(escapeRegex(city), 'i');
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ occupation: pattern }, { skills: pattern }, { bio: pattern }];
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
  const profile = await WorkerProfile.findOne({ workerIdCode: req.validated.params.workerIdCode })
    .select(PUBLIC_PROFILE_FIELDS)
    .populate('user', PUBLIC_USER_FIELDS)
    .lean();
  if (!profile) throw httpError(404, 'Worker not found');
  res.json(profile);
};
