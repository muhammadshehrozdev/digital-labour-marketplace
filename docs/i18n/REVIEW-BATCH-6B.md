# Batch 6B texts for team review (header, install, rep-2)

52 new texts and 6 changed existing texts, each in English, Urdu and Roman Urdu. Date: 2026-11-17.
Every Urdu and Roman Urdu text below is a **draft** written by Claude Code until a team member who reads Urdu has
checked it (D-031). 11 of them are help texts that can be recorded as clips (Clip = yes).

Please check that each text is everyday Urdu, short enough to be spoken, says the same thing in Urdu and Roman
Urdu (Roman Urdu users hear the Urdu audio), and uses neutral forms where a verb would show a gender.
Two points need a decision:

- The browser's own button names stay in English inside quotes ("Install app", "Add to Home Screen", "Add"), because
  that is what an English-language phone shows. Please check what an Urdu-language phone shows and choose.
- `booking.reasons.dispute.i_did_come` is now "میں نے حاضری دی تھی" / "Main ne hazri di thi" (gender-neutral: with
  "نے" the verb follows "حاضری", not the speaker). Please confirm.

**Clips to record:** the rows with "yes" are fixed help texts; they appear in the clip recorder (`/dev/recorder`,
development builds) under their keys. Texts with a value in braces are spoken by a device voice. Record Urdu first.

## Header (Part A) (2)

| Key | English | اردو (Urdu) | Roman Urdu | Clip / note | Checked by |
|---|---|---|---|---|---|
| `b6b.header.more` | More | مزید | Mazeed |  | |
| `b6b.header.moreMenu` | More settings: language, sound and text size | مزید ترتیبات: زبان، آواز اور لکھائی کا سائز | Mazeed tarteebat: zabaan, awaaz aur likhai ka size |  | |

## Install this app (Part B): on screen (23)

