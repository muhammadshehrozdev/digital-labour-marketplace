# Contract: the job profile for Module 7 (matching)

Written in Batch 8A (24 Nov 2026). Module 6 gives Module 7 a job request as a **matching query** through one pure
helper, `backend/services/jobs/matchingQuery.js` → `toMatchingQuery(job)`. A unit test checks that it returns
**exactly** these fields (`tests/unit/jobState.test.js`, "the documented fields only").

| Field | Type | Meaning |
|---|---|---|
| `category` | taxonomy category id | the trade the customer confirmed |
| `skillIds` | taxonomy skill ids (0–5, all of `category`) | the skills the customer confirmed |
| `taskType` | `install` · `repair` · `service` · `new_work` · `cleaning` · `moving` · `household_help` · `null` | the kind of work |
| `city` | text (as the customer wrote it) | where the work is |
| `marketCity` | text | the comparable city key: the English name of a known city ("Pindi" → "Rawalpindi"), else the normalised spelling (`config/regions.js`) |
| `region` | `ICT` · `PB` · `SD` · `KP` · `BA` · `GB` · `AJK` · `null` | from the city table at save time; `null` = not in the table |
| `preferredDate` | `YYYY-MM-DD` · `null` | the customer's preferred day |
| `timeSlot` | `morning` · `afternoon` · `evening` · `any` · `null` | the preferred time |
| `urgent` | boolean | the customer marked it urgent |

## Rules for Module 7

1. **Never use the budget to rank or filter workers.** The budget is private to the customer and admins; it is not
   in the matching query on purpose (see also `PRICE-INPUTS.md`: no price-based ordering).
2. **The description is for people to read**, not a matching input (it is not in the query).
3. **Add fields, never rename or remove them.** A new field gets a line in this table and in the test.
4. A worker sees a job only through a booking request sent to that worker. Module 7 may rank the customer's
   "workers for this job" list; it does not show jobs to workers.
5. The current list (`GET /api/job-requests/:id/workers`) is a **filter, not a ranking** (D-084): same trade, same
   city, listed and not suspended, in the customer's chosen directory sort, at most 500 candidates before the city
   filter (`truncated: true` when the limit was reached). Module 7 replaces it with ranking and fair exposure.

The reputation inputs Module 7 may combine with this query are in `MATCHING-INPUTS.md`.
