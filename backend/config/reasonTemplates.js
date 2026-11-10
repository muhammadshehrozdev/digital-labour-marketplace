// A starter set of reason templates (Batch 4, feature 29). An admin can add them with one click
// ("Add the starter set") and then edit or delete each one. They are ordinary sentences an admin
// would otherwise type again and again; they are not facts about any person.
// The Urdu and Roman Urdu lines were written by Claude Code and must be reviewed by the team.
export const STARTER_TEMPLATES = Object.freeze([
  { kind: 'identity_verify', text: { en: 'Original CNIC card seen in person. Name and photo match the account.', ur: 'اصل شناختی کارڈ سامنے دیکھا گیا۔ نام اور تصویر اکاؤنٹ سے ملتے ہیں۔', 'ur-Latn': 'Asal shanakhti card samne dekha gaya. Naam aur tasveer account se milte hain.' } },
  { kind: 'identity_verify', text: { en: 'CNIC card checked on a video call. Name and photo match the account.', ur: 'شناختی کارڈ ویڈیو کال پر چیک کیا گیا۔ نام اور تصویر اکاؤنٹ سے ملتے ہیں۔', 'ur-Latn': 'Shanakhti card video call par check kiya gaya. Naam aur tasveer account se milte hain.' } },
  { kind: 'identity_reject', text: { en: 'The name on the CNIC card does not match the name on the account.', ur: 'شناختی کارڈ کا نام اکاؤنٹ کے نام سے نہیں ملتا۔', 'ur-Latn': 'Shanakhti card ka naam account ke naam se nahi milta.' } },
  { kind: 'identity_reject', text: { en: 'The CNIC card could not be read clearly. Please show the original card again.', ur: 'شناختی کارڈ صاف نہیں پڑھا جا سکا۔ براہ کرم اصل کارڈ دوبارہ دکھائیں۔', 'ur-Latn': 'Shanakhti card saaf nahi parha ja saka. Barah-e-karam asal card dobara dikhayein.' } },
  { kind: 'evidence_reject', text: { en: 'The photo is too dark or blurred to read. Please upload a clearer photo.', ur: 'تصویر بہت دھندلی یا تاریک ہے۔ براہ کرم صاف تصویر اپ لوڈ کریں۔', 'ur-Latn': 'Tasveer bohat dhundli ya tareek hai. Barah-e-karam saaf tasveer upload karein.' } },
  { kind: 'evidence_reject', text: { en: 'This photo does not show the skill it was uploaded for.', ur: 'یہ تصویر اس ہنر کو ظاہر نہیں کرتی جس کے لیے اپ لوڈ کی گئی۔', 'ur-Latn': 'Yeh tasveer us hunar ko zahir nahi karti jis ke liye upload ki gayi.' } },
  { kind: 'evidence_fake', text: { en: 'The same picture was uploaded by another worker.', ur: 'یہی تصویر کسی اور کاریگر نے بھی اپ لوڈ کی ہے۔', 'ur-Latn': 'Yehi tasveer kisi aur karigar ne bhi upload ki hai.' } },
  { kind: 'evidence_fake', text: { en: 'The document in the photo appears to have been edited.', ur: 'تصویر میں موجود دستاویز میں ردوبدل نظر آتا ہے۔', 'ur-Latn': 'Tasveer mein mojood dastavez mein radd-o-badal nazar aata hai.' } },
  { kind: 'evidence_revoke', text: { en: 'New information shows that this proof belongs to another person.', ur: 'نئی معلومات کے مطابق یہ ثبوت کسی اور شخص کا ہے۔', 'ur-Latn': 'Nayi maloomat ke mutabiq yeh saboot kisi aur shakhs ka hai.' } },
  { kind: 'user_suspend', text: { en: 'Copied or false proof was uploaded more than once.', ur: 'نقل شدہ یا غلط ثبوت ایک سے زیادہ بار اپ لوڈ کیا گیا۔', 'ur-Latn': 'Naqal shuda ya ghalat saboot aik se zyada baar upload kiya gaya.' } },
  { kind: 'user_suspend', text: { en: 'The account is being checked after a report of misuse.', ur: 'غلط استعمال کی اطلاع کے بعد اکاؤنٹ کی جانچ کی جا رہی ہے۔', 'ur-Latn': 'Ghalat istemaal ki ittela ke baad account ki jaanch ki ja rahi hai.' } },
  { kind: 'user_reactivate', text: { en: 'The matter was checked with the user and is resolved.', ur: 'صارف کے ساتھ معاملہ چیک کر لیا گیا اور حل ہو گیا ہے۔', 'ur-Latn': 'Saarif ke saath mamla check kar liya gaya aur hal ho gaya hai.' } },
]);
