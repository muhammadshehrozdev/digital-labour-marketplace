// Changing light <-> dark with an animation (Batch 4, Part 3.4):
//   1. View Transitions: the new mode grows as a circle out of the toggle button
//      (document.startViewTransition + clip-path: circle()).
//   2. Browsers without View Transitions: a short cross-fade of colours.
//   3. Reduced motion: the change is instant.
// `apply` must change the page synchronously. Returns which of the three ran (used by tests).
const REDUCED = '(prefers-reduced-motion: reduce)';
export const REVEAL_MS = 620;

export const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia(REDUCED).matches;

export function changeMode(apply, origin) {
  const root = document.documentElement;
  if (prefersReducedMotion()) {
    apply();
    return 'instant';
  }
  if (typeof document.startViewTransition !== 'function') {
    root.classList.add('mode-fade');
    apply();
    window.setTimeout(() => root.classList.remove('mode-fade'), 420);
    return 'fade';
  }
  const x = origin?.x ?? window.innerWidth - 48;
  const y = origin?.y ?? 34;
  // far enough to cover the farthest corner of the window
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.dataset.transition = 'theme';
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    })
    .catch(() => {}); // the transition was skipped (e.g. the tab is hidden): the mode is still applied
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (root.dataset.transition === 'theme') delete root.dataset.transition;
    });
  return 'reveal';
}
