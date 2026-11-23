# API reference (Batch 3, updated 10 Nov 2026)

Base path `/api`. Locally the browser calls `http://127.0.0.1:5173/api/...` and Vite forwards to the
backend on `http://127.0.0.1:5000`. Bodies are JSON, except the evidence upload (multipart form).

**Examples** below are real responses captured from the local preview on 9 Nov 2026 (Batch 3
examples: 10 Nov 2026) with **synthetic** accounts (ids and dates will differ on your computer; long values shortened with …).

## Conventions

- **Login:** register/login set the HttpOnly cookie `dlm_session` (8 hours, `Secure; SameSite=Strict;
  Path=/api`). No token is ever in a response body. Every protected route checks the cookie and the
  role on the server.
- **CSRF:** POST/PUT/PATCH/DELETE must come from an origin in `CLIENT_ORIGIN` (otherwise 403).
- **Validation:** every body, query and URL parameter is checked with a strict schema; unknown keys → 400.
- **Errors (Batch 3):** always `{ "code": "...", "message": "...", "params"?: {...} }`. `code` is a stable
  name from `backend/errors/catalog.js` (full list at the end of this file); `message` is the English text;
  `params` fills placeholders such as `{field}`, `{min}`, `{max}`. The website shows the text of `code` in the
  chosen language (English, Urdu, Roman Urdu) and uses `message` only as a fallback. Validation errors also
  carry `errors: [{ field, code, params, message }]`, and the top-level `code` is the first of them.
  A 500 never contains internal details (`SERVER_ERROR`).

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
`200 {"ok":true,"db":"connected"}`. The route runs **before** the database step (`requireDb`) and only **reports**
`dbState()`: it never opens a connection. So it proves that the function **starts**, not that the database works.
Right after a deploy, a fresh serverless function has not opened its connection yet and the answer is
`{"ok":true,"db":"disconnected"}` although Atlas is fine: that is normal (Batch 7, decision D-079).

**The database check is `GET /api/auth/session`** (it runs behind `requireDb`): `200 {"user":null}` for a visitor =
the database is reachable; `503 {"code":"SERVICE_UNAVAILABLE",…}` = it is not. `docs/DEPLOY-RUNBOOK.md` steps 4.8,
8.1 and 8.3 use both, in this order.

### GET /api/meta/reputation-rules (Batch 6B)
Public, no login, no database, no input (`Cache-Control: public, max-age=300`). The reputation rules of the
**live** engine as ids and numbers, generated from `backend/config/reputationParams.js`
(`services/reputation/rules.js`); the website words them (Help Centre guide, My reputation). Never a score.
```json
{"engineVersion":"rep-2","rankBy":"expected","newReviewerBudget":1,"burstCheck":true,"halfLifeDays":null,
 "lateCancelHours":24,
 "items":[{"id":"onlyCustomers","values":{}},{"id":"sameCustomer","values":{}},
          {"id":"newAccounts","values":{"budget":1}},{"id":"burst","values":{"days":14,"count":4}},
          {"id":"lateCancel","values":{"hours":24}}]}
```
`GET /api/workers/me/reputation` (worker) returns the same fields inside `rules`, next to `lateCancelHours`,
`earlyCancelCounts`, `lateCancelCounts`, `disputeWindowDays`. Per-review `reasons` may now also be
`new_reviewer_budget` and `burst` (rep-2); the snapshot carries `baseRate` and `engineVersion: "rep-2"`.

### GET /api/meta/taxonomy
The one list of categories and skills (no matching terms). Batch 3: each category and skill carries
`i18n` with the Urdu and Roman Urdu display names (`DISPLAY_NAMES` in `backend/config/skillTaxonomy.js`;
drafts, see `docs/i18n/REVIEW.md`).
```json
{"version":"2026-11-09-v1",
 "categories":[{"id":"electrical_solar","label":"Electrical & Solar","occupation":"Electrician","iscoCode":null,
   "i18n":{"ur":{"label":"بجلی اور سولر","occupation":"الیکٹریشن"},"ur-Latn":{"label":"Bijli aur Solar","occupation":"Electrician"}}}, …],
 "skills":[{"id":"elec_general","name":"General electrical work","category":"electrical_solar",
   "i18n":{"ur":"بجلی کا عام کام","ur-Latn":"Bijli ka aam kaam"}}, …],
 "availability":["Available","Busy","Offline"]}
```

## Auth

| Method | Path | Who | Body | Success |
|---|---|---|---|---|
| POST | `/api/auth/register` | anyone | `{ name, email, password, phone, role?, preferredLanguage? }` role `worker` (default) or `customer` only; password 15+ characters, ≤ 72 bytes; language `en`, `ur` or `ur-Latn` | 201 user + cookie |
| POST | `/api/auth/login` | anyone | `{ email, password }` | 200 user + cookie |
| GET | `/api/auth/session` | anyone | — | 200 `{ user }` or `{ user: null }` (never 401; a broken cookie is removed) |
| GET | `/api/auth/me` | logged in | — | 200 user |
| PATCH | `/api/users/me/preferences` | logged in (any role) | any of `{ preferredLanguage }` (`en`, `ur`, `ur-Latn`), `{ preferredTheme }` (`light`, `dark`, `system`), `{ preferredTextSize }` (`small`, `normal`, `large`); at least one | 200 with exactly the settings that were sent |
| POST | `/api/auth/logout` | anyone | — | 200; ends every session of this user |

The user object (register, login, session, me) has only `_id, name, email, phone, role, preferredLanguage,
preferredTheme, preferredTextSize, sessionExpiresAt` (the three settings are `null` until the user chooses;
`sessionExpiresAt` is when this login ends, 8 hours after logging in; the examples below were recorded in
Batch 3, before the Batch 4 fields were added).

Batch 4: a **suspended** account gets 403 `ACCOUNT_SUSPENDED` at login, only after the correct password (a
wrong password still gets the usual 401 `LOGIN_FAILED`), and every open session of that account ends.
```json
// POST /api/auth/register (customer, with "preferredLanguage":"ur") -> 201
{"_id":"6af2378c…24c","name":"Example Customer (synthetic)","email":"docs.batch3…@example.com","phone":"03000000032","role":"customer","preferredLanguage":"ur"}
// GET /api/auth/session without a cookie -> 200
{"user":null}
// GET /api/auth/session with the cookie -> 200
{"user":{"_id":"6af2378c…24c","name":"Example Customer (synthetic)","email":"docs.batch3…@example.com","phone":"03000000032","role":"customer","preferredLanguage":"ur"}}
// PATCH /api/users/me/preferences {"preferredLanguage":"ur-Latn"} -> 200
{"preferredLanguage":"ur-Latn"}
// PATCH /api/users/me/preferences {"preferredLanguage":"urdu"} -> 400
{"code":"LANGUAGE_INVALID","params":{"field":"Language","fieldKey":"preferredLanguage"},"message":"preferredLanguage: Language must be en, ur or ur-Latn",
 "errors":[{"field":"preferredLanguage","code":"LANGUAGE_INVALID","params":{"field":"Language","fieldKey":"preferredLanguage"},"message":"Language must be en, ur or ur-Latn"}]}
// POST /api/auth/register with role "admin", a 1-letter name and a short password -> 400 (shortened)
{"code":"TEXT_TOO_SHORT","params":{"field":"Name","fieldKey":"name","min":2},"message":"name: Name must be at least 2 characters; password: …; role: Role must be worker or customer",
 "errors":[{"field":"name","code":"TEXT_TOO_SHORT",…},{"field":"password","code":"PASSWORD_TOO_SHORT",…},{"field":"role","code":"ROLE_INVALID",…}]}
// POST /api/auth/login with a wrong password -> 401 (same answer for an unknown email)
{"code":"LOGIN_FAILED","message":"Email or password is incorrect. After 5 wrong tries, login is paused for 15 minutes."}
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

### GET /api/workers/me/full — worker (Batch 3, D-020)
Everything the read-only **My profile** page needs, in one call (`Cache-Control: no-store`):
`{ profile, evidence[], publicView, listedInDirectory, onboarding }`.
- `profile`: same as `GET /api/workers/me`. `evidence`: own proof items, metadata only (like `/api/evidence/mine`).
- `publicView`: built with the **same query and field list** as `GET /api/workers/:workerIdCode`, so
  "See what customers see" shows exactly what customers get (no phone, WhatsApp, email, address,
  emergency contact, CNIC, client names or evidence images).
- `listedInDirectory`: `true` once occupation and category are saved (the directory rule).
404 `PROFILE_NOT_CREATED` until a profile exists; customers 403; visitors 401.

Batch 4: the answer also has `strength`: `{ percent, level, checks, proof, tips }`. `percent` is the documented
completion checklist (20 base + trade 15 + experience and rate 15 + city and address 10 + contact 10 + skills 15 +
bio 5 + work history 10); `level` is `starting` (< 50), `good` (50–79), `strong` (80–99, or 100 with no approved
proof) or `complete` (100 and at least one skill with approved proof); `tips` are up to five next steps as
lower-case codes with params (for example `{ code: "add_proof", params: { skillId, skillName } }`). No hidden weights.

### GET /api/workers/me/onboarding — worker
Progress derived from saved data (D-011). `profileExists` (Batch 3) tells the website whether
`GET /api/workers/me` would answer 404, so a new worker's browser does not request it.
`200 {"steps":{"about":false,"work":false,"skills":false},"nextStep":"about","complete":false,"completedAt":null,"profileExists":false}`

## Skills (Module 2) — worker only

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/workers/me/skills/extract` | `{ text (1–2,000), inputMode?: "text"\|"voice" }` | **Saves nothing.** Rule-based suggestions |
| GET | `/api/workers/me/skills` | — | `{ skills, onboarding }` |
| GET | `/api/workers/me/skills/potential` | — | Batch 4, "You may also do…": `{ suggestions: [{ id, name, category, i18n, reason: "main_trade"\|"same_category" }] (≤ 8), method: "same trade category (rule-based)" }`. Skills of the worker's main trade category, then of the categories of skills already added, that are not on the profile. **Saves nothing**; the worker confirms with `POST …/skills` and `addedVia: "related"` |
| POST | `/api/workers/me/skills` | `{ skillIds[1–30], addedVia: "extractor"\|"manual"\|"related", sourceText? }` | 201 added / 200 nothing new; unknown id → 400; max 40 |
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
evidence), `hasJobs` (`true` = has done at least one job on this platform, Module 4), `sort` (Batch 4, below), `page`, `limit` (≤ 50). Lists only workers who finished "Your work" and whose
account is not suspended. Public fields only. The answer also repeats the `sort` that was used.

