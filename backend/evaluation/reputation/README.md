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

`--scenario sybil` runs the three `sybil_k*` scenarios; `--scenario all` runs every scenario.

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
