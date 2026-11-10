// Wraps one button: it leans towards the mouse and springs back (feature 40). Desktop only;
// still with reduced motion or touch. The wrapper is a plain span, so the button inside keeps its
// own role, name and focus ring.
import { useMagnetic } from './pointerEffects';
import styles from './Magnetic.module.css';

export default function Magnetic({ children, strength }) {
  const { ref, onPointerMove, onPointerLeave } = useMagnetic(strength);
  return (
    <span ref={ref} className={styles.magnetic} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} data-magnetic>
      {children}
    </span>
  );
}
