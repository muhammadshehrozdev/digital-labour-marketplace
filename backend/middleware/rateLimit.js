// Rate limit for login and register (audit M1-10).
// Counts only FAILED attempts (status >= 400) per IP address in 15 minutes,
// so normal users are not blocked, but password guessing is slowed down.
// Note: the default store is in memory, one per server instance. On Vercel
// that is only partial protection; the per-account lockout (User model) and a
// Vercel Firewall rule (Phase 8) are the real protection. See docs/SECURITY.md.
import rateLimit from 'express-rate-limit';

export function createAuthLimiter({ limit }) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { message: 'Too many failed attempts from this network. Please wait 15 minutes and try again.' },
  });
}
