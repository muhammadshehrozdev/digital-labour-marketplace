# Module 6 evaluation: the job analyzers

Module 6 suggests a structured job profile (trade, skills, kind of work, city, day, time, budget, urgency) from a
customer's own words, and the customer confirms or changes every suggestion. Two methods are compared on newly
collected, consented, double-labelled descriptions: the **rule-based word lists** and the team's own small **naive
Bayes classifier** (plus one **hybrid**). Neither method is new; the contribution is the domain analyzer, the dataset
and the pre-registered comparison (`docs/modules/MODULE-6.md`).

> **Status (24 Nov 2026):** no real description has been collected yet. The scripts were tested on synthetic data
> only (`backend/evaluation/job-analysis/dataset.synthetic.*.csv`), and no number from synthetic data is ever
> reported. The protocol was **frozen at commit `81ba8f6`** before any real data exists; Batch 8C runs it once.

| File | What |
|---|---|
| [`PROTOCOL.md`](PROTOCOL.md) | the pre-registered evaluation protocol (frozen), with the decision rule and the claim rule |
| [`dataset-format.md`](dataset-format.md) | the CSV columns |
| [`annotation-guide.md`](annotation-guide.md) | how to label each column; the agreement procedure |
| [`COLLECTION-PLAN.md`](COLLECTION-PLAN.md) | target, prompts, channels, who does what |
| [`consent-text.md`](consent-text.md) | the consent text in English, Urdu and Roman Urdu (drafts for team review) |
| [`FORM-DRAFT.md`](FORM-DRAFT.md) | the Google Form questions and settings |
| [`data-handling.md`](data-handling.md) | what never goes into the dataset; storage; deletion |
| `backend/evaluation/job-analysis/README.md` | the scripts (split, train, evaluate, agreement) |

Next steps for the team: review the word lists and the consent text (`docs/i18n/REVIEW-BATCH-8A.md`), ask the
supervisor the three open questions (`MODULE-6.md`), then build the Google Form with the user from `FORM-DRAFT.md`.
