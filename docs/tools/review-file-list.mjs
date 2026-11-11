// Prints the list of source files for docs/REVIEW-2026-11.md (appendix): path, lines, and whether
// the file was added or changed in Batch 4 (git diff against the last Batch 3 commit 253a5af).
//   node docs/tools/review-file-list.mjs
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execSync('git ls-files backend frontend', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(js|jsx|mjs|css)$/.test(f) && !/node_modules|\/dist\/|package-lock/.test(f));
const changed = new Set(execSync('git diff --name-only 253a5af HEAD -- backend frontend', { encoding: 'utf8' }).split('\n').filter(Boolean));
const rows = files.map((f) => `| \`${f}\` | ${readFileSync(f, 'utf8').split('\n').length} | ${changed.has(f) ? 'yes' : ''} |`);
console.log(`| File | Lines | Added or changed in Batch 4 |\n|---|---:|:---:|\n${rows.join('\n')}`);
console.error(`${files.length} files, ${[...files].filter((f) => changed.has(f)).length} added or changed in Batch 4`);
