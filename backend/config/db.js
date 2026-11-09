// One cached MongoDB connection, safe for serverless (Vercel) and for local use.
// The connect *promise* is cached at module scope, so many requests arriving at
// once share one connection attempt (Mongoose's serverless guide).
import mongoose from 'mongoose';

// sanitizeFilter: if a user value such as { $ne: 'x' } ever reaches a filter,
// Mongoose wraps it in $eq so it is treated as plain data (audit M1-4).
// On in every environment, including production. Our own operators must be
// marked with mongoose.trusted(...).
mongoose.set('sanitizeFilter', true);

export function configureMongoose(nodeEnv) {
  // Throw on filters that use fields not in the schema (typo protection) — dev/tests only.
  mongoose.set('strictQuery', nodeEnv === 'production' ? true : 'throw');
}

let connecting = null;

export function connectDB(uri, { timeoutMs = 5000 } = {}) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connecting) {
    connecting = mongoose
      .connect(uri, { serverSelectionTimeoutMS: timeoutMs, maxIdleTimeMS: 60000 })
      .then((m) => m.connection)
      .catch((err) => {
        connecting = null; // let the next request try again
        throw err;
      });
  }
  return connecting;
}

// Express middleware: make sure the database is reachable before a route runs.
// If not, answer 503 instead of failing later with an unclear 500 (audit M1-12).
export function requireDb(uri, options) {
  return async (req, res, next) => {
    try {
      await connectDB(uri, options);
      next();
    } catch (err) {
      console.error('[db] connection failed:', err.name, err.message);
      res.status(503).json({ code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable. Please try again in a minute.' });
    }
  };
}

export function dbState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
}
