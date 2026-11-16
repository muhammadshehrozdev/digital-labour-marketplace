// Module 4: the pure booking rules (no database): the contact-info check, the state machine, dates in
// Pakistan time, short names, the contact window, the cron secret and the notification params.
import { describe, test, expect } from 'vitest';
import { findContactInfo, normalizePhone, whatsappLink } from '../../services/booking/contactInfo.js';
import { canDo, availableActions, cancelOutcome, disputeResult, STATE_TABLE } from '../../services/booking/transitions.js';
import { scheduledStartFor, pktDate, daysAhead, isAllowedDate, workerCancelOutcome } from '../../services/booking/schedule.js';
import { contactVisible } from '../../services/booking/contact.js';
import { shortName } from '../../services/booking/views.js';
import { secretMatches } from '../../controllers/cronController.js';
import { cleanParams } from '../../services/notifications.js';
import { DISPUTE_DECISIONS } from '../../config/bookingRules.js';
import { loadEnv } from '../../config/env.js';

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-11-16T10:00:00Z'); // 15:00 in Pakistan

describe('contact-info check (Western, Urdu and Arabic digits)', () => {
  test.each([
    ['0300 1234567', 'number'], ['0300-123-4567', 'number'], ['+92 300 1234567', 'number'], ['0300.123.4567', 'number'],
    ['(0300) 1234567', 'number'], ['0300/1234567', 'number'], ['call 0 3 0 0 1 2 3 4 5 6 7', 'number'],
    ['۰۳۰۰۱۲۳۴۵۶۷', 'number'], ['میرا نمبر ۰۳۰۰ ۱۲۳ ۴۵۶۷ ہے', 'number'], ['٠٣٠٠١٢٣٤٥٦٧', 'number'], ['Mera number ۰۳۰۰-۱۲۳۴۵۶۷ hai', 'number'],
    ['sara@example.com', 'email'], ['mail: ali.khan@gmail.pk', 'email'],
    ['https://example.org/x', 'link'], ['www.mysite.pk', 'link'], ['wa.me/923001234567', 'link'], ['visit shop.com', 'link'],
    ['37405-1234567-1', 'cnic'], ['CNIC ۳۷۴۰۵-۱۲۳۴۵۶۷-۱', 'cnic'],
  ])('%s -> %s', (text, kind) => {
    expect(findContactInfo(text)).toBe(kind);
  });

  test.each([
    'House 12, Street 4, G-9/1 Islamabad', 'Two sockets and one fan, 3 rooms', 'Sector F-10 Markaz, near the 2nd gate',
    'گھر نمبر ۱۲، گلی ۴، جی نائن', 'Ghar number 12, gali 4', 'Rs. 1500 for the day', 'Come at 9:30 in the morning', '', '   ',
    'Wiring of 2 floors, 10 points', 'Bring a 20 m wire',
  ])('allowed: %s', (text) => {
    expect(findContactInfo(text)).toBeNull();
  });

  test('phone numbers in one form; WhatsApp links only for Pakistani mobiles', () => {
    expect(normalizePhone('+92 300 1234567')).toBe('03001234567');
    expect(normalizePhone('0092-300-1234567')).toBe('03001234567');
    expect(normalizePhone('۰۳۰۰۱۲۳۴۵۶۷')).toBe('03001234567');
    expect(normalizePhone('')).toBe('');
    expect(whatsappLink('0300 1234567')).toBe('https://wa.me/923001234567');
    expect(whatsappLink('12345')).toBeNull();
  });
});

