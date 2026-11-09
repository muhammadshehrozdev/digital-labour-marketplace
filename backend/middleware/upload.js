// Multipart upload for ONE evidence photo, kept in memory (never written to disk; Vercel's disk is
// read-only). Attached only to POST /api/evidence. Limits: 4 MB, one file, few fields.
// No fileFilter: the real type is checked from the bytes afterwards (services/evidence/image.js).
import multer from 'multer';
import { MAX_UPLOAD_BYTES } from '../config/evidence.js';

export const evidenceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5, parts: 6 },
}).single('image');

export const MSG_TOO_LARGE = 'The photo is too large. The limit is 4 MB.';
