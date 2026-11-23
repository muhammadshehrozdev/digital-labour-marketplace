// Module 6: the one-time stratified split of the labelled dataset (7.5, protocol step 3).
// Run in ./backend:  npm run jobs:split -- --file <all.csv> --out-dir <folder outside the project>
//
// Writes <out-dir>/dev.csv and <out-dir>/test.csv, and results/split-<date>-<sha8>.json with ids and SHA-256 values
// only (no text; commit it). For a non-synthetic file the output folder must be OUTSIDE the Git work tree (the
// protocol keeps the test file out of the project until the one test run). A synthetic file may be split anywhere;
// its record is named results/SYNTHETIC-split-... (Git ignores those).
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJobDataset, toCsv } from './dataset.js';
import { stratifiedSplit } from './cv.js';
import { SEED } from './metrics.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(HERE, '..', '..', '..');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export const insideRepo = (folder) => {
  const rel = relative(REPO_ROOT, resolve(folder));
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
};

export function runSplit({ file, outDir, resultsDir = join(HERE, 'results'), date = new Date() }) {
  const data = loadJobDataset(file);
  const synthetic = data.synthetic || /synthetic/i.test(basename(file));
  if (insideRepo(outDir) && !/synthetic/i.test(basename(file))) {
    throw new Error('The output folder is inside the project. Real dev and test files must be written OUTSIDE the project folder (docs/evaluation/job-analysis/data-handling.md).');
  }
  const split = stratifiedSplit(data.items);
  const rowsById = new Map(data.items.map((it, i) => [it.id, data.rows[i]]));
  const write = (name, ids) => {
    const content = toCsv({ comments: data.comments, header: data.header, rows: ids.map((id) => rowsById.get(id)) });
    const path = join(outDir, name);
    writeFileSync(path, content);
    return { file: name, sha256: sha256(readFileSync(path, 'utf8')), items: ids.length, ids };
  };
  mkdirSync(outDir, { recursive: true });
  const dev = write(synthetic ? 'dev.synthetic.csv' : 'dev.csv', split.dev);
  const test = write(synthetic ? 'test.synthetic.csv' : 'test.csv', split.test);
  const record = {
    synthetic,
    warning: synthetic ? 'SYNTHETIC DATA: this split only tests the script.' : null,
    date: date.toISOString(),
    seed: SEED,
    devShare: split.devShare,
    input: { file: data.file, sha256: data.sha256, items: data.items.length },
    strata: split.strata,
    dev,
    test,
  };
  mkdirSync(resultsDir, { recursive: true });
  const recordPath = join(resultsDir, `${synthetic ? 'SYNTHETIC-' : ''}split-${record.date.slice(0, 10)}-${data.sha256.slice(0, 8)}.json`);
  writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
  return { record, recordPath, devPath: join(outDir, dev.file), testPath: join(outDir, test.file) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? undefined : process.argv[i + 1]; };
  if (!arg('file') || !arg('out-dir')) {
    console.error('Usage: npm run jobs:split -- --file <all.csv> --out-dir <folder outside the project>');
    process.exit(1);
  }
  try {
    const { record, recordPath, devPath, testPath } = runSplit({ file: arg('file'), outDir: arg('out-dir') });
    if (record.synthetic) console.log(`\n*** ${record.warning} ***\n`);
    console.log(`Split of ${record.input.file} (${record.input.items} items, sha256 ${record.input.sha256.slice(0, 12)}…), seed ${record.seed}`);
    for (const [name, s] of Object.entries(record.strata)) console.log(`  ${name.padEnd(22)} ${String(s.items).padStart(3)} items -> dev ${s.dev}, test ${s.test}`);
    console.log(`Development: ${devPath} (${record.dev.items})\nTest:        ${testPath} (${record.test.items})\nRecord:      ${recordPath}`);
  } catch (err) {
    console.error(`Split failed: ${err.message}`);
    process.exit(1);
  }
}
