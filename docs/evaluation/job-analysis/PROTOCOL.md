# Module 6 evaluation protocol (pre-registered)

**Status: FROZEN.** Written on 24 Nov 2026 (Batch 8A), **before anyone has seen a real job description**. It is frozen by
the commit that adds it (the Batch 8A Stage 5 commit; its hash is written in the next section by a second small commit).
Batch 8C runs it **once**. Any change is made **before step 6**, dated, with its reason, in "Protocol changes" at the end.

The code at the freezing commit is the executable form of this text: `backend/evaluation/job-analysis/`
(`cv.js`, `metrics.js`, `systems.js`, `evaluate.js`) and `backend/services/jobAnalyzer/`. If the text and the code are
ever found to disagree, that is written in "Protocol changes" before step 6, and both readings are reported.

## Frozen at

- Commit: `81ba8f6bb8a3c44955dd1b64e785ada50ff572ab` (short `81ba8f6`), 24 Nov 2026 01:10:06 +05:00 (Pakistan time)
- Date: 24 Nov 2026
- Check: `git log --format='%H %cd' -1 81ba8f6 -- docs/evaluation/job-analysis/PROTOCOL.md`

## What is compared, and why

Module 6 suggests a structured job profile from a customer's own words (English, Roman Urdu, Urdu, mixed). Two
methods are compared on the same newly collected, consented, double-labelled descriptions:

- **rules** — the rule-based word lists (`services/jobAnalyzer/rules.js`, `config/jobPhrases.js`), an extension of
  the Module 2 rule-based skill extractor;
- **nb** — the team's own multinomial naive Bayes classifier (`services/jobAnalyzer/naiveBayes.js`), trained only on
  the team's labelled development data;
- **hybrid** — the trade from the rules when they give one (not empty, no tie); otherwise the classifier's top label.
  Skills, task type, city, day, time, urgency and budget always come from the rules; when the trade came from the
  classifier, only the rules' skills of that trade are kept, the trade default of the task type uses that trade, and
  the notes `category_tie` / `no_trade_words` are removed.

Neither method is new. The contribution is the domain analyzer for short code-mixed household job texts, the dataset
and this pre-registered comparison (`docs/modules/MODULE-6.md`, "Honest statement of novelty").

Systems in the report (7.4 of the batch plan): `rules`, the ablations `rules_no_phrases`, `rules_no_variants`,
`rules_no_phrase_unlock` (one option off each), `baseline_module2` (Module 2's `extractSkills` as it is: its
suggested category and the skills it found), `baseline_majority` (the most frequent trade of the development file for
every item), `nb` (parameters chosen by cross-validation on the development file), `nb_no_variants` (the same
parameters, without the spelling-variant map), `hybrid`. Task type (secondary): `rules` against `nb` trained with
`--label task_type`.

## The steps

1. **Collect** at least 150 descriptions (`COLLECTION-PLAN.md`, `consent-text.md`, `FORM-DRAFT.md`). Remove personal
   data (`data-handling.md`). If fewer than 120 usable items exist by the team's deadline, run anyway and state the
   limit; with a test set under 60 items (with a trade), report numbers **without** any "better than" claim.
2. **Label** twice, independently, with `annotation-guide.md`. Compute agreement **before** discussing
   (`npm run agreement:jobs -- --a <A.csv> --b <B.csv>`). If Cohen's kappa for the category is below **0.60**, revise
   the guide and label everything again, blind, before any system is run. Then agree one gold file (a third person
   decides what two cannot) and record its SHA-256.
3. **Split** once: `npm run jobs:split -- --file <gold.csv> --out-dir <folder outside the project>` (stratified by
   `gold_category`, `none` its own stratum, seed **20261124**, **40% development / 60% test**). Commit the split record
   (`results/split-<date>-<sha8>.json`: ids and hashes, no text). Move the test file **out of the project folder**
   until step 6.
4. **Develop** on the development file only: improve the word lists (dated entries in `config/jobPhrases.js` and
   `docs/CHANGELOG.md`, a new `JOB_PHRASES_VERSION`), run the cross-validation and train the final models on the whole
   development file:
   `npm run jobs:train -- --file <dev.csv> --cv --out <model.json>` (also writes `<model>.no-variants.json`) and
   `npm run jobs:train -- --file <dev.csv> --label task_type --cv --out <task-model.json>`.
