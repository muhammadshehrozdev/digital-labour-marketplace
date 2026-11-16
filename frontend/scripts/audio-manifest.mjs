// Lists the recorded help clips for the website (Batch 5, D-034).
// Scans public/audio/help/<ur|en>/ and writes src/features/assist/clipManifest.json, which the app
// imports to know which clips exist (so it never requests a missing file).
//   npm run audio:manifest      (inside .\frontend; run again after adding or removing clips)
// src/test/assistClips.test.js fails if this file and the folder disagree.
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const CLIP_DIR = resolve(here, '..', 'public', 'audio', 'help');
export const MANIFEST = resolve(here, '..', 'src', 'features', 'assist', 'clipManifest.json');
export const CLIP_LANGS = ['ur', 'en'];
export const CLIP_EXT = /\.(webm|mp3|m4a|ogg)$/i;

export function scanClips(dir = CLIP_DIR) {
  const out = {};
  for (const lang of CLIP_LANGS) {
    const folder = resolve(dir, lang);
    out[lang] = existsSync(folder) ? readdirSync(folder).filter((f) => CLIP_EXT.test(f)).sort() : [];
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const clips = scanClips();
  writeFileSync(MANIFEST, `${JSON.stringify(clips, null, 2)}\n`);
  console.log(`Wrote ${MANIFEST}: ${clips.ur.length} Urdu and ${clips.en.length} English clips.`);
}
