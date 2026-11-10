# Changelog

What changed in each phase. Test results are copied from real runs only.

## Batch 3 — browser tooling, Step 3 and voice fixes, three languages, design v2, profile view/edit (10 Nov 2026)

Instructions: `BATCH_3_PROMPT.md`. Decisions recorded: D-017 theme (Emerald Night), D-018 logo (Stitched
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

Instructions: `BATCH_2_PROMPT.md`. Decisions recorded: D-013 evidence storage, D-014 skill confidence
method and provisional weights, D-015 review states and deletion rules, D-016 upload processing and
duplicates. `CLAUDE.md` gained the rule "Reporting to the user".

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

Instructions: `BATCH_1_PROMPT.md`. Decisions recorded: D-008 (reason for the category split),
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
- Phone-number decision recorded (D-002) in `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md`, `docs/DECISIONS.md`.
- `.devcontainer/init-firewall.sh`: `fastdl.mongodb.org` added to the allowed domains.
- `docs/SECURITY.md` created with incident INC-001 (stolen Vercel token, 8–9 Nov 2026).
- `docs/DECISIONS.md` created (D-001 MERN only, D-002 phone hidden, D-003 Node 24, D-004 nodemon advisory).
