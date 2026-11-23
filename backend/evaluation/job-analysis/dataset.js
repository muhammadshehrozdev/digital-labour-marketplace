// Module 6: loads and checks a labelled job-description dataset (CSV; format in
// docs/evaluation/job-analysis/dataset-format.md). Unknown ids or values -> a clear error with the item id.
// A file whose name or first lines say "synthetic" is marked SYNTHETIC: its numbers are never results.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { parseCsv } from '../skill-extraction/dataset.js';
import { CATEGORY_IDS, SKILL_IDS } from '../../config/skillTaxonomy.js';
import { TASK_TYPES } from '../../config/jobRules.js';
import { UNITS } from '../../config/workTerms.js';
import { canonicalCity } from '../../config/regions.js';

export const COLUMNS = Object.freeze([
  'id', 'source', 'prompt', 'script', 'text', 'gold_category', 'gold_skills', 'gold_task_type', 'gold_city', 'gold_when',
  'gold_time_slot', 'gold_budget_amount', 'gold_budget_unit', 'gold_urgent',
]);
export const SOURCES = Object.freeze(['form', 'in_person', 'other']);
export const PROMPTS = Object.freeze(['general', 'targeted']);
export const SCRIPTS = Object.freeze(['english', 'roman_urdu', 'urdu', 'mixed']);
export const WHEN_VALUES = Object.freeze(['today', 'tomorrow', 'day_after']);
export const SLOT_VALUES = Object.freeze(['morning', 'afternoon', 'evening']);
export const NONE = 'none';

const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const oneOf = (value, list, what, id) => {
  if (!list.includes(value)) throw new Error(`Item ${id}: ${what} must be one of ${list.join(', ')} (found "${value}")`);
  return value;
};
const emptyOr = (value, list, what, id) => (value === '' ? null : oneOf(value, list, what, id));

export function validateJobItem(raw, line) {
  const get = (k) => String(raw[k] ?? '').trim();
  const id = get('id');
  if (!id) throw new Error(`Line ${line}: id is required`);
  const text = String(raw.text ?? '');
  if (!text.trim()) throw new Error(`Item ${id}: text is empty`);
  const category = get('gold_category');
  if (category !== NONE && !CATEGORY_IDS.includes(category)) throw new Error(`Item ${id}: unknown category "${category}" (use a category id or "none")`);
  const skills = get('gold_skills').split(';').map((s) => s.trim()).filter(Boolean);
  for (const s of skills) if (!SKILL_IDS.includes(s)) throw new Error(`Item ${id}: unknown skill id "${s}"`);
  const city = get('gold_city');
  if (city && canonicalCity(city) !== city) throw new Error(`Item ${id}: gold_city "${city}" is not an English city name of config/regions.js`);
  const amountText = get('gold_budget_amount');
  const unit = get('gold_budget_unit');
  if ((amountText === '') !== (unit === '')) throw new Error(`Item ${id}: write both gold_budget_amount and gold_budget_unit, or neither`);
  if (amountText && !/^\d{1,9}$/.test(amountText)) throw new Error(`Item ${id}: gold_budget_amount must be whole rupees`);
  if (unit) oneOf(unit, UNITS, 'gold_budget_unit', id);
  const urgent = oneOf(get('gold_urgent'), ['yes', 'no'], 'gold_urgent', id);
  return {
    id,
    source: oneOf(get('source'), SOURCES, 'source', id),
    prompt: oneOf(get('prompt'), PROMPTS, 'prompt', id),
    script: oneOf(get('script'), SCRIPTS, 'script', id),
    text,
    gold: {
      category,
      skills: new Set(skills),
      taskType: emptyOr(get('gold_task_type'), TASK_TYPES, 'gold_task_type', id),
      city: city || null,
      when: emptyOr(get('gold_when'), WHEN_VALUES, 'gold_when', id),
      timeSlot: emptyOr(get('gold_time_slot'), SLOT_VALUES, 'gold_time_slot', id),
      budget: amountText ? { amount: Number(amountText), unit } : null,
      urgent: urgent === 'yes',
    },
  };
}

// Text -> { comments, header, rows (arrays of fields), items }. Lines starting with "#" are comments.
export function parseJobCsv(content) {
  const lines = content.split(/\r?\n/);
  const comments = lines.filter((l) => l.startsWith('#'));
  const [header, ...rows] = parseCsv(lines.filter((l) => !l.startsWith('#')).join('\n'));
  if (!header) throw new Error('The CSV file is empty');
  const missing = COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`CSV header is missing: ${missing.join(', ')}`);
  const items = rows.map((r, i) => validateJobItem(Object.fromEntries(header.map((h, j) => [h, r[j] ?? ''])), i + 2));
  const ids = new Set();
  for (const it of items) {
    if (ids.has(it.id)) throw new Error(`Duplicate id "${it.id}"`);
    ids.add(it.id);
  }
  return { comments, header, rows, items };
}

// Synthetic = the file name says so, or its FIRST line starts with "# SYNTHETIC" (dataset-format.md). Only the first
// line, case-sensitive: a real file with a comment such as "# real data, not synthetic" stays real (Batch 8A review).
export const isSyntheticFile = (path, content) => /synthetic/i.test(basename(path)) || /^#\s*SYNTHETIC\b/.test(content.split(/\r?\n/, 1)[0] ?? '');

export function loadJobDataset(path) {
  const content = readFileSync(path, 'utf8');
  const text = content.replace(/^\uFEFF/, ''); // a byte-order mark from a spreadsheet export; the hash stays the raw file's
  return { ...parseJobCsv(text), sha256: sha256(content), synthetic: isSyntheticFile(path, text), file: basename(path) };
}

// One CSV field, quoted when needed (RFC 4180).
const field = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export const toCsv = ({ comments = [], header, rows }) => `${[...comments, header.map(field).join(','), ...rows.map((r) => r.map(field).join(','))].join('\n')}\n`;
