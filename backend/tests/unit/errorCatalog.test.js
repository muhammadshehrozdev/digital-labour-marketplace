// Batch 3: every error the API sends has a stable `code` from errors/catalog.js.
// The website translates the code into the chosen language, so a code that is not in the
// catalog (for example a typo) would show a raw code to the user. These tests stop that.
import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ERRORS, ERROR_CODES, formatError, isErrorCode, fieldLabel } from '../../errors/catalog.js';
import { HttpError, httpError, errorBody } from '../../utils/httpError.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_DIRS = ['controllers', 'middleware', 'services', 'validators', 'config', 'routes'];
// UPPER_CASE strings in the source that are not error codes.
// (HTTP methods, the JWT algorithm, Unicode normal forms, and multer's own error names.)
const NOT_CODES = new Set([
  'HS256', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE', 'NFC', 'NFKD',
  'LIMIT_FILE_SIZE', 'LIMIT_UNEXPECTED_FILE', 'LIMIT_FILE_COUNT',
]);

function jsFiles(dir) {
  let out = [];
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out; // folder does not exist
  }
  for (const name of names) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out = out.concat(jsFiles(path));
    else if (name.endsWith('.js')) out.push(path);
  }
  return out;
}

describe('error catalog (Batch 3)', () => {
  test('every UPPER_CASE code used in the backend source exists in the catalog', () => {
    const missing = [];
    for (const dir of SOURCE_DIRS) {
      for (const file of jsFiles(join(root, dir))) {
        const text = readFileSync(file, 'utf8');
        for (const [, code] of text.matchAll(/['"`]([A-Z][A-Z0-9_]{2,})['"`]/g)) {
          if (!NOT_CODES.has(code) && !isErrorCode(code)) missing.push(`${file.replace(root, '')}: ${code}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('codes are UPPER_SNAKE_CASE and every text is a non-empty English sentence', () => {
    expect(ERROR_CODES.length).toBeGreaterThan(50);
    for (const code of ERROR_CODES) {
      expect(code).toMatch(/^[A-Z][A-Z0-9_]+$/);
      expect(typeof ERRORS[code]).toBe('string');
      expect(ERRORS[code].trim().length).toBeGreaterThan(3);
    }
  });

  test('placeholders are filled from params; unknown placeholders stay visible', () => {
    expect(formatError('TEXT_TOO_LONG', { field: 'Bio', max: 600 })).toBe('Bio must be at most 600 characters');
    expect(formatError('SKILL_LIMIT', { max: 30 })).toContain('30');
    expect(formatError('TEXT_TOO_LONG', {})).toContain('{field}');
  });

  test('httpError refuses an English sentence instead of a code (so no untranslated error slips in)', () => {
    expect(() => httpError(400, 'Please choose a photo')).toThrow(/Unknown error code/);
    const err = httpError(404, 'PROOF_NOT_FOUND');
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
    expect(err.code).toBe('PROOF_NOT_FOUND');
    expect(err.message).toBe(ERRORS.PROOF_NOT_FOUND);
  });

  test('errorBody has code and English message, and params only when there are some', () => {
    expect(errorBody('NOT_LOGGED_IN')).toEqual({ code: 'NOT_LOGGED_IN', message: ERRORS.NOT_LOGGED_IN });
    expect(errorBody('PROOF_LIMIT_SKILL', { max: 5 })).toEqual({
      code: 'PROOF_LIMIT_SKILL',
      message: formatError('PROOF_LIMIT_SKILL', { max: 5 }),
      params: { max: 5 },
    });
  });

  test('docs/API.md lists every code of the catalog (so the documentation stays complete)', () => {
    const doc = readFileSync(join(root, '..', 'docs', 'API.md'), 'utf8');
    const missing = ERROR_CODES.filter((code) => !doc.includes(`| \`${code}\` |`));
    expect(missing).toEqual([]);
  });

  test('field labels: known keys get an English name, unknown keys stay as they are', () => {
    expect(fieldLabel('experienceYears')).toBe('Experience');
    expect(fieldLabel('somethingNew')).toBe('somethingNew');
  });
});
