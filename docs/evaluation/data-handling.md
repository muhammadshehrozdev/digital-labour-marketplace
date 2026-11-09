# Data-handling note (evaluation dataset)

- **Never in the dataset:** names, phone or WhatsApp numbers, CNIC numbers, exact addresses,
  employer or client names, photos, voice recordings. Replace them with `[name]`, `[phone]`,
  `[place]` before labelling.
- **Ids:** `w-0001`, `w-0002`, … The link between an id and a signed consent form is kept only
  on paper or in one password-protected file held by one team member, never in Git.
- **Storage:** real dataset files live outside the repository (e.g. a `data/` folder that is not
  committed) or in a private team drive. Only results JSON (which contains no text) may be committed.
- **Live app data:** the text a worker types on the skills page is saved only when they add
  skills (`rawExperienceText`, visible only to the worker and admins). It is **not** used for the
  evaluation unless that worker gave written consent.
- **Deletion:** delete a worker's text when they ask (until the test set is frozen), and delete
  all raw files after the project is graded, keeping only results.
- **Synthetic files** (`*synthetic*`) must say SYNTHETIC in their first line and are never reported.
