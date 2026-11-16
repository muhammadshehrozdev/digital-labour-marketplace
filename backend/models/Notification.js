// A message for one user about something that happened to THEIR account (Batch 4, feature 19):
// identity approved or not accepted, proof approved / not accepted / marked suspected fake /
// approval withdrawn; Module 4: booking and review events. Created only by the server when the real event happens.
// The text is not stored: the website builds it from `type` + `params` in the user's language.
// Never put a CNIC, a phone number or another person's data in params.
import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = Object.freeze([
  'identity_verified', 'identity_rejected',
  'evidence_approved', 'evidence_rejected', 'evidence_suspected_fake', 'evidence_revoked',
  // Module 4: bookings and reviews (Batch 6, section 4.13)
  'booking_requested', 'booking_accepted', 'booking_declined', 'booking_expired', 'booking_cancelled',
  'booking_confirm_request', 'booking_completed', 'review_requested', 'review_reminder',
  'review_received', 'review_reply', 'review_hidden', 'review_restored',
  'no_show_reported', 'dispute_opened', 'dispute_decided',
]);
export const NOTIFICATION_KEEP_DAYS = 180;

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    // Only these keys (see services/notifications.js): skillId, skillName, evidenceId, reasonCode, note,
    // and for Module 4 bookingId, bookingCode, rating, outcome. Never a phone number or a name.
    params: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: () => new Date() },
  },
  { versionKey: false, minimize: false }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, readAt: 1 });
// Old notifications remove themselves after 180 days (MongoDB TTL index).
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_KEEP_DAYS * 24 * 60 * 60 });

export default mongoose.model('Notification', notificationSchema);
