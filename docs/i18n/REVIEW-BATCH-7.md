# Batch 7 texts for team review (Module 5: fair wage and work protection)

512 new texts, each in English, Urdu and Roman Urdu; no existing text was changed. Date: 2026-11-23.
Every Urdu and Roman Urdu text below is a **draft** until a team member who reads Urdu has
checked it (D-031). 57 of them are fixed help texts that can be recorded as clips (Clip = yes).

Please check that each text is everyday Urdu, short enough to be spoken (about 20 words), says the same thing in
Urdu and Roman Urdu (Roman Urdu users hear the Urdu audio), and uses neutral forms where a verb would show a gender.
Points that need the team:

- **Work-protection texts and safety tips** (`wage.protect.*`): general advice, not training and not legal advice.
  Check every tip, and the helpline numbers 1122, 15 and 1314 with their sources (docs/MODULE-5-MANUAL-TEST.md).
- **Words for money:** "اجرت / ujrat" (wage), "قیمت / qeemat" (price), "ادائیگی / adaigi" (payment), "ایڈوانس" (advance),
  "منظور کریں / manzoor karein" (Agree), "تصدیق / tasdeeq" (confirm). Choose the everyday words people use.
- The guide title "Fair pay and safe work" is the name the Batch 7 plan gave; the platform range itself is never called a
  "fair price" (tested).
- Amounts are placeholders everywhere ({amount}, {low}, …): no price or wage figure is written in a text (tested).

**Clips to record:** the rows with "yes" are fixed help texts; they appear in the clip recorder (`/dev/recorder`,
development builds) under their keys. Texts with a value in braces are spoken by a device voice. Record Urdu first.

## Help texts: Listen under each field (help.field.wage.*) (21)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `help.field.wage.unit` | Choose how the price is counted: for the whole job, for each day, or for each hour. | چنیں کہ قیمت کیسے لگے گی: پورے کام کی، ہر دن کی، یا ہر گھنٹے کی۔ | Chunein ke qeemat kaise lagay gi: poore kaam ki, har din ki, ya har ghantay ki. | yes | |
| `help.field.wage.amount` | Write the price in rupees, with numbers only. You can use the number keypad. | قیمت روپوں میں لکھیں، صرف ہندسوں میں۔ آپ نمبر والا کی بورڈ استعمال کر سکتے ہیں۔ | Qeemat rupon mein likhein, sirf hindson mein. Aap number wala keyboard istemal kar sakte hain. | yes | |
| `help.field.wage.quantity` | How many days or hours? Press minus or plus, or write the number. | کتنے دن یا گھنٹے؟ مائنس یا پلس دبائیں، یا نمبر لکھیں۔ | Kitne din ya ghantay? Minus ya plus dabayein, ya number likhein. | yes | |
| `help.field.wage.duration` | How long will the whole job take? This helps to check the price. | پورا کام کتنا وقت لے گا؟ اس سے قیمت دیکھنے میں مدد ملتی ہے۔ | Poora kaam kitna waqt le ga? Is se qeemat dekhne mein madad milti hai. | yes | |
| `help.field.wage.materials` | Who buys the materials: the customer, included in the price, or the worker buys and the customer pays? | سامان کون خریدے گا: گاہک، قیمت میں شامل، یا کاریگر خریدے اور گاہک پیسے دے؟ | Saman kaun kharide ga: gahak, qeemat mein shamil, ya karigar kharide aur gahak paise de? | yes | |
| `help.field.wage.advance` | Is some money paid before the work? Choose no advance, or some advance. | کیا کام سے پہلے کچھ پیسے دیے جائیں گے؟ کوئی ایڈوانس نہیں، یا کچھ ایڈوانس چنیں۔ | Kya kaam se pehle kuch paise diye jayenge? Koi advance nahin, ya kuch advance chunein. | yes | |
| `help.field.wage.advanceAmount` | Write the advance in rupees. More than half of the price is risky. | ایڈوانس روپوں میں لکھیں۔ قیمت کے آدھے سے زیادہ دینا خطرے کی بات ہے۔ | Advance rupon mein likhein. Qeemat ke aadhay se zyada dena khatray ki baat hai. | yes | |
| `help.field.wage.paymentTiming` | When is the money paid: after the work, every day, or part before and the rest after? | پیسے کب دیے جائیں گے: کام کے بعد، ہر روز، یا کچھ پہلے اور باقی بعد میں؟ | Paise kab diye jayenge: kaam ke baad, har roz, ya kuch pehle aur baqi baad mein? | yes | |
| `help.field.wage.paymentMethod` | How is the money paid? The app only keeps a record; it does not send money. | پیسے کیسے دیے جائیں گے؟ ایپ صرف ریکارڈ رکھتی ہے، پیسے نہیں بھیجتی۔ | Paise kaise diye jayenge? App sirf record rakhti hai, paise nahin bhejti. | yes | |
| `help.field.wage.visitCharge` | Is there a charge for coming to look at the work? None, included, or paid separately. | کیا کام دیکھنے آنے کا خرچہ ہے؟ کوئی نہیں، شامل، یا الگ سے۔ | Kya kaam dekhne aane ka kharcha hai? Koi nahin, shamil, ya alag se. | yes | |
| `help.field.wage.note` | A short note, for example what is included. Do not write phone numbers. | مختصر نوٹ، مثلاً کیا کیا شامل ہے۔ فون نمبر نہ لکھیں۔ | Mukhtasar note, maslan kya kya shamil hai. Phone number na likhein. | yes | |
| `help.field.wage.payKind` | What was this money for: advance, part, final, materials, or extra work? | یہ پیسے کس لیے تھے: ایڈوانس، کچھ ادائیگی، آخری ادائیگی، سامان، یا اضافی کام؟ | Yeh paise kis liye thay: advance, kuch adaigi, aakhri adaigi, saman, ya izafi kaam? | yes | |
| `help.field.wage.payAmount` | Write the amount that was paid, in rupees. | جو رقم دی گئی، وہ روپوں میں لکھیں۔ | Jo raqam di gayi, woh rupon mein likhein. | yes | |
| `help.field.wage.payMethod` | How was the money paid? This is only a record. | پیسے کیسے دیے گئے؟ یہ صرف ریکارڈ ہے۔ | Paise kaise diye gaye? Yeh sirf record hai. | yes | |
| `help.field.wage.payWhen` | When was it paid? Today, or another day. | کب دیے گئے؟ آج، یا کسی اور دن۔ | Kab diye gaye? Aaj, ya kisi aur din. | yes | |
| `help.field.wage.payDate` | Choose the day the money was paid. It cannot be in the future. | وہ دن چنیں جب پیسے دیے گئے۔ آنے والا دن نہیں چن سکتے۔ | Woh din chunein jab paise diye gaye. Aane wala din nahin chun sakte. | yes | |
| `help.field.wage.payReason` | What is not right: the money was not received, the amount is wrong, or something else? | کیا درست نہیں: پیسے نہیں ملے، رقم غلط ہے، یا کچھ اور؟ | Kya durust nahin: paise nahin milay, raqam ghalat hai, ya kuch aur? | yes | |
| `help.field.wage.payNote` | A short note about the problem. Do not write phone numbers. | مسئلے کے بارے میں مختصر نوٹ۔ فون نمبر نہ لکھیں۔ | Masle ke baare mein mukhtasar note. Phone number na likhein. | yes | |
| `help.field.wage.priceTrade` | Choose the trade, by its picture. | تصویر دیکھ کر شعبہ چنیں۔ | Tasveer dekh kar shoba chunein. | yes | |
| `help.field.wage.priceSkill` | Choose the work you want to see prices for. | وہ کام چنیں جس کی قیمتیں دیکھنی ہیں۔ | Woh kaam chunein jis ki qeematein dekhni hain. | yes | |
| `help.field.wage.priceCity` | Write the city. Prices and the minimum wage depend on the city and province. | شہر لکھیں۔ قیمتیں اور کم از کم اجرت شہر اور صوبے پر منحصر ہیں۔ | Shehar likhein. Qeematein aur kam az kam ujrat shehar aur soobay par munhasir hain. | yes | |

## Help texts: 🔊 on each picture card (help.option.*) (33)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `help.option.wageUnit.job` | Whole job: one price for all the work. | پورا کام: سارے کام کی ایک قیمت۔ | Poora kaam: saare kaam ki aik qeemat. | yes | |
| `help.option.wageUnit.day` | Per day: a price for each day of work. | فی دن: ہر دن کے کام کی قیمت۔ | Fi din: har din ke kaam ki qeemat. | yes | |
| `help.option.wageUnit.hour` | Per hour: a price for each hour of work. | فی گھنٹہ: ہر گھنٹے کے کام کی قیمت۔ | Fi ghanta: har ghantay ke kaam ki qeemat. | yes | |
| `help.option.wageDuration.few_hours` | A few hours: the work is done in part of a day. | چند گھنٹے: کام دن کے کچھ حصے میں ہو جاتا ہے۔ | Chand ghantay: kaam din ke kuch hissay mein ho jata hai. | yes | |
| `help.option.wageDuration.one_day` | One day: the work takes a full day. | ایک دن: کام پورا دن لیتا ہے۔ | Aik din: kaam poora din leta hai. | yes | |
| `help.option.wageDuration.two_three_days` | 2 or 3 days: the work takes two or three days. | 2 یا 3 دن: کام دو یا تین دن لیتا ہے۔ | 2 ya 3 din: kaam do ya teen din leta hai. | yes | |
| `help.option.wageDuration.longer` | Longer: more than three days. | اس سے زیادہ: تین دن سے زیادہ۔ | Is se zyada: teen din se zyada. | yes | |
| `help.option.wageMaterials.customer_buys` | The customer buys the materials. | گاہک سامان خریدیں گے۔ | Gahak saman kharidenge. | yes | |
| `help.option.wageMaterials.included_in_price` | The materials are included in the price. | سامان قیمت میں شامل ہے۔ | Saman qeemat mein shamil hai. | yes | |
| `help.option.wageMaterials.worker_buys_customer_pays` | The worker buys the materials and the customer pays for them. Keep the shop bill. | کاریگر سامان خریدیں اور گاہک اس کے پیسے دیں۔ دکان کی رسید رکھیں۔ | Karigar saman kharidein aur gahak us ke paise dein. Dukan ki raseed rakhein. | yes | |
| `help.option.wageAdvance.none` | No advance: all the money is paid as agreed later. | کوئی ایڈوانس نہیں: سارے پیسے بعد میں طے کے مطابق۔ | Koi advance nahin: saare paise baad mein tay ke mutabiq. | yes | |
| `help.option.wageAdvance.some` | Some advance: part of the money before the work. Then write the amount. | کچھ ایڈوانس: کچھ پیسے کام سے پہلے۔ پھر رقم لکھیں۔ | Kuch advance: kuch paise kaam se pehle. Phir raqam likhein. | yes | |
| `help.option.wageTiming.after_work` | After the work: the money is paid when the work is finished. | کام کے بعد: کام ختم ہونے پر پیسے دیے جائیں گے۔ | Kaam ke baad: kaam khatam hone par paise diye jayenge. | yes | |
| `help.option.wageTiming.daily` | Every day: the money for each day is paid that day. | ہر روز: ہر دن کے پیسے اسی دن۔ | Har roz: har din ke paise usi din. | yes | |
| `help.option.wageTiming.part_before_rest_after` | Part before, rest after: some money first, the rest when the work is finished. | کچھ پہلے، باقی بعد میں: کچھ پیسے پہلے، باقی کام ختم ہونے پر۔ | Kuch pehle, baqi baad mein: kuch paise pehle, baqi kaam khatam hone par. | yes | |
| `help.option.wageMethod.cash` | Cash: paid in notes, by hand. | نقد: ہاتھ میں نوٹ۔ | Naqd: haath mein note. | yes | |
| `help.option.wageMethod.easypaisa` | Easypaisa: paid with the Easypaisa mobile account. | ایزی پیسہ: ایزی پیسہ موبائل اکاؤنٹ سے۔ | Easypaisa: Easypaisa mobile account se. | yes | |
| `help.option.wageMethod.jazzcash` | JazzCash: paid with the JazzCash mobile account. | جاز کیش: جاز کیش موبائل اکاؤنٹ سے۔ | JazzCash: JazzCash mobile account se. | yes | |
| `help.option.wageMethod.bank` | Bank transfer: paid from one bank account to another. | بینک ٹرانسفر: ایک بینک اکاؤنٹ سے دوسرے میں۔ | Bank transfer: aik bank account se doosre mein. | yes | |
| `help.option.wageMethod.other` | Other: paid in another way. | کوئی اور: کسی اور طریقے سے۔ | Koi aur: kisi aur tareeqay se. | yes | |
| `help.option.wageVisit.none` | No visit charge: coming to look at the work is free. | آنے کا کوئی خرچہ نہیں: کام دیکھنے آنا مفت ہے۔ | Aane ka koi kharcha nahin: kaam dekhne aana muft hai. | yes | |
| `help.option.wageVisit.included` | Included: the visit charge is part of the price. | شامل: آنے کا خرچہ قیمت میں شامل ہے۔ | Shamil: aane ka kharcha qeemat mein shamil hai. | yes | |
| `help.option.wageVisit.separate` | Separately: the visit charge is paid on its own. | الگ سے: آنے کا خرچہ الگ دیا جائے گا۔ | Alag se: aane ka kharcha alag diya jayega. | yes | |
| `help.option.wagePayKind.advance` | Advance: money paid before the work. | ایڈوانس: کام سے پہلے دیے گئے پیسے۔ | Advance: kaam se pehle diye gaye paise. | yes | |
| `help.option.wagePayKind.part` | Part payment: some of the money. | کچھ ادائیگی: پیسوں کا کچھ حصہ۔ | Kuch adaigi: paison ka kuch hissa. | yes | |
| `help.option.wagePayKind.final` | Final payment: the last money for the work. | آخری ادائیگی: کام کے آخری پیسے۔ | Aakhri adaigi: kaam ke aakhri paise. | yes | |
| `help.option.wagePayKind.materials` | Money for materials: not part of the price for the work. | سامان کے پیسے: کام کی قیمت کا حصہ نہیں۔ | Saman ke paise: kaam ki qeemat ka hissa nahin. | yes | |
| `help.option.wagePayKind.extra_work` | Extra work: money for work that was agreed as a new price. | اضافی کام: اس کام کے پیسے جس کی نئی قیمت طے ہوئی۔ | Izafi kaam: us kaam ke paise jis ki nayi qeemat tay hui. | yes | |
| `help.option.wagePayWhen.today` | Today: the money was paid today. | آج: پیسے آج دیے گئے۔ | Aaj: paise aaj diye gaye. | yes | |
| `help.option.wagePayWhen.pick` | Another day: choose the day on the calendar. | کوئی اور دن: کیلنڈر پر دن چنیں۔ | Koi aur din: calendar par din chunein. | yes | |
| `help.option.wagePayReason.not_received` | Money not received: the money did not arrive. | پیسے نہیں ملے: پیسے نہیں پہنچے۔ | Paise nahin milay: paise nahin pohanchay. | yes | |
| `help.option.wagePayReason.wrong_amount` | Wrong amount: the amount written is not what was paid. | رقم غلط ہے: لکھی گئی رقم وہ نہیں جو دی گئی۔ | Raqam ghalat hai: likhi gayi raqam woh nahin jo di gayi. | yes | |
| `help.option.wagePayReason.other` | Something else: write a short note. | کچھ اور: مختصر نوٹ لکھیں۔ | Kuch aur: mukhtasar note likhein. | yes | |

