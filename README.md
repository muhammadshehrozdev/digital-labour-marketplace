# Digital Labour Marketplace

A MERN web app (MongoDB, Express, React, Node.js) for daily-wage and skilled workers in Pakistan:
electricians, plumbers, painters, masons, carpenters, AC technicians, domestic workers, movers.
Three roles: **worker**, **customer**, **admin**.

Final Year Project, BS Software Engineering, SZABIST Islamabad (Fall 2026).
Team: Muhammad Shehroz, Shahzaib Khan, Usama Asif. Supervisor: Ms. Tooba Abdul Qudoos Khan.

## What is built (proposal numbering)

| Module | What it does |
|---|---|
| **1 — Worker Digital Identity** | Secure accounts (HttpOnly cookie sessions), guided onboarding, worker profile with contact details, CNIC stored encrypted, identity check by an admin with a note, customer directory without private data, audit log |
| **2 — Experience and Skill Profiler** | A **rule-based (dictionary) skill extractor**: the worker describes their work in Urdu, Roman Urdu or English and gets skill suggestions with the matched words; nothing is saved until the worker ticks and adds. An evaluation harness (precision, recall, F1) for real labelled data. No "AI", no external AI service |
| **3 — Skill Evidence and Verification** | Workers upload photos of certificates, finished work or reference letters for one skill; an admin approves, rejects, flags as suspected fake or revokes; each skill shows Self-declared / Evidence pending / Verified by evidence / Disputed and a strength word (no percentages) |
| **4 — Reputation and Reliability Engine** | A minimal **Work Booking** (request → accept → both confirm "Work done"; cancel, no-show, a small dispute step); phone numbers shared only inside an accepted booking (D-002); **reviews** after completed work (never edited); a **weighted Beta reputation model** (Jøsang & Ismail 2002) that says how sure it is, a reliability record, verified work history, "Best track record" order, rule-based flags for admins; **evaluated by simulation** (`backend/evaluation/reputation/`, results are simulation results only). No "AI" |

Across all modules (Batch 3): the website works in **English, اردو (Urdu, right to left) and Roman
Urdu** (chooser on the first visit, switcher at the top, the choice is saved to the account); a bold
design v2 with three colour themes (Emerald Night is the default), a new logo and motion that respects
"reduce motion"; a read-only "My profile" page with "See what customers see", and one profile editor.
The Urdu and Roman Urdu texts were reviewed by the team on 11 Nov 2026 (`docs/i18n/REVIEW.md`, decision D-031).

Batch 4 adds: the original logo back (refined), a **night-mode button on every page** (Light, Dark,
System, with a circular reveal), design v3 with in-house illustrations, more than 50 features (profile
strength with next steps, "You may also do…" skills, notifications, input masks, drafts, crop/rotate before
upload, saved workers, compare, command palette Ctrl+K, offline banner, installable app, help centre, …),
and an admin area with charts, a Users page (suspend / reactivate), reason templates and CSV exports.
**Admins log in at the same `/login` page**; there is no admin sign-up (see `docs/ADMIN-GUIDE.md`).

Batch 5 (**Listen, Speak, See**) helps people who read little or nothing, on the worker and customer
screens: a **🔊 Listen** button under every field says what to do there (in Urdu or English) and shows it in
large text; **🎤 Speak** fills a field by voice where it is safe (never passwords, CNIC or email) and reads
the answer back; trades, availability and proof choices are **pictures**; a round 🔊 in the corner of every
page says what the page is for. The voice is the team's recorded clip if there is one, else the device's own
voice; Roman Urdu users hear Urdu. All of it is the browser's built-in speech feature: no outside service,
no key, not "AI" (decisions D-033 to D-036). Check a device at `/voice-check`.

Batch 6 (**Module 4**) adds bookings, reviews and reputation: customers request a worker with picture choices,
workers hear the request and accept, both see each other's number only inside an accepted booking, both
press "Work done", the customer rates; profiles show stars with how sure we are in words, verified work
history and reliability counts; workers see "My reputation" in plain words; admins handle disputes, review
moderation and reputation flags. Details, formulas, the simulation results and the viva answers:
`docs/modules/MODULE-4.md`.

Deployment (Phase 8) is not done yet.

## Folders

