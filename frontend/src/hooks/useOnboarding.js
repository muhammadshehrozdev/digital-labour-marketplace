// The worker's onboarding progress, always from the server (GET /api/workers/me/onboarding),
// never from localStorage (D-011).
import { useState } from 'react';
import { useApiQuery } from './useApiQuery';

// Step names are in the dictionaries: onboarding.steps.<id>.
export const STEP_IDS = ['about', 'work', 'skills', 'proof', 'done'];
export const DATA_STEPS = ['about', 'work', 'skills'];

// Which step may be shown, given the server's progress: completed steps can be revisited,
// later steps cannot be skipped, and "proof"/"done" need about + work + skills.
export function allowedStep(step, state) {
  if (!STEP_IDS.includes(step)) return state.nextStep ?? 'done';
  if (DATA_STEPS.includes(step)) {
    if (state.nextStep && STEP_IDS.indexOf(step) > STEP_IDS.indexOf(state.nextStep)) return state.nextStep;
    return step;
  }
  return state.complete ? step : state.nextStep;
}

export function useOnboarding() {
  const query = useApiQuery('/workers/me/onboarding');
  const [fresh, setFresh] = useState(null); // newer state returned by a save
  // Updater functions always receive the CURRENT state (the server copy until a save happened).
  const setState = (next) => setFresh((prev) => (typeof next === 'function' ? next(prev ?? query.data) : next));
  return {
    state: fresh ?? query.data,
    setState,
    error: query.error ? 'onboarding.progressError' : null,
  };
}
