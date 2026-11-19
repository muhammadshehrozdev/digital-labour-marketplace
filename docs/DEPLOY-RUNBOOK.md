# Go-live runbook: Vercel + MongoDB Atlas (fresh start)

For the team member who puts the website online. Every step says where to click or what to type.
Do the parts in order. **Time: about 2 hours the first time** (most of it waiting for builds and
checking); about 45 minutes once you have done it before.

| Part | What | Time |
|---|---|---|
| 1 | Freeze the three old Vercel projects | 5 min |
| 2 | Make the new secrets | 10 min |
| 3 | MongoDB Atlas: new project, cluster, user, address | 20 min |
| 4 | Vercel backend project | 20 min |
| 5 | Vercel frontend project | 15 min |
| 6 | Connect the two (CLIENT_ORIGIN) | 5 min |
| 7 | First admin on Atlas (Docker) | 10 min |
| 8 | Post-deploy checklist | 25 min |
| 9 | Visitor IP check (TRUST_PROXY) | 10 min |

Commands are typed in **Ubuntu (WSL)**, in the repository folder, unless a step says otherwise.
Dashboard labels can move a little when Vercel or Atlas update their sites; the words in **bold** are the
ones to look for.

---

## 0. What you are building, and why this way

```
Browser ──► https://digital-labour-web.vercel.app            (frontend project: the React app)
              │  /api/... is passed on (a "rewrite")
              ▼
            https://digital-labour-api.vercel.app/api/...   (backend project: one Express function)
              │
              ▼
            MongoDB Atlas, database dlm_production           (new and empty)
```

**Why this is the simplest reliable setup:**

- **Two Vercel projects, one per folder** (`frontend`, `backend`), from the same GitHub repository. Each
  builds on its own, as it does on your computer.
- **The browser only talks to the frontend address.** The frontend passes every `/api/...` request to the
  backend (`frontend/vercel.json`). So the login cookie is "same-origin": it keeps the strict settings it
  has today (`HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api`), and no browser CORS setup is needed.
  The other way (the browser calling the backend address directly) would need a weaker cookie
  (`SameSite=None`) and CORS and CSRF changes.
- **The backend is one function** (`backend/api/index.js`). `backend/vercel.json` sends every path to it and
  makes sure **nothing else** is served: without that, Vercel would publish the backend's source files.
- **Fresh start:** a **new, empty** Atlas database. No migrations are run, and nothing is copied. The old
  databases and the three old Vercel projects stay untouched (frozen), so nothing old can break.
- **Same code as the local preview.** Only the environment variables differ, and the server **refuses to
  start** with a clear message if one is missing or unsafe (part 8 shows where to read it).

### What could not be checked on the laptop (and where you check it)

