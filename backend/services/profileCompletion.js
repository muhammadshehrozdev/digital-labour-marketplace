// Profile completion % shown to the worker. A simple documented checklist, not a "score":
// 20 base (the account exists) + trade 15 + experience & rate 15 + city & address 10 + contact 10
// + skills 15 + bio 5 + work history 10 = 100.
// completionChecks() is the one list; calculateCompletion() adds the weights of the done items.
export function completionChecks(profile) {
  return [
    { id: 'account', weight: 20, done: true },
    { id: 'trade', weight: 15, done: Boolean(profile.occupation && profile.category) },
    { id: 'experienceRate', weight: 15, done: Boolean(profile.experienceYears > 0 && (profile.hourlyRate > 0 || profile.dailyRate > 0)) },
    { id: 'cityAddress', weight: 10, done: Boolean(profile.city && profile.address) },
    { id: 'contact', weight: 10, done: Boolean(profile.whatsappNumber || profile.emergencyContact) },
    { id: 'skills', weight: 15, done: Boolean(profile.skills && profile.skills.length > 0) },
    { id: 'bio', weight: 5, done: Boolean(profile.bio && profile.bio.trim().length > 10) },
    { id: 'workHistory', weight: 10, done: Boolean(profile.workHistory && profile.workHistory.length > 0) },
  ];
}

export function calculateCompletion(profile) {
  const score = completionChecks(profile).reduce((sum, check) => sum + (check.done ? check.weight : 0), 0);
  return Math.min(score, 100);
}
