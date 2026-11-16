# Mid defence demo: Modules 1 to 3 in 7 minutes

One worker goes from nothing to a skill that a customer can trust:

1. **Module 1, Worker Digital Identity:** a worker chooses Urdu, registers and completes onboarding.
2. **Module 2, Experience and Skill Profiler:** the rule-based (dictionary) extractor suggests skills from
   an Urdu sentence.
3. **Module 3, Skill Evidence and Verification:** the worker uploads a proof photo, an admin approves it,
   and a customer sees "Verified by evidence" and **no phone number**.

Everything runs on this laptop from the local preview, on the separate **demo database** (`dlm_demo`) with
synthetic accounts only. No internet is needed (only the optional voice typing uses it).

The same steps run automatically in `frontend/e2e/demo-script.e2e.js`, so you can check before Friday that
the demo still works (start the preview first: the test uses its MongoDB, but its own database and ports):

```bash
cd /workspace/frontend
npx playwright test e2e/demo-script.e2e.js
```

---

## Recorded video (backup and practice)

`docs/demo/demo-video.webm` (1280×720, about 4 minutes 50 seconds, no sound) shows the same demo on the demo
database, with a visible cursor and a label saying which window you are looking at. The English voice-over
with a time for every line is in `docs/demo/NARRATION.md`. If the live demo fails on the day, you can play
the video and read the narration.

The video is not in Git (it is large). To record it again (in the container terminal):

```bash
cd /workspace
bash scripts/preview.sh demo
bash scripts/preview.sh reset-demo
cd frontend
npm run demo:video
```

---

## Before the panel arrives (10 minutes earlier)

**1. Start the preview on a clean demo database.** In the container terminal:

```bash
cd /workspace
bash scripts/preview.sh demo
bash scripts/preview.sh reset-demo
```

`demo` starts MongoDB, the API and the website on the demo database. `reset-demo` wipes it and puts back
the three demo accounts, so every rehearsal starts the same way. The worker you register in the demo gets
the worker ID **DLM-2026-000002** (the demo worker has 000001).

**2. Put the photo on the Desktop.** In VS Code: Explorer → `docs/demo/work-photo-synthetic.jpg` →
right-click → **Download…** → Desktop. It is a drawn picture of a distribution board, labelled
"SYNTHETIC DEMO PHOTO - not a real job".

**3. Open three Chrome windows, side by side or on separate desktops:**

| Window | How to open it | Prepare it |
|---|---|---|
| **A: worker** | Ctrl+Shift+N (Incognito) | Do nothing yet. A fresh window shows the language chooser. |
| **B: admin** | A normal Chrome window | Open http://127.0.0.1:5173/login. If a language chooser appears, choose **English**. Log in as `admin.demo@example.com` with the passphrase `local admin demo passphrase`. Click **Evidence review** in the left menu. The list is empty. |
| **C: customer** | Chrome profile menu (top right) → **Guest** | Open http://127.0.0.1:5173/login, choose **English**, log in as `customer.demo@example.com` with the password `local-demo-password-123`. You land on **Find workers**. |

Log in again after every `reset-demo`: the reset removes the old sessions.

**4. Keep this file open** for the Urdu sentence in Step 3. You can copy it from here:

> میں پانچ سال سے وائرنگ اور سولر پینل کا کام کرتا ہوں۔

(In English: "I have been doing wiring and solar panel work for five years.")

**5. In window A, set the zoom to 110 %** (Ctrl and +), so the panel can read the Urdu.

---

## The demo (7 minutes)

Urdu labels are shown exactly as they appear on the screen, with the English meaning in brackets.

### 0:00–0:30 Opening (no clicks)

**Say:** "Daily-wage and skilled workers in Pakistan have no trusted record of their skills. Our system
gives each worker a digital identity, turns their own words into a skills profile, and lets them back each
skill with proof that an admin checks. A customer can then see what has really been checked. It is a MERN
web app with three roles: worker, customer and admin. I will show one worker from sign-up to a verified
skill."

### 0:30–2:00 Module 1: identity and onboarding in Urdu (window A)

