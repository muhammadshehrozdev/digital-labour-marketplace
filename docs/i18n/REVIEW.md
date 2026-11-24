# Urdu and Roman Urdu texts: review list

**Status: reviewed by the team on 11 Nov 2026 (decision D-031).** The texts were first written as drafts
(Batch 3, 10 Nov 2026). Texts added or changed after that review must be checked the same way: read the
row, write your name in "Checked by" when it is right, and correct the text in the file named in the section title
(`frontend/src/i18n/dictionaries/ur.js`, `ur-Latn.js`, `frontend/src/i18n/languages.js`, or
`backend/config/skillTaxonomy.js`). Then run `node scripts/i18n-review.mjs` in `.\frontend` to update this file.

What to check: simple, everyday words for a worker with basic reading skills; short sentences; correct
spelling; Roman Urdu spelled the way people type it on WhatsApp. Placeholders such as `{name}` and
`{count}` must stay exactly as they are. Digits stay Western (0-9).

1573 texts in total (generated from the source files; not hand-copied).

## Website texts: `app`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| app.name | Digital Labour Marketplace | ڈیجیٹل لیبر مارکیٹ پلیس | Digital Labour Marketplace | |
| app.home | Digital Labour Marketplace, home | ڈیجیٹل لیبر مارکیٹ پلیس، ہوم پیج | Digital Labour Marketplace, home page | |
| app.skipToContent | Skip to content | سیدھا مواد پر جائیں | Seedha content par jayein | |
| app.loading | Loading… | لوڈ ہو رہا ہے… | Load ho raha hai… | |
| app.description | Skilled workers build trusted profiles; customers find electricians, plumbers, painters and more. | ہنر مند کاریگر بھروسے والی پروفائل بناتے ہیں؛ گاہک الیکٹریشن، پلمبر، پینٹر اور دوسرے کاریگر ڈھونڈتے ہیں۔ | Hunarmand karigar bharosay wali profile banate hain; customer electrician, plumber, painter aur doosray karigar dhoondte hain. | |

## Website texts: `language`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| language.label | Language | زبان | Zabaan | |
| language.change | Change language. Current language: {name} | زبان بدلیں۔ ابھی کی زبان: {name} | Zabaan badlein. Abhi ki zabaan: {name} | |
| language.loadFailed | This language could not be loaded. Please check your internet connection and try again. | یہ زبان لوڈ نہیں ہو سکی۔ انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔ | Yeh zabaan load nahi ho saki. Internet check karein aur dobara koshish karein. | |
| language.savedHereOnly | Language changed on this device. It could not be saved to your account right now. | اس ڈیوائس پر زبان بدل گئی ہے۔ ابھی آپ کے اکاؤنٹ میں محفوظ نہیں ہو سکی۔ | Is device par zabaan badal gayi hai. Abhi aap ke account mein save nahi ho saki. | |

## Website texts: `common`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| common.save | Save | محفوظ کریں | Save karein | |
| common.cancel | Cancel | منسوخ | Cancel | |
| common.back | Back | واپس | Wapas | |
| common.continue | Continue | آگے بڑھیں | Aagay barhein | |
| common.close | Close | بند کریں | Band karein | |
| common.next | Next | اگلا | Agla | |
| common.previous | Previous | پچھلا | Pichla | |
| common.edit | Edit | تبدیل کریں | Badlein | |
| common.remove | Remove | ہٹائیں | Hatayein | |
| common.search | Search | تلاش | Talaash | |
| common.tryAgain | Try again | دوبارہ کوشش کریں | Dobara koshish karein | |
| common.clear | Clear | صاف کریں | Saaf karein | |
| common.clearAll | Clear all | سب صاف کریں | Sab saaf karein | |
| common.apply | Apply | لاگو کریں | Lagu karein | |
| common.open | Open | کھولیں | Kholein | |
| common.required | (required) | (ضروری) | (zaroori) | |
| common.done | (done) | (مکمل) | (mukammal) | |
| common.toDo | (to do) | (باقی ہے) | (baqi hai) | |
| common.empty | — | — | — | |
| common.loading | Loading… | لوڈ ہو رہا ہے… | Load ho raha hai… | |
| common.dismiss | Dismiss message | پیغام بند کریں | Paigham band karein | |
| common.rupees | Rs {amount} | Rs {amount} | Rs {amount} | |
| common.years | one: {count} year / other: {count} years | one: {count} سال / other: {count} سال | one: {count} saal / other: {count} saal | |
| common.yearsShort | {count} yrs | {count} سال | {count} saal | |
| common.months | one: {count} month / other: {count} months | one: {count} مہینہ / other: {count} مہینے | one: {count} mahina / other: {count} mahinay | |
| common.worker | Worker | کاریگر | Karigar | |
| common.listSeparator | ,  | ،  | ,  | |

## Website texts: `roles`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| roles.worker | Worker | کاریگر | Karigar | |
| roles.customer | Customer | گاہک | Customer | |
| roles.admin | Admin | ایڈمن | Admin | |

## Website texts: `nav`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| nav.main | Main | مین مینو | Main menu | |
| nav.home | Home page | ہوم پیج | Home page | |
| nav.notifications | Notifications | اطلاعات | Ittelaat | |
| nav.saved | Saved workers | محفوظ کاریگر | Mehfooz karigar | |
| nav.compare | Compare workers | کاریگروں کا موازنہ | Karigaron ka muwazna | |
| nav.help | Help centre | مدد | Madad | |
| nav.dashboard | Dashboard | ڈیش بورڈ | Dashboard | |
| nav.myProfile | My profile | میری پروفائل | Meri profile | |
| nav.findWorkers | Find workers | کاریگر تلاش کریں | Karigar dhoondein | |
| nav.admin | Admin | ایڈمن | Admin | |
| nav.openMenu | Open menu | مینو کھولیں | Menu kholein | |
| nav.closeMenu | Close menu | مینو بند کریں | Menu band karein | |

## Website texts: `header`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| header.accountMenu | Account menu | اکاؤنٹ مینو | Account menu | |
| header.signedInAs | Signed in as | لاگ ان: | Login: | |
| header.logout | Log out | لاگ آؤٹ | Log out | |
| header.login | Log in | لاگ ان | Log in | |
| header.createAccount | Create account | اکاؤنٹ بنائیں | Account banayein | |

## Website texts: `footer`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| footer.description | A marketplace where skilled workers build trusted profiles, and customers can see what has really been checked. | ایک مارکیٹ پلیس جہاں ہنر مند کاریگر بھروسے والی پروفائل بناتے ہیں، اور گاہک دیکھ سکتے ہیں کہ اصل میں کیا چیک ہوا ہے۔ | Aik marketplace jahan hunarmand karigar bharosay wali profile banate hain, aur customer dekh sakte hain ke asal mein kya check hua hai. | |
| footer.project | Final Year Project, BS Software Engineering, SZABIST Islamabad. | فائنل ایئر پروجیکٹ، بی ایس سافٹ ویئر انجینئرنگ، زیبسٹ (SZABIST) اسلام آباد۔ | Final Year Project, BS Software Engineering, SZABIST Islamabad. | |
| footer.team | Team | ٹیم | Team | |
| footer.supervisor | Supervisor | سپروائزر | Supervisor | |
| footer.languageTitle | Language | زبان | Zabaan | |

## Website texts: `titles`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| titles.home | Skilled work, verified | ہنر مند کام، تصدیق شدہ | Hunarmand kaam, tasdeeq shuda | |
| titles.chooser | Choose your language | اپنی زبان چنیں | Apni zabaan chunein | |
| titles.login | Log in | لاگ ان | Log in | |
| titles.register | Create account | اکاؤنٹ بنائیں | Account banayein | |
| titles.onboarding | Set up your profile | اپنی پروفائل بنائیں | Apni profile banayein | |
| titles.dashboard | Dashboard | ڈیش بورڈ | Dashboard | |
| titles.profile | My profile | میری پروفائل | Meri profile | |
| titles.profileEdit | Edit profile | پروفائل تبدیل کریں | Profile badlein | |
| titles.find | Find workers | کاریگر تلاش کریں | Karigar dhoondein | |
| titles.workerProfile | Worker profile | کاریگر کی پروفائل | Karigar ki profile | |
| titles.adminOverview | Admin overview | ایڈمن خلاصہ | Admin khulasa | |
| titles.adminIdentity | Identity review | شناخت کی جانچ | Shanakht ki jaanch | |
| titles.adminEvidence | Evidence review | ثبوت کی جانچ | Saboot ki jaanch | |
| titles.adminAudit | Audit log | آڈٹ لاگ | Audit log | |
| titles.notFound | Page not found | صفحہ نہیں ملا | Safha nahi mila | |

## Website texts: `landing`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| landing.eyebrow | Digital Labour Marketplace | ڈیجیٹل لیبر مارکیٹ پلیس | Digital Labour Marketplace | |
| landing.title | Skilled work, verified. | ہنر مند کام، تصدیق شدہ۔ | Hunarmand kaam, tasdeeq shuda. | |
| landing.lead | Workers build a profile that shows what they can do. Customers find a worker and can see what has been checked. | کاریگر ایسی پروفائل بناتے ہیں جو ان کا ہنر دکھائے۔ گاہک کاریگر ڈھونڈتے ہیں اور دیکھ سکتے ہیں کہ کیا چیک ہو چکا ہے۔ | Karigar aisi profile banate hain jo un ka hunar dikhaye. Customer karigar dhoondte hain aur dekh sakte hain ke kya check ho chuka hai. | |
| landing.findWorker | Find a worker | کاریگر ڈھونڈیں | Karigar dhoondein | |
| landing.joinWorker | Join as a worker | کاریگر کے طور پر شامل ہوں | Karigar ban kar join karein | |
| landing.heroNote | For electricians, plumbers, painters, masons, carpenters, AC technicians, domestic workers and more. | الیکٹریشن، پلمبر، پینٹر، راج مستری، کارپینٹر، اے سی ٹیکنیشن، گھریلو ملازم اور بہت سے دوسرے۔ | Electrician, plumber, painter, raj mistri, carpenter, AC technician, gharelu mulazim aur bohat se doosray. | |
| landing.howKicker | Two sides, one website | دو فریق، ایک ویب سائٹ | Do fareeq, aik website | |
| landing.howTitle | How it works | یہ کیسے کام کرتا ہے | Yeh kaise kaam karta hai | |
| landing.howLead | Three short steps on each side. | دونوں طرف تین آسان قدم۔ | Dono taraf teen asaan qadam. | |
| landing.bento.example | Example | مثال | Misaal | |
| landing.bento.sentence | I do **house wiring** and fit **solar panels**. | میں **گھر کی وائرنگ** کرتا ہوں اور **سولر پینل** لگاتا ہوں۔ | Main **ghar ki wiring** karta hoon aur **solar panel** lagata hoon. | |
| landing.bento.verifiedMeans | An admin approved a photo as proof of this skill. | ایڈمن نے اس ہنر کے ثبوت کی تصویر منظور کی ہے۔ | Admin ne is hunar ke saboot ki tasveer manzoor ki hai. | |
| landing.bento.selfMeans | The worker says so. No proof has been checked yet. | کاریگر نے خود بتایا ہے۔ ابھی کوئی ثبوت چیک نہیں ہوا۔ | Karigar ne khud bataya hai. Abhi koi saboot check nahi hua. | |
| landing.forWorkers | For workers | کاریگروں کے لیے | Karigaron ke liye | |
| landing.forCustomers | For customers | گاہکوں کے لیے | Customers ke liye | |
| landing.stepNumber | Step {n} | قدم {n} | Qadam {n} | |
| landing.workerSteps.profile.title | Create your profile | اپنی پروفائل بنائیں | Apni profile banayein | |
| landing.workerSteps.profile.text | Your trade, your experience and your rates, in a few short steps. | آپ کا کام، آپ کا تجربہ اور آپ کے ریٹ، چند آسان قدموں میں۔ | Aap ka kaam, aap ka tajurba aur aap ke rate, chand asaan qadmon mein. | |
| landing.workerSteps.skills.title | Describe your skills | اپنے ہنر بتائیں | Apne hunar batayein | |
| landing.workerSteps.skills.text | Write or say what you do, in Urdu, Roman Urdu or English. You choose which skills to add. | اردو، رومن اردو یا انگریزی میں لکھیں یا بولیں کہ آپ کیا کام کرتے ہیں۔ کون سے ہنر شامل کرنے ہیں، یہ آپ خود چنتے ہیں۔ | Urdu, Roman Urdu ya English mein likhein ya bolein ke aap kya kaam karte hain. Kaun se hunar shamil karne hain, yeh aap khud chuntay hain. | |
| landing.workerSteps.proof.title | Add proof and get checked | ثبوت لگائیں اور چیک کروائیں | Saboot lagayein aur check karwayein | |
| landing.workerSteps.proof.text | Upload a photo of a certificate or finished work. An admin checks your identity and your proof. | سرٹیفکیٹ یا مکمل کام کی تصویر اپ لوڈ کریں۔ ایڈمن آپ کی شناخت اور آپ کا ثبوت چیک کرتا ہے۔ | Certificate ya mukammal kaam ki tasveer upload karein. Admin aap ki shanakht aur aap ka saboot check karta hai. | |
| landing.customerSteps.search.title | Search by trade | کام کے حساب سے تلاش کریں | Kaam ke hisaab se talaash karein | |
| landing.customerSteps.search.text | Electricians, plumbers, painters, masons, carpenters, AC technicians, domestic workers and more. | الیکٹریشن، پلمبر، پینٹر، راج مستری، کارپینٹر، اے سی ٹیکنیشن، گھریلو ملازم اور بہت سے دوسرے۔ | Electrician, plumber, painter, raj mistri, carpenter, AC technician, gharelu mulazim aur bohat se doosray. | |
| landing.customerSteps.compare.title | Compare profiles | پروفائلز کا موازنہ کریں | Profiles ka muqabla karein | |
| landing.customerSteps.compare.text | Experience, rates, skills, and what an admin has checked. | تجربہ، ریٹ، ہنر، اور یہ کہ ایڈمن نے کیا چیک کیا ہے۔ | Tajurba, rate, hunar, aur yeh ke admin ne kya check kiya hai. | |
| landing.customerSteps.choose.title | Choose with trust | بھروسے سے چنیں | Bharosay se chunein | |
| landing.customerSteps.choose.text | See clearly what is checked and what the worker only says about themselves. | صاف دیکھیں کہ کیا چیک ہوا ہے اور کیا صرف کاریگر نے اپنے بارے میں بتایا ہے۔ | Saaf dekhein ke kya check hua hai aur kya sirf karigar ne apne baare mein bataya hai. | |
| landing.trustKicker | Checked by people | انسانوں کی جانچ | Insanon ki jaanch | |
| landing.trustTitle | Why you can trust a profile here | یہاں کی پروفائل پر بھروسہ کیوں کریں | Yahan ki profile par bharosa kyun karein | |
| landing.trustLead | Every badge on a profile means a real check by a person. | پروفائل پر ہر نشان کا مطلب ہے کہ کسی انسان نے اصل میں چیک کیا ہے۔ | Profile par har nishan ka matlab hai ke kisi insaan ne asal mein check kiya hai. | |
| landing.trust.identity.title | Identity checked by a person | شناخت ایک انسان چیک کرتا ہے | Shanakht aik insaan check karta hai | |
| landing.trust.identity.text | An admin checks the worker's CNIC card in person or on a video call. The number is stored encrypted and is never shown to customers. | ایڈمن کاریگر کا شناختی کارڈ (CNIC) سامنے یا ویڈیو کال پر چیک کرتا ہے۔ نمبر خفیہ طریقے سے محفوظ ہوتا ہے اور گاہکوں کو کبھی نہیں دکھایا جاتا۔ | Admin karigar ka shanakhti card (CNIC) saamne ya video call par check karta hai. Number khufia tareeqay se save hota hai aur customers ko kabhi nahi dikhaya jata. | |
| landing.trust.proof.title | Skills with proof | ثبوت کے ساتھ ہنر | Saboot ke saath hunar | |
| landing.trust.proof.text | Workers upload photos of certificates, finished work or reference letters. A skill shows "Verified by evidence" only after an admin approves a photo. | کاریگر سرٹیفکیٹ، مکمل کام یا سفارشی خط کی تصویریں اپ لوڈ کرتے ہیں۔ ہنر پر "ثبوت سے تصدیق شدہ" صرف تب لکھا جاتا ہے جب ایڈمن تصویر منظور کرے۔ | Karigar certificate, mukammal kaam ya sifarishi khat ki tasveerein upload karte hain. Hunar par "Saboot se tasdeeq shuda" sirf tab likha jata hai jab admin tasveer manzoor kare. | |
| landing.trust.review.title | Every decision is recorded | ہر فیصلہ لکھا جاتا ہے | Har faisla likha jata hai | |
| landing.trust.review.text | Admins give a reason for every decision, and each one is written to a log that cannot be changed. | ایڈمن ہر فیصلے کی وجہ لکھتا ہے، اور ہر فیصلہ ایسے ریکارڈ میں جاتا ہے جسے بدلا نہیں جا سکتا۔ | Admin har faislay ki wajah likhta hai, aur har faisla aise record mein jata hai jise badla nahi ja sakta. | |
| landing.trust.privacy.title | Phone and CNIC stay private | فون اور شناختی کارڈ چھپے رہتے ہیں | Phone aur CNIC chupay rehtay hain | |
| landing.trust.privacy.text | Phone, WhatsApp, address and CNIC are never shown in search results. Contact details will be shared only after a booking is accepted. | فون، واٹس ایپ، پتہ اور شناختی کارڈ تلاش کے نتائج میں کبھی نہیں دکھائے جاتے۔ رابطے کی معلومات صرف بکنگ قبول ہونے کے بعد دی جائیں گی۔ | Phone, WhatsApp, pata aur CNIC talaash ke nataij mein kabhi nahi dikhaye jatay. Rabtay ki maloomat sirf booking qabool honay ke baad di jayengi. | |
| landing.tradesKicker | Nine trades | نو پیشے | Nau peshay | |
| landing.tradesTitle | Trades on the marketplace | مارکیٹ پلیس پر کام | Marketplace par kaam | |
| landing.tradesLead | From house wiring to house shifting: one place for skilled work. | گھر کی وائرنگ سے گھر کی شفٹنگ تک: ہنر مند کام کے لیے ایک جگہ۔ | Ghar ki wiring se ghar ki shifting tak: hunarmand kaam ke liye aik jagah. | |
| landing.tradeSkills | one: {count} skill / other: {count} skills | one: {count} ہنر / other: {count} ہنر | one: {count} hunar / other: {count} hunar | |
| landing.ctaTitle | Ready to start? | شروع کرنے کے لیے تیار ہیں؟ | Shuru karne ke liye tayyar hain? | |
| landing.ctaText | Create an account in a few minutes. Workers and customers use the same simple website. | چند منٹ میں اکاؤنٹ بنائیں۔ کاریگر اور گاہک دونوں ایک ہی آسان ویب سائٹ استعمال کرتے ہیں۔ | Chand minute mein account banayein. Karigar aur customer dono aik hi asaan website use karte hain. | |

## Website texts: `auth`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| auth.sessionEnded | Your session has ended. Please log in again. | آپ کا سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔ | Aap ka session khatam ho gaya hai. Meharbani karke dobara log in karein. | |
| auth.login.title | Log in | لاگ ان | Log in | |
| auth.login.welcome | Welcome back. | خوش آمدید۔ | Khush aamdeed. | |
| auth.login.email | Email | ای میل | Email | |
| auth.login.submit | Log in | لاگ ان کریں | Log in karein | |
| auth.login.missing | Please enter your email and password. | براہ کرم اپنا ای میل اور پاس ورڈ لکھیں۔ | Meharbani karke apna email aur password likhein. | |
| auth.login.newHere | New here? | پہلی بار آئے ہیں؟ | Pehli baar aaye hain? | |
| auth.login.createAccount | Create an account | اکاؤنٹ بنائیں | Account banayein | |
| auth.login.side | Your profile, your skills and your proof, in one place. | آپ کی پروفائل، آپ کے ہنر اور آپ کے ثبوت، ایک ہی جگہ۔ | Aap ki profile, aap ke hunar aur aap ke saboot, aik hi jagah. | |
| auth.register.title | Create your account | اپنا اکاؤنٹ بنائیں | Apna account banayein | |
| auth.register.lead | First, tell us what you want to do. | پہلے بتائیں کہ آپ کیا کرنا چاہتے ہیں۔ | Pehle batayein ke aap kya karna chahte hain. | |
| auth.register.legend | I am here because… | میں یہاں اس لیے ہوں… | Main yahan is liye hoon… | |
| auth.register.workerTitle | I want to find work | مجھے کام چاہیے | Mujhe kaam chahiye | |
| auth.register.workerText | Make a profile so customers can find you. | پروفائل بنائیں تاکہ گاہک آپ کو ڈھونڈ سکیں۔ | Profile banayein taake customer aap ko dhoond sakein. | |
| auth.register.customerTitle | I want to hire a worker | مجھے کاریگر چاہیے | Mujhe karigar chahiye | |
| auth.register.customerText | Search for workers and compare them. | کاریگر تلاش کریں اور ان کا موازنہ کریں۔ | Karigar talaash karein aur un ka muqabla karein. | |
| auth.register.fullName | Full name | پورا نام | Poora naam | |
| auth.register.email | Email | ای میل | Email | |
| auth.register.mobile | Mobile number | موبائل نمبر | Mobile number | |
| auth.register.phoneHintWorker | Not shown in search results. | تلاش کے نتائج میں نہیں دکھایا جاتا۔ | Talaash ke nataij mein nahi dikhaya jata. | |
| auth.register.submit | Create account | اکاؤنٹ بنائیں | Account banayein | |
| auth.register.failed | Could not create the account. | اکاؤنٹ نہیں بن سکا۔ | Account nahi ban saka. | |
| auth.register.haveAccount | Already have an account? | پہلے سے اکاؤنٹ ہے؟ | Pehle se account hai? | |
| auth.register.login | Log in | لاگ ان کریں | Log in karein | |

## Website texts: `password`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| password.label | Password | پاس ورڈ | Password | |
| password.hint | 15+ characters; a sentence you remember works well | کم از کم 15 حروف؛ کوئی یاد رہنے والا جملہ اچھا رہتا ہے | Kam az kam 15 huroof; koi yaad rehne wala jumla acha rehta hai | |
| password.show | Show password | پاس ورڈ دکھائیں | Password dikhayein | |
| password.hide | Hide password | پاس ورڈ چھپائیں | Password chupayein | |

## Website texts: `validation`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| validation.name | Please write your full name. | براہ کرم اپنا پورا نام لکھیں۔ | Meharbani karke apna poora naam likhein. | |
| validation.nameShort | Please write your full name (at least 2 letters). | براہ کرم اپنا پورا نام لکھیں (کم از کم 2 حروف)۔ | Meharbani karke apna poora naam likhein (kam az kam 2 huroof). | |
| validation.email | Please write a valid email address. | براہ کرم درست ای میل لکھیں۔ | Meharbani karke durust email likhein. | |
| validation.phone | Phone must be a Pakistani mobile number like 0300 1234567. | فون نمبر پاکستانی موبائل نمبر ہونا چاہیے، جیسے 0300 1234567۔ | Phone number Pakistani mobile number hona chahiye, jaise 0300 1234567. | |
| validation.whatsapp | WhatsApp must be a mobile number like 0300 1234567, or leave it empty. | واٹس ایپ نمبر 0300 1234567 جیسا ہو، یا اسے خالی چھوڑ دیں۔ | WhatsApp number 0300 1234567 jaisa ho, ya isay khaali chhor dein. | |
| validation.cnic | CNIC must look like 12345-1234567-1. | شناختی کارڈ نمبر 12345-1234567-1 جیسا ہونا چاہیے۔ | CNIC number 12345-1234567-1 jaisa hona chahiye. | |
| validation.city | Please write your city. | براہ کرم اپنا شہر لکھیں۔ | Meharbani karke apna shehar likhein. | |
| validation.passwordShort | Password must be at least {min} characters. | پاس ورڈ کم از کم {min} حروف کا ہونا چاہیے۔ | Password kam az kam {min} huroof ka hona chahiye. | |
| validation.passwordLong | Password is too long (max 72 bytes; an Urdu letter counts as 2). | پاس ورڈ بہت لمبا ہے (زیادہ سے زیادہ 72 بائٹ؛ ایک اردو حرف 2 گنا جاتا ہے)۔ | Password bohat lamba hai (zyada se zyada 72 bytes; aik Urdu harf 2 gina jata hai). | |
| validation.passwordSpaces | Password cannot be only spaces. | پاس ورڈ صرف خالی جگہوں کا نہیں ہو سکتا۔ | Password sirf khaali jagahon ka nahi ho sakta. | |
| validation.occupation | Please write your occupation, e.g. Electrician. | براہ کرم اپنا پیشہ لکھیں، جیسے الیکٹریشن۔ | Meharbani karke apna pesha likhein, jaise Electrician. | |
| validation.category | Please choose your main trade. | براہ کرم اپنا اصل کام چنیں۔ | Meharbani karke apna asal kaam chunein. | |
| validation.experience | Write your years of experience as a whole number from 0 to 60. | تجربے کے سال پورے نمبر میں لکھیں، 0 سے 60 تک۔ | Tajurbay ke saal poore number mein likhein, 0 se 60 tak. | |
| validation.rate | Write an amount in rupees, e.g. 800. | رقم روپوں میں لکھیں، جیسے 800۔ | Raqam rupay mein likhein, jaise 800. | |
| validation.rateNeeded | Please give at least one rate (per hour or per day). | براہ کرم کم از کم ایک ریٹ لکھیں (فی گھنٹہ یا فی دن)۔ | Meharbani karke kam az kam aik rate likhein (fi ghanta ya fi din). | |
| validation.jobTitle | Each past job needs a title (at least 2 letters). | ہر پرانے کام کا نام ضروری ہے (کم از کم 2 حروف)۔ | Har purane kaam ka naam zaroori hai (kam az kam 2 huroof). | |
| validation.proofSkill | Choose the skill this photo proves. | وہ ہنر چنیں جس کا یہ تصویر ثبوت ہے۔ | Woh hunar chunein jis ka yeh tasveer saboot hai. | |
| validation.proofType | Choose the kind of proof. | ثبوت کی قسم چنیں۔ | Saboot ki qisam chunein. | |
| validation.proofFile | Please choose a photo to upload. | براہ کرم اپ لوڈ کے لیے تصویر چنیں۔ | Meharbani karke upload ke liye tasveer chunein. | |
| validation.proofConsent | Please tick the consent box before uploading. | اپ لوڈ سے پہلے اجازت والے خانے پر نشان لگائیں۔ | Upload se pehle ijazat walay khanay par nishan lagayein. | |
| validation.identityNote | Write a note of at least 5 characters: how did you check the CNIC? | کم از کم 5 حروف کا نوٹ لکھیں: آپ نے شناختی کارڈ کیسے چیک کیا؟ | Kam az kam 5 huroof ka note likhein: aap ne CNIC kaise check kiya? | |
| validation.reasonChoose | Choose a reason. | وجہ چنیں۔ | Wajah chunein. | |
| validation.reasonOther | Write the reason (at least 5 characters). | وجہ لکھیں (کم از کم 5 حروف)۔ | Wajah likhein (kam az kam 5 huroof). | |
| validation.reasonNote | A written reason (at least 5 characters) is required. | لکھی ہوئی وجہ ضروری ہے (کم از کم 5 حروف)۔ | Likhi hui wajah zaroori hai (kam az kam 5 huroof). | |
| validation.skillsText | Please write a few words about your work first. | پہلے اپنے کام کے بارے میں چند الفاظ لکھیں۔ | Pehle apne kaam ke baare mein chand alfaaz likhein. | |

## Website texts: `fields`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| fields.name | Name | نام | Naam | |
| fields.email | Email | ای میل | Email | |
| fields.phone | Phone number | فون نمبر | Phone number | |
| fields.password | Password | پاس ورڈ | Password | |
| fields.role | Role | کردار | Kirdar | |
| fields.occupation | Occupation | پیشہ | Pesha | |
| fields.category | Category | کام کی قسم | Kaam ki qisam | |
| fields.experienceYears | Experience | تجربہ | Tajurba | |
| fields.hourlyRate | Hourly rate | فی گھنٹہ ریٹ | Fi ghanta rate | |
| fields.dailyRate | Daily rate | فی دن ریٹ | Fi din rate | |
| fields.city | City | شہر | Shehar | |
| fields.address | Address | پتہ | Pata | |
| fields.whatsappNumber | WhatsApp number | واٹس ایپ نمبر | WhatsApp number | |
| fields.emergencyContact | Emergency contact | ایمرجنسی رابطہ | Emergency rabta | |
| fields.cnicNumber | CNIC | شناختی کارڈ | CNIC | |
| fields.languages | Language | زبان | Zabaan | |
| fields.availability | Availability | دستیابی | Dastiyabi | |
| fields.bio | Bio | تعارف | Taaruf | |
| fields.workHistory | Work history | پرانا کام | Purana kaam | |
| fields.jobTitle | Job title | کام کا نام | Kaam ka naam | |
| fields.clientOrEmployer | Client / location | گاہک / جگہ | Customer / jagah | |
| fields.duration | Duration | مدت | Muddat | |
| fields.description | Description | تفصیل | Tafseel | |
| fields.search | Search text | تلاش کا لفظ | Talaash ka lafz | |
| fields.q | Search text | تلاش کا لفظ | Talaash ka lafz | |
| fields.text | Text | متن | Text | |
| fields.sourceText | Text | متن | Text | |
| fields.skillIds | Skill | ہنر | Hunar | |
| fields.skillId | Skill | ہنر | Hunar | |
| fields.title | Title | عنوان | Unwaan | |
| fields.note | Note | نوٹ | Note | |
| fields.page | Page | صفحہ | Safha | |
| fields.limit | Limit | حد | Had | |
| fields.status | Status | حالت | Haalat | |
| fields.action | Action | عمل | Amal | |
| fields.from | From date | تاریخ سے | Tareekh se | |
| fields.to | To date | تاریخ تک | Tareekh tak | |
| fields.type | Type | قسم | Qisam | |
| fields.identity | Identity filter | شناخت کا فلٹر | Shanakht ka filter | |
| fields.skills | Skills filter | ہنر کا فلٹر | Hunar ka filter | |
| fields.duplicates | Duplicates filter | ملتی جلتی تصویروں کا فلٹر | Milti julti tasveeron ka filter | |
| fields.consent | Consent | اجازت | Ijazat | |
| fields.inputMode | Input mode | لکھنے کا طریقہ | Likhne ka tareeqa | |
| fields.addedVia | Added via | کیسے شامل کیا | Kaise shamil kiya | |
| fields.reasonCode | Reason | وجہ | Wajah | |
| fields.preferredLanguage | Language | زبان | Zabaan | |
| fields.preferredTheme | Theme | تھیم | Theme | |
| fields.preferredTextSize | Text size | لکھائی کا سائز | Likhai ka size | |
| fields.reason | Reason | وجہ | Wajah | |
| fields.sort | Sort | ترتیب | Tarteeb | |
| fields.ids | Workers | کاریگر | Karigar | |
| fields.days | Days | دن | Din | |
| fields.kind | Kind | قسم | Qisam | |
| fields.en | English text | انگریزی متن | English matan | |
| fields.ur | Urdu text | اردو متن | Urdu matan | |
| fields.ur-Latn | Roman Urdu text | رومن اردو متن | Roman Urdu matan | |
| fields.id | Id | آئی ڈی | ID | |
| fields.workerIdCode | Worker ID | کاریگر آئی ڈی | Karigar ID | |

