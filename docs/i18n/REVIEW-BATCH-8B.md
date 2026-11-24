# Texts for team review — Batch 8B (Module 6 screens, 24 Nov 2026)

Every new text of Batch 8B, for a team member who reads Urdu. **All Urdu and Roman Urdu texts here are drafts**;
nothing has been checked by a native reader yet. They use the words of the second-draft error texts (A6): ہنر / hunar
(skill), شعبہ / shoba (trade), کام کی نوعیت / kaam ki nauiyat (kind of work), کام کی درخواست / kaam ki darkhwast
(job request), کاریگر / karigar (worker), حذف / hazf (delete), منسوخ / mansookh (cancel). Please mark each line "OK" or
write a better version; the team then updates the dictionary files: the texts live in
`frontend/src/i18n/dictionaries/{en,ur,ur-Latn}.js` between the markers "Batch 8B (top)", "Batch 8B (help.field)",
"Batch 8B (help.screen)" and "Batch 8B (help.option)". No audio clips in this batch (team decision: recorded after
Module 7); section 6 lists the help texts that would need one.

## 1. Screen texts (`jobs.*`)

| Key | English | اردو | Roman Urdu |
|---|---|---|---|
| `jobs.nav.mine` | My job requests | میری کام کی درخواستیں | Meri kaam ki darkhwastein |
| `jobs.nav.describe` | Describe a job | کام بتائیں | Kaam batayein |
| `jobs.titles.mine` | My job requests | میری کام کی درخواستیں | Meri kaam ki darkhwastein |
| `jobs.titles.new` | Describe a job | کام بتائیں | Kaam batayein |
| `jobs.titles.detail` | Job request | کام کی درخواست | Kaam ki darkhwast |
| `jobs.titles.edit` | Change the job request | کام کی درخواست بدلیں | Kaam ki darkhwast badlein |
| `jobs.titles.workers` | Workers for this job | اس کام کے کاریگر | Is kaam ke karigar |
| `jobs.findCard.title` | Not sure whom to call? Describe the job in your own words | سمجھ نہیں آ رہا کسے بلائیں؟ اپنے الفاظ میں کام بتائیں | Samajh nahi aa raha kise bulayein? Apne alfaaz mein kaam batayein |
| `jobs.findCard.text` | Write it as you would tell a worker, or press 🎤 Speak and say it. Then you choose the worker yourself. | ایسے لکھیں جیسے کاریگر کو بتاتے ہیں، یا 🎤 بولیں دبا کر بتا دیں۔ پھر کاریگر آپ خود چنیں۔ | Aise likhein jaise karigar ko batate hain, ya 🎤 Bolein daba kar bata dein. Phir karigar aap khud chunein. |
| `jobs.task.install` | Install | لگوانا | Lagwana |
| `jobs.task.repair` | Repair | مرمت | Marammat |
| `jobs.task.service` | Service | سروس | Service |
| `jobs.task.new_work` | New work | نیا کام | Naya kaam |
| `jobs.task.cleaning` | Cleaning | صفائی | Safai |
| `jobs.task.moving` | Moving | سامان کی شفٹنگ | Saman ki shifting |
| `jobs.task.household_help` | Household help | گھریلو مدد | Gharelu madad |
| `jobs.task.none` | Not sure | معلوم نہیں | Maloom nahi |
| `jobs.state.open` | Open | کھلی | Khuli |
| `jobs.state.requested` | Waiting for a worker | کاریگر کا انتظار | Karigar ka intezar |
| `jobs.state.accepted` | Accepted | قبول ہو گئی | Qabool ho gayi |
| `jobs.state.done` | Done | کام ہو گیا | Kaam ho gaya |
| `jobs.state.expired` | Expired | مدت ختم | Muddat khatam |
| `jobs.state.closed` | Closed | بند | Band |
| `jobs.meaning.open` | Open: choose a worker | کھلی: کاریگر چنیں | Khuli: karigar chunein |
| `jobs.meaning.requested` | Waiting for the worker's answer | کاریگر کے جواب کا انتظار ہے | Karigar ke jawab ka intezar hai |
| `jobs.meaning.accepted` | A worker accepted this job | ایک کاریگر نے یہ کام قبول کر لیا ہے | Aik karigar ne yeh kaam qabool kar liya hai |
| `jobs.meaning.done` | The work is done | کام ہو گیا ہے | Kaam ho gaya hai |
| `jobs.meaning.expired` | Expired: no worker was asked in time | مدت ختم: وقت پر کسی کاریگر سے نہیں پوچھا گیا | Muddat khatam: waqt par kisi karigar se nahi poocha gaya |
| `jobs.meaning.closed` | You closed this job request | آپ نے یہ کام کی درخواست بند کر دی | Aap ne yeh kaam ki darkhwast band kar di |
| `jobs.tabs.active` | Active | جاری | Jaari |
| `jobs.tabs.open` | Open | کھلی | Khuli |
| `jobs.tabs.requested` | Waiting for a worker | کاریگر کا انتظار | Karigar ka intezar |
| `jobs.tabs.accepted` | Accepted | قبول شدہ | Qabool shuda |
| `jobs.tabs.done` | Done | مکمل | Mukammal |
| `jobs.tabs.expired` | Expired | مدت ختم | Muddat khatam |
| `jobs.tabs.closed` | Closed | بند | Band |
| `jobs.day.today` | Today | آج | Aaj |
| `jobs.day.tomorrow` | Tomorrow | کل | Kal |
| `jobs.day.pick` | Pick a date | تاریخ چنیں | Tareekh chunein |
| `jobs.day.none` | Not decided | ابھی طے نہیں | Abhi tay nahi |
| `jobs.time.none` | Not decided | ابھی طے نہیں | Abhi tay nahi |
| `jobs.summary.trade` | Trade | شعبہ | Shoba |
| `jobs.summary.skills` | Skills | ہنر | Hunar |
| `jobs.summary.kind` | Kind of work | کام کی نوعیت | Kaam ki nauiyat |
| `jobs.summary.urgent` | Urgent | فوری | Fori |
| `jobs.summary.listen` | Listen to the job details | کام کی تفصیل سنیں | Kaam ki tafseel sunein |
| `jobs.budget.title` | Budget (optional and private) | بجٹ (اختیاری اور نجی) | Budget (ikhtiyari aur niji) |
| `jobs.budget.privateNote` | Only you and the site's admins can see this. Workers never see it. | اسے صرف آپ اور سائٹ کے ایڈمن دیکھ سکتے ہیں۔ کاریگر اسے کبھی نہیں دیکھتے۔ | Ise sirf aap aur site ke admin dekh sakte hain. Karigar ise kabhi nahi dekhte. |
| `jobs.budget.private` | Only you and the admins see this. | اسے صرف آپ اور ایڈمن دیکھتے ہیں۔ | Ise sirf aap aur admin dekhte hain. |
| `jobs.budget.amount` | Budget amount (optional) | بجٹ کی رقم (اختیاری) | Budget ki raqam (ikhtiyari) |
| `jobs.budget.unit` | How is the budget counted? | بجٹ کس حساب سے ہے؟ | Budget kis hisaab se hai? |
| `jobs.budget.remove` | Remove the budget | بجٹ ہٹا دیں | Budget hata dein |
| `jobs.budget.none` | No budget written | کوئی بجٹ نہیں لکھا | Koi budget nahi likha |
| `jobs.budget.line.job` | Budget: {amount} for the whole job | بجٹ: پورے کام کے {amount} | Budget: poore kaam ke {amount} |
| `jobs.budget.line.day` | Budget: {amount} a day | بجٹ: روزانہ {amount} | Budget: rozana {amount} |
| `jobs.budget.line.hour` | Budget: {amount} an hour | بجٹ: فی گھنٹہ {amount} | Budget: fi ghanta {amount} |
| `jobs.budget.spoken.job` | Your budget is {amount} rupees for the whole job. | آپ کا بجٹ پورے کام کے {amount} روپے ہے۔ | Aap ka budget poore kaam ke {amount} rupay hai. |
| `jobs.budget.spoken.day` | Your budget is {amount} rupees a day. | آپ کا بجٹ روزانہ {amount} روپے ہے۔ | Aap ka budget rozana {amount} rupay hai. |
| `jobs.budget.spoken.hour` | Your budget is {amount} rupees an hour. | آپ کا بجٹ فی گھنٹہ {amount} روپے ہے۔ | Aap ka budget fi ghanta {amount} rupay hai. |
| `jobs.spoken.trade` | Your job: {trade}. | آپ کا کام: {trade}۔ | Aap ka kaam: {trade}. |
| `jobs.spoken.skills` | Skills: {skills}. | ہنر: {skills}۔ | Hunar: {skills}. |
| `jobs.spoken.kind` | Kind of work: {kind}. | کام کی نوعیت: {kind}۔ | Kaam ki nauiyat: {kind}. |
| `jobs.spoken.place` | Place: {area}, {city}. | جگہ: {area}، {city}۔ | Jagah: {area}, {city}. |
| `jobs.spoken.when` | Day: {day}. Time: {time}. | دن: {day}۔ وقت: {time}۔ | Din: {day}. Waqt: {time}. |
| `jobs.spoken.urgent` | It is urgent. | کام فوری ہے۔ | Kaam fori hai. |
| `jobs.suggest.from` | Suggested from your words: | آپ کے الفاظ سے تجویز: | Aap ke alfaaz se tajweez: |
| `jobs.suggest.fromTrade` | Suggested: usual for this trade | تجویز: اس شعبے میں عام طور پر یہی | Tajweez: is shobe mein aam taur par yahi |
| `jobs.suggest.newOne` | New suggestion from your words: {value}. Use it? | آپ کے الفاظ سے نئی تجویز: {value}۔ کیا یہ لیں؟ | Aap ke alfaaz se nayi tajweez: {value}. Kya yeh lein? |
| `jobs.suggest.useIt` | Use it | یہ لیں | Yeh lein |
| `jobs.method.rules` | rule-based word lists | قواعد پر مبنی الفاظ کی فہرستیں | qawaid par mabni alfaaz ki fehristein |
| `jobs.method.nb` | naive Bayes classifier: a simple word-count model trained on the team's labelled examples | نائیو بیز کلاسیفائر: ٹیم کی اپنی مثالوں سے سیکھا ہوا الفاظ گننے کا سادہ طریقہ | naive Bayes classifier: team ki apni misaalon se seekha hua alfaaz ginne ka saada tareeqa |
| `jobs.method.hybrid` | rule-based word lists first; the naive Bayes classifier only when the word lists give no trade | پہلے الفاظ کی فہرستیں؛ شعبہ نہ ملے تو نائیو بیز کلاسیفائر | pehle alfaaz ki fehristein; shoba na mile to naive Bayes classifier |
| `jobs.describe.label` | Describe the job in your own words | اپنے الفاظ میں کام بتائیں | Apne alfaaz mein kaam batayein |
| `jobs.describe.hint` | Write it as you would tell a worker. Any language. Do not write your phone number, house number or exact address. | ایسے لکھیں جیسے کاریگر کو بتاتے ہیں۔ کوئی بھی زبان۔ اپنا فون نمبر، مکان نمبر یا پورا پتہ نہ لکھیں۔ | Aise likhein jaise karigar ko batate hain. Koi bhi zubaan. Apna phone number, makan number ya poora pata na likhein. |
| `jobs.describe.speak` | Speak | بولیں | Bolein |
| `jobs.describe.check` | Check my words | میرے الفاظ جانچیں | Mere alfaaz jaanchein |
| `jobs.describe.checking` | Checking… | جانچ ہو رہی ہے… | Jaanch ho rahi hai… |
| `jobs.describe.found` | Words we found: | ملے ہوئے الفاظ: | Milay hue alfaaz: |
| `jobs.describe.noWords` | No known words found. You can still choose everything in the next step. | کوئی جانا پہچانا لفظ نہیں ملا۔ اگلے قدم میں آپ سب کچھ خود چن سکتے ہیں۔ | Koi jana pehchana lafz nahi mila. Aglay qadam mein aap sab kuch khud chun sakte hain. |
| `jobs.describe.howTitle` | How does this work? | یہ کیسے کام کرتا ہے؟ | Yeh kaise kaam karta hai? |
| `jobs.describe.howMethod` | Method: {method}. | طریقہ: {method}۔ | Tareeqa: {method}. |
| `jobs.describe.how` | The app looks for known words in your text. You check and change everything in the next step. | ایپ آپ کی تحریر میں جانے پہچانے الفاظ ڈھونڈتی ہے۔ اگلے قدم میں آپ سب کچھ جانچ کر بدل سکتے ہیں۔ | App aap ki tehreer mein jaane pehchane alfaaz dhoondti hai. Aglay qadam mein aap sab kuch jaanch kar badal sakte hain. |
| `jobs.describe.needText` | Write or say what you need first. | پہلے لکھیں یا بولیں کہ آپ کو کیا چاہیے۔ | Pehle likhein ya bolein ke aap ko kya chahiye. |
| `jobs.describe.tooShort` | Write at least {min} letters. | کم از کم {min} حروف لکھیں۔ | Kam az kam {min} huroof likhein. |
| `jobs.describe.addressTitle` | Please remove the house or street number | براہ کرم مکان یا گلی کا نمبر ہٹا دیں | Barah-e-karam makan ya gali ka number hata dein |
| `jobs.describe.address` | It looks like a house or street number. Please remove it; you will write your area in the next step. | لگتا ہے یہ مکان یا گلی کا نمبر ہے۔ براہ کرم اسے ہٹا دیں؛ اپنا علاقہ آپ اگلے قدم میں لکھیں گے۔ | Lagta hai yeh makan ya gali ka number hai. Barah-e-karam ise hata dein; apna ilaqa aap aglay qadam mein likhenge. |
| `jobs.new.title` | Describe a job | کام بتائیں | Kaam batayein |
| `jobs.new.lead` | Say what you need. The app suggests the details from your words; you check them and choose the worker yourself. | بتائیں کہ آپ کو کیا چاہیے۔ ایپ آپ کے الفاظ سے تفصیل تجویز کرتی ہے؛ آپ اسے جانچتے ہیں اور کاریگر خود چنتے ہیں۔ | Batayein ke aap ko kya chahiye. App aap ke alfaaz se tafseel tajweez karti hai; aap use jaanchte hain aur karigar khud chunte hain. |
| `jobs.new.steps` | Steps | قدم | Qadam |
| `jobs.new.step.describe` | What do you need? | آپ کو کیا چاہیے؟ | Aap ko kya chahiye? |
| `jobs.new.step.details` | Check the details | تفصیل جانچیں | Tafseel jaanchein |
| `jobs.new.step.save` | Save | محفوظ کریں | Mehfooz karein |
| `jobs.new.toDetails` | Next: check the details | آگے: تفصیل جانچیں | Aagay: tafseel jaanchein |
| `jobs.new.detailsLead` | We filled in what we found in your words. Change anything that is not right. | آپ کے الفاظ میں جو ملا وہ ہم نے بھر دیا ہے۔ جو درست نہیں، اسے بدل دیں۔ | Aap ke alfaaz mein jo mila woh hum ne bhar diya hai. Jo durust nahi, use badal dein. |
| `jobs.new.toSave` | Next: save | آگے: محفوظ کریں | Aagay: mehfooz karein |
| `jobs.new.wordsNote` | Your words are used for this request only. | آپ کے الفاظ صرف اسی درخواست کے لیے استعمال ہوتے ہیں۔ | Aap ke alfaaz sirf isi darkhwast ke liye istemaal hote hain. |
| `jobs.new.save` | Save the job request | کام کی درخواست محفوظ کریں | Kaam ki darkhwast mehfooz karein |
| `jobs.new.saved` | Job request {code} saved | کام کی درخواست {code} محفوظ ہو گئی | Kaam ki darkhwast {code} mehfooz ho gayi |
| `jobs.new.next` | Now choose a worker for this job. | اب اس کام کے لیے کاریگر چنیں۔ | Ab is kaam ke liye karigar chunein. |
| `jobs.new.unsaved` | Your job request is not saved yet. If you leave now, what you wrote is lost. | آپ کی کام کی درخواست ابھی محفوظ نہیں ہوئی۔ اگر آپ ابھی چلے گئے تو جو لکھا ہے وہ ختم ہو جائے گا۔ | Aap ki kaam ki darkhwast abhi mehfooz nahi hui. Agar aap abhi chale gaye to jo likha hai woh khatam ho jayega. |
| `jobs.form.trade` | Trade | شعبہ | Shoba |
| `jobs.form.tieTitle` | More than one trade | ایک سے زیادہ شعبے | Aik se zyada shobe |
| `jobs.form.tie` | Your words fit more than one trade. Choose the one you need first. | آپ کے الفاظ ایک سے زیادہ شعبوں سے ملتے ہیں۔ پہلے وہ شعبہ چنیں جو آپ کو چاہیے۔ | Aap ke alfaaz aik se zyada shobon se milte hain. Pehle woh shoba chunein jo aap ko chahiye. |
| `jobs.form.chooseTrade` | Choose the trade. | شعبہ چنیں۔ | Shoba chunein. |
| `jobs.form.skills` | Skills (choose up to {max}) | ہنر (زیادہ سے زیادہ {max} چنیں) | Hunar (zyada se zyada {max} chunein) |
| `jobs.form.skillLimit` | You can choose up to {max} skills. | آپ زیادہ سے زیادہ {max} ہنر چن سکتے ہیں۔ | Aap zyada se zyada {max} hunar chun sakte hain. |
| `jobs.form.skillsRemoved` | You chose another trade, so the skills of the other trade were removed. | آپ نے دوسرا شعبہ چنا، اس لیے پچھلے شعبے کے ہنر ہٹا دیے گئے۔ | Aap ne doosra shoba chuna, is liye pichhle shobe ke hunar hata diye gaye. |
| `jobs.form.kind` | Kind of work | کام کی نوعیت | Kaam ki nauiyat |
| `jobs.form.city` | City | شہر | Shehar |
| `jobs.form.whichCity` | Which city? | کون سا شہر؟ | Kaun sa shehar? |
| `jobs.form.area` | Area | علاقہ | Ilaqa |
| `jobs.form.areaHint` | Your neighbourhood, for example a sector or block. No house number. | آپ کا محلہ، مثلاً سیکٹر یا بلاک۔ مکان نمبر نہیں۔ | Aap ka mohalla, masalan sector ya block. Makan number nahi. |
| `jobs.form.day` | Day | دن | Din |
| `jobs.form.date` | Date | تاریخ | Tareekh |
| `jobs.form.time` | Time of day | وقت | Waqt |
| `jobs.form.urgent` | Urgent | فوری | Fori |
| `jobs.form.urgentHint` | Turn this on if the work cannot wait. | اگر کام انتظار نہیں کر سکتا تو اسے آن کریں۔ | Agar kaam intezar nahi kar sakta to ise on karein. |
| `jobs.form.fixMarked` | Please check the marked parts. | براہ کرم نشان زدہ حصے دیکھیں۔ | Barah-e-karam nishan zada hissay dekhein. |
| `jobs.form.needTrade` | Choose the trade. | شعبہ چنیں۔ | Shoba chunein. |
| `jobs.form.needCity` | Write the city. | شہر لکھیں۔ | Shehar likhein. |
| `jobs.form.needArea` | Write your area, for example a sector or block. | اپنا علاقہ لکھیں، مثلاً سیکٹر یا بلاک۔ | Apna ilaqa likhein, masalan sector ya block. |
| `jobs.form.needDate` | Choose the date. | تاریخ چنیں۔ | Tareekh chunein. |
| `jobs.mine.title` | My job requests | میری کام کی درخواستیں | Meri kaam ki darkhwastein |
| `jobs.mine.lead` | Jobs you described. Open one to choose a worker or to see the request you sent. | جو کام آپ نے بتائے۔ کاریگر چننے یا بھیجی ہوئی درخواست دیکھنے کے لیے کھولیں۔ | Jo kaam aap ne bataye. Karigar chunne ya bheji hui darkhwast dekhne ke liye kholein. |
| `jobs.mine.emptyActive` | No active job requests | کوئی جاری کام کی درخواست نہیں | Koi jaari kaam ki darkhwast nahi |
| `jobs.mine.empty` | Nothing here | یہاں کچھ نہیں | Yahan kuch nahi |
| `jobs.mine.emptyText` | Describe a job in your own words, then choose a worker for it. | اپنے الفاظ میں کام بتائیں، پھر اس کے لیے کاریگر چنیں۔ | Apne alfaaz mein kaam batayein, phir us ke liye karigar chunein. |
| `jobs.card.chooseWorker` | Choose a worker | کاریگر چنیں | Karigar chunein |
| `jobs.card.open` | See the job request | کام کی درخواست دیکھیں | Kaam ki darkhwast dekhein |
| `jobs.detail.back` | Back to my job requests | میری کام کی درخواستوں پر واپس | Meri kaam ki darkhwaston par wapas |
| `jobs.detail.notFound` | Job request not found | کام کی درخواست نہیں ملی | Kaam ki darkhwast nahi mili |
| `jobs.detail.notFoundText` | It may have been deleted, or it belongs to someone else. | شاید یہ حذف ہو گئی ہے، یا کسی اور کی ہے۔ | Shayad yeh hazf ho gayi hai, ya kisi aur ki hai. |
| `jobs.detail.closed` | Job request {code} closed | کام کی درخواست {code} بند ہو گئی | Kaam ki darkhwast {code} band ho gayi |
| `jobs.detail.deleted` | Job request {code} deleted | کام کی درخواست {code} حذف ہو گئی | Kaam ki darkhwast {code} hazf ho gayi |
| `jobs.detail.nextTitle` | Saved. The next step: | محفوظ ہو گئی۔ اگلا قدم: | Mehfooz ho gayi. Agla qadam: |
| `jobs.detail.saved` | Changes saved. | تبدیلیاں محفوظ ہو گئیں۔ | Tabdeeliyan mehfooz ho gayin. |
| `jobs.detail.rechecked` | Your new words were checked again: see "What the app understood from your words" below. | آپ کے نئے الفاظ دوبارہ جانچے گئے: نیچے "ایپ نے آپ کے الفاظ سے کیا سمجھا" دیکھیں۔ | Aap ke naye alfaaz dobara jaanche gaye: neeche "App ne aap ke alfaaz se kya samjha" dekhein. |
| `jobs.detail.details` | Job details | کام کی تفصیل | Kaam ki tafseel |
| `jobs.detail.openUntil` | Open until {date}. After that it expires if no worker was asked. | {date} تک کھلی ہے۔ اس کے بعد، اگر کسی کاریگر سے نہ پوچھا گیا، تو اس کی مدت ختم ہو جائے گی۔ | {date} tak khuli hai. Is ke baad, agar kisi karigar se na poocha gaya, to is ki muddat khatam ho jayegi. |
| `jobs.detail.closedOn` | Closed on {date}. Reason: {reason} | {date} کو بند کی گئی۔ وجہ: {reason} | {date} ko band ki gayi. Wajah: {reason} |
| `jobs.detail.workers` | Workers for this job | اس کام کے کاریگر | Is kaam ke karigar |
| `jobs.detail.edit` | Change the details | تفصیل بدلیں | Tafseel badlein |
| `jobs.detail.close` | Close the job request | کام کی درخواست بند کریں | Kaam ki darkhwast band karein |
| `jobs.detail.delete` | Delete | حذف کریں | Hazf karein |
| `jobs.detail.sent` | Requests sent from this job | اس کام سے بھیجی گئی درخواستیں | Is kaam se bheji gayi darkhwastein |
| `jobs.detail.sentEmpty` | No request sent yet. Choose a worker to send this job to. | ابھی کوئی درخواست نہیں بھیجی گئی۔ یہ کام بھیجنے کے لیے کاریگر چنیں۔ | Abhi koi darkhwast nahi bheji gayi. Yeh kaam bhejne ke liye karigar chunein. |
| `jobs.detail.workerLine` | {name} · Worker ID {code} | {name} · کاریگر آئی ڈی {code} | {name} · Karigar ID {code} |
| `jobs.close.title` | Close this job request? | یہ کام کی درخواست بند کریں؟ | Yeh kaam ki darkhwast band karein? |
| `jobs.close.intro` | Closing never changes a request you already sent: an accepted booking goes on. | بند کرنے سے بھیجی ہوئی درخواست نہیں بدلتی: قبول شدہ بکنگ جاری رہتی ہے۔ | Band karne se bheji hui darkhwast nahi badalti: qabool shuda booking jaari rehti hai. |
| `jobs.close.legend` | Why do you close it? | آپ اسے کیوں بند کر رہے ہیں؟ | Aap ise kyun band kar rahe hain? |
| `jobs.close.confirm` | Close the job request | کام کی درخواست بند کریں | Kaam ki darkhwast band karein |
| `jobs.close.choose` | Choose a reason. | کوئی وجہ چنیں۔ | Koi wajah chunein. |
| `jobs.close.reasons.work_done` | Work done | کام ہو گیا | Kaam ho gaya |
| `jobs.close.reasons.not_needed` | Not needed any more | اب ضرورت نہیں رہی | Ab zaroorat nahi rahi |
| `jobs.close.reasons.found_elsewhere` | Found someone elsewhere | کہیں اور سے کروا لیا | Kahin aur se karwa liya |
| `jobs.close.reasons.other` | Another reason | کوئی اور وجہ | Koi aur wajah |
| `jobs.delete.title` | Delete this job request? | یہ کام کی درخواست حذف کریں؟ | Yeh kaam ki darkhwast hazf karein? |
| `jobs.delete.text` | It is deleted for good. You can describe a new job at any time. | یہ ہمیشہ کے لیے حذف ہو جائے گی۔ آپ کسی بھی وقت نیا کام بتا سکتے ہیں۔ | Yeh hamesha ke liye hazf ho jayegi. Aap kisi bhi waqt naya kaam bata sakte hain. |
| `jobs.delete.confirm` | Delete | حذف کریں | Hazf karein |
| `jobs.understood.title` | What the app understood from your words | ایپ نے آپ کے الفاظ سے کیا سمجھا | App ne aap ke alfaaz se kya samjha |
| `jobs.understood.lead` | For each detail: what the app suggested from your words, and what you chose. | ہر تفصیل کے لیے: ایپ نے آپ کے الفاظ سے کیا تجویز کیا، اور آپ نے کیا چنا۔ | Har tafseel ke liye: app ne aap ke alfaaz se kya tajweez kiya, aur aap ne kya chuna. |
| `jobs.understood.field` | Detail | تفصیل | Tafseel |
| `jobs.understood.suggested` | Suggested | تجویز | Tajweez |
| `jobs.understood.chosen` | Your choice | آپ کا انتخاب | Aap ka intikhab |
| `jobs.understood.result` | Kept or changed | رکھا یا بدلا | Rakha ya badla |
| `jobs.understood.kept` | Kept | رکھا | Rakha |
| `jobs.understood.changed` | Changed | بدلا | Badla |
| `jobs.understood.none` | Nothing suggested | کوئی تجویز نہیں | Koi tajweez nahi |
| `jobs.understood.nothing` | — | — | — |
| `jobs.understood.tie` | More than one trade: {trades} | ایک سے زیادہ شعبے: {trades} | Aik se zyada shobe: {trades} |
| `jobs.understood.method` | Checked with: {method}. | جانچ کا طریقہ: {method}۔ | Jaanch ka tareeqa: {method}. |
| `jobs.understood.fields.category` | Trade | شعبہ | Shoba |
| `jobs.understood.fields.skills` | Skills | ہنر | Hunar |
| `jobs.understood.fields.taskType` | Kind of work | کام کی نوعیت | Kaam ki nauiyat |
| `jobs.understood.fields.city` | City | شہر | Shehar |
| `jobs.understood.fields.preferredDate` | Day | دن | Din |
| `jobs.understood.fields.timeSlot` | Time of day | وقت | Waqt |
| `jobs.understood.fields.urgent` | Urgent | فوری | Fori |
| `jobs.understood.fields.budget` | Budget | بجٹ | Budget |
| `jobs.understood.notes.no_trade_words` | No trade words were found in your words. | آپ کے الفاظ میں کسی شعبے کا لفظ نہیں ملا۔ | Aap ke alfaaz mein kisi shobe ka lafz nahi mila. |
| `jobs.understood.notes.negative_phrase` | Your words said that nothing is needed. | آپ کے الفاظ میں لکھا تھا کہ کچھ نہیں چاہیے۔ | Aap ke alfaaz mein likha tha ke kuch nahi chahiye. |
| `jobs.understood.notes.category_tie` | Your words fitted more than one trade, so you chose. | آپ کے الفاظ ایک سے زیادہ شعبوں سے ملتے تھے، اس لیے آپ نے چنا۔ | Aap ke alfaaz aik se zyada shobon se milte thay, is liye aap ne chuna. |
| `jobs.understood.notes.city_conflict` | Your words named two cities, so you chose. | آپ کے الفاظ میں دو شہر تھے، اس لیے آپ نے چنا۔ | Aap ke alfaaz mein do shehar thay, is liye aap ne chuna. |
| `jobs.understood.notes.budget_out_of_range` | The amount in your words was too small or too large to be a budget. | آپ کے الفاظ میں رقم بجٹ کے لیے بہت کم یا بہت زیادہ تھی۔ | Aap ke alfaaz mein raqam budget ke liye bohat kam ya bohat zyada thi. |
| `jobs.understood.notes.address_in_text` | Your words looked like they had a house or street number. | لگتا تھا آپ کے الفاظ میں مکان یا گلی کا نمبر ہے۔ | Lagta tha aap ke alfaaz mein makan ya gali ka number hai. |
| `jobs.edit.title` | Change the job request | کام کی درخواست بدلیں | Kaam ki darkhwast badlein |
| `jobs.edit.lead` | Change what is not right and press Save the changes. If you change your words, the app checks them again. | جو درست نہیں اسے بدلیں اور تبدیلیاں محفوظ کریں دبائیں۔ اگر آپ الفاظ بدلیں تو ایپ انہیں دوبارہ جانچتی ہے۔ | Jo durust nahi use badlein aur tabdeeliyan mehfooz karein dabayein. Agar aap alfaaz badlein to app unhein dobara jaanchti hai. |
| `jobs.edit.back` | Back to the job request | کام کی درخواست پر واپس | Kaam ki darkhwast par wapas |
| `jobs.edit.words` | Your words | آپ کے الفاظ | Aap ke alfaaz |
| `jobs.edit.wordsHint` | Do not write your phone number, house number or exact address. | اپنا فون نمبر، مکان نمبر یا پورا پتہ نہ لکھیں۔ | Apna phone number, makan number ya poora pata na likhein. |
| `jobs.edit.save` | Save the changes | تبدیلیاں محفوظ کریں | Tabdeeliyan mehfooz karein |
| `jobs.edit.changed` | This job request was changed just now | یہ کام کی درخواست ابھی ابھی بدلی گئی ہے | Yeh kaam ki darkhwast abhi abhi badli gayi hai |
| `jobs.edit.changedText` | Reload it to see the newest version, then make your change again. | نیا ورژن دیکھنے کے لیے دوبارہ کھولیں، پھر اپنی تبدیلی دوبارہ کریں۔ | Naya version dekhne ke liye dobara kholein, phir apni tabdeeli dobara karein. |
| `jobs.edit.reload` | Reload | دوبارہ کھولیں | Dobara kholein |
| `jobs.edit.unsaved` | Your changes are not saved yet. If you leave now, they are lost. | آپ کی تبدیلیاں ابھی محفوظ نہیں ہوئیں۔ اگر آپ ابھی چلے گئے تو یہ ختم ہو جائیں گی۔ | Aap ki tabdeeliyan abhi mehfooz nahi huin. Agar aap abhi chale gaye to yeh khatam ho jayengi. |
| `jobs.workers.back` | Back to the job request | کام کی درخواست پر واپس | Kaam ki darkhwast par wapas |
| `jobs.workers.jobLine` | For your job: {trade} · {city} | آپ کے کام کے لیے: {trade} · {city} | Aap ke kaam ke liye: {trade} · {city} |
| `jobs.workers.lead` | These are workers of this trade in your city, in the order you choose. The app does not rank them. | یہ آپ کے شہر میں اس شعبے کے کاریگر ہیں، آپ کی چنی ہوئی ترتیب میں۔ ایپ انہیں درجہ نہیں دیتی۔ | Yeh aap ke shehar mein is shobe ke karigar hain, aap ki chuni hui tarteeb mein. App unhein darja nahi deti. |
| `jobs.workers.truncated` | Showing the first 500 matching workers. | پہلے 500 ملتے جلتے کاریگر دکھائے جا رہے ہیں۔ | Pehle 500 milte julte karigar dikhaye ja rahe hain. |
| `jobs.workers.filters` | Order and filters | ترتیب اور فلٹر | Tarteeb aur filter |
| `jobs.workers.found.one` | {count} worker | {count} کاریگر | {count} karigar |
| `jobs.workers.found.other` | {count} workers | {count} کاریگر | {count} karigar |
| `jobs.workers.empty` | No workers of this trade in {city} yet. | {city} میں ابھی اس شعبے کا کوئی کاریگر نہیں۔ | {city} mein abhi is shobe ka koi karigar nahi. |
| `jobs.workers.emptyText` | You can search all workers, or change the city of the job request. | آپ سب کاریگر تلاش کر سکتے ہیں، یا کام کی درخواست کا شہر بدل سکتے ہیں۔ | Aap sab karigar dhoond sakte hain, ya kaam ki darkhwast ka shehar badal sakte hain. |
| `jobs.workers.search` | Search all workers | سب کاریگر تلاش کریں | Sab karigar dhoondein |
| `jobs.workers.editCity` | Change the city | شہر بدلیں | Shehar badlein |
| `jobs.workers.reasons` | Why {name} is listed | {name} یہاں کیوں ہیں | {name} yahan kyun hain |
| `jobs.workers.offers` | Offers: {skills} | یہ کام کرتے ہیں: {skills} | Yeh kaam karte hain: {skills} |
| `jobs.workers.sameCity` | Same city: {city} | ایک ہی شہر: {city} | Aik hi shehar: {city} |
| `jobs.workers.send` | Send this job | یہ کام بھیجیں | Yeh kaam bhejein |
| `jobs.workers.notOpen.done` | The work of this job is done, so no workers are listed. Describe a new job if you need more work. | اس کام کا کام ہو چکا ہے، اس لیے کاریگر نہیں دکھائے جاتے۔ مزید کام ہو تو نیا کام بتائیں۔ | Is kaam ka kaam ho chuka hai, is liye karigar nahi dikhaye jate. Mazeed kaam ho to naya kaam batayein. |
| `jobs.workers.notOpen.expired` | This job request expired, so no workers are listed. Describe the job again if you still need it. | اس کام کی درخواست کی مدت ختم ہو گئی ہے، اس لیے کاریگر نہیں دکھائے جاتے۔ اگر اب بھی ضرورت ہو تو کام دوبارہ بتائیں۔ | Is kaam ki darkhwast ki muddat khatam ho gayi hai, is liye karigar nahi dikhaye jate. Agar ab bhi zaroorat ho to kaam dobara batayein. |
| `jobs.workers.notOpen.closed` | You closed this job request, so no workers are listed. | آپ نے یہ کام کی درخواست بند کر دی ہے، اس لیے کاریگر نہیں دکھائے جاتے۔ | Aap ne yeh kaam ki darkhwast band kar di hai, is liye karigar nahi dikhaye jate. |
| `jobs.request.title` | Send your job to {name} | اپنا کام {name} کو بھیجیں | Apna kaam {name} ko bhejein |
| `jobs.request.lead` | Choose the work, the day and the time, and press Send. {name} answers yes or no. | کام، دن اور وقت چنیں، پھر بھیجیں دبائیں۔ {name} ہاں یا نہیں میں جواب دیں گے۔ | Kaam, din aur waqt chunein, phir bhejein dabayein. {name} haan ya nahi mein jawab denge. |
| `jobs.request.yourJob` | Your job | آپ کا کام | Aap ka kaam |
| `jobs.request.code` | Job request | کام کی درخواست | Kaam ki darkhwast |
| `jobs.request.jobLead` | These details come from your job request and go with the request. Change them on the job request page. | یہ تفصیل آپ کی کام کی درخواست سے ہے اور درخواست کے ساتھ جاتی ہے۔ اسے کام کی درخواست کے صفحے پر بدلیں۔ | Yeh tafseel aap ki kaam ki darkhwast se hai aur darkhwast ke saath jati hai. Ise kaam ki darkhwast ke safhe par badlein. |
| `jobs.request.backToWorkers` | Back to workers for this job | اس کام کے کاریگروں پر واپس | Is kaam ke karigaron par wapas |
| `jobs.request.skill` | Which of {name}'s skills fits this job? | {name} کا کون سا ہنر اس کام کے لیے ہے؟ | {name} ka kaun sa hunar is kaam ke liye hai? |
| `jobs.request.noSkill` | {name} offers no skill of this trade | {name} اس شعبے کا کوئی ہنر پیش نہیں کرتے | {name} is shobe ka koi hunar pesh nahi karte |
| `jobs.request.noSkillText` | Choose another worker for this job. | اس کام کے لیے کوئی اور کاریگر چنیں۔ | Is kaam ke liye koi aur karigar chunein. |
| `jobs.request.dateNote` | The day of your job request has passed or is not decided, so Tomorrow is chosen. Change it if you like. | آپ کی کام کی درخواست کا دن گزر چکا ہے یا طے نہیں، اس لیے کل چنا گیا ہے۔ چاہیں تو بدل دیں۔ | Aap ki kaam ki darkhwast ka din guzar chuka hai ya tay nahi, is liye kal chuna gaya hai. Chahein to badal dein. |
| `jobs.request.withWorkerTitle` | This job is already with a worker | یہ کام پہلے ہی ایک کاریگر کے پاس ہے | Yeh kaam pehle hi aik karigar ke paas hai |
| `jobs.request.withWorker` | This job is already with a worker. Wait for the answer or cancel that request first. | یہ کام پہلے ہی ایک کاریگر کے پاس ہے۔ جواب کا انتظار کریں یا پہلے وہ درخواست منسوخ کریں۔ | Yeh kaam pehle hi aik karigar ke paas hai. Jawab ka intezar karein ya pehle woh darkhwast mansookh karein. |
| `jobs.request.openRequest` | See the waiting request | انتظار والی درخواست دیکھیں | Intezar wali darkhwast dekhein |
| `jobs.request.notOpen` | This job request cannot be sent any more. Describe a new job if you still need the work. | یہ کام کی درخواست اب نہیں بھیجی جا سکتی۔ اگر کام اب بھی چاہیے تو نیا کام بتائیں۔ | Yeh kaam ki darkhwast ab nahi bheji ja sakti. Agar kaam ab bhi chahiye to naya kaam batayein. |
| `jobs.request.changed` | This job request was changed just now | یہ کام کی درخواست ابھی ابھی بدلی گئی ہے | Yeh kaam ki darkhwast abhi abhi badli gayi hai |
| `jobs.request.changedText` | Reload it to send the newest version. | نیا ورژن بھیجنے کے لیے دوبارہ کھولیں۔ | Naya version bhejne ke liye dobara kholein. |
| `jobs.request.sentText` | Your job was sent to {name}. You will see the answer in My bookings. | آپ کا کام {name} کو بھیج دیا گیا۔ جواب آپ میری بکنگز میں دیکھیں گے۔ | Aap ka kaam {name} ko bhej diya gaya. Jawab aap Meri bookings mein dekhenge. |
| `jobs.fromJob.line` | From job request {code} | کام کی درخواست {code} سے | Kaam ki darkhwast {code} se |
| `jobs.fromJob.kind` | Kind of work: {kind} | کام کی نوعیت: {kind} | Kaam ki nauiyat: {kind} |
| `jobs.guides.describeJob.title` | Describe a job | کام بتائیں | Kaam batayein |
| `jobs.guides.describeJob.steps` | Press Describe a job, then write or say the job in your own words, in any language.\|Press Check my words. The app looks for known words and suggests the details; it can be wrong.\|Check every detail and change what is not right. You choose the worker yourself.\|A job goes to one worker at a time, so nobody comes for nothing. If the worker says no, send it to another one.\|Your budget is private: only you and the admins see it, never a worker. | کام بتائیں دبائیں، پھر اپنے الفاظ میں کسی بھی زبان میں کام لکھیں یا بولیں۔\|میرے الفاظ جانچیں دبائیں۔ ایپ جانے پہچانے الفاظ ڈھونڈ کر تفصیل تجویز کرتی ہے؛ یہ غلط بھی ہو سکتی ہے۔\|ہر تفصیل جانچیں اور جو درست نہیں اسے بدلیں۔ کاریگر آپ خود چنتے ہیں۔\|کام ایک وقت میں ایک ہی کاریگر کو جاتا ہے، تاکہ کوئی بے کار نہ آئے۔ اگر کاریگر نہ کہے تو کسی اور کو بھیجیں۔\|آپ کا بجٹ نجی ہے: اسے صرف آپ اور ایڈمن دیکھتے ہیں، کاریگر کبھی نہیں۔ | Kaam batayein dabayein, phir apne alfaaz mein kisi bhi zubaan mein kaam likhein ya bolein.\|Mere alfaaz jaanchein dabayein. App jaane pehchane alfaaz dhoond kar tafseel tajweez karti hai; yeh ghalat bhi ho sakti hai.\|Har tafseel jaanchein aur jo durust nahi use badlein. Karigar aap khud chunte hain.\|Kaam aik waqt mein aik hi karigar ko jata hai, taake koi bekaar na aaye. Agar karigar na kahe to kisi aur ko bhejein.\|Aap ka budget niji hai: ise sirf aap aur admin dekhte hain, karigar kabhi nahi. |
| `jobs.admin.nav` | Job requests | کام کی درخواستیں | Kaam ki darkhwastein |
| `jobs.admin.title` | Job requests | کام کی درخواستیں | Kaam ki darkhwastein |
| `jobs.admin.lead` | Read-only. Customers' job requests, how the suggestions were used, and a box to try the analyzer. | صرف دیکھنے کے لیے۔ گاہکوں کی کام کی درخواستیں، تجاویز کیسے استعمال ہوئیں، اور تجزیہ کار آزمانے کا خانہ۔ | Sirf dekhne ke liye. Gahakon ki kaam ki darkhwastein, tajaweez kaise istemaal huin, aur tajziya kaar aazmane ka khana. |
| `jobs.admin.all` | All | سب | Sab |
| `jobs.admin.allTrades` | All trades | سب شعبے | Sab shobe |
| `jobs.admin.search` | Job request code | کام کی درخواست کا کوڈ | Kaam ki darkhwast ka code |
| `jobs.admin.find` | Find | تلاش کریں | Talash karein |
| `jobs.admin.count.one` | {count} job request | {count} کام کی درخواست | {count} kaam ki darkhwast |
| `jobs.admin.count.other` | {count} job requests | {count} کام کی درخواستیں | {count} kaam ki darkhwastein |
| `jobs.admin.open` | Open {code} | {code} کھولیں | {code} kholein |
| `jobs.admin.empty` | No job requests | کوئی کام کی درخواست نہیں | Koi kaam ki darkhwast nahi |
| `jobs.admin.emptyText` | Nothing matches these filters. | ان فلٹرز سے کچھ نہیں ملا۔ | In filters se kuch nahi mila. |
| `jobs.admin.columns.code` | Code | کوڈ | Code |
| `jobs.admin.columns.customer` | Customer | گاہک | Gahak |
| `jobs.admin.columns.state` | State | حالت | Halat |
| `jobs.admin.columns.bookings` | Requests sent | بھیجی گئی درخواستیں | Bheji gayi darkhwastein |
| `jobs.admin.columns.method` | Method | طریقہ | Tareeqa |
| `jobs.admin.columns.created` | Saved | محفوظ ہوئی | Mehfooz hui |
| `jobs.admin.inputMode.text` | Typed | لکھا ہوا | Likha hua |
| `jobs.admin.inputMode.voice` | Spoken | بولا ہوا | Bola hua |
| `jobs.admin.tabs.list` | Job requests | کام کی درخواستیں | Kaam ki darkhwastein |
| `jobs.admin.tabs.stats` | How suggestions were used | تجاویز کیسے استعمال ہوئیں | Tajaweez kaise istemaal huin |
| `jobs.admin.tabs.try` | Try the analyzer | تجزیہ کار آزمائیں | Tajziya kaar aazmayein |
| `jobs.admin.detail.customer` | Customer: {name} | گاہک: {name} | Gahak: {name} |
| `jobs.admin.detail.synthetic` | Synthetic demo data | مصنوعی ڈیمو ڈیٹا | Masnoi demo data |
| `jobs.admin.detail.analysis` | Suggested and chosen | تجویز اور انتخاب | Tajweez aur intikhab |
| `jobs.admin.detail.bookings` | Requests sent from this job | اس کام سے بھیجی گئی درخواستیں | Is kaam se bheji gayi darkhwastein |
| `jobs.admin.detail.noBookings` | No request sent. | کوئی درخواست نہیں بھیجی گئی۔ | Koi darkhwast nahi bheji gayi. |
| `jobs.admin.stats.days` | Period | مدت | Muddat |
| `jobs.admin.stats.lastDays` | Last {days} days | پچھلے {days} دن | Pichhle {days} din |
| `jobs.admin.stats.noteTitle` | Use, not correctness | استعمال، درستی نہیں | Istemaal, durusti nahi |
| `jobs.admin.stats.note` | This shows how customers used the suggestions, not whether they were correct. | یہ دکھاتا ہے کہ گاہکوں نے تجاویز کیسے استعمال کیں، یہ نہیں کہ وہ درست تھیں یا نہیں۔ | Yeh dikhata hai ke gahakon ne tajaweez kaise istemaal kin, yeh nahi ke woh durust thin ya nahi. |
| `jobs.admin.stats.empty` | No job requests in this period | اس مدت میں کوئی کام کی درخواست نہیں | Is muddat mein koi kaam ki darkhwast nahi |
| `jobs.admin.stats.emptyText` | Choose a longer period. | لمبی مدت چنیں۔ | Lambi muddat chunein. |
| `jobs.admin.stats.jobs.one` | {count} job request saved in the last {days} days | پچھلے {days} دنوں میں {count} کام کی درخواست محفوظ ہوئی | Pichhle {days} dinon mein {count} kaam ki darkhwast mehfooz hui |
| `jobs.admin.stats.jobs.other` | {count} job requests saved in the last {days} days | پچھلے {days} دنوں میں {count} کام کی درخواستیں محفوظ ہوئیں | Pichhle {days} dinon mein {count} kaam ki darkhwastein mehfooz huin |
| `jobs.admin.stats.kept` | Kept | رکھی گئی | Rakhi gayi |
| `jobs.admin.stats.changed` | Changed | بدلی گئی | Badli gayi |
| `jobs.admin.stats.notSuggested` | Not suggested | تجویز نہیں | Tajweez nahi |
| `jobs.admin.stats.split` | Split | تقسیم | Taqseem |
| `jobs.admin.stats.skills` | Skills the customers added: {added}. Suggested skills they removed: {removed}. | گاہکوں کے شامل کیے ہنر: {added}۔ تجویز کردہ ہنر جو انہوں نے ہٹائے: {removed}۔ | Gahakon ke shamil kiye hunar: {added}. Tajweez karda hunar jo unhon ne hataye: {removed}. |
| `jobs.admin.stats.byMethod` | By method | طریقے کے لحاظ سے | Tareeqe ke lihaz se |
| `jobs.admin.stats.byInputMode` | Typed or spoken | لکھا یا بولا | Likha ya bola |
| `jobs.admin.try.lead` | Type a job description to see what the analyzer suggests and which words led to it. Nothing is saved. | کام کی تفصیل لکھیں اور دیکھیں کہ تجزیہ کار کیا تجویز کرتا ہے اور کن الفاظ کی وجہ سے۔ کچھ محفوظ نہیں ہوتا۔ | Kaam ki tafseel likhein aur dekhein ke tajziya kaar kya tajweez karta hai aur kin alfaaz ki wajah se. Kuch mehfooz nahi hota. |
| `jobs.admin.try.label` | Job description | کام کی تفصیل | Kaam ki tafseel |
| `jobs.admin.try.run` | Show the suggestions | تجاویز دکھائیں | Tajaweez dikhayein |
| `jobs.admin.try.method` | Method: {method} (analyzer {analyzer}, word lists {phrases}). | طریقہ: {method} (تجزیہ کار {analyzer}، الفاظ کی فہرستیں {phrases})۔ | Tareeqa: {method} (tajziya kaar {analyzer}, alfaaz ki fehristein {phrases}). |
| `jobs.admin.try.suggestion` | Suggestion | تجویز | Tajweez |
| `jobs.admin.try.words` | Words that led to it | جن الفاظ سے یہ نکلی | Jin alfaaz se yeh nikli |
| `jobs.admin.try.nothingSaved` | Nothing was saved. These are suggestions; the customer confirms or changes every one. | کچھ محفوظ نہیں ہوا۔ یہ تجاویز ہیں؛ گاہک ہر ایک کی تصدیق کرتا ہے یا اسے بدلتا ہے۔ | Kuch mehfooz nahi hua. Yeh tajaweez hain; gahak har aik ki tasdeeq karta hai ya use badalta hai. |
| `jobs.admin.try.tie` | Tie: {trades} | برابر: {trades} | Barabar: {trades} |
| `jobs.admin.try.twoCities` | Two cities: the customer chooses | دو شہر: گاہک چنتا ہے | Do shehar: gahak chunta hai |
| `jobs.admin.try.fromTrade` | (usual for the trade) | (اس شعبے میں عام) | (is shobe mein aam) |
| `jobs.admin.try.yes` | Yes | ہاں | Haan |
| `jobs.admin.try.day.today` | Today | آج | Aaj |
| `jobs.admin.try.day.tomorrow` | Tomorrow | کل | Kal |
| `jobs.admin.try.day.day_after` | Day after tomorrow | پرسوں | Parson |
| `jobs.admin.try.rows.category` | Trade | شعبہ | Shoba |
| `jobs.admin.try.rows.skills` | Skills | ہنر | Hunar |
| `jobs.admin.try.rows.taskType` | Kind of work | کام کی نوعیت | Kaam ki nauiyat |
| `jobs.admin.try.rows.city` | City | شہر | Shehar |
| `jobs.admin.try.rows.day` | Day | دن | Din |
| `jobs.admin.try.rows.timeSlot` | Time of day | وقت | Waqt |
| `jobs.admin.try.rows.urgent` | Urgent | فوری | Fori |
| `jobs.admin.try.rows.budget` | Budget | بجٹ | Budget |
| `jobs.admin.try.rows.notes` | Notes | نوٹ | Notes |
| `jobs.admin.try.rows.missing` | Still needed | ابھی باقی | Abhi baqi |