## Page help of the new pages (help.screen.*) (3)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `help.screen.myEarnings` | Money your customers confirmed, month by month. Money still waiting or disputed is shown apart. | وہ پیسے جن کی گاہکوں نے تصدیق کی، مہینہ وار۔ انتظار والے یا متنازع پیسے الگ دکھائے گئے ہیں۔ | Woh paise jin ki gahakon ne tasdeeq ki, maheena waar. Intezar walay ya mutnaza paise alag dikhaye gaye hain. | yes | |
| `help.screen.priceInfo` | Choose a trade, a work and a city. You see the typical price on this platform and the minimum wage reference. | شعبہ، کام اور شہر چنیں۔ آپ اس ایپ پر عام قیمت اور کم از کم اجرت کا حوالہ دیکھیں گے۔ | Shoba, kaam aur shehar chunein. Aap is app par aam qeemat aur kam az kam ujrat ka hawala dekhenge. | yes | |
| `help.screen.paymentRecord` | The agreed price and every payment of this booking. Press Print to keep a paper copy. It is not a bank receipt. | اس بکنگ کی طے شدہ قیمت اور ہر ادائیگی۔ کاغذ پر رکھنے کے لیے پرنٹ دبائیں۔ یہ بینک کی رسید نہیں۔ | Is booking ki tay shuda qeemat aur har adaigi. Kaghaz par rakhne ke liye Print dabayein. Yeh bank ki raseed nahin. | yes | |

## Price information, minimum wage reference, spoken sentences (58)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `help.wage.say` | {say} | {say} | {say} |  | |
| `wage.listen` | Listen | سنیں | Sunein |  | |
| `wage.listenShort` | Listen | سنیں | Sunein |  | |
| `wage.nav.earnings` | My earnings | میری کمائی | Meri kamai |  | |
| `wage.nav.prices` | Price information | قیمت کی معلومات | Qeemat ki maloomat |  | |
| `wage.place.country` | Pakistan | پاکستان | Pakistan |  | |
| `wage.unit.job` | Whole job | پورا کام | Poora kaam |  | |
| `wage.unit.day` | Per day | فی دن | Fi din |  | |
| `wage.unit.hour` | Per hour | فی گھنٹہ | Fi ghanta |  | |
| `wage.unitWords.job` | for one job | ایک کام کے لیے | aik kaam ke liye |  | |
| `wage.unitWords.day` | for one day | ایک دن کے لیے | aik din ke liye |  | |
| `wage.unitWords.hour` | for one hour | ایک گھنٹے کے لیے | aik ghantay ke liye |  | |
| `wage.price.job` | {amount} for the whole job | پورے کام کے {amount} | Poore kaam ke {amount} |  | |
| `wage.price.day` | {amount} a day | {amount} روزانہ | {amount} rozana |  | |
| `wage.price.hour` | {amount} an hour | {amount} فی گھنٹہ | {amount} fi ghanta |  | |
| `wage.price.times.day` | {per} × {count} days = {total} | {per} × {count} دن = {total} | {per} × {count} din = {total} |  | |
| `wage.price.times.hour` | {per} × {count} hours = {total} | {per} × {count} گھنٹے = {total} | {per} × {count} ghantay = {total} |  | |
| `wage.spoken.rupees` | {amount} rupees | {amount} روپے | {amount} rupay |  | |
| `wage.spoken.price.job` | {amount} for the whole job | پورے کام کے {amount} | poore kaam ke {amount} |  | |
| `wage.spoken.price.day` | {amount} a day | روزانہ {amount} | rozana {amount} |  | |
| `wage.spoken.price.hour` | {amount} an hour | فی گھنٹہ {amount} | fi ghanta {amount} |  | |
| `wage.spoken.price.times.day` | {per}, for {count} days, {total} in total | {per}، {count} دن کے لیے، کل {total} | {per}, {count} din ke liye, kul {total} |  | |
| `wage.spoken.price.times.hour` | {per}, for {count} hours, {total} in total | {per}، {count} گھنٹوں کے لیے، کل {total} | {per}, {count} ghanton ke liye, kul {total} |  | |
| `wage.spoken.offer` | The customer offers {price}. | گاہک {price} دے رہے ہیں۔ | Gahak {price} de rahe hain. |  | |
| `wage.spoken.platform` | Typical price on this platform in {place}: {low} to {high} rupees {unit}. From {jobs} jobs by {workers} workers. | اس ایپ پر {place} میں عام قیمت: {unit} {low} سے {high} روپے۔ یہ {workers} کاریگروں کے {jobs} کاموں سے ہے۔ | Is app par {place} mein aam qeemat: {unit} {low} se {high} rupay. Yeh {workers} karigaron ke {jobs} kaamon se hai. |  | |
| `wage.spoken.guide` | Price guide from the admin team: {low} to {high} rupees {unit}. Source: {source}. | ایڈمن ٹیم کی قیمت گائیڈ: {unit} {low} سے {high} روپے۔ ذریعہ: {source}۔ | Admin team ki qeemat guide: {unit} {low} se {high} rupay. Zariya: {source}. |  | |
| `wage.spoken.none` | There are not enough prices on this platform yet for this work. | اس کام کی قیمتیں ابھی اس ایپ پر کافی نہیں ہیں۔ | Is kaam ki qeematein abhi is app par kaafi nahin hain. |  | |
| `wage.spoken.ref` | Government minimum wage reference for {region}: about {daily} rupees for one day of {hours} hours. | {region} کے لیے حکومت کی کم از کم اجرت کا حوالہ: {hours} گھنٹے کے ایک دن کے تقریباً {daily} روپے۔ | {region} ke liye hukoomat ki kam az kam ujrat ka hawala: {hours} ghantay ke aik din ke taqreeban {daily} rupay. |  | |
| `wage.spoken.earnings` | This month, {month}, you received {amount}, confirmed by your customers. | اس مہینے، {month} میں، آپ کو {amount} ملے، جن کی گاہکوں نے تصدیق کی۔ | Is maheenay, {month} mein, aap ko {amount} milay, jin ki gahakon ne tasdeeq ki. |  | |
| `wage.spoken.tableRow` | {region}: {monthly} a month, about {daily} a day | {region}: مہینے کے {monthly}، دن کے تقریباً {daily} | {region}: maheenay ke {monthly}, din ke taqreeban {daily} |  | |
| `wage.info.title` | Price information | قیمت کی معلومات | Qeemat ki maloomat |  | |
| `wage.info.platform` | Typical price on this platform in {place}: {low} to {high} {unit} | اس ایپ پر {place} میں عام قیمت: {unit} {low} سے {high} | Is app par {place} mein aam qeemat: {unit} {low} se {high} |  | |
| `wage.info.platformFrom` | Middle price {median}. From {jobs} jobs by {workers} workers. | درمیانی قیمت {median}۔ یہ {workers} کاریگروں کے {jobs} کاموں سے ہے۔ | Darmiyani qeemat {median}. Yeh {workers} karigaron ke {jobs} kaamon se hai. |  | |
| `wage.info.categoryScope` | From similar work in the same trade. | اسی شعبے کے ملتے جلتے کاموں سے۔ | Isi shobay ke miltay julte kaamon se. |  | |
| `wage.info.guide` | Price guide from the admin team: {low} to {high} {unit} | ایڈمن ٹیم کی قیمت گائیڈ: {unit} {low} سے {high} | Admin team ki qeemat guide: {unit} {low} se {high} |  | |
| `wage.info.guideSource` | Source: {source}. Updated {month}. | ذریعہ: {source}۔ تازہ کی گئی: {month}۔ | Zariya: {source}. Taaza ki gayi: {month}. |  | |
| `wage.info.none` | Not enough prices on this platform yet for this work in {place}. | اس ایپ پر {place} میں اس کام کی قیمتیں ابھی کافی نہیں ہیں۔ | Is app par {place} mein is kaam ki qeematein abhi kaafi nahin hain. |  | |
| `wage.info.noneAnywhere` | Not enough prices on this platform yet for this work. | اس ایپ پر اس کام کی قیمتیں ابھی کافی نہیں ہیں۔ | Is app par is kaam ki qeematein abhi kaafi nahin hain. |  | |
| `wage.info.rules` | A typical price is shown only from at least {jobs} finished jobs by {workers} workers for {customers} customers, so nobody's own price can be seen. | عام قیمت تب دکھائی جاتی ہے جب کم از کم {workers} کاریگروں کے {customers} گاہکوں کے لیے {jobs} مکمل کام ہوں، تاکہ کسی کی اپنی قیمت نظر نہ آئے۔ | Aam qeemat tab dikhai jati hai jab kam az kam {workers} karigaron ke {customers} gahakon ke liye {jobs} mukammal kaam hon, taake kisi ki apni qeemat nazar na aaye. |  | |
| `wage.info.workerRates` | This worker's own rates: {rates}. | اس کاریگر کے اپنے ریٹ: {rates}۔ | Is karigar ke apne rate: {rates}. |  | |
| `wage.ref.line` | Government minimum wage for unskilled work in {region}: {monthly} a month (from {date}). That is about {daily} for one {hours}-hour day. | {region} میں غیر ہنر مند کام کی حکومتی کم از کم اجرت: مہینے کے {monthly} ({date} سے)۔ یعنی {hours} گھنٹے کے ایک دن کے تقریباً {daily}۔ | {region} mein ghair hunarmand kaam ki hukoomati kam az kam ujrat: maheenay ke {monthly} ({date} se). Yani {hours} ghantay ke aik din ke taqreeban {daily}. |  | |
| `wage.ref.lineNoDate` | Government minimum wage for unskilled work in {region}: {monthly} a month. That is about {daily} for one {hours}-hour day. | {region} میں غیر ہنر مند کام کی حکومتی کم از کم اجرت: مہینے کے {monthly}۔ یعنی {hours} گھنٹے کے ایک دن کے تقریباً {daily}۔ | {region} mein ghair hunarmand kaam ki hukoomati kam az kam ujrat: maheenay ke {monthly}. Yani {hours} ghantay ke aik din ke taqreeban {daily}. |  | |
| `wage.ref.announced` | (announced in the budget; the official notification was not found yet) | (بجٹ میں اعلان ہوا؛ سرکاری نوٹیفکیشن ابھی نہیں ملا) | (budget mein elaan hua; sarkari notification abhi nahin mila) |  | |
| `wage.ref.hourly` | About {hourly} for one hour. | ایک گھنٹے کے تقریباً {hourly}۔ | Aik ghantay ke taqreeban {hourly}. |  | |
| `wage.ref.laws` | These laws are written for workers in shops and factories. The app shows the figure as a reference so that a day's work is not paid less. | یہ قانون دکانوں اور کارخانوں کے کارکنوں کے لیے ہیں۔ ایپ یہ رقم صرف حوالے کے طور پر دکھاتی ہے تاکہ ایک دن کے کام کی اجرت اس سے کم نہ ہو۔ | Yeh qanoon dukanon aur karkhanon ke karkunon ke liye hain. App yeh raqam sirf hawalay ke taur par dikhati hai taake aik din ke kaam ki ujrat is se kam na ho. |  | |
| `wage.ref.sources` | Where these figures come from | یہ رقمیں کہاں سے آئیں | Yeh raqamein kahan se aayin |  | |
| `wage.ref.noFigure` | The app has no government minimum wage figure for this region. | ایپ میں اس علاقے کی حکومتی کم از کم اجرت کی رقم نہیں ہے۔ | App mein is ilaqay ki hukoomati kam az kam ujrat ki raqam nahin hai. |  | |
| `wage.ref.unknownCity` | The app does not know the city "{city}", so it shows no minimum wage reference. | ایپ شہر "{city}" کو نہیں جانتی، اس لیے کم از کم اجرت کا حوالہ نہیں دکھاتی۔ | App shehar "{city}" ko nahin janti, is liye kam az kam ujrat ka hawala nahin dikhati. |  | |
| `wage.ref.noCity` | Write a city to see the minimum wage reference. | کم از کم اجرت کا حوالہ دیکھنے کے لیے شہر لکھیں۔ | Kam az kam ujrat ka hawala dekhne ke liye shehar likhein. |  | |
| `wage.rate.reference` | Government minimum wage reference for {region}: about {daily} for one {hours}-hour day. | {region} کے لیے حکومت کی کم از کم اجرت کا حوالہ: {hours} گھنٹے کے ایک دن کے تقریباً {daily}۔ | {region} ke liye hukoomat ki kam az kam ujrat ka hawala: {hours} ghantay ke aik din ke taqreeban {daily}. |  | |
| `wage.rate.below` | Your daily rate is less than this reference. You can keep it: it is your choice. | آپ کا روزانہ ریٹ اس حوالے سے کم ہے۔ آپ اسے رکھ سکتے ہیں: یہ آپ کی مرضی ہے۔ | Aap ka rozana rate is hawalay se kam hai. Aap ise rakh sakte hain: yeh aap ki marzi hai. |  | |
| `wage.rate.seePrices` | See prices for your work | اپنے کام کی قیمتیں دیکھیں | Apne kaam ki qeematein dekhein |  | |
| `wage.priceInfo.title` | Price information | قیمت کی معلومات | Qeemat ki maloomat |  | |
| `wage.priceInfo.lead` | Choose the work and see the typical price on this platform and the government minimum wage reference. | کام چنیں اور اس ایپ پر عام قیمت اور حکومت کی کم از کم اجرت کا حوالہ دیکھیں۔ | Kaam chunein aur is app par aam qeemat aur hukoomat ki kam az kam ujrat ka hawala dekhein. |  | |
| `wage.priceInfo.trade` | Which trade? | کون سا شعبہ؟ | Kaun sa shoba? |  | |
| `wage.priceInfo.skill` | Which work? | کون سا کام؟ | Kaun sa kaam? |  | |
| `wage.priceInfo.city` | City | شہر | Shehar |  | |
| `wage.priceInfo.pick` | Choose a trade and a work to see its prices. For a day or an hour, the trade is enough. | قیمتیں دیکھنے کے لیے شعبہ اور کام چنیں۔ دن یا گھنٹے کے لیے صرف شعبہ کافی ہے۔ | Qeematein dekhne ke liye shoba aur kaam chunein. Din ya ghantay ke liye sirf shoba kaafi hai. |  | |

