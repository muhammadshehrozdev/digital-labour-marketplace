// Guided onboarding state (decision D-011). DERIVED from saved data every time, so it can
// never drift from the profile; only the first completion time is stored.
//   about  = name, phone (User) and city (profile) present
//   work   = category, occupation, experienceYears and at least one rate > 0
//   skills = at least one confirmed skill
// Step "proof" (Module 3) is not built yet, so it is not part of completion.
import WorkerProfile from '../models/WorkerProfile.js';

export const ONBOARDING_STEPS = ['about', 'work', 'skills'];

const filled = (v) => typeof v === 'string' && v.trim().length > 0;

export function onboardingState(user, profile) {
  const p = profile || {};
  const steps = {
    about: filled(user?.name) && filled(user?.phone) && filled(p.city),
    work:
      filled(p.category) &&
      filled(p.occupation) &&
      Number.isInteger(p.experienceYears) &&
      ((p.hourlyRate ?? 0) > 0 || (p.dailyRate ?? 0) > 0),
    skills: Array.isArray(p.skills) && p.skills.length > 0,
  };
  const nextStep = ONBOARDING_STEPS.find((s) => !steps[s]) ?? null;
  return {
    steps,
    nextStep,
    complete: nextStep === null,
    completedAt: p.onboardingCompletedAt ?? null,
    // Batch 3: lets the website skip GET /api/workers/me (a 404) before the profile exists.
    profileExists: Boolean(profile),
  };
}

// Stores onboardingCompletedAt the first time all steps are done. Returns the state.
export async function refreshOnboarding(user, profile) {
  const state = onboardingState(user, profile);
  if (state.complete && profile && !profile.onboardingCompletedAt) {
    const at = new Date();
    await WorkerProfile.updateOne({ _id: profile._id, onboardingCompletedAt: null }, { $set: { onboardingCompletedAt: at } });
    state.completedAt = at;
  }
  return state;
}