## 2. Field help (`help.field.*`, 🔊 Listen under each field)

| Key | English | اردو | Roman Urdu |
|---|---|---|---|
| `help.field.jobs.describe` | Say or write the job in your own words, as you would tell a worker. Do not say your phone number or house number. | اپنے الفاظ میں کام بولیں یا لکھیں، جیسے کاریگر کو بتاتے ہیں۔ اپنا فون نمبر یا مکان نمبر نہ بتائیں۔ | Apne alfaaz mein kaam bolein ya likhein, jaise karigar ko batate hain. Apna phone number ya makan number na batayein. |
| `help.field.jobs.trade` | Choose the picture of the trade you need. The suggested one is already chosen; change it if it is wrong. | جس شعبے کا کام ہے اس کی تصویر چنیں۔ تجویز کردہ شعبہ پہلے سے چنا ہوا ہے؛ غلط ہو تو بدل دیں۔ | Jis shobe ka kaam hai us ki tasveer chunein. Tajweez karda shoba pehle se chuna hua hai; ghalat ho to badal dein. |
| `help.field.jobs.skills` | Tick the work you need, up to five. The suggested ones are ticked; you can change them. | جو کام چاہیے اس پر نشان لگائیں، زیادہ سے زیادہ پانچ۔ تجویز کردہ پر نشان لگا ہوا ہے؛ آپ بدل سکتے ہیں۔ | Jo kaam chahiye us par nishan lagayein, zyada se zyada paanch. Tajweez karda par nishan laga hua hai; aap badal sakte hain. |
| `help.field.jobs.kind` | Choose the kind of work: install, repair, service, new work, cleaning, moving or household help. Or Not sure. | کام کی نوعیت چنیں: لگوانا، مرمت، سروس، نیا کام، صفائی، سامان کی شفٹنگ یا گھریلو مدد۔ یا معلوم نہیں۔ | Kaam ki nauiyat chunein: lagwana, marammat, service, naya kaam, safai, saman ki shifting ya gharelu madad. Ya maloom nahi. |
| `help.field.jobs.city` | Write the city where the work is. | وہ شہر لکھیں جہاں کام ہے۔ | Woh shehar likhein jahan kaam hai. |
| `help.field.jobs.area` | Write your neighbourhood, for example a sector or block. Do not write the house number. | اپنا محلہ لکھیں، مثلاً سیکٹر یا بلاک۔ مکان نمبر نہ لکھیں۔ | Apna mohalla likhein, masalan sector ya block. Makan number na likhein. |
| `help.field.jobs.day` | Choose the day: today, tomorrow, a date, or not decided. | دن چنیں: آج، کل، کوئی تاریخ، یا ابھی طے نہیں۔ | Din chunein: aaj, kal, koi tareekh, ya abhi tay nahi. |
| `help.field.jobs.date` | Choose the day of the work, from today up to 30 days ahead. | کام کا دن چنیں، آج سے 30 دن آگے تک۔ | Kaam ka din chunein, aaj se 30 din aagay tak. |
| `help.field.jobs.time` | Choose the time of day, any time, or not decided. | دن کا وقت چنیں، کسی بھی وقت، یا ابھی طے نہیں۔ | Din ka waqt chunein, kisi bhi waqt, ya abhi tay nahi. |
| `help.field.jobs.urgent` | Turn this on if the work cannot wait. | اگر کام انتظار نہیں کر سکتا تو اسے آن کریں۔ | Agar kaam intezar nahi kar sakta to ise on karein. |
| `help.field.jobs.budgetAmount` | Optional. Write how much you want to pay, in rupees. Only you and the admins see it; workers never see it. | اختیاری۔ لکھیں کہ آپ کتنے روپے دینا چاہتے ہیں۔ اسے صرف آپ اور ایڈمن دیکھتے ہیں؛ کاریگر کبھی نہیں۔ | Ikhtiyari. Likhein ke aap kitne rupay dena chahte hain. Ise sirf aap aur admin dekhte hain; karigar kabhi nahi. |
| `help.field.jobs.budgetUnit` | Is your budget for the whole job, for each day or for each hour? | آپ کا بجٹ پورے کام کا ہے، روزانہ کا یا فی گھنٹہ؟ | Aap ka budget poore kaam ka hai, rozana ka ya fi ghanta? |
| `help.field.jobs.closeReason` | Choose why you close the job request. A request you already sent does not change. | چنیں کہ آپ کام کی درخواست کیوں بند کر رہے ہیں۔ بھیجی ہوئی درخواست نہیں بدلتی۔ | Chunein ke aap kaam ki darkhwast kyun band kar rahe hain. Bheji hui darkhwast nahi badalti. |
| `help.field.jobs.workersSort` | Choose the order of the list. The app does not rank the workers; you choose. | فہرست کی ترتیب چنیں۔ ایپ کاریگروں کو درجہ نہیں دیتی؛ آپ خود چنتے ہیں۔ | Fehrist ki tarteeb chunein. App karigaron ko darja nahi deti; aap khud chunte hain. |
| `help.field.jobs.workersAvailability` | Show all workers, or only those who are available, busy or offline. | سب کاریگر دکھائیں، یا صرف وہ جو دستیاب، مصروف یا آف لائن ہیں۔ | Sab karigar dikhayein, ya sirf woh jo dastiyab, masroof ya offline hain. |

