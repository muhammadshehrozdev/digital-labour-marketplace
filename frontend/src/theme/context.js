import { createContext, useContext } from 'react';
import { resolveMode } from './mode';

// Outside a provider (small component tests): light mode, nothing saved.
const noop = () => {};
const FALLBACK = {
  preference: 'system', mode: resolveMode('light'), stored: false, choseThisVisit: false, setPreference: noop, toggle: noop,
  textSize: 'normal', textSizeStored: false, choseTextSizeThisVisit: false, setTextSize: noop,
};

export const ThemeContext = createContext(FALLBACK);

// { preference, mode, setPreference(pref, { origin, byUser }), toggle(origin), textSize, setTextSize(size) }
export const useTheme = () => useContext(ThemeContext);
