import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { listWorkersForAdmin, decideIdentity, revealCnic, getStats, listAudit } from '../controllers/adminController.js';
import { listUsers, getUser, setUserStatus } from '../controllers/adminUsersController.js';
import { getCharts, verifyAudit } from '../controllers/adminInsightsController.js';
import { downloadExport } from '../controllers/adminExportController.js';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, addStarterSet } from '../controllers/reasonTemplatesController.js';
import {
  adminUsersQuerySchema, userIdParams, userStatusSchema, chartsQuerySchema, exportParams, exportQuerySchema,
  templateQuerySchema, templateCreateSchema, templateUpdateSchema, templateIdParams,
} from '../validators/admin.js';
import { adminWorkersQuerySchema, profileIdParams, identityDecisionSchema, auditQuerySchema } from '../validators/workers.js';
import { listEvidenceQueue, getEvidenceForAdmin, decideEvidence } from '../controllers/adminEvidenceController.js';
import { adminEvidenceQuerySchema, evidenceIdParams, evidenceDecisionSchema } from '../validators/evidence.js';

const router = express.Router();

// Every admin route: logged in AND role admin, checked on the server.
router.use(protect, requireRole('admin'));

router.get('/workers', validate(adminWorkersQuerySchema, 'query'), listWorkersForAdmin);
router.patch('/workers/:id/identity', validate(profileIdParams, 'params'), validate(identityDecisionSchema), decideIdentity);
router.get('/workers/:id/cnic', validate(profileIdParams, 'params'), revealCnic);
router.get('/stats', getStats);
router.get('/audit', validate(auditQuerySchema, 'query'), listAudit);

// Batch 4: users (search, view, suspend / reactivate)
router.get('/users', validate(adminUsersQuerySchema, 'query'), listUsers);
router.get('/users/:id', validate(userIdParams, 'params'), getUser);
router.patch('/users/:id/status', validate(userIdParams, 'params'), validate(userStatusSchema), setUserStatus);

// Batch 4: overview charts, audit-chain check, CSV exports
router.get('/charts', validate(chartsQuerySchema, 'query'), getCharts);
router.get('/audit/verify', verifyAudit);
router.get('/exports/:kind', validate(exportParams, 'params'), validate(exportQuerySchema, 'query'), downloadExport);

// Batch 4: reason templates
router.get('/reason-templates', validate(templateQuerySchema, 'query'), listTemplates);
router.post('/reason-templates', validate(templateCreateSchema), createTemplate);
router.post('/reason-templates/starter-set', addStarterSet);
router.patch('/reason-templates/:id', validate(templateIdParams, 'params'), validate(templateUpdateSchema), updateTemplate);
router.delete('/reason-templates/:id', validate(templateIdParams, 'params'), deleteTemplate);

// Module 3: evidence review
router.get('/evidence', validate(adminEvidenceQuerySchema, 'query'), listEvidenceQueue);
router.get('/evidence/:id', validate(evidenceIdParams, 'params'), getEvidenceForAdmin);
router.patch('/evidence/:id', validate(evidenceIdParams, 'params'), validate(evidenceDecisionSchema), decideEvidence);

export default router;
