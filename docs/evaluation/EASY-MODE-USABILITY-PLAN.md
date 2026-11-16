# Easy mode (Listen, Speak, See): usability test plan

**This is a plan only. No test has been run and there are no results yet.** It describes how the team
can test the Batch 5 helpers (D-033 to D-036) with real workers who read little or nothing.

## Question

Can a worker who reads little or nothing register, add a skill and upload a proof photo on a phone with
the Listen / Speak / See helpers, and where do they get stuck?

## Participants

- **Who:** adults who work as electricians, plumbers, painters, masons, carpenters, AC technicians or
  domestic workers, who say they read Urdu "little" or "not at all". A few who read well, as a comparison.
- **How many:** 5 to 8 people for a first round. Small rounds find most of the big problems; fix them,
  then test again with new people. (This is a usual practice for usability tests, not a statistical
  claim; no percentages will be generalised from so few people.)
- **Recruiting:** through people the team knows (a site supervisor, a training centre, family contacts).
  Nobody is paid to "pass"; a small thank-you (for example mobile balance) may be given to everyone.

## Consent and privacy

- Read the consent text aloud in Urdu (adapt `docs/evaluation/consent-form.md`); record a spoken or
  thumb-print "yes". Anyone may stop at any time without a reason.
- **Synthetic data only:** participants use a prepared test phone and the **local demo website**
  (`bash scripts/preview.sh demo`), never the live website. They are given a made-up name, a test
  phone number and a test email to use; they do not enter their own CNIC, phone or address.
- Do not record faces. If the screen is recorded, only the screen and the participant's finger.
  Notes use a participant number (P1, P2 …), not names. Delete screen recordings after the notes are
  written (follow `docs/evaluation/data-handling.md`).

## Setup

- An Android phone with Chrome, the website open in Urdu, sound on, the microphone allowed.
- Check first on **/voice-check**: is there an Urdu voice or are the team's clips recorded? Write down
  which (clips / device voice / text only): results depend on it.
- One moderator (speaks Urdu, gives tasks, does not help unless the person is stuck for 2 minutes) and one
  note-taker.

## Tasks (said aloud by the moderator, never shown as text)

1. **Register as a worker** with the given name and test number. (The email and the password are
   prepared on a card that the moderator reads out: a known limit, D-035.)
2. **Fill in "About you" and "Your work"**: city, trade (by picture), years of work, daily rate.
3. **Add a skill**: say what work you do, choose the suggested skills.
4. **Upload a proof photo** of a prepared picture (a printed work photo).
5. **Find the help** on any page and say what the page is for.

## What to measure

| Measure | How |
|---|---|
| Task done or not | Done alone / done with help / not done |
| Time per task | From the end of the instruction to the end of the task |
| Errors | Wrong field, wrong picture, wrong value saved, had to undo |
| Help used | How often Listen, Speak, the page help and the picture 🔊 were pressed |
| Voice typing | Times used; times the answer was right first time; "did not understand" messages |
| Where stuck | The screen and the step, in the participant's words |
| Opinion | Three spoken questions at the end: what was easy, what was hard, would you use it |

## After the test

- Write one page per participant (numbers only, no names) and one summary table.
- List problems by how many people met them and how badly they blocked the task; fix the worst first.
- Report numbers as counts ("4 of 6 completed task 3 alone"), never as percentages of a population.
- Repeat with new participants after the fixes.
