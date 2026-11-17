# Module 4 manual test (three browser windows, then an Android phone)

What the development container cannot do: press buttons on a phone or hear sound. The automated tests cover the
logic (the real numbers are in `docs/TEST-CASES.md` and the CHANGELOG); this checklist is for the team, on a laptop.

**Before you start** (in the repository folder, PowerShell or the dev container terminal):

```powershell
bash scripts/preview.sh demo        # starts the local preview with the demo database
bash scripts/preview.sh reset-demo  # (optional) fresh demo data; only the dlm_demo database is touched
```

Open http://127.0.0.1:5173 in three windows. All accounts are synthetic; the password of every demo worker and
customer is `local-demo-password-123`; the admin passphrase is `local admin demo passphrase`.

| Window | Account |
|---|---|
| A: normal Chrome | customer.demo@example.com (customer) |
| B: Incognito | worker.demo@example.com (worker, "Demo Worker") |
| C: Guest window | admin.demo@example.com (admin) |

## 1. Request and accept (A, B)

| # | Do | Expected |
|---|---|---|
| 1 | A: Find workers → open "Demo Mason (synthetic)" | Reputation section says "New on this platform"; no stars; "Request this worker" button |
| 2 | A: Request this worker → choose the skill, "Tomorrow", "Morning (9 am)"; area "G-9 Markaz"; description; press 🔊 next to a card | Picture cards for skill, day and time; each 🔊 says the option; the line "Your phone number is shared…" |
| 3 | A: type a phone number in the description and send | Refused: "Please do not write phone numbers, links or ID numbers here." |
| 4 | A: remove it and send | The booking page: "Waiting for an answer", a booking number like BK-2026-0000NN, no phone number |
| 5 | B: Requests (top menu, with a number) | The demo request "Two sockets in the kitchen…" (from the demo data) |
| 6 | B: press "Hear this request" | You hear "New work: House wiring, Tomorrow, Morning…", then "Written: …" with the customer's words (needs speakers) |
| 7 | B: Accept | "Accepted. You can now see the customer's phone number." |
| 8 | B: My jobs | The customer's number and a Call button |
| 9 | A: My bookings → the request to Demo Worker → open | Worker's number, Call and WhatsApp buttons (WhatsApp opens wa.me) |

## 2. Work done and rating (A, B)

| # | Do | Expected |
|---|---|---|
| 10 | B: My jobs → the sockets job you just accepted (not "New light in the drawing room") → Work done → confirm | "Saved: work done"; A gets a notification (menu "Notifications" count) |
| 11 | A: open the booking → Work done → confirm | State "Work done"; a "Rate this work" button |
| 12 | A: Rate this work → press 🔊 next to each star | "Five stars: very good work" etc. |
| 13 | A: use the keyboard: Tab to the stars, arrow keys | The chosen star moves; answer two thumbs; type or speak a comment |
| 14 | A: Check and send | A dialog reads back the stars, answers and comment; "Hear my comment"; Send |
| 15 | A: open Demo Worker's profile | Stars and count changed; "Done through this platform" shows the job; your review shows "Demo C." |
| 16 | B: My reviews → 🔊 on the new review; Reply once | The reply appears under the review; a second reply is not offered |
| 17 | B: My reputation | Summary sentence with 🔊; four rules with 🔊; each review explained ("Counted less: …"); tips |

## 3. Cancellation, no-show and disputes (A, B, C)

| # | Do | Expected |
|---|---|---|
| 18 | B: My jobs → the accepted job for tomorrow afternoon → Cancel | Warning about a late cancellation only when the start is less than 24 h away; buttons "Keep the booking" / "Cancel the booking"; a reason is required |
| 19 | C: Disputes | The open demo dispute (painter) with "Waiting N days"; open it: the customer's note, the timeline, two or three decision cards, a required note with saved reasons |
| 20 | C: choose a decision, write a note, Save | "Decision saved"; the queue no longer lists it; A sees the decision in the booking |
| 21 | C: Reviews | The reported 2★ review of the painter first; Hide needs a reason and shows "A negative review is never a reason to hide it" |
| 22 | C: Reputation flags | "Praise from new accounts" for Demo Carpenter with three 5★ reviews; Dismiss or Hide (note required) |
| 23 | C: Overview | "Bookings and reviews" with real counts and charts; "Show as table" works |
| 24 | C: Users → Demo Plumber → Reputation tab | Expected, cautious, each review's weight and factors |
| 25 | C: Exports → Bookings / Reviews | CSV files without phone numbers, descriptions or comment text |

## 4. Languages, themes, phone

| # | Do | Expected |
|---|---|---|
| 26 | Switch to اردو and Roman Urdu on pages 2, 5, 14, 17 | All texts translated; right-to-left in Urdu; star rows and timelines still readable |
| 27 | Dark mode on the same pages | Stars, chips and charts readable; nothing shown by colour alone |
| 28 | Android Chrome: open the preview from the phone (same Wi-Fi, as in `docs/EASY-MODE-MANUAL-TEST.md` P1) or the deployed test site when available | Big buttons fit at 360 px; Call opens the phone dialler; WhatsApp opens the app; 🔊 speaks with an Urdu voice if one is installed |
| 29 | Find workers → Sort by "Best track record" | The note "New workers appear lower in this order…"; "Has done jobs on this platform" filter works |

Write down anything unclear in plain words; texts are drafts until the team reviews them (`docs/i18n/REVIEW-BATCH-6.md`).
