# Decisions

Short records of project decisions. Each entry says who decided, when, and why.
Decisions are the team's; none of them has been approved by the supervisor or
the department unless an entry says so.

---

## D-001 — MERN only (8 Nov 2026)

**Decision (team):** the whole project uses MongoDB, Express, React and Node.js.
The proposal is the reference for features and scope; its Laravel/PHP and MySQL
technology choices are not followed.

**Why:** the existing Modules 1–2 are already MERN; one stack for the whole team.

**Follow-up:** the proposal's Section 7 still names Laravel/MySQL and should be
revised (see `docs/audit/audit-2026-11-06.md`).

---

## D-002 — Worker phone number is hidden from the directory (8 Nov 2026)

**Decision (team):** a worker's phone number (and WhatsApp number) must **not**
appear in the worker directory, search results or the public worker profile.
A customer sees it only after a booking between that customer and that worker
is accepted. Until a booking module exists, the directory shows **no** phone
number at all.

**Why:** privacy of daily-wage workers; a phone number visible to every
logged-in customer can be scraped and misused.

**Replaces:** the earlier hotfix choice (commit `f04ff68`) that kept the phone
in the directory so customers could contact workers.

**Consequence (accepted):** until bookings exist, customers have no way to
contact a worker through the app.

**Where implemented:** Phase 3 (directory rework), with a test that directory
and public-profile responses contain no `phone` or `whatsappNumber`.

---

## D-003 — Node.js 24 LTS (8 Nov 2026)

**Decision (team):** Node.js 24 for laptops, the dev container and Vercel,
enforced with `"engines": { "node": "24.x" }` in both `package.json` files.

**Why:** Node 20 is end-of-life; Vitest 5 needs Node 22.12 or newer and
Mongoose 9 needs 20.19 or newer.

---

## D-004 — Accepted dev-only `npm audit` advisory in nodemon (8 Nov 2026)

**Decision (team):** accept the 2 moderate `npm audit` findings in the backend
that come from `nodemon` → `minimatch` (GHSA-g3hv-75wg-m249, denial of service
via glob patterns).

**Why accepted:** `nodemon` is a `devDependency` used only on developer
machines to restart the server after a file change. It is never deployed to
Vercel and never handles user input. The only automatic fix
(`npm audit fix --force`) downgrades nodemon to 3.1.11, a breaking change.

**Review:** re-check with `npm audit` in each phase; upgrade nodemon as soon as
a release depends on a fixed `minimatch`.

**Other advisories fixed in Phase 1 (non-breaking `npm audit fix`):**
backend `body-parser` 2.3.0 → 2.4.0 (high), `qs` 6.16.0 → 6.17.1 (moderate);
frontend `follow-redirects` 1.16.1 → 1.16.3 (high).

---

## D-005 — Password rules (9 Nov 2026)

**Decision (team, option a):** a new password needs **at least 15 characters**. Passphrases
are encouraged (for example four Roman Urdu or English words with spaces). No "must contain
a symbol/number" rules. Passwords longer than **72 bytes** are rejected
(`Buffer.byteLength(pw, 'utf8') > 72`) because bcrypt ignores everything after 72 bytes;
an Urdu letter takes 2 bytes. Hashing: bcrypt, **cost 12**.

**Why:** OWASP's Authentication Cheat Sheet asks for at least 15 characters when there is
no multi-factor login. A passphrase is easier for our users than a short complex password.

**Where:** `backend/validators/common.js` (`newPassword`), `backend/models/User.js`
(`BCRYPT_COST`), same rule in `frontend/src/utils/password.js`.

**Note:** login does not apply the length rule, so accounts created before 9 Nov 2026
with shorter passwords can still log in. There is no "change password" feature yet.

---

## D-006 — Login token storage: HttpOnly cookie (Option A) (9 Nov 2026)

**Decision (team):** the login token (a JWT) is kept in a cookie the page's JavaScript
cannot read, not in `localStorage`.

