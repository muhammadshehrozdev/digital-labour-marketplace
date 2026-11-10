// Holds the light/dark preference and the text size for the whole app (Batch 4, D-022).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ThemeContext } from './context';
import { changeMode } from './reveal';
import { TEXT_SIZE_KEY, THEME_KEY, applyMode, applyTextSize, darkQuery, isTextSize, isThemePreference, readStored, resolveMode, store } from './mode';

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = readStored(THEME_KEY, isThemePreference);
    return { preference: saved ?? 'system', stored: Boolean(saved), choseThisVisit: false };
  });
  const [mode, setMode] = useState(() => resolveMode(theme.preference));
  const [size, setSize] = useState(() => {
    const saved = readStored(TEXT_SIZE_KEY, isTextSize);
    return { textSize: saved ?? 'normal', textSizeStored: Boolean(saved), choseTextSizeThisVisit: false };
  });
  const modeRef = useRef(mode);

  // First paint: index.html already set the mode; this keeps <html> right in tests and after
  // hot reloads.
  useEffect(() => {
    applyMode(modeRef.current);
  }, []);
  useEffect(() => {
    applyTextSize(size.textSize);
  }, [size.textSize]);

  // fromEvent: a tap or key press (React may redraw at once, so the toggle icon is already the new
  // one when the reveal starts). Changes that come from an effect (account setting after login,
  // the device switching at sunset) must not force a redraw in the middle of React's own work.
  const show = useCallback((next, origin, fromEvent = false) => {
    if (next === modeRef.current) return;
    modeRef.current = next;
    changeMode(() => {
      applyMode(next);
      if (fromEvent) flushSync(() => setMode(next));
      else setMode(next);
    }, origin);
  }, []);

  // byUser: false when the saved account setting is applied after login (not a new choice).
  const setPreference = useCallback(
    (preference, { origin, byUser = true } = {}) => {
      if (!isThemePreference(preference)) return;
      store(THEME_KEY, preference);
      setTheme((current) => ({ preference, stored: true, choseThisVisit: current.choseThisVisit || byUser }));
      show(resolveMode(preference), origin, byUser);
    },
    [show]
  );

  // One tap: light <-> dark (leaves "system").
  const toggle = useCallback((origin) => setPreference(modeRef.current === 'dark' ? 'light' : 'dark', { origin }), [setPreference]);

  // "System": follow the device when it changes (e.g. sunset schedule) while the page is open.
  useEffect(() => {
    if (theme.preference !== 'system') return undefined;
    const media = darkQuery();
    if (!media) return undefined;
    const onChange = () => show(media.matches ? 'dark' : 'light');
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [theme.preference, show]);

  const setTextSize = useCallback((textSize, { byUser = true } = {}) => {
    if (!isTextSize(textSize)) return;
    store(TEXT_SIZE_KEY, textSize);
    setSize((current) => ({ textSize, textSizeStored: true, choseTextSizeThisVisit: current.choseTextSizeThisVisit || byUser }));
  }, []);

  const value = useMemo(() => ({ ...theme, mode, setPreference, toggle, ...size, setTextSize }), [theme, mode, setPreference, toggle, size, setTextSize]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
