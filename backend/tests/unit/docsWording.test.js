// Documentation wording (Batch 8B, A8; the supervisor's instruction of 24 Nov 2026): the project's documentation,
// README, source code and data-file headers name no AI tool or its maker and no batch instruction file. Checked on
// every file Git tracks (or will track: new files that are not ignored) in docs/, README.md, the backend source folders
// and frontend/src. Ignored working notes on disk (for example docs/audit/) are not part of the repository.
// The banned words are built from parts, so this file never trips its own check.
import { describe, test, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const BACKEND_DIRS = ['config', 'controllers', 'errors', 'evaluation', 'middleware', 'models', 'routes', 'scripts', 'services', 'utils', 'validators'];
const PATHS = ['docs', 'README.md', ...BACKEND_DIRS.map((d) => `backend/${d}`), 'frontend/src'];
const TEXT = new Set(['.md', '.js', '.mjs', '.cjs', '.jsx', '.json', '.csv', '.css', '.html', '.txt', '.yml', '.yaml', '.svg']);

const BANNED = [
  new RegExp(['cla', 'ude'].join(''), 'i'),
  new RegExp(['anth', 'ropic'].join(''), 'i'),
  new RegExp(['BATCH_[0-9][0-9A-Z]*_', 'PRO', 'MPT'].join(''), 'i'),
];

function files() {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', ...PATHS], { cwd: ROOT, encoding: 'utf8' });
  return [...new Set(out.split('\0').filter(Boolean))].filter((f) => TEXT.has(extname(f).toLowerCase()) && existsSync(resolve(ROOT, f)));
}

describe('documentation wording: no AI tool, maker or batch instruction file is named (A8)', () => {
  const list = files();

  test('the check reads the documentation, the README and the source (so a pass means something)', () => {
    expect(list).toContain('README.md');
    expect(list).toContain('docs/DECISIONS.md');
    expect(list).toContain('docs/modules/MODULE-6.md');
    expect(list).toContain('backend/config/jobPhrases.js');
    expect(list.some((f) => f.startsWith('frontend/src/'))).toBe(true);
    expect(list.length).toBeGreaterThan(300);
  });

  test('the banned words are found when they are there', () => {
    const sample = ['Written by ', 'Cla', 'ude', ' Code; see ', 'BATCH_', '5_PRO', 'MPT.md (', 'Anth', 'ropic)'].join('');
    expect(BANNED.every((re) => re.test(sample))).toBe(true);
    expect(BANNED.some((re) => re.test('the team wrote the Batch 5 plan, section 8'))).toBe(false);
  });

  test('no file names them', () => {
    const found = [];
    for (const f of list) {
      const lines = readFileSync(resolve(ROOT, f), 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        if (BANNED.some((re) => re.test(line))) found.push(`${f}:${i + 1}`);
      });
    }
    expect(found).toEqual([]);
  });
});
