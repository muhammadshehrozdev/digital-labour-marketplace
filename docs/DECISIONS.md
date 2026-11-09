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

**Update (Batch 1, 9 Nov 2026):** the team approved the list for Phase 4 with one change:
"Cleaning & Shifting" overlapped with "Domestic Work". **Reason for the split:** cleaning a home
is domestic work, while shifting (moving goods) is a different job with different skills, tools
and pricing; one category for both made search results mix maids and movers. So cleaning moved
into Domestic Work and **Moving & Loading** became its own category. Final list: **D-012**.

---

## D-009 — Identity verification rules (9 Nov 2026)

**Decision (Claude Code, following CLAUDE_CODE_PROMPT.md C4/C6):**
- `verificationStatus` = identity only: `Unverified` (new) → `Pending` (CNIC saved) →
  `Verified` or `Rejected` by an admin. Skill verification is Module 3.
- An admin decision always needs a note (5–500 characters, e.g. how the CNIC was checked);
  there is no default status. `Verified` is refused if no CNIC is on file.
- The update is conditional on the status the admin last saw; a stale screen gets 409.
- Every decision is written to the hash-chained audit log (who, when, from, to, note).

---

## D-010 — Design system (Batch 1, 9 Nov 2026)

**Decision (team brief, BATCH_1_PROMPT.md Part 3; implemented by Claude Code):** one design
system for the whole frontend: tokens in `frontend/src/styles/tokens.css` (Trust Green primary,
Saffron accent, warm stone neutrals, semantic roles), Manrope self-hosted
(`@fontsource-variable/manrope`, no Google request), lucide-react icons, CSS Modules, a component
library in `frontend/src/components/ui/`, light theme only (semantic role tokens ready for a
dark theme later). Mobile first (360 px). Details: `docs/design/03-design-system.md`.

**Two measured deviations from the brief** (`frontend/src/styles/contrast.test.js` enforces both):
1. Focus ring: the brief's 3 px primary-300 measures **2.15:1** on white, below its own 3:1 rule.
   The focus indicator is a **2 px primary-600 outline (6.46:1)** with a 2 px offset **plus** the
   primary-300 halo.
2. Saffron-700 on saffron-100 measures **3.53:1** (needs 4.5:1 for small text). Accent badges
   use **stone-900 text on saffron-100**; saffron is never used for text.
Also: input borders use stone-500 (4.62:1) because input borders must reach 3:1; card borders
(decorative) keep stone-200.

**Packages (approved in the brief):** lucide-react **1.61.0** (ISC licence, released 21 Oct 2026 —
the newest release at least two weeks old; the project publishes almost daily) and
@fontsource-variable/manrope **5.3.0** (OFL-1.1, released 19 Jul 2026). `npm audit`: 0 vulnerabilities.

---

## D-011 — Guided worker onboarding (Batch 1, 9 Nov 2026)

**Decision (team brief, Part 5.2):** after registering, or logging in with onboarding unfinished,
a worker goes to a step-by-step wizard: 1 About you → 2 Your work → 3 Your skills (Module 2;
opens by itself after step 2 is saved) → 4 Proof of skills (Module 3, "coming next", Skip) →
5 All set. Module 2 is **not** in the top menu; skills are edited from the dashboard and profile.

**Progress comes from the server**, never from localStorage: `GET /api/workers/me/onboarding`
**derives** it from saved data every time (`backend/services/onboarding.js`):
about = name, phone, city; work = category, occupation, experience, at least one rate > 0;
skills = at least one confirmed skill. `onboardingCompletedAt` is stored the first time all
three are done. Consequences (accepted):
- A worker who removes every skill is sent back to step 3 (skills) until they add one.
- Profile fields no longer have pretend defaults (city was "Islamabad", occupation "General
  Technician", category "Home Maintenance"); empty means "not filled in yet".
- The customer directory lists only workers who finished "Your work" (a card needs a trade).

---

## D-012 — Final category list and skill list v1 (Batch 1, 9 Nov 2026)

**Categories (approved by the team, with the D-008 change):** Electrical & Solar, Plumbing &
Sanitary, Construction & Masonry, Carpentry & Woodwork, Painting & Renovation, AC & Appliance
Repair, Home Maintenance, **Domestic Work (includes cleaning)**, **Moving & Loading**. Ids are
stable slugs (`domestic_work`, `moving_loading`, …) so labels can change without breaking data.
Old values "Cleaning & Shifting" / `cleaning_shifting` map to `domestic_work`; the migration
counts them separately so an admin can check those profiles by hand.

**Skills v1 (Claude Code, for the team to review with real data):** 50 skills
(electrical 9, plumbing 7, masonry 6, carpentry 6, painting 5, AC & appliance 6, home
maintenance 2, domestic work 6, moving & loading 3), taken from the old profiler's rules (the
team's earlier work) plus domestic work and moving. Each skill has **strong** terms (clear trade
words) and **weak** terms (everyday words such as fan, tap, table, lock, ups) in English, Roman
Urdu and Urdu script. A weak term counts only with a strong term of the same category. Roman Urdu
words that are also everyday words were left out or made weak ("aaya" = came; "masi" = aunt).

**ISCO-08 codes:** still `null`. They are filled in only after a team member checks each code
against the official ILO ISCO-08 list (rule in the brief); that list could not be opened from the
dev container.

**Not changed by this decision:** the rule-based extractor is evaluated only on real data
(`docs/evaluation/`); the skill list will change after the development-set error analysis,
and the test set must be frozen before that.

---

## D-013 — Evidence files are stored in MongoDB (Batch 2, 9 Nov 2026)

