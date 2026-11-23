# Data-handling note — job descriptions (Module 6)

Like Module 2's note (`docs/evaluation/data-handling.md`), for the job-description dataset.

- **Never in the dataset:** names, phone or WhatsApp numbers, CNIC numbers, exact addresses (house, street, plot or
  flat numbers), client or employer names, photos, voice recordings, email addresses. Replace them with `[name]`,
  `[phone]`, `[address]` before labelling. The city and a general area name may stay ("Satellite Town").
- **Ids:** `j-0001`, `j-0002`, … The form's optional **code word** (for deletion) is kept only in the raw response
  sheet, never in the dataset file.
- **Storage:** the raw response sheet stays in the team's Google account (responses visible only to the team). Working
  copies live **outside the repository**, or in `backend/evaluation/job-analysis/data/`, which Git ignores. The **test
  file is kept outside the project folder** until the one test run (`PROTOCOL.md` step 3). Only these may be committed:
  the split record (ids and hashes), results JSON (ids only, never text) and, in Batch 8C, a checked model file
  (`minDf ≥ 2`, no feature with 3 or more digits; the 30 rarest features checked by a person).
- **Deletion:** when someone sends their code word before **[date the test set is frozen]**, delete that response from
  the sheet and from every working copy, and note the id in the collection record. After the project is graded,
  delete all raw files and keep only the results.
- **Live job texts are not used for the evaluation.** What customers type on the website (`JobRequest.description`)
  is used only to run the website; the evaluation uses only the consented form and paper descriptions. The admin
  statistics of live use (`GET /api/admin/job-requests/stats`) are counts without any text.
- **Synthetic files** (`*synthetic*`) say SYNTHETIC in their first line and are never reported.
