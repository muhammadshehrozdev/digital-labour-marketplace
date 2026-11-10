// Draws the icon set from the logo numbers (src/components/brand/logoGeometry.js) and the default
// theme's colours (src/styles/themes.css), so the files never drift from the React logo.
//   npm run icons          (inside .\frontend)
// Writes: public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png,
//         public/icons/icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png,
//         docs/design/logo/*.svg (the logo versions) and docs/design/logo-concepts/v3-*.svg.
// PNG files are rendered with Chromium through Playwright (already a dev dependency).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { GEOMETRY, SHIELD } from '../src/components/brand/logoGeometry.js';
import { oklchToLinearSrgb } from '../src/utils/contrast.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const docs = resolve(root, '..', 'docs', 'design');

// ---- colours: read the first theme block (the default, Emerald Night) from themes.css ----
const css = readFileSync(resolve(root, 'src/styles/themes.css'), 'utf8');
const firstBlock = css.slice(css.indexOf('{'), css.indexOf('}', css.indexOf('--theme-color')));
function token(name) {
  const m = new RegExp(`--${name}:\\s*(oklch\\([^)]+\\))`).exec(firstBlock);
  if (!m) throw new Error(`Token --${name} not found in themes.css`);
  return hex(m[1]);
}
function hex(oklch) {
  const encode = (c) => {
    const v = Math.min(1, Math.max(0, c));
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(s * 255).toString(16).padStart(2, '0');
  };
  return `#${oklchToLinearSrgb(oklch).map(encode).join('')}`;
}

const C = {
  primary: token('primary-600'),
  primaryLight: token('primary-500'),
  primaryDeep: token('primary-700'),
  accent: token('accent-500'),
  darkBg: token('color-dark-bg'),
  darkBg2: token('color-dark-bg-2'),
  darkPrimary: token('color-dark-primary'),
  darkAccent: token('color-dark-accent'),
  text: token('color-text'),
  white: '#ffffff',
};

// ---- drawing ----
const stroke = (d, colour, width, extra = '') => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

// The mark's inner drawing on the 32 x 32 grid. kind: twotone | balanced | outline | mono.
function mark({ kind = 'twotone', small = false, shield, ink, accent, line, soft, id = 'a', shieldClass = '', inkClass = '' }) {
  if (kind === 'twotone') {
    const g = small ? GEOMETRY.twotoneSmall : GEOMETRY.twotone;
    const cut = `<circle cx="${g.cut.cx}" cy="${g.cut.cy}" r="${g.cut.r}"`;
    return [
      `<defs><mask id="m${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="#fff"/>${cut} fill="#000"/></mask><clipPath id="c${id}">${cut}/></clipPath></defs>`,
      `<path d="${SHIELD}" fill="${shield}" mask="url(#m${id})"${shieldClass}/>`,
      stroke(g.long, ink, g.stroke, inkClass),
      stroke(g.head, accent, g.stroke),
      stroke(g.short, ink, g.stroke, inkClass),
      `<g clip-path="url(#c${id})">${stroke(g.long, accent, g.stroke)}</g>`,
    ].join('');
  }
  const g = small ? GEOMETRY.small : GEOMETRY.regular;
  const strokes = (colour) => stroke(g.long, colour, g.stroke) + stroke(g.head, colour, g.stroke) + stroke(g.short, colour, g.stroke);
  if (kind === 'mono') {
    return `<defs><mask id="m${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32"><rect width="32" height="32" fill="#fff"/>${strokes('#000')}</mask></defs><path d="${SHIELD}" fill="${shield}" mask="url(#m${id})"/>`;
  }
  if (kind === 'outline') {
    return `<path d="${SHIELD}" fill="${soft}" stroke="${line}" stroke-width="${small ? 2.8 : 2.3}" stroke-linejoin="round"/>${strokes(line)}`;
  }
  return `<path d="${SHIELD}" fill="${shield}"/>${strokes(ink)}`;
}

