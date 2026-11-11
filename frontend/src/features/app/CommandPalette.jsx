// Command palette (Batch 4, feature 35): Ctrl+K (Cmd+K on a Mac) or the search button in the
// header. Lists the pages this person may open (by role: a visitor never sees admin pages) and a
// few actions. Combobox pattern: type to filter, Up / Down to move, Enter to open, Esc to close.
import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALargeSmall, ArrowRight, Keyboard, LogOut, Megaphone, Moon, Search } from 'lucide-react';
import { Dialog } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { destinationsFor } from '../navigation/destinations';
import { useTheme } from '../../theme';
import { useT } from '../../i18n';
import styles from './AppFeatures.module.css';

export default function CommandPalette({ open, onClose, onShortcuts, onWhatsNew }) {
  const { t } = useT();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toggle, textSize, setTextSize } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = `palette-${useId().replace(/:/g, '')}`;
  const inputRef = useRef(null);
  // The dialog first focuses its own first button; the search box should have the focus.
  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const items = useMemo(() => {
    const pages = destinationsFor(user?.role).map((d) => ({ id: `page-${d.id}`, group: 'pages', label: t(d.label), icon: d.icon, run: () => navigate(d.to) }));
    const actions = [
      { id: 'theme', label: t('appx.palette.actions.theme'), icon: Moon, run: () => toggle(document.querySelector('[data-testid="theme-toggle"] button')?.getBoundingClientRect?.() && (() => { const b = document.querySelector('[data-testid="theme-toggle"] button').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()) },
      textSize === 'large'
        ? { id: 'text-normal', label: t('appx.palette.actions.textNormal'), icon: ALargeSmall, run: () => setTextSize('normal') }
        : { id: 'text-large', label: t('appx.palette.actions.textLarger'), icon: ALargeSmall, run: () => setTextSize('large') },
      { id: 'shortcuts', label: t('appx.palette.actions.shortcuts'), icon: Keyboard, run: onShortcuts },
      { id: 'whats-new', label: t('appx.palette.actions.whatsNew'), icon: Megaphone, run: onWhatsNew },
      ...(user ? [{ id: 'logout', label: t('appx.palette.actions.logout'), icon: LogOut, run: async () => { await logout(); navigate('/login'); } }] : []),
    ].map((a) => ({ ...a, group: 'actions' }));
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return [...pages, ...actions].filter((item) => words.every((w) => item.label.toLowerCase().includes(w)));
  }, [user, t, navigate, toggle, textSize, setTextSize, onShortcuts, onWhatsNew, logout, query]);

  const current = Math.min(active, Math.max(0, items.length - 1));
  const close = () => {
    setQuery('');
    setActive(0);
    onClose();
  };
  const run = (item) => {
    close();
    item?.run();
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length) setActive((current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
    } else if (e.key === 'Home') {
      setActive(0);
    } else if (e.key === 'End') {
      setActive(items.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(items[current]);
    }
  };

  let lastGroup = null;
  return (
    <Dialog open={open} onClose={close} title={t('appx.palette.label')} size="md">
      <div className={styles.palette}>
        <div className={styles.paletteInput}>
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={items[current] ? `${listId}-${items[current].id}` : undefined}
            aria-label={t('appx.palette.open')}
            placeholder={t('appx.palette.placeholder')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
          />
        </div>
        <ul id={listId} role="listbox" aria-label={t('appx.palette.label')} className={styles.paletteList}>
          {items.length === 0 && <li className={styles.paletteEmpty} role="presentation">{t('appx.palette.empty')}</li>}
          {items.map((item, i) => {
            const heading = item.group !== lastGroup ? <li role="presentation" className={styles.paletteGroup}>{t(`appx.palette.groups.${item.group}`)}</li> : null;
            lastGroup = item.group;
            const Icon = item.icon;
            return (
              <Fragment key={item.id}>
              {heading}
              <li
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={i === current}
                className={styles.paletteItem}
                onMouseMove={() => setActive(i)}
                onClick={() => run(item)}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
                <ArrowRight size={16} aria-hidden="true" className={styles.paletteArrow} />
              </li>
              </Fragment>
            );
          })}
        </ul>
        <p className={styles.paletteHint}>{t('appx.palette.hint')}</p>
      </div>
    </Dialog>
  );
}
