// Profile completion % shown to the worker. Simple documented checklist, not a "score":
// 20 base + trade 15 + experience & rate 15 + city & address 10 + contact 10
// + skills 15 + bio 5 + work history 10 = 100.
export function calculateCompletion(profile) {
  let score = 20;
  if (profile.occupation && profile.category) score += 15;
  if (profile.experienceYears > 0 && (profile.hourlyRate > 0 || profile.dailyRate > 0)) score += 15;
  if (profile.city && profile.address) score += 10;
  if (profile.whatsappNumber || profile.emergencyContact) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.bio && profile.bio.trim().length > 10) score += 5;
  if (profile.workHistory && profile.workHistory.length > 0) score += 10;
  return Math.min(score, 100);
}
