# 06 — Deploy readiness (not deployed in Batch 1)

Nothing was deployed and Vercel was not touched. **Do not deploy `feature/modules-1-3` before
Phase 8.** The deployed frontend calls `/api` on its own domain, which needs the rewrite below.

What Phase 8 must do (with the team's explicit yes for every step):
1. **Same-origin API:** add a Vercel rewrite in `frontend/vercel.json` (`/api/:path*` → backend)
   and test login on a **Preview** deployment (cookie `Secure; SameSite=Strict; Path=/api`).
   Keep the SPA fallback rewrite after it.
2. **`trust proxy`:** measure the right `TRUST_PROXY` on a Preview deployment (temporary
   `/api/debug/ip` route, then remove it), so the IP rate limit sees real visitors.
3. **Environment variables (new values, never the local ones; see INC-001):** backend
   `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (the real site origin), `CNIC_ENC_KEY`,
   `CNIC_HASH_KEY`; frontend `VITE_API_URL` only if the rewrite is not used.
4. **Atlas data migrations** (each first as a dry run, each only with the team's yes):
   `npm run list-admins` (read-only) → `migrate:cnic` → `migrate:categories` → `migrate:skills`
   (with `--allow-remote`). Check the `cleaningShiftingToDomestic` count by hand.
5. **Create the admin** on the real database with `npm run create-admin` (no admin from the website).
6. **Vercel Firewall:** one rate-limit rule on `/api/auth/*`.
7. **Check after deploy:** favicon/title/theme colour, fonts load from the site (no Google request),
   no console errors, login cookie, onboarding flow, directory privacy, admin reveal audit entry,
   `npm run audit:verify`.
8. **Build settings:** Node 24; let Vercel run `npm install` (sharp has platform binaries);
   review `backend/vercel.json` (legacy `builds`) as planned in Phase 8.
