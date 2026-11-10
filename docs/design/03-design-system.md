# 03 — Design system v2 (Batch 3, 10 Nov 2026)

Replaces the Batch 1 version. Decisions: D-017 (theme), D-018 (logo), D-019 (languages), D-020 (profile).
Source files: `frontend/src/styles/tokens.css` (type, space, shape, depth, motion), `themes.css` (colours),
`theme.js` (default theme), `base.css` (global rules); components in `frontend/src/components/`.

## Direction
A premium, modern, trustworthy marketplace with personality from its context: skilled hands, tools and
craft, the energy of Pakistan's streets, done cleanly. Dark "hero" sections with gradients and a faint
stitched grid, light content areas, bold display headings, and purposeful motion that respects reduced
motion. No stock photos of people, no invented numbers, reviews, ratings or partner logos.

## Brand
- Logo: "Stitched Nut" (D-018): hexagon nut + stitched ring + check. `LogoMark` (mark), `Logo` (mark +
  wordmark, translated), `tone="dark"`, `mono`, `animated` (draws itself; static with reduced motion),
  `compact` (mark only under 420 px). At 20 px and below the ring is left out.
- Illustrations are in-house SVG: the animated hero (ID card, check badge, floating tools) and the two
  role cards on Create account.

## Colour: three OKLCH themes (D-017)
Each theme defines background layers (`--color-bg`, `--color-bg-subtle`), surfaces (`surface`,
`surface-subtle`, `surface-muted`, `surface-elevated`), primary/secondary/accent scales
(`--primary-50…900`, `--secondary-*`, `--accent-*`), text levels (`text`, `text-secondary`, `text-muted`,
`text-disabled`), borders, focus ring (`focus`, `focus-halo`, `focus-on-dark`), semantic colours (success,
warning, danger, info + soft), dark-section colours (`dark-bg`, `dark-bg-2`, `dark-surface`, `on-dark`,
`on-dark-muted`, `dark-primary`, `dark-accent`), gradients (`--gradient-hero`, `-primary`, `-accent`,
`-text`, `-band`), a glow colour and `--theme-color` (browser bar).

| Theme | Character | Lowest text contrast |
|---|---|---|
| **Emerald Night** (default) | deep green-black, vivid emerald, saffron highlights | 4.65 : 1 |
| Ink & Marigold | deep ink-navy, marigold and coral, cool surfaces | 4.94 : 1 |
| Terracotta Craft | warm clay, cream surfaces, deep teal | 4.57 : 1 |

`src/styles/contrast.test.js` checks 42 text and UI pairs in every theme (WCAG 2.2 AA: 4.5 : 1 text,
3 : 1 UI), and that every OKLCH colour is inside the sRGB gamut, so the conversion (OKLab formulas,
`src/utils/contrast.js`) gives the exact on-screen colour. Components use only the role tokens, so a
theme is a pure swap. `.dark-section` re-maps the text, border and focus roles for hero, footer and the
call-to-action band.

## Typography
| Use | Font | Notes |
|---|---|---|
| Headings | Bricolage Grotesque Variable (self-hosted, Latin 41 kB) | bold, characterful; `text-wrap: balance` |
| Text | Manrope Variable (self-hosted) | weight 450; `text-wrap: pretty` |
| Urdu | Noto Nastaliq Urdu (self-hosted, 400 + 700, Arabic subset only, loaded only for Urdu) | line height 2; Latin letters and digits inside Urdu use Manrope; IDs, phone, CNIC and `dir="ltr"` content stay Latin |

Sizes are fluid with `clamp()` (`--text-hero` 40→76 px, `--text-display`, `--text-h1`, `--text-h2`,
`--text-lead`). In Urdu (`:root[lang='ur']`, exactly `ur`, never `ur-Latn`) the text and display stacks
both switch to the Urdu stack.