| `sort` | Order (documented sort keys; `_id` is always the last key, so pages are stable) |
|---|---|
| `updated` (default) | `updatedAt` newest first |
| `experience` | `experienceYears` highest first (workers without a number last), then `updatedAt` |
| `evidence` | `approvedEvidenceCount` highest first (the sum of approved proof items over all skills), then `updatedAt` |
| `track_record` (Module 4) | the reputation **cautious score** highest first (a worker with no snapshot counts as the no-review prior, 0.1300), then completed jobs, then `updatedAt`. Not the default: new workers appear lower (cold start, Pallais 2014; Module 7 handles fair exposure) |
```json
{"workers":[{"_id":"6af1f57c…515","user":{"name":"Example Worker (synthetic)"},"occupation":"Plumber","category":"plumbing_sanitary",
  "skills":[{"skillId":"plumb_pipe","name":"PPRC and uPVC pipe fitting","category":"plumbing_sanitary","custom":false,
             "evidenceSummary":{"status":"verified","approved":1,"strength":"moderate"}}, …],
  "experienceYears":5,"hourlyRate":600,"dailyRate":0,"city":"Rawalpindi","languages":["Urdu"],"availability":"Available",
  "verificationStatus":"Unverified","bio":"","profileCompletion":75,"workerIdCode":"DLM-2026-000004"}],
 "page":1,"limit":1,"total":1}
```
Never: phone, WhatsApp, email, address, emergency contact, CNIC data, evidence images, file ids, hashes, numbers.
Module 4 adds `reputation.public.{ratingAverage, reviewCount, depth, completedJobs}` to each card (or no
`reputation` at all for a worker who is new on this platform). Never `reputation.score` or `reputation.reliability`.

### GET /api/workers/:workerIdCode — customer, admin
Same public fields plus `workHistory[{ jobTitle, duration, description }]` (no client name) and the whole
`reputation.public` part of the snapshot (Module 4, below). 404 if unknown or if the worker's account is suspended.

### GET /api/workers/compare?ids=A,B[,C] — customer, admin (Batch 4)
Two or three different worker IDs, comma separated. Answers `{ workers: [public profile, …], missing: [ids] }`
in the order asked; an unknown, unlisted or suspended worker is reported in `missing`. Errors:
`COMPARE_NEEDS_TWO`, `COMPARE_MAX_THREE`, `COMPARE_SAME_WORKER`, `WORKER_ID_INVALID`.

## Saved workers (Batch 4) — customer only

| Method | Path | Notes |
|---|---|---|
| GET | `/api/saved` | `{ workers: [public card, …], total, max }`, newest first; suspended workers are left out |
| GET | `/api/saved/ids` | `{ ids: ["DLM-…"], max }` for the heart buttons |
| PUT | `/api/saved/:workerIdCode` | save; 201 the first time, 200 if already saved; at most 100 (`SAVED_LIMIT`) |
| DELETE | `/api/saved/:workerIdCode` | remove; 200 also when it was not saved |

A customer reads and changes only their own list. Workers and admins get 403.

## Notifications (Batch 4) — any logged-in user, own notifications only

Created by the server when the real event happens: `identity_verified`, `identity_rejected`,
`evidence_approved`, `evidence_rejected`, `evidence_suspected_fake`, `evidence_revoked`. The text is built by the
website from `type` + `params` (`skillId`, `skillName`, `evidenceId`, `reasonCode`, `note`; never a CNIC). Kept
180 days. The website asks for the count once a minute (no websockets).

| Method | Path | Notes |
|---|---|---|
| GET | `/api/notifications` | `page`, `limit` (≤ 50) → `{ notifications: [{ _id, type, params, read, createdAt }], unread, page, limit, total }` |
| GET | `/api/notifications/unread-count` | `{ unread }` |
| PATCH | `/api/notifications/:id/read` | `{ notification, unread }`; someone else's id → 404 `NOTIFICATION_NOT_FOUND` |
| POST | `/api/notifications/read-all` | `{ updated, unread: 0 }` |

## Admin (every route: admin only; others 403)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/stats` | `{"workers":{"total":5,"Unverified":2,"Pending":2,"Verified":1,"Rejected":0},"users":{"worker":7,"customer":1,"admin":1},"evidence":{"total":4,"pending":0,"approved":2,"rejected":1,"suspected_fake":1,"revoked":0}}` (local example) |
| GET | `/api/admin/workers` | `status`, `q` (name/ID/occupation), `page`, `limit`; contact details; CNIC only as `cnicOnFile` |
| PATCH | `/api/admin/workers/:id/identity` | `{ status: "Verified"\|"Rejected", note (5–500) }`; Verified needs a CNIC; stale → 409; audited |
| GET | `/api/admin/workers/:id/cnic` | `{ cnic }`, `no-store`; audit entry written first |
| GET | `/api/admin/users` | Batch 4: `q` (name, email, phone), `role`, `status` (`all\|active\|suspended`), `page`, `limit` → `{ users: [{ _id, name, email, phone, role, status, createdAt, lockedNow, suspendedAt, suspensionReason }], page, limit, total }` |
| GET | `/api/admin/users/:id` | `{ user, worker (summary + evidence counts) \| null, customer ({ savedWorkers }) \| null, activity (last 10 audit entries) }`; no CNIC, no address |
| PATCH | `/api/admin/users/:id/status` | `{ status: "suspended"\|"active", reason (5–300, no CNIC number) }`; not yourself (`CANNOT_SUSPEND_SELF`), not an admin (`CANNOT_SUSPEND_ADMIN`); same status → 409; ends every session of that user; audited (`user.suspended`, `user.reactivated`) |
| GET | `/api/admin/charts` | `days` (7–90, default 30) → `{ days, timezone: "Asia/Karachi", generatedAt, registrations: [{ date, worker, customer }] (every day present), identity: { counts, waiting }, evidence: { counts, waiting }, skillsByCategory: [{ category, count }] }`; `waiting` = `{ under1Day, days1to3, days4to7, over7Days, oldest }` |
| GET | `/api/admin/audit/verify` | the same check as `npm run audit:verify` → `{ ok, count, checkedAt }` or `{ ok: false, badSeq, problemCode: "entry_missing"\|"link_broken"\|"content_changed", problem }` |
| GET | `/api/admin/exports/:kind` | `kind`: `audit\|identity\|evidence\|users`; filters `status`, and for `audit` also `action`, `from`, `to`; a CSV file (UTF-8, at most 5,000 rows, headers `X-Export-Rows`, `X-Export-Truncated`); audited first (`export.downloaded`); never a CNIC; cells are protected against spreadsheet formulas |
| GET | `/api/admin/reason-templates` | `kind?` → `{ templates: [{ _id, kind, text: { en, ur, ur-Latn }, updatedAt }], max }` |
| POST | `/api/admin/reason-templates` | `{ kind, text: { en (5–300), ur?, ur-Latn? } }`; at most 60; audited |
| POST | `/api/admin/reason-templates/starter-set` | adds the starter sentences for kinds that have none; safe to repeat |
| PATCH / DELETE | `/api/admin/reason-templates/:id` | change the three texts (the kind is fixed) / delete; audited |
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

