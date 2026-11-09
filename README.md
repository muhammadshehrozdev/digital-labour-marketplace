# Digital Labour Marketplace

A MERN web app for daily-wage and skilled workers in Pakistan (electricians, plumbers, painters,
masons, carpenters, AC technicians, domestic workers, movers). Three roles: worker, customer, admin.

Final Year Project, BS Software Engineering, SZABIST Islamabad (Fall 2026).
Team: Muhammad Shehroz, Shahzaib Khan, Usama Asif. Supervisor: Ms. Tooba Abdul Qudoos Khan.

This semester (proposal numbering):
- **Module 1 — Worker Digital Identity:** accounts, worker profile, identity check by an admin.
- **Module 2 — Experience and Skill Profiler:** a **rule-based (dictionary) skill extractor**
  that suggests skills from a worker's own words (Urdu, Roman Urdu, English), with an evaluation
  harness (precision, recall, F1). It is not "AI" and uses no external AI service.
- **Module 3 — Skill Evidence and Verification:** next phase (the UI already shows it as "coming next").

## Folders

```
backend/    Express API (Node.js 24, ES modules), Mongoose models, tests, evaluation harness
frontend/   React + Vite app, design system, tests
docs/       API, decisions, security, design, evaluation, changelog, audit
```

## Run the local preview (step by step)

Needs **Node.js 24** (`node -v` should print `v24.…`). The commands below work in PowerShell
and in the VS Code dev-container terminal. Run each block in the folder named above it, each in
its own terminal (they keep running).

**1. Install packages (once)**
```powershell
# in .\backend
npm install
# in .\frontend
npm install
```

**2. Settings:** copy `backend\.env.example` to `backend\.env` and fill in your own values. The
file explains how to make the secret keys. Never commit `.env`. Use a **local** MongoDB address
for the preview, never the Atlas one.

**3. Start the local database** (terminal 1)
```powershell
# in .\backend — uses the MongoDB program in .local\ (dev container); data stays in .local\mongodb-data
npm run db:local
```
Outside the dev container, install MongoDB Community Server instead and set `MONGO_URI` to
`mongodb://127.0.0.1:27017/dlm_local`.

**4. Start the API** (terminal 2)
```powershell
# in .\backend — http://127.0.0.1:5000, restarts when a file changes
npm run dev
```

**5. Start the website** (terminal 3)
```powershell
# in .\frontend — http://127.0.0.1:5173 (Vite forwards /api to the API, so the login cookie works)
npm run dev
```
Open **http://127.0.0.1:5173** in Chrome.

**6. Demo accounts (synthetic, local only)**
```powershell
# in .\backend — creates one demo worker and one demo customer (refuses a non-local database)
npm run seed:local
```

## Create the first admin

Admins can be created **only** with this script. The website never offers an admin option.
```powershell
# in .\backend
npm run create-admin -- --name "Your Name" --email you@example.com --phone 03001234567
```
- The script prints which database host it will write to. For any host that is not this computer,
  it asks you to type `yes` first.
- It asks for the password twice and does not show it (at least 15 characters; a sentence you
  remember works well).
- It writes an `admin.created` entry to the audit log.
- To see the admins (read-only): `npm run list-admins`.

## Tests and checks

```powershell
# in .\backend — API, security, extractor, evaluation metrics (in-memory MongoDB, never Atlas)
npm test
# in .\frontend — pages, components, colour contrast, honesty checks
npm test
npm run lint
npm run build
```

Other backend scripts (all in `.\backend`):

| Command | What it does |
|---|---|
| `npm run audit:verify` | Checks that nobody changed the audit log (hash chain) |
| `npm run evaluate:skills -- --file <dataset.csv>` | Module 2 evaluation; see `docs/evaluation/README.md` |
| `npm run agreement:skills -- --a <file> --b <file>` | Agreement between two annotators |
| `npm run migrate:cnic`, `migrate:categories`, `migrate:skills` | Data migrations; dry run unless `-- --apply`; local database only unless `--allow-remote` (ask the team first) |

## Documentation

- `docs/API.md` — every endpoint
- `docs/DECISIONS.md` — decision records D-001 to D-012
- `docs/SECURITY.md` — threats, mitigations, tests, keys, limitations, incidents
- `docs/design/` — UX requirements, analysis, design system, screens, review, deploy readiness
- `docs/evaluation/` — how Module 2 is evaluated (consent, annotation, dataset format)
- `docs/CHANGELOG.md` — what changed in each phase