## Terms form, conditions, checks, read-back, summary, offer, cards (128)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `wage.duration.few_hours` | A few hours | چند گھنٹے | Chand ghantay |  | |
| `wage.duration.one_day` | One day | ایک دن | Aik din |  | |
| `wage.duration.two_three_days` | 2 or 3 days | 2 یا 3 دن | 2 ya 3 din |  | |
| `wage.duration.longer` | Longer | اس سے زیادہ | Is se zyada |  | |
| `wage.duration.say.few_hours` | The work takes a few hours. | کام چند گھنٹے کا ہے۔ | Kaam chand ghanton ka hai. |  | |
| `wage.duration.say.one_day` | The work takes one day. | کام ایک دن کا ہے۔ | Kaam aik din ka hai. |  | |
| `wage.duration.say.two_three_days` | The work takes 2 or 3 days. | کام 2 یا 3 دن کا ہے۔ | Kaam 2 ya 3 din ka hai. |  | |
| `wage.duration.say.longer` | The work takes longer than 3 days. | کام 3 دن سے زیادہ کا ہے۔ | Kaam 3 din se zyada ka hai. |  | |
| `wage.form.unit` | How is the price counted? | قیمت کیسے لگے گی؟ | Qeemat kaise lagay gi? |  | |
| `wage.form.amount.job` | Price for the whole job | پورے کام کی قیمت | Poore kaam ki qeemat |  | |
| `wage.form.amount.day` | Price for one day | ایک دن کی قیمت | Aik din ki qeemat |  | |
| `wage.form.amount.hour` | Price for one hour | ایک گھنٹے کی قیمت | Aik ghantay ki qeemat |  | |
| `wage.form.quantity.day` | Number of days | کتنے دن | Kitne din |  | |
| `wage.form.quantity.hour` | Number of hours | کتنے گھنٹے | Kitne ghantay |  | |
| `wage.form.less` | One less: {label} | ایک کم: {label} | Aik kam: {label} |  | |
| `wage.form.more` | One more: {label} | ایک زیادہ: {label} | Aik zyada: {label} |  | |
| `wage.form.total` | Total: {total} | کل: {total} | Kul: {total} |  | |
| `wage.form.duration` | How long will the work take? | کام کتنا وقت لے گا؟ | Kaam kitna waqt le ga? |  | |
| `wage.form.amountMax` | The highest amount is Rs {max} | زیادہ سے زیادہ رقم {max} روپے ہے | Zyada se zyada raqam Rs {max} hai |  | |
| `wage.form.conditionsTitle` | Important conditions | اہم شرطیں | Ahem shartein |  | |
| `wage.form.materials` | Who buys the {what}? | {what} کون خریدے گا؟ | {what} kaun kharide ga? |  | |
| `wage.form.advance` | Is there an advance? | کیا ایڈوانس ہے؟ | Kya advance hai? |  | |
| `wage.form.advanceAmount` | Advance amount | ایڈوانس کی رقم | Advance ki raqam |  | |
| `wage.form.paymentTiming` | When is the payment? | ادائیگی کب ہو گی؟ | Adaigi kab ho gi? |  | |
| `wage.form.paymentMethod` | How will the money be paid? | پیسے کیسے دیے جائیں گے؟ | Paise kaise diye jayenge? |  | |
| `wage.form.visitCharge` | Is there a visit charge? | کیا آنے کا خرچہ الگ ہے؟ | Kya aane ka kharcha alag hai? |  | |
| `wage.form.workingDayHours` | The government's minimum wage notifications count a working day as 8 hours. Agree the hours and a break. | حکومت کے کم از کم اجرت کے نوٹیفکیشن میں کام کا دن 8 گھنٹے کا ہے۔ گھنٹے اور وقفہ طے کر لیں۔ | Hukoomat ke kam az kam ujrat ke notification mein kaam ka din 8 ghantay ka hai. Ghantay aur waqfa tay kar lein. |  | |
| `wage.form.extraWorkRule` | Extra work only after a new price is agreed in the app. | اضافی کام صرف تب، جب ایپ میں نئی قیمت طے ہو جائے۔ | Izafi kaam sirf tab, jab app mein nayi qeemat tay ho jaye. |  | |
| `wage.form.note` | Note (optional) | نوٹ (اختیاری) | Note (ikhtiyari) |  | |
| `wage.form.noteHint` | For example: what is included. No phone numbers. | مثلاً: کیا کیا شامل ہے۔ فون نمبر نہ لکھیں۔ | Maslan: kya kya shamil hai. Phone number na likhein. |  | |
| `wage.form.checkAndSend` | Check and send | دیکھیں اور بھیجیں | Dekhein aur bhejein |  | |
| `wage.form.needAmount` | Please write the price in rupees. | براہ کرم قیمت روپوں میں لکھیں۔ | Barah-e-karam qeemat rupon mein likhein. |  | |
| `wage.form.needAdvance` | Please write the advance amount, or choose "No advance". | ایڈوانس کی رقم لکھیں، یا "کوئی ایڈوانس نہیں" چنیں۔ | Advance ki raqam likhein, ya "Koi advance nahin" chunein. |  | |
| `wage.materialsKind.materials` | materials | سامان | saman |  | |
| `wage.materialsKind.cleaning_supplies` | cleaning supplies | صفائی کا سامان | safai ka saman |  | |
| `wage.materialsKind.packing_material` | packing material | پیکنگ کا سامان | packing ka saman |  | |
| `wage.materials.option.customer_buys` | Customer buys the {what} | گاہک {what} خریدیں گے | Gahak {what} kharidenge |  | |
| `wage.materials.option.included_in_price` | {what} included in the price | {what} قیمت میں شامل | {what} qeemat mein shamil |  | |
| `wage.materials.option.worker_buys_customer_pays` | Worker buys, customer pays | کاریگر خریدیں، گاہک پیسے دیں | Karigar kharidein, gahak paise dein |  | |
| `wage.materials.say.customer_buys` | The customer buys the {what}. | گاہک {what} خریدیں گے۔ | Gahak {what} kharidenge. |  | |
| `wage.materials.say.included_in_price` | The {what} are included in the price. | {what} قیمت میں شامل ہے۔ | {what} qeemat mein shamil hai. |  | |
| `wage.materials.say.worker_buys_customer_pays` | The worker buys the {what} and the customer pays for them. | کاریگر {what} خریدیں گے اور گاہک اس کے پیسے دیں گے۔ | Karigar {what} kharidenge aur gahak us ke paise denge. |  | |
| `wage.advance.option.none` | No advance | کوئی ایڈوانس نہیں | Koi advance nahin |  | |
| `wage.advance.option.some` | Some advance | کچھ ایڈوانس | Kuch advance |  | |
| `wage.advance.say.none` | No advance. | کوئی ایڈوانس نہیں۔ | Koi advance nahin. |  | |
| `wage.advance.say.amount` | Advance: {amount}. | ایڈوانس: {amount}۔ | Advance: {amount}. |  | |
| `wage.timing.option.after_work` | After the work | کام کے بعد | Kaam ke baad |  | |
| `wage.timing.option.daily` | Every day | ہر روز | Har roz |  | |
| `wage.timing.option.part_before_rest_after` | Part before, rest after | کچھ پہلے، باقی بعد میں | Kuch pehle, baqi baad mein |  | |
| `wage.timing.say.after_work` | after the work | کام کے بعد | kaam ke baad |  | |
| `wage.timing.say.daily` | every day | ہر روز | har roz |  | |
| `wage.timing.say.part_before_rest_after` | part before the work and the rest after | کچھ کام سے پہلے اور باقی بعد میں | kuch kaam se pehle aur baqi baad mein |  | |
| `wage.method.option.cash` | Cash | نقد | Naqd |  | |
| `wage.method.option.easypaisa` | Easypaisa | ایزی پیسہ | Easypaisa |  | |
| `wage.method.option.jazzcash` | JazzCash | جاز کیش | JazzCash |  | |
| `wage.method.option.bank` | Bank transfer | بینک ٹرانسفر | Bank transfer |  | |
| `wage.method.option.other` | Other | کوئی اور | Koi aur |  | |
| `wage.method.name.cash` | in cash | نقد | naqd |  | |
| `wage.method.name.easypaisa` | by Easypaisa | ایزی پیسہ سے | Easypaisa se |  | |
| `wage.method.name.jazzcash` | by JazzCash | جاز کیش سے | JazzCash se |  | |
| `wage.method.name.bank` | by bank transfer | بینک ٹرانسفر سے | bank transfer se |  | |
| `wage.method.name.other` | in another way | کسی اور طریقے سے | kisi aur tareeqay se |  | |
| `wage.payment.say.both` | Payment {method}, {timing}. | ادائیگی {method}، {timing}۔ | Adaigi {method}, {timing}. |  | |
| `wage.payment.say.method` | Payment {method}. | ادائیگی {method}۔ | Adaigi {method}. |  | |
| `wage.payment.say.timing` | Payment {timing}. | ادائیگی {timing}۔ | Adaigi {timing}. |  | |
| `wage.visit.option.none` | No visit charge | آنے کا کوئی خرچہ نہیں | Aane ka koi kharcha nahin |  | |
| `wage.visit.option.included` | Included in the price | قیمت میں شامل | Qeemat mein shamil |  | |
| `wage.visit.option.separate` | Paid separately | الگ سے | Alag se |  | |
| `wage.visit.say.none` | No visit charge. | آنے کا کوئی خرچہ نہیں۔ | Aane ka koi kharcha nahin. |  | |
| `wage.visit.say.included` | The visit charge is included in the price. | آنے کا خرچہ قیمت میں شامل ہے۔ | Aane ka kharcha qeemat mein shamil hai. |  | |
| `wage.visit.say.separate` | The visit charge is paid separately. | آنے کا خرچہ الگ سے دیا جائے گا۔ | Aane ka kharcha alag se diya jayega. |  | |
| `wage.condition.price` | price and how it is counted | قیمت اور یہ کیسے لگے گی | qeemat aur yeh kaise lagay gi |  | |
| `wage.condition.paymentTiming` | when the payment is | ادائیگی کب ہو گی | adaigi kab ho gi |  | |
| `wage.condition.paymentMethod` | how the money is paid | پیسے کیسے دیے جائیں گے | paise kaise diye jayenge |  | |
| `wage.condition.materials` | who buys the materials | سامان کون خریدے گا | saman kaun kharide ga |  | |
| `wage.condition.advance` | the advance | ایڈوانس | advance |  | |
| `wage.condition.visitCharge` | the visit charge | آنے کا خرچہ | aane ka kharcha |  | |
| `wage.check.title` | Please check | ذرا دیکھ لیں | Zara dekh lein |  | |
| `wage.check.none` | Nothing to check: every important condition is answered. | دیکھنے کی کوئی بات نہیں: ہر اہم شرط کا جواب موجود ہے۔ | Dekhne ki koi baat nahin: har ahem shart ka jawab maujood hai. |  | |
| `wage.check.neverBlocks` | These are only notes. You can still send or agree. | یہ صرف یاد دہانیاں ہیں۔ آپ پھر بھی بھیج یا منظور کر سکتے ہیں۔ | Yeh sirf yaad dehaniyan hain. Aap phir bhi bhej ya manzoor kar sakte hain. |  | |
| `wage.check.below_minimum_day` | This is less than the government minimum wage reference for one day of work in {region} (about {reference}). Please check the price. | یہ {region} میں ایک دن کے کام کی حکومتی کم از کم اجرت کے حوالے (تقریباً {reference}) سے کم ہے۔ براہ کرم قیمت دیکھ لیں۔ | Yeh {region} mein aik din ke kaam ki hukoomati kam az kam ujrat ke hawalay (taqreeban {reference}) se kam hai. Barah-e-karam qeemat dekh lein. |  | |
| `wage.check.below_minimum_hour` | This is less than the government minimum wage reference for one hour of work in {region} (about {reference}). Please check the price. | یہ {region} میں ایک گھنٹے کے کام کی حکومتی کم از کم اجرت کے حوالے (تقریباً {reference}) سے کم ہے۔ براہ کرم قیمت دیکھ لیں۔ | Yeh {region} mein aik ghantay ke kaam ki hukoomati kam az kam ujrat ke hawalay (taqreeban {reference}) se kam hai. Barah-e-karam qeemat dekh lein. |  | |
| `wage.check.below_minimum_job_one` | This is less than the government minimum wage reference for one day of work in {region} (about {reference}). Please check the price. | یہ {region} میں ایک دن کے کام کی حکومتی کم از کم اجرت کے حوالے (تقریباً {reference}) سے کم ہے۔ براہ کرم قیمت دیکھ لیں۔ | Yeh {region} mein aik din ke kaam ki hukoomati kam az kam ujrat ke hawalay (taqreeban {reference}) se kam hai. Barah-e-karam qeemat dekh lein. |  | |
| `wage.check.below_minimum_job_two` | This is less than the government minimum wage reference for two days of work in {region} (about {reference}). Please check the price. | یہ {region} میں دو دن کے کام کی حکومتی کم از کم اجرت کے حوالے (تقریباً {reference}) سے کم ہے۔ براہ کرم قیمت دیکھ لیں۔ | Yeh {region} mein do din ke kaam ki hukoomati kam az kam ujrat ke hawalay (taqreeban {reference}) se kam hai. Barah-e-karam qeemat dekh lein. |  | |
| `wage.check.large_advance` | Paying more than half before the work is risky. | کام سے پہلے آدھے سے زیادہ پیسے دینا خطرے کی بات ہے۔ | Kaam se pehle aadhay se zyada paise dena khatray ki baat hai. |  | |
| `wage.check.worker_buys_no_advance` | Ask for money for materials before you buy them, and keep the shop bill. | سامان خریدنے سے پہلے اس کے پیسے مانگ لیں، اور دکان کی رسید سنبھال کر رکھیں۔ | Saman kharidne se pehle us ke paise maang lein, aur dukan ki raseed sambhal kar rakhein. |  | |
| `wage.check.missing_condition` | Not answered yet: {condition}. | ابھی جواب نہیں دیا: {condition}۔ | Abhi jawab nahin diya: {condition}. |  | |
| `wage.check.below_platform_range` | Lower than most prices on this platform for this work (most are {low} or more). | اس ایپ پر اس کام کی زیادہ تر قیمتوں سے کم ہے (زیادہ تر {low} یا اس سے زیادہ ہیں)۔ | Is app par is kaam ki zyada tar qeematon se kam hai (zyada tar {low} ya is se zyada hain). |  | |
| `wage.check.for.worker` | For the worker: {text} | کاریگر کے لیے: {text} | Karigar ke liye: {text} |  | |
| `wage.check.for.customer` | For the customer: {text} | گاہک کے لیے: {text} | Gahak ke liye: {text} |  | |
| `wage.readBack.title` | Is this right? | کیا یہ ٹھیک ہے؟ | Kya yeh theek hai? |  | |
| `wage.readBack.you` | You propose: {price}. | آپ کی تجویز: {price}۔ | Aap ki tajweez: {price}. |  | |
| `wage.readBack.agree` | You agree to: {price}. | آپ اس پر راضی ہیں: {price}۔ | Aap is par raazi hain: {price}. |  | |
| `wage.readBack.note` | Note: {note} | نوٹ: {note} | Note: {note} |  | |
| `wage.readBack.change` | Change | بدلیں | Badlein |  | |
| `wage.readBack.send` | Send | بھیجیں | Bhejein |  | |
| `wage.terms.title` | Price and conditions | قیمت اور شرطیں | Qeemat aur shartein |  | |
| `wage.terms.none` | Price not agreed in the app yet. | ایپ میں ابھی قیمت طے نہیں ہوئی۔ | App mein abhi qeemat tay nahin hui. |  | |
| `wage.terms.priceAgreed` | Price agreed: {price} | قیمت طے ہو گئی: {price} | Qeemat tay ho gayi: {price} |  | |
| `wage.terms.agreedOn` | Agreed by both on {date} | دونوں نے {date} کو طے کی | Dono ne {date} ko tay ki |  | |
| `wage.terms.proposedBy` | Proposed by the {by} | {by} کی تجویز | {by} ki tajweez |  | |
| `wage.terms.changeWaiting` | Change waiting, proposed by the {by} | تبدیلی منتظر ہے، {by} کی تجویز | Tabdeeli muntazir hai, {by} ki tajweez |  | |
| `wage.terms.by.customer` | customer | گاہک | gahak |  | |
| `wage.terms.by.worker` | worker | کاریگر | karigar |  | |
| `wage.terms.waitingForYou` | Waiting for your answer. | آپ کے جواب کا انتظار ہے۔ | Aap ke jawab ka intezar hai. |  | |
| `wage.terms.acceptFirst` | Accept the request first. Then you can agree to this price or propose another. | پہلے درخواست قبول کریں۔ پھر آپ یہ قیمت منظور کر سکتے ہیں یا دوسری قیمت بتا سکتے ہیں۔ | Pehle darkhwast qabool karein. Phir aap yeh qeemat manzoor kar sakte hain ya doosri qeemat bata sakte hain. |  | |
| `wage.terms.waitingForOther` | Waiting for the other person to agree. | دوسرے شخص کے منظور کرنے کا انتظار ہے۔ | Doosre shakhs ke manzoor karne ka intezar hai. |  | |
| `wage.terms.agree` | Agree | منظور کریں | Manzoor karein |  | |
| `wage.terms.agreeTitle` | Agree to this price? | کیا یہ قیمت منظور ہے؟ | Kya yeh qeemat manzoor hai? |  | |
| `wage.terms.agreedDone` | Price agreed | قیمت طے ہو گئی | Qeemat tay ho gayi |  | |
| `wage.terms.propose` | Propose a price | قیمت بتائیں | Qeemat batayein |  | |
| `wage.terms.proposeChange` | Propose a change | تبدیلی بتائیں | Tabdeeli batayein |  | |
| `wage.terms.proposeAnother` | Propose another price | دوسری قیمت بتائیں | Doosri qeemat batayein |  | |
| `wage.terms.sent` | Price sent. The other person can now agree. | قیمت بھیج دی گئی۔ اب دوسرا شخص منظور کر سکتا ہے۔ | Qeemat bhej di gayi. Ab doosra shakhs manzoor kar sakta hai. |  | |
| `wage.terms.history` | Price history ({count}) | قیمت کی تاریخ ({count}) | Qeemat ki tareekh ({count}) |  | |
| `wage.terms.event.proposed` | Version {version}: proposed by the {by} | ورژن {version}: {by} کی تجویز | Version {version}: {by} ki tajweez |  | |
| `wage.terms.event.agreed` | Version {version}: agreed by the {by} | ورژن {version}: {by} نے منظور کیا | Version {version}: {by} ne manzoor kiya |  | |
| `wage.terms.notAgreed` | not agreed | منظور نہیں ہوا | manzoor nahin hua |  | |
| `wage.offer.title` | Offer a price (optional) | قیمت کی پیشکش (اختیاری) | Qeemat ki peshkash (ikhtiyari) |  | |
| `wage.offer.lead` | You can offer a price now, or agree it with the worker later on the booking. | آپ ابھی قیمت بتا سکتے ہیں، یا بعد میں بکنگ پر کاریگر کے ساتھ طے کر سکتے ہیں۔ | Aap abhi qeemat bata sakte hain, ya baad mein booking par karigar ke saath tay kar sakte hain. |  | |
| `wage.offer.open` | Offer a price | قیمت بتائیں | Qeemat batayein |  | |
| `wage.offer.remove` | No offer now | ابھی کوئی پیشکش نہیں | Abhi koi peshkash nahin |  | |
| `wage.offer.conditionsLater` | The conditions (materials, advance, payment) are agreed on the booking after the worker accepts. | شرطیں (سامان، ایڈوانس، ادائیگی) کاریگر کے قبول کرنے کے بعد بکنگ پر طے ہوں گی۔ | Shartein (saman, advance, adaigi) karigar ke qabool karne ke baad booking par tay hongi. |  | |
| `wage.card.agreed` | Price agreed: {amount} | قیمت طے: {amount} | Qeemat tay: {amount} |  | |
| `wage.card.offered` | Offer: {price} | پیشکش: {price} | Peshkash: {price} |  | |
| `wage.card.proposed` | Price proposed: {price} | تجویز کردہ قیمت: {price} | Tajweez karda qeemat: {price} |  | |
| `wage.card.none` | No price agreed yet | ابھی قیمت طے نہیں | Abhi qeemat tay nahin |  | |
| `wage.card.changeWaiting` | A change is waiting | ایک تبدیلی منتظر ہے | Aik tabdeeli muntazir hai |  | |

