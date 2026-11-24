// The header always fits (Batch 6B, Part A, decision D-059). Measured, not guessed: when the window, the
// content (badges, names, language) or the fonts change, the header tries the levels below in order and
// keeps the FIRST one whose row fits (row.scrollWidth <= row.clientWidth). Nothing in the row may shrink
// (CSS flex-shrink: 0), so "does not fit" is always measured and never hidden by squeezing a word to "En…".
//
// Each level is a set of flags written as data attributes on <header> (data-fit-*), which the CSS reads:
//   hint   off   the "Ctrl K" hint next to search
//   accountName off  the name next to the avatar (initials stay; screen readers still hear the name; it is in the menu)
//   tools  menu  Sound and language move into the account menu (visitors: a "More" menu)
//   nav    menu  the links and the account move into the existing mobile menu
//   brand  mark  only the shield, without the words "Digital Labour Marketplace" (signed in: first with the links
//                still in the bar, Batch 8B; the mobile levels show the words again until mobileMark)
//   create off   (visitors) "Create account" (the landing page and the login card have it too)
//   theme  menu  the night-mode button moves into the menu too (the very last step)
// The measuring code writes the attributes directly (before the browser paints); React state mirrors the
// level so the menus can show the moved controls. Everything INSIDE the row is shown or hidden by CSS from
// these attributes only, never by React state: otherwise a re-measure would see what an earlier level
// rendered and could settle on a level that does not fit.
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export const HEADER_LEVELS = Object.freeze({
  user: [
    { name: 'full' },
    { name: 'noHint', hint: 'off' },
    { name: 'noName', hint: 'off', accountName: 'off' },
    { name: 'toolsInMenu', hint: 'off', accountName: 'off', tools: 'menu' },
    // Batch 8B (D-101): before the links leave the bar, the logo keeps only its shield. With the customer's fifth link
    // ("My job requests") the English row needs about 1240 px at toolsInMenu, more than the row ever gets (1200 px).
    { name: 'toolsInMenuMark', hint: 'off', accountName: 'off', tools: 'menu', brand: 'mark' },
    { name: 'mobile', hint: 'off', accountName: 'off', nav: 'menu' },
    { name: 'mobileTools', hint: 'off', accountName: 'off', nav: 'menu', tools: 'menu' },
    { name: 'mobileMark', hint: 'off', accountName: 'off', nav: 'menu', tools: 'menu', brand: 'mark' },
    { name: 'mobileTight', hint: 'off', accountName: 'off', nav: 'menu', tools: 'menu', brand: 'mark', theme: 'menu' },
  ],
  guest: [
    { name: 'full' },
    { name: 'noHint', hint: 'off' },
    { name: 'toolsInMenu', hint: 'off', tools: 'menu' },
    { name: 'guestMark', hint: 'off', tools: 'menu', brand: 'mark' },
    { name: 'noCreate', hint: 'off', tools: 'menu', brand: 'mark', create: 'off' },
    { name: 'guestTight', hint: 'off', tools: 'menu', brand: 'mark', create: 'off', theme: 'menu' },
  ],
});
const FLAGS = ['hint', 'accountName', 'tools', 'nav', 'brand', 'create', 'theme'];
const attr = (flag) => `fit${flag[0].toUpperCase()}${flag.slice(1)}`; // data-fit-hint, data-fit-account-name ...

export function applyLevel(header, level) {
  header.dataset.fit = level.name;
  for (const flag of FLAGS) {
    if (level[flag]) header.dataset[attr(flag)] = level[flag];
    else delete header.dataset[attr(flag)];
  }
}

// The first level whose row fits (no tolerance: 1 px too wide already makes the page scroll); the last
// level if none does.
export function fitLevel(header, row, levels) {
  for (const level of levels) {
    applyLevel(header, level);
    if (row.scrollWidth <= row.clientWidth) return level;
  }
  return levels[levels.length - 1];
}

// headerRef: the <header>; rowRef: the row inside it whose width is limited. `changes`: values that change
// the content (language, text size, role, name). Returns the level in use.
export function useHeaderFit(headerRef, rowRef, kind, changes) {
  const levels = HEADER_LEVELS[kind];
  const [level, setLevel] = useState(levels[0]);
  const measure = useCallback(() => {
    const header = headerRef.current;
    const row = rowRef.current;
    if (!header || !row) return;
    const next = fitLevel(header, row, levels);
    setLevel((old) => (old.name === next.name ? old : next));
  }, [headerRef, rowRef, levels]);

  // before the first paint, and again whenever the content changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(measure, [measure, ...changes]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    // the row's own size changes only with the window (and the scrollbar), never with the level
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => measure()) : null;
    resize?.observe(row);
    // a count badge, a name or a chip appears later (data loads after the first paint)
    const mutation = typeof MutationObserver === 'function' ? new MutationObserver(() => measure()) : null;
    mutation?.observe(row, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    const fonts = typeof document !== 'undefined' ? document.fonts : null;
    fonts?.addEventListener?.('loadingdone', measure);
    return () => {
      resize?.disconnect();
      mutation?.disconnect();
      fonts?.removeEventListener?.('loadingdone', measure);
    };
  }, [rowRef, measure]);

  return level;
}
