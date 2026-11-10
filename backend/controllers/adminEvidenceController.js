// Module 3, admin side: review queue, item details with the numbers, decisions (D-015).
import mongoose from 'mongoose';
import Evidence from '../models/Evidence.js';
import { httpError } from '../utils/httpError.js';
import { checkTransition, allowedActions } from '../services/evidence/transitions.js';
import { recomputeSkillSummary, evidenceFor, confidenceForAdmin } from '../services/evidence/skillSummary.js';
import { skillConfidence } from '../services/trust/skillConfidence.js';
import { writeAudit } from '../services/audit.js';
import { notify, EVIDENCE_NOTIFICATIONS } from '../services/notifications.js';

const adminView = (e) => ({
  _id: e._id,
  worker: e.worker?.name ? { _id: e.worker._id, name: e.worker.name } : { _id: e.worker },
  workerIdCode: e.profile?.workerIdCode ?? null,
  profileId: e.profile?._id ?? e.profile,
  skillId: e.skillId,
  skillName: e.skillName,
  type: e.type,
  title: e.title,
  status: e.status,
  reasonCode: e.reasonCode,
  reviewNote: e.reviewNote,
  reviewedAt: e.reviewedAt,
  createdAt: e.createdAt,
  width: e.width,
  height: e.height,
  size: e.size,
  possibleDuplicateOf: e.possibleDuplicateOf ?? null,
  duplicateKind: e.duplicateKind ?? null,
  duplicateDistance: e.duplicateDistance ?? null,
  allowedActions: allowedActions(e.status),
});

const populated = (query) => query.populate('worker', 'name').populate('profile', 'workerIdCode');

// GET /api/admin/evidence?status=&type=&skillId=&duplicates=true
export const listEvidenceQueue = async (req, res) => {
  const { status = 'pending', type, skillId, duplicates, page = 1, limit = 25 } = req.validated.query;
  const filter = {};
  if (status !== 'all') filter.status = status;
  if (type && type !== 'all') filter.type = type;
  if (skillId) filter.skillId = skillId;
  if (duplicates) filter.duplicateKind = mongoose.trusted({ $in: ['exact', 'similar'] }); // our own operator
  const sort = status === 'pending' ? { createdAt: 1, _id: 1 } : { updatedAt: -1, _id: -1 }; // queue: oldest first
  const [items, total] = await Promise.all([
    populated(Evidence.find(filter).sort(sort).skip((page - 1) * limit).limit(limit)).lean(),
    Evidence.countDocuments(filter),
  ]);
  res.json({ evidence: items.map(adminView), page, limit, total });
};

// GET /api/admin/evidence/:id — details, the possible duplicate, and the skill's numbers.
export const getEvidenceForAdmin = async (req, res) => {
  const evidence = await populated(Evidence.findById(req.validated.params.id)).lean();
  if (!evidence) throw httpError(404, 'PROOF_NOT_FOUND');
  let duplicate = null;
  if (evidence.possibleDuplicateOf) {
    const d = await populated(Evidence.findById(evidence.possibleDuplicateOf)).lean();
    if (d) duplicate = adminView(d);
  }
  // "opinion" = the subjective-logic numbers b, d, u, E for this worker's skill (admin only).
  const opinion = confidenceForAdmin(skillConfidence(await evidenceFor(evidence.worker._id, evidence.skillId)));
  res.json({ evidence: adminView(evidence), duplicate, opinion });
};

const REASON_WORDS = { unclear: 'Photo is unclear', not_relevant: 'Not relevant to the skill', wrong_skill: 'Belongs to another skill', other: 'Other' };

// PATCH /api/admin/evidence/:id { action, reasonCode?, note? }
// Atomic: the update happens only if the status is still the one we checked, so two admins (or an
// old screen) cannot both decide; the second gets 409.
export const decideEvidence = async (req, res) => {
  const { id } = req.validated.params;
  const { action, reasonCode, note = '' } = req.validated.body;
  const current = await Evidence.findById(id).select('status worker skillId').lean();
  if (!current) throw httpError(404, 'PROOF_NOT_FOUND');
  const t = checkTransition(action, current.status);
  if (!t.ok) throw httpError(400, 'TRANSITION_INVALID', { verb: t.verb, state: t.stateWords, action, status: current.status });

  const reviewNote = action === 'reject' ? (note || REASON_WORDS[reasonCode]) : note;
  const updated = await populated(
    Evidence.findOneAndUpdate(
      { _id: id, status: current.status },
      {
        $set: {
          status: t.to,
          reasonCode: action === 'reject' ? reasonCode : null,
          reviewNote,
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { returnDocument: 'after', runValidators: true }
    )
  ).lean();
  if (!updated) throw httpError(409, 'PROOF_CHANGED');

  const { summary, confidence } = await recomputeSkillSummary(current.worker, current.skillId);
  await writeAudit({
    actor: req.user._id,
    actorRole: 'admin',
    action: `evidence.${t.to}`,
    targetType: 'Evidence',
    targetId: id,
    fromState: current.status,
    toState: t.to,
    reason: reviewNote || null,
    details: { skillId: current.skillId, reasonCode: reasonCode ?? null },
  });
  // Tell the worker (in-app). The note is the review note the worker can already see on the item.
  await notify(current.worker, EVIDENCE_NOTIFICATIONS[t.to], {
    skillId: current.skillId, skillName: updated.skillName, evidenceId: id, reasonCode: action === 'reject' ? reasonCode : null, note: reviewNote,
  });

  res.json({ evidence: adminView(updated), skill: { skillId: current.skillId, evidenceSummary: summary }, opinion: confidenceForAdmin(confidence) });
};
