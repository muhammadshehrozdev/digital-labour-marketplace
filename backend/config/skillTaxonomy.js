// ONE source of truth for trade categories (audit M1-16). The frontend reads it
// from GET /api/meta/taxonomy; the backend validates against it.
//
// STATUS: PROVISIONAL (Phase 3). The list is the 8 categories the UI already had,
// plus "Domestic Work" (named in CLAUDE.md and missing from both old lists).
// The team must approve the final category and skill list in Phase 4
// (CLAUDE_CODE_PROMPT.md, C5). Skills, synonyms and tools are added in Phase 4.
//
// iscoCode: the 4-digit ISCO-08 occupation code. Left empty (null) until each code
// is checked against the official ISCO-08 list (C5 rule: never guess a code).

export const TAXONOMY_VERSION = '2026-11-09-provisional';

export const CATEGORIES = Object.freeze([
  { id: 'electrical_solar', label: 'Electrical & Solar', iscoCode: null },
  { id: 'plumbing_sanitary', label: 'Plumbing & Sanitary', iscoCode: null },
  { id: 'construction_masonry', label: 'Construction & Masonry', iscoCode: null },
  { id: 'carpentry_woodwork', label: 'Carpentry & Woodwork', iscoCode: null },
  { id: 'painting_renovation', label: 'Painting & Renovation', iscoCode: null },
  { id: 'ac_appliance_repair', label: 'AC & Appliance Repair', iscoCode: null },
  { id: 'home_maintenance', label: 'Home Maintenance', iscoCode: null },
  { id: 'cleaning_shifting', label: 'Cleaning & Shifting', iscoCode: null },
  { id: 'domestic_work', label: 'Domestic Work', iscoCode: null },
]);

export const CATEGORY_IDS = Object.freeze(CATEGORIES.map((c) => c.id));
export const DEFAULT_CATEGORY_ID = 'home_maintenance';

export const AVAILABILITY = Object.freeze(['Available', 'Busy', 'Offline']);

// Old data stored the label (e.g. "Electrical & Solar"). Accept an id or an old label.
export function categoryIdFrom(value) {
  if (typeof value !== 'string') return null;
  if (CATEGORY_IDS.includes(value)) return value;
  const byLabel = CATEGORIES.find((c) => c.label.toLowerCase() === value.trim().toLowerCase());
  return byLabel ? byLabel.id : null;
}

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? null;
}

// What GET /api/meta/taxonomy sends.
export function publicTaxonomy() {
  return {
    version: TAXONOMY_VERSION,
    status: 'provisional',
    categories: CATEGORIES.map(({ id, label, iscoCode }) => ({ id, label, iscoCode })),
    availability: [...AVAILABILITY],
  };
}
