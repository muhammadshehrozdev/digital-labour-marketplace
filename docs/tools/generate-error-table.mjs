// Rewrites the "Error codes" table at the end of docs/API.md from backend/errors/catalog.js.
//   node docs/tools/generate-error-table.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ERRORS } from '../../backend/errors/catalog.js';

const file = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'API.md');
const text = readFileSync(file, 'utf8');
const heading = '## Error codes (generated from backend/errors/catalog.js)';
const start = text.indexOf(heading);
if (start === -1) throw new Error('Heading not found in docs/API.md');
const table = Object.entries(ERRORS).map(([code, english]) => `| \`${code}\` | ${english.replace(/\|/g, '\\|')} |`).join('\n');
const section = `${heading}

The English text is the fallback. Placeholders in braces come from \`params\`. A test checks that this
table lists every code in the catalog. Regenerate it with \`node docs/tools/generate-error-table.mjs\`.

| Code | English text |
|---|---|
${table}
`;
writeFileSync(file, text.slice(0, start) + section);
console.log(`docs/API.md: ${Object.keys(ERRORS).length} error codes written`);
