# Texts for team review — Batch 8A (Module 6, 24 Nov 2026)

Every new text of Batch 8A, for a team member who reads Urdu. **All Urdu and Roman Urdu texts here are drafts**;
nothing has been checked by a native reader yet (section 1 is a second draft, see there). No audio clips in this batch
(the screens come in Batch 8B). Please mark each line "OK" or write a better version, then the team updates the files named below.

Files: the error texts are in `frontend/src/i18n/dictionaries/{en,ur,ur-Latn}.js` (section "Batch 8A (errors)"); the
word lists in `backend/config/jobPhrases.js` (changing them changes the analyzer: give each change a date and a new
`JOB_PHRASES_VERSION`, and in Batch 8C use only the development set, `docs/evaluation/job-analysis/PROTOCOL.md`).

## 1. New error texts (14 codes)

English = the server catalog (tested). Urdu and Roman Urdu: **second draft, 24 Nov 2026, consistent with the existing
dictionary words** (skill = ہنر / hunar, trade = شعبہ / shoba, worker = کاریگر / karigar, delete = حذف / hazf, "aik",
"mansookh", "Barah-e-karam", and کام کی نوعیت / kaam ki nauiyat for the kind of work, because کام کی قسم is already
the label of the trade field); **a native reader may still adjust**. The first draft is in the Git history.

| Code | English | اردو | Roman Urdu |
|---|---|---|---|
| `JOB_NOT_FOUND` | Job request not found | کام کی درخواست نہیں ملی | Kaam ki darkhwast nahi mili |
| `JOB_LIMIT_OPEN` | You already have {max} open job requests. Close one first. | آپ کی {max} کام کی درخواستیں پہلے ہی کھلی ہیں۔ پہلے کوئی ایک بند کریں۔ | Aap ki {max} kaam ki darkhwastein pehle hi khuli hain. Pehle koi aik band karein. |
| `JOB_LIMIT_DAY` | You saved {max} job requests in the last 24 hours. Please try again tomorrow. | آپ پچھلے 24 گھنٹوں میں {max} کام کی درخواستیں محفوظ کر چکے ہیں۔ براہ کرم کل دوبارہ کوشش کریں۔ | Aap pichhle 24 ghanton mein {max} kaam ki darkhwastein mehfooz kar chuke hain. Barah-e-karam kal dobara koshish karein. |
| `JOB_SKILL_CATEGORY` | Choose skills of the chosen trade only. | صرف اسی شعبے کے ہنر چنیں جو آپ نے چنا ہے۔ | Sirf usi shobe ke hunar chunein jo aap ne chuna hai. |
| `JOB_BUDGET_INCOMPLETE` | Write the budget amount and how it is counted (whole job, per day or per hour), or leave both empty. | بجٹ کی رقم لکھیں اور بتائیں کہ یہ پورے کام کی ہے، روزانہ کی یا فی گھنٹہ؛ یا دونوں خالی چھوڑ دیں۔ | Budget ki raqam likhein aur batayein ke yeh poore kaam ki hai, rozana ki ya fi ghanta; ya dono khali chhor dein. |
| `JOB_CHANGED` | This job request was changed just now. Please reload the page. | یہ کام کی درخواست ابھی ابھی بدلی گئی ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Yeh kaam ki darkhwast abhi abhi badli gayi hai. Barah-e-karam safha dobara kholein. |
| `JOB_NOT_EDITABLE` | This job request cannot be changed now. Only an open job without a waiting or accepted request can be changed. | یہ کام کی درخواست ابھی نہیں بدلی جا سکتی۔ جب یہ کسی کاریگر کے پاس جواب کی منتظر ہو، قبول ہو چکی ہو یا بند ہو، تو بدلی نہیں جا سکتی۔ | Yeh kaam ki darkhwast abhi nahi badli ja sakti. Jab yeh kisi karigar ke paas jawab ki muntazir ho, qabool ho chuki ho ya band ho, to badli nahi ja sakti. |
| `JOB_NOT_OPEN` | This job request is closed, done or expired. | یہ کام کی درخواست بند ہو چکی ہے، مکمل ہو چکی ہے یا اس کی مدت ختم ہو گئی ہے۔ | Yeh kaam ki darkhwast band ho chuki hai, mukammal ho chuki hai ya is ki muddat khatam ho gayi hai. |
| `JOB_HAS_OPEN_REQUEST` | This job already has a request to a worker. Wait for the answer, or cancel that request first. | اس کام کی ایک درخواست پہلے ہی ایک کاریگر کے پاس ہے۔ جواب کا انتظار کریں یا پہلے وہ درخواست منسوخ کریں۔ | Is kaam ki aik darkhwast pehle hi aik karigar ke paas hai. Jawab ka intezar karein ya pehle woh darkhwast mansookh karein. |
| `JOB_HAS_BOOKINGS` | This job was already sent to a worker, so it cannot be deleted. Close it instead. | یہ کام پہلے ہی ایک کاریگر کو بھیجا جا چکا ہے، اس لیے حذف نہیں ہو سکتا۔ اس کے بجائے اسے بند کر دیں۔ | Yeh kaam pehle hi aik karigar ko bheja ja chuka hai, is liye hazf nahi ho sakta. Is ke bajaye ise band kar dein. |
| `JOB_EDIT_EMPTY` | Change at least one thing before saving. | محفوظ کرنے سے پہلے کم از کم ایک چیز بدلیں۔ | Mehfooz karne se pehle kam az kam aik cheez badlein. |
| `BOOKING_JOB_MISMATCH` | This skill is not in the trade of the job. Choose a skill of the job's trade. | یہ ہنر اس کام کے شعبے میں نہیں آتا۔ اس کام کے شعبے کا کوئی ہنر چنیں۔ | Yeh hunar is kaam ke shobe mein nahi aata. Is kaam ke shobe ka koi hunar chunein. |
| `TASK_TYPE_INVALID` | Choose the kind of work: install, repair, service, new work, cleaning, moving or household help. | کام کی نوعیت چنیں: لگوانا، مرمت، سروس، نیا کام، صفائی، سامان کی شفٹنگ یا گھریلو مدد۔ | Kaam ki nauiyat chunein: lagwana, marammat, service, naya kaam, safai, saman ki shifting ya gharelu madad. |
| `CLOSE_REASON_INVALID` | Choose why you close the job: work done, not needed, found someone elsewhere, or other. | کام بند کرنے کی وجہ چنیں: کام ہو گیا، ضرورت نہیں رہی، کہیں اور سے کروا لیا، یا کوئی اور وجہ۔ | Kaam band karne ki wajah chunein: kaam ho gaya, zaroorat nahi rahi, kahin aur se karwa liya, ya koi aur wajah. |

