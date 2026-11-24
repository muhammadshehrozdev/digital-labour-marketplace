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
// Module 4 (Batch 6): bookings, reviews and reputation
const RequestWorker = lazyPage(() => import('../pages/customer/RequestWorker'));
const MyBookings = lazyPage(() => import('../pages/customer/MyBookings'));
const RateWork = lazyPage(() => import('../pages/customer/RateWork'));
const BookingDetail = lazyPage(() => import('../pages/booking/BookingDetail'));
const Requests = lazyPage(() => import('../pages/worker/Requests'));
const MyJobs = lazyPage(() => import('../pages/worker/MyJobs'));
const MyReviews = lazyPage(() => import('../pages/worker/MyReviews'));
const MyReputation = lazyPage(() => import('../pages/worker/MyReputation'));
const AdminBookings = lazyPage(() => import('../pages/admin/AdminBookings'));
const AdminDisputes = lazyPage(() => import('../pages/admin/AdminDisputes'));
const AdminReviews = lazyPage(() => import('../pages/admin/AdminReviews'));
const AdminFlags = lazyPage(() => import('../pages/admin/AdminFlags'));
// Module 5 (Batch 7)
const MyEarnings = lazyPage(() => import('../pages/worker/MyEarnings'));
const PriceInfo = lazyPage(() => import('../pages/wage/PriceInfo'));
const PaymentRecord = lazyPage(() => import('../pages/wage/PaymentRecord'));
const AdminPriceGuide = lazyPage(() => import('../pages/admin/AdminPriceGuide'));
const AdminPayments = lazyPage(() => import('../pages/admin/AdminPayments'));
// Module 6 (Batch 8B): job requests
const MyJobRequests = lazyPage(() => import('../pages/jobs/MyJobRequests'));
const DescribeJob = lazyPage(() => import('../pages/jobs/DescribeJob'));
const JobRequestPage = lazyPage(() => import('../pages/jobs/JobRequestPage'));
const EditJobRequest = lazyPage(() => import('../pages/jobs/EditJobRequest'));
const JobWorkers = lazyPage(() => import('../pages/jobs/JobWorkers'));

// Developer pages only in development builds (not shipped in production).
const StyleGuide = import.meta.env.DEV ? lazy(() => import('../pages/dev/StyleGuide')) : null;
const ClipRecorder = import.meta.env.DEV ? lazy(() => import('../pages/dev/ClipRecorder')) : null;
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
          <Route element={<RequireOnboarding />}>
            <Route path="worker" element={<WorkerDashboard />} />
            <Route path="worker/profile" element={<WorkerProfileView />} />
            <Route path="worker/profile/edit" element={<WorkerProfileEdit />} />
            <Route path="worker/skills" element={<OldSkillsLink />} />
            <Route path="worker/requests" element={<Requests />} />
            <Route path="worker/jobs" element={<MyJobs />} />
            <Route path="worker/jobs/:id" element={<BookingDetail />} />
            <Route path="worker/reviews" element={<MyReviews />} />
            <Route path="worker/reputation" element={<MyReputation />} />
            <Route path="worker/earnings" element={<MyEarnings />} />
            <Route path="worker/jobs/:id/payment-record" element={<PaymentRecord />} />
          </Route>
        </Route>

        {/* Module 4: booking and review notifications are for customers too */}
        <Route element={<RequireRole role={['worker', 'customer']} />}>
          <Route path="notifications" element={<Notifications />} />
          {/* Module 5: price information for workers and customers */}
          <Route path="prices" element={<PriceInfo />} />
        </Route>

        <Route element={<RequireRole role="customer" />}>
          <Route path="find" element={<FindWorkers />} />
          <Route path="workers/:workerId" element={<WorkerPublicProfile />} />
          <Route path="saved" element={<SavedWorkers />} />
          <Route path="compare" element={<CompareWorkers />} />
          <Route path="workers/:workerId/request" element={<RequestWorker />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="bookings/:id/rate" element={<RateWork />} />
          <Route path="bookings/:id/payment-record" element={<PaymentRecord />} />
          {/* Module 6: the customer's job requests (workers never see a list of jobs) */}
          <Route path="job-requests" element={<MyJobRequests />} />
          <Route path="job-requests/new" element={<DescribeJob />} />
          <Route path="job-requests/:id" element={<JobRequestPage />} />
          <Route path="job-requests/:id/edit" element={<EditJobRequest />} />
          <Route path="job-requests/:id/workers" element={<JobWorkers />} />
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
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="flags" element={<AdminFlags />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="price-guide" element={<AdminPriceGuide />} />
          </Route>
        </Route>

        {StyleGuide && (
          <Route path="dev/styleguide" element={<Suspense fallback={<PageLoading />}><StyleGuide /></Suspense>} />
        )}
        {ThemeLab && (
          <Route path="dev/themes" element={<Suspense fallback={<PageLoading />}><ThemeLab /></Suspense>} />
        )}
        {ClipRecorder && (
          <Route path="dev/recorder" element={<Suspense fallback={<PageLoading />}><ClipRecorder /></Suspense>} />
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
  </Route>
);

export const createAppRoutes = () => createRoutesFromElements(appRoutes);
