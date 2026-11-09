import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { listWorkersForAdmin, decideIdentity, revealCnic, listUsersForAdmin, getStats, listAudit } from '../controllers/adminController.js';
import { adminWorkersQuerySchema, profileIdParams, identityDecisionSchema, auditQuerySchema } from '../validators/workers.js';

const router = express.Router();

// Every admin route: logged in AND role admin, checked on the server.
router.use(protect, requireRole('admin'));

router.get('/workers', validate(adminWorkersQuerySchema, 'query'), listWorkersForAdmin);
router.patch('/workers/:id/identity', validate(profileIdParams, 'params'), validate(identityDecisionSchema), decideIdentity);
router.get('/workers/:id/cnic', validate(profileIdParams, 'params'), revealCnic);
router.get('/users', listUsersForAdmin);
router.get('/stats', getStats);
router.get('/audit', validate(auditQuerySchema, 'query'), listAudit);

export default router;
