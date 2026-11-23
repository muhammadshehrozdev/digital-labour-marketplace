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

## Channels

- Family and friends of the team, and WhatsApp groups (the form link with the consent text).
- **In person with a paper form** for people who prefer to speak: a team member reads the consent text, the person
  speaks, and the team member **writes their words exactly** (no correcting, no translating). `source = in_person`.
  No voice recording.
- Only people aged 18 or older. Nobody is paid or pushed.

## Who does what

| Step | Who |
|---|---|
| Build the Google Form from `FORM-DRAFT.md` (with the user) | Usama Asif |
| Share the form; collect paper forms | the whole team |
| Remove personal data, give ids (`data-handling.md`) | Usama Asif |
| Label, independently (`annotation-guide.md`) | two team members (ideally one who did not write the word lists) |
| Agreement report, then the gold file (a third person decides what two cannot) | the two labellers + a third member |
| Split, develop, freeze, test once (`PROTOCOL.md`) | Usama Asif, checked by another member |

## Before starting

1. Ask the supervisor the three open questions (`docs/modules/MODULE-6.md`), in particular whether ethics approval is
   needed.
2. Fill in **[team email]** and **[date the test set is frozen]** in `consent-text.md`.
3. Have the Urdu and Roman Urdu texts checked by a team member who reads Urdu.
