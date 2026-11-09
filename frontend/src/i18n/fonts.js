// The Urdu Nastaliq font is large (about 156 KB per weight), so it is loaded only when Urdu is
// chosen (dynamic import = a separate file the browser fetches on demand). Only the Arabic-script
// part is loaded; Latin letters and digits keep the normal font. font-display: swap (in the
// package CSS) shows text at once in a fallback font while the font loads.
let urduFont = null;

export function loadUrduFont() {
  urduFont ??= Promise.all([
    import('@fontsource/noto-nastaliq-urdu/arabic-400.css'),
    import('@fontsource/noto-nastaliq-urdu/arabic-700.css'),
  ]).catch(() => {
    urduFont = null; // try again next time; the fallback font is used meanwhile
  });
  return urduFont;
}
