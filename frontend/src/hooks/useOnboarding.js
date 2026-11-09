// The worker's onboarding progress, always from the server (GET /api/workers/me/onboarding),
// never from localStorage (D-011).
import { useState } from 'react';
import { useApiQuery } from './useApiQuery';

export const ONBOARDING_STEPS = [
  { id: 'about', label: 'About you' },
  { id: 'work', label: 'Your work' },
  { id: 'skills', label: 'Your skills' },
  { id: 'proof', label: 'Proof of skills' },
  { id: 'done', label: 'All set' },
];
export const STEP_IDS = ONBOARDING_STEPS.map((s) => s.id);
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
    error: query.error ? 'Could not load your progress. Please reload the page.' : '',
  };
}
