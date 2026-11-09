// The three colour themes of design v2 (Batch 3, D-017). To use another default, change the
// DEFAULT_THEME line. The theme lab (/dev/themes, development only) switches them live.
export const THEMES = [
  { id: 'emerald-night', name: 'Emerald Night', description: 'Deep green-black, vivid emerald, saffron highlights.' },
  { id: 'ink-marigold', name: 'Ink & Marigold', description: 'Deep ink-navy, marigold and coral accents, cool light surfaces.' },
  { id: 'terracotta-craft', name: 'Terracotta Craft', description: 'Warm clay, cream surfaces, deep teal.' },
];

export const DEFAULT_THEME = 'emerald-night';

export function applyTheme(id) {
  const theme = THEMES.some((t) => t.id === id) ? id : DEFAULT_THEME;
  document.documentElement.dataset.theme = theme;
  // The browser bar colour (mobile) follows the theme's dark section colour.
  const value = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && value) meta.setAttribute('content', value);
  return theme;
}
