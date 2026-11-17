# Reputation evaluation by simulation (Module 4)

How the **weighted Beta reputation model** (`services/reputation/reputationEngine.js`) is compared with
simple baselines. The team reports that the supervisor approved evaluating the reputation engine by
simulation (decision D-038).

> **Every number these scripts print is a SIMULATION RESULT.** It shows how the methods behave **if** the
> simulator's assumptions below hold. It does **not** show that the assumptions are true, and it is
> **not** a real-world result. Quote a number only with the word "simulation", the scenario, the number
> of seeds and the parameter hash. A small real pilot is still needed:
> [`docs/evaluation/REPUTATION-PILOT-PLAN.md`](../../../docs/evaluation/REPUTATION-PILOT-PLAN.md) (a plan, no results).

| File | Purpose |
|---|---|
| `evaluate.js` | `npm run evaluate:reputation -- --scenario <name\|all> --seeds 30` — prints the tables and writes `results/SIMULATION-<date>-<scenario>.json` (date, scenario, seeds, parameter hash, git commit). |
| `explore.js` | `node evaluation/reputation/explore.js --seeds 30` — **parameter exploration** (trust floor, half-life) and a check of the simulator's noise assumption. Writes `results/SIMULATION-<date>-exploration.json`. Never changes the live parameters. |
| `simulate.js` | The synthetic world (workers, hidden quality, reviews, attacks). |
| `methods.js` | Baselines B1-B4, ours, ablations. "Ours" **imports** the production engine; nothing is copied. |
| `metrics.js` | Kendall's tau-b, NDCG@k, Precision@k, summaries, paired comparison (pure, unit-tested). |
| `selectRep2.js` | Batch 6B: `node evaluation/reputation/selectRep2.js` — the rep-2 selection on the **development** seeds (see "rep-2 protocol"). Writes `results/SIMULATION-rep2-dev-<date>-selection.json`. |
| `rep2Criteria.js` | Batch 6B: `node evaluation/reputation/rep2Criteria.js [--markdown]` — S1, S2, S3 from the **test-seed** files; never runs a simulation. |
| `rng.js` | Seeded random numbers (mulberry32, Box-Muller, Gamma/Beta, geometric). No `Math.random`. |
| `config.js` | Every value below, and the scenarios. |
| `results/` | Output files of real runs of these scripts (all simulation). |

## The simulated world (`config.js`, `simulate.js`)

| Value | Setting | Why |
|---|---|---|
| Workers per run | 300 | a city-sized directory |
| Hidden true quality `q` | Beta(4, 2), mean about 0.67 | most workers decent, some poor |
| Workers without reviews | 30% | the sparse data we expect at launch |
| Reviews per other worker | 1 + Geometric(mean 3) = mean 4, at most 60 | few reviews for most, many for a few |
| Stars of a genuine review | `clamp(round(1 + 4 * clip(q + L + e, 0, 1)), 1, 5)`, `e ~ Normal(0, 0.15)` | stars follow quality with some noise |
| Leniency `L` | 0 (base); +0.15 (inflation) | Filippas, Horton & Golden (2022) |
| Review ages | uniform over the last 24 months | |
| Genuine reviewer's other workers | Geometric(mean 1.5) | most customers hired one or two others |
| Completion method | 90% `both`, 10% `auto` | |
| Ground truth | ranking by `q` (after a quality change: the quality now) | |
| "Today" | 1 Jan 2026 (fixed, so a seed always gives the same world) | |
| Seeds | 20261116, 20261117, ... (30 by default) | |

Separate random streams are used for the genuine data, the attacks, the quality change and the
tie-breaks, so an attacked world has **exactly** the genuine reviews of the base world with the same
seed. That makes the paired comparison and the attack lift fair.

## Scenarios

