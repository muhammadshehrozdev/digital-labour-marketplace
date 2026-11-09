# API reference (after Batch 2, 9 Nov 2026)

Base path `/api`. Locally the browser calls `http://127.0.0.1:5173/api/...` and Vite forwards to the
backend on `http://127.0.0.1:5000`. Bodies are JSON, except the evidence upload (multipart form).

**Examples** below are real responses captured from the local preview on 9 Nov 2026 with
**synthetic** accounts (ids and dates will differ on your computer; long values shortened with …).

## Conventions

- **Login:** register/login set the HttpOnly cookie `dlm_session` (8 hours, `Secure; SameSite=Strict;
  Path=/api`). No token is ever in a response body. Every protected route checks the cookie and the
  role on the server.
- **CSRF:** POST/PUT/PATCH/DELETE must come from an origin in `CLIENT_ORIGIN` (otherwise 403).
- **Validation:** every body, query and URL parameter is checked with a strict schema; unknown keys → 400.
- **Errors:** always `{ "message": "..." }`; validation errors also carry `errors: [{ field, message }]`.
  A 500 never contains internal details.

| Code | Meaning |
|---|---|
| 400 | Invalid input (unknown key, wrong type, out of range, no body, wrong file type, invalid transition) |
| 401 | Not logged in, session expired or logged out, wrong email/password |
| 403 | Wrong role, or request from another website (CSRF check) |
| 404 | Not found (also used when a worker asks for another worker's evidence, so existence is not revealed) |
| 409 | Duplicate (email, CNIC, same photo for the same skill) or changed meanwhile (identity/evidence race) |
| 413 | Body too large (JSON over 100 kb; photo over 4 MB) |
| 429 | Too many failed login/register attempts, or too many uploads, from this network (15 minutes) |
| 503 | Database unreachable |

---

## Public

### GET /api/health
`200 {"ok":true,"db":"connected"}` — answers even when the database is down (then `db` is not `connected`).

### GET /api/meta/taxonomy
The one list of categories and skills (no matching terms).
```json
{"version":"2026-11-09-v1",
 "categories":[{"id":"electrical_solar","label":"Electrical & Solar","occupation":"Electrician","iscoCode":null}, …],
 "skills":[{"id":"elec_general","name":"General electrical work","category":"electrical_solar"}, …],
 "availability":["Available","Busy","Offline"]}
```

## Auth

| Method | Path | Who | Body | Success |
|---|---|---|---|---|
| POST | `/api/auth/register` | anyone | `{ name, email, password, phone, role? }` role `worker` (default) or `customer` only; password 15+ characters, ≤ 72 bytes | 201 user + cookie |
| POST | `/api/auth/login` | anyone | `{ email, password }` | 200 user + cookie |
| GET | `/api/auth/me` | logged in | — | 200 user |
| POST | `/api/auth/logout` | anyone | — | 200; ends every session of this user |

```json
// POST /api/auth/register -> 201
{"_id":"6af1f57b…514","name":"Example Worker (synthetic)","email":"docs.example…@example.com","phone":"03000000031","role":"worker"}
// POST /api/auth/register with role "admin" (and a 1-letter name) -> 400
{"message":"name: Name must be at least 2 characters; role: Role must be worker or customer",
 "errors":[{"field":"name","message":"Name must be at least 2 characters"},{"field":"role","message":"Role must be worker or customer"}]}
// POST /api/auth/login with a wrong password -> 401 (same message for an unknown email)
{"message":"Email or password is incorrect. After 5 wrong tries, login is paused for 15 minutes."}
```
Errors: 400 invalid input, 409 email already registered, 429 too many failed attempts.

## Worker profile (Module 1)

### GET /api/workers/me — worker
Own full profile (404 until created). Never contains CNIC data, only `cnicOnFile: true|false`.
Fields: `_id, user{name,email,phone,role}, workerIdCode, occupation, category, skills[], experienceYears,
hourlyRate, dailyRate, city, address, whatsappNumber, emergencyContact, cnicOnFile, languages, availability,
verificationStatus, identityNote, identityReviewedBy, identityReviewedAt, bio, workHistory[], profileCompletion,
onboardingCompletedAt, lastExtractedAt, createdAt, updatedAt`.

### PUT /api/workers/me — worker
Any of: `name, phone, occupation, category (taxonomy id), experienceYears (0–60, whole), hourlyRate,
dailyRate (0–1,000,000), city, address, whatsappNumber, emergencyContact, cnicNumber (#####-#######-#),
languages[], availability, bio, workHistory[{ jobTitle, clientOrEmployer, duration, description }]`.
Other keys (including `skills`) → 400. A new CNIC sets identity to `Pending` (audited); a CNIC already
used by another account → 409.
```json
// PUT {"occupation":"Plumber","category":"plumbing_sanitary","experienceYears":5,"hourlyRate":600} -> 200
{"message":"Profile saved.","profile":{…},"onboarding":{"steps":{"about":true,"work":true,"skills":false},"nextStep":"skills","complete":false,"completedAt":null}}
// PUT {"hourlyRate":-500} -> 400
{"message":"hourlyRate: Hourly rate cannot be negative","errors":[{"field":"hourlyRate","message":"Hourly rate cannot be negative"}]}
```

### GET /api/workers/me/onboarding — worker
Progress derived from saved data (D-011).
`200 {"steps":{"about":false,"work":false,"skills":false},"nextStep":"about","complete":false,"completedAt":null}`

## Skills (Module 2) — worker only

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/workers/me/skills/extract` | `{ text (1–2,000), inputMode?: "text"\|"voice" }` | **Saves nothing.** Rule-based suggestions |
| GET | `/api/workers/me/skills` | — | `{ skills, onboarding }` |
| POST | `/api/workers/me/skills` | `{ skillIds[1–30], addedVia: "extractor"\|"manual", sourceText? }` | 201 added / 200 nothing new; unknown id → 400; max 40 |
| POST | `/api/workers/me/skills/custom` | `{ name (2–60), category }` | clearly marked `custom: true`; max 10 |
| DELETE | `/api/workers/me/skills/:skillId` | — | 404 if not on profile; **409 if the skill has reviewed proof** (approved, revoked or suspected fake); pending/rejected proof is deleted with it |

```json
// POST /extract {"text":"Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon"} -> 200
{"skills":[{"skillId":"plumb_general","name":"General plumbing work","category":"plumbing_sanitary","matched":["plumbing"],"alreadySaved":false},
           {"skillId":"plumb_pipe","name":"PPRC and uPVC pipe fitting","category":"plumbing_sanitary","matched":["pprc","pipe fitting","pipe"],"alreadySaved":false}, …],
 "categories":[{"id":"plumbing_sanitary","label":"Plumbing & Sanitary","matched":["plumbing","pprc","pipe fitting","pipe","geyser"],"skillIds":[…]}],
 "suggestedCategory":"plumbing_sanitary","categoryTie":false,"suggestedOccupation":"Plumber",
 "experience":{"years":5,"months":0},"experienceNote":null,"noSkillReason":null,"method":"rule-based word list"}
// POST /skills {"skillIds":["plumb_pipe","plumb_geyser"],"addedVia":"extractor"} -> 201
{"skills":[{"skillId":"plumb_pipe","name":"PPRC and uPVC pipe fitting","category":"plumbing_sanitary","addedVia":"extractor","custom":false,"addedAt":"…",
            "evidenceSummary":{"status":"self_declared","approved":0,"pending":0,"strength":"none","updatedAt":null}}, …],
 "onboarding":{"steps":{"about":true,"work":true,"skills":true},"nextStep":null,"complete":true,"completedAt":"…"}}
// POST /skills {"skillIds":["rocket_science"],"addedVia":"manual"} -> 400
{"message":"skillIds.0: Unknown skill. Choose a skill from the list.", "errors":[…]}
```
`evidenceSummary.status`: `self_declared | evidence_pending | verified | disputed`;
`strength`: `none | weak | moderate | strong` (D-014). No numbers are sent to workers or customers.

## Evidence (Module 3) — worker routes

### POST /api/evidence — worker (multipart form)
Fields: `image` (one file), `skillId` (one of my skills), `type` (`certificate | work_photo |
reference_letter`), `title?` (≤ 80), `consent` = `"true"`. The real type is read from the bytes (JPEG, PNG,
WebP); the photo is auto-rotated, fitted inside 2000 × 2000, saved as WebP, metadata (EXIF/GPS) removed.
```json
// 201
{"evidence":{"_id":"6af1f57c…517","skillId":"plumb_pipe","skillName":"PPRC and uPVC pipe fitting","type":"work_photo","title":"PPRC line in a kitchen",
             "status":"pending","reasonCode":null,"reviewNote":"","width":64,"height":48,"size":678,"createdAt":"…","reviewedAt":null},
 "skill":{"skillId":"plumb_pipe","evidenceSummary":{"status":"evidence_pending","approved":0,"pending":1,"strength":"none","updatedAt":"…"}}}
// a PDF -> 400
{"message":"PDF files are not accepted. Please upload a JPG or PNG photo of the document."}
```
| Error | When |
|---|---|
| 400 `Please upload a JPG or PNG photo.` | HEIC/HEIF/AVIF/GIF/BMP/TIFF |
| 400 `This file is not a photo. Please upload a JPG or PNG photo.` | any non-image bytes (even if named .jpg) |
| 400 `The photo could not be read…` / `…too many pixels…` | corrupt file / over 50 megapixels |
| 400 | no consent, no photo, unknown type, a skill not on my profile, 5 per skill or 30 per worker reached |
| 409 `You already uploaded this photo for this skill.` | same processed photo (SHA-256) for the same skill |
| 413 `The photo is too large. The limit is 4 MB.` | file over 4 MB |
| 429 | over 30 uploads per 15 minutes from one network |

The same photo (or a look-alike, dHash) from **another** worker is accepted (201) and flagged for the
admin (`possibleDuplicateOf`); the worker is not told.

### GET /api/evidence/mine?skillId= — worker
Metadata only (never bytes, hashes or duplicate links): `{"evidence":[{ _id, skillId, skillName, type, title,
status, reasonCode, reviewNote, width, height, size, createdAt, reviewedAt }]}`.

### GET /api/evidence/:id/file — the owner or an admin
The processed image: `Content-Type: image/webp`, `X-Content-Type-Options: nosniff`,
`Cache-Control: private, no-store`. Another worker → 404; a customer → 403
(`{"message":"You do not have permission for this action."}`).

### DELETE /api/evidence/:id — owner
Only `pending` or `rejected` items (file bytes are deleted too; audited). `suspected_fake` → 409
("…cannot be deleted…"); `approved`/`revoked` → 409. Another worker's item → 404.

## Customer directory

### GET /api/workers — customer, admin
Query: `search` (≤ 50, in occupation, skill names, bio), `city` (≤ 50), `category` (`All` or id),
`availability`, `identity` (`all|verified`), `skills` (`all|verified` = at least one skill verified by
evidence), `page`, `limit` (≤ 50). Lists only workers who finished "Your work". Public fields only.
```json
{"workers":[{"_id":"6af1f57c…515","user":{"name":"Example Worker (synthetic)"},"occupation":"Plumber","category":"plumbing_sanitary",
  "skills":[{"skillId":"plumb_pipe","name":"PPRC and uPVC pipe fitting","category":"plumbing_sanitary","custom":false,
             "evidenceSummary":{"status":"verified","approved":1,"strength":"moderate"}}, …],
  "experienceYears":5,"hourlyRate":600,"dailyRate":0,"city":"Rawalpindi","languages":["Urdu"],"availability":"Available",
  "verificationStatus":"Unverified","bio":"","profileCompletion":75,"workerIdCode":"DLM-2026-000004"}],
 "page":1,"limit":1,"total":1}
```
Never: phone, WhatsApp, email, address, emergency contact, CNIC data, evidence images, file ids, hashes, numbers.

### GET /api/workers/:workerIdCode — customer, admin
Same public fields plus `workHistory[{ jobTitle, duration, description }]` (no client name). 404 if unknown.

## Admin (every route: admin only; others 403)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/stats` | `{"workers":{"total":5,"Unverified":2,"Pending":2,"Verified":1,"Rejected":0},"users":{"worker":7,"customer":1,"admin":1},"evidence":{"total":4,"pending":0,"approved":2,"rejected":1,"suspected_fake":1,"revoked":0}}` (local example) |
| GET | `/api/admin/workers` | `status`, `q` (name/ID/occupation), `page`, `limit`; contact details; CNIC only as `cnicOnFile` |
| PATCH | `/api/admin/workers/:id/identity` | `{ status: "Verified"\|"Rejected", note (5–500) }`; Verified needs a CNIC; stale → 409; audited |
| GET | `/api/admin/workers/:id/cnic` | `{ cnic }`, `no-store`; audit entry written first |
| GET | `/api/admin/users` | users without passwords |
| GET | `/api/admin/audit` | `action`, `from`, `to` (YYYY-MM-DD), `page`, `limit`; newest first; no hashes; read-only |
| GET | `/api/admin/evidence` | `status` (default `pending`; `all`), `type`, `skillId`, `duplicates=true`, `page`, `limit`; pending oldest first |
| GET | `/api/admin/evidence/:id` | item + `duplicate` (the other item) + `opinion` (b, d, u, E) |
| PATCH | `/api/admin/evidence/:id` | `{ action, reasonCode?, note? }` (below) |

### Evidence decisions (D-015)
| action | from | needs | to |
|---|---|---|---|
| `approve` | pending | — | approved |
| `reject` | pending | `reasonCode`: `unclear \| not_relevant \| wrong_skill \| other` (`other` also needs a note) | rejected |
| `suspected_fake` | pending, approved | `note` (5–500) | suspected_fake |
| `revoke` | approved | `note` (5–500) | revoked |

Any other transition → 400; a race (status changed since it was read) → 409; every decision is audited
(`evidence.approved`, `evidence.rejected`, `evidence.suspected_fake`, `evidence.revoked`).
```json
// PATCH {"action":"approve"} -> 200
{"evidence":{…,"status":"approved","allowedActions":["suspected_fake","revoke"]},
 "skill":{"skillId":"plumb_pipe","evidenceSummary":{"status":"verified","approved":1,"pending":0,"strength":"moderate","updatedAt":"…"}},
 "opinion":{"method":"Beta evidence counting in subjective-logic form (W = 2, a = 0.5); provisional weights: certificate 2, work photo 1, reference letter 1, suspected fake 1 (D-014)",
            "r":1,"s":0,"belief":0.333,"disbelief":0,"uncertainty":0.667,"expected":0.667,"status":"verified","strength":"moderate",
            "counts":{"approved":1,"pending":0,"rejected":0,"suspectedFake":0,"revoked":0}}}
// PATCH {"action":"reject"} -> 400
{"message":"reasonCode: A reason is required to reject","errors":[{"field":"reasonCode","message":"A reason is required to reject"}]}
// PATCH {"action":"approve"} on an approved item -> 400
{"message":"You cannot approve an item that is approved."}
```
```json
// GET /api/admin/audit?limit=2 -> 200
{"entries":[{"seq":14,"actor":{"name":"Demo Admin (synthetic)"},"actorRole":"admin","action":"evidence.approved","targetType":"Evidence","targetId":"6af1f57c…517",
             "fromState":"pending","toState":"approved","reason":null,"details":{"skillId":"plumb_pipe","reasonCode":null},"createdAt":"…"}, …],
 "total":14,"page":1,"limit":2,"actions":["admin.created","cnic.reveal","cnic.updated","evidence.approved","evidence.rejected","evidence.suspected_fake","evidence.uploaded","identity.decision"]}
```

## Removed earlier
Phase 3: `/auth/*` and `/worker/*` without `/api`, `/api/worker/profile`, `/api/worker/all`,
`/api/worker/verify/:id`, `/api/worker/admin/users`. Batch 1: `/api/worker/ai-skill-profiler`,
`/api/worker/ai-skill-profiler/reset`, `/api/worker/add-recommended-skill`.

## Backend scripts (run in `.\backend`)

| Command | What it does |
|---|---|
| `npm run create-admin -- --name "…" --email … --phone 03…` | The only way to create an admin (audited) |
| `npm run list-admins` | Read-only list of admins |
| `npm run audit:verify` | Read-only check of the audit log hash chain |
| `npm run confidence:sensitivity` | Prints how the skill score changes with other weights (formula outputs) |
| `npm run evaluate:skills -- --file <dataset>` / `npm run agreement:skills -- --a <f> --b <f>` | Module 2 evaluation (`docs/evaluation/`) |
| `npm run migrate:cnic` / `migrate:categories` / `migrate:skills` | Dry run unless `-- --apply`; local only unless `--allow-remote` |
| `npm run db:local`, `npm run seed:local` | Local preview database and synthetic demo accounts (dev container) |
