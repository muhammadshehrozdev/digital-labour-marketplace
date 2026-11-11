# Requirements traceability (Batch 4, 11 Nov 2026)

One row per requirement: where it comes from, what it asks, where it is built, how it is checked, and its
status. Test names are the real `test(...)` / `describe(...)` titles; files are under `backend/tests/`,
`frontend/src/test/` and `frontend/e2e/`. Status words: **Done**, **Done (limit)** = done with a stated
limitation, **Partial**, **Not done** (with the reason). The test results behind every "Done" are in the
Batch 4 report and `docs/TEST-CASES.md`.

> **Doc A is not in the repository.** The Batch 4 prompt asks for "the assessment document (Doc A) Section 7,
> rows 1 to 3". No such file exists in this repository or the dev container (searched on 11 Nov 2026), so
> those three rows **cannot be traced here**. The team should add Doc A (or paste rows 1–3 into this file),
> and the rows will be mapped in the same way. Nothing below is guessed from it.

## 1. Proposal: Module 1 — Worker Digital Identity

| # | Requirement (proposal text) | Where implemented | How verified | Status |
|---|---|---|---|---|
| M1.a | Worker account registration and secure login | `backend/controllers/authController.js`, `validators/auth.js`, `middleware/authMiddleware.js`, `services/session.js` (HttpOnly cookie, D-006), `middleware/rateLimit.js`, `csrf.js`; `frontend/src/pages/public/{Register,Login}.jsx` | `integration/auth.test.js` (lockout, M1-1, M1-5, M1-14, CSRF), `auth-rate-limit.test.js`, `batch4-features.test.js` "session end time", "suspend: sessions end at once…"; `auth.test.jsx`; e2e `quality.e2e.js` "keyboard only: skip link, then log in" | Done |
| M1.b | Creation of a structured digital worker profile | `models/WorkerProfile.js`, `controllers/workersController.js`, guided onboarding (D-011) `pages/onboarding/*`, profile editor (D-020) | `workers-profile.test.js`, `onboarding.test.jsx`, e2e `languages.e2e.js` "full onboarding in en/ur/ur-Latn" | Done |
| M1.c | Management of personal, professional and contact information | `features/profile/{AboutForm,WorkForm}.jsx` with masks (`utils/masks.js`) and drafts (`hooks/useDraft.js`); private fields owner/admin only (D-002, D-007) | `workers-profile.test.js`, `worker-batch4.test.jsx` "input masks", "autosaved drafts"; e2e `profile-and-privacy.e2e.js` "profile view -> edit -> save…" | Done |
| M1.d | Recording of worker experience, occupation and service categories | One taxonomy `backend/config/skillTaxonomy.js` served by `/api/meta/taxonomy`; Work form | `skillTaxonomy.test.js`, `workers-profile.test.js` (M1-6, M1-16) | Done |
| M1.e | Role-based access for workers, customers and administrators | `requireRole` on every protected route; admins only from `npm run create-admin`; route guards (UX only); suspension (D-024) | `admin.test.js`, `batch4-features.test.js` "only an admin can list, open or change users", `batch4-admin.test.js` "admin only" (charts, exports, templates); `customer-batch4.test.jsx`, `admin-batch4.test.jsx` "a customer or worker never reaches the admin users page" | Done |

## 2. Proposal: Module 2 — Experience and Skill Profiler