## Website texts: `errors`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| errors.network | Could not reach the server. Check your internet connection and try again. | سرور سے رابطہ نہیں ہو سکا۔ انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔ | Server se rabta nahi ho saka. Internet check karein aur dobara koshish karein. | |
| errors.generic | Something went wrong. Please try again. | کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔ | Kuch ghalat ho gaya. Meharbani karke dobara koshish karein. | |
| errors.BODY_REQUIRED | Request body is required (send JSON) | درخواست میں معلومات ضروری ہیں | Request mein maloomat zaroori hain | |
| errors.INVALID_JSON | Request body is not valid JSON | درخواست کی معلومات درست شکل میں نہیں | Request ki maloomat durust shakal mein nahi | |
| errors.BODY_TOO_LARGE | Request body is too large | درخواست بہت بڑی ہے | Request bohat bari hai | |
| errors.UNKNOWN_FIELD | Unrecognized key: "{key}" | نامعلوم خانہ: "{key}" | Na-maloom khana: "{key}" | |
| errors.WRONG_TYPE | {field}: wrong type of value | {field} کی قسم غلط ہے | {field} ki qisam ghalat hai | |
| errors.TEXT_MUST_BE_TEXT | {field} must be text | {field} لکھا ہوا متن ہونا چاہیے | {field} likha hua text hona chahiye | |
| errors.ONE_VALUE | {field} must be one text value | {field} میں ایک ہی چیز ہونی چاہیے | {field} mein aik hi cheez honi chahiye | |
| errors.TEXT_TOO_SHORT | {field} must be at least {min} characters | {field} کم از کم {min} حروف کا ہونا چاہیے | {field} kam az kam {min} huroof ka hona chahiye | |
| errors.TEXT_TOO_LONG | {field} must be at most {max} characters | {field} زیادہ سے زیادہ {max} حروف کا ہو سکتا ہے | {field} zyada se zyada {max} huroof ka ho sakta hai | |
| errors.TEXT_EMPTY_ITEM | {field} cannot be empty | {field} خالی نہیں ہو سکتا | {field} khaali nahi ho sakta | |
| errors.LIST_TOO_SHORT | Choose at least {min} for {field} | {field} کے لیے کم از کم {min} چنیں | {field} ke liye kam az kam {min} chunein | |
| errors.LIST_TOO_LONG | At most {max} items for {field} | {field} میں زیادہ سے زیادہ {max} چیزیں | {field} mein zyada se zyada {max} cheezein | |
| errors.NUMBER_REQUIRED | {field} must be a number | {field} نمبر ہونا چاہیے | {field} number hona chahiye | |
| errors.WHOLE_NUMBER | {field} must be a whole number | {field} پورا نمبر ہونا چاہیے | {field} poora number hona chahiye | |
| errors.NOT_NEGATIVE | {field} cannot be negative | {field} منفی نہیں ہو سکتا | {field} minus mein nahi ho sakta | |
| errors.NUMBER_TOO_SMALL | {field} must be at least {min} | {field} کم از کم {min} ہونا چاہیے | {field} kam az kam {min} hona chahiye | |
| errors.NUMBER_TOO_LARGE | {field} must be at most {max} | {field} زیادہ سے زیادہ {max} ہو سکتا ہے | {field} zyada se zyada {max} ho sakta hai | |
| errors.RATE_TOO_HIGH | {field} is too high | {field} بہت زیادہ ہے | {field} bohat zyada hai | |
| errors.NOT_ALLOWED | {field}: this value is not allowed | {field} کی اجازت نہیں | {field} ki ijazat nahi | |
| errors.INVALID_FORMAT | {field}: wrong format | {field} کی شکل درست نہیں | {field} ki shakal durust nahi | |
| errors.INVALID_VALUE | {field}: invalid value | {field} درست نہیں | {field} durust nahi | |
| errors.ID_INVALID | Invalid id | آئی ڈی درست نہیں | ID durust nahi | |
| errors.NAME_REQUIRED | Name is required | نام ضروری ہے | Naam zaroori hai | |
| errors.EMAIL_REQUIRED | Email is required | ای میل ضروری ہے | Email zaroori hai | |
| errors.EMAIL_INVALID | Email address is not valid | براہ کرم درست ای میل لکھیں | Meharbani karke durust email likhein | |
| errors.PHONE_REQUIRED | Phone number is required | فون نمبر ضروری ہے | Phone number zaroori hai | |
| errors.PHONE_INVALID | Phone must be a Pakistani mobile number like 0300 1234567 | فون نمبر پاکستانی موبائل نمبر ہونا چاہیے، جیسے 0300 1234567 | Phone number Pakistani mobile number hona chahiye, jaise 0300 1234567 | |
| errors.PASSWORD_REQUIRED | Password is required | پاس ورڈ ضروری ہے | Password zaroori hai | |
| errors.PASSWORD_TOO_SHORT | Password must be at least 15 characters. Tip: use 4 or more easy words with spaces, in Roman Urdu or English | پاس ورڈ کم از کم 15 حروف کا ہونا چاہیے۔ مشورہ: رومن اردو یا انگریزی کے 4 یا زیادہ آسان الفاظ خالی جگہ کے ساتھ لکھیں | Password kam az kam 15 huroof ka hona chahiye. Mashwara: Roman Urdu ya English ke 4 ya zyada asaan alfaaz space ke saath likhein | |
| errors.PASSWORD_TOO_LONG | Password is too long (max 72 bytes; an Urdu letter counts as 2 bytes) | پاس ورڈ بہت لمبا ہے (زیادہ سے زیادہ 72 بائٹ؛ ایک اردو حرف 2 بائٹ گنا جاتا ہے) | Password bohat lamba hai (zyada se zyada 72 bytes; aik Urdu harf 2 bytes gina jata hai) | |
| errors.PASSWORD_ONLY_SPACES | Password cannot be only spaces | پاس ورڈ صرف خالی جگہوں کا نہیں ہو سکتا | Password sirf khaali jagahon ka nahi ho sakta | |
| errors.ROLE_INVALID | Role must be worker or customer | کردار صرف کاریگر یا گاہک ہو سکتا ہے | Kirdar sirf karigar ya customer ho sakta hai | |
| errors.LANGUAGE_INVALID | Language must be en, ur or ur-Latn | زبان en، ur یا ur-Latn ہونی چاہیے | Zabaan en, ur ya ur-Latn honi chahiye | |
| errors.THEME_INVALID | Theme must be light, dark or system | تھیم light، dark یا system ہونی چاہیے | Theme light, dark ya system hona chahiye | |
| errors.TEXT_SIZE_INVALID | Text size must be small, normal or large | لکھائی کا سائز small، normal یا large ہونا چاہیے | Likhai ka size small, normal ya large hona chahiye | |
| errors.PREFERENCES_EMPTY | Send at least one setting to change | کم از کم ایک سیٹنگ بھیجیں | Kam az kam aik setting bhejein | |
| errors.EMAIL_TAKEN | This email is already registered. Please log in instead. | یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہ کرم لاگ ان کریں۔ | Yeh email pehle se register hai. Meharbani karke log in karein. | |
| errors.LOGIN_FAILED | Email or password is incorrect. After 5 wrong tries, login is paused for 15 minutes. | ای میل یا پاس ورڈ غلط ہے۔ 5 غلط کوششوں کے بعد لاگ ان 15 منٹ کے لیے رک جاتا ہے۔ | Email ya password ghalat hai. 5 ghalat koshishon ke baad login 15 minute ke liye ruk jata hai. | |
| errors.NOT_LOGGED_IN | Please log in first. | براہ کرم پہلے لاگ ان کریں۔ | Meharbani karke pehle log in karein. | |
| errors.SESSION_ENDED | Your session has ended. Please log in again. | آپ کا سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔ | Aap ka session khatam ho gaya hai. Meharbani karke dobara log in karein. | |
| errors.FORBIDDEN | You do not have permission for this action. | آپ کو اس کام کی اجازت نہیں ہے۔ | Aap ko is kaam ki ijazat nahi hai. | |
| errors.CSRF_BLOCKED | Request blocked: it did not come from our website. | درخواست روک دی گئی: یہ ہماری ویب سائٹ سے نہیں آئی۔ | Request rok di gayi: yeh hamari website se nahi aayi. | |
| errors.RATE_LIMIT_AUTH | Too many failed attempts from this network. Please wait 15 minutes and try again. | اس نیٹ ورک سے بہت زیادہ غلط کوششیں ہوئی ہیں۔ 15 منٹ انتظار کریں اور پھر کوشش کریں۔ | Is network se bohat zyada ghalat koshishein hui hain. 15 minute intezar karein aur phir koshish karein. | |
| errors.RATE_LIMIT_UPLOAD | Too many uploads from this network. Please wait 15 minutes and try again. | اس نیٹ ورک سے بہت زیادہ اپ لوڈ ہوئے ہیں۔ 15 منٹ انتظار کریں اور پھر کوشش کریں۔ | Is network se bohat zyada uploads hue hain. 15 minute intezar karein aur phir koshish karein. | |
| errors.CNIC_INVALID | CNIC must look like 12345-1234567-1 | شناختی کارڈ نمبر 12345-1234567-1 جیسا ہونا چاہیے | CNIC number 12345-1234567-1 jaisa hona chahiye | |
| errors.CATEGORY_INVALID | Category must be one of the listed trades | براہ کرم فہرست میں سے کام چنیں | Meharbani karke list mein se kaam chunein | |
| errors.EXPERIENCE_WHOLE | Experience must be whole years | تجربہ پورے سالوں میں ہونا چاہیے | Tajurba poore saalon mein hona chahiye | |
| errors.EXPERIENCE_TOO_HIGH | Experience must be 60 years or less | تجربہ زیادہ سے زیادہ 60 سال ہو سکتا ہے | Tajurba zyada se zyada 60 saal ho sakta hai | |
| errors.AVAILABILITY_INVALID | Availability must be Available, Busy or Offline | دستیابی صرف دستیاب، مصروف یا آف لائن ہو سکتی ہے | Dastiyabi sirf Available, Busy ya Offline ho sakti hai | |
| errors.PROFILE_NOT_CREATED | You have not created your worker profile yet. | آپ نے ابھی اپنی کاریگر پروفائل نہیں بنائی۔ | Aap ne abhi apni karigar profile nahi banayi. | |
| errors.CNIC_TAKEN | This CNIC is already linked to another account. If it is yours, please contact the admin. | یہ شناختی کارڈ کسی دوسرے اکاؤنٹ سے جڑا ہوا ہے۔ اگر یہ آپ کا ہے تو ایڈمن سے رابطہ کریں۔ | Yeh CNIC kisi doosray account se juda hua hai. Agar yeh aap ka hai to admin se rabta karein. | |
| errors.WORKER_NOT_FOUND | Worker not found | کاریگر نہیں ملا | Karigar nahi mila | |
| errors.WORKER_ID_INVALID | Worker ID must look like DLM-2026-000123 | کاریگر آئی ڈی DLM-2026-000123 جیسی ہونی چاہیے | Karigar ID DLM-2026-000123 jaisi honi chahiye | |
| errors.CATEGORY_UNKNOWN | Unknown category | نامعلوم کام | Na-maloom kaam | |
| errors.AVAILABILITY_UNKNOWN | Unknown availability | نامعلوم دستیابی | Na-maloom dastiyabi | |
| errors.STATUS_UNKNOWN | Unknown status | نامعلوم حالت | Na-maloom haalat | |
| errors.TYPE_UNKNOWN | Unknown type | نامعلوم قسم | Na-maloom qisam | |
| errors.ACTION_UNKNOWN | Unknown action | نامعلوم عمل | Na-maloom amal | |
| errors.IDENTITY_FILTER_INVALID | identity must be all or verified | شناخت کا فلٹر صرف "all" یا "verified" ہو سکتا ہے | Shanakht ka filter sirf "all" ya "verified" ho sakta hai | |
| errors.SKILLS_FILTER_INVALID | skills must be all or verified | ہنر کا فلٹر صرف "all" یا "verified" ہو سکتا ہے | Hunar ka filter sirf "all" ya "verified" ho sakta hai | |
| errors.DUPLICATES_FILTER_INVALID | duplicates must be "true" | ملتی جلتی تصویروں کا فلٹر صرف "true" ہو سکتا ہے | Milti julti tasveeron ka filter sirf "true" ho sakta hai | |
| errors.DATE_INVALID | Date must look like 2026-11-09 | تاریخ 2026-11-09 جیسی ہونی چاہیے | Tareekh 2026-11-09 jaisi honi chahiye | |
| errors.DATE_NOT_REAL | Not a real date | یہ تاریخ موجود نہیں | Yeh tareekh mojood nahi | |
| errors.IDENTITY_STATUS_INVALID | Status must be Verified or Rejected | فیصلہ صرف تصدیق شدہ یا رد ہو سکتا ہے | Faisla sirf Verified ya Rejected ho sakta hai | |
| errors.NOTE_REQUIRED | A note is required | نوٹ ضروری ہے | Note zaroori hai | |
| errors.IDENTITY_NOTE_TOO_SHORT | Please write a note of at least 5 characters (how the CNIC was checked) | براہ کرم کم از کم 5 حروف کا نوٹ لکھیں (شناختی کارڈ کیسے چیک کیا گیا) | Meharbani karke kam az kam 5 huroof ka note likhein (CNIC kaise check kiya gaya) | |
| errors.WORKER_PROFILE_NOT_FOUND | Worker profile not found | کاریگر کی پروفائل نہیں ملی | Karigar ki profile nahi mili | |
| errors.IDENTITY_NEEDS_CNIC | This worker has not saved a CNIC yet, so identity cannot be verified. | اس کاریگر نے ابھی شناختی کارڈ محفوظ نہیں کیا، اس لیے شناخت کی تصدیق نہیں ہو سکتی۔ | Is karigar ne abhi CNIC save nahi kiya, is liye shanakht ki tasdeeq nahi ho sakti. | |
| errors.IDENTITY_CHANGED | Someone else changed this worker just now. Please reload and try again. | ابھی کسی اور نے اس کاریگر کو تبدیل کیا ہے۔ صفحہ دوبارہ لوڈ کریں اور پھر کوشش کریں۔ | Abhi kisi aur ne is karigar ko badla hai. Safha dobara load karein aur phir koshish karein. | |
| errors.NO_CNIC_ON_FILE | This worker has no CNIC on file. | اس کاریگر کا کوئی شناختی کارڈ محفوظ نہیں۔ | Is karigar ka koi CNIC save nahi. | |
| errors.CNIC_UNREADABLE | The stored CNIC cannot be read (wrong key or damaged data). Ask the worker to enter it again. | محفوظ شناختی کارڈ پڑھا نہیں جا سکتا (غلط چابی یا خراب ڈیٹا)۔ کاریگر سے دوبارہ لکھوائیں۔ | Save kiya hua CNIC parha nahi ja sakta (ghalat key ya kharab data). Karigar se dobara likhwayein. | |
| errors.TEXT_EMPTY | Please write a few words about your work | براہ کرم اپنے کام کے بارے میں چند الفاظ لکھیں | Meharbani karke apne kaam ke baare mein chand alfaaz likhein | |
| errors.INPUT_MODE_INVALID | inputMode must be text or voice | لکھنے کا طریقہ صرف ٹیکسٹ یا آواز ہو سکتا ہے | Likhne ka tareeqa sirf text ya awaaz ho sakta hai | |
| errors.SKILL_UNKNOWN | Unknown skill. Choose a skill from the list. | نامعلوم ہنر۔ فہرست میں سے ہنر چنیں۔ | Na-maloom hunar. List mein se hunar chunein. | |
| errors.SKILL_CHOOSE_ONE | Choose at least one skill | کم از کم ایک ہنر چنیں | Kam az kam aik hunar chunein | |
| errors.ADDED_VIA_INVALID | addedVia must be extractor, manual or related | شامل کرنے کا طریقہ درست نہیں | Shamil karne ka tareeqa durust nahi | |
| errors.SKILL_ID_INVALID | Invalid skill id | ہنر کی آئی ڈی درست نہیں | Hunar ki ID durust nahi | |
| errors.SKILL_LIMIT | At most {max} skills per worker | ایک کاریگر کے زیادہ سے زیادہ {max} ہنر ہو سکتے ہیں | Aik karigar ke zyada se zyada {max} hunar ho sakte hain | |
| errors.CUSTOM_SKILL_LATIN | Please write the skill name in English letters (a-z) for now | ابھی ہنر کا نام انگریزی حروف (a-z) میں لکھیں | Abhi hunar ka naam English huroof (a-z) mein likhein | |
| errors.CUSTOM_SKILL_LIMIT | At most {max} custom skills | زیادہ سے زیادہ {max} اپنے لکھے ہوئے ہنر | Zyada se zyada {max} apne likhe hue hunar | |
| errors.SKILL_NOT_ON_PROFILE | This skill is not on your profile | یہ ہنر آپ کی پروفائل پر نہیں ہے | Yeh hunar aap ki profile par nahi hai | |
| errors.SKILL_HAS_REVIEWED_PROOF | This skill has proof that an admin already reviewed, so it cannot be removed. Please contact the admin. | اس ہنر کا ثبوت ایڈمن چیک کر چکا ہے، اس لیے اسے ہٹایا نہیں جا سکتا۔ براہ کرم ایڈمن سے رابطہ کریں۔ | Is hunar ka saboot admin check kar chuka hai, is liye isay hataya nahi ja sakta. Meharbani karke admin se rabta karein. | |
| errors.SKILL_CHOOSE_OWN | Choose one of your skills | اپنے ہنر میں سے ایک چنیں | Apne hunar mein se aik chunein | |
| errors.EVIDENCE_TYPE_INVALID | Choose the kind of proof: certificate, work photo or reference letter | ثبوت کی قسم چنیں: سرٹیفکیٹ، کام کی تصویر یا سفارشی خط | Saboot ki qisam chunein: certificate, kaam ki tasveer ya sifarishi khat | |
| errors.CONSENT_REQUIRED | Please tick the consent box before uploading | اپ لوڈ سے پہلے اجازت والے خانے پر نشان لگائیں | Upload se pehle ijazat walay khanay par nishan lagayein | |
| errors.PHOTO_REQUIRED | Please choose a photo to upload. | براہ کرم اپ لوڈ کے لیے تصویر چنیں۔ | Meharbani karke upload ke liye tasveer chunein. | |
| errors.PHOTO_TOO_LARGE | The photo is too large. The limit is 4 MB. | تصویر بہت بڑی ہے۔ حد 4 MB ہے۔ | Tasveer bohat bari hai. Had 4 MB hai. | |
| errors.PHOTO_FIELD | Send one photo in the "image" field. | "image" خانے میں ایک تصویر اپ لوڈ کریں | "image" khanay mein aik tasveer upload karein | |
| errors.UPLOAD_FORM_INVALID | The upload form is not valid. | اپ لوڈ فارم درست نہیں | Upload form durust nahi | |
| errors.UPLOAD_INCOMPLETE | The upload was not complete. Please try again. | اپ لوڈ پورا نہیں ہوا۔ براہ کرم دوبارہ کوشش کریں۔ | Upload poora nahi hua. Meharbani karke dobara koshish karein. | |
| errors.PHOTO_NOT_JPG_PNG | Please upload a JPG or PNG photo. | براہ کرم JPG یا PNG تصویر اپ لوڈ کریں۔ | Meharbani karke JPG ya PNG tasveer upload karein. | |
| errors.PHOTO_PDF | PDF files are not accepted. Please upload a JPG or PNG photo of the document. | PDF فائل قبول نہیں۔ براہ کرم کاغذ کی JPG یا PNG تصویر اپ لوڈ کریں۔ | PDF file qabool nahi. Meharbani karke kaghaz ki JPG ya PNG tasveer upload karein. | |
| errors.PHOTO_NOT_IMAGE | This file is not a photo. Please upload a JPG or PNG photo. | یہ فائل تصویر نہیں ہے۔ براہ کرم JPG یا PNG تصویر اپ لوڈ کریں۔ | Yeh file tasveer nahi hai. Meharbani karke JPG ya PNG tasveer upload karein. | |
| errors.PHOTO_UNREADABLE | The photo could not be read. Please take the photo again. | تصویر پڑھی نہیں جا سکی۔ براہ کرم دوبارہ تصویر لیں۔ | Tasveer parhi nahi ja saki. Meharbani karke dobara tasveer lein. | |
| errors.PHOTO_TOO_MANY_PIXELS | The photo has too many pixels. Please use a normal phone photo. | تصویر میں بہت زیادہ پکسل ہیں۔ عام فون کی تصویر استعمال کریں۔ | Tasveer mein bohat zyada pixel hain. Aam phone ki tasveer use karein. | |
| errors.PROOF_SKILL_NOT_ON_PROFILE | You can add proof only for a skill on your profile. | ثبوت صرف اسی ہنر کا لگا سکتے ہیں جو آپ کی پروفائل پر ہو۔ | Saboot sirf usi hunar ka laga sakte hain jo aap ki profile par ho. | |
| errors.PROOF_LIMIT_SKILL | At most {max} proof items per skill. Delete one first. | ایک ہنر کے زیادہ سے زیادہ {max} ثبوت۔ پہلے ایک ہٹائیں۔ | Aik hunar ke zyada se zyada {max} saboot. Pehle aik hatayein. | |
| errors.PROOF_LIMIT_TOTAL | At most {max} proof items in total. | کل زیادہ سے زیادہ {max} ثبوت۔ | Kul zyada se zyada {max} saboot. | |
| errors.PHOTO_DUPLICATE | You already uploaded this photo for this skill. | یہ تصویر آپ اس ہنر کے لیے پہلے ہی اپ لوڈ کر چکے ہیں۔ | Yeh tasveer aap is hunar ke liye pehle hi upload kar chuke hain. | |
| errors.PHOTO_NOT_FOUND | Photo not found | تصویر نہیں ملی | Tasveer nahi mili | |
| errors.PROOF_NOT_FOUND | Proof item not found | ثبوت نہیں ملا | Saboot nahi mila | |
| errors.PROOF_FAKE_CANNOT_DELETE | An admin marked this item as a suspected fake. It cannot be deleted. Please contact the admin. | ایڈمن نے اسے مشکوک (جعلی ہونے کا شک) قرار دیا ہے۔ اسے ہٹایا نہیں جا سکتا۔ براہ کرم ایڈمن سے رابطہ کریں۔ | Admin ne isay mashkook (jaali honay ka shak) qarar diya hai. Isay hataya nahi ja sakta. Meharbani karke admin se rabta karein. | |
| errors.PROOF_REVIEWED_CANNOT_DELETE | Reviewed items that were approved or revoked cannot be deleted. Please contact the admin. | منظور شدہ یا واپس لی گئی منظوری والا ثبوت ہٹایا نہیں جا سکتا۔ براہ کرم ایڈمن سے رابطہ کریں۔ | Manzoor shuda ya wapas li gayi manzoori wala saboot hataya nahi ja sakta. Meharbani karke admin se rabta karein. | |
| errors.REASON_CODE_INVALID | Choose a reason: unclear, not relevant, wrong skill or other | وجہ چنیں: تصویر صاف نہیں، ہنر سے متعلق نہیں، کسی دوسرے ہنر کی، یا دوسری | Wajah chunein: tasveer saaf nahi, hunar se mutaliq nahi, kisi doosray hunar ki, ya doosri | |
| errors.REASON_REQUIRED_TO_REJECT | A reason is required to reject | رد کرنے کے لیے وجہ ضروری ہے | Radd karne ke liye wajah zaroori hai | |
| errors.REASON_OTHER_NEEDS_WORDS | Write the reason (at least 5 characters) | وجہ لکھیں (کم از کم 5 حروف) | Wajah likhein (kam az kam 5 huroof) | |
| errors.WRITTEN_REASON_REQUIRED | A written reason (at least 5 characters) is required | لکھی ہوئی وجہ ضروری ہے (کم از کم 5 حروف) | Likhi hui wajah zaroori hai (kam az kam 5 huroof) | |
| errors.REASON_CODE_ONLY_FOR_REJECT | A reason code is only used to reject | وجہ کی فہرست صرف رد کرتے وقت استعمال ہوتی ہے | Wajah ki list sirf radd karte waqt use hoti hai | |
| errors.TRANSITION_INVALID | You cannot {verb} an item that is {state}. | جو چیز {state} ہو، اسے {verb} نہیں کر سکتے۔ | Jo cheez {state} ho, usay {verb} nahi kar sakte. | |
| errors.PROOF_CHANGED | Someone else reviewed this item just now. Please reload. | ابھی کسی اور نے یہ ثبوت چیک کیا ہے۔ صفحہ دوبارہ لوڈ کریں۔ | Abhi kisi aur ne yeh saboot check kiya hai. Safha dobara load karein. | |
| errors.ACCOUNT_SUSPENDED | This account is suspended. Please contact the admin. | یہ اکاؤنٹ معطل ہے۔ براہ کرم ایڈمن سے رابطہ کریں۔ | Yeh account muattal hai. Barah-e-karam admin se rabta karein. | |
| errors.USER_NOT_FOUND | User not found | صارف نہیں ملا | User nahi mila | |
| errors.USER_STATUS_INVALID | Status must be active or suspended | حالت active یا suspended ہونی چاہیے | Status active ya suspended hona chahiye | |
| errors.USER_STATUS_CHANGED | This account already has that status. Please reload. | اس اکاؤنٹ کی حالت پہلے ہی یہی ہے۔ صفحہ دوبارہ لوڈ کریں۔ | Is account ka status pehle hi yehi hai. Safha dobara load karein. | |
| errors.CANNOT_SUSPEND_SELF | You cannot suspend your own account. | آپ اپنا اکاؤنٹ معطل نہیں کر سکتے۔ | Aap apna account muattal nahi kar sakte. | |
| errors.CANNOT_SUSPEND_ADMIN | Admin accounts cannot be suspended from the website. | ایڈمن اکاؤنٹ ویب سائٹ سے معطل نہیں کیے جا سکتے۔ | Admin accounts website se muattal nahi kiye ja sakte. | |
| errors.ROLE_FILTER_INVALID | Role must be all, worker, customer or admin | کردار all، worker، customer یا admin ہونا چاہیے | Role all, worker, customer ya admin hona chahiye | |
| errors.REASON_REQUIRED | A reason is required | وجہ لکھنا ضروری ہے | Wajah likhna zaroori hai | |
| errors.REASON_TOO_SHORT | Write a reason of at least 5 characters | کم از کم 5 حروف کی وجہ لکھیں | Kam az kam 5 huroof ki wajah likhein | |
| errors.NOTE_HAS_CNIC | Do not write a CNIC number here. Notes are saved in the audit log. | یہاں شناختی کارڈ نمبر نہ لکھیں۔ نوٹ آڈٹ لاگ میں محفوظ ہوتے ہیں۔ | Yahan CNIC number na likhein. Notes audit log mein mehfooz hote hain. | |
| errors.NOTIFICATION_NOT_FOUND | Notification not found | اطلاع نہیں ملی | Ittela nahi mili | |
| errors.SAVED_LIMIT | You can save at most {max} workers. Remove one first. | آپ زیادہ سے زیادہ {max} کاریگر محفوظ کر سکتے ہیں۔ پہلے ایک ہٹائیں۔ | Aap zyada se zyada {max} karigar mehfooz kar sakte hain. Pehle aik hatayein. | |
| errors.SORT_INVALID | Sort must be updated, experience or evidence | ترتیب updated، experience یا evidence ہونی چاہیے | Tarteeb updated, experience ya evidence honi chahiye | |
| errors.COMPARE_NEEDS_TWO | Choose at least two workers to compare | موازنے کے لیے کم از کم دو کاریگر چنیں | Muwazne ke liye kam az kam do karigar chunein | |
| errors.COMPARE_MAX_THREE | You can compare at most three workers | آپ زیادہ سے زیادہ تین کاریگروں کا موازنہ کر سکتے ہیں | Aap zyada se zyada teen karigaron ka muwazna kar sakte hain | |
| errors.COMPARE_SAME_WORKER | Choose different workers to compare | موازنے کے لیے الگ الگ کاریگر چنیں | Muwazne ke liye alag alag karigar chunein | |
| errors.EXPORT_KIND_UNKNOWN | Export must be audit, identity, evidence or users | ایکسپورٹ audit، identity، evidence یا users ہونا چاہیے | Export audit, identity, evidence ya users hona chahiye | |
| errors.TEMPLATE_KIND_INVALID | Unknown kind of reason template | سانچے کی قسم درست نہیں | Template ki qisam durust nahi | |
| errors.TEMPLATE_TEXT_REQUIRED | Write the English text of the template (at least 5 characters) | سانچے کا انگریزی متن لکھیں (کم از کم 5 حروف) | Template ka English matan likhein (kam az kam 5 huroof) | |
| errors.TEMPLATE_NOT_FOUND | Reason template not found | وجہ کا سانچہ نہیں ملا | Wajah ka template nahi mila | |
| errors.TEMPLATE_LIMIT | At most {max} reason templates. Delete one first. | زیادہ سے زیادہ {max} سانچے۔ پہلے ایک حذف کریں۔ | Zyada se zyada {max} templates. Pehle aik hazf karein. | |
| errors.ROUTE_NOT_FOUND | Route not found | یہ راستہ موجود نہیں | Yeh rasta mojood nahi | |
| errors.DUPLICATE_RECORD | This record already exists | یہ ریکارڈ پہلے سے موجود ہے | Yeh record pehle se mojood hai | |
| errors.DB_VALIDATION | Invalid value for: {fields} | ان کی قیمت درست نہیں: {fields} | In ki value durust nahi: {fields} | |
| errors.INVALID_ID_OR_VALUE | Invalid id or value | آئی ڈی یا قیمت درست نہیں | ID ya value durust nahi | |
| errors.SERVICE_UNAVAILABLE | Service temporarily unavailable. Please try again in a minute. | سروس ابھی دستیاب نہیں۔ ایک منٹ بعد دوبارہ کوشش کریں۔ | Service abhi dastiyab nahi. Aik minute baad dobara koshish karein. | |
| errors.SERVER_ERROR | Something went wrong on the server. Please try again later. | سرور پر کچھ غلط ہو گیا۔ براہ کرم کچھ دیر بعد کوشش کریں۔ | Server par kuch ghalat ho gaya. Meharbani karke kuch der baad koshish karein. | |

## Website texts: `status`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| status.unknown | Unknown | نامعلوم | Na-maloom | |
| status.identity.Unverified | Identity not submitted | شناخت جمع نہیں ہوئی | Shanakht jama nahi hui | |
| status.identity.Pending | Identity pending review | شناخت کی جانچ باقی ہے | Shanakht ki jaanch baqi hai | |
| status.identity.Verified | Identity verified | شناخت کی تصدیق ہو گئی | Shanakht ki tasdeeq ho gayi | |
| status.identity.Rejected | Identity not accepted | شناخت قبول نہیں ہوئی | Shanakht qabool nahi hui | |
| status.identityShort.Unverified | Unverified | غیر تصدیق شدہ | Ghair tasdeeq shuda | |
| status.identityShort.Pending | Pending | زیر جانچ | Zair-e-jaanch | |
| status.identityShort.Verified | Verified | تصدیق شدہ | Tasdeeq shuda | |
| status.identityShort.Rejected | Rejected | رد | Radd | |
| status.identityShort.All | All | سب | Sab | |
| status.skill.self_declared | Self-declared | خود بتایا ہوا | Khud bataya hua | |
| status.skill.evidence_pending | Evidence pending | ثبوت کی جانچ باقی ہے | Saboot ki jaanch baqi hai | |
| status.skill.verified | Verified by evidence | ثبوت سے تصدیق شدہ | Saboot se tasdeeq shuda | |
| status.skill.disputed | Disputed | مشکوک | Mashkook | |
| status.evidence.pending | Pending review | جانچ باقی ہے | Jaanch baqi hai | |
| status.evidence.approved | Approved | منظور | Manzoor | |
| status.evidence.rejected | Not accepted | قبول نہیں ہوا | Qabool nahi hua | |
| status.evidence.suspected_fake | Suspected fake | جعلی ہونے کا شک | Jaali honay ka shak | |
| status.evidence.revoked | Approval withdrawn | منظوری واپس لے لی گئی | Manzoori wapas le li gayi | |
| status.evidence.all | All | سب | Sab | |
| status.strength.none | No evidence yet | ابھی کوئی ثبوت نہیں | Abhi koi saboot nahi | |
| status.strength.weak | Weak | کمزور | Kamzor | |
| status.strength.moderate | Moderate | درمیانہ | Darmiyana | |
| status.strength.strong | Strong | مضبوط | Mazboot | |
| status.availability.Available | Available | دستیاب | Dastiyab | |
| status.availability.Busy | Busy | مصروف | Masroof | |
| status.availability.Offline | Offline | آف لائن | Offline | |

## Website texts: `ui`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| ui.pagination.label | Pages | صفحات | Safhat | |
| ui.pagination.status | Page {page} of {pages} | صفحہ {page} از {pages} | Safha {page} / {pages} | |
| ui.stepper.compact | Step {n} of {total}: | قدم {n} از {total}: | Qadam {n} / {total}: | |
| ui.combobox.noMatch | No match | کچھ نہیں ملا | Kuch nahi mila | |
| ui.file.choose | Choose a photo | تصویر چنیں | Tasveer chunein | |
| ui.file.checking | Checking the photo… | تصویر چیک ہو رہی ہے… | Tasveer check ho rahi hai… | |
| ui.file.help | Tap to use the camera or gallery, or drag a photo here. JPG, PNG or WebP, up to 4 MB. | کیمرہ یا گیلری کے لیے دبائیں، یا تصویر یہاں کھینچ کر لائیں۔ JPG، PNG یا WebP، زیادہ سے زیادہ 4 MB۔ | Camera ya gallery ke liye dabayein, ya tasveer yahan khench kar layein. JPG, PNG ya WebP, zyada se zyada 4 MB. | |
| ui.file.remove | Remove this photo | یہ تصویر ہٹائیں | Yeh tasveer hatayein | |
| ui.file.preview | Preview of the chosen photo | چنی ہوئی تصویر کا نمونہ | Chuni hui tasveer ka namoona | |
| ui.progress | {value}% | {value}% | {value}% | |
| ui.profileCompletion | Profile completion | پروفائل کتنی مکمل ہے | Profile kitni mukammal hai | |

## Website texts: `notFound`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| notFound.title | Page not found | صفحہ نہیں ملا | Safha nahi mila | |
| notFound.text | The link may be old, or the address was typed wrongly. Nothing is broken. | شاید لنک پرانا ہے یا پتہ غلط لکھا گیا ہے۔ کچھ خراب نہیں ہوا۔ | Shayad link purana hai ya pata ghalat likha gaya hai. Kuch kharab nahi hua. | |
| notFound.home | Go to the home page | ہوم پیج پر جائیں | Home page par jayein | |
| notFound.searchLabel | Where do you want to go? | آپ کہاں جانا چاہتے ہیں؟ | Aap kahan jana chahte hain? | |
| notFound.searchPlaceholder | Type a page name, for example profile | صفحے کا نام لکھیں، مثلاً پروفائل | Safhe ka naam likhein, maslan profile | |
| notFound.places | Pages you can open | وہ صفحات جو آپ کھول سکتے ہیں | Woh safhaat jo aap khol sakte hain | |
| notFound.noPlace | No page with that name. Try another word. | اس نام کا کوئی صفحہ نہیں۔ کوئی اور لفظ آزمائیں۔ | Is naam ka koi safha nahi. Koi aur lafz azmayein. | |