## 3. Page help (`help.screen.*`, the round 🔊 button of each page)

| Key | English | اردو | Roman Urdu |
|---|---|---|---|
| `help.screen.describeJob` | Say or write the job in your own words. Press Check my words, check the details, then save. You choose the worker after that. | اپنے الفاظ میں کام بولیں یا لکھیں۔ میرے الفاظ جانچیں دبائیں، تفصیل جانچیں، پھر محفوظ کریں۔ اس کے بعد کاریگر آپ خود چنیں۔ | Apne alfaaz mein kaam bolein ya likhein. Mere alfaaz jaanchein dabayein, tafseel jaanchein, phir mehfooz karein. Is ke baad karigar aap khud chunein. |
| `help.screen.myJobRequests` | Your job requests. Open one to choose a worker, or to see the request you sent. | آپ کی کام کی درخواستیں۔ کاریگر چننے یا بھیجی ہوئی درخواست دیکھنے کے لیے ایک کھولیں۔ | Aap ki kaam ki darkhwastein. Karigar chunne ya bheji hui darkhwast dekhne ke liye aik kholein. |
| `help.screen.jobRequest` | One job request: the details, what you can do now, and the requests you sent from it. | ایک کام کی درخواست: تفصیل، آپ ابھی کیا کر سکتے ہیں، اور اس سے بھیجی گئی درخواستیں۔ | Aik kaam ki darkhwast: tafseel, aap abhi kya kar sakte hain, aur is se bheji gayi darkhwastein. |
| `help.screen.editJobRequest` | Change the details of your job request, then press Save the changes. | اپنی کام کی درخواست کی تفصیل بدلیں، پھر تبدیلیاں محفوظ کریں دبائیں۔ | Apni kaam ki darkhwast ki tafseel badlein, phir tabdeeliyan mehfooz karein dabayein. |
| `help.screen.jobWorkers` | Workers of this trade in your city. Choose the order you like, open a worker, and press Send this job. | آپ کے شہر میں اس شعبے کے کاریگر۔ اپنی پسند کی ترتیب چنیں، کاریگر کھولیں، اور یہ کام بھیجیں دبائیں۔ | Aap ke shehar mein is shobe ke karigar. Apni pasand ki tarteeb chunein, karigar kholein, aur yeh kaam bhejein dabayein. |

