// Counts from 0 up to a real number of the user (their own completion %, their own counts) when
// it first appears (Batch 4, feature 51). The final number is in the page from the start for
// screen readers; with reduced motion there is no counting.
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../components/motion/useReducedMotion';

export default function CountUp({ value, duration = 900, format = String }) {
  const reduced = useReducedMotion();
  const animate = !reduced && typeof window.requestAnimationFrame === 'function' && value > 0;
  const [shown, setShown] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) return undefined;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, duration, animate]);

  return (
    <>
      <span aria-hidden="true">{format(animate ? shown : value)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  );
}
