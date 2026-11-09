# BATCH 2: Module 3 (Skill Evidence and Verification), integration tests and project documentation

> **How to use this file:** put it in the repository root next to `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md` and `BATCH_1_PROMPT.md`, then tell Claude Code:
> "Read CLAUDE.md, CLAUDE_CODE_PROMPT.md, BATCH_1_PROMPT.md and BATCH_2_PROMPT.md completely, then do Batch 2."
>
> Written on 9 Nov 2026 for branch `feature/modules-1-3`. Phases 0 to 4 and the Batch 1 redesign are done and committed.
> This batch = **Phase 5 (Module 3) + Phase 6 (frontend integration and tests) + Phase 7 (documentation)** from `CLAUDE_CODE_PROMPT.md`, using the Batch 1 design system.

---

## Part 0: Before you start

1. **UI feedback from the user's click-through.** If the user's message that starts this batch contains a list of UI problems, fix those **first**, with tests where possible, and commit them as "fix(ui): …" before Module 3 work.
2. **Add a permanent working rule to `CLAUDE.md`**, under a new heading "Reporting to the user", in these words:
   - "At the end of every task or phase: (1) give the local preview link, http://127.0.0.1:5173, and list the exact pages and clicks where the user can see what changed; (2) give a progress table: phases done and left, and percent complete per module; (3) give the real test summary."
   - "While working on long batches, after each major step write one short line: what was finished, and where to see it in the browser."
3. Keep the local preview running during the batch, so the user can watch the screens change. Restart it if a change needs a restart, and say so.
4. Everything in `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md` and `BATCH_1_PROMPT.md` still applies: local MongoDB only, never Atlas, never Vercel, never `git push`, no "AI" wording, no invented data or results, the design system and components from Batch 1 for every new screen.

---

## Part 1: Decisions for Module 3 (made; do not stop to ask)

| Topic | Decision | Why |
|---|---|---|
| Evidence storage | **MongoDB**: an `Evidence` document holds metadata only; a separate `EvidenceFile` document holds the processed image bytes (BinData). List endpoints never load bytes. **Not GridFS, not Vercel Blob** in this version. | Free, no extra service or key; processed images are far below MongoDB's 16 MB document limit, so GridFS is not needed. Record as D-013 with this reasoning. |
| Allowed files | Images only: **JPEG, PNG, WebP**, checked by real content (magic bytes with `file-type`), not by the file name. HEIC → 400 with the message "Please upload a JPG or PNG photo." PDF → 400. | As in Phase 5 and `CLAUDE.md`. |
| Size limit | **4 MB** per upload (answer **413** with a clear message above that). Update the Phase 5 "5 MB → 413" test so it still sends a 5 MB file and expects 413. | Stays below Vercel's 4.5 MB request-body limit for when we deploy in Phase 8. |
| Processing | With `sharp`: auto-rotate, resize so the longest side is at most 2000 px, re-encode to **WebP**, and **strip all metadata (EXIF, GPS)**. Store only the processed file; never store the original. | Privacy (GPS in photos) and smaller files. |
| Duplicates | **SHA-256** of the processed file for exact duplicates (same worker and same skill → 409). A **dHash perceptual hash** computed with `sharp` (no new package) to flag look-alike images from **another** worker: accept with 201 but set `possibleDuplicateOf`, and show it to the admin. | As in Phase 5. Document that perceptual hashing can be fooled (record the limitation in SECURITY.md). |
| Evidence types | Certificate photo, work photo, reference letter photo. Each item is linked to **one** skill the worker already has. | As in `CLAUDE.md` domain words. |
| Consent | The upload form needs a ticked consent checkbox ("I own this photo or have permission to share it, and it shows no other person's private information."). Without it → 400. | Privacy. |
| Review states | `pending → approved` or `pending → rejected` (reason required); `approved → revoked` by admin (reason required); `suspected_fake` can be set by the admin with a reason, and the worker **cannot delete** a `suspected_fake` item. Any other transition → 400. Every change writes the append-only audit log. Two admins reviewing the same item at the same time → one succeeds, the other gets 409 (atomic update). | As in Phase 5. |
| Skill confidence | The pure function `backend/services/trust/skillConfidence.js`: Beta-style evidence counting in Subjective Logic form, with W = 2 and base rate a = 0.5: belief b = r/(r+s+W), disbelief d = s/(r+s+W), uncertainty u = W/(r+s+W), expected value E = b + a·u. Provisional weights: approved certificate r += 2, approved work photo or reference letter r += 1, suspected fake s += 1, rejected item 0 (it is simply not counted), self-declared skill 0. | As in Phase 5 and the assessment document's contribution B. Weights are **provisional**; the sensitivity script shows how results change with other weights. Cite Jøsang and Ismail (2002), "The Beta Reputation System", only if you write the exact reference that is already in the audit report; do not invent citations. |
| What people see | Worker and admin: status chips (Self-declared, Evidence pending, Verified by evidence, Disputed) and, for each skill, "Evidence: N approved" plus a plain-language strength label (for example Weak / Moderate / Strong, with the thresholds documented). Customers: the same chips and labels, but **never** the evidence images. **No percentage is shown anywhere** in the UI. The numbers b, d, u, E appear in the admin view and in docs only, labelled with the method. | Honesty rule: no "confidence %" in the UI. |
| Skill status rule | A skill shows "Verified by evidence" **only** when at least one approved evidence item exists for it and no unresolved `suspected_fake` exists. With a `suspected_fake`, it shows "Disputed". | Invariant test in Phase 5. |

