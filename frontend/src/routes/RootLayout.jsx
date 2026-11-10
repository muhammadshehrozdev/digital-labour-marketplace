// The top of the route tree: providers that need the router, scroll restoration, and the
// redirect for the old /worker/skills link.
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/ui';
import { LanguageSync } from '../i18n';
import { ThemeSync } from '../theme';
import LanguageGate from './LanguageGate';

// Old link /worker/skills(?proof=<skillId>) now opens the profile editor (D-020).
export function OldSkillsLink() {
  const { search } = useLocation();
  const proof = new URLSearchParams(search).get('proof');
  const target = proof ? `/worker/profile/edit?section=proof&skill=${encodeURIComponent(proof)}` : '/worker/profile/edit?section=skills';
  return <Navigate to={target} replace />;
}

// Everything that needs the router. The LanguageProvider sits above it (see App and the tests).
function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <LanguageSync />
        <ThemeSync />
        <LanguageGate>{children}</LanguageGate>
      </AuthProvider>
    </ToastProvider>
  );
}

export function RootLayout() {
  return (
    <Providers>
      <ScrollRestoration />
      <Outlet />
    </Providers>
  );
}