| Cannot be checked locally | Checked in |
|---|---|
| Vercel builds the backend with Node 24 from `api/index.js` and serves no source file | 8.1, 8.2 |
| The rewrite passes cookies both ways and the browser's `Origin` header (login works, cookie on the frontend address) | 8.4 |
| The photo library (sharp) works in a Vercel function; photos up to 4 MB pass both hops (Vercel's limit is 4.5 MB per request) | 8.6 |
| Atlas accepts connections from Vercel | 8.1 |
| The visitor's real IP reaches the backend (for the login rate limit) | Part 9 |
| The "refuses to start" message appears in the Vercel logs | 8.9 |

---

## 1. Freeze the three old Vercel projects (5 min)

They keep showing their last version, but no new push will build them.

For **each** of the three old projects:

1. https://vercel.com/dashboard → click the project.
2. **Settings** (left side) → **Build and Deployment**.
3. Find **Ignored Build Step** → open the **Behavior** list → choose **Don't build anything** → **Save**.

Do not delete them before the defence. Do not copy any variable or secret from them: the new projects
get new secrets.

---

## 2. Make the new secrets (10 min)

All secrets live in **one file outside the repository**, `~/dlm-secrets/production.env`, and in Vercel.
Never put them in a file inside the repository.

```bash
mkdir -p ~/dlm-secrets && chmod 700 ~/dlm-secrets
openssl rand -base64 48     # JWT_SECRET (64 characters)
openssl rand -base64 32     # CNIC_ENC_KEY (44 characters, ends with "=")
openssl rand -base64 32     # CNIC_HASH_KEY (run it again: it must be different from CNIC_ENC_KEY)
```

Create the file and paste the values (MONGO_URI comes in part 3; leave it for now):

```bash
nano ~/dlm-secrets/production.env
```

```
NODE_ENV=production
MONGO_URI=
JWT_SECRET=paste-the-64-characters-here
CNIC_ENC_KEY=paste-the-first-44-characters-here
CNIC_HASH_KEY=paste-the-other-44-characters-here
CLIENT_ORIGIN=https://digital-labour-web.vercel.app
TRUST_PROXY=1
```

Rules for this file: one `NAME=value` per line, **no quotes**, no spaces around `=`. Save with Ctrl+O,
Enter, Ctrl+X. Then:

```bash
chmod 600 ~/dlm-secrets/production.env
```

**Keep a copy of `CNIC_ENC_KEY` and `CNIC_HASH_KEY` in the team's password manager.** If the encryption key
is lost, every saved CNIC becomes unreadable (`docs/SECURITY.md`, "Keys").

---

## 3. MongoDB Atlas (20 min)

1. https://cloud.mongodb.com → log in → top left, the project list → **New Project** → name
   `Digital Labour Production` → **Next** → **Create Project**.
2. **Create** (a cluster) → choose **M0 (Free)** → provider and region: pick the region closest to
   Vercel's default (for example AWS, Frankfurt or Mumbai) → name `dlm-production` → **Create Deployment**.
3. **Connect to dlm-production** window, step "Add a connection IP address" and "Create a database user":
   - Username: `dlm_app`. Password: click **Autogenerate Secure Password** (letters and digits only), then
     **Copy** it into `~/dlm-secrets/production.env` for a moment (you need it in step 6).
   - **Create Database User**.
4. Left menu **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) →
   **Confirm**. Vercel functions have no fixed IP addresses; the long random password and TLS protect the
   database.
5. Left menu **Database** (or **Clusters**) → **Connect** → **Drivers** → copy the connection string. It
   looks like
   `mongodb+srv://dlm_app:<db_password>@dlm-production.abcde.mongodb.net/?retryWrites=true&w=majority&appName=dlm-production`.
6. Make it your `MONGO_URI`: replace `<db_password>` with the password, and put the database name
   **`dlm_production`** between `.net/` and `?`:

   ```
   MONGO_URI=mongodb+srv://dlm_app:THEPASSWORD@dlm-production.abcde.mongodb.net/dlm_production?retryWrites=true&w=majority&appName=dlm-production
   ```

   Save it in `~/dlm-secrets/production.env`.

The database is empty. Nothing is migrated; the app creates its collections itself, and part 7 builds the
indexes before the first account exists.

---

## 4. Vercel backend project (20 min)

**Which branch goes live? Recommendation: the feature branch, until after the defence.** In step 4.4 you
tell both new projects to treat `feature/modules-1-3` as their production branch.
- `main` stays exactly as it is, with no big merge under time pressure before the defence.
- Each push to the feature branch updates the live site, and Instant Rollback still works.
- After the defence you open one pull request to `main`, merge it, and switch the branch back (part 11).

Push the branch first (from Ubuntu): `git push origin feature/modules-1-3`.

1. https://vercel.com/dashboard → **Add New…** → **Project** → under **Import Git Repository** pick this
   repository → **Import**.
