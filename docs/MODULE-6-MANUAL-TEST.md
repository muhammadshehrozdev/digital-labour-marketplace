# Module 6 — manual test checklist (Batch 8B, the screens)

The automated tests cannot press buttons on a phone, speak into a microphone or hear sound in the container. They
(unit, integration, component, end-to-end with axe) are listed in `docs/TEST-CASES.md`. This checklist is for the
friends who test the website **after the team deploys Batches 8A and 8B**, first on a laptop with three browser windows
and then on an Android phone. Write the result and the date in the last column.

> **Important: test sentences never go into the evaluation dataset.** Every sentence you type or speak here is a test
> sentence. It must never be copied into the Google Form or the dataset of Batch 8C, and **you must not fill in the
> Google Form afterwards with the same sentences**. If you also want to help with the Google Form, write a different,
> real job you needed at home there, in your own words (`docs/evaluation/job-analysis/COLLECTION-PLAN.md`).

## 1. Setup

- On the live website: make two new accounts with names that end in "(test)", for example "Sara (test)" (customer) and
  "Bilal (test)" (worker). The worker finishes the onboarding with the city **Rawalpindi** and the trade **Plumbing**,
  and adds the skill "Water leak repair". A team member gives you an admin window (or does section 5 for you).
- Or the local demo (team): `bash scripts/preview.sh reset-demo`, then http://127.0.0.1:5173 with
  `customer.demo@example.com` / `worker.demo@example.com` (`local-demo-password-123`) and `admin.demo@example.com`
  (`local admin demo passphrase`). All demo data is synthetic.
- Window A, **normal Chrome**: the customer. Window B, **Incognito** (Ctrl+Shift+N): the worker. Window C, a **Guest**
  profile: the admin.

## 2. Customer on a laptop (window A)

| # | Do | Expected | Result |
|---|---|---|---|
| 1 | Open **Find workers** | A card at the top: "Not sure whom to call? Describe the job in your own words" (🎤); the search below works as before | |
| 2 | Press **Describe a job**; type "Bathroom ka nalka tapak raha hai, Pindi mein, kal subah"; press **Check my words** | "Checking…", then the words tapak, nalka, bathroom, pindi, kal, subah are marked in the box and listed under it; no score or percentage anywhere | |
| 3 | Open "How does this work?" | The method's name ("rule-based word lists") and "The app looks for known words in your text…" | |
| 4 | Press **Next: check the details** | Plumbing chosen ("Suggested from your words: …"), Water leak repair ticked, Repair, Rawalpindi, Tomorrow, Morning | |
| 5 | Change the kind of work to **Service**; go **Back**; add "jaldi" to the words; go **Next** again | Service stays chosen (your choice); Urgent is now on (new words); nothing you changed was overwritten | |
| 6 | Write the area "Satellite Town"; write a budget of 2500 for the **whole job** | Under the budget: "Only you and the site's admins can see this. Workers never see it." and the price information | |
| 7 | **Next: save** → listen with 🔊 → **Save the job request** | A summary with pictures, then the job page with JR-…, "Open" and "Now choose a worker for this job" | |
| 8 | Try to leave step 1 with words typed (press a menu link) | "You have unsaved changes" asks first | |
| 9 | Type "Mujhe kal ek electrician aur ek plumber chahiye" and go to step 2 | "Your words fit more than one trade. Choose the one you need first."; no trade is chosen | |
| 10 | Type a phone number in the words and press Check my words | "Please do not write phone numbers, links or ID numbers here." under the box; step 2 does not open | |
| 11 | Type "Gali number 5, makan 12 mein wiring ka kaam hai" and check | A friendly warning to remove the house number; you can still continue | |
| 12 | **Choose a worker** on the job page | "Workers for this job": the worker of window B with "Offers: Water leak repair" and "Same city: Rawalpindi"; the line "The app does not rank them." | |
| 13 | Change the order (Sort by) and the filters | The list asks again; no phone number, WhatsApp or address on any card | |
| 14 | **Send this job** → look at the page → **Send the request** | "Your job" card instead of city, area and description; only the worker's plumbing skills; the booking page says "From job request JR-…" | |
| 15 | Go back to Workers for this job and send the same job to a second worker | "This job is already with a worker. Wait for the answer or cancel that request first." with a link to the waiting request | |
| 16 | **My job requests** | The tabs with counts; the job under "Waiting for a worker" | |
| 17 | Open the job page → "What the app understood from your words" | For each detail: the suggestion, your choice, "Kept" / "Changed" / "Nothing suggested"; no score | |

## 3. Worker (window B)

| # | Do | Expected | Result |
|---|---|---|---|
| 1 | **Requests** | The request shows "From job request JR-…" and "Kind of work: Service" | |
| 2 | Look for the budget everywhere on the request and the job (also press 🔊 "Hear this request") | **The budget (2500) is not shown and not spoken anywhere**; 🔊 says the kind of work | |
| 3 | Type `/job-requests` in the address bar | The page says it is not for workers; workers never see a list of jobs | |
| 4 | **Accept** | Window A, job page: "A worker accepted this job" | |
| 5 | Both press **Work done** (B on My jobs, A on the booking) | Window A, job page: "Done"; **Close the job request** → "Work done" → "Closed"; the booking stays completed | |

## 4. Right to left, both themes, sound

| # | Do | Expected | Result |
|---|---|---|---|
| 1 | Switch to **اردو** on every new page (Describe a job, My job requests, the job page, edit, Workers for this job, the request with the job) | Right to left, Urdu words (کام کی درخواست، ہنر، شعبہ، کام کی نوعیت), nothing cut off, no sideways scrolling | |
| 2 | Switch to **Roman Urdu** and to **night mode** | The same pages are readable; every picture choice still shows its selected state | |
| 3 | Press 🔊 next to a field, on a picture and the round page-help button | The help is spoken (or shown when the device has no voice) | |

## 5. Admin (window C)

| # | Do | Expected | Result |
|---|---|---|---|
| 1 | **Job requests** in the admin menu | The list with the code, customer's name, state, requests sent and method; **no budget** in the list | |
| 2 | Open the job | The drawer shows everything, including the budget, suggested vs chosen and the requests sent; the customer's name only | |
| 3 | **How suggestions were used** (7, 30, 90 days) | Kept / changed / not suggested per detail and the note "This shows how customers used the suggestions, not whether they were correct." | |
| 4 | **Try the analyzer** with a sentence | The suggestion and the words that led to it; "Nothing was saved" | |

## 6. Android phone (Chrome)

| # | Do | Expected | Result |
|---|---|---|---|
| 1 | Describe a job; press **🎤 Speak** and say the job in **Urdu** | The spoken words are added at the end of the box and checked when you stop | |
| 2 | Press 🎤 again and say a job in **English** (website in English) | The same | |
| 3 | Step 2: tap the picture choices; the budget opens the number keypad; 🔊 reads it back | Big targets, nothing hidden by the keyboard | |
| 4 | Every new page at phone width | No sideways scrolling; the header fits | |
| 5 | **Try 5 of your own sentences** and write down what the app suggested (trade, kind of work, city, day, time) | Write them below. Remember: these are test sentences, never for the Google Form or the dataset | |

| # | Your sentence | What the app suggested | Right? |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