## 4. Picture-choice help (`help.option.*`, the small 🔊 on each picture)

| Key | English | اردو | Roman Urdu |
|---|---|---|---|
| `help.option.jobTask.install` | Install: fit something new. | لگوانا: کوئی نئی چیز لگوانی ہے۔ | Lagwana: koi nayi cheez lagwani hai. |
| `help.option.jobTask.repair` | Repair: something is broken or not working. | مرمت: کوئی چیز ٹوٹی ہے یا کام نہیں کر رہی۔ | Marammat: koi cheez tooti hai ya kaam nahi kar rahi. |
| `help.option.jobTask.service` | Service: routine care of something that works. | سروس: چلتی ہوئی چیز کی باقاعدہ دیکھ بھال۔ | Service: chalti hui cheez ki baqaida dekh bhaal. |
| `help.option.jobTask.new_work` | New work: build, make, paint or renovate. | نیا کام: بنوانا، رنگ کروانا یا نیا کروانا۔ | Naya kaam: banwana, rang karwana ya naya karwana. |
| `help.option.jobTask.cleaning` | Cleaning. | صفائی۔ | Safai. |
| `help.option.jobTask.moving` | Moving: shifting or loading things. | سامان کی شفٹنگ: سامان منتقل کرنا یا لادنا۔ | Saman ki shifting: saman muntaqil karna ya ladna. |
| `help.option.jobTask.household_help` | Household help: cooking, washing clothes, or care. | گھریلو مدد: کھانا پکانا، کپڑے دھونا، یا دیکھ بھال۔ | Gharelu madad: khana pakana, kapray dhona, ya dekh bhaal. |
| `help.option.jobTask.none` | Not sure: you can leave it open. | معلوم نہیں: آپ اسے خالی چھوڑ سکتے ہیں۔ | Maloom nahi: aap ise khali chhor sakte hain. |
| `help.option.jobDay.today` | Today. | آج۔ | Aaj. |
| `help.option.jobDay.tomorrow` | Tomorrow. | کل۔ | Kal. |
| `help.option.jobDay.pick` | Pick a date: choose the day in the box that opens. | تاریخ چنیں: کھلنے والے خانے میں دن چنیں۔ | Tareekh chunein: khulne wale khane mein din chunein. |
| `help.option.jobDay.none` | Not decided: you decide the day with the worker. | ابھی طے نہیں: دن آپ کاریگر کے ساتھ طے کریں گے۔ | Abhi tay nahi: din aap karigar ke saath tay karenge. |
| `help.option.jobTime.morning` | Morning. | صبح۔ | Subah. |
| `help.option.jobTime.afternoon` | Afternoon. | دوپہر۔ | Dopahar. |
| `help.option.jobTime.evening` | Evening. | شام۔ | Shaam. |
| `help.option.jobTime.any` | Any time of the day. | دن میں کسی بھی وقت۔ | Din mein kisi bhi waqt. |
| `help.option.jobTime.none` | Not decided: you decide the time with the worker. | ابھی طے نہیں: وقت آپ کاریگر کے ساتھ طے کریں گے۔ | Abhi tay nahi: waqt aap karigar ke saath tay karenge. |
| `help.option.jobClose.work_done` | Work done: the job is finished. | کام ہو گیا: کام مکمل ہے۔ | Kaam ho gaya: kaam mukammal hai. |
| `help.option.jobClose.not_needed` | Not needed any more. | اب ضرورت نہیں رہی۔ | Ab zaroorat nahi rahi. |
| `help.option.jobClose.found_elsewhere` | Found someone elsewhere. | کہیں اور سے کروا لیا۔ | Kahin aur se karwa liya. |
| `help.option.jobClose.other` | Another reason. | کوئی اور وجہ۔ | Koi aur wajah. |