describe('state machine (canDo)', () => {
  const start = new Date(NOW.getTime() + 48 * HOUR);
  const base = { status: 'requested', scheduledStart: start, customerConfirmedAt: null, workerConfirmedAt: null, noShow: {}, dispute: {} };
  const b = (over = {}) => ({ ...base, ...over });

  test('requested: the worker accepts or declines; only the customer cancels', () => {
    expect(availableActions(b(), 'worker', NOW)).toEqual(['accept', 'decline']);
    expect(availableActions(b(), 'customer', NOW)).toEqual(['cancel']);
    expect(canDo('accept', b(), 'customer', NOW).code).toBe('FORBIDDEN');
    expect(canDo('expire', b(), 'worker', NOW).code).toBe('FORBIDDEN');
  });

  test('accepted: cancel and "Work done" for both; contest only after the OTHER side confirmed', () => {
    const a = b({ status: 'accepted' });
    expect(availableActions(a, 'customer', NOW)).toEqual(['cancel', 'confirm_done']);
    expect(availableActions(a, 'worker', NOW)).toEqual(['cancel', 'confirm_done']);
    const workerDone = b({ status: 'accepted', workerConfirmedAt: NOW });
    expect(availableActions(workerDone, 'customer', NOW)).toEqual(['confirm_done', 'contest_done']);
    expect(availableActions(workerDone, 'worker', NOW)).toEqual([]);
    expect(canDo('confirm_done', workerDone, 'worker', NOW).code).toBe('BOOKING_CHANGED');
  });

  test('no-show: from the start + 2 hours, only while nobody confirmed; the worker then answers', () => {
    const a = b({ status: 'accepted', scheduledStart: new Date(NOW.getTime() - HOUR) });
    expect(canDo('report_no_show', a, 'customer', NOW).code).toBe('NO_SHOW_TOO_EARLY');
    const later = new Date(NOW.getTime() + 1.5 * HOUR);
    expect(canDo('report_no_show', a, 'customer', later).ok).toBe(true);
    const reported = b({ status: 'accepted', noShow: { reportedAt: NOW } });
    expect(availableActions(reported, 'worker', NOW)).toEqual(['respond_no_show']);
    expect(availableActions(reported, 'customer', NOW)).toEqual([]);
  });

  test('while a dispute is open nothing else is possible; wrong states are refused; double actions are 409', () => {
    const open = b({ status: 'accepted', dispute: { type: 'completion_contested', status: 'open' } });
    for (const action of ['cancel', 'confirm_done', 'report_no_show']) expect(canDo(action, open, 'customer', NOW).code).toBe('DISPUTE_OPEN');
    expect(canDo('accept', b({ status: 'cancelled' }), 'worker', NOW).code).toBe('BOOKING_NOT_ALLOWED');
    expect(canDo('accept', b({ status: 'accepted' }), 'worker', NOW).code).toBe('BOOKING_CHANGED');
    expect(canDo('cancel', b({ status: 'cancelled' }), 'customer', NOW).code).toBe('BOOKING_CHANGED');
    expect(canDo('nothing', b(), 'customer', NOW).code).toBe('BOOKING_NOT_ALLOWED');
  });

  test('worker disputes: a cancellation fault or an unanswered no-show, within 14 days, once', () => {
    const closedAt = new Date(NOW.getTime() - 2 * 24 * HOUR);
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'cancelled_by_worker_late', closedAt }), 'worker', NOW)).toEqual({ ok: true, type: 'cancellation_fault' });
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'worker_no_show', closedAt, noShow: { workerResponse: 'no_answer' } }), 'worker', NOW)).toEqual({ ok: true, type: 'no_show_contested' });
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'worker_no_show', closedAt, noShow: { workerResponse: 'admit' } }), 'worker', NOW).code).toBe('DISPUTE_NOT_ALLOWED');
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'cancelled_by_customer', closedAt }), 'worker', NOW).code).toBe('DISPUTE_NOT_ALLOWED');
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'cancelled_by_worker_early', closedAt: new Date(NOW.getTime() - 15 * 24 * HOUR) }), 'worker', NOW).code).toBe('DISPUTE_WINDOW_PASSED');
    expect(canDo('dispute', b({ status: 'cancelled', outcome: 'cancelled_by_worker_late', closedAt, dispute: { type: 'cancellation_fault', status: 'decided' } }), 'worker', NOW).code).toBe('DISPUTE_NOT_ALLOWED');
  });

  test('review: completed, once, inside 14 days', () => {
    const done = b({ status: 'completed', completedAt: new Date(NOW.getTime() - 24 * HOUR) });
    expect(availableActions(done, 'customer', NOW)).toEqual(['review']);
    expect(availableActions(done, 'customer', NOW, { hasReview: true })).toEqual([]);
    expect(canDo('review', b({ status: 'completed', completedAt: new Date(NOW.getTime() - 15 * 24 * HOUR) }), 'customer', NOW).code).toBe('REVIEW_WINDOW_PASSED');
  });

  test('cancel outcomes and every admin decision', () => {
    const a = b({ status: 'accepted' });
    expect(cancelOutcome(a, 'customer', NOW)).toBe('cancelled_by_customer');
    expect(cancelOutcome(a, 'worker', NOW)).toBe('cancelled_by_worker_early'); // 48 h before the start
    expect(cancelOutcome(b({ status: 'accepted', scheduledStart: new Date(NOW.getTime() + 23 * HOUR) }), 'worker', NOW)).toBe('cancelled_by_worker_late');
    expect(workerCancelOutcome(new Date(NOW.getTime() + 24 * HOUR), NOW)).toBe('cancelled_by_worker_early');
    expect(workerCancelOutcome(new Date(NOW.getTime() - HOUR), NOW)).toBe('cancelled_by_worker_late');
    const outcomes = Object.entries(DISPUTE_DECISIONS).flatMap(([type, decisions]) => decisions.map((d) => [`${type}:${d}`, disputeResult(type, d, a)?.outcome ?? null]));
    expect(Object.fromEntries(outcomes)).toEqual({
      'completion_contested:work_done': 'completed', 'completion_contested:not_done_worker_fault': 'worker_no_show', 'completion_contested:not_done_no_fault': 'closed_no_fault',
      'no_show_contested:no_show_confirmed': 'worker_no_show', 'no_show_contested:no_show_rejected': 'closed_no_fault',
      'cancellation_fault:worker_fault': null, 'cancellation_fault:no_fault': 'closed_no_fault',
    });
    expect(disputeResult('cancellation_fault', 'worker_fault', { status: 'cancelled', outcome: 'cancelled_by_worker_late' })).toMatchObject({ unchanged: true, outcome: 'cancelled_by_worker_late' });
    expect(disputeResult('no_show_contested', 'work_done', a)).toBeNull();
    expect(Object.keys(STATE_TABLE)).toContain('decide_dispute');
  });
});

