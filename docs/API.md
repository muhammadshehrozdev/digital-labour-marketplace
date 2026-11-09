# API (state after Batch 1 / Phase 4, 9 Nov 2026)

Base path: `/api`. Locally the browser calls `http://127.0.0.1:5173/api/...` and Vite forwards
to the backend on `http://127.0.0.1:5000`. Request and response bodies are JSON.

**Login:** a successful register/login sets the HttpOnly cookie `dlm_session` (8 hours). The
browser sends it automatically; there is no token in any response body.
**CSRF:** POST/PUT/PATCH/DELETE must come from an origin in `CLIENT_ORIGIN` (else 403).
**Errors:** always `{ "message": "..." }`; validation errors (400) also have
`errors: [{ field, message }]`. A 500 never contains internal details.

| Code | Meaning |
|---|---|
| 400 | Invalid input (unknown keys, wrong types, out of range, no body) |
| 401 | Not logged in, session expired or logged out, or wrong email/password |
| 403 | Logged in but wrong role, or request from another website (CSRF check) |
| 404 | Not found |
| 409 | Duplicate (email, CNIC) or the record changed meanwhile |
| 413 | Body larger than 100 kb |
| 429 | Too many failed login/register attempts from this network (15 minutes) |
| 503 | Database unreachable |

## Public

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ ok: true, db: "connected" }` (works even if the DB is down) |
| GET | `/api/meta/taxonomy` | `{ version, categories: [{ id, label, occupation, iscoCode }], skills: [{ id, name, category }], availability }` (no matching terms) |

## Auth

| Method | Path | Who | Body / result |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | `{ name, email, password, phone, role? }` — role `worker` (default) or `customer` only. Password ≥ 15 characters, ≤ 72 bytes. 201 → `{ _id, name, email, phone, role }` + cookie. Duplicate email → 409 |
| POST | `/api/auth/login` | anyone | `{ email, password }` → 200 user + cookie. Wrong → 401 "Email or password is incorrect…". 5 wrong → account paused 15 minutes |
| GET | `/api/auth/me` | logged in | `{ _id, name, email, phone, role }` |
| POST | `/api/auth/logout` | anyone | Ends every session of this user on the server and clears the cookie |

## Workers

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/workers/me` | worker | Own full profile (404 if not created yet). Never includes CNIC data; `cnicOnFile: true/false` |
| PUT | `/api/workers/me` | worker | Any of: `name, phone, occupation, category (taxonomy id), experienceYears (0–60, whole), hourlyRate, dailyRate (0–1,000,000), city, address, whatsappNumber, emergencyContact, cnicNumber (#####-#######-#), languages[], availability, bio, workHistory[{ jobTitle, clientOrEmployer, duration, description }]`. Other keys (including `skills`) → 400. New CNIC → identity `Pending`; CNIC used by another account → 409. Response: `{ message, profile, onboarding }` |
| GET | `/api/workers/me/onboarding` | worker | `{ steps: { about, work, skills }, nextStep: "about"\|"work"\|"skills"\|null, complete, completedAt }`, derived from saved data (D-011) |
| GET | `/api/workers` | customer, admin | Query: `search` (≤ 50), `city` (≤ 50), `category` (`All` or id), `availability`, `identity` (`all`/`verified`), `page`, `limit` (≤ 50). → `{ workers, page, limit, total }`. Public fields only; user = `{ name }`. No phone, WhatsApp, email, address, emergency contact or CNIC. Lists only workers who finished "Your work"; `search` looks in occupation, skill names and bio |
| GET | `/api/workers/:workerIdCode` | customer, admin | One public profile (+ work history without the client name) |

## Module 2 — skills (worker only)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/workers/me/skills/extract` | `{ text (1–2,000 characters), inputMode?: "text"\|"voice" }` → suggestions from the rule-based extractor: `{ skills: [{ skillId, name, category, matched[], alreadySaved }], categories: [{ id, label, matched[], skillIds[] }], suggestedCategory, categoryTie, suggestedOccupation, experience: { years, months }\|null, experienceNote, noSkillReason, method }`. **Saves nothing.** No confidence, level or score |
| GET | `/api/workers/me/skills` | `{ skills, onboarding }` |
| POST | `/api/workers/me/skills` | `{ skillIds: [taxonomy ids] (1–30), addedVia: "extractor"\|"manual", sourceText? }` → 201 (added) / 200 (all already there). Unknown id → 400. Adding twice keeps one copy. Max 40 skills |
| POST | `/api/workers/me/skills/custom` | `{ name (2–60), category }` → a clearly marked custom skill (`custom: true`, id `custom-<slug>`). Max 10 |
| DELETE | `/api/workers/me/skills/:skillId` | Removes one skill only; unknown → 404 |

Skill object: `{ skillId, name, category, addedVia, custom, addedAt }`. Customers see
`{ skillId, name, category, custom }`.

## Admin (every route: admin only)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/workers` | Query `status` (`All`/`Unverified`/`Pending`/`Verified`/`Rejected`), `q` (name, worker ID or occupation, ≤ 50), `page`, `limit` (≤ 100). Contact details included; CNIC never (only `cnicOnFile`) |
| PATCH | `/api/admin/workers/:id/identity` | `{ status: "Verified" \| "Rejected", note }` (note 5–500 characters). Verified needs a CNIC on file. Stale status → 409. Audited |
| GET | `/api/admin/workers/:id/cnic` | `{ cnic: "12345-1234567-1" }`, `Cache-Control: no-store`. Writes an audit entry first (without the number) |
| GET | `/api/admin/users` | `[{ name, email, phone, role, createdAt, lockUntil }]` |
| GET | `/api/admin/stats` | `{ workers: { total, Unverified, Pending, Verified, Rejected }, users: { worker, customer, admin } }` |
| GET | `/api/admin/audit` | Query `action` (e.g. `identity.decision`), `from`, `to` (`YYYY-MM-DD`), `page`, `limit` (≤ 100) → `{ entries (newest first, no hashes), total, page, limit, actions }`. Read-only |

Removed in Batch 1 (Phase 4): `POST /api/worker/ai-skill-profiler`, `DELETE /api/worker/ai-skill-profiler/reset`,
`POST /api/worker/add-recommended-skill` (the old profiler now lives only in
`backend/evaluation/baselines/legacyProfiler.js`, as the evaluation baseline).

Removed in Phase 3: `/auth/*` and `/worker/*` without `/api`, `GET /api/worker/profile`,
`POST /api/worker/profile`, `GET /api/worker/all`, `PUT /api/worker/verify/:id`,
`GET /api/worker/admin/users`.

## Backend scripts (run in `.\backend`)

| Command | What it does |
|---|---|
| `npm run create-admin -- --name "…" --email … --phone 03…` | The only way to create an admin. Asks for the password (hidden). Audited |
| `npm run list-admins` | Read-only list of admin accounts |
| `npm run audit:verify` | Read-only check of the audit log hash chain |
| `npm run migrate:cnic` / `migrate:categories` / `migrate:skills` | Dry run; add `-- --apply` to write. Refuses non-local databases unless `--allow-remote` |
| `npm run evaluate:skills -- --file <dataset>` | Module 2 evaluation (precision/recall/F1, intervals, ablation, baselines) — see `docs/evaluation/` |
| `npm run agreement:skills -- --a <file> --b <file>` | Cohen's kappa and Krippendorff's alpha between two annotators |
| `npm run db:local`, `npm run seed:local` | Local preview database and synthetic demo accounts |
