# Demo video: English voice-over

For `docs/demo/demo-video.webm` (1280×720, no sound). The narration runs to 04:44; the closing
card stays a few seconds longer. Read each line when the video reaches its start time: the video holds
each step until the line has time to finish. Simple spoken English, about two words per second.
The times were measured while the video was recorded by `frontend/scripts/record-demo-video.mjs`;
if the video is recorded again, this file is written again with the new times.

All names, emails, phone numbers, the CNIC and the photo are synthetic. Say "rule-based skill
suggestions" for Module 2.

| Time | Line |
|---|---|
| 00:00 – 00:11 | Welcome. This is a short demo of the Digital Labour Marketplace, Modules one to three. Everything you see uses synthetic data. |
| 00:12 – 00:25 | A new worker opens the website. The first screen asks for the language. Our worker chooses Urdu, and the whole site turns right to left. |
| 00:25 – 00:33 | On the home page, the worker taps Join as a worker. |
| 00:33 – 00:52 | Sign-up needs only a name, an email, a mobile number and a password of at least fifteen characters. Public sign-up offers only worker and customer accounts. Admins are created by a command on the server. |
| 00:52 – 01:11 | Step one is About you. The name and number are already filled in. The worker adds a city and the CNIC number. The CNIC is checked as it is typed, stored encrypted, and never shown to customers. |
| 01:11 – 01:22 | Step two is Your work: the trade, the years of experience and a daily rate. Each step saves on its own. |
| 01:22 – 01:36 | Step three is Module two. The worker describes the work in their own words, here in Urdu: I have done wiring and solar panel work for five years. |
| 01:36 – 02:00 | The worker taps Find my skills. These are rule-based skill suggestions. Each skill in our list has words in three languages, and a skill is suggested only when one of its words appears in the text. The matched words are shown, so the worker can see why. |
| 02:00 – 02:13 | The trade and the five years of experience are found too. Nothing is added without the worker's tap. The worker adds the two skills and continues. |
| 02:13 – 02:31 | Step four is Module three, proof of skills. The worker chooses the skill, house wiring, and the kind of proof, a work photo, and picks a photo. This photo is a drawn, synthetic picture. |
| 02:31 – 02:46 | The server checks the real file type, removes location data, and keeps the photo private. Only the worker and the admins can open it. Now it waits for review. |
| 02:46 – 02:52 | Onboarding is done. The worker has a permanent worker ID. |
| 02:54 – 03:06 | Now an admin, in another window. The evidence review queue shows the new photo, oldest first, with how long it has waited. |
| 03:06 – 03:24 | The admin opens it and sees the photo and four numbers for this skill: belief, disbelief, uncertainty and the expected value. They come from a documented formula. With no approved proof yet, the uncertainty is one. |
| 03:24 – 03:39 | The admin approves the photo. The numbers change: belief is now one third. Every decision is written to an audit log that cannot be changed without it showing. |
| 03:41 – 03:49 | Now a customer, in a third window, searches for wiring. Results update while typing. |
| 03:49 – 04:01 | On the worker's profile, house wiring shows Verified by evidence, and solar panel installation shows Self-declared. The customer can see what was really checked. |
| 04:01 – 04:16 | There is no phone number, WhatsApp number, CNIC or address. Contact details are shared only after a booking is accepted, in a later module. The server never sends them. |
| 04:24 – 04:31 | Back in the worker's window, the bell shows the admin's decision, in Urdu. |
| 04:31 – 04:44 | That is Modules one to three: a protected identity, rule-based skill suggestions from the worker's own words, and skills backed by checked proof. Thank you. |