2. **Configure Project**:
   - **Project Name:** `digital-labour-api`
   - **Framework Preset:** **Other** (the repository's `backend/vercel.json` also says so)
   - **Root Directory:** **Edit** → choose `backend` → **Continue**
   - Leave Build and Output Settings as they are (they come from `backend/vercel.json`).
   - **Deploy**. The first deployment may fail or refuse to start: there are no variables yet. That is
     expected.
3. Project → **Settings** → **Environment Variables**. For **each** line of
   `~/dlm-secrets/production.env` (all seven):
   - **Type:** **Secret** · **Key:** the name (for example `MONGO_URI`) · **Value:** the value ·
     **Environments:** **Production** only → **Save**.
   - Each row must show the **Secret** label. Secret values cannot be read back later; your file in
     `~/dlm-secrets` is the copy.
4. **Settings** → **Environments** → **Production** → **Branch Tracking** → branch name
   `feature/modules-1-3` → **Save**.
5. **Settings** → **Build and Deployment**:
   - **Node.js Version:** **24.x** → **Save**.
   - **Ignored Build Step** → **Only build production** → **Save** (other branches do not build: they
     have no variables).
6. **Deployments** → the newest deployment → **⋮** → **Redeploy** → **Redeploy**. Wait until it shows
   **Ready**.
7. Note the production address on the project's **Overview** page (under **Domains**). If it is **not**
   `digital-labour-api.vercel.app` (the name was taken), change the one line in `frontend/vercel.json`:

   ```json
   { "source": "/api/:path*", "destination": "https://YOUR-API-ADDRESS.vercel.app/api/:path*" },
   ```

   then `git commit -am "chore(deploy): backend address" && git push origin feature/modules-1-3`.
8. Two checks, in this order (corrected in Batch 7, decision D-079):
   - `https://digital-labour-api.vercel.app/api/health` → `{"ok":true,…}`. This proves that the function
     **starts**. Right after a deploy it often shows `"db":"disconnected"`: that is **normal**. The health
     route runs before the database step and only reports a connection that a fresh serverless function has
     not opened yet. It is **not** a database check.
   - `https://digital-labour-api.vercel.app/api/auth/session` → **this is the database check**. `200` with
     `{"user":null}` = the database is reachable. `503` with `SERVICE_UNAVAILABLE` = it is not: check
     `MONGO_URI` and Atlas **Network Access**, then **Redeploy**.
   (After the session check, `/api/health` usually shows `"db":"connected"` too, because the same function
   has now opened its connection. Do not rely on that.)

---

## 5. Vercel frontend project (15 min)

1. **Add New…** → **Project** → the same repository → **Import**.
2. **Configure Project**:
   - **Project Name:** `digital-labour-web`
   - **Framework Preset:** **Vite**
   - **Root Directory:** `frontend`
   - **Environment Variables:** none. (Do **not** set `VITE_API_URL`: the app must call `/api` on its own
     address.)
   - **Deploy**.
3. **Settings** → **Environments** → **Production** → **Branch Tracking** → `feature/modules-1-3` → **Save**.
4. **Settings** → **Build and Deployment** → **Node.js Version 24.x**; **Ignored Build Step** → **Only build
   production** → **Save**.
5. **Deployments** → newest → **⋮** → **Redeploy**. Wait for **Ready**.
6. Note the production address (Overview → Domains), for example `https://digital-labour-web.vercel.app`.

---

## 6. Connect the two (5 min)

The backend accepts changes (login, saving, uploads) only from the address in `CLIENT_ORIGIN`.

1. If the frontend address from 5.6 is **not** `https://digital-labour-web.vercel.app`: backend project →
   **Settings** → **Environment Variables** → `CLIENT_ORIGIN` → **Edit** → the real address (`https://…`,
   no `/` at the end) → **Save**; update `~/dlm-secrets/production.env` too.
2. Backend project → **Deployments** → newest → **⋮** → **Redeploy**. (A changed variable only counts after
   a redeploy.)

---

## 7. First admin on Atlas (10 min)

Admins are made only by the `create-admin` script, never on the website. Run it from Ubuntu with Docker
running (Docker Desktop with WSL integration), in the repository folder:

```bash
bash scripts/atlas-create-admin.sh ~/dlm-secrets/production.env --name "Your Full Name" --email you@yourdomain.com --phone 03XXXXXXXXX
```

What happens:
1. A throwaway `node:24-bookworm` container starts. It reads the secrets only from your env file, which
   must be outside the repository (the script refuses otherwise).
2. It copies the backend without `node_modules` and without any local `.env`, and installs the
   production packages inside the container.
3. It builds every database index (`npm run db:indexes`; safe to repeat).
4. It shows the database host (your Atlas cluster) and asks you to type **`yes`**.
5. It asks for the admin password twice, hidden (at least 15 characters; a sentence works well).
6. It creates the admin, writes `admin.created` to the audit log, and deletes the container.

The same thing written out, if you prefer to type it yourself:

```bash
docker run --rm -it --env-file ~/dlm-secrets/production.env -e DOTENV_CONFIG_QUIET=true \
  -v "$PWD/backend:/src:ro" node:24-bookworm bash -c '
    mkdir -p /app && tar -C /src --exclude=node_modules --exclude=.env --exclude=.local -cf - . | tar -C /app -xf - &&
    cd /app && npm ci --omit=dev --no-audit --no-fund --loglevel=error &&
    node scripts/createIndexes.js && node scripts/createAdmin.js --name "Your Full Name" --email you@yourdomain.com --phone 03XXXXXXXXX'
```

---

## 8. Post-deploy checklist (25 min)

Use the **frontend** address for everything except 8.1 and 8.2. Tick each line.

1. [ ] `https://digital-labour-api.vercel.app/api/health` → `{"ok":true,…}` (the Node 24 build works and
   the function starts; `"db":"disconnected"` right after a deploy is normal, see 4.8). Then
   `https://digital-labour-api.vercel.app/api/auth/session` → `200 {"user":null}` (Atlas is reachable; `503`
   = it is not). In the backend project, **Deployments** → newest → **Build Logs** should show Node 24.
2. [ ] `https://digital-labour-api.vercel.app/server.js` → a small JSON "not found" answer, **not** program
   code. `…/robots.txt` → the two-line robots file. (Only `public/` is served.)
3. [ ] `https://digital-labour-web.vercel.app/api/health` → `{"ok":true,…}` as in 8.1 (the rewrite works;
   `"db"` may say `disconnected`, which is normal), and `https://digital-labour-web.vercel.app/api/auth/session`
   → `200 {"user":null}` (the database is reachable through the rewrite). If you see a Vercel login page
   instead, turn off **Deployment Protection** for the backend's production domain (backend → **Settings** →
   **Deployment Protection**).
