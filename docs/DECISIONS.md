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
