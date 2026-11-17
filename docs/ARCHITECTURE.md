# Architecture (after Batch 2, 9 Nov 2026; Batch 5 section added 16 Nov 2026)

A MERN single-page application. Everything below exists in the code today; Vercel deployment is
Phase 8 (not done). No external AI service and no LLM is used anywhere.

## Components

```mermaid
flowchart LR
  subgraph Browser["Browser (Chrome on phone or laptop)"]
    UI["React 19 app (Vite)<br/>pages, design system, AuthContext<br/>client checks (password, photo type/size)"]
  end
  subgraph Local["Vite dev server :5173 (Phase 8: Vercel rewrite)"]
    Proxy["/api proxy<br/>(same origin -> login cookie is first-party)"]
  end
  subgraph API["Express 5 API :5000 (backend/app.js)"]
    MW["helmet - CORS allow-list - JSON 100 kb<br/>CSRF Origin check - rate limits<br/>protect (JWT cookie + tokenVersion) - requireRole<br/>validate (zod) - error handler"]
    R["routes: auth, workers, skills, evidence, admin, meta"]
    C["controllers"]
    S1["services/skillExtractor<br/>(rule-based word list, pure)"]
    S2["services/trust/skillConfidence<br/>(Beta / subjective logic, pure)"]
    S3["services/evidence<br/>image (file-type + sharp), storage, transitions, skillSummary"]
    S4["services: audit (hash chain), cnic (AES-GCM + HMAC),<br/>session, onboarding, workerId (counter)"]
  end
  DB[("MongoDB<br/>users, workerprofiles, evidences,<br/>evidencefiles, auditlogs, counters")]
  Scripts["npm scripts: create-admin, audit:verify,<br/>confidence:sensitivity, evaluate:skills,<br/>migrate:*"]

  UI -->|"fetch /api (cookie)"| Proxy --> MW --> R --> C
  C --> S1 & S2 & S3 & S4
  C --> DB
  S3 --> DB
  S4 --> DB
  Scripts --> DB
```

Folders: `backend/config` (env check, DB connection, taxonomy, evidence limits), `models`, `routes`,
`controllers`, `services`, `validators`, `middleware`, `scripts`, `evaluation`, `tests`;
`frontend/src/components/ui` (design system), `features` (forms, skills editor, evidence),
`pages`, `routes` (guards), `hooks`, `utils`, `test`.

## Listen, Speak, See (Batch 5, frontend only; D-033 to D-036)

```mermaid
flowchart LR
  Field["Field / RadioCardGroup / FileUpload<br/>(assist = help key)"] --> FA["FieldAssist<br/>Listen + Speak + help bubble"]
  Card["Picture card / notification / guide"] --> OL["OptionListen (small 🔊)"]
  Page["AppShell"] --> PH["PageHelp (round 🔊, help.screen.*)"]
  FA & OL & PH --> Say["useSay: text in the SPOKEN language<br/>(Roman Urdu -> Urdu)"]
  Say --> Audio["audio.js: one sound or one mic at a time<br/>1 recorded clip -> 2 device voice -> 3 'none'"]
  Audio --> Clips[("public/audio/help/ur|en<br/>clipManifest.json<br/>(service worker: cache first)")]
  Audio --> TTS["window.speechSynthesis<br/>(the browser's own voices)"]
  FA --> VT["useVoiceTyping (SpeechRecognition)<br/>+ assistRules: never password, CNIC, email<br/>+ spokenNumbers (digits / amounts)"]
  Root["AssistRoot (RootLayout)"] --> Live["polite live region, Escape and page change stop everything,<br/>first-touch flag, 'read aloud?' question"]
  Settings[("localStorage dlm.assist.v1<br/>show buttons, auto-read")] --- FA & PH
```

