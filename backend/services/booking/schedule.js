// Dates and times of a booking, in Pakistan time (Asia/Karachi: UTC+5, no daylight saving). PURE.
// The browser sends a calendar day ('YYYY-MM-DD') and a time slot; the server turns them into one
// moment (scheduledStart), stored as a normal UTC date.
import { BOOKING_RULES, TIME_SLOTS } from '../../config/bookingRules.js';

export const PKT_OFFSET_HOURS = 5;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// 'YYYY-MM-DD' of a moment, in Pakistan time.
export const pktDate = (moment) => new Date(moment.getTime() + PKT_OFFSET_HOURS * HOUR_MS).toISOString().slice(0, 10);

// The UTC moment of `hour`:00 Pakistan time on the calendar day `date`.
export function scheduledStartFor(date, timeSlot) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '');
  if (!match || !(timeSlot in TIME_SLOTS)) throw new Error('date must be YYYY-MM-DD and the slot one of the time slots');
  const [, y, m, d] = match.map(Number);
  return new Date(Date.UTC(y, m - 1, d, TIME_SLOTS[timeSlot] - PKT_OFFSET_HOURS));
}

// Days from today (Pakistan) to `date`: 0 = today, 1 = tomorrow, negative = in the past.
export function daysAhead(date, now) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${pktDate(now)}T00:00:00Z`)) / DAY_MS);
}

export const isAllowedDate = (date, now) => {
  const ahead = daysAhead(date, now);
  return ahead >= 0 && ahead <= BOOKING_RULES.MAX_DAYS_AHEAD;
};

export const hoursBetween = (from, to) => (new Date(to).getTime() - new Date(from).getTime()) / HOUR_MS;
export const addHours = (date, hours) => new Date(new Date(date).getTime() + hours * HOUR_MS);
export const addDays = (date, days) => new Date(new Date(date).getTime() + days * DAY_MS);

// A worker's cancellation: "early" when it is at least LATE_CANCEL_HOURS before the start, else "late".
export const workerCancelOutcome = (scheduledStart, now) =>
  (hoursBetween(now, scheduledStart) >= BOOKING_RULES.LATE_CANCEL_HOURS ? 'cancelled_by_worker_early' : 'cancelled_by_worker_late');
