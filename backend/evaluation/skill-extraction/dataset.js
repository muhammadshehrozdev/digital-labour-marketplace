// Loads a labelled dataset (CSV or JSON; format in docs/evaluation/dataset-format.md).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { SKILL_IDS, CATEGORY_IDS } from '../../config/skillTaxonomy.js';

export const SCRIPTS = ['english', 'roman_urdu', 'urdu', 'mixed'];
const COLUMNS = ['id', 'script', 'text', 'gold_skills', 'gold_category', 'gold_years', 'gold_months'];

// Minimal RFC 4180 CSV parser: quoted fields, "" escapes, newlines inside quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

const intOrNull = (v, what, id) => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  if (!/^\d{1,3}$/.test(String(v).trim())) throw new Error(`Item ${id}: ${what} must be a whole number or empty`);
  return Number(v);
};

export function validateItem(raw, line) {
  const id = String(raw.id ?? '').trim();
  if (!id) throw new Error(`Line ${line}: id is required`);
  const script = String(raw.script ?? '').trim();
  if (!SCRIPTS.includes(script)) throw new Error(`Item ${id}: script must be one of ${SCRIPTS.join(', ')}`);
  const text = String(raw.text ?? '');
  if (!text.trim()) throw new Error(`Item ${id}: text is empty`);
  const goldSkills = Array.isArray(raw.gold_skills)
    ? raw.gold_skills
    : String(raw.gold_skills ?? '').split(';').map((s) => s.trim()).filter(Boolean);
  for (const s of goldSkills) if (!SKILL_IDS.includes(s)) throw new Error(`Item ${id}: unknown skill id "${s}"`);
  const goldCategory = String(raw.gold_category ?? '').trim() || null;
  if (goldCategory && !CATEGORY_IDS.includes(goldCategory)) throw new Error(`Item ${id}: unknown category "${goldCategory}"`);
  const years = intOrNull(raw.gold_years, 'gold_years', id);
  const months = intOrNull(raw.gold_months, 'gold_months', id);
  const experience = years === null && months === null ? null : { years: years ?? 0, months: months ?? 0 };
  return { id, script, text, goldSkills: new Set(goldSkills), goldCategory, experience };
}

export function loadDataset(path) {
  const content = readFileSync(path, 'utf8');
  const sha256 = createHash('sha256').update(content).digest('hex');
  const synthetic = /synthetic/i.test(basename(path)) || /^\s*#.*SYNTHETIC/im.test(content) || /"synthetic"\s*:\s*true/.test(content);
  let rawItems;
  if (path.endsWith('.json')) {
    const json = JSON.parse(content);
    rawItems = Array.isArray(json) ? json : json.items;
  } else {
    const lines = content.split(/\r?\n/).filter((l) => !l.startsWith('#')).join('\n');
    const [header, ...rows] = parseCsv(lines);
    const missing = COLUMNS.filter((c) => !header.includes(c));
    if (missing.length) throw new Error(`CSV header is missing: ${missing.join(', ')}`);
    rawItems = rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
  }
  const items = rawItems.map((r, i) => validateItem(r, i + 2));
  const ids = new Set();
  for (const it of items) {
    if (ids.has(it.id)) throw new Error(`Duplicate id "${it.id}"`);
    ids.add(it.id);
  }
  return { items, sha256, synthetic, file: basename(path) };
}