## Website texts: `crash`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| crash.title | Something went wrong | کچھ غلط ہو گیا | Kuch ghalat ho gaya | |
| crash.text | The page could not be shown. Your saved data is safe. Please reload the page. | صفحہ دکھایا نہیں جا سکا۔ آپ کا محفوظ ڈیٹا ٹھیک ہے۔ براہ کرم صفحہ دوبارہ لوڈ کریں۔ | Safha dikhaya nahi ja saka. Aap ka save kiya hua data theek hai. Meharbani karke safha dobara load karein. | |
| crash.reload | Reload page | صفحہ دوبارہ لوڈ کریں | Safha dobara load karein | |

## Website texts: `guards`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| guards.wrongRoleTitle | This page is not for your account | یہ صفحہ آپ کے اکاؤنٹ کے لیے نہیں | Yeh safha aap ke account ke liye nahi | |
| guards.wrongRoleText | You do not have permission to open this page. | آپ کو یہ صفحہ کھولنے کی اجازت نہیں ہے۔ | Aap ko yeh safha kholne ki ijazat nahi hai. | |

## Website texts: `onboarding`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| onboarding.stepperLabel | Onboarding steps | پروفائل بنانے کے قدم | Profile banane ke qadam | |
| onboarding.steps.about | About you | آپ کے بارے میں | Aap ke baare mein | |
| onboarding.steps.work | Your work | آپ کا کام | Aap ka kaam | |
| onboarding.steps.skills | Your skills | آپ کے ہنر | Aap ke hunar | |
| onboarding.steps.proof | Proof of skills | ہنر کا ثبوت | Hunar ka saboot | |
| onboarding.steps.done | All set | سب تیار | Sab tayyar | |
| onboarding.leads.about | Your name, how to reach you, and where you work. Customers never see your phone or CNIC. | آپ کا نام، آپ سے رابطہ کیسے ہو، اور آپ کہاں کام کرتے ہیں۔ گاہک آپ کا فون یا شناختی کارڈ کبھی نہیں دیکھتے۔ | Aap ka naam, aap se rabta kaise ho, aur aap kahan kaam karte hain. Customer aap ka phone ya CNIC kabhi nahi dekhte. | |
| onboarding.leads.work | Your trade, experience and rates. This is what customers see first. | آپ کا کام، تجربہ اور ریٹ۔ گاہک سب سے پہلے یہی دیکھتے ہیں۔ | Aap ka kaam, tajurba aur rate. Customer sab se pehle yahi dekhte hain. | |
| onboarding.leads.skills | Tell us about your work. We suggest skills; you choose which ones to add. | اپنے کام کے بارے میں بتائیں۔ ہم ہنر تجویز کرتے ہیں؛ کون سے شامل کرنے ہیں، یہ آپ چنتے ہیں۔ | Apne kaam ke baare mein batayein. Hum hunar tajweez karte hain; kaun se shamil karne hain, yeh aap chuntay hain. | |
| onboarding.leads.proof | A photo of a certificate, a finished job or a reference letter makes a skill stronger. An admin checks every photo. | سرٹیفکیٹ، مکمل کام یا سفارشی خط کی تصویر سے ہنر مضبوط ہوتا ہے۔ ایڈمن ہر تصویر چیک کرتا ہے۔ | Certificate, mukammal kaam ya sifarishi khat ki tasveer se hunar mazboot hota hai. Admin har tasveer check karta hai. | |
| onboarding.leads.done | Your profile is ready. Here is what we saved. | آپ کی پروفائل تیار ہے۔ یہ ہے جو ہم نے محفوظ کیا۔ | Aap ki profile tayyar hai. Yeh hai jo hum ne save kiya. | |
| onboarding.saveContinue | Save and continue | محفوظ کریں اور آگے بڑھیں | Save karein aur aagay barhein | |
| onboarding.saved | Saved | محفوظ ہو گیا | Save ho gaya | |
| onboarding.progressError | Could not load your progress. Please reload the page. | آپ کی پیش رفت لوڈ نہیں ہو سکی۔ براہ کرم صفحہ دوبارہ لوڈ کریں۔ | Aap ki progress load nahi ho saki. Meharbani karke safha dobara load karein. | |
| onboarding.skillsNeeded | Add at least one skill to continue: use “Find my skills”, or | آگے بڑھنے کے لیے کم از کم ایک ہنر شامل کریں: "میرے ہنر ڈھونڈیں" استعمال کریں، یا | Aagay barhne ke liye kam az kam aik hunar shamil karein: "Mere hunar dhoondein" use karein, ya | |
| onboarding.skillsNeededLink | search the skill list | ہنر کی فہرست میں تلاش کریں | hunar ki list mein talaash karein | |
| onboarding.celebrate | Well done! Your profile is ready. | شاباش! آپ کی پروفائل تیار ہے۔ | Shabash! Aap ki profile tayyar hai. | |
| onboarding.summary.name | Name | نام | Naam | |
| onboarding.summary.workerId | Your worker ID | آپ کی کاریگر آئی ڈی | Aap ki karigar ID | |
| onboarding.summary.trade | Trade | کام | Kaam | |
| onboarding.summary.skills | Skills | ہنر | Hunar | |
| onboarding.summary.skillsCount | one: {count} added / other: {count} added | one: {count} شامل / other: {count} شامل | one: {count} shamil / other: {count} shamil | |
| onboarding.summary.proof | Proof | ثبوت | Saboot | |
| onboarding.summary.proofCount | one: {count} waiting for review / other: {count} waiting for review | one: {count} جانچ کا انتظار / other: {count} جانچ کا انتظار | one: {count} jaanch ka intezar / other: {count} jaanch ka intezar | |
| onboarding.summary.identity | Identity | شناخت | Shanakht | |
| onboarding.addCnic | Add your CNIC on your profile so an admin can check your identity. | اپنی پروفائل پر شناختی کارڈ نمبر لکھیں تاکہ ایڈمن آپ کی شناخت چیک کر سکے۔ | Apni profile par CNIC number likhein taake admin aap ki shanakht check kar sake. | |
| onboarding.goDashboard | Go to my dashboard | میرے ڈیش بورڈ پر جائیں | Mere dashboard par jayein | |
| onboarding.nextTitle | What next? | اب آگے کیا کریں؟ | Ab aage kya karein? | |
| onboarding.proof.addTitle | Add a photo | تصویر لگائیں | Tasveer lagayein | |
| onboarding.proof.addText | One photo for one skill. You can add more later from your profile. | ایک ہنر کے لیے ایک تصویر۔ بعد میں اپنی پروفائل سے اور بھی لگا سکتے ہیں۔ | Aik hunar ke liye aik tasveer. Baad mein apni profile se aur bhi laga sakte hain. | |
| onboarding.proof.soFar | Your proof so far | اب تک کے آپ کے ثبوت | Ab tak ke aap ke saboot | |
| onboarding.proof.skip | Skip for now | ابھی چھوڑ دیں | Abhi chhor dein | |

## Website texts: `about`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| about.fullName | Full name | پورا نام | Poora naam | |
| about.phone | Phone number | فون نمبر | Phone number | |
| about.phoneHint | Customers do not see your number. | گاہک آپ کا نمبر نہیں دیکھتے۔ | Customer aap ka number nahi dekhte. | |
| about.whatsapp | WhatsApp number | واٹس ایپ نمبر | WhatsApp number | |
| about.cnic | CNIC number | شناختی کارڈ نمبر | CNIC number | |
| about.cnicSavedPlaceholder | Saved (hidden). Type only to change it | محفوظ ہے (چھپا ہوا)۔ صرف بدلنے کے لیے لکھیں | Save hai (chupa hua). Sirf badalne ke liye likhein | |
| about.cnicHint | Only verified admins can see your CNIC. It is stored encrypted. | صرف تصدیق شدہ ایڈمن آپ کا شناختی کارڈ دیکھ سکتے ہیں۔ یہ خفیہ طریقے سے محفوظ ہوتا ہے۔ | Sirf tasdeeq shuda admin aap ka CNIC dekh sakte hain. Yeh khufia tareeqay se save hota hai. | |
| about.city | City | شہر | Shehar | |
| about.cityPlaceholder | Rawalpindi | راولپنڈی | Rawalpindi | |
| about.area | Area | علاقہ | Ilaqa | |
| about.areaPlaceholder | Satellite Town | سیٹلائٹ ٹاؤن | Satellite Town | |
| about.areaHint | Private. Only you and admins see it. | نجی۔ صرف آپ اور ایڈمن دیکھتے ہیں۔ | Private. Sirf aap aur admin dekhte hain. | |
| about.emergency | Emergency contact | ایمرجنسی رابطہ | Emergency rabta | |
| about.emergencyPlaceholder | Brother Ahmed, 0300 1234567 | بھائی احمد، 0300 1234567 | Bhai Ahmed, 0300 1234567 | |
| about.languages | Languages you speak | آپ کون سی زبانیں بولتے ہیں | Aap kaun si zabaanein boltay hain | |
| about.languagesPlaceholder | Urdu, Punjabi | اردو، پنجابی | Urdu, Punjabi | |
| about.languagesHint | Separate with commas. | کامے (،) سے الگ کریں۔ | Comma (,) se alag karein. | |
| about.saveFailed | Could not save. Please check the fields. | محفوظ نہیں ہو سکا۔ براہ کرم خانے چیک کریں۔ | Save nahi ho saka. Meharbani karke khanay check karein. | |

## Website texts: `work`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| work.trade | Main trade | اصل کام | Asal kaam | |
| work.tradePlaceholder | Choose a trade | کام چنیں | Kaam chunein | |
| work.occupation | Occupation | پیشہ | Pesha | |
| work.occupationPlaceholder | Electrician | الیکٹریشن | Electrician | |
| work.experience | Years of experience | تجربے کے سال | Tajurbay ke saal | |
| work.experienceHint | Whole years. Write 0 if you are new. | پورے سال۔ نئے ہیں تو 0 لکھیں۔ | Poore saal. Naye hain to 0 likhein. | |
| work.availability | Availability | دستیابی | Dastiyabi | |
| work.hourly | Rate per hour (PKR) | فی گھنٹہ ریٹ (روپے) | Fi ghanta rate (rupay) | |
| work.daily | Rate per day (PKR) | فی دن ریٹ (روپے) | Fi din rate (rupay) | |
| work.dailyHint | Give at least one rate. | کم از کم ایک ریٹ لکھیں۔ | Kam az kam aik rate likhein. | |
| work.bio | Short bio | مختصر تعارف | Mukhtasar taaruf | |
| work.bioPlaceholder | What kind of work do you do best? | آپ کون سا کام سب سے اچھا کرتے ہیں؟ | Aap kaun sa kaam sab se acha karte hain? | |
| work.historyLegend | Past work (optional) | پرانا کام (اختیاری) | Purana kaam (ikhtiyari) | |
| work.job | Job {n} | کام {n} | Kaam {n} | |
| work.removeJob | Remove job {n} | کام {n} ہٹائیں | Kaam {n} hatayein | |
| work.jobTitle | Job title | کام کا نام | Kaam ka naam | |
| work.client | Client or place | گاہک یا جگہ | Customer ya jagah | |
| work.clientHint | Not shown to customers. | گاہکوں کو نہیں دکھایا جاتا۔ | Customers ko nahi dikhaya jata. | |
| work.duration | Duration | مدت | Muddat | |
| work.durationPlaceholder | 2 weeks | 2 ہفتے | 2 haftay | |
| work.whatYouDid | What you did | آپ نے کیا کیا | Aap ne kya kiya | |
| work.addJob | Add a past job | پرانا کام شامل کریں | Purana kaam shamil karein | |
| work.taxonomyError | Could not load the list of trades. Please reload the page. | کاموں کی فہرست لوڈ نہیں ہو سکی۔ براہ کرم صفحہ دوبارہ لوڈ کریں۔ | Kaamon ki list load nahi ho saki. Meharbani karke safha dobara load karein. | |

## Website texts: `skills`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| skills.describeTitle | Describe your work | اپنے کام کے بارے میں بتائیں | Apne kaam ke baare mein batayein | |
| skills.describeLabel | In your own words: what work do you do, and for how long? | اپنے الفاظ میں: آپ کیا کام کرتے ہیں، اور کتنے عرصے سے؟ | Apne alfaaz mein: aap kya kaam karte hain, aur kitne arsay se? | |
| skills.describeHint | Urdu, Roman Urdu or English are all fine. | اردو، رومن اردو یا انگریزی، سب ٹھیک ہیں۔ | Urdu, Roman Urdu ya English, sab theek hain. | |
| skills.seeExample | See an example: | مثال دیکھیں: | Misaal dekhein: | |
| skills.examples.ur | اردو مثال | اردو مثال | اردو مثال | |
| skills.examples.roman | Roman Urdu example | رومن اردو مثال | Roman Urdu misaal | |
| skills.examples.en | English example | انگریزی مثال | English misaal | |
| skills.find | Find my skills | میرے ہنر ڈھونڈیں | Mere hunar dhoondein | |
| skills.suggestionsTitle | Skill suggestions | تجویز کیے گئے ہنر | Tajweez kiye gaye hunar | |
| skills.honest | Suggestions come from a word list. Please check them. | یہ تجاویز ایک الفاظ کی فہرست سے آتی ہیں۔ براہ کرم انہیں چیک کریں۔ | Yeh tajaweez aik alfaaz ki list se aati hain. Meharbani karke inhein check karein. | |
| skills.tie | Your text matches more than one trade equally. Choose your main trade on your profile. | آپ کا متن ایک سے زیادہ کاموں سے برابر ملتا ہے۔ اپنی پروفائل پر اپنا اصل کام چنیں۔ | Aap ka text aik se zyada kaamon se barabar milta hai. Apni profile par apna asal kaam chunein. | |
| skills.alreadySaved | Already on your profile | پہلے سے آپ کی پروفائل پر ہے | Pehle se aap ki profile par hai | |
| skills.foundBecause | Found because you wrote: | اس لیے ملا کیونکہ آپ نے لکھا: | Is liye mila kyunke aap ne likha: | |
| skills.addSelected | Add selected skills | چنے ہوئے ہنر شامل کریں | Chunay hue hunar shamil karein | |
| skills.addSelectedCount | Add selected skills ({count}) | چنے ہوئے ہنر شامل کریں ({count}) | Chunay hue hunar shamil karein ({count}) | |
| skills.alsoFound | Also found in your text | آپ کے متن میں یہ بھی ملا | Aap ke text mein yeh bhi mila | |
| skills.foundTrade | Trade: | کام: | Kaam: | |
| skills.foundExperience | Experience: | تجربہ: | Tajurba: | |
| skills.wholeYears | (your profile keeps whole years: {years}) | (آپ کی پروفائل پورے سال رکھتی ہے: {years}) | (aap ki profile poore saal rakhti hai: {years}) | |
| skills.over60 | A number of years over 60 was ignored. Please check your text. | 60 سے زیادہ سال والا نمبر نظر انداز کیا گیا۔ براہ کرم اپنا متن چیک کریں۔ | 60 se zyada saal wala number nazar andaaz kiya gaya. Meharbani karke apna text check karein. | |
| skills.useThese | Use these on my profile | یہ میری پروفائل پر لگائیں | Yeh meri profile par lagayein | |
| skills.savedTitle | Skills on your profile | آپ کی پروفائل پر ہنر | Aap ki profile par hunar | |
| skills.savedText | A skill shows "Self-declared" until an admin approves a photo of proof for it. | جب تک ایڈمن کسی ہنر کے ثبوت کی تصویر منظور نہ کرے، وہ "خود بتایا ہوا" دکھتا ہے۔ | Jab tak admin kisi hunar ke saboot ki tasveer manzoor na kare, woh "Khud bataya hua" dikhta hai. | |
| skills.noneTitle | No skills yet | ابھی کوئی ہنر نہیں | Abhi koi hunar nahi | |
| skills.noneText | Describe your work above, or pick a skill from the list below. | اوپر اپنے کام کے بارے میں لکھیں، یا نیچے کی فہرست سے ہنر چنیں۔ | Oopar apne kaam ke baare mein likhein, ya neechay ki list se hunar chunein. | |
| skills.custom | Custom | اپنا لکھا ہوا | Apna likha hua | |
| skills.remove | Remove {name} | {name} ہٹائیں | {name} hatayein | |
| skills.searchLabel | Add a skill from the list | فہرست سے ہنر شامل کریں | List se hunar shamil karein | |
| skills.searchHint | Type to search, then press Enter or tap a skill. | تلاش کے لیے لکھیں، پھر Enter دبائیں یا ہنر پر ٹیپ کریں۔ | Talaash ke liye likhein, phir Enter dabayein ya hunar par tap karein. | |
| skills.searchPlaceholder | e.g. Geyser installation | جیسے گیزر لگانا | jaise Geyser lagana | |
| skills.removeTitle | Remove this skill? | یہ ہنر ہٹا دیں؟ | Yeh hunar hata dein? | |
| skills.removeText | "{name}" will be removed from your profile. You can add it again later. | "{name}" آپ کی پروفائل سے ہٹ جائے گا۔ آپ اسے بعد میں دوبارہ شامل کر سکتے ہیں۔ | "{name}" aap ki profile se hat jayega. Aap isay baad mein dobara shamil kar sakte hain. | |
| skills.removeConfirm | Remove skill | ہنر ہٹائیں | Hunar hatayein | |
| skills.added | one: {count} skill added / other: {count} skills added | one: {count} ہنر شامل ہو گیا / other: {count} ہنر شامل ہو گئے | one: {count} hunar shamil ho gaya / other: {count} hunar shamil ho gaye | |
| skills.addedText | They show as "Self-declared" until proof is checked. | ثبوت چیک ہونے تک یہ "خود بتایا ہوا" دکھیں گے۔ | Saboot check honay tak yeh "Khud bataya hua" dikhein ge. | |
| skills.addedOne | "{name}" added | "{name}" شامل ہو گیا | "{name}" shamil ho gaya | |
| skills.removed | "{name}" removed | "{name}" ہٹا دیا گیا | "{name}" hata diya gaya | |
| skills.profileUpdated | Profile updated | پروفائل اپ ڈیٹ ہو گئی | Profile update ho gayi | |
| skills.profileUpdatedText | Trade and experience were saved from your text. | کام اور تجربہ آپ کے متن سے محفوظ کر دیا گیا۔ | Kaam aur tajurba aap ke text se save kar diya gaya. | |
| skills.loadFailed | Could not load your skills. | آپ کے ہنر لوڈ نہیں ہو سکے۔ | Aap ke hunar load nahi ho sake. | |
| skills.extractFailed | Could not read the text. Please try again. | متن پڑھا نہیں جا سکا۔ براہ کرم دوبارہ کوشش کریں۔ | Text parha nahi ja saka. Meharbani karke dobara koshish karein. | |
| skills.addFailed | Could not add the skills. | ہنر شامل نہیں ہو سکے۔ | Hunar shamil nahi ho sake. | |
| skills.addOneFailed | Could not add the skill. | ہنر شامل نہیں ہو سکا۔ | Hunar shamil nahi ho saka. | |
| skills.removeFailed | Could not remove the skill. | ہنر ہٹایا نہیں جا سکا۔ | Hunar hataya nahi ja saka. | |
| skills.profileFailed | Could not update the profile. | پروفائل اپ ڈیٹ نہیں ہو سکی۔ | Profile update nahi ho saki. | |
| skills.noMatch.no_trade_words | We did not find any trade words. Try naming your work, for example "wiring", "plumbing" or "safai". You can also add skills from the list below. | ہمیں کام سے متعلق کوئی لفظ نہیں ملا۔ اپنے کام کا نام لکھیں، جیسے "وائرنگ"، "پلمبنگ" یا "صفائی"۔ آپ نیچے کی فہرست سے بھی ہنر شامل کر سکتے ہیں۔ | Humein kaam se mutaliq koi lafz nahi mila. Apne kaam ka naam likhein, jaise "wiring", "plumbing" ya "safai". Aap neechay ki list se bhi hunar shamil kar sakte hain. | |
| skills.noMatch.negative_phrase | It sounds like you are new to this work. That is fine: you can add skills from the list below when you are ready. | لگتا ہے آپ اس کام میں نئے ہیں۔ کوئی بات نہیں: جب تیار ہوں تو نیچے کی فہرست سے ہنر شامل کر لیں۔ | Lagta hai aap is kaam mein naye hain. Koi baat nahi: jab tayyar hon to neechay ki list se hunar shamil kar lein. | |

## Website texts: `voice`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| voice.start | Use voice typing | بول کر لکھیں | Bol kar likhein | |
| voice.stop | Stop voice typing | بول کر لکھنا بند کریں | Bol kar likhna band karein | |
| voice.listening | Listening… please speak now. | سن رہے ہیں… اب بولیں۔ | Sun rahe hain… ab bolein. | |
| voice.bestIn | Works best in Google Chrome on desktop or Android. | یہ کمپیوٹر یا اینڈرائیڈ پر گوگل کروم میں سب سے اچھا چلتا ہے۔ | Yeh computer ya Android par Google Chrome mein sab se acha chalta hai. | |
| voice.notice | Voice typing uses your browser's speech service, which may send your audio to an online service. Use the text box if you prefer. | بول کر لکھنے میں آپ کے براؤزر کی آواز والی سروس استعمال ہوتی ہے، جو آپ کی آواز کسی آن لائن سروس کو بھیج سکتی ہے۔ چاہیں تو ٹیکسٹ باکس میں لکھیں۔ | Bol kar likhne mein aap ke browser ki awaaz wali service use hoti hai, jo aap ki awaaz kisi online service ko bhej sakti hai. Chahein to text box mein likhein. | |
| voice.alternatives | You can also use your phone keyboard's microphone (for example Gboard), or Windows voice typing with **Win + H**. | آپ اپنے فون کے کی بورڈ کا مائیک (جیسے Gboard) بھی استعمال کر سکتے ہیں، یا ونڈوز میں **Win + H** سے بول کر لکھیں۔ | Aap apne phone ke keyboard ka mic (jaise Gboard) bhi use kar sakte hain, ya Windows mein **Win + H** se bol kar likhein. | |
| voice.recognisedAs | Speech is recognised as: {language}. | آواز اس زبان میں سمجھی جائے گی: {language}۔ | Awaaz is zabaan mein samjhi jayegi: {language}. | |
| voice.speechLanguages.ur-PK | Urdu | اردو | Urdu | |
| voice.speechLanguages.en-US | English | انگریزی | English | |
| voice.errors.not-allowed | The microphone is blocked for this website. Click the lock icon next to the address, allow the microphone, then try again. | اس ویب سائٹ کے لیے مائیک بند ہے۔ ایڈریس کے ساتھ تالے کے نشان پر کلک کریں، مائیک کی اجازت دیں، پھر دوبارہ کوشش کریں۔ | Is website ke liye mic band hai. Address ke saath taalay ke nishan par click karein, mic ki ijazat dein, phir dobara koshish karein. | |
| voice.errors.service-not-allowed | Voice typing is turned off in this browser. Allow speech recognition in the browser settings, or use your keyboard microphone. | اس براؤزر میں بول کر لکھنا بند ہے۔ براؤزر کی سیٹنگ میں اجازت دیں، یا کی بورڈ کا مائیک استعمال کریں۔ | Is browser mein bol kar likhna band hai. Browser ki settings mein ijazat dein, ya keyboard ka mic use karein. | |
| voice.errors.network | The browser's speech service could not be reached. Check your internet connection, or type instead. | براؤزر کی آواز والی سروس سے رابطہ نہیں ہو سکا۔ انٹرنیٹ چیک کریں، یا لکھ کر بتائیں۔ | Browser ki awaaz wali service se rabta nahi ho saka. Internet check karein, ya likh kar batayein. | |
| voice.errors.language-not-supported | This browser cannot recognise {language} speech. Switch the website to English or Roman Urdu, or type instead. | یہ براؤزر {language} آواز نہیں سمجھ سکتا۔ ویب سائٹ کی زبان انگریزی یا رومن اردو کر دیں، یا لکھ کر بتائیں۔ | Yeh browser {language} awaaz nahi samajh sakta. Website ki zabaan English ya Roman Urdu kar dein, ya likh kar batayein. | |
| voice.errors.no-speech | No speech was heard. Press "Use voice typing" again and speak close to the microphone. | کوئی آواز سنائی نہیں دی۔ "بول کر لکھیں" دوبارہ دبائیں اور مائیک کے قریب بولیں۔ | Koi awaaz sunai nahi di. "Bol kar likhein" dobara dabayein aur mic ke qareeb bolein. | |
| voice.errors.audio-capture | No microphone was found. Connect a microphone, or type instead. | کوئی مائیک نہیں ملا۔ مائیک لگائیں، یا لکھ کر بتائیں۔ | Koi mic nahi mila. Mic lagayein, ya likh kar batayein. | |
| voice.errors.aborted | Voice typing was stopped. | بول کر لکھنا روک دیا گیا۔ | Bol kar likhna rok diya gaya. | |
| voice.errors.other | Voice typing did not work. Please type instead. | بول کر لکھنا کام نہیں کیا۔ براہ کرم لکھ کر بتائیں۔ | Bol kar likhna kaam nahi kiya. Meharbani karke likh kar batayein. | |

## Website texts: `evidence`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| evidence.consent | I own this photo or have permission to share it, and it shows no other person's private information. | یہ تصویر میری ہے یا مجھے اسے دکھانے کی اجازت ہے، اور اس میں کسی دوسرے شخص کی نجی معلومات نہیں ہیں۔ | Yeh tasveer meri hai ya mujhe isay dikhane ki ijazat hai, aur is mein kisi doosray shakhs ki private maloomat nahi hain. | |
| evidence.types.certificate.title | Certificate photo | سرٹیفکیٹ کی تصویر | Certificate ki tasveer | |
| evidence.types.certificate.description | A course or trade certificate. | کسی کورس یا ہنر کا سرٹیفکیٹ۔ | Kisi course ya hunar ka certificate. | |
| evidence.types.work_photo.title | Work photo | کام کی تصویر | Kaam ki tasveer | |
| evidence.types.work_photo.description | A job you finished (no faces, no house numbers). | آپ کا مکمل کیا ہوا کام (کوئی چہرہ نہیں، کوئی مکان نمبر نہیں)۔ | Aap ka mukammal kiya hua kaam (koi chehra nahi, koi makaan number nahi). | |
| evidence.types.reference_letter.title | Reference letter photo | سفارشی خط کی تصویر | Sifarishi khat ki tasveer | |
| evidence.types.reference_letter.description | A letter from a client or employer. | کسی گاہک یا مالک کا خط۔ | Kisi customer ya maalik ka khat. | |
| evidence.reasons.unclear | Photo is unclear | تصویر صاف نہیں | Tasveer saaf nahi | |
| evidence.reasons.not_relevant | Not relevant to the skill | ہنر سے متعلق نہیں | Hunar se mutaliq nahi | |
| evidence.reasons.wrong_skill | Belongs to another skill | کسی دوسرے ہنر کی ہے | Kisi doosray hunar ki hai | |
| evidence.reasons.other | Other | دوسری | Doosri | |
| evidence.form.label | Upload proof | ثبوت اپ لوڈ کریں | Saboot upload karein | |
| evidence.form.skill | Which skill does this photo prove? | یہ تصویر کس ہنر کا ثبوت ہے؟ | Yeh tasveer kis hunar ka saboot hai? | |
| evidence.form.skillPlaceholder | Choose a skill | ہنر چنیں | Hunar chunein | |
| evidence.form.kind | Kind of proof | ثبوت کی قسم | Saboot ki qisam | |
| evidence.form.photo | Photo | تصویر | Tasveer | |
| evidence.form.photoHint | Your photo is checked by an admin. Location data inside the photo is removed. | آپ کی تصویر ایڈمن چیک کرتا ہے۔ تصویر کے اندر کی جگہ (لوکیشن) کی معلومات ہٹا دی جاتی ہے۔ | Aap ki tasveer admin check karta hai. Tasveer ke andar ki location ki maloomat hata di jati hai. | |
| evidence.form.title | Short title (optional) | مختصر عنوان (اختیاری) | Mukhtasar unwaan (ikhtiyari) | |
| evidence.form.titlePlaceholder | e.g. Wiring of a new house in G-10 | جیسے G-10 میں نئے گھر کی وائرنگ | jaise G-10 mein naye ghar ki wiring | |
| evidence.form.uploading | Uploading | اپ لوڈ ہو رہا ہے | Upload ho raha hai | |
| evidence.form.submit | Upload proof | ثبوت اپ لوڈ کریں | Saboot upload karein | |
| evidence.form.failed | The upload did not work. Please try again. | اپ لوڈ نہیں ہوا۔ براہ کرم دوبارہ کوشش کریں۔ | Upload nahi hua. Meharbani karke dobara koshish karein. | |
| evidence.summary.approved | one: Evidence: {count} approved / other: Evidence: {count} approved | one: ثبوت: {count} منظور / other: ثبوت: {count} منظور | one: Saboot: {count} manzoor / other: Saboot: {count} manzoor | |
| evidence.summary.strength | Strength: {strength} | مضبوطی: {strength} | Mazbooti: {strength} | |
| evidence.list.addProof | Add proof | ثبوت لگائیں | Saboot lagayein | |
| evidence.list.addProofFor | Add proof for {skill} | {skill} کا ثبوت لگائیں | {skill} ka saboot lagayein | |
| evidence.list.proofFor | Proof for {skill} | {skill} کے ثبوت | {skill} ke saboot | |
| evidence.list.photoAlt | {type} for {skill} | {skill} کے لیے {type} | {skill} ke liye {type} | |
| evidence.list.reason | Reason: {reason} | وجہ: {reason} | Wajah: {reason} | |
| evidence.list.adminNote | Admin note: {note} | ایڈمن کا نوٹ: {note} | Admin ka note: {note} | |
| evidence.list.deleteItem | Delete {name} | {name} ہٹائیں | {name} hatayein | |
| evidence.list.none | No proof added yet. | ابھی کوئی ثبوت نہیں لگایا۔ | Abhi koi saboot nahi lagaya. | |
| evidence.list.noSkills | No skills yet | ابھی کوئی ہنر نہیں | Abhi koi hunar nahi | |
| evidence.list.deleteTitle | Delete this proof? | یہ ثبوت ہٹا دیں؟ | Yeh saboot hata dein? | |
| evidence.list.deleteText | The photo will be removed. You can upload another one later. | تصویر ہٹ جائے گی۔ آپ بعد میں دوسری اپ لوڈ کر سکتے ہیں۔ | Tasveer hat jayegi. Aap baad mein doosri upload kar sakte hain. | |
| evidence.list.deleteConfirm | Delete proof | ثبوت ہٹائیں | Saboot hatayein | |
| evidence.uploaded | Photo uploaded | تصویر اپ لوڈ ہو گئی | Tasveer upload ho gayi | |
| evidence.uploadedText | It is now waiting for an admin to review it. | اب یہ ایڈمن کی جانچ کا انتظار کر رہی ہے۔ | Ab yeh admin ki jaanch ka intezar kar rahi hai. | |
| evidence.deleted | Proof deleted | ثبوت ہٹا دیا گیا | Saboot hata diya gaya | |
| evidence.deleteFailed | Could not delete | ہٹایا نہیں جا سکا | Hataya nahi ja saka | |

