// Top navigation per role (labels are dictionary keys). Workers: Dashboard and My profile
// (D-020: one view, one editor; skills and proof are edited inside the profile editor).
export const NAV_LINKS = {
  worker: [
    { to: '/worker', label: 'nav.dashboard', end: true },
    { to: '/worker/profile', label: 'nav.myProfile' },
  ],
  customer: [{ to: '/find', label: 'nav.findWorkers' }],
  admin: [{ to: '/admin', label: 'nav.admin' }],
};
