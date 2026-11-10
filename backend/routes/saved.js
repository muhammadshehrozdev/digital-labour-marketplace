import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { listSaved, listSavedIds, saveWorker, unsaveWorker } from '../controllers/savedController.js';
import { workerIdCodeParams } from '../validators/workers.js';

const router = express.Router();

// Saved workers belong to customers (a worker may not browse other workers, audit M1-2).
router.use(protect, requireRole('customer'));
router.get('/', listSaved);
router.get('/ids', listSavedIds);
router.put('/:workerIdCode', validate(workerIdCodeParams, 'params'), saveWorker);
router.delete('/:workerIdCode', validate(workerIdCodeParams, 'params'), unsaveWorker);

export default router;
