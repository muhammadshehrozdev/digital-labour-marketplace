# Skill extraction evaluation (Module 2)

How the **rule-based skill extractor** is measured. Full method, dataset format, annotation
guide, consent form and data-handling rules: [`docs/evaluation/`](../../../docs/evaluation/README.md).

| File | Purpose |
|---|---|
| `evaluate.js` | `npm run evaluate:skills -- --file <dataset>`: micro/macro precision, recall, F1; Wilson 95% intervals (P, R); bootstrap 95% interval (F1, 1,000 resamples, seed 20261109); per category; per script; category accuracy; experience exact match; ablation; baselines; paired bootstrap comparison. Writes JSON to `results/` with the date and the dataset's SHA-256. |
| `agreement.js` | `npm run agreement:skills -- --a <file> --b <file>`: Cohen's kappa and Krippendorff's alpha between two annotators. |
| `metrics.js`, `dataset.js`, `systems.js` | Pure functions (unit-tested), CSV/JSON loader, the compared systems. |
| `../baselines/legacyProfiler.js` | The old profiler, kept unchanged as a baseline. |
| `dataset.synthetic.dev.csv`, `dataset.synthetic.annotator-b.csv` | **SYNTHETIC.** Only to test the scripts. Never report their numbers. |
| `results/` | Output files. Files starting with `SYNTHETIC-` are not results. |

Reported results must come only from **real** descriptions collected with informed consent,
labelled by two team members, with the test set frozen before any rule is changed.
