// WCAG 2.2 contrast ratio (relative luminance formula). No package needed.
// Colours can be hex (#RRGGBB) or oklch(L C H) (L as 0-1 or %, C as a number, H in degrees),
// the format of the Batch 3 themes. OKLCH -> OKLab -> linear sRGB uses the published OKLab
// matrices (Björn Ottosson, 2020), the same maths the browser uses.

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function hexToLinear(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => srgbToLinear(parseInt(value.slice(i, i + 2), 16) / 255));
}

// Returns linear-light sRGB [r, g, b]; values outside 0..1 mean "outside the sRGB gamut".
export function oklchToLinearSrgb(text) {
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i.exec(text.trim());
  if (!m) throw new Error(`Not an oklch() colour: ${text}`);
  const L = m[2] ? Number(m[1]) / 100 : Number(m[1]);
  const C = Number(m[3]);
  const h = (Number(m[4]) * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
}

export function toLinearSrgb(colour) {
  return colour.trim().startsWith('#') ? hexToLinear(colour) : oklchToLinearSrgb(colour);
}

// True when the colour can be shown exactly on a normal (sRGB) screen.
export const inSrgbGamut = (colour, epsilon = 0.002) => toLinearSrgb(colour).every((c) => c >= -epsilon && c <= 1 + epsilon);

export function relativeLuminance(colour) {
  const [r, g, b] = toLinearSrgb(colour).map((c) => Math.min(1, Math.max(0, c)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