| # | Requirement (proposal text) | Where implemented | How verified | Status |
|---|---|---|---|---|
| M2.a | Collection of worker experience and skill information | Step 3 / Skills editor `features/skills/SkillsEditor.jsx` (typing, voice typing, example carousel in the website language) | `onboarding.test.jsx`, `voice.test.jsx`, `worker-batch4.test.jsx` "example carousel"; e2e `onboarding-step3.e2e.js` | Done |
| M2.b | Assisted identification of relevant skills from worker-provided information | Rule-based (dictionary) extractor `services/skillExtractor/*` (never called "AI"); matched words marked inside the text | `unit/skillExtractor.test.js`, `skills.test.js` "never changes the database"; `worker-batch4.test.jsx` "matched words marked inside the text"; evaluation `npm run evaluate:skills` (precision/recall/F1 on the labelled set) | Done |
| M2.c | Organisation of skills according to job and service categories | Taxonomy categories; skills stored with their category; grouped suggestions | `skillTaxonomy.test.js`, `skills.test.js` | Done |
| M2.d | Generation of a structured worker skill profile | One `skills` array with `skillId`, `category`, `addedVia`, evidence summary (M2-10); profile view | `skills.test.js`, `pages.test.jsx` "dashboard is an overview only…" | Done |
| M2.e | Identification of potential skills that can be added to the worker profile | **Batch 4:** `services/potentialSkills.js` (same trade category, rule-based, D-026), `GET /api/workers/me/skills/potential`, `features/worker/PotentialSkills.jsx` on the dashboard and in the skills editor; one tap, `addedVia: "related"`, Undo | `unit/batch4-services.test.js` "potential skills", `batch4-features.test.js` "potential skills and profile strength", `worker-batch4.test.jsx` "one tap adds a potential skill…" | Done |

## 3. Proposal: Module 3 — Skill Evidence and Verification

| # | Requirement (proposal text) | Where implemented | How verified | Status |
|---|---|---|---|---|
| M3.a | Upload of certificates, work samples, photographs and other skill evidence | `controllers/evidenceController.js`, `services/evidence/image.js` (bytes checked, re-encoded, metadata removed); upload form with "Take a clear photo of your certificate", compression, crop/rotate, progress with Cancel | `evidence.test.js` (types, PDF, HEIC, GPS EXIF, sizes), `worker-batch4.test.jsx` "upload: compression, crop and rotate, progress with cancel", `evidence.test.jsx` | **Done (limit):** photos only (JPEG, PNG, WebP). A certificate or letter is uploaded as a photo of the paper; PDF/Office files are refused with a clear message. Why: safety (no embedded scripts or files), metadata stripping, phones not scanners (D-013 note). |
| M3.b | Secure storage and association of evidence with individual skills | `models/{Evidence,EvidenceFile}.js` (D-013), one skill per item, owner/admin-only file route, `no-store` | `evidence.test.js` "who can see and delete evidence", "customers never get images…" | Done |
| M3.c | Verification status for submitted skill evidence | States pending → approved / rejected / suspected fake / revoked (D-015); per-skill summary and chip | `evidence.test.js`, `unit/skillConfidence.test.js` | Done |
| M3.d | Administrator review of evidence where required | Evidence review page with photo, numbers (D-014), duplicate compare slider, keyboard shortcuts, saved reasons, waiting badges; decisions audited and notified | `evidence.test.js` "two simultaneous reviews…", `admin-batch4.test.jsx` "duplicate compare slider", "review shortcuts…"; `batch4-features.test.js` "notifications"; e2e `profile-and-privacy.e2e.js` "admin evidence review still works…" | Done |
| M3.e | Maintenance of verified and unverified skill information | Evidence summary recomputed on every upload/decision/deletion; "Verified by evidence" vs "Self-declared"; customers see the difference; directory sort by approved proof | `evidence.test.js` (summary), `batch4-features.test.js` "directory sort", `customer-batch4.test.jsx` "the comparison is a real table…" | Done |

## 4. Assessment document (Doc A), Section 7

| # | Requirement | Where implemented | How verified | Status |
|---|---|---|---|---|
| A7.1–A7.3 | Rows 1–3 of Section 7 | — | — | **Not traceable: Doc A is not in the repository** (see the note at the top) |

## 5. Audit findings (`docs/audit/audit-2026-11-06.md`)

Every audit ID is mapped to its control and test in `docs/SECURITY.md`; the short form is here.

