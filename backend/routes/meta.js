// Public, read-only data the frontend needs (no login, no database).
import express from 'express';
import { publicTaxonomy } from '../config/skillTaxonomy.js';
import { reputationRules } from '../services/reputation/rules.js';

const router = express.Router();

router.get('/taxonomy', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(publicTaxonomy());
});

// Batch 6B: the reputation rules of the live engine (ids and numbers only; the website words them). Used by
// the Help Centre guide, so its text always matches the code. No input, no database.
router.get('/reputation-rules', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(reputationRules());
});

export default router;
