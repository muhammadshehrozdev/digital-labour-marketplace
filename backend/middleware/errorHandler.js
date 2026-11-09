// 404 for unknown routes and one central error handler (audit M1-7, M1-13).
// Rule: a 500 never sends error.message to the browser. Details go to the server log only.
import mongoose from 'mongoose';

export const GENERIC_500 = 'Something went wrong on the server. Please try again later.';

export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Body problems from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  // Our own HttpError (status + safe message)
  if (err.expose && Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  // Database errors that are the caller's fault. Field names only, never the values.
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This record already exists' });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: `Invalid value for: ${Object.keys(err.errors).join(', ')}` });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Invalid id or value' });
  }

  // Anything else is our bug: log it, send a generic message.
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err && err.stack ? err.stack : err);
  return res.status(500).json({ message: GENERIC_500 });
}
