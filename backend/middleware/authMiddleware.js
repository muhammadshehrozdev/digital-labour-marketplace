// protect: the request must carry a valid session cookie of an existing user whose
// tokenVersion still matches (so logged-out tokens fail). Role comes from the database,
// not from the token. requireRole: the user must have one of the given roles.
// These checks are the real protection; the React route guard is only for convenience.
import mongoose from 'mongoose';
import User from '../models/User.js';
import { SESSION_COOKIE, readCookie, verifySession } from '../services/session.js';
import { errorBody } from '../utils/httpError.js';

// The fields of the logged-in user that routes may use (never the password).
const SESSION_USER_FIELDS = 'name email phone role status tokenVersion preferredLanguage preferredTheme preferredTextSize';

// Reads the session cookie. Returns { user } for a valid session, or { code } that says why not.
// Used by protect (login required) and by GET /api/auth/session (visitors allowed).
export async function findSessionUser(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return { code: 'NOT_LOGGED_IN' };

  const payload = verifySession(token);
  if (!payload || !mongoose.isValidObjectId(payload.sub)) return { code: 'SESSION_ENDED' };

  const user = await User.findById(payload.sub).select(SESSION_USER_FIELDS).lean();
  // Accounts created before tokenVersion existed have no such field: treat it as 0.
  if (!user || (user.tokenVersion ?? 0) !== payload.tv) return { code: 'SESSION_ENDED' };
  // Suspending an account already ends its sessions (tokenVersion); this is the second lock.
  if (user.status === 'suspended') return { code: 'SESSION_ENDED' };
  // When this login ends (the token's own expiry), for the website's "session ending" warning.
  return { user, expiresAt: new Date(payload.exp * 1000) };
}

export const protect = async (req, res, next) => {
  const { user, code, expiresAt } = await findSessionUser(req);
  if (!user) return res.status(401).json(errorBody(code));
  req.user = user;
  req.sessionExpiresAt = expiresAt;
  return next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json(errorBody('FORBIDDEN'));
  }
  return next();
};

// Old name, still used by the Module 2 routes until Phase 4.
export const authorizeRoles = requireRole;
