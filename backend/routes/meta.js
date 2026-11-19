// Public, read-only data the frontend needs (no login, no database).
import express from 'express';
import { publicTaxonomy } from '../config/skillTaxonomy.js';
import { reputationRules } from '../services/reputation/rules.js';
import { validate } from '../middleware/validate.js';
import { REGIONS, regionOf } from '../config/regions.js';
import { WAGE_RULES } from '../config/wageRules.js';
import { workTermsMeta } from '../config/workTerms.js';
import { wageReferenceTable } from '../services/wage/wageReference.js';
import { wageMetaQuerySchema } from '../validators/wage.js';

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

// Module 5 (Batch 7): the minimum wage references for every region, with their status, dates, sources and age
// (config/wageReferences.js; never typed into the website). ?city= also answers the region of that city
// (null = not in the city table: then there is no minimum-wage reference). No database.
router.get('/wage-references', validate(wageMetaQuerySchema, 'query'), (req, res) => {
  const table = wageReferenceTable(new Date());
  const city = req.validated.query.city;
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    ...table,
    regions: table.regions.map((r) => ({ ...r, names: REGIONS[r.region] })),
    ...(city !== undefined ? { city: { name: city, region: regionOf(city) } } : {}),
  });
});

// Module 5: the lists of the price terms, the important conditions per category and the check ids, plus the
// limits, so the website and the server use one source. No database.
router.get('/work-terms', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    ...workTermsMeta(),
    limits: {
      amountMin: WAGE_RULES.AMOUNT_MIN, amountMax: WAGE_RULES.AMOUNT_MAX, quantityMax: WAGE_RULES.QUANTITY_MAX,
      maxTermsVersions: WAGE_RULES.MAX_TERMS_VERSIONS, maxPayments: WAGE_RULES.MAX_PAYMENTS, paymentRecordDays: WAGE_RULES.PAYMENT_RECORD_DAYS,
      largeAdvanceShare: WAGE_RULES.LARGE_ADVANCE_SHARE, paymentAmountMax: WAGE_RULES.PAYMENT_AMOUNT_MAX,
    },
  });
});

export default router;
