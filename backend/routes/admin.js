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
import {
  listBookings, getBookingForAdmin, listDisputes, decideDispute, listReviewsForAdmin, moderateReview, listFlags, decideFlag,
  getWorkerReputationForAdmin, getBookingStats,
} from '../controllers/adminReputationController.js';
import {
  adminBookingsQuerySchema, bookingIdParams, disputesQuerySchema, disputeDecisionSchema, adminReviewsQuerySchema, reviewIdParams,
  reviewModerationSchema, flagsQuerySchema, flagIdParams, flagDecisionSchema, adminWorkerIdParams, statsQuerySchema,
} from '../validators/bookings.js';
import { listPriceGuides, createPriceGuide, updatePriceGuide, listPayments } from '../controllers/adminWageController.js';
import { priceGuideQuerySchema, priceGuideCreateSchema, priceGuideUpdateSchema, priceGuideIdParams, adminPaymentsQuerySchema } from '../validators/wage.js';

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
// Module 4 names for the two new exports (same handler, same checks)
router.get('/export/bookings.csv', (req, res, next) => { req.params.kind = 'bookings'; next(); }, validate(exportParams, 'params'), validate(exportQuerySchema, 'query'), downloadExport);
// Module 5 name for the payments export (same handler, same checks)
router.get('/export/payments.csv', (req, res, next) => { req.params.kind = 'payments'; next(); }, validate(exportParams, 'params'), validate(exportQuerySchema, 'query'), downloadExport);
router.get('/export/reviews.csv', (req, res, next) => { req.params.kind = 'reviews'; next(); }, validate(exportParams, 'params'), validate(exportQuerySchema, 'query'), downloadExport);

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

// Module 4: bookings, disputes, review moderation, reputation flags, breakdown, charts
router.get('/bookings', validate(adminBookingsQuerySchema, 'query'), listBookings);
router.get('/bookings/:id', validate(bookingIdParams, 'params'), getBookingForAdmin);
router.patch('/bookings/:id/dispute', validate(bookingIdParams, 'params'), validate(disputeDecisionSchema), decideDispute);
router.get('/disputes', validate(disputesQuerySchema, 'query'), listDisputes);
router.get('/reviews', validate(adminReviewsQuerySchema, 'query'), listReviewsForAdmin);
router.patch('/reviews/:id', validate(reviewIdParams, 'params'), validate(reviewModerationSchema), moderateReview);
router.get('/reputation-flags', validate(flagsQuerySchema, 'query'), listFlags);
router.patch('/reputation-flags/:id', validate(flagIdParams, 'params'), validate(flagDecisionSchema), decideFlag);
router.get('/workers/:id/reputation', validate(adminWorkerIdParams, 'params'), getWorkerReputationForAdmin);
router.get('/stats/bookings', validate(statsQuerySchema, 'query'), getBookingStats);

// Module 5 (Batch 7): the price guide (always with a written source) and the read-only Payments page
router.get('/price-guides', validate(priceGuideQuerySchema, 'query'), listPriceGuides);
router.post('/price-guides', validate(priceGuideCreateSchema), createPriceGuide);
router.patch('/price-guides/:id', validate(priceGuideIdParams, 'params'), validate(priceGuideUpdateSchema), updatePriceGuide);
router.get('/payments', validate(adminPaymentsQuerySchema, 'query'), listPayments);

export default router;
