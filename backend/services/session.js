// Login sessions (decision D-006, Option A):
// - a JWT signed with HS256 only, with issuer, audience and expiry checked;
// - stored in an HttpOnly, Secure, SameSite=Strict cookie (JavaScript in the page cannot read it);
// - carries the user's tokenVersion, so logout can cancel it on the server.
import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';

export const SESSION_COOKIE = 'dlm_session';
export const SESSION_HOURS = 8; // one working day (our default; see D-006)
const ISSUER = 'dlm-api';
const AUDIENCE = 'dlm-web';

export function signSession(user) {
  return jwt.sign({ role: user.role, tv: user.tokenVersion ?? 0 }, getEnv().JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${SESSION_HOURS}h`,
    issuer: ISSUER,
    audience: AUDIENCE,
    subject: String(user._id),
  });
}

// Returns the payload, or null if the token is missing, forged, expired or not ours.
export function verifySession(token) {
  if (typeof token !== 'string' || token.length === 0 || token.length > 2000) return null;
  try {
    return jwt.verify(token, getEnv().JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch {
    return null;
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: true, // browsers also accept Secure cookies on http://localhost and http://127.0.0.1
  sameSite: 'strict',
  path: '/api',
});

export function setSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_HOURS * 60 * 60 * 1000 });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

// Reads one cookie from the Cookie header (no extra package needed).
export function readCookie(req, nameToRead) {
  const header = req.headers.cookie;
  if (typeof header !== 'string') return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === nameToRead) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}
