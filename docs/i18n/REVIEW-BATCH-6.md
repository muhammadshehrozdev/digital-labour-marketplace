# Batch 6 texts for team review (Module 4)

619 new texts, each in English, Urdu and Roman Urdu. Date: 2026-11-17. Every Urdu and Roman Urdu text
below is a **draft** until a team member who reads Urdu has checked it (D-031).
63 of them are help texts that can be recorded as clips (Clip = yes).
Changed existing texts: `profile.contactNote` (all three languages; the old text said contacts come "in a later
module"), `errors.SORT_INVALID` and `errors.EXPORT_KIND_UNKNOWN` (they list the new values).

Please check that each text:
- is everyday Urdu a labourer uses (no "field", "submit", "status");
- is short enough to be spoken (help texts: about 20 words at most);
- says the **same thing** in Urdu and Roman Urdu (Roman Urdu users hear the Urdu audio);
- uses neutral or respectful forms where Urdu verbs would show a gender ("آنا نہیں ہو سکا", "دیں گے"); the one
  exception is `booking.reasons.dispute.i_did_come` ("میں آیا تھا / آئی تھی"): please choose the wording you prefer.

**Clips to record:** the rows with "yes" in the Clip column are fixed help texts; they appear by themselves in the
clip recorder (`/dev/recorder`, development builds) under their keys. Texts with a value in braces are spoken by a
device voice and cannot be recorded. Record in Urdu first (`docs/audio/RECORDING-GUIDE.md`).

## Help texts (heard): fields, pages and picture options (64)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `help.field.request.skill` | Choose the work you need. These are this worker's own skills. | جو کام چاہیے وہ چنیں۔ یہ اس کاریگر کے اپنے ہنر ہیں۔ | Jo kaam chahiye woh chunein. Yeh is karigar ke apne hunar hain. | yes | |
| `help.field.request.day` | Choose today, tomorrow, or pick another day within one month. | آج، کل، یا ایک مہینے کے اندر کوئی اور دن چنیں۔ | Aaj, kal, ya aik maheenay ke andar koi aur din chunein. | yes | |
| `help.field.request.date` | Choose the day for the work, from today up to thirty days ahead. | کام کا دن چنیں، آج سے تیس دن آگے تک۔ | Kaam ka din chunein, aaj se tees din aagay tak. | yes | |
| `help.field.request.time` | Choose morning, afternoon or evening. Any time means from nine in the morning. | صبح، دوپہر یا شام چنیں۔ کسی بھی وقت کا مطلب ہے صبح نو بجے سے۔ | Subah, dopehar ya shaam chunein. Kisi bhi waqt ka matlab hai subah nau baje se. | yes | |
| `help.field.request.city` | Write your city, for example Islamabad. | اپنا شہر لکھیں، جیسے اسلام آباد۔ | Apna shehar likhein, jaise Islamabad. | yes | |
| `help.field.request.area` | Write your area or sector, for example G-9 Markaz. Do not write a phone number. | اپنا علاقہ یا سیکٹر لکھیں، جیسے جی نائن مرکز۔ فون نمبر نہ لکھیں۔ | Apna ilaqa ya sector likhein, jaise G-9 Markaz. Phone number na likhein. | yes | |
| `help.field.request.description` | Say or write the work in one or two lines. No phone numbers, links or ID numbers. | کام ایک دو جملوں میں بولیں یا لکھیں۔ فون نمبر، لنک یا شناختی نمبر نہیں۔ | Kaam aik do jumlon mein bolein ya likhein. Phone number, link ya shanakhti number nahi. | yes | |
| `help.field.rate.stars` | Choose the stars. One star is very poor, five stars is very good work. | ستارے چنیں۔ ایک ستارہ بہت برا، پانچ ستارے بہت اچھا کام۔ | Sitaaray chunein. Aik sitaara bohat bura, paanch sitaaray bohat achha kaam. | yes | |
| `help.field.rate.onTime` | Did the worker come on time? Choose yes, no, or skip. | کیا کاریگر وقت پر آئے؟ ہاں، نہیں، یا چھوڑیں چنیں۔ | Kya karigar waqt par aaye? Haan, nahi, ya chhorein chunein. | yes | |
| `help.field.rate.workQuality` | Was the work done well? Choose yes, no, or skip. | کیا کام اچھا ہوا؟ ہاں، نہیں، یا چھوڑیں چنیں۔ | Kya kaam achha hua? Haan, nahi, ya chhorein chunein. | yes | |
| `help.field.rate.polite` | Was the worker polite with you? Choose yes, no, or skip. | کیا کاریگر کا رویہ اچھا تھا؟ ہاں، نہیں، یا چھوڑیں چنیں۔ | Kya karigar ka rawayya achha tha? Haan, nahi, ya chhorein chunein. | yes | |
| `help.field.rate.priceAsAgreed` | Was the price the one you agreed? Choose yes, no, or skip. | کیا قیمت وہی تھی جو طے ہوئی تھی؟ ہاں، نہیں، یا چھوڑیں چنیں۔ | Kya qeemat wohi thi jo tay hui thi? Haan, nahi, ya chhorein chunein. | yes | |
| `help.field.rate.wouldHireAgain` | Would you call this worker again? Choose yes, no, or skip. | کیا آپ اس کاریگر کو دوبارہ بلائیں گے؟ ہاں، نہیں، یا چھوڑیں چنیں۔ | Kya aap is karigar ko dobara bulayenge? Haan, nahi, ya chhorein chunein. | yes | |
| `help.field.rate.comment` | Say or write what went well or badly. Do not write phone numbers. | بولیں یا لکھیں کیا اچھا رہا یا برا۔ فون نمبر نہ لکھیں۔ | Bolein ya likhein kya achha raha ya bura. Phone number na likhein. | yes | |
| `help.field.booking.note` | Say or write what happened, in a few words. An admin will read it. | چند لفظوں میں بولیں یا لکھیں کیا ہوا۔ ایڈمن اسے پڑھیں گے۔ | Chand lafzon mein bolein ya likhein kya hua. Admin isay parhein ge. | yes | |
| `help.field.booking.cancelReason` | Choose why you are cancelling. The other person will be told. | چنیں کہ آپ کیوں منسوخ کر رہے ہیں۔ دوسرے فریق کو بتا دیا جائے گا۔ | Chunein ke aap kyun mansookh kar rahe hain. Doosre fareeq ko bata diya jayega. | yes | |
| `help.field.booking.declineReason` | You may choose why you say no. Saying no never counts against you. | چاہیں تو انکار کی وجہ چنیں۔ انکار کبھی آپ کے خلاف نہیں گنا جاتا۔ | Chahein to inkaar ki wajah chunein. Inkaar kabhi aap ke khilaaf nahi gina jata. | yes | |
| `help.field.booking.disputeReason` | Choose what happened. An admin will check and decide. | چنیں کیا ہوا۔ ایڈمن جانچ کر فیصلہ کریں گے۔ | Chunein kya hua. Admin jaanch kar faisla karein ge. | yes | |
| `help.field.booking.reportReason` | Choose why this review is wrong. A bad review is not a reason. | چنیں یہ ریویو کیوں غلط ہے۔ برا ریویو ہونا کوئی وجہ نہیں۔ | Chunein yeh review kyun ghalat hai. Bura review hona koi wajah nahi. | yes | |
| `help.field.reviews.reply` | Say or write a short, polite reply. You can reply only once. | مختصر اور اچھے انداز میں جواب بولیں یا لکھیں۔ جواب صرف ایک بار دیا جا سکتا ہے۔ | Mukhtasar aur achhay andaaz mein jawab bolein ya likhein. Jawab sirf aik baar diya ja sakta hai. | yes | |
| `help.screen.requestWorker` | Choose the work, the day and the time, write your area, and press Send. The worker answers yes or no. | کام، دن اور وقت چنیں، اپنا علاقہ لکھیں اور بھیجیں دبائیں۔ کاریگر ہاں یا نہ میں جواب دیں گے۔ | Kaam, din aur waqt chunein, apna ilaqa likhein aur bhejein dabayein. Karigar haan ya na mein jawab dein ge. | yes | |
| `help.screen.myBookings` | Your requests and finished work. Open a booking to see the worker's phone number after they accept. | آپ کی درخواستیں اور مکمل کام۔ کاریگر کے قبول کرنے کے بعد فون نمبر کے لیے بکنگ کھولیں۔ | Aap ki darkhwastein aur mukammal kaam. Karigar ke qabool karne ke baad phone number ke liye booking kholein. | yes | |
| `help.screen.bookingDetail` | One booking: what happened, the phone number when allowed, and the buttons you can press now. | ایک بکنگ: کیا ہوا، اجازت ہو تو فون نمبر، اور وہ بٹن جو آپ ابھی دبا سکتے ہیں۔ | Aik booking: kya hua, ijazat ho to phone number, aur woh button jo aap abhi daba sakte hain. | yes | |
| `help.screen.rateWork` | Choose the stars, answer the questions if you like, and send. A review cannot be changed later. | ستارے چنیں، چاہیں تو سوالوں کے جواب دیں، اور بھیجیں۔ ریویو بعد میں بدلا نہیں جا سکتا۔ | Sitaaray chunein, chahein to sawalon ke jawab dein, aur bhejein. Review baad mein badla nahi ja sakta. | yes | |
| `help.screen.requests` | New work requests. Press Hear this request, then Accept or Decline. Saying no never counts against you. | نئی درخواستیں۔ "یہ درخواست سنیں" دبائیں، پھر قبول یا انکار کریں۔ انکار آپ کے خلاف نہیں گنا جاتا۔ | Nayi darkhwastein. "Yeh darkhwast sunein" dabayein, phir qabool ya inkaar karein. Inkaar aap ke khilaaf nahi gina jata. | yes | |
| `help.screen.myJobs` | Work you accepted. Call the customer, and press Work done when you finish. | وہ کام جو آپ نے قبول کیے۔ گاہک کو کال کریں، اور کام ختم ہو تو "کام ہو گیا" دبائیں۔ | Woh kaam jo aap ne qabool kiye. Gaahak ko call karein, aur kaam khatam ho to "Kaam ho gaya" dabayein. | yes | |
| `help.screen.myReviews` | What customers wrote about your work. Press Listen to hear a review. You can reply once. | گاہکوں نے آپ کے کام کے بارے میں کیا لکھا۔ ریویو سننے کے لیے سنیں دبائیں۔ آپ ایک بار جواب دے سکتے ہیں۔ | Gaahakon ne aap ke kaam ke baare mein kya likha. Review sunne ke liye sunein dabayein. Aap aik baar jawab de sakte hain. | yes | |
| `help.screen.myReputation` | How your reputation is counted, in simple words. Press Listen next to each rule. | آپ کی ساکھ کیسے گنی جاتی ہے، آسان الفاظ میں۔ ہر اصول کے ساتھ سنیں دبائیں۔ | Aap ki saakh kaise gini jati hai, aasaan alfaaz mein. Har usool ke saath sunein dabayein. | yes | |
| `help.option.requestSkill.any` | {name}. Choose this if you need this work. | {name}۔ اگر یہ کام چاہیے تو یہ چنیں۔ | {name}. Agar yeh kaam chahiye to yeh chunein. |  | |
| `help.option.requestDay.today` | Today: the work is needed today. | آج: کام آج ہی چاہیے۔ | Aaj: kaam aaj hi chahiye. | yes | |
| `help.option.requestDay.tomorrow` | Tomorrow: the work is needed tomorrow. | کل: کام کل چاہیے۔ | Kal: kaam kal chahiye. | yes | |
| `help.option.requestDay.pick` | Pick a date: choose another day. | تاریخ چنیں: کوئی اور دن چنیں۔ | Tareekh chunein: koi aur din chunein. | yes | |
| `help.option.timeSlot.morning` | Morning, from nine o'clock. | صبح، نو بجے سے۔ | Subah, nau baje se. | yes | |
| `help.option.timeSlot.afternoon` | Afternoon, from one o'clock. | دوپہر، ایک بجے سے۔ | Dopehar, aik baje se. | yes | |
| `help.option.timeSlot.evening` | Evening, from five o'clock. | شام، پانچ بجے سے۔ | Shaam, paanch baje se. | yes | |
| `help.option.timeSlot.any` | Any time of the day. | دن میں کسی بھی وقت۔ | Din mein kisi bhi waqt. | yes | |
| `help.option.thumb.yes` | Yes: thumbs up. | ہاں: انگوٹھا اوپر۔ | Haan: angootha oopar. | yes | |
| `help.option.thumb.no` | No: thumbs down. | نہیں: انگوٹھا نیچے۔ | Nahi: angootha neeche. | yes | |
| `help.option.thumb.skip` | Skip: no answer. | چھوڑیں: کوئی جواب نہیں۔ | Chhorein: koi jawab nahi. | yes | |
| `help.option.stars.1` | One star: very poor work. | ایک ستارہ: بہت برا کام۔ | Aik sitaara: bohat bura kaam. | yes | |
| `help.option.stars.2` | Two stars: poor work. | دو ستارے: برا کام۔ | Do sitaaray: bura kaam. | yes | |
| `help.option.stars.3` | Three stars: OK work. | تین ستارے: ٹھیک کام۔ | Teen sitaaray: theek kaam. | yes | |
| `help.option.stars.4` | Four stars: good work. | چار ستارے: اچھا کام۔ | Chaar sitaaray: achha kaam. | yes | |
| `help.option.stars.5` | Five stars: very good work. | پانچ ستارے: بہت اچھا کام۔ | Paanch sitaaray: bohat achha kaam. | yes | |
| `help.option.cancelReason.plans_changed` | My plans changed. | میرا پروگرام بدل گیا۔ | Mera program badal gaya. | yes | |
| `help.option.cancelReason.found_someone_else` | I found someone else. | کوئی اور مل گیا۔ | Koi aur mil gaya. | yes | |
| `help.option.cancelReason.cannot_come` | Coming is not possible. | آنا ممکن نہیں۔ | Aana mumkin nahi. | yes | |
| `help.option.cancelReason.emergency` | An emergency. | ہنگامی صورت۔ | Hangami soorat. | yes | |
| `help.option.cancelReason.price` | A problem with the price. | قیمت کا مسئلہ۔ | Qeemat ka masla. | yes | |
| `help.option.cancelReason.other` | Another reason. | کوئی اور وجہ۔ | Koi aur wajah. | yes | |
| `help.option.declineReason.busy` | I am busy. | میں مصروف ہوں۔ | Main masroof hoon. | yes | |
| `help.option.declineReason.too_far` | The place is too far. | جگہ بہت دور ہے۔ | Jagah bohat door hai. | yes | |
| `help.option.declineReason.not_my_work` | This is not my kind of work. | یہ میرا کام نہیں۔ | Yeh mera kaam nahi. | yes | |
| `help.option.declineReason.other` | Another reason. | کوئی اور وجہ۔ | Koi aur wajah. | yes | |
| `help.option.disputeReason.work_was_done` | The work was done. | کام ہو چکا تھا۔ | Kaam ho chuka tha. | yes | |
| `help.option.disputeReason.work_not_done` | The work was not done. | کام نہیں ہوا۔ | Kaam nahi hua. | yes | |
| `help.option.disputeReason.i_did_come` | I did come to the work. | میں کام پر آیا تھا یا آئی تھی۔ | Main kaam par aaya tha ya aayi thi. | yes | |
| `help.option.disputeReason.not_my_fault` | It was not my fault. | میری غلطی نہیں تھی۔ | Meri ghalati nahi thi. | yes | |
| `help.option.disputeReason.other` | Something else happened. | کچھ اور ہوا۔ | Kuch aur hua. | yes | |
| `help.option.reportReason.abusive` | It has abusive words. | اس میں گالی یا بدتمیزی ہے۔ | Is mein gaali ya badtameezi hai. | yes | |
| `help.option.reportReason.personal_information` | It has personal information. | اس میں ذاتی معلومات ہیں۔ | Is mein zaati maloomat hain. | yes | |
| `help.option.reportReason.not_about_my_work` | It is not about my work. | یہ میرے کام کے بارے میں نہیں۔ | Yeh mere kaam ke baare mein nahi. | yes | |
| `help.option.reportReason.job_did_not_happen` | This job never happened. | یہ کام ہوا ہی نہیں۔ | Yeh kaam hua hi nahi. | yes | |
| `help.option.reportReason.other` | Another reason. | کوئی اور وجہ۔ | Koi aur wajah. | yes | |

## Booking screens (customer and worker) (224)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `booking.nav.requests` | Requests | درخواستیں | Darkhwastein |  | |
| `booking.nav.jobs` | My jobs | میرے کام | Mere kaam |  | |
| `booking.nav.bookings` | My bookings | میری بکنگز | Meri bookings |  | |
| `booking.nav.reviews` | My reviews | میرے ریویو | Mere reviews |  | |
| `booking.nav.reputation` | My reputation | میری ساکھ | Meri saakh |  | |
| `booking.nav.newCount` | one: {count} new / other: {count} new | one: {count} نئی / other: {count} نئی | one: {count} nayi / other: {count} nayi |  | |
| `booking.titles.request` | Request a worker | کاریگر کو درخواست | Karigar ko darkhwast |  | |
| `booking.titles.myBookings` | My bookings | میری بکنگز | Meri bookings |  | |
| `booking.titles.detail` | Booking | بکنگ | Booking |  | |
| `booking.titles.rate` | Rate this work | اس کام کی ریٹنگ دیں | Is kaam ki rating dein |  | |
| `booking.titles.requests` | Requests | درخواستیں | Darkhwastein |  | |
| `booking.titles.jobs` | My jobs | میرے کام | Mere kaam |  | |
| `booking.titles.reviews` | My reviews | میرے ریویو | Mere reviews |  | |
| `booking.titles.reputation` | My reputation | میری ساکھ | Meri saakh |  | |
| `booking.status.requested` | Waiting for an answer | جواب کا انتظار | Jawab ka intezar |  | |
| `booking.status.accepted` | Accepted | قبول | Qabool |  | |
| `booking.status.completed` | Work done | کام مکمل | Kaam mukammal |  | |
| `booking.status.declined` | Declined | انکار | Inkaar |  | |
| `booking.status.expired` | No answer | جواب نہیں آیا | Jawab nahi aaya |  | |
| `booking.status.cancelled` | Cancelled | منسوخ | Mansookh |  | |
| `booking.disputeOpen` | Dispute open | تنازع زیرِ غور | Tanaaza zer-e-ghaur |  | |
| `booking.outcome.completed` | Completed | مکمل | Mukammal |  | |
| `booking.outcome.cancelled_by_worker_early` | Cancelled early by the worker | کاریگر نے پہلے سے منسوخ کیا | Karigar ne pehle se mansookh kiya |  | |
| `booking.outcome.cancelled_by_worker_late` | Cancelled late by the worker | کاریگر نے آخری وقت میں منسوخ کیا | Karigar ne aakhri waqt mein mansookh kiya |  | |
| `booking.outcome.worker_no_show` | The worker did not come | کاریگر نہیں آیا | Karigar nahi aaya |  | |
| `booking.outcome.cancelled_by_customer` | Cancelled by the customer | گاہک نے منسوخ کیا | Gaahak ne mansookh kiya |  | |
| `booking.outcome.declined` | Declined | انکار | Inkaar |  | |
| `booking.outcome.expired` | No answer | جواب نہیں آیا | Jawab nahi aaya |  | |
| `booking.outcome.closed_no_fault` | Closed, nobody at fault | بند، کسی کی غلطی نہیں | Band, kisi ki ghalati nahi |  | |
| `booking.slot.morning` | Morning (9 am) | صبح (9 بجے) | Subah (9 baje) |  | |
| `booking.slot.afternoon` | Afternoon (1 pm) | دوپہر (1 بجے) | Dopehar (1 baje) |  | |
| `booking.slot.evening` | Evening (5 pm) | شام (5 بجے) | Shaam (5 baje) |  | |
| `booking.slot.any` | Any time | کسی بھی وقت | Kisi bhi waqt |  | |
| `booking.day.today` | Today | آج | Aaj |  | |
| `booking.day.tomorrow` | Tomorrow | کل | Kal |  | |
| `booking.day.pick` | Pick a date | تاریخ چنیں | Tareekh chunein |  | |
| `booking.who.customer` | the customer | گاہک | gaahak |  | |
| `booking.who.worker` | the worker | کاریگر | karigar |  | |
| `booking.who.system` | the website | ویب سائٹ | website |  | |
| `booking.who.admin` | an admin | ایڈمن | admin |  | |
| `booking.card.code` | Booking number | بکنگ نمبر | Booking number |  | |
| `booking.card.customer` | Customer: {name} | گاہک: {name} | Gaahak: {name} |  | |
| `booking.card.worker` | Worker: {name} | کاریگر: {name} | Karigar: {name} |  | |
| `booking.request.button` | Request this worker | اس کاریگر کو بلائیں | Is karigar ko bulayein |  | |
| `booking.request.back` | Back to {name} | {name} پر واپس | {name} par wapas |  | |
| `booking.request.title` | Request {name} | {name} کو درخواست بھیجیں | {name} ko darkhwast bhejein |  | |
| `booking.request.lead` | Choose the work, the day and the time. The worker answers yes or no. | کام، دن اور وقت چنیں۔ کاریگر ہاں یا نہ میں جواب دیں گے۔ | Kaam, din aur waqt chunein. Karigar haan ya na mein jawab dein ge. |  | |
| `booking.request.skill` | Which work do you need? | آپ کو کون سا کام چاہیے؟ | Aap ko kaun sa kaam chahiye? |  | |
| `booking.request.day` | Which day? | کون سا دن؟ | Kaun sa din? |  | |
| `booking.request.date` | Date | تاریخ | Tareekh |  | |
| `booking.request.time` | What time? | کس وقت؟ | Kis waqt? |  | |
| `booking.request.city` | City | شہر | Shehar |  | |
| `booking.request.area` | Area or sector | علاقہ یا سیکٹر | Ilaqa ya sector |  | |
| `booking.request.areaHint` | For example "G-9 Markaz". No house number or phone number. | مثلاً "جی نائن مرکز"۔ گھر کا نمبر یا فون نمبر نہ لکھیں۔ | Masalan "G-9 Markaz". Ghar ka number ya phone number na likhein. |  | |
| `booking.request.description` | What is the work? (optional) | کام کیا ہے؟ (اختیاری) | Kaam kya hai? (ikhtiyari) |  | |
| `booking.request.descriptionHint` | One or two lines. Do not write phone numbers, links or ID numbers. | ایک دو جملے۔ فون نمبر، لنک یا شناختی نمبر نہ لکھیں۔ | Aik do jumlay. Phone number, link ya shanakhti number na likhein. |  | |
| `booking.request.phoneNote` | Your phone number is shared with the worker only if they accept. | آپ کا فون نمبر کاریگر کو صرف تب دکھایا جائے گا جب وہ درخواست قبول کریں۔ | Aap ka phone number karigar ko sirf tab dikhaya jayega jab woh darkhwast qabool karein. |  | |
| `booking.request.busyTitle` | This worker is busy now | یہ کاریگر ابھی مصروف ہیں | Yeh karigar abhi masroof hain |  | |
| `booking.request.busyText` | {name} marked themselves as busy. You can still send a request; the answer may take longer. | {name} نے خود کو مصروف لکھا ہے۔ آپ پھر بھی درخواست بھیج سکتے ہیں، جواب میں دیر ہو سکتی ہے۔ | {name} ne khud ko masroof likha hai. Aap phir bhi darkhwast bhej sakte hain, jawab mein der ho sakti hai. |  | |
| `booking.request.send` | Send the request | درخواست بھیجیں | Darkhwast bhejein |  | |
| `booking.request.sent` | Request sent | درخواست بھیج دی گئی | Darkhwast bhej di gayi |  | |
| `booking.request.sentText` | {name} will answer within 2 days. You will get a notification. | {name} دو دن میں جواب دیں گے۔ آپ کو اطلاع ملے گی۔ | {name} do din mein jawab dein ge. Aap ko ittela milegi. |  | |
| `booking.request.chooseSkill` | Choose the work | کام چنیں | Kaam chunein |  | |
| `booking.request.chooseDate` | Choose a date | تاریخ چنیں | Tareekh chunein |  | |
| `booking.request.needCity` | Write the city | شہر لکھیں | Shehar likhein |  | |
| `booking.request.needArea` | Write the area | علاقہ لکھیں | Ilaqa likhein |  | |
| `booking.mine.title` | My bookings | میری بکنگز | Meri bookings |  | |
| `booking.mine.lead` | Your requests and finished work. After the worker accepts, open the booking to see the phone number. | آپ کی درخواستیں اور مکمل کام۔ کاریگر کے قبول کرنے کے بعد فون نمبر کے لیے بکنگ کھولیں۔ | Aap ki darkhwastein aur mukammal kaam. Karigar ke qabool karne ke baad phone number ke liye booking kholein. |  | |
| `booking.mine.active` | Active | جاری | Jaari |  | |
| `booking.mine.past` | Past | پرانی | Purani |  | |
| `booking.mine.find` | Find a worker | کاریگر تلاش کریں | Karigar talaash karein |  | |
| `booking.mine.emptyActive` | No open requests | کوئی کھلی درخواست نہیں | Koi khuli darkhwast nahi |  | |
| `booking.mine.emptyActiveText` | Find a worker and press "Request this worker". | کاریگر تلاش کریں اور "اس کاریگر کو بلائیں" دبائیں۔ | Karigar talaash karein aur "Is karigar ko bulayein" dabayein. |  | |
| `booking.mine.emptyPast` | Nothing here yet | ابھی یہاں کچھ نہیں | Abhi yahan kuch nahi |  | |
| `booking.mine.emptyPastText` | Finished, declined and cancelled bookings appear here. | مکمل، انکار شدہ اور منسوخ بکنگز یہاں نظر آئیں گی۔ | Mukammal, inkaar shuda aur mansookh bookings yahan nazar aayengi. |  | |
| `booking.detail.back` | Back to the list | فہرست پر واپس | Fehrist par wapas |  | |
| `booking.detail.notFound` | Booking not found | بکنگ نہیں ملی | Booking nahi mili |  | |
| `booking.detail.notFoundText` | It may belong to someone else, or the link is wrong. | ہو سکتا ہے یہ کسی اور کی ہو یا لنک غلط ہو۔ | Ho sakta hai yeh kisi aur ki ho ya link ghalat ho. |  | |
| `booking.detail.what` | The work | کام | Kaam |  | |
| `booking.detail.timeline` | What happened | کیا ہوا | Kya hua |  | |
| `booking.detail.workerTip` | When the work is finished, press "Work done". The customer presses it too. | کام ختم ہو جائے تو "کام ہو گیا" دبائیں۔ گاہک بھی یہ بٹن دبائیں گے۔ | Kaam khatam ho jaye to "Kaam ho gaya" dabayein. Gaahak bhi yeh button dabayenge. |  | |
| `booking.detail.reviewTitle` | Review | ریویو | Review |  | |
| `booking.detail.reviewVisible` | This review is on the worker's profile. | یہ ریویو کاریگر کے پروفائل پر ہے۔ | Yeh review karigar ke profile par hai. |  | |
| `booking.detail.reviewHidden` | An admin hid this review. | ایڈمن نے یہ ریویو چھپا دیا ہے۔ | Admin ne yeh review chhupa diya hai. |  | |
| `booking.contact.titleWorker` | The worker's phone number | کاریگر کا فون نمبر | Karigar ka phone number |  | |
| `booking.contact.titleCustomer` | The customer's phone number | گاہک کا فون نمبر | Gaahak ka phone number |  | |
| `booking.contact.call` | Call | کال کریں | Call karein |  | |
| `booking.contact.whatsapp` | WhatsApp | واٹس ایپ | WhatsApp |  | |
| `booking.contact.until` | Shown until {date}. | {date} تک نظر آئے گا۔ | {date} tak nazar aayega. |  | |
| `booking.contact.hiddenCustomer` | The phone number appears here when the worker accepts. | کاریگر قبول کریں تو فون نمبر یہاں نظر آئے گا۔ | Karigar qabool karein to phone number yahan nazar aayega. |  | |
| `booking.contact.hiddenWorker` | The customer's phone number appears here after you accept. | آپ کے قبول کرنے کے بعد گاہک کا فون نمبر یہاں نظر آئے گا۔ | Aap ke qabool karne ke baad gaahak ka phone number yahan nazar aayega. |  | |
| `booking.action.accept` | Accept | قبول کریں | Qabool karein |  | |
| `booking.action.decline` | Decline | انکار کریں | Inkaar karein |  | |
| `booking.action.workDone` | Work done | کام ہو گیا | Kaam ho gaya |  | |
| `booking.action.notDone` | This work was not done | یہ کام نہیں ہوا | Yeh kaam nahi hua |  | |
| `booking.action.noShow` | Worker did not come | کاریگر نہیں آیا | Karigar nahi aaya |  | |
| `booking.action.admit` | Yes, I could not come | ہاں، آنا نہیں ہو سکا | Haan, aana nahi ho saka |  | |
| `booking.action.iCame` | I did come | یہ درست نہیں | Yeh durust nahi |  | |
| `booking.action.dispute` | This was not my fault | یہ میری غلطی نہیں تھی | Yeh meri ghalati nahi thi |  | |
| `booking.action.rate` | Rate this work | اس کام کی ریٹنگ دیں | Is kaam ki rating dein |  | |
| `booking.action.cancel` | Cancel | منسوخ کریں | Mansookh karein |  | |
| `booking.dialog.declineTitle` | Decline this request? | اس درخواست سے انکار کریں؟ | Is darkhwast se inkaar karein? |  | |
| `booking.dialog.declineText` | Declining never counts against you. You may choose a reason. | انکار کرنے سے آپ کی ساکھ پر کوئی اثر نہیں پڑتا۔ چاہیں تو وجہ چنیں۔ | Inkaar karne se aap ki saakh par koi asar nahi parta. Chahein to wajah chunein. |  | |
| `booking.dialog.cancelTitle` | Cancel this booking? | یہ بکنگ منسوخ کریں؟ | Yeh booking mansookh karein? |  | |
| `booking.dialog.cancelRequestText` | The worker will be told. | کاریگر کو بتا دیا جائے گا۔ | Karigar ko bata diya jayega. |  | |
| `booking.dialog.cancelText` | The other person will be told. Please choose the reason. | دوسرے فریق کو بتا دیا جائے گا۔ براہ کرم وجہ چنیں۔ | Doosre fareeq ko bata diya jayega. Barah-e-karam wajah chunein. |  | |
| `booking.dialog.earlyWarning` | A cancellation by you counts in your reliability record. Cancel at least a day before. | آپ کی طرف سے منسوخی آپ کے بھروسے کے ریکارڈ میں گنی جاتی ہے۔ کم از کم ایک دن پہلے منسوخ کریں۔ | Aap ki taraf se mansookhi aap ke bharosay ke record mein gini jati hai. Kam az kam aik din pehle mansookh karein. |  | |
| `booking.dialog.lateWarning` | The work starts in less than 24 hours. A cancellation now is "late" and counts double. | کام 24 گھنٹے سے کم میں شروع ہے۔ ابھی منسوخی "دیر سے" کہلائے گی اور دو گنا گنی جائے گی۔ | Kaam 24 ghantay se kam mein shuru hai. Abhi mansookhi "der se" kehlayegi aur do guna gini jayegi. |  | |
| `booking.dialog.contestTitle` | The work was not done? | کام نہیں ہوا؟ | Kaam nahi hua? |  | |
| `booking.dialog.contestText` | An admin will look at it and decide. Until then the booking stays open. | ایڈمن دیکھ کر فیصلہ کریں گے۔ تب تک بکنگ کھلی رہے گی۔ | Admin dekh kar faisla karein ge. Tab tak booking khuli rahegi. |  | |
| `booking.dialog.disputeTitle` | Not your fault? | آپ کی غلطی نہیں؟ | Aap ki ghalati nahi? |  | |
| `booking.dialog.disputeText` | Tell us what happened. An admin will decide within a few days. | بتائیں کیا ہوا۔ ایڈمن چند دن میں فیصلہ کریں گے۔ | Batayein kya hua. Admin chand din mein faisla karein ge. |  | |
| `booking.dialog.iCameTitle` | The customer says you did not come | گاہک کہتے ہیں کہ آپ نہیں آئے | Gaahak kehte hain ke aap nahi aaye |  | |
| `booking.dialog.iCameText` | If this is not true, tell us what happened. An admin will decide. | اگر یہ درست نہیں تو بتائیں کیا ہوا۔ ایڈمن فیصلہ کریں گے۔ | Agar yeh durust nahi to batayein kya hua. Admin faisla karein ge. |  | |
| `booking.dialog.doneTitle` | Is the work finished? | کیا کام ختم ہو گیا؟ | Kya kaam khatam ho gaya? |  | |
| `booking.dialog.doneText` | Press this only when the work is really finished. When both of you press it, the booking is complete. | یہ بٹن تبھی دبائیں جب کام واقعی ختم ہو جائے۔ دونوں کے دبانے پر بکنگ مکمل ہو جائے گی۔ | Yeh button tabhi dabayein jab kaam waqai khatam ho jaye. Dono ke dabane par booking mukammal ho jayegi. |  | |
| `booking.dialog.noShowTitle` | The worker did not come? | کاریگر نہیں آیا؟ | Karigar nahi aaya? |  | |
| `booking.dialog.noShowText` | The worker gets 3 days to answer. If there is no answer, it counts as a no-show. | کاریگر کو جواب کے لیے 3 دن ملیں گے۔ جواب نہ آیا تو اسے غیر حاضری مانا جائے گا۔ | Karigar ko jawab ke liye 3 din milenge. Jawab na aaya to isay ghair haazri mana jayega. |  | |
| `booking.dialog.admitTitle` | You could not come? | آپ نہیں آ سکے؟ | Aap nahi aa sake? |  | |
| `booking.dialog.admitText` | This counts as a no-show in your record. If you did come, press "I did come" instead. | یہ آپ کے ریکارڈ میں غیر حاضری گنی جائے گی۔ اگر آپ آئے تھے تو "یہ درست نہیں" دبائیں۔ | Yeh aap ke record mein ghair haazri gini jayegi. Agar aap aaye thay to "Yeh durust nahi" dabayein. |  | |
| `booking.done.accepted` | Accepted. You can now see the customer's phone number. | قبول کر لیا۔ اب آپ گاہک کا فون نمبر دیکھ سکتے ہیں۔ | Qabool kar liya. Ab aap gaahak ka phone number dekh sakte hain. |  | |
| `booking.done.declined` | Declined | انکار کر دیا | Inkaar kar diya |  | |
| `booking.done.cancelled` | Cancelled | منسوخ کر دی گئی | Mansookh kar di gayi |  | |
| `booking.done.confirmed` | Saved: work done | محفوظ: کام ہو گیا | Mehfooz: kaam ho gaya |  | |
| `booking.done.disputed` | Sent to an admin | ایڈمن کو بھیج دیا | Admin ko bhej diya |  | |
| `booking.done.noShow` | Reported. The worker can answer. | اطلاع دے دی گئی۔ کاریگر جواب دے سکتے ہیں۔ | Ittela de di gayi. Karigar jawab de sakte hain. |  | |
| `booking.done.admitted` | Saved | محفوظ کر لیا | Mehfooz kar liya |  | |
| `booking.reason.legend` | Why? | کیوں؟ | Kyun? |  | |
| `booking.reason.note` | What happened? (optional) | کیا ہوا؟ (اختیاری) | Kya hua? (ikhtiyari) |  | |
| `booking.reason.choose` | Please choose a reason | براہ کرم ایک وجہ چنیں | Barah-e-karam aik wajah chunein |  | |
| `booking.reasons.cancel.plans_changed` | My plans changed | میرا پروگرام بدل گیا | Mera program badal gaya |  | |
| `booking.reasons.cancel.found_someone_else` | I found someone else | کوئی اور مل گیا | Koi aur mil gaya |  | |
| `booking.reasons.cancel.cannot_come` | Coming is not possible | آنا ممکن نہیں | Aana mumkin nahi |  | |
| `booking.reasons.cancel.emergency` | An emergency | ہنگامی صورت | Hangami soorat |  | |
| `booking.reasons.cancel.price` | The price | قیمت کا مسئلہ | Qeemat ka masla |  | |
| `booking.reasons.cancel.other` | Another reason | کوئی اور وجہ | Koi aur wajah |  | |
| `booking.reasons.decline.busy` | I am busy | میں مصروف ہوں | Main masroof hoon |  | |
| `booking.reasons.decline.too_far` | Too far | بہت دور ہے | Bohat door hai |  | |
| `booking.reasons.decline.not_my_work` | Not my kind of work | یہ میرا کام نہیں | Yeh mera kaam nahi |  | |
| `booking.reasons.decline.other` | Another reason | کوئی اور وجہ | Koi aur wajah |  | |
| `booking.reasons.dispute.work_was_done` | The work was done | کام ہو چکا تھا | Kaam ho chuka tha |  | |
| `booking.reasons.dispute.work_not_done` | The work was not done | کام نہیں ہوا | Kaam nahi hua |  | |
| `booking.reasons.dispute.i_did_come` | I did come | میں آیا تھا / آئی تھی | Main aaya tha / aayi thi |  | |
| `booking.reasons.dispute.not_my_fault` | It was not my fault | میری غلطی نہیں تھی | Meri ghalati nahi thi |  | |
| `booking.reasons.dispute.other` | Something else | کچھ اور | Kuch aur |  | |
| `booking.reasons.report.abusive` | Abusive words | گالی یا بدتمیزی | Gaali ya badtameezi |  | |
| `booking.reasons.report.personal_information` | Personal information | ذاتی معلومات | Zaati maloomat |  | |
| `booking.reasons.report.not_about_my_work` | Not about my work | میرے کام کے بارے میں نہیں | Mere kaam ke baare mein nahi |  | |
| `booking.reasons.report.job_did_not_happen` | This job never happened | یہ کام ہوا ہی نہیں | Yeh kaam hua hi nahi |  | |
| `booking.reasons.report.other` | Another reason | کوئی اور وجہ | Koi aur wajah |  | |
| `booking.dispute.type.completion_contested` | Was the work done? | کیا کام ہوا؟ | Kya kaam hua? |  | |
| `booking.dispute.type.no_show_contested` | Did the worker come? | کیا کاریگر آیا؟ | Kya karigar aaya? |  | |
| `booking.dispute.type.cancellation_fault` | Whose fault was the cancellation? | منسوخی کس کی غلطی تھی؟ | Mansookhi kis ki ghalati thi? |  | |
| `booking.dispute.open` | An admin will look at this and decide. Opened on {date}. | ایڈمن اسے دیکھ کر فیصلہ کریں گے۔ {date} کو کھولا گیا۔ | Admin isay dekh kar faisla karein ge. {date} ko khola gaya. |  | |
| `booking.dispute.decided` | An admin decided on {date}. | ایڈمن نے {date} کو فیصلہ کیا۔ | Admin ne {date} ko faisla kiya. |  | |
| `booking.dispute.decision.work_done` | Decision: the work was done | فیصلہ: کام ہوا تھا | Faisla: kaam hua tha |  | |
| `booking.dispute.decision.not_done_worker_fault` | Decision: not done, the worker's fault | فیصلہ: کام نہیں ہوا، کاریگر کی غلطی | Faisla: kaam nahi hua, karigar ki ghalati |  | |
| `booking.dispute.decision.not_done_no_fault` | Decision: not done, nobody's fault | فیصلہ: کام نہیں ہوا، کسی کی غلطی نہیں | Faisla: kaam nahi hua, kisi ki ghalati nahi |  | |
| `booking.dispute.decision.no_show_confirmed` | Decision: the worker did not come | فیصلہ: کاریگر نہیں آیا | Faisla: karigar nahi aaya |  | |
| `booking.dispute.decision.no_show_rejected` | Decision: the worker did come | فیصلہ: کاریگر آیا تھا | Faisla: karigar aaya tha |  | |
| `booking.dispute.decision.worker_fault` | Decision: the worker's fault | فیصلہ: کاریگر کی غلطی | Faisla: karigar ki ghalati |  | |
| `booking.dispute.decision.no_fault` | Decision: nobody's fault | فیصلہ: کسی کی غلطی نہیں | Faisla: kisi ki ghalati nahi |  | |
| `booking.event.to_requested` | Request sent | درخواست بھیجی گئی | Darkhwast bheji gayi |  | |
| `booking.event.to_accepted` | Accepted by the worker | کاریگر نے قبول کی | Karigar ne qabool ki |  | |
| `booking.event.to_declined` | Declined by the worker | کاریگر نے انکار کیا | Karigar ne inkaar kiya |  | |
| `booking.event.to_cancelled` | Cancelled by {who} | {who} نے منسوخ کی | {who} ne mansookh ki |  | |
| `booking.event.to_expired` | No answer in 2 days | دو دن میں جواب نہیں آیا | Do din mein jawab nahi aaya |  | |
| `booking.event.to_completed` | Work complete | کام مکمل | Kaam mukammal |  | |
| `booking.event.confirmed_done` | {who} pressed "Work done" | {who} نے "کام ہو گیا" دبایا | {who} ne "Kaam ho gaya" dabaya |  | |
| `booking.event.both_confirmed` | Both pressed "Work done": complete | دونوں نے "کام ہو گیا" دبایا: مکمل | Dono ne "Kaam ho gaya" dabaya: mukammal |  | |
| `booking.event.auto_completed` | Completed by itself after 3 days | 3 دن بعد خود بخود مکمل | 3 din baad khud ba khud mukammal |  | |
| `booking.event.no_answer` | No answer in 2 days | دو دن میں جواب نہیں آیا | Do din mein jawab nahi aaya |  | |
| `booking.event.no_show_reported` | The customer reported: the worker did not come | گاہک نے بتایا: کاریگر نہیں آیا | Gaahak ne bataya: karigar nahi aaya |  | |
| `booking.event.no_show_admitted` | The worker confirmed: coming was not possible | کاریگر نے مانا: آنا نہیں ہو سکا | Karigar ne mana: aana nahi ho saka |  | |
| `booking.event.no_show_unanswered` | No answer from the worker in 3 days: counted as a no-show | 3 دن میں کاریگر کا جواب نہیں آیا: غیر حاضری گنی گئی | 3 din mein karigar ka jawab nahi aaya: ghair haazri gini gayi |  | |
| `booking.event.dispute_completion_contested` | {who} said the work was not done | {who} نے کہا کام نہیں ہوا | {who} ne kaha kaam nahi hua |  | |
| `booking.event.dispute_no_show_contested` | The worker said the no-show is not true | کاریگر نے غیر حاضری کو غلط کہا | Karigar ne ghair haazri ko ghalat kaha |  | |
| `booking.event.dispute_cancellation_fault` | The worker said the cancellation was not their fault | کاریگر نے کہا منسوخی ان کی غلطی نہیں تھی | Karigar ne kaha mansookhi un ki ghalati nahi thi |  | |
| `booking.event.admin_decision` | An admin decided | ایڈمن نے فیصلہ کیا | Admin ne faisla kiya |  | |
| `booking.hear.button` | Hear this request | یہ درخواست سنیں | Yeh darkhwast sunein |  | |
| `booking.hear.sentence` | New work: {skill}, {day}, {slot}, {area}, {city}. | نیا کام: {skill}، {day}، {slot}، {area}، {city}۔ | Naya kaam: {skill}, {day}, {slot}, {area}, {city}. |  | |
| `booking.hear.noVoice` | This device has no voice for this language. The request is written above. | اس آلے میں اس زبان کی آواز نہیں ہے۔ درخواست اوپر لکھی ہے۔ | Is device mein is zabaan ki awaaz nahi hai. Darkhwast oopar likhi hai. |  | |
| `booking.requests.title` | Requests | درخواستیں | Darkhwastein |  | |
| `booking.requests.lead` | New work requests from customers. Accept or decline within 2 days. Declining never counts against you. | گاہکوں کی نئی درخواستیں۔ دو دن میں قبول یا انکار کریں۔ انکار سے آپ کی ساکھ پر اثر نہیں پڑتا۔ | Gaahakon ki nayi darkhwastein. Do din mein qabool ya inkaar karein. Inkaar se aap ki saakh par asar nahi parta. |  | |
| `booking.requests.empty` | No new requests | کوئی نئی درخواست نہیں | Koi nayi darkhwast nahi |  | |
| `booking.requests.emptyText` | When a customer asks for you, the request appears here and in the bell. | جب کوئی گاہک آپ کو بلائیں گے تو درخواست یہاں اور گھنٹی میں نظر آئے گی۔ | Jab koi gaahak aap ko bulayenge to darkhwast yahan aur ghanti mein nazar aayegi. |  | |
| `booking.jobs.title` | My jobs | میرے کام | Mere kaam |  | |
| `booking.jobs.lead` | Work you accepted, with the customer's phone number. Press "Work done" when you finish. | وہ کام جو آپ نے قبول کیے، گاہک کے فون نمبر کے ساتھ۔ کام ختم ہو تو "کام ہو گیا" دبائیں۔ | Woh kaam jo aap ne qabool kiye, gaahak ke phone number ke saath. Kaam khatam ho to "Kaam ho gaya" dabayein. |  | |
| `booking.jobs.active` | Now | ابھی | Abhi |  | |
| `booking.jobs.past` | Past | پرانے | Puranay |  | |
| `booking.jobs.empty` | No accepted jobs | کوئی قبول شدہ کام نہیں | Koi qabool shuda kaam nahi |  | |
| `booking.jobs.emptyText` | Accept a request and it appears here. | کوئی درخواست قبول کریں، وہ یہاں نظر آئے گی۔ | Koi darkhwast qabool karein, woh yahan nazar aayegi. |  | |
| `booking.jobs.emptyPast` | No past jobs yet | ابھی کوئی پرانا کام نہیں | Abhi koi purana kaam nahi |  | |
| `booking.jobs.emptyPastText` | Finished and cancelled jobs appear here. | مکمل اور منسوخ کام یہاں نظر آئیں گے۔ | Mukammal aur mansookh kaam yahan nazar aayenge. |  | |
| `booking.jobs.noShowAsked` | The customer says you did not come. Please answer within 3 days. | گاہک کہتے ہیں کہ آپ نہیں آئے۔ براہ کرم 3 دن میں جواب دیں۔ | Gaahak kehte hain ke aap nahi aaye. Barah-e-karam 3 din mein jawab dein. |  | |
| `booking.tiles.requests` | one: new request waiting for your answer / other: new requests waiting for your answer | one: نئی درخواست آپ کے جواب کی منتظر / other: نئی درخواستیں آپ کے جواب کی منتظر | one: nayi darkhwast aap ke jawab ki muntazir / other: nayi darkhwastein aap ke jawab ki muntazir |  | |
| `booking.tiles.jobs` | one: accepted job not finished yet / other: accepted jobs not finished yet | one: قبول شدہ کام، ابھی ختم نہیں ہوا / other: قبول شدہ کام، ابھی ختم نہیں ہوئے | one: qabool shuda kaam, abhi khatam nahi hua / other: qabool shuda kaam, abhi khatam nahi hue |  | |
| `booking.tiles.openRequests` | See requests | درخواستیں دیکھیں | Darkhwastein dekhein |  | |
| `booking.tiles.openJobs` | See my jobs | میرے کام دیکھیں | Mere kaam dekhein |  | |
| `booking.tiles.openReputation` | How my reputation is counted | میری ساکھ کیسے گنی جاتی ہے | Meri saakh kaise gini jati hai |  | |
| `booking.rate.title` | Rate this work | اس کام کی ریٹنگ دیں | Is kaam ki rating dein |  | |
| `booking.rate.lead` | {skill} by {name}. Your stars help other customers. | {name} کا کام: {skill}۔ آپ کے ستارے دوسرے گاہکوں کی مدد کرتے ہیں۔ | {name} ka kaam: {skill}. Aap ke sitaaray doosre gaahakon ki madad karte hain. |  | |
| `booking.rate.stars` | How was the work? | کام کیسا تھا؟ | Kaam kaisa tha? |  | |
| `booking.rate.q.onTime` | Did the worker come on time? | کیا کاریگر وقت پر آئے؟ | Kya karigar waqt par aaye? |  | |
| `booking.rate.q.workQuality` | Was the work good? | کیا کام اچھا تھا؟ | Kya kaam achha tha? |  | |
| `booking.rate.q.polite` | Was the worker polite? | کیا کاریگر کا رویہ اچھا تھا؟ | Kya karigar ka rawayya achha tha? |  | |
| `booking.rate.q.priceAsAgreed` | Was the price as agreed? | کیا قیمت وہی تھی جو طے ہوئی تھی؟ | Kya qeemat wohi thi jo tay hui thi? |  | |
| `booking.rate.q.wouldHireAgain` | Would you hire this worker again? | کیا آپ اس کاریگر کو دوبارہ بلائیں گے؟ | Kya aap is karigar ko dobara bulayenge? |  | |
| `booking.rate.comment` | Comment (optional) | تبصرہ (اختیاری) | Tabsira (ikhtiyari) |  | |
| `booking.rate.commentHint` | What went well or badly? No phone numbers or links. | کیا اچھا رہا یا کیا برا؟ فون نمبر یا لنک نہ لکھیں۔ | Kya achha raha ya kya bura? Phone number ya link na likhein. |  | |
| `booking.rate.final` | Reviews cannot be changed after you send them. | بھیجنے کے بعد ریویو بدلا نہیں جا سکتا۔ | Bhejne ke baad review badla nahi ja sakta. |  | |
| `booking.rate.check` | Check and send | دیکھ کر بھیجیں | Dekh kar bhejein |  | |
| `booking.rate.chooseStars` | Choose from 1 to 5 stars | 1 سے 5 ستارے چنیں | 1 se 5 sitaaray chunein |  | |
| `booking.rate.confirmTitle` | Send this review? | یہ ریویو بھیجیں؟ | Yeh review bhejein? |  | |
| `booking.rate.confirmText` | Please check your answers. After sending, they cannot be changed. | براہ کرم اپنے جواب دیکھ لیں۔ بھیجنے کے بعد یہ بدلے نہیں جا سکتے۔ | Barah-e-karam apne jawab dekh lein. Bhejne ke baad yeh badlay nahi ja sakte. |  | |
| `booking.rate.hearComment` | Hear my comment | میرا تبصرہ سنیں | Mera tabsira sunein |  | |
| `booking.rate.noComment` | No comment written. | کوئی تبصرہ نہیں لکھا۔ | Koi tabsira nahi likha. |  | |
| `booking.rate.change` | Change something | کچھ بدلیں | Kuch badlein |  | |
| `booking.rate.send` | Send the review | ریویو بھیجیں | Review bhejein |  | |
| `booking.rate.sent` | Thank you. Your review is saved. | شکریہ۔ آپ کا ریویو محفوظ ہو گیا۔ | Shukriya. Aap ka review mehfooz ho gaya. |  | |
| `booking.rate.already` | You already reviewed this work. | آپ اس کام کا ریویو دے چکے ہیں۔ | Aap is kaam ka review de chuke hain. |  | |
| `booking.rate.notNow` | This work cannot be rated now. A review is possible for 14 days after the work is complete. | ابھی اس کام کی ریٹنگ نہیں دی جا سکتی۔ کام مکمل ہونے کے 14 دن تک ریویو دیا جا سکتا ہے۔ | Abhi is kaam ki rating nahi di ja sakti. Kaam mukammal honay ke 14 din tak review diya ja sakta hai. |  | |
| `booking.dialog.cancelConfirm` | Cancel the booking | بکنگ منسوخ کریں | Booking mansookh karein |  | |
| `booking.dialog.keep` | Keep the booking | بکنگ رہنے دیں | Booking rehne dein |  | |

## Notifications (36)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `booking.notify.leadWorker` | Requests, jobs, reviews, and what an admin decided about your identity and proof. Kept for 180 days. | درخواستیں، کام، ریویو، اور آپ کی شناخت اور ثبوت پر ایڈمن کے فیصلے۔ 180 دن تک رکھے جاتے ہیں۔ | Darkhwastein, kaam, reviews, aur aap ki shanakht aur saboot par admin ke faislay. 180 din tak rakhay jatay hain. |  | |
| `booking.notify.leadCustomer` | Answers to your requests, finished work and reviews. Kept for 180 days. | آپ کی درخواستوں کے جواب، مکمل کام اور ریویو۔ 180 دن تک رکھے جاتے ہیں۔ | Aap ki darkhwaston ke jawab, mukammal kaam aur reviews. 180 din tak rakhay jatay hain. |  | |
| `booking.notify.emptyWorker` | New requests and decisions about your proof appear here. | نئی درخواستیں اور آپ کے ثبوت پر فیصلے یہاں نظر آئیں گے۔ | Nayi darkhwastein aur aap ke saboot par faislay yahan nazar aayenge. |  | |
| `booking.notify.emptyCustomer` | When a worker answers your request, you will see it here. | جب کاریگر آپ کی درخواست کا جواب دیں گے تو یہ یہاں نظر آئے گا۔ | Jab karigar aap ki darkhwast ka jawab dein ge to yeh yahan nazar aayega. |  | |
| `booking.notify.booking_requested.title` | New work request: {skill} | نئی درخواست: {skill} | Nayi darkhwast: {skill} |  | |
| `booking.notify.booking_requested.text` | Booking {code}. Open it to accept or decline. | بکنگ {code}۔ قبول یا انکار کے لیے کھولیں۔ | Booking {code}. Qabool ya inkaar ke liye kholein. |  | |
| `booking.notify.booking_accepted.title` | The worker accepted: {skill} | کاریگر نے قبول کر لیا: {skill} | Karigar ne qabool kar liya: {skill} |  | |
| `booking.notify.booking_accepted.text` | Booking {code}. You can now see the phone number. | بکنگ {code}۔ اب آپ فون نمبر دیکھ سکتے ہیں۔ | Booking {code}. Ab aap phone number dekh sakte hain. |  | |
| `booking.notify.booking_declined.title` | The worker said no: {skill} | کاریگر نے انکار کیا: {skill} | Karigar ne inkaar kiya: {skill} |  | |
| `booking.notify.booking_declined.text` | Booking {code}. You can ask another worker. | بکنگ {code}۔ آپ کسی اور کاریگر کو بلا سکتے ہیں۔ | Booking {code}. Aap kisi aur karigar ko bula sakte hain. |  | |
| `booking.notify.booking_expired.title` | No answer to your request: {skill} | آپ کی درخواست کا جواب نہیں آیا: {skill} | Aap ki darkhwast ka jawab nahi aaya: {skill} |  | |
| `booking.notify.booking_expired.text` | Booking {code} was closed after 2 days. You can ask another worker. | بکنگ {code} دو دن بعد بند ہو گئی۔ آپ کسی اور کاریگر کو بلا سکتے ہیں۔ | Booking {code} do din baad band ho gayi. Aap kisi aur karigar ko bula sakte hain. |  | |
| `booking.notify.booking_cancelled.title` | Booking cancelled: {skill} | بکنگ منسوخ: {skill} | Booking mansookh: {skill} |  | |
| `booking.notify.booking_cancelled.text` | Booking {code} was cancelled. | بکنگ {code} منسوخ ہو گئی۔ | Booking {code} mansookh ho gayi. |  | |
| `booking.notify.booking_confirm_request.title` | Please confirm the work is done: {skill} | براہ کرم تصدیق کریں کہ کام ہو گیا: {skill} | Barah-e-karam tasdeeq karein ke kaam ho gaya: {skill} |  | |
| `booking.notify.booking_confirm_request.text` | The other person pressed "Work done" for booking {code}. | دوسرے فریق نے بکنگ {code} کے لیے "کام ہو گیا" دبایا۔ | Doosre fareeq ne booking {code} ke liye "Kaam ho gaya" dabaya. |  | |
| `booking.notify.booking_completed.title` | Work complete: {skill} | کام مکمل: {skill} | Kaam mukammal: {skill} |  | |
| `booking.notify.booking_completed.text` | Booking {code} is complete and counts in your record. | بکنگ {code} مکمل ہو گئی اور آپ کے ریکارڈ میں شامل ہے۔ | Booking {code} mukammal ho gayi aur aap ke record mein shamil hai. |  | |
| `booking.notify.review_requested.title` | Rate this work: {skill} | اس کام کی ریٹنگ دیں: {skill} | Is kaam ki rating dein: {skill} |  | |
| `booking.notify.review_requested.text` | Booking {code} is complete. How was the work? | بکنگ {code} مکمل ہو گئی۔ کام کیسا تھا؟ | Booking {code} mukammal ho gayi. Kaam kaisa tha? |  | |
| `booking.notify.review_reminder.title` | You can still rate the work: {skill} | آپ ابھی بھی ریٹنگ دے سکتے ہیں: {skill} | Aap abhi bhi rating de sakte hain: {skill} |  | |
| `booking.notify.review_reminder.text` | Booking {code}. A review is possible for 14 days. | بکنگ {code}۔ ریویو 14 دن تک دیا جا سکتا ہے۔ | Booking {code}. Review 14 din tak diya ja sakta hai. |  | |
| `booking.notify.review_received.title` | New review: {skill} | نیا ریویو: {skill} | Naya review: {skill} |  | |
| `booking.notify.review_received.text` | A customer gave {count} out of 5 stars (booking {code}). | ایک گاہک نے 5 میں سے {count} ستارے دیے (بکنگ {code})۔ | Aik gaahak ne 5 mein se {count} sitaaray diye (booking {code}). |  | |
| `booking.notify.review_reply.title` | The worker replied to your review | کاریگر نے آپ کے ریویو کا جواب دیا | Karigar ne aap ke review ka jawab diya |  | |
| `booking.notify.review_reply.text` | Booking {code}: {skill}. | بکنگ {code}: {skill}۔ | Booking {code}: {skill}. |  | |
| `booking.notify.review_hidden.title` | An admin hid a review | ایڈمن نے ایک ریویو چھپا دیا | Admin ne aik review chhupa diya |  | |
| `booking.notify.review_hidden.text` | Booking {code}. It is no longer shown and does not count. | بکنگ {code}۔ اب یہ نظر نہیں آئے گا اور نہیں گنا جائے گا۔ | Booking {code}. Ab yeh nazar nahi aayega aur nahi gina jayega. |  | |
| `booking.notify.review_restored.title` | A review is shown again | ریویو دوبارہ نظر آ رہا ہے | Review dobara nazar aa raha hai |  | |
| `booking.notify.review_restored.text` | Booking {code}. An admin restored it, so it counts again. | بکنگ {code}۔ ایڈمن نے اسے بحال کیا، اب یہ پھر گنا جائے گا۔ | Booking {code}. Admin ne isay bahaal kiya, ab yeh phir gina jayega. |  | |
| `booking.notify.no_show_reported.title` | The customer says you did not come: {skill} | گاہک کہتے ہیں آپ نہیں آئے: {skill} | Gaahak kehte hain aap nahi aaye: {skill} |  | |
| `booking.notify.no_show_reported.text` | Booking {code}. Please answer within 3 days. | بکنگ {code}۔ براہ کرم 3 دن میں جواب دیں۔ | Booking {code}. Barah-e-karam 3 din mein jawab dein. |  | |
| `booking.notify.dispute_opened.title` | A dispute was opened: {skill} | ایک تنازع کھولا گیا: {skill} | Aik tanaaza khola gaya: {skill} |  | |
| `booking.notify.dispute_opened.text` | Booking {code}. An admin will decide. | بکنگ {code}۔ ایڈمن فیصلہ کریں گے۔ | Booking {code}. Admin faisla karein ge. |  | |
| `booking.notify.dispute_decided.title` | An admin decided: {skill} | ایڈمن نے فیصلہ کر دیا: {skill} | Admin ne faisla kar diya: {skill} |  | |
| `booking.notify.dispute_decided.text` | Booking {code}. Open it to see the decision. | بکنگ {code}۔ فیصلہ دیکھنے کے لیے کھولیں۔ | Booking {code}. Faisla dekhne ke liye kholein. |  | |

## Help Centre guides (6)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `booking.guides.request.title` | Request a worker and rate the work | کاریگر بلائیں اور کام کی ریٹنگ دیں | Karigar bulayein aur kaam ki rating dein |  | |
| `booking.guides.request.steps` | Open a worker's profile and press "Request this worker".\|Choose the work, the day and the time, write your area, and send.\|When the worker accepts, open the booking to call them.\|After the work, press "Work done", then "Rate this work". A review cannot be changed later. | کسی کاریگر کا پروفائل کھولیں اور "اس کاریگر کو بلائیں" دبائیں۔\|کام، دن اور وقت چنیں، اپنا علاقہ لکھیں اور بھیجیں۔\|کاریگر قبول کریں تو انہیں کال کرنے کے لیے بکنگ کھولیں۔\|کام کے بعد "کام ہو گیا" دبائیں، پھر "اس کام کی ریٹنگ دیں"۔ ریویو بعد میں بدلا نہیں جا سکتا۔ | Kisi karigar ka profile kholein aur "Is karigar ko bulayein" dabayein.\|Kaam, din aur waqt chunein, apna ilaqa likhein aur bhejein.\|Karigar qabool karein to unhein call karne ke liye booking kholein.\|Kaam ke baad "Kaam ho gaya" dabayein, phir "Is kaam ki rating dein". Review baad mein badla nahi ja sakta. |  | |
| `booking.guides.jobs.title` | Answer a request and finish a job | درخواست کا جواب دیں اور کام مکمل کریں | Darkhwast ka jawab dein aur kaam mukammal karein |  | |
| `booking.guides.jobs.steps` | Open "Requests". Press "Hear this request" to listen to it.\|Press Accept or Decline. Saying no never counts against you.\|After you accept, "My jobs" shows the customer's phone number.\|When the work is finished, press "Work done". | "درخواستیں" کھولیں۔ سننے کے لیے "یہ درخواست سنیں" دبائیں۔\|قبول یا انکار دبائیں۔ انکار کبھی آپ کے خلاف نہیں گنا جاتا۔\|قبول کرنے کے بعد "میرے کام" میں گاہک کا فون نمبر نظر آتا ہے۔\|کام ختم ہو جائے تو "کام ہو گیا" دبائیں۔ | "Darkhwastein" kholein. Sunne ke liye "Yeh darkhwast sunein" dabayein.\|Qabool ya inkaar dabayein. Inkaar kabhi aap ke khilaaf nahi gina jata.\|Qabool karne ke baad "Mere kaam" mein gaahak ka phone number nazar aata hai.\|Kaam khatam ho jaye to "Kaam ho gaya" dabayein. |  | |
| `booking.guides.reputation.title` | How your reputation is counted | آپ کی ساکھ کیسے گنی جاتی ہے | Aap ki saakh kaise gini jati hai |  | |
| `booking.guides.reputation.steps` | Only customers who finished a job with you can review you.\|Newer reviews count more; one customer counts less each time.\|Customers who also hired other workers count fully.\|A late cancellation counts double: cancel at least a day before. | صرف وہ گاہک ریویو دے سکتے ہیں جن کے ساتھ آپ کا کام مکمل ہوا۔\|نئے ریویو زیادہ گنے جاتے ہیں؛ ایک ہی گاہک ہر بار کم گنا جاتا ہے۔\|جو گاہک دوسرے کاریگر بھی بلا چکے ہوں وہ پورے گنے جاتے ہیں۔\|دیر سے منسوخی دو گنا گنی جاتی ہے: کم از کم ایک دن پہلے منسوخ کریں۔ | Sirf woh gaahak review de sakte hain jin ke saath aap ka kaam mukammal hua.\|Naye reviews zyada ginay jatay hain; aik hi gaahak har baar kam gina jata hai.\|Jo gaahak doosre karigar bhi bula chuke hon woh poore ginay jatay hain.\|Der se mansookhi do guna gini jati hai: kam az kam aik din pehle mansookh karein. |  | |

## Reputation displays and the worker's reputation page (96)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `reputation.title` | Reputation | ساکھ | Saakh |  | |
| `reputation.depth.none` | New on this platform | اس پلیٹ فارم پر نئے | Is platform par naye |  | |
| `reputation.depth.few` | Few reviews yet | ابھی کم ریویو | Abhi kam reviews |  | |
| `reputation.depth.some` | Some reviews | کچھ ریویو | Kuch reviews |  | |
| `reputation.depth.many` | Many reviews | بہت سے ریویو | Bohat se reviews |  | |
| `reputation.jobs` | one: {count} job / other: {count} jobs | one: {count} کام / other: {count} کام | one: {count} kaam / other: {count} kaam |  | |
| `reputation.averageSpoken` | one: {average} out of 5 stars from {count} review / other: {average} out of 5 stars from {count} reviews | one: {count} ریویو میں 5 میں سے {average} ستارے / other: {count} ریویو میں 5 میں سے {average} ستارے | one: {count} review mein 5 mein se {average} sitaaray / other: {count} reviews mein 5 mein se {average} sitaaray |  | |
| `reputation.outOfFive` | out of 5 | 5 میں سے | 5 mein se |  | |
| `reputation.reviews` | one: {count} review / other: {count} reviews | one: {count} ریویو / other: {count} ریویو | one: {count} review / other: {count} reviews |  | |
| `reputation.distribution` | Stars given | دیے گئے ستارے | Diye gaye sitaaray |  | |
| `reputation.starsLabel` | one: {count} star / other: {count} stars | one: {count} ستارہ / other: {count} ستارے | one: {count} sitaara / other: {count} sitaaray |  | |
| `reputation.starWords.1` | Very poor | بہت برا | Bohat bura |  | |
| `reputation.starWords.2` | Poor | برا | Bura |  | |
| `reputation.starWords.3` | OK | ٹھیک | Theek |  | |
| `reputation.starWords.4` | Good | اچھا | Achha |  | |
| `reputation.starWords.5` | Very good | بہت اچھا | Bohat achha |  | |
| `reputation.quick.onTime` | On time | وقت پر | Waqt par |  | |
| `reputation.quick.workQuality` | Good work | اچھا کام | Achha kaam |  | |
| `reputation.quick.polite` | Polite | اچھا رویہ | Achha rawayya |  | |
| `reputation.quick.priceAsAgreed` | Price as agreed | طے شدہ قیمت | Tay shuda qeemat |  | |
| `reputation.quick.wouldHireAgain` | Would hire again | دوبارہ بلائیں گے | Dobara bulayenge |  | |
| `reputation.percent` | {percent}% | {percent} فیصد | {percent}% |  | |
| `reputation.xOfY` | {yes} of {total} | {total} میں سے {yes} | {total} mein se {yes} |  | |
| `reputation.noAnswers` | no answers yet | ابھی کوئی جواب نہیں | abhi koi jawab nahi |  | |
| `reputation.reliabilityTitle` | Jobs on this platform | اس پلیٹ فارم پر کام | Is platform par kaam |  | |
| `reputation.jobsDone` | one: {count} job done on this platform / other: {count} jobs done on this platform | one: اس پلیٹ فارم پر {count} کام مکمل / other: اس پلیٹ فارم پر {count} کام مکمل | one: Is platform par {count} kaam mukammal / other: Is platform par {count} kaam mukammal |  | |
| `reputation.cancelledByWorker` | one: {count} cancelled by the worker / other: {count} cancelled by the worker | one: {count} کاریگر نے منسوخ کیا / other: {count} کاریگر نے منسوخ کیے | one: {count} karigar ne mansookh kiya / other: {count} karigar ne mansookh kiye |  | |
| `reputation.noShows` | one: {count} no-show / other: {count} no-shows | one: {count} بار غیر حاضر / other: {count} بار غیر حاضر | one: {count} baar ghair haazir / other: {count} baar ghair haazir |  | |
| `reputation.hiredAgainBy` | one: Hired again by {count} customer / other: Hired again by {count} customers | one: {count} گاہک نے دوبارہ بلایا / other: {count} گاہکوں نے دوبارہ بلایا | one: {count} gaahak ne dobara bulaya / other: {count} gaahakon ne dobara bulaya |  | |
| `reputation.reviewsTitle` | Reviews | ریویو | Reviews |  | |
| `reputation.noReviews` | No reviews yet | ابھی کوئی ریویو نہیں | Abhi koi review nahi |  | |
| `reputation.noReviewsText` | Only customers who finished a job with this worker can write a review. | صرف وہ گاہک ریویو لکھ سکتے ہیں جن کا اس کاریگر کے ساتھ کام مکمل ہوا ہو۔ | Sirf woh gaahak review likh sakte hain jin ka is karigar ke saath kaam mukammal hua ho. |  | |
| `reputation.reviewPages` | Review pages | ریویو کے صفحات | Review ke safhaat |  | |
| `reputation.workerReply` | The worker's reply | کاریگر کا جواب | Karigar ka jawab |  | |
| `reputation.thumb.yes` | Yes | ہاں | Haan |  | |
| `reputation.thumb.no` | No | نہیں | Nahi |  | |
| `reputation.thumb.skip` | Skip | چھوڑیں | Chhorein |  | |
| `reputation.historyTitle` | Verified work history | تصدیق شدہ کام | Tasdeeq shuda kaam |  | |
| `reputation.historyLabel` | Done through this platform | اس پلیٹ فارم کے ذریعے کیا گیا | Is platform ke zariye kiya gaya |  | |
| `reputation.historyEmpty` | No jobs through this platform yet. | ابھی اس پلیٹ فارم کے ذریعے کوئی کام نہیں ہوا۔ | Abhi is platform ke zariye koi kaam nahi hua. |  | |
| `reputation.historyMore` | one: and {count} more / other: and {count} more | one: اور {count} مزید / other: اور {count} مزید | one: aur {count} mazeed / other: aur {count} mazeed |  | |
| `reputation.notRated` | Not rated | ریٹنگ نہیں دی | Rating nahi di |  | |
| `reputation.selfDeclared` | Written by the worker (not checked by this platform). | کاریگر کا اپنا لکھا ہوا (اس پلیٹ فارم نے جانچا نہیں)۔ | Karigar ka apna likha hua (is platform ne jaancha nahi). |  | |
| `reputation.sortTrack` | Best track record | بہترین ریکارڈ | Behtareen record |  | |
| `reputation.sortTrackNote` | New workers appear lower in this order. Choose "Recently updated" to see them. | اس ترتیب میں نئے کاریگر نیچے نظر آتے ہیں۔ انہیں دیکھنے کے لیے "حال ہی میں اپ ڈیٹ ہوئے" چنیں۔ | Is tarteeb mein naye karigar neeche nazar aatay hain. Unhein dekhne ke liye "Haal hi mein update hue" chunein. |  | |
| `reputation.hasJobs` | Has done jobs on this platform | اس پلیٹ فارم پر کام کر چکے | Is platform par kaam kar chuke |  | |
| `reputation.hasJobsHint` | Only workers with at least one finished booking | صرف وہ کاریگر جن کی کم از کم ایک بکنگ مکمل ہو چکی ہو | Sirf woh karigar jin ki kam az kam aik booking mukammal ho chuki ho |  | |
| `reputation.reason.counted_fully` | Counted fully. | پورا گنا گیا۔ | Poora gina gaya. |  | |
| `reputation.reason.weeks_old` | Counted almost fully: it is a few weeks old. | تقریباً پورا گنا گیا: چند ہفتے پرانا ہے۔ | Taqreeban poora gina gaya: chand haftay purana hai. |  | |
| `reputation.reason.months_old` | Counted a little less: it is some months old. | تھوڑا کم گنا گیا: چند مہینے پرانا ہے۔ | Thora kam gina gaya: chand maheenay purana hai. |  | |
| `reputation.reason.older_than_a_year` | Counted less: it is more than a year old. | کم گنا گیا: ایک سال سے زیادہ پرانا ہے۔ | Kam gina gaya: aik saal se zyada purana hai. |  | |
| `reputation.reason.auto_completed` | Counted less: only one side confirmed the work. | کم گنا گیا: کام کی تصدیق صرف ایک طرف سے ہوئی۔ | Kam gina gaya: kaam ki tasdeeq sirf aik taraf se hui. |  | |
| `reputation.reason.new_reviewer` | Counted less: this customer has not hired other workers here yet. | کم گنا گیا: اس گاہک نے یہاں ابھی دوسرے کاریگر نہیں بلائے۔ | Kam gina gaya: is gaahak ne yahan abhi doosre karigar nahi bulaye. |  | |
| `reputation.reason.repeat_reviewer` | Counted less: the same customer reviewed you before. | کم گنا گیا: یہی گاہک پہلے بھی ریویو دے چکے ہیں۔ | Kam gina gaya: yehi gaahak pehle bhi review de chuke hain. |  | |
| `reputation.mine.title` | My reputation | میری ساکھ | Meri saakh |  | |
| `reputation.mine.lead` | How customers see your work, and how it is counted. Only you see the numbers. | گاہک آپ کا کام کیسے دیکھتے ہیں اور یہ کیسے گنا جاتا ہے۔ نمبر صرف آپ دیکھ سکتے ہیں۔ | Gaahak aap ka kaam kaise dekhte hain aur yeh kaise gina jata hai. Number sirf aap dekh sakte hain. |  | |
| `reputation.mine.summaryTitle` | Summary | خلاصہ | Khulasa |  | |
| `reputation.mine.summary` | Customers gave you {average} out of 5 stars in {count} reviews, and you finished {jobs} jobs here. {depth}. | گاہکوں نے {count} ریویو میں آپ کو 5 میں سے {average} ستارے دیے، اور آپ نے یہاں {jobs} کام مکمل کیے۔ {depth}۔ | Gaahakon ne {count} reviews mein aap ko 5 mein se {average} sitaaray diye, aur aap ne yahan {jobs} kaam mukammal kiye. {depth}. |  | |
| `reputation.mine.summaryNone` | You have no reviews yet. You finished {jobs} jobs here. After a finished job, the customer can rate your work. | ابھی آپ کا کوئی ریویو نہیں۔ آپ نے یہاں {jobs} کام مکمل کیے۔ کام مکمل ہونے کے بعد گاہک آپ کے کام کی ریٹنگ دے سکتے ہیں۔ | Abhi aap ka koi review nahi. Aap ne yahan {jobs} kaam mukammal kiye. Kaam mukammal honay ke baad gaahak aap ke kaam ki rating de sakte hain. |  | |
| `reputation.mine.rulesTitle` | How your reputation is counted | آپ کی ساکھ کیسے گنی جاتی ہے | Aap ki saakh kaise gini jati hai |  | |
| `reputation.mine.rules.onlyCustomers.title` | Only real customers | صرف اصل گاہک | Sirf asal gaahak |  | |
| `reputation.mine.rules.onlyCustomers.text` | Only a customer who finished a job with you can review you. Both of you confirm the job. | صرف وہ گاہک ریویو دے سکتے ہیں جن کے ساتھ آپ کا کام مکمل ہوا۔ دونوں کام کی تصدیق کرتے ہیں۔ | Sirf woh gaahak review de sakte hain jin ke saath aap ka kaam mukammal hua. Dono kaam ki tasdeeq karte hain. |  | |
| `reputation.mine.rules.newerCount.title` | Newer reviews count more | نئے ریویو زیادہ گنے جاتے ہیں | Naye reviews zyada ginay jatay hain |  | |
| `reputation.mine.rules.newerCount.text` | After one year a review counts half, because work can get better or worse. | ایک سال بعد ریویو آدھا گنا جاتا ہے، کیونکہ کام بہتر یا خراب ہو سکتا ہے۔ | Aik saal baad review aadha gina jata hai, kyunke kaam behtar ya kharab ho sakta hai. |  | |
| `reputation.mine.rules.sameCustomer.title` | One customer, less each time | ایک ہی گاہک، ہر بار کم | Aik hi gaahak, har baar kam |  | |
| `reputation.mine.rules.sameCustomer.text` | Many reviews from the same customer count less each time. Ten reviews from one friend are not ten opinions. | ایک ہی گاہک کے کئی ریویو ہر بار کم گنے جاتے ہیں۔ ایک دوست کے دس ریویو دس رائے نہیں۔ | Aik hi gaahak ke kai reviews har baar kam ginay jatay hain. Aik dost ke das reviews das raye nahi. |  | |
| `reputation.mine.rules.hiredOthers.title` | Experienced customers count fully | تجربہ کار گاہک پورے گنے جاتے ہیں | Tajurba kaar gaahak poore ginay jatay hain |  | |
| `reputation.mine.rules.hiredOthers.text` | A review counts fully when the customer has also hired other workers here. A new account counts half. | جب گاہک یہاں دوسرے کاریگر بھی بلا چکے ہوں تو ریویو پورا گنا جاتا ہے۔ نیا اکاؤنٹ آدھا گنا جاتا ہے۔ | Jab gaahak yahan doosre karigar bhi bula chuke hon to review poora gina jata hai. Naya account aadha gina jata hai. |  | |
| `reputation.mine.numbersTitle` | Your numbers | آپ کے نمبر | Aap ke number |  | |
| `reputation.mine.expected` | Reputation score: {value} out of 1 (the middle estimate from your counted reviews). | ساکھ کا اسکور: 1 میں سے {value} (گنے گئے ریویو سے درمیانہ اندازہ)۔ | Saakh ka score: 1 mein se {value} (ginay gaye reviews se darmiyana andaza). |  | |
| `reputation.mine.cautious` | Careful score: {value} out of 1. We are about 90% sure your true score is at least this. "Best track record" orders by this score. | محتاط اسکور: 1 میں سے {value}۔ ہمیں تقریباً 90 فیصد یقین ہے کہ آپ کا اصل اسکور کم از کم اتنا ہے۔ "بہترین ریکارڈ" کی ترتیب یہی اسکور استعمال کرتی ہے۔ | Mohtaat score: 1 mein se {value}. Hamein taqreeban 90 feesad yaqeen hai ke aap ka asal score kam az kam itna hai. "Behtareen record" ki tarteeb yehi score istemaal karti hai. |  | |
| `reputation.mine.reliability` | Reliability: {value} out of 1 (from finished jobs, cancellations and no-shows). | بھروسے کا اسکور: 1 میں سے {value} (مکمل کام، منسوخیوں اور غیر حاضری سے)۔ | Bharosay ka score: 1 mein se {value} (mukammal kaam, mansookhiyon aur ghair haazri se). |  | |
| `reputation.mine.numbersNote` | Customers never see these numbers. They see your stars, the number of reviews and your job counts. | گاہک یہ نمبر کبھی نہیں دیکھتے۔ وہ آپ کے ستارے، ریویو کی تعداد اور کاموں کی گنتی دیکھتے ہیں۔ | Gaahak yeh number kabhi nahi dekhte. Woh aap ke sitaaray, reviews ki tadaad aur kaamon ki ginti dekhte hain. |  | |
| `reputation.mine.perReviewTitle` | How each review was counted | ہر ریویو کیسے گنا گیا | Har review kaise gina gaya |  | |
| `reputation.mine.weight` | Counts as {value} of a full review. | ایک پورے ریویو کا {value} حصہ گنا گیا۔ | Aik poore review ka {value} hissa gina gaya. |  | |
| `reputation.mine.hidden` | one: {count} review is hidden by an admin and does not count. / other: {count} reviews are hidden by an admin and do not count. | one: {count} ریویو ایڈمن نے چھپایا ہے اور نہیں گنا جاتا۔ / other: {count} ریویو ایڈمن نے چھپائے ہیں اور نہیں گنے جاتے۔ | one: {count} review admin ne chhupaya hai aur nahi gina jata. / other: {count} reviews admin ne chhupaye hain aur nahi ginay jatay. |  | |
| `reputation.mine.tipsTitle` | Tips | مشورے | Mashwaray |  | |
| `reputation.mine.tips.cancelEarly` | If you must cancel, cancel at least {hours} hours before: a late cancellation counts double. | اگر منسوخ کرنا ہو تو کم از کم {hours} گھنٹے پہلے کریں: دیر سے منسوخی دو گنا گنی جاتی ہے۔ | Agar mansookh karna ho to kam az kam {hours} ghantay pehle karein: der se mansookhi do guna gini jati hai. |  | |
| `reputation.mine.tips.decline` | Saying no to a request never counts against you. | درخواست پر انکار کبھی آپ کے خلاف نہیں گنا جاتا۔ | Darkhwast par inkaar kabhi aap ke khilaaf nahi gina jata. |  | |
| `reputation.mine.tips.workDone` | Press "Work done" when you finish, so the job counts fully. | کام ختم ہوتے ہی "کام ہو گیا" دبائیں تاکہ کام پورا گنا جائے۔ | Kaam khatam hotay hi "Kaam ho gaya" dabayein taake kaam poora gina jaye. |  | |
| `reputation.mine.tips.dispute` | If a cancellation or a no-show was not your fault, you can tell an admin within {days} days. | اگر منسوخی یا غیر حاضری آپ کی غلطی نہیں تھی تو {days} دن کے اندر ایڈمن کو بتا سکتے ہیں۔ | Agar mansookhi ya ghair haazri aap ki ghalati nahi thi to {days} din ke andar admin ko bata sakte hain. |  | |
| `reputation.mine.cancellationsTitle` | My cancellations and no-shows | میری منسوخیاں اور غیر حاضریاں | Meri mansookhiyan aur ghair haazriyan |  | |
| `reputation.mine.noCancellations` | None. Well done. | کوئی نہیں۔ شاباش۔ | Koi nahi. Shabash. |  | |
| `reputation.mine.reviewsTitle` | My reviews | میرے ریویو | Mere reviews |  | |
| `reputation.mine.reviewsLead` | What customers wrote after finished jobs. You can reply once to each review. | مکمل کاموں کے بعد گاہکوں نے کیا لکھا۔ آپ ہر ریویو کا ایک بار جواب دے سکتے ہیں۔ | Mukammal kaamon ke baad gaahakon ne kya likha. Aap har review ka aik baar jawab de sakte hain. |  | |
| `reputation.mine.hear` | {reviewer} gave {count} out of 5 stars. {comment} | {reviewer} نے 5 میں سے {count} ستارے دیے۔ {comment} | {reviewer} ne 5 mein se {count} sitaaray diye. {comment} |  | |
| `reputation.mine.hearName` | Review from {reviewer} | {reviewer} کا ریویو | {reviewer} ka review |  | |
| `reputation.mine.reply` | Reply | جواب دیں | Jawab dein |  | |
| `reputation.mine.replyLabel` | Your reply | آپ کا جواب | Aap ka jawab |  | |
| `reputation.mine.replyFinal` | You can reply only once, and the reply cannot be changed. | آپ صرف ایک بار جواب دے سکتے ہیں اور جواب بدلا نہیں جا سکتا۔ | Aap sirf aik baar jawab de sakte hain aur jawab badla nahi ja sakta. |  | |
| `reputation.mine.sendReply` | Send the reply | جواب بھیجیں | Jawab bhejein |  | |
| `reputation.mine.replied` | Reply saved | جواب محفوظ ہو گیا | Jawab mehfooz ho gaya |  | |
| `reputation.mine.report` | Report | شکایت کریں | Shikayat karein |  | |
| `reputation.mine.reportTitle` | Report this review? | اس ریویو کی شکایت کریں؟ | Is review ki shikayat karein? |  | |
| `reputation.mine.reportText` | An admin will look at it. Reporting does not hide the review. A negative review is not a reason. | ایڈمن اسے دیکھیں گے۔ شکایت سے ریویو چھپتا نہیں۔ برا ریویو ہونا کوئی وجہ نہیں۔ | Admin isay dekhein ge. Shikayat se review chhupta nahi. Bura review hona koi wajah nahi. |  | |
| `reputation.mine.reported` | Reported. An admin will look at it. | شکایت بھیج دی گئی۔ ایڈمن اسے دیکھیں گے۔ | Shikayat bhej di gayi. Admin isay dekhein ge. |  | |

## Admin screens (no audio) (152)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `adminm4.synthetic` | Synthetic demo data | مصنوعی ڈیمو ڈیٹا | Masnooi demo data |  | |
| `adminm4.templateKinds.dispute_decision` | Dispute decision | تنازع کا فیصلہ | Tanaaza ka faisla |  | |
| `adminm4.templateKinds.review_hide` | Hiding a review | ریویو چھپانا | Review chhupana |  | |
| `adminm4.bookings.title` | Bookings | بکنگز | Bookings |  | |
| `adminm4.bookings.lead` | Every booking with its timeline. Phone numbers are never shown here. | ہر بکنگ اپنی ٹائم لائن کے ساتھ۔ فون نمبر یہاں کبھی نہیں دکھائے جاتے۔ | Har booking apni timeline ke saath. Phone number yahan kabhi nahi dikhaye jatay. |  | |
| `adminm4.bookings.one` | Booking | بکنگ | Booking |  | |
| `adminm4.bookings.all` | All | سب | Sab |  | |
| `adminm4.bookings.state` | State | حالت | Haalat |  | |
| `adminm4.bookings.search` | Booking number, worker ID or name | بکنگ نمبر، کاریگر آئی ڈی یا نام | Booking number, karigar ID ya naam |  | |
| `adminm4.bookings.worker` | Worker | کاریگر | Karigar |  | |
| `adminm4.bookings.customer` | Customer | گاہک | Gaahak |  | |
| `adminm4.bookings.when` | Start | شروع | Shuru |  | |
| `adminm4.bookings.created` | Requested on | درخواست کی تاریخ | Darkhwast ki tareekh |  | |
| `adminm4.bookings.count` | one: {count} booking / other: {count} bookings | one: {count} بکنگ / other: {count} بکنگز | one: {count} booking / other: {count} bookings |  | |
| `adminm4.bookings.open` | Open booking {code} | بکنگ {code} کھولیں | Booking {code} kholein |  | |
| `adminm4.bookings.empty` | No bookings | کوئی بکنگ نہیں | Koi booking nahi |  | |
| `adminm4.bookings.emptyText` | Nothing matches these filters. | ان فلٹرز سے کچھ نہیں ملا۔ | In filters se kuch nahi mila. |  | |
| `adminm4.bookings.reviewVisible` | The review is visible. | ریویو نظر آ رہا ہے۔ | Review nazar aa raha hai. |  | |
| `adminm4.disputes.title` | Disputes | تنازعات | Tanaazaat |  | |
| `adminm4.disputes.lead` | Oldest first. Read both sides and the timeline, choose a decision and write a note. Both people are told. | پرانے پہلے۔ دونوں فریقوں اور ٹائم لائن کو پڑھیں، فیصلہ چنیں اور نوٹ لکھیں۔ دونوں کو بتا دیا جاتا ہے۔ | Puranay pehle. Dono fareeqon aur timeline ko parhein, faisla chunein aur note likhein. Dono ko bata diya jata hai. |  | |
| `adminm4.disputes.show` | Show | دکھائیں | Dikhayein |  | |
| `adminm4.disputes.filter.open` | Open | کھلے | Khulay |  | |
| `adminm4.disputes.filter.decided` | Decided | فیصلہ شدہ | Faisla shuda |  | |
| `adminm4.disputes.filter.all` | All | سب | Sab |  | |
| `adminm4.disputes.type` | Question | سوال | Sawal |  | |
| `adminm4.disputes.people` | Worker and customer | کاریگر اور گاہک | Karigar aur gaahak |  | |
| `adminm4.disputes.openedBy` | Opened by {who} | {who} نے کھولا | {who} ne khola |  | |
| `adminm4.disputes.noNote` | No note was written. | کوئی نوٹ نہیں لکھا گیا۔ | Koi note nahi likha gaya. |  | |
| `adminm4.disputes.decide` | Decision | فیصلہ | Faisla |  | |
| `adminm4.disputes.decision` | What happened? | کیا ہوا؟ | Kya hua? |  | |
| `adminm4.disputes.note` | Note for the record (required) | ریکارڈ کے لیے نوٹ (ضروری) | Record ke liye note (zaroori) |  | |
| `adminm4.disputes.noteHint` | How you checked it, for example "both called". No CNIC numbers: the note is in the audit log. | آپ نے کیسے جانچا، جیسے "دونوں کو فون کیا"۔ شناختی نمبر نہ لکھیں: نوٹ آڈٹ لاگ میں جاتا ہے۔ | Aap ne kaise jaancha, jaise "dono ko phone kiya". Shanakhti number na likhein: note audit log mein jata hai. |  | |
| `adminm4.disputes.save` | Save the decision | فیصلہ محفوظ کریں | Faisla mehfooz karein |  | |
| `adminm4.disputes.saved` | Decision saved | فیصلہ محفوظ ہو گیا | Faisla mehfooz ho gaya |  | |
| `adminm4.disputes.chooseDecision` | Choose a decision | فیصلہ چنیں | Faisla chunein |  | |
| `adminm4.disputes.needNote` | Write a note of at least 5 characters | کم از کم 5 حروف کا نوٹ لکھیں | Kam az kam 5 huroof ka note likhein |  | |
| `adminm4.disputes.alreadyDecided` | This dispute is already decided. | اس تنازع کا فیصلہ ہو چکا ہے۔ | Is tanaaza ka faisla ho chuka hai. |  | |
| `adminm4.disputes.empty` | No disputes here | یہاں کوئی تنازع نہیں | Yahan koi tanaaza nahi |  | |
| `adminm4.disputes.emptyText` | When someone says the work was not done, a worker did not come or a cancellation was not their fault, it appears here. | جب کوئی کہے کہ کام نہیں ہوا، کاریگر نہیں آیا یا منسوخی ان کی غلطی نہیں تھی، تو وہ یہاں نظر آئے گا۔ | Jab koi kahe ke kaam nahi hua, karigar nahi aaya ya mansookhi un ki ghalati nahi thi, to woh yahan nazar aayega. |  | |
| `adminm4.disputes.effect.work_done` | The booking becomes completed (by an admin). | بکنگ مکمل مانی جائے گی (ایڈمن کے فیصلے سے)۔ | Booking mukammal mani jayegi (admin ke faislay se). |  | |
| `adminm4.disputes.effect.not_done_worker_fault` | Counts as a no-show in the worker's reliability. | کاریگر کے بھروسے کے ریکارڈ میں غیر حاضری گنی جائے گی۔ | Karigar ke bharosay ke record mein ghair haazri gini jayegi. |  | |
| `adminm4.disputes.effect.not_done_no_fault` | Closed; counts for nobody. | بند؛ کسی کے خلاف نہیں گنا جائے گا۔ | Band; kisi ke khilaaf nahi gina jayega. |  | |
| `adminm4.disputes.effect.no_show_confirmed` | Counts as a no-show in the worker's reliability. | کاریگر کے بھروسے کے ریکارڈ میں غیر حاضری گنی جائے گی۔ | Karigar ke bharosay ke record mein ghair haazri gini jayegi. |  | |
| `adminm4.disputes.effect.no_show_rejected` | Closed; the no-show is removed and counts for nobody. | بند؛ غیر حاضری ہٹا دی جائے گی اور کسی کے خلاف نہیں گنی جائے گی۔ | Band; ghair haazri hata di jayegi aur kisi ke khilaaf nahi gini jayegi. |  | |
| `adminm4.disputes.effect.worker_fault` | The cancellation keeps counting against the worker. | منسوخی کاریگر کے خلاف گنی جاتی رہے گی۔ | Mansookhi karigar ke khilaaf gini jati rahegi. |  | |
| `adminm4.disputes.effect.no_fault` | The cancellation no longer counts against the worker. | منسوخی اب کاریگر کے خلاف نہیں گنی جائے گی۔ | Mansookhi ab karigar ke khilaaf nahi gini jayegi. |  | |
| `adminm4.reviews.title` | Reviews | ریویو | Reviews |  | |
| `adminm4.reviews.lead` | Reported reviews first. Hide only abusive, personal, unrelated or fake reviews. Being negative is never a reason to hide a review. | شکایت والے ریویو پہلے۔ صرف بدتمیزی، ذاتی معلومات، غیر متعلق یا جعلی ریویو چھپائیں۔ منفی ہونا کبھی ریویو چھپانے کی وجہ نہیں۔ | Shikayat walay reviews pehle. Sirf badtameezi, zaati maloomat, ghair mutalliq ya jaali reviews chhupayein. Manfi hona kabhi review chhupane ki wajah nahi. |  | |
| `adminm4.reviews.show` | Show | دکھائیں | Dikhayein |  | |
| `adminm4.reviews.reports` | Reports | شکایات | Shikayaat |  | |
| `adminm4.reviews.filter.all` | All reviews | تمام ریویو | Tamam reviews |  | |
| `adminm4.reviews.filter.visible` | Visible | نظر آنے والے | Nazar aane walay |  | |
| `adminm4.reviews.filter.hidden` | Hidden | چھپائے گئے | Chhupaye gaye |  | |
| `adminm4.reviews.filter.any` | With or without a report | شکایت ہو یا نہ ہو | Shikayat ho ya na ho |  | |
| `adminm4.reviews.filter.reported` | Reported by the worker | کاریگر کی شکایت والے | Karigar ki shikayat walay |  | |
| `adminm4.reviews.filter.notReported` | Not reported | بغیر شکایت | Baghair shikayat |  | |
| `adminm4.reviews.status.visible` | Visible | نظر آ رہا ہے | Nazar aa raha hai |  | |
| `adminm4.reviews.status.hidden` | Hidden | چھپا ہوا | Chhupa hua |  | |
| `adminm4.reviews.reportedBadge` | Reported | شکایت ہوئی | Shikayat hui |  | |
| `adminm4.reviews.by` | by {name} | از {name} | az {name} |  | |
| `adminm4.reviews.noComment` | No comment. | کوئی تبصرہ نہیں۔ | Koi tabsira nahi. |  | |
| `adminm4.reviews.hiddenBecause` | Hidden because: {reason} | چھپانے کی وجہ: {reason} | Chhupane ki wajah: {reason} |  | |
| `adminm4.reviews.hide` | Hide | چھپائیں | Chhupayein |  | |
| `adminm4.reviews.restore` | Restore | بحال کریں | Bahaal karein |  | |
| `adminm4.reviews.hideTitle` | Hide this review? | یہ ریویو چھپائیں؟ | Yeh review chhupayein? |  | |
| `adminm4.reviews.restoreTitle` | Show this review again? | یہ ریویو دوبارہ دکھائیں؟ | Yeh review dobara dikhayein? |  | |
| `adminm4.reviews.neverNegative` | A negative review is never a reason to hide it. Hide only for one of the reasons below. | منفی ریویو کبھی چھپانے کی وجہ نہیں۔ صرف نیچے دی گئی کسی وجہ سے چھپائیں۔ | Manfi review kabhi chhupane ki wajah nahi. Sirf neeche di gayi kisi wajah se chhupayein. |  | |
| `adminm4.reviews.reason` | Reason | وجہ | Wajah |  | |
| `adminm4.reviews.reasons.abusive_language` | Abusive language | بدزبانی | Badzabani |  | |
| `adminm4.reviews.reasons.personal_information` | Personal information | ذاتی معلومات | Zaati maloomat |  | |
| `adminm4.reviews.reasons.unrelated` | Not about this work | اس کام کے بارے میں نہیں | Is kaam ke baare mein nahi |  | |
| `adminm4.reviews.reasons.fake_or_manipulated` | Fake or manipulated | جعلی یا ہیرا پھیری | Jaali ya hera pheri |  | |
| `adminm4.reviews.reasons.other` | Other (write why) | کوئی اور (وجہ لکھیں) | Koi aur (wajah likhein) |  | |
| `adminm4.reviews.noteOptional` | Note (optional; required for "Other") | نوٹ (اختیاری؛ "کوئی اور" کے لیے ضروری) | Note (ikhtiyari; "Koi aur" ke liye zaroori) |  | |
| `adminm4.reviews.noteRequired` | Why is it shown again? (required) | دوبارہ کیوں دکھایا جا رہا ہے؟ (ضروری) | Dobara kyun dikhaya ja raha hai? (zaroori) |  | |
| `adminm4.reviews.chooseReason` | Choose a reason | وجہ چنیں | Wajah chunein |  | |
| `adminm4.reviews.needNote` | Write a reason of at least 5 characters | کم از کم 5 حروف کی وجہ لکھیں | Kam az kam 5 huroof ki wajah likhein |  | |
| `adminm4.reviews.hidden` | Review hidden. Both people were told. | ریویو چھپا دیا گیا۔ دونوں کو بتا دیا گیا۔ | Review chhupa diya gaya. Dono ko bata diya gaya. |  | |
| `adminm4.reviews.restored` | Review shown again. Both people were told. | ریویو دوبارہ دکھایا گیا۔ دونوں کو بتا دیا گیا۔ | Review dobara dikhaya gaya. Dono ko bata diya gaya. |  | |
| `adminm4.reviews.count` | one: {count} review / other: {count} reviews | one: {count} ریویو / other: {count} ریویو | one: {count} review / other: {count} reviews |  | |
| `adminm4.reviews.empty` | No reviews here | یہاں کوئی ریویو نہیں | Yahan koi review nahi |  | |
| `adminm4.reviews.emptyText` | Nothing matches these filters. | ان فلٹرز سے کچھ نہیں ملا۔ | In filters se kuch nahi mila. |  | |
| `adminm4.flags.title` | Reputation flags | ساکھ کے انتباہ | Saakh ke intebah |  | |
| `adminm4.flags.lead` | Patterns found by fixed rules. A flag never changes a score by itself: you decide. | مقررہ اصولوں سے ملنے والے انداز۔ انتباہ خود کسی اسکور کو نہیں بدلتا: فیصلہ آپ کرتے ہیں۔ | Muqarrara usoolon se milne walay andaaz. Intebah khud kisi score ko nahi badalta: faisla aap karte hain. |  | |
| `adminm4.flags.show` | Show | دکھائیں | Dikhayein |  | |
| `adminm4.flags.status.open` | Open | کھلے | Khulay |  | |
| `adminm4.flags.status.dismissed` | Dismissed | رد شدہ | Radd shuda |  | |
| `adminm4.flags.status.actioned` | Reviews hidden | ریویو چھپائے گئے | Reviews chhupaye gaye |  | |
| `adminm4.flags.status.all` | All | سب | Sab |  | |
| `adminm4.flags.type.new_account_praise` | Praise from new accounts | نئے اکاؤنٹس سے تعریف | Naye accounts se tareef |  | |
| `adminm4.flags.type.repeat_pair_burst` | Many jobs from one customer | ایک گاہک کے بہت سے کام | Aik gaahak ke bohat se kaam |  | |
| `adminm4.flags.explain.new_account_praise` | Within 14 days, 3 or more good reviews came from accounts less than 14 days old that have hired no other worker. | 14 دن میں 3 یا زیادہ اچھے ریویو ایسے اکاؤنٹس سے آئے جو 14 دن سے کم پرانے ہیں اور کسی اور کاریگر کو نہیں بلایا۔ | 14 din mein 3 ya zyada achhay reviews aise accounts se aaye jo 14 din se kam puranay hain aur kisi aur karigar ko nahi bulaya. |  | |
| `adminm4.flags.explain.repeat_pair_burst` | One customer completed 3 or more bookings with this worker within 30 days. | ایک گاہک نے 30 دن میں اس کاریگر کے ساتھ 3 یا زیادہ بکنگز مکمل کیں۔ | Aik gaahak ne 30 din mein is karigar ke saath 3 ya zyada bookings mukammal kin. |  | |
| `adminm4.flags.bookings` | Bookings | بکنگز | Bookings |  | |
| `adminm4.flags.decisionNote` | Decision note | فیصلے کا نوٹ | Faislay ka note |  | |
| `adminm4.flags.dismiss` | Dismiss | رد کریں | Radd karein |  | |
| `adminm4.flags.hide` | Hide the listed reviews | یہ ریویو چھپائیں | Yeh reviews chhupayein |  | |
| `adminm4.flags.dismissTitle` | Dismiss this flag? | یہ انتباہ رد کریں؟ | Yeh intebah radd karein? |  | |
| `adminm4.flags.hideTitle` | Hide the listed reviews? | یہ ریویو چھپائیں؟ | Yeh reviews chhupayein? |  | |
| `adminm4.flags.dismissText` | Nothing changes. Write how you checked that the pattern is innocent. | کچھ نہیں بدلے گا۔ لکھیں کہ آپ نے کیسے جانچا کہ یہ انداز بے قصور ہے۔ | Kuch nahi badlay ga. Likhein ke aap ne kaise jaancha ke yeh andaaz be-qusoor hai. |  | |
| `adminm4.flags.hideText` | The listed reviews are hidden as fake or manipulated. They leave the profile and every score. Both people are told. | یہ ریویو جعلی یا ہیرا پھیری کے طور پر چھپا دیے جائیں گے۔ یہ پروفائل اور ہر اسکور سے نکل جائیں گے۔ دونوں کو بتا دیا جائے گا۔ | Yeh reviews jaali ya hera pheri ke taur par chhupa diye jayenge. Yeh profile aur har score se nikal jayenge. Dono ko bata diya jayega. |  | |
| `adminm4.flags.note` | Note for the record (required) | ریکارڈ کے لیے نوٹ (ضروری) | Record ke liye note (zaroori) |  | |
| `adminm4.flags.needNote` | Write a note of at least 5 characters | کم از کم 5 حروف کا نوٹ لکھیں | Kam az kam 5 huroof ka note likhein |  | |
| `adminm4.flags.dismissed` | Flag dismissed | انتباہ رد کر دیا گیا | Intebah radd kar diya gaya |  | |
| `adminm4.flags.actioned` | one: {count} review hidden / other: {count} reviews hidden | one: {count} ریویو چھپایا گیا / other: {count} ریویو چھپائے گئے | one: {count} review chhupaya gaya / other: {count} reviews chhupaye gaye |  | |
| `adminm4.flags.empty` | No flags here | یہاں کوئی انتباہ نہیں | Yahan koi intebah nahi |  | |
| `adminm4.flags.emptyText` | The pattern check runs after every new review and every completed booking. | یہ جانچ ہر نئے ریویو اور ہر مکمل بکنگ کے بعد چلتی ہے۔ | Yeh jaanch har naye review aur har mukammal booking ke baad chalti hai. |  | |
| `adminm4.breakdown.tabs` | Worker details | کاریگر کی تفصیل | Karigar ki tafseel |  | |
| `adminm4.breakdown.expected` | Expected (reputation) | متوقع (ساکھ) | Mutawaqqa (saakh) |  | |
| `adminm4.breakdown.cautious` | Cautious score (orders "Best track record") | محتاط اسکور ("بہترین ریکارڈ" کی ترتیب) | Mohtaat score ("Behtareen record" ki tarteeb) |  | |
| `adminm4.breakdown.uncertainty` | Uncertainty and depth | غیر یقینی اور گہرائی | Ghair yaqeeni aur gehrai |  | |
| `adminm4.breakdown.reliability` | Reliability | بھروسا | Bharosa |  | |
| `adminm4.breakdown.reliabilityCounts` | {completed} done, {early} early and {late} late cancellations, {noShows} no-shows | {completed} مکمل، {early} پہلے سے اور {late} دیر سے منسوخیاں، {noShows} غیر حاضریاں | {completed} mukammal, {early} pehle se aur {late} der se mansookhiyan, {noShows} ghair haazriyan |  | |
| `adminm4.breakdown.stored` | Stored snapshot | محفوظ سنیپ شاٹ | Mehfooz snapshot |  | |
| `adminm4.breakdown.storedAt` | {date}, engine {version}, parameters {hash} | {date}، انجن {version}، پیرامیٹرز {hash} | {date}, engine {version}, parameters {hash} |  | |
| `adminm4.breakdown.noSnapshot` | None yet (new on this platform) | ابھی نہیں (اس پلیٹ فارم پر نئے) | Abhi nahi (is platform par naye) |  | |
| `adminm4.breakdown.bookings` | Bookings by state | حالت کے لحاظ سے بکنگز | Haalat ke lihaaz se bookings |  | |
| `adminm4.breakdown.method` | Weight = provenance × recency × reviewer trust × pair factor (docs/modules/MODULE-4.md). The numbers above are computed now from the stored reviews and bookings. | وزن = تصدیق × تازگی × ریویو دینے والے کا اعتماد × جوڑی عامل (docs/modules/MODULE-4.md)۔ اوپر کے نمبر ابھی محفوظ ریویو اور بکنگز سے نکالے گئے ہیں۔ | Wazan = tasdeeq × taazgi × review dene walay ka aitmaad × jori aamil (docs/modules/MODULE-4.md). Oopar ke number abhi mehfooz reviews aur bookings se nikaale gaye hain. |  | |
| `adminm4.breakdown.perReview` | How each review was weighed | ہر ریویو کو کیسے تولا گیا | Har review ko kaise tola gaya |  | |
| `adminm4.breakdown.stars` | Stars | ستارے | Sitaaray |  | |
| `adminm4.breakdown.date` | Date and customer | تاریخ اور گاہک | Tareekh aur gaahak |  | |
| `adminm4.breakdown.weight` | Weight | وزن | Wazan |  | |
| `adminm4.breakdown.factors` | Factors | عوامل | Awamil |  | |
| `adminm4.breakdown.factorValues` | provenance {provenance} · recency {recency} · trust {trust} · pair {pair} | تصدیق {provenance} · تازگی {recency} · اعتماد {trust} · جوڑی {pair} | tasdeeq {provenance} · taazgi {recency} · aitmaad {trust} · jori {pair} |  | |
| `adminm4.breakdown.reasons` | Why | کیوں | Kyun |  | |
| `adminm4.breakdown.hiddenCount` | one: {count} hidden review is not counted. / other: {count} hidden reviews are not counted. | one: {count} چھپا ہوا ریویو نہیں گنا جاتا۔ / other: {count} چھپے ہوئے ریویو نہیں گنے جاتے۔ | one: {count} chhupa hua review nahi gina jata. / other: {count} chhupe hue reviews nahi ginay jatay. |  | |
| `adminm4.dash.title` | Bookings and reviews | بکنگز اور ریویو | Bookings aur reviews |  | |
| `adminm4.dash.disputes` | Open disputes | کھلے تنازعات | Khulay tanaazaat |  | |
| `adminm4.dash.flags` | Open reputation flags | کھلے ساکھ کے انتباہ | Khulay saakh ke intebah |  | |
| `adminm4.dash.reported` | Reported reviews | شکایت والے ریویو | Shikayat walay reviews |  | |
| `adminm4.dash.perDay` | New bookings per day | روزانہ نئی بکنگز | Rozana nayi bookings |  | |
| `adminm4.dash.perDaySub` | Requests sent each day, in Pakistan time. | ہر دن بھیجی گئی درخواستیں، پاکستان کے وقت کے مطابق۔ | Har din bheji gayi darkhwastein, Pakistan ke waqt ke mutabiq. |  | |
| `adminm4.dash.bookings` | Bookings | بکنگز | Bookings |  | |
| `adminm4.dash.byState` | Bookings of this period by state now | اس مدت کی بکنگز، موجودہ حالت کے لحاظ سے | Is muddat ki bookings, maujooda haalat ke lihaaz se |  | |
| `adminm4.dash.stars` | Stars in visible reviews (all time) | نظر آنے والے ریویو کے ستارے (شروع سے) | Nazar aane walay reviews ke sitaaray (shuru se) |  | |
| `adminm4.dash.perWeek` | Completed against cancelled by the worker or no-show, per week | فی ہفتہ: مکمل بمقابلہ کاریگر کی منسوخی یا غیر حاضری | Fi hafta: mukammal ba-muqabla karigar ki mansookhi ya ghair haazri |  | |
| `adminm4.dash.perWeekSub` | Closed bookings, by the week they closed. | بند بکنگز، جس ہفتے میں بند ہوئیں۔ | Band bookings, jis haftay mein band huin. |  | |
| `adminm4.dash.completed` | Completed | مکمل | Mukammal |  | |
| `adminm4.dash.failed` | Cancelled by the worker or no-show | کاریگر کی منسوخی یا غیر حاضری | Karigar ki mansookhi ya ghair haazri |  | |
| `adminm4.dash.week` | Week from | ہفتہ شروع | Hafta shuru |  | |
| `adminm4.dash.weekFrom` | Week from {date} | {date} سے ہفتہ | {date} se hafta |  | |
| `adminm4.dash.noBookings` | No bookings in this period yet. | اس مدت میں ابھی کوئی بکنگ نہیں۔ | Is muddat mein abhi koi booking nahi. |  | |
| `adminm4.dash.noReviews` | No reviews yet. | ابھی کوئی ریویو نہیں۔ | Abhi koi review nahi. |  | |
| `adminm4.dash.noClosed` | No completed or failed jobs in this period yet. | اس مدت میں ابھی کوئی مکمل یا ناکام کام نہیں۔ | Is muddat mein abhi koi mukammal ya nakaam kaam nahi. |  | |
| `adminm4.exports.bookings.title` | Bookings | بکنگز | Bookings |  | |
| `adminm4.exports.bookings.text` | Booking codes, worker IDs, skills, states, outcomes and dates. No phone numbers, no descriptions, no customer names. | بکنگ نمبر، کاریگر آئی ڈی، ہنر، حالت، نتیجہ اور تاریخیں۔ فون نمبر، تفصیل یا گاہک کے نام نہیں۔ | Booking number, karigar ID, hunar, haalat, nateeja aur tareekhein. Phone number, tafseel ya gaahak ke naam nahi. |  | |
| `adminm4.exports.reviews.title` | Reviews | ریویو | Reviews |  | |
| `adminm4.exports.reviews.text` | Stars and quick answers per review, with the booking code and its state. Never the comment or reply text, never names. | ہر ریویو کے ستارے اور فوری جواب، بکنگ نمبر اور حالت کے ساتھ۔ تبصرہ یا جواب کا متن اور نام کبھی نہیں۔ | Har review ke sitaaray aur fori jawab, booking number aur haalat ke saath. Tabsira ya jawab ka matan aur naam kabhi nahi. |  | |
| `adminm4.nav.bookings` | Bookings | بکنگز | Bookings |  | |
| `adminm4.nav.disputes` | Disputes | تنازعات | Tanaazaat |  | |
| `adminm4.nav.reviews` | Reviews | ریویو | Reviews |  | |
| `adminm4.nav.flags` | Reputation flags | ساکھ کے انتباہ | Saakh ke intebah |  | |

## Server error messages (41)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `errors.BOOKING_NOT_FOUND` | Booking not found | بکنگ نہیں ملی | Booking nahi mili |  | |
| `errors.BOOKING_ID_INVALID` | Booking number must look like BK-2026-000123 | بکنگ نمبر اس طرح ہونا چاہیے: BK-2026-000123 | Booking number is tarah hona chahiye: BK-2026-000123 |  | |
| `errors.BOOKING_NOT_ALLOWED` | This step is not possible for this booking now. Please reload the page. | اس بکنگ میں ابھی یہ قدم ممکن نہیں۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Is booking mein abhi yeh qadam mumkin nahi. Barah-e-karam safha dobara kholein. |  | |
| `errors.BOOKING_CHANGED` | Someone changed this booking just now. Please reload the page. | ابھی کسی نے یہ بکنگ بدل دی ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Abhi kisi ne yeh booking badal di hai. Barah-e-karam safha dobara kholein. |  | |
| `errors.BOOKING_SELF` | You cannot send a request to yourself. | آپ خود کو درخواست نہیں بھیج سکتے۔ | Aap khud ko darkhwast nahi bhej sakte. |  | |
| `errors.BOOKING_WORKER_UNAVAILABLE` | This worker cannot receive requests right now. | یہ کاریگر ابھی درخواستیں وصول نہیں کر سکتے۔ | Yeh karigar abhi darkhwastein wusool nahi kar sakte. |  | |
| `errors.BOOKING_SKILL_NOT_OFFERED` | Choose one of this worker's skills. | اس کاریگر کے ہنروں میں سے ایک چنیں۔ | Is karigar ke hunaron mein se aik chunein. |  | |
| `errors.BOOKING_LIMIT_OPEN` | You already have {max} open requests. Wait for an answer or cancel one first. | آپ کی پہلے ہی {max} کھلی درخواستیں ہیں۔ جواب کا انتظار کریں یا پہلے ایک منسوخ کریں۔ | Aap ki pehle hi {max} khuli darkhwastein hain. Jawab ka intezar karein ya pehle aik mansookh karein. |  | |
| `errors.BOOKING_LIMIT_PAIR` | You already have an open request with this worker. | اس کاریگر کے ساتھ آپ کی ایک درخواست پہلے سے کھلی ہے۔ | Is karigar ke saath aap ki aik darkhwast pehle se khuli hai. |  | |
| `errors.BOOKING_LIMIT_DAY` | You sent {max} requests in the last 24 hours. Please try again tomorrow. | آپ نے پچھلے 24 گھنٹوں میں {max} درخواستیں بھیجی ہیں۔ براہ کرم کل دوبارہ کوشش کریں۔ | Aap ne pichhlay 24 ghanton mein {max} darkhwastein bheji hain. Barah-e-karam kal dobara koshish karein. |  | |
| `errors.BOOKING_DATE_RANGE` | Choose a day from today up to {max} days ahead. | آج سے {max} دن آگے تک کوئی دن چنیں۔ | Aaj se {max} din aagay tak koi din chunein. |  | |
| `errors.TIME_SLOT_INVALID` | Choose a time: morning, afternoon, evening or any time. | وقت چنیں: صبح، دوپہر، شام یا کسی بھی وقت۔ | Waqt chunein: subah, dopehar, shaam ya kisi bhi waqt. |  | |
| `errors.BOOKING_AS_INVALID` | as must be customer or worker | as میں customer یا worker لکھا ہونا چاہیے | as mein customer ya worker likha hona chahiye |  | |
| `errors.DECLINE_REASON_INVALID` | Choose a reason: busy, too far, not my work or other | وجہ چنیں: مصروف، بہت دور، میرا کام نہیں یا کوئی اور | Wajah chunein: masroof, bohat door, mera kaam nahi ya koi aur |  | |
| `errors.CANCEL_REASON_REQUIRED` | Please choose why you are cancelling. | براہ کرم بتائیں کہ آپ کیوں منسوخ کر رہے ہیں۔ | Barah-e-karam batayein ke aap kyun mansookh kar rahe hain. |  | |
| `errors.CANCEL_REASON_INVALID` | Choose one of the listed reasons for cancelling. | منسوخی کی دی گئی وجوہات میں سے ایک چنیں۔ | Mansookhi ki di gayi wujoohaat mein se aik chunein. |  | |
| `errors.TEXT_HAS_CONTACT_INFO` | Please do not write phone numbers, links or ID numbers here. | براہ کرم یہاں فون نمبر، لنک یا شناختی نمبر نہ لکھیں۔ | Barah-e-karam yahan phone number, link ya shanakhti number na likhein. |  | |
| `errors.NO_SHOW_TOO_EARLY` | You can report this from 2 hours after the start time. | آپ یہ اطلاع شروع کے وقت سے 2 گھنٹے بعد دے سکتے ہیں۔ | Aap yeh ittela shuru ke waqt se 2 ghantay baad de sakte hain. |  | |
| `errors.NO_SHOW_ANSWER_INVALID` | Answer must be admit or dispute | جواب admit یا dispute ہونا چاہیے | Jawab admit ya dispute hona chahiye |  | |
| `errors.DISPUTE_NOT_ALLOWED` | This booking cannot be disputed. | اس بکنگ پر تنازع نہیں کھولا جا سکتا۔ | Is booking par tanaaza nahi khola ja sakta. |  | |
| `errors.DISPUTE_WINDOW_PASSED` | The time to dispute this booking (14 days) has passed. | اس بکنگ پر تنازع کا وقت (14 دن) گزر چکا ہے۔ | Is booking par tanaaza ka waqt (14 din) guzar chuka hai. |  | |
| `errors.DISPUTE_OPEN` | A dispute about this booking is open. An admin will decide. | اس بکنگ پر ایک تنازع کھلا ہے۔ ایڈمن فیصلہ کریں گے۔ | Is booking par aik tanaaza khula hai. Admin faisla karein ge. |  | |
| `errors.DISPUTE_NOT_OPEN` | This booking has no open dispute. | اس بکنگ پر کوئی کھلا تنازع نہیں۔ | Is booking par koi khula tanaaza nahi. |  | |
| `errors.DISPUTE_REASON_INVALID` | Choose one of the listed reasons. | دی گئی وجوہات میں سے ایک چنیں۔ | Di gayi wujoohaat mein se aik chunein. |  | |
| `errors.DISPUTE_DECISION_INVALID` | This decision does not fit this kind of dispute. | یہ فیصلہ اس قسم کے تنازع کے لیے نہیں۔ | Yeh faisla is qisam ke tanaaza ke liye nahi. |  | |
| `errors.DISPUTE_ALREADY_DECIDED` | An admin already decided this dispute. Please reload the page. | ایڈمن اس تنازع کا فیصلہ کر چکے ہیں۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Admin is tanaaza ka faisla kar chuke hain. Barah-e-karam safha dobara kholein. |  | |
| `errors.RATING_INVALID` | Choose from 1 to 5 stars. | 1 سے 5 ستارے چنیں۔ | 1 se 5 sitaaray chunein. |  | |
| `errors.ANSWER_INVALID` | Answer must be yes or no | جواب ہاں یا نہیں ہونا چاہیے | Jawab haan ya nahi hona chahiye |  | |
| `errors.REVIEW_NOT_ALLOWED` | Only the customer of a completed booking can review it. | صرف مکمل بکنگ کے گاہک ہی ریویو دے سکتے ہیں۔ | Sirf mukammal booking ke gaahak hi review de sakte hain. |  | |
| `errors.REVIEW_EXISTS` | This work was already reviewed. Reviews cannot be changed. | اس کام کا ریویو پہلے ہی دیا جا چکا ہے۔ ریویو بدلے نہیں جا سکتے۔ | Is kaam ka review pehle hi diya ja chuka hai. Reviews badlay nahi ja sakte. |  | |
| `errors.REVIEW_WINDOW_PASSED` | The time to review this work (14 days) has passed. | اس کام کے ریویو کا وقت (14 دن) گزر چکا ہے۔ | Is kaam ke review ka waqt (14 din) guzar chuka hai. |  | |
| `errors.REVIEW_NOT_FOUND` | Review not found | ریویو نہیں ملا | Review nahi mila |  | |
| `errors.REPLY_EXISTS` | You already replied to this review. Replies cannot be changed. | آپ اس ریویو کا جواب دے چکے ہیں۔ جواب بدلا نہیں جا سکتا۔ | Aap is review ka jawab de chuke hain. Jawab badla nahi ja sakta. |  | |
| `errors.REPLY_EMPTY` | Please write your reply. | براہ کرم اپنا جواب لکھیں۔ | Barah-e-karam apna jawab likhein. |  | |
| `errors.REPORT_REASON_INVALID` | Choose a reason: abusive, personal information, not about my work, the job did not happen, or other | وجہ چنیں: بدتمیزی، ذاتی معلومات، میرے کام کے بارے میں نہیں، کام ہوا ہی نہیں، یا کوئی اور | Wajah chunein: badtameezi, zaati maloomat, mere kaam ke baare mein nahi, kaam hua hi nahi, ya koi aur |  | |
| `errors.REPORT_EXISTS` | You already reported this review. An admin will look at it. | آپ اس ریویو کی شکایت کر چکے ہیں۔ ایڈمن اسے دیکھیں گے۔ | Aap is review ki shikayat kar chuke hain. Admin isay dekhein ge. |  | |
| `errors.HIDE_REASON_INVALID` | Choose a reason: abusive language, personal information, unrelated, fake or manipulated, or other | وجہ چنیں: بدزبانی، ذاتی معلومات، غیر متعلق، جعلی یا ہیرا پھیری، یا کوئی اور | Wajah chunein: badzabani, zaati maloomat, ghair mutalliq, jaali ya hera pheri, ya koi aur |  | |
| `errors.REVIEW_STATUS_CHANGED` | This review already has that status. Please reload the page. | اس ریویو کی یہی حالت پہلے سے ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Is review ki yehi haalat pehle se hai. Barah-e-karam safha dobara kholein. |  | |
| `errors.FLAG_NOT_FOUND` | Flag not found | انتباہ نہیں ملا | Intebah nahi mila |  | |
| `errors.FLAG_ALREADY_DECIDED` | An admin already decided this flag. Please reload the page. | ایڈمن اس انتباہ کا فیصلہ کر چکے ہیں۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Admin is intebah ka faisla kar chuke hain. Barah-e-karam safha dobara kholein. |  | |
| `errors.CRON_UNAUTHORIZED` | Not allowed. | اجازت نہیں۔ | Ijazat nahi. |  | |