| Name | What changes |
|---|---|
| `base` | Sparse data, no inflation, no attacks |
| `inflation` | Leniency `L = +0.15` for every review |
| `sybil_k3`, `sybil_k5`, `sybil_k10` | 10% of all workers, chosen from the lower half of `q`, each get k fake 5 star reviews, each from a fresh account (`reviewerOtherWorkers = 0`), recent (last 30 days), completed by `both` (Douceur 2002) |
| `smart_sybil_k3`, `_k5`, `_k10` | As `sybil`, but each fake account first completed jobs with 1 to 3 other workers (a costly attack) |
| `pair_collusion` | 5% of workers get 4 extra 5 star reviews from one repeat customer (a real account, last 60 days) |
| `quality_change` | 20% of workers lost 0.3 of quality twelve months ago; older reviews reflect the old quality |
| `combined` | `inflation` + `sybil_k5` + `pair_collusion` + `quality_change` |

| `slow_sybil` (6B) | As `sybil_k5`, but the five fake reviews are spread evenly over the last 12 months (ages 36.5, 109.5, 182.5, 255.5, 328.5 days): no burst. The same workers are attacked as in `sybil_k5` |
| `busy_genuine` (6B) | 10% of workers (chosen at random, any quality) get 8 extra **genuine** reviews from the last 14 days (stars from their quality, own random stream): the cost of the burst check |
| `new_platform` (6B) | 80% of genuine reviewers have no other hiring history (each review: with probability 0.8 the reviewer's count is 0, otherwise its base draw but at least 1); stars and dates as in `base`: the cost of the new-reviewer budget on a young platform |
| `base_noise30`, `base_noise50`, `sybil_k5_noise30`, `sybil_k5_noise50` (6B) | `base` / `sybil_k5` with star noise sd 0.3 and 0.5 (the default is 0.15): the noise variants |

`--scenario sybil` runs the three `sybil_k*` scenarios; `--scenario noise` the four noise variants;
`--scenario all` runs every scenario. The three Batch 6B scenarios use their own random streams, so every
other draw (the genuine reviews, the attacks) stays exactly as in `base`.

## Methods (`methods.js`)

- **B1** plain average of stars (workers without reviews go last; ties broken by the seeded generator).
- **B2** Bayesian average `(sum of stars + m * C) / (n + m)`, `m = 5`, `C` = mean of all reviews in the run.
- **B3** Wilson lower bound (Wilson 1927, z = 1.96) on the share of 4 and 5 star reviews.
- **B4** plain Beta `expected` with every weight 1 (Josang & Ismail 2002).
- **Ours**: the production engine's `cautious` score (what "Best track record" orders by).
- **Ablations**: `expected` instead of `cautious`; ours without recency / reviewer trust / pair factor / provenance.

## Metrics (`metrics.js`)

- Kendall's tau-b (Kendall 1938) between a method's scores and `q`, ties handled.
- NDCG@10 and NDCG@20 (Jarvelin & Kekalainen 2002), gain = `q`.
- Precision@10: the share of a method's top 10 whose `q` is in the true top 20%.
- **Attack lift**: for the attacked workers, their mean rank without the attack minus their mean rank
  with it, same seed: **how many places the fake reviews bought** (lower is better; 0 = no effect).
- **New-worker position**: mean percentile rank (100 = first) of workers with no reviews. Reported, not
  optimised: fair exposure of new workers is Module 7's research question.
- Every ranking metric for all workers and for workers with at least one review.
- Per scenario and method: mean, standard deviation, 2.5th and 97.5th percentiles across seeds, and a
  **paired** comparison of ours against every other method, seed by seed (mean difference, share of
  seeds where ours is better).

## rep-2 protocol (Batch 6B, pre-registered; written here BEFORE any rep-2 run)

The Batch 6 results (above, rep-1) showed that the rep-1 settings are not better than a plain average.
rep-2 (`config/reputationParams.js`) makes five changes that follow from that analysis: recency off; a budget
of B reviews' worth for all new reviewers together instead of the trust floor; an optional burst check; the
platform's mean rating as the prior (0.5 below 20 reviews); `expected` as the ranking number.

| Step | What | Seeds |
|---|---|---|
| Seeds | **development seeds 20261116..20261145** (30, already seen in Batch 6); **test seeds 20270101..20270130** (30, never used before). Constants in `config.js` (`DEV_SEED_BASE`, `TEST_SEED_BASE`, `PROTOCOL_SEEDS`). No unit test runs the test seeds. | |
| Candidates | B in {1, 2, 3} x burst {off, on}: six candidates, all with changes 1, 4 and 5 (`REP2_CANDIDATES`) | |
| Selection rule | Among the candidates whose base-world NDCG@10 (all workers, `expected`) is at least B4's minus 0.01, the highest mean NDCG@10 over `sybil_k3`, `sybil_k5`, `sybil_k10`, `pair_collusion`, `combined`. Ties: smaller B, then burst off. No candidate passes: stop, the team decides. `selectRep2.js` | development only |
| Freeze | The chosen values go into `REP2_SELECTED`; unit tests run; **commit**. That commit is the pre-registration: it is older than every test-seed file. | |
| Test run, once | `npm run evaluate:reputation -- --protocol rep2-test --scenario all --seeds 30`: B1, B2, B3, B4, rep-1 (expected, cautious), rep-2 (expected, cautious), every scenario including the noise variants. Files `results/SIMULATION-rep2-test-<date>-<scenario>.json` with the commit, the per-seed numbers and `startedAt`. The script refuses before the freeze, with uncommitted changes, with other seeds or worker counts, and a second time (only `--rerun "<reason>"` after a bug fix, and the reason is written into every file and reported). | test only |
| S1 | In `base`, mean NDCG@10 of rep-2 (`expected`) >= B4 - 0.01 **and** >= B1. | test |
| S2 | In `sybil_k3`, `sybil_k5`, `sybil_k10`, `pair_collusion`, `combined`: rep-2 has a lower attack lift **and** a higher NDCG@10 than B1 **and** than B4, each in at least 80% of seeds (paired, seed by seed). | test |
| S3 | rep-2 has a higher NDCG@10 than rep-1 (cautious) in `base` and every S2 scenario, in at least 80% of seeds. | test |
| Report only | `smart_sybil_*`, `slow_sybil`, `busy_genuine`, `new_platform`, `inflation`, `quality_change`, the noise variants; Kendall's tau-b, Precision@10, the new-worker percentile. | test |
| Engine | S1 and S3 hold: rep-2 becomes the production engine. Otherwise rep-1 stays live and the team decides. S2 only decides what the report may claim. | |

"Higher" and "lower" are strict (a tie is not a win). rep-2's platform base rate in the simulator is the mean
of ALL reviews of the run, fakes included, as it would be in reality.

## Honesty notes (read before quoting anything)

1. These are **simulation results**. The simulator's assumptions favour the defences built for them:
   for example, naive fake accounts have **no hiring history**, which is exactly what reviewer trust
   looks for. That is why `smart_sybil` exists: it measures how much protection is left when the
   attacker pays for a hiring history.
2. Assumptions can also work **against** a defence, and the results must be read with that in mind:
   fake reviews are recent, and the recency factor gives recent reviews more weight.
3. The star noise (`sd 0.15`) is an assumption. With little noise a single review already says a lot
   about quality, so methods that are careful with few reviews are at a disadvantage. `explore.js`
   reruns two scenarios with more noise to show how much the conclusions depend on this.
4. `explore.js` tries other parameter values. Picking a value there and reporting the same runs as
   proof would be circular: any change to the live parameters must be checked on new seeds and on the
   real pilot, and recorded as a decision.
5. Never round a result up, never call it a real-world result, and never drop a scenario because its
   numbers are unwelcome.

## References

Josang & Ismail (2002); Douceur (2002); Filippas, Horton & Golden (2022); Wilson (1927); Kendall (1938);
Jarvelin & Kekalainen (2002). Full entries: `docs/modules/MODULE-4.md`.
