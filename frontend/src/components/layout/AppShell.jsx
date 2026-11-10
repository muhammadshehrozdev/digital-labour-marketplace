import { Outlet, useLocation } from 'react-router-dom';
import { useT } from '../../i18n';
import AppHeader from './AppHeader';
import Footer from './Footer';
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
      <a href="#main" className="skip-link">{t('app.skipToContent')}</a>
      <AppHeader />
      <main id="main" tabIndex={-1} className={[styles.main, wide && styles.wide, admin && styles.admin].filter(Boolean).join(' ')}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
