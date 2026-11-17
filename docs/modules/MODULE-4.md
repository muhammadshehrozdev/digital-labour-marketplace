# Module 4 — Reputation and Reliability Engine (Batch 6, 16–17 Nov 2026)

Bookings that create real work records, reviews after completed work, a weighted reputation score that
says how sure it is, a reliability record, and an evaluation by simulation. Nothing in this module is
"AI": every number comes from written formulas (a weighted Beta reputation model) and fixed rules.

The team reports that the supervisor approved (1) keeping a minimal Work Booking inside Module 4 and
(2) evaluating the reputation engine by simulation (16 Nov 2026; decisions D-037 and D-038).

## 1. What the module does (proposal bullets)

| Proposal bullet | How it is met |
|---|---|
| Collection of customer ratings and reviews after completed work | A review is possible only for a `completed` booking, only by its customer, once, within 14 days, not while a dispute is open; never editable (D-041). |
| Calculation of worker reputation based on work-related records | `services/reputation/reputationEngine.js`: each review is weighed by how the job was confirmed, its age, the reviewer's hiring history and repeats by the same customer (D-043, D-044). |
| Maintenance of reliability indicators such as completed jobs and cancellations | `services/reputation/reliabilityEngine.js` from booking outcomes (completed, early and late worker cancellations, no-shows); declining never counts (D-040, D-046). |
| Display of relevant reputation information on worker profiles | Public profile: stars with the count, depth in words, star bars, quick-answer counts, reliability counts, reviews with replies, verified work history; directory card line (D-047). |
| Use of verified work history as supporting information for future matching | `toMatchingSignals(snapshot)` and `docs/contracts/MATCHING-INPUTS.md` for Module 7; "Best track record" sort (D-045). |

## 2. The booking state machine

```mermaid
stateDiagram-v2
    [*] --> requested: customer sends a request
    requested --> accepted: worker accepts
    requested --> declined: worker declines (never counts)
    requested --> cancelled: customer cancels
    requested --> expired: no answer in 48 h (sweep)
    accepted --> completed: both press "Work done" / one side + 72 h (auto) / admin decision
    accepted --> cancelled: customer or worker cancels (reason) / confirmed no-show / admin decision
    completed --> [*]
    declined --> [*]
    expired --> [*]
    cancelled --> [*]
```

Every arrow is a conditional update on the state that was checked: a double tap or two people at the same
moment get 409 `BOOKING_CHANGED`; a step the state does not allow gets 400 `BOOKING_NOT_ALLOWED`. Every step
is pushed onto `statusHistory`. The small dispute step (completion contested, no-show contested,
cancellation fault) holds the booking until an admin decides; only one dispute per booking (D-049).

**Outcome** (the one field reliability reads): `completed` (+1), `cancelled_by_worker_early` (−0.5, 24 hours or
more before the start), `cancelled_by_worker_late` (−1), `worker_no_show` (−1); `cancelled_by_customer`,
`declined`, `expired`, `closed_no_fault` count nothing.

## 3. Data flow

```mermaid
flowchart LR
    B[Booking<br/>status, outcome, completionMethod] -->|closed outcomes| REL[reliabilityEngine<br/>pure]
    R[Review<br/>stars, quick answers] -->|visible reviews| REP[reputationEngine<br/>pure]
    B -->|customer's other workers,<br/>completion method| REP
    REP --> S[buildReputationSnapshot<br/>pure]
    REL --> S
    S -->|recompute.js saves| WP[(WorkerProfile.reputation<br/>public / score / reliability)]
    WP -->|reputation.public only| PUB[Public profile, directory card,<br/>compare page]
    WP -->|score.cautious| SORT[Best track record sort]
    WP -->|toMatchingSignals| M7[Module 7 matching<br/>docs/contracts/MATCHING-INPUTS.md]
    B -->|completed| WH[Verified work history]
    PC[patternCheck<br/>rule-based] -.->|flag for an admin, never a score| ADM[Admin queue]
```

`recompute.js` is the only reputation code that touches the database. It runs after a booking is completed
or closed with an outcome; after a review is created, hidden or restored; after a dispute decision; and once
a day from the cron for every worker with a booking. It does not change `updatedAt`, so "Recently updated"
is not affected. A worker without a snapshot is "new on this platform" (no migration needed).

## 4. The formulas (config: `backend/config/reputationParams.js`, all provisional)

**Stars to evidence** (graded feedback, Jøsang & Ismail 2002, §2.7): `p = (stars − 1) / 4`; a review adds
`w·p` to the positive evidence `r` and `w·(1 − p)` to the negative evidence `s`.

**Weight** `w = provenance × recency × reviewerTrust × pairFactor`:

