import styles from './Logo.module.css';

// Logomark: a shield (trust) holding a check stroke whose long arm ends in a wrench (verified work).
export function LogoMark({ size = 32, title }) {
  return (
    <svg
      className={styles.mark}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        d="M16 2.6 27.2 6.6v8.2c0 6.9-4.6 12.1-11.2 14.6C9.4 26.9 4.8 21.7 4.8 14.8V6.6Z"
        fill="var(--color-primary)"
        stroke="var(--color-primary)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.6 16.4 13.7 20.5 21 12.2" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.4" cy="10.6" r="3.3" fill="none" stroke="#FFFFFF" strokeWidth="2.3" />
      <rect x="22.6" y="6.4" width="2.6" height="4.2" rx="0.6" transform="rotate(45 23.9 8.5)" fill="var(--color-primary)" />
    </svg>
  );
}

// variant "full": mark + "Digital Labour Marketplace" ("Marketplace" hides on small screens).
// variant "mark": the mark only (needs a title for screen readers).
export default function Logo({ size = 32, variant = 'full' }) {
  if (variant === 'mark') return <LogoMark size={size} title="Digital Labour Marketplace" />;
  return (
    <span className={styles.logo}>
      <LogoMark size={size} />
      <span className={styles.wordmark}>
        <span className={styles.primary}>Digital Labour</span>
        <span className={styles.secondary}> Marketplace</span>
      </span>
    </span>
  );
}
