# Task for Claude Code — Fix Modules 1 and 2, then build Module 3

Digital Labour Marketplace (FYP, SZABIST Islamabad, Fall 2026)

> How to use this file: put this file and `CLAUDE.md` in the root of the repository (`digital-labour-marketplace\`). Save the audit report as `docs\audit\audit-2026-11-06.md`. Then, in Claude Code inside VS Code, type:
> `Read CLAUDE_CODE_PROMPT.md and CLAUDE.md, then start with Phase 0. Stop after each phase and wait for my "go".`

---

## Part A — How you must work with me

1. I am a beginner Software Engineering student. Explain every step in simple English. Define a technical word the first time you use it.
2. My computer: Windows 11, VS Code, PowerShell terminal, Google Chrome. Give PowerShell commands only. Before each command, say which folder to run it in and what it does.
3. Work **one phase at a time** (phases are in Part D). At the start of a phase, show me a short plan (files you will touch and why). At the end of a phase:
   - run the tests and paste the **real** output,
   - list what changed in plain words,
   - add a short entry to `docs/CHANGELOG.md`,
   - commit on the feature branch,
   - **stop and wait for my "go"**.
4. Inspect a file before changing it. Change the smallest part needed. Do not rewrite whole files unless you explain why. Keep working features working.
5. Ask me **before**: installing any npm package not listed in this file, deleting files, running anything against a real (Atlas/production) database, `git push`, any force push, or changing Vercel settings.
6. Never invent test results, evaluation numbers, approvals or references. If something fails, show the error and explain it.
7. No paid services. No external AI APIs. No LLM calls in the app.
8. If something in this file does not match the real code, tell me and ask before deciding.

---

## Part B — Facts about the current code (from the 6 Nov 2026 audit)

The full audit with test evidence is in `docs/audit/` (if I have placed it there). Short version:

**Process**
- GitHub has only one commit ("Complete Module 1"). **Module 2 exists only on my laptop**, not committed. The local UI is also newer than GitHub.
- `backend/package.json` says express ^4.19.2 and mongoose ^8.3.0, but `backend/package-lock.json` was created for express ^5.3.0, mongoose ^9.11.2, bcryptjs ^3.0.3, dotenv ^18.0.7. The two files disagree, so `npm ci` fails and nobody knows which version really runs.
- No automated tests. Frontend API URL is hard-coded in `frontend/src/api.js`.

**Module 1 — Worker Digital Identity (bug IDs used below)**

| ID | Problem |
|---|---|
| M1-1 | Anyone can register as **admin** (Register page has an Admin button; server accepts `role: "admin"`). |
| M1-2 | `GET /api/worker/all` returns every worker's **CNIC, home address, emergency contact, WhatsApp, email and phone** to any logged-in user, including other workers. |
| M1-3 | Search and city text go straight into `new RegExp(...)`: searching `C++` or `(` crashes with 500; regex injection possible. |
| M1-4 | Query values are passed into the MongoDB filter without checks (`?category[$ne]=x` works with Express 4's default query parser). |
| M1-5 | No server-side validation: missing email → 500, 1-character password accepted, email `abc` accepted, non-string name → 500, object as login email → 500. |
| M1-6 | Profile accepts negative rates and years, CNIC `abc`, empty occupation; invalid availability → 500 instead of 400. |
| M1-7 | Raw `error.message` is sent to the browser on every 500. |
| M1-8 | Worker ID = `DLM-2026-` + 4 random digits with a unique index: ~50% chance of a clash by 112 workers; a clash makes saving fail. |
| M1-9 | "Verified" is a one-click admin toggle with no evidence, no reason, no audit record; it defaults to "Verified" if no status is sent. Customer page says "verified workers" but lists unverified ones. |
| M1-10 | No rate limit on login/register, CORS open to every site, no security headers. |
| M1-11 | JWT valid 7 days in localStorage; frontend never handles 401 (expired token). |
| M1-12 | If the DB connection fails, the request continues and fails later with an unclear error; no startup check for `MONGO_URI`/`JWT_SECRET`. |
| M1-13 | Routes mounted twice (`/api/auth` and `/auth`, `/api/worker` and `/worker`); no 404 or central error handler. |
| M1-14 | User schema: email not lower-cased/trimmed at schema level, no max lengths, password not `select: false`, bcrypt cost 10. |
| M1-15 | Local UI removed the inputs for emergency contact, languages, and work-history duration/description (proposal Module 1 needs contact information management). |
| M1-16 | Category lists disagree: UI has 8 categories, the profiler knows 6; domestic work is missing. |

**Module 2 — Experience and Skill Profiler**

| ID | Problem |
|---|---|
| M2-1 | **Every voice input fails to save**: code sets `source: "AI-Voice-Extracted"` but the schema enum does not allow it → 500. |
| M2-2 | Running the profiler **overwrites** the worker's Module 1 occupation, category, years and skills. |
| M2-3 | Text with no trade word (e.g. "hello") **wipes** the whole skill profile; "Clear Profile" also erases Module 1 data. |
| M2-4 | The "knows nothing" filter deletes real descriptions ("Shuru mein mujhe kuch nahi aata tha, ab 6 saal se wiring…", "Nothing is impossible. I am a plumber…"). |
| M2-5 | Urdu keywords use substring matching: "تار" matches inside "تاریخ"; "رنگ" matches inside "وائرنگ" (wiring gives a painting skill). |
| M2-6 | Everyday words create skills: "fan of cricket", "light music", "software tester", "network router", "ups and downs", "table/bed", "tap/lock". |
| M2-7 | Years: Urdu number words and Urdu digits never match; "30000 salary" becomes 45 years; months are ignored. |
| M2-8 | "Confidence %" is invented (`84 + 5 × matches`, max 98); level comes only from years. |
| M2-9 | "+ Add" accepts any skill name, gives it 95% confidence (higher than extracted skills) and +10 "strength" per click. |
| M2-10 | Two skill lists (`skills` and `categorizedSkills`) drift apart. |
| M2-11 | Non-string text → 500; no max length. |
| M2-12 | Mixed-trade text: one category "wins" by keyword count; ties are decided by object order. |
| M2-13 | Voice uses the browser Web Speech API, which by default sends audio to an online service; no consent text. |
| M2-14 | Domestic work and the UI categories "Home Maintenance" and "Cleaning & Shifting" have no rules, so those workers get "no match". |
| M2-15 | It is named "AI" but is a keyword dictionary, and its accuracy has never been measured (no labelled data). The department does not accept "AI on top" as a contribution. |

**Module 3 — Skill Evidence and Verification**: not started.

---

## Part C — Target design (what "done" looks like)

### C1. Stack and versions (checked against official docs on 6 Nov 2026 — run `npm view <package> version` to confirm before installing)
- Node.js: **24 LTS** (26 LTS is also fine; Node 20 is end-of-life). Set `"engines": { "node": "24.x" }` in both package.json files so laptops and Vercel use the same major version (Vitest 5 needs Node 22.12 or newer and Mongoose 9 needs 20.19 or newer, so 24 satisfies both). Check in Vercel's docs how it reads `engines`, and set the same version in the Vercel project settings. If `node -v` on my laptop shows an older version, stop and tell me how to install Node 24 on Windows.
- Backend: Express **5.3.x** (npm default since March 2025; Express 4 is in maintenance), Mongoose **9.11.4 or newer** (9.11.4 fixed prototype-pollution bugs and made `sanitizeFilter` work at connection level; the current lockfile has 9.11.2), jsonwebtoken 9, bcryptjs 3, cors, dotenv, helmet, express-rate-limit, **zod 4** (validation), multer 2 (uploads), file-type (content check), sharp (image re-encoding).
- Express 5 rules to remember: `req.query` cannot be reassigned (store validated data on `req.validated`), `req.body` is `undefined` when there is no body, async errors go to the error handler automatically, `*` wildcard routes must be named.
- Frontend: React 19, React Router 7, Vite 8, axios (keep the versions in the lockfile).
- Tests: **Vitest 5** + Supertest + mongodb-memory-server (backend); Vitest + React Testing Library + jsdom (frontend).
- Do **not** add other packages without asking.

### C2. Backend folder structure (create only what is needed)
```
backend/
  app.js                    builds and exports the Express app (no listen) — used by tests and Vercel
  server.js                 local: connects DB and listens; Vercel: exports app
  config/env.js             reads and checks env vars at startup (fails fast with a clear message)
  config/db.js              cached Mongoose connection (safe for serverless)
  config/skillTaxonomy.js   ONE list of categories, skills, synonyms (English, Roman Urdu, Urdu), tools
  middleware/auth.js        protect, requireRole
  middleware/validate.js    validate(zodSchema, 'body'|'query'|'params')
  middleware/errorHandler.js notFound + central error handler (generic 500 message)
  middleware/rateLimit.js   limits for auth routes and uploads
  middleware/upload.js      multer memory storage + limits
  models/User.js, WorkerProfile.js, Evidence.js, EvidenceFile.js, AuditLog.js, Counter.js
  routes/  auth, workers, evidence, admin, meta
  controllers/  one file per route group
  services/skillExtractor/  normalize.js, extractor.js (pure functions, no DB)
  services/trust/skillConfidence.js  (pure function, no DB)
  services/storage/index.js          save / read / remove evidence files (MongoDB now, Vercel Blob possible later)
  services/workerId.js, services/cnic.js, services/audit.js
  validators/  zod schemas per route group
  scripts/createAdmin.js, scripts/listAdmins.js, scripts/migrateSkills.js, scripts/migrateCnic.js
  evaluation/skill-extraction/  dataset format, evaluate.js, results/
  tests/unit/, tests/integration/
```

### C3. API (new paths; update the frontend in the same phase)

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/health` | anyone | `{ ok: true }` + DB state |
| POST | `/api/auth/register` | anyone | worker or customer only |
| POST | `/api/auth/login` | anyone | rate-limited |
| GET | `/api/auth/me` | logged in | current user |
| GET | `/api/meta/taxonomy` | anyone | categories, skills, tools |
| GET / PUT | `/api/workers/me` | worker | own profile (full; CNIC never returned in full) |
| POST | `/api/workers/me/skills/extract` | worker | **suggestions only, saves nothing** |
| GET / POST | `/api/workers/me/skills` | worker | list / add confirmed skills (by `skillId`) |
| DELETE | `/api/workers/me/skills/:skillId` | worker | remove a skill |
| GET | `/api/workers` | customer, admin | public directory, paginated, safe fields only |
| GET | `/api/workers/:workerIdCode` | customer, admin | one public profile |
| POST | `/api/evidence` | worker | upload one file for one of *their* skills |
| GET | `/api/evidence/mine` | worker | own evidence + status |
| GET | `/api/evidence/:id/file` | owner or admin | stream the file |
| DELETE | `/api/evidence/:id` | owner | delete own pending or rejected evidence (never `suspected_fake` records, see C6) |
| GET | `/api/admin/evidence?status=pending` | admin | review queue |
| PATCH | `/api/admin/evidence/:id` | admin | approve / reject with reason |
| GET | `/api/admin/workers` | admin | all workers (no CNIC number) |
| POST | `/api/admin/workers/:id/identity/check-cnic` | admin | compare a typed CNIC with the stored hash (CNIC Option 1) |
| GET | `/api/admin/workers/:id/cnic` | admin | **only if CNIC Option 2**: full CNIC, writes an audit log entry |
| PATCH | `/api/admin/workers/:id/identity` | admin | set identity status + note, audit log |
| GET | `/api/admin/users` | admin | users without passwords |

### C4. Data model changes
- **User**: email `lowercase`, `trim`, unique, max length; password `select: false`; role enum unchanged (`worker`, `customer`, `admin`).
- **WorkerProfile**:
  - `workerIdCode` from a `Counter` collection with an atomic `$inc` (format `DLM-<year>-<6 digits>`, e.g. `DLM-2026-000123`), never random.
  - **CNIC — decision for me (explain both, then ask):** PECA 2016 section 16 makes it an offence to obtain, keep or use another person's identity information without authorization, NADRA advises against unnecessary CNIC copies, and NIST/OWASP say the best protection is not to store such data. Pakistan's Personal Data Protection Bill was still not law in October 2026.
    - Option 1 (recommended, simplest): do **not** store the CNIC number. Store only `cnicHash` = HMAC-SHA256 of the normalised number with a secret key (`CNIC_HASH_KEY`), with a unique index, so one CNIC cannot be used for two accounts. The admin verifies identity by looking at the real card in person or on a video call and typing the number; the server checks it against the hash. Remove the "reveal CNIC" endpoint.
    - Option 2: store the number encrypted with AES-256-GCM using Node's built-in `crypto` (`CNIC_ENC_KEY`), plus the same `cnicHash`; show it masked; full reveal only for admins through an audited endpoint.
    - Important for Option 1: a CNIC has only 13 digits, so anyone who steals **both** the database and `CNIC_HASH_KEY` could hash every possible number and recover CNICs. Keep the key only in environment variables (never in the database or Git), and record "keys in Vercel env vars instead of a key-management service" as an accepted limitation.
    - Either way: validate the format `#####-#######-#` on the server, never return it to customers or other workers, never log it, and write `scripts/migrateCnic.js` to convert existing plain-text values (run on a real database only after asking me). Atlas free clusters do not offer customer-managed encryption at rest, so app-level protection is needed.
  - Numbers with ranges: `experienceYears` 0–60 (integer), `hourlyRate` and `dailyRate` 0–1,000,000; strings with max lengths; `availability` enum; `category` must be a taxonomy category id.
  - `verificationStatus` stays the **identity** status: `Unverified | Pending | Verified | Rejected`, plus `identityNote`, `identityReviewedBy`, `identityReviewedAt`.
  - **One** skills array: `skills: [{ skillId, name, category, addedVia: 'extractor'|'manual', custom: Boolean, addedAt }]`, unique per `skillId` (fixes M2-10). Remove `categorizedSkills`, `recommendedSkills`, `skillStrengthScore`, `confidenceScore`. Write `scripts/migrateSkills.js` to convert old data (map old names to taxonomy ids; unknown names become `custom: true`). Run it on a real database **only after asking me**.
  - Keep `rawExperienceText` and `lastExtractedAt` (useful for the evaluation dataset, with consent).
- **Evidence** (new): `worker`, `skillId`, `type` (`certificate` | `work_photo` | `reference_letter` | `other`), `title`, `description`, `file { fileId, mimeType, size, sha256, storedName }`, `status` (`pending` | `approved` | `rejected` | `revoked`), `rejectReason` (`unclear` | `not_relevant` | `wrong_skill` | `suspected_fake` | `other`), `reviewNote`, `reviewedBy`, `reviewedAt`, `possibleDuplicateOf`, timestamps. Indexes: `{ worker, skillId }`, `{ status, createdAt }`, `{ 'file.sha256' }`.
- **EvidenceFile** (new): `data` (Buffer), `mimeType`, `size`, `createdAt`. Never loaded in list queries.
- **AuditLog** (new): `actor`, `action`, `targetType`, `targetId`, `fromState`, `toState`, `reason`, `details`, `createdAt`. Append-only. Write it for: identity decision, every evidence state change, CNIC check or reveal (without the number), admin created.
- **Evidence** may also store `file.dhash` if the optional near-duplicate check is built.

### C5. Module 2 redesign — honest, testable rule-based extractor
- Rename everywhere: UI "Skill Profiler (rule-based)" or "Skill Finder"; code `skillExtractor`. Remove the words "AI" and "AI-Extracted" from UI, API and database values.
- `normalize.js`: Unicode NFC; lower-case; convert Urdu/Arabic digits (۰–۹, ٠–٩) to 0–9; unify common Urdu letter variants (ي→ی, ك→ک, ه→ہ where safe); replace punctuation including `، ۔ ؟` with spaces; collapse spaces; split into tokens.
- Match **whole tokens and token sequences** for all scripts (this fixes M2-5). No substring matching.
- Each skill in the taxonomy has **strong** terms (clear trade words, e.g. "wiring", "وائرنگ", "pprc") and **weak** terms (ambiguous words, e.g. "light", "fan", "table", "tap", "lock", "tester", "router", "ups"). A weak term counts only if a strong term of the **same category** is in the text (fixes M2-6). This trades recall for precision: "I install fans and lights" would now give no skill. Do not add more rules to hide this; the evaluation will measure the cost.
- Years: use Unicode-aware boundaries (regex `u` flag, lookarounds), the unit must be a whole word (`saal`, `sal`, `year(s)`, `yr(s)`, `سال`), support Roman Urdu, English and Urdu number words and months (`mahine`, `month(s)`, `مہینے`); return `{ years, months }`. Values above 60 years are ignored and reported as "please check". (Fixes M2-7.)
- Negative phrases ("kuch nahi aata") only matter when **no** skill matched, and they never delete anything (fixes M2-4).
- Output is a **suggestion object**: suggested category/occupation/years, and a list of skills, each with `skillId`, name, category and the **matched words** (the explanation). No confidence %, no level, no score (fixes M2-8). The extract endpoint saves nothing (fixes M2-2, M2-3).
- The worker ticks the suggestions they agree with and presses "Add selected skills". Occupation/category/years are filled into the Module 1 form only if the worker clicks "Use these suggestions" (fixes M2-2).
- "Related skills in your trade" is a simple picker from the taxonomy; adding one gives no score (fixes M2-9).
- Add domestic work and the missing categories to the taxonomy so the UI and extractor use the same list (fixes M1-16 and M2-14). Ask me which categories and skills to include before you finalise the list.
- Give each category an optional `iscoCode` (the 4-digit ISCO-08 occupation code, which Pakistan's occupation classification also uses for these trades; for example 7411 electricians, 7126 plumbers, 7127 air-conditioning and refrigeration mechanics, 9111 domestic cleaners). Leave a code empty if you cannot confirm it from the official ISCO-08 list.
- When several trades match, return all of them with their matched words and let the worker choose the main trade; if there is a tie, say so instead of picking silently (fixes M2-12).
- Voice input: keep it optional, behind a notice: "Voice typing uses your browser's speech service, which may send your audio to an online service. Use the text box if you prefer." Text is the main input (M2-13).
- **Evaluation harness** (fixes M2-15) in `backend/evaluation/skill-extraction/`:
  - `README.md`: how to collect real worker descriptions with consent; **freeze the test set before changing any rules**; two team members label independently (ideally including one who did not write the rules); split into a *development* set (for improving rules) and a *test* set (used once, for the report).
  - `dataset.format.md` + `dataset.synthetic.sample.json` (5–10 clearly **synthetic** examples, only to test the script, never for reported results).
  - `evaluate.js` (run with `npm run evaluate:skills -- --file <path>`): per-skill and micro/macro precision, recall, F1, with **Wilson 95% confidence intervals** for precision and recall (better than the usual interval for small samples); category accuracy; years exact match; prints a table and writes JSON to `results/` with date and dataset file hash.
  - F1 is not a simple proportion, so also report a **bootstrap 95% interval** for F1 (resample whole descriptions, fixed random seed, e.g. 1,000 resamples).
  - **Baselines**: keep the old profiler as `evaluation/baselines/legacyProfiler.js` (do not delete it) and add a naive English-only exact-match baseline. Compare systems on the same test set with a **paired** test (paired bootstrap or approximate randomisation).
  - **Ablation**: run "dictionary only" → "+ normalisation" → "+ Urdu-script terms" → "+ weak-term rule", so we can show what each design choice adds.
  - Break every result down by script: English, Roman Urdu, Urdu, mixed.
  - `agreement.js`: Cohen's kappa **and** Krippendorff's alpha between two annotators' label files.
  - Unit-test the metric functions with hand-worked numbers.
  - The README must say: collect descriptions only with informed consent, remove names/phone numbers/addresses before labelling, and ask the supervisor whether SZABIST needs ethics approval.
  - Do **not** write any results into documents yourself; I will run it on our real data.

### C6. Module 3 — Skill Evidence and Verification
- **Storage (default — confirm with me)**: store each re-encoded image as binary data (`Buffer`, which MongoDB saves as BinData) in a **separate** `EvidenceFile` collection, linked from `Evidence.file.fileId`. MongoDB's docs recommend this, not GridFS, for files smaller than 16 MiB. Reasons: no new service or token, works offline in tests with mongodb-memory-server, private by design (files are only reachable through our API). Limits: Atlas free tier is 0.5 GB shared with all app data, so enforce the per-worker limits below.
  Rough estimate (not measured): about 300 KB per re-encoded image × 30 items ≈ 9 MB per very active worker, so about 50 heavy users could fill the free cluster. Fine for an FYP demo; measure real sizes during testing and write the numbers in `docs/DECISIONS.md`.
  Put all storage calls behind `services/storage/index.js` (`save(buffer, meta)`, `read(id)`, `remove(id)`) so we can switch later to a **private Vercel Blob store** (free on Hobby: 1 GB; private stores available on all plans since June 2026) by changing one file. Record this choice and the alternative in `docs/DECISIONS.md`.
- **Upload rules** (`POST /api/evidence`, multipart form):
  - `multer@^2.5.0` with `memoryStorage`, attached **only** to this route (never globally). Limits: `fileSize` 4 MB, `files: 1`, `fields: 5`, `parts: 6` (Vercel rejects request bodies above 4.5 MB, so leave headroom). Keep `fileFilter` **synchronous** (several 2026 multer advisories, including the one fixed in 2.5.0, affect async filters). Turn `MulterError` `LIMIT_FILE_SIZE` into HTTP 413 with a clear message.
  - `skillId` must be one of the worker's own skills; max 5 evidence items per skill and 30 per worker.
  - Check the real type from the file bytes with `file-type` (version ≥ 21.3.1; it is ESM-only, which suits this project). Allow **images only**: JPEG, PNG, WebP. Reject PDF in this version (no free tool can safely clean PDFs in Node; workers can photograph or scan certificates) and reject HEIC with the message "Please upload a JPG or PNG photo". Ignore the browser's `Content-Type` and the original extension.
  - Re-encode every image with `sharp` (0.35.x): auto-rotate first (check in the sharp docs whether to use `.rotate()` with no arguments or `.autoOrient()`), resize to fit inside 2000×2000 without enlarging, output WebP (quality about 80), and set a pixel limit for decompression bombs (check the current option name in the sharp docs). sharp removes all metadata by default, including EXIF and GPS location.
  - Compute SHA-256 of the **original** uploaded bytes. Same hash already uploaded by the **same** worker for the same skill → 409. Same hash from a **different** worker → save, set `possibleDuplicateOf`, and warn the admin (do not auto-reject).
  - Optional (only if I agree, no new package): compute a 64-bit **dHash** with sharp (greyscale, 9×8 pixels, compare neighbours) and store it as 16 hex characters. A small Hamming distance to another worker's image only **flags** it for the admin. Put the threshold in config and mark it "provisional — to be measured on our own photos"; published work shows thresholds depend on the dataset and perceptual hashes can be fooled on purpose.
  - Store a generated name (never the user's file name) and a cleaned title.
  - Consent checkbox required: "This is my own work or certificate. I will not upload CNIC images or photos of other people's faces or house numbers."
- **Serving files**: only the owner and admins; check ownership inside the route handler; headers `Content-Type: image/webp`, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.
- **Admin review**: queue of pending evidence (oldest first), preview, approve or reject; a reason code is **required** to reject (optional note). States: `pending → approved | rejected`, and admin-only `approved → revoked` (with a reason) to correct mistakes. Enforce allowed transitions on the server, **atomically**: update only if the status is still the expected one (a conditional `findOneAndUpdate` with `returnDocument: 'after'`, since Mongoose 9 deprecates `new: true`); if two admins or an old screen try the same review, the second gets 409. Every transition writes an audit log entry (who, when, from-state, to-state, reason). The audit log is append-only (no update/delete routes), never contains CNIC values, and is **hash-chained**: each entry stores SHA-256 of the previous entry's hash plus its own content, with a small `npm run audit:verify` script that detects tampering. One admin reviewing alone (no two-person approval) is an accepted limitation; write it in `docs/SECURITY.md`.
- **Deletion rules (closes a loophole):** a worker may delete their own `pending` evidence or evidence rejected for `unclear`/`not_relevant`/`wrong_skill`/`other`. Evidence rejected as `suspected_fake` can **never** be deleted by the worker: if they ask, delete only the file bytes and keep the record and its rejection, so it still counts against the skill. Otherwise a worker could delete a fake-evidence finding and remove the "Disputed" status.
- **Skill confidence** (`services/trust/skillConfidence.js`, pure function, unit-tested with hand-worked examples):
  - Uses the Beta / subjective-logic evidence idea: positive evidence `r`, negative evidence `s`, prior weight `W = 2`, base rate `a = 0.5`.
  - `belief = r/(r+s+W)`, `disbelief = s/(r+s+W)`, `uncertainty = W/(r+s+W)`, `expected = belief + a × uncertainty`.
  - `r` = sum of weights of **approved** evidence (start values: certificate 2, work photo 1, reference letter 1, other 0.5 — put them in one config object and document them as design parameters to be evaluated later, not as facts).
  - `s` = count of evidence rejected as `suspected_fake` (other rejection reasons do not count against the worker).
  - The worker's own claim (typed manually or confirmed from the extractor) adds **nothing** to `r`: both come from the same person, so counting them would double-count one statement. A skill with no evidence must show high **uncertainty**, not disbelief — this is fairer to new workers.
  - Write a small script `npm run confidence:sensitivity` that prints how `expected` and the status change when the weights are changed (for the report's sensitivity analysis). No published source fixes these weights; they are our design choice. The script must also compare these known weak points:
    - negative evidence weighted by type (a fake certificate costs 2, like its positive weight) versus the default (each fake costs 1) — with the default, one approved certificate plus one fake still gives 0.60, above the 0.50 of no evidence;
    - all work photos counted versus at most 2 approved work photos counted per skill — with the default, five photos of possibly the same job (0.86) beat one certificate (0.75).
  - "Disputed" always wins over "Verified by evidence" when both apply.
  - Skill status shown to users: `Self-declared` (no evidence), `Evidence pending`, `Verified by evidence` (at least one approved item), `Disputed` (any suspected_fake). Show the reason in words, e.g. "Verified by evidence: 1 certificate, 2 work photos approved".
  - Recompute after every admin decision and evidence deletion; store `skills[i].evidenceSummary` for fast directory display.
- **Identity verification** (M1-9): admin sets `Verified`/`Rejected` with a note after checking the worker's CNIC **in person or by video call**. Do **not** build CNIC image upload in this version.
- **Customer directory**: shows "Identity verified" separately from per-skill badges; filter "only verified skills"; honest page title ("Find workers").
- **Phone number (decision, 8 Nov 2026)**: a worker's phone (and WhatsApp) number must **not** appear in the directory, search results or public profile. A customer sees it only after a booking between them is accepted. Until a booking module exists, the directory and public profile show no phone number at all. Implement in Phase 3 (directory rework); this replaces the hotfix's "phone stays" choice. See `docs/DECISIONS.md`.

### C7. Frontend changes
- `api.js`: base URL from `import.meta.env.VITE_API_URL` (create `frontend/.env.example`); response interceptor: on 401 clear storage and go to `/login` with a message.
- `context/AuthContext.jsx`: holds the user; on app start calls `/api/auth/me`; components read the user from the context instead of parsing localStorage everywhere.
- Register: remove the Admin button; show password rules; client-side checks that match the server.
- Routes: `/` sends logged-in users to their dashboard; add a Not Found page.
- Worker profile page: restore emergency contact, languages and work-history duration/description inputs; categories from `/api/meta/taxonomy`.
- Skill profiler page: suggestions with checkboxes and matched words; "Add selected skills"; "Use these suggestions" for occupation/category/years; voice notice; no percentages.
- New "My skills and evidence" page: each skill with status badge and explanation; upload form (type, title, image, consent); list of evidence with status and reject reason; delete button only where the deletion rules in C6 allow it. Phone photos are often bigger than 4 MB, so **shrink the image in the browser before upload** with a `<canvas>` (max 2000 px, JPEG quality about 0.85) — no extra package — and show a friendly error if it is still too big.
- Admin: identity verification with note (CNIC check box for Option 1, or masked CNIC + audited "Reveal" for Option 2); new "Evidence review" page (image fetched as a blob with the logged-in request, approve/reject with a required reason, "possible duplicate" warning).
- Customer: uses the new public endpoint; shows identity and skill badges; pagination; no CNIC/email/address/phone anywhere (phone only after an accepted booking, see C6).

---

## Part D — Phases

### Phase 0 — Safety checkpoint and inspection (no code changes)
1. In the repo root, run and show me: `git status`, `git branch -a`, `git log --oneline -5`, `node -v`, `npm -v`.
2. If Module 2 files or other changes are uncommitted, create branch `baseline/local-module-2` and commit the app code **as it is** with message `Baseline: local Module 1 + Module 2 before fixes`. Before committing, check that no `.env` file or `node_modules` folder is staged. Commit `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md` and `docs/audit/` separately as `docs: add audit and working rules`. Ask me before pushing anything to GitHub.
3. Create branch `feature/modules-1-3` from the baseline.
4. Read every backend and frontend source file. Tell me, in a short table, which audit IDs in Part B you can **confirm** in the real code and which do **not** match.
5. Stop and wait.

### Phase 0B — Emergency hotfix for the two Critical holes (only if I say the live site may hold real people's data)
The full fixes come in Phase 3, but M1-1 and M1-2 are open on the live site until then. On a branch `hotfix/critical-m1-1-m1-2` from the baseline, make only these two small changes:
1. In `registerUser`, accept only `worker` or `customer` (anything else → `worker` or 400), and remove the Admin button from `Register.jsx`.
2. In `getAllWorkers`, return an explicit safe field list (no `cnicNumber`, `address`, `emergencyContact`, `whatsappNumber`; populate `user` with `name` only, no email), and remove `'worker'` from the route's allowed roles.
Add one test for each (use Node's built-in `node:test` if the test tools are not installed yet), show me the result, and ask me before pushing or deploying. Then give me a **read-only** command to list existing admin accounts in the real database so I can decide which to remove.

### Phase 1 — Dependencies and test tooling
1. Make `backend/package.json` and `package-lock.json` agree on Express 5.3.x, Mongoose ≥ 9.11.4, bcryptjs 3, jsonwebtoken 9, cors, dotenv. Add `engines`. Explain each change. The current code should already be compatible (no `*` routes; neither Mongoose `pre('save')` hook calls `next()`, which Mongoose 9 removed — `User.js` uses an async hook and `WorkerProfile.js` a synchronous one; prove both still run with a test) — confirm this by reading the code, and run `npx codemod@latest @expressjs/v5-migration-recipe` only if you find Express 4-only code. Then run `npm audit` and show me the result.
2. Install (after my yes): `helmet`, `express-rate-limit`, `zod`, `multer@^2.5.0`, `file-type` (≥ 21.3.1), `sharp`; dev: `vitest`, `supertest`, `mongodb-memory-server`. Frontend dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`.
3. Add scripts: backend `dev`, `start`, `test`; frontend `test`. Add the other scripts (`create-admin`, `evaluate:skills`, `confidence:sensitivity`, `audit:verify`) in the phase that builds each one.
4. Write one trivial passing test in each project to prove the setup works. Note: mongodb-memory-server downloads a MongoDB binary the first time; tell me the size and where it is cached.
5. Write one tiny **multer + Express 5** upload test now (a small image to a temporary test route), because no official page says multer 2.x supports Express 5. If it fails, stop and tell me.
6. Run `npm ci` in both folders to prove the lockfiles are clean.

### Phase 2 — Backend foundation
`app.js`/`server.js` split, `config/env.js` (required: `MONGO_URI`, `JWT_SECRET` ≥ 32 random characters, `CLIENT_ORIGIN`; optional: `PORT`), `config/db.js` (cache the connect **promise** at module scope; options `serverSelectionTimeoutMS` and `maxIdleTimeMS: 60000`; set `mongoose.set('sanitizeFilter', true)` **everywhere, including production**, and `mongoose.set('strictQuery', 'throw')` only for development/tests; if the connection fails, respond 503 "Service temporarily unavailable"), helmet, CORS allow-list from `CLIENT_ORIGIN` (comma-separated), `express.json({ limit: '100kb' })`, rate limits with express-rate-limit (use the `limit` option, `standardHeaders: 'draft-8'`, `legacyHeaders: false`; auth: about 10 attempts per 15 minutes), `app.set('trust proxy', N)` so `req.ip` is the real visitor and not Vercel's proxy (otherwise every user can share one rate-limit counter) — find N with a temporary `/api/debug/ip` route on a Preview deployment as express-rate-limit's proxy guide explains, then remove that route, `notFound` + `errorHandler` (generic message for 500, real details only in server logs), `validate(schema, source)` middleware that stores the parsed result on `req.validated` (never reassigns `req.query`), `/api/health`, remove duplicate mounts. Update `.env.example`.
Tests: health route; unknown route → 404 JSON; error handler hides internals; a request from an unknown origin gets no `Access-Control-Allow-Origin` header (CORS works by withholding that header, not by blocking the request); a request with no body to a POST route returns 400, not 500.
Note in the docs: the default rate-limit store is in memory, per server instance, so on Vercel it is only partial protection. Real protection comes from the account lockout in Phase 3 plus one free Vercel Firewall rate-limit rule on `/api/auth/*` (Phase 8).

### Phase 3 — Module 1 fixes
Fix M1-1 to M1-16 with the design in Part C. Includes: register allows only worker/customer; `scripts/createAdmin.js` and `scripts/listAdmins.js`; zod schemas for register, login, profile update, directory query (use a **strict** schema so unknown keys give 400; every value must be a string of the expected type — no arrays or objects; escape search text, max 50 characters; category and availability must be known values; page/limit numbers); public directory projection; `Counter`-based worker ID; CNIC handling as decided in C4 (ask me Option 1 or 2 first); identity verification endpoint with note and audit log; `algorithms: ['HS256']` on `jwt.verify`.
Passwords (OWASP Password Storage): **reject** passwords longer than 72 bytes (`Buffer.byteLength(pw, 'utf8') > 72`, because bcrypt ignores the rest), bcrypt cost 12, no "must contain a symbol" rules.
**Minimum password length — decision for me:** OWASP's Authentication Cheat Sheet asks for at least 15 characters when there is no multi-factor login (8 only with MFA). Our users are daily-wage workers, so explain both choices simply: (a) 15 characters, encouraging an easy passphrase such as four Roman Urdu words; or (b) 8 characters plus account lockout, written down in `docs/SECURITY.md` as a justified exception. Wait for my choice.
Login: one generic failure message ("Email or password is incorrect"); when the email does not exist, still run a dummy bcrypt comparison so success and failure take similar time; account lockout stored on the User (`failedLoginCount`, `lockUntil`, e.g. 5 failures → 15 minutes), because OWASP asks for per-account throttling and the in-memory IP limiter is weak on Vercel.
**Token storage — decision for me (ask before you build it):** OWASP's Session Management Cheat Sheet now says not to keep JWTs in `localStorage`.
- Option A (recommended): the API sets the token in an `HttpOnly; Secure; SameSite=Strict` cookie (OWASP's preference; fall back to `Lax` only if a real test shows Strict breaks something), and the frontend calls the API through a same-origin Vercel rewrite (`/api/*` → backend), so the cookie is first-party. Add a real CSRF check for POST/PUT/PATCH/DELETE (for example, reject requests whose `Origin` header is not in our allow-list) — SameSite alone is not enough, and the old `csurf` package is archived, so do not use it. Logout must also work **on the server**: add a `tokenVersion` number to the User, put it in the token, check it in `protect`, and increase it at logout so old tokens stop working. Verify `exp` (and `iss`/`aud` if you set them). Build the rewrite on a Preview deployment first, because it has not been tested yet.
- Option B (fallback): keep the Bearer token in `localStorage`, but make it short-lived (e.g. 1 hour), and add a Content-Security-Policy **for the React pages** in the frontend's `vercel.json` headers (helmet only protects API responses, not the page itself). Record this as a known limitation in `docs/SECURITY.md`.
Explain both to me in simple words and wait for my choice.
Required tests (at minimum): register with `role: "admin"` → 400 (role must be worker or customer); missing or invalid fields → 400 with messages, never 500; short password rejected; duplicate email → 409; login wrong password → 401 with a generic message; directory and public-profile responses contain no `cnicNumber`, `address`, `emergencyContact`, `email`, `phone`, `whatsappNumber`; a worker calling `GET /api/workers` → 403; search `C++` and `(` → 200; `?category[$ne]=x` and `?search[]=a` → 400 and nothing reaches MongoDB; negative rate → 400; 200 profiles created in a loop get 200 unique worker IDs; admin identity decision writes an audit log; non-admin → 403 on every admin route.
Ask me before running `listAdmins`/any clean-up against the real Atlas database (anyone could have created admin accounts there).

### Phase 4 — Module 2 redesign
Build `config/skillTaxonomy.js` (ask me to approve the category list), `services/skillExtractor/*`, the new endpoints, the confirm flow, the migration script, the evaluation harness and the frontend page (Part C5). When the new extractor passes its tests, **move** (do not delete) `utils/aiSkillProfiler.js` to `evaluation/baselines/legacyProfiler.js`, remove it from the live API, and ask me before doing this.
Required regression tests (each was a real failure in the audit):
- "Main 5 saal se plumbing, PPRC pipe fitting aur geyser ka kaam karta hoon" → plumbing, 5 years, PPRC fitting + geyser.
- Voice input no longer breaks saving (there is no `source` enum any more).
- "میں دو سال سے وائرنگ کرتا ہوں" → 2 years, wiring, **no painting skill**.
- "۵ سال کا تجربہ" → 5 years. "meri 30000 salary hai, plumbing karta hoon" → years not detected (0 or null), plumbing found. "6 mahine se wiring" → `{ years: 0, months: 6 }` (the extractor reports months separately; "Use these suggestions" fills the whole-number years field with `Math.floor(totalMonths / 12)` and shows the months to the worker).
- "آج کی تاریخ اور ستارہ" → no skill.
- "Shuru mein mujhe kuch nahi aata tha, ab 6 saal se wiring aur solar ka kaam karta hoon" → wiring + solar, 6 years.
- "Nothing is impossible. I am a plumber with 10 years experience" → plumbing, 10 years.
- "I am a big fan of cricket and I like light music", "I work as a software tester and fix network router issues", "Life has ups and downs", "I sit at the table and sleep on the bed", "Please tap the button and lock the phone" → **no** skills.
- "hello" → no skills, and the worker's saved profile is unchanged.
- Extract endpoint does not change the database; non-string or > 2,000-character text → 400 (M2-11).
- Adding a skill twice keeps one copy; adding an unknown `skillId` → 400 (custom skills only through a separate, clearly marked field).

### Phase 5 — Module 3 build
Build Part C6: models, storage service, upload middleware, evidence and admin endpoints, skill confidence function, frontend pages. Ask me to confirm the storage choice (MongoDB vs private Vercel Blob) before you start.
Required tests: upload a real small JPEG with GPS EXIF data → 201, and the stored WebP has no EXIF/GPS; a text file renamed to `.jpg` → 400; a PDF → 400; a HEIC photo → 400 with the "JPG or PNG" message; a 5 MB file → 413 with a clear message; evidence for a skill the worker does not have → 400; reject without a reason → 400; an invalid transition (e.g. `rejected → approved`) → 400; `approved → revoked` works for admin and updates the skill status; the same file twice for the same skill → 409; the same file from another worker → 201 with `possibleDuplicateOf` set; worker A cannot download or delete worker B's evidence (403/404); customer cannot download any evidence; admin approve/reject writes audit log and updates the skill status; `skillConfidence` unit tests with hand-worked numbers (for example: no evidence → expected 0.5, uncertainty 1; one approved certificate (r=2) → belief 0.5, uncertainty 0.5, expected 0.75; one suspected fake (s=1) → expected 0.333…; one work photo (r=1) → 0.667; one certificate + one fake (r=2, s=1) → 0.60); **property tests**: adding approved evidence never lowers `expected`, uncertainty always falls as evidence grows, self-claims alone never change the score; **invariant test**: no skill ever shows "Verified by evidence" without at least one approved evidence record; a worker cannot delete a `suspected_fake` record and the skill stays "Disputed"; two simultaneous reviews of the same item → one succeeds, one gets 409; `audit:verify` detects an edited audit entry; deleting evidence removes its `EvidenceFile` document; list endpoints never load file bytes.

### Phase 6 — Frontend integration and tests
Part C7. Frontend tests: Register has no Admin option; 401 response sends the user to login; the evidence form requires the consent checkbox; the customer directory never renders CNIC/email/address. Run `npm run build` and `npm run lint` and fix problems.

### Phase 7 — Documentation for the FYP report
Create or update, in simple English:
- `README.md` (root): what the project is, Windows setup step by step (Node version, MongoDB Atlas or local MongoDB, `.env` values, commands), how to run tests, how to create the first admin.
- `docs/API.md`: every endpoint, who can call it, request/response examples, error codes.
- `docs/DATA-MODEL.md`: collections, fields, indexes, and a Mermaid ER diagram.
- `docs/TEST-CASES.md`: a table (ID, module, description, steps, expected result, actual result, pass/fail) generated from the real test files; actual results only from real runs.
- `docs/SECURITY.md`: each threat → mitigation → test that proves it (map to the audit IDs).
- `docs/DECISIONS.md`: short decision records — MERN instead of the proposal's Laravel/MySQL; no external AI APIs; rule-based extractor + evaluation; evidence files in MongoDB (and why not GridFS or Vercel Blob yet); images only (no PDF) in this version; Beta-style skill confidence and its provisional weights; CNIC option chosen and no CNIC image upload; token storage option chosen.
- `docs/CHANGELOG.md`: what changed in each phase.

### Phase 8 — Deployment check (ask before changing anything on Vercel)
- List the environment variables needed on Vercel (backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `CNIC_HASH_KEY`, and `CNIC_ENC_KEY` only for CNIC Option 2; frontend: `VITE_API_URL`). Explain how to generate strong random keys in PowerShell, and warn me that losing `CNIC_ENC_KEY` makes stored CNICs unreadable.
- `sharp` installs a different native binary on Windows and on Vercel's Linux. Do not commit `node_modules`; let Vercel run `npm install`. If the Vercel build fails on sharp, read sharp's installation page and explain the fix before changing anything.
- Vercel's free Hobby plan is for non-commercial, personal use. Note this as a limitation in the report docs.
- `backend/vercel.json` uses the legacy `builds` property, which Vercel's docs now recommend against; Vercel deploys Express with zero configuration when the entry file default-exports the app. Propose removing `builds`/`routes`, and test it on a **Preview** deployment before production. Confirm which entry file Vercel picks when both `app.js` and `server.js` exist.
- Remind me: request bodies above 4.5 MB are rejected by Vercel (413), the file system is read-only except `/tmp`, and MongoDB Atlas free tier has 0.5 GB storage, so evidence files must stay small.
- Explain how to add the one free Vercel Firewall rate-limit rule for `/api/auth/*`.
- Give me a manual test checklist to run in Chrome on the deployed site, and a list of the admin accounts that exist in the real database (read-only) so I can decide which ones to remove.

---

## Part E — Do not do these

- Do not add AI APIs, LLMs, or any "AI" label.
- Do not show invented percentages or scores.
- Do not store or show CNIC to customers or other workers.
- Do not save uploaded files on the server's disk (Vercel's file system is read-only except a temporary folder).
- Do not delete my existing data or run migrations on Atlas without asking.
- Do not start Modules 4–12 (jobs, ratings, matching, disputes, safety, career, credential). If a change would help them later, mention it in `docs/DECISIONS.md` only.
- Do not push to GitHub or deploy without my yes.

## Part F — Final checklist (show it to me filled in at the end)

- [ ] Every audit ID in Part B is fixed or explicitly marked "won't fix" with my approval.
- [ ] `npm test` passes in backend and frontend (real output pasted).
- [ ] `npm ci` works in both folders.
- [ ] No response to a customer or worker contains `cnicNumber`, `password`, `address`, `emergencyContact` or another user's `email` (tested).
- [ ] Admin can be created only by the script (tested).
- [ ] Voice and text both work in the skill profiler; nothing is overwritten without the worker's click.
- [ ] Evidence upload, review, and skill status work end to end in Chrome.
- [ ] Evaluation scripts (metrics, bootstrap, baselines, agreement) run on the synthetic sample (no results written to documents).
- [ ] A `suspected_fake` record cannot be deleted by the worker, and no skill shows "Verified by evidence" without approved evidence (tested).
- [ ] `npm run audit:verify` and `npm run confidence:sensitivity` work.
- [ ] Every "decision for me" in this file (password length, token storage, CNIC option, storage choice, taxonomy list) was asked and my answer is recorded in `docs/DECISIONS.md`.
- [ ] Docs in Phase 7 exist and match the code.
