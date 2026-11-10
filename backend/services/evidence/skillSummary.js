// Recomputes the evidence summary stored on one skill of a worker's profile, after every upload,
// review decision or deletion. Stores only what users may see (status, counts, strength label);
// the numbers b, d, u, E are computed on demand for admins only.
import Evidence from '../../models/Evidence.js';
import WorkerProfile, { sumApprovedEvidence } from '../../models/WorkerProfile.js';
import { skillConfidence } from '../trust/skillConfidence.js';

export async function evidenceFor(userId, skillId) {
  return Evidence.find({ worker: userId, skillId }).select('status type').lean();
}

export async function recomputeSkillSummary(userId, skillId) {
  const confidence = skillConfidence(await evidenceFor(userId, skillId));
  const summary = {
    status: confidence.status,
    approved: confidence.counts.approved,
    pending: confidence.counts.pending,
    strength: confidence.strength,
    updatedAt: new Date(),
  };
  await WorkerProfile.updateOne({ user: userId, 'skills.skillId': skillId }, { $set: { 'skills.$.evidenceSummary': summary } });
  // Keep the directory's sort key (sum of approved items) in step with the summaries.
  const profile = await WorkerProfile.findOne({ user: userId }).select('skills.evidenceSummary.approved').lean();
  if (profile) await WorkerProfile.updateOne({ user: userId }, { $set: { approvedEvidenceCount: sumApprovedEvidence(profile.skills) } });
  return { summary, confidence };
}

// The admin-only view of the numbers, labelled with the method.
export function confidenceForAdmin(confidence) {
  const round = (x) => Math.round(x * 1000) / 1000;
  return {
    method: 'Beta evidence counting in subjective-logic form (W = 2, a = 0.5); provisional weights: certificate 2, work photo 1, reference letter 1, suspected fake 1 (D-014)',
    r: confidence.r,
    s: confidence.s,
    belief: round(confidence.belief),
    disbelief: round(confidence.disbelief),
    uncertainty: round(confidence.uncertainty),
    expected: round(confidence.expected),
    status: confidence.status,
    strength: confidence.strength,
    counts: confidence.counts,
  };
}
