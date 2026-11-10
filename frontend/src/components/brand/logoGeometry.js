// Logo v3 (Batch 4, D-021): the Batch 1 mark is back — a rounded shield (trust) holding a check
// (verified) whose long arm is a wrench (skilled work) — in three refinements of that same idea.
// Plain data (no React), so scripts/make-icons.mjs draws the icon files from the same numbers.
// Drawn on a 32 x 32 grid. Colours come from CSS variables set in Logo.module.css:
//   --logo-shield-a / --logo-shield-b  shield fill (flat when both are equal)
//   --logo-ink     the check and wrench on a filled shield
//   --logo-accent  the wrench head in the two-tone refinement
//   --logo-line    the outline refinement's colour
// One-colour version (mono): the shield in currentColor with the check-wrench cut out by a mask,
// so it works on any background.

// Rounded shield, symmetric about x = 16; corner radii follow the UI radius scale.
export const SHIELD =
  'M16 2.3c.5 0 1 .1 1.4.2l7.3 2.3c1 .3 1.7 1.3 1.7 2.4v7.3c0 6.3-3.9 11.3-9.5 14.4a1.9 1.9 0 0 1-1.8 0C9.5 25.8 5.6 20.8 5.6 14.5V7.2c0-1.1.7-2.1 1.7-2.4l7.3-2.3c.4-.1.9-.2 1.4-.2Z';

// The check: short arm (P -> E) and long arm (E -> wrench head). The long arm is the wrench handle.
// "regular" is used from 24 px up; "small" (16-20 px) is bolder with a larger, more open head.
export const GEOMETRY = {
  regular: {
    short: 'M8.6 17.3 12.5 21.2',
    long: 'M12.5 21.2 19.01 13.13',
    head: 'M23.86 10.33A3 3 0 1 1 20.74 7.8', // open-end wrench head: a "C" that opens away from the handle
    elbow: '12.5px 21.2px',
    stroke: 2.7,
  },
  small: {
    short: 'M8.4 16.9 12.4 20.9',
    long: 'M12.4 20.9 18.62 13.26',
    head: 'M23.98 10.31A3.3 3.3 0 1 1 20.42 7.41', // open-end wrench head: a "C" that opens away from the handle
    elbow: '12.4px 20.9px',
    stroke: 3.3,
  },
  // Two-tone: a larger head that sits on the shield's shoulder (the shield is cut out around it).
  twotone: {
    short: 'M8.2 17.6 12.1 21.5',
    long: 'M12.1 21.5 19.59 12.09',
    head: 'M25.55 8.59A3.7 3.7 0 1 1 21.68 5.51', // open-end wrench head: a "C" that opens away from the handle
    elbow: '12.1px 21.5px',
    stroke: 2.8,
    cut: { cx: 21.9, cy: 9.2, r: 6.5 },
  },
  twotoneSmall: {
    short: 'M8 17.2 12 21.2',
    long: 'M12 21.2 19.42 12.21',
    head: 'M25.78 8.76A3.9 3.9 0 1 1 21.6 5.31', // open-end wrench head: a "C" that opens away from the handle
    elbow: '12px 21.2px',
    stroke: 3.3,
    cut: { cx: 21.9, cy: 9.2, r: 7 },
  },
};

export const LOGO_REFINEMENTS = {
  balanced: { name: 'A · Balanced', note: 'Filled shield, white check-wrench, one stroke weight.' },
  twotone: { name: 'B · Two-tone', note: 'The wrench head in saffron, set into the shield’s shoulder.' },
  outline: { name: 'C · Outline', note: 'The shield as an outline, check-wrench in the brand colour.' },
};
export const LOGO_REFINEMENT_IDS = Object.keys(LOGO_REFINEMENTS);

export function geometryFor(refinement, size) {
  const small = size <= 20;
  if (refinement === 'twotone') return small ? GEOMETRY.twotoneSmall : GEOMETRY.twotone;
  return small ? GEOMETRY.small : GEOMETRY.regular;
}


// The chosen refinement (D-021). The other two stay visible at /dev/themes and in
// docs/design/logo-concepts/.
export const LOGO_REFINEMENT = 'twotone';
