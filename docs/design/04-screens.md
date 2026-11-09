# 04 — Screen specifications (Batch 1, 9 Nov 2026)

Every data screen has four states: **loading** (Skeleton matching the layout), **empty**
(EmptyState with one action), **error** (Alert with a retry button), **success** (toast and/or
updated content). Mobile = 360 px single column; desktop = up to 1200 px.

| Route | Layout (mobile → desktop) | Content | Notes |
|---|---|---|---|
| `/` Landing | stacked → two-column hero | Display "Skilled work, verified."; one line per side; CTAs "Find a worker" (→ /register or /find) and "Join as a worker"; in-house SVG illustration; "How it works" (3 steps workers, 3 steps customers); trust section (identity checked by an admin, skills backed by evidence — Module 3 "coming next"); footer: "Final Year Project, BS Software Engineering, SZABIST Islamabad" + team names | No numbers, reviews, logos or photos. Logged-in users are redirected to their home. |
| `/register` | single card, max 480 px | Step A: two RadioCards "I want to find work" / "I want to hire a worker"; Step B: name, email, phone, PasswordField; submit | Server `errors[]` mapped to fields; no admin wording. |
| `/login` | single card | Email, password, generic error, notice "Your session has ended" when set, link to Register | |
| `/onboarding/:step` | Stepper + one card; sticky bottom action bar on mobile | about / work / skills / proof / done (see Part 5.2 of the brief) | Each step saves on its own; Back keeps data; "Saved" toast then next step. Guard sends worker to `nextStep` from the API. |
| `/worker` | stacked cards → 2-column grid | Welcome; ProgressRing (profileCompletion); identity card (status chip + text, note if Rejected); skills card with StatusChips + "Update skills"; next steps (Add proof = coming next); worker ID (tabular) | |
| `/worker/profile` | sections in cards | Personal & contact (name, phone, WhatsApp, CNIC "Saved (hidden)", city, area, emergency contact, languages), Work (occupation, category, years, rates, availability, bio, past work); "Edit skills" link | Saves with PUT `/api/workers/me`. |
| `/worker/skills` and step `skills` | stacked | TextArea (dir=auto, 2,000 counter) + 3 tap-to-fill examples (Urdu, Roman Urdu, English); optional voice with notice; "Find my skills"; suggestions grouped by category with checkboxes and matched-word chips; detected experience with "Use these"; tie notice; "Add selected skills"; manual Combobox; saved skills with "Self-declared" chip and Remove | Label: "Suggestions come from a word list. Please check them." Extract never saves. |
| `/find` | search on top; filters in Drawer (mobile) / sidebar (≥ 1024) | Cards: Avatar initials, name, trade, category · city, experience, identity StatusChip, top 3 skills, rates | No phone/WhatsApp/email/address/CNIC. Pagination. |
| `/workers/:workerId` | header card + sections | Name, trade, city, identity chip, experience, rates, languages, bio, skills (chips), past work (no client name); note "Contact details are shared after a booking is accepted (coming in a later module)." | |
| `/admin` | sidebar + content | Count cards: workers, pending identity, verified, rejected, users by role; links to queues | Counts from `GET /api/admin/stats`. |
| `/admin/identity` | DataTable (cards on mobile) + Drawer | Filters (status, search by name/ID); row → Drawer with details, CNIC masked + "Reveal" (ConfirmDialog: "This will be recorded in the audit log."), decision radio + required note | |
| `/admin/audit` | DataTable | Filters: action, from date, to date; columns: #, time, actor, action, target, from → to, reason; read-only; pagination | Chain status from `audit:verify` is not shown in the UI (script). |
| `*` | centred card | "Page not found", link home | |
| Error boundary | centred card | "Something went wrong", reload button | No error details shown. |
| `/dev/styleguide` | long page | every component and state | Only when `import.meta.env.DEV`. |
