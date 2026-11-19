# Price-range evaluation by simulation (Module 5)

How robust is the platform **price range** (`services/wage/priceRange.js`) when there are few jobs, and how far
can one dishonest worker or one friendly pair move it? It is compared with a plain average and a plain median.

> **Every number these scripts print is a SIMULATION RESULT**, made with **assumed** price spreads and
> **assumed** attacks. It shows how the rules behave **if** the assumptions below hold. It does **not** show what
> real prices look like, and it is **not** a real-world result. Quote a number only with the word
> "simulation", the scenario and the number of seeds. Real prices are needed:
> [`docs/evaluation/PRICE-PILOT-PLAN.md`](../../../docs/evaluation/PRICE-PILOT-PLAN.md) describes how the team can
> collect them with consent and use them for the admin price guide with a source (a plan only, no results).
>
> Module 5 is **not** the core research contribution of the project (that is Modules 4 and 7). This harness is
> small on purpose. **No success criteria are fixed**: it reports what it shows, including where ours is worse.

| File | Purpose |
|---|---|
| `evaluate.js` | `npm run evaluate:price-range -- --scenario <name\|all> --seeds 30` — prints the tables and writes `results/SIMULATION-price-<date>-<scenario>.json` (date, scenario, seeds, parameter hash, git commit). |
| `simulate.js` | The synthetic markets (hidden typical price, genuine prices, jobs, attacks). |
| `methods.js` | M1 (plain mean), M2 (plain median), ours. "Ours" **imports** the production `priceRange`; nothing is copied. |
| `metrics.js` | Availability, error, coverage, attack shift (pure, unit-tested). Summaries and the paired comparison are imported from `../reputation/metrics.js`. |
| `config.js` | Every value below, and the scenarios. |
| `results/` | Output files of real runs of these scripts (all simulation). |

Random numbers: `../reputation/rng.js` (seeded mulberry32; no `Math.random`). The same seed always gives the same
markets. Seed `i` of a run is `20261119 + i`. The simulated "today" is fixed at 19 Nov 2026.

## The simulated world (`config.js`, `simulate.js`) — assumptions, not facts

| Value | Setting | Note |
|---|---|---|
| Markets per seed | 40 | one skill in one city, unit `job` |
| Hidden true typical price `m` | Uniform(Rs 1,000, Rs 6,000) | |
| A genuine agreed price | `round(m × exp(ε))`, `ε ~ Normal(0, 0.35)` | prices spread around `m` (log-normal); **an assumption** |
| Completed jobs per market | Geometric, mean 8 (`sparse`: mean 3) | some markets have 0 jobs |
| Workers per market | 2 to 10 (uniform); each job's worker at random | |
| Customers | mostly different; 15% of jobs repeat an earlier customer–worker pair | |
| Auto-completed jobs | 10% | the production rule excludes them; M1 and M2 use them |
| Proposed-only price (never agreed) | 20% | the production rule excludes them; M1 and M2 use the proposed amount |
| Job ages | uniform over the last 330 days | all inside the 365-day window, so the window plays no part here |
| Held-out genuine prices | 20 per market | never used for estimating; only for coverage |

## Scenarios

| Name | What changes |
|---|---|
| `base` | as above |
| `sparse` | mean 3 jobs per market (a young platform) |
| `inflator` | in 30% of markets one worker adds 4 jobs at `2.5 × m` with 2 fake customer accounts (both-confirmed, recent) |
| `pair_flood` | in 30% of markets one customer–worker pair adds 6 jobs at `2 × m` |

Attack jobs come from a separate random stream, so a market "with the attack" and "without the attack" have
exactly the same genuine jobs (tested).

## Methods

- **M1** the plain mean of every completed job with a price (auto-completed and proposed-only included), no
  minimums. Its interval for coverage is mean ± one standard deviation, so the coverage comparison with M1 is
  **only rough** (a different kind of interval).
- **M2** the plain median of the same jobs, no minimums; interval = their 25th to 75th percentile.
- **Ours**: the production `priceRange`, imported, with the production rules of `config/wageRules.js`
  (both-confirmed and agreed only, one job per customer–worker pair, at least 5 jobs from 3 workers and 3
  customers, the middle half, rounded to Rs 50), city level only (each market is one city). Its numbers are
  rounded to Rs 50 and M1/M2 are not: that adds at most Rs 25 of error to ours (2.5% at `m` = Rs 1,000).

## Metrics (`metrics.js`)

- **Availability**: the share of markets where the method gives a number. The minimums make the range appear
  **later** on a young platform; availability is how this cost is measured.
- **Error**: the median, over markets with a number, of `|median − m| / m` (M1: its mean).
- **Coverage**: the share of the held-out genuine prices inside `[low, high]`, averaged over markets with a
  number. For a middle half it is about 0.5 by design: a sanity check, **not a target**.
- **Attack shift**: for attacked markets with a number both with and without the attack, the mean of
  `|value with attack − value without attack| / m` (same seed). Markets where the attack made a number
  **appear** (or disappear) cannot have a shift; they are counted separately ("appeared", "disappeared").

Across seeds: mean, standard deviation and 2.5th / 97.5th percentiles, and a paired comparison of ours against
M1 and M2 seed by seed (mean difference and the share of seeds where ours is better).

## Results

See `docs/modules/MODULE-5.md` §8 for the tables of the final run (with the date, the seeds and the parameter
hashes) and `results/` for the JSON files. Each number there is a SIMULATION result.

## What this does not show

- Real price spreads may not be log-normal, and real dishonest behaviour may not look like these two attacks.
- The minimums are a trade-off: fewer markets get a number (availability), in exchange for numbers that one
  person or one pair moves less. The simulation measures both sides; it does not decide what is "good enough".
- A worker with **several** fake customer accounts can still make a range appear or move it (the `inflator`
  attack uses 2 fake customers on purpose). The rule "at least 3 different customers" limits this; it cannot
  stop a worker who controls 3 or more accounts. Admin review of unusual patterns remains necessary.