```
backend/    Express 5 API (Node.js 24, ES modules), Mongoose models, tests, evaluation harness, scripts
frontend/   React 19 + Vite app, design system (components/ui), tests
docs/       API, data model, architecture, use cases, test cases, security, decisions, design, evaluation
```

## Windows setup, step by step (PowerShell)

### 1. Install the tools (once)
- **Node.js 24 LTS:** download the Windows installer (.msi) for version **24** from
  https://nodejs.org/en/download and install it. Check in a new PowerShell window:
  ```powershell
  node -v   # must print v24.x.x
  npm -v
  ```
- **Git** and **VS Code** (you already have them).
- **A database** (choose one):
  - **Local MongoDB (recommended for development):** install *MongoDB Community Server* (MSI) from
    https://www.mongodb.com/try/download/community and keep "Install MongoDB as a Service". It then runs
    on `mongodb://127.0.0.1:27017`.
  - **MongoDB Atlas:** only for the deployed app (Phase 8). Never use the real Atlas database for
    tests or demos.
  - Inside the project's **dev container**, `npm run db:local` starts a local MongoDB for you (it uses the
    Linux MongoDB program in `.local\`), so nothing else is needed there.

### 2. Get the code and install packages
```powershell
# in the folder where you keep projects
git clone <repository-url> digital-labour-marketplace
cd digital-labour-marketplace\backend
npm install          # installs the API's packages
cd ..\frontend
npm install          # installs the website's packages
```

### 3. Settings (`backend\.env`)
```powershell
# in .\backend — make your own settings file from the example
Copy-Item .env.example .env
# make a random secret; run it 3 times and paste the results as JWT_SECRET, CNIC_ENC_KEY, CNIC_HASH_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Then open `backend\.env` in VS Code and fill in (placeholders shown; never commit this file):
```
PORT=5000
HOST=127.0.0.1
MONGO_URI=mongodb://127.0.0.1:27017/dlm_local
JWT_SECRET=<random value from the command above>
CLIENT_ORIGIN=http://127.0.0.1:5173,http://localhost:5173
CNIC_ENC_KEY=<another random value>
CNIC_HASH_KEY=<a third, different random value>
```
`CNIC_ENC_KEY` and `CNIC_HASH_KEY` must be different. **Losing `CNIC_ENC_KEY` makes stored CNICs
unreadable** — keep a copy in a password manager the team controls (`docs/SECURITY.md`, "Keys").

### Quick start in the dev container: one command

In the **container terminal** (VS Code: Terminal → New Terminal, inside the dev container), type:

```bash
cd /workspace
bash scripts/preview.sh start
```

It starts MongoDB, the API and the website in the background and prints **http://127.0.0.1:5173**
when everything answers (about 10 seconds; the first time can take longer). The servers keep running when
you close the terminal, but not a restart of the laptop or the container: after a restart, run the start
command again. To stop all three:

```bash
cd /workspace
bash scripts/preview.sh stop
```

| Command | What it does |
|---|---|
| `bash scripts/preview.sh start` | Normal preview, using the database in `backend/.env` (`dlm_local_preview`, with your own test accounts) |
| `bash scripts/preview.sh demo` | Defence demo: the same servers, but on a **separate** database `dlm_demo` with only the three synthetic demo accounts (created automatically the first time) |
| `bash scripts/preview.sh reset-demo` | Wipes `dlm_demo` and puts back the clean demo state, so the demo can be rehearsed again. Your normal preview database is never touched. |
| `bash scripts/preview.sh status` | Shows what is running and in which mode |
| `bash scripts/preview.sh stop` | Stops the website, the API and MongoDB |

Demo accounts (synthetic, `dlm_demo` only): `worker.demo@example.com` and `customer.demo@example.com`
with the password `local-demo-password-123`; `admin.demo@example.com` with the passphrase
`local admin demo passphrase` (made by the `create-admin` script, like every admin). Logs are in
`.local/preview/` (`mongo.log`, `backend.log`, `frontend.log`). If you see `bash: warning: setlocale`,
ignore it: it is about the terminal's language setting, not the project. The demo itself is described step
by step in `docs/DEMO-SCRIPT.md`.

### 4. Run the local preview by hand (three terminals)
```powershell
# terminal 1, only inside the dev container (on Windows the MongoDB service is already running)
cd backend
npm run db:local
```
```powershell
# terminal 2 — the API on http://127.0.0.1:5000 (restarts by itself when a file changes)
cd backend
npm run dev
```
```powershell
# terminal 3 — the website on http://127.0.0.1:5173 (Vite forwards /api to the API)
cd frontend
npm run dev
```
Open **http://127.0.0.1:5173** in Chrome.

