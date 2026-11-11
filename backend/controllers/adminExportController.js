// Admin: CSV exports (Batch 4, feature 31). Admin only. Every download is written to the audit
// log BEFORE the file is sent. A CNIC is never part of an export: the columns below are explicit,
// the CNIC fields are select:false in the model, and services/csv.js also removes any CNIC-like
// number that someone may have typed into a free-text note.
import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import WorkerProfile from '../models/WorkerProfile.js';
import Evidence from '../models/Evidence.js';
import User from '../models/User.js';
import { toCsv } from '../services/csv.js';
import { writeAudit } from '../services/audit.js';
import { pktDay } from './adminInsightsController.js';

export const EXPORT_MAX_ROWS = 5000;

function dateRange(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.$lt = new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000);
  return mongoose.trusted(range);
}

const EXPORTS = {
  // The audit log with its hashes, so the chain can also be checked outside the system.
  audit: {
    async rows({ action, from, to }) {
      const filter = {};
      if (action) filter.action = action;
      const range = dateRange(from, to);
      if (range) filter.createdAt = range;
      return AuditLog.find(filter).sort({ seq: 1 }).limit(EXPORT_MAX_ROWS + 1).populate('actor', 'name -_id').lean();
    },
    columns: [
      { header: 'seq', value: (e) => e.seq },
      { header: 'time_utc', value: (e) => e.createdAt },
      { header: 'actor', value: (e) => e.actor?.name ?? '' },
      { header: 'actor_role', value: (e) => e.actorRole },
      { header: 'action', value: (e) => e.action },
      { header: 'target_type', value: (e) => e.targetType },
      { header: 'target_id', value: (e) => e.targetId },
      { header: 'from_state', value: (e) => e.fromState },
      { header: 'to_state', value: (e) => e.toState },
      { header: 'reason', value: (e) => e.reason },
      { header: 'prev_hash', value: (e) => e.prevHash },
      { header: 'hash', value: (e) => e.hash },
    ],
  },
  // The identity queue: public fields and review dates. No CNIC, phone, email or address.
  identity: {
    async rows({ status = 'Pending' }) {
      const filter = ['Unverified', 'Pending', 'Verified', 'Rejected'].includes(status) ? { verificationStatus: status } : {};
      return WorkerProfile.find(filter)
        .select('workerIdCode occupation category city verificationStatus cnicOnFile identityRequestedAt identityReviewedAt identityNote user updatedAt')
        .populate('user', 'name -_id')
        .sort({ identityRequestedAt: 1, _id: 1 })
        .limit(EXPORT_MAX_ROWS + 1)
        .lean();
    },
    columns: [
      { header: 'worker_id', value: (p) => p.workerIdCode },
      { header: 'name', value: (p) => p.user?.name ?? '' },
      { header: 'occupation', value: (p) => p.occupation },
      { header: 'category', value: (p) => p.category },
      { header: 'city', value: (p) => p.city },
      { header: 'identity_status', value: (p) => p.verificationStatus },
      { header: 'cnic_on_file', value: (p) => (p.cnicOnFile ? 'yes' : 'no') },
      { header: 'requested_at_utc', value: (p) => p.identityRequestedAt },
      { header: 'reviewed_at_utc', value: (p) => p.identityReviewedAt },
      { header: 'note', value: (p) => p.identityNote },
    ],
  },
  // The evidence queue: what was uploaded for which skill and what was decided. No images.
  evidence: {
    async rows({ status = 'pending' }) {
      const filter = ['pending', 'approved', 'rejected', 'suspected_fake', 'revoked'].includes(status) ? { status } : {};
      return Evidence.find(filter)
        .select('skillName type status createdAt reviewedAt reasonCode reviewNote duplicateKind worker profile')
        .populate('worker', 'name -_id')
        .populate('profile', 'workerIdCode -_id')
        .sort({ createdAt: 1, _id: 1 })
        .limit(EXPORT_MAX_ROWS + 1)
        .lean();
    },
    columns: [
      { header: 'evidence_id', value: (e) => String(e._id) },
      { header: 'worker_id', value: (e) => e.profile?.workerIdCode ?? '' },
      { header: 'worker_name', value: (e) => e.worker?.name ?? '' },
      { header: 'skill', value: (e) => e.skillName },
      { header: 'type', value: (e) => e.type },
      { header: 'status', value: (e) => e.status },
      { header: 'uploaded_at_utc', value: (e) => e.createdAt },
      { header: 'reviewed_at_utc', value: (e) => e.reviewedAt },
      { header: 'reason_code', value: (e) => e.reasonCode },
      { header: 'review_note', value: (e) => e.reviewNote },
      { header: 'possible_duplicate', value: (e) => e.duplicateKind ?? '' },
    ],
  },
  // Accounts. Admins may see email and phone (security rules, docs/SECURITY.md); never the password or its hash.
  users: {
    async rows({ status = 'all' }) {
      const filter = {};
      if (status === 'suspended') filter.status = 'suspended';
      if (status === 'active') filter.status = mongoose.trusted({ $ne: 'suspended' });
      return User.find(filter)
        .select('name email phone role status createdAt suspendedAt suspensionReason')
        .sort({ createdAt: 1, _id: 1 })
        .limit(EXPORT_MAX_ROWS + 1)
        .lean();
    },
    columns: [
      { header: 'name', value: (u) => u.name },
      { header: 'email', value: (u) => u.email },
      { header: 'phone', value: (u) => u.phone },
      { header: 'role', value: (u) => u.role },
      { header: 'status', value: (u) => u.status ?? 'active' },
      { header: 'created_at_utc', value: (u) => u.createdAt },
      { header: 'suspended_at_utc', value: (u) => u.suspendedAt },
      { header: 'suspension_reason', value: (u) => u.suspensionReason },
    ],
  },
};

// GET /api/admin/exports/:kind?status=&action=&from=&to=
export const downloadExport = async (req, res) => {
  const { kind } = req.validated.params;
  const filters = req.validated.query;
  const definition = EXPORTS[kind];
  const found = await definition.rows(filters);
  const truncated = found.length > EXPORT_MAX_ROWS;
  const rows = truncated ? found.slice(0, EXPORT_MAX_ROWS) : found;

  // No audit entry = no file.
  await writeAudit({
    actor: req.user._id,
    actorRole: 'admin',
    action: 'export.downloaded',
    targetType: 'Export',
    targetId: kind,
    reason: `Admin downloaded the ${kind} export (${rows.length} rows)`,
    details: { kind, rows: rows.length, truncated, filters },
  });

  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="dlm-${kind}-${pktDay(new Date())}.csv"`,
    'Cache-Control': 'no-store',
    'X-Export-Rows': String(rows.length),
    'X-Export-Truncated': String(truncated),
  });
  res.send(toCsv(definition.columns, rows));
};
