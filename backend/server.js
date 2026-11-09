// Entry point.
// - On your computer: checks the settings, connects to MongoDB, then listens on HOST:PORT.
// - On Vercel: only builds and exports the app (Vercel calls it for each request).
import 'dotenv/config';
import { getEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

let env;
try {
  env = getEnv();
} catch (err) {
  console.error(err.message);
  if (process.env.VERCEL) throw err;
  process.exit(1);
}

const app = createApp();

if (!process.env.VERCEL) {
  try {
    await connectDB(env.MONGO_URI, { timeoutMs: env.DB_TIMEOUT_MS });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Could not connect to MongoDB. Is it running? Details:', err.message);
    process.exit(1);
  }
  app.listen(env.PORT, env.HOST, () => {
    console.log(`Backend API running on http://${env.HOST}:${env.PORT}`);
  });
}

export default app;
