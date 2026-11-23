// Readable yearly codes from one atomic counter per year and kind (audit M1-8): BK-2026-000123 for bookings
// (Module 4), JR-2026-000001 for job requests (Module 6). The year is the Pakistan year.
import Counter from '../models/Counter.js';
import { karachiYear } from './workerId.js';

export async function nextYearlyCode(key, prefix, date = new Date()) {
  const year = karachiYear(date);
  const id = `${key}-${year}`;
  let counter;
  try {
    counter = await Counter.findOneAndUpdate({ _id: id }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  } catch (err) {
    if (err.code !== 11000) throw err; // two "first ever" upserts at once: retry once
    counter = await Counter.findOneAndUpdate({ _id: id }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
  }
  return `${prefix}-${year}-${String(counter.seq).padStart(6, '0')}`;
}
