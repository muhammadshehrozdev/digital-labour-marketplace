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

**Images only (Batch 4 note, Part 6.1).** The proposal's Module 3 text says "upload of certificates, work
samples, photographs and other skill evidence". We accept **photos only** (JPEG, PNG, WebP) for all of them:
a certificate or a reference letter is uploaded as a **photo of the paper**, not as a PDF or Word file.
Why: every upload is decoded and re-encoded by sharp, which removes hidden content and metadata (EXIF, GPS);
PDF and Office files can carry scripts, links and embedded files that we cannot clean safely without more
packages; and workers mostly have phones, not scanners. The upload screen now says so before the worker
chooses a file: **"Take a clear photo of your certificate"** — lay it flat in good light, all four corners in
the picture; for a paper or PDF document, take a photo of it. A PDF is refused with a specific message
(`PHOTO_PDF`). Recorded in `docs/TRACEABILITY.md` (M3 bullet 1) as "done, with this limitation".

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

---

## D-017 — Design v2 colour theme: "Emerald Night" (Batch 3, 10 Nov 2026)

**Decision (Claude Code, for the team to confirm; Batch 3 Part 4.2):** three complete OKLCH theme
token sets were built (`frontend/src/styles/themes.css`): **Emerald Night** (deep green-black dark
sections, vivid emerald primary, saffron highlights), **Ink & Marigold** (deep ink-navy, marigold and
coral), **Terracotta Craft** (warm clay, cream surfaces, deep teal). The landing page, onboarding Step 3,
the worker profile view and customer search were screenshotted in all three at 1280 and 360 px
(`docs/design/screenshots/themes/compare-*.png`) and compared side by side. **Emerald Night is the
default.**

Why:
- Green carries the product's promise ("checked, verified") together with the check-mark logo, and it is
  a positive colour in Pakistan without a political tie to any party.
- Its primary hue (162°) is far from the error red (27°). In Terracotta Craft the clay primary (38°) is
  close to the error red, so a normal "Edit profile" button can look like a warning.
- Ink & Marigold is crisp, but navy + orange reads like a generic fintech product.
- All three pass every contrast pair in `src/styles/contrast.test.js` (WCAG 2.2 AA, OKLCH converted
  with the OKLab formulas; every colour inside the sRGB gamut). Lowest text ratios: Emerald Night 4.65,
  Ink & Marigold 4.94, Terracotta Craft 4.57.

How to change: `DEFAULT_THEME` in `frontend/src/styles/theme.js` (one line). All three can be switched
live at `/dev/themes` and `/dev/styleguide` (development builds only).

---

## D-018 — Logo v2: "Stitched Nut" (Batch 3, 10 Nov 2026) — REPLACED by D-021

> Rejected by the team after Batch 3; see D-021. The text below is kept as a record. The file names it
> mentions have changed: the concepts are now `docs/design/logo-concepts/*` (see the README there).

**Decision (Claude Code, for the team to confirm; Part 4.3):** three logomark concepts were drawn on a
32 × 32 grid (`frontend/src/components/brand/logoMarks.jsx`, SVG copies in
`docs/design/logo-concepts/`): **A Shield & Spanner**, **B Hard-hat Check**, **C Stitched Nut**. They were
screenshotted at 16/24/32/64 px, in one colour and full colour, on light and dark, and in the header at
360 and 1280 px (`compare-*.png` in the same folder). **C, Stitched Nut, is the logo.**

Why: a hexagon nut is a universal tool sign; the stitched inner ring points to local craft (tiles,
embroidery); the check says "verified". It fills the square well and still reads as hexagon + check at
16 px (at 20 px and below the ring is left out: `smallDetails`). A is clear but shields are the most
common "security app" symbol and the spanner end looks like a bone when small; B is friendly but wide,
its check is tiny at 16 px and its orange dot looks like a notification badge.

Animated version (landing hero, language chooser): the outline draws itself (stroke-dashoffset), the
fill and check appear, then the wordmark slides in; with reduced motion the finished logo is shown.
Favicon (`frontend/public/favicon.svg`, `favicon-32.png`) uses the small version; `theme-color` follows
the theme. The tab title is translated (`useDocumentTitle`).

---

## D-019 — Three languages without a library (Batch 3, 10 Nov 2026)

**Decision (Batch 3 Part 3; details by Claude Code):** English (`en`), Urdu (`ur`, right to left) and
Roman Urdu (`ur-Latn`, left to right).
- Own small system in `frontend/src/i18n/` (no i18n package): `LanguageProvider`, `useT()` with
  `t(key, params)`, plurals with `Intl.PluralRules`, dates with `Intl.DateTimeFormat` (`en-PK`/`ur-PK`)
  and **Western digits (0–9) everywhere** (`-u-nu-latn`), because phone numbers, CNIC, rates and IDs are
  typed that way in Pakistan.