| Factor | Rule | Why |
|---|---|---|
| provenance | both or admin 1.0; auto 0.6 | a job both people confirmed is stronger proof |
| recency | `0.5 ^ (ageDays / 365)` | the paper's forgetting factor (§2.6): people improve or get worse |
| reviewerTrust | `0.5 + 0.5 · min(n, 3) / 3`, n = other workers this customer finished a job with | the paper discounts feedback by its provider's standing (§2.5); a fake account must first book and finish real jobs |
| pairFactor | the k-th review from the same customer counts `1/k` | ten reviews from one friend are not ten opinions |

`reviewerTrust` uses the customer's history **now**: an old review counts more once its author has hired other
workers. This is intended.

**Beta numbers** (W = 2, a = 0.5): `belief = r/(r+s+W)`, `disbelief = s/(r+s+W)`, `uncertainty = W/(r+s+W)`,
`expected = belief + a·uncertainty = (r+1)/(r+s+2)`. **Cautious** `= max(0, expected − 1.2816·sd)` with `sd` the
standard deviation of Beta(r + W·a, s + W·(1 − a)): a normal approximation of the lower 10% point ("about 90%
sure the true value is at least this"). **Depth**: none (no visible reviews), few (u > 0.4), some, many (u ≤ 0.2).

**Worked examples** (each is a unit test in `backend/tests/unit/reputationEngine.test.js`, four decimals, all passing):

| Case | r | s | uncertainty | expected | cautious |
|---|---|---|---|---|---|
| No reviews | 0 | 0 | 1.0000 | 0.5000 | 0.1300 |
| One 5★, weight 1 | 1 | 0 | 0.6667 | 0.6667 | 0.3646 |
| One 1★, weight 1 | 0 | 1 | 0.6667 | 0.3333 | 0.0313 |
| One 4★, weight 1 | 0.75 | 0.25 | 0.6667 | 0.5833 | 0.2674 |
| One 3★, weight 1 | 0.5 | 0.5 | 0.6667 | 0.5000 | 0.1796 |
| One 5★, weight 0.5 (new reviewer, or one year old) | 0.5 | 0 | 0.8000 | 0.6000 | 0.2644 |
| One 5★, auto-completed (0.6) | 0.6 | 0 | 0.7692 | 0.6154 | 0.2868 |
| Ten 5★, each weight 1 | 10 | 0 | 0.1667 | 0.9167 | 0.8184 |
| Three 5★ from the same customer (1, 1/2, 1/3) | 1.8333 | 0 | 0.5217 | 0.7391 | 0.4832 |
| 28 × 5★ + 12 × 4★ (average 4.7, 40 reviews) | 37 | 3 | 0.0476 | 0.9048 | 0.8474 |

By `cautious`, 40 reviews averaging 4.7 rank above 10 perfect reviews, and both far above one perfect review;
a plain average puts the single 5★ first. `npm run reputation:sensitivity` shows that this order holds for
every tested half-life, auto weight and trust floor, and for W = 2 and 4, but **not for W = 1** (ten 5★ then
score 0.8775 against 0.8594).

**Reliability** (same Beta numbers, same recency weight; tests in `reliabilityEngine.test.js`): nothing →
0.5000 / 1.0000; 10 completed → 0.9167 / 0.1667; + 1 late cancellation → 0.8462 / 0.1538; + 1 early
cancellation instead → 0.8800 / 0.1600; 3 completed + 1 no-show → 0.6667 / 0.3333 (expected / uncertainty).

## 5. Evaluation by simulation

How: `backend/evaluation/reputation/` (README there lists every assumption). 300 workers per run, hidden quality
q ~ Beta(4, 2), 30% of workers without reviews, the rest a mean of 4 reviews, stars from q with Normal(0, 0.15)
noise; 11 scenarios (base, inflation, naive and "smart" Sybil attacks with 3, 5 and 10 fake reviews, pair
collusion, quality change, combined); baselines B1 plain average, B2 Bayesian average, B3 Wilson lower bound,
B4 plain Beta; ours = the production engine's cautious score; ablations; Kendall's tau-b, NDCG@10/20,
Precision@10, attack lift (places bought by the fake reviews), new-worker position; paired comparison seed by
seed. Run: `npm run evaluate:reputation -- --scenario all --seeds 30` and `node evaluation/reputation/explore.js --seeds 30`.

> **These are SIMULATION results.** They show how the methods behave if the simulator's assumptions hold. They
> are not real-world results, and they do not show that the assumptions are true. Quote them only with the word
> "simulation", the scenario and the number of seeds. The tables below are generated from the committed files
> by `node docs/tools/simulation-tables.mjs`.

### 5.1 Results (SIMULATION)

SIMULATION results: 30 seeds (20261116..20261145), 300 workers per run, engine rep-1, parameters 23974876a27d, git cb05f38, run on 2026-11-16. Mean (standard deviation) over seeds.

| Scenario | Method | Kendall tau-b (>= 1 review) | NDCG@10 (all) | Precision@10 (all) | Attack lift (places) | New-worker percentile |
|---|---|---|---|---|---|---|
| base | B1 plain average | 0.678 (0.028) | 0.893 (0.036) | 0.673 (0.160) | – | 14.777 (1.308) |
| base | B2 Bayesian average (m = 5) | 0.649 (0.027) | 0.937 (0.017) | 0.877 (0.107) | – | 46.951 (1.839) |
| base | B3 Wilson lower bound (4-5 stars) | 0.549 (0.032) | 0.895 (0.022) | 0.663 (0.138) | – | 23.715 (1.699) |
| base | B4 plain Beta (all weights 1) | 0.633 (0.032) | 0.938 (0.017) | 0.880 (0.110) | – | 30.404 (1.888) |
| base | Ours: weighted Beta, cautious | 0.441 (0.045) | 0.903 (0.022) | 0.677 (0.143) | – | 19.805 (1.924) |
| base | Ablation: expected instead of cautious | 0.562 (0.038) | 0.919 (0.019) | 0.767 (0.109) | – | 30.869 (2.026) |
| inflation | B1 plain average | 0.655 (0.029) | 0.860 (0.029) | 0.557 (0.170) | – | 14.777 (1.308) |
| inflation | B2 Bayesian average (m = 5) | 0.633 (0.027) | 0.915 (0.016) | 0.753 (0.150) | – | 48.122 (1.923) |
| inflation | B3 Wilson lower bound (4-5 stars) | 0.402 (0.047) | 0.838 (0.032) | 0.417 (0.129) | – | 18.344 (1.515) |
| inflation | B4 plain Beta (all weights 1) | 0.540 (0.039) | 0.909 (0.019) | 0.717 (0.162) | – | 20.639 (1.773) |
| inflation | Ours: weighted Beta, cautious | 0.333 (0.048) | 0.875 (0.024) | 0.547 (0.155) | – | 16.081 (1.585) |
| inflation | Ablation: expected instead of cautious | 0.440 (0.047) | 0.888 (0.024) | 0.600 (0.144) | – | 21.038 (1.913) |
| sybil_k3 | B1 plain average | 0.496 (0.038) | 0.789 (0.056) | 0.450 (0.153) | 112.112 (14.676) | 13.317 (1.266) |
| sybil_k3 | B2 Bayesian average (m = 5) | 0.464 (0.034) | 0.869 (0.061) | 0.657 (0.176) | 126.199 (11.677) | 44.064 (1.840) |
| sybil_k3 | B3 Wilson lower bound (4-5 stars) | 0.411 (0.037) | 0.889 (0.025) | 0.643 (0.148) | 111.269 (12.146) | 20.493 (1.529) |
| sybil_k3 | B4 plain Beta (all weights 1) | 0.422 (0.037) | 0.872 (0.062) | 0.673 (0.176) | 139.456 (11.639) | 26.041 (1.853) |
| sybil_k3 | Ours: weighted Beta, cautious | 0.240 (0.043) | 0.882 (0.034) | 0.610 (0.160) | 141.726 (13.349) | 17.330 (1.827) |
| sybil_k3 | Ablation: expected instead of cautious | 0.336 (0.036) | 0.879 (0.049) | 0.643 (0.181) | 152.027 (12.747) | 26.342 (1.866) |
| sybil_k5 | B1 plain average | 0.466 (0.036) | 0.789 (0.056) | 0.450 (0.153) | 124.137 (13.466) | 13.317 (1.266) |
| sybil_k5 | B2 Bayesian average (m = 5) | 0.424 (0.034) | 0.684 (0.079) | 0.217 (0.144) | 148.350 (10.725) | 44.610 (1.699) |
| sybil_k5 | B3 Wilson lower bound (4-5 stars) | 0.354 (0.035) | 0.868 (0.040) | 0.590 (0.156) | 133.816 (12.097) | 20.493 (1.529) |
| sybil_k5 | B4 plain Beta (all weights 1) | 0.377 (0.035) | 0.675 (0.084) | 0.210 (0.142) | 157.926 (11.914) | 25.875 (1.844) |
| sybil_k5 | Ours: weighted Beta, cautious | 0.205 (0.039) | 0.744 (0.069) | 0.280 (0.147) | 155.271 (13.976) | 17.330 (1.827) |
| sybil_k5 | Ablation: expected instead of cautious | 0.298 (0.034) | 0.683 (0.070) | 0.183 (0.132) | 167.327 (14.460) | 26.252 (1.866) |
| sybil_k10 | B1 plain average | 0.431 (0.034) | 0.789 (0.056) | 0.450 (0.153) | 137.657 (12.876) | 13.317 (1.266) |
| sybil_k10 | B2 Bayesian average (m = 5) | 0.380 (0.028) | 0.563 (0.045) | 0.010 (0.031) | 169.437 (10.637) | 51.878 (6.716) |
| sybil_k10 | B3 Wilson lower bound (4-5 stars) | 0.293 (0.033) | 0.691 (0.069) | 0.193 (0.134) | 157.360 (11.777) | 20.493 (1.529) |
| sybil_k10 | B4 plain Beta (all weights 1) | 0.341 (0.032) | 0.563 (0.045) | 0.010 (0.031) | 172.398 (13.292) | 25.816 (1.812) |
| sybil_k10 | Ours: weighted Beta, cautious | 0.188 (0.038) | 0.576 (0.051) | 0.013 (0.035) | 161.499 (14.388) | 17.330 (1.827) |
| sybil_k10 | Ablation: expected instead of cautious | 0.276 (0.033) | 0.564 (0.046) | 0.007 (0.025) | 175.711 (15.550) | 26.219 (1.849) |
| smart_sybil_k3 | B1 plain average | 0.496 (0.038) | 0.789 (0.056) | 0.450 (0.153) | 112.112 (14.676) | 13.317 (1.266) |
| smart_sybil_k3 | B2 Bayesian average (m = 5) | 0.464 (0.034) | 0.869 (0.061) | 0.657 (0.176) | 126.199 (11.677) | 44.064 (1.840) |
| smart_sybil_k3 | B3 Wilson lower bound (4-5 stars) | 0.411 (0.037) | 0.889 (0.025) | 0.643 (0.148) | 111.269 (12.146) | 20.493 (1.529) |
| smart_sybil_k3 | B4 plain Beta (all weights 1) | 0.422 (0.037) | 0.872 (0.062) | 0.673 (0.176) | 139.456 (11.639) | 26.041 (1.853) |
| smart_sybil_k3 | Ours: weighted Beta, cautious | 0.205 (0.039) | 0.718 (0.073) | 0.260 (0.140) | 155.084 (13.881) | 17.330 (1.827) |
| smart_sybil_k3 | Ablation: expected instead of cautious | 0.298 (0.034) | 0.666 (0.067) | 0.190 (0.116) | 167.078 (14.380) | 26.264 (1.875) |
| smart_sybil_k5 | B1 plain average | 0.466 (0.036) | 0.789 (0.056) | 0.450 (0.153) | 124.137 (13.466) | 13.317 (1.266) |
| smart_sybil_k5 | B2 Bayesian average (m = 5) | 0.424 (0.034) | 0.684 (0.079) | 0.217 (0.144) | 148.350 (10.725) | 44.610 (1.699) |
| smart_sybil_k5 | B3 Wilson lower bound (4-5 stars) | 0.354 (0.035) | 0.868 (0.040) | 0.590 (0.156) | 133.816 (12.097) | 20.493 (1.529) |
| smart_sybil_k5 | B4 plain Beta (all weights 1) | 0.377 (0.035) | 0.675 (0.084) | 0.210 (0.142) | 157.926 (11.914) | 25.875 (1.844) |
| smart_sybil_k5 | Ours: weighted Beta, cautious | 0.190 (0.038) | 0.598 (0.044) | 0.033 (0.055) | 160.778 (14.377) | 17.330 (1.827) |
| smart_sybil_k5 | Ablation: expected instead of cautious | 0.280 (0.033) | 0.579 (0.043) | 0.020 (0.048) | 174.526 (15.397) | 26.219 (1.849) |
| smart_sybil_k10 | B1 plain average | 0.431 (0.034) | 0.789 (0.056) | 0.450 (0.153) | 137.657 (12.876) | 13.317 (1.266) |
| smart_sybil_k10 | B2 Bayesian average (m = 5) | 0.380 (0.028) | 0.563 (0.045) | 0.010 (0.031) | 169.437 (10.637) | 51.878 (6.716) |
| smart_sybil_k10 | B3 Wilson lower bound (4-5 stars) | 0.293 (0.033) | 0.691 (0.069) | 0.193 (0.134) | 157.360 (11.777) | 20.493 (1.529) |
| smart_sybil_k10 | B4 plain Beta (all weights 1) | 0.341 (0.032) | 0.563 (0.045) | 0.010 (0.031) | 172.398 (13.292) | 25.816 (1.812) |
| smart_sybil_k10 | Ours: weighted Beta, cautious | 0.185 (0.038) | 0.560 (0.037) | 0.000 (0.000) | 162.149 (14.549) | 17.330 (1.827) |
| smart_sybil_k10 | Ablation: expected instead of cautious | 0.273 (0.033) | 0.557 (0.037) | 0.000 (0.000) | 177.121 (16.027) | 26.219 (1.849) |
| pair_collusion | B1 plain average | 0.621 (0.027) | 0.849 (0.053) | 0.573 (0.180) | 107.316 (23.110) | 14.025 (1.288) |
| pair_collusion | B2 Bayesian average (m = 5) | 0.590 (0.029) | 0.870 (0.054) | 0.647 (0.178) | 109.331 (16.174) | 46.957 (1.932) |
| pair_collusion | B3 Wilson lower bound (4-5 stars) | 0.508 (0.031) | 0.891 (0.025) | 0.657 (0.130) | 108.042 (20.086) | 22.580 (1.664) |
| pair_collusion | B4 plain Beta (all weights 1) | 0.570 (0.031) | 0.868 (0.054) | 0.640 (0.177) | 121.544 (19.109) | 28.930 (1.800) |
| pair_collusion | Ours: weighted Beta, cautious | 0.402 (0.037) | 0.891 (0.030) | 0.653 (0.153) | 119.867 (19.871) | 18.885 (1.800) |
| pair_collusion | Ablation: expected instead of cautious | 0.509 (0.032) | 0.890 (0.040) | 0.680 (0.161) | 118.776 (17.703) | 29.436 (1.953) |
| quality_change | B1 plain average | 0.644 (0.032) | 0.870 (0.053) | 0.680 (0.163) | – | 14.777 (1.308) |
| quality_change | B2 Bayesian average (m = 5) | 0.619 (0.030) | 0.931 (0.017) | 0.903 (0.096) | – | 47.542 (2.268) |
| quality_change | B3 Wilson lower bound (4-5 stars) | 0.535 (0.023) | 0.892 (0.029) | 0.743 (0.143) | – | 24.889 (1.748) |
| quality_change | B4 plain Beta (all weights 1) | 0.615 (0.031) | 0.934 (0.019) | 0.910 (0.096) | – | 33.686 (1.791) |
| quality_change | Ours: weighted Beta, cautious | 0.478 (0.033) | 0.902 (0.021) | 0.760 (0.122) | – | 22.202 (1.951) |
| quality_change | Ablation: expected instead of cautious | 0.582 (0.032) | 0.919 (0.019) | 0.847 (0.120) | – | 34.947 (2.103) |
| combined | B1 plain average | 0.456 (0.043) | 0.772 (0.072) | 0.447 (0.172) | 97.710 (12.659) | 12.503 (1.105) |
| combined | B2 Bayesian average (m = 5) | 0.411 (0.033) | 0.800 (0.080) | 0.553 (0.187) | 109.733 (9.197) | 46.126 (1.775) |
| combined | B3 Wilson lower bound (4-5 stars) | 0.269 (0.030) | 0.807 (0.041) | 0.420 (0.130) | 113.054 (10.975) | 15.655 (1.356) |
| combined | B4 plain Beta (all weights 1) | 0.308 (0.032) | 0.817 (0.071) | 0.563 (0.183) | 130.288 (11.182) | 18.385 (1.588) |
| combined | Ours: weighted Beta, cautious | 0.161 (0.032) | 0.764 (0.066) | 0.400 (0.151) | 131.123 (11.647) | 14.431 (1.514) |
| combined | Ablation: expected instead of cautious | 0.238 (0.030) | 0.780 (0.069) | 0.457 (0.176) | 136.434 (11.758) | 19.064 (1.668) |

Ablations (ours with one factor switched off), attack lift and NDCG@10, mean over seeds:

| Scenario | ours | no recency | no reviewer trust | no pair factor | no provenance |
|---|---|---|---|---|---|
| sybil_k3 | 141.726 / 0.882 | 117.920 / 0.911 | 151.923 / 0.787 | 141.726 / 0.882 | 140.436 / 0.884 |
| sybil_k5 | 155.271 / 0.744 | 140.821 / 0.889 | 159.748 / 0.596 | 155.271 / 0.744 | 154.650 / 0.757 |
| sybil_k10 | 161.499 / 0.576 | 157.912 / 0.633 | 162.324 / 0.557 | 161.499 / 0.576 | 161.539 / 0.576 |
| smart_sybil_k3 | 155.084 / 0.718 | 140.709 / 0.872 | 151.936 / 0.780 | 155.084 / 0.718 | 154.552 / 0.734 |
| smart_sybil_k5 | 160.778 / 0.598 | 154.838 / 0.700 | 159.740 / 0.592 | 160.778 / 0.598 | 160.704 / 0.600 |
| smart_sybil_k10 | 162.149 / 0.560 | 162.163 / 0.564 | 162.329 / 0.556 | 162.149 / 0.560 | 162.296 / 0.561 |
| pair_collusion | 119.867 / 0.891 | 103.564 / 0.917 | 122.720 / 0.907 | 133.993 / 0.806 | 118.504 / 0.897 |
| combined | 131.123 / 0.764 | 111.733 / 0.860 | 136.538 / 0.647 | 136.579 / 0.742 | 130.203 / 0.775 |

Paired, ours minus B1 (plain average), seed by seed: mean difference [share of seeds where ours is better]:

| Scenario | tau-b (>= 1 review) | NDCG@10 (all) | Attack lift |
|---|---|---|---|
| base | -0.237 [0%] | +0.011 [57%] | – |
| inflation | -0.322 [0%] | +0.015 [67%] | – |
| sybil_k3 | -0.256 [0%] | +0.093 [93%] | +29.613 [0%] |
| sybil_k5 | -0.260 [0%] | -0.045 [30%] | +31.134 [0%] |
| sybil_k10 | -0.243 [0%] | -0.213 [0%] | +23.842 [0%] |
| smart_sybil_k3 | -0.291 [0%] | -0.071 [7%] | +42.972 [0%] |
| smart_sybil_k5 | -0.276 [0%] | -0.191 [0%] | +36.641 [0%] |
| smart_sybil_k10 | -0.246 [0%] | -0.229 [0%] | +24.492 [0%] |
| pair_collusion | -0.219 [0%] | +0.042 [80%] | +12.551 [17%] |
| quality_change | -0.166 [0%] | +0.032 [67%] | – |
| combined | -0.295 [0%] | -0.008 [50%] | +33.412 [0%] |

### 5.2 Parameter exploration (SIMULATION; not a validation of any value)

Parameter exploration, SIMULATION, 30 seeds, 300 workers per run (defaults 23974876a27d). Mean over seeds: tau-b (>= 1 review) / NDCG@10 (all) / attack lift.

| World | B1 plain average | B4 plain Beta (all weights 1) | default (floor 0.5, half-life 365), cautious | default (floor 0.5, half-life 365), expected | trust floor 0.0, cautious | trust floor 0.0, expected | half-life 730, cautious | floor 0.0 + half-life 730, cautious |
|---|---|---|---|---|---|---|---|---|
| base | 0.678 / 0.893 / – | 0.633 / 0.938 / – | 0.441 / 0.903 / – | 0.562 / 0.919 / – | 0.352 / 0.893 / – | 0.477 / 0.905 / – | 0.462 / 0.907 / – | 0.364 / 0.897 / – |
| sybil_k5 | 0.466 / 0.789 / 124.137 | 0.377 / 0.675 / 157.926 | 0.205 / 0.744 / 155.271 | 0.298 / 0.683 / 167.327 | 0.366 / 0.893 / 0.000 | 0.486 / 0.905 / 0.000 | 0.236 / 0.826 / 150.154 | 0.376 / 0.897 / 0.000 |
| smart_sybil_k5 | 0.466 / 0.789 / 124.137 | 0.377 / 0.675 / 157.926 | 0.190 / 0.598 / 160.778 | 0.280 / 0.579 / 174.526 | 0.121 / 0.575 / 158.704 | 0.208 / 0.568 / 171.311 | 0.211 / 0.618 / 159.286 | 0.133 / 0.588 / 158.033 |
| pair_collusion | 0.621 / 0.849 / 107.316 | 0.570 / 0.868 / 121.544 | 0.402 / 0.891 / 119.867 | 0.509 / 0.890 / 118.776 | 0.326 / 0.843 / 78.676 | 0.443 / 0.842 / 78.509 | 0.427 / 0.908 / 112.862 | 0.339 / 0.867 / 75.680 |
| quality_change | 0.644 / 0.870 / – | 0.615 / 0.934 / – | 0.478 / 0.902 / – | 0.582 / 0.919 / – | 0.391 / 0.886 / – | 0.499 / 0.903 / – | 0.484 / 0.906 / – | 0.391 / 0.894 / – |
| combined | 0.456 / 0.772 / 97.710 | 0.308 / 0.817 / 130.288 | 0.161 / 0.764 / 131.123 | 0.238 / 0.780 / 136.434 | 0.294 / 0.815 / 23.296 | 0.385 / 0.824 / 23.256 | 0.192 / 0.821 / 123.234 | 0.300 / 0.840 / 22.071 |
| base (noise sd 0.3) | 0.468 / 0.824 / – | 0.476 / 0.902 / – | 0.351 / 0.879 / – | 0.426 / 0.891 / – | 0.279 / 0.859 / – | 0.351 / 0.866 / – | 0.367 / 0.887 / – | 0.287 / 0.866 / – |
| base (noise sd 0.5) | 0.309 / 0.782 / – | 0.334 / 0.845 / – | 0.257 / 0.847 / – | 0.303 / 0.845 / – | 0.205 / 0.819 / – | 0.241 / 0.822 / – | 0.269 / 0.853 / – | 0.210 / 0.829 / – |
| sybil_k5 (noise sd 0.3) | 0.305 / 0.757 / 116.044 | 0.260 / 0.604 / 151.417 | 0.137 / 0.669 / 153.447 | 0.199 / 0.613 / 160.080 | 0.295 / 0.859 / 0.000 | 0.359 / 0.866 / 0.000 | 0.161 / 0.742 / 148.954 | 0.302 / 0.866 / 0.000 |
| sybil_k5 (noise sd 0.5) | 0.177 / 0.733 / 109.984 | 0.151 / 0.585 / 143.810 | 0.066 / 0.606 / 149.117 | 0.109 / 0.587 / 151.884 | 0.218 / 0.819 / 0.000 | 0.246 / 0.822 / 0.000 | 0.085 / 0.651 / 145.202 | 0.223 / 0.829 / 0.000 |

### 5.3 What the simulation shows, and what it does not

In this simulation, with the plan's provisional parameters:

1. **Ours does not beat the simple baselines overall.** On rank correlation (Kendall's tau-b) the cautious
   score is lower than the plain average in every scenario (base: 0.441 against 0.678). Part of this is by
   design: the cautious score pushes workers with little evidence down whatever their quality, and in this
   simulator the number of reviews is unrelated to quality. On the top ten (NDCG@10) ours is better than the
   plain average in the base (0.903 against 0.893), inflation, sybil_k3, pair_collusion and quality_change
   worlds, and worse with 5 or 10 naive fake reviews, with every smart attack and in the combined world.
2. **Naive fake reviews buy more places with ours than with the plain average** (sybil_k5: about 155 against
   124 places). The reason is visible in the weights: fake reviews are recent, the recency factor counts them
   almost fully, and the reviewer-trust floor of 0.5 only halves them; old genuine reviews weigh less.
3. **The individual defences work against what they target.** Removing reviewer trust makes naive Sybils buy
   more places; removing the pair factor makes pair collusion buy more (the ablation table). In the
   exploration, a trust floor of 0 removes the naive Sybil effect completely (attack lift 0), but a "smart"
   attacker who first hires other workers still buys about 159 places, and rank correlation in the base world
   drops (0.352).
4. **The answer depends on the simulator's noise assumption.** With noisier stars (sd 0.5 instead of 0.15) one
   review says less, and the careful methods gain: ours reaches NDCG@10 0.847 against 0.782 for the plain average.

What it does **not** show: anything about real customers in Pakistan; whether real stars are this noisy;
whether real fake accounts look like the simulated ones. Choosing new parameters from these same runs would
be circular. The production parameters were **not** changed: that is a decision for the team and the
supervisor, to be checked on new seeds and on the real pilot (`docs/evaluation/REPUTATION-PILOT-PLAN.md`).

## 6. Who sees what

| Where | Shown | Never shown |
|---|---|---|
| Public profile, "See what customers see", compare | ★ average with count; depth words; star bars; "On time: 9 of 10" (a percentage only from 5 answers); jobs done, cancelled by the worker, no-shows; "Hired again by N"; reviews ("Sara K.") with replies; verified work history | expected, uncertainty, cautious; hidden reviews; reviewer's full name or contact |
| Directory card | "★ 4.6 (12) · 12 jobs" or "New on this platform" | the same |
| The worker's My reputation | everything public, plus expected / cautious / reliability in words, the per-review reasons, own cancellations, tips | other people's data |
| Admin worker view (Users → Reputation tab) | everything, with each review's weight and factors, hidden reviews, flags | phone numbers outside the booking view |

Phone numbers (D-002, D-052): only in `GET /api/bookings/:id`, only to the two people and admins, only while the
booking is accepted and for 7 days after it closes.

## 7. Extension points (do not build them in this module)

| Module | Expected additions to `Booking` |
|---|---|
| 5 (wages) | `agreedPrice`, `priceUnit`, a wage-estimate reference |
| 6 (job posting) | `jobRequest` (the posted job the booking came from) |
| 8 (agreement) | `agreement { terms, acceptedByCustomerAt, acceptedByWorkerAt }`, `beforeEvidence[]`, `afterEvidence[]` |
| 9 (disputes) | a full dispute record; the small `dispute` here is only what reliability needs |
| 10 (check-in) | `checkIn { at, location }`, `checkOut { at, location }`; no-shows could then be confirmed by data |
| 7 (matching) | reads `toMatchingSignals(snapshot)` only (`docs/contracts/MATCHING-INPUTS.md`) |

## 8. Limitations (stated plainly)

- The simulation results above: with the provisional parameters the model is not better than the baselines
  overall, and recency helps recent fake reviews (§5.3).
- Contact details written as words ("zero three zero zero …") pass the contact-info check.
- The request limits are counted, not locked: two requests sent in the same millisecond could both pass.
- An accepted booking that nobody ever confirms, cancels or reports stays accepted (Module 10's check-in will close this).
- The pattern check has two rules only; a patient attacker can stay under them. A flag never changes a score.
- `reviewerTrust` trusts a customer's past jobs, which a determined attacker can buy (the "smart" Sybil).
- Demo data is written straight into the demo database and is therefore not in the audit log.

## 9. How to explain this in the viva

**Why not a plain average?** One 5★ review would beat forty reviews averaging 4.7, and a plain average cannot say
how sure it is. Our score keeps the evidence and the doubt apart: the more real evidence, the smaller the
doubt. The cautious score is what we are fairly sure of, so a worker with one lucky review does not jump over a
worker with a long good record.

**Is this AI?** No. It is a written formula (a Beta reputation model from 2002) and a few fixed rules. Every number
can be worked out by hand; the unit tests do exactly that.

**How do you stop fake reviews?** Only a customer who finished a booking that both people confirmed can review,
once per booking. Reviews from accounts that have hired nobody else count half. Many reviews from one customer
count less each time. Two rules raise a flag for an admin. And we measured it: in our simulation these steps
work against the attacks they target, but with the current settings recent fake reviews still buy places, which
is why the settings are a decision for the pilot, not a finished fact.

**What happens to new workers?** They show "New on this platform", they can always be found under "Recently
updated", and the "Best track record" order says openly that new workers appear lower. Fair exposure for new
workers is Module 7's own research question (Pallais 2014 shows why it matters).

**Where do the weights come from?** The structure comes from the paper (forgetting factor, discounting by the
provider's standing). The numbers (half-life one year, auto 0.6, trust floor 0.5) are design choices written in
one config file and marked provisional; the sensitivity script and the simulation show how much each one matters.

**How did you evaluate it, and why a simulation?** A real evaluation needs the true quality of each worker, which
nobody knows, and enough fake reviews to measure an attack, which we must not create on a live site. A seeded
simulation knows the true quality and can attack on purpose, with the same engine code. Its limit is its
assumptions, so we report it as simulation only, include a costly "smart" attack, and plan a real pilot.

**Why can customers not edit reviews?** A review that can be changed later can be bargained over ("change it or
I will…"). The form says so and reads the answers back before sending.

**Why does declining a request not count?** A worker may always say no (too far, busy, not their work). Counting
it would push workers to accept jobs they cannot do and then cancel, which hurts customers more.

## 10. Deployment notes (not deployed in this batch)

- New optional environment variable **`CRON_SECRET`** (at least 32 random characters) in the backend Vercel
  project. Without it `GET /api/cron/daily` always answers 401; bookings stay correct anyway (per-request sweep).
- `backend/vercel.json` has `"crons": [{ "path": "/api/cron/daily", "schedule": "0 21 * * *" }]` (21:00 UTC =
  02:00 in Pakistan). Vercel's docs (checked 16 Nov 2026) say cron jobs run only on production deployments,
  delivery is best effort, Hobby runs at most once a day, and Cron Jobs are a legacy feature that will move to
  "Schedules": check the dashboard when deploying.
- No migration: a worker without a snapshot is "new". Optional after deploying: `npm run reputation:recompute -- --all`
  (refuses a remote database unless `--allow-remote` is given and you type `yes` after seeing the host).
- `npm run db:indexes` builds the new indexes (bookings, reviews, flags, the track-record index) on Atlas.

## References

- Jøsang, A., & Ismail, R. (2002). The Beta Reputation System. *Proceedings of the 15th Bled Electronic Commerce Conference*. https://mn.uio.no/ifi/english/people/aca/josang/publications/ji2002-bled.pdf
- Jøsang, A., Ismail, R., & Boyd, C. (2007). A survey of trust and reputation systems for online service provision. *Decision Support Systems*, 43(2), 618–644. https://doi.org/10.1016/j.dss.2005.05.019
- Hoffman, K., Zage, D., & Nita-Rotaru, C. (2009). A survey of attack and defense techniques for reputation systems. *ACM Computing Surveys*, 42(1), Article 1. https://doi.org/10.1145/1592451.1592452
- Douceur, J. R. (2002). The Sybil Attack. In *IPTPS 2002*, LNCS 2429, 251–260. https://doi.org/10.1007/3-540-45748-8_24
- Filippas, A., Horton, J. J., & Golden, J. M. (2022). Reputation Inflation. *Marketing Science*, 41(4), 733–745. https://doi.org/10.1287/mksc.2022.1350
- Pallais, A. (2014). Inefficient Hiring in Entry-Level Labor Markets. *American Economic Review*, 104(11), 3565–3599. https://doi.org/10.1257/aer.104.11.3565
- Wilson, E. B. (1927). Probable Inference, the Law of Succession, and Statistical Inference. *JASA*, 22(158), 209–212. https://doi.org/10.1080/01621459.1927.10502953
- Kendall, M. G. (1938). A New Measure of Rank Correlation. *Biometrika*, 30(1–2), 81–93. https://doi.org/10.1093/biomet/30.1-2.81
- Järvelin, K., & Kekäläinen, J. (2002). Cumulated gain-based evaluation of IR techniques. *ACM TOIS*, 20(4), 422–446. https://doi.org/10.1145/582415.582418
- Vercel. Cron jobs: usage and pricing. https://vercel.com/docs/cron-jobs/usage-and-pricing
