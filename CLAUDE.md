# CLAUDE.md — Digital Labour Marketplace (FYP)

Claude Code reads this file at the start of every session. Keep it short and true.

## What this project is

A MERN web app for daily-wage and skilled workers in Pakistan (electricians, plumbers, painters, masons, carpenters, AC technicians, domestic workers). Three roles: worker, customer, admin.
Final Year Project, BS Software Engineering, SZABIST Islamabad, Fall 2026. Team: Muhammad Shehroz, Shahzaib Khan, Usama Asif. Supervisor: Ms. Tooba Abdul Qudoos Khan.

This semester's scope (proposal numbering):
- Module 1 — Worker Digital Identity
- Module 2 — Experience and Skill Profiler (rule-based skill extractor, evaluated with precision/recall)
- Module 3 — Skill Evidence and Verification (evidence upload, admin review, evidence-based skill confidence)

Department rule (as reported by the team): a marketplace with "AI features on top", or reliance on pre-trained models or external AI APIs, is not a valid contribution. So: no external AI APIs, no LLM calls, and never call rule-based code "AI".

## Who you are working with

- Beginners. Explain every step in simple English. Define a technical term the first time you use it.
- Windows 11, VS Code, PowerShell terminal, Google Chrome. Give PowerShell commands, say in which folder to run them, and explain what each command does before running it.
- If the user writes in Roman Urdu and asks for Roman Urdu, answer in natural Roman Urdu.

## Reporting to the user

- At the end of every task or phase: (1) give the local preview link, http://127.0.0.1:5173, and list the exact pages and clicks where the user can see what changed; (2) give a progress table: phases done and left, and percent complete per module; (3) give the real test summary.
- While working on long batches, after each major step write one short line: what was finished, and where to see it in the browser.

## Repository layout

```
backend/    Express API (Node.js, ES modules), Mongoose models
frontend/   React + Vite single-page app
docs/       Project documentation (API, test cases, decisions, audit)
```

Check the real structure with the file tools before assuming anything.

## Commands (PowerShell)

```powershell
# Backend (run inside .\backend)
npm install
npm run dev          # start API on http://localhost:5000 with auto-restart
npm test             # run backend tests
npm run create-admin # create the first admin account (the only way to make an admin)
npm run evaluate:skills -- --file <path>  # Module 2 precision/recall/F1 on a labelled dataset
npm run confidence:sensitivity            # Module 3 weight sensitivity table
npm run audit:verify                      # check the audit log hash chain

# Frontend (run inside .\frontend)
npm install
npm run dev          # start React app on http://localhost:5173
npm test             # run frontend tests
npm run build        # production build check
npm run lint
```

If a script does not exist yet, say so instead of pretending it ran.

## Non-negotiable rules

Security
- Admin accounts are created only by the `create-admin` script. Public registration accepts only `worker` or `customer`.
- Never send `password`, CNIC data, home address, emergency contact or email to anyone except the owner or an admin. A worker's phone and WhatsApp number never appear in the directory or search results; a customer sees them only after a booking between them is accepted (no booking module yet, so no customer sees them). Use explicit field lists (projections) for every public response. Never write a CNIC number into logs or the audit log.
- Validate every request body, query and URL parameter on the server with the shared validation schemas. Reject bad input with 400 and a clear message.
- Never build a `RegExp` from user text without escaping it. Never pass user objects straight into a MongoDB filter.
- Never return raw `error.message` from a 500 error. Log it on the server; send a generic message.
- Check roles and ownership on the backend for every protected route. The React route guard is only for user experience.
- Uploaded files: allow-list types by checking file content (magic bytes), enforce size limits, rename files, strip image metadata, keep files private, and serve them only to the owner and admins.
- No secrets in code or in Git. Use `.env` (local) and Vercel environment variables. Keep `.env.example` updated with placeholder values only.

Code
- Inspect a file before changing it. Change the smallest part that fixes the problem. Do not rewrite whole files without a reason you have explained.
- Keep existing working features working.
- ES modules, `async/await`, small functions, clear names, short comments where the logic is not obvious.
- Do not add a new npm package without explaining why it is needed and getting a "yes" from the user.
- One source of truth for trade categories and skills: `backend/config/skillTaxonomy.js`, served to the frontend by an API.

Tests
- Every bug fix and every new feature gets an automated test.
- Run the tests before saying something is done, and paste the real output. Never invent or predict test results.
- Tests use a separate test database or an in-memory MongoDB, never the real Atlas database.

Git
- Work on a feature branch, never directly on `main`.
- Small commits with clear messages after each passing step.
- Ask before `git push`, before any force push, before deleting files, and before changing data in any real database.

Academic honesty
- Call the Module 2 extractor what it is: a rule-based (dictionary) skill extractor.
- Never show a "confidence %" that was not computed from a documented method.
- Never write invented evaluation numbers, test results, approvals or references into code, UI or documents.
- Any sample data that is not real must be labelled "synthetic" and must not be used to report results.

## Domain words

- Identity verification: an admin confirms the worker is a real person (CNIC checked offline). Field: `verificationStatus`.
- Skill verification: a skill is backed by approved evidence. It is per skill, not per worker.
- Evidence: a certificate photo, work photo or reference letter photo linked to one skill (images only: JPEG, PNG, WebP). Status: pending → approved or rejected (reason required); an admin can later revoke an approval (reason required). Every change is written to the append-only audit log.
- Skill confidence: computed from approved and rejected evidence by `backend/services/trust/skillConfidence.js` (a pure function, unit tested).

## Definition of done (for any task)

1. Code works locally, backend and frontend.
2. Tests added or updated, all passing, real output shown.
3. No new security rule broken (see above).
4. `docs/` updated if an API, model or decision changed.
5. Changes committed on a feature branch with a clear message.
