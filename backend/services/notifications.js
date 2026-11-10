// Creates in-app notifications (Batch 4, feature 19). A failed notification never fails the
// action that caused it (the decision is already saved and audited): the error is only logged.
import Notification, { NOTIFICATION_TYPES } from '../models/Notification.js';

const ALLOWED_PARAMS = ['skillId', 'skillName', 'evidenceId', 'reasonCode', 'note'];

// Keeps only known keys and short text, so nothing private can slip into a notification.
export function cleanParams(params = {}) {
  const clean = {};
  for (const key of ALLOWED_PARAMS) {
    const value = params[key];
    if (value === undefined || value === null || value === '') continue;
    clean[key] = String(value).slice(0, 500);
  }
  return clean;
}

export async function notify(userId, type, params) {
  if (!userId || !NOTIFICATION_TYPES.includes(type)) return null;
  try {
    return await Notification.create({ user: userId, type, params: cleanParams(params) });
  } catch (err) {
    console.error(`[notify] could not save a "${type}" notification: ${err.message}`);
    return null;
  }
}

// Evidence review state -> notification type (pending has none: the worker did that).
export const EVIDENCE_NOTIFICATIONS = Object.freeze({
  approved: 'evidence_approved',
  rejected: 'evidence_rejected',
  suspected_fake: 'evidence_suspected_fake',
  revoked: 'evidence_revoked',
});
