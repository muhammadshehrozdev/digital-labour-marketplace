// In-app notifications of the logged-in user (Batch 4, feature 19). A user reads and marks only
// their own notifications: every query filters by req.user._id.
import Notification from '../models/Notification.js';
import { httpError } from '../utils/httpError.js';

const view = (n) => ({ _id: n._id, type: n.type, params: n.params ?? {}, read: Boolean(n.readAt), createdAt: n.createdAt });

// GET /api/notifications?page=&limit=
export const listNotifications = async (req, res) => {
  const { page = 1, limit = 20 } = req.validated.query;
  const mine = { user: req.user._id };
  const [items, total, unread] = await Promise.all([
    Notification.find(mine).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(mine),
    Notification.countDocuments({ ...mine, readAt: null }),
  ]);
  res.set('Cache-Control', 'no-store');
  res.json({ notifications: items.map(view), unread, page, limit, total });
};

// GET /api/notifications/unread-count — small answer for the bell (asked once a minute).
export const unreadCount = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ unread: await Notification.countDocuments({ user: req.user._id, readAt: null }) });
};

// PATCH /api/notifications/:id/read
export const markRead = async (req, res) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: req.validated.params.id, user: req.user._id }, // someone else's id -> not found
    { $set: { readAt: new Date() } },
    { returnDocument: 'after' }
  ).lean();
  if (!updated) throw httpError(404, 'NOTIFICATION_NOT_FOUND');
  res.json({ notification: view(updated), unread: await Notification.countDocuments({ user: req.user._id, readAt: null }) });
};

// POST /api/notifications/read-all
export const markAllRead = async (req, res) => {
  const result = await Notification.updateMany({ user: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ updated: result.modifiedCount, unread: 0 });
};