4. [ ] Log in as the admin on `https://digital-labour-web.vercel.app/login`. In Chrome press F12 →
   **Application** → **Cookies** → your frontend address: one session cookie with **HttpOnly** ✓,
   **Secure** ✓, **SameSite Strict**, **Path /api**. Refresh the page: you stay logged in.
5. [ ] In a private window, register a **test worker** (a made-up name ending in "(test)", an
   `@example.com` email). Complete onboarding in Urdu, the same way as `docs/DEMO-SCRIPT.md`.
6. [ ] Upload a proof photo (use `docs/demo/work-photo-synthetic.jpg`, and once a phone photo of about
   3–4 MB). The admin sees it and can approve it (the photo library works on Vercel).
7. [ ] Register a **test customer**, search `wiring`, open the test worker: "Verified by evidence", and **no
   phone number** anywhere.
8. [ ] Log out. The cookie is gone (F12 → Application → Cookies). Opening `/worker` sends you to Log in.
9. [ ] The safety check works: backend → **Settings** → **Environment Variables** → `TRUST_PROXY` → **Edit**
   → remove the value → **Save** → **Redeploy**. `…/api/health` now fails; backend → **Logs** shows
   "Configuration error: the server will not start … TRUST_PROXY: missing". Put `1` back → **Save** →
   **Redeploy** → 8.1 works again.
