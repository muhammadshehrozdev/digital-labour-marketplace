// Builds the Express app (no listen). Used by server.js, by Vercel and by the tests.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { getEnv } from './config/env.js';
import { configureMongoose, requireDb, dbState } from './config/db.js';
import { createAuthLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';

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

  app.get('/', (req, res) => res.json({ message: 'Digital Labour Marketplace API' }));

  // Health check works even when the database is down, and reports its state.
  app.get('/api/health', (req, res) => res.json({ ok: true, db: dbState() }));

  // Every other /api route needs the database; if it is unreachable -> 503.
  app.use('/api', requireDb(env.MONGO_URI, { timeoutMs: env.DB_TIMEOUT_MS }));

  const authLimiter = createAuthLimiter({ limit: env.AUTH_RATE_LIMIT });
  app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

  // Each route group is mounted once, under /api only (audit M1-13).
  app.use('/api/auth', authRoutes);
  app.use('/api/worker', workerRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
