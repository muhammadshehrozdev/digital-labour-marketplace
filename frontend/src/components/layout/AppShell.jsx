import { Outlet, useLocation } from 'react-router-dom';
import { useT } from '../../i18n';
import AppHeader from './AppHeader';
import Footer from './Footer';
import AppCommands from '../../features/app/AppCommands';
import InstallHint from '../../features/app/InstallHint';
import OfflineBanner from '../../features/app/OfflineBanner';
import ScrollTop from '../../features/app/ScrollTop';
import SessionWatch from '../../features/app/SessionWatch';
import styles from './AppShell.module.css';

// Landmarks on every page: header, main (skip-link target), footer.
// The landing page is full width (its sections set their own width).
export default function AppShell() {
  const { t } = useT();
  const { pathname } = useLocation();
  const wide = pathname === '/';
  const admin = pathname.startsWith('/admin'); // tables and charts need more room
  return (
    <>
      {/* the skip link is always the first thing a keyboard reaches (feature 3) */}
      <a href="#main" className="skip-link">{t('app.skipToContent')}</a>
      <OfflineBanner />
      <AppHeader />
      <main id="main" tabIndex={-1} className={[styles.main, wide && styles.wide, admin && styles.admin].filter(Boolean).join(' ')}>
        <Outlet />
      </main>
      <Footer />
      <ScrollTop />
      <InstallHint />
      <SessionWatch />
      <AppCommands />
    </>
  );
}
