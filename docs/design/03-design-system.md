# 03 — Design system (Batch 1, 9 Nov 2026)

Source of truth in code: `frontend/src/styles/tokens.css` (tokens), `frontend/src/styles/base.css`
(reset, typography, focus), `frontend/src/components/ui/*` (components, CSS Modules).
Live catalogue (development only): `/dev/styleguide`.

## Brand
- Name: **Digital Labour Marketplace**. Logomark: rounded shield (primary-600) holding a wrench whose
  handle ends in a check stroke (white), flat, readable at 16 px (`components/brand/Logo.jsx`,
  `public/favicon.svg`, `public/favicon-32.png`).
- Wordmark: "Digital Labour" Manrope 800, letter-spacing −0.02em + "Marketplace" Manrope 500 in
  secondary text colour. Mobile header: mark + "Digital Labour".
- Personality: trustworthy, warm, practical, respectful. One accent (saffron) per screen at most.

## Colour tokens
Primitive scales exactly as specified in BATCH_1_PROMPT.md Part 3.3 (`--green-50…900`,
`--saffron-100/300/500/700`, `--stone-0…900`, semantic success/warning/danger/info).
Semantic roles (what components use; a dark theme can later redefine only these):

| Role token | Value | Use |
|---|---|---|
| `--color-bg` | stone-50 | page background |
| `--color-surface` | stone-0 | cards, inputs, dialogs |
| `--color-surface-subtle` | stone-25 / stone-100 | table headers, hover rows |
| `--color-text` | stone-900 | main text |
| `--color-text-secondary` | stone-600 | secondary text |
| `--color-text-disabled` | stone-400 | disabled text (WCAG exempts disabled controls) |
| `--color-border` | stone-200 | decorative borders (cards, dividers) |
| `--color-border-input` | stone-500 | input/checkbox borders (must reach 3:1) |
| `--color-primary` / `-hover` / `-pressed` | green-600 / 700 / 800 | primary buttons, links |
| `--color-on-primary` | white | text on primary |
| `--color-primary-soft` | green-50 | selected RadioCard, chips |
| `--color-accent-soft` | saffron-100 | "New"/"Coming next" badge background (text stone-900) |
| `--color-success|warning|danger|info` + `-soft` | semantic pairs | alerts, chips |

### Measured contrast (WCAG relative luminance; enforced by `src/styles/contrast.test.js`)
| Pair | Ratio | Need |
|---|---|---|
| text stone-900 on stone-0 / stone-50 | 17.72 / 16.40 | 4.5 |
| secondary stone-600 on stone-0 / stone-50 | 7.74 / 7.16 | 4.5 |
| white on primary-600 (button) | 6.46 | 4.5 |
| primary-600 link on white | 6.46 | 4.5 |
| primary-700 on primary-50 (chip) | 8.00 | 4.5 |
| success / warning / danger / info text on its soft bg | 4.52 / 4.61 / 5.75 / 5.12 | 4.5 |
| input border stone-500 on white | 4.62 | 3.0 |
| focus outline primary-600 on white | 6.46 | 3.0 |

**Two deviations from the brief (recorded in D-010):** the brief's focus ring (3 px primary-300)
measures 2.15:1, below its own 3:1 rule, so the focus indicator is a **2 px primary-600 outline
(6.46:1) with 2 px offset plus a 3 px primary-300 halo**. Saffron-700 on saffron-100 measures
3.53:1, so accent badges use **stone-900 text on saffron-100**. Saffron is never used for text.

## Typography
Manrope Variable, self-hosted (`@fontsource-variable/manrope`). Fallback: system-ui stack.
Urdu blocks: `"Noto Nastaliq Urdu", "Noto Naskh Arabic", "Jameel Noori Nastaleeq", serif`,
line-height 1.9 (class `.urdu`, and inputs with `dir="auto"` where Urdu may be typed).

| Token | Size/line (px) | Use |
|---|---|---|
| display | 40/48 (mobile 32/40) | landing headline |
| h1 | 32/40 (mobile 28/36) | page title (one per page) |
| h2 | 24/32 | sections |
| h3 | 20/28 | cards |
| body | 16/24 | default |
| small | 14/20 | hints, table cells |
| caption | 12/16 | chips, meta |
Weights 400/500/600/700/800. `.tabular` = `font-variant-numeric: tabular-nums` for rates, IDs, counts.

## Space, shape, depth, motion
- Space: `--space-1…16` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Radius: `--radius-sm 6` inputs, `--radius-md 10` buttons, `--radius-lg 14` cards,
  `--radius-xl 20` panels/dialogs, `--radius-full`.
- Shadows `--shadow-xs/sm/md/lg`: layered, low-opacity warm black. Cards = border + `sm`.
- Motion: `--duration-fast 150ms`, `--duration-base 200ms`, `--duration-slow 250ms`, ease-out;
  all animation/transition disabled under `prefers-reduced-motion: reduce`.
- Layout: max content width 1200 px; breakpoints 640 / 768 / 1024 / 1280 (360 is the base).
- Touch targets ≥ 44 × 44 px for primary actions (`md` and `lg` buttons are 44/52 px tall).
- Icons: lucide-react, 20 px, stroke 1.75, always with text or `aria-label`.

## Components (all in `components/ui/`)

| Component | States / behaviour |
|---|---|
| Button | primary, secondary, ghost, danger × sm/md/lg; hover, active, focus-visible, disabled; `loading` shows a spinner, keeps width, sets `aria-busy`; `fullWidth` |
| IconButton | `aria-label` required (dev warning if missing) |
| TextField, TextArea, Select | label above, hint below, error linked by `aria-describedby`, `aria-invalid`, required marker "*" + "(required)" for screen readers, TextArea counter |
| PasswordField | show/hide toggle (IconButton), live hint "15+ characters; a sentence you remember works well" |
| RadioCard (+ RadioCardGroup) | large card, native radio inside (keyboard arrows), checked/focus/disabled |
| Checkbox, Switch | native input, label, hint; Switch is `role="switch"` |
| Combobox | text input + listbox, `aria-expanded`, `aria-activedescendant`, ↑/↓/Enter/Esc |
| Badge / StatusChip | tones neutral/primary/success/warning/danger/info/accent; StatusChip maps identity (Unverified, Pending, Verified, Rejected) and skill (Self-declared, Evidence pending, Verified by evidence, Disputed) states to tone + icon + text |
| Avatar | initials; background chosen from the name from a fixed set of AA-checked pairs; no photos |
| Card, Section, PageHeader | PageHeader renders the page's single `h1` |
| Stepper | ordered list, current step `aria-current="step"`, completed steps show a check; compact "Step 2 of 5" text under 640 px |
| ProgressBar, ProgressRing | `role="progressbar"` with `aria-valuenow`; width/arc is the only inline style |
| Tabs | `role="tablist"`, roving focus with arrow keys |
| DataTable | sortable headers (`aria-sort`), empty state; under 768 px rows become stacked cards with labels |
| Dialog, ConfirmDialog | native `<dialog>` with `showModal()` (built-in focus trap and Esc), returns focus to the opener |
| Drawer | `<dialog>` sliding from the right (bottom on mobile) |
| Toast (provider) + Alert | toasts in an `aria-live="polite"` region, auto-dismiss 4 s, pause on hover; Alert tones with icon |
| EmptyState | icon, title, one sentence, one action |
| Skeleton | block/text/circle; `aria-hidden`, container announces "Loading…" |
| Pagination | previous/next + "Page x of y" |
| AppHeader | role-aware links, mobile menu button (`aria-expanded`), account menu with logout |
| AdminSidebar | `nav` with links; horizontal scroller on mobile |
