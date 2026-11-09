# Security

The full threat → mitigation → test table is finished in Phase 7. Below: what Phases 2–3
built (with the test that proves it), how keys are handled, accepted limitations, and incidents.

## Module 1 controls (Phases 2–3)

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

## Keys (CNIC_ENC_KEY, CNIC_HASH_KEY, JWT_SECRET)

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

## Accepted limitations (Phases 2–3)

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
