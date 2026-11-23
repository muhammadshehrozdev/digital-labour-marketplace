// Module 6: try the job analyzer on one text (no database, nothing saved).
// Run in ./backend:
//   npm run jobs:try -- "Kal subah AC ki service karwani hai"
//   npm run jobs:try -- "..." --now 2026-11-24T10:00:00+05:00      (the clock for "aaj / kal")
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeJob } from '../services/jobAnalyzer/index.js';

const list = (xs) => (xs && xs.length ? xs.join(', ') : '-');
const show = (v) => (v === null || v === undefined || v === '' ? '-' : String(v));

export function rows(a) {
  const cat = a.category.suggested ?? (a.category.tie ? `tie: ${list(a.category.ranked)}` : null);
  const budget = a.budget.suggested ? `${a.budget.suggested.amount} per ${a.budget.suggested.unit}` : null;
  return [
    ['trade (category)', show(cat), list(a.category.source === 'nb' ? a.category.words : a.category.matched)],
    ['skills', list(a.skills.map((s) => s.skillId)), list([...new Set(a.skills.flatMap((s) => s.matched))])],
    ['task type', show(a.taskType.suggested) + (a.taskType.fromCategory ? ' (from the trade)' : ''), list(a.taskType.matched)],
    ['city', show(a.city.suggested ? `${a.city.suggested} (${a.city.region})` : a.city.conflict ? 'two cities: customer chooses' : null), list(a.city.matched)],
    ['day', show(a.when.suggested ? `${a.when.suggested} ${a.when.date}` : null), list(a.when.matched)],
    ['time of day', show(a.timeSlot.suggested), list(a.timeSlot.matched)],
    ['urgent', a.urgent.suggested ? 'yes' : '-', list(a.urgent.matched)],
    ['budget', show(budget), list(a.budget.matched)],
    ['notes', list(a.notes), ''],
    ['still needed', list(a.missing), ''],
  ];
}

export function table(title, a) {
  const r = rows(a);
  const w0 = Math.max(...r.map((x) => x[0].length));
  const w1 = Math.max(12, ...r.map((x) => x[1].length));
  return [
    `${title}  (${a.methodName}; analyzer ${a.versions.analyzer}, phrases ${a.versions.phrases}${a.versions.model ? `, model ${a.versions.model}` : ''})`,
    `  ${'field'.padEnd(w0)}  ${'suggestion'.padEnd(w1)}  words that led to it`,
    ...r.map(([k, v, m]) => `  ${k.padEnd(w0)}  ${v.padEnd(w1)}  ${m}`),
  ].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? undefined : args[i + 1]; };
  const flagPositions = new Set(['--now'].map((f) => args.indexOf(f)).filter((i) => i >= 0).flatMap((i) => [i, i + 1]));
  const text = args.filter((a, i) => !flagPositions.has(i) && !a.startsWith('--')).join(' ');
  if (!text.trim()) {
    console.error('Usage: npm run jobs:try -- "<job description>" [--now <ISO time>]');
    process.exit(1);
  }
  const now = flag('now') ? new Date(flag('now')) : new Date();
  if (Number.isNaN(now.getTime())) {
    console.error('--now must be a date and time, for example 2026-11-24T10:00:00+05:00');
    process.exit(1);
  }
  console.log(`Text: ${text}\nClock: ${now.toISOString()}\n`);
  console.log(table('Rules', analyzeJob(text, { now, method: 'rules' })));
  console.log('\nNothing was saved. These are suggestions; the customer confirms or changes every one.');
}