- English is bundled; Urdu and Roman Urdu are separate files loaded the first time they are chosen
  (about 13 kB gzip each). The Urdu font Noto Nastaliq Urdu (self-hosted) is loaded only for Urdu, only
  its Arabic-script part; Latin letters and digits in Urdu text use Manrope.
- The server sends a stable `code` with every error (`backend/errors/catalog.js`, D-019 Part 3.2); the
  website shows the text for the code in the chosen language. Tests: every code has a text in all three
  dictionaries, and the dictionaries have exactly the same keys.
- Trade and skill names in Urdu and Roman Urdu live in `backend/config/skillTaxonomy.js`
  (`DISPLAY_NAMES`, the one source of truth) and are served by `/api/meta/taxonomy`. Matching terms and
  the taxonomy version did not change.
- First visit: a language chooser screen. The choice is kept in `localStorage` (try/catch) and, for a
  logged-in user, in `User.preferredLanguage` (`PATCH /api/users/me/preferences`).
- **Which language wins after login:** a language picked during this visit (chooser or switcher) wins
  and is saved to the account; otherwise the account's saved language is used (so it follows the user to
  another device); an account without a saved language gets the browser's choice.
- All Urdu and Roman Urdu texts are **drafts that need a native reviewer** (`docs/i18n/REVIEW.md`).

---

## D-020 — Worker profile: one view, one editor (Batch 3, 10 Nov 2026)

**Decision (Batch 3 Part 5):**
- `/worker` is an overview only (greeting, completion, identity, skill chips, proof counts, next steps)
  with "View my profile" and "Edit profile"; no forms.
- `/worker/profile` is the complete profile, read only, with a Private section only for the owner and a
  **"See what customers see"** switch. That preview shows `publicView` from `GET /api/workers/me/full`,
  built with **the same query and field list** as the customer endpoint, so it cannot drift from what
  customers really get.
- `/worker/profile/edit` holds every change: About you, Work and rates, Skills, Proof of skills, Work
  history, Language preference (side navigation on desktop, tabs on phones). Each section saves on its
  own with a toast; "You have unsaved changes" protects switching sections, leaving inside the app
  (React Router `useBlocker`, which needs a data router: the app moved from `<BrowserRouter>` to
  `createBrowserRouter`) and closing the tab (`beforeunload`). Every page loads the profile fresh from
  the server, so the view shows the new data at once.
- `/worker/skills` was removed as an editing place; old links redirect to the editor (`?proof=<id>` opens
  "Proof of skills" with that skill chosen). Onboarding stays the guided first-time path.

---

## D-021 — Logo v3: back to the shield, wrench and check (Batch 4, 10 Nov 2026)

**Replaces D-018.** The team's feedback after Batch 3 (Batch 4 prompt, Part 0): *"The new logo
('Stitched Nut') is not good. The earlier logo was right (the Batch 1 shield with a wrench and a
check). Bring it back, then refine and enhance it."* So "Stitched Nut" and the two other Batch 3
concepts are **rejected** (kept in `docs/design/logo-concepts/` as a record), and the Batch 1 idea is the
brand again: **a rounded shield (trust) holding a check (verified) whose long arm is a wrench (skilled
work).**

What was refined (same concept, not a new one):

- **Proportions.** The shield is redrawn symmetric with rounded corners that follow the UI radius scale;
  the check's elbow sits on the optical centre; the wrench head is an open "C" (an open-end spanner), not
  a ring with a notch, so it stays a tool when small.
- **One stroke weight** for check, handle and head, round caps and joins. From 24 px up the stroke is
  2.8 units of 32; at 20 px and below a second, bolder drawing (3.3 units, larger head) is used.
- **Versions.** Two-tone (emerald + saffron), one colour (`mono`: the shield in the text colour with the
  check-wrench cut out), on light and on dark. Colours are bound to theme tokens, so the mark follows
  light and dark mode by itself.
- **Depth** only for the large hero size (96 px and up): a soft gradient and highlight. Small sizes are flat.

Three refinements were drawn and screenshotted at 16/24/32/64/128 px, in one colour, on light and dark,
in the header at 360 and 1280 px, and as true 16/32 px favicons (`v3-compare-*.png`):

| | Refinement | Result |
|---|---|---|
| A | Balanced: filled shield, white check-wrench | Clean and closest to Batch 1, but at 16 px the white wrench head melts into the check: it reads as "shield + tick", like many security apps. |
| **B** | **Two-tone: the wrench head in saffron, set into the shield's shoulder** | **Chosen.** |
| C | Outline: stroked shield | Elegant when large; at 16 px the lines clog and it looks weak next to the bold wordmark. |