5. **Freeze:** commit the word lists, `ANALYZER_VERSION`, the model module (`config/jobModel.generated.js`, written
   with `--format js`) and its `modelId`. That commit must be older than the first test result file.
6. **Test once:** `npm run evaluate:jobs -- --file <test.csv> --model <model.json> --task-model <task-model.json>` with
   the frozen commit checked out and no uncommitted change (the result file records the commit and `gitDirty`). If a
   bug is found after this, fix it, run again, and report **both** runs and the reason.
7. **Which method goes live (decided now).** Let Acc be the test category accuracy. If
   `max(Acc_nb, Acc_hybrid) − Acc_rules ≥ 0.03`, the better of `nb` and `hybrid` goes live (if those two are within
   0.01 of each other, `hybrid`, because it keeps the rules' explanations); otherwise `rules` stays live. Computed on
   unrounded accuracies (a tolerance of 10⁻⁹ only absorbs floating-point noise). `evaluate:jobs` prints the decision.
8. **What the report may claim (decided now).** "A is more accurate than B" only if McNemar's **exact** p after
   Holm's correction over the three comparisons (rules–nb, rules–hybrid, nb–hybrid) is below **0.05**, and the test set
   has at least 60 items with a trade; otherwise "no significant difference was found on n items". Always report
   coverage, selective accuracy, macro-F1 with intervals, per script and per prompt, the ablations, both baselines, the
   task type, the other fields, the agreement, and the live-use statistics (`GET /api/admin/job-requests/stats`) as
   **use, not accuracy**.
9. Any change to this protocol is made **before step 6**, dated, with its reason, in "Protocol changes".

## Definitions (fixed now)

**Items.** The category metrics use the items with `gold_category ≠ none`. Items with `gold_category = none` are
reported separately: how often each system gave **no** trade ("correct abstention"). The classifier is trained only on
items with a trade and never abstains.

**Category metrics** (`metrics.js`, hand-worked tests in `tests/unit/jobEvaluation.test.js`):
- accuracy = correct / items (no answer = wrong), with a Wilson 95% interval;
- coverage = answered / items; selective accuracy = correct / answered;
- per class precision, recall, F1; **macro-F1** = the mean over the classes present in the gold labels or in the
  predictions; a missing answer is a false negative of the gold class, never a false positive; bootstrap 95% interval
  (1,000 resamples of whole items, seed 20261124, percentile method);
- the confusion matrix; all of it also per `script` and per `prompt`.
- Hand-worked: gold [A, A, B, B], predicted [A, B, B, none] → accuracy 0.5000, coverage 0.7500, selective accuracy
  0.6667, F1(A) 0.6667, F1(B) 0.5000, macro-F1 0.5833.

**Paired comparison** of two systems on the same items: b = items only system 1 got right, c = only system 2;
McNemar's exact two-sided p = `min(1, 2 · Σ_{i=0}^{min(b,c)} C(b+c, i) / 2^(b+c))` (McNemar 1947), and the mid-p
`2 · P(X ≤ k) − P(X = k)` next to it (Fagerland et al. 2013 recommend the mid-p; the claim rule uses the exact p, the
conservative one). Hand-worked: (1, 7) → 0.0703 and 0.0391; (1, 6) → 0.1250 and 0.0703; (0, 5) → 0.0625 and 0.03125;
(2, 2) → 1 and 1; (0, 0) → 1; (3, 12) → 0.0352 and 0.0213. Also the paired bootstrap (the same resampled items for both
systems) of the accuracy and macro-F1 differences, 95% interval. **Holm's correction** over the three comparisons of
step 8 (hand-worked: p = {0.010, 0.040, 0.030}, α = 0.05 → only 0.010 is significant).

**Skills:** micro and macro precision, recall and F1 (Module 2's `microMacro`); predicted skills = every skill the
system outputs. Descriptive only (no claim).

**Task type:** the same single-label report as the category, over the items with a gold task type (the others are
left out and counted). McNemar and the paired bootstrap are reported; no claim family.

**City, day, time slot, budget, urgent:** exact match; "not stated" in the gold file and no suggestion count as a
match. Budget = the same amount and unit. Day = the word (`today`, `tomorrow`, `day_after`), not the calendar day.

**Agreement:** Cohen's kappa (Cohen 1960) and Krippendorff's alpha (nominal) for category, task type, script, city,
day, slot and urgent ("not stated" is a label of its own); for skills the mean per-item Jaccard index and the micro-F1
of annotator B against A.

**Split (step 3):** strata in taxonomy order, then `none`; one seeded generator (mulberry32) for all strata in that
order; each stratum (file order) is shuffled with Fisher–Yates; the first `Math.round(0.4 · n)` items go to
development. The same file and seed always give the same split (tested).

**Cross-validation (step 4), on the development file only:** stratified 5 folds, seed 20261124: classes in label order
with one generator; each class is shuffled; its items are dealt round-robin with one counter that continues across
classes, so a class with fewer than 5 items appears in fewer folds (reported). Grid: α ∈ {0.1, 0.5, 1.0} ×
ngram ∈ {1, 2} × minDf ∈ {2, 3} (12 settings). The vocabulary and minDf are computed **inside each training fold** (no
leakage). Score of a setting = the mean of the five per-fold macro-F1 values. Choice: the highest mean rounded to 3
decimals; ties → the larger α, then ngram = 1, then minDf = 3 (the simpler model).

**Naive Bayes** (McCallum & Nigam 1998; Manning, Raghavan & Schütze 2008, ch. 13): features = the analyzer's tokens
(Module 2 normalisation + spelling variants; with ngram 2 also adjacent pairs); vocabulary = features in at least
minDf training documents, never a feature with 3 or more digits; prior N_c / N; Lidstone smoothing
`P(t | c) = (T_ct + α) / (Σ_t' T_ct' + α|V|)`; score `log P(c) + Σ_t n_t(d) log P(t | c)`; ties → the earlier label.

**Fixed clock of the evaluation:** 2026-11-24 10:00 Pakistan time (day words are compared as words, so it does not
change any compared value).

## What is never done

- The test file is never used to change a word list, a parameter or the code before step 6.
- Synthetic data (`dataset.synthetic.*.csv`) is never used to report a result; its numbers only show that the scripts
  run.
- Live job texts typed by customers on the website are **not** used for this evaluation (`data-handling.md`).
- No external service and no pre-trained model is used.

## References

- McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages.
  *Psychometrika*, 12(2), 153–157. https://doi.org/10.1007/BF02295996
- Fagerland, M. W., Lydersen, S., & Laake, P. (2013). The McNemar test for binary matched-pairs data: mid-p and
  asymptotic are better than exact conditional. *BMC Medical Research Methodology*, 13, 91.
  https://doi.org/10.1186/1471-2288-13-91
- Dietterich, T. G. (1998). Approximate Statistical Tests for Comparing Supervised Classification Learning Algorithms.
  *Neural Computation*, 10(7), 1895–1923. https://doi.org/10.1162/089976698300017197
- McCallum, A., & Nigam, K. (1998). A Comparison of Event Models for Naive Bayes Text Classification. *AAAI-98
  Workshop on Learning for Text Categorization*, 41–48.
- Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*, ch. 13. Cambridge
  University Press.
- Wilson, E. B. (1927). Probable Inference, the Law of Succession, and Statistical Inference. *JASA*, 22(158), 209–212.
  https://doi.org/10.1080/01621459.1927.10502953
- Cohen, J. (1960). A Coefficient of Agreement for Nominal Scales. *Educational and Psychological Measurement*, 20(1),
  37–46. https://doi.org/10.1177/001316446002000104

## Protocol changes

1. **24 Nov 2026 (Batch 8A, Stage 9 independent review; before any real description exists).** The code disagreed
   with the frozen text: the per-script and per-prompt category reports held only items, accuracy, coverage, selective
   accuracy and macro-F1, while "Definitions" says "all of it also per script and per prompt" and step 8 asks for
   macro-F1 with intervals per script and per prompt. **The text is unchanged; the code now follows it**: each script
   and prompt subset holds the full single-label report (Wilson interval, per-class P/R/F1, macro-F1, confusion
   matrix) and the bootstrap interval of macro-F1. Reason: the review found the gap; no data had been seen.
2. **24 Nov 2026 (same review; no change to this text).** Three fixes outside the protocol's rules, recorded here so
   the history is complete: the synthetic-file check now reads only the first line of a dataset (`# SYNTHETIC`), so a
   real file with a comment mentioning "synthetic" is never treated as synthetic; the word lists became version
   `2026-11-24-v2` (the Urdu spelling of "stuck", `اٹک`, is no longer read as the city Attock; a free-standing `k` is
   no longer a "thousand"; see `backend/config/jobPhrases.js`); the "kept skills" use statistic counts a full 5-skill
   save of more than 5 suggestions as kept.
