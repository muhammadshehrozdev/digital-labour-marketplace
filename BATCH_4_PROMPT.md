# BATCH 4: Design v3 (premium polish), the refined original logo, animated dark mode, a 50+ feature pack, admin management, and a full quality audit

> **How to use this file:** put it in the repository root next to the other prompt files, then tell Claude Code:
> "Read CLAUDE.md, CLAUDE_CODE_PROMPT.md and BATCH_1 to BATCH_4 prompt files completely, then do Batch 4."
>
> Written on 10 Nov 2026 for branch `feature/modules-1-3`. Batches 1 to 3 are done (backend 380/380, frontend 450/450, e2e 20/20, axe 0 serious).

---

## Part 0: The user's feedback after Batch 3 (plain words)

1. "The design is still nothing special. Improve and refine it a lot."
2. "The new logo ('Stitched Nut') is not good. **The earlier logo was right** (the Batch 1 shield with a wrench and a check). Bring it back, then refine and enhance it."
3. "Add a **night (dark mode) button** in the top corner on every page: landing, login, register, profile, everywhere. The dark mode must not just switch; it must have **fun animations and transitions**."
4. "Add at least **50 delightful features**. Be creative."
5. "Where does the **admin** log in, monitor, manage and handle things on the website?"
6. "Check, analyse and review **all code in great detail**. Is everything up to the mark? Any bugs or errors? Everything in the documents must be there, and the work must go **beyond** the documents."

**Confirmed from Batch 3:** your e2e choice is correct. Keep e2e on its own ports (5174/5001) with its own local database `dlm_e2e`, built for production, and never touch the preview data or Atlas.

Everything in `CLAUDE.md` and the earlier prompt files still applies: local MongoDB only, never Atlas or Vercel, never push, no "AI" wording, no invented data, numbers, reviews, testimonials or ratings, accessibility, security, tests for everything, three languages for every new text.

**Scope guard:** no new proposal modules (no jobs, reviews, wages or matching yet). All new features in this batch improve Modules 1 to 3, the admin side, or the overall experience.

---

## Part 1: Logo: bring back the Batch 1 mark, refined

