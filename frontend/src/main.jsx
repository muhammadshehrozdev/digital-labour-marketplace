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
import { startInstallListening } from './features/app/install/installStore';

applyTheme(DEFAULT_THEME); // the colour theme; light or dark mode is set in index.html and src/theme
// Tells the CSS that JavaScript runs (the scroll-reveal fallback only hides content then).
document.documentElement.classList.add('js-reveal');

// Installable app (Batch 4, feature 6): the service worker caches static files only (public/sw.js).
// Production builds only, so the development server never serves old files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// Batch 6B: keep the browser's install question from the very start (also while the language chooser is
// open), so neither the invitation nor the footer button misses it.
startInstallListening();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