**Decision (team, BATCH_2_PROMPT.md Part 1):** an `Evidence` document holds metadata only; a separate
`EvidenceFile` document holds the processed image bytes (BinData). List endpoints never load bytes.
Not GridFS and not Vercel Blob in this version.

**Why:** free, no extra service or key, works offline in tests (in-memory MongoDB), and files are
private by design (reachable only through our API). Processed photos are WebP, at most 2000 px on the
longest side; uploads are capped at 4 MB, far below MongoDB's 16 MB document limit, so GridFS (made for
files above 16 MB) is not needed.

**How to switch later:** all file access goes through `backend/services/evidence/storage.js`
(`save`, `read`, `remove`). A private Vercel Blob store could replace that one file.

**Limits (accepted):** MongoDB Atlas free tier has 0.5 GB shared with all data; the limits
(5 items per skill, 30 per worker, 4 MB upload, re-encoding) keep usage small. Real sizes are to be
measured during user testing; the synthetic test images are tiny and say nothing about real sizes.

---

## D-014 — Skill confidence method, provisional weights and strength labels (Batch 2, 9 Nov 2026)

**Decision (team, Part 1; built by Claude Code):** `backend/services/trust/skillConfidence.js`, a pure
function. Beta-style evidence counting in subjective-logic form with W = 2 and base rate a = 0.5:
b = r/(r+s+W), d = s/(r+s+W), u = W/(r+s+W), E = b + a·u (equal to the Beta expectation (r+1)/(r+s+2)).
Reference as given in the audit report: Jøsang & Ismail 2002, "The Beta Reputation System"
(https://mn.uio.no/ifi/english/people/aca/josang/publications/ji2002-bled.pdf). The audit warns that
the formulas were read from PDFs and must be checked against the original papers before quoting.

**Provisional weights (design parameters, not facts):** approved certificate r += 2; approved work
photo or reference letter r += 1; suspected fake s += 1; pending, rejected and revoked items and the
worker's own claim count 0. `npm run confidence:sensitivity` prints how E changes with other weights
and shows the two known weak points (a certificate plus one fake still gives 0.60 > 0.50; five work
photos give 0.857 > one certificate's 0.75).

**Status rule:** Disputed if any suspected fake exists; else Verified by evidence if ≥ 1 approved item;
else Evidence pending if an item waits; else Self-declared. (Property and invariant tests.)

**Strength labels (Claude Code's provisional thresholds):** none = no counted evidence; strong
E ≥ 0.80 (e.g. certificate + work photo); moderate 0.65 ≤ E < 0.80 (e.g. one certificate, one or two
work photos); weak E < 0.65 (e.g. certificate + suspected fake, or a fake alone).

**What people see:** workers and customers see the chip, "Evidence: N approved" and the strength word,
never a percentage and never b, d, u, E. Admins see b, d, u, E with a method note in Evidence review
(API field `opinion`). Numbers are computed on demand and are not stored on the profile.

---

## D-015 — Evidence review states and deletion rules (Batch 2, 9 Nov 2026)

**Decision (team, Part 1; details by Claude Code):**
- States: `pending → approved`; `pending → rejected` (reason code `unclear | not_relevant | wrong_skill |
  other`, "other" needs words); `pending or approved → suspected_fake` (written reason); `approved →
  revoked` (written reason, to correct a mistaken approval). Every other transition → 400.
  `rejected`, `suspected_fake` and `revoked` are final in this version; an appeal/dispute flow belongs to
  a later module (Modules 4–12 are out of scope).
- Decisions are atomic (update only if the status is still the one read); a second admin gets 409.
- Every change is written to the hash-chained audit log: `evidence.uploaded`, `evidence.approved`,
  `evidence.rejected`, `evidence.suspected_fake`, `evidence.revoked`, `evidence.deleted`.
- A worker may delete only own `pending` or `rejected` items. `suspected_fake` can never be deleted
  (409), and `approved`/`revoked` items stay as review history.
- A skill with reviewed proof (approved, revoked or suspected fake) cannot be removed from the profile
  (409); otherwise a worker could hide a suspected-fake finding by deleting the skill.

---

## D-016 — Upload processing and duplicate detection (Batch 2, 9 Nov 2026)

**Decision (team, Part 1; details by Claude Code):**
- Images only (JPEG, PNG, WebP), detected from the bytes with `file-type`; HEIC → "Please upload a JPG
  or PNG photo."; PDF → 400; the browser's type and the file name are ignored.
- `sharp`: `autoOrient()`, fit inside 2000 × 2000 without enlarging, WebP quality 80, input limit
  50 megapixels (decompression-bomb guard), `failOn: 'warning'`. sharp keeps no metadata unless asked,
  so EXIF (including GPS) is removed; only the processed file is stored.
- **SHA-256 of the processed file** (Batch 2 decision; the earlier C6 text said "original bytes"):
  processing is deterministic, so the same upload gives the same hash, and two copies that differ only
  in metadata collapse to one. Same worker + same skill + same hash → 409. Same hash from another
  worker → accepted (201) and flagged `possibleDuplicateOf` (exact).
- **dHash** (64-bit, sharp only, no new package): another worker's image within Hamming distance
  ≤ 10 is flagged as `similar` (never auto-rejected). The threshold is **provisional**, to be measured on
  our own photos. Limitations in `docs/SECURITY.md`.
- Consent checkbox required ("I own this photo or have permission to share it, and it shows no other
  person's private information."); the time is stored as `consentAt`.
- Browser side (no package): the same type checks and messages; photos over 4 MB are shrunk with a
  `<canvas>` (max 2000 px, JPEG 0.85) when the browser can, otherwise "The photo is too large. The limit
  is 4 MB." The server checks everything again.
- Limits: 4 MB per upload (413), 5 items per skill, 30 per worker, 30 uploads per 15 minutes per network.