### 5. Demo accounts and the first admin
```powershell
# in .\backend — two synthetic demo accounts (refuses any non-local database)
npm run seed:local
#   worker.demo@example.com / local-demo-password-123
#   customer.demo@example.com / local-demo-password-123

# in .\backend — the ONLY way to make an admin (the website never offers it)
npm run create-admin -- --name "Your Name" --email you@example.com --phone 03001234567
```
`create-admin` shows which database host it writes to (for a non-local host you must type `yes`),
asks for the password twice without showing it (15+ characters; a sentence you remember works well),
and writes `admin.created` to the audit log. `npm run list-admins` lists admins (read-only).

## Tests and checks
```powershell
# in .\backend — API, security, extractor, evidence, confidence (in-memory MongoDB, never Atlas)
npm test
# in .\frontend — pages, components, colour contrast, honesty checks
npm test
npm run lint
npm run build
```
The last real results are in `docs/CHANGELOG.md` and `docs/TEST-CASES.md` (generated from the run).

### End-to-end tests and screenshots (Batch 3)
These open the real website in a headless Chromium. They start their **own** API on port 5001 and
website on port 5174 with their **own** local database `dlm_e2e` (emptied at the start; only a local
database whose name ends in `_e2e` is ever emptied). Your preview on 5173/5000 and its data are not
touched, and Atlas is never used.
```powershell
# once, in .\frontend — Playwright's browser (on Windows; the dev container already has Chromium)
npx playwright install chromium
# the local MongoDB must be running (dev container: in .\backend run  npm run db:local)
# in .\frontend — 20 tests: onboarding in 3 languages, language chooser/switcher, RTL, profile
# view -> edit -> view, customer privacy, admin evidence review, axe accessibility, keyboard,
# reduced motion, layout shift, clean browser console
npm run e2e
# in .\frontend — every main screen, every language, at 360 / 768 / 1280 px, into
# docs\design\screenshots\all\ (not committed; a checked set is in docs\design\screenshots\)
npm run screenshots
```
In the dev container the browser is the system Chromium (`CHROMIUM_PATH=/usr/bin/chromium`); nothing is
downloaded. On Windows, Playwright needs its own Chromium once (the `npx playwright install chromium`
line); set `CHROMIUM_PATH` to use another Chromium-based browser instead.

## Backend scripts (all in `.\backend`)

| Command | What it does |
|---|---|
| `npm run db:indexes` | Builds every database index (safe to repeat, changes no data); used once on the new production database |
| `npm run demo:reset` | Wipes the separate demo database (`dlm_demo`, local only, name must end in `_demo`) and creates the three synthetic demo accounts; asks for `yes` (or add `-- --yes`) |
| `npm run audit:verify` | Checks that nobody changed the audit log (hash chain) |
| `npm run confidence:sensitivity` | Shows how the Module 3 skill score changes with other weights (formula outputs) |
| `npm run reputation:sensitivity` | Module 4: how the reputation score moves when one parameter changes (formula outputs, not results) |
| `npm run evaluate:reputation -- --scenario all --seeds 30` | Module 4 evaluation **by simulation**; writes `evaluation/reputation/results/SIMULATION-*.json` |
| `npm run reputation:recompute -- --worker <workerIdCode>` / `-- --all` | Rebuilds reputation snapshots; local database only unless `--allow-remote` **and** you type `yes` |
| `npm run demo:module4` | Adds the synthetic Module 4 demo data to the demo database (`preview.sh demo` and `reset-demo` run it for you) |
| `npm run evaluate:skills -- --file <dataset.csv>` | Module 2 evaluation on a labelled dataset (`docs/evaluation/README.md`) |
| `npm run agreement:skills -- --a <file> --b <file>` | Agreement between two annotators (Cohen's kappa, Krippendorff's alpha) |
| `npm run migrate:cnic` / `migrate:categories` / `migrate:skills` | Data migrations; dry run unless `-- --apply`; local database only unless `--allow-remote` (ask the team first) |

## Frontend scripts added in Batch 4 (in `.\frontend`)

