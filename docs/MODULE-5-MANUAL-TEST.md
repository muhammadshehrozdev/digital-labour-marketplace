# Module 5 — manual test checklist (Batch 7)

Claude Code cannot press buttons on a phone or hear sound in the container. The automated tests (unit, integration,
component, end-to-end with axe) are listed in `docs/TEST-CASES.md`. This checklist is for the team, on a laptop with
three browser windows and later an Android phone. Write the result and the date in the last column.

## 1. Check the wage figures (do this FIRST, before going live)

The figures in `backend/config/wageReferences.js` were given by the team and checked on 19 Nov 2026 against news and
WageIndicator pages; Balochistan and KP were checked again and corrected on 23 Nov 2026. Before the app goes live, compare each one with the **official notification**. If a figure, date
or status differs, the team changes it in `backend/config/wageReferences.js` (with the source and `checkedOn`), runs
`npm test` in `.\backend`, and commits. Do not change it in any other place.

| Region | In the app | Open these sources | Then check | Result and date |
|---|---|---|---|---|
| ICT | Rs 40,700 a month from 1 Jul 2026, notified 19 Aug 2026 | https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-islamabad-pakistan-from-01-july-2026-august-20-2026/ ; https://www.thenews.pk/print/1420647-public-voices-concern-over-10pc-raise-in-minimum-wage | the federal notification for the Islamabad Capital Territory (Ministry of Interior / ICT Administration labour wing) | |
| Sindh | Rs 43,000 from 1 Jul 2026, notified 17 Aug 2026 | https://wageindicator.org/ai/work/minimum-wage/updates/2026/minimum-wage-increased-in-sindh-pakistan-from-1-july-2026-august-19-2026/ ; https://tribune.com.pk/story/2622332/sindh-cabinet-okays-wheat-import-raises-minimum-wage-to-rs43000 | the Sindh Labour and Human Resources Department notification | |
| Punjab | Rs 40,000 from 1 Jul 2025, notified 8 Sep 2025; reported unchanged in 2026-27 | https://www.brecorder.com/news/40382017 ; https://wageindicator.org/en-pk/work-in-pakistan/minimum-wage/168-punjab ; https://arynews.tv/kp-takes-lead-in-raising-minimum-wage | the Punjab Labour and Human Resource Department notification; whether a 2026-27 figure was notified | |
| KP | Rs 40,000 from 1 Jul 2025, **notified** (corrected 23 Nov 2026); note: Rs 45,000 announced in the 2026-27 budget, notification not found | https://profit.pakistantoday.com.pk/2025/09/10/kp-govt-notifies-rs40000-minimum-monthly-wage-for-workers | the KP Labour Department notification; whether a 2026-27 notification (Rs 45,000) now exists: if found, change the figure, `effectiveFrom`, the source and `checkedOn` | 23 Nov 2026 (team): Rs 40,000 notified; 2026-27 notification not found |
| Balochistan | Rs 37,000 from 1 Jul 2024, **notified** (corrected 23 Nov 2026) | https://wageindicator.org/salary/minimum-wage/pakistan/162-balochistan | the Balochistan Labour and Manpower Department notification; whether a newer one exists | 23 Nov 2026 (team): Rs 37,000 from 1 Jul 2024 |
| GB, AJK | no figure | — | whether a notified figure exists; if yes, add it with its source | |
| General | 26 working days, 8 hours | https://fafen.org/minimum-wage-in-pakistan-laws-process-and-current-rates/ | that the notifications still count 26 days and 8 hours | |

