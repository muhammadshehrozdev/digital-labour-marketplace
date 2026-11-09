# BATCH 1: Professional UI/UX redesign, guided worker onboarding, and Module 2 (Phase 4)

> **How to use this file:** put it in the repository root, next to `CLAUDE.md` and `CLAUDE_CODE_PROMPT.md`, then tell Claude Code:
> "Read CLAUDE.md, CLAUDE_CODE_PROMPT.md and BATCH_1_PROMPT.md completely, then do Batch 1."
>
> Written on 9 Nov 2026 for branch `feature/modules-1-3`. It builds on Phases 0 to 3, which are already done and committed.

---

## Part 0: Context and rules that still apply

1. `CLAUDE.md` and `CLAUDE_CODE_PROMPT.md` remain in force. If this file conflicts with them, **this file wins for UI/UX and Phase 4 only**. Security rules, academic honesty rules and Git rules from `CLAUDE.md` always win.
2. **Module numbering is the proposal's:** Module 1 = Worker Digital Identity, Module 2 = Experience and Skill Profiler, Module 3 = Skill Evidence and Verification. The team follows the assessment document "Doc A" (the one that keeps proposal Modules 1, 2 and 3 for this semester).
3. **MERN only.** No external AI APIs, no LLM calls, never call rule-based code "AI" anywhere: UI, code names, comments or docs.
4. **Local only.** Use only the local MongoDB in `.local/`. Never connect to Atlas. Never touch Vercel. Never `git push`.
5. Decisions already made: D-001 to D-009 in `docs/DECISIONS.md` (MERN, phone hidden in directory, Node 24, nodemon advisory, 15-character passwords, HttpOnly cookie sessions, CNIC Option 2, taxonomy, identity rules).
6. The user's goal for this semester: Modules 1, 2 and 3 **complete, accurate, secure and professional**, with every audit bug fixed and tested. Quality matters more than speed, but work in **large batches** and do not stop for small questions.

---

## Part 1: Answers to your open questions from the Phase 2+3 report

| Question | Answer |
|---|---|
| Category list (D-008) | **Approved for Phase 4** as 9 categories, with one change: remove the overlap between "Cleaning & Shifting" and "Domestic Work". Cleaning belongs to Domestic Work. Propose the cleanest split, for example "Moving & Loading" as a separate category if needed, write the reason in D-008, and continue **without stopping**. Keep stable category ids (slugs) so the names can change later without breaking data. Leave ISCO codes empty unless you can verify them against an official source you actually opened. |
| Session length 8 hours | Accepted. |
| D-009 identity rules | Accepted for now. The team will review it with the supervisor. |
| Move legacy profiler | **Yes**: when the new extractor passes its tests, move `utils/aiSkillProfiler.js` to `evaluation/baselines/legacyProfiler.js` and remove it from the live API, as Phase 4 says. No need to ask again. |
| Atlas migrations | **Not now.** They wait for Phase 8, with the user's explicit yes. |

---

## Part 2: How to work (proper software process, in this order)

Do every stage, and write its output to a file before moving to the next stage. Each stage is short and practical; do not write essays.

| Stage | What you do | Output file(s) |
|---|---|---|
| 1. Requirements | Users, their goals and limits; functional and non-functional UX requirements; acceptance criteria for every screen | `docs/design/01-ux-requirements.md` |
| 2. Analysis | Audit of the current UI (every screen, what is wrong and why); information architecture (sitemap); user flows as Mermaid diagrams | `docs/design/02-ux-analysis.md` |
| 3. Design | Design system (tokens, typography, components and their states); screen-by-screen specs (layout, content, loading, empty, error and success states, mobile and desktop) | `docs/design/03-design-system.md`, `docs/design/04-screens.md` |
| 4. Implementation | Tokens, base styles, component library, app shell, every page, the onboarding flow, then Phase 4 (Module 2) | code |
| 5. Review | Self-review against the checklist in Part 9; fix everything you find | `docs/design/05-review.md` |
| 6. Testing | Automated tests (Part 9), all tests run with real output | test files, `docs/CHANGELOG.md` |
| 7. Deployment | **Not in this batch.** Write only a short "deploy readiness" note: what Phase 8 must do | `docs/design/06-deploy-readiness.md` |

