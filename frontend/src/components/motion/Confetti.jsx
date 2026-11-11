// A short confetti burst on a <canvas> (own code, no package). About 1.6 s, then the canvas
// removes itself. Nothing is drawn with reduced motion.
// variant (Batch 4, feature 52): one look per milestone
//   classic  paper pieces, from the middle          end of onboarding
//   stars    five-pointed stars, from both sides    profile strength reaches "Complete"
//   ribbons  long thin strips falling from the top  first proof approved
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import styles from './Confetti.module.css';

const COUNT = 90;
const DURATION = 1600;

function readColours() {
  const css = getComputedStyle(document.documentElement);
  return ['--primary-400', '--primary-600', '--accent-500', '--accent-300', '--secondary-500']
    .map((name) => css.getPropertyValue(name).trim())
    .filter(Boolean);
}

function star(ctx, size) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? size : size * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export default function Confetti({ fire = true, variant = 'classic' }) {
  const reduced = useReducedMotion();
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!fire || reduced) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!ctx) return undefined;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    const colours = readColours();
    const pieces = Array.from({ length: COUNT }, (_, i) => {
      const fromLeft = i % 2 === 0;
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      let speed = 6 + Math.random() * 7;
      let x = width / 2 + (Math.random() - 0.5) * 80;
      let y = height * 0.55;
      if (variant === 'stars') { // two fountains from the lower corners
        angle = fromLeft ? -Math.PI / 3 - Math.random() * 0.4 : (-2 * Math.PI) / 3 + Math.random() * 0.4;
        x = fromLeft ? 0 : width;
        y = height * 0.85;
        speed = 9 + Math.random() * 7;
      } else if (variant === 'ribbons') { // a gentle fall from the top
        angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        x = Math.random() * width;
        y = -20 - Math.random() * height * 0.3;
        speed = 1 + Math.random() * 2;
      }
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        spin: Math.random() * Math.PI,
        vspin: (Math.random() - 0.5) * 0.35,
        colour: colours[i % colours.length] || '#2a9d74',
      };
    });
    let start;
    let frame;
    const step = (time) => {
      start ??= time;
      const elapsed = time - start;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / DURATION);
      for (const p of pieces) {
        p.vy += variant === 'ribbons' ? 0.06 : 0.32; // gravity (ribbons float down)
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.vspin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.colour;
        if (variant === 'stars') star(ctx, p.size * 0.8);
        else if (variant === 'ribbons') ctx.fillRect(-1.5, -p.size * 1.6, 3, p.size * 3.2);
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (elapsed < DURATION) frame = requestAnimationFrame(step);
      else setDone(true);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [fire, reduced, variant]);

  if (!fire || reduced || done) return null;
  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
