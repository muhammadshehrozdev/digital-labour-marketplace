// Builds CSV text for the admin exports (Batch 4, feature 31). Pure functions, unit tested.
// - Every cell is escaped (quotes, commas, line breaks).
// - Formula injection: a text cell that starts with = + - @ tab or return would be run as a
//   formula by Excel or Google Sheets, so it gets a leading apostrophe (OWASP "CSV Injection").
// - A CNIC-like number (13 digits, with or without dashes) is replaced, as a last safety net:
//   exports never contain a CNIC, even if someone typed one into a free-text note.
const FORMULA_START = /^[=+\-@\t\r]/;
const CNIC_LIKE = /\b\d{5}[-\s]?\d{7}[-\s]?\d\b/g;
export const CNIC_REMOVED = '[CNIC removed]';
const BOM = '﻿'; // lets Excel open the file as UTF-8 (Urdu text)

export function csvCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  let text = value instanceof Date ? value.toISOString() : String(value);
  text = text.replace(CNIC_LIKE, CNIC_REMOVED);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// columns: [{ header, value: (row) => any }]
export function toCsv(columns, rows) {
  const lines = [columns.map((c) => csvCell(c.header)).join(',')];
  for (const row of rows) lines.push(columns.map((c) => csvCell(c.value(row))).join(','));
  return `${BOM}${lines.join('\r\n')}\r\n`;
}
