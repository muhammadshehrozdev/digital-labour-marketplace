import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createAppRoutes } from '../routes/appRoutes';
import { LanguageProvider } from '../i18n';
import { ThemeProvider } from '../theme';

// The same route tree as the app, in a memory router (data router, like the app).
let router = null;
export const pathname = () => router?.state.location.pathname ?? '';
export const currentSearch = () => router?.state.location.search ?? '';

// language: the website language for this test (default English, as if already chosen).
// Pass language: null to start like a first visit (the language chooser is shown).
export function renderAt(path, { language = 'en' } = {}) {
  router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  return render(
    <ThemeProvider>
      <LanguageProvider initialLanguage={language ?? undefined}>
        <RouterProvider router={router} />
      </LanguageProvider>
    </ThemeProvider>
  );
}
