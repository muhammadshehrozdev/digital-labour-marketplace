// In-house animated illustration for the landing hero (decorative, aria-hidden).
// A worker's ID card with a check that draws itself, a skill chip that turns "verified",
// and floating tools. No people, no stock photos. Motion: transform/opacity, plus one stroke
// draw; everything is still with reduced motion (see the CSS).
import styles from './HeroIllustration.module.css';

export default function HeroIllustration() {
  return (
    <svg className={styles.art} viewBox="0 0 420 340" width="100%" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-dark-surface)" />
          <stop offset="1" stopColor="var(--color-dark-bg-2)" />
        </linearGradient>
        <linearGradient id="hero-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-dark-primary)" />
          <stop offset="1" stopColor="var(--color-dark-accent)" />
        </linearGradient>
      </defs>

      {/* soft rings behind the card */}
      <g className={styles.rings} fill="none" stroke="var(--color-dark-border)">
        <circle cx="210" cy="170" r="150" strokeDasharray="2 10" />
        <circle cx="210" cy="170" r="112" opacity="0.7" />
      </g>

      {/* the ID card */}
      <g className={styles.card}>
        <rect x="88" y="70" width="244" height="190" rx="22" fill="url(#hero-card)" stroke="var(--color-dark-border)" />
        <rect x="88" y="70" width="244" height="42" rx="22" fill="color-mix(in oklch, var(--color-dark-primary) 22%, transparent)" />
        <circle cx="140" cy="150" r="26" fill="color-mix(in oklch, var(--color-dark-accent) 35%, transparent)" />
        <path d="M128 162c3-9 21-9 24 0" stroke="var(--color-on-dark)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
        <circle cx="140" cy="141" r="8" fill="var(--color-on-dark)" opacity="0.8" />
        <rect x="182" y="132" width="112" height="12" rx="6" fill="var(--color-on-dark)" opacity="0.85" />
        <rect x="182" y="154" width="78" height="9" rx="4.5" fill="var(--color-on-dark-muted)" opacity="0.6" />
        <rect x="112" y="194" width="88" height="26" rx="13" fill="color-mix(in oklch, var(--color-dark-primary) 22%, transparent)" />
        <path className={styles.chipCheck} d="M124 207l6 6 11-12" fill="none" stroke="var(--color-dark-primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
        <rect x="148" y="203" width="40" height="8" rx="4" fill="var(--color-dark-primary)" opacity="0.8" />
        <rect x="210" y="194" width="96" height="26" rx="13" fill="color-mix(in oklch, var(--color-on-dark) 10%, transparent)" />
        <rect x="224" y="203" width="66" height="8" rx="4" fill="var(--color-on-dark-muted)" opacity="0.5" />
        <rect x="112" y="234" width="130" height="7" rx="3.5" fill="var(--color-on-dark-muted)" opacity="0.35" />
      </g>

      {/* the big check badge that draws itself */}
      <g className={styles.badge}>
        <circle cx="318" cy="92" r="34" fill="url(#hero-accent)" />
        <path className={styles.badgeCheck} d="M302 92l11 11 21-23" fill="none" stroke="var(--color-dark-bg)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      </g>

      {/* floating tools */}
      <g className={`${styles.tool} ${styles.wrench}`}>
        <path d="M56 236a20 20 0 0 0 27 24l22 22a8 8 0 0 0 11-11l-22-22a20 20 0 0 0-24-27l12 12-4 11-11 4Z" fill="var(--color-dark-accent)" />
      </g>
      <g className={`${styles.tool} ${styles.brush}`}>
        <rect x="350" y="214" width="16" height="54" rx="6" fill="var(--color-dark-primary)" transform="rotate(28 358 241)" />
        <rect x="343" y="196" width="30" height="24" rx="6" fill="var(--color-on-dark)" opacity="0.9" transform="rotate(28 358 208)" />
      </g>
      <g className={`${styles.tool} ${styles.bolt}`}>
        <path d="M66 70l-16 30h14l-8 26 24-34H66l8-22Z" fill="var(--color-dark-primary)" />
      </g>
    </svg>
  );
}