**Font loading and layout shift.** All fonts use `font-display: swap`. The Urdu fallback face
`Nastaliq Fallback` (local Noto Naskh Arabic, Android's standard Urdu font) has `size-adjust: 101.7%`,
**measured** in Chromium: the same Urdu sentence is 101.7 % as wide in Nastaliq as in Naskh. No metric
overrides are set for the Latin fonts, because their usual fallback (Arial on Windows) is not installed in
the development container and could not be measured. Instead the e2e test measures the real layout shift
of the landing page in all three languages: required CLS < 0.1; measured below 0.002 in every run on
10 Nov 2026 (last run: 0.0003 en, 0.0011 ur, 0.0004 ur-Latn).

## Space, shape, depth, motion
- Space: 4 px grid (`--space-1…20`), fluid section spacing `--space-section`, gutter `--gutter`.
- Radius: 8 / 12 / 16 / 24 / 32 px and full. Cards use 24 px.
- Shadows are tinted with the theme's text colour (`color-mix`), plus `--shadow-glow` in the primary colour.
- Motion tokens: 150 / 220 / 420 / 700 ms; `--ease-out`, `--ease-in-out`, `--ease-spring`. Animations
  move only `transform` and `opacity` (exceptions: one SVG stroke draw for the logo and the hero check,
  the stepper's progress line uses `transform: scaleX`).

## Modern CSS: where each feature is used
| Feature | Where |
|---|---|
| `oklch()` | every colour in `themes.css` |
| `color-mix()` | hover/pressed/tint states (buttons, badges, alerts, header, shadows, dark sections) |
| CSS nesting | all v2 component and page styles (`&:hover`, nested media queries) |
| `:has()` | radio card focus ring and the illustrated card layout, file-upload focus, worker card focus |
| `:focus-visible` | the one global focus style (`base.css`), inputs |
| `:is()` / `:where()` | Urdu heading rules and Latin-kept elements in `base.css`, RTL icon flipping |
| Container queries | profile skill rows (`ProfileDisplay.module.css`) adapt to their card width |
| `clamp()` | all heading sizes, section spacing, gutter, card padding, avatar size |
| Logical properties | everywhere (`margin-inline`, `padding-inline`, `inset-inline-*`, `border-inline-start`, `text-align: start`); no `left`/`right` remain (checked with a search in Batch 3) |
| `@property` | `--ring-value` and `--border-angle` registered as animatable types |
| View Transitions | language switch cross-fade (`document.startViewTransition` in `LanguageProvider`), page changes (`::view-transition-*` in `base.css`, data router `viewTransition` links); only where supported, never with reduced motion |
| Scroll-driven animations | section reveals: `animation-timeline: view()` in `base.css`; `IntersectionObserver` fallback in `components/motion/Reveal.jsx` |
| `backdrop-filter` | frosted sticky header, dialog backdrop, chooser cards, sticky onboarding footer on phones (each with a solid fallback in `@supports`) |
| `prefers-reduced-motion` | global rule in `base.css`; typewriter, confetti, logo and hero illustration check it |
| `prefers-contrast: more` | stronger borders and secondary text |
| `forced-colors` | system colours for focus and dark sections, button borders, hero headline |
| `text-wrap: balance / pretty` | headings / paragraphs |

## Motion inventory (all respect reduced motion)
Hero typewriter (EN → Urdu → Roman Urdu, 45 ms type, 25 ms erase, 2.2 s hold, grapheme-safe with
`Intl.Segmenter`, `aria-hidden`; screen readers get the static headline; it reserves the height of its
tallest line so nothing moves); animated logo; hero illustration (card float, badge pop, check draw,
bobbing tools); section reveals with stagger; button lift/press/shine; card hover lift + glow; skeleton
shimmer; stepper fill/pulse/check; confetti burst on "All set" (own canvas code); toasts slide in from the
end edge; dialogs scale and fade; drawers slide; language cross-fade; page View Transitions.

## Right-to-left (Urdu)
`<html lang="ur" dir="rtl">` mirrors the layout through logical properties. Only direction icons flip
(arrows, chevrons: a global rule on the `lucide-arrow-*` / `lucide-chevron-*` classes); check marks,
globe and search do not. Phone numbers, CNIC, IDs, emails and rates are `dir="ltr"`.

## Components (all in `components/ui/`)

| Component | States / behaviour |
|---|---|
| Button | primary, secondary, ghost, danger × sm/md/lg; hover lift, press scale, focus-visible, disabled; primary large buttons have a moving shine; `loading` shows a spinner, keeps width, sets `aria-busy`; `fullWidth` |
| IconButton | `aria-label` required (dev warning if missing) |
| TextField, TextArea, Select | label above, hint below, error linked by `aria-describedby`, `aria-invalid`, required marker "*" + "(required)" for screen readers, TextArea counter |
| PasswordField | show/hide toggle (IconButton), live hint "15+ characters; a sentence you remember works well" |
| RadioCard (+ RadioCardGroup) | large card, native radio inside (keyboard arrows), checked/focus/disabled |
| Checkbox, Switch | native input, label, hint; Switch is `role="switch"` |
| Combobox | text input + listbox, `aria-expanded`, `aria-activedescendant`, ↑/↓/Enter/Esc |
| Badge / StatusChip | tones neutral/primary/success/warning/danger/info/accent; StatusChip maps identity (Unverified, Pending, Verified, Rejected) and skill (Self-declared, Evidence pending, Verified by evidence, Disputed) states to tone + icon + text |
| Avatar | initials; background chosen from the name from a fixed set of AA-checked pairs; no photos |
| Card, Section, PageHeader | PageHeader renders the page's single `h1` |
| Stepper | ordered list, current step `aria-current="step"` pulses once, completed steps show a check that pops in, the progress line fills (`--progress`); compact "Step 2 of 5" text under 768 px |
| ProgressBar, ProgressRing | `role="progressbar"` with `aria-valuenow`; width/arc is the only inline style |
| Tabs | `role="tablist"`, roving focus with arrow keys (Left/Right swapped in Urdu), Home/End; `layout="side"` = side navigation on wide screens (profile editor) |
| DataTable | sortable headers (`aria-sort`), empty state; under 768 px rows become stacked cards with labels |
| Dialog, ConfirmDialog | native `<dialog>` with `showModal()` (built-in focus trap and Esc), returns focus to the opener |
| Drawer | `<dialog>` sliding in from the end edge (the left in Urdu), bottom sheet on phones |
| Toast (provider) + Alert | toasts in an `aria-live="polite"` region, auto-dismiss 4 s, pause on hover; Alert tones with icon |
| EmptyState | icon, title, one sentence, one action |
| Skeleton | block/text/circle; `aria-hidden`, container announces "Loading…" |
| Pagination | previous/next + "Page x of y" |
| AppHeader | frosted sticky bar; role-aware links (worker: Dashboard, My profile), language switcher, mobile menu button (`aria-expanded`), account menu with logout; logo mark only under 420 px |
| LanguageSwitcher | globe + current language; a list of the three languages (each in its own script, `lang`/`dir` set); Esc and outside click close it; `tone="dark"` for dark sections |
| AdminSidebar | `nav` with links; horizontal scroller on mobile |
