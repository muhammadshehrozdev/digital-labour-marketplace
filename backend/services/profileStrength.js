// Profile strength for the worker's own dashboard (Batch 4, feature 10). A pure function.
// It answers "what should I do next?" from the worker's real data only:
//   percent  the documented completion checklist (services/profileCompletion.js), nothing else
//   level    a word for that percent: starting (< 50), good (50-79), strong (80-99, or 100 with
//            no approved proof yet), complete (100 and at least one skill with approved proof)
//   checks   the checklist with what is done, so the meter can show its own working
//   proof    how many skills have approved proof, proof waiting for review, or none
//   tips     up to 5 next steps as lower-case codes + params; the website words them in the user's
//            language (lower case, so they are never mistaken for error codes of errors/catalog.js)
// There is no hidden weighting and no prediction: every tip names one missing thing.
import { completionChecks } from './profileCompletion.js';

export const MAX_TIPS = 5;
export const STRENGTH_LEVELS = Object.freeze(['starting', 'good', 'strong', 'complete']);

export function profileStrength(profile, evidence = []) {
  const skills = profile.skills ?? [];
  const checks = completionChecks(profile);
  const done = (id) => checks.find((c) => c.id === id)?.done;
  const percent = Math.min(100, checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0));

  const withApproved = skills.filter((s) => (s.evidenceSummary?.approved ?? 0) > 0);
  const withPending = skills.filter((s) => (s.evidenceSummary?.approved ?? 0) === 0 && (s.evidenceSummary?.pending ?? 0) > 0);
  const withNone = skills.filter((s) => (s.evidenceSummary?.approved ?? 0) === 0 && (s.evidenceSummary?.pending ?? 0) === 0);
  const rejectedSkillIds = new Set(evidence.filter((e) => e.status === 'rejected').map((e) => e.skillId));

  const tips = [];
  const tip = (code, params) => tips.push(params ? { code, params } : { code });
  if (!done('trade')) tip('add_trade');
  if (!done('skills')) tip('add_skills');
  if (!profile.cnicOnFile) tip('add_cnic');
  else if (profile.verificationStatus === 'Rejected') tip('fix_identity');
  // proof: first a skill whose proof was not accepted, then up to two skills with no proof at all
  const replace = withNone.find((s) => rejectedSkillIds.has(s.skillId));
  if (replace) tip('replace_proof', { skillId: replace.skillId, skillName: replace.name });
  for (const s of withNone.filter((x) => x !== replace).slice(0, 2)) tip('add_proof', { skillId: s.skillId, skillName: s.name });
  if (!done('experienceRate')) tip('add_experience_rate');
  if (!done('bio')) tip('add_bio');
  if (!done('workHistory')) tip('add_work_history');
  if (!done('cityAddress')) tip('add_city_address');
  if (!done('contact')) tip('add_contact');

  let level = 'starting';
  if (percent >= 50) level = 'good';
  if (percent >= 80) level = 'strong';
  if (percent === 100 && withApproved.length > 0) level = 'complete';

  return {
    percent,
    level,
    checks,
    proof: { skills: skills.length, approved: withApproved.length, pending: withPending.length, none: withNone.length },
    tips: tips.slice(0, MAX_TIPS),
  };
}