---

## Part 2: Phase 5, Module 3 (build it completely)

Follow **Phase 5 and Part C6 of `CLAUDE_CODE_PROMPT.md`** and the decisions above. Build:

**Backend**
- Models: `Evidence` (worker, skill id, type, status, reason, reviewer, timestamps, `sha256`, `dhash`, `possibleDuplicateOf`, file id, size, width, height) and `EvidenceFile` (bytes, content type). Indexes for the queues and for duplicate checks.
- Storage service (`services/evidence/storage.js`) behind a small interface (save, read, delete), so Vercel Blob could replace MongoDB later without changing the routes.
- Upload pipeline: multer memory storage with the 4 MB limit → `file-type` check → `sharp` processing → hashes → duplicate rules → save. Clear 400 and 413 messages.
- Worker endpoints: upload evidence for one of my skills; list my evidence (no bytes); view or download **my own** evidence image; delete my own evidence (not allowed for `suspected_fake`).
- Admin endpoints: review queue with filters (status, type, skill, possible duplicate), view the image, approve, reject with reason, mark suspected fake with reason, revoke with reason. Atomic transitions with 409 on conflict.
- Customers and other workers: **no access** to evidence images (403 or 404).
- Skill status and confidence: recompute after every evidence change; expose the chip state and strength label in worker, admin and public responses; expose b, d, u, E only in admin responses.
- Scripts: `npm run confidence:sensitivity` (prints a table showing how E changes when each weight changes, for a few example evidence mixes) and keep `npm run audit:verify` working with the new audit actions.
- Every **required test listed in Phase 5** of `CLAUDE_CODE_PROMPT.md`, including the property tests (adding approved evidence never lowers E; uncertainty always falls as evidence grows; self-claims alone never change the score), the invariant test, the concurrency test, the `audit:verify` tamper test, and "list endpoints never load file bytes". Use real small test images generated in the test itself (with `sharp`), including a JPEG that **does** contain GPS EXIF data, to prove it is removed.

**Frontend (with the Batch 1 design system)**
- **Onboarding Step 4 "Proof of skills"** becomes real: choose a skill, choose the evidence type, pick a photo (camera or gallery on phones), see a preview, tick consent, upload with progress, see the item appear as "Pending review". "Skip for now" stays.
- `FileUpload` component: drag and drop on desktop, a big tap target on mobile, client-side type and size checks with the same messages as the server, accessible (keyboard and screen reader).
- Worker dashboard and `/worker/skills`: each skill shows its chip, "Evidence: N approved", the strength label, and its evidence items with status and reason. A worker can add more evidence from here (not from the top menu).
- **Admin "Evidence review"** at `/admin/evidence` in the admin sidebar: queue table with filters, a review drawer with a large image viewer (zoom), skill and worker info, any possible duplicate shown side by side, and Approve / Reject (reason) / Suspected fake (reason) / Revoke (reason) actions with confirmation. Show b, d, u, E with a short "how this is computed" note.
- Customer worker profile: skill chips and strength labels only, no images.

