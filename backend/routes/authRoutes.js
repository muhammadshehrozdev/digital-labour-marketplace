import express from 'express';
import { registerUser, loginUser, getMe, getSession, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.get('/session', getSession); // visitors allowed: answers { user: null }

export default router;
