# BATCH 3: Claude can see the app (safe headless browser), a bold v2 design, three languages, profile view/edit, and the step 3 and voice fixes

> **How to use this file:** put it in the repository root next to the other prompt files, then tell Claude Code:
> "Read CLAUDE.md, CLAUDE_CODE_PROMPT.md, BATCH_1_PROMPT.md, BATCH_2_PROMPT.md and BATCH_3_PROMPT.md completely, then do Batch 3."
>
> Written on 10 Nov 2026 for branch `feature/modules-1-3`. Phases 0 to 7 are done (backend 348/348, frontend 246/246).

---

## Part 0: Why this batch exists (the user's own feedback, in plain words)

The user tested the app in Chrome and is **not satisfied with the look and feel**: "the colours are basic, there is no fun or feeling in using the website, it does not look like a top-tech-company product". The user also found real problems:

1. **Onboarding gets stuck at Step 3 "Your skills"**: the worker cannot move to Step 4. (Screenshot: Urdu text "میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔" was typed in Step 3.)
2. **Voice typing does not work**: the page shows "Voice typing did not work. Please type instead."
3. **Dashboard and Profile both edit things**, which is confusing. The user wants **one place that shows the complete profile (view only)** and **one place that edits everything**, and after saving, the view must show the new data.
4. The user wants **three languages** (English, Urdu, Roman Urdu) with a switcher **from the very first screen and on the login page**, and the **whole website** must change language.
5. The user wants a **much bolder, more creative, premium design**: rich colours, modern CSS, transitions and animations, a better logo, and "wow" moments, for example the hero headline typing itself in English, erasing, and retyping in Urdu, then Roman Urdu.
6. The user wants **you (Claude Code) to see the app yourself** (open pages, click, take screenshots, check the console), not only run unit tests.

Everything in `CLAUDE.md` and the earlier prompt files still applies (local MongoDB only, never Atlas or Vercel, never push, no "AI" wording, no invented data, no fake numbers or reviews, accessibility, security, tests for everything). Where this file conflicts with the **visual** rules of `BATCH_1_PROMPT.md` Part 3, **this file wins**.

---

## Part 1: Give yourself eyes: a safe headless browser inside the container (do this first)

### 1.1 What and why
Install **Chromium** inside the dev container and use **Playwright** to open the local app at http://127.0.0.1:5173, click through flows, read the console, and take **screenshots that you then look at yourself** (with your file-reading tool, which can view images). From now on you must **visually check every screen you change**, at 360, 768 and 1280 px, before saying it is done.

### 1.2 Safety (explain this to the user in the report, in simple words)
- The browser runs **inside the container**, **headless** (no window). It cannot see or control the user's Windows Chrome, its passwords, cookies, history or files.
- It is still behind the container firewall: it can only reach the local app and the few allowed sites. Use it **only** for `http://127.0.0.1:5173` and `http://127.0.0.1:5000`.
- Chromium is installed at **image build time** from Debian's official package repository, the same way Node and Git were installed. No firewall change is needed.

