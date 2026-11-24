# Easy mode: manual test checklist (sound and microphone)

The automated tests use fake speech features, because the build container has **no sound card and no
microphone**. The automated tests have not heard or spoken into anything in Batch 5. Please run these checks
yourself: first on your laptop in **Chrome** and **Edge**, later on an **Android phone** in Chrome.

Start the local preview first (container terminal): `bash scripts/preview.sh demo`, then open
**http://127.0.0.1:5173**. Use the synthetic demo accounts (`worker.demo@example.com` /
`local-demo-password-123`, `customer.demo@example.com` / `local-demo-password-123`).

Mark each step ✅ or ❌ and write what you heard.

## Start here: the three most important checks

| # | Do | Expected |
|---|---|---|
| A | Open **/voice-check** | It lists the voices of this device and says for Urdu and English: "works, with the team's recorded voice", "works, with this device's voice" or "no voice yet, so the help is shown as text". Press **Play an Urdu test** and **Play an English test**: you hear them, or the page says this device could not speak that language. |
| B | **/register** → "I want to find work" → under **Full name** press **🔊 Listen** | You hear "Say or type your full name here, for example Bilal Ahmed" (Urdu if the website is in Urdu) and the same text appears in a box under the field. A second tap stops it. |
| C | Under **Full name** press **🎤 Speak** | A notice about the browser's speech service appears once; press "OK, use voice typing"; Chrome asks for the microphone; say your name. The box fills in, you hear "Written: …", and **Undo** appears. |

## Laptop (Chrome, then Edge)

| # | Do | Expected |
|---|---|---|
| 1 | Open the website in a new Incognito window | The language chooser. Each card has its own **Listen**. Urdu card: "اردو کے لیے یہاں دبائیں". Roman Urdu card: the same sentence for Roman Urdu, spoken in Urdu. |
| 2 | Choose a language | The question "Should the website read aloud?" with two big pictures. Press **No**. It does not come back after a reload. |
| 3 | On any page press the round 🔊 button in the bottom corner | You hear what the page is for; the text appears above the button. On a first visit the button pulses gently (not with "reduce motion" on). |
| 4 | **/register**: press **🎤 Speak** under **Mobile number** and say "zero three zero zero, one two three four five six seven" | The box shows `0300-1234567` and you hear the digits one by one. Say something else ("hello"): nothing is written, you see and hear "I did not understand…". |
| 5 | Check that **Email** and **Password** have **Listen** but no **Speak** | Correct. Their answers are never read aloud. |
| 6 | Start **Speak** on one field, then press **Listen** on another | The microphone stops; only one thing at a time. Press **Escape** while help plays: it stops. |
| 7 | Log in as the demo worker, open **/onboarding/work** | Trades are pictures; the small 🔊 on a picture says its name and one line. Availability: three pictures with icon and word. Say "paanch saal" into **Years of experience**: `5`. Say "char hazaar" into **Rate per day**: `4,000`. |
| 8 | **/onboarding/about**: CNIC | Listen only, never Speak. |
| 9 | Header **Sound** menu: switch off "Show the Listen and Speak buttons" | The buttons disappear; typing works as before. Switch it on again. |
| 10 | Sound menu: switch on "Read aloud by itself", click somewhere, open another page | The page help is spoken on arrival; tapping into a box speaks its help; starting to type stops it. Switch it off again. |
| 11 | Switch the website to **Roman Urdu** and press **Listen** under a field | The bubble shows Roman Urdu; you hear **Urdu** (if the device has an Urdu voice or clips), never English reading Roman Urdu. |
| 12 | **/notifications** (demo worker) | Each message has a 🔊 that reads it. |
| 13 | **/find** as the demo customer | Trade and availability filters are pictures with "All" first; **Speak** works in the search box. |
| 14 | **/help** | Two guides "Listen to the help" and "Speak instead of typing", each with a 🔊; the voice typing notice; a link to the voice check. |
| 15 | Turn off Wi-Fi, press **Speak** | "Voice typing needs the internet…"; typing still works. Turn Wi-Fi on. |
| 16 | Dark mode (sun/moon button) and **Urdu** (right to left) | Buttons and help boxes are readable and on the correct side; nothing overlaps at 360 px width (Chrome DevTools, device toolbar). |

## Android phone (Chrome)

| # | Do | Expected |
|---|---|---|
| P1 | Open the preview address from the phone (same Wi-Fi; ask the team lead for the laptop's address) or the deployed test site when available | The website opens. |
| P2 | **/voice-check** | If Urdu shows "text only", follow the steps on the page to add an Urdu voice (Settings → Text-to-speech → Google → Install voice data → Urdu (Pakistan)), then press "Play an Urdu test" again. Write down the phone model and Android version. |
| P3 | Repeat checks A, B, C and 4, 7 on the phone | Same results; the round 🔊 button does not cover the Back / Continue bar of onboarding or the compare tray. |
| P4 | Use the keyboard's own microphone (Gboard) in a text box | Still works next to our Speak button. |

## Recorded clips (after the team records some)

| # | Do | Expected |
|---|---|---|
| R1 | Record two clips on **/dev/recorder** (development preview only), put them in `frontend/public/audio/help/ur/`, run `npm run audio:manifest` | `/voice-check` counts them. |
| R2 | Website in Urdu: press **Listen** under that field | You hear the recorded clip, not the device voice. |
| R3 | Install the app or load the page once, then go offline and press the same **Listen** | The clip still plays (cached by the service worker). |
