# 02 — UX analysis (Batch 1, 9 Nov 2026)

## Audit of the UI before Batch 1

| Screen | What is wrong | Why it matters |
|---|---|---|
| All | Default-template look (indigo `#4f46e5`, "DL" box logo, Plus Jakarta Sans from Google Fonts); about 136 inline `style={{…}}` blocks; no shared components | Looks unfinished; every page differs; Google font request on slow data and a privacy leak |
| Navigation | Worker menu shows "My Profile" and "AI Skill Profiler" side by side | Worker must discover Module 2 alone; "AI" label is not honest (M2-15) |
| `/` | Shows the Register form | No explanation of the product for either side |
| Register | Role toggle looks like tabs; password rule only as small text; server errors shown as one banner | Role choice is the most important decision; errors are not next to the field |
| Worker profile | One very long form, everything on one screen | Hard on a 360 px phone; no sense of progress |
| Skill profiler | Shows invented percentages and levels, saves on analysis, "Clear profile" wipes Module 1 data | Audit M2-2, M2-3, M2-8, M2-9 |
| Customer | Long cards with many inline styles, filters in one row that overflows at 360 px | Horizontal scroll on phones |
| Admin | One table, form squeezed into a table cell, `window.confirm` for CNIC reveal | Not usable on small screens; browser confirm is not styled or accessible |
| Errors | No error boundary; 404 page only | A crash shows a blank page |

## Information architecture (sitemap)

```mermaid
flowchart TD
  L["/ Landing"] --> R["/register"]
  L --> LI["/login"]
  R -->|worker| O1["/onboarding/about"]
  R -->|customer| F["/find"]
  LI -->|worker, not finished| O1
  LI -->|worker, finished| WD["/worker"]
  LI -->|customer| F
  LI -->|admin| A["/admin"]
  subgraph Worker
    O1 --> O2["/onboarding/work"] --> O3["/onboarding/skills"] --> O4["/onboarding/proof"] --> O5["/onboarding/done"] --> WD
    WD --> WP["/worker/profile"]
    WD --> WS["/worker/skills"]
    WP --> WS
  end
  subgraph Customer
    F --> PP["/workers/:workerId"]
  end
  subgraph Admin
    A --> AI["/admin/identity"]
    A --> AA["/admin/audit"]
  end
```

## User flows

### Worker: first visit to dashboard

```mermaid
sequenceDiagram
  actor W as Worker
  participant UI as React app
  participant API as API
  W->>UI: Register (role: find work)
  UI->>API: POST /api/auth/register
  UI->>API: GET /api/workers/me/onboarding
  API-->>UI: nextStep = about
  UI-->>W: /onboarding/about
  W->>UI: Save "About you"
  UI->>API: PUT /api/workers/me (about fields)
  UI-->>W: toast "Saved", then /onboarding/work
  W->>UI: Save "Your work"
  UI->>API: PUT /api/workers/me (work fields)
  UI-->>W: toast "Saved", skills step opens by itself
  W->>UI: Type description, "Find my skills"
  UI->>API: POST /api/workers/me/skills/extract (saves nothing)
  W->>UI: Tick suggestions, "Add selected skills"
  UI->>API: POST /api/workers/me/skills
  UI-->>W: /onboarding/proof (coming next) -> Skip -> /onboarding/done -> /worker
```

### Customer: find a worker

```mermaid
flowchart LR
  A[Open /find] --> B[Type search or pick filters]
  B --> C{Results?}
  C -->|yes| D[Cards: name, trade, city, identity badge, skills]
  C -->|no| E[Empty state: clear filters]
  D --> F["/workers/:workerId public profile"]
  F --> G[Note: contact after an accepted booking]
```

### Admin: identity decision

```mermaid
flowchart LR
  A["/admin/identity"] --> B[Filter: Pending]
  B --> C[Open row -> decision drawer]
  C --> D{Need the CNIC?}
  D -->|yes| E[Reveal -> ConfirmDialog 'recorded in the audit log'] --> F
  D -->|no| F[Choose Verified/Rejected + required note]
  F --> G[PATCH identity -> toast -> table refreshes]
  G --> H["/admin/audit shows the entry"]
```
