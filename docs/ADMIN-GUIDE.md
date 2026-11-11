# Admin guide

For the people who check identities and proof on Digital Labour Marketplace. Written for beginners:
every step says where to click. Screenshots are in `docs/design/screenshots/admin/` (synthetic
accounts on the local preview; light mode, English, 1280 px wide).

> **Two rules before anything else**
> 1. Never write a CNIC number into a note, a reason or a template. The website refuses it, because every
>    note is saved in the audit log.
> 2. Never share an export file. The users file contains emails and phone numbers. Keep it on your own
>    computer and delete it when you are done.

## 1. Where do admins come from?

There is **no admin sign-up** on the website, and visitors never see an admin link. The public "Create
account" page offers only *worker* and *customer*. An admin account is made by a team member on their own
computer with one command.

**Create the first admin (Windows 11, PowerShell, in VS Code):**

1. Open the project folder in VS Code. Open a terminal: menu **Terminal → New Terminal** (PowerShell).
2. Go to the backend folder:
   ```powershell
   cd .\backend
   ```
3. Make sure the database settings are right: `backend\.env` must contain `MONGO_URI` (the local preview
   uses `mongodb://127.0.0.1:27017/dlm_local_preview`).
4. Run the script with the new admin's name, email and phone (replace the example values):
   ```powershell
   npm run create-admin -- --name "Ayesha Admin" --email ayesha.admin@example.com --phone 03001234567
   ```
   What it does: it prints which database it will write to, asks for the password **twice** (nothing
   appears while you type), checks the password rules (at least 15 characters; a sentence works well),
   creates the account with role *admin*, and writes `admin.created` to the audit log.
   If the database is not on your own computer, it asks you to type `yes` first.
5. To see which admin accounts exist:
   ```powershell
   npm run list-admins
   ```

## 2. Logging in

Admins use the **same Log in page** as everyone else: `http://127.0.0.1:5173/login` (on the live website,
`/login`). After logging in, the website sends an admin to **Admin overview** (`/admin`). Workers and
customers who type `/admin` see "You cannot open this page"; the server refuses every admin request from
them anyway (403).

A login lasts **8 hours**. Two minutes before the end the website asks you to save your work; after that
you log in again. "Log out" (account menu, top right) ends your sessions on all devices.

## 3. The admin pages

The menu on the left (on a phone: across the top) has seven pages.

### Overview (`/admin`) — `screenshots/admin/01-overview.png`
- **Needs your attention:** how many workers wait for an identity check, how many proof photos wait for
  review, and how many were marked "suspected fake". Each tile says how long the oldest item has waited and
  splits the queue into *under 1 day / 1–3 days / 4–7 days / over 7 days*. "Open the queue" goes to it.
- **Audit log chain:** the website checks every audit entry (the same check as `npm run audit:verify`).
  "Chain intact" is normal. "Chain broken at entry N" means someone changed the database by hand: **stop
  making decisions, tell the team lead, and keep a copy of the database.**
- **Trends and totals:** new accounts per day (7, 30 or 90 days; counted in Pakistan time), worker profiles
  by identity status, proof items by decision, and skills by trade. Every number is a real count. Under each
  chart, "Show the numbers as a table" gives the same numbers as text. With the keyboard, Tab to the chart
  and use the left and right arrows to read each day.
- **Latest activity:** the newest audit entries in plain words, updated every 30 seconds.

### Identity review (`/admin/identity`) — `screenshots/admin/02-identity.png`
1. Choose a status (default *Pending*). The **Waiting** column shows how long each worker has waited.
2. Click a worker's name. A panel opens with phone, email, trade, city and whether a CNIC is on file.
3. To see the full CNIC, click **Reveal** and confirm. This is written to the audit log (`cnic.reveal`)
   *before* the number is shown. Only reveal it when you are checking the card.
4. Check the **original card** in person or on a video call. Compare name and photo.
5. Choose **Verified** or **Rejected**, write a short note (at least 5 characters, no CNIC number), and
   **Save decision**. "Insert a saved reason" fills the note with one of your templates.
6. The worker gets a notification. A rejected worker also sees your note.

Keyboard: **A** = Verified, **R** = Rejected, **J / K** = next / previous worker, **?** = list of shortcuts.
Shortcuts never work while you are typing in a box.

### Evidence review (`/admin/evidence`) — `screenshots/admin/03-evidence.png`
1. The queue shows pending proof, **oldest first**, with how long each has waited.
2. Click an item. You see the photo (Zoom to check details), its skill and kind, and the skill's numbers
   (belief, disbelief, uncertainty, expected value; method D-014; admins only).
3. If the photo looks like another worker's photo, a **compare slider** shows both: drag the slider (or use
   the arrow keys) to uncover the earlier photo, or switch to **Side by side**.
