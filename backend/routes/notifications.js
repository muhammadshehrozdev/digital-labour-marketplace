import express from 'express';
import { z } from 'zod';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { listNotifications, unreadCount, markRead, markAllRead } from '../controllers/notificationsController.js';
import { objectId, queryInt } from '../validators/common.js';

const router = express.Router();
const listQuery = z.object({ page: queryInt(1, 1000).optional(), limit: queryInt(1, 50).optional() }).strict();
const idParams = z.object({ id: objectId }).strict();

// Any logged-in user; each controller reads and writes only that user's own notifications.
router.use(protect);
router.get('/', validate(listQuery, 'query'), listNotifications);
router.get('/unread-count', unreadCount);
router.post('/read-all', markAllRead);
router.patch('/:id/read', validate(idParams, 'params'), markRead);

export default router;