### 1.3 Steps
1. Edit **only** `.devcontainer/Dockerfile`: add the Debian packages `chromium` and `fonts-noto-core` to the existing `apt-get install` line (check the line's style; keep `--no-install-recommends` if it is used), and set `ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and `ENV CHROMIUM_PATH=/usr/bin/chromium`. Nothing else in `.devcontainer/` changes.
2. Show `git diff .devcontainer`, commit it as `chore(devcontainer): add Chromium for headless visual checks`, then **stop and tell the user to rebuild** the container (they know the steps: check the GitHub limit, then "Dev Containers: Rebuild Container", then `claude --continue`).
3. After the rebuild: install the approved dev packages (Part 8), configure Playwright to use `executablePath: process.env.CHROMIUM_PATH` (never download browsers), and prove it works: open the landing page, take a screenshot at 360 px and 1280 px, **look at both screenshots**, and report what you see.
4. Add scripts:
   - `npm run e2e` (frontend): Playwright end-to-end tests against the running local preview.
   - `npm run screenshots` (frontend): saves screenshots of every main screen, in every language, at 360/768/1280 px into `docs/design/screenshots/` (useful for the FYP report). Commit only a curated set (not hundreds of files); keep the rest gitignored.
5. If Chromium and Playwright do not work together, try one reasonable fix, then stop and explain. Do not download browsers from the internet and do not change the firewall.

---

## Part 2: Fix the blockers first (with end-to-end tests)

### 2.1 Step 3 "Your skills" does not continue
- Reproduce it with Playwright exactly as the user did: a new worker, Steps 1 and 2 saved, Urdu text in Step 3. Find the real cause (for example: Continue disabled until a skill is saved but no message says so; Urdu text not matched; extract call failing; onboarding state not refreshed after adding skills; a route-guard loop).
- Fix it. Expected behaviour:
  - "Find my skills" works for Urdu, Roman Urdu and English text. For the user's sentence it must suggest **wiring** and **solar panel** skills and **5 years**.
  - After "Add selected skills", the saved skills appear and **Continue becomes enabled**, moving to Step 4.
  - If the worker has not added any skill yet, the Continue button explains why ("Add at least one skill to continue") and points to the skill search as a manual alternative. Never a silent dead end.
- Add an **e2e test** for this exact path (Urdu, Roman Urdu and English variants) and a unit or integration test for the root cause.

### 2.2 Voice typing
- Find the real error. Show the **specific** reason to the user instead of one generic message. Handle the Web Speech API error codes: `not-allowed` / `service-not-allowed` (microphone permission), `network` (the browser's speech service is unreachable), `language-not-supported`, `no-speech`, `audio-capture`, `aborted`. Show the feature only where `SpeechRecognition` or `webkitSpeechRecognition` exists, and say "works best in Google Chrome on desktop or Android".
- Use the language from the language switcher: Urdu → `ur-PK`; English and Roman Urdu → `en-US` (Roman Urdu is recognised best through English).
- Always offer the alternatives in a small help text: "You can also use your phone keyboard's microphone (for example Gboard), or Windows voice typing with **Win + H**." These work in any text box and need no code.
- Keep the privacy notice from M2-13. Voice remains optional; text is the main input.
- The headless browser cannot test real speech. Test the error handling with a mocked `SpeechRecognition` in unit tests.

---

## Part 3: Three languages: English, اردو (Urdu), Roman Urdu

### 3.1 Behaviour
- **First visit:** a short, beautiful **language chooser** screen (not a browser pop-up) with three large cards: **English**, **اردو**, **Roman Urdu**, each with a one-line preview in that language. The choice is remembered.
- A **language switcher** (globe icon plus the current language name) is always visible in the header: on the landing page, on **Login and Register**, and inside the app. Changing it switches the **whole website** immediately, with a smooth transition, without a page reload and without losing form input.
- **Urdu** sets `<html lang="ur" dir="rtl">` and the whole layout mirrors (navigation, stepper, icons with direction, forms, tables, drawers). **Roman Urdu** is left-to-right Latin script (`lang="ur-Latn"`). **English** is `lang="en"`.
- For logged-in users, save the choice on the server too (`preferredLanguage` on the User, validated as `en | ur | ur-Latn`), so it follows them to another device. For visitors, keep it in `localStorage` (a per-browser convenience; wrap access in try/catch).

### 3.2 Implementation (no i18n library needed)
- `frontend/src/i18n/`: `LanguageProvider` (React context), `useT()` hook with `t(key, params)`, simple plural handling, and three dictionaries `en.js`, `ur.js`, `ur-Latn.js`. **Every** visible string comes from the dictionaries: pages, components, buttons, validation messages, toasts, empty states, the 404 page and the document title.
- **Server error messages:** make the API return a stable machine `code` with each validation or business error (keep the English `message` for logs and API docs). The frontend shows the translated text for that code. Add tests that every code has a translation in all three languages, and a test that no dictionary has missing or extra keys compared with English.
- **Numbers and dates:** keep Western digits (0–9) for phone numbers, CNIC, rates and IDs in all languages (people in Pakistan type these with Western digits). Format dates with `Intl.DateTimeFormat` for `en-PK` / `ur-PK`.
- **Fonts:** Urdu uses **Noto Nastaliq Urdu**, self-hosted through the approved `@fontsource/noto-nastaliq-urdu` package, **loaded only when Urdu is selected** (dynamic import), with line height about 2 for Urdu text. English and Roman Urdu keep the Latin fonts.
- **CSS:** use **logical properties** everywhere (`margin-inline-start`, `padding-inline`, `inset-inline-end`, `text-align: start`) so RTL works without separate stylesheets. Flip only directional icons (arrows, chevrons), not icons such as the check mark or the globe.
- **Translation quality:** write natural, simple Urdu and Roman Urdu for a worker with basic reading skills: short sentences, common words, no heavy formal vocabulary. Add a `docs/i18n/REVIEW.md` file listing every Urdu and Roman Urdu string with its English source, so a team member who reads Urdu can check it. Mark them "draft, needs a native reviewer".

---

## Part 4: Design v2: bold, premium, alive (the user's main request)

### 4.1 Creative direction
Make the product feel like a **premium, modern, trustworthy marketplace from a top tech company**, with real personality from its context: skilled hands, tools, craft, and the colours and energy of Pakistan's streets, done in a **clean, high-end** way. When someone opens it, it should feel **alive and delightful**, but every effect must still be fast, accessible and purposeful.

**You have creative freedom** inside these rules:
- Rich, confident colour with excellent contrast (the contrast test still runs).
- Modern CSS used fully (Part 4.4).
- Purposeful motion everywhere (Part 4.5).
- No stock photos of real people, no fake statistics, testimonials, reviews, ratings or partner logos (academic honesty).

### 4.2 Three colour directions, then pick the best
Create **three complete theme token sets** (as CSS custom properties, preferably in **OKLCH**), switchable in `/dev/styleguide` and on a dev-only "theme lab" page:
1. **"Emerald Night"**: deep green-black hero and dark sections, vivid emerald primary, saffron highlights, crisp off-white content areas.
2. **"Ink & Marigold"**: deep ink-navy base, marigold and coral accents, cool light surfaces.
3. **"Terracotta Craft"**: warm clay primary, cream surfaces, deep teal secondary; an earthy, handmade-craft feel.

Each must define: background layers, surfaces, elevated surfaces, primary, secondary and accent scales, text levels, borders, focus ring, semantic colours, gradients, shadows, and the **dark sections** used for the hero and footer.

Take screenshots of the **landing page, onboarding Step 3, worker profile view and customer search** in **all three themes** at 1280 px and 360 px, **look at them yourself**, choose the strongest as the default, and explain the choice in `docs/DECISIONS.md` (D-017). Keep the other two selectable in the theme lab, so the user can switch the default by changing one line if they prefer another.

### 4.3 Logo v2
- Design **three new logomark concepts** as SVG (for example: a shield-and-wrench mark with a check; a monogram built from a tool and a hand; a badge with a stitched or tiled pattern inspired by local craft). Clean geometry, works at 16 px, in one colour and in full colour, and on dark and light backgrounds.
- Screenshot all three in the header at 360 and 1280 px, look at them, pick the best, and explain why. Keep the others in `docs/design/logo-concepts/`.
- An **animated version** for the landing page and the language chooser: the mark **draws itself** (SVG stroke animation) and the wordmark fades in. A static version is used everywhere else and when reduced motion is on.
- Update the favicon, `theme-color` and the app name in the browser tab (translated per language).

### 4.4 Modern CSS to use (with fallbacks where support is not universal)
Use these deliberately, and write in `docs/design/03-design-system.md` where each one is used:
- `oklch()` colours and `color-mix()` for hover, pressed and tint states.
- CSS **nesting**, `:has()`, `:focus-visible`, `:is()`/`:where()`.
- **Container queries** (`@container`) for cards and panels that adapt to their space.
- `clamp()` fluid typography and spacing.
- **Logical properties** for RTL (Part 3).
- `@property` for animatable custom properties (for example an animated gradient border or a progress ring).
- **View Transitions** for route changes and the language switch (React Router v7 `viewTransition` support or `document.startViewTransition`), only where supported, otherwise a normal transition.
- **Scroll-driven animations** (`animation-timeline: view()`) for section reveals, with an `IntersectionObserver` fallback where unsupported.
- `backdrop-filter` for a frosted sticky header (only where it helps readability).
- `prefers-reduced-motion`, `prefers-contrast`, `forced-colors` support.
- `text-wrap: balance` for headings and `text-wrap: pretty` for paragraphs.

### 4.5 Motion and "wow" moments (all respect reduced motion)
- **Hero typewriter:** the headline types itself in English, pauses, erases, retypes in **Urdu** (right to left, Nastaliq font), pauses, erases, retypes in **Roman Urdu**, and loops. Suggested lines, to be reviewed by the team: "Skilled work, verified." / "ہنر مند کام، تصدیق شدہ۔" / "Hunarmand kaam, tasdeeq shuda." Type at about 45 ms per character, erase at about 25 ms, hold about 2.2 s, with a blinking caret. Split text by grapheme clusters (`Intl.Segmenter`) so Urdu letters never break. The animated text is `aria-hidden`; screen readers get the static headline in the current language. With reduced motion, show the static headline only.
- Section **reveal** on scroll (fade and rise, staggered children).
- **Animated SVG illustration** in the hero (tools, a worker's ID card with a check mark drawing in), built in-house.
- Buttons: gentle lift and shadow on hover, a press state, a loading spinner that keeps the width; a subtle shine on the primary call to action.
- Cards: hover lift with a soft glow in the primary colour; skeleton loaders with a shimmer.
- Stepper: the progress line fills smoothly; the current step pulses once; a completed step shows the check drawing in.
- **Celebration** when onboarding is finished: a short, tasteful confetti burst made with your own small canvas or CSS code (no package), then the summary card animates in.
- Toasts slide in; dialogs and drawers scale and fade; the language switch cross-fades.
- Page transitions with View Transitions.
- Keep animations at 60 fps: animate only `transform` and `opacity` where possible.

### 4.6 Landing page v2 (sections)
1. Hero (dark section): animated logo, typewriter headline, one-line explanation for both sides, two calls to action ("Find a worker", "Join as a worker"), the animated illustration, a language switcher close by.
2. "How it works" for workers and for customers, as two animated tracks (3 steps each, with icons and short text).
3. "Why you can trust a profile here": identity check, skills with proof, admin review, privacy (phone and CNIC hidden). Use real product features only.
4. Trades: a grid of the real taxonomy categories with icons and hover effects (from the taxonomy API).
5. Call to action band.
6. Footer (dark): logo, short description, language switcher, FYP credit (SZABIST Islamabad, team names from `CLAUDE.md`).

All text comes from the dictionaries (3 languages).

### 4.7 Every other screen
Restyle **every** screen with the v2 system: login, register (role cards with illustrations), language chooser, onboarding (all 5 steps), worker dashboard, profile view and edit (Part 5), customer search and worker public profile, the admin layout (overview, identity review, evidence review, audit log), 404 and the error page. Check each one yourself with screenshots at 360/768/1280 px in all three languages before calling it done.

### 4.8 Optional, only if everything else is finished and green
A **dark theme** toggle using the same tokens. Do not ship it half-finished.

---

## Part 5: Worker profile: one view, one editor (the user's request)

| Route | What it is |
|---|---|
| `/worker` **Dashboard** | An overview only: greeting, profile completion, identity status, skills summary with chips, evidence status, next steps. **No edit forms here.** Buttons: "View my profile" and "Edit profile". |
| `/worker/profile` **My profile (view)** | The worker's **complete, final profile**, read only, beautifully laid out (like a premium professional profile): header card (avatar initials, name, trade, city, worker ID, identity status), About, Work and rates, Languages, Skills with status chips and evidence strength, Proof of skills (his own photos, thumbnails), Work history, and a **Private** section visible only to him (phone, WhatsApp, emergency contact, CNIC status "Saved and hidden"). A toggle **"See what customers see"** switches to the public view (no private data, no photos). One clear **"Edit profile"** button. |
| `/worker/profile/edit` **Edit profile** | **Everything** is editable in one place, organised in sections with a side navigation on desktop and tabs on mobile: About you, Work and rates, Skills (the extractor plus manual search), Proof of skills (upload and manage), Work history, Language preference. Each section saves on its own with a toast; unsaved changes are protected ("You have unsaved changes"). After saving, **the view page shows the new data immediately** (one source of truth from the server; refetch or update the cache after every save). |

Onboarding remains the guided first-time path; after onboarding, the profile editor is the place to change things. Remove any other editing entry points. Update the routes, the header menu (Dashboard, My profile, language switcher, account menu) and the tests.

---

## Part 6: Backend work in this batch
- `preferredLanguage` on the User (validated), returned by the session endpoint, updated by `PATCH /api/users/me/preferences`.
- Error `code` values for every validation and business error (Part 3.2), documented in `docs/API.md`.
- Anything the profile view or editor needs (for example one `GET /api/workers/me/full` that returns the complete own profile including skills, evidence summaries and onboarding state, so the view loads in one request).
- Tests for all of it.

---

## Part 7: Quality gates (all must pass)
1. **All** backend and frontend unit/integration tests pass, plus the new **e2e tests** (Playwright): the full onboarding path in all three languages (including the Step 3 fix); the language chooser and switcher (whole page changes, RTL in Urdu, choice remembered, saved for logged-in users); profile view → edit → save → view shows the new data; the customer view never shows phone, WhatsApp, email, address, CNIC or evidence images; the admin evidence review still works.
2. **Visual check by you:** screenshots of every main screen at 360/768/1280 px in all three languages, looked at by you, with problems fixed. Put a curated set in `docs/design/screenshots/` and list them in the report.
3. **Accessibility:** automated checks with axe through Playwright (approved package) on every main page in all three languages: no serious or critical violations. The contrast test passes for the chosen theme. Keyboard-only use works. Reduced motion is respected (test with Playwright's `reducedMotion: 'reduce'`).
4. **Console:** no errors or warnings in the browser on any page (checked by the e2e tests).
5. **Performance:** the Nastaliq font loads only for Urdu; main JavaScript bundle under 300 kB compressed; no layout shift from fonts (use `font-display: swap` and size-adjusted fallbacks). Animations use transform/opacity.
6. Build OK; lint 0 errors and 0 warnings.
7. Docs updated: `docs/design/*` (v2 system, themes, logo, motion, i18n), `docs/i18n/REVIEW.md`, `docs/DECISIONS.md` (D-017 theme, D-018 logo, D-019 languages, D-020 profile view/edit), `docs/API.md`, `docs/CHANGELOG.md`, `README.md` (how to run e2e and screenshots).

---

## Part 8: Packages approved for this batch
Install only these (version at least 2 weeks old, check name and licence, explain each in the report):

| Package | Where | Why |
|---|---|---|
| `@playwright/test` | frontend, dev | end-to-end tests and screenshots with the container's Chromium (no browser download) |
| `@axe-core/playwright` | frontend, dev | automated accessibility checks in the e2e tests |
| `@fontsource/noto-nastaliq-urdu` | frontend | self-hosted Urdu Nastaliq font, loaded only for Urdu |
| one `@fontsource` or `@fontsource-variable` **display font** of your choice | frontend | only if the chosen theme needs a display face for headings; explain the choice |

No animation, i18n or UI-kit libraries: build these yourself. Anything else needs the user's yes.

---

## Part 9: Working style, stops and the final report
- **One planned stop:** after the Dockerfile change (Part 1.3, step 2), for the rebuild. After that, work through the whole batch without stopping, unless a test cannot be made to pass, a package outside Part 8 is needed, something conflicts with the documents, or a decision is needed that this file does not give.
- Follow the "Reporting to the user" rule in `CLAUDE.md`: after each major step, one short line saying what is finished and **which page to open at http://127.0.0.1:5173 to see it**.
- Small, clear commits whenever tests pass. **Never push.** Long jobs in the background. Keep the preview running at the end.
- **Final report (one message):**
  1. Progress table (all phases and batches, percent per area).
  2. What changed, grouped: browser tooling, fixes (Step 3, voice), languages, design v2 (theme chosen and why, logo chosen and why, motion), profile view/edit, backend.
  3. Real test results: unit/integration (backend, frontend), e2e, axe, build, lint, bundle size.
  4. The list of screenshots you checked yourself, with any problems you found and fixed.
  5. A click-through for the user in Chrome: the language chooser, the switcher on Login, the hero typewriter, onboarding in Urdu up to Step 5 with the celebration, profile view → edit → save → view, "See what customers see", the theme lab at `/dev/themes` (or wherever you put it) to compare the three themes.
  6. What is left open, and what the team must review (Urdu texts, theme choice, logo choice).
