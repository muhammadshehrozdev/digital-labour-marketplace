import { NavLink } from 'react-router-dom';
import { FileCheck2, LayoutDashboard, ScrollText, ShieldCheck } from 'lucide-react';
import { useT } from '../../i18n';
import styles from './AdminSidebar.module.css';

const LINKS = [
  { to: '/admin', label: 'admin.nav.overview', icon: LayoutDashboard, end: true },
  { to: '/admin/identity', label: 'admin.nav.identity', icon: ShieldCheck },
  { to: '/admin/evidence', label: 'admin.nav.evidence', icon: FileCheck2 },
  { to: '/admin/audit', label: 'admin.nav.audit', icon: ScrollText },
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