## Payments, payment record, earnings (89)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `wage.pay.title` | Payments | ادائیگیاں | Adaigiyan |  | |
| `wage.pay.noMoney` | The app does not move money. It keeps a record you both confirm. | ایپ پیسے نہیں بھیجتی۔ یہ صرف ریکارڈ رکھتی ہے جس کی آپ دونوں تصدیق کرتے ہیں۔ | App paise nahin bhejti. Yeh sirf record rakhti hai jis ki aap dono tasdeeq karte hain. |  | |
| `wage.pay.agreed` | Agreed {amount} | طے شدہ {amount} | Tay shuda {amount} |  | |
| `wage.pay.confirmed` | Confirmed paid {amount} | تصدیق شدہ ادائیگی {amount} | Tasdeeq shuda adaigi {amount} |  | |
| `wage.pay.left` | {amount} left to pay | {amount} باقی ہیں | {amount} baqi hain |  | |
| `wage.pay.nothingLeft` | Nothing left to pay | کچھ باقی نہیں | Kuch baqi nahin |  | |
| `wage.pay.more` | {amount} more than the agreed price | طے شدہ قیمت سے {amount} زیادہ | Tay shuda qeemat se {amount} zyada |  | |
| `wage.pay.awaitingLine` | Waiting for confirmation: {amount} | تصدیق کا انتظار: {amount} | Tasdeeq ka intezar: {amount} |  | |
| `wage.pay.disputedLine` | Marked "not right": {amount} | "درست نہیں" کہا گیا: {amount} | "Durust nahin" kaha gaya: {amount} |  | |
| `wage.pay.materialsLine` | Money for materials: {amount} | سامان کے پیسے: {amount} | Saman ke paise: {amount} |  | |
| `wage.pay.by.customer` | recorded by the customer | گاہک نے درج کیا | gahak ne darj kiya |  | |
| `wage.pay.by.worker` | recorded by the worker | کاریگر نے درج کیا | karigar ne darj kiya |  | |
| `wage.pay.waitingOther` | Waiting for the other person to confirm. | دوسرے شخص کی تصدیق کا انتظار ہے۔ | Doosre shakhs ki tasdeeq ka intezar hai. |  | |
| `wage.pay.yes.worker` | Yes, I received it | جی، مجھے مل گئے | Ji, mujhe mil gaye |  | |
| `wage.pay.yes.customer` | Yes, I paid this | جی، میں نے دیے | Ji, main ne diye |  | |
| `wage.pay.confirmTitle.worker` | Did you receive this money? | کیا آپ کو یہ پیسے مل گئے؟ | Kya aap ko yeh paise mil gaye? |  | |
| `wage.pay.confirmTitle.customer` | Did you pay this? | کیا آپ نے یہ پیسے دیے؟ | Kya aap ne yeh paise diye? |  | |
| `wage.pay.notRight` | This is not right | یہ درست نہیں | Yeh durust nahin |  | |
| `wage.pay.disputeTitle` | What is not right? | کیا درست نہیں؟ | Kya durust nahin? |  | |
| `wage.pay.disputeText` | The record stays, marked "not right". To correct a mistake, record the payment again. | ریکارڈ رہے گا، "درست نہیں" کے نشان کے ساتھ۔ غلطی ٹھیک کرنے کے لیے ادائیگی دوبارہ درج کریں۔ | Record rahay ga, "durust nahin" ke nishan ke saath. Ghalti theek karne ke liye adaigi dobara darj karein. |  | |
| `wage.pay.reason` | Reason | وجہ | Wajah |  | |
| `wage.pay.reasons.not_received` | Money not received | پیسے نہیں ملے | Paise nahin milay |  | |
| `wage.pay.reasons.wrong_amount` | Wrong amount | رقم غلط ہے | Raqam ghalat hai |  | |
| `wage.pay.reasons.other` | Something else | کچھ اور | Kuch aur |  | |
| `wage.pay.disputeNote` | Note (optional) | نوٹ (اختیاری) | Note (ikhtiyari) |  | |
| `wage.pay.disputedBecause` | Not right: {reason} | درست نہیں: {reason} | Durust nahin: {reason} |  | |
| `wage.pay.record` | Record a payment | ادائیگی درج کریں | Adaigi darj karein |  | |
| `wage.pay.recordTitle.customer` | I paid | میں نے پیسے دیے | Main ne paise diye |  | |
| `wage.pay.recordTitle.worker` | I received | مجھے پیسے ملے | Mujhe paise milay |  | |
| `wage.pay.kind` | What was it for? | یہ کس لیے تھے؟ | Yeh kis liye thay? |  | |
| `wage.pay.amount` | Amount | رقم | Raqam |  | |
| `wage.pay.method` | How was it paid? | کیسے دیے گئے؟ | Kaise diye gaye? |  | |
| `wage.pay.when` | When? | کب؟ | Kab? |  | |
| `wage.pay.today` | Today | آج | Aaj |  | |
| `wage.pay.pickDay` | Another day | کوئی اور دن | Koi aur din |  | |
| `wage.pay.date` | Day of the payment | ادائیگی کا دن | Adaigi ka din |  | |
| `wage.pay.save` | Save the record | ریکارڈ محفوظ کریں | Record mehfooz karein |  | |
| `wage.pay.needKind` | Please choose what the payment was for. | براہ کرم چنیں کہ ادائیگی کس لیے تھی۔ | Barah-e-karam chunein ke adaigi kis liye thi. |  | |
| `wage.pay.needAmount` | Please write the amount in rupees. | براہ کرم رقم روپوں میں لکھیں۔ | Barah-e-karam raqam rupon mein likhein. |  | |
| `wage.pay.needReason` | Please choose what is not right. | براہ کرم چنیں کہ کیا درست نہیں۔ | Barah-e-karam chunein ke kya durust nahin. |  | |
| `wage.pay.recordedDone` | Payment recorded. The other person will be asked to confirm. | ادائیگی درج ہو گئی۔ دوسرے شخص سے تصدیق مانگی جائے گی۔ | Adaigi darj ho gayi. Doosre shakhs se tasdeeq maangi jayegi. |  | |
| `wage.pay.confirmedDone` | Payment confirmed | ادائیگی کی تصدیق ہو گئی | Adaigi ki tasdeeq ho gayi |  | |
| `wage.pay.disputedDone` | Marked as not right | "درست نہیں" کا نشان لگ گیا | "Durust nahin" ka nishan lag gaya |  | |
| `wage.pay.printable` | Printable payment record | ادائیگی کا ریکارڈ (پرنٹ کے لیے) | Adaigi ka record (print ke liye) |  | |
| `wage.kind.advance` | Advance | ایڈوانس | Advance |  | |
| `wage.kind.part` | Part payment | کچھ ادائیگی | Kuch adaigi |  | |
| `wage.kind.final` | Final payment | آخری ادائیگی | Aakhri adaigi |  | |
| `wage.kind.materials` | Money for materials | سامان کے پیسے | Saman ke paise |  | |
| `wage.kind.extra_work` | Extra work | اضافی کام | Izafi kaam |  | |
| `wage.record.awaiting_confirmation` | Not confirmed yet | ابھی تصدیق نہیں ہوئی | Abhi tasdeeq nahin hui |  | |
| `wage.record.confirmed` | Confirmed | تصدیق شدہ | Tasdeeq shuda |  | |
| `wage.record.disputed` | Not right | درست نہیں | Durust nahin |  | |
| `wage.state.no_price` | No price agreed | قیمت طے نہیں | Qeemat tay nahin |  | |
| `wage.state.not_paid` | Not paid yet | ابھی ادائیگی نہیں | Abhi adaigi nahin |  | |
| `wage.state.part_paid` | Part paid | کچھ ادائیگی ہو گئی | Kuch adaigi ho gayi |  | |
| `wage.state.paid` | Paid | ادائیگی مکمل | Adaigi mukammal |  | |
| `wage.state.has_dispute` | Payment question open | ادائیگی پر سوال | Adaigi par sawal |  | |
| `wage.record.title` | Payment record | ادائیگی کا ریکارڈ | Adaigi ka record |  | |
| `wage.record.lead` | The price and every payment of this booking, as both people recorded them. | اس بکنگ کی قیمت اور ہر ادائیگی، جیسے دونوں نے درج کی۔ | Is booking ki qeemat aur har adaigi, jaise dono ne darj ki. |  | |
| `wage.record.print` | Print | پرنٹ کریں | Print karein |  | |
| `wage.record.code` | Booking number | بکنگ نمبر | Booking number |  | |
| `wage.record.work` | Work | کام | Kaam |  | |
| `wage.record.date` | Day of the work | کام کا دن | Kaam ka din |  | |
| `wage.record.worker` | Worker | کاریگر | Karigar |  | |
| `wage.record.customer` | Customer | گاہک | Gahak |  | |
| `wage.record.price` | Agreed price | طے شدہ قیمت | Tay shuda qeemat |  | |
| `wage.record.conditions` | Conditions | شرطیں | Shartein |  | |
| `wage.record.agreedOn` | Agreed on | طے ہونے کی تاریخ | Tay hone ki tareekh |  | |
| `wage.record.noPayments` | No payment recorded yet. | ابھی کوئی ادائیگی درج نہیں۔ | Abhi koi adaigi darj nahin. |  | |
| `wage.record.paidOn` | Day | دن | Din |  | |
| `wage.record.recordedBy` | Recorded by | کس نے درج کیا | Kis ne darj kiya |  | |
| `wage.record.status` | Status | حالت | Haalat |  | |
| `wage.record.notBank` | This is a record that both people confirmed in the app. It is not a bank receipt. | یہ وہ ریکارڈ ہے جس کی دونوں نے ایپ میں تصدیق کی۔ یہ بینک کی رسید نہیں۔ | Yeh woh record hai jis ki dono ne app mein tasdeeq ki. Yeh bank ki raseed nahin. |  | |
| `wage.record.madeOn` | Made on {date} | {date} کو بنایا گیا | {date} ko banaya gaya |  | |
| `wage.earnings.title` | My earnings | میری کمائی | Meri kamai |  | |
| `wage.earnings.lead` | Money your customers confirmed, month by month. Waiting and disputed money is shown apart. | وہ پیسے جن کی گاہکوں نے تصدیق کی، مہینہ وار۔ انتظار والے اور متنازع پیسے الگ دکھائے گئے ہیں۔ | Woh paise jin ki gahakon ne tasdeeq ki, maheena waar. Intezar walay aur mutnaza paise alag dikhaye gaye hain. |  | |
| `wage.earnings.thisMonth` | This month ({month}) | یہ مہینہ ({month}) | Yeh maheena ({month}) |  | |
| `wage.earnings.onlyConfirmed` | Only payments that were confirmed are counted here. | یہاں صرف تصدیق شدہ ادائیگیاں گنی گئی ہیں۔ | Yahan sirf tasdeeq shuda adaigiyan gini gayi hain. |  | |
| `wage.earnings.monthTotal` | {amount} confirmed · {count} jobs | {amount} تصدیق شدہ · {count} کام | {amount} tasdeeq shuda · {count} kaam |  | |
| `wage.earnings.awaiting` | Waiting for the customer's confirmation: {amount} (not added in) | گاہک کی تصدیق کا انتظار: {amount} (شامل نہیں) | Gahak ki tasdeeq ka intezar: {amount} (shamil nahin) |  | |
| `wage.earnings.disputed` | Disputed: {amount} (not added in) | متنازع: {amount} (شامل نہیں) | Mutnaza: {amount} (shamil nahin) |  | |
| `wage.earnings.materials` | Money for materials: {amount} (not earnings) | سامان کے پیسے: {amount} (کمائی نہیں) | Saman ke paise: {amount} (kamai nahin) |  | |
| `wage.earnings.agreed` | Agreed {amount} | طے شدہ {amount} | Tay shuda {amount} |  | |
| `wage.earnings.noPrice` | No price agreed | قیمت طے نہیں | Qeemat tay nahin |  | |
| `wage.earnings.received` | received {amount} | ملے {amount} | milay {amount} |  | |
| `wage.earnings.empty` | No payments yet | ابھی کوئی ادائیگی نہیں | Abhi koi adaigi nahin |  | |
| `wage.earnings.emptyText` | When a customer records a payment and you confirm it, it appears here. | جب گاہک ادائیگی درج کریں اور آپ تصدیق کریں، تو وہ یہاں نظر آئے گی۔ | Jab gahak adaigi darj karein aur aap tasdeeq karein, to woh yahan nazar aayegi. |  | |
| `wage.earnings.tile` | Confirmed in {month} | {month} میں تصدیق شدہ | {month} mein tasdeeq shuda |  | |
| `wage.earnings.open` | Open my earnings | میری کمائی کھولیں | Meri kamai kholein |  | |

