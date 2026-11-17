// Top navigation per role (labels are dictionary keys). Workers: Dashboard, Requests, My jobs and My profile
// (D-020: one view, one editor; skills and proof are edited inside the profile editor).
export const NAV_LINKS = {
  worker: [
    { to: '/worker', label: 'nav.dashboard', end: true },
    // Module 4: new requests with a count badge (badge: 'requests'), jobs and reputation
    { to: '/worker/requests', label: 'booking.nav.requests', badge: 'requests' },
    { to: '/worker/jobs', label: 'booking.nav.jobs' },
    { to: '/worker/profile', label: 'nav.myProfile' },
  ],
  customer: [
    { to: '/find', label: 'nav.findWorkers' },
    { to: '/bookings', label: 'booking.nav.bookings' },
    { to: '/saved', label: 'nav.saved' },
    // Module 4: booking and review notifications, with the unread count (customers have no bell)
    { to: '/notifications', label: 'nav.notifications', badge: 'notifications' },
  ],
  admin: [{ to: '/admin', label: 'nav.admin' }],
};