**Users to design for (write these as personas in stage 1):**
- **Worker:** a daily-wage or skilled worker (electrician, plumber, painter, mason, carpenter, AC technician, domestic worker). Often uses a **low-cost Android phone** with a small screen and slow mobile data. May read Urdu or Roman Urdu better than English. Needs big, clear buttons, very short text, and one task per screen.
- **Customer:** a household or small business in Islamabad or Rawalpindi looking for a trustworthy worker. Uses a phone or a laptop. Wants to judge trust quickly.
- **Admin:** the platform team. Uses a laptop. Reviews identity (and, in Module 3, evidence). Needs dense but clear tables, filters, and a clear audit trail.

**Mobile first.** Design and build for a 360 px wide screen first, then scale up to tablet and desktop.

---

## Part 3: Brand and visual direction (decided; implement it)

The current UI looks like a default template: indigo `#4f46e5`, inline styles everywhere, a "DL" box as a logo. Replace **all** of it. Do not reuse old styles. The goal is the quality level of products from large tech companies (clarity of Google, polish of Stripe and Airbnb, marketplace patterns of Upwork and Thumbtack). **Match their quality, do not copy their look.**

### 3.1 Personality
Trustworthy, warm, practical, respectful. Calm confidence, not flashy. Every screen should make one thing obvious: **what can I trust here, and what do I do next?**

### 3.2 Name and logo
- The official product name stays **"Digital Labour Marketplace"**, because the proposal, the report and the viva use it.
- Design a proper **logomark as an SVG**: a rounded shield or badge shape (trust) that holds a simple tool silhouette (for example a wrench) combined with a check stroke (verified). Flat, two colours from the palette, readable at 16 px. No gradients, no sparkles.
- **Wordmark:** "Digital Labour" in Manrope 800 with slightly tight letter spacing, plus "Marketplace" in Manrope 500 in the secondary text colour. Desktop header: mark plus the full wordmark. Mobile header: mark plus "Digital Labour".
- Replace the Vite favicon with the logomark (SVG favicon plus a 32 px PNG fallback). Page title: "Digital Labour Marketplace". Add a `<meta name="theme-color">` with the primary colour.
- Put the logo in `frontend/src/components/brand/` as a React component with `size` and `variant` (full, mark-only) props.

### 3.3 Colour tokens (exact values; define them as CSS custom properties)

**Primary, "Trust Green"** (main actions, links, focus, brand):
`50 #ECF7F3, 100 #D2EDE4, 200 #A6DAC9, 300 #6FC0A8, 400 #3BA285, 500 #1B8468, 600 #0F6B54, 700 #0B5544, 800 #0A4437, 900 #08372D`

**Accent, "Saffron"** (highlights, "new", small badges; **never** for body text on white):
`100 #FDF0D5, 300 #F8C66B, 500 #F2A93B, 700 #B86E0E`

**Neutral, warm stone** (text, surfaces, borders):
`0 #FFFFFF, 25 #FCFCFB, 50 #F7F6F4, 100 #EFEDEA, 200 #E3E0DB, 300 #CFCAC3, 400 #A8A29A, 500 #7A746C, 600 #57524B, 700 #3D3934, 800 #282521, 900 #1A1815`

**Semantic** (text colour / soft background):
success `#15803D / #EAF6EE`, warning `#B45309 / #FEF4E6`, danger `#B42318 / #FDECEA`, info `#1D5FD1 / #EAF1FD`

**Roles:** page background neutral-50; cards neutral-0; main text neutral-900; secondary text neutral-600; disabled text neutral-400; borders neutral-200; primary button primary-600 (hover 700, pressed 800) with white text; focus ring 3 px primary-300 with a 2 px offset.

**Contrast rule:** every text/background pair used in the UI must meet **WCAG 2.2 AA** (4.5:1 for normal text, 3:1 for large text and for UI parts such as borders of inputs and focus rings). Write a small **unit test** that computes the contrast ratio of every token pair you use for text, and fails below the limit. No package needed: the WCAG relative-luminance formula is a few lines.