1. Restore the **Batch 1 logomark** (rounded shield + wrench + check) as the brand. Move "Stitched Nut" and the other concepts to `docs/design/logo-concepts/` as rejected (record D-021 with the user's reason).
2. Make **three refinements of that same concept** (not new concepts):
   - Better proportions and optical balance: the wrench and the check must read clearly at 16, 24, 32 and 512 px.
   - Consistent stroke and corner radii that match the UI's radius scale.
   - A two-tone version (primary + accent), a one-colour version, and versions for light and dark backgrounds.
   - Optionally a subtle depth (inner highlight or soft gradient) for the large hero version only; the small sizes stay flat.
3. Screenshot the three refinements in the header (light and dark, 360 and 1280 px) and as a favicon, look at them, pick the best, and explain why.
4. Produce the full icon set: SVG favicon, 32 px PNG, Apple touch icon 180 px, and PWA icons 192 px and 512 px (including a **maskable** version).
5. Animated version for the landing hero and the language chooser: the shield outline draws, the wrench rotates gently into place, the check draws last, then the wordmark slides in. Static everywhere else and with reduced motion.

---

## Part 2: Design v3: raise every screen to a premium level

The user still finds the design "basic". Adding more animation alone will not fix that. **Quality comes from hierarchy, typography, spacing rhythm, imagery, depth, consistency and microcopy.** Work like a senior product designer:

### 2.1 Critique first, with a score
For every main screen (the 28 screens from `npm run screenshots`), in light mode at 1280 and 360 px, score 1 to 10 on: visual hierarchy, typography, spacing rhythm, colour use, imagery and illustration, depth and layering, consistency, motion, microcopy, mobile layout. Write the table in `docs/design/07-critique-v2.md` with the 3 biggest problems per screen.

### 2.2 Redesign to a target of 9 or higher on every criterion
Apply what the best product teams do (Stripe, Linear, Airbnb, Apple, Google Material 3): **match their quality, never copy their look.** Concretely:
- **Typography:** review the pairing (Bricolage Grotesque for display + a highly readable body face). Use a modular type scale, tighter display tracking, generous line height for body, `text-wrap: balance` and `pretty`. Make headings feel confident and editorial.
- **Layout:** strong grids, bento-style feature sections on the landing page, consistent 8 px rhythm, more breathing room, clear focal points, fewer borders and more spacing and surface contrast.
- **Imagery:** a consistent **in-house SVG illustration system**: one spot illustration per trade category (electrician, plumber, painter, mason, carpenter, AC technician, domestic work, moving), the same line weight and palette, animated subtly on hover. Empty states, the 404 page and onboarding steps get matching illustrations. No stock photos of people.
- **Depth and texture:** layered surfaces, soft multi-layer shadows, a subtle noise or grain texture and a tasteful mesh gradient in the dark hero (gradients are now allowed **as backgrounds**, never behind body text with poor contrast), a frosted sticky header.
- **Colour:** keep the Emerald Night direction, but refine it: richer emerald scale, warmer saffron accent, better neutral tints, and a deliberate use of accent so every screen has one clear call to action.
- **Microcopy:** short, warm, specific, in all three languages.
- **Components:** refine buttons, inputs, cards, chips, tables, dialogs, toasts, the stepper and the navigation, so they feel premium (states, spacing, icon alignment, focus rings that look designed).

### 2.3 Prove it
Re-score after the redesign in the same table and include **before/after screenshot pairs** for the 8 most important screens in `docs/design/screenshots/v3/`. Every score must be at least 9; if one is not, keep improving.

---

## Part 3: Dark mode with delightful transitions

1. **Toggle in the header on every page**, including the landing page, the language chooser, login, register, onboarding, profile, the customer pages and the admin layout (top corner; on mobile inside the header, still one tap away).
2. **Three choices:** Light, Dark, System (the default follows `prefers-color-scheme`). A single tap toggles light/dark; a long press or a small menu offers "System".
3. **The toggle icon:** a sun that morphs into a moon (rays retract, a crescent forms) with a small star twinkle; the reverse when going back. Pure SVG and CSS.
4. **The theme change itself:** a **circular reveal** that expands from the toggle button across the page, using the View Transitions API (`document.startViewTransition`) with a `clip-path: circle()` animation. Fallback where unsupported: a smooth cross-fade. Reduced motion: instant change.
5. **A full dark token set** (not just inverted colours): dark surfaces with elevation levels, adjusted brand colours for dark backgrounds, softer shadows plus subtle borders, dark versions of the illustrations and the logo. **The contrast tests must pass for both themes.**
6. Save the choice: `localStorage` for visitors (try/catch) and `preferredTheme` on the User for logged-in users (validated: `light | dark | system`), like `preferredLanguage`. No flash of the wrong theme on load (apply the theme class in a tiny inline script in `index.html` before React starts).
7. Tests: the toggle exists on every page; the choice persists; dark mode passes contrast and axe; reduced motion disables the reveal.

---

## Part 4: The feature pack (implement **all** of Tier 1 and Tier 2; Tier 3 if time allows)

Every feature must: work in all three languages and both themes, be accessible (keyboard, screen reader, reduced motion), have at least one test, and never show invented data. Record any feature you decide not to build, and why, in the report. You may **add more of your own ideas** in the same spirit; list them in the report.

### Tier 1: must build
| # | Feature | Notes |
|---|---|---|
| 1 | Animated dark mode toggle | Part 3 |
| 2 | Refined original logo + full icon set | Part 1 |
| 3 | Skip-to-content link | first focusable element |
| 4 | Text size control (A−, A, A+) in the account menu and footer | for low-vision and low-literacy users; saved like the theme |
| 5 | Offline banner + automatic retry | `navigator.onLine` and failed-request detection; Pakistan mobile data drops often |
| 6 | Installable app (PWA) | own `manifest.webmanifest` and a small own service worker that caches **static assets only** (never API responses or private data); an "Install app" hint for Android |
| 7 | Input masks with live validation | CNIC `12345-1234567-1`, Pakistani mobile `03XX-XXXXXXX`, rates; friendly messages in 3 languages |
| 8 | Autosave drafts in onboarding and the profile editor | local draft per step, "Draft restored" toast, cleared after a successful save |
| 9 | "Continue setup" chip with a progress ring in the header | for workers with unfinished onboarding |
| 10 | Profile strength meter with actionable tips | for example "Add proof for Solar panel installation"; computed from real data only |
| 11 | **Potential skills** ("You may also do…") | related skills from the same taxonomy category that the worker has not added; the worker confirms with one tap. This fulfils the proposal's Module 2 bullet "Identification of potential skills that can be added to the worker profile". |
| 12 | Matched-word highlighting inside the typed text in Step 3 | the words that produced each suggestion are highlighted in the text box overlay |
| 13 | Example-sentence carousel in Step 3 | in the chosen language |
| 14 | Client-side image compression before upload | canvas; reduces mobile data; the server still re-processes everything |
| 15 | Crop and rotate before upload | own canvas code; keyboard accessible |
| 16 | Upload progress with cancel | |
| 17 | Toast with **Undo** for reversible actions | for example removing a skill |
| 18 | Copy worker ID with an animated check | |
| 19 | In-app **notifications centre** for workers | identity approved/rejected, evidence approved/rejected/suspected, with a bell, unread count and "mark all read"; new `Notification` collection; created by the backend on the real events; polling every 60 s (no websockets) |
| 20 | Customer: URL-synced search filters | shareable links, back button restores filters |
| 21 | Customer: instant search with debounce and matched-term highlighting | |
| 22 | Customer: sort (most approved evidence, experience, recently updated) | documented sort keys |
| 23 | Customer: **saved workers** (favourites) | server-side for customer accounts, heart animation |
| 24 | Customer: **compare up to 3 workers** | side-by-side skills, evidence counts, experience, languages |
| 25 | Customer: recently viewed workers | per browser |
| 26 | Admin: **user management** | search users, view a user, **suspend / reactivate** with a required reason (suspended users cannot log in; their sessions end via `tokenVersion`), audited; admins cannot suspend themselves |
| 27 | Admin: dashboard **charts** from real data | own SVG charts (no chart library): registrations per day, identity queue size, evidence decisions by status, skills by category; empty states when there is no data |
| 28 | Admin: queue waiting-time badges | "waiting 3 days" in identity and evidence queues |
| 29 | Admin: saved reason templates | reusable reject/suspend reasons, editable, in 3 languages |
| 30 | Admin: keyboard shortcuts in review drawers | `A` approve, `R` reject, `J`/`K` next/previous, `?` help overlay; never trigger while typing |
| 31 | Admin: CSV export | audit log and queues, admin only, CNIC never included, audited |
| 32 | Admin: audit-chain status widget | an admin-only endpoint runs the same check as `audit:verify` and shows "Chain intact" or the first broken entry |
| 33 | Admin: live activity feed | latest audit events, polling |
| 34 | Duplicate-photo compare slider | drag to compare two images in evidence review |

### Tier 2: should build
| # | Feature | Notes |
|---|---|---|
| 35 | Command palette (Ctrl + K) | role-aware navigation and actions, keyboard first |
| 36 | Keyboard shortcuts help (`?`) on all pages | |
| 37 | Welcome tour (coach marks) on the first dashboard visit | own code, skippable, remembered |
| 38 | Shared-element page transition | worker card avatar → profile header (View Transitions) |
| 39 | Cursor spotlight on landing cards (desktop) | radial highlight that follows the pointer |
| 40 | Magnetic hover on the hero call-to-action buttons (desktop) | subtle |
| 41 | Animated gradient border on the primary call to action | `@property` |
| 42 | Parallax depth on the hero illustration | pointer and scroll; off with reduced motion |
| 43 | Staggered entrance of search results and lists | |
| 44 | Scroll-to-top button with a scroll-progress ring | |
| 45 | Availability quick toggle for workers | Available / Busy in the header with an animated switch |
| 46 | Share my profile | Web Share API on mobile, copy link elsewhere; shares the **public** view only |
| 47 | Printable profile ("Save as PDF") | `@media print` stylesheet with the public view; no private data |
| 48 | Session-ending warning | 2 minutes before the 8-hour session ends, offer to save work |
| 49 | Friendly 404 and error pages with animated illustrations and a search box | |
| 50 | Haptic feedback on mobile for key successes | `navigator.vibrate`, only where supported, off with reduced motion |

### Tier 3: could build (only if Tiers 1 and 2 are done and green)
| # | Feature |
|---|---|
| 51 | Count-up animation for the user's **own** real numbers (profile completion, skills, approved evidence) |
| 52 | Confetti variations for milestones (first approved evidence, identity verified) |
| 53 | Seasonal-free subtle background animation in the dark hero (slow-moving mesh) |
| 54 | "What's new" panel listing recent product changes (from `CHANGELOG.md`) |
| 55 | Help centre page with short how-to guides in 3 languages |

---

## Part 5: Admin: where admins log in and how they manage the platform

Make this clear in the product and the docs:
- **Login:** admins use the same `/login` page. After login, the role sends them to `/admin`. There is **no public admin sign-up** and **no admin link** for visitors (security). Admin accounts come only from `npm run create-admin`.
- **Admin area:** Overview (charts, queues, activity feed, audit-chain status), Identity review, Evidence review, **Users** (new, Part 4 #26), Audit log, Reason templates, Exports.
- Write `docs/ADMIN-GUIDE.md`: how to create the first admin (PowerShell steps), how to log in, a tour of every admin page with screenshots, daily tasks (review queues), how to handle suspected fakes and suspensions, how to read the audit log, and the security rules for admins (never share CNIC data, why every action is logged).

---

## Part 6: Full quality audit: "according to the documents, and beyond"

### 6.1 Requirements traceability matrix
Create `docs/TRACEABILITY.md` with one row per requirement and the columns: source, requirement, where implemented (files), how verified (test names), status. Sources:
- **The proposal's Module 1 to 3 bullets** (exact text):
  - Module 1: worker account registration and secure login; creation of a structured digital worker profile; management of personal, professional and contact information; recording of worker experience, occupation and service categories; role-based access for workers, customers and administrators.
  - Module 2: collection of worker experience and skill information; assisted identification of relevant skills from worker-provided information; organisation of skills according to job and service categories; generation of a structured worker skill profile; identification of potential skills that can be added to the worker profile.
  - Module 3: upload of certificates, work samples, photographs and other skill evidence; secure storage and association of evidence with individual skills; verification status for submitted skill evidence; administrator review of evidence where required; maintenance of verified and unverified skill information.
- The assessment document (Doc A) Section 7, rows 1 to 3.
- Every audit ID (M1-1 to M1-16, M2-1 to M2-15, process items) and every decision D-001 onwards.
- The user's own requests in Batches 1 to 4.

Any requirement that is missing or only partly met must be fixed in this batch, or listed with a reason. Note: the proposal mentions "certificates" and "other skill evidence"; our version accepts **images only** (a worker photographs a paper certificate). Explain this choice in the matrix and D-013 (security, privacy, metadata stripping), and make the upload screen tell workers "Take a clear photo of your certificate".

### 6.2 Deep code review
Review **every** backend and frontend file and write `docs/REVIEW-2026-11.md` with findings by severity (critical, high, medium, low), each with file:line, the problem, the fix, and the test that now proves it. Check at least:
- correctness and edge cases; error handling; input validation on every route; authorisation and ownership on every protected route;
- security against the OWASP Top 10 and the relevant OWASP ASVS Level 1 controls (authentication, sessions, access control, validation, error handling, file upload, logging, data protection); write a short ASVS mapping table;
- data integrity (indexes, unique constraints, transactions or atomic updates where needed, migrations);
- performance (N+1 queries, missing indexes, large payloads, bundle size, image sizes);
- maintainability (duplication, dead code, naming, file size, comments);
- i18n completeness (no hard-coded text), RTL correctness, theme token use (no hard-coded colours);
- dependency audit (`npm audit`, outdated packages, licences).
Fix everything you find, with tests.

### 6.3 Test depth
- Add **code coverage** with the approved `@vitest/coverage-v8`. Targets: backend at least **90%** lines on `services/`, `controllers/` (or route handlers) and `middleware/`; frontend at least **80%** lines on `src/`. Report the real numbers; raise them with meaningful tests, not fake ones.
- Extend e2e to cover every role × 3 languages × light and dark for the main flows, the new features in Tier 1, admin user management, suspension (a suspended user cannot log in), notifications, saved workers and compare.
- Keep axe at 0 serious or critical in both themes and all languages.
- Note honestly that only Chromium can be tested in the container (Firefox and WebKit would need browser downloads that the firewall blocks).

---

## Part 7: Packages approved for this batch
| Package | Where | Why |
|---|---|---|
| `@vitest/coverage-v8` | backend and frontend, dev | code coverage reports |

No other packages: build charts, the service worker, the command palette, crop/rotate, confetti, masks and tours yourself. Anything else needs the user's yes.

---

## Part 8: Working style, stops and the final report
- No planned stops. Stop early only if a test cannot be made to pass, a package outside Part 7 is needed, something conflicts with the documents or `CLAUDE.md`, or a decision is needed that this file does not give.
- After each major step: one short line saying what is finished and which page to open at **http://127.0.0.1:5173** to see it (the "Reporting to the user" rule).
- Small, clear commits whenever tests pass. **Never push.** Long jobs in the background. Keep the preview running at the end.
- **Final report (one message):**
  1. Progress table (all phases and batches, percent per area, what each remaining percent needs).
  2. Logo: the three refinements, the chosen one and why.
  3. Design v3: the critique table before and after (scores), and the list of before/after screenshots.
  4. Dark mode: what was built.
  5. The feature list: every number from Part 4 with done / not done (reason), plus your own extra ideas.
  6. Admin: where to log in, what each admin page does, the new Users page.
  7. The quality audit: traceability summary (requirements met / partly / missing), the review findings by severity and what was fixed, coverage numbers, the ASVS mapping summary.
  8. Real test results: backend, frontend, e2e, axe, coverage, build, lint, bundle size.
  9. A click-through in Chrome at http://127.0.0.1:5173 for: the dark-mode toggle with its reveal on the landing page, login and profile; the logo animation; the main new worker features (strength meter, potential skills, notifications, undo, crop/compress upload, install app); the customer features (saved workers, compare, URL filters); the admin features (charts, users and suspension, shortcuts, CSV export, audit-chain status). Include the synthetic demo accounts.
  10. What is left open, and what the team must review.
