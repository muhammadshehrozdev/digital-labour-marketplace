// Logo v2: three logomark concepts (Batch 3, D-018). Each is drawn on a 32 x 32 grid and works
// at 16 px, in one colour (currentColor) and in full colour, on light and dark backgrounds.
// "outline" paths are used by the animated version (they draw themselves, then the fill fades in).
// Colours: --logo-fill (main shape), --logo-detail (check and lines on the shape), --logo-accent.

export const LOGO_CONCEPTS = {
  // A: a shield whose check mark ends in an open spanner head. Trust + tools.
  shield: {
    name: 'Shield & Spanner',
    shape: 'M16 2.6 27.2 6.6v8.3c0 6.8-4.5 11.9-11.2 14.6C9.3 26.8 4.8 21.7 4.8 14.9V6.6Z',
    details: (
      <>
        <path d="M10 16.4 14 20.3 20.6 13" fill="none" stroke="var(--logo-detail)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.4 9.6a3.6 3.6 0 1 0 4.9 4.9l-1.9-1.1-.6-2.2-2.4-1.6Z" fill="var(--logo-detail)" />
      </>
    ),
  },
  // B: a builder's helmet with a check. The people this site is for.
  helmet: {
    name: 'Hard-hat Check',
    shape: 'M5.6 20.5C5.6 13.6 10.2 8.2 16 8.2s10.4 5.4 10.4 12.3ZM3.4 21.6h25.2a1.6 1.6 0 0 1 1.6 1.6v.6a2.6 2.6 0 0 1-2.6 2.6H4.4a2.6 2.6 0 0 1-2.6-2.6v-.6a1.6 1.6 0 0 1 1.6-1.6Z',
    details: (
      <>
        <path d="M16 8.6v4.2" stroke="var(--logo-detail)" strokeWidth="2" strokeLinecap="round" />
        <path d="M11.6 16.4 14.6 19.3 20.4 13.4" fill="none" stroke="var(--logo-detail)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="25.4" cy="7.2" r="2.4" fill="var(--logo-accent)" />
      </>
    ),
  },
  // C: a hexagon nut with a stitched inner ring (tile and embroidery craft) and a check.
  nut: {
    name: 'Stitched Nut',
    shape: 'M14.2 2.9a3.6 3.6 0 0 1 3.6 0l9.5 5.5a3.6 3.6 0 0 1 1.8 3.1v11a3.6 3.6 0 0 1-1.8 3.1l-9.5 5.5a3.6 3.6 0 0 1-3.6 0l-9.5-5.5a3.6 3.6 0 0 1-1.8-3.1v-11a3.6 3.6 0 0 1 1.8-3.1Z',
    details: (
      <>
        <circle cx="16" cy="17" r="8.6" fill="none" stroke="var(--logo-accent)" strokeWidth="1.5" strokeDasharray="2.2 1.8" strokeLinecap="round" />
        <path d="M11.8 17.2 14.8 20.2 20.4 14" fill="none" stroke="var(--logo-detail)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    // At 20 px and below the stitched ring turns into noise: nut + a bolder check only.
    smallDetails: (
      <path d="M10.8 17 14.6 20.8 21.4 13.4" fill="none" stroke="var(--logo-detail)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
};

export const LOGO_CONCEPT_IDS = Object.keys(LOGO_CONCEPTS);
