// A short confetti burst on a <canvas> (own code, no package) for the end of onboarding.
// About 1.6 s, then the canvas removes itself. Nothing is drawn with reduced motion.
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

export default function Confetti({ fire = true }) {
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
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 6 + Math.random() * 7;
      return {
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height * 0.55,
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
        p.vy += 0.32; // gravity
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.vspin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (elapsed < DURATION) frame = requestAnimationFrame(step);
      else setDone(true);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [fire, reduced]);

  if (!fire || reduced || done) return null;
  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
