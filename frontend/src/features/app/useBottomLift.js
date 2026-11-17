// How far above the bottom edge a fixed button must sit to stay clear of bars there (elements with
// data-bottom-bar: the compare tray, the onboarding buttons, the install invitation). Used by the page help
// button (Batch 5) and, since Batch 6B, the scroll-to-top button.
import { useEffect, useState } from 'react';

export function useBottomLift() {
  const [lift, setLift] = useState(0);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let max = 0;
        for (const el of document.querySelectorAll('[data-bottom-bar]')) {
          const r = el.getBoundingClientRect();
          // a bar at the bottom edge, or floating just above it (the install invitation sits 12 px up)
          if (r.height && r.bottom >= window.innerHeight - 24 && r.top < window.innerHeight) max = Math.max(max, window.innerHeight - r.top);
        }
        setLift((old) => (Math.abs(old - max) > 1 ? max : old));
      });
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const timer = window.setInterval(measure, 700);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.clearInterval(timer);
    };
  }, []);
  return lift;
}