| Key | English | اردو (Urdu) | Roman Urdu | Clip / note | Checked by |
|---|---|---|---|---|---|
| `b6b.install.title` | Install the app | ایپ انسٹال کریں | App install karein |  | |
| `b6b.install.install` | Install | انسٹال کریں | Install karein |  | |
| `b6b.install.notNow` | Not now | ابھی نہیں | Abhi nahi |  | |
| `b6b.install.footerButton` | Install this app | یہ ایپ انسٹال کریں | Yeh app install karein |  | |
| `b6b.install.thanks` | Thank you! The app is being added. Look for it on your home screen. | شکریہ! ایپ شامل ہو رہی ہے۔ اسے اپنی ہوم اسکرین پر دیکھیں۔ | Shukriya! App shamil ho rahi hai. Isay apni home screen par dekhein. |  | |
| `b6b.install.stepsTitle` | How to install the app | ایپ انسٹال کرنے کا طریقہ | App install karne ka tareeqa |  | |
| `b6b.install.stepName` | Step {n} | مرحلہ {n} | Marhala {n} |  | |
| `b6b.install.done` | Done | ٹھیک ہے | Theek hai |  | |
| `b6b.install.linkLabel` | Link to this website | اس ویب سائٹ کا لنک | Is website ka link |  | |
| `b6b.install.copy` | Copy the link | لنک کاپی کریں | Link copy karein |  | |
| `b6b.install.copied` | Link copied | لنک کاپی ہو گیا | Link copy ho gaya |  | |
| `b6b.install.copyFailed` | The link could not be copied. Please copy it from the box. | لنک کاپی نہیں ہو سکا۔ براہِ کرم خانے سے کاپی کریں۔ | Link copy nahi ho saka. Baraye meharbani khanay se copy karein. |  | |
| `b6b.install.line` | Install the app: it opens like any other app on your phone and works with weak internet. | ایپ انسٹال کریں: یہ آپ کے فون پر باقی ایپس کی طرح کھلتی ہے اور کمزور انٹرنیٹ پر بھی چلتی ہے۔ | App install karein: yeh aap ke phone par baqi apps ki tarah khulti hai aur kamzor internet par bhi chalti hai. |  | |
| `b6b.install.chromium.intro` | Your browser has not offered the app yet. You can add it from the browser menu: | آپ کے براؤزر نے ابھی ایپ پیش نہیں کی۔ آپ اسے براؤزر کے مینو سے شامل کر سکتے ہیں: | Aap ke browser ne abhi app pesh nahi ki. Aap isay browser ke menu se shamil kar saktay hain: |  | |
| `b6b.install.chromium.step1` | Open the browser menu: the three dots ⋮ at the top. | براؤزر کا مینو کھولیں: اوپر والے تین نقطے ⋮۔ | Browser ka menu kholein: upar walay teen nuqte ⋮. |  | |
| `b6b.install.chromium.step2` | Choose "Install app" or "Add to Home screen". On a computer it can be under "Cast, save and share". | "Install app" یا "Add to Home screen" چنیں۔ کمپیوٹر پر یہ "Cast, save and share" کے اندر ہو سکتا ہے۔ | "Install app" ya "Add to Home screen" chunein. Computer par yeh "Cast, save and share" ke andar ho sakta hai. |  | |
| `b6b.install.chromium.step3` | Press "Install". The app appears on your home screen or desktop. | "Install" دبائیں۔ ایپ آپ کی ہوم اسکرین یا ڈیسک ٹاپ پر آ جائے گی۔ | "Install" dabayein. App aap ki home screen ya desktop par aa jaye gi. |  | |
| `b6b.install.iosSafari.intro` | On iPhone and iPad, Safari adds the app in three steps: | آئی فون اور آئی پیڈ پر سفاری تین مرحلوں میں ایپ شامل کرتا ہے: | iPhone aur iPad par Safari teen marhalon mein app shamil karta hai: |  | |
| `b6b.install.iosSafari.step1` | Press the Share button: a square with an arrow pointing up. On iPhone it is at the bottom, on iPad at the top. | شیئر کا بٹن دبائیں: ایک چوکور جس میں اوپر کی طرف تیر ہے۔ آئی فون پر یہ نیچے ہوتا ہے، آئی پیڈ پر اوپر۔ | Share ka button dabayein: ek chokor jis mein upar ki taraf teer hai. iPhone par yeh neeche hota hai, iPad par upar. |  | |
| `b6b.install.iosSafari.step2` | Scroll down and choose "Add to Home Screen". | نیچے جائیں اور "Add to Home Screen" چنیں۔ | Neeche jayein aur "Add to Home Screen" chunein. |  | |
| `b6b.install.iosSafari.step3` | Press "Add". The app appears on your home screen. | "Add" دبائیں۔ ایپ آپ کی ہوم اسکرین پر آ جائے گی۔ | "Add" dabayein. App aap ki home screen par aa jaye gi. |  | |
| `b6b.install.iosOther.intro` | Open this page in Safari to install the app. On iPhone and iPad, other browsers cannot install apps. | ایپ انسٹال کرنے کے لیے یہ صفحہ سفاری میں کھولیں۔ آئی فون اور آئی پیڈ پر دوسرے براؤزر ایپ انسٹال نہیں کر سکتے۔ | App install karne ke liye yeh safha Safari mein kholein. iPhone aur iPad par doosray browser app install nahi kar saktay. |  | |
| `b6b.install.other.intro` | Installing works in Chrome or Edge. Open this link there: | انسٹال کرنا کروم یا ایج میں ہوتا ہے۔ یہ لنک وہاں کھولیں: | Install karna Chrome ya Edge mein hota hai. Yeh link wahan kholein: |  | |

## Install this app: heard (🔊) — recordable help texts (11)