describe('dates in Pakistan time (UTC+5, no daylight saving)', () => {
  test('slots to a UTC moment; near midnight UTC the Pakistan day is already the next one', () => {
    expect(scheduledStartFor('2026-11-17', 'morning').toISOString()).toBe('2026-11-17T04:00:00.000Z');
    expect(scheduledStartFor('2026-11-17', 'afternoon').toISOString()).toBe('2026-11-17T08:00:00.000Z');
    expect(scheduledStartFor('2026-11-17', 'evening').toISOString()).toBe('2026-11-17T12:00:00.000Z');
    expect(scheduledStartFor('2026-11-17', 'any').toISOString()).toBe('2026-11-17T04:00:00.000Z');
    const nearMidnight = new Date('2026-11-16T20:30:00Z'); // 01:30 on 17 Nov in Pakistan
    expect(pktDate(nearMidnight)).toBe('2026-11-17');
    expect(daysAhead('2026-11-17', nearMidnight)).toBe(0); // "today" for a person in Pakistan
    expect(isAllowedDate('2026-11-16', nearMidnight)).toBe(false); // already yesterday there
    expect(isAllowedDate('2026-12-17', nearMidnight)).toBe(true); // 30 days ahead
    expect(isAllowedDate('2026-12-18', nearMidnight)).toBe(false);
    expect(() => scheduledStartFor('2026-11-17', 'night')).toThrow();
  });
});

describe('small helpers', () => {
  test('short public names', () => {
    expect(shortName('Sara Khan')).toBe('Sara K.');
    expect(shortName('Muhammad Bilal Ahmed')).toBe('Muhammad A.');
    expect(shortName('Demo Customer (synthetic)')).toBe('Demo C.');
    expect(shortName('Sara')).toBe('Sara');
    expect(shortName('سارہ خان')).toBe('سارہ خ.');
    expect(shortName('')).toBe('');
    expect(shortName(null)).toBe('');
  });

  test('contact window: accepted, or 7 days after a close of an accepted booking; never if never accepted', () => {
    const acceptedAt = new Date(NOW.getTime() - 48 * HOUR);
    expect(contactVisible({ status: 'accepted', acceptedAt }, NOW)).toBe(true);
    expect(contactVisible({ status: 'requested', acceptedAt: null }, NOW)).toBe(false);
    expect(contactVisible({ status: 'cancelled', acceptedAt: null, closedAt: NOW }, NOW)).toBe(false);
    expect(contactVisible({ status: 'completed', acceptedAt, closedAt: new Date(NOW.getTime() - 6 * 24 * HOUR) }, NOW)).toBe(true);
    expect(contactVisible({ status: 'completed', acceptedAt, closedAt: new Date(NOW.getTime() - 8 * 24 * HOUR) }, NOW)).toBe(false);
    expect(contactVisible({ status: 'declined', acceptedAt, closedAt: NOW }, NOW)).toBe(false);
  });

  test('cron secret: constant-time comparison; no secret set means never', () => {
    expect(secretMatches('Bearer abc', 'abc')).toBe(true);
    expect(secretMatches('Bearer abd', 'abc')).toBe(false);
    expect(secretMatches('abc', 'abc')).toBe(false);
    expect(secretMatches(undefined, 'abc')).toBe(false);
    expect(secretMatches('Bearer ', '')).toBe(false);
    expect(secretMatches('Bearer undefined', undefined)).toBe(false);
  });

  test('CRON_SECRET is optional and must be long enough when set', () => {
    const env = { MONGO_URI: 'mongodb://127.0.0.1:27017/x', JWT_SECRET: 'x'.repeat(32), CLIENT_ORIGIN: 'http://127.0.0.1:5173', CNIC_ENC_KEY: Buffer.alloc(32, 1).toString('base64'), CNIC_HASH_KEY: Buffer.alloc(32, 2).toString('base64') };
    expect(loadEnv(env).CRON_SECRET).toBeUndefined();
    expect(() => loadEnv({ ...env, CRON_SECRET: 'short' })).toThrow(/CRON_SECRET/);
    expect(loadEnv({ ...env, CRON_SECRET: 'y'.repeat(40) }).CRON_SECRET).toHaveLength(40);
  });

  test('notification params keep only the allowed keys (never a phone number or a name)', () => {
    expect(cleanParams({ bookingId: 'b1', bookingCode: 'BK-2026-000001', rating: 5, outcome: 'completed', phone: '03001234567', name: 'Sara', customerName: 'Sara' }))
      .toEqual({ bookingId: 'b1', bookingCode: 'BK-2026-000001', rating: '5', outcome: 'completed' });
  });
});
