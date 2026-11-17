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

## 5. Audit findings (team's internal audit of 6 Nov 2026, kept outside the repository)

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
| M2-15 | No measurement | Labelled synthetic dev set + `npm run evaluate:skills` (precision/recall/F1, Wilson, kappa); results are for development only (synthetic) | `evaluationMetrics.test.js`; `docs/evaluation/` | **Partial:** real labelled data from workers is still needed before any result can be reported (academic honesty, `docs/evaluation/README.md`: synthetic data is not used to report results) |
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
| D-033 | Listen, Speak, See for people who read little | `features/assist/*`, `components/ui/Field.jsx` and controls, picture cards in `RadioCard.jsx` | `assist.test.jsx`, `assist-pictures.test.jsx`, `assist-pages.test.jsx`, `assistCoverage.test.jsx`, e2e `easy-mode.e2e.js` | Done (not yet tested with real workers: `docs/evaluation/EASY-MODE-USABILITY-PLAN.md`) |
| D-034 | Spoken help: recorded clip, then device voice, then text; Roman Urdu spoken in Urdu | `features/assist/{audio,useSay,voices,clipKeys}.js`, `public/sw.js`, `/dev/recorder` | `assist.test.jsx` "where the help sound comes from", `assistClips.test.js`, e2e Roman Urdu | Done (no clips recorded yet: team task) |
| D-035 | Voice typing policy; honest note; known limits | `features/assist/{assistRules,FieldAssist,VoiceNoticeDialog}.jsx` | `assist.test.jsx` "never voice typing for password, CNIC or email", e2e register by voice | Done |
| D-036 | Numbers by voice; voice check page | `utils/{spokenNumbers,numberWords}.js`, `pages/public/VoiceCheck.jsx` | `spokenNumbers.test.js` (incl. same words as the extractor), `assist-pages.test.jsx` voice check | Done |

## 7. The user's own requests (Batches 1–5)

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
| 5 | Listen: spoken help on every field and page, in Urdu and English | D-033, D-034 | `assistCoverage.test.jsx` (13 form pages, every field), `assist-pages.test.jsx` | Done (sound itself checked by hand: `docs/EASY-MODE-MANUAL-TEST.md`) |
| 5 | Speak: voice typing where safe, never password, CNIC or email; numbers by voice; read-back | D-035, D-036 | `assist.test.jsx`, `spokenNumbers.test.js`, e2e `easy-mode.e2e.js` | Done (microphone checked by hand) |
| 5 | See: picture choices, icons on fields and buttons, status never colour alone | D-033 | `assist-pictures.test.jsx`, `assist-pages.test.jsx` (Find workers) | Done |
| 5 | Recorded clips by the team; recorder, guide, offline | D-034, `docs/audio/RECORDING-GUIDE.md` | `assistClips.test.js` | Tools done; recording is the team's task (97 Urdu clips) |
| 5 | New texts reviewed by the team | `docs/i18n/REVIEW-BATCH-5.md` (152 rows) | `assistCoverage.test.jsx` (same keys in en, ur, ur-Latn) | Waiting for the team's review (D-031) |

## Proposal: Module 4 — Reputation and Reliability Engine (Batch 6, 17 Nov 2026)

| # | Requirement (proposal text) | Where implemented | How verified | Status |
|---|---|---|---|---|
| M4.a | Collection of customer ratings and reviews after completed work | Work Booking `models/Booking.js`, `services/booking/*`, `controllers/bookingsController.js` (D-037, D-039); reviews `models/Review.js`, `controllers/reviewsController.js` (D-041); screens `pages/customer/{RequestWorker,MyBookings,RateWork}.jsx`, `pages/booking/BookingDetail.jsx`, `pages/worker/{Requests,MyJobs,MyReviews}.jsx` | `integration/bookings.test.js` (state machine, ownership, limits, sweep, disputes), `integration/reviews-reputation.test.js` "review rules…", `unit/bookingRules.test.js`; `module4.test.jsx` "Rate this work…"; e2e `module4.e2e.js` "request -> hear and accept -> … -> rate" | Done |
| M4.b | Calculation of worker reputation based on work-related records | `services/reputation/reputationEngine.js` (weighted Beta, D-043, D-044), `snapshot.js`, `recompute.js` (D-047), `config/reputationParams.js` (D-048) | `unit/reputationEngine.test.js` (every hand-worked example, property tests), `reputationSensitivity.test.js`; `reviews-reputation.test.js` "the snapshot is rebuilt after every trigger", "every public rating number equals…"; evaluation `npm run evaluate:reputation` (SIMULATION only, D-038, D-058) | Done (limit: the simulation shows the provisional parameters do not beat simple baselines overall, MODULE-4.md §5.3) |
| M4.c | Maintenance of reliability indicators such as completed jobs and cancellations | `services/reputation/reliabilityEngine.js` (D-046) from booking outcomes (D-040); early/late cancellation, no-show, small dispute step (D-049, D-050, D-053) | `unit/reliabilityEngine.test.js` (hand-worked, property tests); `bookings.test.js` "a worker cancelling…early…late", "no-show…", "cancellation fault…"; e2e `module4.e2e.js` "a late cancellation…", "a no-show is reported…" | Done |
| M4.d | Display of relevant reputation information on worker profiles | `features/reputation/{ReputationPanel,RatingBadge,ReviewList,WorkHistoryList}.jsx` in the public profile and "See what customers see"; directory card; compare; `pages/worker/MyReputation.jsx`; admin Reputation tab | `module4.test.jsx` "Public reputation… never the numbers", "the percentage rule", "My reputation…"; `reviews-reputation.test.js` "public profile shows words and counts, never the numbers"; `reputation-honesty.test.jsx`; e2e `module4.e2e.js`; axe `quality.e2e.js` | Done |
| M4.e | Use of verified work history as supporting information for future matching | Verified work history (`GET /api/workers/:code/work-history`, "Done through this platform"); `toMatchingSignals` + `docs/contracts/MATCHING-INPUTS.md`; "Best track record" sort and "Has done jobs" filter (D-045) | `reliabilityEngine.test.js` "toMatchingSignals…"; `reviews-reputation.test.js` "verified work history…", "Best track record…"; e2e `module4.e2e.js` "Best track record sort…" | Done (Module 7 will use the signals) |

