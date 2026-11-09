# Changelog

What changed in each phase. Test results are copied from real runs only.

## Phase 1 — Dependencies and test tooling (8–9 Nov 2026)

**Dependencies**
- `backend/package.json` now agrees with `package-lock.json` (before, `npm ci` could not work):
  Express ^4.19.2 → ^5.3.0, Mongoose ^8.3.0 → ^9.11.4 (locked 9.11.4), bcryptjs → ^3.0.3,
  dotenv → ^18.0.7, jsonwebtoken → ^9.0.3, cors → ^2.8.6, nodemon → ^3.1.14.
- `"engines": { "node": "24.x" }` added to both `package.json` files (see D-003).
- Code checked for Express 5 / Mongoose 9: no Express 4-only APIs, no `*` routes,
  no `req.query` assignment, neither `pre('save')` hook calls `next()`. No codemod needed.
- New backend packages (approved): helmet 8.3.0, express-rate-limit 8.7.1, zod 4.6.7,
  multer 2.5.0, file-type 22.2.0, sharp 0.35.5; dev: vitest 5.0.5, supertest 7.3.1,
  mongodb-memory-server 11.3.0.
- New frontend dev packages (approved): vitest 5.0.5, @testing-library/react 16.3.3,
  @testing-library/jest-dom 7.0.1, @testing-library/user-event 14.6.8, jsdom 30.1.3.
- `npm audit fix` (non-breaking): body-parser, qs (backend), follow-redirects (frontend).
  Remaining: 2 moderate dev-only nodemon findings, accepted in D-004.

**Test tooling**
- Backend `npm test` = one `vitest run` over `tests/unit` and `tests/integration`
  (config: `backend/vitest.config.js`). The hotfix test moved from `node:test` to Vitest
  (`tests/integration/hotfix-critical.test.js`; assertions unchanged).
- Frontend `npm test` = `vitest run` with jsdom (config in `frontend/vite.config.js`,
  setup in `frontend/src/test/setup.js`).
- Tests added: `tests/unit/setup.test.js`, `tests/integration/multer-express5.test.js`,
  `tests/integration/model-hooks.test.js`, `frontend/src/test/setup.test.jsx`.
- MongoDB for tests: the firewall could not reliably reach fastdl.mongodb.org (its CDN addresses
  change faster than the firewall refreshes them), so MongoDB 8.2.6 (Debian 12) was downloaded outside the
  container into `.local/` (gitignored), checked with its SHA-256 file (OK), and unpacked to
  `.local/mongodb-linux-x86_64-debian12-8.2.6/` (212 MB; archive 123 MB).
  `backend/package.json` → `config.mongodbMemoryServer.systemBinary` points to it.

**Results (real runs, 9 Nov 2026)**
- Backend: 4 files, 12/12 tests passed (setup, multer 2 on Express 5, M1-1/M1-2 hotfix,
  both `pre('save')` hooks on Mongoose 9 with an in-memory MongoDB).
- Frontend: 1/1 passed. `npm run build` OK. `npm run lint` exit 0 with 4 warnings in existing pages.
- `npm ci`: OK in backend and frontend (8 Nov 2026).

**Local preview (dev container only)**
- `npm run db:local` (backend): local MongoDB from the same binary, data in `.local/mongodb-data/`,
  listening on 127.0.0.1 only.
- `npm run seed:local` (backend): two synthetic demo accounts; refuses any non-local `MONGO_URI`.
- `backend/.env` (gitignored): local `MONGO_URI`, random `JWT_SECRET`. Never Atlas.

**Other**
- Phone-number decision recorded (D-002) in `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md`, `docs/DECISIONS.md`.
- `.devcontainer/init-firewall.sh`: `fastdl.mongodb.org` added to the allowed domains.
- `docs/SECURITY.md` created with incident INC-001 (stolen Vercel token, 8–9 Nov 2026).
- `docs/DECISIONS.md` created (D-001 MERN only, D-002 phone hidden, D-003 Node 24, D-004 nodemon advisory).
