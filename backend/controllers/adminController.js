// Admin-only actions (Module 1). Every route here is behind protect + requireRole('admin').
import mongoose from 'mongoose';
import WorkerProfile from '../models/WorkerProfile.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { writeAudit } from '../services/audit.js';
import { decryptCnic, formatCnic } from '../services/cnic.js';
import { escapeRegex } from '../validators/common.js';

// Admin may see private contact fields (CLAUDE.md), but never the CNIC data fields:
// those are select:false, and toJSON removes them as a second layer. cnicOnFile tells if one exists.
const ADMIN_USER_FIELDS = 'name email phone role';

// GET /api/admin/workers
export const listWorkersForAdmin = async (req, res) => {
  const { status, q, page = 1, limit = 50 } = req.validated.query;
  const filter = status && status !== 'All' ? { verificationStatus: status } : {};
  if (q) {
    // Search by worker ID, occupation or the user's name (text is escaped, max 50 characters).
    const pattern = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ name: pattern, role: 'worker' }).select('_id').limit(200).lean();
    filter.$or = [
      { workerIdCode: pattern },
      { occupation: pattern },
      { user: mongoose.trusted({ $in: users.map((u) => u._id) }) },
    ];
  }
  const [workers, total] = await Promise.all([
    WorkerProfile.find(filter)
      .select('-rawExperienceText')
      .populate('user', ADMIN_USER_FIELDS)
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    WorkerProfile.countDocuments(filter),
  ]);
  res.json({ workers, page, limit, total });
};

// PATCH /api/admin/workers/:id/identity  — identity decision with a note (audit M1-9).
// The update is conditional on the status the admin saw, so two admins (or an old
// screen) cannot overwrite each other: the second one gets 409.
export const decideIdentity = async (req, res) => {
  const { id } = req.validated.params;
  const { status, note } = req.validated.body;

  const current = await WorkerProfile.findById(id).select('verificationStatus cnicOnFile').lean();
  if (!current) throw httpError(404, 'Worker profile not found');
  if (status === 'Verified' && !current.cnicOnFile) {
    throw httpError(400, 'This worker has not saved a CNIC yet, so identity cannot be verified.');
  }

  const updated = await WorkerProfile.findOneAndUpdate(
    { _id: id, verificationStatus: current.verificationStatus },
    {
      $set: {
        verificationStatus: status,
        identityNote: note,
        identityReviewedBy: req.user._id,
        identityReviewedAt: new Date(),
      },
    },
    { returnDocument: 'after', runValidators: true }
  ).populate('user', ADMIN_USER_FIELDS);
  if (!updated) throw httpError(409, 'Someone else changed this worker just now. Please reload and try again.');

  await writeAudit({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'identity.decision',
    targetType: 'WorkerProfile',
    targetId: id,
    fromState: current.verificationStatus,
    toState: status,
    reason: note,
  });

  res.json({ message: `Identity status is now ${status}.`, profile: updated });
};

// GET /api/admin/workers/:id/cnic — full CNIC for an admin, written to the audit log
// BEFORE it is sent (no audit entry = no reveal). The number itself is never logged.
export const revealCnic = async (req, res) => {
  const { id } = req.validated.params;
  const profile = await WorkerProfile.findById(id).select('+cnicEncrypted user').lean();
  if (!profile) throw httpError(404, 'Worker profile not found');
  if (!profile.cnicEncrypted) throw httpError(404, 'This worker has no CNIC on file.');

  let digits;
  try {
    digits = decryptCnic(profile.cnicEncrypted, profile.user);
  } catch (err) {
    console.error(`[cnic] could not decrypt CNIC of profile ${id}: ${err.message}`);
    throw httpError(409, 'The stored CNIC cannot be read (wrong key or damaged data). Ask the worker to enter it again.');
  }

  await writeAudit({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'cnic.reveal',
    targetType: 'WorkerProfile',
    targetId: id,
    reason: 'Admin viewed the full CNIC',
  });

  res.set('Cache-Control', 'no-store');
  res.json({ cnic: formatCnic(digits) });
};

// GET /api/admin/users — no passwords, no login internals except the lock status.
export const listUsersForAdmin = async (req, res) => {
  const users = await User.find()
    .select('name email phone role createdAt lockUntil')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  res.json(users);
};

// GET /api/admin/stats — counts for the admin overview (real counts from the database).
export const getStats = async (req, res) => {
  const [byStatus, byRole] = await Promise.all([
    WorkerProfile.aggregate([{ $group: { _id: '$verificationStatus', n: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
  ]);
  const workers = { total: 0, Unverified: 0, Pending: 0, Verified: 0, Rejected: 0 };
  for (const row of byStatus) {
    if (row._id in workers) workers[row._id] = row.n;
    workers.total += row.n;
  }
  const users = { worker: 0, customer: 0, admin: 0 };
  for (const row of byRole) if (row._id in users) users[row._id] = row.n;
  res.json({ workers, users });
};

// GET /api/admin/audit — read-only audit log viewer (newest first). Entries never contain a CNIC.
export const listAudit = async (req, res) => {
  const { action, from, to, page = 1, limit = 50 } = req.validated.query;
  const filter = {};
  if (action) filter.action = action;
  if (from || to) {
    const range = {};
    if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) range.$lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000);
    filter.createdAt = mongoose.trusted(range);
  }
  const [entries, total, actions] = await Promise.all([
    AuditLog.find(filter)
      .sort({ seq: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'name -_id')
      .select('-prevHash -hash')
      .lean(),
    AuditLog.countDocuments(filter),
    AuditLog.distinct('action'),
  ]);
  res.json({ entries, total, page, limit, actions: actions.sort() });
};