## 2. Urdu-script terms of the word lists (`backend/config/jobPhrases.js`, version 2026-11-24-v2)

Please check the spelling and whether people really write it this way; suggest missing everyday words.

### Problem phrases per skill

| Skill | Urdu-script phrases |
|---|---|
| `elec_general` | بجلی نہیں آ رہی · لائٹ چلی جاتی · کرنٹ لگ |
| `elec_wiring` | تار جل |
| `elec_db` | شارٹ ہو گیا · بریکر گر |
| `elec_fittings` | پنکھے · ٹیوب لائٹ |
| `plumb_fixtures` | نلکا · نلکے · فلش |
| `plumb_leak` | ٹپک · ٹپکتا · ٹپک رہا |
| `plumb_pump` | پانی نہیں آ رہا · پانی نہیں آتا · موٹر خراب |
| `plumb_drain` | نالی بند |
| `plumb_pipe` | پائپ پھٹ |
| `mason_waterproof` | سیلن · چھت ٹپک |
| `mason_plaster` | دراڑ + دیوار · کریک + دیوار |
| `mason_general` | چار دیواری |
| `carp_doors` | دروازہ ٹوٹ · دروازہ خراب |
| `carp_locks` | تالا خراب |
| `carp_furniture` | کرسی ٹوٹ |
| `paint_interior` | رنگ کروانا · پینٹ کروانا · رنگ و روغن |
| `ac_gas` | ٹھنڈا نہیں · ٹھنڈک نہیں · کولنگ نہیں |
| `home_fixtures` | پردے لگانے |
| `dom_cleaning` | صفائی کروانی |
| `dom_cooking` | کھانا بنانے والی · کھانا پکانے والی |
| `dom_laundry` | کپڑے دھونے |
| `dom_childcare` | بچوں کی دیکھ بھال |
| `dom_eldercare` | بزرگ کی دیکھ بھال |
| `move_shifting` | شفٹ کرنا · سامان شفٹ |
| `move_loading` | سامان اتارنا |

