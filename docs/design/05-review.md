# 05 — Self-review against the Batch 1 quality gates (9 Nov 2026)

Method: every gate in the team's Batch 1 plan (Part 9) was checked with an automated test where one is
possible, otherwise by reading the code. "Not checked" is written where no check was possible.

## Problems found during the review and fixed

| # | Found | Fix |
|---|---|---|
| R1 | The plan's focus ring (primary-300) is 2.15:1 on white, below its own 3:1 rule | 2 px primary-600 outline + primary-300 halo (D-010); contrast test |
| R2 | Saffron-700 on saffron-100 is 3.53:1 for small badge text | stone-900 on saffron-100 (D-010) |
| R3 | Input borders at stone-200 would be 1.63:1 (inputs need 3:1) | stone-500 for input/checkbox borders |
| R4 | A hard-coded hover colour in the danger button | colour-mix of the danger token |
| R5 | **Crash:** onboarding step 3 called a state updater with `null` after the data-loading refactor | updater now receives the current server state; covered by the onboarding tests (they failed before the fix) |
| R6 | Dialog test stand-in did not move focus into the dialog, so Esc was not tested like a browser | stand-in focuses the first control, as browsers do |
| R7 | "Find workers" sidebar sent a request on every key typed in City | City applies on Search / Show workers; other filters apply at once |
| R8 | A page description used `&apos;` inside a JavaScript string (would print literally) | plain apostrophe |
| R9 | Empty-skills state used a "sparkle" icon (banned "AI sparkle" look) | checklist icon |
| R10 | 1 lint error (`useId` called conditionally) + 18 warnings (helpers exported from component files; state reset inside effects) | `useId` always called; helpers moved to plain modules; `useApiQuery` derives loading from the request key; editors initialise drafts in a child component |
| R11 | Duplicate heading text "Your skills" (h1 and h2) on the onboarding skills step | section renamed "Skills on your profile" |
| R12 | Profile defaults (city "Islamabad", occupation "General Technician") would mark onboarding steps as done before the worker typed anything | defaults removed (D-011) |
| R13 | Roman Urdu everyday words in the taxonomy ("aaya" = came, "masi" = aunt) | removed / made weak terms (D-012) |

## Part 9 checklist

| Gate | Result | Evidence |
|---|---|---|
| 1 Tests | Pass | Backend 272/272 (18 files), frontend 215/215 (6 files), real runs on 9 Nov 2026 (`docs/CHANGELOG.md`) |
| 2 Build, lint | Pass | `npm run build` OK; `oxlint` exit 0 with no findings (0 errors, 0 warnings) |
| 3 Accessibility | Pass for what tests can see | Labels on every input (tests query by label); `aria-label` on every IconButton (component requires it); keyboard: Combobox arrows/Enter/Esc, Dialog Esc + focus return, Tabs arrows (tests); visible focus style in `base.css`; one `h1` per page (PageHeader / onboarding / 404 tests); landmarks header/nav/main/footer + skip link (landing test); `aria-live` for toasts, result counts, pagination, counters; contrast test; `prefers-reduced-motion` in `base.css`. **Not checked:** a screen-reader run (NVDA/TalkBack) — do it in Chrome before the viva. |
| 4 Responsive | **Checked by code review only** | Mobile-first CSS, breakpoints 640/768/1024/1280, cards and filters reflow, DataTable → cards under 768 px, Drawer → bottom sheet under 640 px, Stepper compact text under 768 px, sticky onboarding actions on phones. **No browser exists in the dev container**, so 360/768/1280 px were not seen on screen; please check in Chrome DevTools (device toolbar) — steps in the final report. |
| 5 No console errors/warnings | Pass in tests | Every frontend test fails if `console.error` or `console.warn` is called; all 215 pass. Real Chrome console: **not checked** (no browser). |
| 6 No inline styles in pages, no leftovers | Pass | `grep "style={"`: only in 6 UI components, all runtime values (progress width, avatar colour, skeleton size, spinner/ring size); old pages, `App.css`, `index.css`, Vite sample assets removed |
| 7 Honesty | Pass | Honesty scans (frontend 122 files, backend 53 files) find no "AI" label or confidence score; landing test checks no ratings or invented counts; synthetic files labelled; proof step says "Coming next" and has no upload |
| 8 Docs | Pass | `docs/design/01–06`, `docs/API.md`, `docs/DECISIONS.md` (D-010–D-012, D-008 reason), `docs/CHANGELOG.md`, `README.md`, `docs/evaluation/*` |
| 9 `*:Zone.Identifier` in `.gitignore` | Pass | `.gitignore` |

## Known gaps (honest)
- Responsive layout and the real browser console were not seen in a browser (see gates 4 and 5).
- `lucide-react` is pinned to 1.61.0 (the newest release older than two weeks on 9 Nov 2026).
- The Urdu consent-form text is a draft and must be checked by a team member who reads Urdu.
- Skill list v1 has not met real data yet; its quality is unknown until the evaluation runs.

## Batch 2 review (Module 3, 9 Nov 2026)

| # | Found | Fix |
|---|---|---|
| B1 | The admin "possible duplicates" filter used a `$in` operator that `sanitizeFilter` neutralised, so it could never match | marked as our own operator with `mongoose.trusted()`; the filter test failed before the fix |
| B2 | Client photo check trusted the browser's claimed type when the bytes matched nothing (a text file named .jpg got the "JPG or PNG" message, not the server's "not a photo") | client recognises image formats only by their bytes, like the server; GIF/BMP/TIFF covered by a test |
| B3 | Admin API field named `confidence` clashed with the "no confidence %" honesty rule | renamed to `opinion` (the subjective-logic term for b, d, u) |
| B4 | A preview-URL effect needed a lint suppression | replaced by a small keyed `Preview` component (no suppression) |
| B5 | An old Phase 4 test banned the word "strength", which Batch 2 now requires as a plain-language label | the test now bans the old numeric score fields by name |
| B6 | Redundant Evidence index `{ worker, skillId }` (prefix of the unique index) | removed |
| B7 | Unused CSS classes left from the old dashboard skills list | removed |
| B8 | Test flakiness: the router path probe could lag one render; typing-heavy tests could pass 5 s on a busy machine; the race test assumed one timing | layout-effect probe; 15 s frontend test timeout; race test split into "exactly one succeeds" (real concurrency) + a deterministic stale-read 409 test |
| B9 | My end-to-end script, placed in `backend/`, made nodemon restart the API mid-run (502s) | scripts now run from the scratchpad |

Still not checked in a real browser (no browser in the dev container): layout at 360/768/1280 px,
the live console, screen-reader output, and the camera picker on a phone — see the final report's
click-through.