| Command | What it does |
|---|---|
| `npm run icons` | Draws the logo files, favicon and app icons from the logo's own numbers (`public/`, `docs/design/logo/`) |
| `npm run whats-new` | Rebuilds the "What's new" panel from `docs/CHANGELOG.md` |
| `npm run coverage` | Frontend tests with a coverage report (target: 80% of lines in `src/`) |
| `npm run demo:video` | Records the demo (`docs/DEMO-SCRIPT.md`) as `docs/demo/demo-video.webm` (not in Git) and writes `docs/demo/NARRATION.md`; start with `bash scripts/preview.sh demo` and `reset-demo` |

In `.\backend`, `npm run coverage` runs the backend tests with a coverage report (target: 90% of lines in
`services/`, `controllers/`, `middleware/`).

## Frontend scripts added in Batch 5 (in `.\frontend`)

| Command | What it does |
|---|---|
| `npm run audio:manifest` | Lists the team's recorded help clips (`public/audio/help/ur|en/`) for the website; run after adding or removing clips (`docs/audio/RECORDING-GUIDE.md`) |
| `node scripts/i18n-review-batch5.mjs` | Writes `docs/i18n/REVIEW-BATCH-5.md`, the new Batch 5 texts side by side for the team's review |

The clip recorder is a development page: `http://127.0.0.1:5173/dev/recorder` (not in the live website).

## Documentation
| File | Contents |
|---|---|
| `docs/API.md` | Every endpoint, who may call it, request/response examples, error codes |
| `docs/DATA-MODEL.md` | Collections, fields, indexes, ER diagram |
| `docs/ARCHITECTURE.md` | Components, request flows, where each security control sits |
| `docs/USE-CASES.md` | Actors and use cases for Modules 1–4 |
| `docs/TEST-CASES.md` | Test-case table generated from the real test run |
| `docs/SECURITY.md` | Threats → mitigations → tests, keys, limitations, incidents |
| `docs/DECISIONS.md` | Decision records D-001 to D-058 |
| `docs/DEPLOY-RUNBOOK.md` | Going live on Vercel + MongoDB Atlas, step by step (fresh start, first admin, checks, rollback) |
| `docs/DEMO-SCRIPT.md` | The 7-minute defence demo of Modules 1–3 |
| `docs/ADMIN-GUIDE.md` | For admins: creating the first admin, logging in, every admin page, daily tasks, security rules |
| `docs/TRACEABILITY.md` | Every requirement (proposal, audit, decisions, the team's requests) → code → test → status |
| `docs/REVIEW-2026-11.md` | Batch 4 code review: findings, fixes, tests, OWASP and ASVS mapping, dependencies |
| `docs/design/` | UX requirements, analysis, design system v2 (themes, fonts, modern CSS, motion), screens, review, deploy readiness, languages (`07-i18n.md`), logo concepts, screenshots |
| `docs/i18n/REVIEW.md` | Every Urdu and Roman Urdu text next to its English source, reviewed by the team on 11 Nov 2026 (D-031) |
| `docs/i18n/REVIEW-BATCH-5.md` | The new Batch 5 texts (spoken help) side by side, **waiting for the team's review** |
| `docs/audio/RECORDING-GUIDE.md` | How the team records the spoken help (recorder page, file names, tips) |
| `docs/EASY-MODE-MANUAL-TEST.md` | Checklist to test sound and microphone by hand (Chrome, Edge, Android) |
| `docs/evaluation/` | How Module 2 is evaluated (consent, annotation, dataset format); the easy-mode usability test **plan** (`EASY-MODE-USABILITY-PLAN.md`, no results yet) |
| `docs/modules/MODULE-4.md` | Module 4: what it does, diagrams, formulas with worked examples, the **simulation** results, limitations, extension points, how to explain it in the viva, deployment notes |
| `docs/contracts/MATCHING-INPUTS.md` | The reputation fields Module 7 (matching) may read, and its two rules |
| `docs/MODULE-4-MANUAL-TEST.md` | Checklist for three browser windows and an Android phone |
| `docs/evaluation/REPUTATION-PILOT-PLAN.md` | A **plan** for a small real pilot (no results) |
| `docs/i18n/REVIEW-BATCH-6.md` | The new Module 4 texts side by side, **waiting for the team's review**, with the clips to record |
| `docs/CHANGELOG.md` | What changed in each phase |