### Batch 6 decisions

| Decision | Where | Checked by |
|---|---|---|
| D-037 minimal Work Booking (supervisor approval, reported 16 Nov 2026) | `models/Booking.js`, `services/booking/transitions.js` | `bookings.test.js` |
| D-038 evaluation by simulation (supervisor approval, reported 16 Nov 2026) | `evaluation/reputation/` | `reputationEvaluation.test.js`; results in `evaluation/reputation/results/` |
| D-039 completion by both sides / auto / admin | `bookingsController.confirmDone`, `sweep.js` | `bookings.test.js` "accept -> contact shared; both…", "auto-completion…" |
| D-040 outcomes; declining never counts | `reliabilityEngine.js`, `transitions.cancelOutcome` | `reliabilityEngine.test.js` property tests; `reviews-reputation.test.js` "declining never counts" |
| D-041 reviews once, never edited; contact-info check | `reviewsController.createReview`, `contactInfo.js` | `reviews-reputation.test.js`, `bookingRules.test.js` |
| D-042 per-request sweep + daily cron | `sweep.js`, `cronController.js`, `vercel.json` | `bookings.test.js` sweep and cron tests, `module4-config.test.js` |
| D-043 / D-044 weighted Beta model and its weights | `reputationEngine.js` | `reputationEngine.test.js` |
| D-045 cautious for ordering; Best track record | `workersController.trackRecordPage` | `reviews-reputation.test.js` "Best track record…" |
| D-046 reliability record | `reliabilityEngine.js` | `reliabilityEngine.test.js` |
| D-047 snapshot parts and triggers | `snapshot.js`, `recompute.js`, `PUBLIC_*_FIELDS` | `reviews-reputation.test.js` |
| D-048 provisional parameters and their tests | `config/*Params.js`, `config/bookingRules.js`, sensitivity, explore | `reputationSensitivity.test.js` |
| D-049 / D-050 / D-053 dispute rules | `transitions.canDo`, `disputeResult` | `bookingRules.test.js`, `bookings.test.js` |
| D-051 flags never punish | `patternCheck.js`, `adminReputationController.decideFlag` | `reviews-reputation.test.js` flag tests |
| D-052 phone numbers through the booking only | `services/booking/contact.js` | `bookings.test.js` "phone numbers (D-002)…" |
| D-054 request limits, BOOKING_SELF | `bookingsController.createBooking` | `bookings.test.js` "limits…", "BOOKING_SELF…" |
| D-055 the name `depth` | engines, texts | backend and frontend honesty tests |
| D-056 the honesty test change | `frontend/src/test/honesty.test.js` | that test and `reputation-honesty.test.jsx` |
| D-057 customer notifications via a menu link; three tests updated | `navLinks.js`, `NotificationsCount.jsx` | `module4.test.jsx` "customers have notifications too…", `app-batch4.test.jsx` (unchanged bell test) |
| D-058 the simulation finding; nothing tuned | `docs/modules/MODULE-4.md` §5 | the committed `SIMULATION-*.json` files |

### Batch 6B (17 Nov 2026): header, install, rep-2

| Item | Where | Checked by |
|---|---|---|
| D-059 header collapses in a measured order; popovers stay inside the window | `components/layout/{headerFit.js,useStayInView.js,AppHeader.jsx,LanguageChoice.jsx}` | `header-fit.test.jsx`; e2e `header-fit.e2e.js` (4 roles × en/ur × 10 widths, axe) |
| D-060 one install service; invitation; footer button on every page | `features/app/install/*`, `features/app/InstallHint.jsx`, `components/layout/Footer.jsx` | `install.test.jsx` (platforms, installed, prompt once, 14 days, second page, iOS steps, every route); e2e `install.e2e.js` (axe); manual `docs/INSTALL-MANUAL-TEST.md` |
| D-061 to D-064 rep-2: recency off, new-reviewer budget, burst check, platform prior, rank by expected | `config/reputationParams.js` (`rep2Params`, `REP2_SELECTED`), `services/reputation/{reputationEngine,recompute,snapshot,matchingSignals}.js` | `reputationEngineRep2.test.js` (11 hand-worked cases, property tests per candidate), `reliabilityEngine.test.js` (rep-2 snapshot) |
| D-065 pre-registered protocol; S1-S3; rep-2 live | `evaluation/reputation/{selectRep2,rep2Criteria,evaluate}.js`, README "rep-2 protocol"; results `SIMULATION-rep2-*` | `reputationRep2Evaluation.test.js` (rule, guard, criteria, scenarios); commits b4b4b09 → d634b3f → fd946a2 → f063aa4 |
| D-066 public depth from visible reviews; rules from the parameters | `snapshot.publicDepth`, `services/reputation/rules.js`, `GET /api/meta/reputation-rules`, `MyReputation.jsx`, `HelpCentre.jsx` | `reliabilityEngine.test.js`, `reputationRules.test.js`, `reputation-rep2.test.jsx`, `reviews-reputation.test.js` |
