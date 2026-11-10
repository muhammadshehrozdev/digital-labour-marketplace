# Urdu and Roman Urdu texts: review list

**Status: DRAFT, needs a native reviewer.** Every Urdu and Roman Urdu text below was written by Claude Code
in Batch 3 (10 Nov 2026). Nobody who reads Urdu has checked them yet. Please read each row, write your
name in "Checked by" when it is right, and correct the text in the file named in the section title
(`frontend/src/i18n/dictionaries/ur.js`, `ur-Latn.js`, `frontend/src/i18n/languages.js`, or
`backend/config/skillTaxonomy.js`). Then run `node scripts/i18n-review.mjs` in `.\frontend` to update this file.

What to check: simple, everyday words for a worker with basic reading skills; short sentences; correct
spelling; Roman Urdu spelled the way people type it on WhatsApp. Placeholders such as `{name}` and
`{count}` must stay exactly as they are. Digits stay Western (0-9).

890 texts in total (generated from the source files; not hand-copied).

## Website texts: `app`

| Key | English | اردو (Urdu) | Roman Urdu | Checked by |
|---|---|---|---|---|
| app.name | Digital Labour Marketplace | ڈیجیٹل لیبر مارکیٹ پلیس | Digital Labour Marketplace | |
| app.nameFirst | Digital Labour | ڈیجیٹل لیبر | Digital Labour | |
| app.nameSecond | Marketplace | مارکیٹ پلیس | Marketplace | |
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
| landing.howTitle | How it works | یہ کیسے کام کرتا ہے | Yeh kaise kaam karta hai | |
| landing.howLead | Three short steps on each side. | دونوں طرف تین آسان قدم۔ | Dono taraf teen asaan qadam. | |
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
| errors.ADDED_VIA_INVALID | addedVia must be extractor or manual | شامل کرنے کا طریقہ درست نہیں | Shamil karne ka tareeqa durust nahi | |
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
| notFound.text | This page does not exist. | یہ صفحہ موجود نہیں ہے۔ | Yeh safha mojood nahi hai. | |
| notFound.home | Go to the home page | ہوم پیج پر جائیں | Home page par jayein | |

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
| admin.nav.audit | Audit log | آڈٹ لاگ | Audit log | |
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
