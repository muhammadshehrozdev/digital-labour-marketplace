// 404 for unknown routes and one central error handler (audit M1-7, M1-13).
// Rule: a 500 never sends error.message to the browser. Details go to the server log only.
import mongoose from 'mongoose';
import multer from 'multer';
import { errorBody } from '../utils/httpError.js';
import { ERRORS } from '../errors/catalog.js';

export const GENERIC_500 = ERRORS.SERVER_ERROR;

export function notFound(req, res) {
  res.status(404).json(errorBody('ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Body problems from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(errorBody('INVALID_JSON'));
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json(errorBody('BODY_TOO_LARGE'));
  }

  // Upload problems from multer (Module 3)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json(errorBody('PHOTO_TOO_LARGE'));
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(errorBody('PHOTO_FIELD'));
    }
    return res.status(400).json(errorBody('UPLOAD_FORM_INVALID'));
  }
  if (/Unexpected end of form|Malformed part header|Multipart: Boundary not found/i.test(String(err.message))) {
    return res.status(400).json(errorBody('UPLOAD_INCOMPLETE'));
  }

  // Our own HttpError (status + safe message)
  if (err.expose && Number.isInteger(err.status) && err.status >= 400 && err.status < 500) {
    if (err.name === 'HttpError') return res.status(err.status).json(errorBody(err.code, err.params));
    return res.status(err.status).json(errorBody('INVALID_VALUE', { field: 'request' }));
  }

  // Database errors that are the caller's fault. Field names only, never the values.
  if (err.code === 11000) {
    return res.status(409).json(errorBody('DUPLICATE_RECORD'));
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json(errorBody('DB_VALIDATION', { fields: Object.keys(err.errors).join(', ') }));
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(errorBody('INVALID_ID_OR_VALUE'));
  }

  // Anything else is our bug: log it, send a generic message.
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err && err.stack ? err.stack : err);
  return res.status(500).json(errorBody('SERVER_ERROR'));
}