## Module 4: bookings, reviews and reputation (Batch 6)

Every body, query and URL parameter is checked by a strict zod schema (`backend/validators/bookings.js`;
unknown keys → 400 `UNKNOWN_FIELD`). Ownership is checked on the server: a booking is found only through a
filter with the logged-in user's own id, so someone else's booking answers **404** (not 403). Every step is a
conditional update on the state that was checked: a double tap or a stale screen gets **409**
`BOOKING_CHANGED`; a step that the state does not allow gets **400** `BOOKING_NOT_ALLOWED`. Every booking
read first applies the booking's due timers (the sweep). Text the other person reads (`area`,
`description`, review `comment`, reply `text`, dispute `note`) is refused with **400**
`TEXT_HAS_CONTACT_INFO` when it contains an email, a link, a CNIC-like number or 10 or more digits.

### Bookings (customer, worker)

| Method | Path | Who | Body / query and rules |
|---|---|---|---|
| POST | `/api/bookings` | customer | `{ workerIdCode, skillId, preferredDate: "YYYY-MM-DD", timeSlot: morning\|afternoon\|evening\|any, city, area (2–80), description? (≤ 500) }`. The skill must be the worker's (`BOOKING_SKILL_NOT_OFFERED`); the day today up to 30 days ahead in Pakistan time (`BOOKING_DATE_RANGE`); a suspended or unlisted worker → 409 `BOOKING_WORKER_UNAVAILABLE`; the same phone number on both sides → 400 `BOOKING_SELF`; at most 1 open request per pair (409 `BOOKING_LIMIT_PAIR`), 5 open per customer (409 `BOOKING_LIMIT_OPEN`), 10 new in 24 hours (429 `BOOKING_LIMIT_DAY`). 201 with the booking |
| GET | `/api/bookings/mine?as=customer\|worker&status=active\|past\|all\|<status>&page=&limit=` | customer, worker | Own bookings, newest first, with `counts: { requested, accepted }`. **No phone numbers** |
| GET | `/api/bookings/:id` | the two people, admin | Detail with `timeline`, `dispute`, `actions` (the buttons that fit), `review`, and `contact` (below) |
| POST | `/api/bookings/:id/accept` | the worker | |
| POST | `/api/bookings/:id/decline` | the worker | `{ reason?: busy\|too_far\|not_my_work\|other }`; outcome `declined` (never counts) |
| POST | `/api/bookings/:id/cancel` | customer, worker | `{ reason? }` required after acceptance (`CANCEL_REASON_REQUIRED`): `plans_changed\|found_someone_else\|cannot_come\|emergency\|price\|other`. Not after "Work done" or a no-show report |
| POST | `/api/bookings/:id/confirm-done` | customer, worker | Each side once (second press 409); both → `completed`, `completionMethod: both` |
| POST | `/api/bookings/:id/contest-done` | customer, worker | `{ reasonCode?, note? }`: "This work was not done", only after the OTHER side pressed "Work done"; opens `completion_contested` |
| POST | `/api/bookings/:id/no-show` | the customer | From the start + 2 hours (`NO_SHOW_TOO_EARLY`), while nobody pressed "Work done" |
| POST | `/api/bookings/:id/no-show/respond` | the worker | `{ answer: admit\|dispute, note? }`; admit → outcome `worker_no_show`; dispute → `no_show_contested` |
| POST | `/api/bookings/:id/dispute` | the worker | `{ reasonCode, note? }`: a cancellation that counts against him (`cancellation_fault`) or a no-show confirmed only because he did not answer (`no_show_contested`), within 14 days (`DISPUTE_WINDOW_PASSED`); one dispute per booking (`DISPUTE_NOT_ALLOWED`) |
| POST | `/api/bookings/:id/review` | the customer | `{ rating: 1–5 (whole), onTime?, workQuality?, polite?, priceAsAgreed?, wouldHireAgain?: yes\|no, comment? (≤ 500) }`; completed bookings only (`REVIEW_NOT_ALLOWED`), once (409 `REVIEW_EXISTS`), within 14 days (`REVIEW_WINDOW_PASSED`), not while a dispute is open (`DISPUTE_OPEN`). Never editable |

**Contact block (decision D-002).** `contact` is `null` unless the booking is `accepted`, or was accepted and then
completed or cancelled less than 7 days ago. Then the customer gets `contact.worker { phone, whatsapp,
whatsappLink }` (`whatsappLink` only when the worker saved a WhatsApp number), the worker gets
`contact.customer { phone }`, an admin gets both; `visibleUntil` says when it disappears. Phone numbers are in
no other response, list, notification or CSV file.

```json
// POST /api/bookings -> 201 (synthetic)
{"booking":{"_id":"6b0c…a1","code":"BK-2026-000007","status":"requested","outcome":null,"skillId":"elec_wiring","skillName":"House wiring",
  "category":"electrical_solar","preferredDate":"2026-11-17","timeSlot":"morning","scheduledStart":"2026-11-17T04:00:00.000Z","city":"Islamabad",
  "area":"G-9 Markaz","description":"Two sockets do not work.","worker":{"name":"Bilal Ahmed (synthetic)","workerIdCode":"DLM-2026-000002"},
  "customer":{"name":"Sara K."},"disputeStatus":null,"hasReview":false,"actions":["cancel"],
  "timeline":[{"from":null,"to":"requested","by":"customer","at":"…","reason":null}],"dispute":null,"review":null,"contact":null}}
// POST /api/bookings/:id/accept (worker) -> 200: ... "status":"accepted", "contact":{"visibleUntil":null,"customer":{"phone":"03000000002"}}
// POST /api/bookings with "area":"Call 0300 1234567" -> 400
{"code":"TEXT_HAS_CONTACT_INFO","params":{"field":"Area","fieldKey":"area"},"message":"area: Please do not write phone numbers, links or ID numbers here.", "errors":[…]}
```

### Reviews and reputation on profiles

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/workers/:workerIdCode/reviews?page=&limit=` | customer, admin, the worker himself | Visible reviews, newest first: `{ rating, onTime, workQuality, polite, priceAsAgreed, wouldHireAgain, comment, reviewer: "Sara K.", skillId, createdAt, reply }`. Another worker → 403 |
| GET | `/api/workers/:workerIdCode/work-history` | customer, admin, the worker himself | "Done through this platform": the latest 20 completed bookings `{ skillId, skillName, category, month: "YYYY-MM", city, rating }`, plus `total`. No customer details |
| GET | `/api/workers/me/reputation` | worker | Computed fresh: `snapshot` (with `score` and `reliability`), `perReview` (weight, the four factors, reason codes `counted_fully`, `weeks_old`, `months_old`, `older_than_a_year`, `auto_completed`, `new_reviewer`, `repeat_reviewer`), `cancellations`, `rules` |
| POST | `/api/reviews/:id/reply` | the reviewed worker | `{ text (1–300) }`, once (409 `REPLY_EXISTS`), final |
| POST | `/api/reviews/:id/report` | the reviewed worker | `{ reasonCode: abusive\|personal_information\|not_about_my_work\|job_did_not_happen\|other, note? }` (words for `other`), once (409 `REPORT_EXISTS`). Does not hide |

`reputation.public` (public profile, "See what customers see"):
`{ ratingAverage, reviewCount, depth: none|few|some|many, distribution: {1..5}, quick: { onTime: { yes, total }, … }, wouldHireAgain: { yes, total },
completedJobs, workerCancelledEarly, workerCancelledLate, noShows, repeatCustomers, lastCompletedAt, perSkill: [{ skillId, completedJobs, reviewCount, ratingAverage, lastCompletedAt }] }`.
The numbers `expected`, `uncertainty`, `cautious` live in `reputation.score` and `reputation.reliability`: only the
worker himself, admins and the Module 7 contract (`docs/contracts/MATCHING-INPUTS.md`) read them.

### Admin (admin only; others 403)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/admin/bookings?status=all\|disputed\|<status>&q=&page=&limit=` | `q`: booking code, worker ID or a name (escaped). No phone numbers |
| GET | `/api/admin/bookings/:id` | Full timeline, dispute with both notes, `allowedDecisions`, the review's stars. No phone numbers |
| GET | `/api/admin/disputes?status=open\|decided\|all` | The queue, oldest first |
| PATCH | `/api/admin/bookings/:id/dispute` | `{ decision, note (5–500, no CNIC) }`. Decisions per type: `completion_contested`: `work_done` (→ completed, method admin), `not_done_worker_fault` (→ `worker_no_show`), `not_done_no_fault` (→ `closed_no_fault`); `no_show_contested`: `no_show_confirmed`, `no_show_rejected` (→ `closed_no_fault`); `cancellation_fault`: `worker_fault` (no change), `no_fault` (→ `closed_no_fault`). Wrong decision → 400 `DISPUTE_DECISION_INVALID`; already decided → 409. Audited `dispute.decided`; both people notified; reputation rebuilt |
| GET | `/api/admin/reviews?status=all\|visible\|hidden&reported=true\|false&page=` | Reported reviews first |
| PATCH | `/api/admin/reviews/:id` | `{ action: hide, reasonCode: abusive_language\|personal_information\|unrelated\|fake_or_manipulated\|other, note? }` or `{ action: restore, note (≥ 5) }`. 409 when the status already changed. Audited (`review.hidden`, `review.restored`; never the comment text); both people notified; reputation rebuilt. Being negative is never a reason to hide |
| GET | `/api/admin/reputation-flags?status=open\|dismissed\|actioned\|all` | Rule-based flags (`new_account_praise`, `repeat_pair_burst`), oldest first |
| PATCH | `/api/admin/reputation-flags/:id` | `{ action: dismiss\|hide_reviews, note }`; `hide_reviews` hides the listed reviews as `fake_or_manipulated`. 409 when already decided. Audited `flag.decided`. A flag itself never changes a score |
| GET | `/api/admin/workers/:id/reputation` | `:id` = WorkerProfile id. The full breakdown: snapshot, per-review weights with the reviews, hidden reviews, flags, bookings by status |
| GET | `/api/admin/stats/bookings?days=7..90` | Chart data from real counts: bookings per day by state, star distribution, completed versus worker-cancelled and no-shows per week, queue sizes |
| GET | `/api/admin/export/bookings.csv`, `/api/admin/export/reviews.csv` (also `/api/admin/exports/bookings`, `/reviews`) | No phone numbers, no description, no comment or reply text, no customer names. Audited (`export.bookings`, `export.reviews`) before the file is sent |

