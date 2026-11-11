// Logo v3 (Batch 4, D-021): the Batch 1 shield + wrench + check, refined.
import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import Logo, { LogoMark } from '../components/brand/Logo';
import { LanguageProvider } from '../i18n';
import { GEOMETRY, LOGO_REFINEMENT, LOGO_REFINEMENT_IDS, geometryFor } from '../components/brand/logoGeometry';

const pub = (file) => resolve(process.cwd(), 'public', file);

describe('logo', () => {
  test('the chosen refinement is one of the three that were compared', () => {
    expect(LOGO_REFINEMENT_IDS).toEqual(['balanced', 'twotone', 'outline']);
    expect(LOGO_REFINEMENT).toBe('twotone');
  });

  test('small sizes (20 px and below) use the bolder drawing', () => {
    expect(geometryFor('twotone', 16)).toBe(GEOMETRY.twotoneSmall);
    expect(geometryFor('twotone', 24)).toBe(GEOMETRY.twotone);
    expect(geometryFor('balanced', 20)).toBe(GEOMETRY.small);
    expect(geometryFor('outline', 32)).toBe(GEOMETRY.regular);
    expect(GEOMETRY.twotoneSmall.stroke).toBeGreaterThan(GEOMETRY.twotone.stroke);
  });

  test('the mark is decorative next to the wordmark and named when it stands alone', () => {
    const { container, rerender } = render(<Logo />);
    expect(screen.getByText('Digital Labour Marketplace')).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    rerender(<Logo variant="mark" />);
    expect(screen.getByRole('img', { name: 'Digital Labour Marketplace' })).toBeInTheDocument();
  });

  test('colours come from theme tokens (so the mark follows light and dark mode), never fixed hex', () => {
    const { container } = render(<LogoMark size={32} />);
    const html = container.innerHTML;
    expect(html).toContain('var(--logo-flat)');
    expect(html).toContain('var(--logo-accent)');
    expect(html).not.toMatch(/(fill|stroke)="#(?!fff"|000")/); // only the mask uses black and white
  });

  test('one-colour version: the shield in currentColor with the check-wrench cut out', () => {
    const { container } = render(<LogoMark size={32} mono />);
    expect(container.querySelector('path[fill="currentColor"]')).toHaveAttribute('mask');
    expect(container.innerHTML).not.toContain('--logo-accent');
  });

  test('depth (gradient) only on the large hero size; small sizes stay flat', () => {
    expect(render(<LogoMark size={32} />).container.querySelector('linearGradient')).toBeNull();
    expect(render(<LogoMark size={128} />).container.querySelector('linearGradient')).not.toBeNull();
  });

  test('the animated version adds the outline that draws; the static one does not', () => {
    expect(render(<LogoMark size={44} animated />).container.querySelector('path[pathLength="1"][fill="none"]:first-of-type')).not.toBeNull();
    expect(render(<LogoMark size={44} />).container.querySelectorAll('path[d^="M16 2.3"]')).toHaveLength(1);
  });
});

describe('icon set (made by npm run icons)', () => {
  test.each(['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png'])('%s exists', (file) => {
    expect(existsSync(pub(file))).toBe(true);
  });

  test('PNG icons have the size their name says', () => {
    const size = (file) => { const b = readFileSync(pub(file)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
    expect(size('favicon-32.png')).toEqual([32, 32]);
    expect(size('apple-touch-icon.png')).toEqual([180, 180]);
    expect(size('icons/icon-192.png')).toEqual([192, 192]);
    expect(size('icons/icon-512.png')).toEqual([512, 512]);
    expect(size('icons/icon-maskable-512.png')).toEqual([512, 512]);
  });

  test('the favicon is the same drawing as the React logo and adapts to a dark browser', () => {
    const svg = readFileSync(pub('favicon.svg'), 'utf8');
    expect(svg).toContain(GEOMETRY.twotoneSmall.head);
    expect(svg).toContain('prefers-color-scheme:dark');
  });

  test('index.html links the icons', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toContain('href="/favicon.svg"');
    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
  });
});

// The team's request after Batch 4: "Digital Labour Marketplace" in one weight and one colour everywhere
// (before, "Marketplace" was lighter, grey, and hidden on phones).
describe('wordmark: one name, one weight, one colour', () => {
  const NAMES = { en: 'Digital Labour Marketplace', ur: 'ڈیجیٹل لیبر مارکیٹ پلیس', 'ur-Latn': 'Digital Labour Marketplace' };
  for (const [lang, name] of Object.entries(NAMES)) {
    test(`${lang}: the whole name is one element with no inner parts, on light and dark surfaces`, async () => {
      for (const tone of ['light', 'dark']) {
        const { container, unmount } = render(<LanguageProvider initialLanguage={lang}><Logo tone={tone} /></LanguageProvider>);
        // Urdu and Roman Urdu dictionaries load on demand
        await waitFor(() => expect(container.querySelector('[data-wordmark]')?.textContent).toBe(name));
        const words = container.querySelectorAll('[data-wordmark]');
        expect(words).toHaveLength(1);
        expect(words[0].children).toHaveLength(0);
        unmount();
      }
    });
  }

  test('the stylesheet gives the wordmark one weight, the surface colour, and never hides part of it', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/components/brand/Logo.module.css'), 'utf8');
    const rule = css.match(/\.wordmark \{([\s\S]*?)\n\}/)[1];
    expect(rule).toMatch(/font-weight:\s*700/);
    expect(rule).toMatch(/color:\s*inherit/);
    expect(css).not.toMatch(/\.(primary|secondary)\b/);
    expect(css.match(/font-weight/g)).toHaveLength(1); // no other weight anywhere in the logo
  });
});
