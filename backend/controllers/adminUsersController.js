// Admin: user management (Batch 4, feature 26). Search users, open one, suspend or reactivate
// with a required reason. Every route is behind protect + requireRole('admin').
import mongoose from 'mongoose';
import User from '../models/User.js';
import WorkerProfile from '../models/WorkerProfile.js';
import Evidence from '../models/Evidence.js';
import SavedWorker from '../models/SavedWorker.js';
import AuditLog from '../models/AuditLog.js';
import { httpError } from '../utils/httpError.js';
import { writeAudit } from '../services/audit.js';
import { escapeRegex } from '../validators/common.js';

// Explicit field list: never the password, never login internals except "is it locked now".
const LIST_FIELDS = 'name email phone role status createdAt lockUntil suspendedAt suspensionReason';

const userView = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  status: u.status ?? 'active', // accounts made before Batch 4 have no status field
  createdAt: u.createdAt,
  lockedNow: Boolean(u.lockUntil && u.lockUntil > new Date()),
  suspendedAt: u.suspendedAt ?? null,
  suspensionReason: u.suspensionReason ?? '',
});

// GET /api/admin/users?q=&role=&status=&page=&limit=
export const listUsers = async (req, res) => {
  const { q, role = 'all', status = 'all', page = 1, limit = 25 } = req.validated.query;
  const filter = {};
  if (role !== 'all') filter.role = role;
  if (status === 'suspended') filter.status = 'suspended';
  if (status === 'active') filter.status = mongoose.trusted({ $ne: 'suspended' });
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i'); // user text is always escaped
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select(LIST_FIELDS).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ users: users.map(userView), page, limit, total });
};

// GET /api/admin/users/:id — the account, a short summary of what belongs to it, and its last
// audit entries. No CNIC (the reveal has its own audited route), no address.
export const getUser = async (req, res) => {
  const { id } = req.validated.params;
  const user = await User.findById(id).select(LIST_FIELDS).lean();
  if (!user) throw httpError(404, 'USER_NOT_FOUND');

  let worker = null;
  let customer = null;
  if (user.role === 'worker') {
    const [profile, byStatus] = await Promise.all([
      WorkerProfile.findOne({ user: id }).select('workerIdCode occupation category city verificationStatus cnicOnFile profileCompletion skills.skillId').lean(),
      Evidence.aggregate([{ $match: { worker: new mongoose.Types.ObjectId(id) } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    ]);
    const evidence = { pending: 0, approved: 0, rejected: 0, suspected_fake: 0, revoked: 0 };
    for (const row of byStatus) if (row._id in evidence) evidence[row._id] = row.n;
    worker = profile
      ? {
          profileId: profile._id,
          workerIdCode: profile.workerIdCode,
          occupation: profile.occupation,
          category: profile.category,
          city: profile.city,
          verificationStatus: profile.verificationStatus,
          cnicOnFile: profile.cnicOnFile,
          profileCompletion: profile.profileCompletion,
          skills: profile.skills.length,
          evidence,
        }
      : { profileId: null, evidence };
  }
  if (user.role === 'customer') customer = { savedWorkers: await SavedWorker.countDocuments({ customer: id }) };

  const activity = await AuditLog.find({ $or: [{ targetType: 'User', targetId: String(id) }, { actor: id }] })
    .sort({ seq: -1 })
    .limit(10)
    .populate('actor', 'name -_id')
    .select('-prevHash -hash')
    .lean();

  res.set('Cache-Control', 'no-store');
  res.json({ user: userView(user), worker, customer, activity });
};

// PATCH /api/admin/users/:id/status { status: 'suspended' | 'active', reason }
// Rules: an admin cannot suspend their own account, and admin accounts are not managed here at
// all (they come from the create-admin script). Suspending increases tokenVersion, so every open
// session of that user ends at once. Conditional update: two admins cannot both do it.
export const setUserStatus = async (req, res) => {
  const { id } = req.validated.params;
  const { status, reason } = req.validated.body;
  if (String(id) === String(req.user._id)) throw httpError(400, 'CANNOT_SUSPEND_SELF');

  const current = await User.findById(id).select('role status').lean();
  if (!current) throw httpError(404, 'USER_NOT_FOUND');
  if (current.role === 'admin') throw httpError(403, 'CANNOT_SUSPEND_ADMIN');
  const before = current.status ?? 'active';
  if (before === status) throw httpError(409, 'USER_STATUS_CHANGED');

  const suspend = status === 'suspended';
  const updated = await User.findOneAndUpdate(
    { _id: id, status: suspend ? mongoose.trusted({ $ne: 'suspended' }) : 'suspended' },
    {
      $set: {
        status,
        suspendedAt: suspend ? new Date() : null,
        suspendedBy: suspend ? req.user._id : null,
        suspensionReason: suspend ? reason : '',
      },
      // Ends every session of this user (same mechanism as logout). After reactivation they log in again.
      $inc: { tokenVersion: 1 },
    },
    { returnDocument: 'after', runValidators: true, projection: LIST_FIELDS }
  ).lean();
  if (!updated) throw httpError(409, 'USER_STATUS_CHANGED');

  await writeAudit({
    actor: req.user._id,
    actorRole: 'admin',
    action: suspend ? 'user.suspended' : 'user.reactivated',
    targetType: 'User',
    targetId: id,
    fromState: before,
    toState: status,
    reason,
    details: { role: current.role },
  });

  res.json({ user: userView(updated) });
};