### Cron (Vercel)

`GET /api/cron/daily` with `Authorization: Bearer <CRON_SECRET>` (constant-time comparison). 401
`CRON_UNAUTHORIZED` when the header is missing or wrong, **and when `CRON_SECRET` is not set**. Runs the sweep for
every booking and rebuilds the snapshot of every worker who has a booking; answers
`{ ok, at, swept: { expired, autoCompleted, noShowConfirmed, reminded }, refreshed }`. Safe to run twice.

### Notifications (new types)

`booking_requested`, `booking_accepted`, `booking_declined`, `booking_expired`, `booking_cancelled`,
`booking_confirm_request`, `booking_completed`, `review_requested`, `review_reminder`, `review_received`,
`review_reply`, `review_hidden`, `review_restored`, `no_show_reported`, `dispute_opened`, `dispute_decided`.
New params: `bookingId`, `bookingCode`, `rating`, `outcome` (with the existing `skillId`, `skillName`,
`reasonCode`). Never a phone number or a name.

## Module 5: price terms, payment records, price information (Batch 7)

Strict zod schemas on every body, query and URL parameter (unknown keys → 400 `UNKNOWN_FIELD`). Amounts are whole
rupees; a string with Urdu or Arabic digits or commas (`"۲,۵۰۰"`) is read as a number. The app never moves money.
Every terms or payment update is ONE conditional update on `moneyVersion` (and the state it checked): a stale screen
or a double tap gets 409. Phone numbers never appear in any of these answers (D-002).

### GET /api/meta/wage-references?city= (anyone, no database)
The minimum wage table of `backend/config/wageReferences.js` with the daily (÷ 26) and hourly (÷ 26 ÷ 8) values, the
status, dates, sources, names in three languages, and the age of the figures. `?city=` (max 50) also answers that
city's region (`null` = not in the city table, so no reference).
```json
{"checkedOn":"2026-11-19","workingDaysPerMonth":26,"hoursPerDay":8,"staleAfterDays":365,"anyStale":false,
 "generalSource":{"title":"FAFEN, \"Minimum Wage in Pakistan: Laws, Process and Current Rates\"","url":"https://fafen.org/…"},
 "regions":[{"region":"ICT","status":"notified","monthly":40700,"daily":1565,"hourly":196,"effectiveFrom":"2026-07-01",
   "statusDate":"2026-08-19","statusNote":null,"notifiedFound":null,"sources":[{"title":"WageIndicator, …","url":"https://…"}],
   "checkedOn":"2026-11-19","ageDays":4,"stale":false,"names":{"en":"Islamabad Capital Territory","ur":"…","ur-Latn":"…","short":{…}}}, …,
   {"region":"GB","status":"none","monthly":null,"daily":null,"hourly":null,…}],
 "city":{"name":"pindi","region":"PB"}}
```

### GET /api/meta/work-terms (anyone, no database)
Units, durations, the condition options, the important conditions per trade category, the category notes, the check
ids with severity and audience, payment kinds, statuses, dispute reasons, payment states, and the limits
(`amountMin` 100, `amountMax` 5,000,000, `quantityMax` { day 60, hour 200 }, `maxTermsVersions` 10, `maxPayments` 10,
`paymentRecordDays` 30, `largeAdvanceShare` 0.5).

### GET /api/prices/estimate?skillId=&category=&unit=&city=&workerIdCode= (customer, worker, admin)
`unit` is required; `skillId` (from the taxonomy) or `category`; `city` max 50. One indexed query loads the
completed jobs; `priceRange` applies the rules (D-070, D-071). The admin guide only when there is no platform range.
Aggregates only: never a list of amounts, a booking id, a name or a worker id. No extra rate limiter (aggregates only).
```json
{"query":{"skillId":"elec_wiring","category":"electrical_solar","unit":"job","city":"Islamabad","region":"ICT"},
 "platform":{"level":"city","scope":"skill","unit":"job","low":2000,"median":2500,"high":2800,"jobs":9,"workers":4},
 "guide":null,
 "wageReference":{"region":"ICT","monthly":40700,"daily":1565,"hourly":196,"status":"notified","effectiveFrom":"2026-07-01",…,"names":{…}},
 "workerRates":{"hourlyRate":600,"dailyRate":null},
 "rules":{"minJobs":5,"minWorkers":3,"minCustomers":3,"windowDays":365}}
```
(Numbers from the synthetic local demo.) Without a range: `"platform":null,"guide":{"scope":"skill","region":"PK","low":1500,"high":3000,"sourceNote":"[Demo] …","note":"…","updatedAt":"…"}`.
Errors: 400 `UNIT_INVALID`, `SKILL_ID_INVALID`, `CATEGORY_UNKNOWN`, `CATEGORY_INVALID` (skill not in the category),
`WORKER_ID_INVALID`, `TEXT_TOO_LONG`; 401; 403.

### POST /api/prices/check (customer, worker) — the checks of a draft, nothing saved
Body (all optional): `skillId`, `category`, `city`, `amount`, `unit`, `quantity`, `duration`, `materials`, `advance`,
`paymentTiming`, `paymentMethod`, `visitCharge`. Answer: `{ checks: [{ id, severity, audience, params }], region,
wageReference, platform }`. The saved booking detail computes the same checks with the same pure function.
```json
// {"skillId":"elec_wiring","city":"Islamabad","amount":1200,"unit":"day","quantity":1}
{"checks":[{"id":"below_minimum_day","severity":"warning","audience":"both","params":{"region":"ICT","reference":1565,"amount":1200}},
           {"id":"missing_condition","severity":"info","audience":"both","params":{"condition":"paymentTiming"}}, …],"region":"ICT",…}
```

### POST /api/bookings (customer) — changed
Optional `offer { amount, unit, quantity?, duration? }` creates price terms version 1, proposed by the customer
(accepting the request does not agree to it; audit `terms.proposed`; the `booking_requested` notification gains
`amount` and `unit`). `region` is set from `city` (unknown city: `null`). Errors as before plus `NUMBER_TOO_SMALL`,
`UNIT_INVALID`, `QUANTITY_INVALID`, `WHOLE_NUMBER`.

### POST /api/bookings/:id/terms (customer or worker) — propose a version
Body: `baseVersion` (the version the person looked at), `amount`, `unit`, `quantity?`, `duration?`, `materials?`,
`advance?`, `paymentTiming?`, `paymentMethod?`, `visitCharge?`, `note?` (max 300, contact-info check). The server
computes `quantity` (a whole job is 1) and `total`. Answers with the booking detail. Errors: 404 (not your booking);
403 (admin); 400 `TERMS_NOT_ALLOWED` (a request for the worker, after "Work done", during a no-show report, a closed
booking), `DISPUTE_OPEN`, `TERMS_LIMIT` (`params.max` 10), `ADVANCE_TOO_HIGH`, `TEXT_HAS_CONTACT_INFO`, `NOTE_HAS_CNIC`;
409 `TERMS_CHANGED` (the version moved) or `BOOKING_CHANGED`. Notification `terms_proposed` to the other person.