### Task-type words

| Task type | Urdu-script words |
|---|---|
| `install` | لگانا · لگوانا · لگانی · لگوانی |
| `repair` | خراب · ٹھیک · مرمت · نہیں چل · نہیں آ رہا · نہیں آ رہی · ٹوٹ گیا · ٹپک |
| `service` | سروس |
| `cleaning` | صفائی |
| `moving` | شفٹ · شفٹنگ |
| `household_help` | کھانا پکانا · کھانا بنانا · کپڑے دھونا · دیکھ بھال |
| `new_work` | بنانا · بنوانا · تعمیر |

### Other lists

- Day words: today: آج · ابھی; tomorrow: کل; day_after: پرسوں
- Time words: morning: صبح; afternoon: دوپہر; evening: شام
- Urgency: فوراً · فوری · جلدی · ایمرجنسی · ابھی
- Money words: روپے · روپیہ · روپئے · بجٹ; multipliers: سو · ہزار · لاکھ; fractions: ڈیڑھ · ڈھائی
- Budget units: day: روزانہ · دن کا · دن کے · دیہاڑی; hour: گھنٹہ · گھنٹے کا · گھنٹے کے
- Address words: مکان نمبر · گلی نمبر · مکان · گلی
- Negative phrases: کچھ نہیں چاہیے · کوئی کام نہیں
- City spellings not used alone: اٹک · مری

### Roman Urdu spelling variants (please add the spellings you see)

`nahi` ← nhi, nahin, nai, nahee · `kar` ← kr · `karna` ← krna · `karni` ← krni · `karne` ← krne · `karwana` ← krwana, karvana, krvana · `karwani` ← krwani, karvani · `karwane` ← krwane, karvane · `karwa` ← krwa, karva · `gaya` ← gya · `gayi` ← gai, gyi, gayee · `raha` ← rha · `rahi` ← rhi · `rahe` ← rhe · `chahiye` ← chahye, chahie, chaiye, chahiay, chahiey, chaheye · `pani` ← paani · `bijli` ← bijlee, bjli · `thanda` ← thnda · `thandi` ← thndi · `kharab` ← kharaab, khrab · `theek` ← thik, theak, thek · `safai` ← safaai, safayi, safaee · `jaldi` ← jldi, jaldee · `foran` ← fauran · `abhi` ← abhee · `subah` ← subha · `dopahar` ← dopehar, dupahar, dopahr, dopeher · `shaam` ← sham · `lagana` ← lgana · `lagwana` ← lagvana, lgwana · `lagani` ← lgani · `lagwani` ← lagvani, lgwani · `samaan` ← saman · `deewar` ← diwar, dewar, deewaar, diwaar · `darar` ← darrar, daraar · `seelan` ← silan, seelen, sealan, seelin · `darwaza` ← darwaaza, darvaza · `tooti` ← tonti, toonti · `geyser` ← geezer, gizer, geysar · `pankha` ← pankhaa · `nalka` ← nalkaa · `mistri` ← mistry, mestri · `electrician` ← electrition, elctrician, electricion · `plumber` ← plumbar · `carpenter` ← carpainter, carpender · `fridge` ← frij, freej · `wiring` ← wairing

## 3. The consent text and the form questions

Replaced in Batch 8B (24 Nov 2026) by the **final texts the team reviewed** (in English, Urdu and Roman Urdu):

- Consent text: `docs/evaluation/job-analysis/consent-text.md`
- Google Form title, description, questions and settings: `docs/evaluation/job-analysis/FORM-DRAFT.md`

Before use, the team fills in **[team email]** and **[last date]** in the Google Form.
