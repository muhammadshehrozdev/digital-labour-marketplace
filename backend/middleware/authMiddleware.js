// protect: the request must carry a valid session cookie of an existing user whose
// tokenVersion still matches (so logged-out tokens fail). Role comes from the database,
// not from the token. requireRole: the user must have one of the given roles.
// These checks are the real protection; the React route guard is only for convenience.
import mongoose from 'mongoose';
import User from '../models/User.js';
import { SESSION_COOKIE, readCookie, verifySession } from '../services/session.js';

const SESSION_ENDED = 'Your session has ended. Please log in again.';

export const protect = async (req, res, next) => {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return res.status(401).json({ message: 'Please log in first.' });

  const payload = verifySession(token);
  if (!payload || !mongoose.isValidObjectId(payload.sub)) {
    return res.status(401).json({ message: SESSION_ENDED });
  }

  const user = await User.findById(payload.sub).select('name email phone role tokenVersion').lean();
  if (!user || user.tokenVersion !== payload.tv) {
    return res.status(401).json({ message: SESSION_ENDED });
  }

  req.user = user;
  return next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission for this action.' });
  }
  return next();
};

// Old name, still used by the Module 2 routes until Phase 4.
export const authorizeRoles = requireRole;
