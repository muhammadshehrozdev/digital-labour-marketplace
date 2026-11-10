// Small pointer effects for desktop (Batch 4, features 39, 40, 42). All of them:
// - react to a mouse only (never to touch), and
// - do nothing when the person asked for reduced motion.
// They only write CSS variables or a transform, so there is no React re-render per mouse move.
import { useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

const isMouse = (event) => !event.pointerType || event.pointerType === 'mouse';

// Cursor spotlight (feature 39): put the returned handler on a container as onPointerMove and
// mark each card inside with data-spotlight; base.css draws a soft light at --mx / --my.
export function useSpotlight() {
  const reduced = useReducedMotion();
  return useCallback(
    (event) => {
      if (reduced || !isMouse(event)) return;
      for (const card of event.currentTarget.querySelectorAll('[data-spotlight]')) {
        const box = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${Math.round(event.clientX - box.left)}px`);
        card.style.setProperty('--my', `${Math.round(event.clientY - box.top)}px`);
      }
    },
    [reduced]
  );
}

// Parallax depth (feature 42): --px and --py go from -1 to 1 across the element; the hero
// illustration moves its layers by different amounts.
export function useParallax() {
  const reduced = useReducedMotion();
  const onPointerMove = useCallback(
    (event) => {
      if (reduced || !isMouse(event)) return;
      const box = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--px', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
      event.currentTarget.style.setProperty('--py', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
    },
    [reduced]
  );
  const onPointerLeave = useCallback((event) => {
    event.currentTarget.style.setProperty('--px', '0');
    event.currentTarget.style.setProperty('--py', '0');
  }, []);
  return { onPointerMove, onPointerLeave };
}

// Magnetic hover (feature 40): the element leans a few pixels towards the cursor.
export function useMagnetic(strength = 0.22) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const onPointerMove = useCallback(
    (event) => {
      if (reduced || !isMouse(event) || !ref.current) return;
      const box = ref.current.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) * strength;
      const dy = (event.clientY - (box.top + box.height / 2)) * strength;
      ref.current.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
    },
    [reduced, strength]
  );
  const onPointerLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);
  return { ref, onPointerMove, onPointerLeave };
}
