// Module 3, worker side: upload proof for one of my skills, list my proof, view my photos, delete.
import mongoose from 'mongoose';
import Evidence from '../models/Evidence.js';
import WorkerProfile from '../models/WorkerProfile.js';
import { httpError } from '../utils/httpError.js';
import * as storage from '../services/evidence/storage.js';
import { detectImageType, processImage, sha256, dHash, hammingDistance } from '../services/evidence/image.js';
import { recomputeSkillSummary } from '../services/evidence/skillSummary.js';
import { WORKER_DELETABLE } from '../services/evidence/transitions.js';
import { writeAudit } from '../services/audit.js';
import { DHASH_SIMILAR_MAX_DISTANCE, MAX_EVIDENCE_PER_SKILL, MAX_EVIDENCE_PER_WORKER } from '../config/evidence.js';

// What the owner sees. Never another worker's ids, never hashes.
export const ownerView = (e) => ({
  _id: e._id,
  skillId: e.skillId,
  skillName: e.skillName,
  type: e.type,
  title: e.title,
  status: e.status,
  reasonCode: e.reasonCode,
  reviewNote: e.reviewNote,
  width: e.width,
  height: e.height,
  size: e.size,
  createdAt: e.createdAt,
  reviewedAt: e.reviewedAt,
});

// Another worker's item with the same picture (exact) or a very similar one (dHash).
async function findPossibleDuplicate(workerId, hash, dhash) {
  const notMine = mongoose.trusted({ $ne: workerId });
  const exact = await Evidence.findOne({ sha256: hash, worker: notMine }).sort({ createdAt: 1 }).select('_id').lean();
  if (exact) return { possibleDuplicateOf: exact._id, duplicateKind: 'exact', duplicateDistance: 0 };
  let best = null;
  for await (const other of Evidence.find({ worker: notMine }).select('dhash').lean().cursor()) {
    const distance = hammingDistance(dhash, other.dhash);
    if (distance <= DHASH_SIMILAR_MAX_DISTANCE && (!best || distance < best.duplicateDistance)) {
      best = { possibleDuplicateOf: other._id, duplicateKind: 'similar', duplicateDistance: distance };
    }
  }
  return best ?? { possibleDuplicateOf: null, duplicateKind: null, duplicateDistance: null };
}

// POST /api/evidence (multipart: image + skillId, type, title?, consent)
export const uploadEvidence = async (req, res) => {
  if (!req.file) throw httpError(400, 'PHOTO_REQUIRED');
  const { skillId, type, title = '' } = req.validated.body;
  const workerId = req.user._id;

  const profile = await WorkerProfile.findOne({ user: workerId }).select('skills').lean();
  const skill = profile?.skills.find((s) => s.skillId === skillId);
  if (!skill) throw httpError(400, 'PROOF_SKILL_NOT_ON_PROFILE');

  const [forSkill, forWorker] = await Promise.all([
    Evidence.countDocuments({ worker: workerId, skillId }),
    Evidence.countDocuments({ worker: workerId }),
  ]);
  if (forSkill >= MAX_EVIDENCE_PER_SKILL) throw httpError(400, 'PROOF_LIMIT_SKILL', { max: MAX_EVIDENCE_PER_SKILL });
  if (forWorker >= MAX_EVIDENCE_PER_WORKER) throw httpError(400, 'PROOF_LIMIT_TOTAL', { max: MAX_EVIDENCE_PER_WORKER });

  await detectImageType(req.file.buffer); // 400 unless JPEG, PNG or WebP by content
  const processed = await processImage(req.file.buffer); // rotate, resize, WebP, no metadata
  const hash = sha256(processed.data);
  const dhash = await dHash(processed.data);

  if (await Evidence.exists({ worker: workerId, skillId, sha256: hash })) {
    throw httpError(409, 'PHOTO_DUPLICATE');
  }
  const duplicate = await findPossibleDuplicate(workerId, hash, dhash);

  const fileId = await storage.save(processed.data, { contentType: processed.contentType });
  let evidence;
  try {
    evidence = await Evidence.create({
      worker: workerId,
      profile: profile._id,
      skillId,
      skillName: skill.name,
      type,
      title,
      consentAt: new Date(),
      fileId,
      contentType: processed.contentType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      sha256: hash,
      dhash,
      ...duplicate,
    });
  } catch (err) {
    await storage.remove(fileId); // no orphan bytes
    if (err.code === 11000) throw httpError(409, 'PHOTO_DUPLICATE');
    throw err;
  }

  const { summary } = await recomputeSkillSummary(workerId, skillId);
  await writeAudit({
    actor: workerId,
    actorRole: 'worker',
    action: 'evidence.uploaded',
    targetType: 'Evidence',
    targetId: evidence._id,
    toState: 'pending',
    details: { skillId, type, possibleDuplicate: duplicate.duplicateKind },
  });
  res.status(201).json({ evidence: ownerView(evidence), skill: { skillId, evidenceSummary: summary } });
};

// GET /api/evidence/mine?skillId=  — metadata only, never bytes.
export const listMyEvidence = async (req, res) => {
  const filter = { worker: req.user._id };
  if (req.validated.query.skillId) filter.skillId = req.validated.query.skillId;
  const items = await Evidence.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ evidence: items.map(ownerView) });
};

// GET /api/evidence/:id/file — the owner or an admin. Others get 404 (existence is not revealed).
export const getEvidenceFile = async (req, res) => {
  const evidence = await Evidence.findById(req.validated.params.id).select('worker fileId').lean();
  const allowed = evidence && (req.user.role === 'admin' || String(evidence.worker) === String(req.user._id));
  if (!allowed) throw httpError(404, 'PHOTO_NOT_FOUND');
  const file = await storage.read(evidence.fileId);
  if (!file) throw httpError(404, 'PHOTO_NOT_FOUND');
  res.set({
    'Content-Type': file.contentType,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
  });
  res.send(file.data);
};

// Shared by DELETE /api/evidence/:id and by removing a skill.
export async function deleteEvidenceItem(evidence, actorId) {
  await Evidence.deleteOne({ _id: evidence._id, status: evidence.status });
  await storage.remove(evidence.fileId);
  await writeAudit({
    actor: actorId,
    actorRole: 'worker',
    action: 'evidence.deleted',
    targetType: 'Evidence',
    targetId: evidence._id,
    fromState: evidence.status,
    details: { skillId: evidence.skillId },
  });
}

// DELETE /api/evidence/:id — only my own pending or rejected items (D-015). A suspected fake can
// never be deleted, so a worker cannot remove a "Disputed" status by deleting the finding.
export const deleteEvidence = async (req, res) => {
  const evidence = await Evidence.findById(req.validated.params.id).select('worker status fileId skillId').lean();
  if (!evidence || String(evidence.worker) !== String(req.user._id)) throw httpError(404, 'PROOF_NOT_FOUND');
  if (evidence.status === 'suspected_fake') {
    throw httpError(409, 'PROOF_FAKE_CANNOT_DELETE');
  }
  if (!WORKER_DELETABLE.includes(evidence.status)) {
    throw httpError(409, 'PROOF_REVIEWED_CANNOT_DELETE');
  }
  await deleteEvidenceItem(evidence, req.user._id);
  const { summary } = await recomputeSkillSummary(req.user._id, evidence.skillId);
  res.json({ message: 'Proof deleted.', skill: { skillId: evidence.skillId, evidenceSummary: summary } });
};
