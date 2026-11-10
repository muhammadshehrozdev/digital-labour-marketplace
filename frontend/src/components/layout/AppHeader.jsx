import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import Logo from '../brand/Logo';
import { Avatar, Button, IconButton } from '../ui';
import { useAuth } from '../../context/auth';
import { useT } from '../../i18n';
import { homePathFor } from '../../utils/roles';
import LanguageSwitcher from './LanguageSwitcher';
import { NAV_LINKS } from './navLinks';
import styles from './AppHeader.module.css';

// Role-aware top navigation: links, language switcher, account menu (D-020).
export default function AppHeader() {
  const { user, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  // Menus remember the page they were opened on, so they close by themselves on navigation.
  const [menuOn, setMenuOn] = useState(null);
  const [accountOn, setAccountOn] = useState(null);
  const menuOpen = menuOn === location.pathname;
  const accountOpen = accountOn === location.pathname;
  const setMenuOpen = (fn) => setMenuOn(fn(menuOpen) ? location.pathname : null);
  const setAccountOpen = (v) => setAccountOn((typeof v === 'function' ? v(accountOpen) : v) ? location.pathname : null);
  const accountRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !accountRef.current?.contains(e.target)) setAccountOn(null);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = user ? NAV_LINKS[user.role] ?? [] : [];
  const linkClass = (base) => ({ isActive }) => [base, isActive && styles.active].filter(Boolean).join(' ');
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={user ? homePathFor(user.role) : '/'} className={styles.brand} aria-label={t('app.home')}>
          <Logo size={34} compact />
        </Link>

        {user && (
          <nav aria-label={t('nav.main')} className={styles.desktopNav}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass(styles.link)}>{t(l.label)}</NavLink>
            ))}
          </nav>
        )}

        <div className={styles.end}>
          <LanguageSwitcher compact />
          {user ? (
            <>
              <div className={styles.account} ref={accountRef}>
                <button type="button" className={styles.accountButton} aria-expanded={accountOpen} aria-controls="account-menu" onClick={() => setAccountOpen((o) => !o)}>
                  <Avatar name={user.name} size="sm" />
                  <span className={styles.accountName} dir="auto">{user.name}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                  <span className="visually-hidden">{t('header.accountMenu')}</span>
                </button>
                {accountOpen && (
                  <div id="account-menu" className={styles.accountMenu}>
                    <p className={styles.signedIn}>
                      {t('header.signedInAs')} <strong>{user.name}</strong>
                      <span>{t(`roles.${user.role}`)} · <span dir="ltr">{user.email}</span></span>
                    </p>
                    <button type="button" className={styles.menuItem} onClick={handleLogout}>
                      <LogOut size={18} aria-hidden="true" /> {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
              <IconButton
                className={styles.menuToggle}
                label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                icon={menuOpen ? X : Menu}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen((o) => !o)}
              />
            </>
          ) : (
            <div className={styles.guest}>
              <Button to="/login" variant="ghost" size="sm">{t('header.login')}</Button>
              <Button to="/register" size="sm" className={styles.createAccount}>{t('header.createAccount')}</Button>
            </div>
          )}
        </div>
      </div>
      {user && menuOpen && (
        <nav id="mobile-menu" aria-label={t('nav.main')} className={styles.mobileNav}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass(styles.mobileLink)}>{t(l.label)}</NavLink>
          ))}
          <p className={styles.mobileSignedIn}>{t('header.signedInAs')} <strong>{user.name}</strong></p>
          <button type="button" className={styles.mobileLink} onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> {t('header.logout')}
          </button>
        </nav>
      )}
    </header>
  );
}
