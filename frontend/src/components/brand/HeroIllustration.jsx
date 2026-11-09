// In-house flat illustration for the landing page (decorative). No stock photos, no people.
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 360 280" width="100%" role="presentation" aria-hidden="true" focusable="false">
      <rect x="20" y="40" width="320" height="200" rx="20" fill="var(--color-primary-soft)" />
      <rect x="44" y="64" width="176" height="152" rx="14" fill="var(--color-surface)" stroke="var(--color-border)" />
      <circle cx="76" cy="98" r="18" fill="var(--color-primary-soft-strong)" />
      <rect x="104" y="86" width="92" height="10" rx="5" fill="var(--color-text)" opacity="0.85" />
      <rect x="104" y="104" width="64" height="8" rx="4" fill="var(--color-border-strong)" />
      <rect x="60" y="132" width="64" height="20" rx="10" fill="var(--color-success-soft)" />
      <path d="M68 142l4 4 8-8" fill="none" stroke="var(--color-success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="86" y="138" width="30" height="8" rx="4" fill="var(--color-success)" opacity="0.6" />
      <rect x="130" y="132" width="72" height="20" rx="10" fill="var(--color-surface-muted)" />
      <rect x="60" y="166" width="144" height="8" rx="4" fill="var(--color-border)" />
      <rect x="60" y="182" width="112" height="8" rx="4" fill="var(--color-border)" />
      <g transform="translate(236 70)">
        <path d="M44 4 80 17v27c0 23-15 40-36 48C23 84 8 67 8 44V17Z" fill="var(--color-primary)" />
        <path d="M27 50l12 12 22-25" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="65" cy="33" r="9" fill="none" stroke="#FFFFFF" strokeWidth="6" />
        <rect x="66" y="21" width="7" height="12" rx="2" transform="rotate(45 69.5 27)" fill="var(--color-primary)" />
      </g>
      <g transform="translate(238 178)">
        <rect width="84" height="40" rx="10" fill="var(--color-accent-soft)" />
        <rect x="12" y="12" width="40" height="7" rx="3.5" fill="var(--color-accent)" />
        <rect x="12" y="24" width="58" height="6" rx="3" fill="var(--color-border-strong)" />
      </g>
    </svg>
  );
}
