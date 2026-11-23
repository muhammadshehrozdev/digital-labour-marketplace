# Contract: price inputs for Modules 6 and 7 (Batch 7)

What later modules may read from Module 5. Everything else (notes, payment records, conditions, the waiting
version) is not part of this contract and may change.

| Field | Source | Meaning |
|---|---|---|
| `terms.agreed.total` | `Booking` | the total both people agreed (whole rupees), or `null` |
| `terms.agreed.unit` | `Booking` | `job`, `day` or `hour` |
| `paymentSummary(booking).state` | `services/wage/paymentSummary.js` (also stored as `Booking.paymentState`) | `has_dispute`, `no_price`, `paid`, `part_paid`, `not_paid` |
| the `priceRange` output | `services/wage/priceRange.js` (`GET /api/prices/estimate`) | `{ level, scope, unit, low, median, high, jobs, workers }` or `null`: aggregates only |

Rules:
- Read only `terms.agreed` (never the current proposal): only it was agreed by both people.
- **Never rank or filter workers by price alone.** A price says nothing about the quality of the work, and a ranking by
  price would push wages down. A price may be shown next to other information, or used as a budget hint.
- The range is shown only with the minimums of `config/wageRules.js`; a later module must not lower them to show a
  range earlier, and must never expose individual amounts.
