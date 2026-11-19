// Builds the Express app (no listen). Used by server.js, by Vercel and by the tests.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { getEnv } from './config/env.js';
import { configureMongoose, requireDb, dbState } from './config/db.js';
import { createAuthLimiter, createUploadLimiter } from './middleware/rateLimit.js';
import { requireTrustedOrigin } from './middleware/csrf.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import metaRoutes from './routes/meta.js';
import workersRoutes from './routes/workers.js';
import adminRoutes from './routes/admin.js';
import evidenceRoutes from './routes/evidence.js';
import usersRoutes from './routes/users.js';
import notificationsRoutes from './routes/notifications.js';
import savedRoutes from './routes/saved.js';
import bookingsRoutes from './routes/bookings.js';
import reviewsRoutes from './routes/reviews.js';
import cronRoutes from './routes/cron.js';
import pricesRoutes from './routes/prices.js';

export function createApp() {
  const env = getEnv();
  configureMongoose(env.NODE_ENV);

  const app = express();

  // How many proxies sit in front of us, so req.ip is the real visitor (Phase 8 measures this on Vercel).
  app.set('trust proxy', env.TRUST_PROXY);

  // Security headers (audit M1-10).
  app.use(helmet());

  // CORS allow-list: only our own frontend origins get the Access-Control-Allow-Origin header.
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));

  app.use(express.json({ limit: '100kb' }));

  // CSRF check for POST/PUT/PATCH/DELETE (decision D-006).
  app.use('/api', requireTrustedOrigin(env.CLIENT_ORIGIN));

  app.get('/', (req, res) => res.json({ message: 'Digital Labour Marketplace API' }));

  // Health check: mounted BEFORE requireDb, so it answers even when the database is down. It only REPORTS
  // dbState() and never opens a connection, so it proves that the function starts, not that the database
  // works: right after a deploy a fresh serverless function says "db":"disconnected" although Atlas is fine.
  // The database check is GET /api/auth/session (behind requireDb): 200 {"user":null} = reachable, 503 = not
  // (docs/DEPLOY-RUNBOOK.md 4.8, 8.1, 8.3; decision D-079).
  // SHOW_CLIENT_IP=1 (one-off check after deployment): also the caller's own IP as the server sees it,
  // so TRUST_PROXY can be set right (docs/DEPLOY-RUNBOOK.md). Only the caller's own data.
  app.get('/api/health', (req, res) => res.json({
    ok: true,
    db: dbState(),
    ...(env.SHOW_CLIENT_IP === '1' ? { client: { ip: req.ip, forwardedFor: req.headers['x-forwarded-for'] ?? null, realIp: req.headers['x-real-ip'] ?? null } } : {}),
  }));
  app.use('/api/meta', metaRoutes); // taxonomy: no database needed

  // Every other /api route needs the database; if it is unreachable -> 503.
  app.use('/api', requireDb(env.MONGO_URI, { timeoutMs: env.DB_TIMEOUT_MS }));

  const authLimiter = createAuthLimiter({ limit: env.AUTH_RATE_LIMIT });
  app.use(['/api/auth/login', '/api/auth/register'], authLimiter);
  const uploadLimiter = createUploadLimiter({ limit: env.UPLOAD_RATE_LIMIT });
  app.use('/api/evidence', (req, res, next) => (req.method === 'POST' ? uploadLimiter(req, res, next) : next()));

  // Each route group is mounted once, under /api only (audit M1-13).
  app.use('/api/auth', authRoutes);
  app.use('/api/workers', workersRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/saved', savedRoutes);
  // Module 4 (Batch 6): bookings, reviews, and the daily cron
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/cron', cronRoutes);
  // Module 5 (Batch 7): price information (terms and payments live under /api/bookings)
  app.use('/api/prices', pricesRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
