// Public, read-only data the frontend needs (no login, no database).
import express from 'express';
import { publicTaxonomy } from '../config/skillTaxonomy.js';

const router = express.Router();

router.get('/taxonomy', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(publicTaxonomy());
});

export default router;
