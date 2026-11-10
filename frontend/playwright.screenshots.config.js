// npm run screenshots: every main screen, every language, at 360 / 768 / 1280 px, saved to
// docs/design/screenshots/all/ (not committed; a curated set is copied to docs/design/screenshots/).
// Same servers and e2e database as the e2e tests.
import base from './playwright.config.js';

export default {
  ...base,
  testMatch: '**/*.shots.js',
  timeout: 15 * 60_000,
  use: { ...base.use, screenshot: 'off' },
};
