import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, LogOut, Menu, MoonStar, Search, SlidersHorizontal, Type, Volume2, X } from 'lucide-react';
import { OPEN_PALETTE } from '../../features/app/AppCommands';
import Logo from '../brand/Logo';
import { Avatar, Button, IconButton } from '../ui';
import { useAuth } from '../../context/auth';
import { useLanguage, useT } from '../../i18n';
import { useTheme } from '../../theme';
import { homePathFor } from '../../utils/roles';
import LanguageSwitcher from './LanguageSwitcher';
import LanguageChoice from './LanguageChoice';
import TextSizeControl from './TextSizeControl';
import ThemeToggle from './ThemeToggle';
import SoundMenu, { SoundSettings } from '../../features/assist/SoundMenu';
import WorkerHeaderTools from '../../features/worker/WorkerHeaderTools';
import { NAV_LINKS } from './navLinks';
import RequestsCount from '../../features/booking/RequestsCount';
import NotificationsCount from '../../features/notifications/NotificationsCount';
import { useHeaderFit } from './headerFit';
import { useStayInView } from './useStayInView';
import styles from './AppHeader.module.css';

// A menu that closes on Escape (focus back to its button) or a click outside it.
function useDismiss(open, setOpen, wrapRef, buttonRef) {
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown') {
        if (e.key !== 'Escape') return;
        setOpen(false);
        buttonRef?.current?.focus();
      } else if (!wrapRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open, setOpen, wrapRef, buttonRef]);
}

// The controls that leave the header bar when it has no room (Batch 6B, D-059): Sound and language
// (level flag tools = menu), the night-mode button (theme = menu) and, for visitors, the text size.
// Each row has an icon and words.
function MovedControls({ level, withTextSize = false, onNavigate }) {
  const { t } = useT();
  const soundTitle = `sound-title${useId().replace(/:/g, '')}`;
  return (
    <>
      {level.tools === 'menu' && (
        <>
          <div className={styles.menuRow}>
            <span className={styles.rowLabel}><Globe size={18} aria-hidden="true" /> {t('language.label')}</span>
            <LanguageChoice />
          </div>
          <div className={styles.menuSection} role="group" aria-labelledby={soundTitle}>
            <p id={soundTitle} className={styles.rowLabel}><Volume2 size={18} aria-hidden="true" /> {t('assist.soundTitle')}</p>
            <SoundSettings onNavigate={onNavigate} />
          </div>
        </>
      )}
      {level.theme === 'menu' && (
        <div className={styles.menuRow}>
          <span className={styles.rowLabel}><MoonStar size={18} aria-hidden="true" /> {t('theme.footerTitle')}</span>
          <ThemeToggle />
        </div>
      )}
      {withTextSize && (
        <div className={styles.menuRow}>
          <span className={styles.rowLabel}><Type size={18} aria-hidden="true" /> {t('textSize.label')}</span>
          <TextSizeControl />
        </div>
      )}
    </>
  );
}