## Work protection and the Help Centre guide (60)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `wage.protect.title.agree_first` | Agree the price first | پہلے قیمت طے کریں | Pehle qeemat tay karein |  | |
| `wage.protect.title.materials` | Materials | سامان | Saman |  | |
| `wage.protect.title.extra_work` | Extra work | اضافی کام | Izafi kaam |  | |
| `wage.protect.title.record_payments` | Record every payment | ہر ادائیگی درج کریں | Har adaigi darj karein |  | |
| `wage.protect.title.safety` | Work safely | محفوظ کام کریں | Mehfooz kaam karein |  | |
| `wage.protect.title.emergency` | In an emergency | ایمرجنسی میں | Emergency mein |  | |
| `wage.protect.title.advance` | No big advance | بڑا ایڈوانس نہیں | Bara advance nahin |  | |
| `wage.protect.title.pay_on_time` | Pay on time | وقت پر ادائیگی | Waqt par adaigi |  | |
| `wage.protect.title.safe_workplace` | A safe workplace | محفوظ جگہ | Mehfooz jagah |  | |
| `wage.protect.title.minimum_wage` | Minimum wage reference | کم از کم اجرت کا حوالہ | Kam az kam ujrat ka hawala |  | |
| `wage.protect.worker.agree_first` | Agree the price in the app before you start. The app keeps the record. | کام شروع کرنے سے پہلے ایپ میں قیمت طے کریں۔ ایپ ریکارڈ رکھتی ہے۔ | Kaam shuru karne se pehle app mein qeemat tay karein. App record rakhti hai. |  | |
| `wage.protect.worker.materials` | Say who buys the materials. Keep the shop bill. | بتائیں کہ سامان کون خریدے گا۔ دکان کی رسید رکھیں۔ | Batayein ke saman kaun kharide ga. Dukan ki raseed rakhein. |  | |
| `wage.protect.worker.extra_work` | Extra work only after a new price is agreed in the app. | اضافی کام صرف تب، جب ایپ میں نئی قیمت طے ہو جائے۔ | Izafi kaam sirf tab, jab app mein nayi qeemat tay ho jaye. |  | |
| `wage.protect.worker.record_payments` | Record every payment and ask the customer to confirm it. | ہر ادائیگی درج کریں اور گاہک سے اس کی تصدیق کروائیں۔ | Har adaigi darj karein aur gahak se us ki tasdeeq karwayein. |  | |
| `wage.protect.worker.emergency` | In an emergency call 1122 (Rescue) or 15 (Police). For a labour complaint in Punjab: Punjab Labour Helpline 1314. | ایمرجنسی میں 1122 (ریسکیو) یا 15 (پولیس) پر کال کریں۔ پنجاب میں مزدوری کی شکایت کے لیے: پنجاب لیبر ہیلپ لائن 1314۔ | Emergency mein 1122 (Rescue) ya 15 (Police) par call karein. Punjab mein mazdoori ki shikayat ke liye: Punjab Labour Helpline 1314. |  | |
| `wage.protect.customer.agree_first` | Agree the price and the conditions in the app before the work starts. | کام شروع ہونے سے پہلے ایپ میں قیمت اور شرطیں طے کریں۔ | Kaam shuru hone se pehle app mein qeemat aur shartein tay karein. |  | |
| `wage.protect.customer.advance` | Do not pay a big advance. For materials, pay against the shop bill. | بڑا ایڈوانس نہ دیں۔ سامان کے لیے دکان کی رسید دیکھ کر پیسے دیں۔ | Bara advance na dein. Saman ke liye dukan ki raseed dekh kar paise dein. |  | |
| `wage.protect.customer.pay_on_time` | Pay on time, as agreed, and record the payment. | طے کے مطابق وقت پر پیسے دیں، اور ادائیگی درج کریں۔ | Tay ke mutabiq waqt par paise dein, aur adaigi darj karein. |  | |
| `wage.protect.customer.safe_workplace` | Show the main switch and the water valve, keep children away, and give water and a break on a full day. | مین سوئچ اور پانی کا والو دکھائیں، بچوں کو دور رکھیں، اور پورے دن کے کام میں پانی اور وقفہ دیں۔ | Main switch aur paani ka valve dikhayein, bachon ko door rakhein, aur poore din ke kaam mein paani aur waqfa dein. |  | |
| `wage.protect.customer.minimum_wage` | The government minimum wage for your region is shown as a reference, so a day of work is not paid less. | آپ کے علاقے کی حکومتی کم از کم اجرت حوالے کے طور پر دکھائی جاتی ہے، تاکہ ایک دن کے کام کی اجرت اس سے کم نہ ہو۔ | Aap ke ilaqay ki hukoomati kam az kam ujrat hawalay ke taur par dikhai jati hai, taake aik din ke kaam ki ujrat is se kam na ho. |  | |
| `wage.protect.safety.electrical` | Electrical work: switch off the main power and check that it is off. | بجلی کا کام: مین بجلی بند کریں اور چیک کریں کہ بند ہے۔ | Bijli ka kaam: main bijli band karein aur check karein ke band hai. |  | |
| `wage.protect.safety.height` | Work at height: use a ladder that stands firmly, with someone holding it. | اونچائی پر کام: مضبوط کھڑی سیڑھی استعمال کریں، کوئی اسے پکڑے رکھے۔ | Unchai par kaam: mazboot khari seerhi istemal karein, koi ise pakray rakhe. |  | |
| `wage.protect.safety.chemicals` | Paint, cement and chemicals: wear gloves and a mask. | رنگ، سیمنٹ اور کیمیکل: دستانے اور ماسک پہنیں۔ | Rang, cement aur chemical: dastanay aur mask pehnein. |  | |
| `wage.protect.safety.tanks` | Tanks and closed spaces: never go in alone. | ٹینک اور بند جگہیں: کبھی اکیلے اندر نہ جائیں۔ | Tank aur band jaghein: kabhi akelay andar na jayein. |  | |
| `wage.protect.safety.general` | General advice from the team, not training. | یہ ٹیم کا عام مشورہ ہے، تربیت نہیں۔ | Yeh team ka aam mashwara hai, tarbiyat nahin. |  | |
| `wage.protect.close` | Close: {title} | بند کریں: {title} | Band karein: {title} |  | |
| `wage.guide.title` | Fair pay and safe work | مناسب اجرت اور محفوظ کام | Munasib ujrat aur mehfooz kaam |  | |
| `wage.guide.lead` | Short tips for workers and customers, the government minimum wage figures with their sources, and helpline numbers. | کاریگروں اور گاہکوں کے لیے مختصر باتیں، حکومت کی کم از کم اجرت کی رقمیں ان کے ذرائع کے ساتھ، اور ہیلپ لائن نمبر۔ | Karigaron aur gahakon ke liye mukhtasar baatein, hukoomat ki kam az kam ujrat ki raqamein un ke zaraye ke saath, aur helpline number. |  | |
| `wage.guide.keywords` | price wage minimum payment safety helpline | قیمت اجرت کم از کم ادائیگی حفاظت ہیلپ لائن | qeemat ujrat kam az kam adaigi hifazat helpline |  | |
| `wage.guide.tabsLabel` | Tips for | کس کے لیے | Kis ke liye |  | |
| `wage.guide.forWorkers` | For workers | کاریگروں کے لیے | Karigaron ke liye |  | |
| `wage.guide.forCustomers` | For customers | گاہکوں کے لیے | Gahakon ke liye |  | |
| `wage.guide.seeTable` | See the table below | نیچے جدول دیکھیں | Neeche jadwal dekhein |  | |
| `wage.guide.tableTitle` | Government minimum wage by region | علاقے کے لحاظ سے حکومتی کم از کم اجرت | Ilaqay ke lihaaz se hukoomati kam az kam ujrat |  | |
| `wage.guide.tableCaption` | Monthly minimum wage for adult unskilled workers, as notified or announced | بالغ غیر ہنر مند کارکنوں کی ماہانہ کم از کم اجرت، جیسے نوٹیفائی یا اعلان ہوئی | Baligh ghair hunarmand karkunon ki mahana kam az kam ujrat, jaise notify ya elaan hui |  | |
| `wage.guide.region` | Region | علاقہ | Ilaqa |  | |
| `wage.guide.monthly` | A month | ماہانہ | Mahana |  | |
| `wage.guide.daily` | A day (÷ {days}) | روزانہ (÷ {days}) | Rozana (÷ {days}) |  | |
| `wage.guide.hourly` | An hour (÷ {hours}) | فی گھنٹہ (÷ {hours}) | Fi ghanta (÷ {hours}) |  | |
| `wage.guide.statusHeader` | Status | حالت | Haalat |  | |
| `wage.guide.sourcesHeader` | Sources | ذرائع | Zaraye |  | |
| `wage.guide.status.notified` | Notified ({date}) | نوٹیفکیشن جاری ({date}) | Notification jari ({date}) |  | |
| `wage.guide.status.announced` | Announced in the budget ({date}); the official notification was not found yet | بجٹ میں اعلان ({date})؛ سرکاری نوٹیفکیشن ابھی نہیں ملا | Budget mein elaan ({date}); sarkari notification abhi nahin mila |  | |
| `wage.guide.status.none` | No figure in the app | ایپ میں کوئی رقم نہیں | App mein koi raqam nahin |  | |
| `wage.guide.noDate` | date not confirmed | تاریخ کی تصدیق نہیں | tareekh ki tasdeeq nahin |  | |
| `wage.guide.from` | From {date} | {date} سے | {date} se |  | |
| `wage.guide.fromUnknown` | Start date not confirmed | شروع ہونے کی تاریخ کی تصدیق نہیں | Shuru hone ki tareekh ki tasdeeq nahin |  | |
| `wage.guide.notifiedFound` | The notified figure found: {amount} from {date} | ملنے والی نوٹیفائیڈ رقم: {date} سے {amount} | Milnay wali notified raqam: {date} se {amount} |  | |
| `wage.guide.checkedOn` | Checked on {date}. The team checks these figures every July. | {date} کو چیک کیا گیا۔ ٹیم یہ رقمیں ہر جولائی میں چیک کرتی ہے۔ | {date} ko check kiya gaya. Team yeh raqamein har July mein check karti hai. |  | |
| `wage.guide.convention` | A day is the month ÷ {days} working days; an hour is a day ÷ {hours} hours, as the notifications count. Source: | دن = مہینہ ÷ {days} کام کے دن؛ گھنٹہ = دن ÷ {hours} گھنٹے، جیسے نوٹیفکیشن میں گنا جاتا ہے۔ ذریعہ: | Din = maheena ÷ {days} kaam ke din; ghanta = din ÷ {hours} ghantay, jaise notification mein gina jata hai. Zariya: |  | |
| `wage.guide.tableFailed` | The table could not be loaded. Please try again later. | جدول نہیں کھل سکا۔ براہ کرم بعد میں دوبارہ کوشش کریں۔ | Jadwal nahin khul saka. Barah-e-karam baad mein dobara koshish karein. |  | |
| `wage.guide.helplinesTitle` | Helpline numbers | ہیلپ لائن نمبر | Helpline number |  | |
| `wage.guide.helpline.rescue` | Rescue (emergency) | ریسکیو (ایمرجنسی) | Rescue (emergency) |  | |
| `wage.guide.helpline.police` | Police (emergency) | پولیس (ایمرجنسی) | Police (emergency) |  | |
| `wage.guide.helpline.labour` | Punjab Labour Helpline (labour complaints in Punjab) | پنجاب لیبر ہیلپ لائن (پنجاب میں مزدوری کی شکایات) | Punjab Labour Helpline (Punjab mein mazdoori ki shikayaat) |  | |
| `wage.guide.sources.rescue` | Source: Rescue 1122 overview | ذریعہ: ریسکیو 1122 کا تعارف | Zariya: Rescue 1122 ka taaruf |  | |
| `wage.guide.sources.police` | Source: Islamabad Police, "For Emergency Call: 15" | ذریعہ: اسلام آباد پولیس، "For Emergency Call: 15" | Zariya: Islamabad Police, "For Emergency Call: 15" |  | |
| `wage.guide.sources.labour` | Source: Express Tribune, 9 Nov 2026 | ذریعہ: ایکسپریس ٹریبیون، 9 نومبر 2026 | Zariya: Express Tribune, 9 November 2026 |  | |
| `wage.guide.helplinesCheck` | The team checks these numbers before the app goes live. | ایپ شروع ہونے سے پہلے ٹیم یہ نمبر چیک کرتی ہے۔ | App shuru hone se pehle team yeh number check karti hai. |  | |
| `wage.guide.notAdvice` | This is information, not legal advice. | یہ معلومات ہیں، قانونی مشورہ نہیں۔ | Yeh maloomat hain, qanooni mashwara nahin. |  | |