| Click | Say |
|---|---|
| Open http://127.0.0.1:5173 in window A. The language chooser appears. Click the Urdu card, **اردو میں جاری رکھیں** (Continue in Urdu). | "Many workers read Urdu, so the whole site is in English, Urdu and Roman Urdu. Urdu turns the page right to left." |
| The question **کیا ویب سائٹ پڑھ کر سنائے؟** (Should the website read aloud?) appears once. Click **نہیں، شکریہ** (No, thank you). | "The website can also read pages aloud; I will show that at the end." |
| Click **کاریگر کے طور پر شامل ہوں** (Join as a worker). | "Public sign-up offers only worker or customer. Admin accounts are made only by a command on the server." |
| Fill in **پورا نام** (Full name) `Bilal Ahmed (synthetic)`, **ای میل** (Email) `bilal.demo@example.com`, **موبائل نمبر** (Mobile number) `03000000071`, **پاس ورڈ** (Password) `demo pass phrase 2026`. Click **اکاؤنٹ بنائیں** (Create account). | "Passwords must be at least 15 characters; a short sentence works well." |
| Step 1 **آپ کے بارے میں** (About you): the name and mobile number are already filled in. Type `Rawalpindi` in **شہر** (City). In **شناختی کارڈ نمبر** (CNIC number) type `1234512345671`; it becomes `12345-1234567-1`. Click **محفوظ کریں اور آگے بڑھیں** (Save and continue). | "The CNIC is checked as you type, stored encrypted, and never shown to customers. Only an admin can reveal it, and every reveal is written to the audit log." |
| Step 2 **آپ کا کام** (Your work): under **اصل کام** (Main trade) press the picture **بجلی اور سولر** (Electrical & Solar); **پیشہ** (Occupation) fills itself with الیکٹریشن (Electrician). **تجربے کے سال** (Years of experience) `5`, **فی دن ریٹ (روپے)** (Rate per day) `4000`. Click **محفوظ کریں اور آگے بڑھیں**. | "Each step saves on its own, and the worker gets a permanent worker ID." |

### 2:00–3:15 Module 2: skills from the worker's own words (window A)

| Click | Say |
|---|---|
| Step 3 **آپ کے ہنر** (Your skills): paste the Urdu sentence into the box **اپنے الفاظ میں: آپ کیا کام کرتے ہیں، اور کتنے عرصے سے؟** (In your own words: what work do you do, and for how long?). | "Workers describe their work the way they speak, in Urdu, Roman Urdu or English. They can also use voice typing." |
| Click **میرے ہنر ڈھونڈیں** (Find my skills). Point at the suggestions **گھر کی وائرنگ** (House wiring) and **سولر پینل لگانا** (Solar panel installation), the words they were found from, and "Also found in your text": the trade and **5** years. | "This is a **rule-based dictionary extractor**, not AI. Each skill in our taxonomy has a list of words in three languages. A suggestion appears only when one of those words is in the text, and we show which word matched. We measure it with precision, recall and F1 on a labelled set of texts." |
| Click **چنے ہوئے ہنر شامل کریں (2)** (Add selected skills), then **آگے بڑھیں** (Continue). | "Nothing is added without the worker's click. Every skill starts as 'Self-declared'." |

### 3:15–4:15 Module 3, part 1: the worker uploads proof (window A)

| Click | Say |
|---|---|
| Step 4 **ہنر کا ثبوت** (Proof of skills): under **یہ تصویر کس ہنر کا ثبوت ہے؟** (Which skill does this photo prove?) press the picture **گھر کی وائرنگ** (House wiring). Choose **کام کی تصویر** (Work photo). | "Proof is one photo for one skill: a certificate, a photo of finished work, or a reference letter." |
| Click **تصویر چنیں** (Choose a photo) and pick `work-photo-synthetic.jpg` from the Desktop. | "The server checks the real file type from its content, not its name, limits the size, renames the file, removes location data, and keeps it private: only the worker and admins can open it." |
| Tick the consent box **یہ تصویر میری ہے یا مجھے اسے دکھانے کی اجازت ہے…** (I own this photo or have permission…). Click **ثبوت اپ لوڈ کریں** (Upload proof). The message **تصویر اپ لوڈ ہو گئی** (Photo uploaded) appears, and the photo is listed as **جانچ باقی ہے** (Pending review). | "Now it waits for an admin." |
| Click **آگے بڑھیں** (Continue). **سب تیار** (All set) appears with confetti and the worker ID **DLM-2026-000002**. | "The worker's profile is ready." |

### 4:15–5:30 Module 3, part 2: the admin approves (window B)

