// Keyboard shortcuts on every page and the dialogs they open (Batch 4, features 35, 36, 54):
//   Ctrl+K / Cmd+K  command palette (also from the header's search button)
//   ?               keyboard shortcuts
//   /               jump to the search box of the page (if it has one)
//   g then h        go to my home page
//   t               switch light / dark
// None of the single keys work while typing in a box or while another dialog is open, and none
// use Ctrl/Alt (except Ctrl+K), so they never clash with screen-reader keys.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { useTheme } from '../../theme';
import { homePathFor } from '../../utils/roles';
import { isTypingTarget } from '../admin/adminHelpers';
import CommandPalette from './CommandPalette';
import ShortcutsDialog from './ShortcutsDialog';
import WhatsNew from './WhatsNew';

export const OPEN_PALETTE = 'dlm:palette';
export const OPEN_WHATS_NEW = 'dlm:whats-new';

const dialogOpen = () => Boolean(document.querySelector('dialog[open]'));

export default function AppCommands() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggle } = useTheme();
  const [open, setOpen] = useState(null); // 'palette' | 'shortcuts' | 'whatsNew' | null
  const pendingG = useRef(0);

  const close = useCallback(() => setOpen(null), []);
  const showShortcuts = useCallback(() => setOpen('shortcuts'), []);
  const showWhatsNew = useCallback(() => setOpen('whatsNew'), []);

  useEffect(() => {
    const openPalette = () => setOpen('palette');
    const openWhatsNew = () => setOpen('whatsNew');
    window.addEventListener(OPEN_PALETTE, openPalette);
    window.addEventListener(OPEN_WHATS_NEW, openWhatsNew);
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((current) => (current === 'palette' ? null : 'palette'));
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target) || dialogOpen()) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen('shortcuts');
      } else if (e.key === '/') {
        const search = document.querySelector('main input[type="search"]');
        if (search) {
          e.preventDefault();
          search.focus();
        }
      } else if (e.key === 't') {
        const button = document.querySelector('[data-testid="theme-toggle"] button');
        const box = button?.getBoundingClientRect();
        toggle(box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined);
      } else if (e.key === 'g') {
        pendingG.current = Date.now();
      } else if (e.key === 'h' && Date.now() - pendingG.current < 1500) {
        pendingG.current = 0;
        navigate(user ? homePathFor(user.role) : '/');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(OPEN_PALETTE, openPalette);
      window.removeEventListener(OPEN_WHATS_NEW, openWhatsNew);
      document.removeEventListener('keydown', onKey);
    };
  }, [navigate, user, toggle]);

  return (
    <>
      <CommandPalette open={open === 'palette'} onClose={close} onShortcuts={showShortcuts} onWhatsNew={showWhatsNew} />
      <ShortcutsDialog open={open === 'shortcuts'} onClose={close} />
      <WhatsNew open={open === 'whatsNew'} onClose={close} />
    </>
  );
}
