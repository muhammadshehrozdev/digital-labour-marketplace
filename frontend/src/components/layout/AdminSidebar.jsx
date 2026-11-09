import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScrollText, ShieldCheck } from 'lucide-react';
import styles from './AdminSidebar.module.css';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/identity', label: 'Identity review', icon: ShieldCheck },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
];

export default function AdminSidebar() {
  return (
    <nav aria-label="Admin" className={styles.sidebar}>
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => [styles.link, isActive && styles.active].filter(Boolean).join(' ')}>
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