| Click | Say |
|---|---|
| Switch to window B and reload (F5). The queue shows **Bilal Ahmed (synthetic)**, House wiring, Work photo, **Pending review**, waiting since today. Click the name. | "Admins log in on the same page as everyone else; the server checks the role on every request." |
| The panel shows the photo (**Zoom to full size** if asked), the skill, and the numbers b 0.000, d 0.000, u 1.000, E 0.500. | "These four numbers are computed from the approved and rejected proof with a documented formula (decision D-014), not by AI. With no proof yet, the uncertainty is 1." |
| Click **Approve**. In **Approve this proof?** click **Approve**. The status becomes **Approved**, and the numbers change to b 0.333, u 0.667, E 0.667. | "One approved work photo raises the belief. A certificate counts double. A suspected fake lowers it. Every decision, with its reason, goes into an audit log that cannot be changed without the hash chain showing it." |
| (Optional, 10 seconds) Click **Audit log** in the left menu: the newest entry is the approval. | "The audit log is append-only and hash-chained." |

### 5:30–6:30 The customer sees what was checked (window C)

| Click | Say |
|---|---|
| Switch to window C. In **Search workers**, type `wiring`. Results update as you type. | "Customers search by trade or skill." |
| Click **Bilal Ahmed (synthetic)**. In the header, point at the chip **Verified by evidence · 1**; under **Skills**, at **House wiring: Verified by evidence** and **Solar panel installation: Self-declared**. | "The customer sees the difference between what the worker says and what an admin has checked." |
| Point at the box **How to contact this worker**: "Contact details are shared after a booking is accepted (coming in a later module)." | "No phone number, WhatsApp, CNIC or address is sent to a customer. The server leaves these fields out of every public response; it is not only hidden on the screen." |
| (Optional) Switch to window A, reload: the bell **اطلاعات** (Notifications) has 1 unread notification, **گھر کی وائرنگ کا ثبوت منظور ہو گیا** (Proof approved for House wiring). | "The worker is told about every decision." |

### Optional (1 minute, only if there is time): Listen, Speak, See (Batch 5)

Use a laptop where **/voice-check** says that Urdu works (team clips or a device voice), and test it before
the panel arrives. Window C (customer) or any window in Urdu.

| Click | Say |
|---|---|
| Under any box press **سنیں** (Listen). | "For workers who cannot read, every box can explain itself in Urdu, and the same help is shown in large text." |
| Press the round speaker button in the bottom corner. | "This button is always in the same place and says what the page is for." |
| On **Find workers**, press **بولیں** (Speak) in the search box and say "plumber". | "Voice typing is the browser's own feature. It is never offered for passwords, CNIC or email, and it reads the answer back so the person can check it without reading." |
| Point at the trade pictures. | "Choices are pictures, and each picture can be heard. None of this is AI: it is the browser's speech feature and our own help texts." |

### 6:30–7:00 Close (no clicks)

**Say:** "So in Module 1 the worker has an identity with a protected CNIC. In Module 2 a rule-based
extractor turned their own words into skills. In Module 3 a skill was backed by proof that an admin
approved, and the customer could see it without seeing private data. Everything is covered by automated
tests: 521 backend, 941 frontend and 35 browser tests, including this exact demo. Next semester: bookings,
which is when contact details will be shared."

---

## If something goes wrong

| Problem | What to do |
|---|---|
| The page does not open | In the terminal: `bash scripts/preview.sh status`. If anything is stopped, run `bash scripts/preview.sh demo`. After the laptop or the container restarts, the servers are always stopped: start them again. |
| "This email is already registered" | The demo was not reset. Use another email, for example `bilal.demo2@example.com`, or reset after the demo. |
| No language chooser in window A | Window A was already used. Close every Incognito window and open a new one. |
| The admin queue is empty | Reload window B (F5). The photo appears only after **Upload proof** in window A. |
| Registration goes wrong | Show the finished demo worker instead: log in to window A as `worker.demo@example.com` with `local-demo-password-123`. |
| Window B or C says the session ended | You ran `reset-demo` after logging in. Log in again (see "Before the panel arrives", step 3). |

## After a rehearsal

```bash
cd /workspace
bash scripts/preview.sh reset-demo
```

Then log in again in windows B and C, and close and reopen the Incognito window A. When you are finished
for the day: `bash scripts/preview.sh stop`.

## Words to use and to avoid

- Say **rule-based dictionary extractor**, never "AI", for Module 2.
- Say **evidence numbers from a documented formula** for Module 3, never "AI confidence"; there is no
  percentage on screen.
- All names, emails, phone numbers, the CNIC and the photo in this demo are **synthetic**.