**Banned (these make a UI look machine-made):** purple-to-blue gradients, glassmorphism, neon glows, emoji used as icons, "✨ AI" sparkles, random blobs, stock photos of real people, more than one accent colour per screen, centred body text longer than two lines.

**Light theme only in this batch.** Structure the tokens (semantic names such as `--color-surface`, `--color-text`) so a dark theme can be added later. Do not ship a half-finished dark mode.

### 3.4 Typography
- **Manrope** (variable font), **self-hosted** through the `@fontsource-variable/manrope` package (approved in Part 8). No Google Fonts request at runtime, which is better for privacy and slow networks. Remove the current Google Fonts `@import`.
- Scale (size/line height in px): display 40/48 (mobile 32/40), h1 32/40, h2 24/32, h3 20/28, body 16/24, small 14/20, caption 12/16. Weights: 400, 500, 600, 700, 800.
- Use tabular numbers for rates, IDs and counts.
- **Urdu text:** every field where a worker may type Urdu gets `dir="auto"` and `lang` where known; use the font stack `"Noto Nastaliq Urdu", "Noto Naskh Arabic", "Jameel Noori Nastaleeq", serif` for Urdu blocks with line height about 1.9. Do not add an Urdu font package in this batch.

### 3.5 Space, shape, depth, motion
- 4 px spacing grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- Radius: 6 (inputs, small), 10 (buttons), 14 (cards), 20 (large panels, dialogs), full (chips, avatars).
- Shadows: subtle, layered, low opacity (xs, sm, md, lg). Cards usually use a border plus `sm`, not heavy shadows.
- Motion: 150 to 250 ms, ease-out, only for meaning (open, close, feedback). Respect `prefers-reduced-motion`.
- Layout: content max width 1200 px; breakpoints 360, 640, 768, 1024, 1280. No horizontal scroll at 360 px.
- Touch targets: at least 44 × 44 px for primary actions on mobile (WCAG 2.2 requires at least 24 × 24; 44 is the comfortable target).
- Icons: `lucide-react` (approved in Part 8), 20 px default, stroke 1.75, always with a text label or an `aria-label`.

---

## Part 4: Component library (build once, use everywhere)

Folder: `frontend/src/components/ui/`. One component per file, styled with **CSS Modules** (`*.module.css`; Vite supports them with no package). Tokens live in `frontend/src/styles/tokens.css`, global reset and base styles in `frontend/src/styles/base.css`. **No inline `style={{…}}` in pages any more**, except truly dynamic values such as a progress width.

Each component needs every state: default, hover, focus-visible, active, disabled, loading, error, and accessible names.

| Component | Notes |
|---|---|
| `Button` | variants: primary, secondary, ghost, danger; sizes sm, md, lg; `loading` shows a spinner and keeps the width; full width on mobile where useful |
| `IconButton` | requires `aria-label` |
| `TextField`, `TextArea`, `Select` | label above, hint below, error message linked with `aria-describedby`, required marker, character counter for TextArea |
| `PasswordField` | show/hide toggle, live hint "15+ characters; a sentence you remember works well" |
| `RadioCard` | large selectable cards (role choice on Register, category choice) |
| `Checkbox`, `Switch` | |
| `Combobox` | searchable select for skills and categories from the taxonomy API, keyboard accessible |
| `Badge` / `StatusChip` | identity: Pending, Verified, Rejected; skills: Self-declared, Evidence pending, Verified by evidence, Disputed (the Module 3 states come later, but build the chip now) |
| `Avatar` | initials with a colour chosen from the name, no photos |
| `Card`, `Section`, `PageHeader` | |
| `Stepper` | for onboarding: numbered steps, current step, completed steps with a check, works on mobile (compact) |
| `ProgressBar` / `ProgressRing` | profile completion |
| `Tabs` | |
| `DataTable` | admin tables; on mobile turns into stacked cards; sorting and empty state |
| `Dialog` / `ConfirmDialog` | focus trap, closes with Esc, returns focus; ConfirmDialog for CNIC reveal and destructive actions |
| `Drawer` | admin decision panel; mobile filters |
| `Toast` + `Alert` | toasts announced with `aria-live="polite"`; inline alerts for page-level errors |
| `EmptyState` | icon, title, one sentence, one action |
| `Skeleton` | loading placeholders matching the final layout |
| `Pagination` | |
| `Navbar` (`AppHeader`) | role-aware, mobile menu, account menu with logout |
| `AdminSidebar` | |