| Key | English | اردو (Urdu) | Roman Urdu | Clip / note | Checked by |
|---|---|---|---|---|---|
| `help.option.install.line` | Install the app: it opens like any other app on your phone and works with weak internet. | ایپ انسٹال کریں: یہ آپ کے فون پر باقی ایپس کی طرح کھلتی ہے اور کمزور انٹرنیٹ پر بھی چلتی ہے۔ | App install karein: yeh aap ke phone par baqi apps ki tarah khulti hai aur kamzor internet par bhi chalti hai. | yes | |
| `help.option.install.chromium.intro` | Your browser has not offered the app yet. You can add it from the browser menu: | آپ کے براؤزر نے ابھی ایپ پیش نہیں کی۔ آپ اسے براؤزر کے مینو سے شامل کر سکتے ہیں: | Aap ke browser ne abhi app pesh nahi ki. Aap isay browser ke menu se shamil kar saktay hain: | yes | |
| `help.option.install.chromium.step1` | Open the browser menu: the three dots ⋮ at the top. | براؤزر کا مینو کھولیں: اوپر والے تین نقطے ⋮۔ | Browser ka menu kholein: upar walay teen nuqte ⋮. | yes | |
| `help.option.install.chromium.step2` | Choose "Install app" or "Add to Home screen". On a computer it can be under "Cast, save and share". | "Install app" یا "Add to Home screen" چنیں۔ کمپیوٹر پر یہ "Cast, save and share" کے اندر ہو سکتا ہے۔ | "Install app" ya "Add to Home screen" chunein. Computer par yeh "Cast, save and share" ke andar ho sakta hai. | yes | |
| `help.option.install.chromium.step3` | Press "Install". The app appears on your home screen or desktop. | "Install" دبائیں۔ ایپ آپ کی ہوم اسکرین یا ڈیسک ٹاپ پر آ جائے گی۔ | "Install" dabayein. App aap ki home screen ya desktop par aa jaye gi. | yes | |
| `help.option.install.iosSafari.intro` | On iPhone and iPad, Safari adds the app in three steps: | آئی فون اور آئی پیڈ پر سفاری تین مرحلوں میں ایپ شامل کرتا ہے: | iPhone aur iPad par Safari teen marhalon mein app shamil karta hai: | yes | |
| `help.option.install.iosSafari.step1` | Press the Share button: a square with an arrow pointing up. On iPhone it is at the bottom, on iPad at the top. | شیئر کا بٹن دبائیں: ایک چوکور جس میں اوپر کی طرف تیر ہے۔ آئی فون پر یہ نیچے ہوتا ہے، آئی پیڈ پر اوپر۔ | Share ka button dabayein: ek chokor jis mein upar ki taraf teer hai. iPhone par yeh neeche hota hai, iPad par upar. | yes | |
| `help.option.install.iosSafari.step2` | Scroll down and choose "Add to Home Screen". | نیچے جائیں اور "Add to Home Screen" چنیں۔ | Neeche jayein aur "Add to Home Screen" chunein. | yes | |
| `help.option.install.iosSafari.step3` | Press "Add". The app appears on your home screen. | "Add" دبائیں۔ ایپ آپ کی ہوم اسکرین پر آ جائے گی۔ | "Add" dabayein. App aap ki home screen par aa jaye gi. | yes | |
| `help.option.install.iosOther.intro` | Open this page in Safari to install the app. On iPhone and iPad, other browsers cannot install apps. | ایپ انسٹال کرنے کے لیے یہ صفحہ سفاری میں کھولیں۔ آئی فون اور آئی پیڈ پر دوسرے براؤزر ایپ انسٹال نہیں کر سکتے۔ | App install karne ke liye yeh safha Safari mein kholein. iPhone aur iPad par doosray browser app install nahi kar saktay. | yes | |
| `help.option.install.other.intro` | Installing works in Chrome or Edge. Open this link there: | انسٹال کرنا کروم یا ایج میں ہوتا ہے۔ یہ لنک وہاں کھولیں: | Install karna Chrome ya Edge mein hota hai. Yeh link wahan kholein: | yes | |

## rep-2 (Part C): My reputation rules, numbers, reasons, Help Centre guide, admin (16)

