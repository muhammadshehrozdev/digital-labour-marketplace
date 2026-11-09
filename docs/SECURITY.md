# Security

This file will hold the threat → mitigation → test table (Phase 7).
For now it records security incidents.

## Incidents

### INC-001 — Stolen Vercel account token misused (8–9 Nov 2026)

Facts as reported by the team. No token values or secrets are recorded here.

**What happened**
- Someone used a stolen Vercel account token to:
  - create deploy hooks on all three Vercel projects,
  - change the build command so that it printed the environment variables, encoded in base64, into the build logs,
  - add a `NODE_OPTIONS` environment variable,
  - then delete those deployments.

**Origin:** not confirmed. Suspected: token theft from the team's old PC.

**Impact (assumed):** every environment variable set on the Vercel projects
must be treated as exposed, because the build logs contained them.

**Response**
- All Vercel tokens and deploy hooks deleted.
- Passwords changed and two-factor authentication (2FA) enabled on GitHub, Vercel and Gmail.
- MongoDB Atlas database password, `MONGO_URI` and `JWT_SECRET` rotated (replaced with new values).
- An unused Gemini API key removed.

**Scope note:** the dev container and Claude Code had no Vercel access.

**Side effect of the response:** rotating `JWT_SECRET` makes every existing login token invalid, so all users must log in again.

**Follow-up (open)**
- Phase 8: before the next deployment, check the Vercel projects' build command,
  environment variables and deploy hooks against the expected settings.