| ID | Finding (short) | Fix (where) | Test | Status |
|---|---|---|---|---|
| M1-1 | Anyone can register as admin | Register schema only `worker`/`customer`; `create-admin` script | `auth.test.js` "M1-1…", `hotfix-critical.test.js`, `auth.test.jsx` "there is no admin option anywhere on the page (M1-1)" | Done |
| M1-2 | Directory leaks CNIC, address, contact data | Explicit projections `PUBLIC_WORKER_FIELDS` (also saved, compare) | `directory.test.js`, `batch4-features.test.js` "the list shows public fields only", "compare … public fields only" | Done |
| M1-3 | Regex crash in search | `escapeRegex`, ≤ 50 characters (also admin users search) | `directory.test.js` "search C++ and (", `batch4-features.test.js` "search text is matched literally" | Done |
| M1-4 | Query operator injection | Strict zod query schemas, `sanitizeFilter`, `mongoose.trusted` only for our own operators | `directory.test.js`, `batch4-features.test.js` "q[$ne]=x", `batch4-admin.test.js` "status[$ne]=x" | Done |
| M1-5 | No server validation | zod on every body/query/param (`middleware/validate.js`), stable error codes | `auth.test.js` "M1-5", every Batch 4 route's "bad input" test | Done |
| M1-6 | Negative rates, bad CNIC, bad enums | Ranges in zod and Mongoose; masks in the UI | `workers-profile.test.js` "(M1-6)", `worker-batch4.test.jsx` "input masks" | Done |
| M1-7 | Raw error text in 500s | Central error handler, generic message | `foundation.test.js` "hides internal error messages" | Done |
| M1-8 | Worker ID clashes | Atomic per-year counter | `workers-profile.test.js` "200 profiles…" | Done |
| M1-9 | One-click "Verified", no record | Status + note, conditional update, audit; Batch 4: no CNIC in notes, notifications | `admin.test.js` "(M1-9)", `batch4-features.test.js` "a decision note with a CNIC number is refused" | Done |
| M1-10 | No rate limit, open CORS, no headers | Lockout, IP limiter, CORS allow-list, helmet | `auth.test.js`, `auth-rate-limit.test.js`, `foundation.test.js` | Done |
| M1-11 | Token in localStorage, no logout | HttpOnly cookie, tokenVersion, CSRF Origin check, 401 handling; Batch 4: session warning | `auth.test.js`, `auth.test.jsx`, `app-batch4.test.jsx` "session ending warning" | Done |
| M1-12 | Unclear DB/config failures | `config/env.js` fail-fast, 503 when DB down | `foundation.test.js`, `db-down.test.js` | Done |
| M1-13 | Routes mounted twice, no 404 | One mount under `/api`, JSON 404 | `foundation.test.js` | Done |
| M1-14 | Weak user schema | lowercase/trim/maxlength, `select:false`, bcrypt 12 | `auth.test.js` "M1-14" | Done |
| M1-15 | Inputs removed by the newer UI | Emergency contact, languages, work-history duration and description back in the forms | `onboarding.test.jsx`, `pages.test.jsx` | Done |
| M1-16 | Category lists disagree | One taxonomy file served by the API | `skillTaxonomy.test.js` | Done |
| M2-1 | Voice input never saves | One skills array, `addedVia` enum (`extractor`, `manual`, `related`) | `skills.test.js` | Done |
| M2-2 | Profiler overwrites Module 1 data | Extract saves nothing; "Use these" only on click | `skills.test.js` "never changes the database", `onboarding.test.jsx` | Done |
| M2-3 | "hello" wipes the profile | No wipe route; explicit add/remove only | `skills.test.js` "hello" | Done |
| M2-4 | Negative filter deletes real text | Negative phrases only stop a match when they negate it | `skillExtractor.test.js` | Done |
| M2-5 | Urdu substring matches | Token matching with Urdu word boundaries | `skillExtractor.test.js` | Done |
| M2-6 | Everyday English words create skills | Phrase rules and stop contexts | `skillExtractor.test.js` | Done |
| M2-7 | Years from Urdu words/digits; 30000 years | Number words and digits, caps with a note | `skillExtractor.test.js`, `skills.test.js` | Done |
| M2-8 | Invented confidence percentages | No percentages for skills; strength labels only from D-014; profile strength is a documented checklist (D-026) | `honesty.test.js` (backend and frontend), `unit/batch4-services.test.js` "profile strength" | Done |
| M2-9 | Any skill name at 95% | Taxonomy ids only; custom skills marked, max 10 | `skills.test.js` "unknown skillId -> 400" | Done |
| M2-10 | Two skill lists drift | One `skills` array | `skills.test.js`, migration tests | Done |
| M2-11 | Non-string text → 500; no max length | zod, 2,000 characters | `skills.test.js` "(M2-11)" | Done |
| M2-12 | Mixed trades: one winner by order | All categories returned, tie reported | `skillExtractor.test.js`, `onboarding.test.jsx` | Done |
| M2-13 | Voice audio sent to a web service without notice | Notice before use; works only where supported | `voice.test.jsx` | Done |
| M2-14 | Domestic work has no rules | Domestic work, home maintenance and moving in the taxonomy | `skillTaxonomy.test.js` | Done |
| M2-15 | No measurement | Labelled synthetic dev set + `npm run evaluate:skills` (precision/recall/F1, Wilson, kappa); results are for development only (synthetic) | `evaluationMetrics.test.js`; `docs/evaluation/` | **Partial:** real labelled data from workers is still needed before any result can be reported (CLAUDE.md: synthetic data is not used to report results) |
| P-1 | Module 2 existed only on one laptop | Committed on a baseline branch, then this feature branch | Git history | Done |
| P-2 | Tests against the real database | In-memory MongoDB for backend tests; `dlm_e2e` local database for e2e (a reset refuses anything else) | `tests/helpers/testDb.js`, `e2e/global-setup.js` | Done |
| P-3 | "AI" wording for rule-based code | Wording rule; tests that scan the UI and API | `honesty.test.js` (backend, frontend) | Done |
| P-4 | Deployment and secrets (INC-001) | Secrets only in `.env` / Vercel; new keys for Vercel in Phase 8 | `docs/SECURITY.md` "Incidents" | **Partial:** deployment is Phase 8 (not part of this batch; never deploy this branch before it) |

