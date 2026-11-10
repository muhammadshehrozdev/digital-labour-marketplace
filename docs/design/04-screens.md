# 04 — Screen specifications (Batch 1, 9 Nov 2026)

## Batch 3 changes (10 Nov 2026)
Every screen below now exists in English, Urdu (mirrored, right to left) and Roman Urdu, with design v2
(D-017). Screenshots of every screen at 360 / 768 / 1280 px: `npm run screenshots` (checked set in
`docs/design/screenshots/`).

| Route | Change |
|---|---|
| (first visit, any route) | **Language chooser**: three cards, each written in its own language |
| `/` | Landing v2: dark hero (animated logo, typewriter headline, illustration, switcher), how-it-works tracks, trust section, trades from the taxonomy, call-to-action band |
| `/login`, `/register` | Split layout with a dark brand panel on wide screens; role cards with illustrations |
| `/onboarding/:step` | Restyled; Step 3 continues correctly; "All set" shows a short confetti burst |
| `/worker` | Overview only (D-020): completion, identity, skill chips, proof counts, next steps; "View my profile", "Edit profile" |
| `/worker/profile` | **New**: complete profile, read only; Private section for the owner; "See what customers see" |
| `/worker/profile/edit` | **New**: six sections (About you, Work and rates, Skills, Proof of skills, Work history, Language preference), side navigation / tabs, unsaved-changes protection |
| `/worker/skills` | Removed as a page; redirects into the editor |
| `/workers/:id` | Same layout as the worker's own customer preview |
| `/dev/themes` | **New** (development only): theme lab, logo concepts |


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

## Batch 2 additions (Module 3, 9 Nov 2026)

| Route / place | Layout | Content | Notes |
|---|---|---|---|
| `/onboarding/proof` (Step 4) | card with the upload form + card "Your proof so far" | Skill select, kind (3 RadioCards: certificate, work photo, reference letter), FileUpload (tap for camera/gallery, drag and drop, preview, remove), optional title, consent checkbox, upload progress bar; list per skill with item status chips ("Pending review") | "Skip for now" until something is uploaded, then "Continue". Client checks use the server's messages |
| `/worker/skills` → "Proof of skills" | card under the skills editor | Per skill: StatusChip (Self-declared / Evidence pending / Verified by evidence / Disputed), "Evidence: N approved", "Strength: None/Weak/Moderate/Strong", items with thumbnail, kind, date, status and reason; delete (ConfirmDialog) only for pending/rejected; "Add proof" opens a Drawer with the skill preselected (`?proof=<skillId>`) | No percentages anywhere |
| `/worker` dashboard | "Your skills" card | Same per-skill summary and items (compact, no thumbnails); "Add proof" goes to `/worker/skills?proof=…`; next step "Add proof for your skills" | Not in the top menu |
| `/admin/evidence` | sidebar layout; filters row; DataTable (cards on phones); Drawer | Filters: status (default pending, oldest first), kind, skill, "Possible duplicates only". Drawer: large image with "Zoom to full size"/"Fit", possible duplicate side by side, file facts, b/d/u/E with "How this is computed", only the allowed actions | Each action opens a Dialog: Approve (confirm), Reject (reason select, note), Suspected fake (written reason), Revoke (written reason) |
| `/admin` overview | tiles | Adds "Proof waiting for review" and "Proof marked suspected fake" | Real counts from `/api/admin/stats` |
| `/find`, `/workers/:workerId` | as before | Verified skills marked on cards; "Verified skills only" filter; public profile shows chip + approved count + strength per skill | Never evidence images |