## Notifications (10)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `wage.notify.terms_proposed.title` | New price proposed: {skill} | نئی قیمت کی تجویز: {skill} | Nayi qeemat ki tajweez: {skill} |  | |
| `wage.notify.terms_proposed.text` | Booking {code}: {amount} {unit}. Open it to agree or answer. | بکنگ {code}: {unit} {amount}۔ منظور کرنے یا جواب دینے کے لیے کھولیں۔ | Booking {code}: {unit} {amount}. Manzoor karne ya jawab dene ke liye kholein. |  | |
| `wage.notify.terms_agreed.title` | Price agreed: {skill} | قیمت طے ہو گئی: {skill} | Qeemat tay ho gayi: {skill} |  | |
| `wage.notify.terms_agreed.text` | Booking {code}: {amount} {unit}, agreed by both. | بکنگ {code}: {unit} {amount}، دونوں نے منظور کی۔ | Booking {code}: {unit} {amount}, dono ne manzoor ki. |  | |
| `wage.notify.payment_recorded.title` | Please confirm a payment: {skill} | براہ کرم ادائیگی کی تصدیق کریں: {skill} | Barah-e-karam adaigi ki tasdeeq karein: {skill} |  | |
| `wage.notify.payment_recorded.text` | Booking {code}: {amount} was recorded. Is it right? | بکنگ {code}: {amount} درج ہوئے۔ کیا یہ درست ہے؟ | Booking {code}: {amount} darj huay. Kya yeh durust hai? |  | |
| `wage.notify.payment_confirmed.title` | Payment confirmed: {skill} | ادائیگی کی تصدیق ہو گئی: {skill} | Adaigi ki tasdeeq ho gayi: {skill} |  | |
| `wage.notify.payment_confirmed.text` | Booking {code}: {amount} was confirmed. | بکنگ {code}: {amount} کی تصدیق ہو گئی۔ | Booking {code}: {amount} ki tasdeeq ho gayi. |  | |
| `wage.notify.payment_disputed.title` | Payment marked not right: {skill} | ادائیگی کو درست نہیں کہا گیا: {skill} | Adaigi ko durust nahin kaha gaya: {skill} |  | |
| `wage.notify.payment_disputed.text` | Booking {code}: {amount}. Open it to see why. | بکنگ {code}: {amount}۔ وجہ دیکھنے کے لیے کھولیں۔ | Booking {code}: {amount}. Wajah dekhne ke liye kholein. |  | |

