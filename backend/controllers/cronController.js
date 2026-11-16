// GET /api/cron/daily — the daily tidy-up (Module 4, decision D-042).
// Vercel calls it once a day (backend/vercel.json "crons", 21:00 UTC = 02:00 in Pakistan) and, when the
// project has a CRON_SECRET variable, sends it as "Authorization: Bearer <CRON_SECRET>". Delivery is
// best effort (a run can be missed or arrive twice), so every step is idempotent and correctness never
// depends on this endpoint: the per-request sweep keeps every booking right. This only tidies up.
// It is a GET because the CSRF check (middleware/csrf.js) blocks other methods without a browser Origin.
import { createHash, timingSafeEqual } from 'node:crypto';
import Booking from '../models/Booking.js';
import { getEnv } from '../config/env.js';
import { errorBody } from '../utils/httpError.js';
import { sweepBookings } from '../services/booking/sweep.js';
import { safeRecompute } from '../services/reputation/recompute.js';

// Constant-time comparison (both sides hashed first, so the lengths are always equal).
export function secretMatches(header, secret) {
  if (!secret || typeof header !== 'string') return false;
  const want = createHash('sha256').update(`Bearer ${secret}`).digest();
  const got = createHash('sha256').update(header).digest();
  return timingSafeEqual(want, got);
}

export const requireCronSecret = (req, res, next) => {
  if (!secretMatches(req.headers.authorization, getEnv().CRON_SECRET)) return res.status(401).json(errorBody('CRON_UNAUTHORIZED'));
  return next();
};

export const runDaily = async (req, res) => {
  const now = new Date();
  const swept = await sweepBookings({ now });
  // recency changes slowly, so once a day every worker with any booking gets a fresh snapshot
  const workers = await Booking.distinct('worker');
  let refreshed = 0;
  for (const worker of workers) if (await safeRecompute(worker, now)) refreshed += 1;
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, at: now, swept, refreshed });
};
