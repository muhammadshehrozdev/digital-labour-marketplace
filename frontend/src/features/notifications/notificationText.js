// Module 4 (Batch 6): booking and review notifications. Their texts are in booking.notify.<type>.
export const BOOKING_TYPES = Object.freeze([
  'booking_requested', 'booking_accepted', 'booking_declined', 'booking_expired', 'booking_cancelled',
  'booking_confirm_request', 'booking_completed', 'review_requested', 'review_reminder',
  'review_received', 'review_reply', 'review_hidden', 'review_restored',
  'no_show_reported', 'dispute_opened', 'dispute_decided',
]);
// Module 5 (Batch 7): price terms and payment records. Their texts are in wage.notify.<type>.
export const WAGE_TYPES = Object.freeze(['terms_proposed', 'terms_agreed', 'payment_recorded', 'payment_confirmed', 'payment_disputed']);
export const notificationTextKey = (type) => (WAGE_TYPES.includes(type) ? `wage.notify.${type}` : BOOKING_TYPES.includes(type) ? `booking.notify.${type}` : `workerx.notifications.types.${type}`);

function bookingLink(n, role) {
  const id = n.params?.bookingId ? encodeURIComponent(n.params.bookingId) : null;
  const own = id ? (role === 'worker' ? `/worker/jobs/${id}` : `/bookings/${id}`) : role === 'worker' ? '/worker/jobs' : '/bookings';
  if (n.type === 'booking_requested') return '/worker/requests';
  if (['review_received', 'review_hidden', 'review_restored'].includes(n.type) && role === 'worker') return '/worker/reviews';
  if (['review_requested', 'review_reminder'].includes(n.type) && id) return `/bookings/${id}/rate`;
  return own;
}

// Where a notification leads (the place where the person can act on it). role: the reader's role.
export function notificationLink(n, role = 'worker') {
  if (BOOKING_TYPES.includes(n.type) || WAGE_TYPES.includes(n.type)) return bookingLink(n, role);
  if (n.type.startsWith('identity_')) return '/worker/profile/edit?section=about';
  const skill = n.params?.skillId ? `&skill=${encodeURIComponent(n.params.skillId)}` : '';
  return `/worker/profile/edit?section=proof${skill}`;
}

export const NOTIFICATION_POLL_MS = 60000; // once a minute, no websockets (Batch 4 prompt)

// The tone of the little dot / icon: good news green, problems red.
const GOOD = ['terms_agreed', 'payment_confirmed', 'identity_verified', 'evidence_approved', 'booking_accepted', 'booking_completed', 'review_received', 'review_reply', 'review_restored', 'review_requested'];
const NEUTRAL = ['terms_proposed', 'payment_recorded', 'booking_requested', 'booking_confirm_request', 'review_reminder', 'dispute_decided', 'booking_declined', 'booking_expired'];
export const notificationTone = (type) => (GOOD.includes(type) ? 'success' : NEUTRAL.includes(type) ? 'info' : 'danger');