### POST /api/bookings/:id/terms/agree { version } (the person who did not propose it)
409 `TERMS_CHANGED` if `version` is not the current one; 400 `TERMS_OWN_VERSION`, `TERMS_NOT_ALLOWED`,
`DISPUTE_OPEN`. Sets `terms.agreed` (a copy with `version` and `agreedAt`) and `paymentState`; audit `terms.agreed`;
notification `terms_agreed` to both.

### POST /api/bookings/:id/payments { kind, amount, method, paidOn } (customer: "I paid"; worker: "I received")
While accepted, or up to 30 days after completed / cancelled (only if ever accepted); at most 10 records; not during
an open dispute. `paidOn` is the day in Pakistan, not in the future, not before the booking was created. 201 with the
booking detail. Errors: 400 `PAYMENT_NOT_ALLOWED`, `PAYMENT_WINDOW_PASSED` (`params.days` 30), `PAYMENT_LIMIT`
(`params.max` 10), `PAYMENT_DATE_FUTURE`, `PAYMENT_DATE_TOO_EARLY`, `PAYMENT_KIND_INVALID`, `DATE_NOT_REAL`,
`DISPUTE_OPEN`. Audit `payment.recorded`; notification `payment_recorded` to the other person.

### POST /api/bookings/:id/payments/:paymentId/confirm | /dispute (the other person)
`/dispute` body: `reason` (`not_received`, `wrong_amount`, `other`), `note?` (max 200, contact-info check). Only the
other person; once. Errors: 404 `PAYMENT_NOT_FOUND`; 400 `PAYMENT_OWN_RECORD`, `PAYMENT_REASON_INVALID`; 409
`PAYMENT_CHANGED` (already answered) or `BOOKING_CHANGED`. Never edited, deleted or confirmed automatically. Audit
`payment.confirmed` / `payment.disputed` (reason code only); notification to the person who recorded it.

### GET /api/bookings/:id — changed (the two people, admin)
Adds `region`, `regionNames`, `terms` `{ status, version, proposedBy, proposedAt, current, agreed }`, `termsHistory`
`[{ version, by, action, at, snapshot }]`, `payments`, `paymentSummary` `{ agreedTotal, confirmedPaid, awaiting,
disputed, balance, materials, records, state }`, `termsChecks`, `wageReference`, and the new buttons `termsActions`
(`propose_terms`, `agree_terms`) and `paymentActions` `{ record, respond: [paymentId] }`. Module 4's `actions` is
unchanged. Admins get empty buttons.

### GET /api/bookings/mine — changed
Adds only `terms` `{ status, version, proposedBy, agreedTotal, agreedUnit, offer }` (`offer` = the price of a waiting
version, for the Requests card) and `paymentSummary` `{ state }`. Never conditions, notes or payment records.

### GET /api/workers/me/earnings?year= (worker)
`{ thisMonth: { month, confirmed }, months: [{ month, confirmed, awaiting, disputed, materials, jobs, agreedTotal,
items: [{ bookingId, code, skillId, skillName, agreedTotal, state, confirmed, awaiting, disputed, materials }] }] }`.
Months in Pakistan time (of `paidOn`); only confirmed money in `confirmed`.

### Admin (admin only; others 403)
- `GET /api/admin/price-guides?status=active|archived|all&category=` → `{ guides, history: { [id]: [{ action, at, by, before, after }] } }`.
- `POST /api/admin/price-guides` `{ skillId?, category, unit, region (ICT…AJK or PK), low, high, sourceNote (10–300, required), note? }`
  → 201. Errors: `SOURCE_NOTE_REQUIRED`, `PRICE_GUIDE_LOW_HIGH`, `REGION_INVALID`, `CATEGORY_INVALID`, 409 `PRICE_GUIDE_EXISTS`.
  Audit `priceguide.created` with the numbers.
- `PATCH /api/admin/price-guides/:id` `{ low, high, sourceNote, note? }` (new numbers need the source again) or
  `{ status: "archived" }`. Errors: 404 `PRICE_GUIDE_NOT_FOUND`, 409 `PRICE_GUIDE_ARCHIVED`, `PRICE_GUIDE_CHANGED`.
  Audit `priceguide.updated` / `priceguide.archived` with the old and new numbers.
- `GET /api/admin/payments?state=all|has_dispute|no_price|paid|part_paid|not_paid&page=&limit=` → bookings (detail
  views, read-only), disputed first, `counts.disputed`.
- `GET /api/admin/exports/payments` (also `GET /api/admin/export/payments.csv`) `?status=<payment state>&from=&to=` →
  CSV: booking_code, skill, category, region, booking_status, unit, agreed_total, confirmed_paid, awaiting, disputed,
  payment_records, payment_state, created_at_utc, agreed_at_utc, completed_at_utc, last_paid_on, synthetic. No names,
  phone numbers or notes. Audited (`export.payments`).

## Module 6: job requests and the job analyzer (Batch 8A)

All behind the login. **Workers get 403 on every route here**: a worker sees a job only through a booking request
sent to that worker. Strict zod schemas (unknown keys → 400 `UNKNOWN_FIELD`; `analysis`, `customer`, `code` or
`status` can never be sent). Someone else's job answers **404 `JOB_NOT_FOUND`** (the job is found only through a filter
with the customer's id), never 403. The description and the area pass the contact-info check (`TEXT_HAS_CONTACT_INFO`)
and the CNIC check (`NOTE_HAS_CNIC`). The budget appears only in the owner's and the admin's job views. No answer
holds a score, a probability or a percentage. Decisions D-080 to D-090; `docs/modules/MODULE-6.md`.

### POST /api/job-requests/analyze { text, inputMode? } (customer, admin) — nothing saved
`text` 1–500 characters. The live analyzer's output (Batch 8A: `method: "rules"`); nothing is stored and no text is
logged. No extra rate limiter (`docs/SECURITY.md`).
```json
{"method":"rules","methodName":"rule-based word lists",
 "versions":{"analyzer":"job-rules-1","taxonomy":"2026-11-09-v1","phrases":"2026-11-24-v1","model":null},
 "category":{"suggested":"ac_appliance_repair","tie":false,"ranked":["ac_appliance_repair"],"matched":["ac","service"],"source":"rules","words":[]},
 "skills":[{"skillId":"ac_general","name":"AC repair (general)","category":"ac_appliance_repair","matched":["ac"]}, …],
 "taskType":{"suggested":"service","tie":false,"matched":["service"],"fromCategory":false},
 "city":{"suggested":"Rawalpindi","region":"PB","matched":["rawalpindi"],"conflict":false},
 "when":{"suggested":"tomorrow","date":"2026-11-25","matched":["kal"]},
 "timeSlot":{"suggested":"morning","matched":["subah"]},
 "urgent":{"suggested":false,"matched":[]},
 "budget":{"suggested":null,"matched":[]},
 "notes":[],"missing":["area"]}
```
`notes`: `no_trade_words`, `negative_phrase`, `category_tie`, `city_conflict`, `budget_out_of_range`,
`address_in_text`. `missing`: always `area`; `category` and `city` when not suggested. On a tie `suggested` is `null`,
`tie` is `true` and `ranked` holds the tied trades. `urgent.suggested: false` means "no urgency word found".

### POST /api/job-requests (customer)
`{ description (3–500), inputMode: text|voice, category, skills: [skillId] (0–5, all of the category), taskType: install|repair|service|new_work|cleaning|moving|household_help|null, city (2–50), area (2–80), preferredDate?: YYYY-MM-DD|null, timeSlot?: morning|afternoon|evening|any|null, urgent?: boolean, budget?: { amount, unit: job|day|hour } | null }`
→ 201 `{ job }` (the owner view below). The analysis is computed on the server. Errors: 400 `JOB_SKILL_CATEGORY`,
`SKILL_UNKNOWN`, `CATEGORY_INVALID`, `TASK_TYPE_INVALID`, `INPUT_MODE_INVALID`, `TIME_SLOT_INVALID`,
`JOB_BUDGET_INCOMPLETE`, `UNIT_INVALID`, `NUMBER_TOO_SMALL`, `DATE_INVALID`, `DATE_NOT_REAL`, `BOOKING_DATE_RANGE`
(today up to 30 days ahead), `TEXT_HAS_CONTACT_INFO`, `NOTE_HAS_CNIC`; 409 `JOB_LIMIT_OPEN` (10 jobs open, requested
or accepted); 429 `JOB_LIMIT_DAY` (10 new jobs in 24 hours).

