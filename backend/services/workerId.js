// Worker ID = DLM-<year>-<6 digits>, e.g. DLM-2026-000123 (audit M1-8).
// The number comes from one counter per year, increased atomically ($inc) in MongoDB,
// so two workers can never get the same ID (the old 4 random digits clashed).
// The year is the year in Pakistan (Asia/Karachi), whatever the server's time zone.
import Counter from '../models/Counter.js';

export function karachiYear(date = new Date()) {
  return new Intl.DateTimeFormat('en', { timeZone: 'Asia/Karachi', year: 'numeric' }).format(date);
}

export async function nextWorkerIdCode(date = new Date()) {
  const year = karachiYear(date);
  const key = `workerId-${year}`;
  let counter;
  try {
    counter = await Counter.findOneAndUpdate(
      { _id: key },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (err) {
    // Two "first ever" upserts at the same moment: one wins, the other retries once.
    if (err.code !== 11000) throw err;
    counter = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
  }
  return `DLM-${year}-${String(counter.seq).padStart(6, '0')}`;
}