## Admin (63)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `wage.admin.nav.guide` | Price guide | قیمت گائیڈ | Qeemat guide |  | |
| `wage.admin.nav.payments` | Payments | ادائیگیاں | Adaigiyan |  | |
| `wage.admin.staleTitle` | Check the minimum wage figures | کم از کم اجرت کی رقمیں چیک کریں | Kam az kam ujrat ki raqamein check karein |  | |
| `wage.admin.staleText` | At least one figure was checked more than {days} days ago. Check the provincial notifications and update backend/config/wageReferences.js. | کم از کم ایک رقم {days} دن سے زیادہ پہلے چیک ہوئی تھی۔ صوبائی نوٹیفکیشن دیکھیں اور backend/config/wageReferences.js تازہ کریں۔ | Kam az kam aik raqam {days} din se zyada pehle check hui thi. Soobai notification dekhein aur backend/config/wageReferences.js taaza karein. |  | |
| `wage.admin.guide.title` | Price guide | قیمت گائیڈ | Qeemat guide |  | |
| `wage.admin.guide.lead` | Price ranges typed by the admin team, shown only where the platform has no range of its own. Always with a source. | ایڈمن ٹیم کی لکھی قیمت کی حدیں، صرف وہاں دکھائی جاتی ہیں جہاں ایپ کی اپنی حد نہ ہو۔ ہمیشہ ذریعے کے ساتھ۔ | Admin team ki likhi qeemat ki hadein, sirf wahan dikhai jati hain jahan app ki apni had na ho. Hamesha zariye ke saath. |  | |
| `wage.admin.guide.warningTitle` | Only numbers with a source | صرف ذریعے والی رقمیں | Sirf zariye wali raqamein |  | |
| `wage.admin.guide.warning` | Type only numbers you can show a source for. Never guess. | صرف وہ رقمیں لکھیں جن کا ذریعہ آپ دکھا سکیں۔ کبھی اندازہ نہ لگائیں۔ | Sirf woh raqamein likhein jin ka zariya aap dikha sakein. Kabhi andaza na lagayein. |  | |
| `wage.admin.guide.new` | New entry | نیا اندراج | Naya indiraj |  | |
| `wage.admin.guide.newTitle` | New price guide entry | قیمت گائیڈ کا نیا اندراج | Qeemat guide ka naya indiraj |  | |
| `wage.admin.guide.editTitle` | Change the numbers | رقمیں بدلیں | Raqamein badlein |  | |
| `wage.admin.guide.save` | Save | محفوظ کریں | Mehfooz karein |  | |
| `wage.admin.guide.saved` | Price guide saved | قیمت گائیڈ محفوظ ہو گئی | Qeemat guide mehfooz ho gayi |  | |
| `wage.admin.guide.category` | Trade | شعبہ | Shoba |  | |
| `wage.admin.guide.chooseCategory` | Choose a trade | شعبہ چنیں | Shoba chunein |  | |
| `wage.admin.guide.allCategories` | All trades | تمام شعبے | Tamam shobay |  | |
| `wage.admin.guide.needCategory` | Please choose a trade. | براہ کرم شعبہ چنیں۔ | Barah-e-karam shoba chunein. |  | |
| `wage.admin.guide.skill` | Work | کام | Kaam |  | |
| `wage.admin.guide.wholeCategory` | The whole trade | پورا شعبہ | Poora shoba |  | |
| `wage.admin.guide.work` | Work | کام | Kaam |  | |
| `wage.admin.guide.unit` | Unit | اکائی | Ikai |  | |
| `wage.admin.guide.region` | Region | علاقہ | Ilaqa |  | |
| `wage.admin.guide.allPakistan` | All of Pakistan | پورا پاکستان | Poora Pakistan |  | |
| `wage.admin.guide.low` | Low price | کم قیمت | Kam qeemat |  | |
| `wage.admin.guide.high` | High price | زیادہ قیمت | Zyada qeemat |  | |
| `wage.admin.guide.range` | Range | حد | Had |  | |
| `wage.admin.guide.source` | Source (required) | ذریعہ (ضروری) | Zariya (zaroori) |  | |
| `wage.admin.guide.sourceHint` | Where do these numbers come from? For example: team survey of 6 electricians in G-9, Nov 2026. | یہ رقمیں کہاں سے آئیں؟ مثلاً: جی نائن میں 6 الیکٹریشنز کا ٹیم سروے، نومبر 2026۔ | Yeh raqamein kahan se aayin? Maslan: G-9 mein 6 electricians ka team survey, November 2026. |  | |
| `wage.admin.guide.note` | Note for users (optional) | صارفین کے لیے نوٹ (اختیاری) | Sarifeen ke liye note (ikhtiyari) |  | |
| `wage.admin.guide.noteHint` | Shown with the range. No phone numbers or links. | حد کے ساتھ دکھایا جاتا ہے۔ فون نمبر یا لنک نہیں۔ | Had ke saath dikhaya jata hai. Phone number ya link nahin. |  | |
| `wage.admin.guide.status` | Status | حالت | Haalat |  | |
| `wage.admin.guide.statuses.active` | Active | فعال | Faal |  | |
| `wage.admin.guide.statuses.archived` | Archived | آرکائیو | Archive |  | |
| `wage.admin.guide.statuses.all` | All | سب | Sab |  | |
| `wage.admin.guide.synthetic` | Synthetic demo entry | مصنوعی ڈیمو اندراج | Masnooi demo indiraj |  | |
| `wage.admin.guide.actions` | Actions | اقدامات | Iqdamaat |  | |
| `wage.admin.guide.edit` | Edit | بدلیں | Badlein |  | |
| `wage.admin.guide.archive` | Archive | آرکائیو کریں | Archive karein |  | |
| `wage.admin.guide.archiveTitle` | Archive this entry? | یہ اندراج آرکائیو کریں؟ | Yeh indiraj archive karein? |  | |
| `wage.admin.guide.archiveText` | It is no longer shown to users. It stays in the history and in the audit log. | یہ اب صارفین کو نہیں دکھایا جائے گا۔ یہ تاریخ اور آڈٹ لاگ میں رہے گا۔ | Yeh ab sarifeen ko nahin dikhaya jayega. Yeh tareekh aur audit log mein rahay ga. |  | |
| `wage.admin.guide.archived` | Entry archived | اندراج آرکائیو ہو گیا | Indiraj archive ho gaya |  | |
| `wage.admin.guide.history` | History | تاریخ | Tareekh |  | |
| `wage.admin.guide.historyTitle` | Change history (audit log) | تبدیلیوں کی تاریخ (آڈٹ لاگ) | Tabdeeliyon ki tareekh (audit log) |  | |
| `wage.admin.guide.noHistory` | No changes recorded. | کوئی تبدیلی درج نہیں۔ | Koi tabdeeli darj nahin. |  | |
| `wage.admin.guide.events.created` | Created | بنایا گیا | Banaya gaya |  | |
| `wage.admin.guide.events.updated` | Changed | بدلا گیا | Badla gaya |  | |
| `wage.admin.guide.events.archived` | Archived | آرکائیو کیا گیا | Archive kiya gaya |  | |
| `wage.admin.guide.empty` | No entries | کوئی اندراج نہیں | Koi indiraj nahin |  | |
| `wage.admin.guide.emptyText` | The price guide starts empty. Add an entry only when you have a written source. | قیمت گائیڈ خالی شروع ہوتی ہے۔ اندراج صرف تب کریں جب تحریری ذریعہ موجود ہو۔ | Qeemat guide khali shuru hoti hai. Indiraj sirf tab karein jab tehreeri zariya maujood ho. |  | |
| `wage.admin.guide.usedWhen` | Users see the guide only when the platform has too few agreed prices for a range. Order: the work in the region, the work in Pakistan, the trade in the region, the trade in Pakistan. | صارفین گائیڈ صرف تب دیکھتے ہیں جب ایپ پر حد کے لیے طے شدہ قیمتیں کم ہوں۔ ترتیب: علاقے میں کام، پاکستان میں کام، علاقے میں شعبہ، پاکستان میں شعبہ۔ | Sarifeen guide sirf tab dekhte hain jab app par had ke liye tay shuda qeematein kam hon. Tarteeb: ilaqay mein kaam, Pakistan mein kaam, ilaqay mein shoba, Pakistan mein shoba. |  | |
| `wage.admin.payments.title` | Payments | ادائیگیاں | Adaigiyan |  | |
| `wage.admin.payments.lead` | Bookings by payment state, disputed first. Open a row for its timeline, price history and payment records. | ادائیگی کی حالت کے لحاظ سے بکنگز، متنازع پہلے۔ ٹائم لائن، قیمت کی تاریخ اور ادائیگیوں کے لیے قطار کھولیں۔ | Adaigi ki haalat ke lihaaz se bookings, mutnaza pehle. Timeline, qeemat ki tareekh aur adaigiyon ke liye qataar kholein. |  | |
| `wage.admin.payments.readOnly` | This page is read-only. A disputed payment is only marked; decisions about payments come with Module 9. The app never moves money. | یہ صفحہ صرف دیکھنے کے لیے ہے۔ متنازع ادائیگی پر صرف نشان لگتا ہے؛ فیصلے ماڈیول 9 کے ساتھ آئیں گے۔ ایپ کبھی پیسے نہیں بھیجتی۔ | Yeh safha sirf dekhne ke liye hai. Mutnaza adaigi par sirf nishan lagta hai; faislay Module 9 ke saath aayenge. App kabhi paise nahin bhejti. |  | |
| `wage.admin.payments.state` | Payment state | ادائیگی کی حالت | Adaigi ki haalat |  | |
| `wage.admin.payments.all` | All with money records | تمام، جن کا پیسوں کا ریکارڈ ہے | Tamam, jin ka paison ka record hai |  | |
| `wage.admin.payments.people` | Worker / customer | کاریگر / گاہک | Karigar / gahak |  | |
| `wage.admin.payments.money` | Money | رقم | Raqam |  | |
| `wage.admin.payments.records` | Records | ریکارڈ | Record |  | |
| `wage.admin.payments.count` | {count} bookings · {disputed} with a payment question | {count} بکنگز · {disputed} پر ادائیگی کا سوال | {count} bookings · {disputed} par adaigi ka sawal |  | |
| `wage.admin.payments.empty` | No money records yet | ابھی پیسوں کا کوئی ریکارڈ نہیں | Abhi paison ka koi record nahin |  | |
| `wage.admin.payments.emptyText` | When people agree a price or record a payment, the booking appears here. | جب لوگ قیمت طے کریں یا ادائیگی درج کریں، بکنگ یہاں نظر آئے گی۔ | Jab log qeemat tay karein ya adaigi darj karein, booking yahan nazar aayegi. |  | |
| `wage.admin.exports.payments.title` | Payments | ادائیگیاں | Adaigiyan |  | |
| `wage.admin.exports.payments.text` | Per booking: code, skill, region, unit, agreed total, confirmed paid, state and dates. No names, phone numbers or notes. | ہر بکنگ کا: کوڈ، کام، علاقہ، اکائی، طے شدہ کل رقم، تصدیق شدہ ادائیگی، حالت اور تاریخیں۔ کوئی نام، فون نمبر یا نوٹ نہیں۔ | Har booking ka: code, kaam, ilaqa, ikai, tay shuda kul raqam, tasdeeq shuda adaigi, haalat aur tareekhein. Koi naam, phone number ya note nahin. |  | |

