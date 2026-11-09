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

### 4. Run the local preview (three terminals)
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

## Backend scripts (all in `.\backend`)

| Command | What it does |
|---|---|
| `npm run audit:verify` | Checks that nobody changed the audit log (hash chain) |
| `npm run confidence:sensitivity` | Shows how the Module 3 skill score changes with other weights (formula outputs) |
| `npm run evaluate:skills -- --file <dataset.csv>` | Module 2 evaluation on a labelled dataset (`docs/evaluation/README.md`) |
| `npm run agreement:skills -- --a <file> --b <file>` | Agreement between two annotators (Cohen's kappa, Krippendorff's alpha) |
| `npm run migrate:cnic` / `migrate:categories` / `migrate:skills` | Data migrations; dry run unless `-- --apply`; local database only unless `--allow-remote` (ask the team first) |

## Documentation
| File | Contents |
|---|---|
| `docs/API.md` | Every endpoint, who may call it, request/response examples, error codes |
| `docs/DATA-MODEL.md` | Collections, fields, indexes, ER diagram |
| `docs/ARCHITECTURE.md` | Components, request flows, where each security control sits |
| `docs/USE-CASES.md` | Actors and use cases for Modules 1–3 |
| `docs/TEST-CASES.md` | Test-case table generated from the real test run |
| `docs/SECURITY.md` | Threats → mitigations → tests, keys, limitations, incidents |
| `docs/DECISIONS.md` | Decision records D-001 to D-016 |
| `docs/design/` | UX requirements, analysis, design system, screens, review, deploy readiness |
| `docs/evaluation/` | How Module 2 is evaluated (consent, annotation, dataset format) |
| `docs/CHANGELOG.md` | What changed in each phase |
