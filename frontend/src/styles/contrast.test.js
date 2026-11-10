// WCAG 2.2 AA contrast for every colour pair used for text or UI parts, in every theme and in
// both modes, light and dark (Batch 3 D-017, Batch 4 D-022). Reads the real themes.css, so a
// colour change that breaks contrast fails this test. OKLCH values are converted with the OKLab formulas in utils/contrast.js.
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { contrastRatio, inSrgbGamut, relativeLuminance } from '../utils/contrast';
import { AVATAR_COLORS } from '../utils/avatarColor';
import { THEMES, DEFAULT_THEME } from './theme';

// Vitest runs from the frontend folder.
const css = readFileSync(resolvePath(process.cwd(), 'src/styles/themes.css'), 'utf8');
// One entry per theme and mode: "emerald-night" (light) and "emerald-night (dark)". The dark block
// only overrides tokens, so its full set is the light set with the dark values on top.
const THEME_TOKENS = {};
const DARK_NAMES = [];
for (const [, name, darkMode, body] of css.matchAll(/data-theme='([a-z-]+)'\](\[data-mode='dark'\])?\s*\{([\s\S]*?)\n\}/g)) {
  const tokens = {};
  for (const [, key, value] of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) tokens[key] = value.trim();
  if (darkMode) {
    THEME_TOKENS[`${name} (dark)`] = { ...THEME_TOKENS[name], ...tokens };
    DARK_NAMES.push(name);
  } else {
    THEME_TOKENS[name] = tokens;
  }
}

