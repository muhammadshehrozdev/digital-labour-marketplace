# Module 6 dataset format

One CSV file per annotator, UTF-8, with a header row. Lines that start with `#` are comments. A SYNTHETIC file says
so in its first line (`# SYNTHETIC — ...`); `backend/evaluation/job-analysis/dataset.js` checks every row and stops
with a clear message (with the item id) on any unknown value.

```
id,source,prompt,script,text,gold_category,gold_skills,gold_task_type,gold_city,gold_when,gold_time_slot,gold_budget_amount,gold_budget_unit,gold_urgent
```

| Column | Values |
|---|---|
| `id` | `j-0001`, `j-0002`, ... (unique; never a name) |
| `source` | `form` (the Google Form) · `in_person` (a team member wrote the person's words exactly) · `other` |
| `prompt` | `general` (the first prompt, naming no trade) · `targeted` (a situation prompt for a missing trade) |
| `script` | the annotator's label: `english` · `roman_urdu` · `urdu` · `mixed` |
| `text` | the description as written (after removing personal data, `data-handling.md`) |
| `gold_category` | a trade id of `config/skillTaxonomy.js`, or `none` (not one of our trades, or impossible to tell) |
| `gold_skills` | skill ids separated by `;` (any trade the text asks for), or empty |
| `gold_task_type` | `install` · `repair` · `service` · `new_work` · `cleaning` · `moving` · `household_help`, or empty |
| `gold_city` | the English city name of `config/regions.js` (`Rawalpindi`, not `Pindi`), or empty (none, or more than one) |
| `gold_when` | `today` · `tomorrow` · `day_after`, or empty |
| `gold_time_slot` | `morning` · `afternoon` · `evening`, or empty |
| `gold_budget_amount`, `gold_budget_unit` | whole rupees and `job` · `day` · `hour`, or both empty |
| `gold_urgent` | `yes` · `no` |

How to label each column: `annotation-guide.md`. Example (SYNTHETIC):

```
j-0001,form,general,roman_urdu,"Kal subah AC ki service karwani hai, Rawalpindi mein",ac_appliance_repair,ac_general;ac_service,service,Rawalpindi,tomorrow,morning,,,no
```