Also check the helpline numbers shown in the Help Centre (Fair pay and safe work): 1122 (Rescue; source to be replaced
by the official provincial Rescue 1122 site), 15 (Islamabad Police, https://islamabadpolice.gov.pk/r15.php), 1314
(Punjab Labour Helpline, https://tribune.com.pk/story/2639368/punjabs-labour-law-extends-legal-coverage).

## 2. Setup

In `.\` (the project folder): `bash scripts/preview.sh reset-demo` in the dev container (or the Windows steps in the
README), then open http://127.0.0.1:5173.
- Window A, **normal Chrome**: `customer.demo@example.com` / `local-demo-password-123`
- Window B, **Incognito** (Ctrl+Shift+N): `worker.demo@example.com` / `local-demo-password-123`
- Window C, **Guest** profile: `admin.demo@example.com` / `local admin demo passphrase`
All demo data is synthetic; every amount is test data, never a real price.

## 3. Customer (window A)

| # | Do | Expected | Result |
|---|---|---|---|
| A1 | Find workers → Demo Worker → **Request this worker** → House wiring | A price card: "Typical price on this platform in Islamabad: Rs … to Rs … for one job", "Middle price … From 9 jobs by 4 workers"; the worker's own rates; the minimum wage line for Islamabad with "(from 1 July 2026)"; "These laws are written for workers in shops and factories" | |
| A2 | Press 🔊 Listen on the price card | The card is read, the amounts as words ("two thousand to …") | |
| A3 | **Offer a price** → Whole job → 1200 → One day | A warning: "less than the government minimum wage reference for one day of work in Islamabad (about Rs 1,565)"; Send still works | |
| A4 | Type the amount with the Urdu keyboard (۲۵۰۰) | The box shows 2,500 | |
| A5 | Request the **Demo Plumber** (water leak repair) | No platform range; "Price guide from the admin team …" with "[Demo] Synthetic entry …" and the month | |
| A6 | My bookings → the plumber job | "Price agreed: Rs 2,000 …" and "Change waiting, proposed by the worker" with Agree; the history lists 2 versions | |
| A7 | **Agree** → the read-back dialog → 🔊 → Agree | "Price agreed: Rs 2,400 for the whole job"; the history shows "Version 2: agreed by the customer" | |
| A8 | On the same job: **Record a payment** → Advance → 500 → JazzCash → Today → Save | "Payment recorded …"; the record shows "Not confirmed yet"; "The app does not move money …" on the card | |
| A9 | Try a day in the future in "Another day" | The date box does not allow it; the server refuses a future day | |
| A10 | Help (footer) → **Fair pay and safe work** | Tabs for workers and customers; the minimum wage table for 7 regions with status, dates, sources (links open); "Checked on 19 November 2026"; helplines with sources | |

## 4. Worker (window B)

| # | Do | Expected | Result |
|---|---|---|---|
| B1 | **Requests** | The demo customer's card says "Offer: Rs 1,200 for the whole job" | |
| B2 | 🔊 **Hear this request** | The request is read, then "The customer offers one thousand two hundred rupees for the whole job" | |
| B3 | Open it (the booking) | The low-pay warning is shown to the worker too | |
| B4 | **Accept** | The job opens at the price part with **Agree** and **Propose another price** | |
| B5 | Propose another price → Per day → 2000 → − and + on the stepper → conditions (pictures, each with 🔊) → Check and send → read-back → Send | The read-back says the price, the days and the conditions; after Send: "Price sent …"; the customer gets a notification | |
| B6 | My jobs → the job completed yesterday → **Yes, I received it** | The summary says "Nothing left to pay"; the customer is told | |
| B7 | **My earnings** (menu and dashboard tile) | This month's confirmed total as a big number with 🔊; waiting and disputed amounts on their own lines ("not added in") | |
| B8 | Your work (profile edit → Work) | Under the rates: the minimum wage reference for Islamabad; with a daily rate below it, a gentle note ("it is your choice"); "See prices for your work" opens Price information | |
| B9 | Price information → Electrical & Solar → House wiring → Per day | The card for a day (the category may be used: "From similar work in the same trade") | |
| B10 | Printable payment record of a completed job → Print | Short names only (no phone numbers), every payment with its status, "It is not a bank receipt"; the print preview has no buttons | |

## 5. Admin (window C)

| # | Do | Expected | Result |
|---|---|---|---|
| C1 | **Payments** | "Read-only …"; the job with "Payment question open" first | |
| C2 | Open it | Timeline, price history, payment records; no buttons to record or decide | |
| C3 | **Price guide** → New entry without a source → Save | "Write where these numbers come from (at least 10 characters)" | |
| C4 | With a source → Save; Edit (change the numbers); History; Archive | Each step shown; History lists created, changed, archived with the numbers; the Audit log has `priceguide.*` | |
| C5 | Exports → Payments CSV | A file with codes, amounts, states, dates; no names, phone numbers or notes; the Audit log has `export.payments` | |
| C6 | Overview | No wage banner today (the figures are new); it appears only when a figure is older than 365 days | |

## 6. Languages, themes, phone (Android)

| # | Do | Expected | Result |
|---|---|---|---|
| D1 | Repeat A1, A3, B5, B7 in **اردو** and **Roman Urdu** | Right to left in Urdu; amounts stay "Rs 2,500"; every text in the chosen language; 🔊 speaks Urdu for both | |
| D2 | Dark mode | Every card, chip and warning readable | |
| D3 | Android phone, Chrome, 360 px wide | Nothing cut off; the number keypad opens for amounts; the stepper buttons are easy to press; 🎤 works on the note | |
| D4 | TalkBack on: the unit cards, the stepper, the checks | Each picture card is a radio button with its name; the stepper says "One more: Number of days"; the checks are read when they change | |

## 7. Three things to try first

1. A3 + B1–B3: a low offer warns both people and never blocks.
2. A6–A8 + B6–B7: a price change, a payment, its confirmation, and My earnings counting only confirmed money.
3. Section 1: the wage figures against the official notifications.
