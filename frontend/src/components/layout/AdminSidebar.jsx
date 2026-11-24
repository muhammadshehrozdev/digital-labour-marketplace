import { NavLink } from 'react-router-dom';
import { ClipboardList, ClipboardPen, FileCheck2, FileDown, Flag, Gavel, HandCoins, LayoutDashboard, MessageSquareQuote, MessagesSquare, NotebookText, ScrollText, ShieldCheck, Users } from 'lucide-react';
import { useT } from '../../i18n';
import styles from './AdminSidebar.module.css';

const LINKS = [
  { to: '/admin', label: 'admin.nav.overview', icon: LayoutDashboard, end: true },
  { to: '/admin/identity', label: 'admin.nav.identity', icon: ShieldCheck },
  { to: '/admin/evidence', label: 'admin.nav.evidence', icon: FileCheck2 },
  // Module 4 (Batch 6)
  { to: '/admin/bookings', label: 'adminm4.nav.bookings', icon: ClipboardList },
  { to: '/admin/disputes', label: 'adminm4.nav.disputes', icon: Gavel },
  { to: '/admin/reviews', label: 'adminm4.nav.reviews', icon: MessagesSquare },
  { to: '/admin/flags', label: 'adminm4.nav.flags', icon: Flag },
  // Module 5 (Batch 7)
  { to: '/admin/payments', label: 'wage.admin.nav.payments', icon: HandCoins },
  { to: '/admin/price-guide', label: 'wage.admin.nav.guide', icon: NotebookText },
  // Module 6 (Batch 8B)
  { to: '/admin/job-requests', label: 'jobs.admin.nav', icon: ClipboardPen },
  { to: '/admin/users', label: 'admin.nav.users', icon: Users },
  { to: '/admin/audit', label: 'admin.nav.audit', icon: ScrollText },
  { to: '/admin/templates', label: 'admin.nav.templates', icon: MessageSquareQuote },
  { to: '/admin/exports', label: 'admin.nav.exports', icon: FileDown },
];

export default function AdminSidebar() {
  const { t } = useT();
  return (
    <nav aria-label={t('admin.nav.label')} className={styles.sidebar}>
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}>
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          {t(label)}
        </NavLink>
      ))}
    </nav>
  );
}