| Key | English | اردو (Urdu) | Roman Urdu | Clip / note | Checked by |
|---|---|---|---|---|---|
| `b6b.reputation.rules.newAccounts.title` | New customer accounts: counted, with a limit | نئے گاہک اکاؤنٹ: گنے جاتے ہیں، ایک حد تک | Naye gaahak account: ginay jatay hain, ek had tak |  | |
| `b6b.reputation.rules.newAccounts.text` | one: Reviews from brand-new customer accounts count, but all of them together count as at most {count} review. · other: Reviews from brand-new customer accounts count, but all of them together count as at most {count} reviews. | one: بالکل نئے گاہک اکاؤنٹس کے ریویو گنے جاتے ہیں، لیکن سب مل کر زیادہ سے زیادہ {count} ریویو کے برابر گنے جاتے ہیں۔ · other: بالکل نئے گاہک اکاؤنٹس کے ریویو گنے جاتے ہیں، لیکن سب مل کر زیادہ سے زیادہ {count} ریویوز کے برابر گنے جاتے ہیں۔ | one: Bilkul naye gaahak accounts ke review ginay jatay hain, lekin sab mil kar zyada se zyada {count} review ke barabar ginay jatay hain. · other: Bilkul naye gaahak accounts ke review ginay jatay hain, lekin sab mil kar zyada se zyada {count} reviews ke barabar ginay jatay hain. |  | |
| `b6b.reputation.rules.burst.title` | Many reviews in a few days | چند دنوں میں بہت سے ریویو | Chand dinon mein bohat se review |  | |
| `b6b.reputation.rules.burst.text` | Many reviews in a few days count less: when {count} or more arrive within {days} days, each of them counts half. | چند دنوں میں بہت سے ریویو کم گنے جاتے ہیں: جب {days} دن کے اندر {count} یا زیادہ آئیں تو ہر ایک آدھا گنا جاتا ہے۔ | Chand dinon mein bohat se review kam ginay jatay hain: jab {days} din ke andar {count} ya zyada aayein to har ek aadha gina jata hai. |  | |
| `b6b.reputation.rules.lateCancel.title` | Cancel early | جلدی منسوخ کریں | Jaldi mansookh karein |  | |
| `b6b.reputation.rules.lateCancel.text` | A late cancellation counts double: cancel at least {hours} hours before. | دیر سے منسوخی دگنی گنی جاتی ہے: کم از کم {hours} گھنٹے پہلے منسوخ کریں۔ | Der se mansookhi dugni gini jati hai: kam az kam {hours} ghantay pehle mansookh karein. |  | |
| `b6b.reputation.mine.expected` | Reputation score: {value} out of 1 (the middle estimate from your counted reviews). "Best track record" orders by this score. | ساکھ کا اسکور: 1 میں سے {value} (آپ کے گنے گئے ریویوز سے درمیانی اندازہ)۔ "بہترین ریکارڈ" اسی اسکور سے ترتیب دیتا ہے۔ | Saakh ka score: 1 mein se {value} (aap ke ginay gaye reviews se darmiyani andaza). "Behtareen record" isi score se tarteeb deta hai. |  | |
| `b6b.reputation.mine.cautious` | Careful score: {value} out of 1. We are about 90% sure your true score is at least this. | محتاط اسکور: 1 میں سے {value}۔ ہمیں تقریباً 90% یقین ہے کہ آپ کا اصل اسکور کم از کم اتنا ہے۔ | Mohtaat score: 1 mein se {value}. Hamein taqreeban 90% yaqeen hai ke aap ka asal score kam az kam itna hai. |  | |
| `b6b.reputation.reason.newReviewerBudget` | one: Counted less: a first-time customer account. All such reviews together count as {count} review. · other: Counted less: a first-time customer account. All such reviews together count as {count} reviews. | one: کم گنا گیا: پہلی بار کا گاہک اکاؤنٹ۔ ایسے سب ریویو مل کر {count} ریویو کے برابر گنے جاتے ہیں۔ · other: کم گنا گیا: پہلی بار کا گاہک اکاؤنٹ۔ ایسے سب ریویو مل کر {count} ریویوز کے برابر گنے جاتے ہیں۔ | one: Kam gina gaya: pehli baar ka gaahak account. Aise sab review mil kar {count} review ke barabar ginay jatay hain. · other: Kam gina gaya: pehli baar ka gaahak account. Aise sab review mil kar {count} reviews ke barabar ginay jatay hain. |  | |
| `b6b.reputation.reason.burst` | Counted half: one of many reviews within a few days. | آدھا گنا گیا: چند دنوں کے اندر بہت سے ریویوز میں سے ایک۔ | Aadha gina gaya: chand dinon ke andar bohat se reviews mein se ek. |  | |
| `b6b.reputation.guide.onlyCustomers` | Only customers who finished a job with you can review you. | صرف وہ گاہک ریویو دے سکتے ہیں جن کا آپ کے ساتھ کام مکمل ہوا۔ | Sirf woh gaahak review de saktay hain jin ka aap ke saath kaam mukammal hua. |  | |
| `b6b.reputation.guide.sameCustomer` | Many reviews from the same customer count less each time. | ایک ہی گاہک کے بہت سے ریویو ہر بار کم گنے جاتے ہیں۔ | Ek hi gaahak ke bohat se review har baar kam ginay jatay hain. |  | |
| `b6b.reputation.guide.newAccounts` | one: Reviews from brand-new customer accounts count, but all of them together count as at most {count} review. · other: Reviews from brand-new customer accounts count, but all of them together count as at most {count} reviews. | one: بالکل نئے گاہک اکاؤنٹس کے ریویو گنے جاتے ہیں، لیکن سب مل کر زیادہ سے زیادہ {count} ریویو کے برابر۔ · other: بالکل نئے گاہک اکاؤنٹس کے ریویو گنے جاتے ہیں، لیکن سب مل کر زیادہ سے زیادہ {count} ریویوز کے برابر۔ | one: Bilkul naye gaahak accounts ke review ginay jatay hain, lekin sab mil kar zyada se zyada {count} review ke barabar. · other: Bilkul naye gaahak accounts ke review ginay jatay hain, lekin sab mil kar zyada se zyada {count} reviews ke barabar. |  | |
| `b6b.reputation.guide.burst` | Many reviews in a few days count less. | چند دنوں میں بہت سے ریویو کم گنے جاتے ہیں۔ | Chand dinon mein bohat se review kam ginay jatay hain. |  | |
| `b6b.reputation.guide.lateCancel` | A late cancellation counts double: cancel at least a day before. | دیر سے منسوخی دگنی گنی جاتی ہے: کم از کم ایک دن پہلے منسوخ کریں۔ | Der se mansookhi dugni gini jati hai: kam az kam ek din pehle mansookh karein. |  | |
| `b6b.reputation.admin.factorValues` | provenance {provenance} · new-account budget {budget} · burst {burst} · pair {pair} | تصدیق {provenance} · نئے اکاؤنٹ کی حد {budget} · جھرمٹ {burst} · جوڑی {pair} | tasdeeq {provenance} · naye account ki had {budget} · jhurmat {burst} · jori {pair} |  | |

