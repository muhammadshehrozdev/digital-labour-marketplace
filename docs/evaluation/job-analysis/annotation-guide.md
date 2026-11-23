# Annotation guide — job descriptions (Module 6)

Two team members label every description **independently** (no talking about items until the agreement report is
done). Use the columns of `dataset-format.md`. Label what the **text says**, not what you guess the person meant.
All examples here are **SYNTHETIC** (written for this guide).

## The main question: `gold_category` — "the trade you would call first"

Imagine you are this customer. Which **one** kind of worker would you phone first? Use the 9 trades of
`backend/config/skillTaxonomy.js`:

| Trade id | Call first for … |
|---|---|
| `electrical_solar` | wiring, switches, fans, lights, breakers, UPS, solar, generator changeover, "bijli nahi aa rahi" |
| `plumbing_sanitary` | taps, leaks, pipes, geyser, water pump and tank, drains and sewerage, commode, basin |
| `construction_masonry` | brick and block walls, plaster, cracks in walls, tiles and marble, concrete, roof waterproofing, seelan |
| `carpentry_woodwork` | doors, windows, locks and latches, cupboards, kitchen cabinets, furniture, wood polish |
| `painting_renovation` | paint, distemper, putty, weather coating, texture, wallpaper |
| `ac_appliance_repair` | AC (install, gas, service), fridge, freezer, washing machine, other home appliances |
| `home_maintenance` | a handyman: curtain rods, shelves, hanging things, many small repairs of different kinds |
| `domestic_work` | cleaning a house, cooking, laundry, child care, elder or patient care, a maid |
| `moving_loading` | shifting a house or office, loading and unloading, packing for a move |

- **Two trades in one text:** choose the one the customer would call **first** (usually the main problem; the other
  is a follow-up). "Wall crack aur phir paint" → `construction_masonry` (the crack must be fixed first). If the text
  clearly asks for two equal jobs with no order ("ek electrician aur ek plumber"), choose the **first one named**
  and write the item id in your notes; it will be discussed after the agreement report.
- **`none`:** not one of our trades (a car mechanic, a tutor, a mobile phone repair, a barber, a tent for a wedding),
  or impossible to tell ("kaam hai, koi aa jaye").
- A trade word that is not the job ("plumber ne kaam kharab kar diya, ab mistri chahiye") → the job that is needed
  now (`construction_masonry`).

## `gold_skills`

Every skill id of the taxonomy that the text **asks for**, separated by `;` — also of a second trade. Leave it empty
when no listed skill fits (for example a microwave repair: trade `ac_appliance_repair`, no skill). Do not add a skill
only because it is usual for the trade.

## `gold_task_type` — what kind of work it is

| Id | Meaning | Synthetic examples |
|---|---|---|
| `install` | fit something new, or a replacement | "naya pankha lagana hai", "geyser lagwana hai", "UPS installation", "khirki ka frame badalna hai" |
| `repair` | something is broken, leaking or not working | "nalka tapak raha hai", "AC thanda nahi kar raha", "darwaza band nahi hota" |
| `service` | routine care of something that works | "AC ki service", "chemical wash", "geyser ki servicing" |
| `new_work` | build, make, paint, renovate, tile | "chardiwari banwani hai", "ghar ka rang karwana hai", "kitchen mein tiles lagwane hain" |
| `cleaning` | cleaning | "ghar ki safai", "deep cleaning before moving in" |
| `moving` | shifting, loading | "ghar shift karna hai", "truck se samaan utarna hai" |
| `household_help` | cooking, laundry, child or elder care, daily help | "khana banane wali chahiye", "babysitter" |

Leave it **empty** when the text does not say ("electrician chahiye kal"). Replacing a broken thing with a new one
("kharab pankha utaar kar naya lagana hai") is `install`.

## The other columns

- `gold_city`: the **English** city name of `backend/config/regions.js` when the text names one city ("Pindi" →
  `Rawalpindi`). Empty when there is none, when the place is not in the table, or when two cities are named
  ("Lahore se Islamabad shifting").
- `gold_when`: `today` (aaj, abhi meaning today), `tomorrow` (kal meaning the coming day), `day_after` (parson).
  Empty for weekdays and dates ("Sunday", "25 tareekh"), "next week", or no day. "abhi kuch nahi chahiye" is not a day.
- `gold_time_slot`: `morning`, `afternoon`, `evening` when the text says so. Night ("raat") → empty.
- `gold_budget_amount` and `gold_budget_unit`: the money the customer states, in whole rupees (`2 hazar` → 2000,
  `1.5k` → 1500), as written even if it looks too small or too large; unit `day` (per day, rozana, dihari), `hour`
  (per hour, ghanta) or `job` (anything else, including a monthly amount). Both empty when no amount is stated. A
  range ("2000-3000") → empty, and note the id.
- `gold_urgent`: `yes` when the text asks for speed (jaldi, foran, urgent, emergency, abhi meaning now), else `no`.
- `script`: `english`, `roman_urdu`, `urdu` (Urdu letters), or `mixed` (Urdu letters with Latin letters, or a
  sentence that is about half English and half Roman Urdu).
- `source` and `prompt`: copied from the collection record (`COLLECTION-PLAN.md`), not judged.

## Agreement procedure (`PROTOCOL.md` step 2)

1. Each labeller fills a copy of the file alone (`A.csv`, `B.csv`; the same ids and texts).
2. `npm run agreement:jobs -- --a A.csv --b B.csv` (in `./backend`) **before** any discussion. Save the printout.
3. If Cohen's kappa for the category is below **0.60**: improve this guide (dated, with the reason, in a "Changes"
   list below), and label **everything again**, blind, before any system is run.
4. Otherwise discuss only the disagreements; a third team member decides what the two cannot agree on. Write the gold
   file and record its SHA-256.

## Changes

None yet (version 1, 24 Nov 2026, written before any real description).