The **owner view**: `_id, code (JR-2026-000001), state (open|requested|accepted|done|expired|closed), version, actions
([edit, find_workers, request, close, delete] as allowed), category, skills [{skillId, name}], taskType, description,
inputMode, city, region, area, preferredDate, timeSlot, urgent, budget, openUntil, closedAt, closeReason, createdAt,
updatedAt, bookingsCount`; the detail also `analysis { method, versions, analyzedAt, suggested { category, categoryTie,
skills, taskType, city, preferredDate, timeSlot, urgent, budget, notes }, changed { category, skills, taskType, city,
preferredDate, timeSlot, urgent, budget } }` (true = changed, false = kept, null = nothing suggested) and `bookings
[{ _id, code, status, skillId, skillName, preferredDate, timeSlot, worker { name, workerIdCode }, createdAt }]`.

### GET /api/job-requests/mine?state=&page=&limit= (customer)
`state`: `open|requested|accepted|done|expired|closed|active|all` (`active` = open, requested, accepted; bad value →
400 `STATUS_UNKNOWN`). → `{ jobs [owner view without analysis and bookings], counts { open, requested, accepted, done,
expired, closed, active }, page, limit, total }`, newest first. Expired requests are swept first.

### GET /api/job-requests/:id (customer, owner) → `{ job }` (the detail view)

### PATCH /api/job-requests/:id { baseVersion, ...any editable field } (customer, owner)
Only in state `open`. 409 `JOB_NOT_EDITABLE` (another state), 409 `JOB_CHANGED` (a stale `baseVersion`, or a request
was reserved meanwhile), 400 `JOB_EDIT_EMPTY` (no field). A changed description is analysed again; the `changed`
flags are always recomputed. `version` + 1.

### POST /api/job-requests/:id/close { reason: work_done|not_needed|found_elsewhere|other } (customer, owner)
→ state `closed` (400 `CLOSE_REASON_INVALID`; 409 `JOB_NOT_OPEN` when already closed). Never changes the bookings.

### DELETE /api/job-requests/:id (customer, owner)
204. A job that was ever sent to a worker → 409 `JOB_HAS_BOOKINGS` (close it instead); a request being written right
now → 409 `JOB_HAS_OPEN_REQUEST`.

### GET /api/job-requests/:id/workers?sort=&availability=&identity=&skills=&page=&limit= (customer, owner)
"Workers for this job": **a filter, not a ranking** (D-084). Listed, not-suspended workers who offer a skill of the
job's trade, in the customer's chosen directory sort (`updated` default, `experience`, `evidence`, `track_record`), at
most 500 candidates, then only the **same city** (`marketCity`: "Pindi" = "Rawalpindi"). States done, expired, closed →
409 `JOB_NOT_OPEN`.
```json
{"workers":[{"workerIdCode":"DLM-2026-000012","occupation":"Plumber","city":"Pindi", "skills":[…], "user":{"name":"…"},
   "matchedSkills":[{"skillId":"plumb_leak","name":"Water leak repair"}],"sameCity":true}],
 "page":1,"limit":20,"total":1,"sort":"updated","truncated":false,
 "filter":{"category":"plumbing_sanitary","city":"Rawalpindi","marketCity":"Rawalpindi","cityKnown":true}}
```
Only the directory's public fields (`PUBLIC_WORKER_FIELDS`, the user's name); never a phone, WhatsApp, CNIC, email or
address. `truncated: true` when the candidate limit was reached (Module 7 replaces this list).

