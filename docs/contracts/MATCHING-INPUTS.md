# Matching inputs from Module 4 (contract for Module 7)

Module 7 (matching) may read a worker's reputation **only** through one pure helper:

```js
import { toMatchingSignals } from '../services/reputation/matchingSignals.js';
const signals = toMatchingSignals(workerProfile.reputation); // reputation may be null (a new worker)
```

The helper is tested in `backend/tests/unit/reliabilityEngine.test.js` ("toMatchingSignals: the documented fields
only; a worker with no snapshot gets the prior and isNew"). Changing these fields is a breaking change: add new
ones, never rename or remove.

| Field | Meaning | Range |
|---|---|---|
| `expected` | the reputation's middle estimate from weighted reviews: (r + 1) / (r + s + 2) with W = 2, a = 0.5 | 0–1; 0.5 with no reviews |
| `uncertainty` | how little evidence there is: W / (r + s + W) | 0–1; 1 with no reviews |
| `cautious` | expected minus 1.2816 standard deviations of the Beta: "about 90% sure the true value is at least this" (normal approximation) | 0–1; 0.1300 with no reviews |
| `depth` | `none`, `few` (u > 0.4), `some`, `many` (u ≤ 0.2) | word |
| `reliability.expected`, `reliability.uncertainty`, `reliability.depth` | the same Beta numbers from booking outcomes (completed +1; worker cancellation early −0.5, late −1; no-show −1) | 0–1 |
| `reliability.completed`, `workerCancelledEarly`, `workerCancelledLate`, `noShows`, `acceptedTotal` | raw counts, never weighted | whole numbers |
| `perSkill[]` | `{ skillId, completedJobs, reviewCount, ratingAverage, lastCompletedAt }` per skill | |
| `repeatCustomers` | customers with 2 or more completed bookings with this worker | whole number |
| `isNew` | no reviews and no accepted booking yet (or no snapshot at all) | boolean |
| `engineVersion` | `rep-1` (the formulas); `null` for a worker without a snapshot | text |

The snapshot also stores `paramsHash` and `computedAt`; it is rebuilt after every booking outcome, review change
and dispute decision, and once a day for every worker with a booking (`docs/modules/MODULE-4.md` §3).

## Two rules for Module 7

1. **Never rank by the plain average of stars.** `ratingAverage` (in `reputation.public` and `perSkill`) is for
   display only; one lucky 5★ review would beat forty good ones. Use `cautious` or `expected` together with `uncertainty`.
2. **Handle new workers on purpose.** Ordering by `cautious` puts workers without a record lower (the cold-start
   problem, Pallais 2014). Module 7's own research question is fair exposure: decide explicitly how new workers
   (`isNew`, high `uncertainty`) get seen, and measure it.

Simulation results about these fields (`docs/modules/MODULE-4.md` §5) are **simulation results only**.