## 6. Decisions (`docs/DECISIONS.md`)

| ID | Decision (short) | Where | Verified by | Status |
|---|---|---|---|---|
| D-001 | MERN only | whole repo | — | Done |
| D-002 | Phone/WhatsApp never in the directory | projections, UI | `directory.test.js`, `pages.test.jsx` "customer pages (D-002)", `customer-batch4.test.jsx` "cards never show private contact data" | Done |
| D-003 | Node.js 24 LTS | `package.json` engines | — | Done |
| D-004 | Accepted dev-only nodemon advisory | `docs/REVIEW-2026-11.md` dependency section | `npm audit` output | Done (re-checked) |
| D-005 | Password rules (15+ characters, ≤ 72 bytes) | `validators/common.js`, `utils/password.js` | `auth.test.js`, `auth.test.jsx` | Done |
| D-006 | HttpOnly cookie sessions, 8 h | `services/session.js` | `auth.test.js`; Batch 4 `sessionExpiresAt` + warning | Done |
| D-007 | CNIC encrypted + keyed hash, audited reveal | `services/cnic.js`, admin reveal | `cnic.test.js`, `admin.test.js`; Batch 4: never in notes, exports, notifications | Done |
| D-008 / D-012 | Category and skill list | `config/skillTaxonomy.js` | `skillTaxonomy.test.js` | Done |
| D-009 | Identity verification rules | admin identity review | `admin.test.js` | Done |
| D-010 | Design system v1 (superseded in parts by D-017, D-023) | `styles/tokens.css` | `contrast.test.js` | Done |
| D-011 | Guided onboarding | `pages/onboarding/*` | `onboarding.test.jsx`, e2e | Done |
| D-013 | Evidence files in MongoDB; images only (Batch 4 note) | `services/evidence/storage.js` | `evidence.test.js` | Done |
| D-014 | Skill confidence method | `services/trust/skillConfidence.js` | `skillConfidence.test.js`, `npm run confidence:sensitivity` | Done |
| D-015 | Evidence states and deletion rules | `services/evidence/transitions.js` | `evidence.test.js` | Done |
| D-016 | Upload processing and duplicate detection | `services/evidence/image.js` | `evidence.test.js` | Done |
| D-017 | Emerald Night theme | `styles/themes.css` | `contrast.test.js` | Done |
| D-018 | Logo "Stitched Nut" | — | — | **Replaced by D-021** (team feedback) |
| D-019 | Three languages without a library | `src/i18n/*` | `i18n.test.jsx`, e2e `languages.e2e.js` | Done |
| D-020 | One profile view, one editor | `pages/worker/*` | `pages.test.jsx`, e2e | Done |
| D-021 | Logo v3 (Batch 1 mark refined) | `components/brand/*`, `scripts/make-icons.mjs` | `brand.test.jsx` | Done |
| D-022 | Dark mode, circular reveal, saved theme and text size | `src/theme/*`, `index.html` | `theme.test.jsx`, `contrast.test.js` (both modes), e2e axe in dark mode | Done |
| D-023 | Design v3, illustration system | `components/illustrations/*`, landing, dashboards | `design.test.jsx`; critique `docs/design/07-critique-v2.md` | Done |
| D-024 | User management and suspension | `controllers/adminUsersController.js`, `pages/admin/AdminUsers.jsx` | `batch4-features.test.js`, `admin-batch4.test.jsx`, e2e `batch4.e2e.js` | Done |
| D-025 | Notifications by polling | `models/Notification.js`, `features/notifications/*` | `batch4-features.test.js`, `app-batch4.test.jsx`, e2e `batch4.e2e.js` | Done |
| D-026 | Potential skills, strength, sort keys | `services/{potentialSkills,profileStrength}.js`, `DIRECTORY_SORT` | `batch4-services.test.js`, `batch4-features.test.js` | Done |
| D-027 | Installable app, static-only service worker | `public/{manifest.webmanifest,sw.js}` | `app-batch4.test.jsx` "installable app" | Done |
| D-028 | CSV exports and reason templates | `controllers/{adminExportController,reasonTemplatesController}.js` | `batch4-admin.test.js`, `admin-batch4.test.jsx` | Done |

