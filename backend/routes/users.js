import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { updateMyPreferences } from '../controllers/usersController.js';
import { preferencesSchema } from '../validators/users.js';

const router = express.Router();

// Any logged-in user (worker, customer, admin) may change only their own settings.
router.patch('/me/preferences', protect, validate(preferencesSchema), updateMyPreferences);

export default router;