**Why B (decision by Claude Code from the screenshots, for the team to confirm):** it is the only one
where the *tool* survives at 16 px (the saffron "C" is still visible in a browser tab); it uses both
brand colours, so the mark belongs to the same palette as the interface (emerald for trust, one saffron
accent); the cut-out around the head gives it a recognisable outline; and it is still exactly the Batch 1
idea. Honest limit: saffron on a white page has low contrast (about 2:1), so on light backgrounds the head
is carried by its hue and shape; the one-colour version exists for places where that is not enough.

Icon set (written by `npm run icons`, `frontend/scripts/make-icons.mjs`, from the same numbers and the
default theme's colours): `favicon.svg` (follows the browser's light or dark tab colour), `favicon-32.png`,
`apple-touch-icon.png` (180 px), `icons/icon-192.png`, `icons/icon-512.png`, and **maskable**
`icons/icon-maskable-192.png` and `-512.png` (full-bleed background, the mark inside the middle 80%).

Animated version (landing hero, language chooser; `Logo animated`): the shield outline draws, the shield
fills, the wrench rotates gently into place, the check draws last, the wordmark slides in (about 2.6 s,
once). Everywhere else, and with reduced motion, the logo is static. Frames:
`docs/design/logo/animation-frames.png`.

---

## D-022 — Dark mode: three choices, circular reveal, saved like the language (Batch 4, 10 Nov 2026)

**What the team asked (Batch 4, Part 0 and 3):** a night-mode button in the top corner of every page,
with fun animations, not just a switch.

**Decision:**

- **Two attributes on `<html>`.** `data-theme` is the colour theme (Emerald Night, D-017) and
  `data-mode` is `light` or `dark`. Each theme has a second block in `themes.css`
  (`[data-theme='…'][data-mode='dark']`) that only overrides role tokens, so components did not change.
  Dark mode has three elevation levels (page < card < menu/dialog), brand colours lifted for dark
  backgrounds, black shadows plus a hairline of light on raised surfaces (`tokens.css`).
- **Three choices:** Light, Dark, System. The default is System (`prefers-color-scheme`), and the page
  keeps following the device while it is open. One tap on the button switches light and dark. A long
  press, a right click, the small arrow beside the button (shown on hover and keyboard focus) or the
  Down arrow key opens a menu with all three.
- **Where:** in the header (`AppHeader`, used by every page: landing, login, register, onboarding,
  worker, customer and admin pages), in the footer, and in the top corner of the language chooser (the
  only screen without the header). One tap on mobile.
- **Animation:** the icon is one SVG: the sun's rays pull in, a crescent is cut from the disc, two stars
  twinkle. The page changes with a **circular reveal** that grows out of the button
  (`document.startViewTransition` + `clip-path: circle()`, `frontend/src/theme/reveal.js`). Browsers
  without View Transitions get a 0.36 s cross-fade of colours; with reduced motion the change is instant.
- **Saved** like the language (D-019): `localStorage['dlm.theme']` for visitors (try/catch), and
  `preferredTheme` on the account (`PATCH /api/users/me/preferences`, validated `light | dark | system`).
  A choice made during this visit wins and is saved to the account; otherwise the account's setting is
  used; an account without one takes this browser's.
- **No flash of the wrong mode:** a small inline script in `index.html` sets `data-mode` (and the text
  size) before anything is drawn. A test runs that real script against the same cases as the app code.
  Note for later: if a Content-Security-Policy is added to the website, this script needs a hash.
- **Text size (A−, A, A+)** uses the same machinery: `data-text-size` on `<html>` changes the root font
  size (93.75%, 100%, 112.5%); everything is sized in `rem`. Saved as `dlm.textSize` and
  `preferredTextSize`.
- **Proof:** `contrast.test.js` checks all 53 colour pairs in both modes of every theme (WCAG 2.2 AA) and
  that every colour is inside sRGB; `theme.test.jsx` checks the button on every page, persistence, the
  reveal, the fallback, reduced motion and the account sync; the e2e suite runs axe in dark mode.

---

## D-023 — Design v3 and the in-house illustration system (Batch 4, 11 Nov 2026)

**Why:** the team's feedback after Batch 3: *"The design is still nothing special. Improve and refine it
a lot."* Before changing anything, all 28 screens were scored on ten criteria (`docs/design/07-critique-v2.md`).
The biggest gaps were imagery (almost none), flat white cards with borders everywhere, short pages
floating above a heavy footer, equal weight everywhere, small grey text carrying important facts, and
admin tables wider than their cards.

**Decision:**
- **Illustrations:** one in-house SVG system (`frontend/src/components/illustrations/`): a drawing per trade
  (9) and 15 scenes for empty states, errors, onboarding steps and features. One grid, one line weight (2.5),
  five colours taken from the theme (so every drawing works in light and dark), a soft blob and a ground
  shadow, small hover animations that stop with reduced motion. No stock photos of people.
