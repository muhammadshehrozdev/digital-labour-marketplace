import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { BCRYPT_COST } from '../models/User.js';
import { httpError } from '../utils/httpError.js';
import { ERRORS } from '../errors/catalog.js';
import {
  SESSION_COOKIE, signSession, verifySession, readCookie, setSessionCookie, clearSessionCookie,
} from '../services/session.js';
import { findSessionUser } from '../middleware/authMiddleware.js';

// The only fields of a user that the API ever sends back (to that user or an admin).
export const ownUser = (u) => ({
  _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  preferredLanguage: u.preferredLanguage ?? null,
  preferredTheme: u.preferredTheme ?? null,
  preferredTextSize: u.preferredTextSize ?? null,
});

// The English text lives in errors/catalog.js (the website shows it in the chosen language).
export const LOGIN_FAILED = ERRORS.LOGIN_FAILED;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

// A real bcrypt hash of a random value, made once. Used when the email does not exist,
// so a wrong email and a wrong password take about the same time (no account guessing).
let dummyHashPromise;
const dummyHash = () => {
  dummyHashPromise ??= bcrypt.hash(`dummy-${Math.random()}`, BCRYPT_COST);
  return dummyHashPromise;
};

// POST /api/auth/register  (worker or customer only — admins come from the create-admin script)
export const registerUser = async (req, res) => {
  const { name, email, password, phone, role, preferredLanguage } = req.validated.body;

  if (await User.exists({ email })) {
    throw httpError(409, 'EMAIL_TAKEN');
  }
  const user = await User.create({ name, email, password, phone, role, preferredLanguage: preferredLanguage ?? null });

  setSessionCookie(res, signSession(user));
  res.status(201).json(ownUser(user));
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await bcrypt.compare(password, await dummyHash());
    throw httpError(401, 'LOGIN_FAILED');
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  const locked = user.lockUntil && user.lockUntil > new Date();

  if (locked) throw httpError(401, 'LOGIN_FAILED'); // even a correct password waits out the lock

  if (!passwordOk) {
    // Atomic +1, so parallel guesses are all counted.
    const updated = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { failedLoginCount: 1 } },
      { returnDocument: 'after', projection: { failedLoginCount: 1 } }
    );
    if (updated && updated.failedLoginCount >= MAX_FAILED_LOGINS) {
      await User.updateOne(
        { _id: user._id },
        { $set: { lockUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000), failedLoginCount: 0 } }
      );
    }
    throw httpError(401, 'LOGIN_FAILED');
  }

  if (user.failedLoginCount !== 0 || user.lockUntil) {
    await User.updateOne({ _id: user._id }, { $set: { failedLoginCount: 0, lockUntil: null } });
  }

  setSessionCookie(res, signSession(user));
  res.json(ownUser(user));
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(ownUser(req.user));
};

// GET /api/auth/session — who is logged in, for the website's first load (Batch 3).
// Always 200: { user } or { user: null }. A visitor is a normal case, not an error, so the
// browser console stays clean. An old or invalid cookie is removed.
export const getSession = async (req, res) => {
  const { user, code } = await findSessionUser(req);
  res.set('Cache-Control', 'no-store');
  if (!user) {
    if (code === 'SESSION_ENDED') clearSessionCookie(res);
    return res.json({ user: null });
  }
  return res.json({ user: ownUser(user) });
};

// POST /api/auth/logout — works even if the session already expired.
// Increasing tokenVersion makes every older token of this user invalid (all devices).
export const logoutUser = async (req, res) => {
  const payload = verifySession(readCookie(req, SESSION_COOKIE));
  if (payload && mongoose.isValidObjectId(payload.sub)) {
    // $inc also works on older accounts that have no tokenVersion field yet (it becomes 1).
    await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
  }
  clearSessionCookie(res);
  res.json({ message: 'You are logged out.' });
};
