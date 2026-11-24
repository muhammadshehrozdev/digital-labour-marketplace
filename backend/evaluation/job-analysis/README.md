# Module 6 evaluation harness: job analyzers (Batch 8A)

This folder measures how well the **job analyzers** read a customer's job description: the rule-based word lists
(`services/jobAnalyzer/rules.js`), the team's own naive Bayes classifier (`services/jobAnalyzer/naiveBayes.js`) and
the hybrid. The scripts import the **same** files as the live API.

> **No real data exists yet (24 Nov 2026).** The only data here is `dataset.synthetic.*.csv`, written to test the
> scripts. The word lists and these sentences were written by the same author, so the rules' numbers on it mean
> **nothing**. Synthetic numbers are never reported anywhere. The real evaluation follows the frozen protocol
> [`docs/evaluation/job-analysis/PROTOCOL.md`](../../../docs/evaluation/job-analysis/PROTOCOL.md) once, in Batch 8C.

## Files

| File | What |
|---|---|
| `dataset.js` | load and check a dataset (format: `docs/evaluation/job-analysis/dataset-format.md`) |
| `metrics.js` | accuracy, coverage, selective accuracy, per-class P/R/F1, macro-F1, Wilson and bootstrap intervals, McNemar's exact test and mid-p, Holm's correction, exact match (imports Module 2's metrics) |
| `systems.js` | the compared systems (rules, three ablations, Module 2 as it is, majority, nb, nb without variants, hybrid) |
| `cv.js` | the stratified split and the stratified 5-fold cross-validation (fixed in Batch 8A) |
| `split.js`, `train.js`, `evaluate.js`, `agreement.js` | the command-line scripts below |
| `dataset.synthetic.all.csv` | 120 SYNTHETIC items (annotator A) |
| `dataset.synthetic.annotator-b.csv` | the same ids, SYNTHETIC annotator B with deliberate disagreements |
| `results/` | result files; `SYNTHETIC-*` files are ignored by Git |
| `data/` | (ignored by Git) a place for working copies of real files; the protocol keeps the test file OUTSIDE the project |

## Commands (in `./backend`)

```powershell
npm run jobs:try -- "Kal subah AC ki service karwani hai"                    # one text, a readable table
npm run jobs:split -- --file <all.csv> --out-dir <folder outside the project>  # once: dev 40% / test 60%
npm run jobs:train -- --file <dev.csv> --cv --out <model.json>                 # CV on dev only, then train
npm run jobs:train -- --file <dev.csv> --label task_type --cv --out <task.json>
npm run evaluate:jobs -- --file <test.csv> --model <model.json> --task-model <task.json>
npm run agreement:jobs -- --a <annotator-a.csv> --b <annotator-b.csv>
```

`jobs:train` also writes `<model>.no-variants.json` (the same parameters without the spelling-variant map), which
`evaluate:jobs` finds next to `--model`. `--format js` writes an ES module for `config/jobModel.generated.js`.

## What the results file holds

The dataset SHA-256, the model `modelId` and file SHA-256, the Git commit (and whether the work tree had
uncommitted changes), the date, every metric of every system (per script and per prompt too), the claim family
(rules–nb, rules–hybrid, nb–hybrid: McNemar exact and mid-p, Holm-adjusted p, paired bootstrap of the accuracy and
macro-F1 differences), the pre-registered decision of which method goes live and the allowed claims, and the per-item
predictions with **ids only, never text** (a test checks it).

## Privacy

Real descriptions never go into Git (`.gitignore`; `docs/evaluation/job-analysis/data-handling.md`). A model file
keeps only words seen in at least two training descriptions (`minDf ≥ 2`; the writer refuses less) and no feature
with three or more digits; `jobs:train` prints the 30 rarest kept features so a person can check that no name or place
slipped in. `trainedOn.file` is the file name only.
