import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import Logo from '../brand/Logo';
import { Avatar, Button, IconButton } from '../ui';
import { useAuth } from '../../context/auth';
import { homePathFor } from '../../utils/roles';
import { NAV_LINKS } from './navLinks';
import styles from './AppHeader.module.css';

// Role-aware top navigation. Workers see Dashboard and Profile only (skills are opened from
// those pages, never from this menu — D-011). No Module 2 link here.
const ROLE_NAME = { worker: 'Worker', customer: 'Customer', admin: 'Admin' };

export default function AppHeader() {
  const { user, logout } = useAuth();
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
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={user ? homePathFor(user.role) : '/'} className={styles.brand} aria-label="Digital Labour Marketplace, home">
          <Logo size={32} />
        </Link>

        {user ? (
          <>
            <nav aria-label="Main" className={styles.desktopNav}>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className={styles.account} ref={accountRef}>
              <button type="button" className={styles.accountButton} aria-expanded={accountOpen} aria-controls="account-menu" onClick={() => setAccountOpen((o) => !o)}>
                <Avatar name={user.name} size="sm" />
                <span className={styles.accountName}>{user.name}</span>
                <ChevronDown size={16} aria-hidden="true" />
                <span className="visually-hidden">Account menu</span>
              </button>
              {accountOpen && (
                <div id="account-menu" className={styles.accountMenu}>
                  <p className={styles.signedIn}>
                    Signed in as <strong>{user.name}</strong>
                    <span>{ROLE_NAME[user.role]} · {user.email}</span>
                  </p>
                  <button type="button" className={styles.menuItem} onClick={handleLogout}>
                    <LogOut size={18} aria-hidden="true" /> Log out
                  </button>
                </div>
              )}
            </div>
            <IconButton
              className={styles.menuToggle}
              label={menuOpen ? 'Close menu' : 'Open menu'}
              icon={menuOpen ? X : Menu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            />
          </>
        ) : (
          <div className={styles.guest}>
            <Button to="/login" variant="ghost" size="sm">Log in</Button>
            <Button to="/register" size="sm">Create account</Button>
          </div>
        )}
      </div>
      {user && menuOpen && (
        <nav id="mobile-menu" aria-label="Main" className={styles.mobileNav}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => [styles.mobileLink, isActive && styles.active].filter(Boolean).join(' ')}>
              {l.label}
            </NavLink>
          ))}
          <button type="button" className={styles.mobileLink} onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> Log out
          </button>
        </nav>
      )}
    </header>
  );
}
