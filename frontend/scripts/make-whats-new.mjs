// Builds src/content/whatsNew.json from docs/CHANGELOG.md for the "What's new" panel (Batch 4,
// feature 54). The newest three sections, each with its first eight points, as plain text.
//   npm run whats-new      (inside .\frontend; run again after the change log changes)
// The change log is written in English, so the entries are English in every website language;
// the panel says where they come from.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '..', '..', 'docs', 'CHANGELOG.md');
const target = resolve(here, '..', 'src', 'content', 'whatsNew.json');

// Markdown to plain text: links keep their words, code and bold marks are removed.
export const plain = (line) => line
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\*\*|`/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export function parseChangelog(text, { sections = 3, points = 8 } = {}) {
  const out = [];
  let current = null;
  let item = null;
  for (const raw of text.split(/\r?\n/)) {
    if (raw.startsWith('## ')) {
      if (out.length === sections) break;
      current = { title: plain(raw.slice(3)), points: [] };
      out.push(current);
      item = null;
    } else if (current && /^- /.test(raw)) {
      item = plain(raw.slice(2));
      if (current.points.length < points) current.points.push(item);
    } else if (current && item !== null && /^ {2,}\S/.test(raw) && current.points.length <= points && current.points.at(-1) === item) {
      // a bullet continued on the next line
      item = `${item} ${plain(raw)}`;
      current.points[current.points.length - 1] = item;
    } else if (!raw.trim()) {
      item = null;
    }
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sections = parseChangelog(readFileSync(source, 'utf8'));
  writeFileSync(target, `${JSON.stringify({ generatedFrom: 'docs/CHANGELOG.md', sections }, null, 2)}\n`);
  console.log(`whatsNew.json: ${sections.length} sections`);
}