10. [ ] Delete the test accounts' data later through the admin **Users** page (suspend them), or leave them:
    they are labelled "(test)".

---

## 9. Visitor IP check, for the login rate limit (10 min)

Failed logins are limited per visitor IP (10 per 15 minutes) and per account. Because the frontend passes
requests on to the backend, Vercel may hand the backend the frontend's address instead of the visitor's.
Then every visitor would share one counter. This check finds out.

1. Backend → **Settings** → **Environment Variables** → **Add**: `SHOW_CLIENT_IP` = `1` (Type **Secret**,
   Production) → **Save** → **Redeploy**.
2. On your laptop open https://www.whatismyip.com and note your IP. Then open
   `https://digital-labour-web.vercel.app/api/health`: it now also shows `client.ip`, `forwardedFor` and
   `realIp`. (Only these three matter here. `"db":"disconnected"` in the same answer is normal after a
   redeploy, see 4.8; the database check is `/api/auth/session`.)
3. Do the same on your phone **with Wi-Fi off** (mobile data gives a different IP).
4. Decide:

   | What you see | Set |
   |---|---|
   | `client.ip` is your own IP on both devices | keep `TRUST_PROXY=1` |
   | `client.ip` is the same strange address on both, but `forwardedFor` **starts** with your own IP followed by one more address | `TRUST_PROXY=2` |
   | Your own IP appears nowhere | keep `TRUST_PROXY=1`, and set `AUTH_RATE_LIMIT=200` (the per-IP limit becomes a site-wide brake; each account is still locked after repeated wrong passwords) |

5. Set `SHOW_CLIENT_IP` back to `0` (or delete it) → **Save** → **Redeploy**. Write down which row applied.

---

## 10. Rollback plan

| Problem | What to do |
|---|---|
| A new deployment of the frontend or the backend is broken | First tell the two kinds of "broken" apart (4.8): `/api/health` does not answer = the function does not start; `/api/auth/session` gives `503` = the database is not reachable (check `MONGO_URI` and Atlas **Network Access** before rolling back). `"db":"disconnected"` in `/api/health` alone is **not** a reason to roll back. If the code is the problem: that project → **Deployments** → the previous **Ready** production deployment → **⋮** → **Instant Rollback**. (On the free plan only the one before the current one.) Then fix the code and push again. |
| A variable is wrong | Fix it in **Settings → Environment Variables**, then **Redeploy** (variables only change on a deploy). |
| The whole go-live has to wait | Leave the new projects as they are (or set their **Ignored Build Step** to **Don't build anything** too). The old projects still show their last version. The defence demo runs on the laptop anyway (`docs/DEMO-SCRIPT.md`). |
| The database needs a clean start (before real users only) | Atlas → **Browse Collections** → database `dlm_production` → delete it, then repeat part 7. |
| A secret may have leaked | Make a new `JWT_SECRET` (everyone is logged out) and change the Atlas user's password (Atlas → **Database Access** → **Edit** → new password → update `MONGO_URI`), then **Redeploy**. Do **not** change `CNIC_ENC_KEY` without a re-encryption plan: saved CNICs would become unreadable. |

---

## 11. What waits until after the defence

- Open a pull request `feature/modules-1-3` → `main`, review, merge; then in both projects set
  **Branch Tracking** back to `main`.
- Decide what to do with the three old projects (delete them, or keep them frozen) and their old variables.
- Atlas: the free M0 cluster has no automatic backups. Plan backups (a paid tier, or a regular
  `mongodump` by a team member) before real workers sign up.
- A custom domain, if wanted (then update `CLIENT_ORIGIN`).
- Remove the temporary version pins in `frontend/package.json` (`overrides`, decision D-029) at the next
  package update.
- Open security items from `docs/REVIEW-2026-11.md`: checking new passwords against leaked-password lists
  (ASVS 2.1.7).
- The real labelled dataset for the Module 2 evaluation (`docs/evaluation/README.md`).