---

## Part 3: Phase 6, frontend integration and tests

Follow **Phase 6 of `CLAUDE_CODE_PROMPT.md`** with the new pages. At minimum, tests for: no Admin option on Register; a 401 sends the user to Login; the evidence form requires the consent checkbox; the evidence form rejects a wrong type and a too-large file on the client; the customer directory and worker profile never render CNIC, email, address, phone or evidence images; onboarding Step 4 shows a newly uploaded item as "Pending review"; the admin review drawer requires a reason for reject, suspected fake and revoke. `npm run build` OK, `npm run lint` 0 errors and 0 warnings, no console errors or warnings in any test.

---

## Part 4: Phase 7, documentation for the FYP report

Follow **Phase 7 of `CLAUDE_CODE_PROMPT.md`** and make these complete, in simple English, from the real code and real test runs only:

- `README.md` (root): what the project is; Windows setup step by step with PowerShell (Node 24, local MongoDB or Atlas, `.env` values with placeholders, commands); how to run the local preview, tests and scripts; how to create the first admin.
- `docs/API.md`: every endpoint, who may call it, request and response examples, error codes.
- `docs/DATA-MODEL.md`: every collection, field and index, with a Mermaid ER diagram.
- `docs/ARCHITECTURE.md`: a Mermaid component diagram (React app, Express API, services, MongoDB), the request flow for login, onboarding and evidence upload (Mermaid sequence diagrams), and where each security control sits. This helps Chapter 3 of the report.
- `docs/USE-CASES.md`: actors (worker, customer, admin) and use cases for Modules 1 to 3, with a Mermaid diagram and a short description of each use case (main flow, alternative flows). This helps the SRS.
- `docs/TEST-CASES.md`: a table (ID, module, description, steps, expected result, actual result, pass/fail) generated from the **real** test files and the **real** last run.
- `docs/SECURITY.md`: each threat → mitigation → the test that proves it, mapped to the audit IDs; keep INC-001; add the Module 3 file-upload threats and the perceptual-hash limitation.
- `docs/DECISIONS.md`: add D-013 (evidence storage) and D-014 (skill confidence method and provisional weights) and any other decision you take.
- `docs/CHANGELOG.md`: the Batch 2 entry.

**Never** write evaluation numbers for Module 2 that come from synthetic data, and never write test results you did not get from a real run.

---

## Part 5: Quality gates, commits, stopping and the final report

**Quality gates (all must pass):** all backend and frontend tests pass with real output; build OK; lint 0 errors and 0 warnings; contrast test passes; no inline styles in pages; no "AI" wording; no CNIC, email, address, phone or evidence image in any customer-facing response; synthetic data labelled; docs updated.

**Packages:** no new packages are expected (multer, file-type and sharp are installed). If you think one is needed, stop and ask.

**Commits:** small, clear commits on `feature/modules-1-3` whenever the tests pass. **Never push.** Run long jobs in the background.

**Stop early only if:** a test cannot be made to pass; a new package is needed; something conflicts with the documents or `CLAUDE.md`; or a decision is needed that is not in this file.

**Final report (one message), in this order:**
1. **Progress table:** every phase (0, 0B, 1, 2, 3, Batch 1 UI, 4, 5, 6, 7, 8) marked done or left, and percent complete for Module 1, Module 2, Module 3, UI, documentation and deployment, with one line saying what each remaining percent needs.
2. What changed (backend, frontend, docs), and the list of deleted files if any.
3. Real test summary (backend, frontend), build and lint results.
4. A table of every Phase 5 required test with pass/fail and the test name.
5. **A click-through in Chrome at http://127.0.0.1:5173**: as a worker (upload a photo for a skill in onboarding Step 4 and from the dashboard, see "Pending review"); as the admin (open Evidence review, approve one item, reject one with a reason, mark one suspected fake, see the skill chips change, check the audit log, run `npm run audit:verify` and `npm run confidence:sensitivity` in `.\backend`); as a customer (open the worker profile, see "Verified by evidence" and no images). Include the synthetic demo accounts.
6. Anything left open, and what Phase 8 (deployment) will need from the user.