4. Decide:
   - **Approve** — the photo really shows this skill.
   - **Reject** — choose a reason (unclear, not relevant, wrong skill, other).
   - **Suspected fake** — write why (for example "the same picture was uploaded by another worker").
   - **Revoke** (on approved items) — write why the approval no longer stands.
5. The worker gets a notification with the decision.

Keyboard: **A** approve, **R** reject, **J / K** next / previous item, **?** help.

### Users (`/admin/users`) — `screenshots/admin/04-users.png`
- Search by name, email or phone; filter by role and status. The filters stay in the address, so you can
  bookmark a view.
- Click a user to see the account, what belongs to it (worker profile summary, proof counts, or a
  customer's number of saved workers) and the last audit entries. **The CNIC is never shown here.**
- **Suspend account:** write a reason (5–300 characters, no CNIC). The person is logged out at once on all
  devices and cannot log in; a suspended worker disappears from customers' search, profiles, comparisons
  and saved lists. Use it for copied or false proof, or while a report of misuse is checked.
- **Reactivate account:** write a reason. The person can log in again.
- You cannot suspend yourself or another admin. Admin accounts are managed only with the scripts above.
- Both actions are in the audit log (`user.suspended`, `user.reactivated`).

### Audit log (`/admin/audit`) — `screenshots/admin/05-audit.png`
Every important action, newest first: identity decisions, CNIC reveals, proof uploads and decisions,
suspensions, exports, template changes, admin creation. Filter by action and dates. Entries **cannot be
changed or deleted** through the website; the chain status at the top tells you if anyone changed the
database by hand.

### Reason templates (`/admin/templates`) — `screenshots/admin/06-templates.png`
Sentences you use often, grouped by where they are used (identity verified / not accepted, proof not
accepted / suspected fake / approval withdrawn, suspend / reactivate). English is required; Urdu and Roman
Urdu are optional. **Add the starter set** adds a first set in all three languages (the Urdu and Roman Urdu
lines are drafts: please check them). Inserting a template only fills the note; you can still change it.

### Exports (`/admin/exports`) — `screenshots/admin/07-exports.png`
Download CSV files for Excel or Google Sheets: the audit log (with hashes, so the chain can be checked
outside the website), the identity queue, the evidence queue, and users. Every download is written to the
audit log **before** the file is sent. A file never contains CNIC numbers, passwords, home addresses or
photos; it has at most 5,000 rows.

## 4. Daily tasks (15 minutes)

1. Open **Overview**. Look at the chain status: it must say "Chain intact".
2. Work through **Identity review → Pending**, oldest first. Try to keep the oldest under 3 days.
3. Work through **Evidence review → Pending review**, oldest first. Turn on "Possible duplicates only" once
   a day.
4. Look at **Latest activity** for anything unusual (many uploads from one worker, many CNIC reveals).

## 5. Suspected fakes and suspensions

- A **look-alike or identical photo** from another worker is a warning, not proof of cheating (two
  electricians may photograph the same type of board). Compare with the slider. If it is the same picture,
  mark **Suspected fake** and write why.
- A worker **cannot delete** a suspected-fake item or remove the skill it belongs to, so the finding stays.
- Suspend an account only with a clear reason (repeated copied proof, a confirmed misuse report). Write the
  facts, not opinions. Reactivate when the matter is resolved, again with a reason.

## 6. Reading the audit log

| Action | Meaning |
|---|---|
| `admin.created` | The create-admin script made an admin account |
| `cnic.updated` | A worker saved a new CNIC (identity goes back to Pending) |
| `cnic.reveal` | An admin looked at a full CNIC |
| `identity.decision` | An admin verified or rejected a worker's identity |
| `evidence.uploaded` / `evidence.deleted` | A worker uploaded or deleted proof |
| `evidence.approved` / `.rejected` / `.suspected_fake` / `.revoked` | An admin's proof decision |
| `user.suspended` / `user.reactivated` | An admin suspended or reactivated an account |
| `export.downloaded` | An admin downloaded a CSV file (which one, how many rows) |
| `template.created` / `.updated` / `.deleted` / `.starter_set` | Reason templates changed |

"From → To" shows the status before and after; "Reason / note" is what the admin wrote.

## 7. Security rules for admins

- Use a long passphrase (15+ characters) that you use nowhere else. Never share your account.
- Reveal a CNIC only while checking the original card, and never copy it anywhere.
- Never write a CNIC, a phone number or a home address into a note, reason or template.
- Keep export files private and delete them after use.
- Log out on shared computers. If you think your password is known to someone else, tell the team lead:
  they can make a new admin account, and logging out ends all your sessions.
- If the chain status says "broken", stop and report it.
