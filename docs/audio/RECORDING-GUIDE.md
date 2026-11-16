# Recording the spoken help (Batch 5)

Many phones and laptops have no Urdu voice. Then the website can only **show** the Urdu help, not say
it. Recorded clips fix that: when a clip exists for a help text, the website plays it first (before any
device voice), and it also works offline. This guide is for the team members who record.

Only the team's own voices go into the website. Do not add downloaded or computer-generated audio.
The person who records agrees that their voice is used in the project.

## What to record

| Language | Clips | Needed? |
|---|---:|---|
| Urdu (`ur`) | 97 | Yes. Roman Urdu users hear these too: Roman Urdu is spoken in Urdu. |
| English (`en`) | 96 | Optional. Most laptops have an English voice. |

The Urdu list: the 2 language-chooser sentences (Urdu and Roman Urdu cards; record these first,
because nothing has been chosen yet when they play), 18 page helps, 37 field helps, 17 picture
names (trades, availability, kinds of proof, "All"), 5 short messages, the voice-typing notice and its
7 error messages, and the digits 0 to 9 (used to read a phone number back).

Texts that contain a value, for example "Written: Bilal Ahmed", are always spoken by the device voice
and are not on the list.

## Step by step (Windows 11, Chrome, VS Code)

1. Start the local preview (in the container terminal: `bash scripts/preview.sh demo`, or in PowerShell
   in `.\frontend`: `npm run dev`).
2. Open Chrome at **http://127.0.0.1:5173/dev/recorder**. This page exists only in development builds;
   it is not part of the live website.
3. Choose **Urdu**. The page shows one text at a time: its key, the file name, and the Urdu sentence in
   large letters (with the English meaning under it).
4. Press **Record**, read the sentence, press **Stop**. Chrome asks once for the microphone: allow it.
5. Press **Play** to listen. Not good? Press **Record again**.
6. Press **Save**.
   - If you pressed **Choose the folder** and picked `frontend\public\audio\help\ur`, the file is written
     there directly.
   - Otherwise the file is downloaded (for example `help-field-register-name.webm`). Move it into
     `frontend\public\audio\help\ur\`.
7. Press **Next** and continue. "23 of 97 recorded" shows the progress; tick **Show missing clips only**
   to skip finished ones. The list at the bottom shows every missing file name.
8. When a batch is done, run in PowerShell, in the `.\frontend` folder:

   ```powershell
   npm run audio:manifest
   ```

   It scans the folders and writes `src/features/assist/clipManifest.json`, the list of clips the
   website knows about. Without this step the new files are not played.
9. Run the tests (`npm test` in `.\frontend`). `assistClips.test.js` fails if the list and the folder
   disagree, or if a file name does not belong to any help text (a typo).
10. Check on **http://127.0.0.1:5173/voice-check**: it shows how many clips the website has. Then open a
    page in Urdu, press **سنیں** under a box, and listen.

## File names and formats

- Folder: `frontend/public/audio/help/ur/` for Urdu, `frontend/public/audio/help/en/` for English.
- Name: the text's key with dots turned into dashes, then the extension:
  `help.field.register.name` becomes `help-field-register-name.webm`. Digits: `digit-0.webm` to
  `digit-9.webm`. The recorder names files for you.
- Formats: `.webm` (what Chrome records), `.mp3`, `.m4a` or `.ogg`. One file per text.
- Keep each clip short (a few seconds) and small (under about 200 KB).

## Tips for good clips

- A quiet room: no fan, no traffic, no television. Soft furniture helps.
- The **same speaker** for all Urdu clips, so the website sounds like one person.
- The **same distance** from the microphone every time (about one hand-span, 20 cm), the same
  microphone, the same volume.
- Read slowly and clearly, in a friendly everyday voice, as if explaining to a relative. Say the numbers
  in examples digit by digit, as written.
- Leave about half a second of silence before and after you speak; do not cut words off.
- Record the language-chooser sentences and the Register and Login helps first: a new person hears
  those first.

## When the texts change

The Urdu texts are drafts until the team has reviewed them (`docs/i18n/REVIEW-BATCH-5.md`). If a text
changes after it was recorded, record that clip again: the website would otherwise say the old
sentence while showing the new one. If a text is removed, delete its file and run
`npm run audio:manifest` again.
