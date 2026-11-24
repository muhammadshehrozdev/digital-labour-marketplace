# Changelog

What changed in each phase. Test results are copied from real runs only.

## Batch 8 — Module 6: describe a job (Batch 8B, the screens; 24 Nov 2026)

Why: Batch 8A built the backend of Module 6; this batch builds what people see, with the results of the check of 8A,
the supervisor's guidance and the final consent texts. The live analyzer is still the rule-based word lists; the
screens read its name from the API, so Batch 8C can switch the method without a screen change. No new package.

- **Describe a job** (customers; the card on Find workers and the menu): type or speak (🎤) the job in your own words,
  press **Check my words**, and the words the app used are marked. Step 2 shows every suggested detail as a picture
  choice with the words that led to it; you change anything. Step 3 saves the job request (`JR-…`).
- **Checking again never overwrites what you changed**: a changed detail keeps your choice and the new suggestion is
  only offered ("New suggestion: X — use it?"); a tie or no trade words chooses nothing (D-093).
- **My job requests**: tabs by state with counts; **the job request page**: the details, only the allowed buttons
  (change, choose a worker, close with a reason, delete), the requests sent, and "What the app understood from your
  words" (kept / changed / nothing suggested; never a score).
- **Workers for this job**: workers of the trade in your city, in the order you choose (not a ranking), each with its
  reasons; **Send this job** opens the request page with a read-only "Your job" card; one request at a time, refused
  in plain words (D-096).
- **Workers** see "From job request JR-…" and the kind of work on the request (also spoken by 🔊), **never the budget**;
  the budget is shown only on the customer's own job pages and to admins (D-100).
- **Admins**: Job requests (list without budget, the detail drawer), "How suggestions were used" (use, not
  correctness) and "Try the analyzer" (D-098).
- Easy mode on every new page: 🔊 help on every field and picture, 🎤 where allowed, page help, three languages, right
  to left, both themes; the Help Centre guide "Describe a job".
- **Word lists `2026-11-24-v3`, then `v4`** (before any real description; no rule of the protocol changed, "Protocol changes" 3 and 5):
  a city spelling that is also an everyday word (`atak`, `اٹک`, `wah`, `mari`, `مری`) names the city only directly
  before a place word ("مری میں" = in Murree); a city spelling directly before `road`, `rd`, `روڈ`, `chowk` or `چوک` is a
  road, not the city ("Murree Road Rawalpindi" → Rawalpindi); new phrases `لیک`, `پائپ لیک`, `pipe leak`, `گٹر بند`,
  `سیم`, `دروازہ اٹک`, `darwaza atak`, `istari`, `بزرگوں کی دیکھ بھال`, `ماسی چاہیے`, `maasi chahiye`, `masi chahiye`; task
  words `فٹ کرنا`, `فٹنگ` (install) and, in v4 after the review, `ghar ke kaam + maasi` (household help only with a maid,
  D-097). Module 2's output is unchanged.
- `POST /api/job-requests/analyze` adds `city.candidates` for the "Which city?" buttons (D-095; the analyzer and the
  evaluation are unchanged). References corrected (Khan et al. 2022; McCallum & Nigam 1998; Manning et al. 2008 ch. 13;
  "Protocol changes" 4). The 14 Module 6 error texts in Urdu and Roman Urdu: second draft with the dictionary's words.
- The supervisor's guidance (D-091): the self-trained naive Bayes classifier compared with the word lists is acceptable;
  no ethics approval is needed. The consent and form texts are final (no example job); the team runs the Google Form.
- Documentation wording: neutral wording in the documents, the README, comments and data-file headers, kept by
  `backend/tests/unit/docsWording.test.js`.
- Synthetic demo data `npm run demo:module6` (one job request in every state; `preview.sh` runs it; D-099); the manual
  test list for testers `docs/MODULE-6-MANUAL-TEST.md`; new texts for review `docs/i18n/REVIEW-BATCH-8B.md`.