### POST /api/job-requests/:id/request { jobVersion, workerIdCode, skillId, preferredDate, timeSlot, offer? } (customer, owner)
201 `{ booking }`, the same answer as `POST /api/bookings`. One open request per job (a reservation, D-082): 409
`JOB_HAS_OPEN_REQUEST` (one is waiting or accepted, or two taps at once), 409 `JOB_NOT_OPEN` (done, expired, closed),
409 `JOB_CHANGED` (stale `jobVersion`). Every check of `POST /api/bookings` (`WORKER_NOT_FOUND`,
`BOOKING_WORKER_UNAVAILABLE`, `BOOKING_SKILL_NOT_OFFERED`, `BOOKING_DATE_RANGE`, `BOOKING_SELF`, `BOOKING_LIMIT_*`, the
offer) plus 400 `BOOKING_JOB_MISMATCH` (the skill is not in the job's trade). `city`, `area` and `description` are
copied from the job (sending them → 400 `UNKNOWN_FIELD`).

### Bookings — changed (only bookings sent from a job)
`GET /api/bookings/mine`, `GET /api/bookings/:id` and the admin booking views gain `job` **only** on a booking sent from
a job: the worker gets `{ code, taskType }`; the customer and admins `{ _id, code, taskType }`. Never the budget or the
analysis. A booking without a job has no `job` key at all.

### Admin (admin only; others 403)
- `GET /api/admin/job-requests?state=&category=&q=<JR code>&page=&limit=` → `{ jobs [list view: no budget; customer
  { name }, bookingsCount, analysisMethod], page, limit, total }` (`q` is matched literally).
- `GET /api/admin/job-requests/stats?days=7..90` (default 30) → `{ days, jobs, byMethod, byInputMode, fields: {
  category|taskType|city|preferredDate|timeSlot|urgent|budget: { kept, changed, notSuggested }, skills: { kept, changed,
  notSuggested, added, removed } }, note }`. *A customer may keep a wrong suggestion or change a right one, so these
  numbers describe use, not correctness* (D-088). Aggregates only.
- `GET /api/admin/job-requests/:id` → `{ job }`: everything, including the budget, the analysis and the bookings; the
  customer's name only (no phone, no email).

### GET /api/meta/job-options (anyone, no database)
`{ taskTypes, closeReasons, inputModes, budgetUnits, limits { descriptionMin 3, descriptionMax 500, areaMin 2, areaMax
80, maxSkills 5, maxOpenPerCustomer 10, maxNewPerDay 10, openDays 30, amountMin 100, amountMax 5000000 }, analyzer {
method, methodName, versions } }`.

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
| `npm run reputation:sensitivity` | Module 4: how `expected` and `cautious` move for the hand-worked cases when one parameter changes (formula outputs) |
| `npm run evaluate:reputation -- --scenario <name\|all> --seeds 30` | Module 4 simulation; writes `evaluation/reputation/results/SIMULATION-*.json` (**simulation results only**) |
| `npm run reputation:recompute -- --worker <workerIdCode>` / `-- --all` | Rebuilds reputation snapshots; local only unless `--allow-remote` **and** typing `yes` after seeing the host |
| `npm run evaluate:skills -- --file <dataset>` / `npm run agreement:skills -- --a <f> --b <f>` | Module 2 evaluation (`docs/evaluation/`) |
| `npm run jobs:try -- "<text>" [--now <ISO>] [--model <file>]` | Module 6: the analysis of one text in a table (no database, nothing saved) |
| `npm run jobs:split` / `jobs:train` / `evaluate:jobs` / `agreement:jobs` | Module 6 evaluation (`backend/evaluation/job-analysis/README.md`, `docs/evaluation/job-analysis/PROTOCOL.md`) |
| `npm run migrate:cnic` / `migrate:categories` / `migrate:skills` | Dry run unless `-- --apply`; local only unless `--allow-remote` |
| `npm run db:local`, `npm run seed:local` | Local preview database and synthetic demo accounts (dev container) |

## Error codes (generated from backend/errors/catalog.js)

The English text is the fallback. Placeholders in braces come from `params`. A test checks that this
table lists every code in the catalog. Regenerate it with `node docs/tools/generate-error-table.mjs`.

| Code | English text |
|---|---|
| `BODY_REQUIRED` | Request body is required (send JSON) |
| `INVALID_JSON` | Request body is not valid JSON |
| `BODY_TOO_LARGE` | Request body is too large |
| `UNKNOWN_FIELD` | Unrecognized key: "{key}" |
| `WRONG_TYPE` | {field}: wrong type of value |
| `TEXT_MUST_BE_TEXT` | {field} must be text |
| `ONE_VALUE` | {field} must be one text value |
| `TEXT_TOO_SHORT` | {field} must be at least {min} characters |
| `TEXT_TOO_LONG` | {field} must be at most {max} characters |
| `TEXT_EMPTY_ITEM` | {field} cannot be empty |
| `LIST_TOO_SHORT` | Choose at least {min} for {field} |
| `LIST_TOO_LONG` | At most {max} items for {field} |
| `NUMBER_REQUIRED` | {field} must be a number |
| `WHOLE_NUMBER` | {field} must be a whole number |
| `NOT_NEGATIVE` | {field} cannot be negative |
| `NUMBER_TOO_SMALL` | {field} must be at least {min} |
| `NUMBER_TOO_LARGE` | {field} must be at most {max} |
| `RATE_TOO_HIGH` | {field} is too high |
| `NOT_ALLOWED` | {field}: this value is not allowed |
| `INVALID_FORMAT` | {field}: wrong format |
| `INVALID_VALUE` | {field}: invalid value |
| `ID_INVALID` | Invalid id |
| `NAME_REQUIRED` | Name is required |
| `EMAIL_REQUIRED` | Email is required |
| `EMAIL_INVALID` | Email address is not valid |
| `PHONE_REQUIRED` | Phone number is required |
| `PHONE_INVALID` | Phone must be a Pakistani mobile number like 0300 1234567 |
| `PASSWORD_REQUIRED` | Password is required |
| `PASSWORD_TOO_SHORT` | Password must be at least 15 characters. Tip: use 4 or more easy words with spaces, in Roman Urdu or English |
| `PASSWORD_TOO_LONG` | Password is too long (max 72 bytes; an Urdu letter counts as 2 bytes) |
| `PASSWORD_ONLY_SPACES` | Password cannot be only spaces |
| `ROLE_INVALID` | Role must be worker or customer |
| `LANGUAGE_INVALID` | Language must be en, ur or ur-Latn |
| `THEME_INVALID` | Theme must be light, dark or system |
| `TEXT_SIZE_INVALID` | Text size must be small, normal or large |
| `PREFERENCES_EMPTY` | Send at least one setting to change |
| `EMAIL_TAKEN` | This email is already registered. Please log in instead. |
| `LOGIN_FAILED` | Email or password is incorrect. After 5 wrong tries, login is paused for 15 minutes. |
| `NOT_LOGGED_IN` | Please log in first. |
| `SESSION_ENDED` | Your session has ended. Please log in again. |
| `FORBIDDEN` | You do not have permission for this action. |
| `CSRF_BLOCKED` | Request blocked: it did not come from our website. |
| `RATE_LIMIT_AUTH` | Too many failed attempts from this network. Please wait 15 minutes and try again. |
| `RATE_LIMIT_UPLOAD` | Too many uploads from this network. Please wait 15 minutes and try again. |
| `CNIC_INVALID` | CNIC must look like 12345-1234567-1 |
| `CATEGORY_INVALID` | Category must be one of the listed trades |
| `EXPERIENCE_WHOLE` | Experience must be whole years |
| `EXPERIENCE_TOO_HIGH` | Experience must be 60 years or less |
| `AVAILABILITY_INVALID` | Availability must be Available, Busy or Offline |
| `PROFILE_NOT_CREATED` | You have not created your worker profile yet. |
| `CNIC_TAKEN` | This CNIC is already linked to another account. If it is yours, please contact the admin. |
| `WORKER_NOT_FOUND` | Worker not found |
| `WORKER_ID_INVALID` | Worker ID must look like DLM-2026-000123 |
| `CATEGORY_UNKNOWN` | Unknown category |
| `AVAILABILITY_UNKNOWN` | Unknown availability |
| `STATUS_UNKNOWN` | Unknown status |
| `TYPE_UNKNOWN` | Unknown type |
| `ACTION_UNKNOWN` | Unknown action |
| `IDENTITY_FILTER_INVALID` | identity must be all or verified |
| `SKILLS_FILTER_INVALID` | skills must be all or verified |
| `DUPLICATES_FILTER_INVALID` | duplicates must be "true" |
| `DATE_INVALID` | Date must look like 2026-11-09 |
| `DATE_NOT_REAL` | Not a real date |
| `IDENTITY_STATUS_INVALID` | Status must be Verified or Rejected |
| `NOTE_REQUIRED` | A note is required |
| `IDENTITY_NOTE_TOO_SHORT` | Please write a note of at least 5 characters (how the CNIC was checked) |
| `WORKER_PROFILE_NOT_FOUND` | Worker profile not found |
| `IDENTITY_NEEDS_CNIC` | This worker has not saved a CNIC yet, so identity cannot be verified. |
| `IDENTITY_CHANGED` | Someone else changed this worker just now. Please reload and try again. |
| `NO_CNIC_ON_FILE` | This worker has no CNIC on file. |
| `CNIC_UNREADABLE` | The stored CNIC cannot be read (wrong key or damaged data). Ask the worker to enter it again. |
| `TEXT_EMPTY` | Please write a few words about your work |
| `INPUT_MODE_INVALID` | inputMode must be text or voice |
| `SKILL_UNKNOWN` | Unknown skill. Choose a skill from the list. |
| `SKILL_CHOOSE_ONE` | Choose at least one skill |
| `ADDED_VIA_INVALID` | addedVia must be extractor, manual or related |
| `SKILL_ID_INVALID` | Invalid skill id |
| `SKILL_LIMIT` | At most {max} skills per worker |
| `CUSTOM_SKILL_LATIN` | Please write the skill name in English letters (a-z) for now |
| `CUSTOM_SKILL_LIMIT` | At most {max} custom skills |
| `SKILL_NOT_ON_PROFILE` | This skill is not on your profile |
| `SKILL_HAS_REVIEWED_PROOF` | This skill has proof that an admin already reviewed, so it cannot be removed. Please contact the admin. |
| `SKILL_CHOOSE_OWN` | Choose one of your skills |
| `EVIDENCE_TYPE_INVALID` | Choose the kind of proof: certificate, work photo or reference letter |
| `CONSENT_REQUIRED` | Please tick the consent box before uploading |
| `PHOTO_REQUIRED` | Please choose a photo to upload. |
| `PHOTO_TOO_LARGE` | The photo is too large. The limit is 4 MB. |
| `PHOTO_FIELD` | Send one photo in the "image" field. |
| `UPLOAD_FORM_INVALID` | The upload form is not valid. |
| `UPLOAD_INCOMPLETE` | The upload was not complete. Please try again. |
| `PHOTO_NOT_JPG_PNG` | Please upload a JPG or PNG photo. |
| `PHOTO_PDF` | PDF files are not accepted. Please upload a JPG or PNG photo of the document. |
| `PHOTO_NOT_IMAGE` | This file is not a photo. Please upload a JPG or PNG photo. |
| `PHOTO_UNREADABLE` | The photo could not be read. Please take the photo again. |
| `PHOTO_TOO_MANY_PIXELS` | The photo has too many pixels. Please use a normal phone photo. |
| `PROOF_SKILL_NOT_ON_PROFILE` | You can add proof only for a skill on your profile. |
| `PROOF_LIMIT_SKILL` | At most {max} proof items per skill. Delete one first. |
| `PROOF_LIMIT_TOTAL` | At most {max} proof items in total. |
| `PHOTO_DUPLICATE` | You already uploaded this photo for this skill. |
| `PHOTO_NOT_FOUND` | Photo not found |
| `PROOF_NOT_FOUND` | Proof item not found |
| `PROOF_FAKE_CANNOT_DELETE` | An admin marked this item as a suspected fake. It cannot be deleted. Please contact the admin. |
| `PROOF_REVIEWED_CANNOT_DELETE` | Reviewed items that were approved or revoked cannot be deleted. Please contact the admin. |
| `REASON_CODE_INVALID` | Choose a reason: unclear, not relevant, wrong skill or other |
| `REASON_REQUIRED_TO_REJECT` | A reason is required to reject |
| `REASON_OTHER_NEEDS_WORDS` | Write the reason (at least 5 characters) |
| `WRITTEN_REASON_REQUIRED` | A written reason (at least 5 characters) is required |
| `REASON_CODE_ONLY_FOR_REJECT` | A reason code is only used to reject |
| `TRANSITION_INVALID` | You cannot {verb} an item that is {state}. |
| `PROOF_CHANGED` | Someone else reviewed this item just now. Please reload. |
| `ACCOUNT_SUSPENDED` | This account is suspended. Please contact the admin. |
| `USER_NOT_FOUND` | User not found |
| `USER_STATUS_INVALID` | Status must be active or suspended |
| `USER_STATUS_CHANGED` | This account already has that status. Please reload. |
| `CANNOT_SUSPEND_SELF` | You cannot suspend your own account. |
| `CANNOT_SUSPEND_ADMIN` | Admin accounts cannot be suspended from the website. |
| `ROLE_FILTER_INVALID` | Role must be all, worker, customer or admin |
| `REASON_REQUIRED` | A reason is required |
| `REASON_TOO_SHORT` | Write a reason of at least 5 characters |
| `NOTE_HAS_CNIC` | Do not write a CNIC number here. Notes are saved in the audit log. |
| `NOTIFICATION_NOT_FOUND` | Notification not found |
| `SAVED_LIMIT` | You can save at most {max} workers. Remove one first. |
| `SORT_INVALID` | Sort must be updated, experience, evidence or track_record |
| `COMPARE_NEEDS_TWO` | Choose at least two workers to compare |
| `COMPARE_MAX_THREE` | You can compare at most three workers |
| `COMPARE_SAME_WORKER` | Choose different workers to compare |
| `EXPORT_KIND_UNKNOWN` | Export must be audit, identity, evidence, users, bookings or reviews |
| `TEMPLATE_KIND_INVALID` | Unknown kind of reason template |
| `TEMPLATE_TEXT_REQUIRED` | Write the English text of the template (at least 5 characters) |
| `TEMPLATE_NOT_FOUND` | Reason template not found |
| `TEMPLATE_LIMIT` | At most {max} reason templates. Delete one first. |
| `BOOKING_NOT_FOUND` | Booking not found |
| `BOOKING_ID_INVALID` | Booking number must look like BK-2026-000123 |
| `BOOKING_NOT_ALLOWED` | This step is not possible for this booking now. Please reload the page. |
| `BOOKING_CHANGED` | Someone changed this booking just now. Please reload the page. |
| `BOOKING_SELF` | You cannot send a request to yourself. |
| `BOOKING_WORKER_UNAVAILABLE` | This worker cannot receive requests right now. |
| `BOOKING_SKILL_NOT_OFFERED` | Choose one of this worker's skills. |
| `BOOKING_LIMIT_OPEN` | You already have {max} open requests. Wait for an answer or cancel one first. |
| `BOOKING_LIMIT_PAIR` | You already have an open request with this worker. |
| `BOOKING_LIMIT_DAY` | You sent {max} requests in the last 24 hours. Please try again tomorrow. |
| `BOOKING_DATE_RANGE` | Choose a day from today up to {max} days ahead. |
| `TIME_SLOT_INVALID` | Choose a time: morning, afternoon, evening or any time. |
| `BOOKING_AS_INVALID` | as must be customer or worker |
| `DECLINE_REASON_INVALID` | Choose a reason: busy, too far, not my work or other |
| `CANCEL_REASON_REQUIRED` | Please choose why you are cancelling. |
| `CANCEL_REASON_INVALID` | Choose one of the listed reasons for cancelling. |
| `TEXT_HAS_CONTACT_INFO` | Please do not write phone numbers, links or ID numbers here. |
| `NO_SHOW_TOO_EARLY` | You can report this from 2 hours after the start time. |
| `NO_SHOW_ANSWER_INVALID` | Answer must be admit or dispute |
| `DISPUTE_NOT_ALLOWED` | This booking cannot be disputed. |
| `DISPUTE_WINDOW_PASSED` | The time to dispute this booking (14 days) has passed. |
| `DISPUTE_OPEN` | A dispute about this booking is open. An admin will decide. |
| `DISPUTE_NOT_OPEN` | This booking has no open dispute. |
| `DISPUTE_REASON_INVALID` | Choose one of the listed reasons. |
| `DISPUTE_DECISION_INVALID` | This decision does not fit this kind of dispute. |
| `DISPUTE_ALREADY_DECIDED` | An admin already decided this dispute. Please reload the page. |
| `RATING_INVALID` | Choose from 1 to 5 stars. |
| `ANSWER_INVALID` | Answer must be yes or no |
| `REVIEW_NOT_ALLOWED` | Only the customer of a completed booking can review it. |
| `REVIEW_EXISTS` | This work was already reviewed. Reviews cannot be changed. |
| `REVIEW_WINDOW_PASSED` | The time to review this work (14 days) has passed. |
| `REVIEW_NOT_FOUND` | Review not found |
| `REPLY_EXISTS` | You already replied to this review. Replies cannot be changed. |
| `REPLY_EMPTY` | Please write your reply. |
| `REPORT_REASON_INVALID` | Choose a reason: abusive, personal information, not about my work, the job did not happen, or other |
| `REPORT_EXISTS` | You already reported this review. An admin will look at it. |
| `HIDE_REASON_INVALID` | Choose a reason: abusive language, personal information, unrelated, fake or manipulated, or other |
| `REVIEW_STATUS_CHANGED` | This review already has that status. Please reload the page. |
| `FLAG_NOT_FOUND` | Flag not found |
| `FLAG_ALREADY_DECIDED` | An admin already decided this flag. Please reload the page. |
| `CRON_UNAUTHORIZED` | Not allowed. |
| `TERMS_NOT_ALLOWED` | The price cannot be changed or agreed on this booking now. Please reload the page. |
| `TERMS_CHANGED` | The price on this booking changed just now. Please look at the new price before you answer. |
| `TERMS_OWN_VERSION` | You proposed this price. The other person agrees to it, not you. |
| `TERMS_LIMIT` | This booking already has {max} price versions. Agree to one of them. |
| `UNIT_INVALID` | Choose how the price is counted: whole job, per day or per hour. |
| `DURATION_INVALID` | Choose how long the work will take. |
| `MATERIALS_INVALID` | Choose who buys the materials. |
| `PAYMENT_TIMING_INVALID` | Choose when the payment is made. |
| `PAYMENT_METHOD_INVALID` | Choose how the money is paid: cash, Easypaisa, JazzCash, bank or other. |
| `VISIT_CHARGE_INVALID` | Choose what happens with the visit charge. |
| `QUANTITY_INVALID` | Days: choose 1 to 60. Hours: choose 1 to 200. |
| `ADVANCE_TOO_HIGH` | The advance cannot be more than the total price. |
| `PAYMENT_NOT_ALLOWED` | A payment cannot be recorded on this booking now. |
| `PAYMENT_WINDOW_PASSED` | Payments can be recorded up to {days} days after the work closed. That time has passed. |
| `PAYMENT_LIMIT` | This booking already has {max} payment records. |
| `PAYMENT_NOT_FOUND` | Payment record not found |
| `PAYMENT_OWN_RECORD` | You recorded this payment. The other person confirms it, not you. |
| `PAYMENT_CHANGED` | This payment record was already answered. Please reload the page. |
| `PAYMENT_DATE_FUTURE` | The payment date cannot be in the future. |
| `PAYMENT_DATE_TOO_EARLY` | The payment date cannot be before the booking was made. |
| `PAYMENT_KIND_INVALID` | Choose what the payment was for. |
| `PAYMENT_REASON_INVALID` | Choose what is not right: not received, wrong amount or other. |
| `PRICE_GUIDE_NOT_FOUND` | Price guide entry not found |
| `PRICE_GUIDE_EXISTS` | An active price guide entry for this work, unit and region already exists. Edit that one. |
| `PRICE_GUIDE_LOW_HIGH` | The low price cannot be more than the high price. |
| `SOURCE_NOTE_REQUIRED` | Write where these numbers come from (at least 10 characters). |
| `REGION_INVALID` | Choose a region of Pakistan, or all of Pakistan. |
| `PRICE_GUIDE_ARCHIVED` | This price guide entry is archived and cannot be changed. |
| `PRICE_GUIDE_CHANGED` | Another admin changed this entry just now. Please reload the page. |
| `JOB_NOT_FOUND` | Job request not found |
| `JOB_LIMIT_OPEN` | You already have {max} open job requests. Close one first. |
| `JOB_LIMIT_DAY` | You saved {max} job requests in the last 24 hours. Please try again tomorrow. |
| `JOB_SKILL_CATEGORY` | Choose skills of the chosen trade only. |
| `JOB_BUDGET_INCOMPLETE` | Write the budget amount and how it is counted (whole job, per day or per hour), or leave both empty. |
| `JOB_CHANGED` | This job request was changed just now. Please reload the page. |
| `JOB_NOT_EDITABLE` | This job request cannot be changed now. Only an open job without a waiting or accepted request can be changed. |
| `JOB_NOT_OPEN` | This job request is closed, done or expired. |
| `JOB_HAS_OPEN_REQUEST` | This job already has a request to a worker. Wait for the answer, or cancel that request first. |
| `JOB_HAS_BOOKINGS` | This job was already sent to a worker, so it cannot be deleted. Close it instead. |
| `JOB_EDIT_EMPTY` | Change at least one thing before saving. |
| `BOOKING_JOB_MISMATCH` | This skill is not in the trade of the job. Choose a skill of the job's trade. |
| `TASK_TYPE_INVALID` | Choose the kind of work: install, repair, service, new work, cleaning, moving or household help. |
| `CLOSE_REASON_INVALID` | Choose why you close the job: work done, not needed, found someone elsewhere, or other. |
| `ROUTE_NOT_FOUND` | Route not found |
| `DUPLICATE_RECORD` | This record already exists |
| `DB_VALIDATION` | Invalid value for: {fields} |
| `INVALID_ID_OR_VALUE` | Invalid id or value |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable. Please try again in a minute. |
| `SERVER_ERROR` | Something went wrong on the server. Please try again later. |