## 7. The user's own requests (Batches 1–4)

| Batch | Request (short) | Where | Verified by | Status |
|---|---|---|---|---|
| 1 | Brand, design system, component library | `components/ui/*`, `docs/design/03-design-system.md` | `components.test.jsx` | Done |
| 1 | Guided worker onboarding, one task per screen | `pages/onboarding/*` | `onboarding.test.jsx`, e2e | Done |
| 1 | Module 2 rebuilt with the new design; honest wording | `features/skills/*` | `skills.test.js`, `honesty.test.js` | Done |
| 2 | Module 3 complete (upload, review, confidence) | Module 3 files | `evidence.test.js`, `evidence.test.jsx` | Done |
| 2 | Integration tests; documentation for the FYP report | `backend/tests/integration`, `docs/*` | test runs | Done |
| 3 | A browser to look at the pages (safe, local only) | Playwright with system Chromium, own servers and DB | e2e suite | Done |
| 3 | Step 3 must continue; voice typing must work | `SkillsEditor`, `useVoiceTyping` | `onboarding-step3.e2e.js`, `voice.test.jsx` | Done |
| 3 | Three languages (English, Urdu RTL, Roman Urdu) | `src/i18n/*` | `i18n.test.jsx`, e2e | Done |
| 3 | Design v2 "bold, premium, alive" | themes, landing v2 | `contrast.test.js` | Superseded by Batch 4 design v3 |
| 3 | One profile view, one editor | D-020 | `pages.test.jsx` | Done |
| 4 | Better design ("nothing special"); target 9 or more on every criterion | D-023, critique with scores before/after | `docs/design/07-critique-v2.md`, `design.test.jsx` | **Partial:** average 5.3 → 8.7; 414 of 560 scores are 9 or more, 4 of 56 screen rows reach 9 everywhere; every score below 9 has its reason in the critique ("Not yet at 9") |
| 4 | Bring back the earlier logo, refine it | D-021 | `brand.test.jsx` | Done |
| 4 | Night-mode button on every page, with fun animation | D-022 | `theme.test.jsx` "the night-mode button is on every page", e2e dark-mode axe | Done |
| 4 | At least 50 delightful features | Part 4 features 1–55 (see the Batch 4 report, section 5) | the Batch 4 test files | Done (see report for any feature not built) |
| 4 | Where does the admin log in and manage things? | Same `/login`; admin area; `docs/ADMIN-GUIDE.md` | `admin-batch4.test.jsx`, e2e | Done |
| 4 | Check all code in detail; go beyond the documents | `docs/REVIEW-2026-11.md`, this matrix, coverage | review findings with tests | Done |
