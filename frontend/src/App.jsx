import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import AppShell from './components/layout/AppShell';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { GuestOnly, PageLoading, RequireOnboarding, RequireRole } from './routes/guards';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import NotFound from './pages/public/NotFound';
import Onboarding from './pages/onboarding/Onboarding';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerProfileEdit from './pages/worker/WorkerProfileEdit';
import WorkerSkills from './pages/worker/WorkerSkills';
import FindWorkers from './pages/customer/FindWorkers';
import WorkerPublicProfile from './pages/customer/WorkerPublicProfile';
import AdminOverview from './pages/admin/AdminOverview';
import AdminIdentity from './pages/admin/AdminIdentity';
import AdminAudit from './pages/admin/AdminAudit';
import AdminEvidence from './pages/admin/AdminEvidence';

// Style guide only in development builds (not shipped in production).
const StyleGuide = import.meta.env.DEV ? lazy(() => import('./pages/dev/StyleGuide')) : null;

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<GuestOnly />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<RequireRole role="worker" />}>
          <Route path="onboarding" element={<Navigate to="/onboarding/about" replace />} />
          <Route path="onboarding/:step" element={<Onboarding />} />
          <Route element={<RequireOnboarding />}>
            <Route path="worker" element={<WorkerDashboard />} />
            <Route path="worker/profile" element={<WorkerProfileEdit />} />
            <Route path="worker/skills" element={<WorkerSkills />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="customer" />}>
          <Route path="find" element={<FindWorkers />} />
          <Route path="workers/:workerId" element={<WorkerPublicProfile />} />
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="identity" element={<AdminIdentity />} />
            <Route path="evidence" element={<AdminEvidence />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>
        </Route>

        {StyleGuide && (
          <Route path="dev/styleguide" element={<Suspense fallback={<PageLoading />}><StyleGuide /></Suspense>} />
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <AppRoutes />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
