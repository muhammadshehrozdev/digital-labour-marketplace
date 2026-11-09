// Module 2: Experience and Skill Profiler (rule-based skill extractor + confirm flow).
// Rules: extract NEVER writes to the database (fixes M2-2, M2-3); the worker's confirmed
// skills are saved only by POST .../skills (fixes M2-9, M2-10). No scores anywhere (M2-8).
import WorkerProfile from '../models/WorkerProfile.js';
import Evidence from '../models/Evidence.js';
import { deleteEvidenceItem } from './evidenceController.js';
import { WORKER_DELETABLE } from '../services/evidence/transitions.js';
import { httpError } from '../utils/httpError.js';
import { extractSkills } from '../services/skillExtractor/extractor.js';
import { skillById, categoryLabel } from '../config/skillTaxonomy.js';
import { calculateCompletion } from '../services/profileCompletion.js';
import { refreshOnboarding } from '../services/onboarding.js';

export const MAX_SKILLS = 40;
export const MAX_CUSTOM_SKILLS = 10;

const skillsView = (profile) => (profile?.skills || []).map(({ skillId, name, category, addedVia, custom, addedAt, evidenceSummary }) => ({
  skillId, name, category, addedVia, custom, addedAt, evidenceSummary,
}));

async function respond(req, res, profile, status = 200) {
  const onboarding = await refreshOnboarding(req.user, profile);
  res.status(status).json({ skills: skillsView(profile), onboarding });
}

// POST /api/workers/me/skills/extract  — suggestions only.
export const extract = async (req, res) => {
  const { text } = req.validated.body;
  const result = extractSkills(text);
  const profile = await WorkerProfile.findOne({ user: req.user._id }).select('skills').lean();
  const saved = new Set((profile?.skills || []).map((s) => s.skillId));
  res.json({
    ...result,
    skills: result.skills.map((s) => ({ ...s, alreadySaved: saved.has(s.skillId) })),
    categories: result.categories.map((c) => ({ ...c, label: categoryLabel(c.id) })),
    method: 'rule-based word list',
  });
};

// GET /api/workers/me/skills
export const listMySkills = async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id });
  await respond(req, res, profile);
};

async function loadOrCreate(userId) {
  return (await WorkerProfile.findOne({ user: userId })) || new WorkerProfile({ user: userId });
}

// POST /api/workers/me/skills  { skillIds, addedVia, sourceText? }
export const addSkills = async (req, res) => {
  const { skillIds, addedVia, sourceText } = req.validated.body;
  const profile = await loadOrCreate(req.user._id);
  const existing = new Set(profile.skills.map((s) => s.skillId));
  const toAdd = [...new Set(skillIds)].filter((id) => !existing.has(id)); // adding twice keeps one copy
  if (profile.skills.length + toAdd.length > MAX_SKILLS) throw httpError(400, `At most ${MAX_SKILLS} skills per worker`);

  for (const id of toAdd) {
    const s = skillById(id);
    profile.skills.push({ skillId: s.id, name: s.name, category: s.category, addedVia, custom: false });
  }
  if (addedVia === 'extractor' && sourceText) {
    profile.rawExperienceText = sourceText;
    profile.lastExtractedAt = new Date();
  }
  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();
  await respond(req, res, profile, toAdd.length ? 201 : 200);
};

const slug = (name) => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// POST /api/workers/me/skills/custom  { name, category }
export const addCustomSkill = async (req, res) => {
  const { name, category } = req.validated.body;
  const id = slug(name);
  if (!id) throw httpError(400, 'Please write the skill name in English letters (a-z) for now');
  const profile = await loadOrCreate(req.user._id);
  const skillId = `custom-${id}`;
  if (profile.skills.some((s) => s.skillId === skillId)) return respond(req, res, profile);
  if (profile.skills.filter((s) => s.custom).length >= MAX_CUSTOM_SKILLS) throw httpError(400, `At most ${MAX_CUSTOM_SKILLS} custom skills`);
  if (profile.skills.length >= MAX_SKILLS) throw httpError(400, `At most ${MAX_SKILLS} skills per worker`);
  profile.skills.push({ skillId, name, category, addedVia: 'manual', custom: true });
  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();
  await respond(req, res, profile, 201);
};

// DELETE /api/workers/me/skills/:skillId — removes one skill, nothing else.
export const removeSkill = async (req, res) => {
  const { skillId } = req.validated.params;
  const profile = await WorkerProfile.findOne({ user: req.user._id });
  if (!profile || !profile.skills.some((s) => s.skillId === skillId)) throw httpError(404, 'This skill is not on your profile');
  // Module 3: a skill with reviewed proof (approved, revoked or suspected fake) cannot be removed,
  // otherwise a worker could hide a "suspected fake" finding. Pending or rejected proof goes with it.
  const items = await Evidence.find({ worker: req.user._id, skillId }).select('status fileId skillId').lean();
  if (items.some((e) => !WORKER_DELETABLE.includes(e.status))) {
    throw httpError(409, 'This skill has proof that an admin already reviewed, so it cannot be removed. Please contact the admin.');
  }
  for (const item of items) await deleteEvidenceItem(item, req.user._id);
  profile.skills = profile.skills.filter((s) => s.skillId !== skillId);
  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();
  await respond(req, res, profile);
};