## Error texts (English = the server catalog) (29)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `errors.TERMS_NOT_ALLOWED` | The price cannot be changed or agreed on this booking now. Please reload the page. | اس بکنگ پر ابھی قیمت نہ بدلی جا سکتی ہے نہ منظور ہو سکتی ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Is booking par abhi qeemat na badli ja sakti hai na manzoor ho sakti hai. Barah-e-karam safha dobara kholein. |  | |
| `errors.TERMS_CHANGED` | The price on this booking changed just now. Please look at the new price before you answer. | اس بکنگ کی قیمت ابھی بدلی ہے۔ جواب دینے سے پہلے نئی قیمت دیکھ لیں۔ | Is booking ki qeemat abhi badli hai. Jawab dene se pehle nayi qeemat dekh lein. |  | |
| `errors.TERMS_OWN_VERSION` | You proposed this price. The other person agrees to it, not you. | یہ قیمت آپ نے بتائی ہے۔ اسے دوسرا شخص منظور کرے گا، آپ نہیں۔ | Yeh qeemat aap ne batayi hai. Ise doosra shakhs manzoor kare ga, aap nahin. |  | |
| `errors.TERMS_LIMIT` | This booking already has {max} price versions. Agree to one of them. | اس بکنگ کی پہلے ہی {max} قیمتیں بن چکی ہیں۔ ان میں سے ایک منظور کریں۔ | Is booking ki pehle hi {max} qeematein ban chuki hain. In mein se aik manzoor karein. |  | |
| `errors.UNIT_INVALID` | Choose how the price is counted: whole job, per day or per hour. | چنیں کہ قیمت کیسے لگے گی: پورا کام، فی دن یا فی گھنٹہ۔ | Chunein ke qeemat kaise lagay gi: poora kaam, fi din ya fi ghanta. |  | |
| `errors.DURATION_INVALID` | Choose how long the work will take. | چنیں کہ کام کتنا وقت لے گا۔ | Chunein ke kaam kitna waqt le ga. |  | |
| `errors.MATERIALS_INVALID` | Choose who buys the materials. | چنیں کہ سامان کون خریدے گا۔ | Chunein ke saman kaun kharide ga. |  | |
| `errors.PAYMENT_TIMING_INVALID` | Choose when the payment is made. | چنیں کہ ادائیگی کب ہو گی۔ | Chunein ke adaigi kab ho gi. |  | |
| `errors.PAYMENT_METHOD_INVALID` | Choose how the money is paid: cash, Easypaisa, JazzCash, bank or other. | چنیں کہ پیسے کیسے دیے جائیں گے: نقد، ایزی پیسہ، جاز کیش، بینک یا کوئی اور۔ | Chunein ke paise kaise diye jayenge: naqd, Easypaisa, JazzCash, bank ya koi aur. |  | |
| `errors.VISIT_CHARGE_INVALID` | Choose what happens with the visit charge. | چنیں کہ آنے کے خرچے کا کیا ہو گا۔ | Chunein ke aane ke kharche ka kya ho ga. |  | |
| `errors.QUANTITY_INVALID` | Days: choose 1 to 60. Hours: choose 1 to 200. | دن: 1 سے 60 تک چنیں۔ گھنٹے: 1 سے 200 تک چنیں۔ | Din: 1 se 60 tak chunein. Ghantay: 1 se 200 tak chunein. |  | |
| `errors.ADVANCE_TOO_HIGH` | The advance cannot be more than the total price. | ایڈوانس کل قیمت سے زیادہ نہیں ہو سکتا۔ | Advance kul qeemat se zyada nahin ho sakta. |  | |
| `errors.PAYMENT_NOT_ALLOWED` | A payment cannot be recorded on this booking now. | اس بکنگ پر ابھی ادائیگی درج نہیں ہو سکتی۔ | Is booking par abhi adaigi darj nahin ho sakti. |  | |
| `errors.PAYMENT_WINDOW_PASSED` | Payments can be recorded up to {days} days after the work closed. That time has passed. | کام بند ہونے کے {days} دن بعد تک ادائیگی درج ہو سکتی ہے۔ یہ وقت گزر چکا ہے۔ | Kaam band hone ke {days} din baad tak adaigi darj ho sakti hai. Yeh waqt guzar chuka hai. |  | |
| `errors.PAYMENT_LIMIT` | This booking already has {max} payment records. | اس بکنگ پر پہلے ہی {max} ادائیگیاں درج ہیں۔ | Is booking par pehle hi {max} adaigiyan darj hain. |  | |
| `errors.PAYMENT_NOT_FOUND` | Payment record not found | ادائیگی کا ریکارڈ نہیں ملا | Adaigi ka record nahin mila |  | |
| `errors.PAYMENT_OWN_RECORD` | You recorded this payment. The other person confirms it, not you. | یہ ادائیگی آپ نے درج کی ہے۔ اس کی تصدیق دوسرا شخص کرے گا، آپ نہیں۔ | Yeh adaigi aap ne darj ki hai. Is ki tasdeeq doosra shakhs kare ga, aap nahin. |  | |
| `errors.PAYMENT_CHANGED` | This payment record was already answered. Please reload the page. | اس ادائیگی کا جواب پہلے ہی دیا جا چکا ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Is adaigi ka jawab pehle hi diya ja chuka hai. Barah-e-karam safha dobara kholein. |  | |
| `errors.PAYMENT_DATE_FUTURE` | The payment date cannot be in the future. | ادائیگی کی تاریخ آنے والی نہیں ہو سکتی۔ | Adaigi ki tareekh aane wali nahin ho sakti. |  | |
| `errors.PAYMENT_DATE_TOO_EARLY` | The payment date cannot be before the booking was made. | ادائیگی کی تاریخ بکنگ بننے سے پہلے کی نہیں ہو سکتی۔ | Adaigi ki tareekh booking banne se pehle ki nahin ho sakti. |  | |
| `errors.PAYMENT_KIND_INVALID` | Choose what the payment was for. | چنیں کہ ادائیگی کس لیے تھی۔ | Chunein ke adaigi kis liye thi. |  | |
| `errors.PAYMENT_REASON_INVALID` | Choose what is not right: not received, wrong amount or other. | چنیں کہ کیا درست نہیں: پیسے نہیں ملے، رقم غلط، یا کچھ اور۔ | Chunein ke kya durust nahin: paise nahin milay, raqam ghalat, ya kuch aur. |  | |
| `errors.PRICE_GUIDE_NOT_FOUND` | Price guide entry not found | قیمت گائیڈ کا اندراج نہیں ملا | Qeemat guide ka indiraj nahin mila |  | |
| `errors.PRICE_GUIDE_EXISTS` | An active price guide entry for this work, unit and region already exists. Edit that one. | اس کام، اکائی اور علاقے کا ایک فعال اندراج پہلے سے موجود ہے۔ اسی کو بدلیں۔ | Is kaam, ikai aur ilaqay ka aik faal indiraj pehle se maujood hai. Usi ko badlein. |  | |
| `errors.PRICE_GUIDE_LOW_HIGH` | The low price cannot be more than the high price. | کم قیمت، زیادہ قیمت سے بڑی نہیں ہو سکتی۔ | Kam qeemat, zyada qeemat se bari nahin ho sakti. |  | |
| `errors.SOURCE_NOTE_REQUIRED` | Write where these numbers come from (at least 10 characters). | لکھیں کہ یہ رقمیں کہاں سے آئیں (کم از کم 10 حروف)۔ | Likhein ke yeh raqamein kahan se aayin (kam az kam 10 huroof). |  | |
| `errors.REGION_INVALID` | Choose a region of Pakistan, or all of Pakistan. | پاکستان کا کوئی علاقہ چنیں، یا پورا پاکستان۔ | Pakistan ka koi ilaqa chunein, ya poora Pakistan. |  | |
| `errors.PRICE_GUIDE_ARCHIVED` | This price guide entry is archived and cannot be changed. | قیمت گائیڈ کا یہ اندراج محفوظ شدہ (آرکائیو) ہے اور بدلا نہیں جا سکتا۔ | Qeemat guide ka yeh indiraj archive ho chuka hai aur badla nahin ja sakta. |  | |
| `errors.PRICE_GUIDE_CHANGED` | Another admin changed this entry just now. Please reload the page. | کسی اور ایڈمن نے ابھی یہ اندراج بدلا ہے۔ براہ کرم صفحہ دوبارہ کھولیں۔ | Kisi aur admin ne abhi yeh indiraj badla hai. Barah-e-karam safha dobara kholein. |  | |

## Field names in error messages (18)

| Key | English | اردو (Urdu) | Roman Urdu | Clip | Checked by |
|---|---|---|---|---|---|
| `fields.amount` | Amount | رقم | Raqam |  | |
| `fields.unit` | Unit | اکائی | Ikai |  | |
| `fields.quantity` | Number | تعداد | Tadaad |  | |
| `fields.materials` | Materials | سامان | Saman |  | |
| `fields.advance` | Advance | ایڈوانس | Advance |  | |
| `fields.paymentTiming` | Payment time | ادائیگی کا وقت | Adaigi ka waqt |  | |
| `fields.paymentMethod` | Payment method | ادائیگی کا طریقہ | Adaigi ka tareeqa |  | |
| `fields.visitCharge` | Visit charge | آنے کا خرچہ | Aane ka kharcha |  | |
| `fields.baseVersion` | Price version | قیمت کا ورژن | Qeemat ka version |  | |
| `fields.version` | Price version | قیمت کا ورژن | Qeemat ka version |  | |
| `fields.offer` | Offer | پیشکش | Peshkash |  | |
| `fields.paidOn` | Payment date | ادائیگی کی تاریخ | Adaigi ki tareekh |  | |
| `fields.method` | Payment method | ادائیگی کا طریقہ | Adaigi ka tareeqa |  | |
| `fields.low` | Low price | کم قیمت | Kam qeemat |  | |
| `fields.high` | High price | زیادہ قیمت | Zyada qeemat |  | |
| `fields.sourceNote` | Source | ذریعہ | Zariya |  | |
| `fields.region` | Region | علاقہ | Ilaqa |  | |
| `fields.year` | Year | سال | Saal |  | |

