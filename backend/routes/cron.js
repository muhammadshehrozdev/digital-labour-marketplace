// Module 4: the daily cron (Vercel). Only with "Authorization: Bearer <CRON_SECRET>"; 401 otherwise.
import express from 'express';
import { requireCronSecret, runDaily } from '../controllers/cronController.js';

const router = express.Router();
router.get('/daily', requireCronSecret, runDaily);

export default router;
