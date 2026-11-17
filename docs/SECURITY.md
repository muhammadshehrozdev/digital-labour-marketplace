# Security

Each threat → mitigation → the automated test that proves it (mapped to the audit IDs), how keys
are handled, accepted limitations, and incidents. Test files: backend `backend/tests/`, frontend `frontend/src/`.

## Project security rules

These rules apply to every change. (They used to live only in the team's internal working notes.)

- Admin accounts are created only by the `create-admin` script. Public registration accepts only `worker`
  or `customer`.
- Never send `password`, CNIC data, home address, emergency contact or email to anyone except the owner or
  an admin. A worker's phone and WhatsApp number never appear in the directory or search results; a
  customer sees them only after a booking between them is accepted (no booking module yet, so no customer
  sees them). Every public response uses an explicit field list (projection). Never write a CNIC number into
  logs or the audit log.
- Validate every request body, query and URL parameter on the server with the shared validation schemas;
  reject bad input with 400 and a clear message.
- Never build a `RegExp` from user text without escaping it. Never pass user objects straight into a
  MongoDB filter.
- Never return raw `error.message` from a 500 error: log it on the server, send a generic message.
- Check roles and ownership on the backend for every protected route. The React route guard is only for
  user experience.
- Uploaded files: allow-list types by content (magic bytes), enforce size limits, rename files, strip image
  metadata, keep files private, and serve them only to the owner and admins.
- No secrets in code or in Git. Use `.env` (local) and Vercel environment variables; keep `.env.example`
  updated with placeholder values only.
- Tests use a separate test database or an in-memory MongoDB, never a real database.

## Threats, mitigations and tests (Modules 1–3)

| Audit ID | Threat | Mitigation | Test (backend `tests/`, frontend `src/test/`) |
|---|---|---|---|
| M1-1 | Anyone registers as admin | Register schema allows only `worker`/`customer`; admins only via `npm run create-admin` (audited) | `integration/auth.test.js` "M1-1…", `integration/hotfix-critical.test.js`, `auth.test.jsx` "offers only Worker and Customer" |
| M1-2 | Directory leaks private data | Explicit projection; user `name` only; workers get 403 | `integration/directory.test.js`, `hotfix-critical.test.js` |
| M1-3 | Regex crash / injection in search | Length ≤ 50, every special character escaped | `directory.test.js` "search C++ and (" |
| M1-4 | Query operator injection | Strict zod query schema (one string per key, known values); `sanitizeFilter` on everywhere | `directory.test.js` "category[$ne]=x … nothing reaches MongoDB" |
| M1-5 | Missing/invalid input → 500 | zod schema on every body, query and URL parameter → 400 with message | `auth.test.js` "M1-5", `foundation.test.js` "no body" |
| M1-6 | Negative rates, bad CNIC, bad enums | Ranges/formats/enums in zod and in the Mongoose schema | `workers-profile.test.js` "(M1-6)" |
| M1-7 | Internal error text sent to browser | Central error handler, generic 500 message, details only in server log | `foundation.test.js` "hides internal error messages" |
| M1-8 | Worker ID clashes | Atomic per-year counter (`$inc`) | `workers-profile.test.js` "200 profiles … 50 at the same moment" |
| M1-9 | One-click "Verified", no record | Decision needs status + note, conditional update, audit log | `admin.test.js` "PATCH …/identity (M1-9)" |
| M1-10 | Password guessing, open CORS, no headers | Per-account lockout (5 → 15 min), IP limit on failed auth, CORS allow-list, helmet | `auth.test.js` "account lockout", `auth-rate-limit.test.js`, `foundation.test.js` CORS/helmet |
| M1-11 | Token theft from localStorage, no logout, no 401 handling | HttpOnly cookie, HS256 + iss/aud/exp, tokenVersion logout, Origin CSRF check, 401 → login | `auth.test.js` "login…", "CSRF…", `auth.test.jsx` "a 401 on a protected page" |
| M1-12 | Unclear failures when DB/config missing | `config/env.js` fails fast; cached connection; 503 when DB is down | `foundation.test.js` "config/env.js", `db-down.test.js` |
| M1-13 | Duplicate route mounts, no 404 | One mount under `/api`, JSON 404 | `foundation.test.js` "routes are mounted once", "unknown route" |
| M1-14 | Weak user schema | lowercase/trim/maxlength, `password` `select:false`, bcrypt cost 12 | `auth.test.js` "M1-14: user schema" |
| D-007 | CNIC exposure | AES-256-GCM + HMAC, select:false, toJSON strip, audited admin-only reveal | `unit/cnic.test.js`, `workers-profile.test.js` "CNIC", `admin.test.js` "reveal" |
| — | Audit log tampering | Append-only hooks + SHA-256 hash chain, `npm run audit:verify` | `admin.test.js` "audit log: append-only and hash-chained" |
| M2-2/M2-3 | A tool silently overwrites or wipes a worker's profile | Extract endpoint saves nothing; skills change only through explicit add/remove routes; no "reset" route | `skills.test.js` "never changes the database", "hello", "old profiler routes are gone" |
| M2-9/M2-11 | Free-text skills / oversized input | Skills only by taxonomy id (custom skills through a separate, marked route, max 10); text ≤ 2,000 characters; strict schemas | `skills.test.js` "unknown skillId -> 400", "-> 400 (M2-11)" |
| Batch 1 | Admin audit viewer leaks data | Read-only route, admin only, no hashes in the response; entries never contain a CNIC | `skills.test.js` "admin overview and audit viewer" |
| Batch 1 | Private data on customer screens | API projections (D-002) **and** UI tests with a deliberately leaky server response | `pages.test.jsx` "customer pages (D-002)" |
| M3 | Malicious file disguised as a photo (script, PDF, HEIC, polyglot) | Type from the bytes (`file-type`), allow-list JPEG/PNG/WebP, the browser's type and name ignored, every image decoded and **re-encoded** to WebP by sharp (anything that does not decode is refused) | `evidence.test.js` "text file renamed to .jpg", "PDF", "HEIC", "corrupt JPEG" |
| M3 | Location / camera data leaking from photos | sharp drops all metadata (EXIF incl. GPS, ICC); only the processed file is stored | `evidence.test.js` "a real JPEG with GPS EXIF -> 201; the stored file is WebP with no EXIF and no GPS" |
| M3 | Oversized uploads / decompression bombs / upload flooding | multer memory storage with 4 MB, 1 file, 5 fields, 6 parts → 413; sharp input limit 50 MP; 30 uploads per 15 min per network; 5 per skill, 30 per worker | `evidence.test.js` "a 5 MB file -> 413", "at most 5 proof items per skill" |
| M3 | Someone else's photos viewed or deleted | File route checks owner or admin inside the handler (others 404, customers 403); `Cache-Control: private, no-store`, `nosniff`; ids never in public responses | `evidence.test.js` "who can see and delete evidence" |
| M3 | Customers seeing evidence | Public projections list only chip, approved count and strength; UI tests feed a leaky response and check no `<img>` | `evidence.test.js` "customers never get images…", `evidence.test.jsx` "customers never see evidence images" |
| M3 | Hiding a suspected-fake finding | Worker cannot delete `suspected_fake` (409) nor remove a skill with reviewed proof (409); "Disputed" wins over "Verified" | `evidence.test.js` "a worker cannot delete a suspected fake, and the skill stays Disputed" |
| M3 | Two admins deciding at once / stale screens | Conditional `findOneAndUpdate` on the read status → 409 | `evidence.test.js` "two simultaneous reviews…" |
| M3 | Re-using another worker's photo | SHA-256 (exact) and dHash (look-alike) flags for the admin | `evidence.test.js` "same file from another worker", "look-alike picture … flagged similar" |
| M3 | Tampering with review history | Every evidence change audited; hash chain checked by `npm run audit:verify` | `evidence.test.js` "audit:verify detects an edited evidence decision" |

### Batch 3 additions
| Area | Control | Test |
|---|---|---|
| `GET /api/auth/session` | Same user fields as `/api/auth/me` (no password, token version, lockout data); 200 with `{ user: null }` for visitors and for a broken or ended session, whose cookie is removed; `Cache-Control: no-store` | `preferences.test.js` |
| `PATCH /api/users/me/preferences` | Login required; strict schema (only `preferredLanguage`, enum); unknown keys such as `role` → 400; CSRF origin check | `preferences.test.js` |
| `GET /api/workers/me/full` | Worker only; own data; `publicView` built with the customer endpoint's own query and field list; evidence metadata only (no file ids, no hashes); no CNIC data | `preferences.test.js`, e2e `profile-and-privacy.e2e.js` |
| Error codes | Every error has a stable `code`; a 500 still sends only `SERVER_ERROR` with a generic message | `errorCatalog.test.js`, `foundation.test.js` |
| Language storage | `localStorage` holds only the language code, wrapped in try/catch | `i18n.test.jsx` |
| Browser tests | Headless Chromium only for `127.0.0.1` pages, own servers and own local `dlm_e2e` database; a reset refuses any database that is not local or not named `*_e2e` | `e2e/global-setup.js` |

### Batch 4 additions
| Area | Control | Test |
|---|---|---|
| Account suspension | Admin only; reason (5–300, no CNIC) required; cannot suspend yourself or another admin; `tokenVersion` +1 ends every session at once; the session check also refuses a suspended account; login says "suspended" only after the correct password (no account guessing); suspended workers hidden from directory, profile, compare, saved lists; audited | `batch4-features.test.js` "admin user management" |
| User list | Explicit field list (no password, token version or failed-login count); search text escaped; strict query schema | `batch4-features.test.js`, `admin.test.js` |
| Notifications | Created only by the server on real decisions; params allow-list (no CNIC, no contact data); every read and update filtered by the logged-in user (someone else's id → 404) | `batch4-features.test.js` "notifications", `unit/batch4-services.test.js` |
| Saved workers, compare | Customer only (workers 403); public field list only; suspended or unlisted workers left out; at most 100 saved | `batch4-features.test.js` "saved workers and compare" |
| CSV exports | Admin only; audited **before** the file is sent; explicit columns (no CNIC fields, no password, no address, no images); any CNIC-like number in a free-text cell replaced; spreadsheet formula injection neutralised (`=`, `+`, `-`, `@`, tab, return → leading apostrophe); 5,000 rows at most; `no-store` | `batch4-admin.test.js` "CSV exports", `unit/batch4-services.test.js` "csv" |
| Audit chain check | `GET /api/admin/audit/verify` (admin only) runs the same check as `npm run audit:verify`; a raw database edit is reported with its entry number | `batch4-admin.test.js` "audit-chain status" |
| Notes and reasons | Identity notes, evidence notes, suspension reasons and templates refuse CNIC-like numbers (`NOTE_HAS_CNIC`), so the audit log never receives one | `batch4-features.test.js` "a decision note with a CNIC number is refused" |
| Preferences | `preferredTheme` and `preferredTextSize` validated (enums); at least one setting; unknown keys → 400 | `preferences.test.js` |
| Service worker | Caches static files only; never looks at `/api/` requests; skips any answer marked `no-store` or `private`; registered only in production builds | `app-batch4.test.jsx` "installable app" |
| Browser storage | Only per-device conveniences: language, theme, text size, drafts (never the CNIC field), recently viewed (public card fields), compare list (worker ID and public name, per tab), tour/milestone flags; every access in try/catch | `worker-batch4.test.jsx` "drafts", `customer-batch4.test.jsx` "recently viewed" |
| No-flash script | The only inline script (`index.html`) reads two keys and sets two attributes; no user data. A future Content-Security-Policy needs its hash | `theme.test.jsx` "no flash" |

### Batch 5 additions (Listen, Speak, See; frontend only)
| Area | Control | Test |
|---|---|---|
| Voice typing | The browser's own Web Speech API; our code calls no speech or AI service and holds no key. **Never offered for passwords, CNIC or email**, checked inside the help row itself (`assistRules.js`), so a page cannot switch it on; announced once in a dialog before first use (the browser maker's online service may receive the audio) | `assist.test.jsx` "never voice typing for password, CNIC or email", `assistCoverage.test.jsx`, e2e `easy-mode.e2e.js` |
| Reading answers aloud | Never for passwords, CNIC or email. Device voices are preferred to online voices; where a language has only an online voice (for example Chrome's "Google …" voices), help texts and read-back answers (name, mobile number) are spoken through that service (stated in D-035) | `assist.test.jsx` "an Urdu text gets an Urdu voice" (device voice first) |
| Spoken numbers | Nothing is written when any part of a spoken number is not understood (a wrong phone number is worse than an empty box); the value goes through the same masks and checks as typing | `spokenNumbers.test.js` |
| Sound settings | One `localStorage` key (`dlm.assist.v1`): show buttons, auto-read, notice accepted, pages seen. No personal data; never sent to the server; every access in try/catch | `assist.test.jsx` "sound settings of this device" |
| Recorded clips | Static public files of the team's own voices (no personal data); the service worker caches them (cache first, fetched whole); `/api/` still never cached | `assistClips.test.js` "service worker and clips" |
| Clip recorder | Development builds only (`/dev/recorder`, not in production); saves files locally on the team member's computer | build: the route exists only when `import.meta.env.DEV` |
| Speaking | Never on page load (only after a first touch), never by itself unless the person switched read-aloud on, one sound or microphone at a time, Escape and leaving the page stop everything | `assist-pages.test.jsx` "auto-read" |

## Threats, mitigations and tests (Module 4, Batch 6)

| Threat | Defence | Test |
|---|---|---|
| Fake praise (a worker praises himself) | Reviews only after a booking both people confirmed; one per booking; `BOOKING_SELF` (same phone or WhatsApp on both sides); reviews from accounts that hired nobody else count half; rule `new_account_praise` flags it | `integration/reviews-reputation.test.js` "only the customer of a completed booking…", "new_account_praise…"; `bookings.test.js` "BOOKING_SELF…"; simulation `sybil_*` (SIMULATION only) |
| Fake accounts (Sybil) | As above; the request limits; a flag never changes a score by itself, an admin decides | `bookings.test.js` "limits…"; simulation `sybil_*`, `smart_sybil_*` (SIMULATION only: recent fakes still buy places, MODULE-4.md §5.3) |
| Repeat-pair collusion | The k-th review of the same customer counts 1/k; rule `repeat_pair_burst` | `reputationEngine.test.js` "three 5 star from the SAME customer"; `reviews-reputation.test.js` "repeat_pair_burst…"; simulation `pair_collusion` |
| Fake bad reviews | No review without a completed booking that both confirmed (or an admin decided); worker reply and report; admin hides abusive/unrelated/fake reviews with a reason (never for being negative) | `reviews-reputation.test.js` "an admin hides a review…", "reply once… report once…" |
| Contact leak before acceptance (around D-002) | Contact block only from `GET /api/bookings/:id`, only accepted / 7 days after close; contact-info check on every free text (email, link, CNIC-like, 10+ digits in Western, Urdu, Arabic digits) | `bookings.test.js` "phone numbers (D-002)…" (lists, admin views, notifications), `unit/bookingRules.test.js` "contact-info check…", `reviews-reputation.test.js` "CSV… no phone numbers" |
| Double actions, stale screens | Every step is one conditional update on the checked state: 409 `BOOKING_CHANGED` / `DISPUTE_ALREADY_DECIDED` / `REVIEW_STATUS_CHANGED` / `FLAG_ALREADY_DECIDED` | `bookings.test.js` "two accepts at the same time…", "a step based on a stale read…"; `reviews-reputation.test.js` "409 on a second decision" |
| Sweep races and cron replays | Every timer is a conditional update; the sweep is idempotent; the cron needs `Bearer <CRON_SECRET>` (constant-time), 401 without it or when unset | `bookings.test.js` "expiry… running the sweep twice changes nothing more", "GET /api/cron/daily: 401…" |
| Someone else's booking | Every booking query includes the user's own id → 404, not 403 | `bookings.test.js` "worker B cannot see or act on worker A's booking…" |
| Tampering with reputation inputs | `booking.completed`, `booking.closed`, `review.created` (rating only), `review.hidden`, `review.restored`, `dispute.opened`, `dispute.decided`, `flag.created`, `flag.decided`, `export.bookings`, `export.reviews` are in the hash-chained audit log, so every input of a score is tamper-evident (`npm run audit:verify`) | `bookings.test.js` "every booking audit entry is in the hash chain…", `reviews-reputation.test.js` "the audit chain still verifies" |
| A rating number invented on the website | Stars only in `src/features/reputation/`, never with a hard-coded value; public numbers equal what is computed from stored reviews | `frontend honesty.test.js`, `reputation-honesty.test.jsx`; backend "every public rating number equals…" |

Known limits: numbers written as words pass the contact-info check; request limits are counts, not locks; demo
data is written straight into the demo database (not audited).

## Keys (CNIC_ENC_KEY, CNIC_HASH_KEY, JWT_SECRET; Module 4 adds the optional CRON_SECRET)

- Each key is 32 random bytes, written in base64. Make one in PowerShell (in `.\backend`):
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
  `CNIC_ENC_KEY` and `CNIC_HASH_KEY` must be **different**; the server refuses to start otherwise.
- Where they live: only in `backend/.env` on the developer's computer (gitignored) and, from
  Phase 8, in Vercel environment variables. Never in Git, the database, logs or chat.
  The local preview keys were generated on 9 Nov 2026 and are for the local database only.
- **Losing `CNIC_ENC_KEY` makes every stored CNIC unreadable** (workers would have to enter
  it again). Keep a copy in a password manager that only the team can open.
- A CNIC has only 13 digits. Anyone who steals **both** the database **and** `CNIC_HASH_KEY`
  can hash every possible number and find which CNICs are stored; with `CNIC_ENC_KEY` they
  can read them directly. So the keys must be kept apart from the database.
- Rotation: encrypted values start with a version (`v1.`). A new key would be `v2`, with a
  script that decrypts with v1 and re-encrypts with v2. Not built yet.
- Since INC-001 (below), all Vercel environment variables count as exposed: generate **new**
  CNIC keys and a new `JWT_SECRET` for Vercel in Phase 8; never reuse the local ones.

## Accepted limitations

- **Keys in environment variables, not a key-management service** (OWASP prefers one). Accepted for an FYP.
- **IP rate limit is in memory**, one store per server instance; on Vercel it is partial protection.
  Real protection: per-account lockout + one Vercel Firewall rule on `/api/auth/*` (Phase 8).
  `trust proxy` is 0 until Phase 8 measures the right value on a Preview deployment.
- **Lockout can be abused**: anyone who knows a user's email can lock that account for 15 minutes
  by typing 5 wrong passwords. Accepted; the login message does not reveal whether an email exists.
- **Logout ends every session of that user** (all devices), because one `tokenVersion` is shared.
- **One admin decides alone** (no two-person approval) for identity decisions.
- **Audit log:** the hash chain detects edited, inserted or deleted entries in the middle, but not
  deletion of the newest entries at the end, and an action and its audit entry are two separate
  writes (no transaction), so a crash between them can leave a change without its entry.
- **Perceptual hash (dHash) limits (Module 3):** it flags look-alikes but can be fooled on purpose
  (cropping, rotating, mirroring, filters, adding borders), and it can flag honest uploads that only look
  alike (two workers photographing the same printed certificate template, or very plain photos). So it
  never rejects anything: it only warns the admin, who decides. The threshold (distance ≤ 10 of 64 bits)
  is provisional and must be measured on our own photos.
- **Evidence review is one admin's judgement**; a determined forger with a good fake certificate can
  still pass. "Verified by evidence" means "an admin approved a photo", not "officially certified".
- **Evidence bytes in MongoDB** share the free 0.5 GB Atlas tier with all other data (D-013).
- **Secure cookie on http://127.0.0.1:** browsers accept `Secure` cookies on localhost/127.0.0.1;
  everywhere else HTTPS is required (Vercel uses HTTPS).

## Incidents

### INC-001 — Stolen Vercel account token misused (8–9 Nov 2026)

Facts as reported by the team. No token values or secrets are recorded here.

**What happened**
- Someone used a stolen Vercel account token to:
  - create deploy hooks on all three Vercel projects,
  - change the build command so that it printed the environment variables, encoded in base64, into the build logs,
  - add a `NODE_OPTIONS` environment variable,
  - then delete those deployments.

**Origin:** not confirmed. Suspected: token theft from the team's old PC.

**Impact (assumed):** every environment variable set on the Vercel projects
must be treated as exposed, because the build logs contained them.

**Response**
- All Vercel tokens and deploy hooks deleted.
- Passwords changed and two-factor authentication (2FA) enabled on GitHub, Vercel and Gmail.
- MongoDB Atlas database password, `MONGO_URI` and `JWT_SECRET` rotated (replaced with new values).
- An unused Gemini API key removed.

**Scope note:** the dev container and Claude Code had no Vercel access.

**Side effect of the response:** rotating `JWT_SECRET` makes every existing login token invalid, so all users must log in again.

**Follow-up (open)**
- Phase 8: before the next deployment, check the Vercel projects' build command,
  environment variables and deploy hooks against the expected settings.