## Website texts: `dashboard`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| dashboard.welcome | Welcome, {name} | خوش آمدید، {name} | Khush aamdeed, {name} | |
| dashboard.workerId | Worker ID {id} | کاریگر آئی ڈی {id} | Karigar ID {id} | |
| dashboard.viewProfile | View my profile | میری پروفائل دیکھیں | Meri profile dekhein | |
| dashboard.editProfile | Edit profile | پروفائل تبدیل کریں | Profile badlein | |
| dashboard.completionTitle | Profile completion | پروفائل کتنی مکمل ہے | Profile kitni mukammal hai | |
| dashboard.completionText | A complete profile helps customers choose you. | مکمل پروفائل سے گاہکوں کو آپ کو چننے میں آسانی ہوتی ہے۔ | Mukammal profile se customers ko aap ko chunne mein asaani hoti hai. | |
| dashboard.identityTitle | Identity | شناخت | Shanakht | |
| dashboard.identityText.Unverified | Add your CNIC on your profile so an admin can check your identity. | اپنی پروفائل پر شناختی کارڈ نمبر لکھیں تاکہ ایڈمن آپ کی شناخت چیک کر سکے۔ | Apni profile par CNIC number likhein taake admin aap ki shanakht check kar sake. | |
| dashboard.identityText.Pending | An admin will check your CNIC in person or on a video call. | ایڈمن آپ کا شناختی کارڈ سامنے یا ویڈیو کال پر چیک کرے گا۔ | Admin aap ka CNIC saamne ya video call par check karega. | |
| dashboard.identityText.Verified | An admin has checked your identity. Customers see "Identity verified". | ایڈمن نے آپ کی شناخت چیک کر لی ہے۔ گاہک "شناخت کی تصدیق ہو گئی" دیکھتے ہیں۔ | Admin ne aap ki shanakht check kar li hai. Customer "Shanakht ki tasdeeq ho gayi" dekhte hain. | |
| dashboard.identityText.Rejected | Your identity check was not accepted. Please read the reason and update your profile. | آپ کی شناخت قبول نہیں ہوئی۔ براہ کرم وجہ پڑھیں اور اپنی پروفائل ٹھیک کریں۔ | Aap ki shanakht qabool nahi hui. Meharbani karke wajah parhein aur apni profile theek karein. | |
| dashboard.adminReason | Reason from the admin | ایڈمن کی بتائی ہوئی وجہ | Admin ki batayi hui wajah | |
| dashboard.skillsTitle | Your skills | آپ کے ہنر | Aap ke hunar | |
| dashboard.skillsEmpty | No skills yet. Add them so customers can find you. | ابھی کوئی ہنر نہیں۔ ہنر شامل کریں تاکہ گاہک آپ کو ڈھونڈ سکیں۔ | Abhi koi hunar nahi. Hunar shamil karein taake customer aap ko dhoond sakein. | |
| dashboard.skillsCount | one: {count} skill on your profile / other: {count} skills on your profile | one: آپ کی پروفائل پر {count} ہنر / other: آپ کی پروفائل پر {count} ہنر | one: Aap ki profile par {count} hunar / other: Aap ki profile par {count} hunar | |
| dashboard.proofTitle | Proof of skills | ہنر کا ثبوت | Hunar ka saboot | |
| dashboard.proofCounts | Approved: {approved} · Waiting: {pending} · Not accepted: {rejected} | منظور: {approved} · انتظار میں: {pending} · قبول نہیں ہوئے: {rejected} | Manzoor: {approved} · Intezar mein: {pending} · Qabool nahi hue: {rejected} | |
| dashboard.proofEmpty | No proof yet. A photo of a certificate or finished work makes a skill stronger. | ابھی کوئی ثبوت نہیں۔ سرٹیفکیٹ یا مکمل کام کی تصویر سے ہنر مضبوط ہوتا ہے۔ | Abhi koi saboot nahi. Certificate ya mukammal kaam ki tasveer se hunar mazboot hota hai. | |
| dashboard.nextTitle | Next steps | اگلے قدم | Aglay qadam | |
| dashboard.next.cnic | Add your CNIC for the identity check | شناخت کی جانچ کے لیے شناختی کارڈ نمبر لکھیں | Shanakht ki jaanch ke liye CNIC number likhein | |
| dashboard.next.skills | Add your skills | اپنے ہنر شامل کریں | Apne hunar shamil karein | |
| dashboard.next.job | Add a past job | کوئی پرانا کام شامل کریں | Koi purana kaam shamil karein | |
| dashboard.next.proof | Add proof for your skills | اپنے ہنر کا ثبوت لگائیں | Apne hunar ka saboot lagayein | |
| dashboard.doIt | Do it | ابھی کریں | Abhi karein | |
| dashboard.allDone | All done. Your profile is complete. | سب ہو گیا۔ آپ کی پروفائل مکمل ہے۔ | Sab ho gaya. Aap ki profile mukammal hai. | |

## Website texts: `profile`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| profile.title | My profile | میری پروفائل | Meri profile | |
| profile.edit | Edit profile | پروفائل تبدیل کریں | Profile badlein | |
| profile.viewToggle | See what customers see | دیکھیں گاہک کیا دیکھتے ہیں | Dekhein customer kya dekhte hain | |
| profile.viewToggleHint | Shows exactly the data the server sends to customers. | بالکل وہی معلومات دکھاتا ہے جو سرور گاہکوں کو بھیجتا ہے۔ | Bilkul wohi maloomat dikhata hai jo server customers ko bhejta hai. | |
| profile.publicBanner | This is what customers see. Private details, proof photos and client names are not included. | یہ وہ ہے جو گاہک دیکھتے ہیں۔ نجی معلومات، ثبوت کی تصویریں اور گاہکوں کے نام شامل نہیں ہیں۔ | Yeh woh hai jo customer dekhte hain. Private maloomat, saboot ki tasveerein aur customers ke naam shamil nahi hain. | |
| profile.notListed | Customers cannot find you in search yet: add your trade in "Work and rates". | ابھی گاہک آپ کو تلاش میں نہیں ڈھونڈ سکتے: "کام اور ریٹ" میں اپنا کام لکھیں۔ | Abhi customer aap ko talaash mein nahi dhoond sakte: "Kaam aur rate" mein apna kaam likhein. | |
| profile.about | About | تعارف | Taaruf | |
| profile.noBio | No bio yet. | ابھی کوئی تعارف نہیں۔ | Abhi koi taaruf nahi. | |
| profile.workAndRates | Work and rates | کام اور ریٹ | Kaam aur rate | |
| profile.experience | Experience | تجربہ | Tajurba | |
| profile.perHour | Per hour | فی گھنٹہ | Fi ghanta | |
| profile.perDay | Per day | فی دن | Fi din | |
| profile.availability | Availability | دستیابی | Dastiyabi | |
| profile.languages | Languages | زبانیں | Zabaanein | |
| profile.skills | Skills | ہنر | Hunar | |
| profile.noSkills | No skills added yet. | ابھی کوئی ہنر شامل نہیں۔ | Abhi koi hunar shamil nahi. | |
| profile.proof | Proof of skills | ہنر کا ثبوت | Hunar ka saboot | |
| profile.noProof | No proof added yet. | ابھی کوئی ثبوت نہیں لگایا۔ | Abhi koi saboot nahi lagaya. | |
| profile.history | Work history | پرانا کام | Purana kaam | |
| profile.noHistory | No past jobs added yet. | ابھی کوئی پرانا کام شامل نہیں۔ | Abhi koi purana kaam shamil nahi. | |
| profile.clientPrivate | Client: {client} (private) | گاہک: {client} (نجی) | Customer: {client} (private) | |
| profile.private | Private | نجی | Private | |
| profile.privateNote | Only you and the admins can see this section. | یہ حصہ صرف آپ اور ایڈمن دیکھ سکتے ہیں۔ | Yeh hissa sirf aap aur admin dekh sakte hain. | |
| profile.phone | Phone | فون | Phone | |
| profile.whatsapp | WhatsApp | واٹس ایپ | WhatsApp | |
| profile.email | Email | ای میل | Email | |
| profile.area | Area | علاقہ | Ilaqa | |
| profile.emergency | Emergency contact | ایمرجنسی رابطہ | Emergency rabta | |
| profile.cnic | CNIC | شناختی کارڈ | CNIC | |
| profile.cnicSaved | Saved and hidden | محفوظ اور چھپا ہوا | Save aur chupa hua | |
| profile.cnicMissing | Not added yet | ابھی شامل نہیں کیا | Abhi shamil nahi kiya | |
| profile.notAdded | Not added | شامل نہیں | Shamil nahi | |
| profile.workerId | Worker ID | کاریگر آئی ڈی | Karigar ID | |
| profile.contactNote | Contact details are shared after a booking is accepted (coming in a later module). | رابطے کی معلومات بکنگ قبول ہونے کے بعد دی جاتی ہیں (یہ حصہ بعد کے ماڈیول میں آئے گا)۔ | Rabtay ki maloomat booking qabool honay ke baad di jati hain (yeh hissa baad ke module mein aayega). | |
| profile.contactTitle | How to contact this worker | اس کاریگر سے رابطہ کیسے کریں | Is karigar se rabta kaise karein | |
| profile.skillsHelp | "Verified by evidence" means an admin approved a photo of a certificate, finished work or a reference letter. "Self-declared" means there is no approved proof yet. | "ثبوت سے تصدیق شدہ" کا مطلب ہے کہ ایڈمن نے سرٹیفکیٹ، مکمل کام یا سفارشی خط کی تصویر منظور کی ہے۔ "خود بتایا ہوا" کا مطلب ہے کہ ابھی کوئی منظور شدہ ثبوت نہیں۔ | "Saboot se tasdeeq shuda" ka matlab hai ke admin ne certificate, mukammal kaam ya sifarishi khat ki tasveer manzoor ki hai. "Khud bataya hua" ka matlab hai ke abhi koi manzoor shuda saboot nahi. | |
| profile.loadFailed | Could not load your profile. | آپ کی پروفائل لوڈ نہیں ہو سکی۔ | Aap ki profile load nahi ho saki. | |

