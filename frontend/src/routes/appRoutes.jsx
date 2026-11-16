// The route tree of the app (also used by the tests with a memory router).
import { lazy, Suspense } from 'react';
import { createRoutesFromElements, Navigate, Route } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import AdminLayout from '../components/layout/AdminLayout';
import { CrashScreen } from '../components/layout/ErrorBoundary';
import { OldSkillsLink, RootLayout } from './RootLayout';
import { GuestOnly, PageLoading, RequireOnboarding, RequireRole } from './guards';
import { lazyPage } from './lazyPage';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import NotFound from '../pages/public/NotFound';
import Onboarding from '../pages/onboarding/Onboarding';
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import WorkerProfileView from '../pages/worker/WorkerProfileView';
import FindWorkers from '../pages/customer/FindWorkers';
import WorkerPublicProfile from '../pages/customer/WorkerPublicProfile';

const WorkerProfileEdit = lazyPage(() => import('../pages/worker/WorkerProfileEdit'));
const Notifications = lazyPage(() => import('../pages/worker/Notifications'));
const SavedWorkers = lazyPage(() => import('../pages/customer/SavedWorkers'));
const CompareWorkers = lazyPage(() => import('../pages/customer/CompareWorkers'));
const HelpCentre = lazyPage(() => import('../pages/public/HelpCentre'));
const VoiceCheck = lazyPage(() => import('../pages/public/VoiceCheck'));
const AdminOverview = lazyPage(() => import('../pages/admin/AdminOverview'));
const AdminIdentity = lazyPage(() => import('../pages/admin/AdminIdentity'));
const AdminAudit = lazyPage(() => import('../pages/admin/AdminAudit'));
const AdminEvidence = lazyPage(() => import('../pages/admin/AdminEvidence'));
const AdminUsers = lazyPage(() => import('../pages/admin/AdminUsers'));
const AdminTemplates = lazyPage(() => import('../pages/admin/AdminTemplates'));
const AdminExports = lazyPage(() => import('../pages/admin/AdminExports'));

// Developer pages only in development builds (not shipped in production).
const StyleGuide = import.meta.env.DEV ? lazy(() => import('../pages/dev/StyleGuide')) : null;
const ThemeLab = import.meta.env.DEV ? lazy(() => import('../pages/dev/ThemeLab')) : null;

// One route tree for the app and the tests. A data router (createBrowserRouter) is used for
// useBlocker ("You have unsaved changes", D-020) and View Transitions on page changes.
export const appRoutes = (
  <Route element={<RootLayout />} errorElement={<CrashScreen />}>
      <Route element={<AppShell />}>
        <Route path="help" element={<HelpCentre />} />
        <Route path="voice-check" element={<VoiceCheck />} />
        <Route element={<GuestOnly />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<RequireRole role="worker" />}>
          <Route path="onboarding" element={<Navigate to="/onboarding/about" replace />} />
          <Route path="onboarding/:step" element={<Onboarding />} />
          <Route path="notifications" element={<Notifications />} />
          <Route element={<RequireOnboarding />}>
            <Route path="worker" element={<WorkerDashboard />} />
            <Route path="worker/profile" element={<WorkerProfileView />} />
            <Route path="worker/profile/edit" element={<WorkerProfileEdit />} />
            <Route path="worker/skills" element={<OldSkillsLink />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="customer" />}>
          <Route path="find" element={<FindWorkers />} />
          <Route path="workers/:workerId" element={<WorkerPublicProfile />} />
          <Route path="saved" element={<SavedWorkers />} />
          <Route path="compare" element={<CompareWorkers />} />
        </Route>

        <Route element={<RequireRole role="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="identity" element={<AdminIdentity />} />
            <Route path="evidence" element={<AdminEvidence />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="exports" element={<AdminExports />} />
          </Route>
        </Route>

        {StyleGuide && (
          <Route path="dev/styleguide" element={<Suspense fallback={<PageLoading />}><StyleGuide /></Suspense>} />
        )}
        {ThemeLab && (
          <Route path="dev/themes" element={<Suspense fallback={<PageLoading />}><ThemeLab /></Suspense>} />
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
  </Route>
);

export const createAppRoutes = () => createRoutesFromElements(appRoutes);
