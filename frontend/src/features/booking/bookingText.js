// Module 4 booking display helpers (Batch 6). The server decides every state and every button
// (booking.actions); these helpers only choose pictures and words.
import { Ban, CalendarDays, CircleCheck, CircleX, Clock, Handshake, Hourglass, Sun, Sunrise, Sunset, TimerOff } from 'lucide-react';

export const SLOTS = Object.freeze(['morning', 'afternoon', 'evening', 'any']);
export const SLOT_ICONS = Object.freeze({ morning: Sunrise, afternoon: Sun, evening: Sunset, any: Clock });
export const DAY_ICON = CalendarDays;
export const ACTIVE = Object.freeze(['requested', 'accepted']);

export const STATUS_LOOK = Object.freeze({
  requested: { tone: 'warning', icon: Hourglass },
  accepted: { tone: 'primary', icon: Handshake },
  completed: { tone: 'success', icon: CircleCheck },
  declined: { tone: 'neutral', icon: CircleX },
  expired: { tone: 'neutral', icon: TimerOff },
  cancelled: { tone: 'danger', icon: Ban },
});

export const CANCEL_REASONS = Object.freeze(['plans_changed', 'found_someone_else', 'cannot_come', 'emergency', 'price', 'other']);
export const DECLINE_REASONS = Object.freeze(['busy', 'too_far', 'not_my_work', 'other']);
export const DISPUTE_REASONS = Object.freeze(['work_was_done', 'work_not_done', 'i_did_come', 'not_my_fault', 'other']);

const HOUR = 60 * 60 * 1000;
// 'YYYY-MM-DD' in Pakistan time (UTC+5): the day people mean by "today".
export const pktDay = (ms = Date.now()) => new Date(ms + 5 * HOUR).toISOString().slice(0, 10);
export const addDays = (day, n) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 24 * HOUR).toISOString().slice(0, 10);

// "Today", "Tomorrow" or the date in words (the key, so it can also be spoken in another language).
export function dayKey(preferredDate, now = Date.now()) {
  const today = pktDay(now);
  if (preferredDate === today) return 'booking.day.today';
  if (preferredDate === addDays(today, 1)) return 'booking.day.tomorrow';
  return null;
}

export function dayWords(t, formatDate, preferredDate, now) {
  const key = dayKey(preferredDate, now);
  return key ? t(key) : formatDate(`${preferredDate}T12:00:00Z`, { weekday: 'long', day: 'numeric', month: 'long' });
}

// Where a person opens one booking.
export const bookingPath = (role, id) => (role === 'worker' ? `/worker/jobs/${id}` : `/bookings/${id}`);

// the word for one event: a known reason code first, else the new state
export function eventKey(e) {
  if (e.reason && ['confirmed_done', 'both_confirmed', 'auto_completed', 'no_answer', 'no_show_reported', 'no_show_admitted', 'no_show_unanswered',
    'dispute_completion_contested', 'dispute_no_show_contested', 'dispute_cancellation_fault'].includes(e.reason)) return `booking.event.${e.reason}`;
  if (e.by === 'admin') return 'booking.event.admin_decision';
  return `booking.event.to_${e.to}`;
}

// Reasons a worker may give when reporting a review (the server's REPORT_REASONS).
export const REPORT_REASONS = Object.freeze(['abusive', 'personal_information', 'not_about_my_work', 'job_did_not_happen', 'other']);
