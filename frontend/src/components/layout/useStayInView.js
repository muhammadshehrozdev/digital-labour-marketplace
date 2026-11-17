// Every menu and popover stays inside the window (Batch 6B, Part A). After it opens (and when the window
// changes size) the popover is measured; if it reaches past an edge it is moved back, so it keeps `margin`
// pixels from both window edges. The CSS also limits its width to calc(100vw - 16px). The `translate`
// property is used, so the opening animation (transform) is not disturbed.
import { useLayoutEffect } from 'react';

export function placeInView(el, margin = 8) {
  el.style.translate = '';
  const box = el.getBoundingClientRect();
  const width = document.documentElement.clientWidth || window.innerWidth;
  let dx = 0;
  if (box.right > width - margin) dx = width - margin - box.right;
  if (box.left + dx < margin) dx = margin - box.left;
  if (Math.abs(dx) >= 0.5) el.style.translate = `${Math.round(dx)}px 0`;
  return dx;
}

export function useStayInView(ref, open, margin = 8) {
  useLayoutEffect(() => {
    if (!open || !ref.current) return undefined;
    const place = () => ref.current && placeInView(ref.current, margin);
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [ref, open, margin]);
}
