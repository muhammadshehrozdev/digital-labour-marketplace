// Module 3 worker routes. Customers never reach evidence (403); another worker gets 404.
import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { evidenceUpload } from '../middleware/upload.js';
import { uploadEvidence, listMyEvidence, getEvidenceFile, deleteEvidence } from '../controllers/evidenceController.js';
import { uploadFieldsSchema, evidenceIdParams, myEvidenceQuerySchema } from '../validators/evidence.js';

const router = express.Router();

// Login and role are checked BEFORE the file is read into memory.
router.post('/', protect, requireRole('worker'), evidenceUpload, validate(uploadFieldsSchema), uploadEvidence);
router.get('/mine', protect, requireRole('worker'), validate(myEvidenceQuerySchema, 'query'), listMyEvidence);
router.get('/:id/file', protect, requireRole('worker', 'admin'), validate(evidenceIdParams, 'params'), getEvidenceFile);
router.delete('/:id', protect, requireRole('worker'), validate(evidenceIdParams, 'params'), deleteEvidence);

export default router;
