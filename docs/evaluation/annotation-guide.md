# Annotation guide (two team members, independently)

## Before you start
- Read the taxonomy (`backend/config/skillTaxonomy.js`, or `GET /api/meta/taxonomy`).
- Each annotator gets **the same file without labels** and labels it **alone**. Do not discuss
  items until both files are finished.
- Do **not** run the extractor on the text while labelling (you would copy its mistakes).

## What to label
1. **gold_skills** — every taxonomy skill the worker **says they do**. Label what is meant, not
   only exact words: "I install fans and lights" → `elec_fittings`, even if the rules miss it.
   - Do not label skills that are only mentioned without doing them ("my brother is a plumber").
   - Do not label a skill for past learning that the worker says they cannot do.
   - If a real skill is missing from the taxonomy, leave it out and write it in a separate
     "missing skills" list for the team (do not invent ids).
2. **gold_category** — the main trade. If two trades are equally strong, choose the one the worker
   names first and add a note.
3. **gold_years / gold_months** — only what the text states. "Since 2019" is not converted (leave empty).
4. **script** — `english`, `roman_urdu`, `urdu`, or `mixed` (two scripts or languages in one text).

## Measuring agreement
Run in `.\backend`:
```powershell
npm run agreement:skills -- --a ..\data\annotator-a.csv --b ..\data\annotator-b.csv
```
- **Category:** Cohen's kappa and Krippendorff's alpha over one label per description.
- **Skills:** one yes/no decision per (description, skill) for every skill either annotator used;
  kappa and alpha over those decisions. (Skills nobody used are left out, otherwise the many
  "no/no" pairs would make agreement look higher than it is.)
- Report both numbers and the raw agreement. A common reading: alpha ≥ 0.80 good, 0.67–0.80
  tentative, below 0.67 the guide must be improved and the labelling repeated.
- Then meet, resolve each disagreement, and save the agreed **gold** file. Keep both original files.
