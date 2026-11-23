# Texts for team review — Batch 8A (Module 6, 24 Nov 2026)

Every new text of Batch 8A, for a team member who reads Urdu. **All Urdu and Roman Urdu texts here are drafts written
by Claude Code**; nothing has been checked by a native reader yet. No audio clips in this batch (the screens come in
Batch 8B). Please mark each line "OK" or write a better version, then the team updates the files named below.

Files: the error texts are in `frontend/src/i18n/dictionaries/{en,ur,ur-Latn}.js` (section "Batch 8A (errors)"); the
word lists in `backend/config/jobPhrases.js` (changing them changes the analyzer: give each change a date and a new
`JOB_PHRASES_VERSION`, and in Batch 8C use only the development set, `docs/evaluation/job-analysis/PROTOCOL.md`).

## 1. New error texts (14 codes)

English = the server catalog (tested). Urdu and Roman Urdu: drafts.

| Code | English | اردو | Roman Urdu |
|---|---|---|---|
| `JOB_NOT_FOUND` | Job request not found | کام کی درخواست نہیں ملی | Kaam ki darkhwast nahi mili |
| `JOB_LIMIT_OPEN` | You already have {max} open job requests. Close one first. | آپ کی پہلے ہی {max} کھلی کام کی درخواستیں ہیں۔ پہلے کوئی ایک بند کریں۔ | Aap ki pehle hi {max} khuli kaam ki darkhwastein hain. Pehle koi ek band karein. |
| `JOB_LIMIT_DAY` | You saved {max} job requests in the last 24 hours. Please try again tomorrow. | آپ نے پچھلے 24 گھنٹوں میں {max} کام کی درخواستیں محفوظ کیں۔ براہ کرم کل دوبارہ کوشش کریں۔ | Aap ne pichhle 24 ghanton mein {max} kaam ki darkhwastein save kin. Meharbani karke kal dobara koshish karein. |
| `JOB_SKILL_CATEGORY` | Choose skills of the chosen trade only. | صرف چنے ہوئے کام کی مہارتیں چنیں۔ | Sirf chune hue kaam ki maharatein chunein. |
| `JOB_BUDGET_INCOMPLETE` | Write the budget amount and how it is counted (whole job, per day or per hour), or leave both empty. | بجٹ کی رقم اور یہ کیسے گنی جائے گی (پورا کام، روزانہ یا فی گھنٹہ) دونوں لکھیں، یا دونوں خالی چھوڑ دیں۔ | Budget ki raqam aur yeh kaise gini jayegi (poora kaam, rozana ya fi ghanta) dono likhein, ya dono khali chhor dein. |
| `JOB_CHANGED` | This job request was changed just now. Please reload the page. | یہ کام کی درخواست ابھی بدلی گئی ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Yeh kaam ki darkhwast abhi badli gayi hai. Meharbani karke safha dobara kholein. |
| `JOB_NOT_EDITABLE` | This job request cannot be changed now. Only an open job without a waiting or accepted request can be changed. | یہ کام کی درخواست اب بدلی نہیں جا سکتی۔ صرف وہ کھلا کام بدلا جا سکتا ہے جس کی کوئی درخواست انتظار میں یا قبول شدہ نہ ہو۔ | Yeh kaam ki darkhwast ab badli nahi ja sakti. Sirf woh khula kaam badla ja sakta hai jis ki koi darkhwast intezar mein ya qabool shuda na ho. |
| `JOB_NOT_OPEN` | This job request is closed, done or expired. | یہ کام کی درخواست بند، مکمل یا ختم ہو چکی ہے۔ | Yeh kaam ki darkhwast band, mukammal ya khatam ho chuki hai. |
| `JOB_HAS_OPEN_REQUEST` | This job already has a request to a worker. Wait for the answer, or cancel that request first. | اس کام کی ایک درخواست پہلے ہی ایک کاریگر کے پاس ہے۔ جواب کا انتظار کریں، یا پہلے وہ درخواست منسوخ کریں۔ | Is kaam ki ek darkhwast pehle hi ek karigar ke paas hai. Jawab ka intezar karein, ya pehle woh darkhwast cancel karein. |
| `JOB_HAS_BOOKINGS` | This job was already sent to a worker, so it cannot be deleted. Close it instead. | یہ کام پہلے ہی ایک کاریگر کو بھیجا جا چکا ہے، اس لیے مٹایا نہیں جا سکتا۔ اس کے بجائے اسے بند کریں۔ | Yeh kaam pehle hi ek karigar ko bheja ja chuka hai, is liye mitaya nahi ja sakta. Is ke bajaye ise band karein. |
| `JOB_EDIT_EMPTY` | Change at least one thing before saving. | محفوظ کرنے سے پہلے کم از کم ایک چیز بدلیں۔ | Save karne se pehle kam az kam ek cheez badlein. |
| `BOOKING_JOB_MISMATCH` | This skill is not in the trade of the job. Choose a skill of the job's trade. | یہ مہارت اس کام کے شعبے کی نہیں۔ اس کام کے شعبے کی کوئی مہارت چنیں۔ | Yeh maharat is kaam ke shobe ki nahi. Is kaam ke shobe ki koi maharat chunein. |
| `TASK_TYPE_INVALID` | Choose the kind of work: install, repair, service, new work, cleaning, moving or household help. | کام کی قسم چنیں: لگانا، مرمت، سروس، نیا کام، صفائی، شفٹنگ یا گھریلو مدد۔ | Kaam ki qism chunein: lagana, marammat, service, naya kaam, safai, shifting ya gharelu madad. |
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

- Consent text in English, Urdu and Roman Urdu: `docs/evaluation/job-analysis/consent-text.md`
- Google Form questions in the three languages: `docs/evaluation/job-analysis/FORM-DRAFT.md`

Check especially: that the Urdu says clearly "do not write your name, phone number, house number or exact address",
"18 years or older", and how deletion with the code word works. Fill in **[team email]** and **[date the test set is
frozen]** before use.
