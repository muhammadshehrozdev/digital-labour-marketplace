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
| `ROUTE_NOT_FOUND` | Route not found |
| `DUPLICATE_RECORD` | This record already exists |
| `DB_VALIDATION` | Invalid value for: {fields} |
| `INVALID_ID_OR_VALUE` | Invalid id or value |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable. Please try again in a minute. |
| `SERVER_ERROR` | Something went wrong on the server. Please try again later. |
