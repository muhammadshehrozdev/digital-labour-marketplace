# Collection plan — real job descriptions (Module 6, Batch 8C)

**Owner:** Usama Asif (Module 6 in the proposal's work split). **Labelling:** two team members, independently.
**Protocol:** `PROTOCOL.md` (frozen before any real description exists).

## Target

- At least **150 descriptions**, and at least **10 per trade** (the 9 trades of `backend/config/skillTaxonomy.js`).
- A mix of English, Urdu, Roman Urdu and mixed writing (whatever people choose; never asked for).
- If fewer than 120 usable items exist by the team's deadline, the protocol still runs and states the limit
  (`PROTOCOL.md` step 1).

## Prompts

1. **General first.** The form's question names **no trade** and shows **no example sentence** (`FORM-DRAFT.md`),
   because examples would teach people our words and make the analyzer look better than it is. `prompt = general`.
2. **Targeted later, only for missing trades.** When a trade has fewer than 10 descriptions after the general round,
   a copy of the form adds one situation sentence ("You are moving house.", "Your fridge stopped cooling.",
   "You need help with cooking at home."), still without an example description. `prompt = targeted`. The report
   gives the results per prompt.

## The form and its responses

- The form is built and run **by the team in Google Forms** (owner: **Usama Asif**), with the final texts of
  `FORM-DRAFT.md` and `consent-text.md`.
- Responses stay in **the form's own Google Sheet**, shared with the team only (never published, never shared by link).
- A CSV export lives **outside the repository**, or in `backend/evaluation/job-analysis/data/` (ignored by Git; real
  descriptions never go into Git).
- Before labelling, the team **removes any name, number or address** that someone wrote anyway (`data-handling.md`).

## Channels

- Family and friends of the team, and WhatsApp groups (the form link with the consent text).
- **In person with a paper form** for people who prefer to speak: a team member reads the consent text, the person
  speaks, and the team member **writes their words exactly** (no correcting, no translating). `source = in_person`.
  No voice recording.
- Only people aged 18 or older. Nobody is paid or pushed.

## Who does what

| Step | Who |
|---|---|
| Build and run the Google Form from `FORM-DRAFT.md` | Usama Asif |
| Share the form; collect paper forms | the whole team |
| Remove personal data, give ids (`data-handling.md`) | Usama Asif |
| Label, independently (`annotation-guide.md`) | two team members (ideally one who did not review or change the word lists) |
| Agreement report, then the gold file (a third person decides what two cannot) | the two labellers + a third member |
| Split, develop, freeze, test once (`PROTOCOL.md`) | Usama Asif, checked by another member |

## Before starting

1. The supervisor's guidance (24 Nov 2026, reported by the team; `docs/modules/MODULE-6.md` §11): no ethics approval
   is needed; the form says clearly that it collects descriptions for the project.
2. Fill in **[team email]** and **[last date]** in the Google Form (the consent text and question 4).
3. The consent and form texts are final (reviewed by the team with Batch 8B). The people who test the website
   (`docs/MODULE-6-MANUAL-TEST.md`) do **not** fill in the form with their test sentences, and test sentences never go
   into the dataset.