Also add `frontend/src/pages/StyleGuide.jsx` at route `/dev/styleguide`, **only in development** (`import.meta.env.DEV`), showing every component and state. It is for the team and for the viva demo of the design system.

---

## Part 5: Information architecture, routes and the guided onboarding

### 5.1 Routes

| Area | Route | Page |
|---|---|---|
| Public | `/` | Landing page |
| Public | `/login`, `/register` | Auth |
| Worker | `/onboarding/:step` | Guided onboarding (Part 5.2) |
| Worker | `/worker` | Worker dashboard |
| Worker | `/worker/profile` | Edit profile (Module 1 data) |
| Worker | `/worker/skills` | Edit skills (Module 2), opened from the dashboard and profile, **not from the top menu** |
| Customer | `/find` | Find workers (directory) |
| Customer | `/workers/:workerId` | Worker profile as a customer sees it (public fields only, no phone, per D-002) |
| Admin | `/admin` | Overview with queues and counts |
| Admin | `/admin/identity` | Identity review (table, filters, decision drawer with required note, CNIC reveal with confirmation) |
| Admin | `/admin/audit` | Read-only audit log viewer |
| All | `*` | 404 page; plus an error boundary page and a "session expired" message |

### 5.2 Guided worker onboarding (the user's explicit request)

**Problem today:** after login, the worker sees "My Profile" and "AI Skill Profiler" side by side in the top menu, and must find Module 2 by himself.

**Required behaviour:**
1. After **registering** as a worker, or after **logging in** while onboarding is not finished, the worker lands on `/onboarding/<current step>`, not on a menu.
2. Onboarding is a **step-by-step wizard** with a `Stepper` at the top:
   - **Step 1, "About you"** (Module 1): full name, phone, WhatsApp, CNIC (with the text "Only verified admins can see your CNIC. It is stored encrypted."), city, area, emergency contact, languages.
   - **Step 2, "Your work"** (Module 1): occupation, category (from the taxonomy API), years of experience, hourly and daily rate in PKR, availability, short bio, past work records.
   - **Step 3, "Your skills"** (Module 2): the new skill extractor page (Part 6). **It opens automatically right after Step 2 is saved successfully.** The worker does not click anything in a menu to reach it.
   - **Step 4, "Proof of skills"** (Module 3): **not built in this batch.** Show an honest card: "Coming next: upload photos of certificates or your work to get skills verified." with a "Skip for now" button. Do not fake an upload.
   - **Step 5, "All set"**: summary of what was saved, the worker's ID, identity status "Pending review", and a button to the dashboard.
3. **Saving a step moves to the next step automatically** after a success toast. Back buttons keep entered data. Each step saves to the server on its own (no data lost if the browser closes).
4. **Remove "AI Skill Profiler" (and any Module 2 link) from the top menu.** Worker menu: Dashboard, Profile, plus the account menu (logout). Skills are edited from the dashboard ("Update skills" card) and from the profile page, which open `/worker/skills`.
5. **Progress comes from the server, never from `localStorage`.** Add `GET /api/workers/me/onboarding`, which **derives** the state from saved data, so it cannot drift:
   - `about` done = name, phone, city present
   - `work` done = category, occupation, experience and at least one rate present
   - `skills` done = at least one confirmed skill
   - `completedAt` set once all three are done (store it on the profile when it first happens)
   The frontend route guard uses it to send the worker to the right step. Add tests for the endpoint and for the redirects.
6. An onboarding-complete worker who logs in goes to `/worker`.

