// WCAG 2.2 AA contrast for every token pair used for text or for UI parts (D-010).
// Reads the real tokens.css, so a colour change that breaks contrast fails this test.
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { contrastRatio } from '../utils/contrast';
import { AVATAR_COLORS } from '../utils/avatarColor';

// Vitest runs from the frontend folder.
const css = readFileSync(resolvePath(process.cwd(), 'src/styles/tokens.css'), 'utf8');
const tokens = {};
for (const [, name, value] of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) tokens[name] = value.trim();
const resolve = (name) => {
  let v = tokens[name];
  for (let i = 0; i < 5 && v && v.startsWith('var('); i += 1) v = tokens[v.slice(6, -1)];
  if (!/^#[0-9A-Fa-f]{6}$/.test(v ?? '')) throw new Error(`Token --${name} is not a hex colour (${v})`);
  return v;
};

// [foreground, background, minimum ratio, where it is used]
const TEXT = 4.5;
const UI = 3.0;
const PAIRS = [
  ['color-text', 'color-surface', TEXT, 'body text on cards'],
  ['color-text', 'color-bg', TEXT, 'body text on the page'],
  ['color-text', 'color-surface-muted', TEXT, 'text on muted panels'],
  ['color-text-secondary', 'color-surface', TEXT, 'secondary text on cards'],
  ['color-text-secondary', 'color-bg', TEXT, 'secondary text on the page'],
  ['color-text-secondary', 'color-surface-muted', TEXT, 'secondary text on muted panels'],
  ['color-on-primary', 'color-primary', TEXT, 'primary button'],
  ['color-on-primary', 'color-primary-hover', TEXT, 'primary button hover'],
  ['color-on-primary', 'color-primary-pressed', TEXT, 'primary button pressed'],
  ['color-on-primary', 'color-danger', TEXT, 'danger button'],
  ['color-primary', 'color-surface', TEXT, 'links and secondary buttons'],
  ['color-primary', 'color-bg', TEXT, 'links on the page'],
  ['color-primary-text', 'color-primary-soft', TEXT, 'primary chips, selected cards'],
  ['color-primary-text', 'color-primary-soft-strong', TEXT, 'matched-word chips'],
  ['color-text', 'color-accent-soft', TEXT, '"Coming next" badge (stone-900 on saffron-100)'],
  ['color-success', 'color-success-soft', TEXT, 'success alert / chip'],
  ['color-warning', 'color-warning-soft', TEXT, 'warning alert / chip'],
  ['color-danger', 'color-danger-soft', TEXT, 'danger alert / chip'],
  ['color-info', 'color-info-soft', TEXT, 'info alert / chip'],
  ['color-danger', 'color-surface', TEXT, 'field error text'],
  ['color-border-input', 'color-surface', UI, 'input, checkbox and radio borders'],
  ['color-focus', 'color-surface', UI, 'focus outline on cards'],
  ['color-focus', 'color-bg', UI, 'focus outline on the page'],
  ['color-primary', 'color-surface', UI, 'checked checkbox / switch / progress'],
];

describe('colour contrast (WCAG 2.2 AA)', () => {
  test.each(PAIRS)('%s on %s >= %s:1 (%s)', (fg, bg, min) => {
    expect(contrastRatio(resolve(fg), resolve(bg))).toBeGreaterThanOrEqual(min);
  });

  test.each(AVATAR_COLORS.map((c) => [c.fg, c.bg]))('avatar %s on %s >= 4.5:1', (fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(TEXT);
  });

  test('the formula gives the known values: black/white 21:1, same colour 1:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#0F6B54', '#0F6B54')).toBe(1);
  });

  test("the brief's focus colour primary-300 alone would fail 3:1 (why D-010 adds a primary-600 outline)", () => {
    expect(contrastRatio(resolve('green-300'), resolve('stone-0'))).toBeLessThan(UI);
  });

  test('palette values are exactly the brief (BATCH_1_PROMPT.md 3.3)', () => {
    expect([resolve('green-600'), resolve('saffron-500'), resolve('stone-900'), resolve('danger-700')])
      .toEqual(['#0F6B54', '#F2A93B', '#1A1815', '#B42318']);
  });
});
