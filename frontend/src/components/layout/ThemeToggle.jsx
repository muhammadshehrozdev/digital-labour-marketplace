// The night-mode button (Batch 4, Part 3). One tap: light <-> dark, with a circular reveal that
// grows out of this button. A long press, a right click, the small arrow next to it, or the Down
// arrow key opens a menu with Light / Dark / System ("System" follows the device).
// The icon is one SVG: the sun's rays pull in, a crescent is cut out of the disc, and two small
// stars twinkle. Pure SVG and CSS; with reduced motion the icon simply changes.
import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useT } from '../../i18n';
import { THEME_PREFERENCES, useTheme } from '../../theme';
import styles from './ThemeToggle.module.css';

const LONG_PRESS_MS = 550;
const ICONS = { light: Sun, dark: Moon, system: Monitor };

export function SunMoonIcon({ mode, size = 22 }) {
  const id = `sunmoon-${useId().replace(/:/g, '')}`;
  return (
    <svg className={styles.icon} data-mode={mode} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" />
        <circle className={styles.cut} cx="26" cy="2" r="7" fill="#000" />
      </mask>
      <circle className={styles.disc} cx="12" cy="12" r="4.6" fill="currentColor" mask={`url(#${id})`} />
      <g className={styles.rays} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2.2v2.2M12 19.6v2.2M2.2 12h2.2M19.6 12h2.2M5.07 5.07l1.56 1.56M17.37 17.37l1.56 1.56M5.07 18.93l1.56-1.56M17.37 6.63l1.56-1.56" />
      </g>
      <g className={styles.stars} fill="currentColor">
        <path className={styles.star} d="M19.2 3.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" />
        <path className={`${styles.star} ${styles.starTwo}`} d="M21.4 9.6l.35.9.9.35-.9.35-.35.9-.35-.9-.9-.35.9-.35z" />
      </g>
    </svg>
  );
}

export default function ThemeToggle({ tone = 'light', placement = 'below' }) {
  const { mode, preference, toggle, setPreference } = useTheme();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [announce, setAnnounce] = useState('');
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const timer = useRef(null);
  const longPressed = useRef(false);
  const menuId = `theme-${useId().replace(/:/g, '')}`;

  const origin = () => {
    const box = buttonRef.current?.getBoundingClientRect();
    return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined;
  };

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector('[aria-checked="true"]')?.focus();
    const close = (e) => {
      if (e.type === 'keydown') {
        if (e.key !== 'Escape') return;
        setOpen(false);
        buttonRef.current?.focus();
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
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const startPress = () => {
    longPressed.current = false;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      setOpen(true);
    }, LONG_PRESS_MS);
  };
  const endPress = () => window.clearTimeout(timer.current);

  const onClick = () => {
    if (longPressed.current) {
      longPressed.current = false; // the long press already opened the menu
      return;
    }
    setOpen(false);
    setAnnounce(t(mode === 'dark' ? 'theme.nowLight' : 'theme.nowDark'));
    toggle(origin());
  };

  const choose = (value) => {
    setOpen(false);
    buttonRef.current?.focus();
    setPreference(value, { origin: origin() });
    setAnnounce(t(`theme.chosen.${value}`));
  };

  // Arrow keys move inside the menu (roving focus), like a native menu.
  const onMenuKeyDown = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = [...menuRef.current.querySelectorAll('[role="menuitemradio"]')];
    const at = items.indexOf(document.activeElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={wrapRef} className={[styles.wrap, styles[tone]].filter(Boolean).join(' ')} data-testid="theme-toggle">
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-label={t('theme.toggle')}
        aria-pressed={mode === 'dark'}
        title={t('theme.toggleHint')}
        onClick={onClick}
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
        onContextMenu={(e) => {
          e.preventDefault();
          endPress();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        <SunMoonIcon mode={mode} />
      </button>
      <button
        type="button"
        className={styles.more}
        aria-label={t('theme.options')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} ref={menuRef} role="menu" aria-label={t('theme.menuLabel')} className={[styles.menu, styles[placement]].join(' ')} onKeyDown={onMenuKeyDown}>
          {THEME_PREFERENCES.map((value) => {
            const Icon = ICONS[value];
            const checked = preference === value;
            return (
              <button key={value} type="button" role="menuitemradio" aria-checked={checked} tabIndex={checked ? 0 : -1} className={styles.option} onClick={() => choose(value)}>
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.optionText}>
                  {t(`theme.${value}`)}
                  {value === 'system' && <small>{t('theme.systemHint')}</small>}
                </span>
                {checked && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
      <span className="visually-hidden" role="status">{announce}</span>
    </div>
  );
}
