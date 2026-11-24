// Writes docs/i18n/REVIEW.md: every Urdu and Roman Urdu text next to its English source, for a team
// member who reads Urdu to check. Run in .\frontend:  node scripts/i18n-review.mjs
import { writeFileSync } from 'node:fs';
import en from '../src/i18n/dictionaries/en.js';
import ur from '../src/i18n/dictionaries/ur.js';
import urLatn from '../src/i18n/dictionaries/ur-Latn.js';
import { flattenKeys, isPluralObject, lookup } from '../src/i18n/translate.js';
import { LANGUAGES } from '../src/i18n/languages.js';
import { CATEGORIES, SKILLS, DISPLAY_NAMES } from '../../backend/config/skillTaxonomy.js';

const cell = (v) => {
  if (v === undefined || v === null) return '—';
  const text = isPluralObject(v) ? Object.entries(v).map(([k, x]) => `${k}: ${x}`).join(' / ') : String(v);
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
};
const rows = [];
const table = (title, header, lines) => {
  rows.push(`\n## ${title}\n`, `| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, ...lines.map((l) => `| ${l.map(cell).join(' | ')} | |`));
};

const keys = flattenKeys(en);
const sections = [...new Set(keys.map((k) => k.split('.')[0]))];
for (const section of sections) {
  table(`Website texts: \`${section}\``, ['Key', 'English', 'اردو (Urdu)', 'Roman Urdu', 'Checked by'],
    keys.filter((k) => k.split('.')[0] === section).map((k) => [k, lookup(en, k), lookup(ur, k), lookup(urLatn, k)]));
}
const info = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));
table('Language chooser (shown in all three languages at once)', ['Text', 'English', 'اردو (Urdu)', 'Roman Urdu', 'Checked by'],
  ['preview', 'chooserTitle', 'chooserHint', 'chooserContinue'].map((k) => [k, info.en[k], info.ur[k], info['ur-Latn'][k]]));
table('Hero headline (typewriter, Batch 3 Part 4.5: suggested lines)', ['Text', 'English', 'اردو (Urdu)', 'Roman Urdu', 'Checked by'],
  [['headline', 'Skilled work, verified.', 'ہنر مند کام، تصدیق شدہ۔', 'Hunarmand kaam, tasdeeq shuda.']]);
table('Trades (backend/config/skillTaxonomy.js, DISPLAY_NAMES)', ['Id', 'English', 'اردو (Urdu)', 'Roman Urdu', 'Checked by'],
  CATEGORIES.flatMap((c) => [
    [`${c.id} (label)`, c.label, DISPLAY_NAMES.categories[c.id].ur[0], DISPLAY_NAMES.categories[c.id]['ur-Latn'][0]],
    [`${c.id} (occupation)`, c.occupation, DISPLAY_NAMES.categories[c.id].ur[1], DISPLAY_NAMES.categories[c.id]['ur-Latn'][1]],
  ]));
table('Skills (backend/config/skillTaxonomy.js, DISPLAY_NAMES)', ['Id', 'English', 'اردو (Urdu)', 'Roman Urdu', 'Checked by'],
  SKILLS.map((s) => [s.id, s.name, DISPLAY_NAMES.skills[s.id].ur, DISPLAY_NAMES.skills[s.id]['ur-Latn']]));

const count = keys.length + 4 + 1 + CATEGORIES.length * 2 + SKILLS.length;
const head = `# Urdu and Roman Urdu texts: review list

**Status: reviewed by the team on 11 Nov 2026 (decision D-031).** The texts were first written as drafts
(Batch 3, 10 Nov 2026). Texts added or changed after that review must be checked the same way: read the
row, write your name in "Checked by" when it is right, and correct the text in the file named in the section title
(\`frontend/src/i18n/dictionaries/ur.js\`, \`ur-Latn.js\`, \`frontend/src/i18n/languages.js\`, or
\`backend/config/skillTaxonomy.js\`). Then run \`node scripts/i18n-review.mjs\` in \`.\\frontend\` to update this file.

What to check: simple, everyday words for a worker with basic reading skills; short sentences; correct
spelling; Roman Urdu spelled the way people type it on WhatsApp. Placeholders such as \`{name}\` and
\`{count}\` must stay exactly as they are. Digits stay Western (0-9).

${count} texts in total (generated from the source files; not hand-copied).
`;
writeFileSync(new URL('../../docs/i18n/REVIEW.md', import.meta.url), `${head}${rows.join('\n')}\n`);
console.log(`docs/i18n/REVIEW.md written: ${count} texts`);