// Visitors: "More" holds what left the bar (a disclosure like the account menu).
function MoreMenu({ level }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useDismiss(open, setOpen, wrapRef, buttonRef);
  useStayInView(menuRef, open);
  return (
    <div className={styles.account} ref={wrapRef}>
      <button ref={buttonRef} type="button" className={styles.moreButton} aria-expanded={open} aria-controls="more-menu" onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>{t('b6b.header.more')}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div id="more-menu" ref={menuRef} className={styles.accountMenu} role="group" aria-label={t('b6b.header.moreMenu')}>
          <MovedControls level={level} withTextSize onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// Role-aware top navigation: links, language switcher, account menu (D-020). It never cuts anything off:
// it collapses in a planned order (headerFit.js).
export default function AppHeader() {
  const { user, logout } = useAuth();
  const { t } = useT();
  const { lang } = useLanguage();
  const { textSize } = useTheme();
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
  const accountButtonRef = useRef(null);
  const accountMenuRef = useRef(null);
  const headerRef = useRef(null);
  const rowRef = useRef(null);
  const level = useHeaderFit(headerRef, rowRef, user ? 'user' : 'guest', [user?.role, user?.name, lang, textSize]);
  useDismiss(accountOpen, setAccountOpen, accountRef, accountButtonRef);
  useStayInView(accountMenuRef, accountOpen);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = user ? NAV_LINKS[user.role] ?? [] : [];
  const linkClass = (base) => ({ isActive }) => [base, isActive && styles.active].filter(Boolean).join(' ');
  const inMenu = level.nav === 'menu';
  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.inner} ref={rowRef} data-header-row>
        <Link to={user ? homePathFor(user.role) : '/'} className={styles.brand} aria-label={t('app.home')}>
          <Logo size={34} compact />
        </Link>

        {user && (
          <nav aria-label={t('nav.main')} className={styles.desktopNav}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass(styles.link)}>{t(l.label)}{l.badge === 'requests' && <RequestsCount />}{l.badge === 'notifications' && <NotificationsCount />}</NavLink>
            ))}
          </nav>
        )}

        <div className={styles.end} data-tour="header">
          <button type="button" className={styles.paletteButton} onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label={t('appx.palette.open')} aria-keyshortcuts="Control+K" title={t('appx.palette.open')}>
            <Search size={18} aria-hidden="true" />
            <kbd className={styles.paletteKbd} aria-hidden="true">Ctrl K</kbd>
          </button>
          {user?.role === 'worker' && <WorkerHeaderTools />}
          <div className={styles.barTool}><SoundMenu /></div>
          <div className={styles.barTheme}><ThemeToggle /></div>
          <div className={styles.barTool}><LanguageSwitcher compact /></div>
          {user ? (
            <>
              <div className={styles.account} ref={accountRef}>
                <button ref={accountButtonRef} type="button" className={styles.accountButton} aria-expanded={accountOpen} aria-controls="account-menu" title={user.name} onClick={() => setAccountOpen((o) => !o)}>
                  <Avatar name={user.name} size="sm" />
                  {/* hidden on screen when there is no room (CSS, from the level written on <header>), but still
                      read by screen readers; the whole name is in the menu too */}
                  <span className={styles.accountName} dir="auto">{user.name}</span>
                  <ChevronDown size={16} aria-hidden="true" />
                  {/* ", " keeps the two parts apart for screen readers: "<name>, Account menu" */}
                  <span className="visually-hidden">{`, ${t('header.accountMenu')}`}</span>
                </button>
                {accountOpen && !inMenu && (
                  <div id="account-menu" ref={accountMenuRef} className={styles.accountMenu}>
                    <p className={styles.signedIn}>
                      {t('header.signedInAs')} <strong dir="auto">{user.name}</strong>
                      <span>{t(`roles.${user.role}`)} · <span dir="ltr" className={styles.email} title={user.email}>{user.email}</span></span>
                    </p>
                    <MovedControls level={level} onNavigate={() => setAccountOpen(false)} />
                    <div className={styles.menuRow}>
                      <span className={styles.rowLabel}><Type size={18} aria-hidden="true" /> {t('textSize.label')}</span>
                      <TextSizeControl />
                    </div>
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
              {/* always rendered; CSS shows it only when the level moves the tools (the measurement must never
                  depend on what React rendered for an earlier level) */}
              <div className={styles.moreWrap}><MoreMenu level={level} /></div>
              <Button to="/login" variant="ghost" size="sm">{t('header.login')}</Button>
              <Button to="/register" size="sm" className={styles.createAccount}>{t('header.createAccount')}</Button>
            </div>
          )}
        </div>
      </div>
      {user && menuOpen && (
        <nav id="mobile-menu" aria-label={t('nav.main')} className={styles.mobileNav}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass(styles.mobileLink)}>{t(l.label)}{l.badge === 'requests' && <RequestsCount />}{l.badge === 'notifications' && <NotificationsCount />}</NavLink>
          ))}
          {inMenu && <MovedControls level={level} onNavigate={() => setMenuOn(null)} />}
          <div className={styles.menuRow}>
            <span>{t('textSize.label')}</span>
            <TextSizeControl />
          </div>
          <p className={styles.mobileSignedIn}>{t('header.signedInAs')} <strong dir="auto">{user.name}</strong></p>
          <button type="button" className={styles.mobileLink} onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" /> {t('header.logout')}
          </button>
        </nav>
      )}
    </header>
  );
}