- **Header** (the team's choice, D-101): one more step before the links leave the bar, the logo keeps only its shield;
  so English customers keep all five links on laptops.
- Decisions D-091 to D-101.
- **Independent review** (Stage 9, a separate review pass): 10 findings (3 medium, 7 low), all fixed with tests — the
  main ones: "Use it" on a trade suggestion now keeps the skills of that trade; "ghar ke kaam" counts as household help
  only together with "maasi" (word lists `2026-11-24-v4`, "Protocol changes" 5); the generators of two review documents
  use the neutral wording too (the wording test now reads `frontend/scripts`). Found in the full runs and fixed: an
  older bug where a toast's close timer outlived the toast area (it broke a test run after a test file had ended), and
  the new e2e test now gives the shared e2e admin back its English, light settings.
- Tests (real runs, 24 Nov 2026 PKT, final code): backend **1317/1317** in 57 files (baseline 1270 in 55; line coverage
  98.83%, services 98.84%, controllers 98.83%, middleware 100%); frontend **1376/1376** in 33 files (baseline 1282 in
  30); e2e **80/80** in 13 files (8A: 71/71 in 12); lint and build clean; Module 2's `evaluate:skills` output identical
  to the reference run (without the date field).

## Batch 8A — Module 6, Problem/Job Analyzer: backend, analyzers, evaluation harness (23–24 Nov 2026)

Why: the proposal's Module 6, as the team decided on 23 Nov 2026 (D-080 to D-090): a rule-based analyzer **and** the
team's own small classifier, compared on real data under a pre-registered protocol; the customer confirms every
suggestion and chooses the worker; workers never see a list of jobs. Backend, evaluation and documents only; the
screens are Batch 8B, the real evaluation Batch 8C. No new package, no external service, no pre-trained model; the
website never says "AI".

- **Job requests** (`/api/job-requests`): analyze a text (nothing saved), save the confirmed job (`JR-2026-000001`),
  list, read, edit with versions (only while open), close, delete (never after a booking); derived states open,
  requested, accepted, done, expired (30 days), closed; limits 10 open and 10 new per day.
- **Workers for this job**: a filter (same trade, same city — "Pindi" = "Rawalpindi" —, listed, not suspended) in the
  customer's directory sort, with the reasons; never a phone number, WhatsApp, CNIC, email or address.
- **The request with the job**: the same checks as a normal request (one shared code path) plus "a skill of the job's
  trade"; one open request per job by a reservation (two taps: one 201, one 409); the booking copies the job's city,
  area and description; the worker sees the job code and the kind of work, **never the budget**.
- **The rule-based analyzer `job-rules-1`**: Module 2's normalisation plus Roman Urdu spelling variants, 188 problem
  phrases (44 in Urdu script), task-type words, city, day, time, urgency, budget and an address hint, with the words
  that led to each suggestion and no score. `npm run jobs:try -- "<text>"`. Module 2's output is unchanged.
- **The team's naive Bayes classifier** (plain JavaScript) and the hybrid: hand-worked numbers as unit tests; the
  production server refuses a model trained on synthetic data; **live method: rules** until Batch 8C.
- **Evaluation harness** (`backend/evaluation/job-analysis/`): split, cross-validation, the compared systems, McNemar
  exact and mid-p, Holm, bootstrap intervals, agreement; tested on **SYNTHETIC data only** (no number from it is a
  result). **The protocol is pre-registered and frozen at `81ba8f6`** (`docs/evaluation/job-analysis/PROTOCOL.md`).
- **Documents for real data**: consent text (three languages, drafts), form draft, collection plan, annotation guide,
  data-handling note. Questions for the supervisor in `docs/modules/MODULE-6.md` §11.
- **Admins**: a read-only job list (no budget), the detail (budget, analysis, bookings, the customer's name only) and
  use statistics "kept / changed / not suggested" (use, not accuracy).
- **Part F**: `maxWorkers` measured (2, 3, 4 workers, three runs each, interleaved; all nine runs clean; medians 98 s,
  87 s, 89 s) → stays 3 (D-089).
- **Two pre-existing tests fixed** (not Module 6): a booking test that failed between 00:00 and 09:00 Pakistan time,
  and two Module 5 phone-number checks that a random hash could trip; both keep every check.
- Decisions D-080 to D-090. Texts: 14 new error codes in three languages, the Urdu word lists, the consent and form
  texts for team review (`docs/i18n/REVIEW-BATCH-8A.md`; no clips in this batch).
- **Independent review** (Stage 9, a separate review pass): 8 findings; 7 fixed with tests (the main one: an edit could
  slip in while a request's booking was being written), 1 kept as a documented decision. Word lists `2026-11-24-v2`.
  The per-script report gap is entry 1 of the protocol's "Protocol changes" (the protocol text is unchanged).
- Tests (real runs, 24 Nov 2026 PKT): backend **1270/1270** in 55 files (baseline 1018 in 50; line coverage 98.83%,
  services 98.84%, controllers 98.83%, middleware 100%); frontend **1282/1282** in 30 files (unchanged count; the
  dictionary test covers the new codes); e2e **71/71** in 12 files; lint and build clean; Module 2's `evaluate:skills`
  output identical to the reference run (without the date field).

## Batch 7 — Module 5, fair wage and work protection (19–23 Nov 2026)

Why: the proposal's Module 5, as the team's "option C" of 19 Nov 2026 (D-067): the government minimum wage as a
reference, the platform's own completed-job prices, and an admin price guide with a written source as the fallback.
No new package. Nothing here is AI: written formulas and fixed rules. The app never moves money.

- **Price information:** under the chosen skill on "Request this worker" and on a new Price information page: the
  typical price on this platform (the middle half of agreed prices, only from at least 5 jobs by 3 workers for 3
  customers, one job per pair, both-confirmed, last 12 months), else the admin team's price guide with its source and
  month, the government minimum wage reference for the region (with its status, date and sources), and the worker's
  own rates. 🔊 reads it all, amounts in words.
- **Agreed price and conditions on the booking:** an optional offer with the request; then either person proposes,
  the other agrees, with picture cards (whole job / per day / per hour, a −/+ stepper, how long), the important
  conditions of the trade (materials, advance, payment time and method, visit charge), the fixed rule "Extra work
  only after a new price is agreed in the app", and a read-back with 🔊 before Send or Agree. Every version is kept.
- **Rule-based checks that warn and never block:** below the minimum wage reference for a day, an hour or a job of
  one or 2–3 days; a large advance; materials bought by the worker without an advance; missing conditions; below
  most prices on this platform. Shown to both people.
- **Payment records:** "I paid" / "I received", confirmed only by the other person ("Yes, I received it"), or "This
  is not right" with a reason; never edited, never confirmed automatically. A summary line, a printable record ("not
  a bank receipt"), and **My earnings** for workers (only confirmed money in the total).
- **Work protection:** short tips for workers and customers on the request, the Requests card, the booking and the
  payment card; a Help Centre guide "Fair pay and safe work" with the minimum wage table and helplines with sources.
- **Admins:** Price guide (only with a written source; edit, archive, history), Payments (read-only, disputed first;
  Module 9 will decide), a payments CSV, an Overview banner when a wage figure is more than a year old.
- **SIMULATION (30 seeds per scenario; `docs/modules/MODULE-5.md` §8; not real prices):** the rules make the range
  appear in fewer markets (availability 0.348 against 0.887 for a plain average in `base`), with a slightly smaller
  error (0.097 against 0.108) and a much smaller shift from one dishonest worker (0.086 against 0.600 in `inflator`)
  or pair (0.039 against 0.469 in `pair_flood`). Attacks can still make a range appear in a market with too few jobs.
- **Part A, docs only (D-079):** the deploy runbook's health check corrected: `/api/health` proves the function
  starts; `/api/auth/session` (200 / 503) is the database check.
- Decisions D-067 to D-079. Texts: 512 new keys in three languages, drafts for team review
  (`docs/i18n/REVIEW-BATCH-7.md`, 57 clips to record). Manual checklist: `docs/MODULE-5-MANUAL-TEST.md` — check the
  wage figures against the official notifications first.
- Tests (real runs, 23 Nov 2026): backend **1018/1018** (baseline 823; line coverage 98.63%, services 98.51%,
  controllers 98.54%, middleware 100%); frontend **1282/1282** (baseline 1211; line coverage 89.83%); e2e **68/68**
  (baseline 57; 11 new Module 5 tests incl. axe); lint 0; build OK. A full browser walk-through on the demo preview
  (432 views: visitor, worker, customer, admin × English and Urdu × light and dark × 360 / 768 / 1280 px) found 12
  views wider than a 360 px phone (the new payment record, My reputation, admin Reviews and Reputation flags); fixed
  and checked again. The full run also found that two "Agree" presses at once could answer 400 instead of 409; fixed.
- **Data correction, 23 Nov 2026 (the team's re-check of the wage figures):** Balochistan Rs 37,000 a month from
  1 Jul 2024, notified (source: WageIndicator Balochistan page; the "maintained at Rs 40,000" claim removed) → Rs 1,423 a
  day, Rs 178 an hour; Khyber Pakhtunkhwa Rs 40,000 from 1 Jul 2025, notified (source: Profit, KP notification) →
  Rs 1,538 a day, Rs 192 an hour; the Rs 45,000 of the 2026-27 budget is kept only as a note (notification not found).
  Both `checkedOn` 2026-11-23. The tests now expect the corrected figures (a data correction, not a loosened test).

## Batch 6B — header fix, "Install this app", reputation engine v2 (17 Nov 2026)

Why: a header that cut off the account name and its menu on Windows laptops (125–150% display scaling); the
team's request that everyone is invited to install the website as an app; and the Batch 6 finding that rep-1 was
not better than a plain average. No new package. Nothing here is AI: written formulas and fixed rules.

- **Header (D-059):** measured, never cut off: it hides the "Ctrl K" hint, then the name next to the avatar,
  then moves Sound and language into the account menu (visitors: "More"), then switches to the mobile menu.
  Every menu stays inside the window (8 px margin); a long email ends with "…". Checked in the browser for every
  role, English and Urdu, at 10 widths from 360 to 1920 px.
- **Install this app (D-060):** an invitation on the second page (or after 30 s) for everyone, once per 14 days,
  with 🔊; a permanent "Install this app" button at the bottom of every page. The browser's own question where
  it exists; otherwise steps with pictures (Chrome/Edge menu, iPhone Safari Share → Add to Home Screen, "open in
  Safari", "use Chrome or Edge"). No website can install itself: the person always presses "Install".
- **Reputation engine v2, rep-2 (D-061 to D-066):** recency off for reviews; reviews from brand-new customer
  accounts count, but all together at most one review; many reviews in a few days count half; the platform's
  typical rating as the starting point; "Best track record" orders by the middle estimate. Chosen and tested
  with a pre-registered protocol: candidates, rule and success criteria fixed first; selection on the Batch 6
  seeds; the choice frozen in a commit; one run on 30 new seeds.
- **SIMULATION result (test seeds, not a real-world result):** S1, S2 and S3 met — as good as the plain Beta
  without attacks (NDCG@10 0.936), much better under naive fake accounts and collusion (sybil_k10 0.934 against
  0.758 for the plain average), better than rep-1 in 97–100% of seeds. **rep-2 is live.** Not solved: an
  attacker who first hires other workers (worse than the plain average there); a young platform with mostly
  first-time customers is slightly below the plain Beta.
- **What people see:** "My reputation" and the Help Centre guide list the live rules from the server
  (`GET /api/meta/reputation-rules`); new per-review reasons; the public depth word follows the visible reviews;
  "Best track record" explains that new workers start in the middle. Urdu "I did come" is gender-neutral.
- **Texts:** new and changed texts in English, Urdu and Roman Urdu (`docs/i18n/REVIEW-BATCH-6B.md`).
- **Tests (real runs, 17 Nov 2026):** backend 823/823 (43 files; coverage lines 98.6%, reputation services
  99.24%); frontend 1211/1211 (29 files; coverage lines 90.99%); lint 0; build OK; e2e (full run, 18 Nov 2026,
  15:24–15:46 UTC, 10 files): 56/57 passed, 1 failed — the defence demo (`demo-script.e2e.js`): after "Create
  account" in Urdu the page was still on `/register` after 10 s, although the worker was logged in; run alone right
  after, it passed (1/1). Five more runs (19 Nov) failed once, at the photo upload (still uploading after 10 s).
  Cause: on an overloaded machine (the full suite next to the preview and the editor; minutes after a restart) a
  server write such as registration or the photo upload took longer than the 10 s the test allowed; measured
  otherwise at 0.5–3.5 s, also under heavy CPU and disk load (15 instrumented runs, none failed). Fix, test only,
  no check removed: those two steps wait for the server's answer as long as the app does (20 s), check that it is
  201, then give the screen the usual 10 s. Then 5/5 runs passed. Baseline before the batch: backend 754/754, frontend 1161/1162 (one timing flake, passes alone), Batch 6
  e2e 50/50. Existing tests changed: listed in `docs/DECISIONS.md` D-065 and the Batch 6B report.

## Batch 6 — Module 4: bookings, reviews and the reputation engine (16–17 Nov 2026)

Why: Module 4 of the proposal (Reputation and Reliability Engine). The team reports supervisor approval
(16 Nov 2026) for a minimal Work Booking inside Module 4 (D-037) and for evaluating the engine by
simulation (D-038). No new package. Nothing here is AI: written formulas and fixed rules.

- **Work Booking:** a customer requests one worker (picture choices for work, day and time; area;
  description), the worker hears the request (🔊) and accepts or declines; both press "Work done", or one
  side and 72 hours pass; cancellations with reasons (a worker's late cancellation counts double); "Worker
  did not come" from the start + 2 hours; one small dispute step decided by an admin (D-039 to D-042,
  D-049, D-050, D-053, D-054).
- **Phone numbers (D-002 delivered, D-052):** only inside `GET /api/bookings/:id`, only to the two people
  and admins, only while accepted and for 7 days after the close; never in lists, the directory, profiles,
  notifications or CSV files. Free texts are refused when they contain a phone number, email, link or CNIC-like number.
- **Reviews:** after completed work only, once, never edited (1–5 stars, four quick thumbs, would hire
  again, optional comment with voice typing, read-back before sending); the worker replies once and can
  report; admins hide with a reason (never for being negative) or restore (D-041, D-051).
- **Reputation engine:** a weighted Beta reputation model (Jøsang & Ismail 2002) with provenance, recency,
  reviewer-trust and repeat-customer weights; expected value, uncertainty, a cautious lower estimate and a
  depth word; a reliability record from booking outcomes; a snapshot on the worker profile rebuilt after
  every change and daily (D-043 to D-048). Pure functions, unit tested with hand-worked examples.
- **Display:** public profile (stars with the count, depth in words, star bars, "x of y" quick answers,
  reliability counts, reviews with replies, "Done through this platform"), directory and compare lines,
  "Best track record" sort with an honest note, "Has done jobs on this platform" filter; the worker's "My
  reputation" page in plain words with 🔊 (D-045, D-047).
- **Admin:** Bookings, Disputes, Reviews and Reputation flags pages, a Reputation tab per worker,
  Overview charts of bookings and stars, bookings and reviews CSV exports (no phone numbers).
- **Notifications:** 16 new booking and review types; customers get a "Notifications" menu link with the
  unread count (D-057).
- **Evaluation by SIMULATION** (`backend/evaluation/reputation/`, 30 seeds, 11 scenarios, four baselines,
  ablations). Finding: with the provisional parameters the model is not better than the plain average
  overall, and recent fake reviews still buy places; the individual defences reduce the attacks they target.
  Parameters were not changed (D-048, D-058). Simulation results only, not real-world results.
- **Matching inputs for Module 7:** `toMatchingSignals` and `docs/contracts/MATCHING-INPUTS.md`.
- **Daily cron:** `GET /api/cron/daily` with `CRON_SECRET` (optional), `vercel.json` cron entry (not deployed).
- **Texts:** 619 new texts in English, Urdu and Roman Urdu (drafts for review, `docs/i18n/REVIEW-BATCH-6.md`).
- **Docs:** `docs/modules/MODULE-4.md`, decisions D-037 to D-058, data model, API, security, use cases,
  traceability, admin guide, demo script, manual test, pilot plan.
- **Tests changed (D-056, D-057):** the frontend honesty test's star rule (planned), the profile contact
  note text, the worker's top menu list and the admin sidebar list (still exact); backend honesty test
  folder list and the error-catalog word list (NFKC).

Tests (real runs on 17 Nov 2026, one suite at a time): backend **754/754** (40 files; before Batch 6: 540),
frontend **1162/1162** (26 files; before: 1089), lint 0 problems (310 files), production build OK. Coverage
(lines): backend 98.56% overall, services 98.11%, controllers 98.86%, middleware 100% (target 90%); frontend
90.74% (target 80%), Module 4 screens 91.5%. End-to-end (Playwright, local `dlm_e2e` database): **50/50** (before: 45), including the five Module 4 flows and axe in 3 languages × 2 themes on the new pages.

## Batch 5 — Listen, Speak, See: audio help, voice typing and picture choices (14–16 Nov 2026)

Why: at the mid defence the panel asked how labourers who cannot read will use the website. Design:
Medhi, Sagar & Toyama (2007), "Text-Free User Interfaces for Illiterate and Semiliterate Users"
(D-033). Frontend only; no new package; nothing under `backend/` changed. None of this is AI: it is the
browser's own speech feature and our own help texts.

- **Listen (🔊):** a Listen button under every box of the worker and customer screens says what to do
  there, and the same help opens in large text. The sound comes from a clip the team recorded, else a
  voice on the device, else the help is shown on screen with the words "no voice on this device"
  (D-034). Roman Urdu users hear the Urdu audio.
- **Speak (🎤):** voice typing on names, city, trade, job, search, skills description and numbers
  (phone digit by digit, years and rupees as amounts; nothing is written when a number is not
  understood). Never on password, CNIC or email (D-035). A one-time notice explains that the browser
  sends the voice to its maker's service. After voice typing the website reads back what it wrote, and
  Undo brings the old text back.
- **See:** picture choices instead of drop-downs for trade (the nine trade drawings), availability, the
  skill of a proof photo and the proof kind; every picture can be heard; field icons; buttons with an
  icon and a word.
- **Page help:** a round speaker button in the same corner of every in-scope page, and a **Sound** menu
  in the header (show Listen/Speak, read aloud by itself). Settings stay on this device only.
- **Language chooser:** each language card can be heard ("press here for Urdu"), and the one-time
  question "Should the website read aloud?" follows the choice.
- **Voice check** page (`/voice-check`, linked from the Help Centre): which voices and clips this device
  has, test sentences, a microphone test, and how to add an Urdu voice on Android.
- **Recorded clips:** `/dev/recorder` (development builds only) for the team to record the Urdu help in
  their own voices; `npm run audio:manifest`; `docs/audio/RECORDING-GUIDE.md`. The service worker
  (v2) keeps clips for offline use; API answers are still never cached. No clips are recorded yet.
- Texts: 152 new or changed texts in English, Urdu and Roman Urdu are drafts until the team checks them
  (`docs/i18n/REVIEW-BATCH-5.md`, D-031).
- Docs: D-033..D-036, `docs/EASY-MODE-MANUAL-TEST.md` (what to try on a laptop and a phone),
  `docs/evaluation/EASY-MODE-USABILITY-PLAN.md` (a plan only, no results), ARCHITECTURE, USE-CASES
  (UC-17..23), SECURITY, TRACEABILITY, README, DEMO-SCRIPT (optional part).
- Known limits: registration still needs an email address and a 15-character password; voice quality
  depends on the device; Urdu audio needs a device voice or the team's clips. Speech could not be heard
  or spoken in the development container: the speech features are tested with fakes, and the real
  sound is for the manual checklist.

**Test results (real runs, 16 Nov 2026):** backend 540/540 (unchanged); frontend 1,089/1,089 (22 files;
before: 945 in 16 files); end-to-end 45/45 in 11.1 minutes (before: 35/35); lint 0 problems; build OK.

## Go-live kit and cleanup (11 Nov 2026)

- Wordmark: "Digital Labour Marketplace" is one element, weight 700, in the logo's colour, the full name at
  every width (before: two weights, the second word grey and hidden on phones).
- Internal working notes (the instructions file in the root folder, the batch plans, `docs/audit/`) are no longer
  tracked (kept on disk, in `.gitignore`); every reference now points to a tracked document. `docs/SECURITY.md` lists the project
  security rules.
- Go-live (D-032, `docs/DEPLOY-RUNBOOK.md`): `backend/api/index.js` as the one Vercel function, a modern
  `backend/vercel.json` (no legacy `builds`; only `public/` served), `frontend/vercel.json` passes
  `/api/:path*` to the backend before the app fallback; production settings check (missing variable,
  local database, non-https origin, missing `TRUST_PROXY` -> the server refuses to start); optional
  `SHOW_CLIENT_IP` check; `npm run db:indexes`; `scripts/atlas-create-admin.sh` (first admin from Ubuntu
  in a throwaway `node:24-bookworm` container, secrets from a file outside the repository).

## Mid-defence preparation (11 Nov 2026, feature freeze: bug fixes only)

- `bash scripts/preview.sh start | demo | reset-demo | status | stop`: one command for the whole local
  preview (MongoDB, API, website) in the dev container; `demo` uses a separate database `dlm_demo`.
- `npm run demo:reset` (backend): wipes only a local `_demo` database and creates the three synthetic demo
  accounts (the admin through the create-admin script). The normal preview database is never touched.
- Decisions D-030 (MERN on the supervisor's instruction) and D-031 (Urdu and Roman Urdu texts reviewed by
  the team), both reported on 11 Nov 2026.
- `docs/DEMO-SCRIPT.md`: the 7-minute demo of Modules 1-3, with a drawn synthetic proof photo
  (`docs/demo/work-photo-synthetic.jpg`) and `frontend/e2e/demo-script.e2e.js`, which runs the same clicks.
- **Bug fixed** (found by rehearsing the demo): onboarding Step 4 offered no skill for the proof photo until
  the page was reloaded. Test: `onboarding.test.jsx` (fails without the fix) and the demo e2e test.
- Real results: backend 521/521, frontend 941/941, e2e 35/35 (12.6 min, Chromium), `oxlint` 0.

## After Batch 4 — the team's answers (11 Nov 2026)

- Deleted the unused `frontend/src/pages/worker/WorkerSkills.jsx` (review R-22).
- Dependency patch updates from R-12, only versions at least two weeks old (D-029): `dotenv` 18.0.9,
  `axios` 1.21.0, `react` / `react-dom` 19.3.1, `react-router-dom` 7.18.5, `vite` 8.3.5; `rolldown` pinned
  to 1.2.15 and `tslib` to 2.8.1 because npm picked versions published the same day. Too new and left for
  later: `mongoose` 9.12.x, `express-rate-limit` 8.7.2+, `supertest` 7.3.2, newer `vite` / `axios` patches.
- Real results after the updates: backend 516/516 tests, frontend 940/940 (the 941st was the honesty scan of
  the deleted file), `oxlint` 0, `npm run build` OK, e2e 34/34 (11.7 min, Chromium),
  `npm audit --omit=dev` 0 vulnerabilities. No update had to be reverted.

## Batch 4 — logo v3, dark mode, design v3, 50+ features, admin tools, full review (11 Nov 2026)

Instructions: the team's Batch 4 plan (internal note, not in the repository). Decisions recorded: D-021 logo, D-022 dark mode, D-023 design v3,
D-024 suspension, D-025 notifications, D-026 potential skills / strength / sort, D-027 installable app,
D-028 exports and reason templates. Review: `docs/REVIEW-2026-11.md`. Traceability: `docs/TRACEABILITY.md`.

**Logo and dark mode**
- The Batch 1 shield with a wrench and a check is back, refined (two-tone, one-colour, light/dark), with an
  animated version and a full icon set made by `npm run icons` (D-021).
- A night-mode button on every page: Light, Dark or System; the sun turns into a moon; the new mode grows
  as a circle from the button; saved in the browser and on the account; no flash on load (D-022).
- Text size A−, A, A+ in the account menu and the footer.

**Design v3**
- 28 screens scored before the redesign (`docs/design/07-critique-v2.md`); in-house illustrations for every
  trade and 15 scenes; bento landing page, worker dashboard and admin overview; layered surfaces (D-023).

**Workers**
- Profile strength with real next steps; "You may also do…" (same-trade skills, one tap, Undo); matched
  words marked inside the typed text; example sentences in the website language; CNIC, mobile and rupee
  masks; drafts kept until saved (never the CNIC); upload tip "Take a clear photo of your certificate",
  compression, crop and rotate, progress with Cancel; notifications bell; Available/Busy switch; copy ID;
  welcome tour; confetti for milestones.

**Customers**
- Search, filters, sort and page in the address; results as you type with matched words marked; sort by
  experience or approved proof; saved workers; compare two or three workers; recently viewed; share and
  print a profile.

**Admins**
- Overview with queues and waiting times, audit-chain status, charts from real counts, live activity;
  Users page with suspend / reactivate; reason templates in three languages; CSV exports (audited, no CNIC,
  formula-safe); keyboard shortcuts in the review panels; duplicate-photo compare slider (D-024, D-028).
  Guide: `docs/ADMIN-GUIDE.md`.

**Everywhere**
- Command palette (Ctrl+K), keyboard shortcuts (?), offline banner with automatic retry, installable app
  with a static-only service worker (D-027), scroll to top, session-ending warning, What's new, Help centre.

**Quality**
- Notes, reasons and templates refuse CNIC numbers (they would reach the audit log); new indexes; first
  download 753.8 kB → 685.6 kB of JavaScript (228 → 215 kB gzip, about 9 % less) by loading rarely used
  pages on demand; contrast checked in both modes; e2e axe in
  light and dark for every language; coverage measured (`npm run coverage`): backend 98.09 % lines
  (middleware 100 %), frontend 90.00 % lines.
- Found by the full e2e run and fixed, each with a test that fails without the fix: losing the connection
  while a page was still downloading showed "Something went wrong" for good (now a calm message that loads
  again when the connection is back); the offline banner kept "could not be reached" after reconnecting.
- Onboarding "All set": a drawing and clear next steps (view profile, add proof); the step heading no
  longer shows a focus box.

## Batch 3 — browser tooling, Step 3 and voice fixes, three languages, design v2, profile view/edit (10 Nov 2026)

Instructions: the team's Batch 3 plan (internal note). Decisions recorded: D-017 theme (Emerald Night), D-018 logo (Stitched
Nut), D-019 languages, D-020 profile view/edit.

**Browser tooling**
- The dev container has a system Chromium (`.devcontainer/Dockerfile`, `CHROMIUM_PATH`); Playwright uses
  it and never downloads a browser. Used only for `http://127.0.0.1` pages.
- `npm run e2e` (20 tests) and `npm run screenshots` run on their own servers (5001/5174) and their own
  local database `dlm_e2e`; the preview and its data are untouched; Atlas is never used.

**Fixes**
- Step 3 "Your skills": Continue now uses the server's onboarding state (it bounced back before); without
  a skill it explains why and links to the skill search. Tests: unit + e2e in Urdu, Roman Urdu, English.
- Voice typing: a specific message for each Web Speech API error (`not-allowed`, `service-not-allowed`,
  `network`, `language-not-supported`, `no-speech`, `audio-capture`, `aborted`; Stop is not an error);
  speech language from the switcher (Urdu `ur-PK`, English/Roman Urdu `en-US`); shown only where the
  browser supports it ("works best in Google Chrome"); Gboard / **Win + H** help always shown; M2-13 notice
  kept. Tests with a fake `SpeechRecognition`.
- Found by the new tests: footer jump while a page loads (layout shift 0.16 → below 0.002); the hero
  typewriter reserves its tallest line; trade cards keep their visible text as link name (WCAG 2.5.3);
  a new worker's browser no longer requests a profile that does not exist (404 in the console;
  `profileExists` in the onboarding state); `:lang(ur)` also matched Roman Urdu and gave it the Urdu font;
  avatar initials skipped non-letters; `create-admin` printed error codes instead of English.

**Languages (D-019)**
- English, اردو (right to left, Noto Nastaliq Urdu loaded only for Urdu) and Roman Urdu; first-visit
  chooser; switcher in header, hero and footer; whole page switches without reload, form input stays;
  choice in `localStorage` and, for logged-in users, `User.preferredLanguage`.
- Every visible text is in `frontend/src/i18n/dictionaries/` (en, ur, ur-Latn: same keys, tested); trade
  and skill names in `backend/config/skillTaxonomy.js`; dates with Intl, Western digits everywhere.
- All Urdu and Roman Urdu texts are drafts for a native reviewer: `docs/i18n/REVIEW.md` (890 texts).

**Design v2 (D-017, D-018)**
- Three OKLCH themes with contrast tests for all three (42 pairs each), Emerald Night chosen; Bricolage
  Grotesque headings + Manrope text; fluid sizes; logical properties everywhere (Urdu mirrors);
  modern CSS (color-mix, nesting, :has, container queries, @property, View Transitions, scroll-driven
  reveals with fallback, backdrop-filter, reduced motion / more contrast / forced colours).
- Logo v2 "Stitched Nut" with animated version, new favicon; three concepts kept in
  `docs/design/logo-concepts/`; theme lab at `/dev/themes` (development only).
- Motion: hero typewriter (EN → Urdu → Roman Urdu), animated hero illustration, section reveals, button
  lift/press/shine, card glow, shimmer, stepper fill/pulse/check, confetti on "All set", toasts, dialogs.
- Landing v2: dark hero, how-it-works tracks, trust section (real features only), trades from the
  taxonomy API, call-to-action band, dark footer with the FYP credit. Every screen restyled.

**Profile (D-020)**
- `/worker` overview only; `/worker/profile` read-only with "See what customers see" (the server's
  public view); `/worker/profile/edit` with six sections, saves per section, unsaved-changes protection
  (data router + `useBlocker`); `/worker/skills` redirects into the editor.

**Backend**
- Stable error `code` (+ `params`) on every error (`backend/errors/catalog.js`); `docs/API.md` lists all
  codes (tested). `GET /api/auth/session` (200 for visitors, no 401 in the console);
  `User.preferredLanguage`; `PATCH /api/users/me/preferences`; `GET /api/workers/me/full`;
  `profileExists` in the onboarding state; taxonomy `i18n` names.

**Packages added (Part 8, all approved in the batch)**: `@playwright/test` 1.64.1 (dev),
`@axe-core/playwright` 4.14.0 (dev), `@fontsource/noto-nastaliq-urdu` 5.3.0,
`@fontsource-variable/bricolage-grotesque` 5.3.0 (display font for headings, OFL-1.1).

**Real results (10 Nov 2026)**
- Backend `npm test`: 380/380 passed, 22 files (Vitest JSON report; `docs/TEST-CASES.md` regenerated).
- Frontend `npm test`: 450/450 passed, 9 files (includes 142 contrast checks across the three themes).
- E2E `npm run e2e`: 20/20 passed in 3.7 min (production build, own servers and `dlm_e2e` database).
- Axe (inside the e2e run): 17 pages in each of the three languages, 0 serious or critical violations.
- Layout shift on the landing page: below 0.002 in all three languages (limit 0.1).
- Lint (`oxlint`): 145 files, 0 errors, 0 warnings. Build: OK; main JS 182.01 kB gzip (limit 300 kB),
  CSS 22.01 kB gzip; Urdu 13.76 kB and Roman Urdu 12.59 kB gzip load on demand; the Nastaliq font
  (about 158 kB per weight) loads only for Urdu.
- Screenshots `npm run screenshots`: 252 images (28 screens × 3 languages × 3 widths); a checked set is in
  `docs/design/screenshots/`.

## Batch 2 — Module 3 (Phase 5), integration tests (Phase 6), documentation (Phase 7) (9 Nov 2026)

Instructions: the team's Batch 2 plan (internal note). Decisions recorded: D-013 evidence storage, D-014 skill confidence
method and provisional weights, D-015 review states and deletion rules, D-016 upload processing and
duplicates. The team's working rules gained "Reporting to the user".

**Backend (Module 3)**
- Models `Evidence` (metadata) and `EvidenceFile` (processed WebP bytes); storage service with
  save/read/remove (Vercel Blob could replace it later).
- Upload `POST /api/evidence`: login and role checked before the file is read; multer in memory, 4 MB
  (413); type from the bytes (JPEG/PNG/WebP; HEIC "Please upload a JPG or PNG photo."; PDF refused);
  sharp auto-rotate, fit 2000 px, WebP q80, no metadata (EXIF/GPS removed); SHA-256 of the processed
  file (same worker + skill → 409); dHash look-alikes and exact copies from other workers flagged for
  the admin; consent required; 5 per skill, 30 per worker, 30 uploads per 15 minutes per network.
- Worker: `GET /api/evidence/mine`, `GET /api/evidence/:id/file` (owner or admin; others 404,
  customers 403), `DELETE /api/evidence/:id` (pending/rejected only).
- Admin: `GET /api/admin/evidence` (queue + filters), `GET /api/admin/evidence/:id` (duplicate side by
  side, b/d/u/E as `opinion`), `PATCH /api/admin/evidence/:id` (approve, reject with code,
  suspected fake with reason, revoke with reason), atomic with 409, all audited; stats include evidence.
- `services/trust/skillConfidence.js` (pure; W = 2, a = 0.5; provisional weights) and a per-skill
  `evidenceSummary` (status, approved, pending, strength word) recomputed after every change.
- Public directory/profile show the chip, approved count and strength only; `skills=verified` filter.
- A skill with reviewed proof cannot be removed (no hiding a suspected fake).
- `npm run confidence:sensitivity` (formula outputs, with the two documented weak points).
- Removed a redundant index `{ worker, skillId }` on evidences (the local preview database may still
  hold it; harmless).

**Frontend**
- `FileUpload` (tap target, drag and drop, preview, keyboard/screen-reader friendly, byte-based
  checks with the server's messages, in-browser shrink of large photos), `EvidenceUploadForm`,
  `SkillProofList`.
- Onboarding Step 4 uploads for real ("Pending review"; Skip stays); `/worker/skills` "Proof of
  skills" with an "Add proof" drawer; dashboard shows chips, counts, strength and items.
- `/admin/evidence` (filters, review drawer with zoom, duplicate side by side, numbers with a method
  note, reason dialogs); admin overview tiles for proof; customer cards mark verified skills;
  "Verified skills only" filter; public profile shows strength per skill, never images.

**Documentation (Phase 7)**
- New: `docs/DATA-MODEL.md` (ER diagram, every field and index), `docs/ARCHITECTURE.md`
  (components, sequence diagrams, where each security control sits), `docs/USE-CASES.md`,
  `docs/TEST-CASES.md` (generated by `docs/tools/generate-test-cases.mjs` from the real run).
- Rewritten: `docs/API.md` (every endpoint, real request/response examples from the local preview
  with synthetic accounts, error codes), `README.md` (Windows/PowerShell setup).
- Updated: `docs/SECURITY.md` (Module 3 threats, perceptual-hash limits), `docs/DECISIONS.md`,
  `docs/design/04-screens.md`, `docs/design/05-review.md` (Batch 2 findings B1–B9).

**Bugs found and fixed during the batch:** the admin duplicate filter could never match
(`sanitizeFilter` neutralised our own `$in`); the client photo check trusted the browser's type for
unknown bytes; test flakiness (router path probe, 5 s timeout, race test assuming one timing).

**Results (real run, 9 Nov 2026, 21:49–21:51 local time)**
- Backend `npm test`: 20 files, **348/348 passed** (evidence 44, skillConfidence 18, honesty 67,
  skillExtractor 39, auth 33, skills 27, workers-profile 24, admin 21, foundation 20, directory 16,
  evaluationMetrics 13, cnic 5, skillTaxonomy 4, hotfix-critical 4, migrations 3, model-hooks 3,
  db-down 2, multer-express5 2, setup 2, auth-rate-limit 1).
- Frontend `npm test`: 7 files, **246/246 passed** (honesty 131, contrast 33, evidence 22, pages 19,
  auth 16, onboarding 14, components 11); every test fails on any console error or warning.
- `npm run build` OK (JS 445.4 kB, gzip 139.9 kB; CSS 57.0 kB, gzip 13.3 kB). `oxlint`: 0 errors,
  0 warnings.
- Local end-to-end through the preview (synthetic accounts): GPS JPEG → stored WebP without EXIF;
  no consent 400; PDF 400; 5 MB 413; approve → "Verified by evidence" (E 0.75 for a certificate);
  reject without reason 400; suspected fake → "Disputed", worker delete 409; customer gets 403 for
  the photo and sees no ids; `npm run audit:verify` OK.

## Batch 1 — UI/UX redesign, guided onboarding, Module 2 / Phase 4 (9 Nov 2026)

Instructions: the team's Batch 1 plan (internal note). Decisions recorded: D-008 (reason for the category split),
D-010 design system, D-011 guided onboarding, D-012 final categories + skill list v1.

**Stages (docs/design/):** 01 UX requirements (personas, FR/NFR, acceptance criteria), 02 analysis
(audit of the old UI, sitemap, Mermaid flows), 03 design system, 04 screen specs, 05 self-review,
06 deploy readiness (nothing deployed).

**Module 2 (Phase 4) — backend**
- Taxonomy v1: 9 categories (Cleaning & Shifting split into Domestic Work + Moving & Loading)
  and 50 skills with strong/weak terms in English, Roman Urdu and Urdu.
- `services/skillExtractor/`: normalisation (NFC, Urdu/Arabic digits, letter variants,
  punctuation), whole-token matching, weak-term rule, experience in years + months
  (number words in three languages, over 60 ignored), all matching categories with ties
  reported, negative phrases only explain an empty result. No confidence, level or score.
- New endpoints: `POST /api/workers/me/skills/extract` (saves nothing), `GET/POST/DELETE
  /api/workers/me/skills`, `POST /api/workers/me/skills/custom`,
  `GET /api/workers/me/onboarding`, `GET /api/admin/stats`, `GET /api/admin/audit`,
  `q` search on `GET /api/admin/workers`.
- One `skills` array of objects; old fields (categorizedSkills, recommendedSkills,
  skillStrengthScore, aiSkillSummary, …) removed; `npm run migrate:skills`.
- Old profiler moved to `evaluation/baselines/legacyProfiler.js` (git history kept); old
  `/api/worker/*` routes and `controllers/workerController.js`, `routes/workerRoutes.js` deleted.
- Evaluation harness: `npm run evaluate:skills` (micro/macro P/R/F1, Wilson and bootstrap
  intervals, per category, per script, ablation, legacy + naive baselines, paired bootstrap),
  `npm run agreement:skills` (Cohen's kappa, Krippendorff's alpha), SYNTHETIC sample files
  (tests only, never reported), `docs/evaluation/` (format, annotation guide, consent form
  English/Urdu, data handling).

**Frontend redesign**
- Design tokens, base styles, Manrope (self-hosted), lucide-react icons, new logomark and favicon.
- Component library (31 files in `components/ui/`), app shell with landmarks and skip link,
  admin sidebar layout, error boundary, development-only `/dev/styleguide`.
- New pages: landing, login, register (role cards), guided onboarding (5 steps), worker
  dashboard, profile, skills, find workers (sidebar/drawer filters), public worker profile,
  admin overview, identity review (drawer + audited reveal), audit log, 404.
- Removed: old pages, `App.css`, `index.css`, Vite sample assets, the old Phase 3 frontend
  test files (replaced by the new test files below).
- New packages (approved): lucide-react 1.61.0, @fontsource-variable/manrope 5.3.0.

**Local preview data:** `migrate:skills` applied to the **local** database (1 profile, 1 skill
mapped). Atlas not touched.

**Results (real runs, 9 Nov 2026)**
- Backend `npm test`: 18 files, **272/272 passed** (unit: setup 2, cnic 5, taxonomy 4,
  skillExtractor 39, evaluationMetrics 13, honesty 53; integration: foundation 20, db-down 2,
  auth 33, auth-rate-limit 1, workers-profile 24, directory 16, admin 21, skills 27,
  hotfix-critical 4, migrations 3, model-hooks 3, multer-express5 2).
- Frontend `npm test`: 6 files, **215/215 passed** (contrast 33, auth 16, onboarding 14,
  pages 19, components 11, honesty 122). Every test fails on any console error or warning.
- `npm run build` OK (JS 419.6 kB, gzip 132.6 kB; CSS 52.4 kB, gzip 12.6 kB).
  `oxlint`: exit 0, no findings.
- `npm run evaluate:skills` and `npm run agreement:skills` run on the SYNTHETIC sample (script
  check only; numbers not reported).

## Phases 2 and 3 — Backend foundation and Module 1 fixes (9 Nov 2026)

Decisions given by the team on 9 Nov 2026 and recorded in `docs/DECISIONS.md`: D-005 (password
≥ 15 characters), D-006 (HttpOnly cookie, Option A), D-007 (CNIC Option 2). Also D-008
(provisional category list, needs team approval) and D-009 (identity rules).

**Local preview**
- `frontend` `npm run dev` = `vite --host 127.0.0.1 --port 5173 --strictPort`; Vite forwards
  `/api` to `http://127.0.0.1:5000`, so the login cookie is same-origin. Backend listens on 127.0.0.1.

**Phase 2 — foundation**
- `app.js` builds the app (tests, Vercel); `server.js` checks settings, connects, listens.
- `config/env.js`: required `MONGO_URI`, `JWT_SECRET` (≥ 32), `CLIENT_ORIGIN`, `CNIC_ENC_KEY`,
  `CNIC_HASH_KEY`; stops with a clear message (M1-12). `config/db.js`: cached connect promise,
  `sanitizeFilter` everywhere, `strictQuery: 'throw'` outside production, 503 if the DB is down.
- helmet, CORS allow-list, `express.json({ limit: '100kb' })`, failed-auth rate limit,
  central 404 + error handler with a generic 500 message (M1-7, M1-10, M1-13), `/api/health`.
- `validate(schema, source)` stores parsed input on `req.validated`.

**Phase 3 — Module 1 (M1-1 to M1-16)**
- Auth: register only worker/customer; zod schemas; generic login message + dummy bcrypt;
  per-account lockout; HS256 JWT with iss/aud/exp in an HttpOnly Secure SameSite=Strict cookie;
  `tokenVersion` logout; Origin CSRF check; `npm run create-admin`.
- User schema: lowercase/trim/maxlength, `password` `select:false`, bcrypt cost 12.
- Worker profile: `GET/PUT /api/workers/me` with a strict schema; counter-based worker IDs
  (`DLM-<year>-<6 digits>`); CNIC encrypted + hashed, never returned; category = taxonomy id.
- Directory: `GET /api/workers` (customer/admin, paginated, name only from the user, **no phone**
  — D-002), `GET /api/workers/:workerIdCode`; escaped search; strict query schema.
- Admin: `GET /api/admin/workers`, `PATCH /api/admin/workers/:id/identity` (note required,
  409 on stale status), `GET /api/admin/workers/:id/cnic` (audited), `GET /api/admin/users`.
- Hash-chained, append-only `AuditLog`; `npm run audit:verify`.
- One provisional taxonomy file + `GET /api/meta/taxonomy` (adds Domestic Work).
- Migration scripts `npm run migrate:cnic`, `npm run migrate:categories` (dry run by default,
  local only unless `--allow-remote`). Run on the **local** database only (1 category label
  converted, 1 empty plain CNIC field removed). **Not run on Atlas.**
- Old `/api/worker` router keeps only the three Module 2 profiler routes (validated, no raw
  errors); their logic is unchanged until Phase 4, except that "None" no longer overwrites the category.
- Frontend: `AuthContext` (user from `/api/auth/me`, no `localStorage`), 401 → login with a
  message, `/` redirect, Not Found page, Register password rule, worker profile inputs restored
  (emergency contact, languages, work-history duration/description), categories from the API,
  customer page "Find workers" with identity badge/filter and no phone, admin identity form
  with required note and masked CNIC + audited Reveal.
- Bug found by the local end-to-end check and fixed with a regression test: accounts created
  before `tokenVersion` existed got 401 right after login, and logout did not cancel their tokens.

**Results (real runs, 9 Nov 2026)**
- Backend `npm test`: 14 files, **139/139 passed** (unit: setup 2, cnic 5, taxonomy 4;
  integration: foundation 20, db-down 2, auth 33, auth-rate-limit 1, workers-profile 24,
  directory 15, admin 21, hotfix-critical 4, migrations 3, model-hooks 3, multer-express5 2).
- Frontend `npm test`: 3 files, **20/20 passed**. `npm run build` OK. `npm run lint`: 0 errors,
  3 warnings (all in `SkillProfilerPage.jsx`, present before; Phase 4 rewrites that page).
- No new npm packages; both lockfiles unchanged.

## Phase 1 — Dependencies and test tooling (8–9 Nov 2026)

**Dependencies**
- `backend/package.json` now agrees with `package-lock.json` (before, `npm ci` could not work):
  Express ^4.19.2 → ^5.3.0, Mongoose ^8.3.0 → ^9.11.4 (locked 9.11.4), bcryptjs → ^3.0.3,
  dotenv → ^18.0.7, jsonwebtoken → ^9.0.3, cors → ^2.8.6, nodemon → ^3.1.14.
- `"engines": { "node": "24.x" }` added to both `package.json` files (see D-003).
- Code checked for Express 5 / Mongoose 9: no Express 4-only APIs, no `*` routes,
  no `req.query` assignment, neither `pre('save')` hook calls `next()`. No codemod needed.
- New backend packages (approved): helmet 8.3.0, express-rate-limit 8.7.1, zod 4.6.7,
  multer 2.5.0, file-type 22.2.0, sharp 0.35.5; dev: vitest 5.0.5, supertest 7.3.1,
  mongodb-memory-server 11.3.0.
- New frontend dev packages (approved): vitest 5.0.5, @testing-library/react 16.3.3,
  @testing-library/jest-dom 7.0.1, @testing-library/user-event 14.6.8, jsdom 30.1.3.
- `npm audit fix` (non-breaking): body-parser, qs (backend), follow-redirects (frontend).
  Remaining: 2 moderate dev-only nodemon findings, accepted in D-004.

**Test tooling**
- Backend `npm test` = one `vitest run` over `tests/unit` and `tests/integration`
  (config: `backend/vitest.config.js`). The hotfix test moved from `node:test` to Vitest
  (`tests/integration/hotfix-critical.test.js`; assertions unchanged).
- Frontend `npm test` = `vitest run` with jsdom (config in `frontend/vite.config.js`,
  setup in `frontend/src/test/setup.js`).
- Tests added: `tests/unit/setup.test.js`, `tests/integration/multer-express5.test.js`,
  `tests/integration/model-hooks.test.js`, `frontend/src/test/setup.test.jsx`.
- MongoDB for tests: the firewall could not reliably reach fastdl.mongodb.org (its CDN addresses
  change faster than the firewall refreshes them), so MongoDB 8.2.6 (Debian 12) was downloaded outside the
  container into `.local/` (gitignored), checked with its SHA-256 file (OK), and unpacked to
  `.local/mongodb-linux-x86_64-debian12-8.2.6/` (212 MB; archive 123 MB).
  `backend/package.json` → `config.mongodbMemoryServer.systemBinary` points to it.

**Results (real runs, 9 Nov 2026)**
- Backend: 4 files, 12/12 tests passed (setup, multer 2 on Express 5, M1-1/M1-2 hotfix,
  both `pre('save')` hooks on Mongoose 9 with an in-memory MongoDB).
- Frontend: 1/1 passed. `npm run build` OK. `npm run lint` exit 0 with 4 warnings in existing pages.
- `npm ci`: OK in backend and frontend (8 Nov 2026).

**Local preview (dev container only)**
- `npm run db:local` (backend): local MongoDB from the same binary, data in `.local/mongodb-data/`,
  listening on 127.0.0.1 only.
- `npm run seed:local` (backend): two synthetic demo accounts; refuses any non-local `MONGO_URI`.
- `backend/.env` (gitignored): local `MONGO_URI`, random `JWT_SECRET`. Never Atlas.

**Other**
- Phone-number decision recorded (D-002) in `docs/DECISIONS.md` and the team's working rules.
- `.devcontainer/init-firewall.sh`: `fastdl.mongodb.org` added to the allowed domains.
- `docs/SECURITY.md` created with incident INC-001 (stolen Vercel token, 8–9 Nov 2026).
- `docs/DECISIONS.md` created (D-001 MERN only, D-002 phone hidden, D-003 Node 24, D-004 nodemon advisory).
