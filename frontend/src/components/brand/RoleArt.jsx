// Small in-house illustrations for the two role cards on Create account (decorative).
export function WorkerArt() {
  return (
    <svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true" focusable="false">
      <rect x="2" y="6" width="60" height="40" rx="12" fill="var(--color-primary-soft)" />
      <path d="M16 30c0-8 6-14 16-14s16 6 16 14Z" fill="var(--color-primary)" />
      <rect x="12" y="30" width="40" height="5" rx="2.5" fill="var(--color-primary-hover)" />
      <path d="M32 16v5" stroke="var(--color-on-primary)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M45 10l5 5-9 9-3-1-1-3Z" fill="var(--color-accent)" />
    </svg>
  );
}

export function CustomerArt() {
  return (
    <svg viewBox="0 0 64 48" width="64" height="48" aria-hidden="true" focusable="false">
      <rect x="2" y="6" width="60" height="40" rx="12" fill="var(--color-accent-soft)" />
      <path d="M14 26 28 15l14 11v14H14Z" fill="var(--color-surface)" stroke="var(--color-text)" strokeWidth="2" strokeLinejoin="round" />
      <rect x="24" y="30" width="8" height="10" rx="1.5" fill="var(--color-primary)" />
      <circle cx="44" cy="28" r="7" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
      <path d="M49 33l6 6" stroke="var(--color-primary)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}
