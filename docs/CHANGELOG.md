# Changelog

What changed in each phase. Test results are copied from real runs only.

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