function resolver(tokens) {
  return (name) => {
    let v = tokens[name];
    for (let i = 0; i < 5 && v && v.startsWith('var('); i += 1) v = tokens[v.slice(6, -1)];
    if (!v || !/^(#[0-9A-Fa-f]{6}|oklch\([^/)]*\))$/.test(v)) throw new Error(`--${name} is not a plain colour (${v})`);
    return v;
  };
}

const TEXT = 4.5;
const UI = 3.0;
// [foreground, background, minimum, where it is used]
const PAIRS = [
  ['color-text', 'color-surface', TEXT, 'body text on cards'],
  ['color-text', 'color-bg', TEXT, 'body text on the page'],
  ['color-text', 'color-surface-muted', TEXT, 'text on muted panels'],
  ['color-text', 'color-bg-subtle', TEXT, 'text on tinted bands'],
  ['color-text', 'color-surface-elevated', TEXT, 'text in menus, dialogs and toasts'],
  ['color-text-secondary', 'color-surface-elevated', TEXT, 'secondary text in menus and dialogs'],
  ['color-primary', 'color-surface-elevated', TEXT, 'links in menus and dialogs'],
  ['color-primary-text', 'color-surface', TEXT, 'emphasised brand text on cards'],
  ['color-accent-text', 'color-surface', TEXT, 'accent text on cards'],
  ['color-success', 'color-surface', TEXT, 'success text on cards'],
  ['color-warning', 'color-surface', TEXT, 'warning text on cards'],
  ['color-info', 'color-surface', TEXT, 'info text on cards'],
  ['color-text-secondary', 'color-surface', TEXT, 'secondary text on cards'],
  ['color-text-secondary', 'color-bg', TEXT, 'secondary text on the page'],
  ['color-text-secondary', 'color-surface-muted', TEXT, 'secondary text on muted panels'],
  ['color-text-secondary', 'color-bg-subtle', TEXT, 'secondary text on tinted bands'],
  ['color-text-muted', 'color-surface', TEXT, 'placeholders and captions'],
  ['color-text-muted', 'color-bg', TEXT, 'captions on the page'],
  ['color-on-primary', 'color-primary', TEXT, 'primary button'],
  ['color-on-primary', 'color-primary-hover', TEXT, 'primary button hover'],
  ['color-on-primary', 'color-primary-pressed', TEXT, 'primary button pressed'],
  ['color-on-primary', 'color-danger', TEXT, 'danger button'],
  ['color-primary', 'color-surface', TEXT, 'links and secondary buttons'],
  ['color-primary', 'color-bg', TEXT, 'links on the page'],
  ['color-primary-text', 'color-primary-soft', TEXT, 'primary chips, selected cards'],
  ['color-primary-text', 'color-primary-soft-strong', TEXT, 'matched-word chips'],
  ['color-on-secondary', 'color-secondary', TEXT, 'secondary solid surfaces'],
  ['color-secondary-text', 'color-secondary-soft', TEXT, 'secondary chips'],
  ['color-secondary-text', 'color-surface', TEXT, 'secondary text links'],
  ['color-on-accent', 'color-accent', TEXT, 'accent highlight with text'],
  ['color-accent-text', 'color-accent-soft', TEXT, 'accent badges'],
  ['color-text', 'color-accent-soft', TEXT, 'text on accent badges'],
  ['color-success', 'color-success-soft', TEXT, 'success alert / chip'],
  ['color-warning', 'color-warning-soft', TEXT, 'warning alert / chip'],
  ['color-danger', 'color-danger-soft', TEXT, 'danger alert / chip'],
  ['color-info', 'color-info-soft', TEXT, 'info alert / chip'],
  ['color-danger', 'color-surface', TEXT, 'field error text'],
  ['color-on-dark', 'color-dark-bg', TEXT, 'text in the hero and footer'],
  ['color-on-dark', 'color-dark-bg-2', TEXT, 'text in dark sections (lighter end)'],
  ['color-on-dark', 'color-dark-surface', TEXT, 'text on cards inside dark sections'],
  ['color-on-dark-muted', 'color-dark-bg', TEXT, 'secondary text in dark sections'],
  ['color-on-dark-muted', 'color-dark-surface', TEXT, 'secondary text on dark cards'],
  ['color-dark-primary', 'color-dark-bg', TEXT, 'highlighted words in the hero'],
  ['color-dark-accent', 'color-dark-bg', TEXT, 'accent words in the hero'],
  ['color-dark-primary', 'color-dark-surface', TEXT, 'links on dark cards'],
  ['color-border-input', 'color-surface', UI, 'input, checkbox and radio borders'],
  ['color-border-input', 'color-surface-elevated', UI, 'input borders inside dialogs'],
  ['color-focus', 'color-surface-elevated', UI, 'focus outline in menus and dialogs'],
  ['color-focus', 'color-surface', UI, 'focus outline on cards'],
  ['color-focus', 'color-bg', UI, 'focus outline on the page'],
  ['color-focus-on-dark', 'color-dark-bg', UI, 'focus outline in dark sections'],
  ['color-primary', 'color-surface', UI, 'checked checkbox / switch / progress'],
];

describe('themes exist', () => {
  test('themes.css defines exactly the themes listed in theme.js, each with a dark mode, and the default is one of them', () => {
    const ids = THEMES.map((t) => t.id).sort();
    expect(Object.keys(THEME_TOKENS).filter((k) => !k.endsWith('(dark)')).sort()).toEqual(ids);
    expect(DARK_NAMES.sort()).toEqual(ids);
    expect(ids).toContain(DEFAULT_THEME);
  });

  test.each(DARK_NAMES)('%s: dark mode is really dark (page darker than its text) and has three elevation levels', (name) => {
    const resolve = resolver(THEME_TOKENS[`${name} (dark)`]);
    const L = (token) => relativeLuminance(resolve(token));
    expect(L('color-bg')).toBeLessThan(L('color-surface'));
    expect(L('color-surface')).toBeLessThan(L('color-surface-elevated'));
    expect(L('color-text')).toBeGreaterThan(L('color-bg') * 10);
  });

  test.each(Object.keys(THEME_TOKENS))('%s defines every role used in the pairs', (theme) => {
    const resolve = resolver(THEME_TOKENS[theme]);
    for (const [fg, bg] of PAIRS) {
      expect(() => resolve(fg)).not.toThrow();
      expect(() => resolve(bg)).not.toThrow();
    }
  });

  test.each(Object.keys(THEME_TOKENS))('%s: every colour is inside the sRGB gamut (so the contrast maths is exact)', (theme) => {
    const out = Object.entries(THEME_TOKENS[theme])
      .filter(([, v]) => /^oklch\([^/)]*\)$/.test(v))
      .filter(([, v]) => !inSrgbGamut(v))
      .map(([k, v]) => `${k}: ${v}`);
    expect(out).toEqual([]);
  });
});

describe.each(Object.keys(THEME_TOKENS))('colour contrast (WCAG 2.2 AA) in %s', (theme) => {
  const resolve = resolver(THEME_TOKENS[theme]);
  test.each(PAIRS)('%s on %s >= %s:1 (%s)', (fg, bg, min) => {
    expect(contrastRatio(resolve(fg), resolve(bg))).toBeGreaterThanOrEqual(min);
  });
});

describe('contrast maths', () => {
  test.each(AVATAR_COLORS.map((c) => [c.fg, c.bg]))('avatar %s on %s >= 4.5:1', (fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(TEXT);
  });

  test('known values: black/white 21:1, same colour 1:1, the Batch 1 green #0F6B54 on white 6.46:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#0F6B54', '#0F6B54')).toBe(1);
    expect(contrastRatio('#0F6B54', '#FFFFFF')).toBeCloseTo(6.46, 2);
  });

  test('OKLCH conversion: oklch(1 0 0) is white and oklch(0 0 0) is black', () => {
    expect(contrastRatio('oklch(1 0 0)', '#FFFFFF')).toBeCloseTo(1, 3);
    expect(contrastRatio('oklch(0 0 0)', '#000000')).toBeCloseTo(1, 3);
    expect(contrastRatio('oklch(0 0 0)', 'oklch(1 0 0)')).toBeCloseTo(21, 2);
  });

  test('a colour outside sRGB is detected (very saturated green)', () => {
    expect(inSrgbGamut('oklch(0.52 0.2 162)')).toBe(false);
    expect(inSrgbGamut('oklch(0.52 0.1 162)')).toBe(true);
  });
});