## Website texts: `editor`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| editor.title | Edit profile | پروفائل تبدیل کریں | Profile badlein | |
| editor.lead | Change any part of your profile. Each section saves on its own. | اپنی پروفائل کا کوئی بھی حصہ بدلیں۔ ہر حصہ الگ سے محفوظ ہوتا ہے۔ | Apni profile ka koi bhi hissa badlein. Har hissa alag se save hota hai. | |
| editor.sectionsLabel | Profile sections | پروفائل کے حصے | Profile ke hissay | |
| editor.sections.about | About you | آپ کے بارے میں | Aap ke baare mein | |
| editor.sections.work | Work and rates | کام اور ریٹ | Kaam aur rate | |
| editor.sections.skills | Skills | ہنر | Hunar | |
| editor.sections.proof | Proof of skills | ہنر کا ثبوت | Hunar ka saboot | |
| editor.sections.history | Work history | پرانا کام | Purana kaam | |
| editor.sections.language | Language preference | زبان کی پسند | Zabaan ki pasand | |
| editor.viewProfile | View my profile | میری پروفائل دیکھیں | Meri profile dekhein | |
| editor.saveAbout | Save personal details | ذاتی معلومات محفوظ کریں | Zaati maloomat save karein | |
| editor.saveWork | Save work details | کام کی معلومات محفوظ کریں | Kaam ki maloomat save karein | |
| editor.saveHistory | Save work history | پرانا کام محفوظ کریں | Purana kaam save karein | |
| editor.saved | Saved | محفوظ ہو گیا | Save ho gaya | |
| editor.savedText | Your profile shows the new details now. | آپ کی پروفائل میں اب نئی معلومات نظر آ رہی ہیں۔ | Aap ki profile mein ab nayi maloomat nazar aa rahi hain. | |
| editor.cnicSaved | Your CNIC is saved in encrypted form. It is never shown, not even to you. | آپ کا شناختی کارڈ خفیہ طریقے سے محفوظ ہے۔ یہ کبھی نہیں دکھایا جاتا، آپ کو بھی نہیں۔ | Aap ka CNIC khufia tareeqay se save hai. Yeh kabhi nahi dikhaya jata, aap ko bhi nahi. | |
| editor.cnicMissing | You have not added your CNIC yet. | آپ نے ابھی شناختی کارڈ نمبر شامل نہیں کیا۔ | Aap ne abhi CNIC number shamil nahi kiya. | |
| editor.publicNote | Only your name, trade, city, experience, rates, languages, bio, skills and past jobs (without the client's name) are shown to customers. | گاہکوں کو صرف آپ کا نام، کام، شہر، تجربہ، ریٹ، زبانیں، تعارف، ہنر اور پرانے کام (گاہک کے نام کے بغیر) دکھائے جاتے ہیں۔ | Customers ko sirf aap ka naam, kaam, shehar, tajurba, rate, zabaanein, taaruf, hunar aur puranay kaam (customer ke naam ke baghair) dikhaye jatay hain. | |
| editor.unsavedTitle | You have unsaved changes | آپ کی کچھ تبدیلیاں محفوظ نہیں ہوئیں | Aap ki kuch tabdeeliyan save nahi huin | |
| editor.unsavedText | If you leave now, the changes you have not saved will be lost. | اگر آپ ابھی چلے گئے تو جو تبدیلیاں محفوظ نہیں کیں وہ ختم ہو جائیں گی۔ | Agar aap abhi chalay gaye to jo tabdeeliyan save nahi kin woh khatam ho jayengi. | |
| editor.leave | Leave without saving | محفوظ کیے بغیر جائیں | Save kiye baghair jayein | |
| editor.stay | Stay and save | رکیں اور محفوظ کریں | Rukein aur save karein | |
| editor.unsavedBadge | Not saved yet | ابھی محفوظ نہیں | Abhi save nahi | |
| editor.languageText | Choose the language of the website. It is saved to your account, so it follows you to another phone or computer. | ویب سائٹ کی زبان چنیں۔ یہ آپ کے اکاؤنٹ میں محفوظ ہوتی ہے، اس لیے دوسرے فون یا کمپیوٹر پر بھی یہی رہے گی۔ | Website ki zabaan chunein. Yeh aap ke account mein save hoti hai, is liye doosray phone ya computer par bhi yahi rahegi. | |
| editor.languageCurrent | Current language: {name} | ابھی کی زبان: {name} | Abhi ki zabaan: {name} | |
| editor.proofText | An admin checks every photo. A skill shows "Verified by evidence" after at least one photo is approved. | ایڈمن ہر تصویر چیک کرتا ہے۔ کم از کم ایک تصویر منظور ہونے کے بعد ہنر پر "ثبوت سے تصدیق شدہ" لکھا جاتا ہے۔ | Admin har tasveer check karta hai. Kam az kam aik tasveer manzoor honay ke baad hunar par "Saboot se tasdeeq shuda" likha jata hai. | |
| editor.addProof | Add proof | ثبوت لگائیں | Saboot lagayein | |
| editor.addProofText | One photo for one skill. | ایک ہنر کے لیے ایک تصویر۔ | Aik hunar ke liye aik tasveer. | |

## Website texts: `find`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| find.title | Find workers | کاریگر تلاش کریں | Karigar dhoondein | |
| find.lead | "Identity verified" means an admin checked the worker's CNIC. Skills marked "Self-declared" have no checked proof yet. | "شناخت کی تصدیق ہو گئی" کا مطلب ہے کہ ایڈمن نے کاریگر کا شناختی کارڈ چیک کیا ہے۔ "خود بتایا ہوا" ہنر کا ابھی کوئی چیک شدہ ثبوت نہیں۔ | "Shanakht ki tasdeeq ho gayi" ka matlab hai ke admin ne karigar ka CNIC check kiya hai. "Khud bataya hua" hunar ka abhi koi check shuda saboot nahi. | |
| find.searchLabel | Search workers | کاریگر تلاش کریں | Karigar talaash karein | |
| find.searchPlaceholder | Search: electrician, plumbing, geyser… | تلاش: الیکٹریشن، پلمبنگ، گیزر… | Talaash: electrician, plumbing, geyser… | |
| find.filters | Filters | فلٹر | Filter | |
| find.trade | Trade | کام | Kaam | |
| find.allTrades | All trades | سب کام | Sab kaam | |
| find.city | City | شہر | Shehar | |
| find.cityHint | Applied when you press Search or Show workers. | تلاش یا "کاریگر دکھائیں" دبانے پر لاگو ہوتا ہے۔ | Talaash ya "Karigar dikhayein" dabane par lagu hota hai. | |
| find.availability | Availability | دستیابی | Dastiyabi | |
| find.any | Any | کوئی بھی | Koi bhi | |
| find.verifiedOnly | Identity verified only | صرف تصدیق شدہ شناخت | Sirf tasdeeq shuda shanakht | |
| find.verifiedSkills | Verified skills only | صرف تصدیق شدہ ہنر | Sirf tasdeeq shuda hunar | |
| find.verifiedSkillsHint | At least one skill backed by approved proof | کم از کم ایک ہنر جس کا ثبوت منظور ہو | Kam az kam aik hunar jis ka saboot manzoor ho | |
| find.found | one: {count} worker found / other: {count} workers found | one: {count} کاریگر ملا / other: {count} کاریگر ملے | one: {count} karigar mila / other: {count} karigar milay | |
| find.searching | Searching… | تلاش ہو رہی ہے… | Talaash ho rahi hai… | |
| find.noneTitle | No workers match | کوئی کاریگر نہیں ملا | Koi karigar nahi mila | |
| find.noneText | Try another word, or remove some filters. | کوئی اور لفظ لکھیں، یا کچھ فلٹر ہٹا دیں۔ | Koi aur lafz likhein, ya kuch filter hata dein. | |
| find.clearSearch | Clear search and filters | تلاش اور فلٹر صاف کریں | Talaash aur filter saaf karein | |
| find.showWorkers | Show workers | کاریگر دکھائیں | Karigar dikhayein | |
| find.experience | Experience | تجربہ | Tajurba | |
| find.perHour | Per hour | فی گھنٹہ | Fi ghanta | |
| find.perDay | Per day | فی دن | Fi din | |
| find.topSkills | Top skills | خاص ہنر | Khaas hunar | |
| find.verifiedSkill | (verified by evidence) | (ثبوت سے تصدیق شدہ) | (saboot se tasdeeq shuda) | |
| find.more | +{count} more | +{count} اور | +{count} aur | |
| find.resultPages | Result pages | نتائج کے صفحات | Nataij ke safhat | |

## Website texts: `publicProfile`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| publicProfile.back | Back to search | تلاش پر واپس | Talaash par wapas | |
| publicProfile.notFoundTitle | Worker not found | کاریگر نہیں ملا | Karigar nahi mila | |
| publicProfile.notFoundText | This worker ID does not exist. | یہ کاریگر آئی ڈی موجود نہیں۔ | Yeh karigar ID mojood nahi. | |
| publicProfile.details | Work details | کام کی تفصیل | Kaam ki tafseel | |
| publicProfile.pastWork | Past work | پرانا کام | Purana kaam | |

## Website texts: `admin`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| admin.nav.label | Admin | ایڈمن | Admin | |
| admin.nav.overview | Overview | خلاصہ | Khulasa | |
| admin.nav.identity | Identity review | شناخت کی جانچ | Shanakht ki jaanch | |
| admin.nav.evidence | Evidence review | ثبوت کی جانچ | Saboot ki jaanch | |
| admin.nav.users | Users | صارفین | Users | |
| admin.nav.audit | Audit log | آڈٹ لاگ | Audit log | |
| admin.nav.templates | Reason templates | وجوہات کے سانچے | Wajuhaat ke templates | |
| admin.nav.exports | Exports | ایکسپورٹ | Exports | |
| admin.overview.title | Admin overview | ایڈمن خلاصہ | Admin khulasa | |
| admin.overview.lead | Queues and counts for identity and evidence review. Every decision is written to the audit log. | شناخت اور ثبوت کی جانچ کی قطاریں اور گنتی۔ ہر فیصلہ آڈٹ لاگ میں لکھا جاتا ہے۔ | Shanakht aur saboot ki jaanch ki qataarein aur ginti. Har faisla audit log mein likha jata hai. | |
| admin.overview.loadFailed | Could not load the counts. | گنتی لوڈ نہیں ہو سکی۔ | Ginti load nahi ho saki. | |
| admin.overview.open | Open | کھولیں | Kholein | |
| admin.overview.tiles.identityPending | Waiting for identity review | شناخت کی جانچ کا انتظار | Shanakht ki jaanch ka intezar | |
| admin.overview.tiles.proofPending | Proof waiting for review | ثبوت کی جانچ کا انتظار | Saboot ki jaanch ka intezar | |
| admin.overview.tiles.proofFake | Proof marked suspected fake | جعلی ہونے کے شک والے ثبوت | Jaali honay ke shak walay saboot | |
| admin.overview.tiles.profiles | Worker profiles | کاریگر پروفائلز | Karigar profiles | |
| admin.overview.tiles.verified | Identity verified | شناخت کی تصدیق ہو گئی | Shanakht ki tasdeeq ho gayi | |
| admin.overview.tiles.rejected | Identity not accepted | شناخت قبول نہیں ہوئی | Shanakht qabool nahi hui | |
| admin.overview.tiles.noCnic | No CNIC yet | ابھی شناختی کارڈ نہیں | Abhi CNIC nahi | |
| admin.overview.tiles.customers | Customer accounts | گاہکوں کے اکاؤنٹ | Customers ke account | |
| admin.overview.tiles.workers | Worker accounts | کاریگروں کے اکاؤنٹ | Karigaron ke account | |
| admin.overview.tiles.admins | Admin accounts | ایڈمن اکاؤنٹ | Admin account | |
| admin.identity.title | Identity review | شناخت کی جانچ | Shanakht ki jaanch | |
| admin.identity.lead | Open a worker to see the details, reveal the CNIC if needed, and record a decision with a note. | تفصیل دیکھنے کے لیے کاریگر کھولیں، ضرورت ہو تو شناختی کارڈ دیکھیں، اور نوٹ کے ساتھ فیصلہ لکھیں۔ | Tafseel dekhne ke liye karigar kholein, zaroorat ho to CNIC dekhein, aur note ke saath faisla likhein. | |
| admin.identity.status | Status | حالت | Haalat | |
| admin.identity.search | Search name, ID or trade | نام، آئی ڈی یا کام تلاش کریں | Naam, ID ya kaam talaash karein | |
| admin.identity.count | one: {count} worker / other: {count} workers | one: {count} کاریگر / other: {count} کاریگر | one: {count} karigar / other: {count} karigar | |
| admin.identity.caption | Workers for identity review | شناخت کی جانچ کے لیے کاریگر | Shanakht ki jaanch ke liye karigar | |
| admin.identity.columns.worker | Worker | کاریگر | Karigar | |
| admin.identity.columns.id | Worker ID | کاریگر آئی ڈی | Karigar ID | |
| admin.identity.columns.trade | Trade | کام | Kaam | |
| admin.identity.columns.city | City | شہر | Shehar | |
| admin.identity.columns.cnic | CNIC | شناختی کارڈ | CNIC | |
| admin.identity.columns.identity | Identity | شناخت | Shanakht | |
| admin.identity.columns.updated | Updated | تبدیلی کی تاریخ | Tabdeeli ki tareekh | |
| admin.identity.onFile | On file | محفوظ ہے | Save hai | |
| admin.identity.notSaved | Not saved | محفوظ نہیں | Save nahi | |
| admin.identity.review | Review {name} | {name} کی جانچ کریں | {name} ki jaanch karein | |
| admin.identity.emptyTitle | Nothing here | یہاں کچھ نہیں | Yahan kuch nahi | |
| admin.identity.emptyText | No workers with this status. | اس حالت کا کوئی کاریگر نہیں۔ | Is haalat ka koi karigar nahi. | |
| admin.identity.drawerText | Check the original CNIC card in person or on a video call, then record your decision. | اصل شناختی کارڈ سامنے یا ویڈیو کال پر چیک کریں، پھر اپنا فیصلہ لکھیں۔ | Asal CNIC card saamne ya video call par check karein, phir apna faisla likhein. | |
| admin.identity.saveDecision | Save decision | فیصلہ محفوظ کریں | Faisla save karein | |
| admin.identity.current | Current status | ابھی کی حالت | Abhi ki haalat | |
| admin.identity.phone | Phone | فون | Phone | |
| admin.identity.email | Email | ای میل | Email | |
| admin.identity.trade | Trade | کام | Kaam | |
| admin.identity.city | City | شہر | Shehar | |
| admin.identity.cnic | CNIC | شناختی کارڈ | CNIC | |
| admin.identity.cnicNotSaved | Not saved by the worker | کاریگر نے محفوظ نہیں کیا | Karigar ne save nahi kiya | |
| admin.identity.cnicHidden | CNIC hidden | شناختی کارڈ چھپا ہوا | CNIC chupa hua | |
| admin.identity.reveal | Reveal | دکھائیں | Dikhayein | |
| admin.identity.lastNote | Last note | آخری نوٹ | Aakhri note | |
| admin.identity.decision | Decision | فیصلہ | Faisla | |
| admin.identity.verifiedTitle | Verified | تصدیق شدہ | Tasdeeq shuda | |
| admin.identity.verifiedText | The CNIC matches the person. | شناختی کارڈ اسی شخص کا ہے۔ | CNIC isi shakhs ka hai. | |
| admin.identity.verifiedImpossible | Not possible: no CNIC saved. | ممکن نہیں: کوئی شناختی کارڈ محفوظ نہیں۔ | Mumkin nahi: koi CNIC save nahi. | |
| admin.identity.rejectedTitle | Rejected | رد | Radd | |
| admin.identity.rejectedText | The CNIC could not be confirmed. The worker sees your note. | شناختی کارڈ کی تصدیق نہیں ہو سکی۔ کاریگر آپ کا نوٹ دیکھتا ہے۔ | CNIC ki tasdeeq nahi ho saki. Karigar aap ka note dekhta hai. | |
| admin.identity.note | Note | نوٹ | Note | |
| admin.identity.noteHint | Required. Say how you checked, e.g. Original CNIC seen on a video call. | ضروری۔ بتائیں آپ نے کیسے چیک کیا، جیسے ویڈیو کال پر اصل شناختی کارڈ دیکھا۔ | Zaroori. Batayein aap ne kaise check kiya, jaise video call par asal CNIC dekha. | |
| admin.identity.revealTitle | Show the full CNIC? | پورا شناختی کارڈ نمبر دکھائیں؟ | Poora CNIC number dikhayein? | |
| admin.identity.revealText | This will be recorded in the audit log. | یہ آڈٹ لاگ میں لکھا جائے گا۔ | Yeh audit log mein likha jayega. | |
| admin.identity.revealConfirm | Show CNIC | شناختی کارڈ دکھائیں | CNIC dikhayein | |
| admin.identity.revealFailed | Could not show the CNIC. | شناختی کارڈ نہیں دکھایا جا سکا۔ | CNIC nahi dikhaya ja saka. | |
| admin.identity.saveFailed | Could not save the decision. | فیصلہ محفوظ نہیں ہو سکا۔ | Faisla save nahi ho saka. | |
| admin.identity.decided | Identity marked {status} | شناخت: {status} | Shanakht: {status} | |
| admin.identity.decidedText | The decision was written to the audit log. | فیصلہ آڈٹ لاگ میں لکھ دیا گیا۔ | Faisla audit log mein likh diya gaya. | |
| admin.evidence.title | Evidence review | ثبوت کی جانچ | Saboot ki jaanch | |
| admin.evidence.lead | Check each photo, compare possible duplicates, and approve, reject or flag it. Every decision is written to the audit log. | ہر تصویر چیک کریں، ملتی جلتی تصویروں کا موازنہ کریں، اور منظور، رد یا مشکوک قرار دیں۔ ہر فیصلہ آڈٹ لاگ میں لکھا جاتا ہے۔ | Har tasveer check karein, milti julti tasveeron ka muqabla karein, aur manzoor, radd ya mashkook qarar dein. Har faisla audit log mein likha jata hai. | |
| admin.evidence.status | Status | حالت | Haalat | |
| admin.evidence.type | Type | قسم | Qisam | |
| admin.evidence.allTypes | All types | سب قسمیں | Sab qismein | |
| admin.evidence.skill | Skill | ہنر | Hunar | |
| admin.evidence.allSkills | All skills | سب ہنر | Sab hunar | |
| admin.evidence.duplicatesOnly | Possible duplicates only | صرف ملتی جلتی تصویریں | Sirf milti julti tasveerein | |
| admin.evidence.count | one: {count} item / other: {count} items | one: {count} ثبوت / other: {count} ثبوت | one: {count} saboot / other: {count} saboot | |
| admin.evidence.caption | Proof items | ثبوت | Saboot | |
| admin.evidence.columns.worker | Worker | کاریگر | Karigar | |
| admin.evidence.columns.id | Worker ID | کاریگر آئی ڈی | Karigar ID | |
| admin.evidence.columns.skill | Skill | ہنر | Hunar | |
| admin.evidence.columns.type | Type | قسم | Qisam | |
| admin.evidence.columns.uploaded | Uploaded | اپ لوڈ | Upload | |
| admin.evidence.columns.status | Status | حالت | Haalat | |
| admin.evidence.columns.dup | Duplicate? | ملتی جلتی؟ | Milti julti? | |
| admin.evidence.samePhoto | Same photo | وہی تصویر | Wohi tasveer | |
| admin.evidence.lookAlike | Look-alike | ملتی جلتی | Milti julti | |
| admin.evidence.review | Review proof from {name} for {skill} | {name} کا {skill} کے لیے ثبوت دیکھیں | {name} ka {skill} ke liye saboot dekhein | |
| admin.evidence.emptyTitle | Nothing to review | جانچ کے لیے کچھ نہیں | Jaanch ke liye kuch nahi | |
| admin.evidence.emptyText | No proof items match these filters. | ان فلٹر کے مطابق کوئی ثبوت نہیں۔ | In filter ke mutabiq koi saboot nahi. | |
| admin.evidence.proof | Proof | ثبوت | Saboot | |
| admin.evidence.sameAsOther | Same photo as another worker | کسی دوسرے کاریگر والی تصویر | Kisi doosray karigar wali tasveer | |
| admin.evidence.looksLike | Looks like another worker's photo (distance {distance}) | کسی دوسرے کاریگر کی تصویر جیسی ہے (فرق {distance}) | Kisi doosray karigar ki tasveer jaisi hai (farq {distance}) | |
| admin.evidence.thisUpload | This upload | یہ اپ لوڈ | Yeh upload | |
| admin.evidence.possibleDuplicate | Possible duplicate: {name} · {id} · {skill} | ممکنہ ملتی جلتی: {name} · {id} · {skill} | Mumkina milti julti: {name} · {id} · {skill} | |
| admin.evidence.proofAlt | Proof for {skill} | {skill} کا ثبوت | {skill} ka saboot | |
| admin.evidence.duplicateAlt | Possible duplicate from {name} | {name} کی ممکنہ ملتی جلتی تصویر | {name} ki mumkina milti julti tasveer | |
| admin.evidence.fit | Fit to panel | پینل کے مطابق کریں | Panel ke mutabiq karein | |
| admin.evidence.zoom | Zoom to full size | پورے سائز میں دیکھیں | Pooray size mein dekhein | |
| admin.evidence.details.title | Title | عنوان | Unwaan | |
| admin.evidence.details.uploaded | Uploaded | اپ لوڈ | Upload | |
| admin.evidence.details.image | Image | تصویر | Tasveer | |
| admin.evidence.details.last | Last decision | آخری فیصلہ | Aakhri faisla | |
| admin.evidence.imageInfo | {width} × {height} px, WebP, {size} KB (metadata removed) | {width} × {height} px، WebP، {size} KB (معلومات ہٹا دی گئیں) | {width} × {height} px, WebP, {size} KB (maloomat hata di gayin) | |
| admin.evidence.numbersTitle | Evidence for this skill (all items) | اس ہنر کے ثبوت (سب) | Is hunar ke saboot (sab) | |
| admin.evidence.numbers.belief | belief b | یقین b | yaqeen b | |
| admin.evidence.numbers.disbelief | disbelief d | عدم یقین d | adam-e-yaqeen d | |
| admin.evidence.numbers.uncertainty | uncertainty u | غیر یقینی u | ghair yaqeeni u | |
| admin.evidence.numbers.expected | expected E | متوقع E | mutawaqqa E | |
| admin.evidence.method | How this is computed: r = {r} (approved: certificate 2, work photo or letter 1), s = {s} (suspected fakes), b = r/(r+s+2), d = s/(r+s+2), u = 2/(r+s+2), E = b + 0.5·u. Weights are provisional (D-014). Shown to admins only. | حساب کا طریقہ: r = {r} (منظور: سرٹیفکیٹ 2، کام کی تصویر یا خط 1)، s = {s} (جعلی ہونے کا شک)، b = r/(r+s+2)، d = s/(r+s+2)، u = 2/(r+s+2)، E = b + 0.5·u۔ وزن عارضی ہیں (D-014)۔ صرف ایڈمن کو دکھایا جاتا ہے۔ | Hisaab ka tareeqa: r = {r} (manzoor: certificate 2, kaam ki tasveer ya khat 1), s = {s} (jaali honay ka shak), b = r/(r+s+2), d = s/(r+s+2), u = 2/(r+s+2), E = b + 0.5·u. Wazan aarzi hain (D-014). Sirf admin ko dikhaya jata hai. | |
| admin.evidence.noAction | No further decision is possible for this item. | اس ثبوت پر اب کوئی فیصلہ ممکن نہیں۔ | Is saboot par ab koi faisla mumkin nahi. | |
| admin.evidence.actions.approve.label | Approve | منظور کریں | Manzoor karein | |
| admin.evidence.actions.approve.title | Approve this proof? | یہ ثبوت منظور کریں؟ | Yeh saboot manzoor karein? | |
| admin.evidence.actions.approve.help | The skill will show "Verified by evidence" (unless a suspected fake exists). | ہنر پر "ثبوت سے تصدیق شدہ" لکھا جائے گا (اگر کوئی جعلی ہونے کا شک والا ثبوت نہ ہو)۔ | Hunar par "Saboot se tasdeeq shuda" likha jayega (agar koi jaali honay ke shak wala saboot na ho). | |
| admin.evidence.actions.reject.label | Reject | رد کریں | Radd karein | |
| admin.evidence.actions.reject.title | Reject this proof | یہ ثبوت رد کریں | Yeh saboot radd karein | |
| admin.evidence.actions.reject.help | The worker sees the reason. A rejection does not count against the worker. | کاریگر وجہ دیکھتا ہے۔ رد ہونا کاریگر کے خلاف نہیں گنا جاتا۔ | Karigar wajah dekhta hai. Radd hona karigar ke khilaf nahi gina jata. | |
| admin.evidence.actions.suspected_fake.label | Suspected fake | جعلی ہونے کا شک | Jaali honay ka shak | |
| admin.evidence.actions.suspected_fake.title | Mark as suspected fake | جعلی ہونے کا شک لکھیں | Jaali honay ka shak likhein | |
| admin.evidence.actions.suspected_fake.help | The skill will show "Disputed". The worker cannot delete this item. | ہنر پر "مشکوک" لکھا جائے گا۔ کاریگر یہ ثبوت ہٹا نہیں سکے گا۔ | Hunar par "Mashkook" likha jayega. Karigar yeh saboot hata nahi sakega. | |
| admin.evidence.actions.revoke.label | Revoke approval | منظوری واپس لیں | Manzoori wapas lein | |
| admin.evidence.actions.revoke.title | Revoke the approval | منظوری واپس لیں | Manzoori wapas lein | |
| admin.evidence.actions.revoke.help | Use this to correct a mistaken approval. The item stops counting. | غلط منظوری ٹھیک کرنے کے لیے۔ یہ ثبوت گنتی میں نہیں رہے گا۔ | Ghalat manzoori theek karne ke liye. Yeh saboot ginti mein nahi rahega. | |
| admin.evidence.verbs.approve | approve | منظور | manzoor | |
| admin.evidence.verbs.reject | reject | رد | radd | |
| admin.evidence.verbs.suspected_fake | mark as suspected fake | جعلی ہونے کا شک قرار | jaali honay ka shak qarar | |
| admin.evidence.verbs.revoke | revoke | منظوری واپس | manzoori wapas | |
| admin.evidence.reason | Reason | وجہ | Wajah | |
| admin.evidence.reasonPlaceholder | Choose a reason | وجہ چنیں | Wajah chunein | |
| admin.evidence.noteOptional | Note for the worker (optional) | کاریگر کے لیے نوٹ (اختیاری) | Karigar ke liye note (ikhtiyari) | |
| admin.evidence.saved | {action}: saved | {action}: محفوظ ہو گیا | {action}: save ho gaya | |
| admin.evidence.savedText | The decision was written to the audit log. | فیصلہ آڈٹ لاگ میں لکھ دیا گیا۔ | Faisla audit log mein likh diya gaya. | |
| admin.evidence.saveFailed | Could not save the decision. | فیصلہ محفوظ نہیں ہو سکا۔ | Faisla save nahi ho saka. | |
| admin.audit.title | Audit log | آڈٹ لاگ | Audit log | |
| admin.audit.lead | Every identity decision, CNIC reveal, evidence decision and admin creation, newest first. Read-only. | شناخت کا ہر فیصلہ، شناختی کارڈ دیکھنا، ثبوت کا ہر فیصلہ اور ایڈمن بنانا، نئے سے پرانے۔ صرف پڑھنے کے لیے۔ | Shanakht ka har faisla, CNIC dekhna, saboot ka har faisla aur admin banana, naye se purane. Sirf parhne ke liye. | |
| admin.audit.action | Action | عمل | Amal | |
| admin.audit.allActions | All actions | سب عمل | Sab amal | |
| admin.audit.from | From | سے | Se | |
| admin.audit.to | To | تک | Tak | |
| admin.audit.count | one: {count} entry / other: {count} entries | one: {count} اندراج / other: {count} اندراج | one: {count} entry / other: {count} entries | |
| admin.audit.caption | Audit log entries | آڈٹ لاگ کے اندراج | Audit log ki entries | |
| admin.audit.columns.seq | # | # | # | |
| admin.audit.columns.time | Time | وقت | Waqt | |
| admin.audit.columns.by | By | کس نے | Kis ne | |
| admin.audit.columns.action | Action | عمل | Amal | |
| admin.audit.columns.target | Target | کس پر | Kis par | |
| admin.audit.columns.change | Change | تبدیلی | Tabdeeli | |
| admin.audit.columns.reason | Reason / note | وجہ / نوٹ | Wajah / note | |
| admin.audit.emptyTitle | No entries | کوئی اندراج نہیں | Koi entry nahi | |
| admin.audit.emptyText | Nothing matches these filters. | ان فلٹر کے مطابق کچھ نہیں۔ | In filter ke mutabiq kuch nahi. | |

## Website texts: `theme`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| theme.toggle | Dark mode | ڈارک موڈ | Dark mode | |
| theme.toggleHint | Switch between light and dark. Hold (or right-click) for more choices. | روشن اور ڈارک کے درمیان بدلیں۔ مزید انتخاب کے لیے دبا کر رکھیں (یا رائٹ کلک کریں)۔ | Light aur dark ke darmiyan badlein. Mazeed intikhab ke liye daba kar rakhein (ya right-click karein). | |
| theme.options | Theme options | تھیم کے انتخاب | Theme ke intikhab | |
| theme.menuLabel | Theme | تھیم | Theme | |
| theme.light | Light | روشن | Light | |
| theme.dark | Dark | ڈارک | Dark | |
| theme.system | System | سسٹم | System | |
| theme.systemHint | Follows your device | آپ کے فون یا کمپیوٹر کے مطابق | Aap ke phone ya computer ke mutabiq | |
| theme.nowLight | Light mode is on | روشن موڈ آن ہے | Light mode on hai | |
| theme.nowDark | Dark mode is on | ڈارک موڈ آن ہے | Dark mode on hai | |
| theme.chosen.light | Light mode is on | روشن موڈ آن ہے | Light mode on hai | |
| theme.chosen.dark | Dark mode is on | ڈارک موڈ آن ہے | Dark mode on hai | |
| theme.chosen.system | The theme now follows your device | تھیم اب آپ کے فون یا کمپیوٹر کے مطابق ہے | Theme ab aap ke phone ya computer ke mutabiq hai | |
| theme.footerTitle | Appearance | ظاہری شکل | Zahiri shakal | |

## Website texts: `textSize`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| textSize.label | Text size | لکھائی کا سائز | Likhai ka size | |
| textSize.small | Smaller text | چھوٹی لکھائی | Chhoti likhai | |
| textSize.normal | Normal text | عام لکھائی | Aam likhai | |
| textSize.large | Larger text | بڑی لکھائی | Bari likhai | |

## Website texts: `palette`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| palette.editAbout | Edit: About you | ترمیم: آپ کے بارے میں | Tarmeem: Aap ke baare mein | |
| palette.editWork | Edit: Work and rates | ترمیم: کام اور ریٹ | Tarmeem: Kaam aur rate | |
| palette.editSkills | Edit: Skills | ترمیم: ہنر | Tarmeem: Hunar | |
| palette.editProof | Edit: Proof of skills | ترمیم: ہنر کا ثبوت | Tarmeem: Hunar ka saboot | |
| palette.editHistory | Edit: Work history | ترمیم: پچھلا کام | Tarmeem: Pichla kaam | |
| palette.editLanguage | Edit: Language preference | ترمیم: زبان کی ترجیح | Tarmeem: Zabaan ki tarjeeh | |

## Website texts: `adminx`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| adminx.titles.users | Users | صارفین | Users | |
| adminx.titles.templates | Reason templates | وجوہات کے سانچے | Wajuhaat ke templates | |
| adminx.titles.exports | Exports | ایکسپورٹ | Exports | |
| adminx.dash.nowTitle | Needs your attention | آپ کی توجہ درکار ہے | Aap ki tawajjo darkaar hai | |
| adminx.dash.queueIdentity | Waiting for identity review | شناخت کی جانچ کے منتظر | Shanakht ki jaanch ke muntazir | |
| adminx.dash.queueProof | Proof waiting for review | جانچ کے منتظر ثبوت | Jaanch ke muntazir saboot | |
| adminx.dash.queueFake | Proof marked suspected fake | مشکوک قرار دیے گئے ثبوت | Mashkook qarar diye gaye saboot | |
| adminx.dash.open | Open the queue | قطار کھولیں | Qataar kholein | |
| adminx.dash.oldest | Oldest: {waiting} | سب سے پرانا: {waiting} | Sab se purana: {waiting} | |
| adminx.dash.nothingWaiting | Nothing is waiting. Well done. | کچھ بھی منتظر نہیں۔ شاباش۔ | Kuch bhi muntazir nahi. Shabash. | |
| adminx.dash.waitingLabel | How long they have waited | کتنی دیر سے منتظر ہیں | Kitni der se muntazir hain | |
| adminx.dash.buckets.under1Day | Under 1 day | 1 دن سے کم | 1 din se kam | |
| adminx.dash.buckets.days1to3 | 1 to 3 days | 1 سے 3 دن | 1 se 3 din | |
| adminx.dash.buckets.days4to7 | 4 to 7 days | 4 سے 7 دن | 4 se 7 din | |
| adminx.dash.buckets.over7Days | Over 7 days | 7 دن سے زیادہ | 7 din se zyada | |
| adminx.dash.accountsTitle | Accounts | اکاؤنٹس | Accounts | |
| adminx.dash.accounts.worker | Worker accounts | کاریگروں کے اکاؤنٹ | Karigaron ke accounts | |
| adminx.dash.accounts.customer | Customer accounts | گاہکوں کے اکاؤنٹ | Gahakon ke accounts | |
| adminx.dash.accounts.admin | Admin accounts | ایڈمن اکاؤنٹ | Admin accounts | |
| adminx.dash.accounts.profiles | Worker profiles | کاریگروں کے پروفائل | Karigaron ke profiles | |
| adminx.dash.trendsTitle | Trends and totals | رجحانات اور مجموعے | Rujhanaat aur majmooay | |
| adminx.dash.period | Period for new accounts | نئے اکاؤنٹس کی مدت | Naye accounts ki muddat | |
| adminx.dash.periodDays | one: Last {count} day / other: Last {count} days | one: پچھلا {count} دن / other: پچھلے {count} دن | one: Pichla {count} din / other: Pichle {count} din | |
| adminx.dash.registrations | New accounts per day | روزانہ نئے اکاؤنٹ | Rozana naye accounts | |
| adminx.dash.registrationsSub | Days are counted in Pakistan time. Admin accounts are not included. | دن پاکستانی وقت کے مطابق گنے جاتے ہیں۔ ایڈمن اکاؤنٹ شامل نہیں۔ | Din Pakistani waqt ke mutabiq ginay jate hain. Admin accounts shamil nahi. | |
| adminx.dash.seriesWorkers | Workers | کاریگر | Karigar | |
| adminx.dash.seriesCustomers | Customers | گاہک | Gahak | |
| adminx.dash.total | Total | کل | Kul | |
| adminx.dash.date | Date | تاریخ | Tareekh | |
| adminx.dash.noRegistrations | No new accounts in this period. | اس مدت میں کوئی نیا اکاؤنٹ نہیں بنا۔ | Is muddat mein koi naya account nahi bana. | |
| adminx.dash.showTable | Show the numbers as a table | اعداد جدول کی شکل میں دکھائیں | Adaad table ki shakal mein dikhayein | |
| adminx.dash.identityByStatus | Worker profiles by identity status | شناخت کی حالت کے مطابق کاریگروں کے پروفائل | Shanakht ki halat ke mutabiq karigaron ke profiles | |
| adminx.dash.evidenceByStatus | Proof items by decision | فیصلے کے مطابق ثبوت | Faislay ke mutabiq saboot | |
| adminx.dash.skillsByCategory | Skills on profiles, by trade | پیشے کے مطابق پروفائلوں پر ہنر | Peshay ke mutabiq profiles par hunar | |
| adminx.dash.noData | Nothing to show yet. | ابھی دکھانے کو کچھ نہیں۔ | Abhi dikhane ko kuch nahi. | |
| adminx.dash.chartsFailed | The charts could not be loaded. | چارٹ لوڈ نہیں ہو سکے۔ | Charts load nahi ho sake. | |
| adminx.chain.title | Audit log chain | آڈٹ لاگ کی زنجیر | Audit log ki zanjeer | |
| adminx.chain.checking | Checking every entry… | ہر اندراج چیک ہو رہا ہے… | Har indraaj check ho raha hai… | |
| adminx.chain.intact | Chain intact | زنجیر سلامت ہے | Zanjeer salamat hai | |
| adminx.chain.intactText | one: {count} entry checked. Nothing was changed, added or removed. / other: {count} entries checked. Nothing was changed, added or removed. | one: {count} اندراج چیک ہوا۔ کچھ بدلا، بڑھایا یا ہٹایا نہیں گیا۔ / other: {count} اندراجات چیک ہوئے۔ کچھ بدلا، بڑھایا یا ہٹایا نہیں گیا۔ | one: {count} indraaj check hua. Kuch badla, barhaya ya hataya nahi gaya. / other: {count} indraajaat check hue. Kuch badla, barhaya ya hataya nahi gaya. | |
| adminx.chain.broken | Chain broken at entry {seq} | زنجیر اندراج {seq} پر ٹوٹی ہے | Zanjeer indraaj {seq} par tooti hai | |
| adminx.chain.problems.entry_missing | An entry is missing before this one. | اس سے پہلے کا ایک اندراج غائب ہے۔ | Is se pehle ka aik indraaj ghaib hai. | |
| adminx.chain.problems.link_broken | This entry does not link to the one before it. | یہ اندراج پچھلے اندراج سے نہیں جڑتا۔ | Yeh indraaj pichle indraaj se nahi jurta. | |
| adminx.chain.problems.content_changed | This entry was changed after it was written. | یہ اندراج لکھے جانے کے بعد بدلا گیا ہے۔ | Yeh indraaj likhe jane ke baad badla gaya hai. | |
| adminx.chain.brokenText | Stop making decisions, tell the team lead, and keep a copy of the database. | مزید فیصلے نہ کریں، ٹیم لیڈ کو بتائیں اور ڈیٹابیس کی کاپی محفوظ رکھیں۔ | Mazeed faislay na karein, team lead ko batayein aur database ki copy mehfooz rakhein. | |
| adminx.chain.checkedAt | Checked at {time} | {time} پر چیک ہوا | {time} par check hua | |
| adminx.chain.again | Check again | دوبارہ چیک کریں | Dobara check karein | |
| adminx.chain.failed | The chain could not be checked. | زنجیر چیک نہیں ہو سکی۔ | Zanjeer check nahi ho saki. | |
| adminx.feed.title | Latest activity | تازہ سرگرمی | Taza sargarmi | |
| adminx.feed.empty | No activity yet. | ابھی کوئی سرگرمی نہیں۔ | Abhi koi sargarmi nahi. | |
| adminx.feed.live | Updates every 30 seconds | ہر 30 سیکنڈ بعد تازہ ہوتی ہے | Har 30 second baad taza hoti hai | |
| adminx.feed.all | Open the audit log | آڈٹ لاگ کھولیں | Audit log kholein | |
| adminx.actions.identity_decision | Identity decision | شناخت کا فیصلہ | Shanakht ka faisla | |
| adminx.actions.cnic_reveal | CNIC viewed | شناختی کارڈ نمبر دیکھا گیا | CNIC dekha gaya | |
| adminx.actions.cnic_updated | CNIC saved by the worker | کاریگر نے شناختی کارڈ نمبر محفوظ کیا | Karigar ne CNIC mehfooz kiya | |
| adminx.actions.evidence_uploaded | Proof uploaded | ثبوت اپ لوڈ ہوا | Saboot upload hua | |
| adminx.actions.evidence_approved | Proof approved | ثبوت منظور ہوا | Saboot manzoor hua | |
| adminx.actions.evidence_rejected | Proof not accepted | ثبوت قبول نہیں ہوا | Saboot qabool nahi hua | |
| adminx.actions.evidence_suspected_fake | Proof marked suspected fake | ثبوت مشکوک قرار پایا | Saboot mashkook qarar paya | |
| adminx.actions.evidence_revoked | Approval withdrawn | منظوری واپس لی گئی | Manzoori wapas li gayi | |
| adminx.actions.evidence_deleted | Proof deleted | ثبوت حذف ہوا | Saboot hazf hua | |
| adminx.actions.admin_created | Admin account created | ایڈمن اکاؤنٹ بنا | Admin account bana | |
| adminx.actions.user_suspended | Account suspended | اکاؤنٹ معطل ہوا | Account muattal hua | |
| adminx.actions.user_reactivated | Account reactivated | اکاؤنٹ بحال ہوا | Account bahaal hua | |
| adminx.actions.export_downloaded | Export downloaded | ایکسپورٹ ڈاؤن لوڈ ہوا | Export download hua | |
| adminx.actions.template_created | Reason template added | وجہ کا سانچہ بنا | Wajah ka template bana | |
| adminx.actions.template_updated | Reason template changed | وجہ کا سانچہ بدلا | Wajah ka template badla | |
| adminx.actions.template_deleted | Reason template deleted | وجہ کا سانچہ حذف ہوا | Wajah ka template hazf hua | |
| adminx.actions.template_starter_set | Starter templates added | ابتدائی سانچے شامل ہوئے | Ibtidai templates shamil hue | |
| adminx.waiting.today | Waiting since today | آج سے منتظر | Aaj se muntazir | |
| adminx.waiting.days | one: Waiting {count} day / other: Waiting {count} days | one: {count} دن سے منتظر / other: {count} دن سے منتظر | one: {count} din se muntazir / other: {count} din se muntazir | |
| adminx.waiting.column | Waiting | انتظار | Intezaar | |
| adminx.users.title | Users | صارفین | Users | |
| adminx.users.lead | Find an account, see what belongs to it, and suspend or reactivate it. Every change needs a reason and is written to the audit log. | اکاؤنٹ تلاش کریں، اس سے جڑی چیزیں دیکھیں، اور اسے معطل یا بحال کریں۔ ہر تبدیلی کے لیے وجہ ضروری ہے اور وہ آڈٹ لاگ میں لکھی جاتی ہے۔ | Account talaash karein, is se juri cheezein dekhein, aur isay muattal ya bahaal karein. Har tabdeeli ke liye wajah zaroori hai aur woh audit log mein likhi jati hai. | |
| adminx.users.search | Search name, email or phone | نام، ای میل یا فون تلاش کریں | Naam, email ya phone talaash karein | |
| adminx.users.role | Role | کردار | Role | |
| adminx.users.allRoles | All roles | تمام کردار | Tamam roles | |
| adminx.users.status | Status | حالت | Status | |
| adminx.users.statuses.all | All | تمام | Tamam | |
| adminx.users.statuses.active | Active | فعال | Active | |
| adminx.users.statuses.suspended | Suspended | معطل | Muattal | |
| adminx.users.count | one: {count} user / other: {count} users | one: {count} صارف / other: {count} صارفین | one: {count} user / other: {count} users | |
| adminx.users.caption | User accounts | صارفین کے اکاؤنٹ | Users ke accounts | |
| adminx.users.columns.name | Name | نام | Naam | |
| adminx.users.columns.email | Email | ای میل | Email | |
| adminx.users.columns.phone | Phone | فون | Phone | |
| adminx.users.columns.role | Role | کردار | Role | |
| adminx.users.columns.status | Status | حالت | Status | |
| adminx.users.columns.joined | Joined | شامل ہوئے | Shamil hue | |
| adminx.users.open | Open {name} | {name} کو کھولیں | {name} ko kholein | |
| adminx.users.emptyTitle | No users found | کوئی صارف نہیں ملا | Koi user nahi mila | |
| adminx.users.emptyText | Try another name, or clear the filters. | کوئی اور نام آزمائیں یا فلٹر صاف کریں۔ | Koi aur naam azmayein ya filter saaf karein. | |
| adminx.users.lockedNow | Login paused (wrong passwords) | لاگ ان عارضی طور پر بند (غلط پاس ورڈ) | Login arzi tor par band (ghalat passwords) | |
| adminx.users.detailText | Account details. The CNIC is never shown here. | اکاؤنٹ کی تفصیل۔ شناختی کارڈ نمبر یہاں کبھی نہیں دکھایا جاتا۔ | Account ki tafseel. CNIC yahan kabhi nahi dikhaya jata. | |
| adminx.users.account | Account | اکاؤنٹ | Account | |
| adminx.users.joined | Joined | شامل ہوئے | Shamil hue | |
| adminx.users.suspendedOn | Suspended on | معطل کیا گیا | Muattal kiya gaya | |
| adminx.users.reason | Reason | وجہ | Wajah | |
| adminx.users.workerSummary | Worker profile | کاریگر کا پروفائل | Karigar ka profile | |
| adminx.users.noProfile | This worker has not started a profile yet. | اس کاریگر نے ابھی پروفائل شروع نہیں کیا۔ | Is karigar ne abhi profile shuru nahi kiya. | |
| adminx.users.workerId | Worker ID | کاریگر آئی ڈی | Worker ID | |
| adminx.users.trade | Trade | پیشہ | Pesha | |
| adminx.users.identity | Identity | شناخت | Shanakht | |
| adminx.users.skills | Skills | ہنر | Hunar | |
| adminx.users.completion | Profile completion | پروفائل کی تکمیل | Profile ki takmeel | |
| adminx.users.proof | Proof items | ثبوت | Saboot | |
| adminx.users.proofCounts | Approved {approved} · Waiting {pending} · Not accepted {rejected} · Suspected fake {suspected_fake} · Withdrawn {revoked} | منظور {approved} · منتظر {pending} · قبول نہیں {rejected} · مشکوک {suspected_fake} · واپس {revoked} | Manzoor {approved} · Muntazir {pending} · Qabool nahi {rejected} · Mashkook {suspected_fake} · Wapas {revoked} | |
| adminx.users.openIdentity | Open in identity review | شناخت کی جانچ میں کھولیں | Shanakht ki jaanch mein kholein | |
| adminx.users.customerSummary | Customer | گاہک | Gahak | |
| adminx.users.savedWorkers | one: {count} saved worker / other: {count} saved workers | one: {count} محفوظ کاریگر / other: {count} محفوظ کاریگر | one: {count} mehfooz karigar / other: {count} mehfooz karigar | |
| adminx.users.activity | Last activity of this account | اس اکاؤنٹ کی تازہ سرگرمی | Is account ki taza sargarmi | |
| adminx.users.noActivity | No audit entries for this account yet. | اس اکاؤنٹ کے لیے ابھی کوئی آڈٹ اندراج نہیں۔ | Is account ke liye abhi koi audit indraaj nahi. | |
| adminx.users.suspend | Suspend account | اکاؤنٹ معطل کریں | Account muattal karein | |
| adminx.users.reactivate | Reactivate account | اکاؤنٹ بحال کریں | Account bahaal karein | |
| adminx.users.suspendTitle | Suspend {name}? | {name} کو معطل کریں؟ | {name} ko muattal karein? | |
| adminx.users.suspendText | They will be logged out at once and cannot log in. A suspended worker is hidden from customers. You can reactivate the account later. | وہ فوراً لاگ آؤٹ ہو جائیں گے اور لاگ ان نہیں کر سکیں گے۔ معطل کاریگر گاہکوں کو نظر نہیں آتا۔ آپ بعد میں اکاؤنٹ بحال کر سکتے ہیں۔ | Woh foran logout ho jayenge aur login nahi kar sakenge. Muattal karigar gahakon ko nazar nahi aata. Aap baad mein account bahaal kar sakte hain. | |
| adminx.users.reactivateTitle | Reactivate {name}? | {name} کو بحال کریں؟ | {name} ko bahaal karein? | |
| adminx.users.reactivateText | They will be able to log in again. A worker becomes visible to customers again. | وہ دوبارہ لاگ ان کر سکیں گے۔ کاریگر دوبارہ گاہکوں کو نظر آئے گا۔ | Woh dobara login kar sakenge. Karigar dobara gahakon ko nazar aayega. | |
| adminx.users.reasonLabel | Reason (saved in the audit log) | وجہ (آڈٹ لاگ میں محفوظ ہوگی) | Wajah (audit log mein mehfooz hogi) | |
| adminx.users.reasonHint | At least 5 characters. Do not write a CNIC number. | کم از کم 5 حروف۔ شناختی کارڈ نمبر نہ لکھیں۔ | Kam az kam 5 huroof. CNIC number na likhein. | |
| adminx.users.reasonError | Write a reason of at least 5 characters. | کم از کم 5 حروف کی وجہ لکھیں۔ | Kam az kam 5 huroof ki wajah likhein. | |
| adminx.users.suspended | Account suspended | اکاؤنٹ معطل ہو گیا | Account muattal ho gaya | |
| adminx.users.reactivated | Account reactivated | اکاؤنٹ بحال ہو گیا | Account bahaal ho gaya | |
| adminx.users.savedText | Written to the audit log. | آڈٹ لاگ میں لکھ دیا گیا۔ | Audit log mein likh diya gaya. | |
| adminx.users.adminNote | Admin accounts are managed with the create-admin script, not here. | ایڈمن اکاؤنٹ create-admin اسکرپٹ سے سنبھالے جاتے ہیں، یہاں سے نہیں۔ | Admin accounts create-admin script se sambhalay jate hain, yahan se nahi. | |
| adminx.users.selfNote | This is your own account. You cannot suspend it. | یہ آپ کا اپنا اکاؤنٹ ہے۔ آپ اسے معطل نہیں کر سکتے۔ | Yeh aap ka apna account hai. Aap isay muattal nahi kar sakte. | |
| adminx.users.saveFailed | The change could not be saved. | تبدیلی محفوظ نہیں ہو سکی۔ | Tabdeeli mehfooz nahi ho saki. | |
| adminx.templates.title | Reason templates | وجوہات کے سانچے | Wajuhaat ke templates | |
| adminx.templates.lead | Sentences you use again and again. In a decision, choose one to fill the note, then change it if needed. | وہ جملے جو آپ بار بار لکھتے ہیں۔ فیصلے میں ایک چنیں، نوٹ بھر جائے گا، پھر ضرورت ہو تو بدل لیں۔ | Woh jumlay jo aap baar baar likhte hain. Faislay mein aik chunein, note bhar jayega, phir zaroorat ho to badal lein. | |
| adminx.templates.empty | No templates yet | ابھی کوئی سانچہ نہیں | Abhi koi template nahi | |
| adminx.templates.emptyText | Add your own, or start with a ready set of common reasons in three languages. | اپنا سانچہ بنائیں، یا تین زبانوں میں عام وجوہات کے تیار مجموعے سے شروع کریں۔ | Apna template banayein, ya teen zabanon mein aam wajuhaat ke tayyar majmooay se shuru karein. | |
| adminx.templates.starter | Add the starter set | ابتدائی مجموعہ شامل کریں | Ibtidai majmooa shamil karein | |
| adminx.templates.starterAdded | one: {count} template added / other: {count} templates added | one: {count} سانچہ شامل ہوا / other: {count} سانچے شامل ہوئے | one: {count} template shamil hua / other: {count} templates shamil hue | |
| adminx.templates.starterNone | Every kind already has templates. | ہر قسم کے سانچے پہلے سے موجود ہیں۔ | Har qisam ke templates pehle se mojood hain. | |
| adminx.templates.add | Add a template | سانچہ شامل کریں | Template shamil karein | |
| adminx.templates.edit | Edit | ترمیم | Tarmeem | |
| adminx.templates.remove | Delete | حذف کریں | Hazf karein | |
| adminx.templates.kind | Used for | کس کے لیے | Kis ke liye | |
| adminx.templates.kinds.identity_verify | Identity: verified | شناخت: تصدیق شدہ | Shanakht: tasdeeq shuda | |
| adminx.templates.kinds.identity_reject | Identity: not accepted | شناخت: قبول نہیں | Shanakht: qabool nahi | |
| adminx.templates.kinds.evidence_reject | Proof: not accepted | ثبوت: قبول نہیں | Saboot: qabool nahi | |
| adminx.templates.kinds.evidence_fake | Proof: suspected fake | ثبوت: مشکوک | Saboot: mashkook | |
| adminx.templates.kinds.evidence_revoke | Proof: approval withdrawn | ثبوت: منظوری واپس | Saboot: manzoori wapas | |
| adminx.templates.kinds.user_suspend | Account: suspend | اکاؤنٹ: معطل | Account: muattal | |
| adminx.templates.kinds.user_reactivate | Account: reactivate | اکاؤنٹ: بحال | Account: bahaal | |
| adminx.templates.textEn | English text | انگریزی متن | English matan | |
| adminx.templates.textUr | Urdu text (optional) | اردو متن (اختیاری) | Urdu matan (ikhtiyari) | |
| adminx.templates.textRoman | Roman Urdu text (optional) | رومن اردو متن (اختیاری) | Roman Urdu matan (ikhtiyari) | |
| adminx.templates.textHint | One or two short sentences. Never a CNIC number. | ایک یا دو مختصر جملے۔ شناختی کارڈ نمبر کبھی نہیں۔ | Aik ya do mukhtasar jumlay. CNIC number kabhi nahi. | |
| adminx.templates.textError | Write the English text (at least 5 characters). | انگریزی متن لکھیں (کم از کم 5 حروف)۔ | English matan likhein (kam az kam 5 huroof). | |
| adminx.templates.addTitle | Add a reason template | وجہ کا سانچہ شامل کریں | Wajah ka template shamil karein | |
| adminx.templates.editTitle | Edit the reason template | وجہ کے سانچے میں ترمیم | Wajah ke template mein tarmeem | |
| adminx.templates.saved | Template saved | سانچہ محفوظ ہو گیا | Template mehfooz ho gaya | |
| adminx.templates.deleted | Template deleted | سانچہ حذف ہو گیا | Template hazf ho gaya | |
| adminx.templates.deleteTitle | Delete this template? | یہ سانچہ حذف کریں؟ | Yeh template hazf karein? | |
| adminx.templates.deleteText | Decisions already made keep their text. Only the template is removed. | پہلے ہو چکے فیصلوں کا متن برقرار رہتا ہے۔ صرف سانچہ ہٹتا ہے۔ | Pehle ho chuke faislon ka matan barqarar rehta hai. Sirf template hatta hai. | |
| adminx.templates.count | {count} of {max} templates | {max} میں سے {count} سانچے | {max} mein se {count} templates | |
| adminx.templates.missingLanguage | No text in this language | اس زبان میں متن نہیں | Is zabaan mein matan nahi | |
| adminx.templates.insert | Insert a saved reason | محفوظ وجہ ڈالیں | Mehfooz wajah daalein | |
| adminx.templates.insertNone | No saved reasons for this kind yet | اس قسم کی کوئی محفوظ وجہ نہیں | Is qisam ki koi mehfooz wajah nahi | |
| adminx.templates.manage | Manage templates | سانچے سنبھالیں | Templates sambhalein | |
| adminx.templates.loadFailed | The templates could not be loaded. | سانچے لوڈ نہیں ہو سکے۔ | Templates load nahi ho sake. | |
| adminx.exports.title | Exports | ایکسپورٹ | Exports | |
| adminx.exports.lead | Download a CSV file to open in Excel or Google Sheets. Every download is written to the audit log. | ایکسل یا گوگل شیٹس میں کھولنے کے لیے CSV فائل ڈاؤن لوڈ کریں۔ ہر ڈاؤن لوڈ آڈٹ لاگ میں لکھا جاتا ہے۔ | Excel ya Google Sheets mein kholne ke liye CSV file download karein. Har download audit log mein likha jata hai. | |
| adminx.exports.privacyTitle | What is never in an export | جو ایکسپورٹ میں کبھی نہیں ہوتا | Jo export mein kabhi nahi hota | |
| adminx.exports.privacyText | CNIC numbers, passwords, home addresses and photos are never included. The users file contains emails and phone numbers: keep it on your own computer and delete it when you are done. | شناختی کارڈ نمبر، پاس ورڈ، گھر کا پتہ اور تصاویر کبھی شامل نہیں ہوتیں۔ صارفین کی فائل میں ای میل اور فون نمبر ہوتے ہیں: اسے اپنے کمپیوٹر پر رکھیں اور کام ختم ہونے پر حذف کر دیں۔ | CNIC number, passwords, ghar ka pata aur tasaveer kabhi shamil nahi hotin. Users ki file mein emails aur phone numbers hote hain: isay apne computer par rakhein aur kaam khatam hone par hazf kar dein. | |
| adminx.exports.audit.title | Audit log | آڈٹ لاگ | Audit log | |
| adminx.exports.audit.text | Every entry with its hash, oldest first. Use the dates to limit the file. | ہر اندراج اپنے ہیش کے ساتھ، پرانا پہلے۔ فائل محدود کرنے کے لیے تاریخیں استعمال کریں۔ | Har indraaj apne hash ke saath, purana pehle. File mehdood karne ke liye tareekhein istemaal karein. | |
| adminx.exports.identity.title | Identity queue | شناخت کی قطار | Shanakht ki qataar | |
| adminx.exports.identity.text | Workers by identity status, with request and review dates. | شناخت کی حالت کے مطابق کاریگر، درخواست اور جانچ کی تاریخوں کے ساتھ۔ | Shanakht ki halat ke mutabiq karigar, darkhwast aur jaanch ki tareekhon ke saath. | |
| adminx.exports.evidence.title | Evidence queue | ثبوت کی قطار | Saboot ki qataar | |
| adminx.exports.evidence.text | Proof items by decision: skill, kind, dates and reasons. No photos. | فیصلے کے مطابق ثبوت: ہنر، قسم، تاریخیں اور وجوہات۔ تصاویر نہیں۔ | Faislay ke mutabiq saboot: hunar, qisam, tareekhein aur wajuhaat. Tasaveer nahi. | |
| adminx.exports.users.title | Users | صارفین | Users | |
| adminx.exports.users.text | Accounts with role and status. | اکاؤنٹ، کردار اور حالت کے ساتھ۔ | Accounts, role aur status ke saath. | |
| adminx.exports.status | Status | حالت | Status | |
| adminx.exports.from | From | سے | Se | |
| adminx.exports.to | To | تک | Tak | |
| adminx.exports.download | Download CSV | CSV ڈاؤن لوڈ کریں | CSV download karein | |
| adminx.exports.done | File downloaded: {rows} rows | فائل ڈاؤن لوڈ ہو گئی: {rows} قطاریں | File download ho gayi: {rows} qataarein | |
| adminx.exports.truncated | Only the first {rows} rows are in the file. Use the filters to get the rest. | فائل میں صرف پہلی {rows} قطاریں ہیں۔ باقی کے لیے فلٹر استعمال کریں۔ | File mein sirf pehli {rows} qataarein hain. Baqi ke liye filter istemaal karein. | |
| adminx.exports.failed | The file could not be downloaded. | فائل ڈاؤن لوڈ نہیں ہو سکی۔ | File download nahi ho saki. | |
| adminx.exports.limit | A file has at most 5,000 rows. | ایک فائل میں زیادہ سے زیادہ 5,000 قطاریں ہوتی ہیں۔ | Aik file mein zyada se zyada 5,000 qataarein hoti hain. | |
| adminx.shortcuts.title | Keyboard shortcuts | کی بورڈ شارٹ کٹ | Keyboard shortcuts | |
| adminx.shortcuts.open | Keyboard shortcuts | کی بورڈ شارٹ کٹ | Keyboard shortcuts | |
| adminx.shortcuts.hint | Press ? for keyboard shortcuts | شارٹ کٹ دیکھنے کے لیے ? دبائیں | Shortcuts dekhne ke liye ? dabayein | |
| adminx.shortcuts.approve | Approve / verified | منظور / تصدیق شدہ | Manzoor / tasdeeq shuda | |
| adminx.shortcuts.reject | Reject / not accepted | مسترد / قبول نہیں | Mustarad / qabool nahi | |
| adminx.shortcuts.next | Next item | اگلا | Agla | |
| adminx.shortcuts.previous | Previous item | پچھلا | Pichla | |
| adminx.shortcuts.help | Show this list | یہ فہرست دکھائیں | Yeh fehrist dikhayein | |
| adminx.shortcuts.close | Close the panel | پینل بند کریں | Panel band karein | |
| adminx.shortcuts.note | Shortcuts do not work while you are typing in a box. | جب آپ کسی خانے میں لکھ رہے ہوں تو شارٹ کٹ کام نہیں کرتے۔ | Jab aap kisi khanay mein likh rahe hon to shortcuts kaam nahi karte. | |
| adminx.compare.title | Compare the two photos | دونوں تصاویر کا موازنہ | Dono tasaveer ka muwazna | |
| adminx.compare.slider | Slide to compare this upload with the earlier photo | اس اپ لوڈ کا پہلے والی تصویر سے موازنہ کرنے کے لیے سرکائیں | Is upload ka pehle wali tasveer se muwazna karne ke liye sarkayein | |
| adminx.compare.thisUpload | This upload | یہ اپ لوڈ | Yeh upload | |
| adminx.compare.earlier | Earlier photo | پہلے والی تصویر | Pehle wali tasveer | |
| adminx.compare.sideBySide | Side by side | ساتھ ساتھ | Saath saath | |
| adminx.compare.overlay | Slider | سلائیڈر | Slider | |

## Website texts: `status_account`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| status_account.active | Active | فعال | Active | |
| status_account.suspended | Suspended | معطل | Muattal | |

## Website texts: `customerx`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| customerx.titles.saved | Saved workers | محفوظ کاریگر | Mehfooz karigar | |
| customerx.titles.compare | Compare workers | کاریگروں کا موازنہ | Karigaron ka muwazna | |
| customerx.instant | Results update as you type. | لکھتے ہی نتائج بدل جاتے ہیں۔ | Likhte hi nataij badal jate hain. | |
| customerx.sort.label | Sort by | ترتیب | Tarteeb | |
| customerx.sort.updated | Recently updated | حال ہی میں اپ ڈیٹ ہوئے | Haal hi mein update hue | |
| customerx.sort.experience | Most experience | سب سے زیادہ تجربہ | Sab se zyada tajurba | |
| customerx.sort.evidence | Most approved proof | سب سے زیادہ منظور شدہ ثبوت | Sab se zyada manzoor shuda saboot | |
| customerx.sort.hint | "Most approved proof" counts the photos an admin approved, over all skills of a worker. | "سب سے زیادہ منظور شدہ ثبوت" میں کاریگر کے تمام ہنروں کی وہ تصاویر گنی جاتی ہیں جو ایڈمن نے منظور کیں۔ | "Sab se zyada manzoor shuda saboot" mein karigar ke tamam hunaron ki woh tasaveer gini jati hain jo admin ne manzoor kin. | |
| customerx.chips.label | Filters in use | لگے ہوئے فلٹر | Lage hue filter | |
| customerx.chips.remove | Remove filter: {name} | فلٹر ہٹائیں: {name} | Filter hatayein: {name} | |
| customerx.chips.search | Search: {value} | تلاش: {value} | Talaash: {value} | |
| customerx.chips.city | City: {value} | شہر: {value} | Shehar: {value} | |
| customerx.chips.identity | Identity verified | شناخت تصدیق شدہ | Shanakht tasdeeq shuda | |
| customerx.chips.skills | Verified skills | تصدیق شدہ ہنر | Tasdeeq shuda hunar | |
| customerx.save | Save {name} | {name} کو محفوظ کریں | {name} ko mehfooz karein | |
| customerx.unsave | Remove {name} from saved | {name} کو محفوظ فہرست سے ہٹائیں | {name} ko mehfooz fehrist se hatayein | |
| customerx.savedToast | Saved to your list | آپ کی فہرست میں محفوظ ہو گیا | Aap ki fehrist mein mehfooz ho gaya | |
| customerx.removedToast | Removed from your list | آپ کی فہرست سے ہٹا دیا گیا | Aap ki fehrist se hata diya gaya | |
| customerx.saveFailed | Could not change your saved list. Please try again. | محفوظ فہرست نہیں بدل سکی۔ دوبارہ کوشش کریں۔ | Mehfooz fehrist nahi badal saki. Dobara koshish karein. | |
| customerx.undo | Undo | واپس کریں | Wapas karein | |
| customerx.saved.title | Saved workers | محفوظ کاریگر | Mehfooz karigar | |
| customerx.saved.lead | Workers you saved. Only you can see this list. | وہ کاریگر جو آپ نے محفوظ کیے۔ یہ فہرست صرف آپ دیکھ سکتے ہیں۔ | Woh karigar jo aap ne mehfooz kiye. Yeh fehrist sirf aap dekh sakte hain. | |
| customerx.saved.emptyTitle | No saved workers yet | ابھی کوئی محفوظ کاریگر نہیں | Abhi koi mehfooz karigar nahi | |
| customerx.saved.emptyText | Tap the heart on a worker to keep them here. | کسی کاریگر کو یہاں رکھنے کے لیے دل کے نشان پر ٹیپ کریں۔ | Kisi karigar ko yahan rakhne ke liye dil ke nishan par tap karein. | |
| customerx.saved.count | one: {count} saved worker / other: {count} saved workers | one: {count} محفوظ کاریگر / other: {count} محفوظ کاریگر | one: {count} mehfooz karigar / other: {count} mehfooz karigar | |
| customerx.saved.find | Find workers | کاریگر تلاش کریں | Karigar talaash karein | |
| customerx.saved.loadFailed | Your saved workers could not be loaded. | آپ کے محفوظ کاریگر لوڈ نہیں ہو سکے۔ | Aap ke mehfooz karigar load nahi ho sake. | |
| customerx.compare.add | Add {name} to compare | {name} کو موازنے میں شامل کریں | {name} ko muwazne mein shamil karein | |
| customerx.compare.remove | Remove {name} from compare | {name} کو موازنے سے ہٹائیں | {name} ko muwazne se hatayein | |
| customerx.compare.label | Compare | موازنہ | Muwazna | |
| customerx.compare.tray | Workers to compare | موازنے کے لیے کاریگر | Muwazne ke liye karigar | |
| customerx.compare.trayHint | one: {count} worker chosen. Choose one more. / other: {count} workers chosen. | one: {count} کاریگر چنا گیا۔ ایک اور چنیں۔ / other: {count} کاریگر چنے گئے۔ | one: {count} karigar chuna gaya. Aik aur chunein. / other: {count} karigar chune gaye. | |
| customerx.compare.open | Compare now | ابھی موازنہ کریں | Abhi muwazna karein | |
| customerx.compare.clear | Clear | صاف کریں | Saaf karein | |
| customerx.compare.full | You can compare at most three workers. | آپ زیادہ سے زیادہ تین کاریگروں کا موازنہ کر سکتے ہیں۔ | Aap zyada se zyada teen karigaron ka muwazna kar sakte hain. | |
| customerx.compare.title | Compare workers | کاریگروں کا موازنہ | Karigaron ka muwazna | |
| customerx.compare.lead | Side by side: what each worker says, and what an admin has checked. | ساتھ ساتھ: ہر کاریگر کیا کہتا ہے، اور ایڈمن نے کیا چیک کیا ہے۔ | Saath saath: har karigar kya kehta hai, aur admin ne kya check kiya hai. | |
| customerx.compare.needTwo | Choose two or three workers to compare | موازنے کے لیے دو یا تین کاریگر چنیں | Muwazne ke liye do ya teen karigar chunein | |
| customerx.compare.needTwoText | On the search page, tick "Compare" on the workers you want to see side by side. | تلاش کے صفحے پر جن کاریگروں کو ساتھ ساتھ دیکھنا ہے ان پر "موازنہ" کا نشان لگائیں۔ | Talaash ke safhe par jin karigaron ko saath saath dekhna hai un par "Muwazna" ka nishan lagayein. | |
| customerx.compare.missing | Some workers could not be shown. They may no longer be listed. | کچھ کاریگر نہیں دکھائے جا سکے۔ شاید وہ اب فہرست میں نہیں۔ | Kuch karigar nahi dikhaye ja sake. Shayad woh ab fehrist mein nahi. | |
| customerx.compare.rows.trade | Trade | پیشہ | Pesha | |
| customerx.compare.rows.city | City | شہر | Shehar | |
| customerx.compare.rows.experience | Experience | تجربہ | Tajurba | |
| customerx.compare.rows.perHour | Per hour | فی گھنٹہ | Fi ghanta | |
| customerx.compare.rows.perDay | Per day | فی دن | Fi din | |
| customerx.compare.rows.availability | Availability | دستیابی | Dastiyabi | |
| customerx.compare.rows.identity | Identity | شناخت | Shanakht | |
| customerx.compare.rows.verifiedSkills | Skills verified by evidence | ثبوت سے تصدیق شدہ ہنر | Saboot se tasdeeq shuda hunar | |
| customerx.compare.rows.otherSkills | Other skills (self-declared) | دوسرے ہنر (خود بتائے گئے) | Doosre hunar (khud bataye gaye) | |
| customerx.compare.rows.languages | Languages | زبانیں | Zabanein | |
| customerx.compare.none | None yet | ابھی کوئی نہیں | Abhi koi nahi | |
| customerx.compare.viewProfile | View profile | پروفائل دیکھیں | Profile dekhein | |
| customerx.compare.removeColumn | Remove {name} from this comparison | {name} کو اس موازنے سے ہٹائیں | {name} ko is muwazne se hatayein | |
| customerx.compare.caption | Comparison of the chosen workers | چنے گئے کاریگروں کا موازنہ | Chune gaye karigaron ka muwazna | |
| customerx.compare.loadFailed | The comparison could not be loaded. | موازنہ لوڈ نہیں ہو سکا۔ | Muwazna load nahi ho saka. | |
| customerx.recent.title | Recently viewed | حال ہی میں دیکھے گئے | Haal hi mein dekhe gaye | |
| customerx.recent.hint | Kept on this device only. | صرف اسی ڈیوائس پر محفوظ۔ | Sirf isi device par mehfooz. | |
| customerx.recent.clear | Clear the list | فہرست صاف کریں | Fehrist saaf karein | |
| customerx.share.button | Share | شیئر کریں | Share karein | |
| customerx.share.text | {name}, {trade}, on Digital Labour Marketplace | {name}، {trade}، ڈیجیٹل لیبر مارکیٹ پلیس پر | {name}, {trade}, Digital Labour Marketplace par | |
| customerx.share.copied | Link copied | لنک کاپی ہو گیا | Link copy ho gaya | |
| customerx.share.copyFailed | Could not copy. Copy the address from the browser bar instead. | کاپی نہیں ہو سکا۔ براؤزر کے ایڈریس بار سے پتہ کاپی کریں۔ | Copy nahi ho saka. Browser ke address bar se pata copy karein. | |
| customerx.share.note | The link opens the public profile for customers who are logged in. Phone and CNIC are never part of it. | یہ لنک لاگ ان گاہکوں کے لیے عوامی پروفائل کھولتا ہے۔ فون اور شناختی کارڈ نمبر اس میں کبھی شامل نہیں۔ | Yeh link login gahakon ke liye public profile kholta hai. Phone aur CNIC is mein kabhi shamil nahi. | |
| customerx.print | Print | پرنٹ کریں | Print karein | |
| customerx.matches | matches your search | آپ کی تلاش سے ملتا ہے | aap ki talaash se milta hai | |

## Website texts: `workerx`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| workerx.masks.cnicOk | CNIC format looks right | شناختی کارڈ نمبر کی شکل درست لگتی ہے | CNIC ki shakal durust lagti hai | |
| workerx.masks.cnicMore | one: {count} more digit / other: {count} more digits | one: {count} ہندسہ اور / other: {count} ہندسے اور | one: {count} hindsa aur / other: {count} hindsay aur | |
| workerx.masks.mobileOk | Mobile number looks right | موبائل نمبر درست لگتا ہے | Mobile number durust lagta hai | |
| workerx.masks.mobileStart | A mobile number starts with 03 | موبائل نمبر 03 سے شروع ہوتا ہے | Mobile number 03 se shuru hota hai | |
| workerx.masks.mobileMore | one: {count} more digit / other: {count} more digits | one: {count} ہندسہ اور / other: {count} ہندسے اور | one: {count} hindsa aur / other: {count} hindsay aur | |
| workerx.masks.rupees | Rs {amount} | {amount} روپے | Rs {amount} | |
| workerx.masks.rupeesMax | The highest amount is Rs 1,000,000 | زیادہ سے زیادہ رقم 1,000,000 روپے ہے | Zyada se zyada raqam Rs 1,000,000 hai | |
| workerx.draft.restored | Draft restored | مسودہ واپس آ گیا | Draft wapas aa gaya | |
| workerx.draft.restoredText | We put back what you typed last time. It is not saved yet. | پچھلی بار جو آپ نے لکھا تھا وہ واپس رکھ دیا گیا ہے۔ یہ ابھی محفوظ نہیں ہوا۔ | Pichli baar jo aap ne likha tha woh wapas rakh diya gaya hai. Yeh abhi mehfooz nahi hua. | |
| workerx.draft.discard | Discard draft | مسودہ ہٹا دیں | Draft hata dein | |
| workerx.draft.note | What you type is kept on this device until you save. Your CNIC is never kept. | جو آپ لکھتے ہیں وہ محفوظ کرنے تک اسی ڈیوائس پر رہتا ہے۔ شناختی کارڈ نمبر کبھی نہیں رکھا جاتا۔ | Jo aap likhte hain woh mehfooz karne tak isi device par rehta hai. CNIC kabhi nahi rakha jata. | |
| workerx.copy.button | Copy worker ID | کاریگر آئی ڈی کاپی کریں | Worker ID copy karein | |
| workerx.copy.copied | Worker ID copied | کاریگر آئی ڈی کاپی ہو گئی | Worker ID copy ho gayi | |
| workerx.copy.failed | Could not copy. Please select the ID and copy it. | کاپی نہیں ہو سکی۔ آئی ڈی کو چن کر کاپی کریں۔ | Copy nahi ho saki. ID ko chun kar copy karein. | |
| workerx.strength.title | Profile strength | پروفائل کی مضبوطی | Profile ki mazbooti | |
| workerx.strength.ringCaption | Profile filled in | پروفائل کتنا بھرا ہے | Profile kitna bhara hai | |
| workerx.strength.levels.starting | Getting started | ابھی شروعات | Abhi shuruaat | |
| workerx.strength.levels.good | Good | اچھا | Acha | |
| workerx.strength.levels.strong | Strong | مضبوط | Mazboot | |
| workerx.strength.levels.complete | Complete | مکمل | Mukammal | |
| workerx.strength.leads.starting | A few basics are missing. Customers choose workers with a full profile. | کچھ بنیادی چیزیں رہتی ہیں۔ گاہک مکمل پروفائل والے کاریگر چنتے ہیں۔ | Kuch bunyadi cheezein rehti hain. Gahak mukammal profile wale karigar chunte hain. | |
| workerx.strength.leads.good | A good start. The steps below make your profile stronger. | اچھی شروعات۔ نیچے کے قدم آپ کے پروفائل کو مضبوط کرتے ہیں۔ | Achi shuruaat. Neeche ke qadam aap ke profile ko mazboot karte hain. | |
| workerx.strength.leads.strong | Almost there. Approved proof is what customers trust most. | تقریباً مکمل۔ گاہک سب سے زیادہ منظور شدہ ثبوت پر بھروسہ کرتے ہیں۔ | Taqreeban mukammal. Gahak sab se zyada manzoor shuda saboot par bharosa karte hain. | |
| workerx.strength.leads.complete | Everything is filled in and at least one skill has approved proof. | سب کچھ بھرا ہوا ہے اور کم از کم ایک ہنر کا ثبوت منظور ہے۔ | Sab kuch bhara hua hai aur kam az kam aik hunar ka saboot manzoor hai. | |
| workerx.strength.tipsTitle | What to do next | اب کیا کریں | Ab kya karein | |
| workerx.strength.noTips | Nothing left to do. Well done. | کچھ باقی نہیں۔ شاباش۔ | Kuch baqi nahi. Shabash. | |
| workerx.strength.tips.add_trade | Add your trade | اپنا پیشہ شامل کریں | Apna pesha shamil karein | |
| workerx.strength.tips.add_skills | Add your skills | اپنے ہنر شامل کریں | Apne hunar shamil karein | |
| workerx.strength.tips.add_cnic | Add your CNIC for the identity check | شناخت کی جانچ کے لیے شناختی کارڈ نمبر شامل کریں | Shanakht ki jaanch ke liye CNIC shamil karein | |
| workerx.strength.tips.fix_identity | Your identity check was not accepted: update your details | آپ کی شناخت قبول نہیں ہوئی: اپنی تفصیل درست کریں | Aap ki shanakht qabool nahi hui: apni tafseel durust karein | |
| workerx.strength.tips.replace_proof | Replace the proof that was not accepted for {skill} | {skill} کا وہ ثبوت بدلیں جو قبول نہیں ہوا | {skill} ka woh saboot badlein jo qabool nahi hua | |
| workerx.strength.tips.add_proof | Add proof for {skill} | {skill} کا ثبوت شامل کریں | {skill} ka saboot shamil karein | |
| workerx.strength.tips.add_experience_rate | Add your experience and a rate | اپنا تجربہ اور ریٹ شامل کریں | Apna tajurba aur rate shamil karein | |
| workerx.strength.tips.add_bio | Write a short bio | اپنے بارے میں چند جملے لکھیں | Apne baare mein chand jumlay likhein | |
| workerx.strength.tips.add_work_history | Add a past job | کوئی پچھلا کام شامل کریں | Koi pichla kaam shamil karein | |
| workerx.strength.tips.add_city_address | Add your city and area | اپنا شہر اور علاقہ شامل کریں | Apna shehar aur ilaqa shamil karein | |
| workerx.strength.tips.add_contact | Add a WhatsApp number or an emergency contact | واٹس ایپ نمبر یا ہنگامی رابطہ شامل کریں | WhatsApp number ya hangami rabta shamil karein | |
| workerx.strength.proofLine | Skills with approved proof: {approved} · waiting for review: {pending} · without proof: {none} | منظور شدہ ثبوت والے ہنر: {approved} · جانچ کے منتظر: {pending} · بغیر ثبوت: {none} | Manzoor shuda saboot wale hunar: {approved} · jaanch ke muntazir: {pending} · baghair saboot: {none} | |
| workerx.strength.how | How this is counted | یہ کیسے گنا جاتا ہے | Yeh kaise gina jata hai | |
| workerx.strength.howText | The percentage is a checklist, not a rating: account 20, trade 15, experience and a rate 15, city and area 10, a contact 10, skills 15, bio 5, a past job 10. "Complete" also needs one skill with approved proof. | یہ فیصد ایک فہرست ہے، درجہ بندی نہیں: اکاؤنٹ 20، پیشہ 15، تجربہ اور ریٹ 15، شہر اور علاقہ 10، رابطہ 10، ہنر 15، تعارف 5، پچھلا کام 10۔ "مکمل" کے لیے ایک ہنر کا منظور شدہ ثبوت بھی ضروری ہے۔ | Yeh feesad aik fehrist hai, darja bandi nahi: account 20, pesha 15, tajurba aur rate 15, shehar aur ilaqa 10, rabta 10, hunar 15, taaruf 5, pichla kaam 10. "Mukammal" ke liye aik hunar ka manzoor shuda saboot bhi zaroori hai. | |
| workerx.strength.checks.account | Account created | اکاؤنٹ بن گیا | Account ban gaya | |
| workerx.strength.checks.trade | Trade | پیشہ | Pesha | |
| workerx.strength.checks.experienceRate | Experience and a rate | تجربہ اور ریٹ | Tajurba aur rate | |
| workerx.strength.checks.cityAddress | City and area | شہر اور علاقہ | Shehar aur ilaqa | |
| workerx.strength.checks.contact | WhatsApp or emergency contact | واٹس ایپ یا ہنگامی رابطہ | WhatsApp ya hangami rabta | |
| workerx.strength.checks.skills | Skills | ہنر | Hunar | |
| workerx.strength.checks.bio | Short bio | مختصر تعارف | Mukhtasar taaruf | |
| workerx.strength.checks.workHistory | A past job | پچھلا کام | Pichla kaam | |
| workerx.strength.done | done | ہو گیا | ho gaya | |
| workerx.strength.missing | missing | باقی ہے | baqi hai | |
| workerx.potential.title | You may also do… | آپ یہ کام بھی کرتے ہوں گے… | Aap yeh kaam bhi karte honge… | |
| workerx.potential.lead | Skills from your trade that are not on your profile yet. Add only what you really do. | آپ کے پیشے کے وہ ہنر جو ابھی آپ کے پروفائل پر نہیں۔ صرف وہی شامل کریں جو آپ واقعی کرتے ہیں۔ | Aap ke peshay ke woh hunar jo abhi aap ke profile par nahi. Sirf wohi shamil karein jo aap waqai karte hain. | |
| workerx.potential.add | Add {skill} | {skill} شامل کریں | {skill} shamil karein | |
| workerx.potential.added | {skill} added to your profile | {skill} آپ کے پروفائل میں شامل ہو گیا | {skill} aap ke profile mein shamil ho gaya | |
| workerx.potential.none | No more suggestions for your trade. | آپ کے پیشے کے لیے مزید تجاویز نہیں۔ | Aap ke peshay ke liye mazeed tajaweez nahi. | |
| workerx.potential.honest | Suggested only because they belong to the same trade. Nothing is added without your tap. | یہ صرف اس لیے تجویز ہوئے کہ یہ اسی پیشے کے ہیں۔ آپ کے ٹیپ کے بغیر کچھ شامل نہیں ہوتا۔ | Yeh sirf is liye tajweez hue ke yeh isi peshay ke hain. Aap ke tap ke baghair kuch shamil nahi hota. | |
| workerx.potential.failed | The skill could not be added. Please try again. | ہنر شامل نہیں ہو سکا۔ دوبارہ کوشش کریں۔ | Hunar shamil nahi ho saka. Dobara koshish karein. | |
| workerx.skillRemoved | {skill} removed | {skill} ہٹا دیا گیا | {skill} hata diya gaya | |
| workerx.undo | Undo | واپس کریں | Wapas karein | |
| workerx.undoFailed | The skill could not be put back. Please add it again. | ہنر واپس نہیں آ سکا۔ براہ کرم اسے دوبارہ شامل کریں۔ | Hunar wapas nahi aa saka. Barah-e-karam isay dobara shamil karein. | |
| workerx.highlight.label | Your text with the matched words marked | آپ کی تحریر جس میں ملنے والے الفاظ نمایاں ہیں | Aap ki tehreer jis mein milne wale alfaaz numayan hain | |
| workerx.highlight.legend | Marked words are the ones the word list matched. | نمایاں الفاظ وہ ہیں جو الفاظ کی فہرست سے ملے۔ | Numayan alfaaz woh hain jo alfaaz ki fehrist se mile. | |
| workerx.examples.label | Example sentences | مثال کے جملے | Misaal ke jumlay | |
| workerx.examples.next | Next example | اگلی مثال | Agli misaal | |
| workerx.examples.previous | Previous example | پچھلی مثال | Pichli misaal | |
| workerx.examples.use | Use this example | یہ مثال استعمال کریں | Yeh misaal istemaal karein | |
| workerx.examples.position | Example {n} of {total} | مثال {n} از {total} | Misaal {n} az {total} | |
| workerx.upload.tipTitle | Take a clear photo of your certificate | اپنے سرٹیفکیٹ کی صاف تصویر لیں | Apne certificate ki saaf tasveer lein | |
| workerx.upload.tip | Lay it flat in good light, with all four corners inside the picture. Photos only: for a paper or PDF document, take a photo of it. | اسے اچھی روشنی میں سیدھا رکھیں اور چاروں کونے تصویر میں آئیں۔ صرف تصاویر: کاغذ یا PDF دستاویز کی تصویر لے لیں۔ | Isay achi roshni mein seedha rakhein aur charon konay tasveer mein aayein. Sirf tasaveer: kaghaz ya PDF dastavez ki tasveer le lein. | |
| workerx.upload.compressing | Making the photo smaller… | تصویر چھوٹی کی جا رہی ہے… | Tasveer chhoti ki ja rahi hai… | |
| workerx.upload.compressed | Photo made smaller for a faster upload: {before} to {after} | تیز اپ لوڈ کے لیے تصویر چھوٹی کر دی گئی: {before} سے {after} | Tez upload ke liye tasveer chhoti kar di gayi: {before} se {after} | |
| workerx.upload.edit | Crop or rotate | کاٹیں یا گھمائیں | Kaatein ya ghumayein | |
| workerx.upload.editorTitle | Crop or rotate the photo | تصویر کاٹیں یا گھمائیں | Tasveer kaatein ya ghumayein | |
| workerx.upload.editorText | Cut away the edges that are not needed. The admin sees exactly this picture. | غیر ضروری کنارے کاٹ دیں۔ ایڈمن بالکل یہی تصویر دیکھے گا۔ | Ghair zaroori kinare kaat dein. Admin bilkul yehi tasveer dekhega. | |
| workerx.upload.rotateLeft | Rotate left | بائیں گھمائیں | Baayein ghumayein | |
| workerx.upload.rotateRight | Rotate right | دائیں گھمائیں | Daayein ghumayein | |
| workerx.upload.cropLeft | Cut from the left side | بائیں طرف سے کاٹیں | Baayein taraf se kaatein | |
| workerx.upload.cropRight | Cut from the right side | دائیں طرف سے کاٹیں | Daayein taraf se kaatein | |
| workerx.upload.cropTop | Cut from the top | اوپر سے کاٹیں | Oopar se kaatein | |
| workerx.upload.cropBottom | Cut from the bottom | نیچے سے کاٹیں | Neeche se kaatein | |
| workerx.upload.reset | Start again | دوبارہ شروع کریں | Dobara shuru karein | |
| workerx.upload.apply | Use this photo | یہی تصویر استعمال کریں | Yehi tasveer istemaal karein | |
| workerx.upload.previewAlt | The photo as it will be uploaded | تصویر جیسی اپ لوڈ ہوگی | Tasveer jaisi upload hogi | |
| workerx.upload.editFailed | This browser could not change the photo. You can upload it as it is. | یہ براؤزر تصویر نہیں بدل سکا۔ آپ اسے ویسے ہی اپ لوڈ کر سکتے ہیں۔ | Yeh browser tasveer nahi badal saka. Aap isay waise hi upload kar sakte hain. | |
| workerx.upload.percent | {percent}% uploaded | {percent}% اپ لوڈ ہو گیا | {percent}% upload ho gaya | |
| workerx.upload.cancel | Cancel upload | اپ لوڈ منسوخ کریں | Upload mansookh karein | |
| workerx.upload.cancelled | Upload cancelled. Nothing was saved. | اپ لوڈ منسوخ ہو گیا۔ کچھ محفوظ نہیں ہوا۔ | Upload mansookh ho gaya. Kuch mehfooz nahi hua. | |
| workerx.setup.chip | Continue setup | سیٹ اپ جاری رکھیں | Setup jaari rakhein | |
| workerx.setup.label | Continue setting up your profile: step {n} of {total} | اپنا پروفائل مکمل کریں: قدم {n} از {total} | Apna profile mukammal karein: qadam {n} az {total} | |
| workerx.availability.label | Availability | دستیابی | Dastiyabi | |
| workerx.availability.Available | Available | دستیاب | Dastiyab | |
| workerx.availability.Busy | Busy | مصروف | Masroof | |
| workerx.availability.toggle | I am available for work | میں کام کے لیے دستیاب ہوں | Main kaam ke liye dastiyab hoon | |
| workerx.availability.saved | Customers now see: {status} | گاہکوں کو اب نظر آتا ہے: {status} | Gahakon ko ab nazar aata hai: {status} | |
| workerx.availability.failed | Your availability could not be changed. | آپ کی دستیابی نہیں بدل سکی۔ | Aap ki dastiyabi nahi badal saki. | |
| workerx.shareMine | Share my profile | میرا پروفائل شیئر کریں | Mera profile share karein | |
| workerx.notifications.bell | Notifications | اطلاعات | Ittelaat | |
| workerx.notifications.unread | one: {count} unread notification / other: {count} unread notifications | one: {count} نئی اطلاع / other: {count} نئی اطلاعات | one: {count} nayi ittela / other: {count} nayi ittelaat | |
| workerx.notifications.title | Notifications | اطلاعات | Ittelaat | |
| workerx.notifications.markAll | Mark all as read | سب کو پڑھا ہوا کریں | Sab ko parha hua karein | |
| workerx.notifications.empty | No notifications yet | ابھی کوئی اطلاع نہیں | Abhi koi ittela nahi | |
| workerx.notifications.emptyText | When an admin checks your identity or your proof, you will see it here. | جب ایڈمن آپ کی شناخت یا ثبوت چیک کرے گا تو آپ کو یہاں نظر آئے گا۔ | Jab admin aap ki shanakht ya saboot check karega to aap ko yahan nazar aayega. | |
| workerx.notifications.newOne | New | نئی | Nayi | |
| workerx.notifications.seeAll | See all notifications | تمام اطلاعات دیکھیں | Tamam ittelaat dekhein | |
| workerx.notifications.loadFailed | Your notifications could not be loaded. | آپ کی اطلاعات لوڈ نہیں ہو سکیں۔ | Aap ki ittelaat load nahi ho sakin. | |
| workerx.notifications.lead | What an admin decided about your identity and your proof. Kept for 180 days. | ایڈمن نے آپ کی شناخت اور ثبوت کے بارے میں کیا فیصلہ کیا۔ 180 دن تک محفوظ۔ | Admin ne aap ki shanakht aur saboot ke baare mein kya faisla kiya. 180 din tak mehfooz. | |
| workerx.notifications.reason | Reason: {note} | وجہ: {note} | Wajah: {note} | |
| workerx.notifications.types.identity_verified.title | Your identity is verified | آپ کی شناخت کی تصدیق ہو گئی | Aap ki shanakht ki tasdeeq ho gayi | |
| workerx.notifications.types.identity_verified.text | Customers now see "Identity verified" on your profile. | گاہکوں کو اب آپ کے پروفائل پر "شناخت تصدیق شدہ" نظر آتا ہے۔ | Gahakon ko ab aap ke profile par "Shanakht tasdeeq shuda" nazar aata hai. | |
| workerx.notifications.types.identity_rejected.title | Your identity check was not accepted | آپ کی شناخت قبول نہیں ہوئی | Aap ki shanakht qabool nahi hui | |
| workerx.notifications.types.identity_rejected.text | Please read the reason and update your details. | براہ کرم وجہ پڑھیں اور اپنی تفصیل درست کریں۔ | Barah-e-karam wajah parhein aur apni tafseel durust karein. | |
| workerx.notifications.types.evidence_approved.title | Proof approved for {skill} | {skill} کا ثبوت منظور ہو گیا | {skill} ka saboot manzoor ho gaya | |
| workerx.notifications.types.evidence_approved.text | This skill now shows "Verified by evidence". | یہ ہنر اب "ثبوت سے تصدیق شدہ" دکھاتا ہے۔ | Yeh hunar ab "Saboot se tasdeeq shuda" dikhata hai. | |
| workerx.notifications.types.evidence_rejected.title | Proof not accepted for {skill} | {skill} کا ثبوت قبول نہیں ہوا | {skill} ka saboot qabool nahi hua | |
| workerx.notifications.types.evidence_rejected.text | You can upload a clearer or more fitting photo. | آپ زیادہ صاف یا مناسب تصویر اپ لوڈ کر سکتے ہیں۔ | Aap zyada saaf ya munasib tasveer upload kar sakte hain. | |
| workerx.notifications.types.evidence_suspected_fake.title | Proof for {skill} was marked as a suspected fake | {skill} کا ثبوت مشکوک قرار دیا گیا | {skill} ka saboot mashkook qarar diya gaya | |
| workerx.notifications.types.evidence_suspected_fake.text | Please contact the admin. | براہ کرم ایڈمن سے رابطہ کریں۔ | Barah-e-karam admin se rabta karein. | |
| workerx.notifications.types.evidence_revoked.title | Approval withdrawn for {skill} | {skill} کی منظوری واپس لے لی گئی | {skill} ki manzoori wapas le li gayi | |
| workerx.notifications.types.evidence_revoked.text | This proof no longer counts for the skill. | یہ ثبوت اب اس ہنر کے لیے شمار نہیں ہوتا۔ | Yeh saboot ab is hunar ke liye shumar nahi hota. | |
| workerx.tour.label | Welcome tour | تعارفی دورہ | Taarufi daura | |
| workerx.tour.position | {n} of {total} | {n} از {total} | {n} az {total} | |
| workerx.tour.next | Next | اگلا | Agla | |
| workerx.tour.back | Back | پیچھے | Peeche | |
| workerx.tour.skip | Skip the tour | دورہ چھوڑ دیں | Daura chhor dein | |
| workerx.tour.done | Done | ٹھیک ہے | Theek hai | |
| workerx.tour.steps.strength.title | Your profile strength | آپ کے پروفائل کی مضبوطی | Aap ke profile ki mazbooti | |
| workerx.tour.steps.strength.text | This shows what is filled in and the next useful step. It is a checklist, not a rating. | یہ دکھاتا ہے کہ کیا بھرا ہے اور اگلا مفید قدم کیا ہے۔ یہ ایک فہرست ہے، درجہ بندی نہیں۔ | Yeh dikhata hai ke kya bhara hai aur agla mufeed qadam kya hai. Yeh aik fehrist hai, darja bandi nahi. | |
| workerx.tour.steps.potential.title | Skills you may also have | ہنر جو شاید آپ کے پاس بھی ہیں | Hunar jo shayad aap ke paas bhi hain | |
| workerx.tour.steps.potential.text | One tap adds a skill from your trade. Add only what you really do. | ایک ٹیپ سے آپ کے پیشے کا ہنر شامل ہوتا ہے۔ صرف وہی شامل کریں جو آپ واقعی کرتے ہیں۔ | Aik tap se aap ke peshay ka hunar shamil hota hai. Sirf wohi shamil karein jo aap waqai karte hain. | |
| workerx.tour.steps.proof.title | Proof makes a skill trusted | ثبوت سے ہنر پر بھروسہ بڑھتا ہے | Saboot se hunar par bharosa barhta hai | |
| workerx.tour.steps.proof.text | Upload a photo of a certificate or finished work. An admin checks every photo. | سرٹیفکیٹ یا مکمل کام کی تصویر اپ لوڈ کریں۔ ایڈمن ہر تصویر چیک کرتا ہے۔ | Certificate ya mukammal kaam ki tasveer upload karein. Admin har tasveer check karta hai. | |
| workerx.tour.steps.header.title | Always within reach | ہمیشہ آپ کی پہنچ میں | Hamesha aap ki pohanch mein | |
| workerx.tour.steps.header.text | Your availability, notifications, dark mode and language are at the top of every page. | آپ کی دستیابی، اطلاعات، ڈارک موڈ اور زبان ہر صفحے کے اوپر ہیں۔ | Aap ki dastiyabi, ittelaat, dark mode aur zabaan har safhe ke oopar hain. | |

## Website texts: `appx`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| appx.offline.banner | You are offline. Your work stays on the screen; we will try again when the connection is back. | آپ آف لائن ہیں۔ آپ کا کام اسکرین پر موجود ہے؛ رابطہ واپس آنے پر ہم دوبارہ کوشش کریں گے۔ | Aap offline hain. Aap ka kaam screen par mojood hai; rabta wapas aane par hum dobara koshish karenge. | |
| appx.offline.back | You are back online. | آپ دوبارہ آن لائن ہیں۔ | Aap dobara online hain. | |
| appx.offline.retry | Try now | ابھی کوشش کریں | Abhi koshish karein | |
| appx.offline.failedRequest | The server could not be reached. Trying again… | سرور تک رسائی نہیں ہو سکی۔ دوبارہ کوشش ہو رہی ہے… | Server tak rasai nahi ho saki. Dobara koshish ho rahi hai… | |
| appx.pageLoad.title | This page could not be loaded | یہ صفحہ کھل نہیں سکا | Yeh safha khul nahi saka | |
| appx.pageLoad.text | Check your internet connection. The page loads by itself when the connection is back. | اپنا انٹرنیٹ کنکشن چیک کریں۔ کنکشن واپس آنے پر صفحہ خود کھل جائے گا۔ | Apna internet connection check karein. Connection wapas aane par safha khud khul jayega. | |
| appx.pageLoad.retry | Try again | دوبارہ کوشش کریں | Dobara koshish karein | |
| appx.install.title | Install the app | ایپ انسٹال کریں | App install karein | |
| appx.install.text | Add Digital Labour Marketplace to your home screen. It opens faster and works like an app. | ڈیجیٹل لیبر مارکیٹ پلیس کو اپنی ہوم اسکرین پر شامل کریں۔ یہ جلدی کھلتی ہے اور ایپ کی طرح چلتی ہے۔ | Digital Labour Marketplace ko apni home screen par shamil karein. Yeh jaldi khulti hai aur app ki tarah chalti hai. | |
| appx.install.button | Install | انسٹال کریں | Install karein | |
| appx.install.later | Not now | ابھی نہیں | Abhi nahi | |
| appx.palette.open | Search pages and actions | صفحات اور کام تلاش کریں | Safhaat aur kaam talaash karein | |
| appx.palette.label | Command palette | کمانڈ پیلٹ | Command palette | |
| appx.palette.placeholder | Type a page or an action… | کسی صفحے یا کام کا نام لکھیں… | Kisi safhe ya kaam ka naam likhein… | |
| appx.palette.empty | Nothing found. Try another word. | کچھ نہیں ملا۔ کوئی اور لفظ آزمائیں۔ | Kuch nahi mila. Koi aur lafz azmayein. | |
| appx.palette.hint | Use the arrow keys, Enter to open, Esc to close | تیر کے بٹن استعمال کریں، کھولنے کے لیے Enter، بند کرنے کے لیے Esc | Teer ke button istemaal karein, kholne ke liye Enter, band karne ke liye Esc | |
| appx.palette.groups.pages | Pages | صفحات | Safhaat | |
| appx.palette.groups.actions | Actions | کام | Kaam | |
| appx.palette.actions.theme | Switch between light and dark | روشن اور ڈارک کے درمیان بدلیں | Light aur dark ke darmiyan badlein | |
| appx.palette.actions.shortcuts | Show keyboard shortcuts | کی بورڈ شارٹ کٹ دکھائیں | Keyboard shortcuts dikhayein | |
| appx.palette.actions.logout | Log out | لاگ آؤٹ | Logout | |
| appx.palette.actions.textLarger | Larger text | بڑی لکھائی | Bari likhai | |
| appx.palette.actions.textNormal | Normal text | عام لکھائی | Aam likhai | |
| appx.palette.actions.whatsNew | What's new | نیا کیا ہے | Naya kya hai | |
| appx.shortcuts.title | Keyboard shortcuts | کی بورڈ شارٹ کٹ | Keyboard shortcuts | |
| appx.shortcuts.note | Shortcuts do not work while you are typing in a box. | جب آپ کسی خانے میں لکھ رہے ہوں تو شارٹ کٹ کام نہیں کرتے۔ | Jab aap kisi khanay mein likh rahe hon to shortcuts kaam nahi karte. | |
| appx.shortcuts.palette | Open the command palette | کمانڈ پیلٹ کھولیں | Command palette kholein | |
| appx.shortcuts.help | Show this list | یہ فہرست دکھائیں | Yeh fehrist dikhayein | |
| appx.shortcuts.home | Go to my home page | میرے ہوم پیج پر جائیں | Mere home page par jayein | |
| appx.shortcuts.theme | Switch between light and dark | روشن اور ڈارک کے درمیان بدلیں | Light aur dark ke darmiyan badlein | |
| appx.shortcuts.search | Jump to the search box | تلاش کے خانے پر جائیں | Talaash ke khanay par jayein | |
| appx.shortcuts.top | Back to the top of the page | صفحے کے اوپر جائیں | Safhe ke oopar jayein | |
| appx.shortcuts.then | then | پھر | phir | |
| appx.session.title | Your session ends in 2 minutes | آپ کا سیشن 2 منٹ میں ختم ہو جائے گا | Aap ka session 2 minute mein khatam ho jayega | |
| appx.session.text | Save your work now. For your safety, a login lasts 8 hours; after that you log in again. | اپنا کام ابھی محفوظ کریں۔ آپ کی حفاظت کے لیے لاگ ان 8 گھنٹے رہتا ہے؛ اس کے بعد دوبارہ لاگ ان کرنا ہوتا ہے۔ | Apna kaam abhi mehfooz karein. Aap ki hifazat ke liye login 8 ghante rehta hai; is ke baad dobara login karna hota hai. | |
| appx.session.ok | OK, I will save | ٹھیک ہے، میں محفوظ کرتا ہوں | Theek hai, main mehfooz karta hoon | |
| appx.session.ended | Your session has ended. Please log in again. | آپ کا سیشن ختم ہو گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔ | Aap ka session khatam ho gaya hai. Barah-e-karam dobara login karein. | |
| appx.scrollTop | Back to top | اوپر جائیں | Oopar jayein | |
| appx.whatsNew.title | What's new | نیا کیا ہے | Naya kya hai | |
| appx.whatsNew.lead | The latest changes to the website. | ویب سائٹ کی تازہ تبدیلیاں۔ | Website ki taza tabdeeliyan. | |
| appx.whatsNew.empty | Nothing new to show. | دکھانے کو کچھ نیا نہیں۔ | Dikhane ko kuch naya nahi. | |
| appx.whatsNew.source | Taken from the project change log. | منصوبے کے تبدیلیوں کے ریکارڈ سے لیا گیا۔ | Mansoobay ke tabdeeliyon ke record se liya gaya. | |
| appx.help.title | Help centre | مدد | Madad | |
| appx.help.lead | Short guides for the most common tasks. | عام کاموں کے لیے مختصر رہنمائی۔ | Aam kaamon ke liye mukhtasar rehnumai. | |
| appx.help.search | Search the guides | رہنمائی تلاش کریں | Rehnumai talaash karein | |
| appx.help.none | No guide matches. Try another word. | کوئی رہنمائی نہیں ملی۔ کوئی اور لفظ آزمائیں۔ | Koi rehnumai nahi mili. Koi aur lafz azmayein. | |
| appx.help.forRole.worker | For workers | کاریگروں کے لیے | Karigaron ke liye | |
| appx.help.forRole.customer | For customers | گاہکوں کے لیے | Gahakon ke liye | |
| appx.help.forRole.everyone | For everyone | سب کے لیے | Sab ke liye | |
| appx.help.guides.profile.title | Make a strong profile | مضبوط پروفائل بنائیں | Mazboot profile banayein | |
| appx.help.guides.profile.steps | Open "Edit profile".\|Fill in your trade, experience and a rate.\|Add your skills: write what you do and choose from the suggestions.\|Add a photo of a certificate or finished work for each skill. | "پروفائل میں ترمیم" کھولیں۔\|اپنا پیشہ، تجربہ اور ریٹ بھریں۔\|اپنے ہنر شامل کریں: لکھیں کہ آپ کیا کرتے ہیں اور تجاویز میں سے چنیں۔\|ہر ہنر کے لیے سرٹیفکیٹ یا مکمل کام کی تصویر شامل کریں۔ | "Profile mein tarmeem" kholein.\|Apna pesha, tajurba aur rate bharein.\|Apne hunar shamil karein: likhein ke aap kya karte hain aur tajaweez mein se chunein.\|Har hunar ke liye certificate ya mukammal kaam ki tasveer shamil karein. | |
| appx.help.guides.proof.title | Add proof for a skill | ہنر کا ثبوت شامل کریں | Hunar ka saboot shamil karein | |
| appx.help.guides.proof.steps | Open "Edit profile" and choose "Proof of skills".\|Choose the skill and the kind of proof.\|Take a clear photo: flat, good light, all four corners.\|Crop or rotate if needed, tick the consent box and upload.\|An admin checks it. You get a notification with the result. | "پروفائل میں ترمیم" کھولیں اور "ہنر کا ثبوت" چنیں۔\|ہنر اور ثبوت کی قسم چنیں۔\|صاف تصویر لیں: سیدھی، اچھی روشنی، چاروں کونے۔\|ضرورت ہو تو کاٹیں یا گھمائیں، رضامندی کا خانہ نشان زد کریں اور اپ لوڈ کریں۔\|ایڈمن اسے چیک کرتا ہے۔ نتیجے کی اطلاع آپ کو ملتی ہے۔ | "Profile mein tarmeem" kholein aur "Hunar ka saboot" chunein.\|Hunar aur saboot ki qisam chunein.\|Saaf tasveer lein: seedhi, achi roshni, charon konay.\|Zaroorat ho to kaatein ya ghumayein, razamandi ka khana nishan zad karein aur upload karein.\|Admin isay check karta hai. Nateeje ki ittela aap ko milti hai. | |
| appx.help.guides.identity.title | Get your identity verified | اپنی شناخت کی تصدیق کروائیں | Apni shanakht ki tasdeeq karwayein | |
| appx.help.guides.identity.steps | Add your CNIC number in "About you". It is stored encrypted and never shown to customers.\|An admin checks your original card in person or on a video call.\|When it is accepted, customers see "Identity verified". | "آپ کے بارے میں" میں شناختی کارڈ نمبر شامل کریں۔ یہ خفیہ شکل میں محفوظ ہوتا ہے اور گاہکوں کو کبھی نہیں دکھایا جاتا۔\|ایڈمن آپ کا اصل کارڈ سامنے یا ویڈیو کال پر دیکھتا ہے۔\|قبول ہونے پر گاہکوں کو "شناخت تصدیق شدہ" نظر آتا ہے۔ | "Aap ke baare mein" mein CNIC number shamil karein. Yeh khufia shakal mein mehfooz hota hai aur gahakon ko kabhi nahi dikhaya jata.\|Admin aap ka asal card samne ya video call par dekhta hai.\|Qabool hone par gahakon ko "Shanakht tasdeeq shuda" nazar aata hai. | |
| appx.help.guides.find.title | Find and compare workers | کاریگر تلاش کریں اور موازنہ کریں | Karigar talaash karein aur muwazna karein | |
| appx.help.guides.find.steps | Type a trade or skill in the search box.\|Use the filters for city, availability and verified workers.\|Tap the heart to save a worker.\|Tick "Compare" on two or three workers and open the comparison. | تلاش کے خانے میں پیشہ یا ہنر لکھیں۔\|شہر، دستیابی اور تصدیق شدہ کاریگروں کے فلٹر استعمال کریں۔\|کاریگر کو محفوظ کرنے کے لیے دل پر ٹیپ کریں۔\|دو یا تین کاریگروں پر "موازنہ" کا نشان لگائیں اور موازنہ کھولیں۔ | Talaash ke khanay mein pesha ya hunar likhein.\|Shehar, dastiyabi aur tasdeeq shuda karigaron ke filter istemaal karein.\|Karigar ko mehfooz karne ke liye dil par tap karein.\|Do ya teen karigaron par "Muwazna" ka nishan lagayein aur muwazna kholein. | |
| appx.help.guides.badges.title | What the badges mean | نشانات کا مطلب | Nishanaat ka matlab | |
| appx.help.guides.badges.steps | "Identity verified": an admin checked the worker's CNIC card.\|"Verified by evidence": an admin approved a photo as proof of that skill.\|"Self-declared": the worker says so; no proof has been checked yet. | "شناخت تصدیق شدہ": ایڈمن نے کاریگر کا شناختی کارڈ دیکھا۔\|"ثبوت سے تصدیق شدہ": ایڈمن نے اس ہنر کے ثبوت کی تصویر منظور کی۔\|"خود بتایا گیا": کاریگر نے خود کہا ہے؛ ابھی کوئی ثبوت چیک نہیں ہوا۔ | "Shanakht tasdeeq shuda": admin ne karigar ka CNIC card dekha.\|"Saboot se tasdeeq shuda": admin ne is hunar ke saboot ki tasveer manzoor ki.\|"Khud bataya gaya": karigar ne khud kaha hai; abhi koi saboot check nahi hua. | |
| appx.help.guides.display.title | Dark mode, text size and language | ڈارک موڈ، لکھائی کا سائز اور زبان | Dark mode, likhai ka size aur zabaan | |
| appx.help.guides.display.steps | The moon or sun button at the top switches dark and light. Hold it for "System".\|Text size (A−, A, A+) is in your account menu and at the bottom of every page.\|The globe button changes the language: English, Urdu or Roman Urdu. | اوپر چاند یا سورج کا بٹن ڈارک اور روشن بدلتا ہے۔ "سسٹم" کے لیے اسے دبا کر رکھیں۔\|لکھائی کا سائز (A−، A، A+) آپ کے اکاؤنٹ مینو میں اور ہر صفحے کے نیچے ہے۔\|گلوب کا بٹن زبان بدلتا ہے: انگریزی، اردو یا رومن اردو۔ | Oopar chaand ya sooraj ka button dark aur light badalta hai. "System" ke liye isay daba kar rakhein.\|Likhai ka size (A−, A, A+) aap ke account menu mein aur har safhe ke neeche hai.\|Globe ka button zabaan badalta hai: English, Urdu ya Roman Urdu. | |
| appx.help.guides.install.title | Install the website like an app | ویب سائٹ کو ایپ کی طرح انسٹال کریں | Website ko app ki tarah install karein | |
| appx.help.guides.install.steps | On Android in Chrome, open the menu and choose "Install app" or "Add to Home screen".\|The app opens without the browser bar. You still need the internet to see and save data. | اینڈرائیڈ پر کروم میں مینو کھولیں اور "ایپ انسٹال کریں" یا "ہوم اسکرین میں شامل کریں" چنیں۔\|ایپ براؤزر بار کے بغیر کھلتی ہے۔ ڈیٹا دیکھنے اور محفوظ کرنے کے لیے انٹرنیٹ پھر بھی ضروری ہے۔ | Android par Chrome mein menu kholein aur "Install app" ya "Add to Home screen" chunein.\|App browser bar ke baghair khulti hai. Data dekhne aur mehfooz karne ke liye internet phir bhi zaroori hai. | |

## Website texts: `assist`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| assist.listen | Listen | سنیں | Sunein | |
| assist.speak | Speak | بولیں | Bolein | |
| assist.undo | Undo | واپس کریں | Wapas karein | |
| assist.again | Play again | دوبارہ سنیں | Dobara sunein | |
| assist.hearAnswer | Hear my answer | میرا جواب سنیں | Mera jawab sunein | |
| assist.closeHelp | Close the help | مدد بند کریں | Madad band karein | |
| assist.bubbleLabel | Help: {field} | مدد: {field} | Madad: {field} | |
| assist.thisField | this box | یہ خانہ | yeh khana | |
| assist.stopSound | Stop the sound | آواز بند کریں | Awaaz band karein | |
| assist.playing | Playing the help | مدد سنائی جا رہی ہے | Madad sunai ja rahi hai | |
| assist.listening | Listening… speak now | سن رہے ہیں… اب بولیں | Sun rahe hain… ab bolein | |
| assist.stopped | Stopped | بند کر دیا گیا | Band kar diya gaya | |
| assist.written | Written in the box | خانے میں لکھ دیا گیا | Khane mein likh diya gaya | |
| assist.undone | The old answer is back | پرانا جواب واپس آ گیا | Purana jawab wapas aa gaya | |
| assist.wrote | Written: {value} | لکھا گیا: {value} | Likha gaya: {value} | |
| assist.noVoice | This phone or computer has no voice for this language. The help is written above. | اس فون یا کمپیوٹر میں اس زبان کی آواز نہیں ہے۔ مدد اوپر لکھی ہے۔ | Is phone ya computer mein is zabaan ki awaaz nahi hai. Madad oopar likhi hai. | |
| assist.noVoiceAnswer | This phone or computer cannot read your answer aloud. Your answer is written in the box. | یہ فون یا کمپیوٹر آپ کا جواب پڑھ کر نہیں سنا سکتا۔ آپ کا جواب خانے میں لکھا ہے۔ | Yeh phone ya computer aap ka jawab parh kar nahi suna sakta. Aap ka jawab khane mein likha hai. | |
| assist.noMic | This browser cannot do voice typing. Please type, or use your keyboard's microphone. | اس براؤزر میں بول کر لکھنا نہیں چلتا۔ ٹائپ کریں، یا کی بورڈ کا مائیک استعمال کریں۔ | Is browser mein bol kar likhna nahi chalta. Type karein, ya keyboard ka mic istemal karein. | |
| assist.offlineMic | Voice typing needs the internet. There is no internet now, so please type. | بول کر لکھنے کے لیے انٹرنیٹ چاہیے۔ ابھی انٹرنیٹ نہیں ہے، اس لیے ٹائپ کریں۔ | Bol kar likhne ke liye internet chahiye. Abhi internet nahi hai, is liye type karein. | |
| assist.notUnderstood | I did not understand. Please say it again, or type it. | سمجھ نہیں آیا۔ دوبارہ بولیں یا ٹائپ کریں۔ | Samajh nahi aaya. Dobara bolein ya type karein. | |
| assist.noticeTitle | Before you use voice typing | بول کر لکھنے سے پہلے | Bol kar likhne se pehle | |
| assist.noticeAccept | OK, use voice typing | ٹھیک ہے، بول کر لکھیں | Theek hai, bol kar likhein | |
| assist.noticeMore | This is your browser's own feature. Never speak a password or a CNIC number. | یہ آپ کے براؤزر کی اپنی سہولت ہے۔ پاس ورڈ یا شناختی کارڈ نمبر کبھی بول کر نہ لکھیں۔ | Yeh aap ke browser ki apni sahulat hai. Password ya shanakhti card number kabhi bol kar na likhein. | |
| assist.listenTo | Listen: {name} | سنیں: {name} | Sunein: {name} | |
| assist.noVoiceOption | This phone or computer has no voice for this language. The names are written on the pictures. | اس فون یا کمپیوٹر میں اس زبان کی آواز نہیں ہے۔ نام تصویروں پر لکھے ہیں۔ | Is phone ya computer mein is zabaan ki awaaz nahi hai. Naam tasveeron par likhe hain. | |
| assist.consentShort | Permission to share this photo | اس تصویر کو دکھانے کی اجازت | Is tasveer ko dikhane ki ijazat | |
| assist.sound | Sound | آواز | Awaaz | |
| assist.soundMenu | Sound settings | آواز کی ترتیبات | Awaaz ki tarteebat | |
| assist.soundTitle | Sound and help | آواز اور مدد | Awaaz aur madad | |
| assist.showButtons | Show the Listen and Speak buttons | سنیں اور بولیں کے بٹن دکھائیں | Sunein aur Bolein ke button dikhayein | |
| assist.showButtonsHint | Under every box, to hear help or to speak instead of typing. | ہر خانے کے نیچے، مدد سننے یا لکھنے کی بجائے بولنے کے لیے۔ | Har khane ke neeche, madad sunne ya likhne ki bajaye bolne ke liye. | |
| assist.autoRead | Read aloud by itself | خود بخود پڑھ کر سنائیں | Khud ba khud parh kar sunayein | |
| assist.autoReadHint | Says what each page is for, and the help of a box when you tap it. | ہر صفحے کا مقصد، اور خانہ دبانے پر اس کی مدد سناتا ہے۔ | Har safhay ka maqsad, aur khana dabane par us ki madad sunata hai. | |
| assist.deviceOnly | Saved on this phone or computer only. | یہ صرف اسی فون یا کمپیوٹر پر محفوظ ہوتا ہے۔ | Yeh sirf isi phone ya computer par mehfooz hota hai. | |
| assist.voiceCheckLink | Check sound and voice on this device | اس آلے پر آواز اور مائیک چیک کریں | Is device par awaaz aur mic check karein | |
| assist.pageHelp | Help for this page | اس صفحے کی مدد | Is safhay ki madad | |
| assist.offerTitle | Should the website read aloud? | کیا ویب سائٹ پڑھ کر سنائے؟ | Kya website parh kar sunaye? | |
| assist.offerText | It can say what each page is for, and explain each box when you tap it. You can change this later in the Sound menu. | یہ ہر صفحے کا مقصد بتا سکتی ہے، اور خانہ دبانے پر اس کی مدد سنا سکتی ہے۔ بعد میں آواز والے مینو سے بدل سکتے ہیں۔ | Yeh har safhay ka maqsad bata sakti hai, aur khana dabane par us ki madad suna sakti hai. Baad mein awaaz wale menu se badal sakte hain. | |
| assist.offerYes | Yes, read aloud | ہاں، پڑھ کر سنائیں | Haan, parh kar sunayein | |
| assist.offerNo | No, thank you | نہیں، شکریہ | Nahi, shukriya | |

## Website texts: `help`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| help.field.register.role | Tell us who you are. Want work? Press the worker picture. Want to hire someone? Press the customer picture. | بتائیں آپ کون ہیں۔ کام چاہیے تو کاریگر کی تصویر دبائیں۔ کاریگر چاہیے تو گاہک کی تصویر دبائیں۔ | Batayein aap kaun hain. Kaam chahiye to karigar ki tasveer dabayein. Karigar chahiye to gahak ki tasveer dabayein. | |
| help.field.register.name | Say or type your full name here, for example Bilal Ahmed. | یہاں اپنا پورا نام بتائیں، جیسے بلال احمد۔ | Yahan apna poora naam batayein, jaise Bilal Ahmed. | |
| help.field.register.email | Type your email address here. It cannot be spoken. A person you trust can help you. | یہاں اپنا ای میل ایڈریس ٹائپ کریں۔ یہ بول کر نہیں لکھا جاتا، کسی بھروسے والے شخص سے مدد لے لیں۔ | Yahan apna email address type karein. Yeh bol kar nahi likha jata, kisi bharosay wale shakhs se madad le lein. | |
| help.field.register.phone | Say or type your mobile number, for example zero three zero zero, one two three four five six seven. | یہاں اپنا موبائل نمبر بتائیں، جیسے صفر تین صفر صفر، ایک دو تین چار پانچ چھ سات۔ | Yahan apna mobile number batayein, jaise sifar teen sifar sifar, ek do teen char paanch chhay saat. | |
| help.field.register.password | Make a secret password of at least 15 letters. Join four everyday words you will remember. Never say it aloud. | کم از کم پندرہ حروف کا خفیہ پاس ورڈ بنائیں۔ چار عام لفظ جوڑ لیں جو آپ کو یاد رہیں۔ اسے کبھی بول کر نہ بتائیں۔ | Kam az kam pandrah huroof ka khufia password banayein. Chaar aam lafz jor lein jo aap ko yaad rahein. Ise kabhi bol kar na batayein. | |
| help.field.login.email | Type the email address you used when you made your account. | وہ ای میل ٹائپ کریں جس سے آپ نے اکاؤنٹ بنایا تھا۔ | Woh email type karein jis se aap ne account banaya tha. | |
| help.field.login.password | Type your secret password here. Do not show it to anyone. | یہاں اپنا خفیہ پاس ورڈ ٹائپ کریں۔ یہ کسی کو نہ دکھائیں۔ | Yahan apna khufia password type karein. Yeh kisi ko na dikhayein. | |
| help.field.about.name | Say or type your full name, for example Bilal Ahmed. | یہاں اپنا پورا نام بتائیں، جیسے بلال احمد۔ | Yahan apna poora naam batayein, jaise Bilal Ahmed. | |
| help.field.about.phone | Say or type your mobile number, digit by digit. Customers do not see it. | اپنا موبائل نمبر ایک ایک ہندسہ کر کے بتائیں۔ گاہک یہ نمبر نہیں دیکھتے۔ | Apna mobile number ek ek hindsa kar ke batayein. Gahak yeh number nahi dekhte. | |
| help.field.about.whatsapp | If you use WhatsApp, say its number digit by digit. You can also leave it empty. | اگر واٹس ایپ چلاتے ہیں تو اس کا نمبر ایک ایک ہندسہ کر کے بتائیں۔ خالی بھی چھوڑ سکتے ہیں۔ | Agar WhatsApp chalate hain to us ka number ek ek hindsa kar ke batayein. Khali bhi chhor sakte hain. | |
| help.field.about.cnic | Type the 13 numbers of your ID card. An admin uses it to check who you are. Customers never see it. | اپنے شناختی کارڈ کے تیرہ ہندسے ٹائپ کریں۔ اس سے ایڈمن آپ کی پہچان چیک کرتا ہے۔ گاہک اسے کبھی نہیں دیکھتے۔ | Apne shanakhti card ke terah hindsay type karein. Is se admin aap ki pehchan check karta hai. Gahak ise kabhi nahi dekhte. | |
| help.field.about.city | Say or type the city where you work, for example Rawalpindi. | وہ شہر بتائیں جہاں آپ کام کرتے ہیں، جیسے راولپنڈی۔ | Woh shehar batayein jahan aap kaam karte hain, jaise Rawalpindi. | |
| help.field.about.area | Say your area, for example Satellite Town. Only you and the admins see it. | اپنا علاقہ بتائیں، جیسے سیٹلائٹ ٹاؤن۔ یہ صرف آپ اور ایڈمن دیکھتے ہیں۔ | Apna ilaqa batayein, jaise Satellite Town. Yeh sirf aap aur admin dekhte hain. | |
| help.field.about.emergency | Say the mobile number of a family member to call in an emergency, digit by digit. | کسی گھر والے کا موبائل نمبر بتائیں جسے مشکل میں فون کیا جا سکے، ایک ایک ہندسہ کر کے۔ | Kisi ghar walay ka mobile number batayein jise mushkil mein phone kiya ja sakay, ek ek hindsa kar ke. | |
| help.field.about.languages | Say the languages you speak, for example Urdu and Punjabi. | وہ زبانیں بتائیں جو آپ بولتے ہیں، جیسے اردو اور پنجابی۔ | Woh zabanein batayein jo aap bolte hain, jaise Urdu aur Punjabi. | |
| help.field.work.trade | Press the picture of your main work. The small speaker on a picture says its name. | اپنے اصل کام کی تصویر دبائیں۔ تصویر پر چھوٹا اسپیکر دبائیں تو اس کا نام سنائی دے گا۔ | Apne asal kaam ki tasveer dabayein. Tasveer par chhota speaker dabayein to us ka naam sunai dega. | |
| help.field.work.occupation | Say or type what you are called at work, for example electrician or plumber. | بتائیں آپ کا پیشہ کیا ہے، جیسے الیکٹریشن یا پلمبر۔ | Batayein aap ka pesha kya hai, jaise electrician ya plumber. | |
| help.field.work.experience | Say how many years you have done this work, for example five. | بتائیں آپ کتنے سال سے یہ کام کر رہے ہیں، جیسے پانچ۔ | Batayein aap kitne saal se yeh kaam kar rahe hain, jaise paanch. | |
| help.field.work.availability | Can you take work now? Press a picture: available, busy or offline. | کیا آپ ابھی کام لے سکتے ہیں؟ ایک تصویر دبائیں: دستیاب، مصروف یا آف لائن۔ | Kya aap abhi kaam le sakte hain? Ek tasveer dabayein: dastiyab, masroof ya offline. | |
| help.field.work.hourly | Say your charge for one hour in rupees, for example eight hundred. You can leave it empty. | ایک گھنٹے کی مزدوری روپوں میں بتائیں، جیسے آٹھ سو۔ خالی بھی چھوڑ سکتے ہیں۔ | Ek ghantay ki mazdoori rupon mein batayein, jaise aath sau. Khali bhi chhor sakte hain. | |
| help.field.work.daily | Say your charge for one full day in rupees, for example four thousand. | ایک پورے دن کی مزدوری روپوں میں بتائیں، جیسے چار ہزار۔ | Ek poore din ki mazdoori rupon mein batayein, jaise chaar hazaar. | |
| help.field.work.bio | Say a few words about your work, for example: I do neat wiring and solar fitting. | اپنے کام کے بارے میں چند باتیں بتائیں، جیسے: میں صاف ستھری وائرنگ اور سولر کا کام کرتا ہوں۔ | Apne kaam ke baare mein chand baatein batayein, jaise: main saaf suthri wiring aur solar ka kaam karta hoon. | |
| help.field.work.jobTitle | Say the name of a job you did before, for example house wiring. | پہلے کیے ہوئے کسی کام کا نام بتائیں، جیسے گھر کی وائرنگ۔ | Pehle kiye huay kisi kaam ka naam batayein, jaise ghar ki wiring. | |
| help.field.work.client | Say who the job was for, for example a house owner. Customers do not see this name. | بتائیں یہ کام کس کے لیے کیا، جیسے مکان مالک۔ گاہک یہ نام نہیں دیکھتے۔ | Batayein yeh kaam kis ke liye kiya, jaise makaan malik. Gahak yeh naam nahi dekhte. | |
| help.field.work.duration | Say how long the job took, for example two weeks. | بتائیں کام کتنے دن چلا، جیسے دو ہفتے۔ | Batayein kaam kitne din chala, jaise do haftay. | |
| help.field.work.whatYouDid | Say in a few words what you did, for example full wiring of a new house. | چند لفظوں میں بتائیں آپ نے کیا کیا، جیسے نئے گھر کی پوری وائرنگ۔ | Chand lafzon mein batayein aap ne kya kiya, jaise naye ghar ki poori wiring. | |
| help.field.skills.describe | Say what work you do and for how long, for example: I have done house wiring for five years. | بتائیں آپ کیا کام کرتے ہیں اور کتنے سال سے، جیسے: میں پانچ سال سے گھروں کی وائرنگ کرتا ہوں۔ | Batayein aap kya kaam karte hain aur kitne saal se, jaise: main paanch saal se gharon ki wiring karta hoon. | |
| help.field.skills.search | Say or type the name of a skill, for example geyser, then choose it from the list. | کسی ہنر کا نام بتائیں، جیسے گیزر، پھر فہرست میں سے چن لیں۔ | Kisi hunar ka naam batayein, jaise geyser, phir fehrist mein se chun lein. | |
| help.field.evidence.skill | Press the picture of the skill that this photo proves. | اس ہنر کی تصویر دبائیں جس کا یہ ثبوت ہے۔ | Us hunar ki tasveer dabayein jis ka yeh saboot hai. | |
| help.field.evidence.kind | What is in your photo? A certificate, a finished job, or a letter. Press one. | آپ کی تصویر میں کیا ہے؟ سرٹیفکیٹ، مکمل کیا ہوا کام، یا خط۔ ایک دبائیں۔ | Aap ki tasveer mein kya hai? Certificate, mukammal kiya hua kaam, ya khat. Ek dabayein. | |
| help.field.evidence.photo | Take a photo or choose one. Hold the phone straight, in good light, with all four corners showing. | تصویر کھینچیں یا پہلے سے موجود تصویر چنیں۔ فون سیدھا رکھیں، روشنی اچھی ہو، چاروں کونے نظر آئیں۔ | Tasveer khenchein ya pehle se maujood tasveer chunein. Phone seedha rakhein, roshni achhi ho, charon konay nazar aayein. | |
| help.field.evidence.title | If you like, say a short name for the photo, for example wiring of a new house. | چاہیں تو تصویر کا چھوٹا سا نام بتائیں، جیسے نئے گھر کی وائرنگ۔ | Chahein to tasveer ka chhota sa naam batayein, jaise naye ghar ki wiring. | |
| help.field.evidence.consent | Tick this box if the photo is yours and shows no other person's private details. | اگر تصویر آپ کی ہے اور اس میں کسی اور کی ذاتی معلومات نہیں تو یہ خانہ ٹک کریں۔ | Agar tasveer aap ki hai aur is mein kisi aur ki zaati maloomat nahi to yeh khana tick karein. | |
| help.field.find.search | Say or type a trade or a skill, for example plumber or geyser. | کام یا ہنر کا نام بتائیں، جیسے پلمبر یا گیزر۔ | Kaam ya hunar ka naam batayein, jaise plumber ya geyser. | |
| help.field.find.trade | Press a picture to see only workers of that trade. | کسی تصویر کو دبائیں تو صرف اس کام کے کاریگر نظر آئیں گے۔ | Kisi tasveer ko dabayein to sirf us kaam ke karigar nazar aayenge. | |
| help.field.find.city | Say or type a city, for example Lahore. | شہر کا نام بتائیں، جیسے لاہور۔ | Shehar ka naam batayein, jaise Lahore. | |
| help.field.find.availability | Press a picture to see workers who are available, busy or offline. | تصویر دبائیں تاکہ دستیاب، مصروف یا آف لائن کاریگر نظر آئیں۔ | Tasveer dabayein taa ke dastiyab, masroof ya offline karigar nazar aayein. | |
| help.field.find.sort | Choose the order of the workers, for example the most checked proof first. | کاریگروں کی ترتیب چنیں، جیسے سب سے زیادہ چیک شدہ ثبوت والے پہلے۔ | Karigaron ki tarteeb chunein, jaise sab se zyada check shuda saboot walay pehle. | |
| help.field.profile.language | Choose the language of the website. Press the card of your language. | ویب سائٹ کی زبان چنیں۔ اپنی زبان والا کارڈ دبائیں۔ | Website ki zabaan chunein. Apni zabaan wala card dabayein. | |
| help.field.helpCentre.search | Say or type a word to find a guide, for example photo. | ہدایت ڈھونڈنے کے لیے کوئی لفظ بتائیں، جیسے تصویر۔ | Hidayat dhoondne ke liye koi lafz batayein, jaise tasveer. | |
| help.screen.register | Here you make a new account. First choose worker or customer, then fill in name, email, mobile and password. | یہاں نیا اکاؤنٹ بنتا ہے۔ پہلے کاریگر یا گاہک چنیں، پھر نام، ای میل، موبائل اور پاس ورڈ لکھیں۔ | Yahan naya account banta hai. Pehle karigar ya gahak chunein, phir naam, email, mobile aur password likhein. | |
| help.screen.login | Here you log in. Type your email and password, then press the green button below. | یہاں لاگ ان کریں۔ ای میل اور پاس ورڈ لکھیں، پھر نیچے سبز بٹن دبائیں۔ | Yahan log in karein. Email aur password likhein, phir neeche sabz button dabayein. | |
| help.screen.landing | This website connects skilled workers and customers. Use the buttons at the top to find a worker, or to join as a worker. | یہ ویب سائٹ ہنرمند کاریگروں اور گاہکوں کو ملاتی ہے۔ اوپر کے بٹن سے کاریگر ڈھونڈیں یا کاریگر کے طور پر شامل ہوں۔ | Yeh website hunarmand karigaron aur gahakon ko milati hai. Oopar ke button se karigar dhoondein ya karigar ke taur par shamil hon. | |
| help.screen.helpCentre | Here are short guides. Press the small speaker on a guide to hear it. | یہاں چھوٹی چھوٹی ہدایات ہیں۔ کسی ہدایت پر چھوٹا اسپیکر دبائیں تو وہ سنائی دے گی۔ | Yahan chhoti chhoti hidayaat hain. Kisi hidayat par chhota speaker dabayein to woh sunai degi. | |
| help.screen.voiceCheck | This page checks if this phone or computer can speak the help and listen to your voice. | یہ صفحہ چیک کرتا ہے کہ یہ فون یا کمپیوٹر مدد بول کر سنا سکتا ہے اور آپ کی آواز سن سکتا ہے یا نہیں۔ | Yeh safha check karta hai ke yeh phone ya computer madad bol kar suna sakta hai aur aap ki awaaz sun sakta hai ya nahi. | |
| help.screen.onboardingAbout | Step one of five. Fill in your name, mobile number and city. Then press the green button at the bottom. | پانچ میں سے پہلا قدم۔ اپنا نام، موبائل نمبر اور شہر لکھیں۔ پھر نیچے سبز بٹن دبائیں۔ | Paanch mein se pehla qadam. Apna naam, mobile number aur shehar likhein. Phir neeche sabz button dabayein. | |
| help.screen.onboardingWork | Step two. Choose the picture of your trade, then say your years of work and your daily charge. Then press the green button. | دوسرا قدم۔ اپنے کام کی تصویر چنیں، پھر کام کے سال اور ایک دن کی مزدوری بتائیں۔ پھر سبز بٹن دبائیں۔ | Doosra qadam. Apne kaam ki tasveer chunein, phir kaam ke saal aur ek din ki mazdoori batayein. Phir sabz button dabayein. | |
| help.screen.onboardingSkills | Step three. Say what work you do. The website suggests skills from a word list; tick the right ones and add them. | تیسرا قدم۔ بتائیں آپ کیا کام کرتے ہیں۔ ویب سائٹ لفظوں کی فہرست سے ہنر بتاتی ہے، صحیح والے چن کر شامل کریں۔ | Teesra qadam. Batayein aap kya kaam karte hain. Website lafzon ki fehrist se hunar batati hai, sahi walay chun kar shamil karein. | |
| help.screen.onboardingProof | Step four. Add a photo of a certificate or of finished work. An admin checks it. You can also skip this for now. | چوتھا قدم۔ سرٹیفکیٹ یا مکمل کام کی تصویر لگائیں۔ ایڈمن اسے چیک کرتا ہے۔ ابھی چھوڑ بھی سکتے ہیں۔ | Chautha qadam. Certificate ya mukammal kaam ki tasveer lagayein. Admin ise check karta hai. Abhi chhor bhi sakte hain. | |
| help.screen.onboardingDone | Well done, your profile is ready. You can now see your profile or add more proof. | شاباش، آپ کی پروفائل تیار ہے۔ اب اپنی پروفائل دیکھیں یا مزید ثبوت لگائیں۔ | Shabash, aap ki profile tayyar hai. Ab apni profile dekhein ya mazeed saboot lagayein. | |
| help.screen.dashboard | This is your home page. It shows how strong your profile is and what to do next. | یہ آپ کا گھر کا صفحہ ہے۔ یہ بتاتا ہے آپ کی پروفائل کتنی مضبوط ہے اور آگے کیا کرنا ہے۔ | Yeh aap ka ghar ka safha hai. Yeh batata hai aap ki profile kitni mazboot hai aur aage kya karna hai. | |
| help.screen.profile | This is your profile. The switch at the top shows what customers see. | یہ آپ کی پروفائل ہے۔ اوپر والا بٹن دکھاتا ہے کہ گاہک کیا دیکھتے ہیں۔ | Yeh aap ki profile hai. Oopar wala button dikhata hai ke gahak kya dekhte hain. | |
| help.screen.profileEdit | Here you change your profile. Choose a part, change it, and press the green save button. | یہاں آپ اپنی پروفائل بدلتے ہیں۔ ایک حصہ چنیں، اسے بدلیں، اور سبز محفوظ کرنے والا بٹن دبائیں۔ | Yahan aap apni profile badalte hain. Ek hissa chunein, use badlein, aur sabz mehfooz karne wala button dabayein. | |
| help.screen.notifications | Here are messages about your identity and your photos. Press the small speaker to hear a message. | یہاں آپ کی پہچان اور تصویروں کے بارے میں پیغام ہیں۔ پیغام سننے کے لیے چھوٹا اسپیکر دبائیں۔ | Yahan aap ki pehchan aur tasveeron ke baare mein paigham hain. Paigham sunne ke liye chhota speaker dabayein. | |
| help.screen.find | Here you find workers. Say or type a trade, choose a picture to filter, then open a worker. | یہاں آپ کاریگر ڈھونڈتے ہیں۔ کام کا نام بتائیں یا لکھیں، تصویر سے چھانٹیں، پھر کسی کاریگر کو کھولیں۔ | Yahan aap karigar dhoondte hain. Kaam ka naam batayein ya likhein, tasveer se chhantein, phir kisi karigar ko kholein. | |
| help.screen.workerProfile | This is a worker's profile. It shows their work, their rates and what an admin has checked. | یہ ایک کاریگر کی پروفائل ہے۔ اس میں ان کا کام، مزدوری اور ایڈمن کی چیک کی ہوئی باتیں ہیں۔ | Yeh ek karigar ki profile hai. Is mein un ka kaam, mazdoori aur admin ki check ki hui baatein hain. | |
| help.screen.saved | These are the workers you saved. Press the heart to remove one. | یہ وہ کاریگر ہیں جو آپ نے محفوظ کیے۔ ہٹانے کے لیے دل والا نشان دبائیں۔ | Yeh woh karigar hain jo aap ne mehfooz kiye. Hatane ke liye dil wala nishan dabayein. | |
| help.screen.compare | Here you see two or three workers side by side, so you can choose. | یہاں دو یا تین کاریگر ساتھ ساتھ نظر آتے ہیں، تاکہ آپ چن سکیں۔ | Yahan do ya teen karigar saath saath nazar aate hain, taa ke aap chun sakein. | |
| help.option.trade.electrical_solar | Electrical and solar: house wiring, switches and solar panels. | بجلی اور سولر: گھر کی وائرنگ، سوئچ اور سولر پینل۔ | Bijli aur solar: ghar ki wiring, switch aur solar panel. | |
| help.option.trade.plumbing_sanitary | Plumbing and sanitary: pipes, taps, tanks and bathrooms. | پلمبنگ اور سینیٹری: پائپ، نل، ٹینکی اور باتھ روم۔ | Plumbing aur sanitary: pipe, nal, tanki aur bathroom. | |
| help.option.trade.construction_masonry | Construction and masonry: bricks, plaster, floors and walls. | تعمیر اور مستری کا کام: اینٹ، پلستر، فرش اور دیواریں۔ | Tameer aur mistri ka kaam: eent, plaster, farsh aur deewarein. | |
| help.option.trade.carpentry_woodwork | Carpentry and woodwork: doors, furniture and cupboards. | بڑھئی کا کام: دروازے، فرنیچر اور الماریاں۔ | Barhai ka kaam: darwazay, furniture aur almariyan. | |
| help.option.trade.painting_renovation | Painting and renovation: paint, polish and repair of walls. | رنگ و روغن اور مرمت: پینٹ، پالش اور دیواروں کی مرمت۔ | Rang o roghan aur marammat: paint, polish aur deewaron ki marammat. | |
| help.option.trade.ac_appliance_repair | AC and appliance repair: air conditioners, fridges and washing machines. | اے سی اور گھریلو مشینوں کی مرمت: اے سی، فریج اور واشنگ مشین۔ | AC aur gharelu machinon ki marammat: AC, fridge aur washing machine. | |
| help.option.trade.home_maintenance | Home maintenance: small repairs and fittings around the house. | گھر کی دیکھ بھال: گھر کے چھوٹے موٹے مرمت کے کام۔ | Ghar ki dekh bhaal: ghar ke chhotay motay marammat ke kaam. | |
| help.option.trade.domestic_work | Domestic work: cleaning, cooking and help in the home. | گھریلو کام: صفائی، کھانا پکانا اور گھر میں مدد۔ | Gharelu kaam: safai, khana pakana aur ghar mein madad. | |
| help.option.trade.moving_loading | Moving and loading: shifting a house and lifting goods. | شفٹنگ اور لوڈنگ: گھر کا سامان منتقل کرنا اور سامان اٹھانا۔ | Shifting aur loading: ghar ka saman muntaqil karna aur saman uthana. | |
| help.option.trade.All | All trades: show workers of every trade. | تمام کام: ہر کام کے کاریگر دکھائیں۔ | Tamam kaam: har kaam ke karigar dikhayein. | |
| help.option.availability.Available | Available: you can take new work now. | دستیاب: آپ ابھی نیا کام لے سکتے ہیں۔ | Dastiyab: aap abhi naya kaam le sakte hain. | |
| help.option.availability.Busy | Busy: you have work now and can take more later. | مصروف: ابھی کام ہے، بعد میں اور لے سکتے ہیں۔ | Masroof: abhi kaam hai, baad mein aur le sakte hain. | |
| help.option.availability.Offline | Offline: you are not taking work for now. | آف لائن: آپ فی الحال کام نہیں لے رہے۔ | Offline: aap filhaal kaam nahi le rahe. | |
| help.option.availability.All | Any: show workers whether available, busy or offline. | کوئی بھی: دستیاب، مصروف یا آف لائن، سب کاریگر دکھائیں۔ | Koi bhi: dastiyab, masroof ya offline, sab karigar dikhayein. | |
| help.option.proofSkill | {name}. Press this picture to add proof for this skill. | {name}۔ اس ہنر کا ثبوت لگانے کے لیے یہ تصویر دبائیں۔ | {name}. Is hunar ka saboot lagane ke liye yeh tasveer dabayein. | |
| help.option.evidenceType.certificate | Certificate: a photo of a course or trade certificate. | سرٹیفکیٹ: کسی کورس یا ہنر کے سرٹیفکیٹ کی تصویر۔ | Certificate: kisi course ya hunar ke certificate ki tasveer. | |
| help.option.evidenceType.work_photo | Work photo: a job you finished. No faces and no house numbers. | کام کی تصویر: آپ کا مکمل کیا ہوا کام۔ اس میں چہرے اور مکان نمبر نہ ہوں۔ | Kaam ki tasveer: aap ka mukammal kiya hua kaam. Is mein chehray aur makaan number na hon. | |
| help.option.evidenceType.reference_letter | Letter: a photo of a letter from a client or employer. | خط: کسی گاہک یا مالک کے لکھے خط کی تصویر۔ | Khat: kisi gahak ya malik ke likhe khat ki tasveer. | |
| help.notification | {title}. {text} | {title}۔ {text} | {title}. {text} | |
| help.centre.read | {title}. {steps} | {title}۔ {steps} | {title}. {steps} | |
| help.centre.guides.sound.title | Listen to the help | مدد سنیں | Madad sunein | |
| help.centre.guides.sound.steps | Press Listen under a box to hear what to write there.\|The round speaker button in the corner tells you what the page is for.\|Press the small speaker on a picture to hear its name.\|In the Sound menu at the top you can hide the buttons, or let pages read aloud by themselves. | کسی خانے کے نیچے سنیں دبائیں، پتا چلے گا وہاں کیا لکھنا ہے۔\|کونے میں گول اسپیکر والا بٹن بتاتا ہے کہ یہ صفحہ کس لیے ہے۔\|کسی تصویر پر چھوٹا اسپیکر دبائیں تو اس کا نام سنائی دے گا۔\|اوپر آواز والے مینو میں بٹن چھپا سکتے ہیں، یا صفحے خود پڑھ کر سنانے کا کہہ سکتے ہیں۔ | Kisi khane ke neeche Sunein dabayein, pata chalega wahan kya likhna hai.\|Konay mein gol speaker wala button batata hai ke yeh safha kis liye hai.\|Kisi tasveer par chhota speaker dabayein to us ka naam sunai dega.\|Oopar awaaz wale menu mein button chhupa sakte hain, ya safhay khud parh kar sunane ka keh sakte hain. | |
| help.centre.guides.voiceTyping.title | Speak instead of typing | لکھنے کی بجائے بولیں | Likhne ki bajaye bolein | |
| help.centre.guides.voiceTyping.steps | Press Speak under a box and say your answer.\|The website writes it in the box and reads it back to you.\|If it is wrong, press Undo, or say it again.\|Say numbers one digit at a time, for example zero three zero zero.\|Never speak a password or a CNIC number: type those. | خانے کے نیچے بولیں دبائیں اور اپنا جواب بولیں۔\|ویب سائٹ اسے خانے میں لکھ کر آپ کو پڑھ کر سناتی ہے۔\|اگر غلط ہو تو واپس کریں دبائیں، یا دوبارہ بولیں۔\|نمبر ایک ایک ہندسہ کر کے بولیں، جیسے صفر تین صفر صفر۔\|پاس ورڈ اور شناختی کارڈ نمبر کبھی نہ بولیں، انہیں ٹائپ کریں۔ | Khane ke neeche Bolein dabayein aur apna jawab bolein.\|Website use khane mein likh kar aap ko parh kar sunati hai.\|Agar ghalat ho to Wapas karein dabayein, ya dobara bolein.\|Number ek ek hindsa kar ke bolein, jaise sifar teen sifar sifar.\|Password aur shanakhti card number kabhi na bolein, unhein type karein. | |
| help.voiceCheck.title | Check sound and voice | آواز اور مائیک چیک کریں | Awaaz aur mic check karein | |
| help.voiceCheck.lead | What works on this phone or computer: help that speaks, and typing with your voice. | اس فون یا کمپیوٹر پر کیا چلتا ہے: بول کر سنانے والی مدد، اور آواز سے لکھنا۔ | Is phone ya computer par kya chalta hai: bol kar sunane wali madad, aur awaaz se likhna. | |
| help.voiceCheck.summaryTitle | On this device | اس آلے پر | Is device par | |
| help.voiceCheck.loading | Checking… | چیک ہو رہا ہے… | Check ho raha hai… | |
| help.voiceCheck.urdu | Urdu | اردو | Urdu | |
| help.voiceCheck.english | English | انگریزی | English | |
| help.voiceCheck.audio.clips | Help in {language}: works, with the team's recorded voice. | {language} میں مدد: چلتی ہے، ٹیم کی ریکارڈ کی ہوئی آواز سے۔ | {language} mein madad: chalti hai, team ki record ki hui awaaz se. | |
| help.voiceCheck.audio.voice | Help in {language}: works, with this device's voice. | {language} میں مدد: چلتی ہے، اس آلے کی آواز سے۔ | {language} mein madad: chalti hai, is device ki awaaz se. | |
| help.voiceCheck.audio.text | Help in {language}: no voice yet, so the help is shown as text. | {language} میں مدد: ابھی آواز نہیں، اس لیے مدد لکھی ہوئی نظر آتی ہے۔ | {language} mein madad: abhi awaaz nahi, is liye madad likhi hui nazar aati hai. | |
| help.voiceCheck.mic.ok | Voice typing: available (it needs the internet). | آواز سے لکھنا: دستیاب ہے (انٹرنیٹ ضروری ہے)۔ | Awaaz se likhna: dastiyab hai (internet zaroori hai). | |
| help.voiceCheck.mic.offline | Voice typing: not now, because there is no internet. | آواز سے لکھنا: ابھی نہیں، کیونکہ انٹرنیٹ نہیں ہے۔ | Awaaz se likhna: abhi nahi, kyunke internet nahi hai. | |
| help.voiceCheck.mic.none | Voice typing: not available in this browser. Typing always works. | آواز سے لکھنا: اس براؤزر میں نہیں چلتا۔ ٹائپ کرنا ہمیشہ چلتا ہے۔ | Awaaz se likhna: is browser mein nahi chalta. Type karna hamesha chalta hai. | |
| help.voiceCheck.voicesTitle | Voices on this device | اس آلے کی آوازیں | Is device ki awaazein | |
| help.voiceCheck.noVoices | This device has no voices for speaking. | اس آلے میں بول کر سنانے والی کوئی آواز نہیں ہے۔ | Is device mein bol kar sunane wali koi awaaz nahi hai. | |
| help.voiceCheck.clips | Recorded help from the team: {ur} in Urdu, {en} in English. | ٹیم کی ریکارڈ کی ہوئی مدد: اردو میں {ur}، انگریزی میں {en}۔ | Team ki record ki hui madad: Urdu mein {ur}, English mein {en}. | |
| help.voiceCheck.test.en | Play an English test | انگریزی آواز آزمائیں | English awaaz aazmayein | |
| help.voiceCheck.test.ur | Play an Urdu test | اردو آواز آزمائیں | Urdu awaaz aazmayein | |
| help.voiceCheck.testFailed | This device could not speak {language}. | یہ آلہ {language} میں نہیں بول سکا۔ | Yeh device {language} mein nahi bol saka. | |
| help.voiceCheck.micTitle | Voice typing | آواز سے لکھنا | Awaaz se likhna | |
| help.voiceCheck.micButton | Test the microphone | مائیک آزمائیں | Mic aazmayein | |
| help.voiceCheck.heard | You said: | آپ نے کہا: | Aap ne kaha: | |
| help.voiceCheck.addTitle | Add an Urdu voice to an Android phone | اینڈرائیڈ فون میں اردو آواز شامل کریں | Android phone mein Urdu awaaz shamil karein | |
| help.voiceCheck.addSteps | Open Settings and search for “Text-to-speech”.\|Choose the Google speech engine and open its settings.\|Choose “Install voice data” and add Urdu (Pakistan).\|Come back to this page and press “Play an Urdu test”. | سیٹنگز کھولیں اور “Text-to-speech” تلاش کریں۔\|گوگل کا اسپیچ انجن چنیں اور اس کی سیٹنگز کھولیں۔\|“Install voice data” چنیں اور Urdu (Pakistan) شامل کریں۔\|اس صفحے پر واپس آئیں اور “اردو آواز آزمائیں” دبائیں۔ | Settings kholein aur “Text-to-speech” talaash karein.\|Google ka speech engine chunein aur us ki settings kholein.\|“Install voice data” chunein aur Urdu (Pakistan) shamil karein.\|Is safhay par wapas aayein aur “Urdu awaaz aazmayein” dabayein. | |
| help.voiceCheck.addNote | The menu names differ a little between phones. Without an Urdu voice, the website plays the team's recordings or shows the help as text. | مینو کے نام ہر فون میں تھوڑے مختلف ہوتے ہیں۔ اردو آواز نہ ہو تو ویب سائٹ ٹیم کی ریکارڈنگ چلاتی ہے یا مدد لکھی ہوئی دکھاتی ہے۔ | Menu ke naam har phone mein thoray mukhtalif hote hain. Urdu awaaz na ho to website team ki recording chalati hai ya madad likhi hui dikhati hai. | |

## Language chooser (shown in all three languages at once)

| Text | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| preview | Find skilled workers you can trust. | بھروسے کے قابل ہنر مند کاریگر تلاش کریں۔ | Bharosay ke qabil hunarmand karigar talaash karein. | |
| chooserTitle | Choose your language | اپنی زبان چنیں | Apni zabaan chunein | |
| chooserHint | You can change it at any time from the top of the page. | آپ اسے کسی بھی وقت صفحے کے اوپر سے بدل سکتے ہیں۔ | Aap ise kisi bhi waqt safhay ke oopar se badal sakte hain. | |
| chooserContinue | Continue in English | اردو میں جاری رکھیں | Roman Urdu mein jaari rakhein | |

## Hero headline (typewriter, Batch 3 Part 4.5: suggested lines)

| Text | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| headline | Skilled work, verified. | ہنر مند کام، تصدیق شدہ۔ | Hunarmand kaam, tasdeeq shuda. | |

## Trades (backend/config/skillTaxonomy.js, DISPLAY_NAMES)

| Id | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| electrical_solar (label) | Electrical & Solar | بجلی اور سولر | Bijli aur Solar | |
| electrical_solar (occupation) | Electrician | الیکٹریشن | Electrician | |
| plumbing_sanitary (label) | Plumbing & Sanitary | پلمبنگ اور سینیٹری | Plumbing aur Sanitary | |
| plumbing_sanitary (occupation) | Plumber | پلمبر | Plumber | |
| construction_masonry (label) | Construction & Masonry | تعمیر اور مستری کا کام | Tameer aur Mistri ka kaam | |
| construction_masonry (occupation) | Mason | راج مستری | Raj mistri | |
| carpentry_woodwork (label) | Carpentry & Woodwork | کارپینٹری اور لکڑی کا کام | Carpentry aur Lakri ka kaam | |
| carpentry_woodwork (occupation) | Carpenter | کارپینٹر (ترکھان) | Carpenter (tarkhan) | |
| painting_renovation (label) | Painting & Renovation | رنگ و روغن اور مرمت | Rang o Rogan aur Marammat | |
| painting_renovation (occupation) | Painter | پینٹر | Painter | |
| ac_appliance_repair (label) | AC & Appliance Repair | اے سی اور گھریلو مشینوں کی مرمت | AC aur Gharelu Machinon ki Marammat | |
| ac_appliance_repair (occupation) | AC technician | اے سی ٹیکنیشن | AC technician | |
| home_maintenance (label) | Home Maintenance | گھر کی مرمت | Ghar ki Marammat | |
| home_maintenance (occupation) | Handyman | مرمت کا کاریگر | Marammat ka karigar | |
| domestic_work (label) | Domestic Work | گھریلو کام | Gharelu Kaam | |
| domestic_work (occupation) | Domestic worker | گھریلو ملازم | Gharelu mulazim | |
| moving_loading (label) | Moving & Loading | شفٹنگ اور لوڈنگ | Shifting aur Loading | |
| moving_loading (occupation) | Mover and loader | شفٹنگ اور لوڈنگ کا مزدور | Shifting aur loading mazdoor | |

## Skills (backend/config/skillTaxonomy.js, DISPLAY_NAMES)

| Id | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| elec_general | General electrical work | بجلی کا عام کام | Bijli ka aam kaam | |
| elec_wiring | House wiring | گھر کی وائرنگ | Ghar ki wiring | |
| elec_solar | Solar panel installation | سولر پینل لگانا | Solar panel lagana | |
| elec_ups | UPS and battery setup | یو پی ایس اور بیٹری لگانا | UPS aur battery lagana | |
| elec_db | DB board and breakers | ڈی بی بورڈ اور بریکر | DB board aur breaker | |
| elec_fittings | Switches, sockets, lights and fans | سوئچ، ساکٹ، لائٹ اور پنکھے | Switch, socket, light aur pankhay | |
| elec_generator | Generator changeover | جنریٹر چینج اوور | Generator changeover | |
| elec_earthing | Earthing and safety testing | ارتھنگ اور حفاظتی جانچ | Earthing aur hifazati jaanch | |
| elec_3phase | Three-phase wiring | تھری فیز وائرنگ | Three phase wiring | |
| plumb_general | General plumbing work | پلمبنگ کا عام کام | Plumbing ka aam kaam | |
| plumb_pipe | PPRC and uPVC pipe fitting | پی پی آر سی اور یو پی وی سی پائپ فٹنگ | PPRC aur uPVC pipe fitting | |
| plumb_leak | Water leak repair | پانی کی لیکج ٹھیک کرنا | Paani ki leakage theek karna | |
| plumb_fixtures | Bathroom and sanitary fittings | باتھ روم اور سینیٹری فٹنگ | Bathroom aur sanitary fitting | |
| plumb_geyser | Geyser installation | گیزر لگانا | Geyser lagana | |
| plumb_pump | Water pump and tank | واٹر پمپ اور ٹینکی | Water pump aur tanki | |
| plumb_drain | Drain and sewerage unblocking | نالی اور گٹر کھولنا | Naali aur gutter kholna | |
| mason_general | General masonry work | مستری کا عام کام | Mistri ka aam kaam | |
| mason_brick | Brickwork | اینٹوں کی چنائی | Eenton ki chinai | |
| mason_plaster | Wall and ceiling plaster | دیوار اور چھت کا پلستر | Deewar aur chhat ka plaster | |
| mason_tile | Tile and marble flooring | ٹائل اور ماربل کا فرش | Tile aur marble ka farsh | |
| mason_concrete | Concrete, roof slab and foundation | کنکریٹ، لینٹر اور بنیاد | Concrete, lanter aur buniyaad | |
| mason_waterproof | Roof waterproofing | چھت کی واٹر پروفنگ | Chhat ki waterproofing | |
| carp_general | General carpentry work | لکڑی کا عام کام | Lakri ka aam kaam | |
| carp_cabinets | Wardrobes and kitchen cabinets | الماریاں اور کچن کیبنٹ | Almariyan aur kitchen cabinet | |
| carp_doors | Door and window fitting | دروازے اور کھڑکیاں لگانا | Darwazay aur khirkiyan lagana | |
| carp_locks | Door locks and latches | دروازوں کے تالے اور کنڈیاں | Darwazon ke taalay aur kundiyan | |
| carp_furniture | Furniture making and repair | فرنیچر بنانا اور مرمت | Furniture banana aur marammat | |
| carp_polish | Wood polish and laminate | لکڑی کی پالش اور لیمینیٹ | Lakri ki polish aur laminate | |
| paint_general | General painting work | پینٹ کا عام کام | Paint ka aam kaam | |
| paint_interior | Interior emulsion and distemper | اندر کا ایملشن اور ڈسٹمپر | Andar ka emulsion aur distemper | |
| paint_exterior | Exterior weather coating | باہر کی ویدر کوٹنگ | Bahar ki weather coating | |
| paint_putty | Wall putty and primer | وال پٹی اور پرائمر | Wall putty aur primer | |
| paint_texture | Texture and wallpaper | ٹیکسچر اور وال پیپر | Texture aur wallpaper | |
| ac_general | AC repair (general) | اے سی کی مرمت (عام) | AC ki marammat (aam) | |
| ac_install | Split and inverter AC installation | سپلٹ اور انورٹر اے سی لگانا | Split aur inverter AC lagana | |
| ac_gas | AC gas charging | اے سی میں گیس بھرنا | AC mein gas bharna | |
| ac_service | AC service and chemical wash | اے سی سروس اور کیمیکل واش | AC service aur chemical wash | |
| ac_fridge | Fridge and freezer repair | فریج اور فریزر کی مرمت | Fridge aur freezer ki marammat | |
| ac_washing | Washing machine repair | واشنگ مشین کی مرمت | Washing machine ki marammat | |
| home_general | General home repairs | گھر کی عام مرمت | Ghar ki aam marammat | |
| home_fixtures | Curtain rods, shelves and wall fixtures | پردے کی راڈ، شیلف اور دیوار کی فٹنگ | Parday ki rod, shelf aur deewar ki fitting | |
| dom_general | Domestic work (general) | گھریلو کام (عام) | Gharelu kaam (aam) | |
| dom_cleaning | House cleaning | گھر کی صفائی | Ghar ki safai | |
| dom_cooking | Cooking | کھانا پکانا | Khana pakana | |
| dom_laundry | Washing and ironing clothes | کپڑے دھونا اور استری | Kapray dhona aur istri | |
| dom_childcare | Child care | بچوں کی دیکھ بھال | Bachon ki dekh bhaal | |
| dom_eldercare | Elder and patient care | بزرگوں اور مریضوں کی دیکھ بھال | Buzurgon aur mareezon ki dekh bhaal | |
| move_shifting | House shifting | گھر کی شفٹنگ | Ghar ki shifting | |
| move_loading | Loading and unloading | سامان چڑھانا اور اتارنا | Saamaan charhana aur utaarna | |
| move_packing | Packing goods for moving | شفٹنگ کے لیے سامان کی پیکنگ | Shifting ke liye saamaan ki packing | |