const svg = (inner, { size = 32, label = 'Digital Labour Marketplace', viewBox = '0 0 32 32' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}" role="img" aria-label="${label}">${inner}</svg>\n`;

const onLight = { shield: C.primary, ink: C.white, accent: C.accent, line: C.primary, soft: '#eefaf4' };
const onDark = { shield: C.darkPrimary, ink: C.darkBg, accent: C.darkAccent, line: C.darkPrimary, soft: 'none' };

// Favicon: the bolder small drawing; follows the browser's light or dark tab colour.
function favicon() {
  const style = `<style>.s{fill:${C.primary}}.i{stroke:${C.white}}@media (prefers-color-scheme:dark){.s{fill:${C.darkPrimary}}.i{stroke:${C.darkBg}}}</style>`;
  const inner = mark({ ...onLight, small: true, shieldClass: ' class="s"', inkClass: ' class="i"' });
  return svg(style + inner).replace(' width="32" height="32"', '');
}

// A square tile (apple touch, PWA): dark emerald background, the on-dark mark with a soft highlight.
// scale = how much of the tile the 32-unit drawing fills; radius = corner radius in tile units (0-50).
function tile({ scale, radius }) {
  const offset = (100 - 32 * scale) / 2;
  const g = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.darkBg2}"/><stop offset="1" stop-color="${C.darkBg}"/></linearGradient><radialGradient id="glow" cx="0.82" cy="0.08" r="0.9"><stop offset="0" stop-color="${C.primaryLight}" stop-opacity="0.5"/><stop offset="0.6" stop-color="${C.primaryLight}" stop-opacity="0"/></radialGradient></defs>`;
  const bg = `<rect width="100" height="100" rx="${radius}" fill="url(#bg)"/><rect width="100" height="100" rx="${radius}" fill="url(#glow)"/>`;
  return svg(`${g}${bg}<g transform="translate(${offset} ${offset}) scale(${scale})">${mark({ ...onDark, id: 't' })}</g>`, { viewBox: '0 0 100 100', size: 512 });
}

const files = {
  // the logo versions (D-021)
  [resolve(docs, 'logo/logo-two-tone.svg')]: svg(mark(onLight), { size: 512 }),
  [resolve(docs, 'logo/logo-two-tone-on-dark.svg')]: svg(`<rect width="32" height="32" fill="${C.darkBg}"/><g transform="translate(4 4) scale(0.75)">${mark(onDark)}</g>`, { size: 512 }),
  [resolve(docs, 'logo/logo-one-colour.svg')]: svg(mark({ kind: 'mono', shield: C.text }), { size: 512 }),
  [resolve(docs, 'logo/logo-one-colour-on-dark.svg')]: svg(`<rect width="32" height="32" fill="${C.darkBg}"/><g transform="translate(4 4) scale(0.75)">${mark({ kind: 'mono', shield: C.white })}</g>`, { size: 512 }),
  [resolve(docs, 'logo/logo-small-16.svg')]: svg(mark({ ...onLight, small: true }), { size: 16 }),
  // the three refinements that were compared
  [resolve(docs, 'logo-concepts/v3-A-balanced.svg')]: svg(mark({ ...onLight, kind: 'balanced' }), { size: 512 }),
  [resolve(docs, 'logo-concepts/v3-B-two-tone-chosen.svg')]: svg(mark(onLight), { size: 512 }),
  [resolve(docs, 'logo-concepts/v3-C-outline.svg')]: svg(mark({ ...onLight, kind: 'outline' }), { size: 512 }),
  [resolve(root, 'public/favicon.svg')]: favicon(),
};

const pngs = [
  { file: 'public/favicon-32.png', size: 32, svg: svg(mark({ ...onLight, small: true })), transparent: true },
  { file: 'public/apple-touch-icon.png', size: 180, svg: tile({ scale: 2.0, radius: 0 }) },
  { file: 'public/icons/icon-192.png', size: 192, svg: tile({ scale: 2.05, radius: 22 }), transparent: true },
  { file: 'public/icons/icon-512.png', size: 512, svg: tile({ scale: 2.05, radius: 22 }), transparent: true },
  // maskable: full-bleed background; the mark stays inside the safe zone (the middle 80%)
  { file: 'public/icons/icon-maskable-192.png', size: 192, svg: tile({ scale: 1.7, radius: 0 }) },
  { file: 'public/icons/icon-maskable-512.png', size: 512, svg: tile({ scale: 1.7, radius: 0 }) },
];

for (const [file, content] of Object.entries(files)) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
for (const { file, size, svg: source, transparent } of pngs) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  const sized = source.replace(/ width="\d+" height="\d+"/, ` width="${size}" height="${size}"`);
  await page.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  const target = resolve(root, file);
  mkdirSync(dirname(target), { recursive: true });
  await page.screenshot({ path: target, omitBackground: Boolean(transparent), clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
}
await browser.close();
console.log(`Icons written: ${Object.keys(files).length} SVG files, ${pngs.length} PNG files.`);
