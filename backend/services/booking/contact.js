// Who sees phone numbers (Module 4; this fulfils decision D-002).
// The customer sees the worker's phone and WhatsApp numbers, and the worker sees the customer's
// phone number, ONLY while the booking is `accepted` and for CONTACT_VISIBLE_DAYS_AFTER_CLOSE days
// after it was completed or cancelled. Only through GET /api/bookings/:id, to the two people in the
// booking and to admins. Never in a list, the directory, a public profile, a notification or a CSV file.
import User from '../../models/User.js';
import WorkerProfile from '../../models/WorkerProfile.js';
import { BOOKING_RULES } from '../../config/bookingRules.js';
import { addDays } from './schedule.js';
import { whatsappLink } from './contactInfo.js';

// PURE: is the contact window open for this booking at `now`?
export function contactVisible(b, now) {
  if (!b.acceptedAt) return false; // never accepted: never any contact
  if (b.status === 'accepted') return true;
  if (['completed', 'cancelled'].includes(b.status) && b.closedAt) {
    return now <= addDays(b.closedAt, BOOKING_RULES.CONTACT_VISIBLE_DAYS_AFTER_CLOSE);
  }
  return false;
}

// The contact block for `viewer` ('customer' | 'worker' | 'admin'), or null. Loads the numbers only
// when the window is open, so a closed booking never even reads them.
export async function contactBlock(b, viewer, now) {
  if (!contactVisible(b, now)) return null;
  const visibleUntil = b.status === 'accepted' ? null : addDays(b.closedAt, BOOKING_RULES.CONTACT_VISIBLE_DAYS_AFTER_CLOSE);
  const block = { visibleUntil };
  if (viewer === 'customer' || viewer === 'admin') {
    const [workerUser, profile] = await Promise.all([
      User.findById(b.workerUser).select('phone -_id').lean(),
      WorkerProfile.findById(b.worker).select('whatsappNumber -_id').lean(),
    ]);
    // a WhatsApp button only when the worker saved a WhatsApp number (no guessing from the phone)
    const whatsapp = profile?.whatsappNumber || '';
    block.worker = { phone: workerUser?.phone ?? '', whatsapp, whatsappLink: whatsapp ? whatsappLink(whatsapp) : null };
  }
  if (viewer === 'worker' || viewer === 'admin') {
    const customer = await User.findById(b.customer).select('phone -_id').lean();
    block.customer = { phone: customer?.phone ?? '' };
  }
  return block;
}
