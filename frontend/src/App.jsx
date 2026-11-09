import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { LanguageProvider } from './i18n';
import { createAppRoutes } from './routes/appRoutes';

export default function App() {
  const [router] = useState(() => createBrowserRouter(createAppRoutes()));
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </LanguageProvider>
  );
}
