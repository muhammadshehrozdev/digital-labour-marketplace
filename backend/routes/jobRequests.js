// Module 6 (Batch 8A): the job request routes, /api/job-requests. All behind protect. Workers get 403 on every one of
// them: a worker sees a job only through a booking request sent to that worker (team decision 2, 23 Nov 2026).
// The role check is here; ownership is checked in the controller (a filter on the logged-in customer's own id -> 404).
// No extra rate limiter (docs/SECURITY.md): analyze is cheap, saves nothing and only analyses the caller's own text;
// creating a job has its own daily limit.
import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  analyzeText, createJob, listMyJobs, getMyJob, updateJob, closeJob, deleteJob, listWorkersForJob, requestWorkerForJob,
} from '../controllers/jobRequestsController.js';
import {
  analyzeSchema, createJobSchema, updateJobSchema, closeJobSchema, myJobsQuerySchema, jobIdParams, jobWorkersQuerySchema, jobRequestWorkerSchema,
} from '../validators/jobRequests.js';

const router = express.Router();
const customer = requireRole('customer');
const id = validate(jobIdParams, 'params');

router.use(protect);
// before /:id
router.post('/analyze', requireRole('customer', 'admin'), validate(analyzeSchema), analyzeText);
router.get('/mine', customer, validate(myJobsQuerySchema, 'query'), listMyJobs);

router.post('/', customer, validate(createJobSchema), createJob);
router.get('/:id', customer, id, getMyJob);
router.patch('/:id', customer, id, validate(updateJobSchema), updateJob);
router.post('/:id/close', customer, id, validate(closeJobSchema), closeJob);
router.delete('/:id', customer, id, deleteJob);
router.get('/:id/workers', customer, id, validate(jobWorkersQuerySchema, 'query'), listWorkersForJob);
router.post('/:id/request', customer, id, validate(jobRequestWorkerSchema), requestWorkerForJob);

export default router;
