# 01 — UX requirements (Batch 1, 9 Nov 2026)

Scope: Modules 1–3 of the proposal (Module 3 screens only as "coming next" in this batch).
Light theme only. Mobile first (360 px), then 768 px and 1280 px.

## Personas

**P1 — Worker (Rashid, 34, electrician, Rawalpindi).** Low-cost Android phone (≈360 px wide),
slow mobile data, reads Roman Urdu and some Urdu better than English. Wants to get listed and be
trusted, quickly. Limits: small screen, little patience for long forms, may type in Urdu script.
Needs: big buttons, one task per screen, short text, progress he can see, nothing lost if the
browser closes.

**P2 — Customer (Sana, 41, household in Islamabad).** Phone or laptop. Wants a trustworthy worker
for a job this week. Needs to judge trust at a glance: identity checked? skills backed by proof?
Limits: does not want to read long profiles; must never see private worker data.

**P3 — Admin (platform team member).** Laptop. Reviews identities now and evidence in Module 3.
Needs dense but clear tables, filters, a decision panel that forces a note, and an audit trail.

## Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | Public landing page explains the product to both sides, with no invented numbers or testimonials. |
| FR-2 | Register: choose role first (worker / customer). No admin option anywhere in the UI. Server messages appear next to the right field. |
| FR-3 | Login: email + password, one generic error, link to Register. Expired session shows a message. |
| FR-4 | A worker whose onboarding is not finished is always sent to the right onboarding step; progress comes from the server (`GET /api/workers/me/onboarding`). |
| FR-5 | Onboarding wizard: 1 About you, 2 Your work, 3 Your skills (opens by itself after step 2 is saved), 4 Proof of skills (honest "coming next"), 5 All set. Each step saves to the server on its own; Back keeps data. |
| FR-6 | Skills page: free text (Urdu / Roman Urdu / English) → suggestions with matched words; nothing saved until the worker ticks and clicks "Add selected skills"; manual add from the taxonomy; remove a skill. |
| FR-7 | Worker dashboard: completion, identity status (with reason if rejected), skills with status chips, next steps, worker ID. No Module 2 link in the top menu. |
| FR-8 | Customer directory: search, filters (category, city, availability, verified identity only), cards without any private data, pagination, loading/empty/error states. |
| FR-9 | Public worker profile: public fields and skills only, with the "contact after booking" note. |
| FR-10 | Admin: overview counts, identity queue with filters, decision drawer with required note, CNIC reveal through a confirmation dialog, read-only audit log viewer with filters. |
| FR-11 | 404 page, error boundary page. |
| FR-12 | Development-only style guide at `/dev/styleguide`. |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 Accessibility | WCAG 2.2 AA: contrast (tested), labels for every input, `aria-label` for icon buttons, keyboard use, visible focus, one `h1` per page, landmarks, `aria-live` for status, `prefers-reduced-motion`. |
| NFR-2 Responsive | No horizontal scroll at 360 px; touch targets ≥ 44 px for primary actions. |
| NFR-3 Performance | Self-hosted font, no runtime Google request; skeletons while loading; small icon set (tree-shaken). |
| NFR-4 Privacy | Customers never see phone, WhatsApp, email, address, CNIC (D-002). CNIC never shown to the worker either. |
| NFR-5 Honesty | No "AI", no confidence %, synthetic data labelled, Module 3 not faked. |
| NFR-6 Language | Text fields where Urdu may be typed use `dir="auto"`; Urdu blocks use a Nastaliq/Naskh font stack. |
| NFR-7 Quality | No inline styles in pages (except dynamic values), CSS Modules + tokens, 0 lint errors/warnings. |

## Acceptance criteria per screen

| Screen | Accepted when |
|---|---|
| Landing `/` | Two CTAs work; "How it works" for both sides; trust section; footer credit; logged-in users are sent to their home. |
| Register `/register` | Two RadioCards; no admin text; password hint; field-level server errors; worker → onboarding step 1, customer → `/find`. |
| Login `/login` | Generic error; session-expired notice; worker goes to the onboarding step or `/worker`. |
| Onboarding `/onboarding/:step` | Stepper shows progress; empty profile → step `about`; saving step 2 opens step `skills` by itself; skipping step 4 works; step 5 shows the real worker ID and "Pending review". |
| Worker dashboard `/worker` | Completion ring, identity card, skills chips, next steps, ID; "Update skills" opens `/worker/skills`. |
| Profile `/worker/profile` | All Module 1 fields; CNIC "Saved (hidden)"; real worker ID. |
| Skills `/worker/skills` | Extract saves nothing; tick + add saves; matched words visible; "Use these" for years; manual add; remove. |
| Find `/find` | Filters in a sidebar (desktop) / drawer (mobile); no private data; empty and error states. |
| Public profile `/workers/:workerId` | Public data only; skills with chips; contact note. |
| Admin `/admin`, `/admin/identity`, `/admin/audit` | Counts; table → cards on mobile; drawer requires a note; reveal needs confirmation and says it is audited; audit log filters by action and date. |