- Cookie `dlm_session`: `HttpOnly; Secure; SameSite=Strict; Path=/api`.
- JWT: algorithm pinned to HS256; `iss` (`dlm-api`), `aud` (`dlm-web`) and `exp` checked.
- Session length: **8 hours** (our default for "one working day"; change `SESSION_HOURS`
  in `backend/services/session.js` if the team wants another value).
- CSRF check: for POST/PUT/PATCH/DELETE the `Origin` header must be in `CLIENT_ORIGIN`;
  without `Origin`, a `Sec-Fetch-Site` of `cross-site`/`same-site` is refused (403).
  The archived `csurf` package is not used.
- Server-side logout: each user has `tokenVersion`; it is inside the token, checked on
  every request, and increased at logout, so old tokens stop working (on all devices).
- Locally the browser talks only to Vite (`http://127.0.0.1:5173`), which forwards `/api`
  to the backend (`frontend/vite.config.js`), so the cookie is same-origin.

**Not done yet (Phase 8):** the same-origin Vercel rewrite (`/api/*` → backend) and its
test on a Preview deployment. Until then this branch must **not** be deployed: the
deployed frontend would call `/api` on its own domain, which has no backend yet.

**Why:** OWASP's Session Management Cheat Sheet says not to keep tokens in `localStorage`
(any injected script can read it).

---

## D-007 — CNIC: encrypted + keyed hash, admin-only reveal (Option 2) (9 Nov 2026)

**Decision (team):** store the CNIC encrypted with **AES-256-GCM** (`CNIC_ENC_KEY`), plus an
**HMAC-SHA256** hash (`CNIC_HASH_KEY`) with a unique index so one CNIC cannot be used for
two accounts. Only admins can see the full number, through
`GET /api/admin/workers/:id/cnic`, and **every reveal writes the audit log first**
(the audit entry never contains the number).

**Why:** the team's assessment document says only admins may see CNIC numbers, and admins
need to read them back. Option 1 (hash only, nothing to read back) was not chosen.

**Details**
- The owner's user id is bound into the encryption as "additional authenticated data",
  so an encrypted CNIC copied onto another account cannot be decrypted.
- The CNIC is never sent to the worker either (they see "Saved (hidden)"); customers and
  other workers never see that a CNIC exists.
- A worker who saves a **new** CNIC goes back to identity status `Pending` (audited).
- Format checked on the server: `#####-#######-#` (dashes optional).
- Old plain-text `cnicNumber` values: `npm run migrate:cnic` (dry run by default; refuses
  a non-local database unless `--allow-remote`). **Not run on Atlas** — ask the team first.
- No CNIC image upload in this version.

**Key handling** — see `docs/SECURITY.md`, section "Keys".

---

## D-008 — Provisional trade category list (9 Nov 2026)

**Decision (Claude Code, provisional — team approval needed in Phase 4):** one list in
`backend/config/skillTaxonomy.js`, served by `GET /api/meta/taxonomy`. It is the 8
categories the UI already had, plus **Domestic Work**:
Electrical & Solar, Plumbing & Sanitary, Construction & Masonry, Carpentry & Woodwork,
Painting & Renovation, AC & Appliance Repair, Home Maintenance, Cleaning & Shifting,
Domestic Work.

**Why:** fixes M1-16 (UI had 8, profiler 6, domestic work in neither) without inventing new
categories before the team decides. The database stores an id (e.g. `electrical_solar`);
old labels are converted on save and by `npm run migrate:categories`.

**Open:** the final category and skill list (CLAUDE_CODE_PROMPT.md C5) and the ISCO-08 codes
(all `null` until checked against the official ISCO-08 list).

---

## D-009 — Identity verification rules (9 Nov 2026)

**Decision (Claude Code, following CLAUDE_CODE_PROMPT.md C4/C6):**
- `verificationStatus` = identity only: `Unverified` (new) → `Pending` (CNIC saved) →
  `Verified` or `Rejected` by an admin. Skill verification is Module 3.
- An admin decision always needs a note (5–500 characters, e.g. how the CNIC was checked);
  there is no default status. `Verified` is refused if no CNIC is on file.
- The update is conditional on the status the admin last saw; a stale screen gets 409.
- Every decision is written to the hash-chained audit log (who, when, from, to, note).
