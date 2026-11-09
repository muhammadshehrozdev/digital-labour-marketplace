# Labelled dataset format (CSV, UTF-8)

One row per worker description. Lines starting with `#` are comments (use the first line to say
whether the file is real or SYNTHETIC). JSON with the same field names also works.

| Column | Required | Values |
|---|---|---|
| `id` | yes | unique text, e.g. `w-0001` (never a name or phone number) |
| `script` | yes | `english`, `roman_urdu`, `urdu` or `mixed` |
| `text` | yes | the description, exactly as the worker wrote or said it (personal data removed). Use quotes if it contains commas |
| `gold_skills` | yes (may be empty) | skill ids from `backend/config/skillTaxonomy.js`, separated by `;`. Empty = no skill |
| `gold_category` | no | the main trade's category id; empty = no trade |
| `gold_years` | no | whole years stated in the text; empty = not stated |
| `gold_months` | no | months stated (0–11 after converting, e.g. 18 months = 1 year 6 months) |

Example:
```csv
# REAL — collected with consent, labelled by annotator A, 2026-11-20
id,script,text,gold_skills,gold_category,gold_years,gold_months
w-0001,roman_urdu,"5 saal se wiring aur solar ka kaam",elec_wiring;elec_solar,electrical_solar,5,
w-0002,urdu,میں گھر کی صفائی کرتی ہوں,dom_cleaning,domestic_work,,
```
The loader rejects unknown skill or category ids, duplicate ids and bad numbers with a clear message.