## 5. The 14 error texts

Replaced with the second draft of A6 (24 Nov 2026): `docs/i18n/REVIEW-BATCH-8A.md` section 1.

## 6. Help texts that would need recorded clips (nothing recorded in this batch)

When the team records the Urdu (and English) help after Module 7, these new keys need a clip each, like the Batch 5
help texts (`frontend/src/features/assist/clipManifest.json`, `npm run audio:manifest`). Until then the device voice
reads them, or the text is shown.

- `help.field.jobs.describe`
- `help.field.jobs.trade`
- `help.field.jobs.skills`
- `help.field.jobs.kind`
- `help.field.jobs.city`
- `help.field.jobs.area`
- `help.field.jobs.day`
- `help.field.jobs.date`
- `help.field.jobs.time`
- `help.field.jobs.urgent`
- `help.field.jobs.budgetAmount`
- `help.field.jobs.budgetUnit`
- `help.field.jobs.closeReason`
- `help.field.jobs.workersSort`
- `help.field.jobs.workersAvailability`
- `help.screen.describeJob`
- `help.screen.myJobRequests`
- `help.screen.jobRequest`
- `help.screen.editJobRequest`
- `help.screen.jobWorkers`
- `help.option.jobTask.install`
- `help.option.jobTask.repair`
- `help.option.jobTask.service`
- `help.option.jobTask.new_work`
- `help.option.jobTask.cleaning`
- `help.option.jobTask.moving`
- `help.option.jobTask.household_help`
- `help.option.jobTask.none`
- `help.option.jobDay.today`
- `help.option.jobDay.tomorrow`
- `help.option.jobDay.pick`
- `help.option.jobDay.none`
- `help.option.jobTime.morning`
- `help.option.jobTime.afternoon`
- `help.option.jobTime.evening`
- `help.option.jobTime.any`
- `help.option.jobTime.none`
- `help.option.jobClose.work_done`
- `help.option.jobClose.not_needed`
- `help.option.jobClose.found_elsewhere`
- `help.option.jobClose.other`
- the Help Centre guide `jobs.guides.describeJob` (read with `help.centre.read`)

Counts: 342 texts in three languages; 42 help texts that would need a clip.
