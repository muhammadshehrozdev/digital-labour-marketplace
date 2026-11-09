// Fade-and-rise when the element scrolls into view. Browsers with scroll-driven animations do it
// in CSS (base.css, animation-timeline: view()); others get .is-visible from an IntersectionObserver.
// The content is always in the page (and visible without JavaScript or with reduced motion).
import { useEffect, useRef } from 'react';

const supportsScrollTimeline = () => typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()');

export default function Reveal({ as: Tag = 'div', index = 0, className, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || supportsScrollTimeline() || typeof IntersectionObserver === 'undefined') {
      el?.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={['reveal', className].filter(Boolean).join(' ')} style={{ '--i': index }} {...rest}>
      {children}
    </Tag>
  );
}
