// Top navigation per role. Workers: Dashboard and Profile only — skills are opened from those
// pages, never from the top menu (D-011, Batch 1 Part 5.2).
export const NAV_LINKS = {
  worker: [
    { to: '/worker', label: 'Dashboard', end: true },
    { to: '/worker/profile', label: 'Profile' },
  ],
  customer: [{ to: '/find', label: 'Find workers' }],
  admin: [{ to: '/admin', label: 'Admin' }],
};
