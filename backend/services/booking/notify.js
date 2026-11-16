// Notification params for a booking (Module 4). Only ids, the booking code, the skill, the outcome,
// a reason code and a star rating: never a phone number, a name or free text (services/notifications.js
// keeps only ALLOWED_PARAMS anyway).
export const bookingParams = (b, extra = {}) => ({
  bookingId: String(b._id),
  bookingCode: b.code,
  skillId: b.skillId,
  skillName: b.skillName,
  outcome: b.outcome ?? null,
  ...extra,
});