Folders: `frontend/src/features/assist` (audio service, voices, settings store, help row, page help,
Sound menu, read-aloud question, voice notice, clip keys), `utils/spokenNumbers.js` and
`utils/numberWords.js` (a copy of the extractor's number words, checked by a test),
`pages/public/VoiceCheck.jsx` (`/voice-check`), `pages/dev/ClipRecorder.jsx` (`/dev/recorder`,
development builds only), `scripts/audio-manifest.mjs`, `scripts/i18n-review-batch5.mjs`. No server
code, no new package, no outside service: speech is the browser's own Web Speech API.

## Module 4: bookings, reviews and reputation (Batch 6, D-037 to D-058)

- **Pure engines** (no database, no clock, no randomness): `services/reputation/{beta,reputationEngine,
  reliabilityEngine,snapshot,matchingSignals}.js` and `services/booking/{transitions,schedule,contactInfo}.js`.
  The live API, the sensitivity script and the simulation (`evaluation/reputation/`) import the same files.
- **Database steps:** `services/booking/lifecycle.js` (conditional step, booking codes, after-close: audit,
  recompute, pattern check), `services/booking/sweep.js` (every due timer), `services/booking/contact.js` (the
  only reader of phone numbers for bookings), `services/reputation/recompute.js` (the only writer of the
  snapshot), `services/reputation/patternCheck.js` (flags).
- **Routes:** `/api/bookings` (`routes/bookings.js`), `/api/reviews`, `/api/cron/daily`, new `/api/workers/...`
  and `/api/admin/...` routes (`docs/API.md`). Every booking read sweeps first.
- **Frontend:** `features/booking/` (cards, actions, timeline, contact card, Hear this request, reason dialogs),
  `features/reputation/` (the only folder that draws stars: rating line, panel, stars input, review list,
  verified history), pages under `pages/customer`, `pages/worker`, `pages/booking`, `pages/admin`.
- **Data flow:** booking outcome / review → recompute → `WorkerProfile.reputation` → public profile, directory
  card, "Best track record", `toMatchingSignals` for Module 7 (diagram in `docs/modules/MODULE-4.md` §3).

## Request flows

### Login (D-006)
```mermaid
sequenceDiagram
  actor U as User
  participant R as React (Login page)
  participant A as API /api/auth/login
  participant M as MongoDB
  U->>R: email + password
  R->>A: POST (Origin: our site)
  A->>A: CSRF Origin check, rate limit (failed tries), zod validation
  A->>M: find user (+password)
  alt unknown email
    A->>A: dummy bcrypt compare (same timing)
    A-->>R: 401 generic message
  else locked or wrong password
    A->>M: failedLoginCount +1 (lock 15 min at 5)
    A-->>R: 401 generic message
  else correct
    A->>M: reset counter
    A-->>R: 200 user + Set-Cookie dlm_session (HttpOnly, Secure, SameSite=Strict, 8 h, HS256 JWT with tokenVersion)
    R->>A: GET /api/workers/me/onboarding (worker)
    R-->>U: onboarding step or dashboard
  end
```

### Guided onboarding (D-011)
```mermaid
sequenceDiagram
  actor W as Worker
  participant R as React (/onboarding/:step)
  participant A as API
  participant X as skillExtractor (pure)
  participant M as MongoDB
  R->>A: GET /api/workers/me/onboarding
  A->>M: load profile
  A-->>R: { steps, nextStep } (derived from saved data)
  W->>R: Step 1 About you -> Save
  R->>A: PUT /api/workers/me (CNIC encrypted + hashed on the server)
  A-->>R: { profile, onboarding.nextStep = "work" }
  W->>R: Step 2 Your work -> Save
  R->>A: PUT /api/workers/me
  A-->>R: nextStep = "skills" -> app opens Step 3 by itself
  W->>R: describe work
  R->>A: POST /api/workers/me/skills/extract
  A->>X: extractSkills(text)
  A-->>R: suggestions + matched words (nothing saved)
  W->>R: tick suggestions -> Add selected skills
  R->>A: POST /api/workers/me/skills
  A->>M: save skills; set onboardingCompletedAt
  R-->>W: Step 4 Proof (upload or skip) -> Step 5 All set
```

### Evidence upload and review (Module 3, D-013, D-015)
```mermaid
sequenceDiagram
  actor W as Worker
  actor AD as Admin
  participant R as React
  participant A as API
  participant I as services/evidence/image
  participant M as MongoDB
  W->>R: choose skill, kind, photo, tick consent
  R->>R: client check (magic bytes, 4 MB; shrink in browser if possible)
  R->>A: POST /api/evidence (multipart)
  A->>A: protect + role worker (before reading the file), upload rate limit
  A->>A: multer memory, 4 MB limit (413), zod fields (consent)
  A->>I: detect type from bytes (JPEG/PNG/WebP only)
  I->>I: sharp: autoOrient, fit 2000 px, WebP q80, no metadata
  I-->>A: processed bytes, SHA-256, dHash
  A->>M: same worker+skill+SHA-256? -> 409
  A->>M: other workers: same SHA-256 or dHash distance <= 10 -> possibleDuplicateOf
  A->>M: save EvidenceFile (bytes), Evidence (pending)
  A->>M: recompute skill evidenceSummary; audit "evidence.uploaded"
  A-->>R: 201 item "Pending review"
  AD->>R: Evidence review -> open item
  R->>A: GET /api/admin/evidence/:id (+ duplicate, b, d, u, E)
  AD->>R: Approve / Reject (reason) / Suspected fake (reason) / Revoke (reason)
  R->>A: PATCH /api/admin/evidence/:id
  A->>M: findOneAndUpdate where status = current (else 409)
  A->>M: recompute summary; audit "evidence.<new state>"
  A-->>R: new status + skill chip
```

## Where each security control sits

| Control | Where (code) | Proven by (tests) |
|---|---|---|
| Settings checked at start (secrets, origins, keys) | `config/env.js` | `foundation.test.js` |
| Security headers | `helmet()` in `app.js` | `foundation.test.js` |
| CORS allow-list | `cors({ origin: CLIENT_ORIGIN })` | `foundation.test.js` |
| CSRF Origin / Sec-Fetch-Site check | `middleware/csrf.js` | `auth.test.js` |
| Rate limits (failed auth; uploads) | `middleware/rateLimit.js` | `auth-rate-limit.test.js` |
| Login cookie, HS256 + iss/aud/exp, tokenVersion | `services/session.js`, `middleware/authMiddleware.js` | `auth.test.js` |
| Role checks on every protected route | `requireRole` in each `routes/*.js` | `admin.test.js`, `directory.test.js`, `evidence.test.js` |
| Input validation (body, query, params) | `validators/*.js` + `middleware/validate.js` | all integration tests |
| Operator-injection guard | `mongoose.set('sanitizeFilter', true)` in `config/db.js` | `directory.test.js` |
| Escaped regular expressions | `escapeRegex` in `validators/common.js` | `directory.test.js` |
| Public projections (no private fields) | `PUBLIC_WORKER_FIELDS` in `controllers/workersController.js` | `directory.test.js`, `evidence.test.js` |
| CNIC encryption + keyed hash, audited reveal | `services/cnic.js`, `controllers/adminController.js` | `cnic.test.js`, `workers-profile.test.js`, `admin.test.js` |
| Upload: size, real type, re-encode, metadata removal, owner-only serving | `middleware/upload.js`, `services/evidence/image.js`, `controllers/evidenceController.js` | `evidence.test.js` |
| Review state machine, atomic decisions | `services/evidence/transitions.js`, `controllers/adminEvidenceController.js` | `evidence.test.js` |
| Append-only, hash-chained audit log | `models/AuditLog.js`, `services/audit.js`, `npm run audit:verify` | `admin.test.js`, `evidence.test.js` |
| Generic 500 messages | `middleware/errorHandler.js` | `foundation.test.js` |
| UI route guards (convenience only) | `frontend/src/routes/guards.jsx` | `auth.test.jsx`, `pages.test.jsx` |
