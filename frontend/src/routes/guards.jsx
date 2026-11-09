import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/auth';
import { useOnboarding } from '../hooks/useOnboarding';
import { homePathFor } from '../utils/roles';
import { Alert, EmptyState, Skeleton } from '../components/ui';
import { useT } from '../i18n/context';

// These guards are for user experience only. The server checks login and role on every request.

export function PageLoading() {
  const { t } = useT();
  return (
    <div aria-busy="true">
      <span className="visually-hidden" role="status">{t('common.loading')}</span>
      <Skeleton variant="block" height={160} />
    </div>
  );
}

export function RequireRole({ role }) {
  const { user, loading } = useAuth();
  const { t } = useT();
  const location = useLocation();
  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) {
    return (
      <EmptyState
        icon={ShieldAlert}
        headingLevel={1}
        title={t('guards.wrongRoleTitle')}
        description={t('guards.wrongRoleText')}
      />
    );
  }
  return <Outlet />;
}

// Login, Register and the landing page: a logged-in user goes to their own home instead.
export function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (user) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}

// /worker/*: a worker who has not finished onboarding goes to the right step.
export function RequireOnboarding() {
  const { state, error } = useOnboarding();
  const { te } = useT();
  if (error) return <Alert tone="danger">{te(error)}</Alert>;
  if (!state) return <PageLoading />;
  if (!state.complete) return <Navigate to={`/onboarding/${state.nextStep}`} replace />;
  return <Outlet />;
}
