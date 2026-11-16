// Batch 5 (D-034): the team's recorded help clips. The app only requests clips listed in
// clipManifest.json (written by `npm run audio:manifest`), so the list must match the folder, and every
// file must belong to a text that can be recorded.
import { describe, test, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import manifest from '../features/assist/clipManifest.json';
import { DIGIT_KEYS, clipBaseName, clipKeysFrom, clipText, unknownClipFiles } from '../features/assist/clipKeys';
import { scanClips } from '../../scripts/audio-manifest.mjs';
import en from '../i18n/dictionaries/en';
import ur from '../i18n/dictionaries/ur';

describe('recorded clips', () => {
  test('clipManifest.json lists exactly the clip files in public/audio/help (run npm run audio:manifest)', () => {
    expect(manifest).toEqual(scanClips());
  });

  test('every clip file belongs to a recordable text of its language', () => {
    expect(unknownClipFiles(manifest, { ur, en })).toEqual([]);
    // the check itself catches a wrong name and a removed text
    expect(unknownClipFiles({ ur: ['help-field-register-name.webm', 'help-field-register-nmae.webm'], en: ['help-screen-gone.mp3'] }, { ur, en }))
      .toEqual(['ur/help-field-register-nmae.webm', 'en/help-screen-gone.mp3']);
  });

  test('the folder scan keeps only audio files, sorted, per language', () => {
    const dir = mkdtempSync(join(tmpdir(), 'clips-'));
    mkdirSync(join(dir, 'ur'));
    for (const f of ['help-screen-login.mp3', 'README.txt', 'digit-0.webm', 'notes.wav']) writeFileSync(join(dir, 'ur', f), '');
    expect(scanClips(dir)).toEqual({ ur: ['digit-0.webm', 'help-screen-login.mp3'], en: [] });
  });

  test('what can be recorded: chooser sentences (Roman Urdu in the Urdu folder), fixed help texts, digits', () => {
    const urKeys = clipKeysFrom(ur, 'ur');
    const enKeys = clipKeysFrom(en, 'en');
    expect(urKeys.slice(0, 2)).toEqual(['help.chooser.ur', 'help.chooser.ur-Latn']);
    expect(enKeys[0]).toBe('help.chooser.en');
    expect(urKeys).toEqual(expect.arrayContaining(['help.field.register.name', 'help.screen.login', 'help.option.trade.electrical_solar', 'voice.notice', ...DIGIT_KEYS]));
    // a text with a value in it is always spoken by a device voice
    expect(urKeys).not.toContain('help.option.proofSkill');
    expect(urKeys).not.toContain('assist.wrote');
    expect(urKeys).not.toContain('voice.errors.language-not-supported');
    // every clip has something to say in both languages
    for (const key of urKeys) expect(clipText(key, ur, 'ur'), key).not.toBe('');
    for (const key of enKeys) expect(clipText(key, en, 'en'), key).not.toBe('');
    expect(clipText('digit.3', ur, 'ur')).toBe('تین');
    expect(clipBaseName('help.chooser.ur-Latn')).toBe('help-chooser-ur-Latn');
  });
});

describe('service worker and clips (offline help)', () => {
  const sw = readFileSync('public/sw.js', 'utf8');

  test('clips are cached first, fetched whole (not in pieces); API answers are still never cached', () => {
    expect(sw).toMatch(/const VERSION = 'dlm-static-v2'/);
    expect(sw).toMatch(/startsWith\('\/audio\/help\/'\) && \/\\\.\(\?:webm\|mp3\|m4a\|ogg\)\$\//);
    expect(sw).toMatch(/fetch\(url\.pathname\)/);
    expect(sw).toMatch(/if \(url\.pathname\.startsWith\('\/api\/'\)\) return;/);
  });
});
