// Every place a person can go, by role (Batch 4). One list for the command palette (Ctrl+K),
// the search box on the "page not found" screen and the keyboard-shortcut help.
// label: a dictionary key. keywords: extra dictionary key with words people may type.
import {
  BadgeCheck, Bell, FileCheck2, FileDown, Hammer, Heart, History, Home, Languages, LayoutDashboard, LifeBuoy, LogIn, MessageSquareQuote,
  PencilLine, Scale, ScrollText, Search, ShieldCheck, Sparkles, UserPlus, UserRound, Users,
} from 'lucide-react';

const PUBLIC = [
  { id: 'home', to: '/', label: 'nav.home', icon: Home },
  { id: 'login', to: '/login', label: 'header.login', icon: LogIn },
  { id: 'register-worker', to: '/register?role=worker', label: 'landing.joinWorker', icon: Hammer },
  { id: 'register-customer', to: '/register?role=customer', label: 'landing.findWorker', icon: UserPlus },
];

const BY_ROLE = {
  worker: [
    { id: 'dashboard', to: '/worker', label: 'nav.dashboard', icon: LayoutDashboard },
    { id: 'profile', to: '/worker/profile', label: 'nav.myProfile', icon: UserRound },
    { id: 'edit-about', to: '/worker/profile/edit?section=about', label: 'palette.editAbout', icon: PencilLine },
    { id: 'edit-work', to: '/worker/profile/edit?section=work', label: 'palette.editWork', icon: Hammer },
    { id: 'edit-skills', to: '/worker/profile/edit?section=skills', label: 'palette.editSkills', icon: Sparkles },
    { id: 'edit-proof', to: '/worker/profile/edit?section=proof', label: 'palette.editProof', icon: BadgeCheck },
    { id: 'edit-history', to: '/worker/profile/edit?section=history', label: 'palette.editHistory', icon: History },
    { id: 'edit-language', to: '/worker/profile/edit?section=language', label: 'palette.editLanguage', icon: Languages },
    { id: 'notifications', to: '/notifications', label: 'nav.notifications', icon: Bell },
  ],
  customer: [
    { id: 'find', to: '/find', label: 'nav.findWorkers', icon: Search },
    { id: 'saved', to: '/saved', label: 'nav.saved', icon: Heart },
    { id: 'compare', to: '/compare', label: 'nav.compare', icon: Scale },
  ],
  admin: [
    { id: 'admin', to: '/admin', label: 'admin.nav.overview', icon: LayoutDashboard },
    { id: 'admin-identity', to: '/admin/identity', label: 'admin.nav.identity', icon: ShieldCheck },
    { id: 'admin-evidence', to: '/admin/evidence', label: 'admin.nav.evidence', icon: FileCheck2 },
    { id: 'admin-users', to: '/admin/users', label: 'admin.nav.users', icon: Users },
    { id: 'admin-audit', to: '/admin/audit', label: 'admin.nav.audit', icon: ScrollText },
    { id: 'admin-templates', to: '/admin/templates', label: 'admin.nav.templates', icon: MessageSquareQuote },
    { id: 'admin-exports', to: '/admin/exports', label: 'admin.nav.exports', icon: FileDown },
  ],
};

const EVERYONE = [{ id: 'help', to: '/help', label: 'nav.help', icon: LifeBuoy }];

// role: 'worker' | 'customer' | 'admin' | undefined (a visitor)
export function destinationsFor(role) {
  return [...(role ? BY_ROLE[role] ?? [] : PUBLIC), ...EVERYONE];
}

// Simple, forgiving match: every typed word must appear in the label (any letter case).
export function searchDestinations(destinations, query, t) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return destinations;
  return destinations.filter((d) => {
    const label = t(d.label).toLowerCase();
    return words.every((w) => label.includes(w));
  });
}
