# Reputation pilot plan (Module 4) — a plan only, no results

The simulation (`backend/evaluation/reputation/`, `docs/modules/MODULE-4.md` §5) shows how the reputation model
behaves **if** its assumptions hold. This plan describes a small real pilot to check the assumptions. Nothing has
been run; there are no results in this file. Results, when they exist, are reported separately with the date,
the number of participants and the method, and never mixed with simulation numbers.

## Questions

1. Are real reviews as informative as the simulator assumes (star noise around one quality)? Compare the stars of
   the same worker across customers.
2. Do customers understand "Few reviews yet", "x of y" and the verified work history, and do they use them?
3. Do workers understand the four rules on "My reputation" (listen and read), and what they change in their behaviour?
4. Do the request limits, the contact-info check and the cancellation rules cause real problems (false refusals)?
5. Which parameter values (half-life, auto-completion weight, reviewer-trust floor, prior weight W) should be
   kept? The simulation found that recency gives recent fake reviews more weight; the pilot checks how often
   genuine reviews are recent too.

## Design (proposed)

- Participants: about 10 workers and 20 customers in one city, recruited with informed consent
  (`docs/evaluation/consent-form.md` adapted for bookings), on a separate pilot database.
- Duration: 4 weeks. Real bookings between consenting people only; no invented reviews.
- Data kept: booking states and outcomes, review stars and quick answers (no comment text in analysis), the
  snapshot after each change; no phone numbers or names in the analysis file (`docs/evaluation/data-handling.md`).
- Measures: agreement between the reputation order and a short independent rating by the team after visiting
  a sample of completed jobs; false refusals of the contact-info check; time to answer requests; cancellation
  and no-show rates; a short spoken questionnaire for workers (in Urdu).
- Analysis: descriptive statistics and the same rank measures as the simulation, reported with their
  uncertainty and the small sample size stated plainly.
- Ethics: the supervisor approves the plan and the consent form before any recruitment.

## Not in scope

Changing the live parameters during the pilot; any automatic punishment; reporting the pilot as a validation of
the model before the analysis is complete.
