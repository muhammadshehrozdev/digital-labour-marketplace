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
revised (noted in the team's internal audit of 6 Nov 2026). **Update 11 Nov 2026:** the supervisor told the team to
build in MERN (D-030).

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

**Decision (Claude Code, following the project brief):**
- `verificationStatus` = identity only: `Unverified` (new) → `Pending` (CNIC saved) →
  `Verified` or `Rejected` by an admin. Skill verification is Module 3.
- An admin decision always needs a note (5–500 characters, e.g. how the CNIC was checked);
  there is no default status. `Verified` is refused if no CNIC is on file.
- The update is conditional on the status the admin last saw; a stale screen gets 409.
- Every decision is written to the hash-chained audit log (who, when, from, to, note).

---

## D-010 — Design system (Batch 1, 9 Nov 2026)

**Decision (team's Batch 1 brief; implemented by Claude Code):** one design
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

**Decision (team's Batch 2 brief):** an `Evidence` document holds metadata only; a separate
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
  **Update 11 Nov 2026:** reviewed by the team (D-031).

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
  starter set (the Urdu and Roman Urdu lines were drafted by Claude Code and reviewed by the team on
  11 Nov 2026, D-031). Inserting a
  template only fills the note; the admin can change the words before saving.


---

## D-029 — Dependency updates: two-week age rule and temporary pins (11 Nov 2026)

**What the team asked:** apply the patch updates from review finding R-12, but only versions that are at
least two weeks old; run every test, build, lint and e2e; revert any update that breaks something.

**Decision:**

- **Age rule:** a version is installed only if it was published at least 14 days earlier (checked with
  `npm view <package> time`). The rule also applies to the packages that an update pulls in.
- **Applied (11 Nov 2026):** backend `dotenv` 18.0.7 → 18.0.9; frontend `axios` 1.20.0 → 1.21.0,
  `react` and `react-dom` 19.3.0 → 19.3.1, `react-router-dom` 7.18.4 → 7.18.5, `vite` 8.3.4 → 8.3.5.
  R-12 also named `mongoose` 9.12.1, `express-rate-limit` 8.7.4, `axios` 1.21.1 and `vite` 8.3.8: those
  versions (and `supertest` 7.3.2, `@testing-library/user-event` 14.6.9) were less than two weeks old, so
  the newest old-enough version was used or the package was left as it was. Minor updates that R-12 did not
  name (`vitest` 5.1, `@vitest/coverage-v8` 5.1, `oxlint` 1.93, `@vitejs/plugin-react` 6.3, `file-type` 22.3)
  were not applied.
- **Temporary pins** (`overrides` in `frontend/package.json`): Vite 8.3.5 accepts any `rolldown` 1.2.x from
  1.2.14, and npm chose 1.2.19, published the same day. `rolldown` is pinned to **1.2.15** (21 Oct, released
  with Vite 8.3.5) and `tslib` to **2.8.1** (only used by rolldown's optional WebAssembly helpers; 2.9.1
  was too new). **Remove both pins at the next update** and check the age rule again.
- Result: backend 516/516, frontend 940/940, lint 0, build OK, e2e 34/34 (see the change log).

---

## D-030 — MERN on the supervisor's instruction (recorded 11 Nov 2026)

**What happened:** the supervisor, Ms. Tooba Abdul Qudoos Khan, told the team to build the project in the
MERN stack (MongoDB, Express, React, Node.js). Reported by Muhammad Shehroz on 11 Nov 2026.

**Effect:** this is the reason behind D-001 ("MERN only"). The proposal's Section 7, which still names
Laravel/PHP and MySQL, describes the plan before this instruction; the code follows the supervisor. For the
defence: if the panel asks why the stack differs from the proposal, the answer is the supervisor's
instruction (D-001, D-030). There is no written copy of the instruction in this repository; if one exists
(an email or meeting note), keep it with the project file.

---

## D-031 — Urdu and Roman Urdu texts reviewed by the team (11 Nov 2026)

**What happened:** the team reviewed the Urdu and Roman Urdu texts (reported to Claude Code by the team on
11 Nov 2026). Until then they were Claude Code's drafts (D-019: "drafts that need a native reviewer").

**Effect:** the texts are no longer marked as drafts (`docs/i18n/REVIEW.md`, the dictionary files, the
README and the admin guide). The review list in `docs/i18n/REVIEW.md` was generated on 11 Nov 2026 with
1,424 texts. Five texts were added later that day and should be confirmed by the team:
`onboarding.nextTitle` ("What next?"), `workerx.strength.ringCaption` ("Profile filled in"),
`appx.pageLoad.title`, `appx.pageLoad.text` and `appx.pageLoad.retry` (the "page could not be loaded"
message). Any text added or changed after this date needs the same check before release.

---

## D-032 — Go-live setup: two Vercel projects, a same-origin rewrite, a fresh Atlas database (11 Nov 2026)

**Decision (Claude Code, for the team to apply with `docs/DEPLOY-RUNBOOK.md`):**

- **Two Vercel projects from the same repository:** `backend` (root directory `backend`) and `frontend`
  (root directory `frontend`). The frontend sends `/api/:path*` to the backend with a rewrite, and every
  other path to `index.html` after it (`frontend/vercel.json`). The browser only ever talks to the frontend
  address, so the login cookie stays first-party and unchanged: `HttpOnly`, `Secure`, `SameSite=Strict`,
  `Path=/api`. No CORS is needed in the browser, and local and production code are the same.
- **Backend = one Vercel function**, `backend/api/index.js`, which exports the app from `server.js`. Every
  path is rewritten to it; Express routes on the original path. `framework: null` and
  `outputDirectory: "public"` make sure nothing else is served (without them Vercel would serve the source
  files of the folder). The legacy `builds` file is gone (Vercel advises against it). Install with
  `npm ci --omit=dev`; Node 24 from `engines`.
- **Rejected:** one combined project (custom install, build and routing for two package folders: more
  moving parts); the browser calling the backend address directly (a cross-site cookie would need
  `SameSite=None`, CORS with credentials and changes to the CSRF check).
- **Fresh start:** a new, empty Atlas database; no migrations; the old databases and the three old Vercel
  projects are left untouched (the old projects are frozen with "Don't build anything"). New secrets only.
  `npm run db:indexes` builds every index before the first admin is created.
- **Production settings check:** in production the server refuses to start with a clear list when a
  variable is missing, when `MONGO_URI` points at this computer, when `CLIENT_ORIGIN` is not `https://`,
  or when `TRUST_PROXY` is not set (`config/env.js`).
- **Visitor IP:** Vercel may replace `X-Forwarded-For` when one Vercel project proxies to another, which
  would make every visitor look like one IP to the login rate limit. This cannot be checked locally, so
  `SHOW_CLIENT_IP=1` lets the team check it once after deployment (runbook step 9) and set `TRUST_PROXY`,
  or raise `AUTH_RATE_LIMIT` if the visitor IP is not available (the per-account lockout still applies).

---

## D-033 — Listen, Speak, See: help for people who read little (Batch 5, 16 Nov 2026)

**Why:** at the mid defence (13 Nov) the panel asked how labourers who cannot read or write will use the
website. Until now every label had to be read and every answer typed.

**Decision (from `BATCH_5_PROMPT.md`, built by Claude Code):** three helpers on the worker and customer
screens, on top of the normal text input, which stays the main way and works fully with the keyboard:

- **Listen (🔊):** under every field of the in-scope forms a Listen button says what to do here, in
  spoken Urdu or English, and shows the same help in large text in a bubble (for noisy places and
  hearing-impaired users). A round page help button always sits in the same corner (bottom, start side)
  and says what the page is for. Every picture card has its own small 🔊. The language chooser has one
  🔊 per card that speaks in that card's language.
- **Speak (🎤):** voice typing where it is safe and useful (D-035), with the answer read back.
- **See:** drop-downs with a few picturable options became picture cards (trade with the nine trade
  drawings, availability with icons, the skill of a proof photo with its trade drawing, the evidence
  kind); every field and main button has an icon; status is never colour alone.
- **Settings:** a Sound menu in the header with two switches, saved on the device only (`dlm.assist.v1`,
  never sent to the server): show the buttons (on) and read aloud by itself (off). Right after the
  language is chosen the website asks once, with two big picture buttons, whether it should read aloud.
- **Scope:** language chooser, landing, register, login, onboarding, the worker's dashboard and editors,
  skills, evidence, notifications, find workers, worker profile, saved, compare, Help Centre, voice check.
  Not the admin pages. Frontend only: nothing under `backend/` changed.

**Reference:** Medhi, I., Sagar, A., & Toyama, K. (2007). Text-Free User Interfaces for Illiterate and
Semiliterate Users. *Information Technologies and International Development*, 4(1), 37–50. The ideas we
used: pictures that show the action, voice explanation on every element, very little text, and help that
is always in the same place. This is a design source, not a result: the website has **not** been tested
with real workers yet (plan: `docs/evaluation/EASY-MODE-USABILITY-PLAN.md`).

## D-034 — Where the spoken help comes from (Batch 5, 16 Nov 2026)

**Order:** (1) a clip recorded by the team, if one exists for the text; (2) the browser's own speech
synthesis, if the device has a voice for the language (rate 0.9; voices that arrive late in Chrome are
awaited; a voice that runs on the device is preferred to an online voice); (3) nothing to hear: the help
is shown in the bubble with a note that this device has no voice for the language. The Listen button is
never hidden because of (3).

**Why clips first:** many phones and laptops in Pakistan have no Urdu voice, device voices differ in
quality, and a recorded human voice in everyday Urdu is the most reliable and also works offline (the
service worker caches clips, version `dlm-static-v2`). Recording is the team's job; the tools are built:
`/dev/recorder` (development builds only), `npm run audio:manifest`, `docs/audio/RECORDING-GUIDE.md`, and
`assistClips.test.js` (the list matches the folder; every file belongs to a recordable text). No audio
was generated or downloaded; the folder starts empty.

**Languages:** English is spoken in English. Urdu and **Roman Urdu are both spoken in Urdu** (the spoken
language is the same): a Roman Urdu user sees Roman Urdu on screen and hears the Urdu text of the same
key. Roman Urdu text is never given to an English voice. Values inside a spoken text (a skill name, the
title of a notification) are also taken in the spoken language. Speech never starts before the person
has touched the page, and only one sound or microphone runs at a time (Escape and leaving the page stop
everything). Nothing speaks unless the person pressed a button or switched read-aloud on, so it does not
talk over a screen reader.

## D-035 — Voice typing policy, and an honest note on the speech features (Batch 5, 16 Nov 2026)

**Where 🎤 is offered:** names, city, area, occupation, job title, client, "what you did", bio, evidence
title, languages, search boxes; numbers (mobile and WhatsApp, emergency contact, years, rupee rates,
see D-036). **Never:** passwords (a secret must not be said aloud, and the audio goes to the browser's
speech service), CNIC (an identity number must not be sent to a speech service), email (dictating an
address is unreliable; the help says to type it or ask a trusted person), admin screens. The rule is
checked inside the help row itself (`assistRules.js`), so no page can switch it on by mistake. Answers of
those three fields are also never read aloud.

**Behaviour:** single-line fields: what was said **replaces** the value, with one-tap Undo; multi-line
fields: it is **added** at the end. The value goes through the same path as typing (masks, checks,
counters). Afterwards the answer is read back ("Written: Bilal Ahmed", phone numbers digit by digit), so
a person who cannot read can check it. The privacy notice is shown in a dialog the first time 🎤 is used
on a device (it can be heard), and stays in the Help Centre. Without voice typing, without internet, or
with the microphone blocked, the button stays, explains the problem in words and in audio, and the text
box keeps working. The skills editor keeps its own large voice button (Batch 3) as the Speak of the
description box, so there are never two microphones for one box.

**Honest note:** these are the browser's built-in features (Web Speech API). Our code calls no speech or
AI service and holds no key. In Chrome and Edge, voice typing sends the audio to the browser maker's online
service; that is why it is optional, never used for passwords or CNIC, and announced before first use.
Chrome also offers online voices (for example "Google …" voices): the website prefers a voice that runs on
the device, but where a language has only an online voice, the help text and read-back answers (name,
mobile number) are spoken through that service. Nothing in Modules 1 to 3 depends on these features. They
are never called "AI".

**Known limits (stated plainly):** registration still needs an email address and a 15-character password,
which is hard for someone who cannot read; the help explains them and suggests asking a trusted person.
Voice quality depends on the device. Urdu audio needs either a device voice or the team's recorded clips
(none recorded yet). Voice typing in Urdu depends on the browser's speech service. Possible later work
(not built, not approved): sign-in by phone number, and registration with a helper.

## D-036 — Numbers by voice (Batch 5, 16 Nov 2026)

`utils/spokenNumbers.js` turns what the speech service returns into digits:

- **Phone numbers (digit mode):** Western, Urdu (۰–۹) and Arabic (٠–٩) digits; single-digit words in
  English, Roman Urdu and Urdu (zero / oh … nine, sifar … nau, صفر … نو); "double" and "triple" before a
  digit; spaces, dashes and "plus" are ignored.
- **Amounts and years (number mode):** number words up to fifty plus hundred / thousand / lakh (sau,
  hazaar, ہزار …), with currency and "years / per day" words ignored: "char hazaar paanch sau" is 4500.
- **If anything is not understood, nothing is written** and the person hears and sees "I did not
  understand, please say it again or type it": a wrong phone number is worse than an empty box.
- The number words are a **copy** of the skill extractor's list
  (`backend/services/skillExtractor/experience.js`); the frontend never imports backend code, and
  `spokenNumbers.test.js` fails when the two lists differ.
- The voice check page (`/voice-check`) tells a person, in plain words, what works on their device: help
  in Urdu and English (recorded clips, device voice, or text only), voice typing (available, offline, or
  not in this browser), the device's voices with test sentences, and how to add an Urdu voice on Android.

## D-037 — A minimal Work Booking inside Module 4 (Batch 6, 16 Nov 2026)

**Approval:** supervisor approval, reported by the team on 16 Nov 2026: keep a minimal Work Booking inside Module 4.

**Why:** "ratings and reviews after completed work" need a record of completed work, and "cancellations" need a
record of accepted work. Neither existed (Batch 4's scope guard allowed no jobs).

**Decision:** a customer sends a hire request to one worker; the worker accepts or declines; both confirm when the
work is done, or someone cancels. States `requested → accepted → completed`, or `declined`, `expired`,
`cancelled`. Every step is a conditional update on the state that was checked (409 on a double or stale step) and
is pushed onto `statusHistory`. Readable codes `BK-<year>-<6 digits>` from an atomic counter. Deliberately small:
no price, terms, photos or check-in (Modules 5, 6, 8, 10 add fields later; `docs/modules/MODULE-4.md` §7).

## D-038 — The reputation engine is evaluated by simulation (Batch 6, 16 Nov 2026)

**Approval:** supervisor approval, reported by the team on 16 Nov 2026: evaluate the reputation engine by simulation.

**Decision:** `backend/evaluation/reputation/` (seeded simulator, 11 scenarios, four baselines, ablations, Kendall's
tau-b, NDCG, Precision@10, attack lift, paired comparison). Results are written to `results/` with the date,
scenario, seeds, parameter hash and git commit, and are quoted only as **simulation** results. A real pilot is
planned (`docs/evaluation/REPUTATION-PILOT-PLAN.md`, a plan only).

## D-039 — Completion needs both sides (Batch 6)

Each side presses "Work done" once; both → `completed` (`completionMethod: both`). If one side confirmed and the
other does nothing for 72 hours → `completed` (`auto`, counts 0.6 in the reputation weight). Instead of
confirming, the other side may press "This work was not done", which opens a dispute and stops the timer. This
protects workers from fake bad reviews: a stranger cannot "complete" a job the worker never did.

## D-040 — Outcomes, and declining never counts (Batch 6)

Every closed booking stores one `outcome`, the only field the reliability engine reads: `completed` (+1),
`cancelled_by_worker_early` (−0.5, 24 hours or more before the start), `cancelled_by_worker_late` (−1, later or
after the start), `worker_no_show` (−1); `cancelled_by_customer`, `declined`, `expired`, `closed_no_fault` count
nothing. A worker may always say no: counting it would push workers to accept jobs they cannot do and cancel later.

## D-041 — Reviews: once, never edited; the contact-info check (Batch 6)

A review is possible only for the customer of a `completed` booking, once (unique index), within 14 days, not
during an open dispute. The customer can never edit or delete it (a changeable review can be bargained over);
the form says so and reads the answers back before sending. Booking texts, review comments, replies and dispute
notes are refused (`TEXT_HAS_CONTACT_INFO`) when they contain an email, a web link, a CNIC-like number, or 10 or
more digits once separators are removed (Western, Urdu and Arabic digits), so nobody can pass a phone number
before acceptance and get around D-002. Known limit: numbers written as words pass.

## D-042 — Timers without a server clock: per-request sweep plus a daily cron (Batch 6)

Vercel's Hobby plan runs a cron job at most once a day. One function, `sweepBookings({ now, filter })`, applies
every due timer (expiry after 48 h, auto-completion after 72 h, an unanswered no-show after 72 h, one review
reminder after 3 days) with conditional updates, so it is safe to run twice at the same time. It runs at the start
of every booking read (scoped to that user), so people always see the right state. `GET /api/cron/daily`
(constant-time `Authorization: Bearer <CRON_SECRET>`, 401 otherwise, also when the secret is not set) sweeps
everything and refreshes the snapshots; it is a GET because the CSRF check blocks other methods without a browser
Origin. The cron only tidies up; correctness never depends on it.

## D-043 — A weighted Beta reputation model (Batch 6)

Reputation is the Beta reputation model of Jøsang & Ismail (2002), written in subjective-logic form (the same
form as Module 3's skill score, D-014): stars become graded evidence (`p = (stars − 1)/4`), each review is weighed,
and the model reports `expected`, `uncertainty`, a `cautious` lower estimate and a `depth` word. It is a formula,
not "AI"; every value can be worked out by hand (the worked examples are unit tests).

## D-044 — The four weights, and why (Batch 6)

`w = provenance × recency × reviewerTrust × pairFactor`: confirmed by both or an admin 1.0, auto 0.6 (stronger
proof when both confirmed); `0.5^(age/365 days)` (the paper's forgetting factor); `0.5 + 0.5·min(n, 3)/3` with n
the customer's other workers (the paper's discounting by the provider's standing; a fake account would first
have to book and finish real jobs); the k-th review of the same customer `1/k` (ten reviews from one friend are
not ten opinions). Reviewer trust uses the customer's history **now**, on purpose.

## D-045 — `cautious` for ordering; "Best track record" (Batch 6)

The directory's new sort "Best track record" orders by `cautious`, then completed jobs, then recently updated.
A worker without a snapshot counts as the no-review prior (0.1300), exactly like a snapshot with no reviews. It is
not the default, and the screen says plainly that new workers appear lower ("Recently updated" shows them).
The cold-start problem (Pallais 2014) is Module 7's research question. The simulation found that ordering by
`cautious` lowers rank correlation when the number of reviews says nothing about quality (MODULE-4.md §5.3).

## D-046 — The reliability record (Batch 6)

The same Beta numbers from booking outcomes (D-040) with the same recency weight; raw counts for display
(completed, early and late worker cancellations, no-shows, accepted, repeat customers) are never weighted.
Customers see the counts only.

## D-047 — The snapshot, its three parts, and when it is rebuilt (Batch 6)

`WorkerProfile.reputation` holds `public` (what anyone may see), `score` and `reliability` (numbers for the
worker himself, admins and Module 7), with `engineVersion` (`rep-1`), `paramsHash` and `computedAt`. Public
responses select only `reputation.public`, so a number can never leak through a missed field. Rebuilt after an
outcome, a review change and a dispute decision, and daily; it never changes `updatedAt`. No migration: no
snapshot = "new on this platform". `perReview` (the explanation) is rebuilt on request, not stored.

## D-048 — Provisional parameters, and how they are tested (Batch 6)

Every number (W, half-life, auto weight, trust floor and cap, z, depth thresholds, outcome weights; the booking
hours and limits) lives in `config/reputationParams.js` or `config/bookingRules.js`, marked provisional. They are
tested three ways: `npm run reputation:sensitivity` (formula outputs per parameter), the simulation with
ablations, and `explore.js` (other trust floors and half-lives; the noise assumption). The live parameters were
**not** changed after the simulation: choosing them from the same runs would be circular, so any change is a team
and supervisor decision, checked on new seeds and on the pilot.

## D-049 — The small dispute step: one per booking, the admin decides (Batch 6)

Types `completion_contested`, `no_show_contested`, `cancellation_fault` (a worker within 14 days). At most one
dispute per booking; while it is open there is no review, no auto-completion and no other step. An admin decides
with a required note; the decision is final, audited, tells both people and rebuilds the reputation. Module 9 will
handle real disputes.

## D-050 — When "This work was not done" and "Worker did not come" are offered (Batch 6)

"This work was not done" only after the OTHER side pressed "Work done" (instead of confirming). "Worker did not
come" only from the start + 2 hours and while nobody pressed "Work done" (otherwise the first is the right step).

## D-051 — Rule-based flags never punish automatically (Batch 6)

Two rules create a `ReputationFlag` for an admin: `new_account_praise` (3 or more 4–5★ reviews in 14 days from
accounts under 14 days old with no other worker) and `repeat_pair_burst` (one customer, 3 completed bookings with
one worker in 30 days). A flag changes no score. The admin dismisses it or hides the listed reviews as
`fake_or_manipulated`, with a note; both are audited. Being negative is never a reason to hide a review.

## D-052 — Phone numbers through the booking only (Batch 6; delivers D-002)

The customer sees the worker's phone (and WhatsApp, only if the worker saved one), the worker sees the customer's
phone, only from `GET /api/bookings/:id`, only while `accepted` and for 7 days after the booking closed; admins
too, under the same window. Never in a list, the directory, a public profile, a notification, the admin timeline
or a CSV file. Tests prove the numbers are absent everywhere else.

## D-053 — An unanswered no-show can still be disputed (Batch 6)

A no-show confirmed only because the worker did not answer in 72 hours (`noShow.workerResponse: no_answer`) can be
disputed within 14 days, because a worker who cannot read may miss a notification.

## D-054 — Request limits and BOOKING_SELF (Batch 6)

Only customers send requests; a suspended or unlisted worker cannot receive them. At most 5 open requests per
customer, 1 per customer and worker, 10 new in 24 hours (rolling). A request is refused when the customer's phone
equals the worker's phone or WhatsApp number in any written form (`BOOKING_SELF`). Known limit: the counts are not
locks, so two requests in the same millisecond could both pass.

## D-055 — "depth", not a word the honesty tests ban (Batch 6)

How much evidence there is is called `depth` (none, few, some, many) in code, field names and texts, because the
honesty tests ban "confidence" in the frontend and confidence-score words in the backend (Module 2 and 3 rules).
The website says "Few reviews yet", "Many reviews".

## D-056 — The one planned change to the frontend honesty test (Batch 6)

`frontend/src/test/honesty.test.js` banned `★` and "star rating" in all frontend source, to stop invented ratings
before real reviews existed. Module 4 must show real stars, so (and only so) the line was replaced by two checks:
"testimonial" stays banned everywhere; `★` and "star rating" are allowed only in `src/features/reputation/`, and
those files may contain no digit next to `★` and no sample review text. A new test checks that the landing page,
the Help Centre and the dictionaries show no example rating, and a backend test checks that every public rating
number equals what is computed from the stored reviews. The "AI" and "confidence" checks are unchanged.

## D-057 — Customer notifications through a menu link; three existing tests updated (Batch 6)

Customers now receive booking and review notifications. An existing Batch 4 test requires that customers have no
bell, so customers get a "Notifications" menu link with the unread count instead (the test is unchanged). Three
existing tests were updated to the new truth, still checking exact values: the profile contact note (its old text
said contacts come "in a later module"); the worker's top menu (now Dashboard, Requests, My jobs, My profile, as
Section 7 of the Batch 6 plan requires); the admin sidebar (now with the four new admin pages).

## D-058 — What the simulation found, and that nothing was tuned (Batch 6, 17 Nov 2026)

In the simulation (30 seeds, `docs/modules/MODULE-4.md` §5), with the provisional parameters the weighted model is
not better than the plain average overall, and recent fake reviews still buy places because the recency factor
counts them almost fully. The individual defences do reduce the attacks they target. This is reported as found;
the parameters were left as specified, and the choice of new values is left to the team and the supervisor (D-048).

## D-059 — The header collapses in a measured order; menus stay inside the window (Batch 6B, 17 Nov 2026)

Playwright screenshots (4 roles × 10 widths × English/Urdu × light/dark) showed the cause of the cut-off header:
the customer header needs about 1373 px and the worker header about 1422 px, but the row is at most 1200 px wide
and the full header was switched on at a fixed 960 px. Text with `overflow: hidden` and icons shrank first
("En…", "Demo Customer…"), and `body { overflow-x: clip }` still let the browser scroll the page sideways when the
account menu opened. Decision: no fixed breakpoints. `headerFit.js` measures the row and tries levels in a fixed
order — full → no "Ctrl K" hint → no name (initials stay; the name is still read and is in the menu) → Sound and
language into the account menu (visitors: a "More" menu) → the mobile menu → tools in the mobile menu → shield
only → the night-mode button last. Nothing in the row may shrink, and only CSS (from the header's own attributes)
hides things in the row: an earlier version let React state from the previous level feed the measurement and
settled on a level that did not fit (found by the e2e test). Every popover is moved back inside the window with an
8 px margin (`useStayInView`); a long email ends with "…" on its own line and its full address is in the title.
The "Ctrl K" hint is a decorative sibling of the search button inside the same pill (the button covers the pill):
inside the button its visible text would have to be part of the button's name (axe `label-content-name-mismatch`,
found by the final e2e run once the hint could show below 1440 px).

## D-060 — One install service; no website can install itself (Batch 6B)

`features/app/install/installStore.js` is the only install code: it keeps Chromium's `beforeinstallprompt` from app
start, knows whether the app is installed (`display-mode: standalone`/`fullscreen`, iOS `navigator.standalone`,
`appinstalled`, or an "accepted" answer) and the platform (`chromium`, `ios-safari`, `ios-other`, `other`). The
first-visit invitation (an in-page sheet, not a phone notification) and the footer button use it. The team asked
for automatic installation: **browsers do not allow it** — the browser shows its own question and the person must
press "Install" (MDN, web.dev, checked 16–17 Nov 2026); on iPhone only Safari can add a web app, by Share → "Add to
Home Screen". Own decisions: the invitation appears at most once per 14 days on a device (counted from when it is
shown; "Not now", closing it and "dismissed" also hide it 14 days); it waits for the second page or 30 seconds, the
first touch, no open dialog, no focused text field, no open mobile menu and no other bar at the bottom; the old
`InstallHint.jsx` file was rebuilt on the service (nothing deleted). The page help and scroll-to-top buttons lift
above any bar floating just above the bottom edge.

## D-061 — rep-2: recency off for reviews (Batch 6B)

Batch 6 (SIMULATION) showed that recency rewards fake reviews, which are always new: switching it off lowered the
attack lift in 7 of 8 attack scenarios. rep-2 sets `halfLifeDays: null` (every review weighs 1); the code stays so a
pilot can switch it on. Booking outcomes (reliability) keep their one-year half-life (`reliabilityHalfLifeDays`):
rep-2's changes are about reviews (own decision).

## D-062 — rep-2: a budget for new reviewers instead of the trust floor (Batch 6B)

The trust floor 0.5 halved every genuine first-time customer but still let ten fake accounts add five reviews'
worth; a floor of 0 removed the naive attack but cost rank quality. rep-2: reviewers with no completed job with any
other worker count fully, but together at most B reviews' worth (each × `min(1, B / m)`, m = the sum of their
weights after the pair factor, provenance and the burst check); reviewers with a hiring history count 1.
Candidates B ∈ {1, 2, 3}; chosen B = 1 (D-065).

## D-063 — rep-2: an optional burst check (Batch 6B)

A review with 3 or more other reviews of the same worker in the 14 days before it counts half ("before" includes
the same moment, so the result never depends on the order of the input). Candidates off/on; chosen on (D-065).
Its cost was tested with `busy_genuine`.

## D-064 — rep-2: the platform prior and `expected` as the ranking number (Batch 6B)

The 0.5 prior (3 stars) is far below typical ratings and pushed workers with few reviews down whatever their stars.
rep-2's base rate a is the plain mean of `(stars − 1) / 4` over all visible reviews, clamped to [0.2, 0.9], and 0.5
below 20 reviews; `recompute.js` computes it and passes it in (the engine stays pure) and the snapshot stores it.
`expected` (W = 2) orders "Best track record"; `cautious` and `uncertainty` stay for the worker, admins and
`toMatchingSignals`, which gains `baseRate` (no field removed). Consequence stated in the documents: new workers now
sit near the middle of that order, and ten perfect reviews rank above forty reviews averaging 4.7.

## D-065 — The rep-2 protocol, the criteria and which engine went live (Batch 6B)

Fixed before any rep-2 run (BATCH_6B §5.4; `evaluation/reputation/README.md`; committed in b4b4b09): six candidates;
development seeds 20261116..20261145 for the selection only; the rule (base NDCG@10 ≥ B4 − 0.01, then the highest
mean NDCG@10 over five attacks; ties to smaller B, then burst off); freeze in a commit; test seeds
20270101..20270130 once; S1 (no cost without attack), S2 (attacks), S3 (better than rep-1); rep-2 goes live if S1 and
S3 hold. The test run refuses to start before the freeze, with uncommitted changes, or a second time. Result
(SIMULATION): all candidates passed the base line; the rule chose B = 1 with the burst check on; frozen in
d634b3f (13:56:33 UTC); the test run started at 17:06:13 UTC, once; S1, S2 and S3 were met; **rep-2 is live**.
The documents also report where it fails (the "smart" attacker, `new_platform`, noisier stars). rep-1 stays as a
method of the evaluation; tests that tested rep-1 through the default now name rep-1 with unchanged values.

## D-066 — rep-2's public depth word follows the visible reviews (Batch 6B)

With B = 1, twelve reviews from first-time customers are one review's worth of evidence, and "Few reviews yet" next
to "(12)" would contradict what customers see. For rep-2 snapshots, `reputation.public.depth` comes from the number
of visible reviews (uncertainty W / (n + W), the same thresholds); `score.depth` stays evidence-based. Display only:
the frozen parameters did not change. Also: the reputation rules are served by `GET /api/meta/reputation-rules` and
worded by the website, so My reputation and the Help Centre always say what the live engine does; the Urdu answer
"I did come" became gender-neutral ("میں نے حاضری دی تھی"), for team review.

## D-067 — Module 5 price information: option C (team choice, 19 Nov 2026)

**Team choice, 19 Nov 2026, not a supervisor approval.** The 6 Nov 2026 assessment recommended shrinking Module 5,
because a "fair wage estimator" needs price data the platform does not have yet. Option C answers that in three
layers: (1) the government minimum wage as a **reference** floor (config/wageReferences.js); (2) the platform's
own completed-job prices, shown only as aggregates with minimums (services/wage/priceRange.js); (3) an admin price
guide with a written source as the fallback (PriceGuide; empty in production). Nobody invents numbers. Module 5 is
not the core research contribution (Modules 4 and 7 are); its measured part is a small simulation (D-070).

## D-068 — The minimum wage is a reference, not a legal floor

The federal and provincial notifications set a monthly minimum wage for adult unskilled workers in industrial and
commercial establishments. A household hiring a plumber for a day may not be covered, and enforcement is weak
(PIDE 2026, context only). So the app shows the figure as a reference ("a day's work should not be paid less than
this"), always with the region, the status in words (notified / announced), the effective date and the sources,
and the line "These laws are written for workers in shops and factories". It never says "illegal", never blocks a
price, and is never legal advice. Day = round(monthly / 26), hour = round(monthly / 26 / 8), halves up, the
notifications' own convention (FAFEN). The figures are the team's table of 19 Nov 2026; the team checks them against
the official notifications before going live and every July; `referenceAge` makes their age visible (Help Centre
date, admin Overview banner after 365 days).

## D-069 — Regions from a city table; an unknown city means no reference

`Booking.city` is free text, so `config/regions.js` maps the main cities (English, Roman Urdu and Urdu spellings) to
ICT, PB, SD, KP, BA, GB or AJK after the skill extractor's normalisation (NFC, lower case, Urdu letter variants,
spaces removed). An unknown city gives `null`: no minimum-wage check and no region level in the price range. The app
never guesses. `region` is stored on a booking when it is created; old bookings had no agreed price, so no
migration is needed. Region codes are object keys in config (the error-catalog test treats quoted UPPER_CASE words
there as error codes).

## D-070 — The platform price range rules

Only completed bookings completed by **both** people or an admin decision (not `auto`), with **agreed** terms
(`terms.agreed`) in the same unit, completed in the last 365 days; **one job per customer–worker pair** (the most
recent); at least 5 jobs from 3 workers and 3 customers (privacy: no single price can be read; robustness: one
person or one friendly pair cannot set it). Numbers: the 25th percentile, median and 75th percentile (the middle
half), Hyndman & Fan (1996) definition 7, each rounded to the nearest Rs 50, halves up. The median, not the mean
(breakdown point 50%, Hampel 1971). Output: aggregates only. Every number is provisional in config/wageRules.js.
The simulation (evaluation/price-range, SIMULATION results) measures the cost of the minimums (availability) and
the gain (smaller error and attack shift); no success criteria were fixed.

## D-071 — Level order; category ranges only for a day or an hour

Try the skill in the city, the region, then Pakistan. For `day` and `hour` only, then the trade category in the
city, the region and Pakistan: a day of electrical work is comparable across electrical skills, a whole job is not
(a fan fitting and a full rewiring are both "one job"). The first level that meets the minimums wins.

## D-072 — The admin price guide: a required written source, an empty start

Used only when no platform range exists (order: skill in the region, skill in Pakistan, category in the region,
category in Pakistan). `sourceNote` is required (10–300 characters) and shown to users with the month; the page says
"Type only numbers you can show a source for. Never guess." One active entry per skill, category, unit and region;
changes of numbers need the source again; archive instead of delete; every change is audited with the old and new
numbers. Production starts empty: no code or script creates production entries (the local demo seed creates one
"[Demo]" entry with synthetic: true).

## D-073 — Price terms with versions and `baseVersion`

The terms live on the booking (`Booking.terms`, every version in `termsHistory`). The customer may offer a price
with the request (version 1); after acceptance either person may propose a new version; only the person who did
not propose the current version may agree. Every call sends the version it looked at (`baseVersion` / `version`) and
the update is conditional on it and on `moneyVersion` (409 `TERMS_CHANGED` if it moved), so nobody agrees to a price
that changed a second ago. A new proposal after an agreement leaves `terms.agreed` unchanged until the other person
agrees again. Terms are frozen after "Work done" (by either person), during a no-show report, during an open
dispute, and once the booking is closed; a change still waiting then stays "not agreed". At most 10 versions.
`terms.agreed` is the only part the price statistics, the payment summary, the earnings, the CSV and later
Module 8 read.

## D-074 — The price is optional

A booking without agreed terms works exactly as in Module 4 (no flow changes; the Module 4 `actions` are unchanged
and the new buttons come in separate fields `termsActions` and `paymentActions`). The screens say "Price not agreed
in the app yet" with a button.

## D-075 — Checks warn, they never block

The important conditions per trade category (config/workTerms.js) and seven rule-based checks
(services/wage/termsChecks.js: below the minimum-wage reference for a day / an hour / a job of one or 2–3 days, a
large advance, materials bought by the worker without an advance, a missing condition, below the platform's 25th
percentile) are shown to both people while they choose and on the booking. They never block: a worker may still
agree a low price; it is the worker's choice. A low-pay warning is never sent as a notification.

## D-076 — Payment records: confirmed by the other person, never edited, never auto-confirmed

Either person records a payment ("I paid" / "I received") while the booking is accepted or up to 30 days after it
closed (only if it was ever accepted); only the other person confirms or disputes it (reason required); a record is
never edited or deleted (a mistake is disputed and recorded again; a record that can be changed later can be
bargained over) and never confirmed automatically. `materials` money pays for materials, not the work: it is never
counted against the agreed price or in the worker's earnings (shown apart). `paymentState` is stored for admin
filters and computed with the same pure `paymentSummary` in the same conditional update; the `moneyVersion` counter
makes every terms or payment update conditional on the data it read. Earnings count only confirmed money, by the
Pakistan month of `paidOn`.

## D-077 — The app never moves money

No online payments, wallets, escrow, commissions, invoices with tax or monthly employment contracts. The app keeps a
record that both people confirm; every payment screen says "The app does not move money. It keeps a record you both
confirm." The printable record says it is not a bank receipt. The payment method is a record only.

## D-078 — Payment disputes are only marked until Module 9

A disputed payment record is marked, shown to both people and on the admin Payments page (read-only, disputed
first) and counted in `paymentState` (`has_dispute`). There is no admin decision step for payments in this batch:
Module 9 (dispute resolution) will decide them. Payment records are refused while a Module 4 booking dispute is open,
as `canDo` refuses most booking actions then.

## D-079 — `/api/health` proves the function starts; `/api/auth/session` is the database check (Batch 7, Part A, 19 Nov 2026)

After a new deploy, `/api/health` can say `"db":"disconnected"` although the database works: the route is mounted
before `requireDb` and only reports `dbState()`, the state of a connection that a fresh serverless function has not
opened yet. The runbook (steps 4.8, 8.1, 8.3, 9 and the rollback table) and `docs/API.md` treated that answer as a
database failure. Corrected: `/api/health` proves that the function starts; `"db":"disconnected"` right after a
deploy is normal; `GET /api/auth/session` (behind `requireDb`) is the database check, `200 {"user":null}` =
reachable, `503 SERVICE_UNAVAILABLE` = not. Docs and the comment in `app.js` only; the route's behaviour and its
tests are unchanged.