- **Layout:** bento grids on the landing page, the worker dashboard and the admin overview; fewer borders
  (inset hairlines plus layered shadows); a frosted sticky header; grain and a slow mesh only on dark
  surfaces; one clear main action per screen.
- **Colour:** Emerald Night kept and refined (richer emerald scale, warmer saffron), with a full dark mode (D-022).
- **Type:** Bricolage Grotesque display with tighter tracking, Manrope text, `text-wrap: balance/pretty`;
  captions raised from 12 to 13 px.
- **Pointer effects** (desktop only, off with reduced motion): cursor spotlight on cards, magnetic hero
  buttons, parallax in the hero drawing, an animated gradient ring on the main call to action.
- **Honesty kept:** vignettes on the landing page show skeleton lines and the product's real status words;
  no invented people, numbers, ratings or reviews (a test checks this).

## D-024 — Admin user management and account suspension (Batch 4, 11 Nov 2026)

Admins needed a place to see accounts and to stop misuse. **Decision:** a Users page (search by name, email
or phone; filter by role and status; one account with what belongs to it and its last audit entries) and
**suspend / reactivate** with a required reason (5–300 characters, no CNIC number). Rules, all checked on
the server: an admin cannot suspend their own account or another admin (admins are managed only with
`npm run create-admin`); suspending increases `tokenVersion`, so every open session ends at once, and the
session check refuses a suspended account as a second lock; a suspended user is told so only after the
correct password (a wrong password gets the usual answer, so nobody learns which emails exist); a suspended
worker is hidden from customers everywhere (directory, profile, compare, saved lists). Both actions are
written to the audit log (`user.suspended`, `user.reactivated`).

## D-025 — Notifications by polling, text built in the browser (Batch 4, 11 Nov 2026)

Workers did not know when an admin had decided. **Decision:** a `notifications` collection, written by the
server only when a real decision happens (identity verified / not accepted; proof approved / not accepted /
suspected fake / approval withdrawn). The website asks for the unread count **once a minute while the page
is visible** (no websockets: simpler, works on Vercel serverless, enough for this use). The text is not
stored: the website writes it from `type` + `params` in the user's language, so a worker who changes
language sees old notifications in the new language. Params are an allow-list (skill, evidence id, reason
code, the review note the worker can already see); never a CNIC. Notifications delete themselves after
180 days (TTL index). A failed notification never fails the decision (logged only).

## D-026 — Potential skills, profile strength and directory sort: rule-based and documented (Batch 4, 11 Nov 2026)

- **Potential skills** (proposal Module 2: "identification of potential skills that can be added to the
  worker profile"): taxonomy skills from the worker's main trade category, then from the categories of the
  skills already added, that are not on the profile; at most 8; in taxonomy order. No learning, no score.
  A skill is added only by the worker's tap (`addedVia: "related"`), with Undo.
- **Profile strength:** the documented completion checklist (unchanged weights) + a level word
  (`starting` < 50, `good` 50–79, `strong` 80–99 or 100 without approved proof, `complete` = 100 and at least
  one skill with approved proof) + up to five next steps that each name one missing thing. The website shows
  the checklist and its weights ("How this is counted"). It is not a rating of the worker.
- **Sort keys** of the directory: `updated` (default), `experience` (years, highest first), `evidence` (sum of
  approved proof items over all skills, stored as `approvedEvidenceCount` and kept in step on every save and
  decision). `_id` is the last key, so pages are stable.

## D-027 — Installable app with a static-only service worker (Batch 4, 11 Nov 2026)

**Decision:** our own `manifest.webmanifest` (normal and maskable icons from `npm run icons`) and our own
small service worker (`public/sw.js`, no library). It caches **static files only** (built assets with hashed
names, icons, fonts, the manifest) and serves the cached app shell when a page is opened offline. It never
looks at `/api/` requests and skips any answer marked `no-store` or `private`, so no private data can end
up in the browser cache. It is registered only in production builds. On Android an "Install the app" hint
appears when Chrome offers installation; "Not now" hides it for 30 days. The app still needs the internet
to see or save data; offline, the offline banner says so and retries by itself.

## D-028 — CSV exports and reason templates for admins (Batch 4, 11 Nov 2026)

- **Exports:** four files (audit log with hashes, identity queue, evidence queue, users). Admin only; every
  download is written to the audit log **before** the file is sent (no audit entry, no file). Columns are an
  explicit list; a CNIC is never included, and any CNIC-like number typed into a free-text note is replaced;
  spreadsheet formulas are neutralised (OWASP "CSV injection"); at most 5,000 rows per file; UTF-8 with a
  byte-order mark so Excel shows Urdu correctly.
- **Reason templates:** reusable sentences per decision kind, in three languages (English required), with a
  starter set the team must review (the Urdu and Roman Urdu lines were drafted by Claude Code). Inserting a
  template only fills the note; the admin can change the words before saving.