## Changed existing texts (6)

| Key | English | اردو (Urdu) | Roman Urdu | Why it changed | Checked by |
|---|---|---|---|---|---|
| `appx.help.guides.install.steps` | Press "Install this app" at the bottom of any page. / Android, or a computer with Chrome or Edge: press "Install" in the question that opens. If no question opens, open the browser menu ⋮ and choose "Install app" or "Add to Home screen". / iPhone and iPad: open the website in Safari, press Share, then "Add to Home Screen", then "Add". / No website can install itself: you always press "Install" yourself. The app opens without the browser bar; you still need the internet to see and save data. | کسی بھی صفحے کے نیچے "یہ ایپ انسٹال کریں" دبائیں۔ / اینڈرائیڈ، یا کروم یا ایج والا کمپیوٹر: جو سوال کھلے اس میں "Install" دبائیں۔ اگر کوئی سوال نہ کھلے تو براؤزر کا مینو ⋮ کھولیں اور "ایپ انسٹال کریں" یا "ہوم اسکرین میں شامل کریں" چنیں۔ / آئی فون اور آئی پیڈ: ویب سائٹ سفاری میں کھولیں، شیئر دبائیں، پھر "Add to Home Screen"، پھر "Add"۔ / کوئی ویب سائٹ خود کو انسٹال نہیں کر سکتی: "Install" ہمیشہ آپ خود دباتے ہیں۔ ایپ براؤزر بار کے بغیر کھلتی ہے؛ ڈیٹا دیکھنے اور محفوظ کرنے کے لیے انٹرنیٹ پھر بھی ضروری ہے۔ | Kisi bhi safhay ke neeche "Yeh app install karein" dabayein. / Android, ya Chrome ya Edge wala computer: jo sawal khulay us mein "Install" dabayein. Agar koi sawal na khulay to browser ka menu ⋮ kholein aur "Install app" ya "Add to Home screen" chunein. / iPhone aur iPad: website Safari mein kholein, Share dabayein, phir "Add to Home Screen", phir "Add". / Koi website khud ko install nahi kar sakti: "Install" hamesha aap khud dabatay hain. App browser bar ke baghair khulti hai; data dekhne aur mehfooz karne ke liye internet phir bhi zaroori hai. | Help Centre install guide rewritten: the footer button, Chrome/Edge, iPhone Safari, "no website can install itself" | |
| `help.option.disputeReason.i_did_come` | I did come to the work. | میں نے کام پر حاضری دی تھی۔ | Main ne kaam par hazri di thi. | gender-neutral Urdu (BATCH_6B §6); English unchanged | |
| `booking.reasons.dispute.i_did_come` | I did come | میں نے حاضری دی تھی | Main ne hazri di thi | gender-neutral Urdu: "میں نے حاضری دی تھی" — with نے the verb follows حاضری, not the speaker | |
| `reputation.sortTrackNote` | New workers start at the typical rating of this website, so they appear in the middle of this order. Choose "Recently updated" to see the newest. | نئے کاریگر اس ویب سائٹ کی عام ریٹنگ سے شروع ہوتے ہیں، اس لیے وہ اس ترتیب کے درمیان میں نظر آتے ہیں۔ سب سے نئے دیکھنے کے لیے "حال ہی میں اپ ڈیٹ ہوئے" چنیں۔ | Naye karigar is website ki aam rating se shuru hotay hain, is liye woh is tarteeb ke darmiyan mein nazar aatay hain. Sab se naye dekhne ke liye "Haal hi mein update hue" chunein. | rep-2: new workers start at the typical rating, so they appear in the middle (was: "appear lower") | |
| `adminm4.breakdown.expected` | Expected (reputation; orders "Best track record") | متوقع (ساکھ؛ "بہترین ریکارڈ" کی ترتیب) | Mutawaqqa (saakh; "Behtareen record" ki tarteeb) | rep-2 orders "Best track record" by expected | |
| `adminm4.breakdown.cautious` | Cautious score | محتاط اسکور | Mohtaat score | no longer the ordering number | |