### 5.3 Other key screens (content; full specs go in `04-screens.md`)
- **Landing:** headline in the spirit of "Skilled work, verified." with a one-line explanation for both sides; two calls to action ("Find a worker", "Join as a worker"); a "How it works" section for workers and for customers (3 steps each); a trust section explaining identity checks and evidence-based skills; footer credit "Final Year Project, BS Software Engineering, SZABIST Islamabad" and the team names from `CLAUDE.md`. **No invented numbers, testimonials, reviews, partner logos or ratings.** Use a simple in-house SVG illustration, not stock photos.
- **Register:** first choose a role with two `RadioCard`s ("I want to find work" / "I want to hire a worker"); then the form. There is **no admin option anywhere** in the UI (admins come only from `npm run create-admin`). Show server validation messages next to the right field.
- **Login:** clean, email and password, generic error message, link to Register.
- **Worker dashboard:** welcome line; profile completion ring; identity status card (Pending, Verified, or Rejected with the reason); skills list with status chips; "Next steps" checklist (for example "Add proof for your skills", shown as coming soon); worker ID.
- **Find workers (customer):** search bar on top; filters (category, city, availability, "verified identity only") in a sidebar on desktop and a drawer on mobile; result cards with avatar initials, name, trade, city, experience, identity badge and top skills; **no phone, WhatsApp, email, address or CNIC** (D-002); skeleton loading, empty state, error state; pagination.
- **Worker public profile:** the same public fields, skills with their status chips, and a note "Contact details are shared after a booking is accepted (coming in a later module)."
- **Admin:** a sidebar layout; overview counts; identity queue table with filters; decision drawer with a required note; CNIC reveal through `ConfirmDialog`, with the text "This will be recorded in the audit log."; read-only audit log viewer with filters by action and date.

---

## Part 6: Phase 4, Module 2 (do it in this batch, with the new design)

Follow **Phase 4 of `CLAUDE_CODE_PROMPT.md`** completely (Part C5 design, taxonomy, `services/skillExtractor/*`, new endpoints, confirm flow, migration script, evaluation harness, the legacy profiler move, and **every** required regression test listed there). In addition:

1. **Name everywhere:** "Skill suggestions" in the UI; "rule-based skill extractor" in docs and code. The words "AI" and "confidence %" must not appear (M2-15, M2-8).
2. **Skills step UI (`/onboarding/skills` and `/worker/skills`):**
   - A large `TextArea` (`dir="auto"`, up to 2,000 characters with a counter), with three short examples the worker can tap to see: one Urdu, one Roman Urdu, one English.
   - Optional voice button with the notice from Phase 4/M2-13; text is the main input.
   - "Find my skills" calls the **extract** endpoint, which **never changes the database**.
   - Suggestions grouped by category, each with a checkbox and the **matched words shown as small highlighted chips** (so the worker sees *why* it was suggested). Detected years and months are shown with a "Use these" button.
   - "Add selected skills" saves only what the worker ticked. A `Combobox` lets the worker add a skill from the taxonomy by hand.
   - Nothing on the profile is overwritten unless the worker clicks to save (M2-2, M2-3).
   - Saved skills show the chip "Self-declared" (Module 3 will add evidence states later).
   - A small, honest label under the suggestions: "Suggestions come from a word list. Please check them."
