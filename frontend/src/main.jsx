import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (no request to Google at runtime). Urdu Nastaliq is loaded only for Urdu (i18n/fonts.js).
import '@fontsource-variable/manrope';
import '@fontsource-variable/bricolage-grotesque';
import './styles/tokens.css';
import './styles/themes.css';
import './styles/base.css';
import { applyTheme, DEFAULT_THEME } from './styles/theme';
import App from './App.jsx';

applyTheme(DEFAULT_THEME); // the colour theme; light or dark mode is set in index.html and src/theme
// Tells the CSS that JavaScript runs (the scroll-reveal fallback only hides content then).
document.documentElement.classList.add('js-reveal');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
