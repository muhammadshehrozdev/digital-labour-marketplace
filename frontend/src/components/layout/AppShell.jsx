import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import Footer from './Footer';
import styles from './AppShell.module.css';

// Landmarks on every page: header, main (skip-link target), footer.
export default function AppShell({ wide = false }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <AppHeader />
      <main id="main" tabIndex={-1} className={[styles.main, wide && styles.wide].filter(Boolean).join(' ')}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
