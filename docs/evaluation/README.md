# Evaluating the Module 2 rule-based skill extractor

The extractor (`backend/services/skillExtractor/`) is a **rule-based (dictionary) skill
extractor**. It is not machine learning and is never called "AI". Its quality is unknown until
it is measured on **real, labelled** worker descriptions.

## Rules (academic honesty)
1. **Results come only from real descriptions** collected from workers with informed consent
   (`consent-form.md`). The files `dataset.synthetic.*.csv` in the code are **synthetic**: they
   exist only to test the scripts. Their numbers are never reported, in the report, slides or viva.
2. **Freeze the test set before changing any rule.** Split the real data once:
   - *development set* (about 30%): look at errors here and improve the rules;
   - *test set* (about 70%, at least 100 descriptions if possible): run **once**, for the report.
   Record the test file's SHA-256 (printed by the script) in the report.
3. **Two team members label independently** (ideally one who did not write the rules), using
   `annotation-guide.md`. Measure agreement with `npm run agreement:skills` (Cohen's kappa and
   Krippendorff's alpha) **before** resolving disagreements; then agree a final gold file.
4. **Remove personal data before labelling** (`data-handling.md`).
5. **Ask the supervisor whether SZABIST needs ethics approval** before collecting data.

## What the script reports (`npm run evaluate:skills -- --file <path>`, in `.\backend`)
- Micro and macro precision, recall, F1 over skills; Wilson 95% intervals for micro precision
  and recall; bootstrap 95% interval for micro F1 (1,000 resamples of whole descriptions, seed 20261109).
- Per category; per script (English, Roman Urdu, Urdu, mixed).
- Category accuracy (suggested trade vs gold trade; a reported tie counts as wrong) and
  experience exact match (years and months, or both "not stated").
- **Ablation:** dictionary only → + normalisation → + Urdu-script terms → + weak-term rule
  (= the full extractor), so the report can show what each design choice adds or costs.
- **Baselines:** the old profiler (`evaluation/baselines/legacyProfiler.js`) and a naive
  English-only exact-match baseline.
- **Paired comparison** of the extractor with each other system: paired bootstrap on micro F1
  (same resampled descriptions for both), with a 95% interval and a two-sided p-value.
- JSON output in `backend/evaluation/skill-extraction/results/` with the date and the dataset hash.

## Files here
| File | What |
|---|---|
| `dataset-format.md` | CSV format of a labelled file |
| `annotation-guide.md` | How to label; how agreement is measured |
| `consent-form.md` | Consent form (simple English and Urdu) |
| `data-handling.md` | What may and may not be in the dataset; storage |

## Other modules' evaluation plans
| Folder or file | What |
|---|---|
| [`job-analysis/`](job-analysis/README.md) | **Module 6 (Batch 8A):** the job analyzers (rule-based word lists, the team's naive Bayes classifier, a hybrid); the pre-registered protocol [`job-analysis/PROTOCOL.md`](job-analysis/PROTOCOL.md) (frozen at `81ba8f6`), the consent text, the form draft, the collection plan, the annotation guide and the data-handling note |
| `REPUTATION-PILOT-PLAN.md`, `REP2-SIMULATION-TABLES.md` | Module 4 |
| `PRICE-PILOT-PLAN.md` | Module 5 |
| `EASY-MODE-USABILITY-PLAN.md` | Easy mode (Batch 5) |