3. **Evaluation (academic core of Module 2):**
   - Build the harness, `npm run evaluate:skills -- --file <path>`, reporting precision, recall and F1 (micro and macro), per category, plus bootstrap 95% intervals, and the legacy profiler as the baseline.
   - Create `docs/evaluation/` with: the CSV format for labelled data; an annotation guide (how two team members label the same text, and how agreement is measured with Cohen's kappa); a consent form template in simple English and Urdu for collecting real worker descriptions; and a data-handling note (no names, no phone numbers, no CNICs in the dataset).
   - Create a **small synthetic development set** for tests only. Label it "synthetic" in its file name and header. **Never report its numbers as results.**
   - Results in the report will come only from **real** labelled data that the team collects with consent. Write that in `docs/evaluation/README.md`.

---

## Part 7: Module 1 points to re-check during the redesign

- **Admin self-registration (M1-1):** already fixed on the server. During the redesign, confirm that no admin option exists anywhere in the UI, that `npm run create-admin` is documented in `README.md` with exact PowerShell steps, and that the admin login works only for script-created admins. Keep or extend the tests.
- **Worker ID:** the profile card must show the real counter-based ID after the first save, never the placeholder "DLM-2026-NEW" once a profile exists.
- **Own data vs public data:** the worker sees his own phone and CNIC status on his own profile; customers never see phone, WhatsApp, email, address or CNIC.
- Remove the 3 old lint warnings in `SkillProfilerPage.jsx` by replacing that page with the new skills page.

---

## Part 8: Packages approved for this batch

You may install **only these** new packages, at a version at least 2 weeks old, after checking the package name, its license and that it is actively maintained. Explain each one in the report.

| Package | Where | Why |
|---|---|---|
| `lucide-react` | frontend | consistent, accessible SVG icon set |
| `@fontsource-variable/manrope` | frontend | self-hosted Manrope font, no runtime request to Google |

Anything else needs the user's yes: stop and ask.

---

## Part 9: Quality gates (all must pass before the final report)

1. **Tests:** all backend and frontend tests pass with real output. New tests for at least: onboarding endpoint and redirects (worker with an empty profile goes to Step 1; after Step 2 is saved, the app goes to Step 3 by itself; a complete worker goes to `/worker`); no Module 2 link in the top menu; no admin option on Register; directory cards and the public profile never render phone, WhatsApp, email, address or CNIC; the skills step never saves without a click; the token contrast test; every Phase 4 regression test from `CLAUDE_CODE_PROMPT.md`.
2. **Build:** `npm run build` succeeds. **Lint:** 0 errors and 0 warnings.
3. **Accessibility:** every input has a label; every icon button has an `aria-label`; full keyboard use (Tab order, Enter, Esc closes dialogs, visible focus); one `h1` per page; landmarks (`header`, `nav`, `main`, `footer`); status changes announced through `aria-live`; contrast test passes; `prefers-reduced-motion` respected.
4. **Responsive:** check every page at 360, 768 and 1280 px widths; no horizontal scroll; the stepper, tables and filters adapt.
5. **No console errors or warnings** in the browser on any page.
6. **No inline styles** in pages (except dynamic values), no leftover old CSS, no unused files. Delete the old `App.css` if unused.
7. **Honesty:** no fake numbers, reviews or testimonials; no "AI" wording; synthetic data labelled.
8. **Docs updated:** `docs/design/*`, `docs/API.md` (new endpoints), `docs/DECISIONS.md` (add D-010 design system, D-011 guided onboarding, D-012 final category list), `docs/CHANGELOG.md`, `README.md` (how to run the preview, create the admin, run tests).
9. Add `*:Zone.Identifier` to `.gitignore` (Windows adds these files when copying into WSL).

---

## Part 10: Commits, stopping rules and the final report

- Work on `feature/modules-1-3`. Commit in small, clear steps whenever the tests pass (for example: design tokens; component library; app shell; landing and auth; onboarding; dashboards; admin; Phase 4 backend; skills page; evaluation harness; docs). **Never push.**
- Run long jobs in the background so requests do not time out.
- Keep the local preview running at http://127.0.0.1:5173 when you finish.
- **Stop early only if:** a test cannot be made to pass; a package outside Part 8 is needed; something conflicts with the documents or with `CLAUDE.md`; or a decision is needed that this file does not give.
- **Final report (one message):**
  1. What changed, grouped by stage (requirements, analysis, design, implementation, review, tests).
  2. Real test output summary (backend, frontend), build and lint results.
  3. A table of M2-1 to M2-15 with "fixed" and the test name, as was done for M1.
  4. Screens built, with their routes.
  5. **A click-through script for Chrome**: exact steps for a new worker (register → onboarding steps 1 to 5 → dashboard), for a customer (search, filter, open a profile, confirm no phone is shown), and for the admin (identity review with a note, CNIC reveal, audit log). Include the synthetic demo accounts.
  6. Anything left open, and what Phase 5 (Module 3) needs.
